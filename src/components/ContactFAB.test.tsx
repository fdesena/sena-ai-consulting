import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ContactFAB, { WHATSAPP_NUMBER } from "./ContactFAB";

describe("ContactFAB", () => {
  it("opens to reveal WhatsApp and AI assistant options", () => {
    render(<ContactFAB />);
    const toggle = screen.getByRole("button", { name: "Falar com a Sena Labs" });
    expect(screen.queryByRole("link", { name: /whatsapp/i })).not.toBeInTheDocument();

    fireEvent.click(toggle);

    const link = screen.getByRole("link", { name: /whatsapp/i });
    expect(link).toHaveAttribute("href", expect.stringContaining(`wa.me/${WHATSAPP_NUMBER}`));
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("button", { name: /assistente de ia/i })).toBeInTheDocument();
  });
});
