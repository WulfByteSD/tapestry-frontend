import { useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@tapestry/ui";
import styles from "./OverviewTab.module.scss";
import { RollModal } from "./Roll.modal";
import { AspectStepperRow } from "../../../aspects/AspectStepperRow";
import {
  ASPECT_BLOCKS,
  aspectPath,
  getAspectValue,
  type AspectGroup,
  type AspectKey,
} from "../../../aspects/aspectutils";
import { useUpdateCharacterSheetMutation } from "../../../characterSheetScreen/characterSheet.mutations";
import { HpModal } from "./Hp.modal";
import { ThreadsModal } from "./Threads.modal";

// Aspect value rules:
// - Game-wide range: -2 to +4 (enforced by game rules across all levels)
// - Creation rules: -2 to +2 with pool of 2 (only at weave level 0)
// TODO: Enforce aspect min/max based on weave level when we implement weave tracking
// Until then, no programmatic enforcement - players manage their own aspect values.

// const ENFORCE_CREATION_RULES = false; // later (campaign-driven)
// const CREATION_MIN = -2;
// const CREATION_MAX = 2;
// const CREATION_POOL = 2;

type Props = {
  sheet: any;
  mode: "build" | "play";
};

type AspectSelection = {
  group: AspectGroup;
  key: AspectKey;
  label: string;
  blockTitle: string;
};

function getOtherNumber(sheet: any, key: string): number | null {
  const v = sheet?.sheet?.resources?.other?.[key];
  return typeof v === "number" ? v : null;
}

export function OverviewTab({ sheet, mode }: Props) {
  const update = useUpdateCharacterSheetMutation(sheet._id);
  const isBuild = mode === "build";

  const [rollOpen, setRollOpen] = useState(false);
  const [initialAspect, setInitialAspect] = useState<AspectSelection | null>(null);
  const [hpOpen, setHpOpen] = useState(false);
  const [threadsOpen, setThreadsOpen] = useState(false);

  const hp = sheet?.sheet?.resources?.hp;
  const threads = sheet?.sheet?.resources?.threads;
  const armor = getOtherNumber(sheet, "armor") ?? getOtherNumber(sheet, "ac");

  const defaultAspect = useMemo<AspectSelection>(() => {
    // default to Might/Strength
    return {
      group: "might",
      key: "strength",
      label: "Strength (Might)",
      blockTitle: "Might",
    };
  }, []);

  function openApproach(aspect?: AspectSelection) {
    setInitialAspect(aspect ?? initialAspect ?? defaultAspect);
    setRollOpen(true);
  }

  return (
    <div className={styles.contentGrid}>
      {/* ASPECTS */}
      <Card inlay className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <div className={styles.cardTitle}>Aspects</div>
          <div className={styles.cardHint}>
            {isBuild ? "Build mode: set starting values." : "Play mode: tap an aspect to roll an Approach."}
          </div>
        </CardHeader>

        <CardBody className={styles.aspectsGrid}>
          {ASPECT_BLOCKS.map((block) => (
            <div key={block.title} className={styles.aspectTile}>
              <div className={styles.aspectTileTitle}>{block.title}</div>

              <div className={styles.aspectRows}>
                {block.keys.map(({ label, key }) => {
                  const value = getAspectValue(sheet, block.group, key);

                  if (isBuild) {
                    // No min/max enforcement until we track weave levels
                    return (
                      <AspectStepperRow
                        key={key}
                        label={label}
                        value={value}
                        onInc={() => {
                          update.mutate({ [aspectPath(block.group, key)]: value + 1 });
                        }}
                        onDec={() => {
                          update.mutate({ [aspectPath(block.group, key)]: value - 1 });
                        }}
                      />
                    );
                  }

                  // PLAY MODE: click -> open RollModal with this aspect preselected
                  return (
                    <button
                      key={key}
                      type="button"
                      className={styles.aspectRow}
                      onClick={() =>
                        openApproach({
                          group: block.group,
                          key,
                          label: `${label} (${block.title})`,
                          blockTitle: block.title,
                        })
                      }
                    >
                      <span className={styles.aspectKey}>{label}</span>
                      <span className={styles.aspectValue}>{value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* PLAY SURFACE */}
      <Card inlay className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <div className={styles.cardTitle}>Play Surface</div>
          <div className={styles.cardHint}>Quick actions + live state.</div>
        </CardHeader>

        <CardBody className={styles.playSurfaceBody}>
          <div className={styles.actionsCol}>
            <Button
              tone="gold"
              fullWidth
              disabled={isBuild}
              onClick={() => {
                /* later: open Approach modal */
              }}
            >
              Approach
            </Button>
            <Button tone="purple" variant="outline" fullWidth onClick={() => setHpOpen(true)}>
              HP
            </Button>
            <Button tone="purple" variant="outline" fullWidth onClick={() => setThreadsOpen(true)}>
              Threads
            </Button>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Threads</div>
              <div className={styles.statValue}>
                {sheet?.sheet?.resources?.threads
                  ? `${sheet.sheet.resources.threads.current}/${sheet.sheet.resources.threads.max}`
                  : "—"}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>HP</div>
              <div className={styles.statValue}>
                {sheet?.sheet?.resources?.hp
                  ? `${sheet.sheet.resources.hp.current}/${sheet.sheet.resources.hp.max}`
                  : "—"}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Armor</div>
              <div className={styles.statValue}>
                {sheet?.sheet?.resources?.other?.armor ?? sheet?.sheet?.resources?.other?.ac ?? "—"}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Conditions</div>
              <div className={styles.statValue}>{sheet?.sheet?.conditions?.length ?? 0}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {hpOpen && <HpModal sheet={sheet} onClose={() => setHpOpen(false)} />}
      {threadsOpen && <ThreadsModal sheet={sheet} onClose={() => setThreadsOpen(false)} />}
      {rollOpen && (
        <RollModal
          key={`${initialAspect?.group ?? "might"}.${initialAspect?.key ?? "strength"}`}
          sheet={sheet}
          initialAspect={
            initialAspect ?? {
              group: "might",
              key: "strength",
            }
          }
          onClose={() => setRollOpen(false)}
        />
      )}
    </div>
  );
}
