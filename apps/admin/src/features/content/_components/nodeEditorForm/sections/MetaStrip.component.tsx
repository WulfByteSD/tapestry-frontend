import styles from "../NodeEditorForm.module.scss";

type MetaStripProps = {
  settingKey: string;
  parentName: string | null;
  mode: string;
};

export default function MetaStrip({ settingKey, parentName, mode }: MetaStripProps) {
  return (
    <div className={styles.metaStrip}>
      <div className={styles.metaCard}>
        <span className={styles.metaLabel}>Setting</span>
        <strong className={styles.metaValue}>{settingKey}</strong>
      </div>

      <div className={styles.metaCard}>
        <span className={styles.metaLabel}>Parent</span>
        <strong className={styles.metaValue}>{parentName ?? "Root"}</strong>
      </div>

      <div className={styles.metaCard}>
        <span className={styles.metaLabel}>Mode</span>
        <strong className={styles.metaValue}>{mode}</strong>
      </div>
    </div>
  );
}
