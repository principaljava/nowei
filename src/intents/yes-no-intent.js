module.exports = function(intent, session, response) {
    var yesOrNo = intent.slots.yesOrNo.value;

    var fromWhere = session.attributes.fromWhere;

    switch(fromWhere) {
        case "TwoRemainingPhones":
            handleTwoRemainingPhones();
            break;
    }

    ////////////////////////////////////////////////////////////////////////////
    function handleTwoRemainingPhones() {
        if (yesOrNo === "YES") {
            var phoneChoiceIntent = require('./phone-choice-intent');
            phoneChoiceIntent.handleLastPhone(intent, session, response);
        } else {
            response.tell("Alright. I'm sending a mail to you with the details of these recommended phones.\
            Have a great day!");
        }
    }
}