import { createElement, Fragment, type ReactNode } from 'react';
import { htmlToDOM, Element, type DOMNode } from 'html-react-parser';

const allowed = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'blockquote', 'br', 'hr', 'code', 'pre', 'a']);
const discarded = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'form', 'input', 'button', 'textarea', 'select', 'template', 'noscript', 'link', 'meta', 'base']);
const blocks = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre']);
const htmlPattern = /<\/?(?:p|div|h[1-6]|ul|ol|li|strong|b|em|i|u|s|strike|blockquote|br|hr|code|pre|a|script|style|iframe|object|embed|svg|math|form)(?:\s|\/?>)/i;

function isHtml(body: string) {
  return htmlPattern.test(body) || /<(?:br|hr)\s*\/?>/i.test(body);
}

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const documentBlocks = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'pre', 'hr']);

function isRichTextDocument(body: string) {
  const nodes = htmlToDOM(body);
  return nodes.some((node) => node instanceof Element) && nodes.every((node) =>
    node.type === 'text' ? !node.data.trim() : node instanceof Element && documentBlocks.has(node.name),
  );
}

function normalizeLegacyHtml(body: string): string {
  // The old API escaped only '<'. Fully escaped entity examples and ordinary
  // text are deliberately excluded from this compatibility path.
  const opening = body.trim().match(/^&lt;(p|h[1-6]|ul|ol|blockquote|pre)(?:\s[^<>]*)?>/i);
  if (!opening || !/&lt;\/(?:p|h[1-6]|ul|ol|blockquote|pre)>$/i.test(body.trim())) return body;
  const encodedNodes = htmlToDOM(body);
  if (!encodedNodes.every((node) => node.type === 'text')) return body;
  let normalized = encodedNodes.map((node) => node.type === 'text' ? node.data : '').join('');
  if (!isRichTextDocument(normalized)) return body;

  // Reopening escaped markup previously wrapped it in another paragraph. Only
  // unwrap text-only paragraphs whose complete contents are another document.
  for (let pass = 0; pass < 8; pass += 1) {
    const nodes = htmlToDOM(normalized).filter((node) => node.type !== 'text' || node.data.trim());
    const wrapper = nodes.length === 1 ? nodes[0] : null;
    if (!(wrapper instanceof Element) || wrapper.name !== 'p' || !wrapper.children.every((node) => node.type === 'text')) break;
    const inner = wrapper.children.map((node) => node.type === 'text' ? node.data : '').join('');
    if (!isRichTextDocument(inner)) break;
    normalized = inner;
  }
  return normalized;
}

// Tiptap handles its own schema for existing HTML. Escape legacy text once when
// feeding the editor so literal angle brackets and old line breaks survive.
export function noteBodyForEditor(body: string): string {
  body = normalizeLegacyHtml(body);
  if (!body || isHtml(body)) return body;
  return `<p>${escapeHtml(body).replace(/\r?\n/g, '<br>')}</p>`;
}

function safeHref(value: string | undefined): string | undefined {
  if (!value || /[\u0000-\u0020\u007f\\]/.test(value)) return undefined;
  if (/^(?:https?:|mailto:)/i.test(value)) return value;
  if (value.startsWith('//') || /^[^/?#]*:/.test(value)) return undefined;
  return value;
}

function renderNode(node: DOMNode, key: number): ReactNode {
  if (node.type === 'text') return node.data;
  if (!(node instanceof Element) || discarded.has(node.name)) return null;
  const children = node.children.map((child, index) => renderNode(child as DOMNode, index));
  if (!allowed.has(node.name)) return createElement(Fragment, { key }, children);
  const props = node.name === 'a' ? { key, href: safeHref(node.attribs.href), rel: 'noopener noreferrer' } : { key };
  return createElement(node.name, props, ...(node.name === 'br' || node.name === 'hr' ? [] : children));
}

export function NoteBody({ body }: { body: string }) {
  body = normalizeLegacyHtml(body);
  if (!isHtml(body)) return <div style={{ whiteSpace: 'pre-wrap' }}>{body}</div>;
  return <>{htmlToDOM(body).map(renderNode)}</>;
}

function textNode(node: DOMNode): string {
  if (node.type === 'text') return node.data;
  if (!(node instanceof Element) || discarded.has(node.name)) return '';
  if (node.name === 'br' || node.name === 'hr') return '\n';
  const text = node.children.map((child) => textNode(child as DOMNode)).join('');
  return blocks.has(node.name) ? `\n${node.name === 'li' ? '- ' : ''}${text.trim()}\n` : text;
}

export function noteBodyText(body: string): string {
  body = normalizeLegacyHtml(body);
  if (!isHtml(body)) return body;
  return htmlToDOM(body).map(textNode).join('').replace(/\n{3,}/g, '\n\n').trim();
}
