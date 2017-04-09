//use this to package:
//electron-packager . --overwrite --asar=true --platform=win32 --arch=ia32
//browserify main.js -o bundle.js
//have to browserify first or build won't work
//also have to close budo or it won't work
//to get rid of js console, comment out mainWindow.openDevTools()

const {app, BrowserWindow} = require('electron');

let mainWindow;

app.on('ready', () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 632,
		'node-integration': true,
		frame: false, //gets rid of minimize/X out, etc.
		titleBarStyle: 'hidden'
	});

	mainWindow.loadURL('file://' + __dirname + '/index.html');

	// mainWindow.openDevTools(); //makes it so build has chrome console 
});

app.on('window-all-closed', function() {
	app.quit();
});