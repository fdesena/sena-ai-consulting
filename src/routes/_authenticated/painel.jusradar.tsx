import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Scale, Lock, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Decisao, ProgressEvent, Processo } from "@/lib/jusradar/types";
import { exportarRelatorioDocx } from "@/lib/jusradar/report";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { SearchPanel } from "@/components/jusradar/SearchPanel";
import { ProgressTimeline, type Step } from "@/components/jusradar/ProgressTimeline";
import { SynthesisPanel } from "@/components/jusradar/SynthesisPanel";
import { ProcessoCard } from "@/components/jusradar/ProcessoCard";
import { DecisaoCard } from "@/components/jusradar/DecisaoCard";

export const Route = createFileRoute("/_authenticated/painel/jusradar")({
  component: JusRadar,
});

function JusRadar() {
  const navigate = useNavigate();
  // null = verificando, true/false = resultado
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) { setAllowed(false); return; }

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if ((roles ?? []).some((r: any) => r.role === "admin")) { setAllowed(true); return; }

      const { data: access } = await supabase
        .from("user_app_access")
        .select("app_slug")
        .eq("user_id", uid)
        .eq("app_slug", "jusradar")
        .maybeSingle();
      setAllowed(!!access);
    })();
  }, []);

  if (allowed === null) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!allowed) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 text-foreground">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você ainda não tem acesso ao JusRadar. Fale com a equipe Sena Consulting para liberar este app.
        </p>
        <button
          onClick={() => navigate({ to: "/painel" })}
          className="mt-6 rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return <JusRadarApp />;
}

function JusRadarApp() {
  const [contexto, setContexto] = useState("");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [synthesis, setSynthesis] = useState("");
  const [defesa, setDefesa] = useState("");
  const [requerente, setRequerente] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState("sintese");
  const [exporting, setExporting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const hasResults =
    synthesis.trim().length > 0 ||
    defesa.trim().length > 0 ||
    requerente.trim().length > 0 ||
    processos.length > 0 ||
    decisoes.length > 0;

  const onExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportarRelatorioDocx({ contexto, synthesis, defesa, requerente, processos, decisoes, quotaExceeded });
      toast.success("Relatório .docx gerado", { description: "O download foi iniciado." });
    } catch (err) {
      toast.error("Falha ao gerar o relatório", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setExporting(false);
    }
  }, [exporting, contexto, synthesis, defesa, requerente, processos, decisoes, quotaExceeded]);

  const handleEvent = useCallback((ev: ProgressEvent) => {
    switch (ev.type) {
      case "step":
        setSteps((s) => [...s, { phase: ev.phase, message: ev.message }]);
        break;
      case "processos":
        setProcessos(ev.data);
        break;
      case "decisoes":
        setDecisoes(ev.data);
        break;
      case "synthesis_delta":
        setSynthesis((t) => t + ev.text);
        break;
      case "defesa_delta":
        setDefesa((t) => t + ev.text);
        break;
      case "requerente_delta":
        setRequerente((t) => t + ev.text);
        break;
      case "reset":
        setSynthesis("");
        break;
      case "quota_exceeded":
        setQuotaExceeded(true);
        toast.warning("Cota gratuita do Jurisprudências.ai esgotada hoje", {
          description: "A análise segue com o DataJud e conhecimento jurídico geral.",
        });
        break;
      case "error":
        toast.error("Erro na pesquisa", { description: ev.message });
        break;
      case "done":
        break;
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (!contexto.trim() || running) return;
    setRunning(true);
    setStarted(true);
    setSteps([]);
    setProcessos([]);
    setDecisoes([]);
    setSynthesis("");
    setDefesa("");
    setRequerente("");
    setQuotaExceeded(false);
    setTab("sintese");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch("/api/jusradar/pesquisar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ contexto }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Falha na requisição (HTTP ${res.status}).`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            handleEvent(JSON.parse(json) as ProgressEvent);
          } catch {
            // ignora linha malformada
          }
        }
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        toast.error("Erro de conexão", {
          description: err instanceof Error ? err.message : String(err),
        });
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }, [contexto, running, handleEvent]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-foreground">
      <Toaster />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-bronze/15 text-bronze">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">Sena Consulting Apps</span>
            <h1 className="text-3xl font-semibold leading-tight">JusRadar</h1>
            <p className="text-sm text-muted-foreground">Pesquisa jurídica em linguagem natural.</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Badge variant="outline">DataJud / CNJ</Badge>
          <Badge variant="outline">Jurisprudências.ai</Badge>
        </div>
      </div>

      <SearchPanel
        value={contexto}
        onChange={setContexto}
        onSubmit={onSubmit}
        running={running}
      />

      {!started && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Descreva um caso acima e clique em <strong>Pesquisar</strong>. O agente identifica a
          competência, rastreia processos no DataJud por assunto e analisa a jurisprudência sobre
          o tema, montando uma síntese fundamentada.
        </div>
      )}

      {started && (
        <>
          <ProgressTimeline steps={steps} running={running} />

          {quotaExceeded && (
            <Alert>
              <AlertTitle>Cota de jurisprudência esgotada</AlertTitle>
              <AlertDescription>
                O plano gratuito do Jurisprudências.ai (~5 buscas/dia) foi atingido. A síntese
                prossegue com os processos do DataJud e o conhecimento jurídico geral do modelo.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="sintese">Síntese</TabsTrigger>
                <TabsTrigger value="defesa">Defesa</TabsTrigger>
                <TabsTrigger value="requerente">Requerente</TabsTrigger>
                <TabsTrigger value="processos">
                  Processos {processos.length > 0 && `(${processos.length})`}
                </TabsTrigger>
                <TabsTrigger value="jurisprudencia">
                  Jurisprudência {decisoes.length > 0 && `(${decisoes.length})`}
                </TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={!hasResults || running || exporting}
                title="Exporta a síntese, os processos e a jurisprudência em um relatório .docx"
              >
                <FileDown />
                {exporting ? "Gerando…" : "Exportar .docx"}
              </Button>
            </div>

            <TabsContent value="sintese" className="mt-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <SynthesisPanel text={synthesis} running={running} />
              </div>
            </TabsContent>

            <TabsContent value="defesa" className="mt-4">
              <p className="mb-3 text-xs text-muted-foreground">
                Melhor linha de <strong>defesa do réu/requerido</strong>: teses, fundamentos legais,
                precedentes (com fontes), estratégia processual e antecipação do ataque adversário.
              </p>
              <div className="rounded-2xl border border-border bg-card p-5">
                <SynthesisPanel
                  text={defesa}
                  running={running}
                  skeleton={false}
                  placeholder="Os argumentos de defesa são gerados após a síntese e as buscas."
                />
              </div>
            </TabsContent>

            <TabsContent value="requerente" className="mt-4">
              <p className="mb-3 text-xs text-muted-foreground">
                Melhor linha de <strong>ataque do autor/requerente</strong>: teses do pedido,
                fundamentos, precedentes favoráveis (com fontes), provas e antecipação da defesa.
              </p>
              <div className="rounded-2xl border border-border bg-card p-5">
                <SynthesisPanel
                  text={requerente}
                  running={running}
                  skeleton={false}
                  placeholder="Os argumentos do requerente são gerados após a síntese e as buscas."
                />
              </div>
            </TabsContent>

            <TabsContent value="processos" className="mt-4">
              {processos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {running
                    ? "Buscando processos…"
                    : "Nenhum processo retornado. Lembre-se: o DataJud filtra por assunto, não pelos fatos."}
                </p>
              ) : (
                <>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Do <strong>DataJud</strong>: candidatos por <strong>assunto</strong> (não pelos
                    fatos). Da busca por <strong>CNPJ/parte</strong>: processos reais localizados no{" "}
                    <strong>DJEN/CNJ</strong> (veja a etiqueta de fonte em cada cartão).
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {processos.map((p, i) => (
                      <ProcessoCard key={p.numeroProcesso ?? i} processo={p} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="jurisprudencia" className="mt-4">
              {decisoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {running
                    ? "Analisando jurisprudência…"
                    : "Sem decisões estruturadas da API. Veja a síntese para a análise jurisprudencial."}
                </p>
              ) : (
                <>
                  {decisoes.some((d) => d.source) && (
                    <p className="mb-3 text-xs text-muted-foreground">
                      Quando a API não retorna decisões, incluímos <strong>links de pesquisa web</strong>{" "}
                      (Escavador, Jusbrasil, site do tribunal, Google) para você continuar a busca
                      manualmente — marcados com a etiqueta <strong>Pesquisa web</strong>.
                    </p>
                  )}
                  <div className="grid gap-3">
                    {decisoes.map((d, i) => (
                      <DecisaoCard key={(d.url ?? d.process_number ?? "") + i} decisao={d} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      <p className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
        DataJud (CNJ) traz metadados públicos por assunto. Jurisprudência via Jurisprudências.ai.
        Confira sempre as fontes oficiais.
      </p>
    </div>
  );
}
