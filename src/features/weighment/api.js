// Mock-backed for now - resolves from mockData.js with a fake delay instead
// of calling apiClient. Swapping in the real backend later means restoring
// the apiClient.get/post/put calls here only.
import { weighmentSlips, deductionSlabs } from "./mockData";

const resolveAfter = (value, ms = 300) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function fetchWeighmentSlips() {
  return resolveAfter([...weighmentSlips]);
}

export function fetchDeductionSlabs() {
  return resolveAfter([...deductionSlabs]);
}

export function createWeighmentSlip(payload) {
  const record = {
    slipNo: String(18660 + weighmentSlips.length + 5),
    status: "Pending",
    ...payload,
  };
  weighmentSlips.unshift(record); // mock "write" - becomes a real POST later
  return resolveAfter(record);
}
