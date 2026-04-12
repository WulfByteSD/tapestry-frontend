'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Card, CardHeader, CardBody, Loader } from '@tapestry/ui';
import { CREATOR_STEPS, getCreatorStep } from './characterCreator.config';
import { useCharacterCreatorForm } from './useCharacterCreatorForm';
import styles from './CharacterCreatorScreen.module.scss';

const stepVariants = {
  enter: (d: number) => ({ x: d > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -32 : 32, opacity: 0 }),
};

export function CharacterCreatorScreen() {
  const { step, direction, draft, setField, setAspect, canAdvance, isSubmitting, submitError, goNext, goPrev, handleSubmit, handleQuickStart } = useCharacterCreatorForm();

  const currentStepDef = getCreatorStep(step);
  const currentIndex = CREATOR_STEPS.findIndex((s) => s.key === step);
  const isFirst = !currentStepDef.back;
  const isLast = !currentStepDef.next;
  const StepComponent = currentStepDef.component;

  return (
    <div className={styles.wrap}>
      {/* Step indicator */}
      <nav className={styles.stepIndicator} aria-label="Character creation steps">
        {CREATOR_STEPS.map((s, i) => (
          <div key={s.key} className={styles.stepItem}>
            {i > 0 && <div className={styles.stepConnector} aria-hidden="true" />}
            <div
              className={`${styles.stepPill} ${s.key === step ? styles.stepPill_active : i < currentIndex ? styles.stepPill_done : ''}`}
              aria-current={s.key === step ? 'step' : undefined}
            >
              <span className={styles.stepNumber}>{i + 1}</span>
              {s.label}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick Start bypass */}
      <div className={styles.skipRow}>
        <button type="button" className={styles.quickStartBtn} onClick={handleQuickStart} disabled={isSubmitting}>
          Skip the wizard — Quick Start →
        </button>
      </div>

      {/* Main card */}
      <Card className={styles.card}>
        <CardHeader className={styles.header}>
          <h1 className={styles.stepTitle}>{currentStepDef.label}</h1>
          <p className={styles.rulesBlurb}>{currentStepDef.rulesBlurb}</p>
        </CardHeader>

        <CardBody className={styles.body}>
          {/* Animated step content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2, ease: 'easeInOut' }}>
              <StepComponent draft={draft} setField={setField} setAspect={setAspect} />
            </motion.div>
          </AnimatePresence>

          {/* Error banner */}
          {submitError && (
            <div className={styles.errorBox} role="alert">
              {submitError}
            </div>
          )}

          {/* Submitting feedback */}
          {isSubmitting && (
            <div className={styles.loaderRow}>
              <Loader size="sm" tone="gold" />
              Creating your character…
            </div>
          )}

          {/* Nav */}
          <div className={styles.nav}>
            <div className={styles.navLeft}>
              <Link href="/characters">
                <Button tone="neutral" variant="ghost" size="sm">
                  Cancel
                </Button>
              </Link>
              {!isFirst && (
                <Button tone="neutral" variant="outline" size="sm" onClick={goPrev} disabled={isSubmitting}>
                  Back
                </Button>
              )}
            </div>

            <div className={styles.navRight}>
              {isLast ? (
                <Button tone="gold" variant="solid" onClick={handleSubmit} disabled={isSubmitting}>
                  Submit
                </Button>
              ) : (
                <Button tone="gold" variant="solid" onClick={goNext} disabled={!canAdvance}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
