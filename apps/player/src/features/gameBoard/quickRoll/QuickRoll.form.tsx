import { Button, Input, SelectField } from '@tapestry/ui';
import { RollResultCard } from '@/components/rollResultCard/RollResultCard.component';
import { aspectOptions, ownedRollCharacters, rollErrorMessage, signed } from './QuickRoll.helpers';
import { useQuickRoll } from './QuickRoll.hooks';
import type { QuickRollFormProps, RollCondition } from './QuickRoll.types';
import styles from './QuickRoll.module.scss';

export function QuickRollForm({ campaign, currentUserId, playerName, userRole, characterState, onClose }: QuickRollFormProps) {
  const { activeCharacterId, setActiveCharacter, isLoading, isError, refetch, characters } = characterState;
  const owned = ownedRollCharacters(characters, currentUserId, campaign._id);
  const character = owned.find((entry) => entry._id === activeCharacterId) ?? null;
  const unavailable = !!activeCharacterId && !character;
  const draft = useQuickRoll({ campaignId: campaign._id, playerId: currentUserId, character });
  const { mutation } = draft;
  const readOnly = campaign.status === 'archived' ? 'This campaign is archived. Rolls are read-only.'
    : userRole === 'observer' ? 'Observers can view this table, but cannot roll.' : !userRole || !currentUserId ? 'Campaign membership is required to roll.' : '';
  const blocked = !!readOnly || unavailable || isLoading || (!!activeCharacterId && isError);

  return (
    <form className={styles.form} aria-busy={mutation.isPending} onSubmit={(event) => { event.preventDefault(); if (!blocked) draft.roll(); }}>
      <fieldset className={styles.fields} disabled={mutation.isPending}>
        <label className={styles.field}>
          <span>Acting as</span>
          <SelectField autoFocus value={activeCharacterId ?? ''} onChange={(event) => setActiveCharacter(event.target.value || null)} disabled={isLoading}>
            <option value="">{playerName} — self</option>
            {unavailable && <option value={activeCharacterId!} disabled>Selected character unavailable for rolling</option>}
            {owned.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}
          </SelectField>
        </label>
        {unavailable && <p className={styles.notice} role="status">You can only roll for your own active character attached to this campaign. Choose self or one of your characters above.</p>}
        {isLoading && <p className={styles.hint} role="status">Loading your campaign characters…</p>}
        {isError && <p className={styles.notice} role="alert">Characters could not be refreshed. Choose self for plain dice, or <button className={styles.textButton} type="button" onClick={() => void refetch()}>reload characters</button>.</p>}
        {!isLoading && !isError && owned.length === 0 && <p className={styles.hint}>No active characters of yours are attached here. You can roll plain dice as yourself.</p>}
        {readOnly && <p className={styles.notice} role="status">{readOnly}</p>}
        {mutation.data ? (
          <div aria-live="polite">
            <p className={styles.saved}>Rolled as {character?.name ?? playerName}. Saved to this campaign; find the roll in Feed.</p>
            <RollResultCard result={mutation.data} />
          </div>
        ) : (
          <>
            <div className={styles.sectionHeading}>
              <h3>{character ? 'Approach roll' : 'Plain dice'}</h3>
              <p className={styles.hint}>{character ? '3d6 + one Aspect + one relevant Skill, if it applies.' : 'Roll d6s without character bonuses.'}</p>
            </div>
            {character && <div className={styles.row}>
              <label className={styles.field}>
                <span>Aspect {signed(draft.aspectBonus)}</span>
                <SelectField value={draft.aspect} onChange={(event) => draft.setAspect(event.target.value)}>
                  {aspectOptions.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
                </SelectField>
              </label>
              <label className={styles.field}>
                <span>Relevant Skill {signed(draft.skillBonus)}</span>
                <SelectField value={draft.skill} onChange={(event) => draft.setSkill(event.target.value)}>
                  <option value="">{draft.skillOptions.length ? 'None' : 'No learned skills'}</option>
                  {draft.skillOptions.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} ({signed(entry.rank)})</option>)}
                </SelectField>
              </label>
            </div>}
            {character && draft.skills.isFetching && <p className={styles.hint}>Loading skill names… Your character’s ranks are shown.</p>}
            {character && draft.skills.isError && <p className={styles.hint}>Skill names could not be loaded. Your character’s saved skill ranks are still available.</p>}
            <div className={styles.row}>
              {!character && <label className={styles.field}>
                <span>Number of d6s</span>
                <Input type="number" min={1} max={20} step={1} required value={draft.condition === 'normal' ? draft.diceCount : '4'} disabled={draft.condition !== 'normal'} onChange={(event) => draft.setDiceCount(event.target.value)} />
              </label>}
              <label className={styles.field}>
                <span>Modifier</span>
                <Input type="number" min={-100} max={100} step={1} required value={draft.modifier} onChange={(event) => draft.setModifier(event.target.value)} />
              </label>
            </div>
            <label className={styles.field}>
              <span>Edge or Burden</span>
              <SelectField value={draft.condition} onChange={(event) => draft.setCondition(event.target.value as RollCondition)}>
                <option value="normal">Neither</option>
                <option value="edge">Edge — 4d6, keep best 3</option>
                <option value="burden">Burden — 4d6, keep worst 3</option>
              </SelectField>
            </label>
            <label className={styles.field}>
              <span>Context <span className={styles.optional}>(optional)</span></span>
              <Input maxLength={500} value={draft.context} onChange={(event) => draft.setContext(event.target.value)} placeholder="What are you attempting?" />
            </label>
            <div className={styles.preview} aria-live="polite"><span>Roll preview</span><strong>{draft.valid ? draft.preview : 'Enter whole numbers within the allowed range'}</strong></div>
            {mutation.isError && <p className={styles.notice} role="alert">{rollErrorMessage(mutation.error)} Rolling again makes a new roll.</p>}
          </>
        )}
      </fieldset>
      <div className={styles.footer}>
        <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>{mutation.data ? 'Done' : 'Close'}</Button>
        {mutation.data ? <Button type="button" variant="outline" onClick={() => mutation.reset()} disabled={blocked}>Roll again</Button>
          : <Button type="submit" disabled={blocked || !draft.valid || mutation.isPending}>{mutation.isPending ? 'Rolling…' : mutation.isError ? 'Make a new roll' : 'Roll & save to Feed'}</Button>}
      </div>
    </form>
  );
}
