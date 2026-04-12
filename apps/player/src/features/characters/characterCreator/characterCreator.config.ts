import type React from 'react';
import { IdentityStep } from './steps/IdentityStep';
import { HeritageStep } from './steps/HeritageStep';
import { AspectsStep } from './steps/AspectsStep';
import { ReviewStep } from './steps/ReviewStep';
import type { WizardStepProps } from './characterCreator.types';

export type CreatorStepKey = 'identity' | 'heritage' | 'aspects' | 'review';

export type CreatorStepDef = {
  key: CreatorStepKey;
  label: string;
  rulesBlurb: string;
  component: React.ComponentType<WizardStepProps>;
  next?: CreatorStepKey;
  back?: CreatorStepKey;
};

export const CREATOR_STEPS: CreatorStepDef[] = [
  {
    key: 'identity',
    label: 'Identity',
    rulesBlurb: "Your character's identity is how the world knows them — their name, their calling, and the world they inhabit. These fields set the stage for everything else.",
    component: IdentityStep,
    next: 'heritage',
  },
  {
    key: 'heritage',
    label: 'Heritage',
    rulesBlurb:
      "Heritage is purely flavor. It doesn't grant mechanical bonuses — it gives your character texture, history, and presence at the table. Fill in as much or as little as you like.",
    component: HeritageStep,
    next: 'aspects',
    back: 'identity',
  },
  {
    key: 'aspects',
    label: 'Aspects',
    rulesBlurb:
      "Aspects are the eight core stats that define your character's strengths and weaknesses. You start with 2 points to spend. Taking \u22121 in up to two aspects gives you bonus points to place elsewhere. No aspect may exceed +2 at creation.",
    component: AspectsStep,
    next: 'review',
    back: 'heritage',
  },
  {
    key: 'review',
    label: 'Review',
    rulesBlurb: 'Take a final look at your character before bringing them into the world.',
    component: ReviewStep,
    back: 'aspects',
  },
];

export function getCreatorStep(key: CreatorStepKey): CreatorStepDef {
  return CREATOR_STEPS.find((s) => s.key === key)!;
}
