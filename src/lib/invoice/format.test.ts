import { describe, expect, it } from "vitest";
import {
  addDays,
  formatAmount,
  formatDate,
  formatZip,
  joinAddress,
  parseAmount,
  suggestNumber,
  todayIso,
} from "./format";

describe("formatDate", () => {
  it("formats PT as DD/MM/YYYY and EN as MM/DD/YYYY", () => {
    expect(formatDate("2026-09-28", "pt")).toBe("28/09/2026");
    expect(formatDate("2026-09-28", "en")).toBe("09/28/2026");
  });
  it("returns the input untouched when it is not an ISO date", () => {
    expect(formatDate("", "pt")).toBe("");
    expect(formatDate("28/09/2026", "en")).toBe("28/09/2026");
  });
});

describe("formatAmount", () => {
  it("uses the language's separators", () => {
    expect(formatAmount(5300, "pt")).toBe("5.300,00");
    expect(formatAmount(5300, "en")).toBe("5,300.00");
    expect(formatAmount(1234567.5, "pt")).toBe("1.234.567,50");
    expect(formatAmount(0.5, "en")).toBe("0.50");
  });
});

describe("parseAmount", () => {
  it.each([
    ["5.300,00", 5300],
    ["5,300.00", 5300],
    ["5300", 5300],
    ["5.300", 5300],
    ["5300,5", 5300.5],
    ["12.5", 12.5],
    ["1.234.567,89", 1234567.89],
    [" 5 300,00 ", 5300],
    ["0,00", 0],
  ])("parses %s", (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });
  it.each([
    "",
    "abc",
    "-5",
    "1,234,567",
    "1.2.3",
    "5,3,00",
    "R$ 5",
    "10,999",
    "5,300",
    "12,345",
    "10,555",
    "0.999",
  ])("rejects %j instead of guessing", (input) => {
    expect(parseAmount(input)).toBeNull();
  });
});

describe("formatZip", () => {
  it("formats 8 digits as NN.NNN-NNN", () => {
    expect(formatZip("12345000")).toBe("12.345-000");
    expect(formatZip("12.345-000")).toBe("12.345-000");
  });
  it("leaves other zip codes alone", () => {
    expect(formatZip("02141")).toBe("02141");
    expect(formatZip(" 02141-1234 ")).toBe("02141-1234");
    expect(formatZip("")).toBe("");
  });
});

describe("joinAddress", () => {
  it("joins parts and drops trailing commas and empty parts", () => {
    expect(joinAddress("Rua Exemplo, 100,", "Cidade, UF", "12345000")).toBe(
      "Rua Exemplo, 100, Cidade, UF, 12.345-000",
    );
    expect(joinAddress("Rua A, 1", "", "")).toBe("Rua A, 1");
    expect(joinAddress("", "Cidade, UF", "")).toBe("Cidade, UF");
    expect(joinAddress("  ", "", "  ")).toBe("");
  });
});

describe("date defaults", () => {
  it("todayIso uses local date parts", () => {
    expect(todayIso(new Date(2026, 8, 28, 23, 59))).toBe("2026-09-28");
  });
  it("addDays crosses month and year boundaries", () => {
    expect(addDays("2026-09-28", 7)).toBe("2026-10-05");
    expect(addDays("2026-12-30", 7)).toBe("2027-01-06");
    expect(addDays("2028-02-25", 7)).toBe("2028-03-03");
  });
  it("suggestNumber is MMDDYYYY", () => {
    expect(suggestNumber("2026-09-28")).toBe("09282026");
    expect(suggestNumber("nope")).toBe("");
  });
});
