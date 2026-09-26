'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import clsx from 'clsx';
import { RichTextEditorToolbar } from './RichTextEditor.toolbar';
import styles from './RichTextEditor.module.scss';
import type { RichTextEditorProps } from './richTextEditor.types';

// Normalize Tiptap's "empty" HTML to an empty string so Ant Design
// required validators fire correctly.
function normalizeEmpty(html: string): string {
  const trimmed = html.trim();
  if (trimmed === '' || trimmed === '<p></p>') return '';
  return html;
}

export function RichTextEditor({ value = '', onChange, placeholder = 'Start typing...', disabled = false, className, minHeight = 200 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable code block — can be re-enabled later with a toolbar button
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange?.(normalizeEmpty(editor.getHTML()));
    },
  });

  // Sync external `value` changes (e.g. form.resetFields()) back into the editor
  useEffect(() => {
    if (!editor) return;
    const current = normalizeEmpty(editor.getHTML());
    const incoming = normalizeEmpty(value ?? '');
    if (current !== incoming) {
      // false = don't emit onUpdate, prevents infinite loops
      editor.commands.setContent(incoming || '', false as any);
    }
  }, [value, editor]);

  // Sync disabled state
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  return (
    <div className={clsx(styles.wrapper, disabled && styles.disabled, className)} style={{ '--rte-min-height': `${minHeight}px` } as React.CSSProperties}>
      {editor && <RichTextEditorToolbar editor={editor} />}
      <div className={styles.editorContent}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default RichTextEditor;
