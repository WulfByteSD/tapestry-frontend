import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChatMessageDto } from '@tapestry/types';

export function useChatScroll(channelId: string, messages: ChatMessageDto[], onRead: (channelId: string, messageId: string) => Promise<void>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousRef = useRef({ channelId: '', firstId: '', lastId: '', height: 0, nearBottom: true });
  const anchorsRef = useRef<{ id: string; offset: number }[]>([]);
  const [nearBottom, setNearBottom] = useState(true);
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);
  const lastId = messages.at(-1)?.id;
  const captureAnchors = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    anchorsRef.current = [...element.querySelectorAll<HTMLElement>('[data-message-id]')]
      .filter((row) => { const rect = row.getBoundingClientRect(); return rect.bottom > bounds.top && rect.top < bounds.bottom; })
      .map((row) => ({ id: row.dataset.messageId!, offset: row.getBoundingClientRect().top - bounds.top }));
  }, []);
  const readVisibleMessages = useCallback(() => {
    const element = scrollRef.current;
    if (!element || !lastId || document.visibilityState !== 'visible') return;
    const rect = element.getBoundingClientRect();
    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(window.innerHeight, rect.bottom);
    if (visibleBottom <= visibleTop) return;
    const visibleMessage = [...element.querySelectorAll<HTMLElement>('[data-message-id]')].reverse().find((row) => {
      const bounds = row.getBoundingClientRect();
      return bounds.bottom <= visibleBottom + 1 && bounds.bottom > visibleTop;
    });
    const throughId = visibleMessage?.dataset.messageId;
    if (throughId) void onRead(channelId, throughId);
  }, [channelId, lastId, onRead]);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const previous = previousRef.current;
    const firstId = messages[0]?.id ?? '';
    const nextLast = lastId ?? '';
    if (previous.channelId !== channelId || (!previous.lastId && nextLast)) element.scrollTop = element.scrollHeight;
    else if (previous.nearBottom && nextLast !== previous.lastId) element.scrollTop = element.scrollHeight;
    else {
      // A recent-page refresh can replace both ends of the loaded window. Keep
      // the same visible row in place, including when a message changes height.
      const rows = [...element.querySelectorAll<HTMLElement>('[data-message-id]')];
      const anchor = anchorsRef.current.find((entry) => rows.some((row) => row.dataset.messageId === entry.id));
      const row = anchor && rows.find((entry) => entry.dataset.messageId === anchor.id);
      if (row && anchor) element.scrollTop += row.getBoundingClientRect().top - element.getBoundingClientRect().top - anchor.offset;
      else if (firstId !== previous.firstId && nextLast === previous.lastId) element.scrollTop += element.scrollHeight - previous.height;
    }
    previousRef.current = { channelId, firstId, lastId: nextLast, height: element.scrollHeight, nearBottom: element.scrollHeight - element.scrollTop - element.clientHeight < 80 };
    captureAnchors();
  }, [channelId, messages, lastId, captureAnchors]);

  useEffect(() => {
    readVisibleMessages();
    document.addEventListener('visibilitychange', readVisibleMessages);
    window.addEventListener('scroll', readVisibleMessages, true);
    return () => {
      document.removeEventListener('visibilitychange', readVisibleMessages);
      window.removeEventListener('scroll', readVisibleMessages, true);
    };
  }, [readVisibleMessages]);

  const onScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    const bottom = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
    previousRef.current.nearBottom = bottom;
    previousRef.current.height = element.scrollHeight;
    captureAnchors();
    setNearBottom(bottom);
    if (bottom) setLastSeenId(lastId ?? null);
    readVisibleMessages();
  }, [captureAnchors, lastId, readVisibleMessages]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    // Message measurement and expansion happen independently of query updates.
    // Keep the same visible row anchored when those heights change, including
    // when a freshly loaded older page gains its expansion controls.
    const observer = new ResizeObserver(() => {
      const rows = [...element.querySelectorAll<HTMLElement>('[data-message-id]')];
      const anchor = anchorsRef.current.find((entry) => rows.some((row) => row.dataset.messageId === entry.id));
      const row = anchor && rows.find((entry) => entry.dataset.messageId === anchor.id);
      if (row && anchor) element.scrollTop += row.getBoundingClientRect().top - element.getBoundingClientRect().top - anchor.offset;
      onScroll();
    });
    element.querySelectorAll<HTMLElement>('[data-message-id]').forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [channelId, messages, onScroll]);
  const toLatest = () => { const element = scrollRef.current; if (element) { element.scrollTop = element.scrollHeight; onScroll(); } };
  return { scrollRef, onScroll, toLatest, showLatest: !nearBottom, hasNewMessages: Boolean(lastId && lastId !== lastSeenId) };
}
