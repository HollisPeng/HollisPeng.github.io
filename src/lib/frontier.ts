export type Scale = {
  kind: 'editorial' | 'published';
  meaning: string;
  minScore?: number;
  maxScore?: number;
};

export type ModelCategory = 'Reasoning' | 'Flagship' | 'Open-Weight' | 'Efficient';

export type Model = {
  name: string;
  released: string;
  score: number;
  source: string;
  category?: ModelCategory;
};

export type Lab = {
  id?: string;
  name: string;
  color?: string;
  tint?: string;
  badge?: string;
  models: [Model, ...Model[]];
};

export type FrontierEventDraft = {
  date: string;
  label: string;
  detail?: string;
};

export type FrontierBaselineDraft = {
  score: number;
  label: string;
};

export type FrontierDraft = {
  scale: Scale;
  labs: Lab[];
  events: FrontierEventDraft[];
  baselines?: FrontierBaselineDraft[];
};

export type FrontierPoint = {
  name: string;
  released: string;
  releasedLabel: string;
  score: number;
  source: string;
  category: ModelCategory;
  isFrontier: boolean;
  x: number;
  y: number;
};

export type FrontierLine = {
  id: string;
  name: string;
  color: string;
  tint: string;
  badge: string;
  peakScore: number;
  latestModel: string;
  points: FrontierPoint[];
  allPoints: FrontierPoint[];
};

export type FrontierEvent = {
  label: string;
  detail?: string;
  dateIso: string;
  dateLabel: string;
  x: number;
};

export type FrontierBaseline = {
  label: string;
  score: number;
  y: number;
};

export type FrontierTick = {
  dateIso: string;
  label: string;
  x: number;
};

export type Frontier = {
  scale: {
    kind: 'editorial' | 'published';
    meaning: string;
    minScore: number;
    maxScore: number;
  };
  lines: FrontierLine[];
  events: FrontierEvent[];
  baselines: FrontierBaseline[];
  ticks: FrontierTick[];
  summary: {
    labCount: number;
    totalModels: number;
    frontierModels: number;
    topScore: number;
    topModel: string;
    topLab: string;
  };
};

const dayPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

const dayFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const defaultPalette: { color: string; tint: string }[] = [
  { color: '#1A73E8', tint: '#E8F0FE' }, // Google Blue
  { color: '#10A37F', tint: '#E6F6F2' }, // OpenAI Emerald
  { color: '#D97757', tint: '#FCEEE9' }, // Anthropic Terracotta
  { color: '#202124', tint: '#F1F3F4' }, // xAI Obsidian
  { color: '#4D6BFE', tint: '#EEF2FF' }, // DeepSeek Indigo
  { color: '#7C3AED', tint: '#F3E8FF' }, // Qwen Violet
  { color: '#0891B2', tint: '#ECFEFF' }, // Meta Cyan
  { color: '#F59E0B', tint: '#FEF3C7' }, // Mistral Amber
];

function requireText(value: string, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Blank ${label}`);
  }
  return value.trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseDay(value: string): number {
  const match = dayPattern.exec(value);
  if (!match) throw new Error(`Invalid date ${value}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, date));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== date
  ) {
    throw new Error(`Invalid date ${value}`);
  }
  return utc.getTime();
}

function validateScore(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error('Score out of range');
  }
  return value;
}

function ensureUnique(names: string[], label: string): void {
  const seen = new Set<string>();
  for (const name of names) {
    if (seen.has(name)) throw new Error(`Repeated ${label} ${name}`);
    seen.add(name);
  }
}

type ReadModel = Model & {
  time: number;
  category: ModelCategory;
};

function readModel(model: Model): ReadModel {
  return {
    name: requireText(model.name, 'model name'),
    released: model.released,
    score: validateScore(model.score),
    source: requireText(model.source, 'source'),
    category: model.category ?? 'Flagship',
    time: parseDay(model.released),
  };
}

function sortModels(models: ReadModel[]): ReadModel[] {
  return models
    .map((model, index) => ({ model, index }))
    .sort((a, b) => {
      if (a.model.time !== b.model.time) return a.model.time - b.model.time;
      if (a.model.score !== b.model.score) return b.model.score - a.model.score;
      return a.index - b.index;
    })
    .map(item => item.model);
}

function keepRecords(ordered: ReadModel[]): Set<string> {
  const keptNames = new Set<string>();
  let best = Number.NEGATIVE_INFINITY;
  for (const model of ordered) {
    if (model.score > best) {
      keptNames.add(model.name);
      best = model.score;
    }
  }
  return keptNames;
}

function buildTimelineTicks(
  startMs: number,
  endMs: number,
  xOf: (time: number) => number,
): FrontierTick[] {
  if (endMs <= startMs) return [];
  const startYear = new Date(startMs).getUTCFullYear();
  const endYear = new Date(endMs).getUTCFullYear();
  const candidates: number[] = [];

  for (let year = startYear; year <= endYear + 1; year += 1) {
    for (const month of [1, 7]) {
      const t = Date.UTC(year, month - 1, 1);
      if (t >= startMs && t <= endMs) {
        candidates.push(t);
      }
    }
  }

  return candidates.map(time => {
    const d = new Date(time);
    const iso = d.toISOString().slice(0, 10);
    return {
      dateIso: iso,
      label: monthFormatter.format(time),
      x: xOf(time),
    };
  });
}

/**
 * Generates a forward-angled SVG polyline path (`M x0 y0 L x1 y1 ...`)
 * connecting consecutive points directly rather than stepping vertically.
 */
export function linePath(
  points: { x: number; y: number }[],
  xOf: (x: number) => number,
  yOf: (y: number) => number,
): string {
  const [first, ...rest] = points;
  if (!first) return '';
  let path = `M ${xOf(first.x)} ${yOf(first.y)}`;
  for (const point of rest) {
    path += ` L ${xOf(point.x)} ${yOf(point.y)}`;
  }
  return path;
}

/**
 * Generates a closed SVG area path beneath a polyline down to `baselineY`
 * for subtle gradient shading under a trajectory.
 */
export function areaPath(
  points: { x: number; y: number }[],
  xOf: (x: number) => number,
  yOf: (y: number) => number,
  baselineY: number,
): string {
  if (points.length < 2) return '';
  const first = points[0];
  const last = points[points.length - 1];
  const stroke = linePath(points, xOf, yOf);
  return `${stroke} L ${xOf(last.x)} ${baselineY} L ${xOf(first.x)} ${baselineY} Z`;
}

export function defineFrontier(draft: FrontierDraft): Frontier {
  if (draft.scale.kind !== 'editorial' && draft.scale.kind !== 'published') {
    throw new Error('Invalid scale');
  }
  const meaning = requireText(draft.scale.meaning, 'meaning');
  const minScore = draft.scale.minScore ?? 0;
  const maxScore = draft.scale.maxScore ?? 100;
  if (minScore < 0 || maxScore > 100 || minScore >= maxScore) {
    throw new Error('Invalid scale bounds');
  }

  if (!Array.isArray(draft.labs) || draft.labs.length < 1 || draft.labs.length > 12) {
    throw new Error('Expected one to twelve labs');
  }

  const labs = draft.labs.map((lab, index) => {
    const name = requireText(lab.name, 'lab name');
    if (!Array.isArray(lab.models) || lab.models.length === 0) {
      throw new Error(`Lab ${name} has no models`);
    }
    const fallback = defaultPalette[index % defaultPalette.length];
    const color = lab.color ? requireText(lab.color, 'lab color') : fallback.color;
    if (!hexColorPattern.test(color)) {
      throw new Error(`Invalid lab color ${color}`);
    }
    const tint = lab.tint ? requireText(lab.tint, 'lab tint') : fallback.tint;
    const id = lab.id ? requireText(lab.id, 'lab id') : slugify(name);
    const badge = lab.badge ? requireText(lab.badge, 'lab badge') : name;
    const ordered = sortModels(lab.models.map(readModel));
    const frontierSet = keepRecords(ordered);
    return { id, name, color, tint, badge, ordered, frontierSet };
  });

  ensureUnique(labs.map(lab => lab.name), 'lab');
  ensureUnique(labs.map(lab => lab.id), 'lab id');
  ensureUnique(
    labs.flatMap(lab => lab.ordered.map(model => model.name)),
    'model',
  );

  const events = draft.events
    .map(event => {
      const time = parseDay(event.date);
      return {
        label: requireText(event.label, 'event label'),
        detail: event.detail?.trim(),
        dateIso: event.date,
        time,
      };
    })
    .sort((a, b) => a.time - b.time);

  const allTimes = [
    ...labs.flatMap(lab => lab.ordered.map(model => model.time)),
    ...events.map(event => event.time),
  ];
  const start = Math.min(...allTimes);
  const span = Math.max(...allTimes) - start;
  const xOf = (time: number) => (span === 0 ? 0 : (time - start) / span);
  const scoreSpan = maxScore - minScore;
  const yOf = (score: number) =>
    Math.max(0, Math.min(1, (score - minScore) / scoreSpan));

  const lines: FrontierLine[] = labs.map(lab => {
    const allPoints: FrontierPoint[] = lab.ordered.map(model => ({
      name: model.name,
      released: model.released,
      releasedLabel: dayFormatter.format(model.time),
      score: model.score,
      source: model.source,
      category: model.category,
      isFrontier: lab.frontierSet.has(model.name),
      x: xOf(model.time),
      y: yOf(model.score),
    }));
    const points = allPoints.filter(point => point.isFrontier);
    const lastFrontier = points[points.length - 1];
    return {
      id: lab.id,
      name: lab.name,
      color: lab.color,
      tint: lab.tint,
      badge: lab.badge,
      peakScore: lastFrontier.score,
      latestModel: lastFrontier.name,
      points,
      allPoints,
    };
  });

  const baselines: FrontierBaseline[] = (draft.baselines ?? []).map(b => ({
    label: requireText(b.label, 'baseline label'),
    score: validateScore(b.score),
    y: yOf(b.score),
  }));

  let topScore = Number.NEGATIVE_INFINITY;
  let topModel = '';
  let topLab = '';
  let totalModels = 0;
  let frontierModels = 0;

  for (const line of lines) {
    totalModels += line.allPoints.length;
    frontierModels += line.points.length;
    for (const point of line.allPoints) {
      if (point.score > topScore) {
        topScore = point.score;
        topModel = point.name;
        topLab = line.name;
      }
    }
  }

  return {
    scale: { kind: draft.scale.kind, meaning, minScore, maxScore },
    lines,
    events: events.map(event => ({
      label: event.label,
      detail: event.detail,
      dateIso: event.dateIso,
      dateLabel: dayFormatter.format(event.time),
      x: xOf(event.time),
    })),
    baselines,
    ticks: buildTimelineTicks(start, Math.max(...allTimes), xOf),
    summary: {
      labCount: lines.length,
      totalModels,
      frontierModels,
      topScore,
      topModel,
      topLab,
    },
  };
}
