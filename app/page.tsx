"use client";
import { useState } from "react";
import { calculate, MODES, TIERS, type Mode } from "@/lib/pricing";

const usd = (n: number, d = 2) => `$${n.toFixed(d)}`;
const pct = (n: number) => `${Math.round(n * 100)}%`;

export default function Page() {
  const [mode, setMode] = useState<Mode>("split");
  const [withMargin, setWithMargin] = useState(true);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const cost = parseFloat(input.replace(",", "."));
  const valid = Number.isFinite(cost) && cost > 0;
  const r = valid ? calculate(cost, mode, withMargin) : null;

  async function copy() {
    if (!r) return;
    const msg = `  ${usd(r.price)} (product ${usd(cost)} + Codpartner fees ${usd(r.fee, 3)}${
      mode === "split" && withMargin ? ` + seller margin ${usd(r.margin, 3)}` : ""
    })`;
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <main>
      <h1>Inter-seller pricing</h1>
      <p className="sub">Enter the product cost to get the price to share with the seller.</p>

      <div className="seg" role="radiogroup" aria-label="Transaction type">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
            <span>{MODES[m].label}</span>
            <small>{MODES[m].hint}</small>
          </button>
        ))}
      </div>

      {mode === "split" && (
        <>
          <p className="q">Add a seller margin?</p>
          <div className="seg" role="radiogroup" aria-label="Seller margin">
            {[true, false].map((v) => (
              <button key={String(v)} role="radio" aria-checked={withMargin === v} onClick={() => setWithMargin(v)}>
                <span>{v ? "Yes, add margin" : "No margin"}</span>
                <small>{v ? "Fees + seller margin" : "Codpartner fees only"}</small>
              </button>
            ))}
          </div>
        </>
      )}

      <label className="field">
        <span>Product cost</span>
        <div>
          <i>$</i>
          <input inputMode="decimal" placeholder="0.00" value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
        </div>
      </label>

      <section className="result" aria-live="polite">
        {r ? (
          <>
            <div className="price">{usd(r.price)}</div>
            <p className="tier">{r.tier.name} · {r.tier.range}</p>
            <dl>
              <div><dt>Product cost</dt><dd>{usd(cost, 3)}</dd></div>
              <div><dt>Codpartner fees ({pct(r.feeRate)})</dt><dd>{usd(r.fee, 3)}</dd></div>
              {mode === "split" && withMargin && <div><dt>Seller margin ({pct(r.marginRate)})</dt><dd>{usd(r.margin, 3)}</dd></div>}
            </dl>
            {r.belowMin && <p className="note">Below $0.10: TIR 1 rates applied.</p>}
            <button className="copy" onClick={copy}>{copied ? "Copied" : "Copy price details"}</button>
          </>
        ) : (
          <p className="empty">Type a product cost above.</p>
        )}
      </section>

      <details>
        <summary>Rate table</summary>
        <table>
          <thead>
            <tr><th>Tier</th><th>Range</th><th>Fees</th><th>Margin</th><th>Arrival fees</th></tr>
          </thead>
          <tbody>
            {TIERS.map((t) => (
              <tr key={t.name}>
                <td>{t.name}</td><td>{t.range}</td><td>{pct(t.split.fee)}</td><td>{pct(t.split.margin)}</td><td>{pct(t.arrival.fee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </main>
  );
}
