import type { TabsItem } from "@tapestry/ui";
import NodeEditorForm, { type NodeEditorFormValue } from "../nodeEditorForm/NodeEditorForm.component";
import styles from "./NodeWorkspace.module.scss";
import type { LoreNodeDetail, NodeEditorParentOption } from "./nodeWorkspace.types";
import { toFormValue } from "./nodeWorkspace.helper";

type TabKey = "editor" | "graph" | "relationships";

export type { TabKey };

export function createTabs(props: {
  node: LoreNodeDetail;
  parentOptions: NodeEditorParentOption[];
  relationTargets: NodeEditorParentOption[];
  isSaving: boolean;
  saveMessage: string | null;
  onSave: (formValue: NodeEditorFormValue) => Promise<void>;
}): TabsItem[] {
  const { node, parentOptions, relationTargets, isSaving, saveMessage, onSave } = props;

  return [
    {
      key: "editor",
      label: "Editor",
      children: (
        <NodeEditorForm
          initialValue={toFormValue(node)}
          parentOptions={parentOptions}
          relationTargets={relationTargets}
          isSaving={isSaving}
          saveMessage={saveMessage}
          onSave={onSave}
        />
      ),
    },
    {
      key: "graph",
      label: "Graph",
      children: (
        <div className={styles.placeholder}>
          <h2 className={styles.placeholderTitle}>Node graph</h2>
          <p className={styles.placeholderCopy}>
            This tab will render the current node as the local root and show its immediate children in a focused graph
            instead of the full setting atlas.
          </p>
        </div>
      ),
    },
    {
      key: "relationships",
      label: "Relationships",
      children: (
        <div className={styles.placeholder}>
          <h2 className={styles.placeholderTitle}>Relationships</h2>
          <p className={styles.placeholderCopy}>
            This tab will show outgoing and incoming relations in separate, readable panels so cross-links stay useful
            instead of turning into visual spaghetti.
          </p>
        </div>
      ),
    },
  ];
}
