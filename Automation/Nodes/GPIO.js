/**************************************************************************
 * GPIO
 * Copyright (C) 2016 Raffael Holz aka LeGone - All Rights Reserved
 * http://www.legone.name
 *
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 **************************************************************************/
 
wcNodeProcess.extend('NodeGPIOPinMode', 'GPIO Pin Mode', 'GPIO',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);

    this.description("Sets the pinmode for a pin");

    this.createProperty('pin', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('mode', wcPlay.PROPERTY.SELECT, 'INPUT', {items: ['INPUT', 'OUTPUT', 'PWM_OUTPUT', 'GPIO_CLOCK', 'SOFT_PWM_OUTPUT', 'SOFT_TONE_OUTPUT'], description: "NoDescriptionAvailable", input: true});
  },

  onActivated: function(name)
  {
    this._super(name);

	var pin = this.property('pin');
	var mode = 'wpi.' + this.property('mode');

	if (typeof wpi !== 'undefined')
	{
		wpi.pinMode(pin, eval(mode));
	}
	
    this.activateExit('out');
  },
});

wcNodeProcess.extend('NodeGPIOPullUpDnControl', 'GPIO Pull Up/Dn Control', 'GPIO',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);

    this.description("Controls the Pull-up Resistor for a specific pin");

    this.createProperty('pin', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('mode', wcPlay.PROPERTY.SELECT, 'PUD_OFF', {items: ['PUD_OFF', 'PUD_DOWN', 'PUD_UP'], description: "NoDescriptionAvailable", input: true});
  },

  onActivated: function(name)
  {
    this._super(name);

	var pin = this.property('pin');
	var mode = 'wpi.' + this.property('mode');

	if (typeof wpi !== 'undefined')
	{
		wpi.pullUpDnControl(pin, eval(mode));
	}
	
    this.activateExit('out');
  },
});


wcNodeProcess.extend('NodeGPIOWriteDigital', 'GPIO Write Digital', 'GPIO',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);

    this.description("Sets the pin to HI or LO");

    this.createProperty('pin', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('value', wcPlay.PROPERTY.TOGGLE, false, {description: "NoDescriptionAvailable", input: true});
  },

  onActivated: function(name)
  {
    this._super(name);
	
	var pin = this.property('pin');
	var value = this.property('value');
	if (typeof wpi !== 'undefined')
	{
		wpi.digitalWrite(pin, value ? 1 : 0);
	}
	
    this.activateExit('out');
  },
});

wcNodeProcess.extend('NodeGPIOReadDigital', 'GPIO Read Digital', 'GPIO',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);

    this.description("Checks the state of a pin");

    this.removeExit('out');
    this.createExit('hi');
    this.createExit('lo');

    this.createProperty('pin', wcPlay.PROPERTY.NUMBER, 1, {description: "NoDescriptionAvailable", input: true});
  },

  onActivated: function(name)
  {
    this._super(name);

    var pin = this.property('pin');
	var value = 0;
	
	if (typeof wpi !== 'undefined')
	{
		value = wpi.digitalRead(pin);
	}
	
    if (value == 1)
	{
      this.activateExit('hi');
    }
	else
	{
      this.activateExit('lo');
    }
  },
});

wcNodeProcess.extend('NodeGPIOWritePWM', 'GPIO Write PWM', 'GPIO',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);

    this.description("Writes the value to the PWM register for the given pin.");

    this.createProperty('pin', wcPlay.PROPERTY.NUMBER, 0, {description: "NoDescriptionAvailable", input: true});
    this.createProperty('value', wcPlay.PROPERTY.NUMBER, 0, {min: 0, max: 1024, description: "NoDescriptionAvailable", input: true});
  },

  onActivated: function(name)
  {
    this._super(name);
	
	var pin = this.property('pin');
	var value = this.property('value');
	if (typeof wpi !== 'undefined')
	{
		wpi.pwmWrite(pin, value);
	}
	
    this.activateExit('out');
  },
});