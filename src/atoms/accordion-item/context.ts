import { createContext, useContext, type Accessor } from 'solid-js'

/** Composition protocol for containers that coordinate AccordionItem atoms. */
export type AccordionItemContextValue = {
	group: Accessor<string | undefined>
}

/**
 * A standalone AccordionItem is a complete native <details> disclosure.
 * Containers may provide a group name to coordinate several items, but the
 * atom must not require that optional composition layer.
 */
const standaloneAccordionItemContext: AccordionItemContextValue = {
	group: () => undefined,
}

export const AccordionItemContext = createContext<AccordionItemContextValue>(standaloneAccordionItemContext)
export const useAccordionItemContext = () => useContext(AccordionItemContext)
