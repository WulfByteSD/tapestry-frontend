import type { LoreRelationType } from "../../_hooks/useContentStudio";

export type RelationTypeOption = {
  value: LoreRelationType;
  label: string;
  helper: string;
};

export type RelationTypeGroup = {
  group: string;
  options: RelationTypeOption[];
};

export const RELATION_TYPE_GROUPS: RelationTypeGroup[] = [
  {
    group: "General",
    options: [
      {
        value: "related_to",
        label: "Related To",
        helper: "Generic connection between nodes",
      },
      {
        value: "appears_in",
        label: "Appears In",
        helper: "Entity appears in a location or event",
      },
      {
        value: "located_in",
        label: "Located In",
        helper: "Physical or administrative location",
      },
      {
        value: "originates_from",
        label: "Originates From",
        helper: "Source or place of origin",
      },
    ],
  },
  {
    group: "Family & Lineage",
    options: [
      {
        value: "ancestor_of",
        label: "Ancestor Of",
        helper: "Direct or distant ancestor",
      },
      {
        value: "child_of",
        label: "Child Of",
        helper: "Parent-child relationship",
      },
      {
        value: "descended_from",
        label: "Descended From",
        helper: "Lineage or bloodline connection",
      },
      {
        value: "parent_of",
        label: "Parent Of",
        helper: "Has offspring or descendant",
      },
      {
        value: "sibling_of",
        label: "Sibling Of",
        helper: "Brother or sister relationship",
      },
      {
        value: "spouse_of",
        label: "Spouse Of",
        helper: "Married or partnered",
      },
    ],
  },
  {
    group: "Power & Authority",
    options: [
      {
        value: "governs",
        label: "Governs",
        helper: "Rules or administers territory",
      },
      {
        value: "rules",
        label: "Rules",
        helper: "Has sovereign authority over",
      },
      {
        value: "subject_of",
        label: "Subject Of",
        helper: "Under the rule or authority of",
      },
      {
        value: "leads",
        label: "Leads",
        helper: "Commands or directs",
      },
      {
        value: "serves",
        label: "Serves",
        helper: "Works for or pledges service to",
      },
      {
        value: "employed_by",
        label: "Employed By",
        helper: "Works for in official capacity",
      },
      {
        value: "imprisoned_by",
        label: "Imprisoned By",
        helper: "Held captive or detained by",
      },
      {
        value: "banished_by",
        label: "Banished By",
        helper: "Exiled or expelled by",
      },
      {
        value: "under_claim_of",
        label: "Under Claim Of",
        helper: "Territory or title claimed by",
      },
    ],
  },
  {
    group: "Loyalty & Alliance",
    options: [
      {
        value: "allied_with",
        label: "Allied With",
        helper: "Formal or informal alliance",
      },
      {
        value: "loyal_to",
        label: "Loyal To",
        helper: "Strong allegiance or devotion",
      },
      {
        value: "nominally_loyal_to",
        label: "Nominally Loyal To",
        helper: "Pledged but unreliable loyalty",
      },
      {
        value: "supports",
        label: "Supports",
        helper: "Backs or assists",
      },
      {
        value: "member_of",
        label: "Member Of",
        helper: "Belongs to group or organization",
      },
      {
        value: "part_of",
        label: "Part Of",
        helper: "Component or segment of whole",
      },
    ],
  },
  {
    group: "Conflict & Opposition",
    options: [
      {
        value: "enemy_of",
        label: "Enemy Of",
        helper: "Hostile or antagonistic toward",
      },
      {
        value: "opposed_to",
        label: "Opposed To",
        helper: "In disagreement or conflict with",
      },
      {
        value: "rival_of",
        label: "Rival Of",
        helper: "Competing with for power or status",
      },
      {
        value: "betrayed_by",
        label: "Betrayed By",
        helper: "Wronged or deceived by",
      },
      {
        value: "hunts",
        label: "Hunts",
        helper: "Actively pursues or tracks",
      },
      {
        value: "seeks",
        label: "Seeks",
        helper: "Searching for or pursuing",
      },
      {
        value: "fears",
        label: "Fears",
        helper: "Afraid of or intimidated by",
      },
    ],
  },
  {
    group: "Protection & Defense",
    options: [
      {
        value: "defends",
        label: "Defends",
        helper: "Protects or guards actively",
      },
      {
        value: "guards",
        label: "Guards",
        helper: "Watches over or secures",
      },
      {
        value: "protected_by",
        label: "Protected By",
        helper: "Under protection or defense of",
      },
      {
        value: "rescued_by",
        label: "Rescued By",
        helper: "Saved or freed by",
      },
    ],
  },
  {
    group: "Knowledge & Mentorship",
    options: [
      {
        value: "mentor_of",
        label: "Mentor Of",
        helper: "Teachers or guides",
      },
      {
        value: "student_of",
        label: "Student Of",
        helper: "Learns from or studies under",
      },
      {
        value: "inspired_by",
        label: "Inspired By",
        helper: "Motivated or influenced by",
      },
      {
        value: "influences",
        label: "Influences",
        helper: "Has effect or sway over",
      },
    ],
  },
  {
    group: "Magical & Supernatural",
    options: [
      {
        value: "blessed_by",
        label: "Blessed By",
        helper: "Given divine favor or power by",
      },
      {
        value: "cursed_by",
        label: "Cursed By",
        helper: "Afflicted with magical curse by",
      },
      {
        value: "bound_to",
        label: "Bound To",
        helper: "Magically tied or obligated to",
      },
      {
        value: "sealed_by",
        label: "Sealed By",
        helper: "Locked or contained by magic",
      },
      {
        value: "summoned_by",
        label: "Summoned By",
        helper: "Called forth or conjured by",
      },
      {
        value: "transformed_from",
        label: "Transformed From",
        helper: "Changed from original form",
      },
      {
        value: "prophesied_about",
        label: "Prophesied About",
        helper: "Subject of prophecy or prediction",
      },
      {
        value: "witnessed_by",
        label: "Witnessed By",
        helper: "Observed or attested by",
      },
      {
        value: "shadowed_by",
        label: "Shadowed By",
        helper: "Followed or haunted by",
      },
      {
        value: "worships",
        label: "Worships",
        helper: "Venerates or pays homage to",
      },
    ],
  },
  {
    group: "Creation & Destruction",
    options: [
      {
        value: "created_by",
        label: "Created By",
        helper: "Made or brought into being by",
      },
      {
        value: "founded_by",
        label: "Founded By",
        helper: "Established or originated by",
      },
      {
        value: "destroyed_by",
        label: "Destroyed By",
        helper: "Ruined or ended by",
      },
    ],
  },
  {
    group: "Spatial & Territory",
    options: [
      {
        value: "borders",
        label: "Borders",
        helper: "Shares boundary with",
      },
      {
        value: "neighbor_of",
        label: "Neighbor Of",
        helper: "Adjacent to or near",
      },
      {
        value: "contains",
        label: "Contains",
        helper: "Encompasses or includes",
      },
      {
        value: "at_foot_of",
        label: "At Foot Of",
        helper: "Located at the base of",
      },
    ],
  },
  {
    group: "Ownership & Commerce",
    options: [
      {
        value: "owns",
        label: "Owns",
        helper: "Has possession or control of",
      },
      {
        value: "trades_with",
        label: "Trades With",
        helper: "Engages in commerce with",
      },
    ],
  },
];

export function formatRelationType(value: LoreRelationType): string {
  for (const group of RELATION_TYPE_GROUPS) {
    const option = group.options.find((opt) => opt.value === value);
    if (option) {
      return option.label;
    }
  }

  // Fallback to formatted string if not found
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getRelationTypeHelper(value: LoreRelationType): string | undefined {
  for (const group of RELATION_TYPE_GROUPS) {
    const option = group.options.find((opt) => opt.value === value);
    if (option) {
      return option.helper;
    }
  }
  return undefined;
}
