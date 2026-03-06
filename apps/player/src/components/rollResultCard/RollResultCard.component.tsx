"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { FiCopy, FiCheck, FiAlertCircle } from "react-icons/fi";
import styles from "./RollResultCard.module.scss";

export interface RollResultData {
  rollId: string;
  breakdown: string;
  total: number;
  allRolls: number[];
  keptRolls: number[];
  expression: string;
  context?: string;
  attack?: {
    targetNumber: number;
    margin: number;
    outcome: "miss" | "weak_hit" | "hit" | "strong_hit";
    targetLabel?: string;
    weaponNameSnapshot?: string;
    attackNameSnapshot?: string | null;
  };
}
interface Props {
  result: RollResultData;
}

type CopyStatus = "idle" | "copying" | "success" | "error";

export function RollResultCard({ result }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  const handleCopyAsImage = async () => {
    if (!cardRef.current) return;

    // Check for Clipboard API support
    if (!navigator.clipboard || !navigator.clipboard.write) {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 3000);
      console.error("Clipboard API not supported in this browser");
      return;
    }

    setCopyStatus("copying");

    try {
      // Wait for fonts to load
      await document.fonts.ready;

      // Capture the card as canvas
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#1a1a2e",
        scale: 2, // 2x for high DPI displays
        logging: false,
        useCORS: true,
        imageTimeout: 0,
        allowTaint: false,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob: Blob | null) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/png",
          0.95,
        );
      });

      // Write to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to copy roll result as image:", error);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 3000);
    }
  };

  const getCopyButtonContent = () => {
    switch (copyStatus) {
      case "copying":
        return (
          <>
            <FiCopy />
            Copying...
          </>
        );
      case "success":
        return (
          <>
            <FiCheck />
            Copied!
          </>
        );
      case "error":
        return (
          <>
            <FiAlertCircle />
            Failed
          </>
        );
      default:
        return (
          <>
            <FiCopy />
            Copy as Image
          </>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div ref={cardRef} className={styles.resultCard}>
        {result.context && <div className={styles.resultContext}>{result.context}</div>}
        <div className={styles.resultBreakdown}>{result.breakdown}</div>
        <div className={styles.resultTotal}>
          <span className={styles.resultLabel}>Total:</span>
          <span className={styles.resultValue}>{result.total}</span>
        </div>

        {result.attack && (
          <>
            <div className={`${styles.attackOutcome} ${styles[`outcome_${result.attack.outcome}`]}`}>
              <div className={styles.outcomeLabel}>{result.attack.outcome.replace("_", " ").toUpperCase()}</div>
            </div>

            <div className={styles.attackDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Target Number:</span>
                <span className={styles.detailValue}>{result.attack.targetNumber}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Margin:</span>
                <span className={styles.detailValue}>
                  {result.attack.margin >= 0 ? `+${result.attack.margin}` : result.attack.margin}
                </span>
              </div>
              {result.attack.targetLabel && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Target:</span>
                  <span className={styles.detailValue}>{result.attack.targetLabel}</span>
                </div>
              )}
              {result.attack.weaponNameSnapshot && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Weapon:</span>
                  <span className={styles.detailValue}>{result.attack.weaponNameSnapshot}</span>
                </div>
              )}
              {result.attack.attackNameSnapshot && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Attack:</span>
                  <span className={styles.detailValue}>{result.attack.attackNameSnapshot}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        className={`${styles.copyButton} ${styles[copyStatus]}`}
        onClick={handleCopyAsImage}
        disabled={copyStatus === "copying"}
      >
        {getCopyButtonContent()}
      </button>
    </div>
  );
}
