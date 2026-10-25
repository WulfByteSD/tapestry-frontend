import { Button, TextAreaField, Tooltip } from '@tapestry/ui';
import { FiArrowDown, FiArrowUp, FiEdit3, FiMessageCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import type { ChatMessagePart } from '@tapestry/types';
import { compositionContent, compositionParts } from './ChatComposition.helpers';
import type { ChatCompositionFieldsProps } from './ChatComposition.types';
import styles from './Chat.module.scss';

export function ChatCompositionFields({ id, value, disabled, onChange, onKeyDown, toolbarEnd }: ChatCompositionFieldsProps) {
  const length = compositionContent(value).length;
  const parts = compositionParts(value);
  const focusPart = (index: number) => requestAnimationFrame(() => document.getElementById(`${id}-part-${index}`)?.focus());
  const add = (type: ChatMessagePart['type']) => {
    if (disabled || parts.length >= 32) return;
    onChange({ parts: [...parts, { type, text: '' }] });
    focusPart(parts.length);
  };
  const move = (index: number, direction: -1 | 1) => {
    const next = [...parts];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange({ parts: next });
    focusPart(index + direction);
  };
  const remove = (index: number) => {
    onChange({ parts: parts.filter((_, position) => position !== index) });
    if (parts.length > 1) focusPart(Math.min(index, parts.length - 2));
    else requestAnimationFrame(() => document.getElementById(`${id}-add-action`)?.focus());
  };
  return <div className={styles.compositionFields}>
    <ol className={styles.compositionList} aria-label="Message sections" role="list">
      {parts.map((part, index) => <li className={styles.compositionPart} key={index}>
        <Tooltip title={`${part.type === 'action' ? 'Action' : 'Dialogue'} · section ${index + 1}`}><span className={styles.compositionKind} aria-hidden="true">{part.type === 'action' ? <FiEdit3 /> : <FiMessageCircle />}</span></Tooltip>
        <TextAreaField id={`${id}-part-${index}`} aria-label={`${part.type === 'action' ? 'Action' : 'Dialogue'} section ${index + 1}`} aria-describedby={`${id}-help`} className={styles.messageInput} value={part.text} onChange={(event) => onChange({ parts: parts.map((entry, position) => position === index ? { ...entry, text: event.target.value } : entry) })} onKeyDown={onKeyDown} placeholder={part.type === 'action' ? 'What do you do?' : 'What do you say?'} maxLength={8000} rows={2} disabled={disabled} />
        <div className={styles.compositionControls}>
          <Tooltip title="Move up"><Button className={styles.sectionIcon} type="button" size="sm" variant="ghost" disabled={disabled || index === 0} aria-label={`Move ${part.type} section ${index + 1} up`} onClick={() => move(index, -1)}><FiArrowUp aria-hidden="true" /></Button></Tooltip>
          <Tooltip title="Move down"><Button className={styles.sectionIcon} type="button" size="sm" variant="ghost" disabled={disabled || index === parts.length - 1} aria-label={`Move ${part.type} section ${index + 1} down`} onClick={() => move(index, 1)}><FiArrowDown aria-hidden="true" /></Button></Tooltip>
          <Tooltip title="Remove section"><Button className={styles.sectionIcon} type="button" size="sm" variant="ghost" disabled={disabled} aria-label={`Remove ${part.type} section ${index + 1}`} onClick={() => remove(index)}><FiTrash2 aria-hidden="true" /></Button></Tooltip>
        </div>
      </li>)}
    </ol>
    <div className={styles.compositionAdd}>
      <Tooltip title="Add an action"><Button id={`${id}-add-action`} className={styles.addSection} type="button" size="sm" variant="ghost" aria-label="Add action" leftIcon={<FiPlus aria-hidden="true" />} disabled={disabled || parts.length >= 32} onClick={() => add('action')}>Action</Button></Tooltip>
      <Tooltip title="Add dialogue"><Button className={styles.addSection} type="button" size="sm" variant="ghost" aria-label="Add dialogue" leftIcon={<FiPlus aria-hidden="true" />} disabled={disabled || parts.length >= 32} onClick={() => add('dialogue')}>Dialogue</Button></Tooltip>
      <span className={styles.compositionCount} aria-label={`Message length: ${length} of 8000 characters`}>{length.toLocaleString()} / 8k</span>
      {toolbarEnd}
    </div>
    <p id={`${id}-help`} className={styles.srOnly}>Add actions and dialogue in any order. Empty sections are skipped.{toolbarEnd ? ' Ctrl or Command + Enter sends your message.' : ''}</p>
    {length > 8000 || parts.length >= 32 ? <p className={styles.error} role="status">{length > 8000 ? 'Shorten your message to 8,000 characters before sending.' : 'Maximum 32 sections per message.'}</p> : null}
  </div>;
}
