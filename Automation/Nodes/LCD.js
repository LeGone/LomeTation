/**************************************************************************
 * DISPLAY
 **************************************************************************/
wcNodeProcess.extend('NodeLCDInit', 'LCD-Init', 'LCD',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);

    this.description("Initialize LCD");

    this.createProperty('rows', wcPlay.PROPERTY.NUMBER, 2, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('cols', wcPlay.PROPERTY.NUMBER, 16, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('bits', wcPlay.PROPERTY.NUMBER, 4, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('rs', wcPlay.PROPERTY.NUMBER, 7, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('strb', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('d0', wcPlay.PROPERTY.NUMBER, 2, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('d1', wcPlay.PROPERTY.NUMBER, 3, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('d2', wcPlay.PROPERTY.NUMBER, 1, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('d3', wcPlay.PROPERTY.NUMBER, 4, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('d4', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('d5', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('d6', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('d7', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('handle', wcPlay.PROPERTY.NUMBER, 0, {description: "The handle of the LCD.", output: true});
  },

  onActivated: function(name)
  {
    this._super(name);
	
	var handle = 0;
	if (typeof wpi !== 'undefined')
	{
		handle = wpi.lcdInit(
							this.property('rows'), 
							this.property('cols'),  
							this.property('bits'),
							this.property('rs'), 
							this.property('strb'), 
							this.property('d0'), 
							this.property('d1'), 
							this.property('d2'), 
							this.property('d3'), 
							this.property('d4'), 
							this.property('d5'), 
							this.property('d6'), 
							this.property('d7'));
	}
	this.property('handle', handle);
	
    this.activateExit('out');
  },
});

wcNodeProcess.extend('NodeLCDText', 'LCD-SetText', 'LCD',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);
    this.description("Change LCD-text");
    this.createProperty('handle', wcPlay.PROPERTY.NUMBER, 0, {description: "The handle of the LCD.", input: true});
    this.createProperty('text', wcPlay.PROPERTY.STRING, '', {multiline: true, description: "The Text for the LCD.", input: true});
  },

  onActivated: function(name) {
    this._super(name);
	
	var handle = this.property('handle');
	var text = this.property('text');
	if (typeof wpi !== 'undefined')
	{
		wpi.lcdClear(handle);
		wpi.lcdPrintf(handle, text);
	}
	
    this.activateExit('out');
  },
});

wcNodeProcess.extend('NodeLCDDisplay', 'LCD-Display', 'LCD',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);
    this.description("Change Display-State");
    this.createProperty('handle', wcPlay.PROPERTY.NUMBER, 0, {description: "The handle of the LCD.", input: true});
    this.createProperty('active', wcPlay.PROPERTY.TOGGLE, true, {description: "Display the LCD?", input: true});
  },

  onActivated: function(name)
  {
    this._super(name);
	
	var handle = this.property('handle');
	var active = this.property('active');
	if (typeof wpi !== 'undefined')
	{
		wpi.lcdDisplay(handle, active ? 1 : 0);
	}
	
    this.activateExit('out');
  },
});

wcNodeProcess.extend('NodeLCDClear', 'LCD-Clear', 'LCD',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);
    this.description("Clear Display");
    this.createProperty('handle', wcPlay.PROPERTY.NUMBER, 0, {multiline: true, description: "The handle of the LCD.", input: true});
  },

  onActivated: function(name)
  {
    this._super(name);
	
	var handle = this.property('handle');
	if (typeof wpi !== 'undefined')
	{
		wpi.lcdClear(handle);
	}
	
    this.activateExit('out');
  },
});
