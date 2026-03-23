import type { NodeEditorFormValue, NodeMediaGalleryDraft, NodeMediaEmbedDraft } from "../NodeEditorForm.types";
import { MEDIA_ITEM_KIND_OPTIONS, EMBED_KIND_OPTIONS } from "../NodeEditorForm.types";
import styles from "../NodeEditorForm.module.scss";

type MediaSectionProps = {
  media: NodeEditorFormValue["meta"]["media"];
  onUpdateMeta: <
    TSection extends keyof NodeEditorFormValue["meta"],
    TKey extends keyof NodeEditorFormValue["meta"][TSection],
  >(
    section: TSection,
    key: TKey,
    value: NodeEditorFormValue["meta"][TSection][TKey],
  ) => void;
  onAddGalleryItem: () => void;
  onUpdateGalleryItem: (itemId: string, patch: Partial<NodeMediaGalleryDraft>) => void;
  onRemoveGalleryItem: (itemId: string) => void;
  onAddEmbedItem: () => void;
  onUpdateEmbedItem: (itemId: string, patch: Partial<NodeMediaEmbedDraft>) => void;
  onRemoveEmbedItem: (itemId: string) => void;
};

export default function MediaSection({
  media,
  onUpdateMeta,
  onAddGalleryItem,
  onUpdateGalleryItem,
  onRemoveGalleryItem,
  onAddEmbedItem,
  onUpdateEmbedItem,
  onRemoveEmbedItem,
}: MediaSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Media</h3>
          <p className={styles.sectionCopy}>
            Portraits, banners, token art, gallery images, and video or audio embeds.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Portrait URL</span>
          <input
            className={styles.input}
            value={media.portraitUrl}
            onChange={(event) => onUpdateMeta("media", "portraitUrl", event.target.value)}
            placeholder="https://..."
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Banner URL</span>
          <input
            className={styles.input}
            value={media.bannerUrl}
            onChange={(event) => onUpdateMeta("media", "bannerUrl", event.target.value)}
            placeholder="https://..."
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Token URL</span>
          <input
            className={styles.input}
            value={media.tokenUrl}
            onChange={(event) => onUpdateMeta("media", "tokenUrl", event.target.value)}
            placeholder="https://..."
          />
        </label>
      </div>

      <div className={styles.stack}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.subsectionTitle}>Gallery</h4>
          <button type="button" className={styles.secondaryButton} onClick={onAddGalleryItem}>
            Add gallery item
          </button>
        </div>

        {media.gallery.length ? (
          media.gallery.map((item) => (
            <div key={item.id} className={styles.rowCard}>
              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.label}>URL</span>
                  <input
                    className={styles.input}
                    value={item.url}
                    onChange={(event) => onUpdateGalleryItem(item.id, { url: event.target.value })}
                    placeholder="https://..."
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Kind</span>
                  <select
                    className={styles.select}
                    value={item.kind}
                    onChange={(event) =>
                      onUpdateGalleryItem(item.id, {
                        kind: event.target.value as NodeMediaGalleryDraft["kind"],
                      })
                    }
                  >
                    {MEDIA_ITEM_KIND_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Title</span>
                  <input
                    className={styles.input}
                    value={item.title}
                    onChange={(event) => onUpdateGalleryItem(item.id, { title: event.target.value })}
                    placeholder="Shrine portrait"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Alt text</span>
                  <input
                    className={styles.input}
                    value={item.alt}
                    onChange={(event) => onUpdateGalleryItem(item.id, { alt: event.target.value })}
                    placeholder="Helpful image description"
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Caption</span>
                <textarea
                  className={styles.textareaShort}
                  value={item.caption}
                  onChange={(event) => onUpdateGalleryItem(item.id, { caption: event.target.value })}
                  placeholder="Optional caption or scene note"
                />
              </label>

              <div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} onClick={() => onRemoveGalleryItem(item.id)}>
                  Remove item
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.helper}>No gallery items yet.</p>
        )}
      </div>

      <div className={styles.stack}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.subsectionTitle}>Embeds</h4>
          <button type="button" className={styles.secondaryButton} onClick={onAddEmbedItem}>
            Add embed
          </button>
        </div>

        {media.embeds.length ? (
          media.embeds.map((item) => (
            <div key={item.id} className={styles.rowCard}>
              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.label}>URL</span>
                  <input
                    className={styles.input}
                    value={item.url}
                    onChange={(event) => onUpdateEmbedItem(item.id, { url: event.target.value })}
                    placeholder="https://..."
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Kind</span>
                  <select
                    className={styles.select}
                    value={item.kind}
                    onChange={(event) =>
                      onUpdateEmbedItem(item.id, {
                        kind: event.target.value as NodeMediaEmbedDraft["kind"],
                      })
                    }
                  >
                    {EMBED_KIND_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Title</span>
                  <input
                    className={styles.input}
                    value={item.title}
                    onChange={(event) => onUpdateEmbedItem(item.id, { title: event.target.value })}
                    placeholder="Mood reel"
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Caption</span>
                <textarea
                  className={styles.textareaShort}
                  value={item.caption}
                  onChange={(event) => onUpdateEmbedItem(item.id, { caption: event.target.value })}
                  placeholder="Optional context for the embed"
                />
              </label>

              <div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} onClick={() => onRemoveEmbedItem(item.id)}>
                  Remove embed
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.helper}>No embeds yet.</p>
        )}
      </div>
    </section>
  );
}
