'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Loader } from '@tapestry/ui';
import type { PlayerWithAuth } from '@tapestry/types';
import { usePlayerDetail, usePlayerCharacters, usePlayerCampaigns, usePlayerAuth } from '@/lib/player-admin';
import styles from './PlayerDetailView.module.scss';

function formatDate(value?: string | Date) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type PlayerDetailViewProps = {
  playerId: string;
};

export default function PlayerDetailView({ playerId }: PlayerDetailViewProps) {
  const router = useRouter();

  const { data: playerData, isLoading: playerLoading, isError: playerError } = usePlayerDetail(playerId);
  const { data: charactersData } = usePlayerCharacters(playerId, {
    filterOptions: `player;${playerId}`,
  });
  const { data: campaignsData } = usePlayerCampaigns(playerId, {
    filterOptions: `members;{"$in":"${playerId}"}`,
  });
  const { data: authData } = usePlayerAuth(playerData?.payload?.user);

  const player = playerData?.payload;
  const characters = charactersData?.payload ?? [];
  const campaigns = campaignsData?.payload ?? [];

  if (playerLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <Loader caption="Loading player details..." />
        </div>
      </div>
    );
  }

  if (!player || playerError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <h2>Player not found</h2>
          <p>The player you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push('/players')}>Back to Players</Button>
        </div>
      </div>
    );
  }

  const displayName = player.displayName || player.auth?.email || 'Unknown';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Platform Admin</p>
          <h1 className={styles.title}>{displayName}</h1>
          <p className={styles.subtitle}>Player profile and associated resources</p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="outline" tone="neutral" onClick={() => router.push('/players')}>
            Back to List
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        <Card className={styles.profileCard}>
          <CardHeader>
            <h2>Player Profile</h2>
          </CardHeader>
          <CardBody>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Player ID</span>
                <code className={styles.value}>{player._id}</code>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Display Name</span>
                <span className={styles.value}>{player.displayName || '—'}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Bio</span>
                <span className={styles.value}>{player.bio || '—'}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Timezone</span>
                <span className={styles.value}>{player.timezone || '—'}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Roles</span>
                <div className={styles.roleList}>
                  {player.roles.map((role: string) => (
                    <span key={role} className={styles.roleBadge} data-role={role}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Created</span>
                <span className={styles.value}>{formatDate(player.createdAt)}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Updated</span>
                <span className={styles.value}>{formatDate(player.updatedAt)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {player.auth && (
          <Card className={styles.authCard}>
            <CardHeader>
              <h2>Account & Auth</h2>
            </CardHeader>
            <CardBody>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>User ID</span>
                  <code className={styles.value}>{player.auth._id}</code>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{player.auth.email}</span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.label}>Email Verified</span>
                  <span className={styles.value} data-verified={player.auth.isEmailVerified}>
                    {player.auth.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
                  </span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.label}>Account Status</span>
                  <span className={styles.statusBadge} data-active={player.auth.isActive}>
                    {player.auth.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.label}>Customer ID</span>
                  <code className={styles.value}>{player.auth.customerId}</code>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        <Card className={styles.resourcesCard}>
          <CardHeader>
            <h2>Characters ({characters.length})</h2>
          </CardHeader>
          <CardBody>
            {characters.length === 0 ? (
              <p className={styles.emptyMessage}>No characters created yet.</p>
            ) : (
              <ul className={styles.resourceList}>
                {characters.map((character: any) => (
                  <li key={character._id} className={styles.resourceItem}>
                    <span className={styles.resourceName}>{character.name || 'Unnamed'}</span>
                    <code className={styles.resourceId}>{character._id}</code>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card className={styles.resourcesCard}>
          <CardHeader>
            <h2>Campaigns ({campaigns.length})</h2>
          </CardHeader>
          <CardBody>
            {campaigns.length === 0 ? (
              <p className={styles.emptyMessage}>Not participating in any campaigns.</p>
            ) : (
              <ul className={styles.resourceList}>
                {campaigns.map((campaign: any) => (
                  <li key={campaign._id} className={styles.resourceItem}>
                    <span className={styles.resourceName}>{campaign.name || 'Unnamed Campaign'}</span>
                    <code className={styles.resourceId}>{campaign._id}</code>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
