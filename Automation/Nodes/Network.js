/**************************************************************************
 * NETWORK
 * Copyright (C) 2016 Raffael Holz aka LeGone - All Rights Reserved
 * http://www.legone.name
 *
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 **************************************************************************/
 
wcNodeProcess.extend('NodeNet', 'Net-TCP', 'Net',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Initialize NET");
		this.createExit('error');

		this.createProperty('address', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('port', wcPlay.PROPERTY.NUMBER, 0, {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('timeout', wcPlay.PROPERTY.NUMBER, 5000, {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('message', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('result', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', output: true});
	},

	onActivated: function(name)
	{
		this._super(name);

		if (typeof net !== 'undefined')
		{
			var that = this;
			var client = new net.Socket();

			client.connect(this.property('port'), this.property('address'), function()
			{
				client.write(that.property('message') + '\r\n');
			});

			client.on('data', function(data)
			{
				data = String(data);
				data = data.replace(/(\r\n|\n|\r)/gm, '');
				that.property('result', data);
				that.activateExit('out');
				client.destroy(); // kill client after server's response
			});        

			client.setTimeout(this.property('timeout'), function()
			{
				that.activateExit('error');
				client.destroy(); // kill client after server's response
			});
		}
		else
		{
			this.activateExit('error');
		}
	},
});

var services = [];
wcNodeEntry.extend('NodeNetWebSocketService', 'WebSocket-Service', 'Net',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Websocket-Service");

		this.createProperty('port', wcPlay.PROPERTY.NUMBER, 0, {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('message', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: false, output: true});
	},

	onActivated: function(name)
	{
		var self = this;
		
		if (typeof WebSocketServer !== 'undefined')
		{
			var _port = this.property('port');
			var service = new WebSocketServer({ port: _port });
			
			// Already in use?
			if (typeof services[_port] !== 'undefined')
			{
				console.log('Port ' + _port + ' is already in use!' + services[_port]);
			}

			services[_port] = service;

			service.on('connection', function connection(ws)
			{
				if (service.clients.length <= 1)
				{
					self.property('client', Number(ws));
					ws.on('message', function incoming(message)
					{
						self.property('message', message);
						self.activateExit('out');
					});
				}
				else
				{
					ws.send('BUSY');
					ws.terminate();
				}
			});
		}
	},

	onStart: function()
	{
		this._super();
		this.onActivated();
	},
});

wcNodeProcess.extend('NodeNetWebSocketSend', 'WebSocket-Send', 'Net',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);
		
		this.description("Websocket-Send");
		
		this.createExit('error');

		this.createProperty('message', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true, output: false});
		this.createProperty('port', wcPlay.PROPERTY.NUMBER, 0, {description: 'NoDescriptionAvailable', input: true, output: false});
	},

	onActivated: function(name)
	{
		this._super(name);
		
		var port = this.property('port');
		var service = services[port];
		
		if (typeof WebSocketServer !== 'undefined')
		{
			if (typeof service !== 'undefined')
			{
				if (service.clients.length >= 1)
				{
					var client = service.clients[0];
					client.send(String(this.property('message')));
					this.activateExit('out');
				}
			}
			else
			{
				console.error('There is no service running on port ' + port);
				this.activateExit('error');
			}
		}
	},
});

wcNodeProcess.extend('NodeNetWebSocketClose', 'WebSocket-Close', 'Net',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Websocket-Close");

		this.createProperty('port', wcPlay.PROPERTY.NUMBER, 0, {description: 'NoDescriptionAvailable', input: true, output: false});
	},

	onActivated: function(name)
	{
		this._super(name);
		
		var port = this.property('port');
		var service = services[port];
		
		if (typeof WebSocketServer !== 'undefined')
		{
			if (typeof service !== 'undefined')
			{
				if (service.clients.length >= 1)
				{
					var client = service.clients[0];
					client.close();
					this.activateExit('out');
				}
			}
			else
			{
				console.warn('There is no service running on port ' + port);
			}
		}
	},
});

wcNodeEntry.extend('NodeNetJsonService', 'Json-Service', 'Net',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.removeExit('out');
		this.createExit('PUT');
		
		this.description('Json-Service');

		this.createProperty('port', wcPlay.PROPERTY.NUMBER, 0, {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('jsonin', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: false, output: true});
		this.createProperty('jsonout', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
	},

	onActivated: function(name)
	{
		var self = this;
		
		if (typeof Http !== 'undefined')
		{
			var port = this.property('port');
			
			// Already in use?
			if (typeof services[port] !== 'undefined')
			{
				console.log('Port ' + port + ' is already in use!' + services[port]);
			}

			services[port] = Http.createServer(function (request, response)
			{
				if (request.method === 'OPTIONS')
				{
					response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
					response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
					response.setHeader('Access-Control-Allow-Credentials', false);
					response.setHeader('Access-Control-Max-Age', '86400');
					response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
					response.writeHead(200);
					response.end();
				}
				else if (request.method === 'PUT')
				{
					var body = '';
					request.on('data', function (data)
					{
						body += data;
					});
					
					request.on('end', function ()
					{
						self.property('jsonin', body);
						self.activateExit('PUT');
					});
					
					response.writeHead(200);
					response.end();
				}
				else
				{
					response.writeHead(200, {'Content-Type': 'application/json'});
					response.write(self.property('jsonout'));
					response.end();
				}
			});
			
			if (port)
			{
				services[port].listen(port);
			}
		}
	},

	onStart: function()
	{
		this._super();
		this.onActivated();
	},
});

wcNodeProcess.extend('NodeNetRGBLedObsolete', 'RGB-Leds(obsolete)', 'Net',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Initialize NET");
		this.removeExit('out');

		this.createProperty('address', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('timeout', wcPlay.PROPERTY.NUMBER, 5000, {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('red', wcPlay.PROPERTY.NUMBER, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('green', wcPlay.PROPERTY.NUMBER, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('blue', wcPlay.PROPERTY.NUMBER, '', {description: 'NoDescriptionAvailable', input: true});
	},

	onActivated: function(name)
	{
		this._super(name);

		if (typeof net !== 'undefined')
		{
			var that = this;
			var client = new net.Socket();

			client.connect(2701, this.property('address'), function()
			{
				client.write('!cf c' + String.fromCharCode(this.property('red')) + '' + String.fromCharCode(this.property('green')) + '' + String.fromCharCode(this.property('blue')) + '\r\n');
			});

			client.setTimeout(this.property('timeout'), function()
			{
				client.destroy(); // kill client after server's response
			});
		}
	},
});