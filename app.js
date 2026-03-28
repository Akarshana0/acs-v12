/**
 * ALONE CODE STUDIO v12 — app.js
 * ✅ Zero network-error screens — full offline-first PWA
 * ✅ Custom icon on all platforms (Windows/Linux/Android/iOS)
 * ✅ All 20+ languages — full offline engines + Piston cloud
 * ✅ VS Code features: Find/Replace, Rename Symbol, Code Fold, Multi-cursor
 * ✅ Enhanced file import — drag & drop anywhere, paste, URL fetch
 * ✅ Smart download — single file or auto ZIP for multiple files
 * ✅ Code Security Scanner — detects vulnerabilities & bad patterns
 * ✅ Context menu, Rename symbol (F2), Replace All
 * ✅ Split view, AI assistant, live HTML/CSS/JS preview
 * ✅ PWA — iOS · Android · Windows · Linux
 */

import { EditorState, Compartment } from "@codemirror/state";
import {
  EditorView, keymap, lineNumbers, drawSelection,
  highlightActiveLine, highlightActiveLineGutter,
  rectangularSelection, crosshairCursor,
} from "@codemirror/view";
import {
  defaultKeymap, history, historyKeymap,
  indentWithTab, toggleComment,
} from "@codemirror/commands";
import {
  syntaxHighlighting, defaultHighlightStyle,
  indentOnInput, bracketMatching, foldGutter, foldKeymap, codeFolding,
} from "@codemirror/language";
import { search, searchKeymap } from "@codemirror/search";
import { autocompletion, closeBrackets, completionKeymap, closeBracketsKeymap } from "@codemirror/autocomplete";
import { oneDark } from "@codemirror/theme-one-dark";
import { python }     from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { cpp }        from "@codemirror/lang-cpp";
import { java }       from "@codemirror/lang-java";
import { rust }       from "@codemirror/lang-rust";
import { go }         from "@codemirror/lang-go";
import { php }        from "@codemirror/lang-php";
import { html }       from "@codemirror/lang-html";
import { css }        from "@codemirror/lang-css";
import { sql }        from "@codemirror/lang-sql";
import { xml }        from "@codemirror/lang-xml";
import { markdown }   from "@codemirror/lang-markdown";

const { createApp, ref, computed, onMounted, nextTick, watch, defineComponent } = Vue;

// ═══════════════════════════════════════════════════════════════
// LANGUAGE CONFIG
// ═══════════════════════════════════════════════════════════════
const LANG = {
  python:     { id:"python",     label:"Python",     icon:"🐍", color:"#3572A5", piston:"python",     ver:"3.10.0",  ext:".py",    cm:()=>python()                      },
  javascript: { id:"javascript", label:"JavaScript", icon:"⚡", color:"#f1e05a", piston:"javascript", ver:"18.15.0", ext:".js",    cm:()=>javascript({jsx:true})        },
  typescript: { id:"typescript", label:"TypeScript", icon:"🔷", color:"#2b7489", piston:"typescript", ver:"5.0.3",  ext:".ts",    cm:()=>javascript({typescript:true}) },
  html:       { id:"html",       label:"HTML",       icon:"🌐", color:"#e34c26", piston:"html",       ver:"0.0.1",  ext:".html",  cm:()=>html()                        },
  css:        { id:"css",        label:"CSS",        icon:"🎨", color:"#563d7c", piston:"css",        ver:"0.0.1",  ext:".css",   cm:()=>css()                         },
  cpp:        { id:"cpp",        label:"C++",        icon:"⚙️", color:"#f34b7d", piston:"c++",        ver:"10.2.0", ext:".cpp",   cm:()=>cpp()                         },
  c:          { id:"c",          label:"C",          icon:"🔵", color:"#555555", piston:"c",          ver:"10.2.0", ext:".c",     cm:()=>cpp()                         },
  java:       { id:"java",       label:"Java",       icon:"☕", color:"#b07219", piston:"java",       ver:"15.0.2", ext:".java",  cm:()=>java()                        },
  rust:       { id:"rust",       label:"Rust",       icon:"🦀", color:"#dea584", piston:"rust",       ver:"1.50.0", ext:".rs",    cm:()=>rust()                        },
  go:         { id:"go",         label:"Go",         icon:"🐹", color:"#00ADD8", piston:"go",         ver:"1.16.2", ext:".go",    cm:()=>go()                          },
  php:        { id:"php",        label:"PHP",        icon:"🐘", color:"#4F5D95", piston:"php",        ver:"8.2.3",  ext:".php",   cm:()=>php()                         },
  ruby:       { id:"ruby",       label:"Ruby",       icon:"💎", color:"#701516", piston:"ruby",       ver:"3.0.1",  ext:".rb",    cm:()=>python()                      },
  swift:      { id:"swift",      label:"Swift",      icon:"🦅", color:"#F05138", piston:"swift",      ver:"5.3.3",  ext:".swift", cm:()=>python()                      },
  kotlin:     { id:"kotlin",     label:"Kotlin",     icon:"🎯", color:"#A97BFF", piston:"kotlin",     ver:"1.8.20", ext:".kts",   cm:()=>java()                        },
  csharp:     { id:"csharp",     label:"C#",         icon:"🎮", color:"#178600", piston:"csharp",     ver:"6.12.0", ext:".cs",    cm:()=>java()                        },
  lua:        { id:"lua",        label:"Lua",        icon:"🌙", color:"#000080", piston:"lua",        ver:"5.4.2",  ext:".lua",   cm:()=>python()                      },
  bash:       { id:"bash",       label:"Bash",       icon:"💻", color:"#89e051", piston:"bash",       ver:"5.2.0",  ext:".sh",    cm:()=>python()                      },
  sql:        { id:"sql",        label:"SQL",        icon:"🗃️", color:"#e38c00", piston:"sqlite3",    ver:"3.36.0", ext:".sql",   cm:()=>sql()                         },
  markdown:   { id:"markdown",   label:"Markdown",   icon:"📝", color:"#083fa1", piston:"markdown",   ver:"0.0.1",  ext:".md",    cm:()=>markdown()                    },
  xml:        { id:"xml",        label:"XML",        icon:"📄", color:"#e37933", piston:"xml",        ver:"0.0.1",  ext:".xml",   cm:()=>xml()                         },
};

const WEB_LANGS = new Set(["html","css","javascript"]);

const LANG_GROUPS = [
  { label:"⭐ Popular", langs:["python","javascript","typescript","cpp","java","rust","go"] },
  { label:"🌐 Web",     langs:["html","css","php","sql"] },
  { label:"⚙️ Systems", langs:["c","csharp","kotlin","swift"] },
  { label:"📜 Scripting",langs:["ruby","lua","bash"] },
  { label:"📄 Other",   langs:["markdown","xml"] },
].map(g => ({ label:g.label, langs:g.langs.map(id=>LANG[id]).filter(Boolean) }));

// Detect language from file extension
const EXT_MAP = {};
Object.values(LANG).forEach(l => { EXT_MAP[l.ext] = l.id; });
// Extra common extensions
Object.assign(EXT_MAP, {
  '.jsx':'javascript', '.tsx':'typescript', '.h':'c', '.hpp':'cpp',
  '.yaml':'markdown', '.yml':'markdown', '.txt':'markdown',
  '.json':'javascript', '.toml':'bash', '.ini':'bash',
  '.mjs':'javascript', '.cjs':'javascript', '.vue':'html',
  '.scss':'css', '.sass':'css', '.less':'css',
  '.pyw':'python', '.pyi':'python',
  '.kt':'kotlin', '.kts':'kotlin',
  '.cs':'csharp',
});

function detectLang(filename) {
  const ext = '.' + filename.split('.').pop().toLowerCase();
  return EXT_MAP[ext] || 'javascript';
}

// Piston API endpoints (fallback chain)
const PISTON_URLS   = [
  "https://emkc.org/api/v2/piston/execute",
  "https://piston.rodeo/api/v2/execute",
];
const PISTON_URL    = PISTON_URLS[0];
const ANTHROPIC_URL = "https://YOUR-WORKER.YOUR-NAME.workers.dev"; // ← Replace with your Cloudflare Worker URL (see cloudflare-worker.js)
const S_TREE   = "acs_v12_tree";
const S_ACTIVE = "acs_v12_active";
const S_PREFS  = "acs_v12_prefs";

// ═══════════════════════════════════════════════════════════════
// OFFLINE ENGINES
// ═══════════════════════════════════════════════════════════════

// ── Python (full transpiler) ──────────────────────────────────
function runPython(code) {
  const output = [], errors = [];
  try {
    // Step 1: f-strings → template literals (function replacement, not string)
    let js = code
      .replace(/f"""([\s\S]*?)"""/g, (_, s) => '`' + s.replace(/\{([^}]+)\}/g, (__, v) => '${' + v + '}') + '`')
      .replace(/f'''([\s\S]*?)'''/g, (_, s) => '`' + s.replace(/\{([^}]+)\}/g, (__, v) => '${' + v + '}') + '`')
      .replace(/f"([^"\\]*(\\.[^"\\]*)*)"/g, (_, s) => '`' + s.replace(/\{([^}]+)\}/g, (__, v) => '${' + v + '}') + '`')
      .replace(/f'([^'\\]*(\\.[^'\\]*)*)'/g,  (_, s) => '`' + s.replace(/\{([^}]+)\}/g, (__, v) => '${' + v + '}') + '`');

    // Step 2: builtins
    js = js
      .replace(/\bprint\s*\(/g,   '__P(')
      .replace(/\brange\s*\(/g,   '__R(')
      .replace(/\blen\s*\(/g,     '__L(')
      .replace(/\babs\s*\(/g,     'Math.abs(')
      .replace(/\bmax\s*\(/g,     'Math.max(')
      .replace(/\bmin\s*\(/g,     'Math.min(')
      .replace(/\bround\s*\(/g,   'Math.round(')
      .replace(/\bint\s*\(/g,     'parseInt(')
      .replace(/\bfloat\s*\(/g,   'parseFloat(')
      .replace(/\bstr\s*\(/g,     'String(')
      .replace(/\btype\s*\(/g,    'typeof (')
      .replace(/\bsum\s*\(([^)]+)\)/g, '($1).reduce((a,b)=>a+b,0)')
      .replace(/\bsorted\s*\(([^)]+)\)/g, '[...($1)].sort((a,b)=>a<b?-1:1)')
      .replace(/\.append\s*\(/g,  '.push(')
      .replace(/\.extend\s*\(([^)]+)\)/g, '.push(...$1)')
      .replace(/\.upper\s*\(\)/g, '.toUpperCase()')
      .replace(/\.lower\s*\(\)/g, '.toLowerCase()')
      .replace(/\.strip\s*\(\)/g, '.trim()')
      .replace(/\.lstrip\s*\(\)/g,'.trimStart()')
      .replace(/\.rstrip\s*\(\)/g,'.trimEnd()')
      .replace(/\.startswith\s*\(/g,'.startsWith(')
      .replace(/\.endswith\s*\(/g,  '.endsWith(')
      .replace(/(\w[\w.]*)\s*\.items\s*\(\)/g, 'Object.entries($1)')
      .replace(/(\w[\w.]*)\s*\.keys\s*\(\)/g,  'Object.keys($1)')
      .replace(/(\w[\w.]*)\s*\.values\s*\(\)/g,'Object.values($1)')
      .replace(/\.split\s*\(\s*\)/g, '.split("")')
      .replace(/\bTrue\b/g,  'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g,  'null')
      .replace(/\band\b/g,   '&&')
      .replace(/\bor\b/g,    '||')
      .replace(/\bnot\s+(?!in\b)/g, '!')
      .replace(/\benumerate\s*\(/g, '__ENUM(');

    // Step 3: indent-based block conversion with class-context tracking
    const lines = js.split('\n');
    const out   = [];
    const stack = [{ indent: -1, inClass: false }];

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) { out.push(''); continue; }
      if (trimmed.startsWith('#')) { out.push('//' + trimmed.slice(1)); continue; }

      const indent  = rawLine.search(/\S/);
      const inClass = stack.some(s => s.inClass);

      // Close blocks on dedent
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
        out.push(' '.repeat(Math.max(0, stack[stack.length - 1].indent + 2)) + '}');
      }

      // __init__ → constructor
      const initM = trimmed.match(/^def\s+__init__\s*\(self(?:,\s*)?([^)]*)\)\s*(?:->[^:]+)?:$/);
      if (initM) {
        const args = initM[1].replace(/:\s*[\w\[\], |]+/g, '').replace(/=\s*/g, '=').trim();
        out.push(' '.repeat(indent) + 'constructor(' + args + ') {');
        stack.push({ indent, inClass }); continue;
      }

      // def — class method or function
      const defM = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*(?:->[^:]+)?:$/);
      if (defM) {
        const args = defM[2].replace(/\bself,?\s*/g, '').replace(/:\s*[\w\[\], |]+/g, '').trim();
        if (inClass) {
          out.push(' '.repeat(indent) + defM[1] + '(' + args + ') {');
        } else {
          out.push(' '.repeat(indent) + 'function ' + defM[1] + '(' + args + ') {');
        }
        stack.push({ indent, inClass }); continue;
      }

      // class
      const classM = trimmed.match(/^class\s+(\w+)(?:\((\w+)\))?:$/);
      if (classM) {
        out.push(' '.repeat(indent) + 'class ' + classM[1] + (classM[2] ? ' extends ' + classM[2] : '') + ' {');
        stack.push({ indent, inClass: true }); continue;
      }

      // for x in y:
      const forM = trimmed.match(/^for\s+([\w,\s]+)\s+in\s+(.+):$/);
      if (forM) {
        const vars = forM[1].trim(), iter = forM[2].trim();
        const decl = vars.includes(',') ? 'for (const [' + vars + '] of __I(' + iter + ')) {' : 'for (const ' + vars + ' of __I(' + iter + ')) {';
        out.push(' '.repeat(indent) + decl);
        stack.push({ indent, inClass }); continue;
      }

      // if / elif / while
      const ifM = trimmed.match(/^(if|elif|while)\s+(.+):$/);
      if (ifM) {
        // Apply in/not-in operators to the condition
        const condExpr = ifM[2]
          .replace(/(\w[\w.]*)\s+not\s+in\s+([\w.\[\]()'"]+)/g, '!$2.includes($1)')
          .replace(/(\w[\w.]*)\s+in\s+([\w.\[\]()'"]+)/g, '$2.includes($1)');
        if (ifM[1] === 'elif') {
          out.pop();
          out.push(' '.repeat(indent) + '} else if (' + condExpr + ') {');
        } else {
          out.push(' '.repeat(indent) + ifM[1] + ' (' + condExpr + ') {');
        }
        stack.push({ indent, inClass }); continue;
      }

      if (trimmed === 'else:') {
        out.pop();
        out.push(' '.repeat(indent) + '} else {');
        stack.push({ indent, inClass }); continue;
      }

      // try / except / finally
      if (trimmed === 'try:') { out.push(' '.repeat(indent) + 'try {'); stack.push({ indent, inClass }); continue; }
      const excM = trimmed.match(/^except(?:\s+[\w.]+)?(?:\s+as\s+(\w+))?:$/);
      if (excM) { out.pop(); out.push(' '.repeat(indent) + '} catch (' + (excM[1] || '_e') + ') {'); stack.push({ indent, inClass }); continue; }
      if (trimmed === 'finally:') { out.pop(); out.push(' '.repeat(indent) + '} finally {'); stack.push({ indent, inClass }); continue; }

      // with
      const withM = trimmed.match(/^with\s+.+:$/);
      if (withM) { out.push(' '.repeat(indent) + '{ // with'); stack.push({ indent, inClass }); continue; }

      // self. → this. and handle in/not-in in expressions
      const fixed = rawLine
        .replace(/\bself\./g, 'this.').replace(/\bself\b/g, 'this')
        .replace(/(\w[\w.]*)\s+not\s+in\s+([\w.\[\]()'"]+)/g, '!$2.includes($1)')
        .replace(/(\w[\w.]*)\s+in\s+([\w.\[\]()'"]+)/g, '$2.includes($1)');
      out.push(fixed);
    }

    while (stack.length > 1) { stack.pop(); out.push('}'); }

    const transpiled = out.join('\n');

    const builtins = `
"use strict";
const __out = [];
function __P(...a) {
  __out.push({ text: a.map(x => {
    if (x === null || x === undefined) return 'None';
    if (x === true) return 'True';
    if (x === false) return 'False';
    if (Array.isArray(x)) return '[' + x.map(v => typeof v==='string' ? "'" + v + "'" : String(v)).join(', ') + ']';
    if (typeof x === 'object') return str(x);
    return String(x);
  }).join(' '), type: 'text-line' });
}
function __R(a, b, s=1) {
  if (b === undefined) { b = a; a = 0; }
  const r = [];
  if (s > 0) for (let i = a; i < b; i += s) r.push(i);
  else        for (let i = a; i > b; i += s) r.push(i);
  return r;
}
function __L(x) {
  if (x === null || x === undefined) return 0;
  if (typeof x === 'string' || Array.isArray(x)) return x.length;
  if (typeof x === 'object') return Object.keys(x).length;
  return 0;
}
function __I(x) {
  if (Array.isArray(x)) return x;
  if (typeof x === 'string') return x.split('');
  if (x && typeof x[Symbol.iterator] === 'function') return [...x];
  if (x && typeof x === 'object') return Object.entries(x);
  return [];
}
function str(x) {
  if (x === null) return 'None';
  if (x === true) return 'True';
  if (x === false) return 'False';
  if (Array.isArray(x)) return '[' + x.map(v=>str(v)).join(', ') + ']';
  if (typeof x === 'object') return '{' + Object.entries(x).map(([k,v])=>"'"+k+"': "+str(v)).join(', ') + '}';
  return String(x);
}
function dict(entries) { return Object.fromEntries(entries); }
function list(x) { return Array.from(__I(x)); }
function set(x) { return [...new Set(__I(x))]; }
function tuple(...a) { return a.length===1&&Array.isArray(a[0])?a[0]:a; }
function __ENUM(arr, start=0) { const a=Array.isArray(arr)?arr:[...(__I(arr))]; return a.map((v,i) => [i+start, v]); }
function enumerate(arr, start=0) { return __ENUM(arr, start); }
function zip(...arrs) { const len=Math.min(...arrs.map(a=>__I(a).length)); return Array.from({length:len},(_,i)=>arrs.map(a=>__I(a)[i])); }
function reversed(arr) { return [...__I(arr)].reverse(); }
function all(arr) { return __I(arr).every(Boolean); }
function any(arr) { return __I(arr).some(Boolean); }
function map(fn, arr) { return __I(arr).map(fn); }
function filter(fn, arr) { return __I(arr).filter(fn); }
function chr(n) { return String.fromCharCode(n); }
function ord(c) { return c.charCodeAt(0); }
function hex(n) { return '0x' + n.toString(16); }
function bin(n) { return '0b' + n.toString(2); }
function oct(n) { return '0o' + n.toString(8); }
function pow(a,b) { return Math.pow(a,b); }
function input(p='') { return ''; }
const math = { pi:Math.PI, e:Math.E, sqrt:Math.sqrt.bind(Math), floor:Math.floor.bind(Math), ceil:Math.ceil.bind(Math), log:Math.log.bind(Math), log2:Math.log2.bind(Math), log10:Math.log10.bind(Math), sin:Math.sin.bind(Math), cos:Math.cos.bind(Math), tan:Math.tan.bind(Math), pow:Math.pow.bind(Math), abs:Math.abs.bind(Math), factorial: n => { let r=1; for(let i=2;i<=n;i++) r*=i; return r; } };
const random = { random:()=>Math.random(), randint:(a,b)=>Math.floor(Math.random()*(b-a+1))+a, choice:arr=>arr[Math.floor(Math.random()*arr.length)], shuffle:arr=>{for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;} };
`;

    const fn = new Function(builtins + transpiled + '\nreturn __out;');
    const res = fn();
    if (Array.isArray(res)) res.forEach(r => output.push(r));
  } catch (e) {
    errors.push({ text: 'PythonError: ' + e.message, type: 'error' });
  }
  return { output, errors };
}

// ── JavaScript ────────────────────────────────────────────────
function runJS(code, lang = 'JavaScript') {
  const output = [], errors = [];
  try {
    const logs = [];
    const mockConsole = {
      log:   (...a) => logs.push({ text: a.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' '), type: 'text-line' }),
      warn:  (...a) => logs.push({ text: '⚠ ' + a.join(' '), type: 'info' }),
      error: (...a) => logs.push({ text: '✗ ' + a.join(' '), type: 'error' }),
      info:  (...a) => logs.push({ text: '› ' + a.join(' '), type: 'info' }),
      table: (d) => logs.push({ text: JSON.stringify(d, null, 2), type: 'info' }),
    };
    const fn = new Function('console', 'Math', 'Date', 'JSON', 'Array', 'Object', 'String', 'Number', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Promise', 'Set', 'Map', 'RegExp', 'Error', 'Symbol', '"use strict";\ntry{\n' + code + '\n}catch(e){console.error(e.message);}');
    fn(mockConsole, Math, Date, JSON, Array, Object, String, Number, parseInt, parseFloat, isNaN, isFinite, Promise, Set, Map, RegExp, Error, Symbol);
    logs.forEach(l => output.push(l));
    if (output.length === 0) output.push({ text: '[No console output]', type: 'info' });
  } catch (e) {
    errors.push({ text: lang + 'Error: ' + e.message, type: 'error' });
  }
  return { output, errors };
}

// ── TypeScript → strip types → run as JS ─────────────────────
function runTypeScript(code) {
  const stripped = code
    .replace(/:\s*(?:string|number|boolean|void|any|never|unknown|object|null|undefined|[\w<>\[\]|& ]+)(?=[\s,)=;{])/g, '')
    .replace(/<[A-Z]\w*(?:<[^>]*>)?>/g, '')
    .replace(/\binterface\s+\w+\s*\{[^}]*\}/gs, '')
    .replace(/\btype\s+\w+\s*=\s*[^;]+;/g, '')
    .replace(/\bas\s+\w[\w<>[\]]*\b/g, '')
    .replace(/^export\s+(?:default\s+)?/gm, '')
    .replace(/^import\s+.*?(?:from\s+['"][^'"]+['"])?;?\s*$/gm, '');
  return runJS(stripped, 'TypeScript');
}

// ── SQL ───────────────────────────────────────────────────────
function runSQL(code) {
  const output = [], errors = [];
  const tables = {};
  const stmts  = code.split(/;\s*/).map(s => s.trim()).filter(Boolean);
  for (const stmt of stmts) {
    try {
      const up = stmt.toUpperCase();
      if (up.startsWith('CREATE TABLE')) {
        const m = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([^)]+)\)/i);
        if (m) {
          const name = m[1], cols = m[2].split(',').map(c => c.trim().split(/\s+/)[0]);
          tables[name] = { cols, rows: [] };
          output.push({ text: `✓ Table '${name}' created (${cols.join(', ')})`, type: 'success' });
        }
      } else if (up.startsWith('INSERT')) {
        const m = stmt.match(/INSERT\s+INTO\s+(\w+)\s*(?:\(([^)]+)\))?\s*VALUES\s*\(([^)]+)\)/i);
        if (m) {
          const name = m[1], vals = m[3].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
          if (tables[name]) { tables[name].rows.push(vals); output.push({ text: `  1 row inserted into '${name}'`, type: 'text-line' }); }
          else output.push({ text: `Table '${name}' not found`, type: 'error' });
        }
      } else if (up.startsWith('SELECT')) {
        const m = stmt.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
        if (m) {
          const colPart = m[1], tblName = m[2], tbl = tables[tblName];
          if (!tbl) { output.push({ text: `Table '${tblName}' not found`, type: 'error' }); continue; }
          const cols = colPart.trim() === '*' ? tbl.cols : colPart.split(',').map(c => c.trim());
          const widths = cols.map(c => Math.max(c.length, ...tbl.rows.map(r => (r[tbl.cols.indexOf(c)] || '').length)));
          const sep = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
          const hdr = '|' + cols.map((c, i) => ' ' + c.padEnd(widths[i]) + ' ').join('|') + '|';
          output.push({ text: sep, type: 'info' });
          output.push({ text: hdr, type: 'info' });
          output.push({ text: sep, type: 'info' });
          tbl.rows.forEach(row => {
            const line = '|' + cols.map((c, i) => { const idx = tbl.cols.indexOf(c); return ' ' + (row[idx] || '').padEnd(widths[i]) + ' '; }).join('|') + '|';
            output.push({ text: line, type: 'text-line' });
          });
          output.push({ text: sep, type: 'info' });
          output.push({ text: `${tbl.rows.length} row(s)`, type: 'success' });
        }
      } else if (up.startsWith('DROP TABLE')) {
        const m = stmt.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/i);
        if (m) { delete tables[m[1]]; output.push({ text: `✓ Table '${m[1]}' dropped`, type: 'success' }); }
      } else if (up.startsWith('DELETE')) {
        const m = stmt.match(/DELETE\s+FROM\s+(\w+)/i);
        if (m && tables[m[1]]) { const n = tables[m[1]].rows.length; tables[m[1]].rows = []; output.push({ text: `✓ ${n} rows deleted from '${m[1]}'`, type: 'success' }); }
      } else {
        output.push({ text: `? ${stmt.slice(0, 60)}`, type: 'info' });
      }
    } catch (e) { errors.push({ text: 'SQLError: ' + e.message, type: 'error' }); }
  }
  return { output, errors };
}

// ── Markdown renderer ─────────────────────────────────────────
function renderMarkdown(code) {
  const escaped = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const html = escaped
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/^#{6}\s+(.+)$/gm,'<h6>$1</h6>').replace(/^#{5}\s+(.+)$/gm,'<h5>$1</h5>')
    .replace(/^#{4}\s+(.+)$/gm,'<h4>$1</h4>').replace(/^#{3}\s+(.+)$/gm,'<h3>$1</h3>')
    .replace(/^#{2}\s+(.+)$/gm,'<h2>$1</h2>').replace(/^#{1}\s+(.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/~~(.+?)~~/g,'<del>$1</del>').replace(/^---+$/gm,'<hr>')
    .replace(/^&gt;\s+(.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1" style="max-width:100%">')
    .replace(/^[ \t]*[-*+]\s+(.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => '<ul>'+m+'</ul>')
    .replace(/\n\n+/g,'</p><p>').replace(/\n/g,'<br>');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{font-family:'Segoe UI',sans-serif;line-height:1.7;padding:24px 32px;max-width:800px;margin:0 auto;background:#fff;color:#1a2332}
    h1,h2,h3,h4{margin:1.2em 0 0.5em;font-weight:700}h1{font-size:2em;border-bottom:2px solid #e0e4f0;padding-bottom:8px}
    h2{font-size:1.5em;border-bottom:1px solid #e0e4f0;padding-bottom:6px}
    code{background:#f0f4f8;padding:2px 6px;border-radius:3px;font-family:monospace;font-size:.9em;color:#e63946}
    pre{background:#1a1a2e;color:#e6edf3;padding:16px;border-radius:8px;overflow-x:auto;margin:12px 0}
    pre code{background:none;color:inherit;padding:0}blockquote{border-left:4px solid #4d9eff;padding:8px 16px;margin:12px 0;background:#f0f8ff;border-radius:0 6px 6px 0}
    ul{padding-left:24px;margin:8px 0}li{margin:4px 0}a{color:#4d9eff}img{border-radius:6px;max-width:100%}hr{border:none;border-top:2px solid #e0e4f0;margin:20px 0}p{margin:8px 0}
  </style></head><body><p>${html}</p></body></html>`;
}

// ── Pattern-based simulators ──────────────────────────────────
function evalSafe(expr, vars = {}) {
  let s = expr.trim();
  Object.entries(vars).forEach(([k, v]) => { s = s.replace(new RegExp('\\b' + k + '\\b', 'g'), String(v)); });
  s = s.replace(/\bMath\.PI\b/g, Math.PI).replace(/\bMath\.E\b/g, Math.E)
       .replace(/Math\.(sqrt|abs|floor|ceil|round|log|sin|cos|tan|pow)\(([^)]+)\)/g, (_, fn, arg) => String(Math[fn](...arg.split(',').map(Number))))
       .replace(/\bString\.valueOf\(([^)]+)\)/g, '$1');
  try { return String(eval(s)); } catch { return expr; }
}

function simPrintLines(code, patterns) {
  const output = [];
  for (const { re, process } of patterns) {
    const tmp = new RegExp(re.source, re.flags);
    let m;
    while ((m = tmp.exec(code)) !== null) {
      const lines = process(m).replace(/\\n/g,'\n').replace(/\\t/g,'\t').split('\n');
      lines.forEach(l => output.push({ text: l, type: 'text-line' }));
    }
  }
  return output;
}

function runJava(code) {
  const output = [], errors = [];
  try {
    const vars = {};
    code.replace(/(?:int|double|float|String|long|boolean|char)\s+(\w+)\s*=\s*([^;]+);/g, (_, n, v) => {
      try { vars[n] = eval(evalSafe(v.trim(), vars)); } catch {}
    });

    // for loops
    const forRe = /for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(\d+)\s*;\s*\1\s*([<>]=?)\s*(\d+)\s*;\s*\1(\+\+|--|\+=\s*\d+|-=\s*\d+)\s*\)\s*\{([^}]+)\}/gs;
    let m, processed = code;
    while ((m = forRe.exec(code)) !== null) {
      const [full, v, s, op, e, inc, body] = m;
      let i = parseInt(s), end = parseInt(e), step = 1;
      if (inc.includes('--') || inc.includes('-=')) step = -1;
      const incM = inc.match(/[+-]=\s*(\d+)/); if (incM) step = parseInt(incM[1]) * (step < 0 ? -1 : 1);
      const cond = i => op==='<'?i<end:op==='<='?i<=end:op==='>'?i>end:i>=end;
      for (; cond(i) && output.length < 200; i += step) {
        const lv = { ...vars, [v]: i };
        body.replace(/System\.out\.print(?:ln)?\s*\(\s*(.*?)\s*\);/g, (_, expr) => {
          const parts = expr.split(/\s*\+\s*/).map(p => {
            p = p.trim();
            if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) return p.slice(1,-1);
            return evalSafe(p, lv);
          });
          output.push({ text: parts.join(''), type: 'text-line' });
        });
      }
      processed = processed.replace(full, '');
    }
    // Non-loop prints
    processed.replace(/System\.out\.print(?:ln)?\s*\(\s*(.*?)\s*\);/g, (_, expr) => {
      const parts = expr.split(/\s*\+\s*/).map(p => {
        p = p.trim();
        if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) return p.slice(1,-1);
        return evalSafe(p, vars);
      });
      output.push({ text: parts.join(''), type: 'text-line' });
    });
    if (!output.length) output.push({ text: '[Java] Offline sim: System.out.println + basic loops supported. Use online mode for full JVM.', type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

function runRust(code) {
  const output = [], errors = [];
  try {
    const re = /println!\s*\(\s*"([^"]*)"\s*(?:,\s*([^)]+))?\s*\)/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      let fmt = m[1];
      if (m[2]) {
        const args = m[2].split(',').map(a => a.trim());
        let ai = 0;
        fmt = fmt
          .replace(/\{:?\.?(\d+)f?\}/g, (_, d) => { const v = evalSafe(args[ai++] || '0'); return d ? parseFloat(v).toFixed(parseInt(d)) : v; })
          .replace(/\{:?\??d?\}/g, () => evalSafe(args[ai++] || '0'))
          .replace(/\{\}/g, () => { try { return evalSafe(args[ai++] || '""'); } catch { return args[ai-1] || ''; } });
      }
      fmt.replace(/\\n/g,'\n').split('\n').forEach(l => output.push({ text: l, type: 'text-line' }));
    }
    if (!output.length) output.push({ text: '[Rust] Offline sim: println! supported. Use online mode for full compilation.', type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

function runGo(code) {
  const output = [], errors = [];
  try {
    const re = /fmt\.(Print(?:ln|f)?)\s*\(\s*([\s\S]*?)\s*\)/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      const fn = m[1], raw = m[2];
      const args = raw.match(/"[^"]*"|`[^`]*`|[\w.+\-*/()[\]]+/g) || [];
      if (fn === 'Println') {
        const parts = args.map(a => { a = a.trim(); if ((a[0]==='"'&&a.slice(-1)==='"')||(a[0]==='`'&&a.slice(-1)==='`')) return a.slice(1,-1); try { return String(eval(a)); } catch { return a; } });
        output.push({ text: parts.join(' '), type: 'text-line' });
      } else if (fn === 'Printf' || fn === 'Print') {
        const fmtStr = args[0] ? args[0].replace(/^["` ]|["` ]$/g,'') : '';
        const fArgs  = args.slice(1).map(a => { try { return String(eval(a)); } catch { return a; } });
        let ai = 0;
        const result = fmtStr.replace(/%[vdsfg.0-9]+/g, () => fArgs[ai++] || '').replace(/\\n/g,'\n').replace(/\\t/g,'\t');
        result.split('\n').forEach(l => output.push({ text: l, type: 'text-line' }));
      }
    }
    if (!output.length) output.push({ text: '[Go] Offline sim: only fmt.Print/Println/Printf supported. Use online mode for full execution.', type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

function runPHP(code) {
  const output = [], errors = [];
  try {
    code.replace(/(?:echo|print)\s+((?:"[^"]*"|'[^']*'|\$\w+|[^;]+)(?:\s*\.\s*(?:"[^"]*"|'[^']*'|\$\w+))*)\s*;/g, (_, expr) => {
      const vars = {}; code.replace(/\$(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\d+))/g, (__, n, a, b, c) => { vars[n] = a || b || c || ''; });
      const parts = expr.split(/\s*\.\s*/).map(p => {
        p = p.trim();
        if (p.startsWith('$')) return vars[p.slice(1)] || p;
        if ((p[0]==='"'&&p.slice(-1)==='"')||(p[0]==="'"&&p.slice(-1)==="'")) return p.slice(1,-1);
        return p;
      });
      output.push({ text: parts.join('').replace(/\\n/g,'\n'), type: 'text-line' });
    });
    if (!output.length) output.push({ text: '[PHP offline sim] Go online for full execution.', type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

function runRuby(code) {
  const output = [], errors = [];
  try {
    code.replace(/(?:puts|print|p)\s+((?:"[^"]*"|'[^']*'|[\w.+\-*/()[\]]+)(?:\s*,\s*(?:"[^"]*"|'[^']*'|[\w.+\-*/()[\]]+))*)/g, (_, args) => {
      args.split(/\s*,\s*/).forEach(a => {
        a = a.trim();
        const raw = (a[0]==='"'||a[0]==="'") ? a.slice(1,-1) : a;
        const txt = raw.replace(/#\{([^}]+)\}/g, (__, e) => { try { return String(eval(e)); } catch { return e; } });
        output.push({ text: txt, type: 'text-line' });
      });
    });
    if (!output.length) output.push({ text: '[Ruby offline sim] Go online for full execution.', type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

function runBash(code) {
  const output = [], errors = [];
  try {
    const vars = {};
    code.split('\n').forEach(line => {
      const t = line.trim();
      if (!t || t.startsWith('#')) return;
      const varM = t.match(/^(\w+)=(.+)$/);
      if (varM) { vars[varM[1]] = varM[2].replace(/["']/g,''); return; }
      const echoM = t.match(/^echo\s+(.+)$/);
      if (echoM) {
        const txt = echoM[1].replace(/["']/g,'').replace(/\$\{?(\w+)\}?/g, (_, v) => vars[v] || ('$'+v));
        output.push({ text: txt, type: 'text-line' });
      }
      const printfM = t.match(/^printf\s+"([^"]*)"/);
      if (printfM) output.push({ text: printfM[1].replace(/\\n/g,'').replace(/\\t/g,'\t'), type: 'text-line' });
    });
    if (!output.length) output.push({ text: '[Bash offline sim] Go online for real execution.', type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

function runLua(code) {
  const output = [], errors = [];
  try {
    code.replace(/(?:print|io\.write)\s*\(\s*((?:"[^"]*"|'[^']*'|[\w.+\-*/()[\]]+)(?:\s*,\s*(?:"[^"]*"|'[^']*'|[\w.+\-*/()[\]]+))*)\s*\)/g, (_, args) => {
      const parts = args.split(/\s*,\s*/).map(a => {
        a = a.trim();
        if ((a[0]==='"'&&a.slice(-1)==='"')||(a[0]==="'"&&a.slice(-1)==="'")) return a.slice(1,-1);
        try { return String(eval(a)); } catch { return a; }
      });
      output.push({ text: parts.join('\t'), type: 'text-line' });
    });
    if (!output.length) output.push({ text: '[Lua offline sim] Go online for full execution.', type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

function runSwift(code) {
  const output = [], errors = [];
  try {
    code.replace(/print\s*\(\s*((?:"[^"]*"|[\w.+\-*/()[\]]+)(?:\s*,\s*(?:"[^"]*"|[\w.+\-*/()[\]]+))*)\s*\)/g, (_, args) => {
      const parts = args.split(/\s*,\s*/).map(a => {
        a = a.trim();
        const raw = (a[0]==='"') ? a.slice(1,-1) : a;
        return raw.replace(/\\\(([^)]+)\)/g, (__, e) => { try { return String(eval(e)); } catch { return e; } });
      });
      output.push({ text: parts.join(' '), type: 'text-line' });
    });
    if (!output.length) output.push({ text: '[Swift offline sim] Go online for full compilation.', type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

function runKotlin(code) {
  const output = [], errors = [];
  try {
    code.replace(/print(?:ln)?\s*\(\s*((?:"[^"]*"|[\w.+\-*/()[\]]+)(?:\s*\+\s*(?:"[^"]*"|[\w.+\-*/()[\]]+))*)\s*\)/g, (_, expr) => {
      const parts = expr.split(/\s*\+\s*/).map(p => {
        p = p.trim();
        if (p[0]==='"' && p.slice(-1)==='"') return p.slice(1,-1).replace(/\$\{([^}]+)\}/g, (__, e) => { try { return String(eval(e)); } catch { return e; } }).replace(/\$(\w+)/g, (__, v) => v);
        try { return String(eval(p)); } catch { return p; }
      });
      output.push({ text: parts.join(''), type: 'text-line' });
    });
    if (!output.length) output.push({ text: '[Kotlin offline sim] Go online for full compilation.', type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

function runCSharp(code) {
  const output = [], errors = [];
  try {
    const vars = {};
    code.replace(/(?:int|double|float|string|long|bool|var)\s+(\w+)\s*=\s*([^;]+);/g, (_, n, v) => {
      try { vars[n] = eval(evalSafe(v.trim(), vars)); } catch {}
    });
    const forRe = /for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(\d+)\s*;\s*\1\s*([<>]=?)\s*(\d+)\s*;\s*\1\+\+\s*\)\s*\{([^}]+)\}/gs;
    let m, processed = code;
    while ((m = forRe.exec(code)) !== null) {
      const [full, v, s, op, e, body] = m;
      let i = parseInt(s); const end = parseInt(e);
      const cond = i => op==='<'?i<end:op==='<='?i<=end:op==='>'?i>end:i>=end;
      for (; cond(i) && output.length < 200; i++) {
        body.replace(/Console\.Write(?:Line)?\s*\(\s*(.*?)\s*\);/g, (__, expr) => {
          const parts = expr.split(/\s*\+\s*/).map(p => {
            p = p.trim();
            if (p[0]==='"' && p.slice(-1)==='"') return p.slice(1,-1);
            return evalSafe(p, { ...vars, [v]: i });
          });
          output.push({ text: parts.join(''), type: 'text-line' });
        });
      }
      processed = processed.replace(full, '');
    }
    processed.replace(/Console\.Write(?:Line)?\s*\(\s*(.*?)\s*\);/g, (_, expr) => {
      const parts = expr.split(/\s*\+\s*/).map(p => {
        p = p.trim();
        if (p[0]==='"' && p.slice(-1)==='"') return p.slice(1,-1);
        return evalSafe(p, vars);
      });
      output.push({ text: parts.join(''), type: 'text-line' });
    });
    if (!output.length) output.push({ text: '[C# offline sim] Go online for full .NET execution.', type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

function runC(code, isCpp = false) {
  const output = [], errors = [];
  try {
    // printf
    code.replace(/printf\s*\(\s*"([^"\\]*(\\.[^"\\]*)*)"\s*(?:,([^;)]+))?\s*\)/g, (_, fmt, __, args) => {
      let result = fmt.replace(/\\n/g,'\n').replace(/\\t/g,'\t');
      if (args) {
        const a = args.split(',').map(x => x.trim());
        let ai = 0;
        result = result.replace(/%[diouxXeEfFgGcs]/g, () => { try { return String(eval(a[ai++]||'0')); } catch { return a[ai-1]||''; } });
      }
      result.split('\n').forEach((l, i, arr) => { if (i < arr.length - 1 || l) output.push({ text: l, type: 'text-line' }); });
    });
    // cout
    if (isCpp) {
      code.replace(/cout\s*((?:<<\s*(?:"[^"]*"|endl|'[^']*'|[\w.+\-*/()[\]]+)\s*)+);/g, (_, chain) => {
        const parts = [];
        chain.replace(/<<\s*("([^"]*)"|endl|'([^']*)'|([\w.+\-*/()[\]]+))/g, (__, _a, str, ch, expr) => {
          if (str !== undefined) parts.push(str.replace(/\\n/g,'\n').replace(/\\t/g,'\t'));
          else if (ch !== undefined) parts.push(ch);
          else if (expr === 'endl') parts.push('\n');
          else { try { parts.push(String(eval(expr))); } catch { parts.push(expr); } }
        });
        parts.join('').split('\n').forEach(l => output.push({ text: l, type: 'text-line' }));
      });
    }
    if (!output.length) output.push({ text: `[${isCpp?'C++':'C'} offline sim] Go online for full compilation.`, type: 'info' });
  } catch (e) { errors.push({ text: 'SimError: ' + e.message, type: 'error' }); }
  return { output, errors };
}

// Master offline dispatch
function runOffline(lang, code) {
  switch (lang) {
    case 'python':     return runPython(code);
    case 'javascript': return runJS(code, 'JavaScript');
    case 'typescript': return runTypeScript(code);
    case 'html': case 'css': return { output:[{text:'Rendered in Live Preview',type:'success'}], errors:[] };
    case 'sql':        return runSQL(code);
    case 'markdown':   return { output:[{text:'Rendered in Preview',type:'success'}], errors:[] };
    case 'java':       return runJava(code);
    case 'rust':       return runRust(code);
    case 'go':         return runGo(code);
    case 'php':        return runPHP(code);
    case 'ruby':       return runRuby(code);
    case 'bash':       return runBash(code);
    case 'lua':        return runLua(code);
    case 'swift':      return runSwift(code);
    case 'kotlin':     return runKotlin(code);
    case 'csharp':     return runCSharp(code);
    case 'cpp':        return runC(code, true);
    case 'c':          return runC(code, false);
    default:           return { output:[{text:`[${lang}] offline simulator not available. Connect internet for cloud execution.`,type:'info'}], errors:[] };
  }
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════
const TEMPLATES = {
  python: `# ALONE CODE STUDIO v11 🚀 — runs offline!
def greet(name: str) -> str:
    return f"Hello, {name}! 👋"

print(greet("World"))

# List comprehension
squares = [i ** 2 for i in range(1, 6)]
print("Squares:", squares)

# Class example
class Counter:
    def __init__(self, start=0):
        self.value = start
    def increment(self):
        self.value += 1
        return self
    def __str__(self):
        return f"Counter({self.value})"

c = Counter()
c.increment().increment().increment()
print(c)
`,
  javascript: `// ALONE CODE STUDIO v11 🚀 — runs offline!
const greet = name => \`Hello, \${name}! 👋\`;
console.log(greet("World"));

// Modern JS
const nums = [1, 2, 3, 4, 5];
console.log("Squares:", nums.map(n => n ** 2));

// Class
class Stack {
  #items = [];
  push(v) { this.#items.push(v); return this; }
  pop()  { return this.#items.pop(); }
  peek() { return this.#items.at(-1); }
  get size() { return this.#items.length; }
}

const s = new Stack();
s.push(1).push(2).push(3);
console.log("Top:", s.peek(), "Size:", s.size);
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>ACS v11</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Segoe UI',sans-serif; background:linear-gradient(135deg,#0f0c29,#24243e); color:#e0e0e0; min-height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:20px; padding:24px; }
    h1 { background:linear-gradient(90deg,#4d9eff,#bb8fff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-size:2.2rem; }
    .card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px 28px; display:flex; flex-direction:column; gap:10px; }
    button { background:linear-gradient(135deg,#4d9eff,#bb8fff); border:none; color:#fff; padding:10px 24px; border-radius:8px; cursor:pointer; font-size:0.9rem; transition:transform 0.2s; }
    button:hover { transform:translateY(-2px); }
    #count { font-size:2rem; font-weight:800; color:#4d9eff; text-align:center; }
  </style>
</head>
<body>
  <h1>ACS v11 Live Preview 🚀</h1>
  <div class="card">
    <div id="count">0</div>
    <button onclick="document.getElementById('count').textContent=+document.getElementById('count').textContent+1">Click me! 🎯</button>
  </div>
</body>
</html>`,
  sql: `-- ACS v11 — Offline SQL Engine 🗃️

CREATE TABLE employees (
  id INTEGER,
  name TEXT,
  dept TEXT,
  salary REAL
);

INSERT INTO employees VALUES (1, 'Alice',   'Engineering', 95000);
INSERT INTO employees VALUES (2, 'Bob',     'Marketing',   72000);
INSERT INTO employees VALUES (3, 'Charlie', 'Engineering', 88000);
INSERT INTO employees VALUES (4, 'Diana',   'Design',      80000);

SELECT * FROM employees;
`,
  java: `// ACS v11 — Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World! 🚀");
        System.out.println("Pi = " + Math.PI);
        for (int i = 1; i <= 5; i++) {
            System.out.println(i + " squared = " + (i * i));
        }
    }
}`,
  rust: `// ACS v11 — Rust
fn main() {
    println!("Hello, World! 🚀");
    let squares: Vec<i32> = (1..=5).map(|n| n * n).collect();
    println!("Squares: {:?}", squares);
    for n in 1..=5 {
        println!("{} * {} = {}", n, n, n * n);
    }
}`,
  go: `// ACS v11 — Go
package main
import "fmt"

func main() {
    fmt.Println("Hello, World! 🚀")
    fmt.Printf("Pi = %f\n", 3.14159)
    for i := 1; i <= 5; i++ {
        fmt.Printf("%d squared = %d\n", i, i*i)
    }
}`,
  cpp: `// ACS v11 — C++
#include <iostream>
#include <vector>
using namespace std;

int main() {
    cout << "Hello, World! 🚀" << endl;
    vector<int> nums = {1,2,3,4,5};
    for (int n : nums) {
        cout << n << " squared = " << n*n << endl;
    }
    return 0;
}`,
  markdown: `# ALONE CODE STUDIO v11 🚀

> **Fully Offline IDE** — iOS · Android · Windows · Linux

## Features
- ⚡ All 20 languages run **offline**
- 📁 Import files from your **device storage**
- 🔀 Split view editing
- 🤖 AI Assistant (online)
- 📱 Installable PWA

## Quick Start
\`\`\`python
def hello(name):
    return f"Hello, {name}!"
print(hello("World"))
\`\`\`

**Ctrl+Enter** to run · **Ctrl+S** to save
`,
  default: `// Start coding here...\n`,
  typescript: `// ALONE CODE STUDIO v11 🚀 — TypeScript
interface Person {
  name: string;
  age: number;
}

function greet(person: Person): string {
  return \`Hello, \${person.name}! You are \${person.age} years old.\`;
}

const p: Person = { name: 'World', age: 25 };
console.log(greet(p));

// Generic function
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const nums: number[] = [1, 2, 3, 4, 5];
console.log('First:', first(nums));
console.log('Squares:', nums.map((n: number) => n ** 2));
`,
  ruby: `# ALONE CODE STUDIO v11 🚀 — Ruby
def greet(name)
  "Hello, #{name}! 👋"
end

puts greet("World")

# Array operations
squares = (1..5).map { |n| n ** 2 }
puts "Squares: #{squares}"

# Class
class Counter
  def initialize(start = 0)
    @value = start
  end

  def increment
    @value += 1
    self
  end

  def to_s
    "Counter(#{@value})"
  end
end

c = Counter.new
c.increment.increment.increment
puts c
`,
  kotlin: `// ALONE CODE STUDIO v11 🚀 — Kotlin
fun greet(name: String): String = "Hello, $name! 👋"

fun main() {
    println(greet("World"))
    
    val squares = (1..5).map { it * it }
    println("Squares: $squares")
    
    // Data class
    data class Point(val x: Int, val y: Int) {
        fun distanceTo(other: Point): Double {
            val dx = (x - other.x).toDouble()
            val dy = (y - other.y).toDouble()
            return Math.sqrt(dx * dx + dy * dy)
        }
    }
    
    val p1 = Point(0, 0)
    val p2 = Point(3, 4)
    println("Distance: \${p1.distanceTo(p2)}")
}
`,
  csharp: `// ALONE CODE STUDIO v11 🚀 — C#
using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static string Greet(string name) => $"Hello, {name}! 👋";
    
    static void Main() {
        Console.WriteLine(Greet("World"));
        
        var squares = Enumerable.Range(1, 5).Select(n => n * n).ToList();
        Console.WriteLine("Squares: " + string.Join(", ", squares));
        
        for (int i = 1; i <= 5; i++) {
            Console.WriteLine(i + " squared = " + (i * i));
        }
    }
}
`,
  swift: `// ALONE CODE STUDIO v11 🚀 — Swift
func greet(_ name: String) -> String {
    return "Hello, \\(name)! 👋"
}

print(greet("World"))

let squares = (1...5).map { $0 * $0 }
print("Squares: \\(squares)")

// Struct
struct Point {
    var x: Double
    var y: Double
    
    func distance(to other: Point) -> Double {
        let dx = x - other.x
        let dy = y - other.y
        return (dx*dx + dy*dy).squareRoot()
    }
}

let p1 = Point(x: 0, y: 0)
let p2 = Point(x: 3, y: 4)
print("Distance: \\(p1.distance(to: p2))")
`,
  lua: `-- ALONE CODE STUDIO v11 🚀 — Lua
local function greet(name)
    return "Hello, " .. name .. "! 👋"
end

print(greet("World"))

-- Table operations
local squares = {}
for i = 1, 5 do
    squares[i] = i * i
end

for i, v in ipairs(squares) do
    print(i .. " squared = " .. v)
end

-- Class-like table
local Counter = {}
Counter.__index = Counter

function Counter.new(start)
    return setmetatable({ value = start or 0 }, Counter)
end

function Counter:increment()
    self.value = self.value + 1
    return self
end

function Counter:__tostring()
    return "Counter(" .. self.value .. ")"
end

local c = Counter.new()
c:increment():increment():increment()
print(tostring(c))
`,
  bash: `#!/bin/bash
# ALONE CODE STUDIO v11 🚀 — Bash

greet() {
    echo "Hello, $1! 👋"
}

greet "World"

# Array
squares=""
for i in 1 2 3 4 5; do
    sq=$((i * i))
    squares="$squares $sq"
    echo "$i squared = $sq"
done

echo "Squares:$squares"

# Variables
NAME="ALONE CODE STUDIO"
VERSION="v11"
echo "$NAME $VERSION"
`,
  php: `<?php
// ALONE CODE STUDIO v11 🚀 — PHP

function greet(string $name): string {
    return "Hello, $name! 👋";
}

echo greet("World") . "\\n";

// Array operations
$squares = array_map(fn($n) => $n ** 2, range(1, 5));
echo "Squares: " . implode(", ", $squares) . "\\n";

// Class
class Counter {
    private int $value;
    
    public function __construct(int $start = 0) {
        $this->value = $start;
    }
    
    public function increment(): self {
        $this->value++;
        return $this;
    }
    
    public function __toString(): string {
        return "Counter({$this->value})";
    }
}

$c = new Counter();
$c->increment()->increment()->increment();
echo $c . "\\n";
?>
`,
  c: `/* ALONE CODE STUDIO v11 🚀 — C */
#include <stdio.h>
#include <math.h>

void greet(const char* name) {
    printf("Hello, %s! 👋\\n", name);
}

int main() {
    greet("World");
    
    printf("Pi = %.4f\\n", 3.14159265);
    
    for (int i = 1; i <= 5; i++) {
        printf("%d squared = %d\\n", i, i * i);
    }
    
    /* Array sum */
    int nums[] = {1, 2, 3, 4, 5};
    int sum = 0;
    int n = sizeof(nums) / sizeof(nums[0]);
    for (int i = 0; i < n; i++) sum += nums[i];
    printf("Sum: %d\\n", sum);
    
    return 0;
}
`,
};

function uid()    { return Math.random().toString(36).slice(2, 9); }
function tmpl(l) { return TEMPLATES[l] || TEMPLATES.default; }

// ═══════════════════════════════════════════════════════════════
// TREE NODE COMPONENT
// ═══════════════════════════════════════════════════════════════
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: { node:{type:Object,required:true}, activeFileId:{type:String,default:null}, splitFileId:{type:String,default:null}, depth:{type:Number,default:0} },
  emits: ['openFile','openSplit','rename','deleteNode','toggleFolder','duplicateFile'],
  methods: {
    onClick() { if (this.node.type==='folder') this.$emit('toggleFolder',this.node.id); else this.$emit('openFile',this.node.id); },
    onCtx(e) { e.preventDefault(); this.$emit('rename',this.node.id); },
    col(lang) { return LANG[lang]?.color||'#8b949e'; },
  },
  template: `
  <div>
    <div class="tree-item"
      :class="{'active':node.type==='file'&&node.id===activeFileId,'split-active':node.type==='file'&&node.id===splitFileId}"
      :style="{'padding-left':(12+depth*14)+'px'}"
      @click="onClick" @contextmenu="onCtx">
      <span v-if="node.type==='folder'" class="tree-chevron">
        <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" :style="{transform:node.open?'rotate(90deg)':'',transition:'transform 0.18s'}"><path d="M3 2l4 3-4 3V2z"/></svg>
      </span>
      <span v-if="node.type==='folder'" class="tree-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
      </span>
      <span v-else class="tree-file-dot" :style="{background:col(node.lang)}"></span>
      <span class="tree-name">{{node.name}}</span>
      <span v-if="node.type==='file'&&node.unsaved" class="tree-unsaved">●</span>
      <div class="tree-actions">
        <button v-if="node.type==='file'" class="tree-btn tree-btn-split" @click.stop="$emit('openSplit',node.id)" title="Split view">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
        </button>
        <button v-if="node.type==='file'" class="tree-btn" @click.stop="$emit('duplicateFile',node.id)" title="Duplicate" style="color:#7c8cf0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="tree-btn tree-btn-rename" @click.stop="$emit('rename',node.id)" title="Rename">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="tree-btn tree-btn-del" @click.stop="$emit('deleteNode',node.id)" title="Delete">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>
    </div>
    <template v-if="node.type==='folder'&&node.open&&node.children?.length">
      <tree-node v-for="c in node.children" :key="c.id" :node="c" :active-file-id="activeFileId" :split-file-id="splitFileId" :depth="depth+1"
        @open-file="$emit('openFile',$event)" @open-split="$emit('openSplit',$event)"
        @rename="$emit('rename',$event)" @delete-node="$emit('deleteNode',$event)" @toggle-folder="$emit('toggleFolder',$event)" @duplicate-file="$emit('duplicateFile',$event)"/>
    </template>
  </div>`,
});

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
const app = createApp({
  components: { TreeNode },
  setup() {
    // ── State ──────────────────────────────────────────────────
    const loading      = ref(true);
    const splashMsg    = ref('Initializing…');
    const sidebarOpen  = ref(true);
    const settingsOpen = ref(false);
    const showApiKey   = ref(false);
    const focusMode    = ref(false);
    const isMobile     = ref(window.innerWidth < 768);
    const isOnline     = ref(navigator.onLine);
    const findOpen     = ref(false);
    const findQuery    = ref('');
    const gotoLineOpen = ref(false);
    const gotoLineNum  = ref('');
    const replaceQuery = ref('');
    const findInputRef = ref(null);
    const splitView    = ref(false);
    const splitFileId  = ref(null);
    const splitW       = ref(300);
    const aiPanelOpen  = ref(false);
    const previewOpen  = ref(false);
    const previewLoad  = ref(false);
    const previewRef   = ref(null);
    const fileTree     = ref([]);
    const activeFileId = ref(null);
    const outputLines  = ref([]);
    const isRunning    = ref(false);
    const runStatus    = ref('Running…');
    const lastStats    = ref({ time:null, exit:null, lines:0 });
    const consoleH     = ref(160);
    const consoleRef   = ref(null);
    const execRef      = ref(null);
    const termInput    = ref('');
    const termInputRef = ref(null);
    const termHist     = ref([]);
    const termHistIdx  = ref(-1);
    const curLine      = ref(1);
    const curCol       = ref(1);
    const apiStatus    = ref('ok');
    const fontSize     = ref(13);
    const lineWrap     = ref(false);
    const aiMessages   = ref([]);
    const aiPrompt     = ref('');
    const aiLoading    = ref(false);
    const aiCtx        = ref(true);
    const aiChatRef    = ref(null);

    // Import panel
    const importOpen     = ref(false);
    const importFiles    = ref([]);    // pending files to import
    const importPaste    = ref('');
    const importPasteLang= ref('javascript');
    const importURL      = ref('');
    const isDragOver     = ref(false);
    const importPreview  = ref(null);  // file id being previewed

    // Toast
    const toasts = ref([]);

    const settings = ref({ theme:'default', font:'jetbrains', tabSize:2, apiKey:'', projectName:'my-project' });

    const availableThemes = [
      { id:'default',     label:'Default',    preview:'background:linear-gradient(135deg,#080b14,#0d1117)' },
      { id:'github-dark', label:'GH Dark',    preview:'background:linear-gradient(135deg,#0d1117,#161b22)' },
      { id:'dracula',     label:'Dracula',    preview:'background:linear-gradient(135deg,#282a36,#44475a)' },
      { id:'monokai',     label:'Monokai',    preview:'background:linear-gradient(135deg,#272822,#49483e)' },
      { id:'nord',        label:'Nord',       preview:'background:linear-gradient(135deg,#2e3440,#4c566a)' },
      { id:'tokyo-night', label:'Tokyo',      preview:'background:linear-gradient(135deg,#1a1b26,#24283b)' },
      { id:'solarized',   label:'Solarized',  preview:'background:linear-gradient(135deg,#002b36,#073642)' },
      { id:'light',       label:'Light',      preview:'background:linear-gradient(135deg,#f0f4f8,#ffffff)' },
    ];
    const availableFonts = [
      { id:'jetbrains', label:'JetBrains Mono', family:"'JetBrains Mono',monospace" },
      { id:'fira',      label:'Fira Code',      family:"'Fira Code',monospace"       },
      { id:'cascadia',  label:'Cascadia Code',  family:"'Cascadia Code',monospace"   },
      { id:'consolas',  label:'Consolas',       family:'Consolas,monospace'          },
    ];
    const aiPresets = [
      { label:'Explain',    prompt:'Explain what this code does in simple terms.' },
      { label:'Optimize',   prompt:'Optimize this code for performance and readability.' },
      { label:'Fix bugs',   prompt:'Find and fix any bugs or issues in this code.' },
      { label:'Add tests',  prompt:'Write comprehensive unit tests for this code.' },
      { label:'Document',   prompt:'Add detailed documentation and comments.' },
      { label:'Refactor',   prompt:'Refactor this code to improve structure and maintainability.' },
      { label:'Security',   prompt:'Review for security vulnerabilities and suggest fixes.' },
      { label:'Types',      prompt:'Add proper type annotations to this code.' },
      { label:'Convert',    prompt:'Convert this code to a more modern, idiomatic style.' },
      { label:'Complexity', prompt:'Analyze time and space complexity. How can it be improved?' },
    ];

    // ── CodeMirror ─────────────────────────────────────────────
    let editorView = null, splitView2 = null;
    const langComp = new Compartment(), wrapComp = new Compartment(), fontComp = new Compartment();
    const sLangComp= new Compartment(), sFontComp = new Compartment();
    let internalUpdate = false;
    let previewBlobUrl = null, previewTimer = null;

    // ── Computed ───────────────────────────────────────────────
    function flatten(nodes, acc = []) {
      if (!nodes) return acc;
      for (const n of nodes) { if (n.type==='file') acc.push(n); else if (n.children) flatten(n.children, acc); }
      return acc;
    }
    const flatFiles  = computed(() => flatten(fileTree.value));
    const activeFile = computed(() => flatFiles.value.find(f => f.id === activeFileId.value) || null);
    const splitFile  = computed(() => flatFiles.value.find(f => f.id === splitFileId.value)  || null);
    const OFFLINE_LANGS = new Set(['python','javascript','typescript','html','css','sql','markdown','java','rust','go','php','ruby','bash','lua','swift','kotlin','csharp','cpp','c']);
    const curLang    = computed({ get:()=>activeFile.value?.lang||'python', set:v=>{ if(activeFile.value) activeFile.value.lang=v; } });
    const activeLang = computed(() => LANG[curLang.value] || LANG.python);
    const modCount   = computed(() => flatFiles.value.filter(f=>f.unsaved).length);
    const isWeb      = computed(() => WEB_LANGS.has(curLang.value));
    const canPreview = computed(() => WEB_LANGS.has(curLang.value) || curLang.value === 'markdown');
    const isOfflineLang = computed(() => OFFLINE_LANGS.has(curLang.value));
    const editorH    = computed(() => { const t=34,h=30,f=findOpen.value?38:0; return `calc(100% - ${t+h+consoleH.value+f}px)`; });
    function langCfg(l) { return LANG[l] || null; }

    // ── Connectivity ───────────────────────────────────────────
    window.addEventListener('online',  () => { isOnline.value = true;  toast('Back online ✓', 'ok'); });
    window.addEventListener('offline', () => { isOnline.value = false; toast('Offline mode — local engines active', 'info'); });

    // ── Toast ──────────────────────────────────────────────────
    function toast(msg, type = 'info') {
      const id = uid();
      toasts.value.push({ id, msg, type });
      setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id); }, 2200);
    }

    // ── Preview ────────────────────────────────────────────────
    function buildPreview(file, all) {
      if (!file) return '';
      const { lang, code = '' } = file;
      if (lang === 'html') {
        const cssFiles = all.filter(f => f.lang === 'css');
        const jsFiles  = all.filter(f => f.lang === 'javascript');
        let doc = code;
        let inj = cssFiles.map(f => `<style>/*${f.name}*/\n${f.code||''}\n</style>`).join('\n');
        doc = doc.includes('</head>') ? doc.replace('</head>', inj + '</head>') : inj + doc;
        inj = jsFiles.map(f => `<script>/*${f.name}*/\n${f.code||''}\n<\/script>`).join('\n');
        doc = doc.includes('</body>') ? doc.replace('</body>', inj + '</body>') : doc + inj;
        return doc;
      }
      if (lang === 'css') return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:'Segoe UI',sans-serif;background:#1a1a2e;color:#e0e0e0;padding:20px}</style><style>${code}</style></head><body><h2 style="color:#4d9eff">CSS Preview</h2><div class="card"><h1>Heading</h1><p>Paragraph.</p><a href="#">Link</a></div></body></html>`;
      if (lang === 'javascript') return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{background:#0d1117;color:#e6edf3;font-family:monospace;padding:12px;font-size:12px}.ln{color:#484f58;min-width:28px;display:inline-block;text-align:right;user-select:none;margin-right:8px}.err{color:#f85149}.warn{color:#e3b341}#h{color:#4d9eff;font-size:.7rem;margin-bottom:8px;border-bottom:1px solid #1e2d40;padding-bottom:6px}</style></head><body><div id="h">▶ JS Output</div><div id="o"></div><script>let n=0;const o=document.getElementById('o');const w=(t,c='')=>{n++;const d=document.createElement('div');d.innerHTML='<span class="ln">'+n+'</span><span class="'+c+'">'+String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</span>';o.appendChild(d);};console.log=(...a)=>w(a.map(x=>typeof x==='object'?JSON.stringify(x,null,2):String(x)).join(' '));console.warn=(...a)=>w('⚠ '+a.join(' '),'warn');console.error=(...a)=>w('✗ '+a.join(' '),'err');try{${code}}catch(e){w('✗ '+e.message,'err');}<\/script></body></html>`;
      if (lang === 'markdown') return renderMarkdown(code);
      return '';
    }

    function updatePreview() {
      if (!previewOpen.value || !canPreview.value) return;
      nextTick(() => {
        const iframe = previewRef.value; if (!iframe) return;
        const file   = activeFile.value; if (!file) return;
        previewLoad.value = true;
        const doc  = buildPreview(file, flatFiles.value);
        if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
        const blob = new Blob([doc], { type: 'text/html' });
        previewBlobUrl = URL.createObjectURL(blob);
        iframe.onload = () => { previewLoad.value = false; };
        iframe.src = previewBlobUrl;
      });
    }
    function schedulePreview() { clearTimeout(previewTimer); previewTimer = setTimeout(updatePreview, 400); }
    function refreshPreview()  { updatePreview(); }
    function popoutPreview()   {
      const file = activeFile.value; if (!file) return;
      const doc  = buildPreview(file, flatFiles.value);
      const url  = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    // ── Tree helpers ───────────────────────────────────────────
    function findNode(nodes, id)   { if (!nodes) return null; for (const n of nodes) { if (n.id===id) return n; if (n.children) { const f=findNode(n.children,id); if(f) return f; } } return null; }
    function removeNode(nodes, id) { if (!nodes) return false; for (let i=0;i<nodes.length;i++) { if (nodes[i].id===id){nodes.splice(i,1);return true;} if (nodes[i].children&&removeNode(nodes[i].children,id)) return true; } return false; }

    // ── Persistence ────────────────────────────────────────────
    function savePrefs() { try { localStorage.setItem(S_PREFS, JSON.stringify({ fontSize:fontSize.value, lineWrap:lineWrap.value, consoleH:consoleH.value, settings:{...settings.value} })); } catch {} }
    function loadPrefs() { try { const p=JSON.parse(localStorage.getItem(S_PREFS)||'{}'); if(p.fontSize) fontSize.value=p.fontSize; if(p.lineWrap!=null) lineWrap.value=p.lineWrap; if(p.consoleH) consoleH.value=p.consoleH; if(p.settings) Object.assign(settings.value,p.settings); } catch {} }
    function saveFiles() {
      if (editorView  && activeFile.value) activeFile.value.code = editorView.state.doc.toString();
      if (splitView2  && splitFile.value)  splitFile.value.code  = splitView2.state.doc.toString();
      try { localStorage.setItem(S_TREE, JSON.stringify(fileTree.value)); if (activeFileId.value) localStorage.setItem(S_ACTIVE, activeFileId.value); } catch {}
    }

    // ── Init ───────────────────────────────────────────────────
    function initFiles() {
      loadPrefs();
      try {
        const raw = localStorage.getItem(S_TREE);
        if (raw) {
          const p = JSON.parse(raw);
          if (Array.isArray(p) && p.length) {
            fileTree.value = p;
            const saved = localStorage.getItem(S_ACTIVE);
            const all   = flatten(p);
            const found = all.find(f => f.id === saved);
            activeFileId.value = found ? found.id : (all[0]?.id || null);
            return;
          }
        }
      } catch {}
      fileTree.value = [
        { id:uid(), type:'folder', name:'src', open:true, children:[
            { id:uid(), type:'file', name:'main.py',    lang:'python',     code:tmpl('python'),     unsaved:false },
            { id:uid(), type:'file', name:'app.js',     lang:'javascript', code:tmpl('javascript'), unsaved:false },
            { id:uid(), type:'file', name:'index.html', lang:'html',       code:tmpl('html'),       unsaved:false },
            { id:uid(), type:'file', name:'style.css',  lang:'css',        code:tmpl('css')||'/* CSS here */', unsaved:false },
          ]},
        { id:uid(), type:'folder', name:'data', open:false, children:[
            { id:uid(), type:'file', name:'query.sql',  lang:'sql',      code:tmpl('sql'),      unsaved:false },
            { id:uid(), type:'file', name:'README.md',  lang:'markdown', code:tmpl('markdown'), unsaved:false },
          ]},
      ];
      activeFileId.value = flatFiles.value[0]?.id || null;
    }

    function applyTheme() { document.body.dataset.theme = settings.value.theme; savePrefs(); }
    function applyFont()  { const f = availableFonts.find(x => x.id === settings.value.font); if (f) document.documentElement.style.setProperty('--font-mono', f.family); savePrefs(); }

    // ── CodeMirror ─────────────────────────────────────────────
    function getLangExt(l) { const cfg=LANG[l]; if (!cfg?.cm) return python(); try { return cfg.cm(); } catch { return python(); } }

    function buildExts(l, wrap, fs, isSplit = false) {
      const lc = isSplit ? sLangComp : langComp;
      const wc = isSplit ? new Compartment() : wrapComp;
      const fc = isSplit ? sFontComp : fontComp;
      const exts = [
        lineNumbers(), highlightActiveLine(), highlightActiveLineGutter(),
        history(), drawSelection(), indentOnInput(), bracketMatching(), closeBrackets(),
        rectangularSelection(), crosshairCursor(),
        autocompletion({ closeOnBlur:false }), search({ top:false }), foldGutter(), codeFolding(),
        oneDark, syntaxHighlighting(defaultHighlightStyle, { fallback:true }),
        lc.of(getLangExt(l)),
        wc.of(wrap ? EditorView.lineWrapping : []),
        fc.of(EditorView.theme({ '&':{ fontSize:fs+'px' } })),
        keymap.of([...defaultKeymap,...historyKeymap,...searchKeymap,...completionKeymap,...closeBracketsKeymap,...foldKeymap,indentWithTab,{key:'Ctrl-/',run:toggleComment},{key:'Cmd-/',run:toggleComment}]),
        EditorView.theme({ '&':{ backgroundColor:'var(--bg2)',color:'var(--text)',height:'100%' }, '.cm-scroller':{ fontFamily:'var(--font-mono)' } }),
      ];
      if (!isSplit) exts.push(EditorView.updateListener.of(u => {
        if (u.docChanged && !internalUpdate && activeFile.value) {
          activeFile.value.code = u.state.doc.toString();
          activeFile.value.unsaved = true;
          if (canPreview.value && previewOpen.value) schedulePreview();
        }
        const sel = u.state.selection.main, line = u.state.doc.lineAt(sel.head);
        curLine.value = line.number; curCol.value = sel.head - line.from + 1;
      }));
      return exts;
    }

    function initEditor() {
      const el = document.getElementById('cm-editor');
      if (!el || editorView) return;
      const f = activeFile.value; if (!f) return;
      editorView = new EditorView({ state:EditorState.create({ doc:f.code||'', extensions:buildExts(f.lang, lineWrap.value, fontSize.value) }), parent:el });
    }

    function initSplitEditor(fid) {
      nextTick(() => {
        const el = document.getElementById('cm-split');
        if (!el) return;
        if (splitView2) { splitView2.destroy(); splitView2=null; }
        const f = flatFiles.value.find(x=>x.id===fid); if (!f) return;
        splitView2 = new EditorView({ state:EditorState.create({ doc:f.code||'', extensions:buildExts(f.lang, lineWrap.value, fontSize.value, true) }), parent:el });
      });
    }

    function updateDoc(code, lang) {
      if (!editorView) return;
      internalUpdate = true;
      editorView.dispatch({ changes:{from:0,to:editorView.state.doc.length,insert:code||''}, effects:[langComp.reconfigure(getLangExt(lang))] });
      editorView.scrollDOM.scrollTop = 0;
      internalUpdate = false;
    }

    // ── Watchers ───────────────────────────────────────────────
    watch(fontSize, v => { const t=EditorView.theme({'&':{fontSize:v+'px'}}); if(editorView) editorView.dispatch({effects:fontComp.reconfigure(t)}); if(splitView2) splitView2.dispatch({effects:sFontComp.reconfigure(t)}); savePrefs(); });
    watch(lineWrap, v => { if(editorView) editorView.dispatch({effects:wrapComp.reconfigure(v?EditorView.lineWrapping:[])}); savePrefs(); });
    watch(previewOpen, v => { if(v) nextTick(updatePreview); });
    watch(activeFileId, () => { if(previewOpen.value && canPreview.value) nextTick(updatePreview); });

    // ── File ops ───────────────────────────────────────────────
    function switchFile(id) {
      if (!id || id === activeFileId.value) { if(isMobile.value) sidebarOpen.value=false; return; }
      if (editorView && activeFile.value) activeFile.value.code = editorView.state.doc.toString();
      activeFileId.value = id; saveFiles();
      nextTick(() => { const f=flatFiles.value.find(x=>x.id===id); if(f) updateDoc(f.code,f.lang); if(isMobile.value) sidebarOpen.value=false; });
    }
    function openSplit(id)   { if(!id||id===activeFileId.value) return; if(splitView2&&splitFile.value) { splitFile.value.code=splitView2.state.doc.toString(); splitView2.destroy(); splitView2=null; } splitFileId.value=id; splitView.value=true; initSplitEditor(id); }
    function closeSplit()    { if(splitView2){splitView2.destroy();splitView2=null;} splitFileId.value=null; splitView.value=false; }
    function toggleSplit()   { if(splitView.value) closeSplit(); else { const o=flatFiles.value.filter(f=>f.id!==activeFileId.value); if(o.length) openSplit(o[0].id); else splitView.value=true; } }

    function createFile(lang='python') {
      const cfg=LANG[lang]||LANG.python;
      const n=flatFiles.value.filter(f=>f.lang===lang).length+1;
      const nf={id:uid(),type:'file',name:'script'+n+cfg.ext,lang,code:tmpl(lang),unsaved:false};
      fileTree.value.push(nf); switchFile(nf.id); saveFiles(); toast('File created','ok');
    }
    function createFolder() {
      const name=prompt('Folder name:','new-folder'); if(!name?.trim()) return;
      fileTree.value.push({id:uid(),type:'folder',name:name.trim(),open:true,children:[]}); saveFiles();
    }
    function toggleFolder(id) { const n=findNode(fileTree.value,id); if(n){n.open=!n.open;saveFiles();} }
    function startRename(id)  {
      const n=findNode(fileTree.value,id); if(!n) return;
      const nn=prompt('Rename:',n.name); if(!nn?.trim()||nn.trim()===n.name) return;
      n.name=nn.trim();
      if(n.type==='file') { const ext='.'+n.name.split('.').pop(); const m=Object.values(LANG).find(l=>l.ext===ext); if(m) n.lang=m.id; }
      saveFiles(); toast('Renamed','ok');
    }
    function deleteNode(id) {
      const n=findNode(fileTree.value,id); if(!n) return;
      if(!confirm(`Delete "${n.name}"?`)) return;
      const affected=new Set(flatten([n]).map(f=>f.id)); affected.add(id);
      if(affected.has(activeFileId.value)) { const rem=flatFiles.value.filter(f=>!affected.has(f.id)); switchFile(rem[0]?.id||null); }
      if(splitFileId.value&&affected.has(splitFileId.value)) closeSplit();
      removeNode(fileTree.value,id); saveFiles(); toast('Deleted','info');
    }
    function closeTab(id) { deleteNode(id); }

    function onLangChange() {
      const f=activeFile.value; if(!f) return;
      const cfg=LANG[f.lang]; if(!cfg) return;
      f.name=f.name.replace(/\.[^.]+$/,'')+cfg.ext;
      if(editorView) editorView.dispatch({effects:langComp.reconfigure(getLangExt(f.lang))});
      f.unsaved=true; saveFiles();
      if(previewOpen.value&&canPreview.value) nextTick(updatePreview);
    }

    function downloadFile() {
      saveFiles();
      const all = flatFiles.value;
      // Smart download: if only 1 file → direct, else → always zip
      if (all.length <= 1) {
        const f = activeFile.value; if (!f) return;
        if (editorView) f.code = editorView.state.doc.toString();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([f.code||''], { type: 'text/plain' }));
        a.download = f.name; a.click(); URL.revokeObjectURL(a.href);
        toast('Downloaded: ' + f.name, 'ok');
      } else {
        downloadZip();
      }
    }

    function downloadSingleActive() {
      const f = activeFile.value; if (!f) return;
      if (editorView) f.code = editorView.state.doc.toString();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([f.code||''], { type: 'text/plain' }));
      a.download = f.name; a.click(); URL.revokeObjectURL(a.href);
      toast('Downloaded: ' + f.name, 'ok');
    }

    function downloadAll() { downloadZip(); }

    function toggleWrap()  { lineWrap.value = !lineWrap.value; }
    function toggleFocus() { focusMode.value=!focusMode.value; if(focusMode.value){sidebarOpen.value=false;aiPanelOpen.value=false;} }

    async function downloadZip() {
      if (typeof JSZip === 'undefined') { toast('JSZip not loaded — check internet','error'); return; }
      saveFiles();
      const zip = new JSZip();
      const proj = settings.value.projectName || 'project';
      const folder = zip.folder(proj);
      flatFiles.value.forEach(f => folder.file(f.name, f.code || ''));
      // Add a README if there isn't one
      const hasReadme = flatFiles.value.some(f => f.name.toLowerCase().startsWith('readme'));
      if (!hasReadme) {
        folder.file('README.md', `# ${proj}\n\nCreated with ALONE CODE STUDIO v12\n\n## Files\n${flatFiles.value.map(f=>'- '+f.name).join('\n')}\n`);
      }
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = proj + '.zip';
      a.click(); URL.revokeObjectURL(a.href);
      toast(`📦 ${flatFiles.value.length} files zipped as ${proj}.zip`, 'ok');
    }

    // ── Code Security Scanner ──────────────────────────────────
    function scanCode() {
      const f = activeFile.value; if (!f) { toast('No file to scan', 'err'); return; }
      if (editorView) f.code = editorView.state.doc.toString();
      const code = f.code || '';
      const lang = f.lang;
      const findings = [];

      const rules = [
        // Universal — dangerous patterns
        { re: /eval\s*\(/g,                    sev:'HIGH',   msg:'eval() can execute arbitrary code — avoid it' },
        { re: /innerHTML\s*=/g,                sev:'HIGH',   msg:'innerHTML assignment can cause XSS — use textContent or sanitize input' },
        { re: /document\.write\s*\(/g,         sev:'HIGH',   msg:'document.write() is deprecated and XSS-prone' },
        { re: /exec\s*\(/g,                    sev:'MED',    msg:'exec() can run shell commands — validate all inputs' },
        { re: /password\s*=\s*["'][^"']+["']/gi, sev:'CRIT', msg:'Hardcoded password detected — use environment variables' },
        { re: /api_?key\s*=\s*["'][^"']+["']/gi, sev:'CRIT', msg:'Hardcoded API key detected — use environment variables' },
        { re: /secret\s*=\s*["'][^"']+["']/gi, sev:'CRIT',  msg:'Hardcoded secret detected — use environment variables' },
        { re: /TODO|FIXME|HACK|XXX/g,          sev:'INFO',   msg:'Code annotation found — review before shipping' },
        { re: /console\.log\s*\(/g,            sev:'INFO',   msg:'console.log() left in code — remove before production' },
        // Python
        { re: /pickle\.loads?\s*\(/g,          sev:'HIGH',   msg:'pickle.load() with untrusted data can execute code' },
        { re: /subprocess\.(call|run|Popen)/g, sev:'MED',    msg:'subprocess calls — sanitize all inputs to prevent injection' },
        { re: /os\.system\s*\(/g,              sev:'HIGH',   msg:'os.system() is vulnerable to shell injection' },
        { re: /input\s*\(/g,                   sev:'LOW',    msg:'input() in Python — validate user input' },
        // JS/TS
        { re: /dangerouslySetInnerHTML/g,      sev:'HIGH',   msg:'dangerouslySetInnerHTML can cause XSS — sanitize content' },
        { re: /localStorage\s*\.\s*setItem\s*\([^,]+,\s*(?!JSON)/g, sev:'LOW', msg:'Storing non-JSON in localStorage — consider data type' },
        // SQL injection patterns
        { re: /["'`]\s*\+\s*\w+\s*\+\s*["'`]/g, sev:'HIGH', msg:'String concatenation in query — use parameterized queries to prevent SQL injection' },
        // Crypto
        { re: /md5|sha1(?![0-9])/gi,           sev:'MED',    msg:'Weak hash algorithm (MD5/SHA1) — use SHA-256 or bcrypt for passwords' },
        // HTTP
        { re: /http:\/\/(?!localhost|127)/g,   sev:'MED',    msg:'Non-HTTPS URL — use HTTPS in production' },
      ];

      const sevOrder = { CRIT:0, HIGH:1, MED:2, LOW:3, INFO:4 };
      const sevColor = { CRIT:'🔴', HIGH:'🟠', MED:'🟡', LOW:'🔵', INFO:'⚪' };
      const lines = code.split('\n');

      for (const rule of rules) {
        const re = new RegExp(rule.re.source, rule.re.flags.includes('g') ? rule.re.flags : rule.re.flags + 'g');
        let m;
        while ((m = re.exec(code)) !== null) {
          const lineNum = code.slice(0, m.index).split('\n').length;
          const lineSnip = lines[lineNum - 1]?.trim().slice(0, 60) || '';
          findings.push({ sev: rule.sev, msg: rule.msg, line: lineNum, snip: lineSnip });
        }
      }

      findings.sort((a, b) => (sevOrder[a.sev] || 9) - (sevOrder[b.sev] || 9));

      outputLines.value = [];
      if (!previewOpen.value) previewOpen.value = true;
      addOut(`🔍 Security Scan: ${f.name}`, 'cmd');
      addOut(`─── ${findings.length} finding(s) ───────────────────`, 'info');
      if (!findings.length) {
        addOut('✅ No issues detected. Code looks clean!', 'success');
      } else {
        findings.forEach(x => {
          addOut(`${sevColor[x.sev]} [${x.sev}] Line ${x.line}: ${x.msg}`, x.sev === 'CRIT' || x.sev === 'HIGH' ? 'error' : 'info');
          if (x.snip) addOut(`   → ${x.snip}`, 'text-line');
        });
        const crits = findings.filter(x => x.sev === 'CRIT').length;
        const highs = findings.filter(x => x.sev === 'HIGH').length;
        addOut(`─── Summary: ${crits} critical · ${highs} high · ${findings.length - crits - highs} other`, crits + highs > 0 ? 'error' : 'info');
      }
      toast(`Scan complete: ${findings.length} finding(s)`, findings.length ? 'err' : 'ok');
    }

    // ── Find & Replace (VS Code-style) ───────────────────────
    const findMatchCase  = ref(false);
    const findRegex      = ref(false);
    const findWholeWord  = ref(false);
    const findResults    = ref([]);
    const findCurrent    = ref(-1);

    function buildFindRx(q) {
      if (!q) return null;
      try {
        if (findRegex.value) return new RegExp(q, findMatchCase.value ? 'g' : 'gi');
        let p = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (findWholeWord.value) p = '\\b' + p + '\\b';
        return new RegExp(p, findMatchCase.value ? 'g' : 'gi');
      } catch { return null; }
    }

    function doFind() {
      if (!editorView || !findQuery.value) { findResults.value=[]; return; }
      const doc = editorView.state.doc.toString();
      const rx  = buildFindRx(findQuery.value); if (!rx) return;
      const results = [];
      let m;
      while ((m = rx.exec(doc)) !== null) {
        results.push({ from: m.index, to: m.index + m[0].length });
        if (results.length > 2000) break;
      }
      findResults.value = results;
      if (results.length) {
        const cur = editorView.state.selection.main.to;
        const ni  = results.findIndex(r => r.from >= cur);
        findCurrent.value = ni >= 0 ? ni : 0;
        const r   = results[findCurrent.value];
        editorView.dispatch({ selection:{anchor:r.from,head:r.to}, scrollIntoView:true });
        editorView.focus();
      } else { findCurrent.value = -1; toast('No matches','info'); }
    }

    function findNext() {
      if (!findResults.value.length) { doFind(); return; }
      findCurrent.value = (findCurrent.value + 1) % findResults.value.length;
      const r = findResults.value[findCurrent.value];
      editorView.dispatch({ selection:{anchor:r.from,head:r.to}, scrollIntoView:true });
    }
    function findPrev() {
      if (!findResults.value.length) { doFind(); return; }
      findCurrent.value = (findCurrent.value - 1 + findResults.value.length) % findResults.value.length;
      const r = findResults.value[findCurrent.value];
      editorView.dispatch({ selection:{anchor:r.from,head:r.to}, scrollIntoView:true });
    }

    function doReplace() {
      if (!editorView || !findQuery.value) return;
      const doc = editorView.state.doc.toString();
      const rx  = buildFindRx(findQuery.value); if (!rx) return;
      rx.lastIndex = editorView.state.selection.main.from;
      const m = rx.exec(doc);
      if (!m) { doFind(); return; }
      editorView.dispatch({ changes:{from:m.index,to:m.index+m[0].length,insert:replaceQuery.value}, selection:{anchor:m.index+replaceQuery.value.length} });
      doFind();
    }

    function doReplaceAll() {
      if (!editorView || !findQuery.value) return;
      const doc = editorView.state.doc.toString();
      const rx  = buildFindRx(findQuery.value); if (!rx) return;
      let count = 0;
      const result = doc.replace(rx, () => { count++; return replaceQuery.value; });
      editorView.dispatch({ changes:{from:0,to:editorView.state.doc.length,insert:result} });
      toast('Replaced ' + count + ' occurrence(s)','ok');
      findResults.value=[]; findCurrent.value=-1;
    }

    // ── Go To Line (Ctrl+G) ───────────────────────────────────
    function doGotoLine() {
      const n = parseInt(gotoLineNum.value);
      if (!editorView || isNaN(n)) return;
      const line = editorView.state.doc.line(
        Math.max(1, Math.min(n, editorView.state.doc.lines))
      );
      editorView.dispatch({ selection:{anchor:line.from}, scrollIntoView:true });
      editorView.focus();
      gotoLineOpen.value = false;
    }

    // ── Rename Symbol (F2) ────────────────────────────────────
    const renameOpen    = ref(false);    const renameQuery   = ref('');
    const renameReplace = ref('');
    const renameCount   = ref(0);

    function openRename() {
      if (!editorView) return;
      const sel = editorView.state.selection.main;
      if (sel.empty) { toast('Select a symbol to rename','info'); return; }
      renameQuery.value   = editorView.state.doc.sliceString(sel.from, sel.to);
      renameReplace.value = renameQuery.value;
      const doc = editorView.state.doc.toString();
      const rx  = new RegExp('\\b' + renameQuery.value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b', 'g');
      renameCount.value = (doc.match(rx)||[]).length;
      renameOpen.value = true;
    }

    function doRename() {
      if (!editorView || !renameQuery.value) return;
      const doc = editorView.state.doc.toString();
      const rx  = new RegExp('\\b' + renameQuery.value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b', 'g');
      const result = doc.replace(rx, renameReplace.value);
      editorView.dispatch({ changes:{from:0,to:editorView.state.doc.length,insert:result} });
      renameOpen.value = false;
      toast('Renamed ' + renameCount.value + ' occurrence(s)','ok');
    }

    // ═══════════════════════════════════════════════════════════
    // IMPORT PANEL
    // ═══════════════════════════════════════════════════════════
    function openImport()  { importOpen.value=true; importFiles.value=[]; importPaste.value=''; importURL.value=''; }
    function closeImport() { importOpen.value=false; }

    // File size helper
    function fmtSize(bytes) {
      if (bytes < 1024) return bytes + 'B';
      if (bytes < 1024*1024) return (bytes/1024).toFixed(1)+'KB';
      return (bytes/1024/1024).toFixed(1)+'MB';
    }

    // Handle file drop or input
    async function handleDropFiles(files) {
      const arr = Array.from(files);
      let added = 0;
      for (const file of arr) {
        if (file.size > 10 * 1024 * 1024) { toast(file.name + ' too large (>10MB)', 'err'); continue; }
        try {
          let text;
          try {
            text = await file.text();
          } catch {
            toast(file.name + ': cannot read binary file', 'err'); continue;
          }
          const lang = detectLang(file.name);
          importFiles.value.push({ name: file.name, lang, code: text, size: file.size, id: uid() });
          added++;
        } catch (e) {
          toast('Error reading ' + file.name + ': ' + e.message, 'err');
        }
      }
      if (added > 0) toast(`${added} file(s) ready to import`, 'ok');
    }

    function onDropZone(e) {
      e.preventDefault(); isDragOver.value = false;
      handleDropFiles(e.dataTransfer?.files || []);
    }
    function onDragOver(e) { e.preventDefault(); isDragOver.value = true; }
    function onDragLeave()  { isDragOver.value = false; }

    function triggerFileInput() {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.multiple = true;
      inp.accept = '.py,.js,.ts,.html,.css,.cpp,.c,.java,.rs,.go,.php,.rb,.swift,.kt,.cs,.lua,.sh,.sql,.md,.json,.xml,.txt,.yaml,.yml';
      inp.onchange = () => handleDropFiles(inp.files);
      inp.click();
    }

    function removeImportFile(id) { importFiles.value = importFiles.value.filter(f => f.id !== id); }

    async function fetchURL() {
      if (!importURL.value.trim()) return;
      if (!isOnline.value) { toast('Internet required to fetch URL', 'err'); return; }
      try {
        toast('Fetching…', 'info');
        const res  = await fetch(importURL.value.trim());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const text = await res.text();
        const parts = importURL.value.split('/');
        const name  = parts[parts.length - 1] || 'imported.txt';
        const lang  = detectLang(name);
        importFiles.value.push({ name, lang, code: text, size: text.length, id: uid() });
        importURL.value = '';
        toast('Fetched: ' + name, 'ok');
      } catch (e) { toast('Fetch failed: ' + e.message, 'err'); }
    }

    function addPasteAsFile() {
      if (!importPaste.value.trim()) return;
      const cfg  = LANG[importPasteLang.value] || LANG.javascript;
      const name = 'paste_' + Date.now() + cfg.ext;
      importFiles.value.push({ name, lang: importPasteLang.value, code: importPaste.value, size: importPaste.value.length, id: uid() });
      importPaste.value = '';
      toast('Pasted as ' + name, 'ok');
    }

    function confirmImport() {
      if (!importFiles.value.length) { closeImport(); return; }
      for (const f of importFiles.value) {
        const nf = { id: uid(), type: 'file', name: f.name, lang: f.lang, code: f.code, unsaved: false };
        fileTree.value.push(nf);
        activeFileId.value = nf.id;
      }
      saveFiles();
      nextTick(() => {
        const f = flatFiles.value.find(x => x.id === activeFileId.value);
        if (f && editorView) updateDoc(f.code, f.lang);
      });
      toast(importFiles.value.length + ' file(s) imported!', 'ok');
      closeImport();
    }

    // ── Terminal ───────────────────────────────────────────────
    function execTerm() {
      const cmd=termInput.value.trim(); if(!cmd) return;
      termHist.value.unshift(cmd); termHistIdx.value=-1; termInput.value='';
      addOut(cmd,'cmd');
      const [base,...parts]=cmd.split(/\s+/); const b=base.toLowerCase();
      if (b==='run')          runCode();
      else if (b==='clear'||b==='cls')  outputLines.value=[];
      else if (b==='ls'||b==='dir')     addOut(flatFiles.value.map(f=>f.name).join('  ')||'(empty)','text-line');
      else if (b==='echo')              addOut(parts.join(' '),'text-line');
      else if (b==='pwd')               addOut('/workspace/'+settings.value.projectName,'text-line');
      else if (b==='version')           addOut('ALONE CODE STUDIO v11 | Offline | Vue3+CM6','text-line');
      else if (b==='date')              addOut(new Date().toString(),'text-line');
      else if (b==='status')            addOut(`Online: ${isOnline.value} | Files: ${flatFiles.value.length} | Lang: ${curLang.value}`,'info');
      else if (b==='import')            { openImport(); addOut('Import panel opened','info'); }
      else if (b==='download')          { downloadFile(); }
      else if (b==='find')              { findQuery.value=parts.join(' '); findOpen.value=true; nextTick(doFind); addOut('Find: '+parts.join(' '),'info'); }
      else if (b==='rename')            { openRename(); addOut('Select a symbol first, then use F2','info'); }
      else if (b==='new')               { createFile(parts[0]||'python'); addOut('New '+( parts[0]||'python')+' file created','ok'); }
      else if (b==='font')              { fontSize.value=Math.max(10,Math.min(24,parseInt(parts[0])||14)); savePrefs(); addOut('Font size: '+fontSize.value+'px','info'); }
      else if (b==='wrap')              { toggleWrap(); addOut('Line wrap: '+lineWrap.value,'info'); }
      else if (b==='theme')             { settings.value.theme=parts[0]||'default'; applyTheme(); addOut('Theme: '+settings.value.theme,'info'); }
      else if (b==='ai') { if(!isOnline.value){addOut('AI requires internet','error');}else{const q=parts.join(' ');if(q){aiPrompt.value=q;aiPanelOpen.value=true;sendAI();addOut('Asking AI: '+q,'info');}else{aiPanelOpen.value=true;addOut('AI panel opened','info');}} }
      else if (b==='dup'||b==='duplicate') { if(activeFile.value){duplicateFile(activeFileId.value);addOut('File duplicated','ok');}else{addOut('No active file','error');} }
      else if (b==='fmt'||b==='format')    { formatCode(); }
      else if (b==='snippets')             { snippetsOpen.value=true; addOut('Snippets panel opened','info'); }
      else if (b==='wc'||b==='wordcount')  { addOut(`Words: ${wordCount.value} | Lines: ${editorView?.state.doc.lines||0}`,'info'); }
      else if (b==='zip'||b==='pack')      { downloadZip(); }
      else if (b==='scan'||b==='security') { scanCode(); addOut('Running security scan…','info'); }
      else if (b==='single'||b==='save')   { downloadSingleActive(); }
      else if (b==='help')              addOut('Commands: run clear ls echo pwd version date status import download single scan zip find rename new font wrap theme ai dup fmt snippets wc help','info');
      else addOut(`bash: ${b}: command not found`,'error');
      nextTick(()=>termInputRef.value?.focus());
    }
    function termUp()   { if(termHistIdx.value<termHist.value.length-1){termHistIdx.value++;termInput.value=termHist.value[termHistIdx.value];} }
    function termDown() { if(termHistIdx.value>0){termHistIdx.value--;termInput.value=termHist.value[termHistIdx.value];}else{termHistIdx.value=-1;termInput.value='';} }

    // ── Run Code ───────────────────────────────────────────────
    async function runCode() {
      if (isRunning.value) return;
      if (editorView && activeFile.value) activeFile.value.code = editorView.state.doc.toString();
      saveFiles();
      const file = activeFile.value; if (!file) return;
      const code = (file.code || '').trim();
      if (!code) { addOut('No code to run.', 'info'); return; }
      const lang = file.lang;

      // Preview langs
      if (canPreview.value) {
        outputLines.value = [];
        addOut(`Rendering ${file.name}…`, 'cmd');
        if (!previewOpen.value) previewOpen.value = true;
        nextTick(updatePreview);
        addOut(`✓ Rendered offline`, 'success');
        lastStats.value = { time:0, exit:0, lines:1 };
        return;
      }

      isRunning.value = true; runStatus.value = 'Running…';
      outputLines.value = [];
      if (!previewOpen.value) previewOpen.value = true;
      const cfg = LANG[lang] || LANG.python;
      const ts  = new Date().toLocaleTimeString();
      const t0  = performance.now();

      // Helper: safe Piston call with full error handling + URL fallback
      async function tryPiston() {
        let lastErr;
        for (const url of PISTON_URLS) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ language: cfg.piston, version: cfg.ver, files: [{ name: file.name, content: code }], stdin: '' }),
              signal: controller.signal,
            });
            clearTimeout(timeout);
            if (!res.ok) {
              const errText = await res.text().catch(() => '');
              throw new Error(`HTTP ${res.status}${errText && !errText.includes('<html') ? ': ' + errText.slice(0, 80) : ''}`);
            }
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) {
              const raw = await res.text().catch(() => '');
              throw new Error(`Unexpected response type: ${ct || 'unknown'}${raw.includes('<html') ? ' (HTML error page)' : ''}`);
            }
            const data = await res.json();
            if (!data || (!data.run && !data.compile)) throw new Error('Invalid API response structure');
            return data;
          } catch (e) {
            clearTimeout(timeout);
            lastErr = e;
            // Continue to next URL on network/HTTP errors
          }
        }
        throw lastErr || new Error('All cloud endpoints failed');
      }

      // Online → Piston
      if (isOnline.value) {
        apiStatus.value = 'loading';
        addOut(`[${ts}] ${file.name} · ${cfg.label} · cloud`, 'cmd');
        runStatus.value = 'Connecting…';
        let cloudOk = false;
        try {
          const data = await tryPiston();
          cloudOk = true;
          const dt = Math.round(performance.now() - t0);
          apiStatus.value = 'ok';
          runStatus.value = 'Processing…';
          if (data.compile?.output) { addOut('── compile ──','info'); data.compile.output.split('\n').forEach(l=>l&&addOut(l,'error')); }
          const run = data.run; let nl = 0;
          if (run?.stdout) { run.stdout.split('\n').forEach(l=>{ addOut(l,'text-line'); nl++; }); }
          if (run?.stderr) { addOut('── stderr ──','error'); run.stderr.split('\n').forEach(l=>l&&addOut(l,'error')); }
          const ex = run?.code ?? 0;
          addOut(`exit ${ex} · ${dt}ms · cloud`, ex===0&&!run?.stderr?'success':'error');
          lastStats.value = { time:dt, exit:ex, lines:nl };
        } catch (e) {
          if (!cloudOk) {
            apiStatus.value = 'error';
            const reason = e.name === 'AbortError' ? 'Request timed out (10s)' : e.message;
            addOut('Cloud failed: ' + reason, 'error');
            addOut('Falling back to offline simulator…', 'info');
            try {
              const { output, errors } = runOffline(lang, code);
              const dt = Math.round(performance.now() - t0);
              output.forEach(o => addOut(o.text, o.type));
              errors.forEach(err => addOut(err.text, err.type));
              addOut(`offline sim done · ${dt}ms`, errors.length?'error':'success');
              lastStats.value = { time:dt, exit:errors.length?1:0, lines:output.length };
            } catch (offErr) {
              addOut('Offline sim error: ' + offErr.message, 'error');
              lastStats.value = { time:Math.round(performance.now()-t0), exit:1, lines:0 };
            }
          }
        }
      } else {
        // Offline
        addOut(`[${ts}] ${file.name} · ${cfg.label} · offline sim`, 'cmd');
        runStatus.value = 'Simulating…';
        await new Promise(r => setTimeout(r, 20));
        try {
          const { output, errors } = runOffline(lang, code);
          const dt = Math.round(performance.now() - t0);
          output.forEach(o => addOut(o.text, o.type));
          errors.forEach(err => addOut(err.text, err.type));
          addOut(`done · ${dt}ms · offline`, errors.length?'error':'success');
          lastStats.value = { time:dt, exit:errors.length?1:0, lines:output.length };
        } catch (simErr) {
          addOut('Sim error: ' + simErr.message, 'error');
          lastStats.value = { time:Math.round(performance.now()-t0), exit:1, lines:0 };
        }
      }

      nextTick(()=>{ if(execRef.value) execRef.value.scrollTop=execRef.value.scrollHeight; });
      isRunning.value = false; runStatus.value = 'Ready';
    }

    function addOut(text, type='text-line') {
      outputLines.value.push({ text:String(text), type });
      nextTick(() => { if(consoleRef.value) consoleRef.value.scrollTop=consoleRef.value.scrollHeight; if(execRef.value) execRef.value.scrollTop=execRef.value.scrollHeight; });
    }
    function clearOutput() { outputLines.value=[]; lastStats.value={time:null,exit:null,lines:0}; }
    function copyOutput()  { navigator.clipboard.writeText(outputLines.value.map(l=>l.text).join('\n')).then(()=>toast('Copied!','ok')).catch(()=>{}); }
    function hlOut(text)   {
      return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/(\d+\.?\d*)/g,'<span class="hl-num">$1</span>')
        .replace(/"([^"]+)"/g,'"<span class="hl-str">$1</span>"')
        .replace(/\b(True|False|None|null|undefined|true|false)\b/g,'<span class="hl-kw">$1</span>');
    }

    // ── AI ─────────────────────────────────────────────────────
    let aiAbortCtrl = null;
    const aiStreamText = ref('');

    async function sendAI() {
      const p = aiPrompt.value.trim(); if(!p||aiLoading.value) return;
      if(!isOnline.value) { toast('Internet required for AI','err'); return; }
      if(editorView&&activeFile.value) activeFile.value.code=editorView.state.doc.toString();
      let ctx='';
      if(aiCtx.value&&flatFiles.value.length) {
        ctx='\n\n---\n**FILES:**\n\n'+flatFiles.value.map(f=>`**${f.name}** (${f.lang}):\n\`\`\`${f.lang}\n${(f.code||'').slice(0,3000)}\n\`\`\``).join('\n\n');
      }
      aiMessages.value.push({role:'user',content:p}); aiPrompt.value=''; aiLoading.value=true; aiStreamText.value='';
      // Push placeholder for streaming
      aiMessages.value.push({role:'assistant',content:'',streaming:true});
      const idx = aiMessages.value.length-1;
      nextTick(()=>{if(aiChatRef.value)aiChatRef.value.scrollTop=aiChatRef.value.scrollHeight;});
      aiAbortCtrl = new AbortController();
      try {
        const msgs = aiMessages.value.slice(0,-1).map((m,i,arr)=>i===arr.length-1&&m.role==='user'?{role:'user',content:m.content+ctx}:{role:m.role,content:m.content});
        const headers={'Content-Type':'application/json','anthropic-version':'2023-06-01'}; 
        if(settings.value.apiKey) headers['x-api-key']=settings.value.apiKey;
        const res=await fetch(ANTHROPIC_URL,{method:'POST',signal:aiAbortCtrl.signal,headers,body:JSON.stringify({
          model:'claude-sonnet-4-5',max_tokens:4000,stream:true,
          system:`You are an expert coding assistant built into ALONE CODE STUDIO v11. All 20 languages run offline. Be concise and precise. Use markdown code blocks with language tags. When you provide code, the user can apply it directly to the editor. Active file: ${activeFile.value?.name||'none'}. All files: ${flatFiles.value.map(f=>f.name).join(', ')}.`,
          messages:msgs
        })});
        if(!res.ok){const e=await res.json().catch(()=>({error:{message:'HTTP '+res.status}}));throw new Error(e.error?.message||'API error');}
        const reader=res.body.getReader(); const dec=new TextDecoder(); let buf='',full='';
        while(true){
          const{done,value}=await reader.read(); if(done) break;
          buf+=dec.decode(value,{stream:true});
          const lines=buf.split('\n'); buf=lines.pop()||'';
          for(const line of lines){
            if(!line.startsWith('data:')) continue;
            const d=line.slice(5).trim(); if(d==='[DONE]') break;
            try{const j=JSON.parse(d);if(j.type==='content_block_delta'&&j.delta?.text){full+=j.delta.text;aiMessages.value[idx]={role:'assistant',content:full,streaming:true};nextTick(()=>{if(aiChatRef.value)aiChatRef.value.scrollTop=aiChatRef.value.scrollHeight;});}}catch{}
          }
        }
        aiMessages.value[idx]={role:'assistant',content:full||'(no response)',streaming:false};
      } catch(e) {
        if(e.name==='AbortError'){aiMessages.value[idx]={role:'assistant',content:aiMessages.value[idx]?.content||'(cancelled)',streaming:false};}
        else{aiMessages.value[idx]={role:'assistant',content:'⚠️ '+e.message+'\n\nCheck your API key in Settings.',streaming:false};}
      }
      finally { aiLoading.value=false; aiAbortCtrl=null; nextTick(()=>{if(aiChatRef.value)aiChatRef.value.scrollTop=aiChatRef.value.scrollHeight;}); }
    }

    function stopAI() {
      if(aiAbortCtrl){ aiAbortCtrl.abort(); aiAbortCtrl=null; aiLoading.value=false; toast('AI stopped','info'); }
    }

    function clearAI() { aiMessages.value=[]; aiStreamText.value=''; }

    function applyCodeToEditor(code) {
      if(!editorView||!activeFile.value) { toast('No active file','err'); return; }
      editorView.dispatch({ changes:{from:0,to:editorView.state.doc.length,insert:code} });
      activeFile.value.code=code; activeFile.value.unsaved=true;
      toast('Code applied to editor ✓','ok');
    }

    function fmtAI(c) {
      const esc = String(c).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return esc
        .replace(/```(\w*)\n?([\s\S]*?)```/g,(_,l,code)=>{
          const lang=l||''; const escaped=code.trim();
          return `<div class="ai-code-block"><div class="ai-code-head"><span class="ai-code-lang">${lang||'code'}</span><div class="ai-code-actions"><button class="ai-code-btn" onclick="(()=>{const el=document.createElement('textarea');el.value=${JSON.stringify(escaped)};document.body.appendChild(el);el.select();document.execCommand('copy');el.remove();window.__acsToast?.('Copied!','ok')})()">Copy</button><button class="ai-code-btn ai-code-apply" onclick="window.__acsApply?.(${JSON.stringify(escaped)})">Apply</button></div></div><pre><code class="lang-${lang}">${escaped}</code></pre></div>`;
        })
        .replace(/`([^`\n]+)`/g,'<code class="ai-inline-code">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
        .replace(/\*([^*\n]+)\*/g,'<em>$1</em>')
        .replace(/^#{3}\s+(.+)$/gm,'<h4>$1</h4>')
        .replace(/^#{2}\s+(.+)$/gm,'<h3>$1</h3>')
        .replace(/^#{1}\s+(.+)$/gm,'<h2>$1</h2>')
        .replace(/^[-*]\s+(.+)$/gm,'<li>$1</li>')
        .replace(/(<li>[\s\S]*?<\/li>)/g,'<ul>$1</ul>')
        .replace(/\n/g,'<br>');
    }

    // Expose apply/toast globally for AI code block buttons
    window.__acsApply = applyCodeToEditor;
    window.__acsToast = toast;

    // ── Word Count / Selection Stats ──────────────────────────
    const wordCount = computed(() => {
      const code = activeFile.value?.code || '';
      return code.trim().split(/\s+/).filter(Boolean).length;
    });
    const selCount = ref(0);

    // ── Code Formatter (offline Prettier-style) ──────────────
    const isFormatting = ref(false);

    function formatCode() {
      if (!editorView || !activeFile.value) return;
      isFormatting.value = true;
      const code = editorView.state.doc.toString();
      const lang = activeFile.value.lang;
      let formatted = code;
      try {
        if (lang === 'json' || lang === 'javascript') {
          // Try JSON first
          try { formatted = JSON.stringify(JSON.parse(code), null, 2); }
          catch { formatted = formatJS(code); }
        } else if (lang === 'html') {
          formatted = formatHTML(code);
        } else if (lang === 'css') {
          formatted = formatCSS(code);
        } else {
          formatted = formatGeneric(code);
        }
      } catch (e) { toast('Format error: ' + e.message, 'err'); isFormatting.value = false; return; }
      if (formatted !== code) {
        editorView.dispatch({ changes: { from: 0, to: editorView.state.doc.length, insert: formatted } });
        activeFile.value.code = formatted;
        activeFile.value.unsaved = true;
        toast('Formatted ✓', 'ok');
      } else { toast('Already formatted', 'info'); }
      isFormatting.value = false;
    }

    function formatGeneric(code) {
      const lines = code.split('\n');
      let indent = 0, result = [];
      for (let line of lines) {
        const t = line.trim();
        if (!t) { result.push(''); continue; }
        const closes = (t.match(/^[}\])]/) || []).length;
        if (closes) indent = Math.max(0, indent - 1);
        result.push('  '.repeat(indent) + t);
        const opens = (t.match(/[{[(](?!\s*[}\])])/) || []).length;
        const closesSameLine = (t.match(/[}\])](?!.*[{[(])/) || []).length;
        indent = Math.max(0, indent + opens - (closes ? 0 : closesSameLine));
      }
      return result.join('\n');
    }

    function formatJS(code) {
      // Basic JS formatting: normalize spacing around operators & brackets
      return code
        .replace(/\{(\S)/g, '{ $1').replace(/(\S)\}/g, '$1 }')
        .replace(/,(\S)/g, ', $1')
        .replace(/\bfunction\b\s*\(/g, 'function(')
        .replace(/\s{2,}/g, ' ')
        .replace(/;\s*\n?\s*/g, ';\n')
        .split('\n').map(l => l.trimEnd()).join('\n')
        .replace(/\n{3,}/g, '\n\n');
    }

    function formatHTML(code) {
      return code
        .replace(/>\s+</g, '>\n<')
        .replace(/<(\w[^>]*)>\s*([^<\n]+)\s*<\/(\w+)>/g, (_, open, content, close) => `<${open}>${content.trim()}</${close}>`)
        .split('\n').map(l => l.trim()).filter(Boolean).join('\n')
        .replace(/\n{3,}/g, '\n\n');
    }

    function formatCSS(code) {
      return code
        .replace(/\{/g, ' {\n  ').replace(/;/g, ';\n  ').replace(/\}/g, '\n}\n')
        .replace(/\s{2,}/g, ' ')
        .split('\n').map(l => l.trimEnd()).join('\n')
        .replace(/\n{3,}/g, '\n\n').trim();
    }

    // ── Code Snippets Library ─────────────────────────────────
    const snippetsOpen = ref(false);
    const snippetFilter = ref('');
    const SNIPPETS = [
      // Python
      { lang:'python', label:'for loop',     trigger:'for',   code:'for i in range(10):\n    print(i)' },
      { lang:'python', label:'function',     trigger:'def',   code:'def function_name(param):\n    """Docstring."""\n    return param' },
      { lang:'python', label:'class',        trigger:'class', code:'class MyClass:\n    def __init__(self):\n        pass\n\n    def method(self):\n        pass' },
      { lang:'python', label:'list comp',    trigger:'lc',    code:'result = [x for x in iterable if condition]' },
      { lang:'python', label:'try/except',   trigger:'try',   code:'try:\n    pass\nexcept Exception as e:\n    print(f"Error: {e}")' },
      { lang:'python', label:'with open',    trigger:'file',  code:'with open("filename.txt", "r") as f:\n    content = f.read()' },
      // JavaScript
      { lang:'javascript', label:'arrow fn', trigger:'=>',    code:'const name = (param) => {\n  return param;\n};' },
      { lang:'javascript', label:'async fn', trigger:'async', code:'async function fetchData(url) {\n  const res = await fetch(url);\n  return await res.json();\n}' },
      { lang:'javascript', label:'class',    trigger:'class', code:'class MyClass {\n  constructor() {}\n  method() {}\n}' },
      { lang:'javascript', label:'forEach',  trigger:'each',  code:'array.forEach((item, index) => {\n  console.log(index, item);\n});' },
      { lang:'javascript', label:'Promise',  trigger:'prom',  code:'const p = new Promise((resolve, reject) => {\n  resolve("value");\n});' },
      { lang:'javascript', label:'try/catch',trigger:'try',   code:'try {\n  // code\n} catch (error) {\n  console.error(error);\n}' },
      // HTML
      { lang:'html', label:'boilerplate',   trigger:'doc',   code:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8"/>\n  <meta name="viewport" content="width=device-width,initial-scale=1"/>\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>' },
      { lang:'html', label:'flex center',   trigger:'flex',  code:'<div style="display:flex;align-items:center;justify-content:center;">\n  content\n</div>' },
      // CSS
      { lang:'css', label:'flex center',    trigger:'flex',  code:'.container {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}' },
      { lang:'css', label:'grid layout',    trigger:'grid',  code:'.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 16px;\n}' },
      { lang:'css', label:'media query',    trigger:'mq',    code:'@media (max-width: 768px) {\n  .container {\n    flex-direction: column;\n  }\n}' },
      // SQL
      { lang:'sql', label:'SELECT',         trigger:'sel',   code:'SELECT column1, column2\nFROM table_name\nWHERE condition\nORDER BY column1 ASC\nLIMIT 10;' },
      { lang:'sql', label:'JOIN',           trigger:'join',  code:'SELECT a.*, b.name\nFROM table_a a\nINNER JOIN table_b b ON a.id = b.a_id\nWHERE a.active = 1;' },
      { lang:'sql', label:'CREATE TABLE',   trigger:'create',code:'CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);' },
      // Generic
      { lang:'any', label:'TODO comment',   trigger:'todo',  code:'// TODO: ' },
      { lang:'any', label:'FIXME comment',  trigger:'fixme', code:'// FIXME: ' },
    ];

    const snippetList = computed(() => {
      const lang = curLang.value;
      const q = snippetFilter.value.toLowerCase();
      return SNIPPETS.filter(s => (s.lang === lang || s.lang === 'any') && (!q || s.label.toLowerCase().includes(q) || s.trigger.toLowerCase().includes(q)));
    });

    function insertSnippet(snippet) {
      if (!editorView) return;
      const sel = editorView.state.selection.main;
      editorView.dispatch({ changes: { from: sel.from, to: sel.to, insert: snippet.code } });
      editorView.focus();
      snippetsOpen.value = false;
      toast('Snippet inserted ✓', 'ok');
    }

    // ── Duplicate File ─────────────────────────────────────────
    function duplicateFile(id) {
      const src = flatFiles.value.find(f => f.id === id); if (!src) return;
      const nameParts = src.name.split('.');
      const ext = nameParts.length > 1 ? '.' + nameParts.pop() : '';
      const base = nameParts.join('.');
      const newName = base + '_copy' + ext;
      const nf = { id: uid(), type: 'file', name: newName, lang: src.lang, code: src.code, unsaved: false };
      fileTree.value.push(nf);
      switchFile(nf.id);
      saveFiles();
      toast('Duplicated → ' + newName, 'ok');
    }

    // ── Copy file path ─────────────────────────────────────────
    function copyFilePath(id) {
      const f = flatFiles.value.find(x => x.id === id); if (!f) return;
      const path = '/workspace/' + (settings.value.projectName || 'project') + '/' + f.name;
      navigator.clipboard.writeText(path).then(() => toast('Path copied: ' + path, 'ok')).catch(() => {});
    }


    let ry=0,rh=0,resz=false;
    function startResize(e){resz=true;ry=e.clientY||e.touches?.[0]?.clientY;rh=consoleH.value;document.addEventListener('mousemove',doResize);document.addEventListener('mouseup',stopResize);}
    function startResizeT(e){resz=true;ry=e.touches[0].clientY;rh=consoleH.value;document.addEventListener('touchmove',doResizeT,{passive:false});document.addEventListener('touchend',stopResize);}
    function doResize(e){if(!resz)return;consoleH.value=Math.max(50,Math.min(500,rh+(ry-e.clientY)));}
    function doResizeT(e){e.preventDefault();if(!resz)return;consoleH.value=Math.max(50,Math.min(500,rh+(ry-e.touches[0].clientY)));}
    function stopResize(){resz=false;document.removeEventListener('mousemove',doResize);document.removeEventListener('mouseup',stopResize);document.removeEventListener('touchmove',doResizeT);document.removeEventListener('touchend',stopResize);savePrefs();}

    let sx=0,sw=0,sresz=false;
    function startSR(e){sresz=true;sx=e.clientX;sw=splitW.value;document.addEventListener('mousemove',doSR);document.addEventListener('mouseup',stopSR);}
    function startSRT(e){sresz=true;sx=e.touches[0].clientX;sw=splitW.value;document.addEventListener('touchmove',doSRT,{passive:false});document.addEventListener('touchend',stopSR);}
    function doSR(e){if(!sresz)return;splitW.value=Math.max(180,Math.min(window.innerWidth-300,sw-(e.clientX-sx)));}
    function doSRT(e){e.preventDefault();if(!sresz)return;splitW.value=Math.max(180,Math.min(window.innerWidth-300,sw-(e.touches[0].clientX-sx)));}
    function stopSR(){sresz=false;document.removeEventListener('mousemove',doSR);document.removeEventListener('mouseup',stopSR);document.removeEventListener('touchmove',doSRT);document.removeEventListener('touchend',stopSR);}

    // ── Keyboard ───────────────────────────────────────────────
    document.addEventListener('keydown', e => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key==='Enter') { e.preventDefault(); runCode(); }
      if (ctrl && e.key==='s')     { e.preventDefault(); saveFiles(); if(activeFile.value)activeFile.value.unsaved=false; toast('Saved','ok'); }
      if (ctrl && e.key==='f')     { e.preventDefault(); findOpen.value=!findOpen.value; nextTick(()=>findInputRef.value?.focus()); }
      if (ctrl && e.key==='b')     { e.preventDefault(); sidebarOpen.value=!sidebarOpen.value; }
      if (ctrl && e.key==='\\')    { e.preventDefault(); toggleSplit(); }
      if (ctrl && e.key==='p')     { e.preventDefault(); previewOpen.value=!previewOpen.value; }
      if (ctrl && e.key==='i')     { e.preventDefault(); openImport(); }
      if (ctrl && e.key==='h')     { e.preventDefault(); findOpen.value=!findOpen.value; nextTick(()=>findInputRef.value?.focus()); }
      if (ctrl && e.key==='r')     { e.preventDefault(); openRename(); }
      if (ctrl && e.key==='k')     { e.preventDefault(); snippetsOpen.value=!snippetsOpen.value; }
      if (ctrl && e.key==='g')     { e.preventDefault(); gotoLineOpen.value=!gotoLineOpen.value; }
      if (ctrl && e.key==='d')     { if(activeFile.value){ e.preventDefault(); duplicateFile(activeFileId.value); } }
      if (ctrl && e.key==='.')     { e.preventDefault(); formatCode(); }
      if (e.key==='F2')            { openRename(); }
      if (e.key==='Escape')        { findOpen.value=false; settingsOpen.value=false; importOpen.value=false; renameOpen.value=false; snippetsOpen.value=false; gotoLineOpen.value=false; }
    });

    document.addEventListener('visibilitychange', () => { if(document.hidden) saveFiles(); });
    window.addEventListener('resize', () => { isMobile.value=window.innerWidth<768; });

    // ── Mount ──────────────────────────────────────────────────
    onMounted(async () => {
      initFiles(); applyTheme(); applyFont();
      const msgs=['Loading CodeMirror 6…','Setting up offline engines…','Preparing Python transpiler…','Almost ready…','Ready! 🚀'];
      let mi=0;
      const iv=setInterval(()=>{splashMsg.value=msgs[Math.min(mi++,msgs.length-1)];},350);
      await new Promise(r=>setTimeout(r,1500));
      clearInterval(iv); loading.value=false;
      await nextTick(); initEditor();
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
    });

    return {
      loading,splashMsg,sidebarOpen,settingsOpen,showApiKey,focusMode,isMobile,isOnline,
      findOpen,findQuery,replaceQuery,findInputRef,
      findMatchCase,findRegex,findWholeWord,findResults,findCurrent,
      renameOpen,renameQuery,renameReplace,renameCount,
      splitView,splitFileId,splitW,
      aiPanelOpen,previewOpen,previewLoad,previewRef,
      fileTree,flatFiles,activeFileId,activeFile,splitFile,
      // original names
      curLang,activeLang,langGroups:LANG_GROUPS,langCfg,
      outputLines,isRunning,runStatus,lastStats,
      consoleH,consoleRef,execRef,termInput,termInputRef,
      curLine,curCol,apiStatus,fontSize,lineWrap,modCount,editorH,
      aiMessages,aiPrompt,aiLoading,aiCtx,aiChatRef,aiPresets,
      settings,availableThemes,availableFonts,
      savePrefs,applyTheme,applyFont,
      switchFile,openSplit,closeSplit,toggleSplit,
      createFile,createFolder,toggleFolder,startRename,deleteNode,closeTab,
      onLangChange,toggleWrap,downloadFile,downloadAll,toggleFocus,
      runCode,clearOutput,copyOutput,hlOut,
      startResize,startResizeT,startSR,startSRT,
      sendAI,stopAI,clearAI,fmtAI,applyCodeToEditor,aiStreamText,
      wordCount,selCount,
      formatCode, isFormatting,
      snippetsOpen, snippetList, insertSnippet, snippetFilter,
      duplicateFile,
      doFind,findNext,findPrev,doReplace,doReplaceAll,
      openRename,doRename,
      execTerm,termUp,termDown,
      isWeb,canPreview,isOfflineLang,refreshPreview,popoutPreview,
      openImport,closeImport,importOpen,importFiles,importPaste,importPasteLang,importURL,isDragOver,importPreview,
      onDropZone,onDragOver,onDragLeave,triggerFileInput,removeImportFile,fetchURL,addPasteAsFile,confirmImport,fmtSize,
      LANG,
      toasts,toast,
      // ── HTML template aliases (fixes variable name mismatches) ──
      activeLangCfg: activeLang,
      currentLang:   curLang,
      createNewFile: createFile,
      createNewFolder: createFolder,
      modifiedCount: modCount,
      cursorLine:    curLine,
      cursorCol:     curCol,
      editorWrapHeight: editorH,
      downloadProject: downloadAll,
      // expose additional functions
      gotoLineOpen, gotoLineNum, doGotoLine,
      downloadZip, copyFilePath,
    };
  },
});

app.component('TreeNode', TreeNode);
app.mount('#app');
