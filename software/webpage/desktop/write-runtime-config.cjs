const fs = require('node:fs');
const path = require('node:path');

const projectDirectory = path.resolve(__dirname, '../..');
const pythonPath = path.join(projectDirectory, '.venv', 'Scripts', 'python.exe');
const configPath = path.join(__dirname, 'runtime-config.json');

fs.writeFileSync(
  configPath,
  JSON.stringify({ pythonPath: fs.existsSync(pythonPath) ? pythonPath : null }, null, 2),
  'utf8',
);
