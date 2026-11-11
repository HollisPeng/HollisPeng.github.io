export function stepPath(
  points: { x: number; y: number }[],
  xOf: (x: number) => number,
  yOf: (y: number) => number,
): string {
  const [first, ...rest] = points;
  if (!first) return '';
  let path = `M ${xOf(first.x)} ${yOf(first.y)}`;
  for (const point of rest) path += ` H ${xOf(point.x)} V ${yOf(point.y)}`;
  const last = rest.at(-1) ?? first;
  if (last.x < 1) path += ` H ${xOf(1)}`;
  return path;
}
