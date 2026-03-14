"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tapestry/ui";
import { useLegalPolicies } from "@/lib/policy-hooks";
import { useBecomeStoryweaver } from "@/lib/storyweaver-hooks";
import styles from "./BecomeStoryweaver.module.scss";

export default function BecomeStoryweaverView() {
  const router = useRouter();
  const { data: policies } = useLegalPolicies();
  const become = useBecomeStoryweaver();

  const [acceptContentLicense, setAcceptContentLicense] = useState(false);
  const [acceptStoryweaverPolicy, setAcceptStoryweaverPolicy] = useState(false);
  const [officialLoreOptIn, setOfficialLoreOptIn] = useState(false);

  const docs = useMemo(() => {
    const byType = new Map((policies ?? []).map((p) => [p.type, p]));
    return {
      contentLicense: byType.get("content-license"),
      storyweaverPolicy: byType.get("storyweaver-policy"),
    };
  }, [policies]);

  const canSubmit = acceptContentLicense && acceptStoryweaverPolicy;

  async function handleSubmit() {
    await become.mutateAsync({
      officialLoreOptIn,
    });

    router.push("/storyweaver/campaigns");
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Become a Storyweaver</h1>

        <p className={styles.lead}>
          Storyweavers can create campaigns, manage tables, and build custom content for their own worlds and stories.
        </p>

        <div className={styles.callout}>
          <strong>Before you continue:</strong>
          <p>
            Custom content you create remains yours, but Tapestry needs a platform-use license to host, display, and
            operate that content inside your campaigns. Storyweaver tools are also subject to the Storyweaver policy.
          </p>
        </div>

        <div className={styles.policyList}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={acceptContentLicense}
              onChange={(e) => setAcceptContentLicense(e.target.checked)}
            />
            <span>
              I have read and agree to the{" "}
              <Link href="/legal/content-license" target="_blank">
                {docs.contentLicense?.title || "Content License Policy"}
              </Link>
              .
            </span>
          </label>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={acceptStoryweaverPolicy}
              onChange={(e) => setAcceptStoryweaverPolicy(e.target.checked)}
            />
            <span>
              I have read and agree to the{" "}
              <Link href="/legal/storyweaver-policy" target="_blank">
                {docs.storyweaverPolicy?.title || "Storyweaver Policy"}
              </Link>
              .
            </span>
          </label>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={officialLoreOptIn}
              onChange={(e) => setOfficialLoreOptIn(e.target.checked)}
            />
            <span>I’m open to Tapestry contacting me about official lore consideration for standout content.</span>
          </label>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={() => router.push("/settings")} disabled={become.isPending}>
            Not right now
          </Button>

          <Button type="button" onClick={handleSubmit} disabled={!canSubmit || become.isPending}>
            {become.isPending ? "Enabling…" : "Become a Storyweaver"}
          </Button>
        </div>
      </div>
    </div>
  );
}
