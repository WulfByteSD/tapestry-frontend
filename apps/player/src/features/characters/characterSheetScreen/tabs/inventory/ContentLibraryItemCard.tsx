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
          <Image src={item.imageUrl ?? getCategoryIconUrl(item.category)} alt={item.name} fill style={{ objectFit: 'contain' }} unoptimized />
        </div>

        <div className={styles.cardMeta}>
          {/* Title row: name + category + slot badges */}
          <div className={styles.cardTitleRow}>
            <strong className={styles.cardName}>{item.name}</strong>
            <span className={styles.badge}>{item.category}</span>
            {item.slot && <span className={styles.slotBadge}>{item.slot}</span>}
            {item.equippable && !item.slot && <span className={styles.slotBadge}>equippable</span>}
          </div>

          {/* Stat pills */}
          {hasStats && (
            <div className={styles.cardStats}>
              {typeof item.protection === 'number' && item.protection > 0 && <span className={styles.statPillProtection}>DEF {item.protection}</span>}
              {primaryHarm !== null && <span className={styles.statPillHarm}>HARM {primaryHarm}</span>}
            </div>
          )}

          {/* Notes preview */}
          {item.notes && <p className={styles.cardNotes}>{item.notes}</p>}

          {/* Tags */}
          {!!item.tags?.length && (
            <div className={styles.tags}>
              {item.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.cardAction}>
          <Button size="sm" variant="ghost" onClick={() => setPreviewItem(item)}>
            Preview
          </Button>
          <Button size="sm" onClick={onAdd}>
            Add
          </Button>
        </div>
      </div>

      <ContentLibraryItemPreview item={previewItem} onClose={() => setPreviewItem(null)} />
    </>
  );
}
