import { Button } from '@tapestry/ui';
import { titleCaseFromKey } from '../../CharacterSheet.helpers';
import type { OverviewTabProps } from './OverviewTab.types';
import styles from './OverviewTab.module.scss';

export function OverviewTab({ sheet, mode, onAction, onNavigate }: OverviewTabProps) {
  const isBuild = mode === 'build';
  const equipped = sheet.sheet.inventory?.filter((item) => item.equipped) ?? [];
  const conditions = sheet.sheet.conditions ?? [];

  return <div className={styles.overview}>
    <section className={styles.nextMove} aria-labelledby="next-move-heading">
      <div className={styles.kicker}>{isBuild ? 'Build your character' : 'At the table'}</div>
      <h2 id="next-move-heading">{isBuild ? 'Bring your character to life' : 'Your next move'}</h2>
      <p>{isBuild ? 'Shape your aspects, choose skills and abilities, and gather your gear. Switch to Play when you are ready.' : 'Choose an aspect for your approach, or prepare a roll from here.'}</p>
      <div className={styles.actions}>
        <Button tone="gold" size="lg" className={styles.primaryAction} disabled={isBuild} onClick={() => onAction('approach')}>Roll an Approach</Button>
        <Button variant="outline" tone="neutral" size="lg" disabled={isBuild} onClick={() => onAction('attack')}>Attack</Button>
        <Button variant="ghost" tone="neutral" size="lg" disabled={isBuild} onClick={() => onAction('harm')}>Take Damage</Button>
      </div>
    </section>
    <section className={styles.readySection} aria-labelledby="equipped-heading">
      <div className={styles.sectionHeader}><h3 id="equipped-heading">Equipped & ready</h3><Button variant="ghost" size="sm" onClick={() => onNavigate('inventory')}>Open inventory →</Button></div>
      {equipped.length ? <ul className={styles.equipmentList}>{equipped.map((item, index) => <li key={item.instanceId ?? `${item.itemKey}-${index}`}>
        <span>{item.overrides?.displayName || item.name || titleCaseFromKey(item.itemKey || item.definition?.itemKey) || 'Unnamed item'}</span>
        <span className={styles.itemCategory}>{titleCaseFromKey(item.category)}</span>
      </li>)}</ul> : <p className={styles.empty}>No gear equipped. Your inventory is ready when you need it.</p>}
    </section>
    {conditions.length > 0 && <section className={styles.readySection} aria-labelledby="active-conditions-heading">
      <div className={styles.sectionHeader}><h3 id="active-conditions-heading">Active conditions</h3><Button variant="ghost" size="sm" onClick={() => onNavigate('conditions')}>Manage →</Button></div>
      <ul className={styles.conditionList}>{conditions.map((condition) => <li key={condition.key}>{titleCaseFromKey(condition.key)}{condition.stacks && condition.stacks > 1 ? ` ×${condition.stacks}` : ''}</li>)}</ul>
    </section>}
    <nav className={styles.quickLinks} aria-label="Character options">
      <Button variant="ghost" onClick={() => onNavigate('abilities')}>Abilities →</Button>
      <Button variant="ghost" onClick={() => onNavigate('skills')}>Skills →</Button>
      <Button variant="ghost" onClick={() => onNavigate('notes')}>Story notes →</Button>
    </nav>
  </div>;
}
