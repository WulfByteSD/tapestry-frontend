import type { CharacterSheet, ConditionInstance, InventoryItem, NoteCard } from '@tapestry/types';

export function sheetToMarkdown(sheet: CharacterSheet): string {
  const lines: string[] = [];
  const s = sheet.sheet;

  // ── Header ────────────────────────────────────────────────────────────────
  lines.push(`# ${sheet.name}`);
  lines.push('');

  if (s.profile?.title) lines.push(`**${s.profile.title}**`);
  if (s.profile?.bio) lines.push(`> ${s.profile.bio}`);
  lines.push('');

  // ── Identity ──────────────────────────────────────────────────────────────
  lines.push('## Identity');
  if (s.archetypeKey) lines.push(`- **Archetype:** ${s.archetypeKey}`);
  lines.push(`- **Weave Level:** ${s.weaveLevel}`);
  if (sheet.settingKey) lines.push(`- **Setting:** ${titleCase(sheet.settingKey)}`);
  if (sheet.status) lines.push(`- **Status:** ${titleCase(sheet.status)}`);
  if (sheet.campaign) lines.push(`- **Campaign:** linked`);
  lines.push('');

  // ── Profile ───────────────────────────────────────────────────────────────
  const profile = s.profile;
  if (profile) {
    const profileFields: [string, string | number | undefined][] = [
      ['Race', profile.race],
      ['Nationality', profile.nationality],
      ['Religion', profile.religion],
      ['Sex', profile.sex],
      ['Age', profile.age],
      ['Height', profile.height],
      ['Weight', profile.weight],
      ['Eyes', profile.eyes],
      ['Hair', profile.hair],
      ['Ethnicity', profile.ethnicity],
    ];
    const filled = profileFields.filter(([, v]) => v !== undefined && v !== '' && v !== null);
    if (filled.length) {
      lines.push('## Profile');
      for (const [label, value] of filled) {
        lines.push(`- **${label}:** ${value}`);
      }
      if (profile.extra) {
        for (const [k, v] of Object.entries(profile.extra)) {
          if (v) lines.push(`- **${titleCase(k)}:** ${v}`);
        }
      }
      lines.push('');
    }
  }

  // ── Aspects ───────────────────────────────────────────────────────────────
  lines.push('## Aspects');
  const aspects = s.aspects;
  if (aspects) {
    lines.push(`- **Might** — Strength ${aspects.might.strength}, Presence ${aspects.might.presence}`);
    lines.push(`- **Finesse** — Agility ${aspects.finesse.agility}, Charm ${aspects.finesse.charm}`);
    lines.push(`- **Wit** — Instinct ${aspects.wit.instinct}, Knowledge ${aspects.wit.knowledge}`);
    lines.push(`- **Resolve** — Willpower ${aspects.resolve.willpower}, Empathy ${aspects.resolve.empathy}`);
  }
  lines.push('');

  // ── Resources ─────────────────────────────────────────────────────────────
  const res = s.resources;
  if (res) {
    lines.push('## Resources');
    lines.push(`- **HP:** ${res.hp.current} / ${res.hp.max}${res.hp.temp ? ` (temp: ${res.hp.temp})` : ''}`);
    lines.push(`- **Threads:** ${res.threads.current} / ${res.threads.max}`);
    if (res.resolve) {
      lines.push(`- **Resolve:** ${res.resolve.current} / ${res.resolve.max}`);
    }
    if (res.other) {
      for (const [k, v] of Object.entries(res.other)) {
        lines.push(`- **${titleCase(k)}:** ${v}`);
      }
    }
    lines.push('');
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  const skills = s.skills;
  if (skills && Object.keys(skills).length) {
    lines.push('## Skills');
    for (const [key, rank] of Object.entries(skills)) {
      if (rank > 0) lines.push(`- **${titleCase(key)}:** ${rank}`);
    }
    lines.push('');
  }

  // ── Features ──────────────────────────────────────────────────────────────
  if (s.features?.length) {
    lines.push('## Features');
    for (const f of s.features) {
      lines.push(`- ${titleCase(f)}`);
    }
    lines.push('');
  }

  // ── Abilities ─────────────────────────────────────────────────────────────
  if (s.learnedAbilities?.length) {
    lines.push('## Learned Abilities');
    for (const ability of s.learnedAbilities) {
      const label = ability.displayName ?? ability.abilityKey ?? 'Unknown';
      const rank = ability.rank ? ` (rank ${ability.rank})` : '';
      lines.push(`- **${label}**${rank}`);
    }
    lines.push('');
  }

  // ── Inventory ─────────────────────────────────────────────────────────────
  if (s.inventory?.length) {
    lines.push('## Inventory');
    for (const item of s.inventory) {
      lines.push(formatInventoryItem(item));
    }
    lines.push('');
  }

  // ── Conditions ────────────────────────────────────────────────────────────
  if (s.conditions?.length) {
    lines.push('## Active Conditions');
    for (const cond of s.conditions) {
      lines.push(formatCondition(cond));
    }
    lines.push('');
  }

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (s.noteCards?.length) {
    lines.push('## Notes');
    for (const note of s.noteCards) {
      lines.push(formatNote(note));
    }
  }

  // ── Meta ──────────────────────────────────────────────────────────────────
  lines.push('');
  lines.push('---');
  lines.push(`*Exported from Tapestry — ${new Date().toLocaleDateString()}*`);

  return lines.join('\n');
}

export function downloadSheetMarkdown(sheet: CharacterSheet): void {
  const filename = `${sheet.name.replace(/\s+/g, '-').toLowerCase()}-sheet.md`;
  const markdown = sheetToMarkdown(sheet);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  triggerDownload(blob, filename);
}

// ── Helpers ───────────────────────────────────────────────────────────────

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

function formatInventoryItem(item: InventoryItem): string {
  const name = item.overrides?.displayName ?? item.name ?? item.itemKey ?? 'Unknown';
  const qty = item.qty !== 1 ? ` ×${item.qty}` : '';
  const equipped = item.equipped ? ' *(equipped)*' : '';
  const category = item.category ? ` [${item.category}]` : '';
  const notes = item.notes ? ` — ${item.notes}` : '';
  return `- **${name}**${qty}${equipped}${category}${notes}`;
}

function formatCondition(cond: ConditionInstance): string {
  const stacks = cond.stacks && cond.stacks > 1 ? ` ×${cond.stacks}` : '';
  const source = cond.source ? ` *(from: ${cond.source})*` : '';
  const notes = cond.notes ? ` — ${cond.notes}` : '';
  return `- **${titleCase(cond.key)}**${stacks}${source}${notes}`;
}

function formatNote(note: NoteCard): string {
  const pinned = note.pinned ? ' 📌' : '';
  const lines = [`### ${note.title}${pinned}`];
  if (note.body) lines.push(note.body);
  return lines.join('\n');
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
