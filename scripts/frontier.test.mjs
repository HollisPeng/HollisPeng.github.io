import test from 'node:test';
import assert from 'node:assert/strict';
import { defineFrontier, frontier } from '../src/data/frontier.ts';
import { stepPath } from '../src/data/frontier-path.ts';

const source = 'Epoch AI, retrieved 12 Nov 2026.';
const scale = { kind: 'published', meaning: 'Percent accuracy on GPQA Diamond, from Epoch AI.' };
const model = (name, released, score) => ({ name, released, score, source });
const draft = (models, events = []) => ({ scale, labs: [{ name: 'Example', models }], events });

test('a later model with a lower score is absent and the line does not fall', () => {
  const view = defineFrontier(draft([
    model('First', '2024-01-02', 40),
    model('Weaker follow-up', '2024-06-01', 31.5),
    model('Next record', '2024-08-01', 60),
  ]));
  const line = view.lines[0];
  assert.deepEqual(line.points.map(point => point.name), ['First', 'Next record']);
  assert.equal(line.points.some(point => point.name === 'Weaker follow-up'), false);
  assert.deepEqual(line.points.map(point => point.score), [40, 60]);
  assert.deepEqual(line.points.map(point => point.y), [0.4, 0.6]);
});

test('two models on one day keep the higher score', () => {
  const view = defineFrontier(draft([
    model('Lower', '2024-05-01', 22),
    model('Higher', '2024-05-01', 48),
  ]));
  assert.deepEqual(view.lines[0].points.map(point => point.name), ['Higher']);
  assert.equal(view.lines[0].points[0].score, 48);
});

test('models that tie on one day keep the earlier list entry', () => {
  const view = defineFrontier(draft([
    model('Listed first', '2024-05-01', 50),
    model('Listed second', '2024-05-01', 50),
  ]));
  assert.deepEqual(view.lines[0].points.map(point => point.name), ['Listed first']);
});

test('a date of 2024-02-31 throws', () => {
  assert.throws(() => defineFrontier(draft([model('Bad day', '2024-02-31', 10)])));
});

test('the shipped OpenAI line ends at GPT-5, rises, and has ten points', () => {
  const openai = frontier.lines.find(line => line.name === 'OpenAI');
  assert.ok(openai);
  assert.equal(openai.points.length, 10);
  assert.equal(openai.points[0].name, 'GPT-4');
  assert.equal(openai.points[0].releasedLabel, '13 Jun 2023');
  assert.equal(openai.points[0].x, 0);
  assert.equal(openai.points[9].name, 'GPT-5');
  assert.equal(openai.points[9].score, 85.4);
  assert.equal(openai.points[9].x, 1);
  for (let i = 1; i < openai.points.length; i += 1) assert.ok(openai.points[i].score > openai.points[i - 1].score);
});

test('a line holds its last score flat through the right edge', () => {
  const same = value => value;
  const rising = stepPath([{ x: 0, y: 0.4 }, { x: 0.5, y: 0.8 }], same, same);
  assert.equal(rising, 'M 0 0.4 H 0.5 V 0.8 H 1');
  const alreadyThere = stepPath([{ x: 0, y: 0.2 }, { x: 1, y: 0.9 }], same, same);
  assert.equal(alreadyThere, 'M 0 0.2 H 1 V 0.9');
  for (const line of frontier.lines) {
    const path = stepPath(line.points, same, same);
    const last = line.points.at(-1);
    if (last.x < 1) assert.match(path, / H 1$/);
    else assert.doesNotMatch(path, / H 1$/);
  }
  const xai = frontier.lines.find(line => line.name === 'xAI');
  assert.ok(xai.points.at(-1).x < 1);
  assert.match(stepPath(xai.points, same, same), / H 1$/);
  const openai = frontier.lines.find(line => line.name === 'OpenAI');
  assert.equal(openai.points.at(-1).x, 1);
  assert.doesNotMatch(stepPath(openai.points, same, same), / H 1$/);
});

test('the shipped view has six lines and three events', () => {
  assert.equal(frontier.lines.length, 6);
  assert.equal(frontier.events.length, 3);
  assert.deepEqual(frontier.events.map(event => event.label), ['GPQA Diamond published', 'o1 preview', 'DeepSeek R1 released']);
  assert.equal(frontier.events[0].dateLabel, '20 Nov 2023');
  for (const event of frontier.events) assert.equal(Object.hasOwn(event, 'score'), false);
  const openai = frontier.lines.find(line => line.name === 'OpenAI');
  const preview = frontier.events.find(event => event.label === 'o1 preview');
  assert.equal(preview.x, openai.points.find(point => point.name === 'o1-mini').x);
  const deepseek = frontier.lines.find(line => line.name === 'DeepSeek');
  assert.equal(deepseek.points.some(point => point.name === 'DeepSeek LLM 67B'), true);
  const names = frontier.lines.flatMap(line => line.points.map(point => point.name));
  assert.equal(names.includes('Weaker follow-up'), false);
});
