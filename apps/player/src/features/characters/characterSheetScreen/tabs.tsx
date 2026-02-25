import type { TabsItem } from "@tapestry/ui";
import { OverviewTab } from "./tabs/overview/OverviewTab";
import { NotesTab } from "./tabs/notes/NotesTab";
import { PlaceholderTab } from "./tabs/PlaceholderTab";

type TabKey = "overview" | "skills" | "inventory" | "conditions" | "notes";

export type { TabKey };

export function createTabs(props: { sheet: any; onSaveNotes: (notes: string) => void, mode: "build" | "play" }): TabsItem[] {
  const { sheet, onSaveNotes, mode } = props;

  return [
    {
      key: "overview",
      label: "Overview",
      icon: undefined,
      children: <OverviewTab sheet={sheet} mode={mode} />,
    },
    {
      key: "skills",
      label: "Skills",
      icon: undefined,
      children: <PlaceholderTab title="Skills" />,
    },
    {
      key: "inventory",
      label: "Inventory",
      icon: undefined,
      children: <PlaceholderTab title="Inventory" />,
    },
    {
      key: "conditions",
      label: "Conditions",
      icon: undefined,
      children: <PlaceholderTab title="Conditions" />,
    },
    {
      key: "notes",
      label: "Notes",
      icon: undefined,
      children: <NotesTab initialNotes={sheet?.sheet?.notes ?? ""} onSave={onSaveNotes} />,
    },
  ];
}
