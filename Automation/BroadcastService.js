/**************************************************************************
 * BROADCAST-SERVICE
 * Copyright (C) 2016 Raffael Holz aka LeGone - All Rights Reserved
 * http://www.legone.name
 *
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 **************************************************************************/
 
var ABroadcastService = dgram.createSocket("udp4");

ABroadcastService.on("message", function (msg, rinfo)
{
	var ABuffer = new Buffer(os.hostname());
	ABroadcastService.send(ABuffer, 0, ABuffer.length, rinfo.port, rinfo.address);
});

ABroadcastService.on("listening", function ()
{
	var address = ABroadcastService.address();
});

ABroadcastService.bind(2562);