const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { InMemoryTransport } = require('@modelcontextprotocol/sdk/inMemory.js');

const SERVER = path.join(__dirname, '..', 'mcp-server.js');

async function listTools(env) {
  // Fresh module instance per env so MAGENTO_READ_ONLY is re-evaluated
  Object.assign(process.env, { MAGENTO_API_TOKEN: 'secret-test-token', MAGENTO_READ_ONLY: 'false' }, env);
  delete require.cache[require.resolve(SERVER)];
  const { server } = require(SERVER);
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '0' });
  await Promise.all([server.connect(st), client.connect(ct)]);
  const { tools } = await client.listTools();
  return { tools, client };
}

test('every tool has title and complete annotations', async () => {
  const { tools } = await listTools({});
  assert.ok(tools.length > 0);
  for (const t of tools) {
    assert.ok(t.title && t.title !== t.name, `${t.name}: title`);
    assert.ok(t.description, `${t.name}: description`);
    for (const h of ['readOnlyHint', 'destructiveHint', 'idempotentHint', 'openWorldHint']) {
      assert.strictEqual(typeof t.annotations?.[h], 'boolean', `${t.name}: ${h}`);
    }
    assert.ok(!(t.annotations.readOnlyHint && t.annotations.destructiveHint), `${t.name}: ro and destructive`);
  }
});

test('tool names match annotation class', async () => {
  const { tools } = await listTools({});
  for (const t of tools) {
    if (/^(get|list|search)_/.test(t.name)) assert.strictEqual(t.annotations.readOnlyHint, true, t.name);
    if (/delete|remove/.test(t.name)) assert.strictEqual(t.annotations.destructiveHint, true, t.name);
  }
});

test('read-only mode drops mutating tools', async () => {
  const { tools } = await listTools({ MAGENTO_READ_ONLY: 'true' });
  assert.ok(tools.length > 0);
  assert.ok(tools.every(t => t.annotations.readOnlyHint));
  assert.ok(!tools.some(t => t.name === 'update_product_attribute'));
});

test('token does not leak into error output', async () => {
  const { client } = await listTools({ MAGENTO_BASE_URL: 'http://127.0.0.1:1/rest/V1', MAGENTO_TIMEOUT_MS: '2000' });
  const res = await client.callTool({ name: 'get_product_by_sku', arguments: { sku: 'X' } });
  assert.strictEqual(res.isError, true);
  assert.ok(!JSON.stringify(res).includes('secret-test-token'));
});

test('--version works without a token', () => {
  const r = spawnSync('node', [SERVER, '--version'], { env: { PATH: process.env.PATH }, encoding: 'utf8' });
  assert.strictEqual(r.status, 0);
  assert.match(r.stdout.trim(), /^\d+\.\d+\.\d+/);
});

test('server.json env variables are documented in the README', () => {
  const fs = require('node:fs');
  const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'debian', 'server.json'), 'utf8'));
  for (const v of manifest.environmentVariables) assert.ok(readme.includes('`' + v.name + '`'), v.name);
});
