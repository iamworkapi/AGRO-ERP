// Minimal pub/sub toast store - deliberately not Redux. It needs to be
// callable from plain modules that aren't React components (apiClient's
// response interceptor, thunks) without wiring a dispatch through them, so
// a tiny external store is a better fit here than another slice.
let toasts = [];
const listeners = new Set();

function notify() {
  for (const listener of listeners) listener(toasts);
}

function push(type, message, { duration = 4500, title } = {}) {
  if (!message) return;
  const recent = toasts.find((t) => t.message === message && t.type === type);
  if (recent) return recent.id;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toasts = [...toasts, { id, type, message, title, duration, createdAt: Date.now() }];
  notify();
  // Fallback cleanup in case component unmounts
  if (duration) {
    setTimeout(() => {
      dismiss(id);
    }, duration + 1000);
  }
  return id;
}

function dismiss(id) {
  if (!id) {
    toasts = [];
  } else {
    toasts = toasts.filter((t) => t.id !== id);
  }
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

