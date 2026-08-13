import { createContext, useContext, type Accessor } from 'solid-js'
import type { ColorTreatmentProps } from '../../shared/color-treatment'

/** Composition protocol for containers that coordinate AccordionItem atoms. */
export type AccordionItemContextValue = {
	group: Accessor<string | undefined>
	/** Collection-level colour treatment; items use it as their per-prop
	 *  default (an item's own treatment props win). */
	treatment: Accessor<ColorTreatmentProps>
}

/**
 * A standalone AccordionItem is a complete native <details> disclosure.
 * Containers may provide a group name to coordinate several items, but the
 * atom must not require that optional composition layer.
 */
const standaloneAccordionItemContext: AccordionItemContextValue = {
	group: () => undefined,
	treatment: () => ({}),
}

export const AccordionItemContext = createContext<AccordionItemContextValue>(standaloneAccordionItemContext)
export const useAccordionItemContext = () => useContext(AccordionItemContext)
