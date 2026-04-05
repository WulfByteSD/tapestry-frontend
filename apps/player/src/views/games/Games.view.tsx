'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CampaignCard from '@/components/campaignCard';
import styles from './Games.module.scss';
import { useCampaigns } from '@/lib/campaign-hooks';
import { useSettings } from '@tapestry/hooks';
import { api } from '@/lib/api';
import { CampaignType } from '@tapestry/types';

export default function GamesView() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [settingFilter, setSettingFilter] = useState('all');

  // Build server-side filter parameters
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      // Add public/discoverable filter when API supports it
      // filterOptions: 'discoverable;true',
    };

    // Server-side keyword search
    if (search.trim()) {
      params.keyword = search.trim();
    }

    // Server-side setting filter
    if (settingFilter !== 'all') {
      params.filterOptions = `settingKey;${settingFilter}`;
    }
    // always add to filter exclude campaigns that are not discoverable, and not published
    params.filterOptions = params.filterOptions ? `${params.filterOptions}|discoverable;true|status;active` : 'discoverable;true|status;active';
    return params;
  }, [search, settingFilter]);

  const { data, isLoading, isError } = useCampaigns(queryParams);

  const games = (data?.payload ?? []) as CampaignType[];

  // Fetch published settings for the filter dropdown
  const { data: settingsData } = useSettings(api, {
    filterOptions: 'status;published',
    sortOptions: 'name',
    pageLimit: 100,
  });

  const settingOptions = useMemo(() => {
    const settings = settingsData?.payload ?? [];
    return ['all', ...settings.map((s) => s.key)];
  }, [settingsData]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Games</p>
        <h1 className={styles.title}>Discover campaigns</h1>
        <p className={styles.subtitle}>Browse active tables, peek at their tone, and find a game worth ruining your sleep schedule for.</p>
      </section>

      <section className={styles.controls}>
        <label className={styles.searchWrap}>
          <span className={styles.controlLabel}>Search</span>
          <input
            className={styles.searchInput}
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, tone, setting, or Storyweaver"
          />
        </label>

        <label className={styles.filterWrap}>
          <span className={styles.controlLabel}>Setting</span>
          <select className={styles.select} value={settingFilter} onChange={(event) => setSettingFilter(event.target.value)}>
            {settingOptions.map((setting) => (
              <option key={setting} value={setting}>
                {setting === 'all' ? 'All settings' : setting}
              </option>
            ))}
          </select>
        </label>
      </section>

      {isLoading ? (
        <div className={styles.stateCard}>
          <h2>Loading games...</h2>
          <p>Pulling threads and seeing what tables are alive.</p>
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className={styles.stateCard}>
          <h2>Couldn't load games</h2>
          <p>There was an issue fetching discoverable campaigns. Please try again later.</p>
        </div>
      ) : null}

      {!isLoading && games.length === 0 ? (
        <div className={styles.stateCard}>
          <h2>No games found</h2>
          <p>Try a different search or setting filter.</p>
        </div>
      ) : null}

      {!isLoading && games.length > 0 ? (
        <section className={styles.grid}>
          {games.map((game) => {
            // TODO: API should populate these fields for the public discovery endpoint
            // For now, extract what we can from the campaign structure
            const storyweaverName = undefined; // TODO: populate from owner.displayName
            const joinPolicy = undefined; // TODO: add joinPolicy to CampaignType
            const maxPlayers = undefined; // TODO: add maxPlayers to CampaignType

            return (
              <CampaignCard
                key={game._id}
                campaign={game}
                storyweaverName={storyweaverName}
                joinPolicy={joinPolicy}
                maxPlayers={maxPlayers}
                eyebrow="Public Game"
                actionLabel="View Game"
                onClick={() => router.push(`/games/${game._id}`)}
              />
            );
          })}
        </section>
      ) : null}
    </div>
  );
}
