'use client';
import { useCallback, useEffect, useRef } from 'react';
import { Modal } from '@tapestry/ui';
import type { ConfirmProps } from './unwoven.types';

export default function UnwovenConfirm({ title, children, confirm, busy, disabled, danger, onConfirm, onCancel }: ConfirmProps) {
  const body = useRef<HTMLDivElement>(null);
  // The shared modal mounts its portal after an effect. Attach only once its body exists.
  const attachBody = useCallback((node: HTMLDivElement | null) => {
    body.current = node;
    if (!node) return;
    node.closest('[role="dialog"]')?.setAttribute('aria-label', title);
    requestAnimationFrame(() => { if (node.isConnected) node.focus(); });
  }, [title]);
  useEffect(() => {
    const previous = document.activeElement;
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const dialog = body.current?.closest('[role="dialog"]');
      const elements = Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]') ?? []);
      const first = elements[0], last = elements.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === body.current || !dialog?.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === body.current || !dialog?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => { document.removeEventListener('keydown', trap); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [title]);
  return <Modal open title={title} onCancel={busy ? undefined : onCancel} onOk={onConfirm} okText={confirm} cancelText="Cancel" confirmLoading={busy} maskClosable={!busy} closable={!busy} okButtonProps={{ tone: danger ? 'danger' : 'gold', disabled: busy || disabled }} cancelButtonProps={{ disabled: busy }} destroyOnClose><div ref={attachBody} tabIndex={-1}>{children}</div></Modal>;
}
