/** Touch/pen previews are independent of book selection and URL navigation. */
export const SHELF_HOLD_MS = 450;
export const SHELF_MOVE_TOLERANCE = 10;

type Press = { pointerId: number; pointerType: string; isPrimary: boolean; button: number; clientX: number; clientY: number };
type Clock = { set: (callback: () => void, delay: number) => unknown; clear: (handle: unknown) => void };

export function createShelfGesture(onPreview: (slug: string | null) => void, clock: Clock = {
  set: (callback, delay) => setTimeout(callback, delay),
  clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
}) {
  let pending: { slug: string; id: number; x: number; y: number; timer: unknown; held: boolean } | null = null;
  let suppressClick: string | null = null;

  function clearPending() {
    if (pending) clock.clear(pending.timer);
    pending = null;
  }
  function dismiss() {
    if (pending) suppressClick = pending.slug;
    clearPending();
    onPreview(null);
  }
  return {
    start(slug: string, event: Press) {
      dismiss();
      suppressClick = null;
      if (!event.isPrimary || event.button !== 0 || !['touch', 'pen'].includes(event.pointerType)) return;
      const press = { slug, id: event.pointerId, x: event.clientX, y: event.clientY, timer: undefined as unknown, held: false };
      pending = press;
      press.timer = clock.set(() => {
        if (pending !== press) return;
        press.held = true;
        suppressClick = slug;
        onPreview(slug);
      }, SHELF_HOLD_MS);
    },
    move(event: Pick<Press, 'pointerId' | 'clientX' | 'clientY'>) {
      if (pending?.id === event.pointerId && Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > SHELF_MOVE_TOLERANCE) dismiss();
    },
    end(pointerId: number) {
      if (pending?.id === pointerId) clearPending();
    },
    cancel(pointerId: number) {
      if (pending?.id === pointerId) dismiss();
    },
    consumeClick(slug: string, detail: number) {
      // Keyboard/assistive activation must never be swallowed by a previous hold.
      if (detail === 0) { suppressClick = null; return false; }
      if (suppressClick !== slug) return false;
      suppressClick = null;
      return true;
    },
    blocksContextMenu() { return Boolean(pending || suppressClick); },
    dismiss,
    dispose: clearPending,
  };
}
