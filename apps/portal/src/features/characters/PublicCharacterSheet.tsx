'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ASPECT_BLOCKS, type EffectiveAbility, type ResourceTrack } from '@tapestry/types';
import { FiCopy, FiEye, FiRefreshCw } from 'react-icons/fi';
import { CharacterLoadError, displayKey, fetchPublicCharacter, score } from './public-character';
import styles from './PublicCharacterSheet.module.scss';

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} className={styles.panel} aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{title}</h2>{children}</section>;
}

function Resource({ label, track }: { label: string; track?: ResourceTrack }) {
  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd>
        {track ? <>{track.current} <span>/ {track.max}</span></> : '—'}
        {!!track?.temp && <small className={styles.temporary}>+{track.temp} temporary</small>}
      </dd>
    </div>
  );
}

export function PublicCharacterSheet({ identifier }: { identifier: string }) {
  const [copyStatus, setCopyStatus] = useState('');
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['public-character', identifier],
    queryFn: ({ signal }) => fetchPublicCharacter(identifier, signal),
    staleTime: 15_000,
    retry: false,
    refetchInterval: (current) => current.state.status === 'success' ? 30_000 : false,
    meta: { errorMessage: 'The shared character sheet could not be refreshed.' },
  });
  const unavailable = query.error instanceof CharacterLoadError && [400, 401, 403, 404].includes(query.error.status);
  const character = unavailable ? undefined : query.data;

  async function copyLink() {
    try {
      // Use the stable ID even if this route eventually accepts friendly aliases.
      await navigator.clipboard.writeText(`${window.location.origin}/characters/${encodeURIComponent(character?._id ?? identifier)}`);
      setCopyStatus('Link copied.');
    } catch {
      setCopyStatus('Copy the link from your browser’s address bar to share this sheet.');
    }
  }

  if (!character) {
    return (
      <main className={styles.page} aria-labelledby="character-title">
        <div className={styles.state}>
          <span className={styles.eyebrow}><FiEye aria-hidden="true" /> Shared character sheet</span>
          <h1 id="character-title">{query.isPending ? 'Unfolding the character sheet…' : 'Character sheet unavailable'}</h1>
          <p role={query.isPending ? 'status' : 'alert'}>{query.isPending ? 'Loading the latest saved character.' : query.error instanceof CharacterLoadError ? query.error.message : 'We could not reach the character sheet. Please try again.'}</p>
          <div className={styles.actions}>
            {!query.isPending && <button className={styles.button} type="button" disabled={query.isFetching} onClick={() => void query.refetch()}>{query.isFetching ? 'Loading…' : 'Try again'}</button>}
            <Link className={styles.textLink} href="/">Back to Tapestry</Link>
          </div>
        </div>
      </main>
    );
  }

  const { sheet } = character;
  const profile = sheet.profile;
  const skills = Object.entries(sheet.skills ?? {}).sort(([a], [b]) => displayKey(a).localeCompare(displayKey(b)));
  const inventory = sheet.inventory ?? [];
  const conditions = sheet.conditions ?? [];
  const abilities: EffectiveAbility[] = character.derived?.effectiveAbilities ?? (sheet.learnedAbilities ?? []).map((ability) => ({ ...ability, name: displayKey(ability.abilityKey), available: true }));
  const otherResources = sheet.resources?.other ?? {};
  const profileDetails = Object.entries(profile ?? {}).filter(([key, value]) => !['title', 'bio', 'extra'].includes(key) && value !== '' && value != null);
  const updatedAt = new Date(character.updatedAt);
  const avatarUrl = character.avatarUrl && /^https?:\/\//i.test(character.avatarUrl) ? character.avatarUrl : null;

  return (
    <main className={styles.page} aria-labelledby="character-title">
      <div className={styles.toolbar}>
        <span className={styles.eyebrow}><FiEye aria-hidden="true" /> Read-only character sheet</span>
        <div className={styles.actions}>
          <button className={styles.button} type="button" disabled={query.isFetching} onClick={() => void query.refetch()}><FiRefreshCw aria-hidden="true" />{query.isFetching ? 'Refreshing…' : 'Refresh'}</button>
          <button className={`${styles.button} ${styles.primaryButton}`} type="button" onClick={() => void copyLink()}><FiCopy aria-hidden="true" /> Copy share link</button>
        </div>
      </div>
      <p className={styles.copyStatus} role="status">{copyStatus}</p>

      <header className={styles.hero}>
        {avatarUrl && failedAvatar !== avatarUrl ? <Image unoptimized src={avatarUrl} width={104} height={104} alt="" className={styles.avatar} onError={() => setFailedAvatar(avatarUrl)} /> : <div className={styles.avatarFallback} aria-hidden="true">{character.name.slice(0, 1).toUpperCase() || 'T'}</div>}
        <div className={styles.identity}>
          <p className={styles.eyebrow}>Tapestry · Character card</p>
          <h1 id="character-title">{character.name}</h1>
          {profile?.title && <p className={styles.subtitle}>{profile.title}</p>}
          <div className={styles.badges}>
            <span>Weave {sheet.weaveLevel ?? 0}</span>
            {sheet.archetypeKey && <span>{displayKey(sheet.archetypeKey)}</span>}
            {character.settingKey && <span>{displayKey(character.settingKey)}</span>}
            {character.status === 'archived' && <span>Archived</span>}
          </div>
        </div>
      </header>

      <div className={styles.freshness}>
        <p>{!Number.isNaN(updatedAt.getTime()) && <>Character saved <time dateTime={updatedAt.toISOString()}>{updatedAt.toLocaleString()}</time>. </>}Refreshes every 30 seconds while open.</p>
        {query.isError && <p role="alert">Could not refresh. These are the last loaded values; try Refresh again.</p>}
      </div>

      <dl className={styles.resources} aria-label="Character resources">
        <Resource label="HP" track={sheet.resources?.hp} />
        <Resource label="Threads" track={sheet.resources?.threads} />
        <div className={styles.stat}><dt>Armor</dt><dd>{otherResources.armor ?? otherResources.ac ?? '—'}</dd></div>
        <div className={styles.stat}><dt>Defense TN</dt><dd>{sheet.dtn ?? '—'}</dd></div>
        {sheet.resources?.resolve && (sheet.resources.resolve.max > 0 || sheet.resources.resolve.current !== 0 || !!sheet.resources.resolve.temp) && <Resource label="Resolve" track={sheet.resources.resolve} />}
        {Object.entries(otherResources).filter(([key]) => !['armor', 'ac'].includes(key)).map(([key, value]) => <div className={styles.stat} key={key}><dt>{displayKey(key)}</dt><dd>{value}</dd></div>)}
      </dl>

      <nav className={styles.sectionNav} aria-label="Character sheet sections">
        {['aspects', 'skills', 'abilities', 'inventory', 'conditions', 'profile'].map((section) => <a key={section} href={`#${section}`}>{displayKey(section)}</a>)}
      </nav>

      <div className={styles.columns}>
        <div className={styles.stack}>
          <Section id="aspects" title="Aspects">
            <div className={styles.aspects}>
              {ASPECT_BLOCKS.map((block) => {
                const values = sheet.aspects?.[block.group] as Record<string, number> | undefined;
                return <div className={styles.aspect} key={block.group}><h3>{block.title}</h3><dl className={styles.keyValues}>{block.keys.map(({ key, label }) => <div key={key}><dt>{label}</dt><dd>{score(values?.[key])}</dd></div>)}</dl></div>;
              })}
            </div>
          </Section>
          <Section id="skills" title="Skills">
            {skills.length ? <dl className={styles.keyValues}>{skills.map(([key, rank]) => <div key={key}><dt>{displayKey(key)}</dt><dd>{score(rank)}</dd></div>)}</dl> : <p className={styles.muted}>No skills recorded.</p>}
          </Section>
          <Section id="conditions" title="Conditions">
            {conditions.length ? <ul className={styles.entries}>{conditions.map((condition, index) => <li key={`${condition.key}-${index}`}><div className={styles.entryHeading}><h3>{displayKey(condition.key)}</h3>{condition.stacks != null && <span>Stacks: {condition.stacks}</span>}</div>{condition.source && <p className={styles.muted}>Source: {condition.source}</p>}{condition.notes && <p className={styles.prose}>{condition.notes}</p>}</li>)}</ul> : <p className={styles.muted}>No conditions recorded.</p>}
          </Section>
          <Section id="profile" title="Character profile">
            {profile?.bio && <p className={styles.prose}>{profile.bio}</p>}
            <dl className={styles.keyValues}>{[...profileDetails, ...Object.entries(profile?.extra ?? {})].map(([key, value], index) => <div key={`${key}-${index}`}><dt>{displayKey(key)}</dt><dd>{String(value)}</dd></div>)}</dl>
            {!profile?.bio && !profileDetails.length && !Object.keys(profile?.extra ?? {}).length && <p className={styles.muted}>No profile details recorded.</p>}
            {!!character.toneModules?.length && <p className={styles.muted}>Tone modules: {character.toneModules.map(displayKey).join(', ')}</p>}
            {!!character.tags?.length && <div className={styles.badges}>{character.tags.map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}</div>}
          </Section>
        </div>
        <div className={styles.stack}>
          <Section id="abilities" title="Abilities & features">
            {abilities.length ? <ul className={styles.entries}>{abilities.map((ability, index) => <li key={`${ability.abilityKey}-${index}`}>
              <div className={styles.entryHeading}><h3>{ability.name}</h3>{!ability.available && <span>Unavailable</span>}</div>
              <p className={styles.muted}>{[ability.category, ability.activation, ability.usageModel].filter((value): value is NonNullable<typeof value> => !!value).map(displayKey).join(' · ')}</p>
              {ability.sourceLabel && <p className={styles.muted}>From {ability.sourceLabel}</p>}
              {ability.cost && <p className={styles.muted}>{[ability.cost.amount != null ? `Cost: ${ability.cost.amount} ${displayKey(ability.cost.resourceKey ?? 'resource')}` : '', ability.cost.charges != null ? `Charges: ${ability.cost.charges}` : '', ability.cost.cooldownTurns != null ? `Cooldown: ${ability.cost.cooldownTurns} turns` : ''].filter(Boolean).join(' · ')}</p>}
              {ability.summary && <p className={styles.prose}>{ability.summary}</p>}
              {ability.effectText && <p className={styles.prose}>{ability.effectText}</p>}
              {ability.notes && <p className={styles.prose}>{ability.notes}</p>}
            </li>)}</ul> : <p className={styles.muted}>No abilities recorded.</p>}
            {!!sheet.features?.length && <><h3 className={styles.subheading}>Features</h3><ul className={styles.features}>{sheet.features.map((feature, index) => <li key={`${feature}-${index}`}>{feature}</li>)}</ul></>}
          </Section>
          <Section id="inventory" title="Inventory">
            {inventory.length ? <ul className={styles.entries}>{inventory.map((item, index) => <li key={item.instanceId ?? index}>
              <div className={styles.entryHeading}><h3>{item.overrides?.displayName || item.name || displayKey(item.definition?.itemKey || item.itemKey || 'Unnamed item')}</h3><span>×{item.qty}</span></div>
              <p className={styles.muted}>{[item.equipped ? 'Equipped' : 'Carried', item.category ? displayKey(item.category) : '', item.slot ? displayKey(item.slot) : ''].filter(Boolean).join(' · ')}</p>
              {(item.overrides?.protection ?? item.protection) != null && <p>Protection: {item.overrides?.protection ?? item.protection}</p>}
              {item.overrides?.harm != null && <p>Harm: {item.overrides.harm}</p>}
              {!!item.attackProfiles?.length && <ul className={styles.attacks}>{item.attackProfiles.map((attack) => <li key={attack.key}><strong>{attack.name}</strong>{attack.harm != null && <> · Harm {attack.harm}</>}{attack.modifier != null && <> · Modifier {score(attack.modifier)}</>}{attack.rangeLabel && <> · {attack.rangeLabel}</>}{attack.notes && <p className={styles.prose}>{attack.notes}</p>}</li>)}</ul>}
              {item.notes && <p className={styles.prose}>{item.notes}</p>}
              {!!(item.overrides?.tags ?? item.tags)?.length && <div className={styles.badges}>{(item.overrides?.tags ?? item.tags)?.map((tag, tagIndex) => <span key={`${tag}-${tagIndex}`}>{tag}</span>)}</div>}
            </li>)}</ul> : <p className={styles.muted}>No inventory recorded.</p>}
          </Section>
        </div>
      </div>
    </main>
  );
}
