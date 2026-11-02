// All rates live here. Edit this file when the pricing table changes.
export type Mode = "split" | "arrival";

export const MODES: Record<Mode, { label: string; hint: string }> = {
  split: { label: "Paid / Credit on split / Next INC", hint: "Fees + seller margin" },
  arrival: { label: "Credit on stock arrival", hint: "Codpartner fees only" },
};

// `max` is the inclusive upper bound of each tier (TIR 1 = 0.1–0.7, TIR 2 = >0.7–1.5 …)
export const TIERS = [
  { name: "TIR 1", max: 0.7, range: "0.1 – 0.7 $", split: { fee: 0.33, margin: 0.18 }, arrival: { fee: 0.5 } },
  { name: "TIR 2", max: 1.5, range: "> 0.7 – 1.5 $", split: { fee: 0.2, margin: 0.13 }, arrival: { fee: 0.32 } },
  { name: "TIR 3", max: 3, range: "> 1.5 – 3 $", split: { fee: 0.15, margin: 0.1 }, arrival: { fee: 0.25 } },
  { name: "TIR 4", max: 7, range: "> 3 – 7 $", split: { fee: 0.14, margin: 0.1 }, arrival: { fee: 0.22 } },
  { name: "TIR 5", max: Infinity, range: "> 7 $", split: { fee: 0.25, margin: 0.1 }, arrival: { fee: 0.35 } },
] as const;

const round2 = (n: number) => Math.round((n + 1e-9) * 100) / 100;

export function calculate(cost: number, mode: Mode, withMargin = true) {
  const tier = TIERS.find((t) => cost <= t.max) ?? TIERS[TIERS.length - 1];
  const feeRate = mode === "split" ? tier.split.fee : tier.arrival.fee;
  const marginRate = mode === "split" && withMargin ? tier.split.margin : 0;
  const fee = cost * feeRate;
  const margin = cost * marginRate;
  return { tier, feeRate, marginRate, fee, margin, price: round2(cost + fee + margin), belowMin: cost < 0.1 };
}
