import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Button } from "./Button";

interface TabPanel {
  id: string;
  title: string;
  content: JSX.Element;
}

interface TabsProps {
  tabs: TabPanel[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  class?: string;
}

export function Tabs(props: TabsProps) {
  const [activeTab, setActiveTab] = createSignal(
    props.defaultActiveTab || props.tabs[0]?.id,
  );

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    props.onTabChange?.(tabId);
  };

  return (
    <section class={["tabs", props.class]}>
      <menu role="tablist">
        <For each={props.tabs}>
          {(tab) => (
            <Button
              role="tab"
              aria-controls={tab.id}
              aria-selected={activeTab() === tab.id ? "true" : "false"}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.title}
            </Button>
          )}
        </For>
      </menu>
      <For each={props.tabs}>
        {(tab) => (
          <article role="tabpanel" id={tab.id} hidden={activeTab() !== tab.id}>
            {tab.content}
          </article>
        )}
      </For>
    </section>
  );
}
