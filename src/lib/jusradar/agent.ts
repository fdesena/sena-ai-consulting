// Agente de pesquisa jurídica: replica a skill `pesquisa-juridica` via function calling da OpenAI.
// Etapa 1 (DataJud) → Etapa 2 (Jurisprudências.ai) → síntese final. Emite ProgressEvents.

import OpenAI from "openai";
import { buscarProcessos, consultarProcesso } from "./datajud";
import {
  buscarJurisprudencia,
  QuotaExceededError,
  hasToken,
} from "./jurisprudencias";
import { buildJurisprudenciaFallbackLinks } from "./webresearch";
import { consultarCnpj, buildBuscaProcessosPorParte } from "./cnpj";
import { buscarProcessosPorParte, consultarTeorPorNumero } from "./djen";
import type { Decisao, ProgressEvent, Processo } from "./types";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

const SYSTEM = `Você é um assistente de pesquisa jurídica brasileira. A partir de um CONTEXTO de caso
em linguagem natural, você executa uma pesquisa em DUAS ETAPAS e produz uma análise organizada.

## ETAPA 1 — Rastrear processos (ferramentas DataJud)
- Identifique a competência (trabalhista → TRTs, ex.: trt2/trt15; cível estadual → tjsp etc.;
  federal → trf1..trf6; superiores → stj/tst). Escolha o(s) tribunal(is) mais provável(is).
- Use 'buscar_processos' com uma query Elasticsearch (bool/should casando 'assuntos.nome' com
  match_phrase + match). LIMITAÇÃO: o DataJud só indexa METADADOS (número, classe, assuntos,
  órgão, datas, movimentos) — NÃO indexa os fatos. Não há como filtrar por narrativa (ex.:
  "posto de gasolina"); filtre pelo ASSUNTO jurídico. Os resultados são candidatos por assunto.
- Se um tribunal não trouxer bons resultados, tente outro. Use 'consultar_processo' quando o
  usuário fornecer um número de processo.

## Consulta por CNPJ (ferramenta consultar_cnpj)
- Se o CONTEXTO contiver um CNPJ (14 dígitos, com ou sem pontuação) e o usuário quiser saber de
  processos da empresa ou de seus administradores, chame 'consultar_cnpj' com esse CNPJ. Ela
  retorna os dados cadastrais e o QUADRO DE SÓCIOS/ADMINISTRADORES (QSA) via BrasilAPI, além de
  LINKS de busca processual por nome da parte (Escavador, Jusbrasil, e-SAJ/TJSP).
- A própria ferramenta JÁ BUSCA processos por nome da parte no DJEN/Comunica (CNJ) — fonte nacional
  e gratuita, DIFERENTE do DataJud. Os processos encontrados ("processosEncontradosNoDJEN") já
  aparecem na aba Processos; na síntese, CITE os números, tribunal e classe desses processos e diga
  a qual parte (empresa ou administrador) cada um se vincula.
- LIMITAÇÃO: o DataJud NÃO indexa partes/CNPJ — NÃO tente buscar o CNPJ no DataJud (retorna vazio).
  O DJEN cobre comunicações processuais (intimações/notificações); pode não trazer processos antigos
  ou sem publicação recente. Por isso, complemente com os "linksComplementaresBuscaPorParte"
  (Escavador/Jusbrasil/e-SAJ) para o usuário ampliar a busca manualmente.

## Teor de um processo (ferramenta consultar_teor)
- Se o usuário fornecer um NÚMERO de processo e pedir o teor/conteúdo/andamento detalhado, chame
  'consultar_teor' com esse número. Ela traz o texto integral das PUBLICAÇÕES oficiais (despachos,
  decisões, sentenças, intimações) do DJEN. Na síntese, RESUMA cronologicamente o que cada
  publicação diz (data, tipo, órgão) e cite trechos relevantes (ex.: dispositivo de sentença).
- Deixe explícito o limite: isso é o que foi PUBLICADO no Diário; os AUTOS integrais (petição
  inicial, contestação, provas, PDFs) ficam no PJe do tribunal e exigem login — não há API gratuita.

## ETAPA 2 — Jurisprudência (ferramenta Jurisprudências.ai)
- Use 'buscar_jurisprudencia' com 'q' em LINGUAGEM NATURAL (descreva o caso; NÃO use aspas de
  frase exata, OR, nem operadores). Tribunais cobertos: stf, stj, tst, trf3, trf4, tjmg, tjpr,
  tjrj, tjrs, tjsc, tjsp, carf. Entre os trabalhistas só há o TST (não cobre TRTs regionais).
- COTA GRATUITA pequena (~5 buscas/dia): faça NO MÁXIMO 1 ou 2 chamadas de jurisprudência, com
  uma query forte. Se a ferramenta indicar cota esgotada, NÃO insista — siga com o DataJud e seu
  conhecimento jurídico geral, avisando na síntese.

## Síntese final (sua resposta em texto)
Escreva em português, em Markdown, somente DEPOIS de terminar as buscas. NÃO escreva texto
explicativo entre as chamadas de ferramentas — faça as buscas primeiro e só então redija a análise.
Estruture a síntese com:
1. **Resumo do caso e competência** (qual Justiça/tribunal).
2. **Teses jurídicas centrais** com fundamentação legal (artigos de CF, CLT, CC, leis, súmulas, OJs).
3. **Processos/precedentes mais aderentes** encontrados, citando número e por que são relevantes.
4. **Ressalvas**: que o DataJud filtra por assunto (não por fatos) e eventual cota de jurisprudência.
Não invente números de processo, ementas ou citações: use apenas o que as ferramentas retornaram;
quando não confirmado, diga explicitamente.`;

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "buscar_processos",
      description:
        "Busca processos no DataJud (CNJ) por query Elasticsearch (DSL) num tribunal. Use para filtrar por assunto/classe/órgão/datas. Retorna metadados (não os fatos).",
      parameters: {
        type: "object",
        properties: {
          tribunal: {
            type: "string",
            description: "Alias do tribunal (ex.: tjsp, trt2, trt15, stj, trf3).",
          },
          query: {
            type: "object",
            description:
              'Objeto "query" no formato Elasticsearch DSL (ex.: {"bool":{"should":[...],"minimum_should_match":1}}).',
            additionalProperties: true,
          },
          size: { type: "integer", description: "Quantidade de resultados (padrão 15)." },
        },
        required: ["tribunal", "query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "consultar_processo",
      description:
        "Consulta um processo no DataJud pelo número único (CNJ) num tribunal. Use quando houver um número de processo.",
      parameters: {
        type: "object",
        properties: {
          numeroProcesso: { type: "string", description: "Número único do processo (com ou sem pontuação)." },
          tribunal: { type: "string", description: "Alias do tribunal (ex.: tjsp, trt15)." },
        },
        required: ["numeroProcesso", "tribunal"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "consultar_cnpj",
      description:
        "Consulta dados cadastrais e o quadro de sócios/administradores (QSA) de um CNPJ via BrasilAPI, e retorna links de busca processual por nome da parte (Escavador, Jusbrasil, e-SAJ). Use quando o usuário fornecer um CNPJ e quiser processos da empresa ou de seus administradores. O DataJud NÃO busca por CNPJ.",
      parameters: {
        type: "object",
        properties: {
          cnpj: { type: "string", description: "CNPJ com ou sem pontuação (14 dígitos)." },
        },
        required: ["cnpj"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "consultar_teor",
      description:
        "Retorna o TEOR de um processo pelo número: o texto integral de todas as publicações oficiais (despachos, decisões, sentenças, intimações) registradas no DJEN/CNJ. NÃO acessa os autos integrais/PDFs (que ficam no PJe sob login). Use quando o usuário pedir o teor/conteúdo de um processo específico.",
      parameters: {
        type: "object",
        properties: {
          numeroProcesso: { type: "string", description: "Número único do processo (com ou sem máscara)." },
        },
        required: ["numeroProcesso"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "buscar_jurisprudencia",
      description:
        "Busca decisões/ementas no Jurisprudências.ai por LINGUAGEM NATURAL (sem operadores). Cobre stf, stj, tst, trf3, trf4, tjmg, tjpr, tjrj, tjrs, tjsc, tjsp, carf. Cota gratuita ~5/dia: use no máximo 1-2 vezes.",
      parameters: {
        type: "object",
        properties: {
          court: { type: "string", description: "Tribunal: stf, stj, tst, trf3, trf4, tjmg, tjpr, tjrj, tjrs, tjsc, tjsp, carf." },
          q: { type: "string", description: "Descrição do caso em linguagem natural (sem aspas/operadores)." },
          pub_from: { type: "string", description: "Filtro de data inicial (YYYY-MM-DD), opcional." },
          pub_to: { type: "string", description: "Filtro de data final (YYYY-MM-DD), opcional." },
        },
        required: ["court", "q"],
      },
    },
  },
];

type Emit = (e: ProgressEvent) => void;

async function runTool(
  name: string,
  input: Record<string, unknown>,
  emit: Emit,
  acc: { processos: Processo[]; decisoes: Decisao[] },
): Promise<string> {
  try {
    if (name === "buscar_processos") {
      const tribunal = String(input.tribunal);
      emit({ type: "step", phase: "datajud", message: `Buscando processos no ${tribunal.toUpperCase()}…` });
      const found = await buscarProcessos(
        tribunal,
        input.query as Record<string, unknown>,
        typeof input.size === "number" ? input.size : 15,
      );
      acc.processos = dedupeProcessos([...acc.processos, ...found]);
      emit({ type: "processos", data: acc.processos });
      emit({ type: "step", phase: "datajud", message: `${found.length} processo(s) encontrado(s) no ${tribunal.toUpperCase()}.` });
      return JSON.stringify(found, null, 2);
    }

    if (name === "consultar_processo") {
      const tribunal = String(input.tribunal);
      const num = String(input.numeroProcesso);
      emit({ type: "step", phase: "datajud", message: `Consultando processo ${num} (${tribunal.toUpperCase()})…` });
      const found = await consultarProcesso(num, tribunal);
      acc.processos = dedupeProcessos([...acc.processos, ...found]);
      emit({ type: "processos", data: acc.processos });
      return found.length
        ? JSON.stringify(found, null, 2)
        : `Nenhum processo encontrado para ${num} em ${tribunal}.`;
    }

    if (name === "consultar_cnpj") {
      const cnpj = String(input.cnpj ?? "");
      emit({ type: "step", phase: "cnpj", message: `Consultando CNPJ ${cnpj} (BrasilAPI)…` });
      const empresa = await consultarCnpj(cnpj);
      const nomes = [
        empresa.razaoSocial,
        ...empresa.socios.map((s) => s.nome),
      ].filter(Boolean) as string[];
      emit({
        type: "step",
        phase: "cnpj",
        message: `${empresa.razaoSocial ?? cnpj} — ${empresa.socios.length} sócio(s)/administrador(es). Buscando processos por parte (DJEN/CNJ)…`,
      });

      // Busca processos por NOME da parte no DJEN/Comunica (fonte nacional, NÃO é DataJud).
      const encontrados: Processo[] = [];
      for (const nome of nomes) {
        try {
          const procs = await buscarProcessosPorParte(nome);
          if (procs.length) {
            emit({ type: "step", phase: "cnpj", message: `${procs.length} processo(s) para "${nome}" no DJEN.` });
          }
          encontrados.push(...procs);
        } catch (e) {
          emit({ type: "step", phase: "cnpj", message: `DJEN falhou para "${nome}": ${e instanceof Error ? e.message : String(e)}` });
        }
      }
      if (encontrados.length) {
        acc.processos = dedupeProcessos([...acc.processos, ...encontrados]);
        emit({ type: "processos", data: acc.processos });
      }

      // Deep-links de busca por parte (Escavador/Jusbrasil/e-SAJ) como complemento manual.
      const links = nomes.flatMap((nome, i) =>
        buildBuscaProcessosPorParte(nome, i === 0 ? empresa.cnpj : undefined),
      );
      emit({
        type: "step",
        phase: "cnpj",
        message: `${encontrados.length} processo(s) encontrado(s) no DJEN; ${links.length} link(s) externos para ampliar a busca.`,
      });
      return JSON.stringify(
        {
          empresa,
          processosEncontradosNoDJEN: encontrados,
          linksComplementaresBuscaPorParte: links,
        },
        null,
        2,
      );
    }

    if (name === "consultar_teor") {
      const num = String(input.numeroProcesso ?? "");
      emit({ type: "step", phase: "teor", message: `Buscando teor das publicações de ${num} (DJEN/CNJ)…` });
      const pubs = await consultarTeorPorNumero(num);
      if (pubs.length === 0) {
        emit({ type: "step", phase: "teor", message: `Nenhuma publicação encontrada no DJEN para ${num}. As peças integrais podem estar no PJe sob login.` });
        return `Nenhuma publicação oficial encontrada no DJEN para o processo ${num}. Os autos integrais (petição, contestação, PDFs) ficam no PJe do tribunal e exigem login.`;
      }
      // Exibe cada publicação como cartão (reaproveita o painel de decisões: texto + link).
      const cards: Decisao[] = pubs.map((p) => ({
        court: p.tribunal,
        process_number: num,
        publication_date: p.data,
        excerpt: [p.tipo, p.documento, p.orgao].filter(Boolean).join(" — "),
        full_text: p.texto,
        url: p.link,
      }));
      acc.decisoes = dedupeDecisoes([...acc.decisoes, ...cards]);
      emit({ type: "decisoes", data: acc.decisoes });
      emit({ type: "step", phase: "teor", message: `${pubs.length} publicação(ões) com teor encontradas para ${num}.` });
      return JSON.stringify(cards.map(stripFullText), null, 2);
    }

    if (name === "buscar_jurisprudencia") {
      const court = String(input.court);
      const q = String(input.q);
      emit({ type: "step", phase: "jurisprudencia", message: `Analisando jurisprudência no ${court.toUpperCase()}…` });

      // Sempre que a API não entrega decisões (sem token, sem resultados ou cota
      // esgotada), trazemos links de pesquisa web (Escavador, Jusbrasil, tribunal,
      // Google) como cartões para o usuário continuar a busca manualmente.
      const addWebFallback = (motivo: string): Decisao[] => {
        const fb = buildJurisprudenciaFallbackLinks(q, court).map((l) => ({
          court,
          excerpt: `Pesquisa na web — ${l.source}`,
          url: l.url,
          source: l.source,
        }));
        acc.decisoes = dedupeDecisoes([...acc.decisoes, ...fb]);
        emit({ type: "decisoes", data: acc.decisoes });
        emit({ type: "step", phase: "jurisprudencia", message: `${motivo} — adicionados ${fb.length} link(s) de pesquisa web (Escavador, Jusbrasil, ${court.toUpperCase()}, Google).` });
        return fb;
      };

      if (!hasToken()) {
        const fb = addWebFallback("Jurisprudências.ai sem token configurado");
        return `JURISPRUDENCIAS_API_TOKEN não configurado. Foram adicionados ${fb.length} links de pesquisa web na aba Jurisprudência — cite-os na síntese e prossiga com o DataJud e conhecimento geral.`;
      }

      try {
        const found = await buscarJurisprudencia(court, q, {
          pub_from: input.pub_from as string | undefined,
          pub_to: input.pub_to as string | undefined,
        });
        if (found.length > 0) {
          acc.decisoes = dedupeDecisoes([...acc.decisoes, ...found]);
          emit({ type: "decisoes", data: acc.decisoes });
          emit({ type: "step", phase: "jurisprudencia", message: `${found.length} decisão(ões) encontrada(s) no ${court.toUpperCase()}.` });
          return JSON.stringify(found.map(stripFullText), null, 2);
        }
        // Busca válida, porém sem resultados na API → fallback web.
        const fb = addWebFallback(`Nenhuma decisão na API do ${court.toUpperCase()}`);
        return `Nenhuma decisão estruturada na API do Jurisprudências.ai para ${court}. Foram adicionados ${fb.length} links de pesquisa web (Escavador, Jusbrasil, ${court.toUpperCase()}, Google) na aba Jurisprudência. Na síntese, oriente o usuário a usá-los e prossiga com seu conhecimento jurídico geral.`;
      } catch (err) {
        if (err instanceof QuotaExceededError) {
          emit({ type: "quota_exceeded" });
          const fb = addWebFallback("Cota do Jurisprudências.ai esgotada");
          return JSON.stringify(fb, null, 2);
        }
        throw err;
      }
    }

    return `Ferramenta desconhecida: ${name}`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    emit({ type: "step", phase: "erro", message: `Falha em ${name}: ${message}` });
    return `Erro ao executar ${name}: ${message}`;
  }
}

function stripFullText(d: Decisao): Decisao {
  // Evita estourar o contexto do modelo com inteiros teores enormes.
  if (d.full_text && d.full_text.length > 2000) {
    return { ...d, full_text: d.full_text.slice(0, 2000) + "…" };
  }
  return d;
}

function dedupeProcessos(list: Processo[]): Processo[] {
  const seen = new Set<string>();
  return list.filter((p) => {
    const k = p.numeroProcesso ?? JSON.stringify(p);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function dedupeDecisoes(list: Decisao[]): Decisao[] {
  const seen = new Set<string>();
  return list.filter((d) => {
    // Inclui data e url para não colapsar múltiplas publicações do MESMO processo (teor).
    const k = `${d.court}|${d.process_number ?? ""}|${d.publication_date ?? ""}|${d.url ?? d.excerpt?.slice(0, 40)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

interface ToolCallAcc {
  id: string;
  name: string;
  args: string;
}

/**
 * Roda o loop agêntico (function calling da OpenAI), emitindo eventos de progresso.
 */
export async function runPesquisa(contexto: string, emit: Emit): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    emit({
      type: "error",
      message:
        "OPENAI_API_KEY não configurada. Adicione-a em web/.env.local e reinicie o servidor.",
    });
    return;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const acc = { processos: [] as Processo[], decisoes: [] as Decisao[] };
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM },
    { role: "user", content: `Contexto do caso:\n\n${contexto}` },
  ];

  emit({ type: "step", phase: "analise", message: "Analisando o caso e planejando a busca…" });

  // Trava de segurança contra loops longos.
  for (let turn = 0; turn < 12; turn++) {
    const stream = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools: TOOLS,
      stream: true,
    });

    let textAcc = "";
    let turnHadText = false;
    let finishReason: string | null = null;
    const toolCalls: Record<number, ToolCallAcc> = {};

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      if (!choice) continue;
      const delta = choice.delta;

      if (delta?.content) {
        if (!turnHadText) {
          turnHadText = true;
          emit({ type: "reset" });
        }
        textAcc += delta.content;
        emit({ type: "synthesis_delta", text: delta.content });
      }

      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index;
          if (!toolCalls[idx]) toolCalls[idx] = { id: "", name: "", args: "" };
          if (tc.id) toolCalls[idx].id = tc.id;
          if (tc.function?.name) toolCalls[idx].name += tc.function.name;
          if (tc.function?.arguments) toolCalls[idx].args += tc.function.arguments;
        }
      }

      if (choice.finish_reason) finishReason = choice.finish_reason;
    }

    const calls = Object.keys(toolCalls)
      .map((k) => toolCalls[Number(k)])
      .filter((c) => c.name);

    if (finishReason === "tool_calls" && calls.length > 0) {
      // Se houve texto antes das ferramentas, era narração — descarta no front.
      if (turnHadText) emit({ type: "reset" });

      messages.push({
        role: "assistant",
        content: textAcc || null,
        tool_calls: calls.map((c) => ({
          id: c.id,
          type: "function",
          function: { name: c.name, arguments: c.args || "{}" },
        })),
      });

      for (const c of calls) {
        let parsed: Record<string, unknown> = {};
        try {
          parsed = c.args ? JSON.parse(c.args) : {};
        } catch {
          parsed = {};
        }
        const out = await runTool(c.name, parsed, emit, acc);
        messages.push({ role: "tool", tool_call_id: c.id, content: out });
      }
      continue;
    }

    // stop (ou outro): terminou a síntese. Guarda o texto no histórico para que as
    // análises de Defesa/Requerente tenham todo o contexto (buscas + síntese).
    if (textAcc.trim()) {
      messages.push({ role: "assistant", content: textAcc });
    }
    break;
  }

  // Após a síntese, gera duas análises estratégicas sobre as MESMAS fontes:
  // a melhor linha de Defesa (réu) e a melhor linha de ataque do Requerente (autor).
  await gerarArgumentos(client, messages, "defesa", emit);
  await gerarArgumentos(client, messages, "requerente", emit);

  emit({ type: "done" });
}

const PROMPT_DEFESA = `Agora, assumindo o papel de advogado(a) do RÉU/REQUERIDO, redija a MELHOR LINHA DE DEFESA
para este caso, usando TUDO que foi levantado nas buscas acima (processos do DataJud, jurisprudência/
decisões e publicações) e seu conhecimento jurídico. Escreva em português, em Markdown, e estruture:

- **Teses de defesa** (preliminares e de mérito), da mais forte para a mais fraca.
- **Fundamentos legais** de cada tese: artigos (CF, CLT, CC, CPC, CDC, leis), súmulas, OJs e princípios.
- **Precedentes e processos de apoio**: cite o NÚMERO do processo/decisão e o TRIBUNAL e inclua o
  LINK/URL de referência sempre que ele tiver aparecido nas buscas, no formato [texto](url). NÃO invente
  números nem links — use apenas o que apareceu; quando não houver fonte, escreva "(sem fonte confirmada)".
- **Estratégia processual**: provas a produzir, ônus da prova, prescrição/decadência, nulidades.
- **Antecipação do ataque adversário**: o que o REQUERENTE provavelmente alegará e como refutar cada ponto.
- **Riscos e pontos fracos** da defesa.

Seja prático e citável; foque em argumentos acionáveis, sem repetir a síntese.`;

const PROMPT_REQUERENTE = `Agora, assumindo o papel de advogado(a) do AUTOR/REQUERENTE, redija a MELHOR LINHA DE ATAQUE
(tese postulatória) para este caso, usando TUDO que foi levantado e seu conhecimento jurídico. Escreva em
português, em Markdown, e estruture:

- **Teses centrais do pedido**, da mais forte para a mais fraca, com o que se pretende obter.
- **Fundamentos legais**: artigos, súmulas, OJs e princípios.
- **Precedentes e processos favoráveis**: cite NÚMERO + TRIBUNAL e o LINK/URL quando houver, no formato
  [texto](url). NÃO invente números nem links; quando não houver fonte, escreva "(sem fonte confirmada)".
- **Provas e estratégia**: o que pedir/produzir, inversão do ônus, tutela de urgência, quantificação dos pedidos.
- **Antecipação da defesa**: o que o RÉU provavelmente alegará e como neutralizar cada ponto.
- **Riscos** da tese.

Seja prático e citável; foque em argumentos acionáveis, sem repetir a síntese.`;

/**
 * Gera uma análise estratégica (Defesa ou Requerente) em streaming, sobre o contexto
 * já acumulado em `messages`. Anexa o resultado ao histórico para que a próxima
 * geração possa dialogar com a anterior.
 */
async function gerarArgumentos(
  client: OpenAI,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  lado: "defesa" | "requerente",
  emit: Emit,
): Promise<void> {
  const instrucao = lado === "defesa" ? PROMPT_DEFESA : PROMPT_REQUERENTE;
  emit({
    type: "step",
    phase: lado,
    message: lado === "defesa" ? "Construindo a linha de defesa…" : "Construindo a tese do requerente…",
  });

  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [...messages, { role: "user", content: instrucao }],
    stream: true,
  });

  let acc = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      acc += delta;
      emit({ type: lado === "defesa" ? "defesa_delta" : "requerente_delta", text: delta });
    }
  }

  if (acc.trim()) {
    messages.push({ role: "user", content: instrucao });
    messages.push({ role: "assistant", content: acc });
  }
}
