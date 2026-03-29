import React from 'react';
import { Button, Card, CardBody, CardHeader } from '@tapestry/ui';
import { AttackProfile } from '@tapestry/types';
import { formatAttackProfileSummary } from './editor.utils';

import styles from './ItemEditor.module.scss';

type AttackProfilesSectionProps = {
  attackProfiles: AttackProfile[];
  onAddProfile: () => void;
  onEditProfile: (profile: AttackProfile) => void;
  disabled: boolean;
};

export const AttackProfilesSection = ({ attackProfiles, onAddProfile, onEditProfile, disabled }: AttackProfilesSectionProps) => {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Attack Profiles</h2>
          <p className={styles.sectionSubtitle}>Add named attack modes for this item. Creating, editing, or removing a profile saves the item immediately.</p>
        </div>

        <Button variant="outline" tone="neutral" onClick={onAddProfile} disabled={disabled}>
          + Add Attack Profile
        </Button>
      </CardHeader>
      <CardBody>
        {!attackProfiles.length ? (
          <div className={styles.attackProfileEmpty}>
            <p className={styles.attackProfileEmptyTitle}>No attack profiles yet.</p>
            <p className={styles.attackProfileEmptyText}>Add one when this item needs named attacks, alternate firing modes, or different aspect and skill rules.</p>
          </div>
        ) : (
          <div className={styles.attackProfileList}>
            {attackProfiles.map((profile) => (
              <button key={profile.key} type="button" className={styles.attackProfileCard} onClick={() => onEditProfile(profile)} disabled={disabled}>
                <div className={styles.attackProfileCardHeader}>
                  <div>
                    <div className={styles.attackProfileName}>{profile.name}</div>
                    <div className={styles.attackProfileMeta}>{formatAttackProfileSummary(profile)}</div>
                  </div>
                  <span className={styles.attackProfileEditHint}>Edit</span>
                </div>

                <div className={styles.attackProfileDetails}>
                  {profile.defaultAspect && <span>Aspect: {profile.defaultAspect}</span>}
                  {profile.allowedSkillKeys?.length ? <span>Skills: {profile.allowedSkillKeys.length}</span> : <span>Skills: Any</span>}
                  {profile.tags?.length ? <span>Tags: {profile.tags.join(', ')}</span> : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
