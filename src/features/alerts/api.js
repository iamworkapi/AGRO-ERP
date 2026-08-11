// Mock-backed for now - resolves from mockData.js with a fake delay instead
// of calling apiClient. Swapping in the real backend later means restoring
// the apiClient.get/post calls here only.
import { exceptions } from "./mockData";

const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchExceptions() {
  return resolveAfter([...exceptions]);
}

export function resolveException(description) {
  const idx = exceptions.findIndex((e) => e.description === description);
  if (idx === -1) return resolveAfter(null);
  // Replace the element rather than mutating it in place - the previous
  // fetch's payload shares this object reference and Redux/Immer deep-freezes
  // fulfilled payloads, so mutating a field on it would throw.
  const updated = { ...exceptions[idx], status: "Resolved" };
  exceptions[idx] = updated;
  return resolveAfter(updated);
}
