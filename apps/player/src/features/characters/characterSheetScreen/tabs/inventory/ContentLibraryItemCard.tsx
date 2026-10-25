'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@tapestry/ui';
import type { ItemDefinition } from '@tapestry/types';
import { ContentLibraryItemPreview } from './ContentLibraryItemPreview';
import { getCategoryIconUrl } from './inventoryIcons';
import styles from './ContentLibraryModal.module.scss';

type Props = {
  item: ItemDefinition;
  onAdd: () => void;
};

function getPrimaryHarm(item: ItemDefinition): number | null {
  const harm = item.attackProfiles?.[0]?.harm;
  return typeof harm === 'number' ? harm : null;
}

export function ContentLibraryItemCard({ item, onAdd }: Props) {
  const [previewItem, setPreviewItem] = useState<ItemDefinition | null>(null);
  const primaryHarm = getPrimaryHarm(item);
  const hasStats = (typeof item.protection === 'number' && item.protection > 0) || primaryHarm !== null;

  return (
    <>
      <div className={styles.itemCard}>
        <div className={styles.cardThumb}>
          <Image src={item.imageUrl ?? getCategoryIconUrl(item.category)} alt="" fill style={{ objectFit: 'contain' }} unoptimized />
        </div>

        <div className={styles.cardMeta}>
          <div className={styles.cardTitleRow}>
            <strong className={styles.cardName}>{item.name}</strong>
          </div>
          <div className={styles.cardMetaLine}>
            <span className={styles.badge}>{item.category}</span>
            {item.slot && <span className={styles.slotBadge}>{['body', 'chest', 'torso'].includes(item.slot.toLowerCase()) ? 'Torso' : item.slot.replaceAll('_', ' ')}</span>}
            {item.equippable && !item.slot && <span className={styles.slotBadge}>equippable</span>}
          </div>

          {hasStats && (
            <div className={styles.cardStats}>
              {typeof item.protection === 'number' && item.protection > 0 && <span className={styles.statPillProtection}>Protection {item.protection}</span>}
              {primaryHarm !== null && <span className={styles.statPillHarm}>Harm {primaryHarm}</span>}
            </div>
          )}

          {item.notes && <p className={styles.cardNotes}>{item.notes}</p>}

          {!!item.tags?.length && (
            <div className={styles.tags}>
              {item.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <Button className={styles.previewAction} size="sm" variant="ghost" onClick={() => setPreviewItem(item)}>
            Preview
          </Button>
        </div>

        <div className={styles.cardAction}>
          <Button onClick={onAdd}>
            Add
          </Button>
        </div>
      </div>

      <ContentLibraryItemPreview item={previewItem} onClose={() => setPreviewItem(null)} />
    </>
  );
}
