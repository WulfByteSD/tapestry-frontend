import type { TabsItem } from "@tapestry/ui";

import NodeEditorForm, { type NodeEditorFormValue } from "../nodeEditorForm/NodeEditorForm.component";
import NodeGraphTab from "./NodeGraphTab.component";
import styles from "./NodeWorkspace.module.scss";
import type { FocusedLoreContext, LoreNodeDetail, NodeEditorParentOption } from "./nodeWorkspace.types";
import { toFormValue } from "./nodeWorkspace.helper";
import RelationshipGraphTab from "./RelationshipGraphTab.component";

type TabKey = "editor" | "graph" | "relationships";
export type { TabKey };
export function createTabs(props: {
  node: LoreNodeDetail;
  activeTab: TabKey;
  parentOptions: NodeEditorParentOption[];
  relationTargets: NodeEditorParentOption[];
  isSaving: boolean;
  saveMessage: string | null;
  graphContext: FocusedLoreContext | null;
  graphLoading: boolean;
  graphError: boolean;
  onSave: (formValue: NodeEditorFormValue) => Promise<void>;
  onOpenGraphNode: (nodeId: string) => void;
  onOpenRelationNode?: (nodeId: string) => void;
}): TabsItem[] {
  const {
    node,
    activeTab,
    parentOptions,
    relationTargets,
    isSaving,
    saveMessage,
    graphContext,
    graphLoading,
    graphError,
    onSave,
    onOpenGraphNode,
    onOpenRelationNode,
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
      children:
        activeTab === "graph" ? (
          <NodeGraphTab
            context={graphContext}
            currentNodeId={node._id}
            isLoading={graphLoading}
            isError={graphError}
            onOpenNode={onOpenGraphNode}
            active
          />
        ) : (
          <div style={{ minHeight: 640 }} />
        ),
    },
    {
      key: "relationships",
      label: "Relationships",
      children:
        activeTab === "relationships" ? (
          <RelationshipGraphTab
            context={graphContext}
            currentNodeId={node._id}
            isLoading={graphLoading}
            isError={graphError}
            onOpenNode={onOpenRelationNode}
            active
          />
        ) : (
          <div style={{ minHeight: 640 }} />
        ),
    },
  ];
}
