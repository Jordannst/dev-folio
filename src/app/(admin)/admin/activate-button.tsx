"use client";

import { useEffect, useState } from "react";

// Activating changes the design for every visitor, so the first click only arms the button.
// Without JavaScript the form still posts on the first click.
export function ActivateButton({ id, name }: { id: string; name: string }) {
  const [step, setStep] = useState<"idle" | "confirm" | "pending">("idle");
  useEffect(() => {
    const reset = () => setStep("idle");
    addEventListener("pageshow", reset);
    return () => removeEventListener("pageshow", reset);
  }, []);
  useEffect(() => {
    if (step !== "confirm") return;
    const timer = setTimeout(() => setStep("idle"), 5000);
    return () => clearTimeout(timer);
  }, [step]);

  return <form action="/api/admin/activate" method="post" className="activate" onSubmit={event => {
    if (step === "pending") return event.preventDefault();
    if (step === "idle") { event.preventDefault(); return setStep("confirm"); }
    setStep("pending");
  }}>
    <input type="hidden" name="id" value={id} />
    <button type="submit" className="button primary" data-step={step} aria-busy={step === "pending" || undefined} aria-describedby={`hint-${id}`}>
      {step === "pending" && <span className="spinner" aria-hidden="true" />}
      {step === "idle" ? "Aktifkan" : step === "confirm" ? `Ya, aktifkan ${name}` : "Mengaktifkan…"}
    </button>
    <span id={`hint-${id}`} className="hint" aria-live="polite">{step === "confirm" ? "Semua pengunjung akan melihat desain ini." : ""}</span>
  </form>;
}
