import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProcessCycle from "./ProcessCycle";

describe("ProcessCycle", () => {
  it("renders all five phases without crashing", () => {
    render(<ProcessCycle />);
    expect(screen.getByRole("button", { name: "Fase 01: Entender" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fase 05: Evoluir" })).toBeInTheDocument();
  });
});
