import { spawn } from 'child_process';

// Discard extra arguments from the platform (e.g., --host which Next.js doesn't recognize)
// and run Next.js dev server with strictly supported arguments.
const child = spawn('npx', ['next', 'dev', '--port', '3000', '--hostname', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => {
  process.exit(code || 0);
});

// Forward termination signals to the child process
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGBREAK', () => child.kill('SIGBREAK'));
process.on('SIGHUP', () => child.kill('SIGHUP'));
