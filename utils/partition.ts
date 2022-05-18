export default function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
) {
  const matches = [];
  const nonMatches = [];
  for (const item of array) {
    if (predicate(item)) {
      matches.push(item);
    } else {
      nonMatches.push(item);
    }
  }
  return [matches, nonMatches] as const;
}
