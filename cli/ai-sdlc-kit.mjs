#!/usr/bin/env node
// ai-sdlc-kit CLI — scaffold and verify AI-SDLC projects. Node >= 18, stdlib only.
// Runs from a clone (node cli/ai-sdlc-kit.mjs …) or via npx github:ksi283/ai-sdlc-kit.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = '1.5.0';
const T = (p) => join(KIT_ROOT, 'templates', p);
const S = (p) => join(KIT_ROOT, 'skills', p);

// --lang vi|en (default: en) — translates help + progress lines; errors stay technical.
const LANG = (() => {
  const i = process.argv.indexOf('--lang');
  const v = i !== -1 ? process.argv[i + 1] : 'en';
  return v === 'vi' ? 'vi' : 'en';
})();

const HELP_EN = `ai-sdlc-kit v${VERSION} — scaffold and verify AI-SDLC projects

Usage:
  ai-sdlc-kit init <dir> [--ai claude|cursor|codex|zcode] [--skills <list>] [--force] [--dry-run] [--lang vi|en]
      Scaffold a new AI-SDLC project: starter files, policy, CI, skill auto-activation.
      --skills is a comma list from skills/registry.yml (default: intent-review).

  ai-sdlc-kit check [dir]
      Report the project's kit wiring (AGENTS.md, gates, CI, CODEOWNERS, intents…).
      Exit code 1 when wiring is incomplete — usable in CI.

  ai-sdlc-kit skill <pack> <dir> [--ai …]
      Install one registry pack into a project (same rules as skills/install.sh).

  ai-sdlc-kit --help | --version
      --lang vi|en switches this help and progress messages (default: en).
`;

const HELP_VI = `ai-sdlc-kit v${VERSION} — dựng khung và kiểm chứng dự án AI-SDLC

Cách dùng:
  ai-sdlc-kit init <dir> [--ai claude|cursor|codex|zcode] [--skills <danh-sách>] [--force] [--dry-run] [--lang vi|en]
      Dựng project AI-SDLC mới: file khởi động, policy, CI, auto-activation skill.
      --skills là danh sách phẩy tách từ skills/registry.yml (mặc định: intent-review).

  ai-sdlc-kit check [dir]
      Báo cáo 10 điểm wiring của project (AGENTS.md, gates, CI, CODEOWNERS, intents…).
      Exit 1 khi còn thiếu — dùng được như một bước CI.

  ai-sdlc-kit skill <pack> <dir> [--ai …]
      Cài một pack từ registry vào project (cùng quy tắc với skills/install.sh).

  ai-sdlc-kit --help | --version
      --lang vi|en đổi ngôn ngữ help và thông báo tiến trình (mặc định: en).
`;

const STR = {
  en: {
    scaffolding: (dir, ai, skills, dry) => dry
      ? `DRY RUN — would scaffold '${dir}' (--ai ${ai}, skills: ${skills || 'none'}):`
      : `scaffolding '${dir}' (--ai ${ai}, skills: ${skills || 'none'}):`,
    done: (dry) => dry ? 'dry run complete.'
      : `done. Next: edit AGENTS.md for your project, then write docs/intents/INT-…-your-first-intent.md (see docs/en/12-onboarding.md).`,
    wired: (p) => `  auto-activation block wired → ${p}`,
    local: (n, v, d) => `  skill (local)    ${n} ${v} → ${d}`,
    external: (n, v) => `  skill (external) ${n} ${v} — run its pinned installer, then re-run 'skill' or 'init' to refresh the routing block.`,
  },
  vi: {
    scaffolding: (dir, ai, skills, dry) => dry
      ? `DRY RUN — sẽ dựng khung '${dir}' (--ai ${ai}, skills: ${skills || 'không'}):`
      : `đang dựng khung '${dir}' (--ai ${ai}, skills: ${skills || 'không'}):`,
    done: (dry) => dry ? 'chạy thử xong.'
      : `xong. Bước tiếp: sửa AGENTS.md cho dự án của bạn, rồi viết docs/intents/INT-…-intent-dau-tien.md (xem docs/vi/12-onboarding.md).`,
    wired: (p) => `  đã dây block auto-activation → ${p}`,
    local: (n, v, d) => `  skill (local)    ${n} ${v} → ${d}`,
    external: (n, v) => `  skill (external) ${n} ${v} — chạy installer riêng có pin version, rồi chạy lại 'skill' hoặc 'init' để làm mới block routing.`,
  },
}[LANG];

const arg = (i) => process.argv[i];
const cmd = arg(2);

function fail(msg) { console.error(`error: ${msg}`); process.exit(1); }
function scaffoldWorkflow() {
  return `# Gate battery on every push/PR — the kit's Play 9 doctrine (evals in CI).
name: tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      # TODO: point this at your real test command (see templates/evals.md);
      # tests should map to requirement IDs (FR/SR/EV) like the kit's example does.
      - run: npm test
`;
}
const CODEOWNERS = `# CODEOWNERS — ownership is the anti-"stepped-on-toes" mechanism (docs/en/13 §3).
# Sensitive paths MUST have a named owner from day one.
* @<your-github-handle>
# src/auth/** @<security-lead>
# policy/** @<security-lead> @<engineering-manager>
`;

// ── minimal reader for the registry's simple YAML shape (name/class/version/-
//    auto_activate.capability/lifecycle_stages/use_when). Not a general YAML parser.
function readRegistryPacks() {
  const text = readFileSync(join(KIT_ROOT, 'skills', 'registry.yml'), 'utf8');
  const packs = [];
  let cur = null, inAA = false, inUse = false, skipBlock = false, skipIndent = 0;
  for (const raw of text.split(/\r?\n/)) {
    if (/^\s*#/.test(raw)) continue;
    if (!raw.trim()) { inUse = false; if (skipBlock && raw.length - raw.trimStart().length <= skipIndent) skipBlock = false; continue; }
    const indent = raw.length - raw.trimStart().length;
    if (skipBlock) { if (indent > skipIndent) continue; skipBlock = false; }
    let m;
    if ((m = raw.match(/^  - name: (.+)$/))) { cur = { name: m[1].trim(), stages: [], use: [] }; packs.push(cur); inAA = false; inUse = false; continue; }
    if (!cur) continue;
    if ((m = raw.match(/^    (class|version|license): (.+)$/))) { cur[m[1]] = m[2].trim().replace(/^["']|["']$/g, ''); inAA = false; continue; }
    if (/^    purpose: \l?>?/.test(raw) || /^    purpose: >/.test(raw)) { skipBlock = true; skipIndent = indent; inAA = false; continue; }
    if (/^    auto_activate:/.test(raw)) { inAA = true; inUse = false; continue; }
    if (inAA) {
      if (indent <= 4) { inAA = false; continue; }
      if ((m = raw.match(/^      capability: (.+)$/))) { cur.capability = m[1].trim(); continue; }
      if ((m = raw.match(/^      lifecycle_stages: \[(.*)\]/))) { cur.stages = m[1].split(',').map(s => s.trim()).filter(Boolean); continue; }
      if (/^      use_when:/.test(raw)) { inUse = true; continue; }
      if (inUse && (m = raw.match(/^        - (.+)$/))) { cur.use.push(m[1].trim()); continue; }
      if (/^      not_for:/.test(raw)) { inUse = false; continue; }
    }
  }
  return packs.filter(p => !p.name.startsWith('<'));
}

function skillRows(names) {
  const packs = readRegistryPacks();
  const chosen = names.map(n => {
    const p = packs.find(x => x.name === n);
    if (!p) fail(`pack '${n}' is not in skills/registry.yml — add it via PR first (see skills/README.md, flow A)`);
    return p;
  });
  const rows = chosen.map(p => {
    const stages = (p.stages?.length ? p.stages.join(', ') : '-');
    const use = (p.use?.length ? p.use.join('; ') : (p.purpose ?? '-'));
    return `| ${p.name} | ${p.version ?? '-'} | ${p.capability ?? '-'} | ${stages} | ${use} |`;
  });
  return { rows, packs: chosen };
}

function wireAgentsBlock(projectDir, rows) {
  const block = [
    '<!-- skills:auto:start (managed by ai-sdlc-kit CLI — do not edit) -->',
    '## Installed skill packs — auto-activation routing',
    '',
    '| Pack | v | Capability | Reach for it at | Use when |',
    '|---|---|---|---|---|',
    ...rows,
    '',
    '**Routing rule:** before starting work that matches a capability above, open the',
    "pack's SKILL.md (in the agent skill directory) and follow it; record the decisions",
    'the pack produces in project-owned knowledge (e.g. `DESIGN-SYSTEM.md`).',
    '<!-- skills:auto:end -->',
  ].join('\n');
  const path = join(projectDir, 'AGENTS.md');
  let text = existsSync(path) ? readFileSync(path, 'utf8') : '# AGENTS.md\n';
  const pattern = /<!-- skills:auto:start.*?<!-- skills:auto:end -->\n?/s;
  text = pattern.test(text) ? text.replace(pattern, block + '\n') : text.replace(/\s*$/, '\n\n' + block + '\n');
  writeFileSync(path, text);
  console.log(STR.wired(path));
}

function installLocalPack(pack, projectDir, agentDir) {
  const src = S(pack.name);
  if (!existsSync(join(src, 'SKILL.md'))) fail(`local pack '${pack.name}' has no SKILL.md at ${src}`);
  const dest = join(projectDir, agentDir, pack.name);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(STR.local(pack.name, pack.version ?? '', dest));
}

function printExternalPack(pack) {
  console.log(STR.external(pack.name, pack.version ?? ''));
}

// ── init ────────────────────────────────────────────────────────────────
function doInit(args) {
  const dir = resolve(args[0] ?? '');
  if (!dir) fail('init requires a target directory');
  let ai = 'claude', skills = ['intent-review'], force = false, dry = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--ai') ai = args[++i] ?? fail('--ai needs a value');
    else if (args[i] === '--skills') skills = (args[++i] ?? '').split(',').map(s => s.trim()).filter(Boolean);
    else if (args[i] === '--force') force = true;
    else if (args[i] === '--dry-run') dry = true;
    else if (args[i] === '--lang') { i++; continue; } // already parsed globally
    else fail(`unknown option '${args[i]}'`);
  }
  const agentDir = { claude: '.claude/skills', cursor: '.cursor/skills', codex: '.agents/skills', zcode: '.zcode/skills' }[ai]
    ?? fail(`unknown --ai '${ai}' (claude|cursor|codex|zcode)`);
  if (existsSync(dir) && readdirSync(dir).length && !force) {
    fail(`'${dir}' is not empty — use --force to scaffold into it anyway`);
  }
  // fail fast on unknown packs BEFORE writing anything
  const { rows, packs } = skillRows(skills);

  const files = [
    [T('AGENTS.md'), 'AGENTS.md'],
    [T('intent.md'), 'docs/templates/intent.md'],
    [T('spec.md'), 'docs/templates/spec.md'],
    [T('plan.md'), 'docs/templates/plan.md'],
    [T('evals.md'), 'docs/templates/evals.md'],
    [T('quality-gates.yml'), 'policy/quality-gates.yml'],
    [T('autonomy-policy.yml'), 'policy/autonomy-policy.yml'],
    [T('pr-template.md'), '.github/PULL_REQUEST_TEMPLATE.md'],
    [T('threat-model.md'), 'docs/templates/threat-model.md'],
  ];
  console.log(STR.scaffolding(dir, ai, skills.join(', '), dry));
  if (!dry) {
    mkdirSync(dir, { recursive: true });
    for (const [src, rel] of files) {
      const dest = join(dir, rel);
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(src, dest);
      console.log(`  ${rel}`);
    }
    for (const rel of ['docs/intents/.gitkeep', 'specs/.gitkeep', 'evals/suites/.gitkeep']) {
      const dest = join(dir, rel);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, '');
      console.log(`  ${rel}`);
    }
    mkdirSync(join(dir, '.github', 'workflows'), { recursive: true });
    writeFileSync(join(dir, '.github', 'workflows', 'tests.yml'), scaffoldWorkflow());
    console.log('  .github/workflows/tests.yml');
    writeFileSync(join(dir, '.github', 'CODEOWNERS'), CODEOWNERS);
    console.log('  .github/CODEOWNERS');
  } else {
    for (const [, rel] of files) console.log(`  ${rel}`);
    console.log('  docs/intents/.gitkeep · specs/.gitkeep · evals/suites/.gitkeep');
    console.log('  .github/workflows/tests.yml · .github/CODEOWNERS');
  }

  if (skills.length) {
    if (dry) { for (const p of packs) console.log(`  ${p.class === 'local' ? 'skill (local)   ' : 'skill (external)'} ${p.name} ${p.version ?? ''}`); }
    else {
      for (const p of packs) p.class === 'local' ? installLocalPack(p, dir, agentDir) : printExternalPack(p);
      wireAgentsBlock(dir, rows);
    }
  }
  console.log(STR.done(dry));
}

// ── check ───────────────────────────────────────────────────────────────
function doCheck(args) {
  const dir = resolve(args[0] ?? '.');
  if (!existsSync(dir)) fail(`directory not found: ${dir}`);
  const has = (rel) => existsSync(join(dir, rel));
  const rows = [
    ['AGENTS.md (project memory)', has('AGENTS.md')],
    ['AGENTS.md skills auto-block', has('AGENTS.md') && /skills:auto:start/.test(readFileSync(join(dir, 'AGENTS.md'), 'utf8'))],
    ['docs/intents/ (versioned intents)', has('docs/intents')],
    ['specs/ (units of work)', has('specs')],
    ['policy/quality-gates.yml', has('policy/quality-gates.yml')],
    ['policy/autonomy-policy.yml', has('policy/autonomy-policy.yml')],
    ['.github/workflows/ (CI runs gates)', (() => { const w = join(dir, '.github', 'workflows'); return existsSync(w) && readdirSync(w).some(f => f.endsWith('.yml')); })()],
    ['.github/PULL_REQUEST_TEMPLATE.md', has('.github/PULL_REQUEST_TEMPLATE.md')],
    ['CODEOWNERS (ownership)', has('.github/CODEOWNERS') || has('CODEOWNERS')],
    ['evals/ (behavioral tests)', has('evals')],
  ];
  const ok = rows.filter(([, v]) => v).length;
  for (const [label, v] of rows) console.log(` ${v ? '✔' : '✗'} ${label}`);
  console.log(`\n${ok}/${rows.length} wiring checks pass${ok === rows.length ? ' — ready.' : ' — see docs/en/12-onboarding.md for each fix.'}`);
  if (ok < rows.length) process.exit(1);
}

// ── skill ───────────────────────────────────────────────────────────────
function doSkill(args) {
  const [pack, dir] = args;
  if (!pack || !dir) fail('usage: ai-sdlc-kit skill <pack> <dir> [--ai claude|cursor|codex|zcode]');
  let ai = 'claude';
  const i = args.indexOf('--ai');
  if (i !== -1) ai = args[i + 1] ?? fail('--ai needs a value');
  const agentDir = { claude: '.claude/skills', cursor: '.cursor/skills', codex: '.agents/skills', zcode: '.zcode/skills' }[ai]
    ?? fail(`unknown --ai '${ai}'`);
  const { rows, packs } = skillRows([pack]);
  const p = packs[0];
  p.class === 'local' ? installLocalPack(p, resolve(dir), agentDir) : printExternalPack(p);
  wireAgentsBlock(resolve(dir), rows);
}

// ── dispatch ────────────────────────────────────────────────────────────
if (cmd === '--version' || cmd === '-v') { console.log(VERSION); process.exit(0); }
if (cmd === '--help' || cmd === '-h' || !cmd) { console.log(LANG === 'vi' ? HELP_VI : HELP_EN); process.exit(0); }
const rest = process.argv.slice(3);
if (cmd === 'init') doInit(rest);
else if (cmd === 'check') doCheck(rest);
else if (cmd === 'skill') doSkill(rest);
else fail(`unknown command '${cmd}' — try --help`);
