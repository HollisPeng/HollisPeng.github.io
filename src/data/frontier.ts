export type Scale = { kind: 'editorial' | 'published'; meaning: string };
export type Model = { name: string; released: string; score: number; source: string };
export type Lab = { name: string; models: [Model, ...Model[]] };
export type FrontierEventDraft = { date: string; label: string };
export type FrontierDraft = {
  scale: Scale;
  labs: [Lab] | [Lab, Lab] | [Lab, Lab, Lab] | [Lab, Lab, Lab, Lab] | [Lab, Lab, Lab, Lab, Lab] | [Lab, Lab, Lab, Lab, Lab, Lab];
  events: FrontierEventDraft[];
};
export type FrontierPoint = {
  name: string;
  released: string;
  releasedLabel: string;
  score: number;
  source: string;
  x: number;
  y: number;
};
export type FrontierLine = { name: string; points: FrontierPoint[] };
export type FrontierEvent = { label: string; dateIso: string; dateLabel: string; x: number };
export type Frontier = { scale: Scale; lines: FrontierLine[]; events: FrontierEvent[] };

const day = /^(\d{4})-(\d{2})-(\d{2})$/;
const dayLabel = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function text(value: string, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`Blank ${label}`);
  return value.trim();
}

function parseDay(value: string): number {
  const match = day.exec(value);
  if (!match) throw new Error(`Invalid date ${value}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, date));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== date) throw new Error(`Invalid date ${value}`);
  return utc.getTime();
}

function scoreOf(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error('Score out of range');
  return value;
}

function unique(names: string[], label: string) {
  const seen = new Set<string>();
  for (const name of names) {
    if (seen.has(name)) throw new Error(`Repeated ${label} ${name}`);
    seen.add(name);
  }
}

type ReadModel = Model & { time: number };

function readModel(model: Model): ReadModel {
  return {
    name: text(model.name, 'model name'),
    released: model.released,
    score: scoreOf(model.score),
    source: text(model.source, 'source'),
    time: parseDay(model.released),
  };
}

function keepRecords(models: ReadModel[]): ReadModel[] {
  const ordered = models.map((model, index) => ({ model, index })).sort((a, b) => {
    if (a.model.time !== b.model.time) return a.model.time - b.model.time;
    if (a.model.score !== b.model.score) return b.model.score - a.model.score;
    return a.index - b.index;
  });
  const kept: ReadModel[] = [];
  let best = Number.NEGATIVE_INFINITY;
  for (const item of ordered) {
    if (item.model.score > best) {
      kept.push(item.model);
      best = item.model.score;
    }
  }
  return kept;
}

export function defineFrontier(draft: FrontierDraft): Frontier {
  if (draft.scale.kind !== 'editorial' && draft.scale.kind !== 'published') throw new Error('Invalid scale');
  const meaning = text(draft.scale.meaning, 'meaning');
  const labs = draft.labs.map(lab => {
    const name = text(lab.name, 'lab name');
    if (lab.models.length === 0) throw new Error(`Lab ${name} has no models`);
    return { name, models: lab.models.map(readModel) };
  });
  if (labs.length < 1 || labs.length > 6) throw new Error('Expected one to six labs');
  unique(labs.map(lab => lab.name), 'lab');
  unique(labs.flatMap(lab => lab.models.map(model => model.name)), 'model');
  const keptByLab = labs.map(lab => keepRecords(lab.models));
  const events = draft.events.map(event => {
    const time = parseDay(event.date);
    return { label: text(event.label, 'event label'), dateIso: event.date, time };
  }).sort((a, b) => a.time - b.time);
  const times = [...keptByLab.flatMap(models => models.map(model => model.time)), ...events.map(event => event.time)];
  const start = Math.min(...times);
  const span = Math.max(...times) - start;
  const xOf = (time: number) => span === 0 ? 0 : (time - start) / span;
  const yOf = (score: number) => score / 100;
  return {
    scale: { kind: draft.scale.kind, meaning },
    lines: labs.map((lab, index) => ({
      name: lab.name,
      points: keptByLab[index].map(model => ({
        name: model.name,
        released: model.released,
        releasedLabel: dayLabel.format(model.time),
        score: model.score,
        source: model.source,
        x: xOf(model.time),
        y: yOf(model.score),
      })),
    })),
    events: events.map(event => ({
      label: event.label,
      dateIso: event.dateIso,
      dateLabel: dayLabel.format(event.time),
      x: xOf(event.time),
    })),
  };
}

const source = 'Epoch AI, retrieved 12 Nov 2026.';
const model = (name: string, released: string, score: number): Model => ({ name, released, score, source });
const draft = {
  scale: { kind: 'published', meaning: 'Percent accuracy on GPQA Diamond, from Epoch AI.' },
  labs: [
    {
      name: 'OpenAI',
      models: [
        model('GPT-4', '2023-06-13', 30.7),
        model('GPT-4 Turbo', '2023-11-06', 42.4),
        model('GPT-4 Turbo (Apr 2024)', '2024-04-09', 46.6),
        model('GPT-4o', '2024-05-13', 48.9),
        model('GPT-4o (Aug 2024)', '2024-08-06', 49.2),
        model('o1-mini', '2024-09-12', 62.4),
        model('o1', '2024-12-17', 76.8),
        model('o3-mini', '2025-01-31', 77.0),
        model('o3', '2025-04-16', 81.8),
        model('GPT-5', '2025-08-07', 85.4),
      ],
    },
    {
      name: 'Anthropic',
      models: [
        model('Claude 2', '2023-07-11', 34.7),
        model('Claude 3 Opus', '2024-02-29', 47.2),
        model('Claude 3.5 Sonnet', '2024-06-20', 54.0),
        model('Claude 3.5 Sonnet (Oct 2024)', '2024-10-22', 55.3),
        model('Claude 3.7 Sonnet', '2025-02-24', 79.7),
      ],
    },
    {
      name: 'Google DeepMind',
      models: [
        model('Gemini 1.0 Pro', '2024-02-15', 34.0),
        model('Gemini 1.5 Flash', '2024-05-23', 40.4),
        model('Gemini 1.5 Pro', '2024-05-24', 45.9),
        model('Gemini 1.5 Pro (Sep 2024)', '2024-09-24', 57.2),
        model('Gemini 2.0 Pro', '2025-02-05', 65.7),
        model('Gemini 2.5 Pro', '2025-03-25', 83.8),
        model('Gemini 2.5 Pro (Jun 2025)', '2025-06-05', 84.8),
      ],
    },
    {
      name: 'Meta',
      models: [
        model('Llama 2 70B', '2023-07-18', 26.3),
        model('Llama 3 70B', '2024-04-18', 40.6),
        model('Llama 3.1 405B', '2024-07-23', 50.9),
        model('Llama 4 Maverick', '2025-04-05', 67.0),
      ],
    },
    {
      name: 'DeepSeek',
      models: [
        model('DeepSeek LLM 67B', '2023-11-29', 24.6),
        model('DeepSeek V3', '2024-12-26', 56.5),
        model('DeepSeek R1', '2025-01-20', 71.7),
        model('DeepSeek R1 (May 2025)', '2025-05-28', 76.3),
      ],
    },
    {
      name: 'xAI',
      models: [
        model('Grok 2', '2024-12-12', 53.8),
        model('Grok 3 mini', '2025-04-09', 76.3),
        model('Grok 4', '2025-07-09', 87.0),
      ],
    },
  ],
  events: [
    { date: '2023-11-20', label: 'GPQA Diamond published' },
    { date: '2024-09-12', label: 'o1 preview' },
    { date: '2025-01-20', label: 'DeepSeek R1 released' },
  ],
} satisfies FrontierDraft;

export const frontier = defineFrontier(draft);
