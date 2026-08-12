import { createEffect as solidCreateEffect } from 'solid-js'
import type {
	ComputeFunction,
	EffectBundle,
	EffectFunction,
	EffectOptions,
	NoInfer,
} from 'solid-js'

/**
 * Solid 2's strict compute/apply effect contract.
 *
 * Solid currently retains a deprecated one-argument overload returning
 * `never`. TypeScript accepts a call to that overload when its result is
 * discarded, so the runtime-invalid Solid 1 form can otherwise pass `tsc`.
 * This is the same runtime function with only the valid Solid 2 signature in
 * its compile-time surface.
 */
export const createEffect = solidCreateEffect as <T>(
	compute: ComputeFunction<undefined | NoInfer<T>, T>,
	effect: EffectFunction<NoInfer<T>, T> | EffectBundle<NoInfer<T>, T>,
	options?: EffectOptions,
) => void
