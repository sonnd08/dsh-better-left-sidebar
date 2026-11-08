/**
 * Join class names and leave out the false values.
 * @param names - class names.
 * @returns the `className` value.
 */
export function classes(...names: readonly (string | false | undefined)[]): string {
  return names.filter(Boolean).join(' ')
}
