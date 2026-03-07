"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal, Button, Select, TextField } from "@tapestry/ui";
import { api } from "@/lib/api";
import { buildFilterString, getItems, getSettings } from "@tapestry/api-client";
import type { CharacterSheet, ItemDefinition, SettingDefinition } from "@tapestry/types";
import styles from "./ContentLibraryModal.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onAddItem: (item: ItemDefinition, settingKey: string) => void;
};

export function ContentLibraryModal({ open, onClose, sheet, onAddItem }: Props) {
  const [selectedSettingKey, setSelectedSettingKey] = useState(sheet.settingKey ?? "");
  const [search, setSearch] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["content:settings"],
    queryFn: () =>
      getSettings(api, {
        pageLimit: 50,
        sortOptions: "name",
      }),
  });

  const settings = settingsQuery.data?.payload ?? [];

  useEffect(() => {
    if (sheet.settingKey) {
      setSelectedSettingKey(sheet.settingKey);
      return;
    }

    if (!selectedSettingKey && settings.length > 0) {
      setSelectedSettingKey(settings[0].key);
    }
  }, [sheet.settingKey, selectedSettingKey, settings]);

  const effectiveSettingKey = sheet.settingKey || selectedSettingKey || settings[0]?.key || "";

  const itemsQuery = useQuery({
    queryKey: ["content:items", effectiveSettingKey],
    enabled: open && !!effectiveSettingKey,
    queryFn: () =>
      getItems(api, {
        filterOptions: buildFilterString({
          settingKeys: [effectiveSettingKey],
          status: "published",
        }),
        sortOptions: "category;name",
        pageLimit: 100,
      }),
  });

  const items = itemsQuery.data?.payload ?? [];

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const haystack = [item.name, item.key, item.category, item.notes ?? "", ...(item.tags ?? [])]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, search]);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Add from Content Library" width={760} destroyOnClose>
      <div className={styles.root}>
        <div className={styles.controls}>
          <div>
            <label className={styles.label}>Setting</label>
            <Select
              value={effectiveSettingKey}
              onChange={(e) => setSelectedSettingKey(e.target.value)}
              disabled={!!sheet.settingKey || settingsQuery.isLoading}
            >
              {settings.map((setting: SettingDefinition) => (
                <option key={setting.key} value={setting.key}>
                  {setting.name}
                </option>
              ))}
            </Select>
          </div>

          <TextField
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Shortsword, potion, armor..."
          />
        </div>

        {itemsQuery.isLoading ? (
          <div className={styles.empty}>Loading items...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.empty}>No items matched your search.</div>
        ) : (
          <div className={styles.list}>
            {filteredItems.map((item) => (
              <div key={item._id} className={styles.row}>
                <div className={styles.meta}>
                  <div className={styles.titleRow}>
                    <strong>{item.name}</strong>
                    <span className={styles.badge}>{item.category}</span>
                  </div>

                  {/* <div className={styles.subtle}>{item.key}</div> */}

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

                <Button onClick={() => onAddItem(item, effectiveSettingKey)}>Add</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
