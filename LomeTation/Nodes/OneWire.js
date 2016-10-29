wcPlayNodes.wcNodeProcess.extend('OneWireTemperature', 'Receive OneWire Temperature', 'OneWire',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Encode/decode DMX to/from Json");
		
		this.createExit('error');

		this.createProperty('device', wcPlay.PROPERTY.STRING, '/dev/ttyUSB0', {description: "NoDescriptionAvailable", input: true});
		this.createProperty('number', wcPlay.PROPERTY.NUMBER, 0, {description: "Slot number of device", input: true});
		this.createProperty('temperature', wcPlay.PROPERTY.NUMBER, 0, {description: "The temperature", input: false, output: true});
	},

	onActivated: function(Name)
	{
		Self = this;
		var Child = ExecChildProcess('digitemp_DS9097U -s ' + this.property('device') + ' -o"%.2C" -t ' + this.property('number'), function(err, stdout, stderr)
		{
			var Lines = stdout.split('\n');
			if (Lines.length > 3)
			{
				Self.property('temperature', Number(Lines[2]));
				Self.activateExit('out');
			}
			else
			{
				Self.activateExit('error');
			}
		});
	},
});

wcPlayNodes.wcNodeProcess.extend('OneWireTemperatureInitialize', 'Initialize OneWire Temperature', 'OneWire',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Initialize Digitemp");
		
		this.createExit('error');

		this.createProperty('device', wcPlay.PROPERTY.STRING, '/dev/ttyUSB0', {description: "NoDescriptionAvailable", input: true});
	},

	onActivated: function(Name)
	{
		Self = this;
		var Child = ExecChildProcess('digitemp_DS9097U -s ' + this.property('device') + ' -i', function(err, stdout, stderr)
		{
			Self.activateExit('out');
		});
	},
});