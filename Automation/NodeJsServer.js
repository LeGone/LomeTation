/**************************************************************************
 * BROADCAST-SERVICE
 * Copyright (C) 2016 Raffael Holz aka LeGone - All Rights Reserved
 * http://www.legone.name
 *
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 **************************************************************************/
 
// A few core-requires
var fs = require('fs');
var vm = require('vm');
net = require('net');
moment = require('moment');
moment().format();
WebSocketServer = require('ws').Server;
Http = require('http');
os = require("os");
networkInterfaces = os.networkInterfaces();
dns = require("dns");
SerialPort = require("serialport").SerialPort;
dgram = require("dgram"); // For Broadcast-Service

// Wiring-Pi
wpi = require('wiring-pi'); // No var here. We need wpi to be globally accessible
wpi.setup('wpi');

// Use MockBrowser to fake "window"
var MockBrowser = require('mock-browser').mocks.MockBrowser;
$ = require('jquery') (MockBrowser.createWindow()); // Needed for $.IsArray(...)...
window = global; // Fake the window - used by wcPlay-Core-Inheritance-System

// Read all Parts
vm.runInThisContext(fs.readFileSync(__dirname + "/BroadcastService.js"));

vm.runInThisContext(fs.readFileSync(__dirname + "/../Build/wcPlay.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/../Build/wcPlayNodes.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/../Build/wcPlayExampleNodes.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/Nodes/Core.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/Nodes/GPIO.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/Nodes/LCD.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/Nodes/Network.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/Nodes/Branches.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/Nodes/Events.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/Nodes/Storages.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/Nodes/Json.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/Nodes/RelayCards/USB-RLY16L.js"));
vm.runInThisContext(fs.readFileSync(__dirname + "/Nodes/DMX/Generic.js"));

// Create an instance of our Play engine.
var myPlay = new wcPlay({
	silent: false,
	updateRate: 10,
	updateLimit: 100,
	debugging: true,
});

var script = process.argv[2];
console.log('Starting server using script ' + script);

// Load a pre-developed script (Serial string was previously generated by wcPlay.save).
myPlay.load(fs.readFileSync(__dirname + '/Scripts/' + script));

// Start execution of the script.
myPlay.start();