export interface RichTextEditorProps {
  /** HTML string value — controlled by the parent (e.g. Ant Design Form.Item) */
  value?: string;
  /** Called with the latest HTML string on every editor change */
  onChange?: (html: string) => void;
  placeholder?: string;
  /** Disable the editor */
  disabled?: boolean;
  /** Additional class name for the outer wrapper */
  className?: string;
  /** Minimum height of the editable area in px. Defaults to 200. */
  minHeight?: number;
}
