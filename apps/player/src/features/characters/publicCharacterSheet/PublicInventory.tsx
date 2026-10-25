import type { InventoryItem } from '@tapestry/types';
import { Tabs } from '@tapestry/ui';
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
      <Tabs
        items={[
          {
            key: 'public-equipped', label: `Equipped (${equipped.length})`, children: (
              <div className={styles.scrollRegion} role="region" aria-label="Equipped items" tabIndex={0}>
                <EquippedSection equippedItems={equipped} characterSex={characterSex} readOnly />
              </div>
            ),
          },
          { key: 'public-backpack', label: `Backpack (${backpack.length})`, children: <Backpack items={backpack} /> },
        ]}
        defaultActiveKey={equipped.length || !backpack.length ? 'public-equipped' : 'public-backpack'}
        variant="underline"
        fit="content"
        keepMounted={false}
        ariaLabel="Inventory groups"
        tabListClassName={styles.tabList}
        tabClassName={styles.tab}
        activeTabClassName={styles.activeTab}
        contentClassName={styles.tabContent}
      />
    </PublicSheetSection>
  );
}
