/**
 * TSize
 * Efficiently get the terminal size.
 * 
 * MIT License
 * Copyright (c) 2022 Battledash-2
 */

const version = parseInt(process.version.match(/\d+/)[0]);
const avaMax = version < 15;

// Nodejs imports
let child_process;

if (avaMax) child_process = require('child_process');
else child_process = require('node:child_process');

let fs;

if (avaMax) fs = require('fs');
else fs = require('node:fs');

// Variables
const mod = {}; // easy reference to module.exports

const platform = process.platform; // Platform
const iswin = platform === 'win32'; // Client is on Windows

const defaultValue = Infinity;

const state = {
	width: defaultValue,
	height: defaultValue
}; // Current state

const stdout = process.stdout;
const comspec = iswin ? 'powershell.exe' :
					(fs.existsSync('/dev/bash') ? '/dev/bash' :
					(fs.existsSync('/dev/sh') ? '/dev/sh' : ''));

/**
 * 
 * @param {String} cmd 
 * @param {String[]} arg 
 * @returns {Object}
 */
const spawn = (cmd, arg) => {
	let output;
	if (iswin) {
		output = child_process.spawnSync(
			comspec,
			[cmd, ...arg],
			{ stdio: ['inherit', 'pipe', 'ignore'], // [stdin, stdout, stderr]
			  shell: false }
		);
	} else {
		if (comspec !== '') {
			output = child_process.spawnSync(
				comspec,
				['-c', cmd.replace(/"/g, '\\"') + ' ' + arg.join('').replace(/"/g, '\\"')],
				{ stdio: ['inherit', 'pipe', 'ignore'],
				shell: false }
			);
		} else {
			output = child_process.spawnSync(
				cmd,
				arg,
				{ stdio: ['inherit', 'pipe', 'ignore'] }
			);
		}	
	}
	output.output = [null, String(output[1]), null];
	output.stdout = String(output.stdout).replace('\r\n', '');
	output.stderr = String(output.stderr).replace('\r\n', '');

	return output;
}

/**
 * @description Default values
 */
const getSizeReadOnly = () => ({
	width: defaultValue,
	height: defaultValue,
});

/**
 * @description Gets the terminal size for unknown devices. Returns { width, height }
 * @param {ReadStream} std
 * @returns {Object}
 */
const getSizeUnknown = (std=stdout) => {
	if (typeof std.height !== 'undefined' && typeof std.width !== 'undefined') return { width: std.width, height: std.height };
	else {
		let output = spawn('stty', ['size']);
		
		if (typeof output.error !== 'undefined' || output.status !== 0) output = spawn('echo', ['"$LINES $COLUMNS"']);
		if (typeof output.error !== 'undefined' || output.status !== 0) output = spawn('echo', ['"$(tput lines) $(tput cols)"']);

		if (typeof output.error !== 'undefined' || output.status !== 0) return getSizeReadOnly();
		const size = output.stdout.split(' ').map(c=>parseInt(c));
		return {
			width: size[1],
			height: size[0],
		};
	}
}

/**
 * @description Gets the terminal size for windows devices. Returns { width, height }
 * @param {ReadStream} std
 * @returns {Object}
 */
const getSizeWin = (std=stdout) => {
	if (typeof std.height !== 'undefined' && typeof std.width !== 'undefined') return { width: std.width, height: std.height };
	else {
		const output = spawn('echo', ["(($Host.UI.RawUI.WindowSize.Width).toString() + 'x' + ($Host.UI.RawUI.WindowSize.Height).toString())"]);
		if (typeof output.error !== 'undefined' || output.status !== 0) return getSizeReadOnly();
		const size = output.stdout.split('x').map(c=>parseInt(c));
		return {
			width: size[0],
			height: size[1],
		};
	}
}

/**
 * @param {Object} object 
 * @returns {Object} Object[NaN=Infinity]
 */
const preventNaN = (object={}) => {
	for (let property in object) {
		if (isNaN(object[property])) object[property] = Infinity;
	}
	return object;
}

/**
 * @description Gets the terminal size. Returns { width, height }
 * @param {ReadStream} std
 * @returns {Object}
 */
const getSize = (std=stdout) => {
	if (iswin) return preventNaN(getSizeWin(std));
	return preventNaN(getSizeUnknown(std));
}

mod.size = ()=>preventNaN(getSize());

module.exports = mod;