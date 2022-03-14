var httpMod = require('https');

module.exports = function (context, IoTHubMessages) {
    context.log(`JavaScript eventhub trigger function called for message array: ${IoTHubMessages}`);

    var count = 0;
    var totalTemperature = 0.0;
    var totalHumidity = 0.0;
    var deviceId = "";

    IoTHubMessages.forEach(message => {

        count++;
        totalTemperature += message.temperature;
        context.log(`Processed message totalTemperature: ${totalTemperature}`);
        totalHumidity += message.humidity;
        context.log(`Processed message totalHumidity: ${totalHumidity}`);

    });

    var timeStamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var temp1 = totalTemperature/count;
    var humid1 = totalHumidity/count;
   

    const body = JSON.stringify({
        TIME_STAMP: timeStamp,
        TEMPERATURE: temp1,
        HUMIDITY: humid1
    })

    const options = {
        hostname: '<<OData Endpoint>>',
        port: 443,
        path: '/devices.xsodata/signals',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': body.length,
            'Accept': '*/*'
        }
    }

    var response = '';
    const customReq = httpMod.request(options, (res) => {
        context.log(`statusCode: ${res.statusCode}`)

        res.on('data', (d) => {
            response += d;
        })

        res.on('end', (d) => {
            context.res = {
                body: response
            }
            context.done();
        })
    })
    customReq.on('error', (error) => {
        context.log.error(error)
        context.done();
    })

    customReq.write(body);
    customReq.end();
};
