/**************************************************************************
 * BROADCAST-SERVICE
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