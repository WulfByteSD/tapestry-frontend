import { AttackProfile } from '@tapestry/types';
import { AttackProfileDraft, AttackProfileDraftErrors } from './editor.types';
import { EMPTY_ATTACK_PROFILE_DRAFT } from './editor.constants';

export function slugifyAttackProfileKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function trimToUndefined(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function createAttackProfileDraft(profile?: AttackProfile | null): AttackProfileDraft {
  if (!profile) {
    return { ...EMPTY_ATTACK_PROFILE_DRAFT };
  }

  return {
    key: profile.key ?? '',
    name: profile.name ?? '',
    attackKind: profile.attackKind ?? '',
    defaultAspect: profile.defaultAspect ?? '',
    allowedSkillKeys: profile.allowedSkillKeys ?? [],
    modifier: typeof profile.modifier === 'number' ? profile.modifier : undefined,
    harm: typeof profile.harm === 'number' ? profile.harm : undefined,
    rangeLabel: profile.rangeLabel ?? '',
    tags: profile.tags ?? [],
    notes: profile.notes ?? '',
  };
}

export function normalizeAttackProfileDraft(draft: AttackProfileDraft): AttackProfile {
  const tags = draft.tags.map((tag) => tag.trim()).filter(Boolean);

  return {
    key: draft.key.trim(),
    name: draft.name.trim(),
    attackKind: draft.attackKind || undefined,
    defaultAspect: draft.defaultAspect || undefined,
    allowedSkillKeys: draft.allowedSkillKeys.length ? draft.allowedSkillKeys : undefined,
    modifier: typeof draft.modifier === 'number' ? draft.modifier : undefined,
    harm: typeof draft.harm === 'number' ? draft.harm : undefined,
    rangeLabel: trimToUndefined(draft.rangeLabel),
    tags: tags.length ? tags : undefined,
    notes: trimToUndefined(draft.notes),
  };
}

export function validateAttackProfileDraft(draft: AttackProfileDraft, attackProfiles: AttackProfile[], originalAttackProfileKey: string | null): AttackProfileDraftErrors {
  const errors: AttackProfileDraftErrors = {};
  const nextKey = draft.key.trim();

  if (!draft.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!nextKey) {
    errors.key = 'Key is required.';
  } else {
    const duplicateProfile = attackProfiles.find((profile) => profile.key === nextKey && profile.key !== originalAttackProfileKey);

    if (duplicateProfile) {
      errors.key = 'Key must be unique for this item.';
    }
  }

  if (draft.modifier !== undefined && !Number.isFinite(draft.modifier)) {
    errors.modifier = 'Modifier must be a number.';
  }

  if (draft.harm !== undefined && !Number.isFinite(draft.harm)) {
    errors.harm = 'Harm must be a number.';
  }

  return errors;
}

export function formatAttackProfileSummary(profile: AttackProfile) {
  const parts = [profile.key];

  if (profile.attackKind) {
    parts.push(profile.attackKind);
  }

  if (typeof profile.harm === 'number') {
    parts.push(`Harm ${profile.harm}`);
  }

  if (profile.rangeLabel) {
    parts.push(`Range ${profile.rangeLabel}`);
  }

  return parts.join(' - ');
}
