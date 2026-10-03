/* Everything a page needs from the app, shared through React context. */
import { createContext, useContext } from 'react';
import type { Config, PageId } from './data';

export interface AppApi {
  cfg: Config;
  /** Change the config (auto-saved to localStorage). */
  update: (fn: (c: Config) => void) => void;
  replaceConfig: (c: Config) => void;
  page: PageId;
  go: (p: PageId) => void;
  entered: boolean;
  showGate: () => void;
  toast: (msg: string) => void;
  fireworks: (n?: number) => void;
  confetti: (n?: number) => void;
  openLightbox: (i: number) => void;
  musicPlaying: boolean;
  toggleMusic: () => void;
}

export const AppContext = createContext<AppApi | null>(null);

export function useApp(): AppApi {
  const api = useContext(AppContext);
  if (!api) throw new Error('useApp must be used inside <AppContext.Provider>');
  return api;
}
