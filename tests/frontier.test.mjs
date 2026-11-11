import test from 'node:test';
import assert from 'node:assert/strict';
import { defineFrontier, linePath, areaPath } from '../src/lib/frontier.ts';
import { frontier } from '../src/data/frontier-models.ts';

const source = 'Epoch AI & Technical Reports';
const scale = {
  kind: 'published',
  meaning: 'Accuracy (%) on GPQA Diamond.',
  minScore: 0,
  maxScore: 100,
};
const model = (name, released, score, category = 'Flagship') => ({
  name,
  released,
  score,
  category,
  source,
});
const draft = (models, events = []) => ({
  scale,
  labs: [{ name: 'Example', color: '#1A73E8', models }],
  events,
});

test('a later model with a lower score is preserved in allPoints while points keeps only rising records', () => {
  const view = defineFrontier(
    draft([
      model('First', '2024-01-02', 40),
      model('Efficient follow-up', '2024-06-01', 31.5, 'Efficient'),
      model('Next record', '2024-08-01', 60),
    ]),
  );
  const line = view.lines[0];
  assert.deepEqual(
    line.points.map(point => point.name),
    ['First', 'Next record'],
  );
  assert.deepEqual(
    line.allPoints.map(point => point.name),
    ['First', 'Efficient follow-up', 'Next record'],
  );
  assert.equal(
    line.allPoints.find(p => p.name === 'Efficient follow-up').isFrontier,
    false,
  );
  assert.deepEqual(
    line.points.map(point => point.score),
    [40, 60],
  );
  assert.deepEqual(
    line.points.map(point => point.y),
    [0.4, 0.6],
  );
});

test('two models on one day keep the higher score on the frontier trajectory', () => {
  const view = defineFrontier(
    draft([
      model('Lower', '2024-05-01', 22),
      model('Higher', '2024-05-01', 48),
    ]),
  );
  assert.deepEqual(
    view.lines[0].points.map(point => point.name),
    ['Higher'],
  );
  assert.equal(view.lines[0].points[0].score, 48);
  assert.equal(view.lines[0].allPoints.length, 2);
});

test('models that tie on one day keep the earlier list entry as the frontier record', () => {
  const view = defineFrontier(
    draft([
      model('Listed first', '2024-05-01', 50),
      model('Listed second', '2024-05-01', 50),
    ]),
  );
  assert.deepEqual(
    view.lines[0].points.map(point => point.name),
    ['Listed first'],
  );
});

test('an invalid calendar date or malformed lab hex color throws', () => {
  assert.throws(() =>
    defineFrontier(draft([model('Bad day', '2024-02-31', 10)])),
  );
  assert.throws(() =>
    defineFrontier({
      scale,
      labs: [{ name: 'BadColor', color: 'not-a-hex', models: [model('M', '2024-01-01', 50)] }],
      events: [],
    }),
  );
});

test('linePath builds a forward-angling polyline (L commands) without vertical step jumps (H/V)', () => {
  const same = value => value;
  const path = linePath(
    [
      { x: 0, y: 0.3 },
      { x: 0.4, y: 0.6 },
      { x: 1, y: 0.9 },
    ],
    same,
    same,
  );
  assert.equal(path, 'M 0 0.3 L 0.4 0.6 L 1 0.9');
  assert.doesNotMatch(path, /\b[HV]\b/);

  const area = areaPath(
    [
      { x: 0, y: 0.3 },
      { x: 1, y: 0.9 },
    ],
    same,
    same,
    1,
  );
  assert.equal(area, 'M 0 0.3 L 1 0.9 L 1 1 L 0 1 Z');
});

test('the shipped frontier dataset covers 8 AI labs with distinct brand colors and 70+ models', () => {
  assert.equal(frontier.lines.length, 8);
  assert.ok(frontier.summary.totalModels >= 70);
  assert.ok(frontier.summary.frontierModels >= 55);

  const colors = frontier.lines.map(line => line.color.toUpperCase());
  assert.equal(new Set(colors).size, frontier.lines.length);

  for (const line of frontier.lines) {
    assert.ok(line.points.length >= 5, `${line.name} should have at least 5 frontier points`);
    for (let i = 1; i < line.points.length; i += 1) {
      assert.ok(
        line.points[i].score > line.points[i - 1].score,
        `${line.name} frontier must strictly rise`,
      );
      assert.ok(
        line.points[i].x >= line.points[i - 1].x,
        `${line.name} frontier must move forward in time`,
      );
    }
  }

  assert.ok(frontier.ticks.length >= 4);
  assert.equal(frontier.baselines.length, 2);
  assert.equal(frontier.events.length, 4);
});
