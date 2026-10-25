'use client';

import { Button, SelectField } from '@tapestry/ui';
import type { DiscordRequirement } from '@tapestry/types';
import { useDiscordAccount } from './DiscordAccount.hooks';
import type { DiscordIntegrationProps } from './DiscordIntegration.types';
import styles from './DiscordIntegration.module.scss';

export default function DiscordRequirementSetting({ campaignId, isArchived }: DiscordIntegrationProps) {
  const { status, account, requirement, error } = useDiscordAccount(campaignId);
  if (status.isPending) return <p role="status">Loading Discord requirement…</p>;
  if (status.isError || !account) return <div role="alert"><p>Could not load the Discord requirement.</p><Button variant="outline" onClick={() => void status.refetch()}>Retry requirement</Button></div>;
  return <div className={styles.step}>
    <SelectField id="discord-account-requirement" label="Discord account requirement" value={account.requirement} disabled={!account.canManage || account.readOnly || isArchived || requirement.isPending} onChange={(event) => requirement.mutate(event.target.value as DiscordRequirement)}>
      <option value="optional">Optional</option><option value="required">Required</option>
    </SelectField>
    <p className={styles.help}>Required shows unlinked members a dismissible reminder and a persistent notice. Everyone can still play in Tapestry. Linking verifies identity, not Discord server membership.</p>
    {requirement.isSuccess && <p role="status" className={styles.success}>Discord requirement saved.</p>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </div>;
}
