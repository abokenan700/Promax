import { createContext, useContext, useState, useCallback } from "react";

interface AccountSheetCtx {
  open: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

const Ctx = createContext<AccountSheetCtx>({ open: false, openSheet: () => {}, closeSheet: () => {} });

export function AccountSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSheet  = useCallback(() => setOpen(true),  []);
  const closeSheet = useCallback(() => setOpen(false), []);
  return <Ctx.Provider value={{ open, openSheet, closeSheet }}>{children}</Ctx.Provider>;
}

export function useAccountSheet() { return useContext(Ctx); }
