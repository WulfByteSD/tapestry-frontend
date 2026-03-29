import React from 'react';
import { Button, Card, CardBody, CardHeader } from '@tapestry/ui';
import { GrantedAbilityRef, AbilityDefinition } from '@tapestry/types';
import { formatGrantedAbilitySummary } from './grantedAbility.utils';

import styles from './ItemEditor.module.scss';

type GrantedAbilitiesSectionProps = {
  grantedAbilities: GrantedAbilityRef[];
  abilitiesLookup: Map<string, AbilityDefinition>;
  onAddAbility: () => void;
  onEditAbility: (ref: GrantedAbilityRef) => void;
  disabled: boolean;
};

export const GrantedAbilitiesSection = ({ grantedAbilities, abilitiesLookup, onAddAbility, onEditAbility, disabled }: GrantedAbilitiesSectionProps) => {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Granted Abilities</h2>
          <p className={styles.sectionSubtitle}>Attach abilities from the content library to this item. Adding, editing, or removing an ability saves the item immediately.</p>
        </div>

        <Button variant="outline" tone="neutral" onClick={onAddAbility} disabled={disabled}>
          + Add Ability
        </Button>
      </CardHeader>
      <CardBody>
        {!grantedAbilities.length ? (
          <div className={styles.attackProfileEmpty}>
            <p className={styles.attackProfileEmptyTitle}>No abilities granted yet.</p>
            <p className={styles.attackProfileEmptyText}>Add one when this item grants special powers, spells, or techniques to its owner or wielder.</p>
          </div>
        ) : (
          <div className={styles.attackProfileList}>
            {grantedAbilities.map((ref) => {
              const ability = abilitiesLookup.get(ref.abilityId);
              return (
                <button key={ref.abilityId} type="button" className={styles.attackProfileCard} onClick={() => onEditAbility(ref)} disabled={disabled}>
                  <div className={styles.attackProfileCardHeader}>
                    <div>
                      <div className={styles.attackProfileName}>{ability?.name ?? ref.abilityKey}</div>
                      <div className={styles.attackProfileMeta}>{formatGrantedAbilitySummary(ref, ability)}</div>
                    </div>
                    <span className={styles.attackProfileEditHint}>Edit</span>
                  </div>

                  {(ability || ref.notes) && (
                    <div className={styles.attackProfileDetails}>
                      {ability?.category && <span>Category: {ability.category}</span>}
                      {ability?.activation && <span>Activation: {ability.activation}</span>}
                      {ref.notes && <span>Notes: {ref.notes}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
