export function partition<T>(array: T[], predicate: (item: T) => boolean) {
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

export function getBaseUrl() {
  return process.env.FLY_APP_NAME
    ? `https://${process.env.FLY_APP_NAME}.fly.dev`
    : "http://localhost:3000";
}
