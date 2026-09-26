'use client';

import React from 'react';
import type { Editor } from '@tiptap/react';
import styles from './RichTextEditor.module.scss';
import clsx from 'clsx';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton = ({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => {
      e.preventDefault(); // prevent editor blur
      onClick();
    }}
    className={clsx(styles.toolbarBtn, isActive && styles.toolbarBtnActive)}
  >
    {children}
  </button>
);

const Divider = () => <span className={styles.toolbarDivider} aria-hidden="true" />;

interface RichTextEditorToolbarProps {
  editor: Editor;
}

export function RichTextEditorToolbar({ editor }: RichTextEditorToolbarProps) {
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
      <ToolbarButton title="Bold" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.6 11.79A4 4 0 0 0 13 4H6v16h7.5a4.5 4.5 0 0 0 2.1-8.21ZM9 7h4a2 2 0 0 1 0 4H9Zm4.5 10H9v-4h4.5a2.5 2.5 0 0 1 0 5Z" />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="Italic" isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4z" />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="Underline" isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17a6 6 0 0 0 6-6V3h-2.5v8a3.5 3.5 0 0 1-7 0V3H6v8a6 6 0 0 0 6 6zm-7 2v2h14v-2H5z" />
        </svg>
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Heading 2" isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>

      <ToolbarButton title="Heading 3" isActive={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Bullet list" isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zM8 6h12v2H8zm0 5h12v2H8zm0 5h12v2H8z" />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="Ordered list" isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
        </svg>
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Blockquote" isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        title="Link"
        isActive={editor.isActive('link')}
        onClick={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          } else {
            const url = window.prompt('URL');
            if (url) {
              editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
            }
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
        </svg>
      </ToolbarButton>
    </div>
  );
}
