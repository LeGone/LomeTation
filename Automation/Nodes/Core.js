/**************************************************************************
 * CORE
 * Copyright (C) 2016 Raffael Holz aka LeGone - All Rights Reserved
 * http://www.legone.name
 *
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 **************************************************************************/
 
wcNodeProcess.extend('NodeSetupWpi', 'Setup WPI', 'Core',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Sets the setup-mode");

		this.createProperty('mode', wcPlay.PROPERTY.SELECT, 'wpi', {items: ['wpi', 'gpio', 'sys', 'phys'], description: "NoDescriptionAvailable", input: true});
	},

	onActivated: function(name)
	{
		this._super(name);

		var mode = this.property('mode');
		if (typeof wpi !== 'undefined')
		{
			wpi.setup(mode);
		}

		this.activateExit('out');
	},
});

wcNodeProcess.extend('NodeGetSystemVariable', 'Get System Variable', 'Core',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Gets a variable about the service-computer");

		this.createProperty('variable', wcPlay.PROPERTY.SELECT, 'hostname', {items: ['tmpdir', 'endianness', 'hostname', 'type', 'platform', 'arch', 'release', 'uptime', 'loadavg', 'totalmem', 'freemem', 'EOL'], description: "NoDescriptionAvailable", input: true});
		this.createProperty('result', wcPlay.PROPERTY.STRING, '', {description: "NoDescriptionAvailable", input: false, output: true});
	},

	onActivated: function(name)
	{
		this._super(name);

		var variable = this.property('variable');
		if (typeof os !== 'undefined')
		{
			variable = os[variable]();
			this.property('result', variable);
		}

		this.activateExit('out');
	},
});

wcNodeProcess.extend('NodeGetIpAddress', 'Get IP-Address', 'Core',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Get IP-Address");

		var availableInterfaces = new Array();
		if (typeof os !== 'undefined')
		{
			Object.keys(networkInterfaces).forEach(function (ifname)
			{
				var alias = 0;

				networkInterfaces[ifname].forEach(function (iface)
				{
					if ('IPv4' !== iface.family || iface.internal !== false)
					{
						// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
						return;
					}
					
					availableInterfaces.push(ifname);
				});
			});
		}

		availableInterfaces.push('DNS');
		
		this.createProperty('interface', wcPlay.PROPERTY.SELECT, '', {items: availableInterfaces, description: "NoDescriptionAvailable", input: true});
		this.createProperty('alternative', wcPlay.PROPERTY.STRING, '', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('result', wcPlay.PROPERTY.STRING, '', {description: "NoDescriptionAvailable", input: false, output: true});
	},

	onActivated: function(name)
	{
		this._super(name);

		var iface = this.property('interface');
		var address = 'unknown';
		if (typeof os !== 'undefined')
		{
			if (iface == 'DNS')
			{
				address = 'DNSERROR';
				dns.lookup(os.hostname(), function (err, add, fam)
				{
					address = add;
				});
			}
			else
			{
				if (!iface)
				{
					iface = this.property('alternative');
				}
				
				address = networkInterfaces[iface][0]['address'];
			}
			
			this.property('result', address);
		}

		this.activateExit('out');
	},
});

wcNodeProcess.extend('NodeUpdateRemoteStorage', 'Update Remote Storage', 'Core',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Sets a storage by using the same name");

		this.createProperty('local', wcPlay.PROPERTY.TOGGLE, true, {description: "If true, only matching Remote Event Nodes that are within, or nested within, the same Composite Node or scope will be activated."});
		this.createProperty('value', wcPlay.PROPERTY.STRING, '', { description: "NoDescriptionAvailable", input: true});
	},

	onActivated: function(name)
	{
		this._super(name);
		var value = this.property('value');

		var engine = this.engine();
		var scope = engine;
		if (this.property('local'))
		{
			scope = this._parent;
		}

		// Storage-Global - No Cast
		var remoteNodes = scope.nodesByClassName('wcNodeStorageGlobal');
		for (var i = 0; i < remoteNodes.length; ++i)
		{
			if (remoteNodes[i].name === this.name)
			{
				remoteNodes[i].property('value', value);
			}
		}
		
		// Storage-String - No Cast
		remoteNodes = scope.nodesByClassName('wcNodeStorageString');
		for (var i = 0; i < remoteNodes.length; ++i)
		{
			if (remoteNodes[i].name === this.name)
			{
				remoteNodes[i].property('value', value);
			}
		}
		
		// Storage-Number - Cast to integer
		remoteNodes = scope.nodesByClassName('wcNodeStorageNumber');
		for (var i = 0; i < remoteNodes.length; ++i)
		{
			if (remoteNodes[i].name === this.name)
			{
				remoteNodes[i].property('value', parseInt(value));
			}
		}
		
		value = value.toLowerCase();
		// Storage-Toggle - Cast to Boolean
		remoteNodes = scope.nodesByClassName('wcNodeStorageToggle');
		for (var i = 0; i < remoteNodes.length; ++i)
		{
			if (remoteNodes[i].name === this.name)
			{
				remoteNodes[i].property('value', ((value === 'true' || value === '1' || value === 'on') ? true : false));
			}
		}
	},
});