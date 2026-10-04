import Image from 'next/image';
import { Button } from '@tapestry/ui';
import { CharacterNameForm } from './CharacterName.form';
import { titleCaseFromKey } from './CharacterSheet.helpers';
import type { CharacterHeaderProps } from './CharacterHeader.types';
import styles from './CharacterSheet.module.scss';

export function CharacterHeader({ sheet, mode, onModeChange, onDetails }: CharacterHeaderProps) {
  const profile = sheet.sheet.profile;
  return (
    <header className={styles.hero}>
      <div className={styles.portrait}>
        {sheet.avatarUrl ? <Image src={sheet.avatarUrl} alt="" width={112} height={132} className={styles.avatar} /> :
          <span className={styles.monogram} aria-hidden="true">{sheet.name?.[0]?.toUpperCase() ?? '?'}</span>}
        <span className={styles.weave}>Weave <b>{sheet.sheet.weaveLevel ?? '—'}</b></span>
      </div>
      <div className={styles.identity}>
        <div className={styles.eyebrow}>{titleCaseFromKey(sheet.settingKey) || 'Character sheet'}</div>
        <CharacterNameForm characterId={sheet._id} name={sheet.name} />
        {profile?.title && <p className={styles.heroTitle}>{profile.title}</p>}
        <div className={styles.characterMeta}>
          {sheet.sheet.archetypeKey && <span>{titleCaseFromKey(sheet.sheet.archetypeKey)}</span>}
          <span>{sheet.campaign ? 'Campaign character' : 'Independent character'}</span>
          {sheet.status === 'archived' && <span>Archived</span>}
        </div>
        {profile?.bio && <p className={styles.heroBio}>{profile.bio}</p>}
      </div>
      <div className={styles.heroActions}>
        <div className={styles.modeToggle} role="group" aria-label="Character sheet mode">
          <Button variant="ghost" size="sm" aria-pressed={mode === 'play'} className={mode === 'play' ? styles.modeActive : styles.modeButton} onClick={() => onModeChange('play')}>Play</Button>
          <Button variant="ghost" size="sm" aria-pressed={mode === 'build'} className={mode === 'build' ? styles.modeActive : styles.modeButton} onClick={() => onModeChange('build')}>Build</Button>
        </div>
        <Button variant="outline" tone="neutral" onClick={onDetails}>Character details</Button>
      </div>
    </header>
  );
}
