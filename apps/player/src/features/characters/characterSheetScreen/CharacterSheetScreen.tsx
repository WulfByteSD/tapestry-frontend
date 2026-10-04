'use client';

import { useRouter } from 'next/navigation';
import { Button, Tabs } from '@tapestry/ui';
import { CharacterHeader } from './CharacterHeader.component';
import { CharacterResources } from './CharacterResources.component';
import { CharacterAspects } from './CharacterAspects.component';
import { CharacterPlayModals } from './CharacterPlayModals.component';
import { CharacterSheetState } from './CharacterSheetState.component';
import { CharacterDetailsModal } from './CharacterDetails.modal';
import { useCharacterSheet } from './CharacterSheet.hooks';
import { useCharacterPlay } from './CharacterPlay.hooks';
import { getSheetError } from './CharacterSheet.helpers';
import { createTabs } from './tabs';
import type { CharacterSheetScreenProps, TabKey } from './CharacterSheet.types';
import styles from './CharacterSheet.module.scss';

export default function CharacterSheetScreen(props: CharacterSheetScreenProps) {
  const router = useRouter();
  const state = useCharacterSheet(props);
  const play = useCharacterPlay();
  const sheet = state.query.data?.payload;
  const onBack = () => router.replace('/');

  if (state.query.isLoading) return <CharacterSheetState loading onBack={onBack} onRetry={() => void state.query.refetch()} />;
  if (state.query.isError || !sheet) return <CharacterSheetState message={getSheetError(state.query.error)} onBack={onBack} onRetry={() => void state.query.refetch()} />;

  const tabs = createTabs({ sheet, mode: state.currentMode, onSaveNotes: state.saveNotes, onAction: play.openAction, onNavigate: state.setActiveTab });

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Character navigation">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← My characters
        </Button>
        <span>Character sheet</span>
      </nav>
      <CharacterHeader sheet={sheet} mode={state.currentMode} onModeChange={state.setCurrentMode} onDetails={() => state.setDetailsOpen(true)} />
      <CharacterResources sheet={sheet} onAction={play.openAction} onNavigate={state.setActiveTab} />
      <div className={styles.playLayout}>
        <CharacterAspects sheet={sheet} mode={state.currentMode} onApproach={play.openApproach} />
        <div className={styles.workspace}>
          <Tabs
            items={tabs}
            activeKey={state.activeTab}
            onChange={(key) => state.setActiveTab(key as TabKey)}
            variant="underline"
            fit="content"
            keepMounted={false}
            ariaLabel="Character sheet sections"
            className={styles.tabs}
            tabListClassName={styles.tabList}
            tabClassName={styles.tab}
            activeTabClassName={styles.tabActive}
            contentClassName={styles.tabContent}
          />
        </div>
      </div>
      <CharacterDetailsModal open={state.detailsOpen} sheet={sheet} onClose={() => state.setDetailsOpen(false)} onSave={state.saveDetails} isSaving={state.update.isPending} />
      <CharacterPlayModals sheet={sheet} action={play.action} aspect={play.aspect} onClose={play.close} />
      {state.update.isError && (
        <p className={styles.errorText} role="alert">
          Your changes could not be saved. Try again.
        </p>
      )}
    </div>
  );
}
