// load aws sdk
var aws = require('aws-sdk');

// load aws config
aws.config.loadFromPath('config.json');

// load AWS SES
var ses = new aws.SES({apiVersion: '2010-12-01'});

// send to list
var to = ['ravia@giffgaff.co.uk']

// this must relate to a verified SES account
var from = 'ravia@giffgaff.co.uk'


// this sends the email
ses.sendEmail( {
    Source: from,
    Destination: { ToAddresses: to },
    Message: {
        Subject:Source {
    Data: 'Thanks from giffgaff phones team'
},
Body: {
    Text: {
        Data: 'Hello world',
    }
}
}
}
, function(err, data) {
    if(err) throw err
    console.log('Email sent:');
    console.log(data)console;
});