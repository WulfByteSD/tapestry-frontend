"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; 
import Link from "next/link";

import { api } from "@/lib/api";
import styles from "./SkillsView.module.scss";
import { StudioSettingSummary } from "@/features/content/_hooks/useContentStudio";

type SkillsViewProps = {
  selectedSetting: StudioSettingSummary | null;
};

export default function SkillsView({ selectedSetting }: SkillsViewProps) {
  const router = useRouter();

  // TODO: Update with actual skills API endpoint when available
  const skillsQuery = useQuery({
    queryKey: ["skills", "by-setting", selectedSetting?.key],
    queryFn: async () => {
      if (!selectedSetting) return [];
      // Placeholder - replace with actual API call
      // return api.storyweaver.skills.getBySetting(selectedSetting.key);
      return [];
    },
    enabled: Boolean(selectedSetting?.key),
  });

  const skills = skillsQuery.data ?? [];
  const createHref = selectedSetting
    ? `/skills/new?settingKey=${encodeURIComponent(selectedSetting.key)}`
    : "/skills/new";

  return (
    <div className={styles.view}>
      <header className={styles.viewHeader}>
        <div className={styles.viewTitleWrap}>
          <p className={styles.viewEyebrow}>Skills browser</p>
          <h2 className={styles.viewTitle}>Skills in this setting</h2>
          <p className={styles.viewCopy}>
            Read-only list of skills belonging to {selectedSetting?.name ?? "this setting"}. Use Edit or Create buttons
            to manage skills in dedicated routes.
          </p>
        </div>

        <div className={styles.viewActions}>
          <Link href={createHref} className={styles.actionButton}>
            Create skill
          </Link>
        </div>
      </header>

      <div className={styles.viewContent}>
        {skillsQuery.isError ? (
          <div className={styles.notice}>Failed to load skills. Check auth and API connectivity.</div>
        ) : skillsQuery.isLoading ? (
          <div className={styles.notice}>Loading skills…</div>
        ) : skills.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No skills yet</h3>
            <p className={styles.emptyCopy}>Create your first skill for this setting using the button above.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {skills.map((skill: any) => (
              <div key={skill._id || skill.key} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{skill.name}</span>
                  <span className={styles.itemMeta}>
                    {skill.category ?? "Skill"} · {skill.difficulty ?? "Standard"}
                  </span>
                </div>
                <div className={styles.itemActions}>
                  <Link href={`/skills/${skill._id || skill.key}`} className={styles.linkButton}>
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
