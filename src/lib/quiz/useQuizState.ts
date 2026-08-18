import { useCallback, useEffect, useRef, useState } from "react";
import { fetchQuizState, subscribeToSession } from "./db";
import type { QuizStatePayload } from "./types";

/**
 * Estado ao vivo de uma sessão — assina o Realtime (sessão, equipes,
 * respostas) e também poll a cada 4s como rede de segurança (ex.: conexão
 * caiu por um instante). Sempre desinscreve no cleanup do useEffect.
 */
export function useQuizState(sessionId: string | undefined, token?: string | null) {
  const [state, setState] = useState<QuizStatePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const reload = useCallback(async () => {
    if (!sessionId || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const data = await fetchQuizState(sessionId, token ?? null);
      setState(data);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar o quiz");
    } finally {
      loadingRef.current = false;
    }
  }, [sessionId, token]);

  useEffect(() => {
    if (!sessionId) return;
    reload();
    const unsubscribe = subscribeToSession(sessionId, reload);
    const poll = setInterval(reload, 4000);
    return () => {
      unsubscribe();
      clearInterval(poll);
    };
  }, [sessionId, reload]);

  return { state, error, reload };
}
