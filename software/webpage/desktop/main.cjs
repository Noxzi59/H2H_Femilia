const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const isDevelopment = !app.isPackaged;
const webDirectory = app.getAppPath();
const projectDirectory = path.resolve(webDirectory, '..');
const resourcesDirectory = process.resourcesPath;
const visionScript = isDevelopment
  ? path.join(projectDirectory, 'vision_server.py')
  : path.join(resourcesDirectory, 'vision_server.py');
const modelPath = isDevelopment
  ? path.join(projectDirectory, 'yolo11n.pt')
  : path.join(resourcesDirectory, 'yolo11n.pt');
const visionUrl = 'http://127.0.0.1:8000/api/vision/status';
const desktopWindowUrl = 'http://127.0.0.1:3002';
const packagedWebUrl = 'http://127.0.0.1:8000/';
let packagedPythonPath;

try {
  packagedPythonPath = require('./runtime-config.json').pythonPath;
} catch {
  packagedPythonPath = undefined;
}

let visionProcess;
let viteProcess;
let mainWindow;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function visionServiceIsReady() {
  try {
    const response = await fetch(visionUrl, { signal: AbortSignal.timeout(1000) });
    if (!response.ok) return false;
    const status = await response.json();
    return isDevelopment || status.web_ui === true;
  } catch {
    return false;
  }
}

async function waitForService(check, label, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await check()) return;
    await wait(1000);
  }
  throw new Error(`${label} did not start in time.`);
}

function startVisionService() {
  if (process.env.ROBO_VISION_EXTERNAL === '1') return;
  const localEnvironment = path.join(projectDirectory, '.venv', 'Scripts', 'python.exe');
  const python = process.env.ROBO_VISION_PYTHON
    || (isDevelopment && fs.existsSync(localEnvironment) ? localEnvironment : undefined)
    || (packagedPythonPath && fs.existsSync(packagedPythonPath) ? packagedPythonPath : undefined)
    || 'python';
  const logDirectory = app.getPath('userData');
  fs.mkdirSync(logDirectory, { recursive: true });
  const logStream = fs.createWriteStream(path.join(logDirectory, 'vision-service.log'), { flags: 'a' });

  const args = [visionScript, '--model', modelPath];
  if (!isDevelopment) args.push('--web-dir', path.join(resourcesDirectory, 'web'));
  visionProcess = spawn(python, args, {
    cwd: isDevelopment ? projectDirectory : resourcesDirectory,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  visionProcess.stdout.pipe(logStream);
  visionProcess.stderr.pipe(logStream);
  visionProcess.on('error', (error) => {
    console.error('Could not launch the local vision service:', error);
    logStream.write(`${new Date().toISOString()} Could not launch ${python}: ${error.message}\n`);
    logStream.end();
  });
  visionProcess.on('exit', (code) => {
    logStream.write(`${new Date().toISOString()} Vision service exited with code ${code}\n`);
    logStream.end();
  });
}

function startVite() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  viteProcess = spawn(command, [
    'run', 'dev', '--', '--host', '127.0.0.1', '--port', '3002', '--strictPort',
  ], {
    cwd: webDirectory,
    windowsHide: true,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });
  viteProcess.on('error', (error) => {
    console.error('Could not launch the React development server:', error);
  });
}

async function frontendIsReady() {
  try {
    const response = await fetch(desktopWindowUrl, { signal: AbortSignal.timeout(1000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1100,
    minHeight: 700,
    title: 'Robo Control',
    backgroundColor: '#0a0a0a',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDevelopment) {
    await mainWindow.loadURL(desktopWindowUrl);
  } else if (await visionServiceIsReady()) {
    await mainWindow.loadURL(packagedWebUrl);
  } else {
    await mainWindow.loadFile(path.join(webDirectory, 'dist', 'index.html'));
  }
}

async function launchDesktopApp() {
  if (isDevelopment) {
    startVite();
    await waitForService(frontendIsReady, 'Desktop frontend');
  }
  if (!(await visionServiceIsReady())) startVisionService();
  if (!isDevelopment) {
    try {
      await waitForService(visionServiceIsReady, 'Local YOLO service', 30);
    } catch {
      // Keep the dashboard available if Python startup fails; it will show the
      // local vision service error instead of withholding the whole app window.
    }
  }
  await createMainWindow();
}

app.whenReady().then(launchDesktopApp).catch((error) => {
  dialog.showErrorBox('Robo Control could not start', error.message);
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

app.on('window-all-closed', () => app.quit());

app.on('before-quit', () => {
  if (visionProcess && !visionProcess.killed) visionProcess.kill();
  if (viteProcess && !viteProcess.killed) viteProcess.kill();
});
