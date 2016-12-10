var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var format = require('string-format');

/**
 * HelloWorld is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HelloWorld = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HelloWorld.prototype = Object.create(AlexaSkill.prototype);
HelloWorld.prototype.constructor = HelloWorld;

HelloWorld.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HelloWorld onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

HelloWorld.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to gif gaff phone finder. What is your budget";
    var repromptText = "What is your budget";
    response.ask(speechOutput, repromptText);
};

HelloWorld.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("HelloWorld onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

var phoneChoiceIntent = require('./intents/phone-choice-intent');
var yesNoIntent = require('./intents/yes-no-intent');

HelloWorld.prototype.intentHandlers = {
    // register custom intent handlers
    "BudgetIntent": function(intent, session, response) {
        var maxBudget = intent.slots.maximumBudget.value;
        var minBudget = intent.slots.minimumBudget.value;
        
        session.attributes.minBudget = minBudget;
        session.attributes.maxBudget = maxBudget;

        var phoneFinder = require('./phone-finder');

        var phonesWithinBudget = phoneFinder.makeRecommendations(maxBudget);

        var responseString = 
            "I have found {phoneCount} phones for you. \
            The top 3 recommended phones are {phone1Title}, \
            {phone2Title}, and {phone3Title}. Say 1, 2 and 3 to hear some \
            details about the corresponding phone";

        var responseDetails = {
            phoneCount: phonesWithinBudget.length,
            phone1Title: phonesWithinBudget[0].title,
            phone2Title: phonesWithinBudget[1].title,
            phone3Title: phonesWithinBudget[2].title,
        };

        responseString = format(responseString, responseDetails);

        session.attributes.recommendedPhones = [
            phonesWithinBudget[0],
            phonesWithinBudget[1],
            phonesWithinBudget[2]
        ];

        response.ask(responseString);
    },
    "PhoneChoiceIntent": function(intent, session, response) {
        var chosenPhone = intent.slots.chosenPhone.value;

        var chosenPhoneIndex = 0;

        switch (chosenPhone) {
            case "ONE":
                chosenPhoneIndex = 0;
                break;
            case "TWO":
                chosenPhoneIndex = 1;
                break;
            case "THREE":
                chosenPhoneIndex = 2;
                break;
            default:
                chosenPhoneIndex = 0;
                break;
        }

        var allRecommendedPhones = session.attributes.recommendedPhones;
        allRecommendedPhones[chosenPhoneIndex].hasAlexaReadThis = true;

        var otherPhones = allRecommendedPhones.filter(function(elt, index) {
                return index !== chosenPhoneIndex;
            });

        if (session.attributes.primaryInterestPhoneIndex !== undefined) {
            handleRemainingTwoPhones();
            return;
        }

        var chosenPhone = allRecommendedPhones[chosenPhoneIndex]; 
        var chosenPhoneTitle = chosenPhone.title;

        var otherPhoneTitles = otherPhones.map(function(elt) {
                return elt.title;
            });

        session.attributes.primaryInterestPhoneIndex = chosenPhoneIndex;

        var responseString = 
            "Great! You chose to find some more details about {title}.\
            {title} costs {price} pounds, \
            runs on {os}, \
            and comes in {colorsCount} colours, \
            {colors}. So, do you want to know the details of the other 2 phones: {otherPhones}.\
            Say 1 or 2 to know the details of the corresponding phone.";

        responseString = format(responseString, {
            title: chosenPhoneTitle,
            price: (chosenPhone.price / 100) | 0,
            os: chosenPhone.os,
            colorsCount: chosenPhone.colors.length,
            colors: chosenPhone.colors.splice(0, chosenPhone.colors.length - 1).join(', ') +
                        " and " + chosenPhone.colors[chosenPhone.colors.length - 1],
            otherPhones: otherPhoneTitles.join(', and ')
        });
        response.ask(responseString);

        ////////////////////////////////////////
        function handleRemainingTwoPhones() {
            var remainingPhones = allRecommendedPhones.filter(function(elt, index) {
                return index !== session.attributes.primaryInterestPhoneIndex;
            });

            var chosenPhone = remainingPhones[chosenPhoneIndex];
            chosenPhone.hasAlexaReadThis = true;

            var theOtherPhone = remainingPhones.filter(function(elt, index) {
                return index !== chosenPhoneIndex;
            })[0];

            var responseString = 
                "{title} costs {price} pounds, \
                runs on {os}, \
                and comes in {colorsCount} colours, \
                {colors}. So, do you want to know the details of the last one recommended phone too: {otherPhoneTitle}?";

            session.attributes.fromWhere = "TwoRemainingPhones";

            responseString = format(responseString, {
                title: chosenPhone.Title,
                price: (chosenPhone.price / 100) | 0,
                os: chosenPhone.os,
                colorsCount: chosenPhone.colors.length,
                colors: chosenPhone.colors.splice(0, chosenPhone.colors.length - 1).join(', ') +
                            " and " + chosenPhone.colors[chosenPhone.colors.length - 1],
                otherPhoneTitle: theOtherPhone.title
            });
            response.ask(responseString);
        }
    },
    "YesNoIntent": function(intent, session, response) {
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
                var allRecommendedPhones = session.attributes.recommendedPhones;
                var theLastPhone = allRecommendedPhones.find(function(elt) {
                    return elt.hasAlexaReadThis !== true;
                });

                var responseString = 
                    "{title} costs {price} pounds, \
                    runs on {os}, \
                    and comes in {colorsCount} colours, \
                    {colors}.";

                responseString = format(responseString, {
                    title: theLastPhone.title,
                    price: (theLastPhone.price / 100) | 0,
                    os: theLastPhone.os,
                    colorsCount: theLastPhone.colors.length,
                    colors: theLastPhone.colors.splice(0, theLastPhone.colors.length - 1).join(', ') +
                                " and " + theLastPhone.colors[theLastPhone.colors.length - 1]
                });
                response.tell(responseString);
            } else {
                response.tell("Alright. I'm sending a mail to you with the details of these recommended phones.\
                Have a great day!");
            }
        }
    },
    "TestIntent": function(intent, session, response) {
        response.tell("here is it " + session.attributes.minBudget);
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say hello to me!", "You can say hello to me!");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var helloWorld = new HelloWorld();
    helloWorld.execute(event, context);
};