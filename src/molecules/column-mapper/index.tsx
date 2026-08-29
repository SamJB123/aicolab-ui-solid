/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createUniqueId, For, omit, Show } from 'solid-js'
import { Chip } from '../../atoms/chip'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

export interface ColumnMapperRole {
	value: string
	label: string
	description?: string
}

export interface ColumnMapperColumn {
	column: string
	/** A few distinct values, for recognition. */
	samples: string[]
	role: string
	/** Target attribute name when `role` is the attribute role. */
	target?: string
	granularity?: 'entity' | 'document'
	/** The target was recognised (name or vocabulary) rather than invented. */
	matched?: boolean
	/** Values outside the target's known vocabulary. */
	unknownValues?: string[]
	/** 0..1 confidence of the proposal. */
	confidence?: number
}

export interface ColumnMapperPatch {
	role?: string
	target?: string
	granularity?: 'entity' | 'document'
}

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-mapper', {
	gap: '<length>',
	radius: '<length-percentage>',
	pad: '<length>',
})

type ColumnMapperProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'onChange'> & {
	class?: ClassProp
	label: string
	columns: ColumnMapperColumn[]
	roles: ColumnMapperRole[]
	/** The role whose rows get a target picker (defaults to 'facet'). */
	attributeRole?: string
	/** Known target names offered as suggestions. */
	targets?: string[]
	granularityLabels?: { entity: string; document: string }
	onChange: (column: string, patch: ColumnMapperPatch) => void
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * Map the columns of an uploaded table onto roles: one row per column with
 * its sample values, a role picker, and — for attribute columns — the target
 * name and its granularity. Controlled; proposals arrive as `columns`.
 */
export function ColumnMapper(props: ColumnMapperProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'label',
		'columns',
		'roles',
		'attributeRole',
		'targets',
		'granularityLabels',
		'onChange',
		'colorBase',
		'colorLevel',
		'variant',
		'gap',
		'radius',
		'pad',
	)
	const attributeRole = () => props.attributeRole ?? 'facet'
	const labels = () => props.granularityLabels ?? { entity: 'Per entity', document: 'Per document' }
	const listId = `ui-mapper-targets-${createUniqueId()}`
	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-mapper', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			role="group"
			aria-label={props.label}
		>
			<For each={props.columns}>
				{(column) => (
					<div class="ui-mapper-row" data-role={column.role} data-matched={column.matched ? '' : undefined}>
						<div class="ui-mapper-source">
							<span class="ui-mapper-column">{column.column}</span>
							<span class="ui-mapper-samples">
								<For each={column.samples.slice(0, 4)}>{(sample) => <Chip class="ui-mapper-sample">{sample}</Chip>}</For>
							</span>
						</div>
						<label class="ui-mapper-field">
							<span class="ui-mapper-field-label">Use as</span>
							<select class="ui-mapper-select" value={column.role} onChange={(event) => props.onChange(column.column, { role: event.currentTarget.value })}>
								<For each={props.roles}>
									{(role) => (
										<option value={role.value} selected={role.value === column.role} title={role.description}>
											{role.label}
										</option>
									)}
								</For>
							</select>
						</label>
						<Show when={column.role === attributeRole()}>
							<label class="ui-mapper-field">
								<span class="ui-mapper-field-label">Attribute</span>
								<input
									class="ui-mapper-input"
									value={column.target ?? ''}
									list={props.targets?.length ? listId : undefined}
									onChange={(event) => props.onChange(column.column, { target: event.currentTarget.value })}
								/>
							</label>
							<div class="ui-mapper-field" role="radiogroup" aria-label={`Granularity of ${column.column}`}>
								<span class="ui-mapper-field-label">Applies</span>
								<span class="ui-mapper-granularity">
									<For each={['entity', 'document'] as const}>
										{(g) => (
											<button type="button" class="ui-mapper-toggle" role="radio" aria-checked={column.granularity === g ? 'true' : 'false'} onClick={() => props.onChange(column.column, { granularity: g })}>
												{labels()[g]}
											</button>
										)}
									</For>
								</span>
							</div>
						</Show>
						<div class="ui-mapper-status">
							<Show when={column.confidence !== undefined}>
								<span class="ui-mapper-confidence" data-level={column.confidence! >= 0.9 ? 'high' : column.confidence! >= 0.6 ? 'mid' : 'low'} title={`Confidence ${Math.round((column.confidence ?? 0) * 100)}%`} />
							</Show>
							<Show when={column.matched}>
								<span class="ui-mapper-note">recognised</span>
							</Show>
							<Show when={column.unknownValues?.length}>
								<span class="ui-mapper-warn" title={column.unknownValues!.join(', ')}>
									{column.unknownValues!.length} value{column.unknownValues!.length === 1 ? '' : 's'} outside the vocabulary
								</span>
							</Show>
						</div>
					</div>
				)}
			</For>
			<Show when={props.targets?.length}>
				<datalist id={listId}>
					<For each={props.targets}>{(target) => <option value={target} />}</For>
				</datalist>
			</Show>
		</div>
	)
}
