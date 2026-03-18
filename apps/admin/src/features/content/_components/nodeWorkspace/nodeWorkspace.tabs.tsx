import type { TabsItem } from "@tapestry/ui";

import NodeEditorForm, { type NodeEditorFormValue } from "../nodeEditorForm/NodeEditorForm.component";
import NodeGraphTab from "./NodeGraphTab.component";
import styles from "./NodeWorkspace.module.scss";
import type { FocusedLoreContext, LoreNodeDetail, NodeEditorParentOption } from "./nodeWorkspace.types";
import { toFormValue } from "./nodeWorkspace.helper";

type TabKey = "editor" | "graph" | "relationships";
export type { TabKey };

export function createTabs(props: {
  node: LoreNodeDetail;
  parentOptions: NodeEditorParentOption[];
  relationTargets: NodeEditorParentOption[];
  isSaving: boolean;
  saveMessage: string | null;
  graphContext: FocusedLoreContext | null;
  graphLoading: boolean;
  graphError: boolean;
  onSave: (formValue: NodeEditorFormValue) => Promise<void>;
  onOpenGraphNode: (nodeId: string) => void;
}): TabsItem[] {
  const {
    node,
    parentOptions,
    relationTargets,
    isSaving,
    saveMessage,
    graphContext,
    graphLoading,
    graphError,
    onSave,
    onOpenGraphNode,
  } = props;

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
          mode="edit"
          onSave={onSave}
        />
      ),
    },
    {
      key: "graph",
      label: "Graph",
      children: (
        <NodeGraphTab
          context={graphContext}
          currentNodeId={node._id}
          isLoading={graphLoading}
          isError={graphError}
          onOpenNode={onOpenGraphNode}
        />
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
