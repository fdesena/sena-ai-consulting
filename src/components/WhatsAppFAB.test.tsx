import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import WhatsAppFAB, { WHATSAPP_NUMBER } from "./WhatsAppFAB";

describe("WhatsAppFAB", () => {
  it("renders a WhatsApp link with the right number and accessible label", () => {
    render(<WhatsAppFAB />);
    const link = screen.getByRole("link", { name: "Falar no WhatsApp" });
    expect(link).toHaveAttribute("href", expect.stringContaining(`wa.me/${WHATSAPP_NUMBER}`));
    expect(link).toHaveAttribute("target", "_blank");
  });
});
