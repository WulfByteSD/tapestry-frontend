"use client";

import styles from "./ContentList.module.scss";

export type ContentListItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  description?: string;
};

type ContentListProps = {
  title: string;
  copy?: string;
  items: ContentListItem[];
  selectedId?: string | null;
  onSelect?: (item: ContentListItem) => void;
  emptyTitle?: string;
  emptyCopy?: string;
};

export default function ContentList({
  title,
  copy,
  items,
  selectedId,
  onSelect,
  emptyTitle = "Nothing here yet",
  emptyCopy = "This lane is scaffolded, but no data has been wired into it yet.",
}: ContentListProps) {
  return (
    <section className={styles.listShell}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {copy ? <p className={styles.copy}>{copy}</p> : null}
      </div>

      {!items.length ? (
        <div className={styles.empty}>
          <strong className={styles.emptyTitle}>{emptyTitle}</strong>
          <p className={styles.emptyCopy}>{emptyCopy}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => {
            const isSelected = selectedId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.item} ${isSelected ? styles.itemSelected : ""}`}
                onClick={() => onSelect?.(item)}
              >
                <div className={styles.itemHeader}>
                  <strong className={styles.itemTitle}>{item.title}</strong>
                  {item.meta ? <span className={styles.itemMeta}>{item.meta}</span> : null}
                </div>

                {item.subtitle ? <span className={styles.itemSubtitle}>{item.subtitle}</span> : null}

                {item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
