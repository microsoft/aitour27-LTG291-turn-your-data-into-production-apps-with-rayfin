const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  HEADERS,
  HERO_LOW_STOCK_ASSIGNMENTS,
  OUTPUT_DIR,
  SALES_DAYS,
  buildDataset,
  datasetToFiles,
  escapeCsvValue,
  writeDataset,
} = require('../generate.js');

function digest(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function lineCount(content) {
  return content.trimEnd().split('\n').length;
}

test('buildDataset returns the expected table sizes', () => {
  const dataset = buildDataset();

  assert.equal(dataset.stores.length, 15);
  assert.equal(dataset.products.length, 60);
  assert.equal(dataset.inventory.length, 15 * 60);
  assert.equal(dataset.sales.length, SALES_DAYS * 15 * 60);
  assert.equal(dataset.restock_requests.length, 0);

  assert.deepEqual(Object.keys(dataset.stores[0]), HEADERS.stores);
  assert.deepEqual(Object.keys(dataset.products[0]), HEADERS.products);
  assert.deepEqual(Object.keys(dataset.inventory[0]), HEADERS.inventory);
  assert.deepEqual(Object.keys(dataset.sales[0]), HEADERS.sales);
});

test('csv serialization is deterministic and escapes reserved characters', () => {
  const snapshotA = datasetToFiles(buildDataset());
  const snapshotB = datasetToFiles(buildDataset());

  assert.deepEqual(
    Object.fromEntries(Object.entries(snapshotA).map(([name, content]) => [name, digest(content)])),
    Object.fromEntries(Object.entries(snapshotB).map(([name, content]) => [name, digest(content)])),
  );

  assert.equal(
    escapeCsvValue('Hero, "quoted"\nvalue'),
    '"Hero, ""quoted""\nvalue"',
  );
});

test('hero low-stock pairs stay reproducibly obvious', () => {
  const dataset = buildDataset();
  const salesTotals = new Map();
  const inventoryByKey = new Map(
    dataset.inventory.map((row) => [`${row.store_id}|${row.sku}`, row]),
  );

  for (const row of dataset.sales) {
    const key = `${row.store_id}|${row.sku}`;
    salesTotals.set(key, (salesTotals.get(key) || 0) + row.units_sold);
  }

  const allDaysOfStock = dataset.inventory.map((row) => {
    const key = `${row.store_id}|${row.sku}`;
    const avgDailySales = (salesTotals.get(key) || 0) / SALES_DAYS;
    return {
      key,
      daysOfStock: row.on_hand_qty / Math.max(avgDailySales, 0.1),
    };
  });

  const lowestKeys = new Set(
    allDaysOfStock
      .sort((left, right) => left.daysOfStock - right.daysOfStock)
      .slice(0, 12)
      .map((entry) => entry.key),
  );

  for (const hero of HERO_LOW_STOCK_ASSIGNMENTS) {
    const key = `${hero.store_id}|${hero.sku}`;
    const inventoryRow = inventoryByKey.get(key);
    const avgDailySales = (salesTotals.get(key) || 0) / SALES_DAYS;
    const daysOfStock = inventoryRow.on_hand_qty / Math.max(avgDailySales, 0.1);

    assert.ok(daysOfStock < 1.6, `${key} should remain below 1.6 days of stock`);
    assert.ok(lowestKeys.has(key), `${key} should remain among the most obvious low-stock rows`);
  }
});

test('writeDataset emits exact headers and stable file shapes', () => {
  writeDataset(OUTPUT_DIR);

  const expected = {
    'stores.csv': { header: HEADERS.stores.join(','), lines: 16 },
    'products.csv': { header: HEADERS.products.join(','), lines: 61 },
    'inventory.csv': { header: HEADERS.inventory.join(','), lines: 901 },
    'sales.csv': { header: HEADERS.sales.join(','), lines: 63001 },
    'restock_requests.csv': { header: HEADERS.restock_requests.join(','), lines: 1 },
  };

  const firstDigests = {};

  for (const [fileName, expectation] of Object.entries(expected)) {
    const content = fs.readFileSync(path.join(OUTPUT_DIR, fileName), 'utf8');
    firstDigests[fileName] = digest(content);
    assert.equal(content.split('\n', 1)[0], expectation.header);
    assert.equal(lineCount(content), expectation.lines);
  }

  writeDataset(OUTPUT_DIR);

  for (const fileName of Object.keys(expected)) {
    const content = fs.readFileSync(path.join(OUTPUT_DIR, fileName), 'utf8');
    assert.equal(digest(content), firstDigests[fileName]);
  }
});
