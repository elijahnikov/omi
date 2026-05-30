import type { Id } from "@omi/backend/_generated/dataModel.js";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CommandPalette } from "./index";

interface CommandPaletteContextValue {
  close: () => void;
  open: () => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null
);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider"
    );
  }
  return ctx;
}

export function CommandPaletteProvider({
  workspaceId,
  children,
}: {
  workspaceId: Id<"workspace">;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Bumped each time the palette opens so it remounts with a fresh key,
  // resetting its query state without an effect. The closing instance stays
  // mounted (key unchanged) so its exit animation still plays.
  const [openSession, setOpenSession] = useState(0);

  const value = useMemo<CommandPaletteContextValue>(
    () => ({
      open: () => {
        setIsOpen(true);
        setOpenSession((session) => session + 1);
      },
      close: () => setIsOpen(false),
      toggle: () =>
        setIsOpen((prev) => {
          if (!prev) {
            setOpenSession((session) => session + 1);
          }
          return !prev;
        }),
    }),
    []
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setIsOpen(next);
    if (next) {
      setOpenSession((session) => session + 1);
    }
  }, []);

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette
        key={openSession}
        onOpenChange={handleOpenChange}
        open={isOpen}
        workspaceId={workspaceId}
      />
    </CommandPaletteContext.Provider>
  );
}
