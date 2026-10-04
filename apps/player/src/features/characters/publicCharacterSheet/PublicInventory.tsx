import type { InventoryItem } from '@tapestry/types';
import { Tabs } from '@tapestry/ui';
import { PublicSheetSection } from './PublicSheetSection';
import { displayKey, score } from './public-character';
import styles from './PublicInventory.module.scss';

function InventoryRow({ item }: { item: InventoryItem }) {
  const name = item.overrides?.displayName || item.name || displayKey(item.definition?.itemKey || item.itemKey || 'Unnamed item');
  const protection = item.overrides?.protection ?? item.protection;
  const harm = item.overrides?.harm;
  const tags = item.overrides?.tags ?? item.tags;
  const metadata = [item.category ? displayKey(item.category) : '', item.slot ? displayKey(item.slot) : ''].filter(Boolean).join(' · ');

  return (
    <li className={styles.item}>
      <div className={styles.summary}>
        <div className={styles.identity}>
          <h4>{name}</h4>
          {metadata && <p className={styles.meta}>{metadata}</p>}
        </div>
        {(harm != null || protection != null) && <dl className={styles.mechanics}>
          {harm != null && <div><dt>Harm</dt><dd>{harm}</dd></div>}
          {protection != null && <div><dt>Protection</dt><dd>{protection}</dd></div>}
        </dl>}
        <dl className={styles.quantity}><div><dt>Qty</dt><dd>{item.qty}</dd></div></dl>
      </div>
      {(!!item.attackProfiles?.length || item.notes || !!tags?.length) && <div className={styles.details}>
        {!!item.attackProfiles?.length && <ul className={styles.attacks}>{item.attackProfiles.map((attack) => (
          <li key={attack.key}>
            <strong>{attack.name}</strong>{attack.harm != null && <> · Harm {attack.harm}</>}{attack.modifier != null && <> · Modifier {score(attack.modifier)}</>}{attack.rangeLabel && <> · {attack.rangeLabel}</>}
            {attack.notes && <p className={styles.prose}>{attack.notes}</p>}
          </li>
        ))}</ul>}
        {item.notes && <p className={styles.prose}>{item.notes}</p>}
        {!!tags?.length && <p className={styles.meta}>Tags: {tags.join(', ')}</p>}
      </div>}
    </li>
  );
}

function InventoryGroup({ title, items }: { title: 'Equipped' | 'Backpack'; items: InventoryItem[] }) {
  return (
    <div className={styles.scrollRegion} role="region" aria-label={`${title} items`} tabIndex={0}>
      {items.length ? <ul className={styles.items}>{items.map((item, index) => <InventoryRow key={item.instanceId ?? index} item={item} />)}</ul> : <p className={styles.empty}>{title === 'Equipped' ? 'No equipped items recorded.' : 'No backpack items recorded.'}</p>}
    </div>
  );
}

export function PublicInventory({ inventory }: { inventory: InventoryItem[] }) {
  const equipped = inventory.filter((item) => item.equipped === true);
  const backpack = inventory.filter((item) => item.equipped !== true);
  return (
    <PublicSheetSection id="inventory" title="Inventory">
      <Tabs
        items={[
          { key: 'public-equipped', label: `Equipped (${equipped.length})`, children: <InventoryGroup title="Equipped" items={equipped} /> },
          { key: 'public-backpack', label: `Backpack (${backpack.length})`, children: <InventoryGroup title="Backpack" items={backpack} /> },
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
