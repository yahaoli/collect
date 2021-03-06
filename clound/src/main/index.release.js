/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

import electron, {remote, BrowserView} from "electron";
import path from "path";
const { BrowserWindow } = remote || electron;



// Set environment for development
// process.env.NODE_ENV = 'development'

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// Install `vue-devtools`
// require('electron').app.on('ready', () => {
//   let installExtension = require('electron-devtools-installer')
//   installExtension.default(installExtension.VUEJS_DEVTOOLS)
//     .then(() => {})
//     .catch(err => {
//       console.log('Unable to install `vue-devtools`: \n', err)
//     })
// })
require('electron').app.on('ready', () => {
	BrowserWindow.addDevToolsExtension(
		path.join(__dirname, '../../extension/vue-devtools')
	);
})

// Require `main` process to boot app
require('./index')
