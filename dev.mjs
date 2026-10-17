import { spawn } from 'child_process';
import readline from 'readline';

const processes = [
  { name: 'backend', color: '\x1b[34m', command: 'npm run dev', cwd: './backend' },
  { name: 'admin', color: '\x1b[35m', command: 'npm run dev -- -p 3001', cwd: './admin' },
  { name: 'frontend', color: '\x1b[36m', command: 'pnpm dev --port 3000', cwd: './frontend' },
];

let children = [];

function startAll() {
  processes.forEach(p => {
    startProcess(p);
  });
}

function startProcess(p) {
  const child = spawn(p.command, [], { cwd: p.cwd, shell: true });
  
  child.stdout.on('data', (data) => {
    process.stdout.write(`${p.color}[${p.name}]\x1b[0m ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`${p.color}[${p.name}]\x1b[0m ${data}`);
  });

  child.on('close', (code) => {
    console.log(`${p.color}[${p.name}]\x1b[0m exited with code ${code}`);
  });

  children.push(child);
}

function restartAll() {
  console.log('\n\x1b[33mRestarting all processes...\x1b[0m\n');
  children.forEach(child => {
    child.kill(); 
  });
  children = [];
  startAll();
}

startAll();

// Keyboard interactions
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    children.forEach(c => c.kill());
    process.exit();
  } else if (key.name === 'a') {
    console.log('\n\x1b[33mOpening Admin...\x1b[0m\n');
    spawn('open', ['http://localhost:3001']); 
  } else if (key.name === 'f') {
    console.log('\n\x1b[33mOpening Frontend...\x1b[0m\n');
    spawn('open', ['http://localhost:3000']);
  } else if (key.name === 'b') {
    console.log('\n\x1b[33mOpening Backend...\x1b[0m\n');
    spawn('open', ['http://localhost:5001']);
  } else if (key.name === 'r') {
    restartAll();
  } else if (key.name === 'q') {
    children.forEach(c => c.kill());
    process.exit();
  }
});

console.log(`
\x1b[32mDev Environment Started!\x1b[0m
Press \x1b[1ma\x1b[0m to open Admin
Press \x1b[1mf\x1b[0m to open Frontend
Press \x1b[1mb\x1b[0m to open Backend
Press \x1b[1mr\x1b[0m to restart all
Press \x1b[1mq\x1b[0m or \x1b[1mCtrl+C\x1b[0m to quit
`);
