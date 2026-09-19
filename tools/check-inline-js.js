// Syntax-checks the app's inline <script> blocks — step 3 of the validation checklist.
// Compiling with vm.Script is what `node --check` does, minus the shell quoting fight
// over Windows temp paths. Line-ending agnostic: checkouts here are CRLF.
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
  .map(m => m[1])
  .filter(js => js.trim().length > 40);

if (!blocks.length) { console.error('no inline script blocks found'); process.exit(1); }

let failed = 0;
blocks.forEach((js, i) => {
  const lines = js.split(/\r?\n/).length;
  try {
    new vm.Script(js, { filename: `index.html inline script #${i + 1}` });
    console.log(`OK   inline script #${i + 1} (${lines} lines)`);
  } catch (e) {
    failed++;
    console.error(`FAIL inline script #${i + 1}: ${e.message}`);
  }
});

// The JSON-LD block is data, not script, but it is in the same file and breaks the same way.
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (ld) {
  try { JSON.parse(ld[1]); console.log('OK   JSON-LD'); }
  catch (e) { failed++; console.error('FAIL JSON-LD: ' + e.message); }
}

process.exit(failed ? 1 : 0);
