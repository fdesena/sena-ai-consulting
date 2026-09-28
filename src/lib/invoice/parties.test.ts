import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const from = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUser(...a) },
    from: (...a: unknown[]) => from(...a),
  },
}));

import { rowToParty, saveParty, type PartyRow } from "./parties";
import type { Description, Payer, PaymentDetails, Provider } from "./schema";

const row = (over: Partial<PartyRow> = {}): PartyRow => ({
  id: "p1",
  user_id: "user-1",
  kind: "payer",
  label: "Cliente Exemplo",
  data: { name: "Cliente Exemplo LLC", address: "100 Example St" },
  created_at: "2026-09-28T12:00:00Z",
  updated_at: "2026-09-28T12:00:00Z",
  ...over,
});

beforeEach(() => {
  getUser.mockReset();
  from.mockReset();
});

describe("rowToParty", () => {
  it("maps row fields", () => {
    expect(rowToParty<Payer>(row())).toEqual({
      id: "p1",
      kind: "payer",
      label: "Cliente Exemplo",
      data: { name: "Cliente Exemplo LLC", address: "100 Example St" },
      createdAt: "2026-09-28T12:00:00Z",
    });
  });

  it("turns a missing taxId into an empty string for providers", () => {
    const party = rowToParty<Provider>(
      row({ kind: "provider", data: { name: "Acme Serviços Ltda", email: "" } }),
    );
    expect(party.data.taxId).toBe("");
    expect(party.data.name).toBe("Acme Serviços Ltda");
  });

  it("keeps an existing taxId", () => {
    const party = rowToParty<Provider>(
      row({ kind: "provider", data: { name: "Acme", taxId: "12.345.678/0001-90" } }),
    );
    expect(party.data.taxId).toBe("12.345.678/0001-90");
  });

  it("turns a missing text into an empty string for descriptions", () => {
    const party = rowToParty<Description>(row({ kind: "description", data: {} }));
    expect(party.kind).toBe("description");
    expect(party.data.text).toBe("");
  });

  it("keeps an existing description text", () => {
    const party = rowToParty<Description>(
      row({ kind: "description", data: { text: "Consultoria mensal" } }),
    );
    expect(party.data.text).toBe("Consultoria mensal");
  });
});

describe("rowToParty for payment", () => {
  it("turns a missing text into an empty string", () => {
    const party = rowToParty<PaymentDetails>(row({ kind: "payment", data: {} }));
    expect(party.kind).toBe("payment");
    expect(party.data.text).toBe("");
  });

  it("keeps an existing text", () => {
    const party = rowToParty<PaymentDetails>(
      row({ kind: "payment", data: { text: "Acme Bank\nRouting: 000000000" } }),
    );
    expect(party.data.text).toBe("Acme Bank\nRouting: 000000000");
  });
});

describe("saveParty", () => {
  it.each(["", "   "])("rejects label %j without calling Supabase", async (label) => {
    await expect(saveParty("payer", label, { name: "X", address: "" })).rejects.toThrow(
      "Informe um nome",
    );
    expect(getUser).not.toHaveBeenCalled();
    expect(from).not.toHaveBeenCalled();
  });

  it("upserts by user, kind and trimmed label", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const single = vi.fn().mockResolvedValue({ data: row(), error: null });
    const select = vi.fn(() => ({ single }));
    const upsert = vi.fn(() => ({ select }));
    from.mockReturnValue({ upsert });
    const data = { name: "Cliente Exemplo LLC", address: "100 Example St" };

    const saved = await saveParty("payer", "  Cliente Exemplo ", data);

    expect(from).toHaveBeenCalledWith("invoice_parties");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        kind: "payer",
        label: "Cliente Exemplo",
        data,
      }),
      { onConflict: "user_id,kind,label" },
    );
    expect(saved.label).toBe("Cliente Exemplo");
  });
});
