import { useState } from "react";

// Reusable open/close boolean state - the same useState(false)+setOpen(true/false)
// pattern repeated across every page with a modal.
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
  };
}
