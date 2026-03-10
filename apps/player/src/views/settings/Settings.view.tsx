"use client";

import { useMe } from "@/lib/auth-hooks";
import ProfileDetailsSection from "./ProfileDetailsSection.component";
import styles from "./AccountDetails.module.scss";
import PasswordSection from "./PasswordSection.component";

export default function Settings() {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return <div className={styles.page}>Loading settings…</div>;
  }

  if (!me) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.contentContainer}>
        <ProfileDetailsSection profileId={me.profileRefs?.player as string | null} />
        <PasswordSection userId={me._id} />
      </div>
    </div>
  );
}
