import { useEffect } from 'react';

const focusable = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]';

export function useSheetModalFocus(open: boolean, marker: string, titleId: string) {
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    let dialog: HTMLElement | null = null;
    const findDialog = () => {
      dialog = document.getElementsByClassName(marker)[0] as HTMLElement | undefined ?? null;
      if (!dialog) return false;
      dialog.setAttribute('aria-labelledby', titleId);
      dialog.querySelector<HTMLElement>(focusable)?.focus();
      return true;
    };
    // The shared primitive mounts its portal after its first client effect.
    const observer = new MutationObserver(() => { if (findDialog()) observer.disconnect(); });
    if (!findDialog()) observer.observe(document.body, { childList: true, subtree: true });
    const trapFocus = (event: KeyboardEvent) => {
      const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).filter((node) => node.getClientRects().length);
      if (!dialog || dialogs[dialogs.length - 1] !== dialog) return;
      if (event.key === 'Escape') {
        // Only the top dialog closes when an item preview sits over its library.
        event.stopImmediatePropagation();
        dialog.querySelector<HTMLButtonElement>('button[aria-label="Close"]')?.click();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>(focusable)).filter((node) => node.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener('keydown', trapFocus, true);
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', trapFocus, true);
      previousFocus?.focus();
      // Keep the page locked if another sheet dialog remains open.
      if (document.querySelector(`.${marker}`)) requestAnimationFrame(() => {
        if (Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).some((node) => node.getClientRects().length)) document.body.style.overflow = 'hidden';
      });
    };
  }, [open, marker, titleId]);
}
