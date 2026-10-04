import Link from 'next/link';
import { PublicAspects, PublicConditions, PublicConditionSummary, PublicResources, PublicSkills } from './PublicSheetCore';
import { PublicAbilities, PublicProfile } from './PublicSheetDetails';
import { PublicInventory } from './PublicInventory';
import { PublicSheetPortrait } from './PublicSheetPortrait';
import { PublicSheetRefresh } from './PublicSheetRefresh';
import { displayKey, type PublicCharacter } from './public-character';
import styles from './PublicCharacterSheet.module.scss';

export function PublicCharacterSheet({ character, identifier = character._id }: { character: PublicCharacter; identifier?: string }) {
  const { sheet } = character;
  const updatedAt = new Date(character.updatedAt);
  const savedAt = Number.isNaN(updatedAt.getTime()) ? null : updatedAt;

  return (
    <main className={styles.page} aria-labelledby="character-title">
      <nav className={styles.breadcrumb} aria-label="Character navigation">
        <Link href="/">Tapestry</Link>
        <span>Shared character sheet</span>
      </nav>
      <header className={styles.hero}>
        <PublicSheetRefresh identifier={identifier} />
        <div className={styles.portrait}>
          <PublicSheetPortrait name={character.name} avatarUrl={character.avatarUrl} />
          <span className={styles.weave}>Weave <b>{sheet.weaveLevel ?? 0}</b></span>
        </div>
        <div className={styles.identity}>
          <p className={styles.eyebrow}>{character.settingKey ? displayKey(character.settingKey) : 'Tapestry'}</p>
          <h1 id="character-title">{character.name}</h1>
          {sheet.profile?.title && <p className={styles.subtitle}>{sheet.profile.title}</p>}
          <div className={styles.characterMeta}>
            {sheet.archetypeKey && <span>{displayKey(sheet.archetypeKey)}</span>}
            <span>Read-only sheet</span>
            {character.status === 'archived' && <span className={styles.archived}>Archived</span>}
          </div>
        </div>
        <div className={styles.heroResources}>
          <PublicResources sheet={sheet} />
        </div>
      </header>
      <PublicConditionSummary conditions={sheet.conditions ?? []} />
      <nav className={styles.sectionNav} aria-label="Character sheet sections">
        {['aspects', 'skills', 'abilities', 'inventory', 'conditions', 'profile'].map((section) => (
          <a key={section} href={`#${section}`}>{displayKey(section)}</a>
        ))}
      </nav>
      <div className={styles.sheetLayout}>
        <aside className={styles.sidebar} aria-label="Aspects and skills">
          <PublicAspects aspects={sheet.aspects} />
          <PublicSkills skills={sheet.skills ?? {}} />
        </aside>
        <div className={styles.content}>
          <PublicAbilities character={character} />
          <PublicInventory inventory={sheet.inventory ?? []} />
        </div>
      </div>
      <PublicConditions conditions={sheet.conditions ?? []} />
      <PublicProfile character={character} />
      {savedAt && <footer className={styles.savedAt}>Character saved <time dateTime={savedAt.toISOString()}>{savedAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</time></footer>}
    </main>
  );
}
