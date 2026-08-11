// Minimal pub/sub toast store - deliberately not Redux. It needs to be
// callable from plain modules that aren't React components (apiClient's
// response interceptor, thunks) without wiring a dispatch through them, so
// a tiny external store is a better fit here than another slice.
let toasts = [];
const listeners = new Set();

function notify() {
  for (const listener of listeners) listener(toasts);
}

function push(type, message, { duration = 5000 } = {}) {
  if (!message) return;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toasts = [...toasts, { id, type, message, duration }];
  notify();
  if (duration) setTimeout(() => dismiss(id), duration);
  return id;
}

function dismiss(id) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export const toast = {
  error: (message, opts) => push("error", message, opts),
  success: (message, opts) => push("success", message, opts),
  warning: (message, opts) => push("warning", message, opts),
  info: (message, opts) => push("info", message, opts),
  dismiss,
};

export function subscribeToasts(listener) {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}
