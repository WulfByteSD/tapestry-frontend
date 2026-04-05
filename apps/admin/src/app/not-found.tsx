"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./not-found.module.scss";

export default function NotFound() {
  const router = useRouter();
  const [previousPage, setPreviousPage] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a previous page in the browser history
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      if (referrer && referrer !== window.location.href) {
        // Extract just the pathname for display
        try {
          const url = new URL(referrer);
          if (url.origin === window.location.origin) {
            setPreviousPage(url.pathname);
          }
        } catch (error) {
          console.error("Error parsing referrer:", error);
        }
      }
    }
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Animated Error Code with Dice */}
        <motion.div
          className={styles.errorCode}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className={styles.number}>4</span>
          <div className={styles.diceContainer}>
            <motion.span
              className={styles.dice}
              initial={{ rotateZ: 0, rotateX: 0, rotateY: 0 }}
              animate={{
                rotateZ: [0, 360, 720, 1080],
                rotateX: [0, 180, 360, 180],
                rotateY: [0, 180, 270, 360],
              }}
              transition={{
                duration: 2,
                ease: "easeOut",
                times: [0, 0.3, 0.6, 1],
              }}
            >
              🎲
            </motion.span>
          </div>
          <span className={styles.number}>4</span>
        </motion.div>

        {/* Main Message */}
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Lost in the Tapestry
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          The threads of fate have led you astray. This path does not exist in our realm.
        </motion.p>

        {/* Quest Log Card */}
        <motion.div
          className={styles.questLog}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className={styles.questLogHeader}>
            <span className={styles.questIcon}>📜</span>
            <span className={styles.questTitle}>Quest Failed</span>
          </div>
          <div className={styles.questBody}>
            <p className={styles.questDescription}>Your journey has encountered an unexpected twist:</p>
            <ul className={styles.questList}>
              <li>
                <span className={styles.bulletIcon}>⚔️</span>
                The page may have been moved to another realm
              </li>
              <li>
                <span className={styles.bulletIcon}>🗡️</span>
                The URL might contain a typo in the ancient runes
              </li>
              <li>
                <span className={styles.bulletIcon}>🛡️</span>A broken link has disrupted the weave
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <button onClick={handleGoHome} className={styles.primaryButton}>
            🏰 Return to Tavern
          </button>

          {previousPage && (
            <button onClick={handleGoBack} className={styles.secondaryButton}>
              ↩️ Retrace Steps
            </button>
          )}

          {!previousPage && (
            <button onClick={handleGoBack} className={styles.secondaryButton}>
              ↩️ Retrace Steps
            </button>
          )}
        </motion.div>

        {/* Additional Help */}
        <motion.div
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <p>
            Need guidance from the Storyweavers?{" "}
            <a href="mailto:support@tapestry-ttrpg.com" className={styles.link}>
              Contact Support
            </a>
          </p>
        </motion.div>
      </div>

      {/* Decorative Thread Elements */}
      <div className={styles.decoration}>
        <motion.div
          className={styles.thread}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.div
          className={styles.thread}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 2.5, delay: 0.2, ease: "easeInOut" }}
        />
        <div className={styles.circle}></div>
      </div>
    </div>
  );
}
