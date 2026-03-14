"use client";

import { useMemo, useState } from "react";
import { Button, Modal } from "@tapestry/ui";
import { useMe } from "@/lib/auth-hooks";
import { useUpdateUserAccount } from "@/lib/settings-hooks";
import { useLegalPolicies } from "@/lib/policy-hooks";
import styles from "./PolicyGate.module.scss";

type PolicyGateProps = {
  requiredPolicies: string[];
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  onAccepted?: () => void;
};

export default function PolicyGate({
  requiredPolicies,
  title = "Policy updates required",
  description,
  children,
  onAccepted,
}: PolicyGateProps) {
  const { data: me } = useMe();
  const { data: policies } = useLegalPolicies();
  const updateUser = useUpdateUserAccount(me?._id);

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const requiredMap = useMemo(() => {
    const map: Record<string, { version: number; title: string; effective_date?: string }> = {};

    for (const policy of policies ?? []) {
      if (requiredPolicies.includes(policy.type)) {
        map[policy.type] = {
          version: policy.version,
          title: policy.title,
          effective_date: policy.effective_date,
        };
      }
    }

    return map;
  }, [policies, requiredPolicies]);

  const needed = useMemo(() => {
    if (!me) return [];

    return requiredPolicies.filter((type) => {
      const required = requiredMap[type];
      const accepted = me.acceptedPolicies?.[type];

      return required && (!accepted || accepted < required.version);
    });
  }, [me, requiredPolicies, requiredMap]);

  const allChecked = needed.length > 0 && needed.every((type) => checked[type]);

  async function handleAccept() {
    if (!me) return;

    const nextAcceptedPolicies = { ...(me.acceptedPolicies ?? {}) };

    for (const type of needed) {
      nextAcceptedPolicies[type] = requiredMap[type].version;
    }

    await updateUser.mutateAsync({
      acceptedPolicies: nextAcceptedPolicies,
    } as any);

    setChecked({});
    onAccepted?.();
  }

  return (
    <>
      {children}

      <Modal open={needed.length > 0} onCancel={() => {}} closable={false} footer={null}>
        <div className={styles.content}>
          <h2>{title}</h2>

          <p>{description ?? "You need to read and accept the latest policy versions before continuing."}</p>

          <div className={styles.list}>
            {needed.map((type) => {
              const policy = requiredMap[type];

              return (
                <label key={type} className={styles.row}>
                  <input
                    type="checkbox"
                    checked={!!checked[type]}
                    onChange={(e) =>
                      setChecked((prev) => ({
                        ...prev,
                        [type]: e.target.checked,
                      }))
                    }
                  />

                  <div className={styles.meta}>
                    <div className={styles.info}>
                      <div>
                        <div className={styles.name}>{policy?.title ?? type}</div>
                        {policy?.effective_date ? (
                          <div className={styles.date}>
                            Effective: {new Date(policy.effective_date).toLocaleDateString()}
                          </div>
                        ) : null}
                        <div className={styles.version}>v{policy?.version ?? "0.0"}</div>
                      </div>
                      <a href={`/legal/${type}`} target="_blank" rel="noreferrer" className={styles.readButton}>
                        Read
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <Button onClick={handleAccept} disabled={!allChecked || updateUser.isPending}>
            {updateUser.isPending ? "Accepting…" : "Accept and continue"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
