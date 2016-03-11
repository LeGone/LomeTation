/**************************************************************************
 * DMX: GENERIC
 * Copyright (C) 2016 Raffael Holz aka LeGone - All Rights Reserved
 * http://www.legone.name
 *
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 **************************************************************************/

DMXGeneric = [];

function createDeviceIfNotExists(device)
{
	if (typeof DMXGeneric[device] === 'undefined') 
	{
		DMXGeneric[device] = new Uint8Array(513);
		DMXGeneric[device][0] = 0x00; // Startcode is always 0

		// Clear (set to 0) all channels. Always do this.
		for (var i = 1; i < 513; i++)
		{
			DMXGeneric[device][+i] = 0x00;	
		}
	}
}

wcNodeProcess.extend('NodeDMXGenericWriteChannel', 'Write DMX Channel', 'DMX',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Write Generic DMX Channel");
		
		this.createProperty('device', wcPlay.PROPERTY.STRING, '/dev/ttyUSB0', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('channel', wcPlay.PROPERTY.NUMBER, 1, {description: "NoDescriptionAvailable", input: true});
		this.createProperty('value', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
	},

	onActivated: function(name)
	{
		this._super(name);
		
		var self = this;

		var device = this.property('device');
		var channel = this.property('channel');
		var value = this.property('value');
		
		createDeviceIfNotExists(device);

		if (channel === 0)
		{
			for (var i = 513; i >= 1; i--)
			{
				DMXGeneric[device][i] = value;
			}
		}
		else
		{
			DMXGeneric[device][channel] = value;
		}
		
		this.activateExit('out');
	},
});

wcNodeProcess.extend('NodeDMXGenericReadChannel', 'Read DMX Channel', 'DMX',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Read Generic DMX Channel");
		
		this.createProperty('device', wcPlay.PROPERTY.STRING, '/dev/ttyUSB0', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('channel', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
		this.createProperty('result', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: false, output: true});
	},

	onActivated: function(name)
	{
		this._super(name);
		
		var device = this.property('device');
		var channel = this.property('channel');
		
		this.property('result', DMXGeneric[device][channel]);
		
		this.activateExit('out');
	},
});

wcNodeProcess.extend('NodeDMXGenericUpdateObsolete', 'Update DMX', 'DMX',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Update Generic DMX");
		
		this.createExit('error');
		
		this.createProperty('device', wcPlay.PROPERTY.STRING, '/dev/ttyUSB0', {description: "NoDescriptionAvailable", input: true});
	},

	onActivated: function(name)
	{
		this._super(name);
		
		var self = this;

		var devicePath = this.property('device');
		
		createDeviceIfNotExists(devicePath);
		
		var device = new SerialPort(devicePath,
		{
			baudrate: 250000,
			stopbits: 2,
			rtscts: 0,
			flowcontrol: 0,
			xon: 0,
			xoff: 0,
		}, false);
		
		device.open(function (error)
		{
			if (error)
			{
				console.log('failed to open: ' + error);
				self.activateExit('error');
			}
			else
			{
				device.on('error', function(error)
				{								
					console.log(error);
					self.activateExit('error');
				});

				device.set({brk:true}, function(err, something)
				{
					setTimeout(clear, 50);
				});
				
				function clear()
				{
					device.set({brk:false}, function(err, something)
					{
						device.write(DMXGeneric[devicePath], function(err, results)
						{
							device.close(function ()
							{
								self.activateExit('out');
							});
						});
					});
				}
			}
		});
	},
});

wcNodeEntry.extend('NodeDMXGenericUpdater', 'Update DMX', 'DMX',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description('Update DMX');
		this.removeExit('out');
		
		this.createProperty('devicePath', wcPlay.PROPERTY.STRING, '/dev/ttyUSB0', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty("milliseconds", wcPlay.PROPERTY.NUMBER, 1000, {description: 'The time, in milliseconds, per update.', input: true});
	},

	onActivated: function(name)
	{
		var self = this;
		var interval = this.property('milliseconds');
		var timer;
		this.resetThreads();
		
		var devicePath = this.property('devicePath');
		
		createDeviceIfNotExists(devicePath);
		
		var device = new SerialPort(devicePath,
		{
			baudrate: 250000,
			stopbits: 2,
			rtscts: 0,
			flowcontrol: 0,
			xon: 0,
			xoff: 0,
		}, false);
		
		device.open(function (error)
		{
			if (error)
			{
				console.log('failed to open: ' + error);
			}
			else
			{
				var timerFunction = function()
				{
					self.finishThread(timer);
					clearInterval(timer);
					
					device.set({brk:true}, function(err, something)
					{
						setTimeout(clear, 50);
					});
					
					function clear()
					{
						device.set({brk:false}, function(err, something)
						{
							device.write(DMXGeneric[devicePath]);
							timer = self.beginThread(setInterval(timerFunction, interval));
						});
					}
				}

				device.on('error', function(error)
				{								
					console.log(error);
				});

				timer = self.beginThread(setInterval(timerFunction, interval));
			}
		});
	},

	onStart: function()
	{
		this._super();
		this.onActivated();
	},
});

wcNodeProcess.extend('NodeDMXUniversalJson', 'DMX(512 Channels) to/from JSON', 'DMX',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Encode/decode DMX to/from Json");
		
		this.createEntry('encode');
		this.createEntry('decode');
		this.removeEntry('in');
		
		this.createExit('encoded');
		this.createExit('decoded');
		this.createExit('error');
		this.removeExit('out');

		this.createProperty('encodejson', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('decodejson', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('device', wcPlay.PROPERTY.STRING, '/dev/ttyUSB0', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('encoded', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: false, output: true});
	},

	onActivated: function(name)
	{
		var error = false;

		var device = this.property('device');
		createDeviceIfNotExists(device);
		
		if (name === 'encode')
		{
			var jsonString = this.property('encodejson');
			if (!jsonString)
				jsonString = '{}';

			var json = JSON.parse(jsonString);
			
			if (!json.hasOwnProperty(this.name))
			{
				json[this.name] = {};
			}
			
			if (typeof DMXGeneric[device] !== 'undefined')
			{
				var channels = {};
				for (var i=1; i<=513; ++i)
				{
					channels[i] = DMXGeneric[device][i];
				}
				json[this.name] = channels;
			}
			else
			{
				error = true;
			}
			
			this.property('encoded', JSON.stringify(json));
			this.activateExit('encoded');
		}
		else
		{
			var jsonString = this.property('decodejson');
			var json = JSON.parse(jsonString);
			
			if (json.hasOwnProperty(this.name))
			{
				var length = Object.keys(json[this.name]).length;
				for (var i=0; i<length; i++)
				{
					var index = Object.keys(json[this.name])[i];
					DMXGeneric[device][parseInt(index)] = json[this.name][index];
				}
			}
			
			this.activateExit('decoded');
		}
		
		if (error)
		{
			this.activateExit('error');
		}
	},
});