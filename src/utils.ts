export const sum = (a: number[]) => a.reduce((total, value) => total + value, 0)

export function pop<V>(set: Set<V>): V {
  const [value] = set.entries().next().value as [V, V]
  set.delete(value)
  return value
}
