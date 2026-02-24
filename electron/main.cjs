const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let mainWindow;
let serverProcess;

const isDev = !app.isPackaged;

function startServer() {
  let serverPath;
  let envPath;

  if (isDev) {
    serverPath = path.join(__dirname, '../server/index.cjs');
    envPath = path.join(__dirname, '../.env');
  } else {
    // In production, we expect the server folder to be in resources/server-dist
    serverPath = path.join(process.resourcesPath, 'server-dist/index.cjs');
    envPath = path.join(process.resourcesPath, '.env');
  }
  
  // Ensure env vars are loaded for production as well if not already
  require('dotenv').config({ path: envPath });

  console.log('Starting server from:', serverPath);

  // Use fork to run the server script using Electron's internal Node.js runtime
  // This avoids needing a separate Node.js installation on the user's machine
  serverProcess = fork(serverPath, [], {
    // We pass process.env which now includes the loaded .env variables
    // We strictly default DB_PASSWORD to process.env.DB_PASSWORD to ensure it's passed
    env: { 
      ...process.env, 
      PORT: '3000', 
      DB_HOST: process.env.DB_HOST || 'localhost', 
      DB_USER: process.env.DB_USER || 'root', 
      DB_PASSWORD: process.env.DB_PASSWORD 
    },
    stdio: ['ignore', 'pipe', 'pipe', 'ipc']
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the index.html from the dist folder
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  startServer();
  
  // Give the server a moment to start
  setTimeout(createWindow, 2000);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
