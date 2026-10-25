import type { ProseNode } from './authoring.types';

// The marker disambiguates rich text from legacy plain strings, including literal HTML.
export const PROSE_PREFIX = '<!--tapestry:richtext:v1-->';
const allowed = new Set(['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'hr', 'a']);
const discard = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'template', 'form', 'input', 'button', 'img', 'video', 'audio', 'link', 'meta', 'base']);
export const escapeText = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export function safeHref(value: string): string | undefined {
  const href = value.trim();
  if (/^(#[^\s]*|\/(?!\/)[^\s]*)$/.test(href)) return href;
  try { if (['https:', 'http:', 'mailto:'].includes(new URL(href).protocol)) return href; } catch { /* Drop non-URLs. */ }
  return undefined;
}
/** Parse only in an inert template. No source DOM nodes are attached to the document. */
export function parseProseHtml(html: string): ProseNode[] {
  const template = document.createElement('template'); template.innerHTML = html;
  const walk = (node: Node, depth: number): ProseNode[] => {
    if (depth > 40) return [{ text: node.textContent ?? '' }];
    if (node.nodeType === Node.TEXT_NODE) return [{ text: node.textContent ?? '' }];
    if (node.nodeType !== Node.ELEMENT_NODE) return [];
    const element = node as Element, name = element.tagName.toLowerCase();
    if (discard.has(name)) return [];
    const children = Array.from(node.childNodes).flatMap(child => walk(child, depth + 1));
    const tag = ({ b: 'strong', i: 'em', strike: 's' } as Record<string, string>)[name] ?? name;
    if (!allowed.has(tag)) return children;
    const href = tag === 'a' ? safeHref(element.getAttribute('href') ?? '') : undefined;
    if (tag === 'a' && !href) return children;
    const start = tag === 'ol' && /^\d{1,6}$/.test(element.getAttribute('start') ?? '') ? Number(element.getAttribute('start')) : undefined;
    return [{ tag, children, ...(href ? { href } : {}), ...(start ? { start } : {}) }];
  };
  return Array.from(template.content.childNodes).flatMap(node => walk(node, 0));
}
export function serializeProse(nodes: ProseNode[]): string {
  return nodes.map(node => node.text !== undefined ? escapeText(node.text) : `<${node.tag}${node.href ? ` href="${escapeText(node.href)}"` : ''}${node.start ? ` start="${node.start}"` : ''}>${['br', 'hr'].includes(node.tag!) ? '' : `${serializeProse(node.children ?? [])}</${node.tag}>`}`).join('');
}
export function editorHtml(value: string): string {
  return value.startsWith(PROSE_PREFIX) ? serializeProse(parseProseHtml(value.slice(PROSE_PREFIX.length))) : value ? `<p>${escapeText(value).replaceAll('\n', '<br>')}</p>` : '';
}
export function storeProse(html: string): string {
  const nodes = parseProseHtml(html);
  const hasContent = (values: ProseNode[]): boolean => values.some(node => node.tag === 'hr' || !!node.text?.trim() || hasContent(node.children ?? []));
  return hasContent(nodes) ? PROSE_PREFIX + serializeProse(nodes) : '';
}
