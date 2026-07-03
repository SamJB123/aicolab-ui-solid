import { For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

interface TreeNode {
  id: string;
  label: JSX.Element;
  children?: TreeNode[];
  expandable?: boolean;
  defaultExpanded?: boolean;
}

interface TreeViewProps {
  nodes: TreeNode[];
  class?: string;
}

interface TreeNodeProps {
  node: TreeNode;
  level?: number;
}

function TreeNodeComponent(props: TreeNodeProps) {
  const children = () => props.node.children ?? [];
  const hasChildren = () => children().length > 0;
  const childLevel = () => (props.level ?? 0) + 1;

  return (
    <Show when={hasChildren()} fallback={<li>{props.node.label}</li>}>
      <Show
        when={props.node.expandable}
        fallback={
          <li>
            {props.node.label}
            <ul>
              <For each={children()}>
                {(child) => (
                  <TreeNodeComponent node={child} level={childLevel()} />
                )}
              </For>
            </ul>
          </li>
        }
      >
        <li>
          <details open={props.node.defaultExpanded}>
            <summary>{props.node.label}</summary>
            <ul>
              <For each={children()}>
                {(child) => (
                  <TreeNodeComponent node={child} level={childLevel()} />
                )}
              </For>
            </ul>
          </details>
        </li>
      </Show>
    </Show>
  );
}

export function TreeView(props: TreeViewProps) {
  return (
    <ul class={["tree-view", props.class]}>
      <For each={props.nodes}>
        {(node) => <TreeNodeComponent node={node} />}
      </For>
    </ul>
  );
}
