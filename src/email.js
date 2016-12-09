var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "ravi.alleddulla@gmail.com",
        pass: "kurn00l1AP"
    }
});

smtpTransport.sendMail({
    from: "giffgaff <ravia@giffgaff.co.uk>", // sender address
    to: "ravia<ravia@giffgaff.co.uk>", // comma separated list of receivers
    subject: "Mail from giffgaff phones team", // Subject line
    text: "Hello world" // attach list of phones to be sent here
}, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Mail sent: " + response.message);
    }
});

