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
		case 'Sunday':
			day = 7;
			break;
	}
	
	return day;
}

function nextDay(day)
{
	if (day > 7)
		day = 1;

	var d = new Date;
	(day = (Math.abs(+day || 0) % 7) - d.getDay()) < 0 && (day += 7);
	return day && d.setDate(d.getDate() + day), d;
}

function calculateInterval(day, hours, minutes, seconds, milliseconds)
{
	var now = new Date();
	tmpDay = nextDay(day);
	tmpDay = new Date(tmpDay.getFullYear(), tmpDay.getMonth(), tmpDay.getDate(), hours, minutes, seconds, milliseconds);
	var interval = tmpDay - now;
	
	if (interval <= 0)
	{
		tmpDay = nextDay(day+1);
		tmpDay = new Date(tmpDay.getFullYear(), tmpDay.getMonth(), tmpDay.getDate(), hours, minutes, seconds, milliseconds);
		interval = tmpDay - now
	}
	
	return interval;
}

wcNodeEntry.extend('NodeEventDate', 'DateEvent', 'Events',
{
	init: function(parent, pos)
	{
		this._super(parent, pos);

		this.description('NoDescriptionAvailable');
		this.createProperty('day', wcPlay.PROPERTY.SELECT, 'Wednesday', {items: ['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], description: 'NoDescriptionAvailable', input: true});
		this.createProperty('time', wcPlay.PROPERTY.STRING, '23:00:00:0000', {description: 'NoDescriptionAvailable', input: true});
	},

	onActivated: function(name)
	{
		var now = new Date();
		var time = this.property('time').split(':');
		var day = getWeekdayAsInt(this.property('day'));
		
		if (day == 0)
		{
			day = now.getDay();
		}
		
		var interval = calculateInterval(day, time[0], time[1], time[2], time[3]);
		console.log('Interval: ' + interval/1000/60/60);
		
		this.resetThreads();

		var self = this;
		
		var timerFunction = function()
		{
			self.finishThread(timer);
			clearInterval(timer);
			
			self.activateExit('out');
			
			interval = calculateInterval(day, time[0], time[1], time[2], time[3]);
			timer = self.beginThread(setInterval(timerFunction, interval));
		}
		var timer = self.beginThread(setInterval(timerFunction, interval));
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
			this.resetThreads();
			this.onActivated();
		}
	},
});