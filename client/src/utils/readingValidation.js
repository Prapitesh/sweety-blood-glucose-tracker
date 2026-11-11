const SLOTS = ["morning", "after_breakfast", "after_lunch", "after_dinner"];
export function validateReading({ date, slot, value }, now = new Date()) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return "Please select a valid date.";
  const [y, m, d] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  if (parsed.getUTCFullYear() !== y || parsed.getUTCMonth() !== m - 1 || parsed.getUTCDate() !== d)
    return "Please select a valid date.";
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  if (date > today) return "Date cannot be in the future.";
  if (!SLOTS.includes(slot)) return "Please select a valid time slot.";
  if (value === "" || value === null || value === undefined) return "Please enter a glucose value.";
  const n = Number(value);
  if (!Number.isInteger(n) || n < 40 || n > 600) return "Value must be between 40 and 600 mg/dl.";
  return null;
}
