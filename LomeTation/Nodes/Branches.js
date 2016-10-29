/**************************************************************************
 * BRANCHES
 * Copyright (C) 2016 Raffael Holz aka LeGone - All Rights Reserved
 * http://www.legone.name
 *
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 **************************************************************************/
 
wcPlayNodes.wcNodeProcess.extend('NodeBranch', 'Compare', 'Branches',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);

    this.description('Branch');
	
    this.removeExit('out');
    this.createExit('yes', 'NoDescriptionAvailable');
    this.createExit('no', 'NoDescriptionAvailable');
	
    this.createProperty('valueA', wcPlay.PROPERTY.STRING, '', {description: "Left hand value for the operation.", input: true});
    this.createProperty('valueB', wcPlay.PROPERTY.STRING, '', {description: "Right hand value for the operation.", input: true});
	this.createProperty('comparer', wcPlay.PROPERTY.SELECT, '==', {items: ['==', '>=', '>'], description: "NoDescriptionAvailable", input: true});
  },

  onActivated: function(name)
  {
    this._super(name);
	var a, b;
	var comparer = this.property('comparer');
	
	a = parseFloat(this.property('valueA'));
	b = parseFloat(this.property('valueB'));
	
	if (isNaN(a))
	{
		a = this.property('valueA');
	}
	
	if (isNaN(b))
	{
		b = this.property('valueB');
	}

    switch (comparer)
	{
		case '==':
			if (a == b)
			{
				this.activateExit('yes');
			}
			else
			{
				this.activateExit('no');
			}
			break;
		case '>=':
			if (a >= b)
			{
				this.activateExit('yes');
			}
			else
			{
				this.activateExit('no');
			}
			break;
		case '>':
			if (a > b)
			{
				this.activateExit('yes');
			}
			else
			{
				this.activateExit('no');
			}
			break;
    }
  },
});

wcPlayNodes.wcNodeProcess.extend('NodeBranchMultiEquals', 'MultiEquals', 'Branches',
{
  init: function(parent, pos)
  {
    this._super(parent, pos);

    this.description('Branch');
	
    this.removeExit('out');
    this.createExit('yes', 'NoDescriptionAvailable');
    this.createExit('no', 'NoDescriptionAvailable');
	
    this.createProperty('input', wcPlay.PROPERTY.STRING, '', {description: "NoDescriptionAvailable", input: true});
    this.createProperty('equals', wcPlay.PROPERTY.STRING, '', {description: "NoDescriptionAvailable", input: true});
  },

  onActivated: function(name)
  {
    this._super(name);
	var input, equals;
	var words = [];
	var found = false;
	
	input = this.property('input');
	equals = this.property('equals');

	words = equals.split(',');
	for (var i = 0; i < words.length; i++)
	{
		if (words[i] === input)
		{
			found = true;
			break;
		}
	}

	if (found)
	{
		this.activateExit('yes');
	}
	else
	{
		this.activateExit('no');
	}
  },
});