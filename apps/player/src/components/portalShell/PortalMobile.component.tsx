"use client";

import PortalHeader from "@/components/portalHeader/PortalHeader.component";
import BottomNav from "@/components/bottomNav/BottomNav.component";
import styles from "./PortalMobile.module.scss";

type Props = {
  children: React.ReactNode;
};

export default function PortalMobile({ children }: Props) {
  return (
    <div className={styles.shell}>
      <div className={styles.watermark}>
        <img
          src="https://res.cloudinary.com/dmc7wmarf/image/upload/v1771775270/ChatGPT_Image_Jan_10_2026_11_32_39_AM_-_Copy_bcpc4f.png"
          alt=""
          className={styles.watermarkImage}
        />
      </div>
      <PortalHeader />
      <main className={styles.main}>{children}</main>
      <BottomNav />
    </div>
  );
}
