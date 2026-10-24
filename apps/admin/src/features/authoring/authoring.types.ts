import type { ReactNode } from 'react';
export type ProseNode = { text?: string; tag?: string; href?: string; start?: number; children?: ProseNode[] };
export type RichFieldProps = { id: string; label: string; value: string; onChange: (value: string) => void; hint?: string; error?: string; maxLength?: number; minHeight?: number; disabled?: boolean };
export type ListFieldProps = { id: string; label: string; value: string[]; onChange: (value: string[]) => void; hint?: string; maxItems?: number; maxLength?: number; disabled?: boolean };
export type MultiPickerProps = { id: string; label: string; value: string[]; onChange: (value: string[]) => void; options: { value: string; label: string; disabled?: boolean }[]; hint?: ReactNode; disabled?: boolean };
export type ProseProps = { value: string; className?: string; fallback?: string };
