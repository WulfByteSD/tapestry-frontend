"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button, Card, CardBody, CardHeader } from "@tapestry/ui";
import styles from "./NewCharacter.module.scss";

export default function NewCharacterPage() {
  const router = useRouter();
  const startedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent duplicate creation in React Strict Mode (dev) / double-mount scenarios
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        setError(null);

        // Name is required by your Character schema
        const res = await api.post("/game/characters", { name: "New Character" });

        const id = res.data?.payload;

        if (!id) {
          throw new Error("Character create did not return an id. Patch API create to return { payload: result }.");
        }

        router.replace(`/characters/${id}?mode=build`);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.response?.data?.error || e?.message || "Failed to create character.";
        setError(msg);
      }
    })();
  }, [router]);

  return (
    <div className={styles.wrap}>
      <Card className={styles.card} inlay>
        <CardHeader className={styles.header}>
          <h1 className={styles.title}>{error ? "Couldn’t create character" : "Creating your character…"}</h1>
          <p className={styles.subtitle}>
            {error ? "Something went wrong while creating a new sheet." : "Hang tight. This usually takes a moment."}
          </p>
        </CardHeader>

        <CardBody className={styles.body}>
          {error ? (
            <>
              <div className={styles.errorBox}>{error}</div>
              <div className={styles.actions}>
                <Button tone="purple" variant="outline" onClick={() => router.replace("/")}>
                  Back to Sheets
                </Button>
                <Button
                  tone="gold"
                  onClick={() => {
                    startedRef.current = false;
                    setError(null);
                    // re-run the effect by forcing navigation to self
                    router.replace("/characters/new");
                  }}
                >
                  Try Again
                </Button>
              </div>
            </>
          ) : (
            <div className={styles.loaderRow}>
              <div className={styles.spinner} aria-hidden="true" />
              <div className={styles.loaderText}>Spinning the Loom…</div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
