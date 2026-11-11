import { useState } from "react";
import { X } from "./Icons";
import api, { getErrorMessage } from "../services/api";
import { validateReading } from "../utils/readingValidation.js";
const today = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};
const slots = [
  ["morning", "Morning (fasting)"],
  ["after_breakfast", "After breakfast"],
  ["after_lunch", "After lunch"],
  ["after_dinner", "After dinner"],
];
export default function ReadingForm({ reading, onClose, onSaved }) {
  const [form, setForm] = useState({
    date: reading?.date || today(),
    slot: reading?.slot || "morning",
    value: reading?.value ?? "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateReading(form);
    if (validationError) return setError(validationError);
    const value = Number(form.value);
    setBusy(true);
    try {
      if (reading) await api.put("/readings/" + reading.id, { ...form, value });
      else await api.post("/readings", { ...form, value });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal" role="dialog" aria-modal="true">
        <header className="modal-head">
          <div>
            <span className="eyebrow">{reading ? "UPDATE ENTRY" : "NEW ENTRY"}</span>
            <h2>{reading ? "Edit reading" : "Add a reading"}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </header>
        <form onSubmit={submit}>
          <label>
            Date
            <input
              type="date"
              required
              max={today()}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label>
            Time slot
            <select value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
              {slots.map(([v, l]) => (
                <option value={v} key={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            Glucose level (mg/dL)
            <input
              type="number"
              min="40"
              max="600"
              step="1"
              placeholder="e.g. 110"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" disabled={busy}>
              {busy ? "Saving..." : reading ? "Save changes" : "Save reading"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
