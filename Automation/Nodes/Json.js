/**************************************************************************
 * JSON
 **************************************************************************/

wcNodeProcess.extend('NodeJson1v', 'Json-1v-en/decode', 'Json',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description("Json-SetValue");
		
		this.createEntry('encode');
		this.createEntry('decode');
		this.removeEntry('in');
		
		this.createExit('encoded');
		this.createExit('decoded');
		this.createExit('error');
		this.removeExit('out');

		this.createProperty('encodejson', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('decodejson', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('room', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('type', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('value', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: true});
		this.createProperty('encoded', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: false, output: true});
		this.createProperty('decoded', wcPlay.PROPERTY.STRING, '', {description: 'NoDescriptionAvailable', input: false, output: true});
	},

	onActivated: function(name)
	{
		var error = false;
		
		var room = this.property('room');
		var type = this.property('type');
		var value = this.property('value');
		
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
			
			if (!json[room].hasOwnProperty(type))
			{
				json[room][type] = {};
			}
			
			json[room][type][this.name] = value;
			
			/* Only if more than one value
			var attributes = {};
			attributes['value'] = value;
			json[room][this.name] = attributes;
			*/
			
			this.property('encoded', JSON.stringify(json));
			this.activateExit('encoded');
		}
		else
		{
			var jsonString = this.property('decodejson');
			var json = JSON.parse(jsonString);
			
			if (json.hasOwnProperty(room))
			{
				if (json[room].hasOwnProperty(type))
				{
					this.property('decoded', json[room][type][this.name]);
					this.activateExit('decoded');
				}
			}
		}
		
		if (error)
		{
			this.activateExit('error');
		}
	},
});