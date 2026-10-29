import type { InventoryItem } from '@tapestry/types';
import { EquippedSection } from '../characterSheetScreen/tabs/inventory/EquippedSection';
import { InventoryItemCard } from '../characterSheetScreen/tabs/inventory/InventoryItemCard';
import { PublicSheetSection } from './PublicSheetSection';
import styles from './PublicInventory.module.scss';

function Backpack({ items }: { items: InventoryItem[] }) {
  return (
    <div className={styles.scrollRegion} role="region" aria-label="Backpack items" tabIndex={0}>
      {items.length ? <div className={styles.items}>{items.map((item, index) => <InventoryItemCard key={item.instanceId ?? index} item={item} readOnly />)}</div> : <p className={styles.empty}>No backpack items recorded.</p>}
    </div>
  );
}

export function PublicInventory({ inventory, characterSex }: { inventory: InventoryItem[]; characterSex?: string }) {
  const equipped = inventory.filter((item) => item.equipped === true);
  const backpack = inventory.filter((item) => item.equipped !== true);
  return (
    <PublicSheetSection id="inventory" title="Inventory">
      {/* Both groups start visible and can be collapsed without JavaScript. */}
      <details open className={styles.tabContent}>
        <summary>Equipped ({equipped.length})</summary>
        <div className={styles.scrollRegion} role="region" aria-label="Equipped items" tabIndex={0}>
          <EquippedSection equippedItems={equipped} characterSex={characterSex} readOnly />
        </div>
      </details>
      <details open className={styles.tabContent}>
        <summary>Backpack ({backpack.length})</summary>
        <Backpack items={backpack} />
      </details>
    </PublicSheetSection>
  );
}
