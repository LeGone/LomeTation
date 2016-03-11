/**************************************************************************
 * RELAYCARD: USB-RLY16L
 * Copyright (C) 2016 Raffael Holz aka LeGone - All Rights Reserved
 * http://www.legone.name
 *
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 **************************************************************************/

RLY16L = [];

wcNodeProcess.extend('NodeUSBRLY16LPosition', 'Position on USB-RLY16L', 'USB-RLY16L',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Change Position of Relay on USB-RLY16L");
		
		this.createProperty('device', wcPlay.PROPERTY.STRING, '/dev/ttyACM0', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('pin', wcPlay.PROPERTY.SELECT, '0', {items: ['0', '1', '2', '3', '4', '5', '6', '7', 'ALL'], description: "NoDescriptionAvailable", input: true});
		this.createProperty('position', wcPlay.PROPERTY.SELECT, '0', {items: ['0', '1'], description: "NoDescriptionAvailable", input: true});
	},

	onActivated: function(name)
	{
		this._super(name);

		var device = this.property('device');
		var pin = this.property('pin');
		var position = this.property('position');

		if (pin === 'ALL')
		{
			for (var i = 7; i >= 0; i--)
			{
				RLY16L[device][i] = position;
			}
		}
		else
		{
			RLY16L[device][pin] = position;
		}
		
		this.activateExit('out');
	},
});

wcNodeProcess.extend('NodeUSBRLY16LReadRelayStates', 'Read USB-RLY16L-States', 'USB-RLY16L',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description('Read all Positions off an USB-RLY16L-Device');
		
		this.createExit('error');
		
		this.createProperty('device', wcPlay.PROPERTY.STRING, '/dev/ttyACM0', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('relay1', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: false, output: true});
		this.createProperty('relay2', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: false, output: true});
		this.createProperty('relay3', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: false, output: true});
		this.createProperty('relay4', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: false, output: true});
		this.createProperty('relay5', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: false, output: true});
		this.createProperty('relay6', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: false, output: true});
		this.createProperty('relay7', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: false, output: true});
		this.createProperty('relay8', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: false, output: true});
	},

	onActivated: function(name)
	{
		this._super(name);
		
		var device = this.property('device');
		
		if (typeof RLY16L[device] !== 'undefined')
		{
			this.property('relay1', RLY16L[device][0]);
			this.property('relay2', RLY16L[device][1]);
			this.property('relay3', RLY16L[device][2]);
			this.property('relay4', RLY16L[device][3]);
			this.property('relay5', RLY16L[device][4]);
			this.property('relay6', RLY16L[device][5]);
			this.property('relay7', RLY16L[device][6]);
			this.property('relay8', RLY16L[device][7]);
			this.activateExit('out');
		}
		else
		{
			console.error('[USB-RLY16L] No active states found for ' + device);
			this.activateExit('error');
		}
	},
});

wcNodeEntry.extend('NodeUSBRLY16LUpdater', 'Updates States on USB-RLY16L', 'USB-RLY16L',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description('Updates States on USB-RLY16L');
		this.removeExit('out');
		
		this.createProperty('device', wcPlay.PROPERTY.STRING, '/dev/ttyACM0', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty("milliseconds", wcPlay.PROPERTY.NUMBER, 1000, {description: 'The time, in milliseconds, per update.', input: true});
	},

	onActivated: function(name)
	{
		var self = this;
		var interval = this.property('milliseconds');
		var device = this.property('device');
		var timer;
		this.resetThreads();
		
		RLY16L[device] = new SerialPort(device,
		{
			baudrate: 19200,
			stopbits: 2
		}, false);
		
		RLY16L[device].open(function (error)
		{
			if (error)
			{
				console.log('failed to open: ' + error);
			}
			else
			{
				RLY16L[device].write(String.fromCharCode(91));
				
				var timerFunction = function()
				{
					self.finishThread(timer);
					clearInterval(timer);
					
					var bytes = new Uint8Array(2);
					bytes[0] = 92;
					bytes[1] = 0;

					for (var i = 0; i < 8; i++)
					{
						bytes[1] |= RLY16L[device][i] << i;
					}
					
					RLY16L[device].write(bytes);
					RLY16L[device].drain();
					
					RLY16L[device].write(String.fromCharCode(91));
				}
				
				RLY16L[device].on('error', function(error)
				{								
					console.log(error);
				});
				
				RLY16L[device].on('data', function(data)
				{
					var states = data[0];
					for (var i = 7; i >= 0; i--)
					{
						var bit = states & (1 << i) ? 1 : 0;
						RLY16L[device][i] = bit;
					}
					
					timer = self.beginThread(setInterval(timerFunction, interval));
				});
			}
		});
	},

	onStart: function()
	{
		this._super();
		this.onActivated();
	},
});

wcNodeProcess.extend('NodeUSBRLY16LJson', 'USB-RLY16L-States to/from Json', 'USB-RLY16L',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("USB-RLY16L-States to/from Json");

		this.removeEntry('in');
		this.createEntry('encode', "Encode to Json");
		this.createEntry('decode', "Decode from Json");

		this.removeExit('out');
		this.createExit('encoded', "Encoded to Json");
		this.createExit('decoded', "Decoded from Json");
		this.createExit('error', "Decoded from Json");

		this.createProperty('encodejson', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('decodejson', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('room', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('device', wcPlay.PROPERTY.STRING, '/dev/ttyACM0', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('relay1', wcPlay.PROPERTY.STRING, 'relay1', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('relay2', wcPlay.PROPERTY.STRING, 'relay2', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('relay3', wcPlay.PROPERTY.STRING, 'relay3', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('relay4', wcPlay.PROPERTY.STRING, 'relay4', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('relay5', wcPlay.PROPERTY.STRING, 'relay5', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('relay6', wcPlay.PROPERTY.STRING, 'relay6', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('relay7', wcPlay.PROPERTY.STRING, 'relay7', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('relay8', wcPlay.PROPERTY.STRING, 'relay8', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('encoded', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: false, output: true});
	},

	onActivated: function(name)
	{
		var error = false;
		
		var room = this.property('room');
		var device = this.property('device');
		
		// Relay-Names
		var relay1 = this.property('relay1');
		var relay2 = this.property('relay2');
		var relay3 = this.property('relay3');
		var relay4 = this.property('relay4');
		var relay5 = this.property('relay5');
		var relay6 = this.property('relay6');
		var relay7 = this.property('relay7');
		var relay8 = this.property('relay8');
		
		if (name === 'encode')
		{
			var jsonString = this.property('encodejson');
		
			if (!jsonString)
				jsonString = '{}';

			var json = JSON.parse(jsonString);
			
			if (!json.hasOwnProperty(room))
			{
				json[room] = {};
			}
			
			var attributes = {};
			attributes[relay1] = RLY16L[device][0];
			attributes[relay2] = RLY16L[device][1];
			attributes[relay3] = RLY16L[device][2];
			attributes[relay4] = RLY16L[device][3];
			attributes[relay5] = RLY16L[device][4];
			attributes[relay6] = RLY16L[device][5];
			attributes[relay7] = RLY16L[device][6];
			attributes[relay8] = RLY16L[device][7];
			json[room][this.name] = attributes;
			
			this.property('encoded', JSON.stringify(json));
			this.activateExit('encoded');
		}
		else
		{
			var jsonString = this.property('decodejson');
			if (jsonString)
			{
				var json = JSON.parse(jsonString);
				
				if (json.hasOwnProperty(room))
				{
					if (json[room].hasOwnProperty(this.name))
					{
						if (json[room][this.name].hasOwnProperty(relay1))
						{
							RLY16L[device][0] = json[room][this.name][relay1];
						}
						if (json[room][this.name].hasOwnProperty(relay2))
						{
							RLY16L[device][1] = json[room][this.name][relay2];
						}
						if (json[room][this.name].hasOwnProperty(relay3))
						{
							RLY16L[device][2] = json[room][this.name][relay3];
						}
						if (json[room][this.name].hasOwnProperty(relay4))
						{
							RLY16L[device][3] = json[room][this.name][relay4];
						}
						if (json[room][this.name].hasOwnProperty(relay5))
						{
							RLY16L[device][4] = json[room][this.name][relay5];
						}
						if (json[room][this.name].hasOwnProperty(relay6))
						{
							RLY16L[device][5] = json[room][this.name][relay6];
						}
						if (json[room][this.name].hasOwnProperty(relay7))
						{
							RLY16L[device][6] = json[room][this.name][relay7];
						}
						if (json[room][this.name].hasOwnProperty(relay8))
						{
							RLY16L[device][7] = json[room][this.name][relay8];
						}
					}
				}
				this.activateExit('decoded');
			}
			else
			{
				console.error('[USB-RLY16L][' + this.name + '] Empty Input-Json!');
				error = true;
			}
		}
		
		if (error)
		{
			this.activateExit('error');
		}
	},
});