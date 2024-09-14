import {
  Handle,
  Position,
  Node,
  HandleProps,
} from '@xyflow/react';
import { WorkflowAction } from "../types";
import { TriggerProps, Direction } from "./Editor";
import { useProvider } from './Provider';

export type BlankNodeType = Node<{ parent: Node }>;

export const NewBlankNode = (parent: Node): BlankNodeType => ({
  id: '$blank',
  type: 'blank',
  position: { x: 0, y: 0 },
  data: {
    parent: parent
  }
})

export type TriggerNodeProps = TriggerProps & {
  direction: Direction;
  node: Node;
};

/**
 * TriggerNode represents the trigger of the workflow.
 * 
 * @param trigger - The trigger within the workflow.
 * @param direction - The direction of the workflow, used to determine how handles are placed.
 */
export const TriggerNode = ({ trigger, node, direction }: TriggerNodeProps) => {
  const { selectedNode } = useProvider();

  const isSelected = selectedNode?.type === "trigger";

  return (
    <div
      className={`wf-node wf-trigger-node wf-cursor-pointer ${isSelected ? "wf-node-selected" : ""}`}
    >
      <p>{ trigger === undefined ? "Select a trigger" : trigger?.event?.name }</p>
      { trigger && <AddHandle {...sourceHandleProps(direction)} node={node}/> }
    </div>
  );
}

export type ActionNodeProps = {
  action: WorkflowAction,
  node: Node,
  direction: Direction
}

/**
 * ActionNode represents a single action in the workflow.
 * 
 * @param action - The action within the workflow that this node represents.
 * @param direction - The direction of the workflow, used to determine how handles are placed.
 */
export const ActionNode = ({ action, node, direction }: ActionNodeProps) => {
  const { selectedNode, availableActions } = useProvider();
  const engineAction = availableActions.find(a => a.kind === action.kind);

  const isSelected = selectedNode?.type === "action" && selectedNode.id === node.id;

  return (
    <div
      className={`wf-node wf-action-node ${isSelected ? "wf-node-selected" : ""}`}
    >
        <Handle {...targetHandleProps(direction)} />
        {action.name || engineAction?.name || action.kind}
        <AddHandle {...sourceHandleProps(direction)} node={node} />
    </div>
  );
}

/**
 * BlankNode is a placeholder node, used as a placeholder for users to select
 * an action after hitting the "Add Action" handle.
 * 
 * BlankNodes are temporary;  the state is stored in the provider context.  As
 * soon as a click happens outside of blank node the blank node is deleted.
 */
export const BlankNode = ({ direction }: { direction: Direction }) => {
  return (
    <div className="wf-node wf-blank-node">
      <Handle {...targetHandleProps(direction)} />
    </div>
  );
}

const AddHandle = (props: HandleProps & { node: Node }) => {
  const { node, ...rest } = props;
  const { setBlankNode, setSelectedNode } = useProvider();

  return (
    <Handle {...rest} className="wf-add-handle" onClick={() => {
      const blankNode = NewBlankNode(node);
      setBlankNode(blankNode);
      setSelectedNode(blankNode);
    }}>
      <div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Handle>
  );
}

const targetHandleProps = (direction: Direction): HandleProps => {
  return {
    type: "target",
    position: direction === "down" ? Position.Top : Position.Left,
    className: "wf-target-handle",
  }
}

const sourceHandleProps = (direction: Direction): HandleProps => {
  return {
    type: "source",
    position: direction === "down" ? Position.Bottom : Position.Right,
  }
}