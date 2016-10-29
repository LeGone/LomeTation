/**************************************************************************
 * EVENTS
 * Copyright (C) 2016 Raffael Holz aka LeGone - All Rights Reserved
 * http://www.legone.name
 *
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 **************************************************************************/
 
function getWeekdayAsInt(day)
{
	switch (day)
	{
		case 'Everyday':
			day = -1;
			break;
		case 'Sunday':
			day = 0;
			break;
		case 'Monday':
			day = 1;
			break;
		case 'Tuesday':
			day = 2;
			break;
		case 'Wednesday':
			day = 3;
			break;
		case 'Thursday':
			day = 4;
			break;
		case 'Friday':
			day = 5;
			break;
		case 'Saturday':
			day = 6;
			break;
	}
	
	return day;
}

wcPlayNodes.wcNodeEntry.extend('NodeEventDate', 'DateEvent', 'Events',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description('NoDescriptionAvailable');
		this.createProperty('day', wcPlay.PROPERTY.SELECT, 'Everyday', {items: ['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], description: 'NoDescriptionAvailable', input: true});
		this.createProperty('hour', wcPlay.PROPERTY.NUMBER, -1, {description: '-1 for every hour', input: true});
		this.createProperty('minute', wcPlay.PROPERTY.NUMBER, 5, {description: '-1 for every minute', input: true});
	},

	onActivated: function(name)
	{
		var Day = getWeekdayAsInt(this.property('day'));
		var Hour = this.property('hour');
		var Minute = this.property('minute');

		var Self = this;
		
		var Rule = new Schedule.RecurrenceRule();
		if (Day > -1)
		{
			Rule.dayOfWeek = Day;
		}
		if (Hour > -1)
		{
			Rule.hour = Hour;
		}
		if (Minute > -1)
		{
			Rule.minute = Minute;
		}

		var j = Schedule.scheduleJob(Rule, function()
		{
			Self.activateExit('out');
		});

		// j.cancel();
	},

	onStart: function()
	{
		this._super();

		this.onActivated();
	},

	onPropertyChanged: function(name, oldValue, newValue)
	{
		this._super(name, oldValue, newValue);

		if (name === 'day' || name === 'time')
		{
			this.onActivated();
		}
	},
});