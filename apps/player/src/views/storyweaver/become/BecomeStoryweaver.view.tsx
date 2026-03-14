"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, FormField, Switcher, useForm } from "@tapestry/ui";
import { useLegalPolicies } from "@/lib/policy-hooks";
import { useBecomeStoryweaver } from "@/lib/storyweaver-hooks";
import styles from "./BecomeStoryweaver.module.scss";

type BecomeStoryweaverFormValues = {
  acceptContentLicense: boolean;
  acceptStoryweaverPolicy: boolean;
  officialLoreOptIn: boolean;
};

export default function BecomeStoryweaverView() {
  const router = useRouter();
  const { data: policies } = useLegalPolicies();
  const become = useBecomeStoryweaver();

  const form = useForm<BecomeStoryweaverFormValues>({
    initialValues: {
      acceptContentLicense: false,
      acceptStoryweaverPolicy: false,
      officialLoreOptIn: false,
    },
    onSubmit: async (values) => {
      await become.mutateAsync({
        officialLoreOptIn: values.officialLoreOptIn,
      });

      router.push("/storyweaver/campaigns");
    },
  });

  const docs = useMemo(() => {
    const byType = new Map((policies ?? []).map((p) => [p.type, p]));
    return {
      contentLicense: byType.get("content-license"),
      storyweaverPolicy: byType.get("storyweaver-policy"),
    };
  }, [policies]);

  const canSubmit = form.values.acceptContentLicense && form.values.acceptStoryweaverPolicy && !become.isPending;

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

        <Form form={form}>
          <div className={styles.policyList}>
            <FormField name="acceptContentLicense">
              {(field) => (
                <div className={styles.checkboxRow}>
                  <Switcher
                    checked={field.value as boolean}
                    onChange={field.onChange}
                    disabled={become.isPending}
                    id={field.id}
                  />
                  <label htmlFor={field.id}>
                    I have read and agree to the{" "}
                    <Link href="/legal/content-license" target="_blank">
                      {docs.contentLicense?.title || "Content License Policy"}
                    </Link>
                    .
                  </label>
                </div>
              )}
            </FormField>

            <FormField name="acceptStoryweaverPolicy">
              {(field) => (
                <div className={styles.checkboxRow}>
                  <Switcher
                    checked={field.value as boolean}
                    onChange={field.onChange}
                    disabled={become.isPending}
                    id={field.id}
                  />
                  <label htmlFor={field.id}>
                    I have read and agree to the{" "}
                    <Link href="/legal/storyweaver-policy" target="_blank">
                      {docs.storyweaverPolicy?.title || "Storyweaver Policy"}
                    </Link>
                    .
                  </label>
                </div>
              )}
            </FormField>

            <FormField name="officialLoreOptIn">
              {(field) => (
                <div className={styles.checkboxRow}>
                  <Switcher
                    checked={field.value as boolean}
                    onChange={field.onChange}
                    disabled={become.isPending}
                    id={field.id}
                  />
                  <label htmlFor={field.id}>
                    I grant Tapestry permission to incorporate my custom content into official lore, canon, or published
                    materials without requiring further approval. According to the{" "}
                    <Link href="/legal/storyweaver-license" target="_blank">
                      Storyweaver License
                    </Link>
                    , (If unchecked, Tapestry will contact me first for permission.)
                  </label>
                </div>
              )}
            </FormField>
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/settings")}
              disabled={become.isPending}
            >
              Not right now
            </Button>

            <Button type="submit" disabled={!canSubmit}>
              {become.isPending ? "Enabling…" : "Become a Storyweaver"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
