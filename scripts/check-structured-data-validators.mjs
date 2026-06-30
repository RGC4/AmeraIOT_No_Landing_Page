#!/usr/bin/env node
/**
 * Unit tests for the structured-data SHAPE validators.
 *
 * scripts/check-structured-data.mjs validates each page's JSON-LD against
 * Google's requirements using custom helpers (checkBreadcrumb, checkItemList,
 * checkSiteWide, checkRouteSchema). Those helpers are the whole point of the
 * guard — if one is accidentally weakened or broken, the guard would start
 * passing malformed schema again without anyone noticing.
 *
 * The end-to-end check only exercises them against the live site (which needs a
 * running server and real, currently-correct pages), so a regression in a
 * helper itself could hide. This script feeds each helper hand-built fixtures —
 * one valid, several deliberately broken — and asserts the valid one passes and
 * each broken one produces the expected error. It's a self-contained Node
 * script (no test framework, no server) and is wired as its own validation.
 *
 * Exit 0 = every validator behaves as expected; exit 1 = a validator regressed.
 */

import {
  checkBreadcrumb,
  checkItemList,
  checkSiteWide,
  checkRouteSchema,
} from './check-structured-data.mjs';

const failures = [];
let passed = 0;

function ok(name) {
  passed += 1;
  console.log(`  [ok] ${name}`);
}
function bad(name, detail) {
  failures.push(`${name}: ${detail}`);
  console.log(`  [FAIL] ${name} — ${detail}`);
}

/**
 * Run a validator against a fixture. With `expectError`, assert at least one
 * produced error contains that substring; otherwise assert zero errors.
 */
function run(name, fn, expectError) {
  const errors = [];
  try {
    fn(errors);
  } catch (err) {
    bad(name, `validator threw: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }
  if (expectError) {
    if (errors.some((e) => e.includes(expectError))) {
      ok(`${name} → flagged ("${expectError}")`);
    } else {
      bad(name, `expected an error containing "${expectError}", got: ${JSON.stringify(errors)}`);
    }
  } else if (errors.length === 0) {
    ok(`${name} → clean`);
  } else {
    bad(name, `expected no errors, got: ${JSON.stringify(errors)}`);
  }
}

/* ------------------------------- fixtures -------------------------------- */

const validBreadcrumb = {
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ameraiot.com/' },
    { '@type': 'ListItem', position: 2, name: 'Company', item: 'https://ameraiot.com/company' },
  ],
};

const validPersonList = {
  '@type': 'ItemList',
  name: 'Executive team',
  itemListElement: [
    { '@type': 'ListItem', position: 1, item: { '@type': 'Person', name: 'Jane Doe' } },
    { '@type': 'ListItem', position: 2, item: { '@type': 'Person', name: 'John Roe' } },
  ],
};

const validSiteGraph = {
  '@graph': [
    { '@type': 'Organization', '@id': 'https://ameraiot.com/#org', name: 'Amera IoT', url: 'https://ameraiot.com/' },
    { '@type': 'WebSite', name: 'Amera IoT', url: 'https://ameraiot.com/' },
  ],
};

/* ----------------------------- checkBreadcrumb --------------------------- */

run('breadcrumb: valid', (e) => checkBreadcrumb(validBreadcrumb, 'bc', e));
run('breadcrumb: not an object', (e) => checkBreadcrumb(undefined, 'bc', e), 'missing BreadcrumbList');
run(
  'breadcrumb: wrong @type',
  (e) => checkBreadcrumb({ ...validBreadcrumb, '@type': 'ItemList' }, 'bc', e),
  'expected "BreadcrumbList"',
);
run(
  'breadcrumb: broken position',
  (e) =>
    checkBreadcrumb(
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ameraiot.com/' },
          { '@type': 'ListItem', position: 5, name: 'Company', item: 'https://ameraiot.com/company' },
        ],
      },
      'bc',
      e,
    ),
  'position is 5, expected 2',
);
run(
  'breadcrumb: duplicate position',
  (e) =>
    checkBreadcrumb(
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ameraiot.com/' },
          { '@type': 'ListItem', position: 1, name: 'Company', item: 'https://ameraiot.com/company' },
        ],
      },
      'bc',
      e,
    ),
  'position is 1, expected 2',
);
run(
  'breadcrumb: missing name',
  (e) =>
    checkBreadcrumb(
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, item: 'https://ameraiot.com/' }] },
      'bc',
      e,
    ),
  'missing "name"',
);
run(
  'breadcrumb: invalid item URL',
  (e) =>
    checkBreadcrumb(
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'not-a-url' }] },
      'bc',
      e,
    ),
  'not a valid URL',
);

/* ------------------------------ checkItemList ---------------------------- */

run('itemList: valid (Person)', (e) => checkItemList(validPersonList, 'il', e, { itemType: 'Person' }));
run(
  'itemList: missing list name',
  (e) => checkItemList({ ...validPersonList, name: '' }, 'il', e, { itemType: 'Person' }),
  'missing required "name"',
);
run(
  'itemList: wrong item @type',
  (e) =>
    checkItemList(
      { '@type': 'ItemList', name: 'Team', itemListElement: [{ '@type': 'ListItem', position: 1, item: { '@type': 'Organization', name: 'X' } }] },
      'il',
      e,
      { itemType: 'Person' },
    ),
  'expected "Person"',
);
run(
  'itemList: broken position',
  (e) =>
    checkItemList(
      { '@type': 'ItemList', name: 'Team', itemListElement: [{ '@type': 'ListItem', position: 2, item: { '@type': 'Person', name: 'Jane' } }] },
      'il',
      e,
    ),
  'position is 2, expected 1',
);
run(
  'itemList: missing required URL',
  (e) =>
    checkItemList(
      { '@type': 'ItemList', name: 'News', itemListElement: [{ '@type': 'ListItem', position: 1, item: { '@type': 'NewsArticle', headline: 'X' } }] },
      'il',
      e,
      { itemType: 'NewsArticle', itemRequiresUrl: true },
    ),
  'not a valid URL',
);
run(
  'itemList: NewsArticle headline counts as name',
  (e) =>
    checkItemList(
      { '@type': 'ItemList', name: 'News', itemListElement: [{ '@type': 'ListItem', position: 1, item: { '@type': 'NewsArticle', headline: 'Headline', url: 'https://ameraiot.com/news/x' } }] },
      'il',
      e,
      { itemType: 'NewsArticle', itemRequiresUrl: true },
    ),
);

/* ------------------------------ checkSiteWide ---------------------------- */

run('siteWide: valid', (e) => checkSiteWide([validSiteGraph], 'site', e));
run('siteWide: no @graph block', (e) => checkSiteWide([{ foo: 1 }], 'site', e), 'site-wide @graph');
run(
  'siteWide: missing Organization',
  (e) => checkSiteWide([{ '@graph': [{ '@type': 'WebSite', name: 'Amera IoT', url: 'https://ameraiot.com/' }] }], 'site', e),
  'missing Organization',
);
run(
  'siteWide: Organization missing @id',
  (e) =>
    checkSiteWide(
      [{ '@graph': [{ '@type': 'Organization', name: 'Amera IoT', url: 'https://ameraiot.com/' }, { '@type': 'WebSite', name: 'Amera IoT', url: 'https://ameraiot.com/' }] }],
      'site',
      e,
    ),
  'missing required "@id"',
);
run(
  'siteWide: Organization invalid URL',
  (e) =>
    checkSiteWide(
      [{ '@graph': [{ '@type': 'Organization', '@id': 'x', name: 'A', url: 'nope' }, { '@type': 'WebSite', name: 'A', url: 'https://ameraiot.com/' }] }],
      'site',
      e,
    ),
  '"url" is not a valid URL',
);

/* ---------------------------- checkRouteSchema --------------------------- */

run(
  'routeSchema: Product valid',
  (e) => checkRouteSchema('/products/amerakey', { schemaType: 'Product' }, [validSiteGraph, { '@type': 'Product', name: 'AmeraKey', url: 'https://ameraiot.com/products/amerakey' }], e),
);
run(
  'routeSchema: missing expected @type block',
  (e) => checkRouteSchema('/products/amerakey', { schemaType: 'Product' }, [validSiteGraph], e),
  'no JSON-LD block with @type "Product"',
);
run(
  'routeSchema: Product missing name',
  (e) => checkRouteSchema('/p', { schemaType: 'Product' }, [{ '@type': 'Product', url: 'https://ameraiot.com/p' }], e),
  'missing required "name"',
);
run(
  'routeSchema: AboutPage valid',
  (e) => checkRouteSchema('/company', { schemaType: 'AboutPage' }, [{ '@type': 'AboutPage', name: 'Company', url: 'https://ameraiot.com/company', breadcrumb: validBreadcrumb }], e),
);
run(
  'routeSchema: AboutPage missing breadcrumb',
  (e) => checkRouteSchema('/company', { schemaType: 'AboutPage' }, [{ '@type': 'AboutPage', name: 'Company', url: 'https://ameraiot.com/company' }], e),
  'missing BreadcrumbList',
);
run(
  'routeSchema: CollectionPage valid',
  (e) => checkRouteSchema('/resources', { schemaType: 'CollectionPage' }, [{ '@type': 'CollectionPage', name: 'Resources', url: 'https://ameraiot.com/resources', hasPart: [{ name: 'Doc', url: 'https://ameraiot.com/resources/doc' }] }], e),
);
run(
  'routeSchema: CollectionPage hasPart missing name',
  (e) => checkRouteSchema('/resources', { schemaType: 'CollectionPage' }, [{ '@type': 'CollectionPage', name: 'Resources', url: 'https://ameraiot.com/resources', hasPart: [{ url: 'https://ameraiot.com/x' }] }], e),
  'missing "name"',
);
run(
  'routeSchema: ItemList delegates (valid)',
  (e) => checkRouteSchema('/company/executive-team', { schemaType: 'ItemList', itemList: { itemType: 'Person' } }, [validPersonList], e),
);
run(
  'routeSchema: BreadcrumbList delegates (valid)',
  (e) => checkRouteSchema('/industries/x', { schemaType: 'BreadcrumbList' }, [validBreadcrumb], e),
);
run(
  'routeSchema: unknown @type has no validator',
  (e) => checkRouteSchema('/x', { schemaType: 'Recipe' }, [{ '@type': 'Recipe', name: 'X' }], e),
  'no validator defined',
);
run('routeSchema: no schemaType is a no-op', (e) => checkRouteSchema('/x', {}, [], e));

/* -------------------------------- summary -------------------------------- */

console.log(`\n${passed} passed, ${failures.length} failed.`);
if (failures.length > 0) {
  console.error('Structured-data validator unit tests FAILED:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('Structured-data validator unit tests passed: every shape validator catches its target defect.');
