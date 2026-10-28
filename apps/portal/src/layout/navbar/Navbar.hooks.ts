import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useMobileNavigation(open: boolean, onClose: () => void) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const drawer = drawerRef.current;
    const trigger = triggerRef.current;
    const header = headerRef.current;
    if (!drawer) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusable = () => Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector))
      .filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
    const focusInside = () => (drawer.querySelector<HTMLButtonElement>('button') || drawer).focus();
    focusInside();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab') return;

      const elements = getFocusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) {
        event.preventDefault();
        drawer.focus();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === drawer)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const handleFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !drawer.contains(event.target)) focusInside();
    };
    const handleLink = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a[href]')) onClose();
    };
    drawer.addEventListener('click', handleLink);
    const desktop = window.matchMedia('(min-width: 920px)');
    const handleBreakpoint = () => { if (desktop.matches) onClose(); };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocus);
    desktop.addEventListener('change', handleBreakpoint);
    handleBreakpoint();

    return () => {
      drawer.removeEventListener('click', handleLink);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocus);
      desktop.removeEventListener('change', handleBreakpoint);
      document.body.style.overflow = previousOverflow;
      if (trigger?.getClientRects().length) trigger.focus();
      else header?.querySelector<HTMLAnchorElement>('a[href]')?.focus();
    };
  }, [open, onClose]);

  return { drawerRef, triggerRef, headerRef };
}

// Native disclosure navigation stays keyboard accessible and closes after selection.
export function useDesktopNavigation(headerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const close = () => header.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((item) => { item.open = false; });
    const handlePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.contains(event.target)) close();
    };
    const handleClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a[href]')) close();
    };
    const handleFocus = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && !header.contains(event.relatedTarget)) close();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !(event.target instanceof Element)) return;
      const disclosure = event.target.closest('details[open]');
      if (!disclosure) return;
      event.preventDefault();
      close();
      disclosure.querySelector('summary')?.focus();
    };
    document.addEventListener('pointerdown', handlePointer);
    header.addEventListener('click', handleClick);
    header.addEventListener('focusout', handleFocus);
    header.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      header.removeEventListener('click', handleClick);
      header.removeEventListener('focusout', handleFocus);
      header.removeEventListener('keydown', handleKey);
    };
  }, [headerRef]);
}
