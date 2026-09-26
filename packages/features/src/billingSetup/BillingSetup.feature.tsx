'use client';

import React, { useReducer, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import type { BillingSetupProps, WizardState, WizardAction } from './BillingSetup.types';
import PlanSelect from './steps/PlanSelect/PlanSelect.step';
import CardCapture from './steps/CardCapture/CardCapture.step';
import ReviewAndSubmit from './steps/ReviewAndSubmit/ReviewAndSubmit.step';
import styles from './BillingSetup.module.scss';

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_PLAN':
      return { ...state, selectedPlan: action.plan };
    case 'SET_BILLING_CYCLE':
      return { ...state, billingCycle: action.cycle };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_STRIPE_TOKEN':
      return { ...state, stripeToken: action.token };
    case 'RESET_PAYMENT':
      return { ...state, stripeToken: null, cardKey: state.cardKey + 1, step: 'payment' };
    default:
      return state;
  }
}

const initialState: WizardState = {
  step: 'plan',
  selectedPlan: null,
  billingCycle: 'monthly',
  stripeToken: null,
  cardKey: 0,
};

export function BillingSetupFeature({ api, profileId, profileType, stripePublishableKey, billingValidation }: BillingSetupProps) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const stripePromise = useMemo(() => loadStripe(stripePublishableKey), [stripePublishableKey]);

  const handlePlanContinue = () => {
    if (!state.selectedPlan) return;
    if (state.selectedPlan.price === 0) {
      dispatch({ type: 'SET_STEP', step: 'review' });
    } else {
      dispatch({ type: 'SET_STEP', step: 'payment' });
    }
  };

  const handleTokenCreated = (token: string) => {
    dispatch({ type: 'SET_STRIPE_TOKEN', token });
    dispatch({ type: 'SET_STEP', step: 'review' });
  };

  const handleBack = () => {
    if (state.step === 'payment') {
      dispatch({ type: 'SET_STEP', step: 'plan' });
    } else if (state.step === 'review') {
      dispatch({ type: 'SET_STEP', step: state.selectedPlan?.price === 0 ? 'plan' : 'payment' });
    }
  };

  const renderStep = () => {
    switch (state.step) {
      case 'plan':
        return (
          <PlanSelect
            api={api}
            profileType={profileType}
            selectedPlan={state.selectedPlan}
            billingCycle={state.billingCycle}
            onSelectPlan={(plan) => dispatch({ type: 'SET_PLAN', plan })}
            onSetBillingCycle={(cycle) => dispatch({ type: 'SET_BILLING_CYCLE', cycle })}
            onContinue={handlePlanContinue}
          />
        );
      case 'payment':
        return <CardCapture stripePromise={stripePromise} cardKey={state.cardKey} onTokenCreated={handleTokenCreated} onBack={handleBack} />;
      case 'review':
        return (
          <ReviewAndSubmit
            api={api}
            profileId={profileId}
            selectedPlan={state.selectedPlan!}
            billingCycle={state.billingCycle}
            stripeToken={state.stripeToken}
            onBack={handleBack}
            onError={() => dispatch({ type: 'RESET_PAYMENT' })}
          />
        );
    }
  };

  const getBannerClass = (severity: string) => {
    if (severity === 'critical') return styles.critical;
    if (severity === 'warning') return styles.warning;
    return styles.info;
  };

  const severityLabel: Record<string, string> = {
    critical: '⚠ Action Required',
    warning: '⚡ Attention Needed',
    info: 'ℹ Information',
  };

  return (
    <div className={styles.screen}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>Complete Your Billing Setup</h1>
          <p className={styles.description}>To continue using the platform, please complete your billing setup.</p>

          {billingValidation?.needsUpdate && billingValidation.reasons?.length > 0 && (
            <div className={`${styles.banner} ${getBannerClass(billingValidation.severity)}`}>
              <strong>{severityLabel[billingValidation.severity] ?? 'Notice'}</strong>
              <ul className={styles.bannerList}>
                {billingValidation.reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.content}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={state.step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
