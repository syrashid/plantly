export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function makePluralizer(singular: string, plural?: string) {
  return (count: number) => pluralize(count, singular, plural);
}

export const pluralizeDays = makePluralizer("day");
export const pluralizePlants = makePluralizer("plant");
