import { useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { WHATSAPP_NUMBER } from "@/components/ContactFAB";
import { AGENDA_URL, whatsappMessage } from "../export";
import type { Answers, DiagnosticoReport } from "../types";
import { outlineDarkButtonClass, primaryButtonClass } from "./Controls";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answers: Answers;
  report: DiagnosticoReport;
  nome: string;
  negocio: string;
}

export default function ContactDialog({
  open,
  onOpenChange,
  answers,
  report,
  nome,
  negocio,
}: ContactDialogProps) {
  const message = useMemo(
    () => whatsappMessage(answers, report, nome.trim(), negocio.trim()),
    [answers, report, nome, negocio],
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-[rgba(7,11,9,0.70)] backdrop-blur-[7px]"
        className="max-h-[90dvh] w-[min(660px,calc(100%-30px))] max-w-none overflow-y-auto rounded-2xl border-[#c5ccd2] bg-[var(--paper)] p-7 text-[var(--ink)] sm:p-8"
      >
        <DialogTitle className="text-2xl font-medium tracking-tight">
          Leve seu diagnóstico para a conversa.
        </DialogTitle>
        <DialogDescription className="mt-1 text-[#5d6870]">
          O resumo abaixo ajuda a começar pelo seu desafio. Você revisa a mensagem e confirma o
          envio no WhatsApp.
        </DialogDescription>

        <div className="mt-5 mb-5">
          <label
            htmlFor="contact-preview"
            className="mb-2.5 block text-base font-medium text-[#171a1d]"
          >
            Mensagem que você vai levar
          </label>
          <textarea
            id="contact-preview"
            readOnly
            value={message}
            className="block min-h-[180px] w-full resize-y rounded-md border border-[#aeb7bf] bg-[#eceff1] px-3.5 py-3 text-[15px] text-[#1a1916]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={primaryButtonClass()}
          >
            Abrir WhatsApp com o resumo ↗
          </a>
          <a
            href={AGENDA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={outlineDarkButtonClass("border-[#b9c1c7] text-[#171a1d] hover:bg-[#e4e8eb]")}
          >
            Ver agenda ↗
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
