const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const helper = path.resolve(__dirname, '../plugins/rehearse/scripts/pipecat_server.py');

function run(action, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [helper, action], { env });
    let output = '';
    child.stdout.on('data', data => output += data);
    child.stderr.on('data', data => output += data);
    child.on('error', reject);
    child.on('close', code => resolve({ code, output }));
  });
}

test('Pipecat setup pins the package and start resolves the uv executable directory', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'rehearse-test-'));
  try {
    const log = path.join(dir, 'args.json');
    await fs.writeFile(path.join(dir, 'uv'), `#!${process.execPath}\nconst fs = require('node:fs'); const args = process.argv.slice(2); if (args[1] === 'install') fs.writeFileSync(process.env.TEST_LOG, JSON.stringify(args)); else console.log(process.env.TEST_BIN);\n`, { mode: 0o755 });
    await fs.writeFile(path.join(dir, 'pipecat-mcp-server'), `#!${process.execPath}\nconsole.log('server started');\n`, { mode: 0o755 });
    const env = { ...process.env, PATH: dir + path.delimiter + process.env.PATH, TEST_LOG: log, TEST_BIN: dir };
    assert.equal((await run('setup', env)).code, 0);
    assert.deepEqual(JSON.parse(await fs.readFile(log, 'utf8')), ['tool', 'install', '--python', '3.12', 'pipecat-ai-mcp-server==0.0.12']);
    const started = await run('start', env);
    assert.equal(started.code, 0, started.output);
    assert.match(started.output, /server started/);
    await fs.rm(path.join(dir, 'pipecat-mcp-server'));
    const missing = await run('start', env);
    assert.equal(missing.code, 1);
    assert.match(missing.output, /setup first/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('Pipecat check initializes MCP, verifies tools, and cleans its session', async () => {
  // Substitute only the constant in a temporary copy so tests never bind the real server port.
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'rehearse-rpc-'));
  let missing = false;
  let useSse = false;
  const requests = [];
  const server = http.createServer(async (req, res) => {
    if (req.method === 'DELETE') { requests.push('DELETE'); res.writeHead(200).end(); return; }
    let body = '';
    for await (const chunk of req) body += chunk;
    const message = JSON.parse(body);
    requests.push(message.method);
    if (message.method !== 'initialize') assert.equal(req.headers['mcp-session-id'], 'test-session');
    if (!message.id) { res.writeHead(202).end(); return; }
    const result = message.method === 'initialize'
      ? { serverInfo: { name: 'pipecat-mcp-server' }, protocolVersion: '2024-11-05', capabilities: {} }
      : { tools: (missing ? ['start'] : ['start', 'speak', 'listen', 'stop']).map(name => ({ name })) };
    const payload = JSON.stringify({ jsonrpc: '2.0', id: message.id, result });
    res.writeHead(200, { 'Content-Type': useSse ? 'text/event-stream' : 'application/json', 'Mcp-Session-Id': 'test-session' });
    res.end(useSse ? `event: message\ndata: ${payload}\n\n` : payload);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const source = (await fs.readFile(helper, 'utf8')).replace('http://localhost:9090/mcp', `http://127.0.0.1:${server.address().port}/mcp`);
    const copy = path.join(dir, 'helper.py');
    await fs.writeFile(copy, source);
    async function check() {
      return new Promise((resolve, reject) => {
        const child = spawn('python3', [copy, 'check']);
        let output = '';
        child.stdout.on('data', data => output += data);
        child.stderr.on('data', data => output += data);
        child.on('error', reject);
        child.on('close', code => resolve({ code, output }));
      });
    }
    for (const sse of [false, true]) {
      useSse = sse;
      requests.length = 0;
      const result = await check();
      assert.equal(result.code, 0, result.output);
      assert.match(result.output, /Audio is not tested/);
      assert.deepEqual(requests, ['initialize', 'notifications/initialized', 'tools/list', 'DELETE']);
    }
    missing = true;
    const result = await check();
    assert.equal(result.code, 1);
    assert.match(result.output, /Missing voice tools/);
    assert.equal(requests.at(-1), 'DELETE');
  } finally {
    await new Promise(resolve => server.close(resolve));
    await fs.rm(dir, { recursive: true, force: true });
  }
});
