'use client';

import { useState } from 'react';
import { Button, Card, CardBody, CardHeader } from '@tapestry/ui';
import type { CharacterSheet } from '@tapestry/types';
import { downloadSheetJson } from './sheetToJson';
import { downloadSheetMarkdown } from './sheetToMarkdown';
import styles from './ExportTab.module.scss';

type Props = {
  sheet: CharacterSheet | undefined;
};

type DownloadState = 'idle' | 'done';

export function ExportTab({ sheet }: Props) {
  const [jsonState, setJsonState] = useState<DownloadState>('idle');
  const [mdState, setMdState] = useState<DownloadState>('idle');

  function handleDownloadJson() {
    if (!sheet) return;
    downloadSheetJson(sheet);
    setJsonState('done');
    setTimeout(() => setJsonState('idle'), 2000);
  }

  function handleDownloadMarkdown() {
    if (!sheet) return;
    downloadSheetMarkdown(sheet);
    setMdState('done');
    setTimeout(() => setMdState('idle'), 2000);
  }

  return (
    <div className={styles.grid}>
      <div className={styles.sectionLabel}>Export Character Sheet</div>

      {/* JSON */}
      <Card inlay>
        <CardBody className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span className={styles.cardIcon}>{}</span>
              JSON — Full Data Export
            </div>
            <div className={styles.cardHint}>Downloads your complete character sheet as a structured JSON file. Useful for backups or importing into other tools.</div>
          </CardHeader>
          <div className={styles.cardAction}>
            <Button tone="purple" variant="outline" size="sm" onClick={handleDownloadJson} disabled={!sheet}>
              Download JSON
            </Button>
            {jsonState === 'done' && <span className={styles.feedbackLabel}>Downloaded!</span>}
          </div>
        </CardBody>
      </Card>

      {/* Markdown */}
      <Card inlay>
        <CardBody className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span className={styles.cardIcon}>✦</span>
              Markdown — AI &amp; Readable Export
            </div>
            <div className={styles.cardHint}>
              Exports your sheet as a clean Markdown file. Great for sharing with an AI assistant, pasting into notes, or reading outside the app.
            </div>
          </CardHeader>
          <div className={styles.cardAction}>
            <Button tone="purple" variant="outline" size="sm" onClick={handleDownloadMarkdown} disabled={!sheet}>
              Download Markdown
            </Button>
            {mdState === 'done' && <span className={styles.feedbackLabel}>Downloaded!</span>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
