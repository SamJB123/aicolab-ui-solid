/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createSignal, For, omit, Show } from 'solid-js'
import { Chip } from '../../atoms/chip'
import { IconButton } from '../../atoms/icon-button'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

export type DataGridCellKind = 'text' | 'select' | 'multi' | 'readonly'

export interface DataGridColumn {
	key: string
	label: string
	/** How the cell edits: free text, one of `options`, several values, or not at all. */
	kind?: DataGridCellKind
	options?: readonly string[]
	/** Column-header tooltip. */
	hint?: string
	width?: string
}

export interface DataGridCell {
	values: string[]
	/** Where the value came from (`human`, `manifest`, `derived`…) — rendered as
	 *  a data attribute for the stylesheet and a title for the reader. */
	provenance?: string
}

export interface DataGridChild {
	id: string
	label: string
	detail?: string
}

export interface DataGridRow {
	id: string
	title: string
	subtitle?: string
	/** Row is switched off (excluded) — rendered dimmed, still editable. */
	muted?: boolean
	cells: Record<string, DataGridCell | undefined>
	/** Nested items under the row (e.g. an entity's documents). */
	children?: DataGridChild[]
}

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-grid', {
	gap: '<length>',
	radius: '<length-percentage>',
	pad: '<length>',
})

type DataGridProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> & {
	class?: ClassProp
	label: string
	columns: DataGridColumn[]
	rows: DataGridRow[]
	/** Header for the row-title column. */
	titleLabel?: string
	/** Row selection (checkbox column) — controlled. */
	selected?: string[]
	onSelect?: (ids: string[]) => void
	onEditCell?: (rowId: string, key: string, values: string[]) => void
	onRenameRow?: (rowId: string, title: string) => void
	/** The row title is a link-like button that opens the record (single click); renaming stays on double-click. */
	onOpenRow?: (rowId: string) => void
	onToggleMuted?: (rowId: string, muted: boolean) => void
	/** A child may be moved to another row (renders a target picker). */
	onMoveChild?: (childId: string, toRowId: string) => void
	/** Extra per-row actions, rendered at the row end. */
	rowActions?: (row: DataGridRow) => JSX.Element
	emptyMessage?: string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

interface Editing {
	rowId: string
	key: string
}

/**
 * An editable grid: one row per record, one column per attribute, cells
 * multi-valued with provenance. Click a cell to edit (Enter commits, Escape
 * cancels); double-click a title to rename; children nest under their row.
 * Controlled — the caller owns rows and applies edits.
 */
export function DataGrid(props: DataGridProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'label',
		'columns',
		'rows',
		'titleLabel',
		'selected',
		'onSelect',
		'onEditCell',
		'onRenameRow',
		'onOpenRow',
		'onToggleMuted',
		'onMoveChild',
		'rowActions',
		'emptyMessage',
		'colorBase',
		'colorLevel',
		'variant',
		'gap',
		'radius',
		'pad',
	)
	const [editing, setEditing] = createSignal<Editing | null>(null)
	const [renaming, setRenaming] = createSignal<string | null>(null)
	const [expanded, setExpanded] = createSignal<Set<string>>(new Set())
	const isSelected = (id: string) => (props.selected ?? []).includes(id)
	const toggleSelected = (id: string) => {
		const current = props.selected ?? []
		props.onSelect?.(current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
	}
	const toggleExpanded = (id: string) =>
		setExpanded((set) => {
			const next = new Set(set)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	const commit = (row: DataGridRow, column: DataGridColumn, raw: string) => {
		const values = column.kind === 'multi' ? raw.split(/[,;]/).map((v) => v.trim()).filter(Boolean) : raw.trim() ? [raw.trim()] : []
		props.onEditCell?.(row.id, column.key, values)
		setEditing(null)
	}
	const editable = (column: DataGridColumn) => column.kind !== 'readonly' && !!props.onEditCell
	const columnCount = () => props.columns.length + 1 + (props.onSelect ? 1 : 0) + (props.rowActions || props.onToggleMuted ? 1 : 0)

	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-grid', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			<table class="ui-grid-table" aria-label={props.label}>
				<thead>
					<tr>
						<Show when={props.onSelect}>
							<th class="ui-grid-select" scope="col">
								<span class="ui-grid-visually-hidden">Select</span>
							</th>
						</Show>
						<th scope="col" class="ui-grid-title-head">
							{props.titleLabel ?? 'Name'}
						</th>
						<For each={props.columns}>
							{(column) => (
								<th scope="col" title={column.hint} style={column.width ? { width: column.width } : undefined}>
									{column.label}
								</th>
							)}
						</For>
						<Show when={props.rowActions || props.onToggleMuted}>
							<th scope="col" class="ui-grid-actions-head">
								<span class="ui-grid-visually-hidden">Actions</span>
							</th>
						</Show>
					</tr>
				</thead>
				<tbody>
					<Show when={props.rows.length === 0}>
						<tr>
							<td class="ui-grid-empty" colspan={columnCount()}>
								{props.emptyMessage ?? 'Nothing here yet.'}
							</td>
						</tr>
					</Show>
					<For each={props.rows}>
						{(row) => (
							<>
								<tr class="ui-grid-row" data-muted={row.muted ? '' : undefined} data-selected={isSelected(row.id) ? '' : undefined}>
									<Show when={props.onSelect}>
										<td class="ui-grid-select">
											<input type="checkbox" checked={isSelected(row.id)} aria-label={`Select ${row.title}`} onChange={() => toggleSelected(row.id)} />
										</td>
									</Show>
									<th scope="row" class="ui-grid-title">
										<div class="ui-grid-title-line">
											<Show when={row.children?.length}>
												<button type="button" class="ui-grid-disclose" aria-expanded={expanded().has(row.id) ? 'true' : 'false'} aria-label={`${expanded().has(row.id) ? 'Hide' : 'Show'} ${row.children!.length} items in ${row.title}`} onClick={() => void toggleExpanded(row.id)}>
													{expanded().has(row.id) ? '▾' : '▸'}
												</button>
											</Show>
											<Show
												when={renaming() === row.id}
												fallback={
													<Show
														when={props.onOpenRow}
														fallback={
															<span
																class="ui-grid-title-text"
																data-editable={props.onRenameRow ? '' : undefined}
																title={props.onRenameRow ? 'Double-click to rename' : undefined}
																onDblClick={() => props.onRenameRow && setRenaming(row.id)}
															>
																{row.title}
															</span>
														}
													>
														{(open) => (
															<button
																type="button"
																class="ui-grid-title-text ui-grid-open"
																data-editable={props.onRenameRow ? '' : undefined}
																title={props.onRenameRow ? 'Click to open, double-click to rename' : 'Open'}
																onClick={() => open()(row.id)}
																onDblClick={() => props.onRenameRow && setRenaming(row.id)}
															>
																{row.title}
															</button>
														)}
													</Show>
												}
											>
												<input
													class="ui-grid-input"
													value={row.title}
													aria-label={`Rename ${row.title}`}
													ref={(el) => queueMicrotask(() => el.focus())}
													onKeyDown={(event) => {
														if (event.key === 'Enter') {
															props.onRenameRow?.(row.id, event.currentTarget.value)
															setRenaming(null)
														}
														if (event.key === 'Escape') setRenaming(null)
													}}
													onBlur={(event) => {
														if (renaming() === row.id) {
															props.onRenameRow?.(row.id, event.currentTarget.value)
															setRenaming(null)
														}
													}}
												/>
											</Show>
											<Show when={row.children?.length}>
												<span class="ui-grid-count">{row.children!.length}</span>
											</Show>
										</div>
										<Show when={row.subtitle}>
											<span class="ui-grid-subtitle">{row.subtitle}</span>
										</Show>
									</th>
									<For each={props.columns}>
										{(column) => {
											const cell = () => row.cells[column.key]
											const active = () => editing()?.rowId === row.id && editing()?.key === column.key
											return (
												<td
													class="ui-grid-cell"
													data-provenance={cell()?.provenance}
													data-editable={editable(column) ? '' : undefined}
													data-editing={active() ? '' : undefined}
													title={cell()?.provenance ? `Source: ${cell()!.provenance}` : undefined}
													onClick={() => editable(column) && !active() && setEditing({ rowId: row.id, key: column.key })}
												>
													<Show
														when={active()}
														fallback={
															<span class="ui-grid-values">
																<For each={cell()?.values ?? []}>{(value) => <Chip class="ui-grid-chip">{value}</Chip>}</For>
																<Show when={!(cell()?.values.length)}>
																	<span class="ui-grid-blank">—</span>
																</Show>
															</span>
														}
													>
														<Show
															when={column.kind === 'select'}
															fallback={
																<input
																	class="ui-grid-input"
																	value={(cell()?.values ?? []).join(', ')}
																	list={column.options?.length ? `ui-grid-options-${column.key}` : undefined}
																	aria-label={`${column.label} for ${row.title}`}
																	placeholder={column.kind === 'multi' ? 'value, value' : undefined}
																	ref={(el) => queueMicrotask(() => el.focus())}
																	onKeyDown={(event) => {
																		if (event.key === 'Enter') commit(row, column, event.currentTarget.value)
																		if (event.key === 'Escape') setEditing(null)
																	}}
																	onBlur={(event) => active() && commit(row, column, event.currentTarget.value)}
																/>
															}
														>
															<select
																class="ui-grid-input"
																aria-label={`${column.label} for ${row.title}`}
																ref={(el) => queueMicrotask(() => el.focus())}
																onChange={(event) => commit(row, column, event.currentTarget.value)}
																onBlur={() => setEditing(null)}
																onKeyDown={(event) => event.key === 'Escape' && setEditing(null)}
															>
																<option value="" selected={!cell()?.values.length}>
																	—
																</option>
																<For each={column.options ?? []}>
																	{(option) => (
																		<option value={option} selected={cell()?.values[0] === option}>
																			{option}
																		</option>
																	)}
																</For>
															</select>
														</Show>
													</Show>
												</td>
											)
										}}
									</For>
									<Show when={props.rowActions || props.onToggleMuted}>
										<td class="ui-grid-actions">
											<Show when={props.onToggleMuted}>
												<IconButton
													size="sm"
													variant="ghost"
													label={row.muted ? `Include ${row.title}` : `Exclude ${row.title}`}
													aria-pressed={row.muted ? 'true' : 'false'}
													onClick={() => props.onToggleMuted?.(row.id, !row.muted)}
												>
													{row.muted ? '◌' : '●'}
												</IconButton>
											</Show>
											{props.rowActions?.(row)}
										</td>
									</Show>
								</tr>
								<Show when={expanded().has(row.id)}>
									<For each={row.children}>
										{(child) => (
											<tr class="ui-grid-child" data-muted={row.muted ? '' : undefined}>
												<Show when={props.onSelect}>
													<td />
												</Show>
												<td class="ui-grid-child-label" colspan={props.columns.length + 1}>
													<span class="ui-grid-child-name">{child.label}</span>
													<Show when={child.detail}>
														<span class="ui-grid-child-detail">{child.detail}</span>
													</Show>
												</td>
												<Show when={props.rowActions || props.onToggleMuted}>
													<td class="ui-grid-actions">
														<Show when={props.onMoveChild && props.rows.length > 1}>
															<select
																class="ui-grid-move"
																aria-label={`Move ${child.label} to`}
																onChange={(event) => {
																	if (event.currentTarget.value) props.onMoveChild?.(child.id, event.currentTarget.value)
																	event.currentTarget.value = ''
																}}
															>
																<option value="">Move to…</option>
																<For each={props.rows.filter((r) => r.id !== row.id)}>{(target) => <option value={target.id}>{target.title}</option>}</For>
															</select>
														</Show>
													</td>
												</Show>
											</tr>
										)}
									</For>
								</Show>
							</>
						)}
					</For>
				</tbody>
			</table>
			<For each={props.columns.filter((c) => c.options?.length && c.kind !== 'select')}>
				{(column) => (
					<datalist id={`ui-grid-options-${column.key}`}>
						<For each={column.options}>{(option) => <option value={option} />}</For>
					</datalist>
				)}
			</For>
		</div>
	)
}
