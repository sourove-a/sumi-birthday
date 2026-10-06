import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GIT_EXTRA_PATH = [
  'C:\\Users\\souro\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\git\\cmd',
  'C:\\Users\\souro\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\git\\mingw64\\bin',
  'C:\\Users\\souro\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\git\\mingw64\\libexec\\git-core'
].join(';');
const env = { ...process.env, PATH: `${GIT_EXTRA_PATH};${process.env.PATH || ''}` };

let debounceTimer = null;
let isPushing = false;

function runGit(cmd) {
  try {
    return execSync(cmd, { cwd: __dirname, env, encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    if (err.stdout) console.log(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    return null;
  }
}

function syncToGitHub() {
  if (isPushing) return;
  isPushing = true;

  try {
    const status = runGit('git status --porcelain');
    if (!status || !status.trim()) {
      isPushing = false;
      return;
    }

    console.log('\n[Auto-Deploy] 📝 Detected file changes...');
    runGit('git add .');

    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const commitMsg = `Auto update (${now})`;
    runGit(`git commit -m "${commitMsg}"`);
    console.log(`[Auto-Deploy] 📦 Committed: ${commitMsg}`);

    console.log('[Auto-Deploy] 🚀 Pushing to GitHub (main)...');
    runGit('git push origin main');
    console.log('✅ [Auto-Deploy] Pushed successfully! Vercel is deploying to sumi.sourove.com\n');
  } catch (e) {
    console.error('[Auto-Deploy] ⚠️ Sync error:', e.message);
  } finally {
    isPushing = false;
  }
}

function triggerSync() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    syncToGitHub();
  }, 4000); // 4 seconds debounce
}

// Watch directory recursively
console.log('========================================================');
console.log('   👀 Auto-Push & Vercel Auto-Deploy Watcher is Active');
console.log('   📂 Watching for changes in website/');
console.log('   🌐 Live URL: https://sumi.sourove.com');
console.log('========================================================\n');

const watchDirs = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'public'),
  path.join(__dirname, 'index.html'),
  path.join(__dirname, 'package.json')
];

for (const target of watchDirs) {
  if (fs.existsSync(target)) {
    try {
      fs.watch(target, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        if (filename.includes('node_modules') || filename.includes('.git') || filename.includes('dist')) return;
        triggerSync();
      });
    } catch {
      // Fallback
    }
  }
}

// Keep process running
process.stdin.resume();
