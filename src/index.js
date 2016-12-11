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
 */
var HelloWorld = function () {
    AlexaSkill.call(this, APP_ID);
};

var states = {
    LAST_PHONE_READ: 'LAST_PHONE_READ',
    ONLY_PHONE_AVAILABLE: 'ONLY_PHONE_AVAILABLE',
    ONE_PHONE_REMAINING: 'ONE_PHONE_REMAINING'
};

function colorsToString(colors) {
    var colorsCountString = colors.length === 1
                            ? " colour " : " colours ";

    var colorsCount = colors.length;

    var colorsString = colors.length === 1
                        ? colors[0]
                        : colors.splice(0, colors.length - 1).join(', ') +
                            " and " + colors[colors.length - 1];
                            
    return colorsCount + colorsCountString + ": " + colorsString;
}

function phoneTitlesToString(titles) {
    var titlesString = titles.length === 1
                        ? titles[0]
                        : titles.splice(0, titles.length - 1).join(', ') +
                            " and " + titles[titles.length - 1];

    return titlesString;
}

function readPhones(intent, session, response, chosenPhoneIndex) {
    var allRecommendedPhones = session.attributes.recommendedPhones;

    if (chosenPhoneIndex === undefined) {
        chosenPhoneIndex = 0;
    }
    
    var unreadPhones = allRecommendedPhones.filter(function(elt, index) {
        return !elt.hasAlexaReadThis;
    });

    var remainingPhones = unreadPhones.filter(function(elt,index) {
        return index !== chosenPhoneIndex;
    });

    var remainingPhonesTitles = remainingPhones.map(function(elt) {
        return elt.title;
    });
    
    if (unreadPhones.length === 0) {
        response.ask("I think either me or yourself lost track of the conversation.\
        Sorry, we have to begin from the first step. What is your budget again?");
        return;
    }

    var thePhoneToReadAbout = unreadPhones[chosenPhoneIndex];
    thePhoneToReadAbout.hasAlexaReadThis = true;

    var responseData = {
            title: thePhoneToReadAbout.title,
            price: (thePhoneToReadAbout.price / 100) | 0,
            os: thePhoneToReadAbout.os,
            colors: colorsToString(thePhoneToReadAbout.colors),
            otherPhones: phoneTitlesToString(remainingPhonesTitles)
        };
    
    var responsePhoneDetails = format("\
        {title} costs {price} pounds, \
            runs on {os}, \
            and comes in {colors}", responseData);

    if (session.attributes.readPhoneTitles === undefined) {
        session.attributes.readPhoneTitles = [];
    }
    session.attributes.readPhoneTitles.push(thePhoneToReadAbout.title);

    if (unreadPhones.length === 3) {
        response.ask(format(
            "Great! You chose to find some more details about {title}. " + responsePhoneDetails + 
            ". So, do you want to know the details of the other 2 phones: {otherPhones}.\
            Say 1 or 2 to know the details of the corresponding phone.", responseData));
    } else if (unreadPhones.length === 2) {
        session.attributes.fromWhere = states.ONE_PHONE_REMAINING;
        response.ask(format(
            (allRecommendedPhones.length === 2 ? "Great! You chose to find some more details about {title}. " : "") +
            responsePhoneDetails + 
            ". Do you want to know the details of the one other phone: {otherPhones}?", responseData));
    } else if (unreadPhones.length === 1) {
        session.attributes.lastInterestPhoneTitle = thePhoneToReadAbout.title;
        session.attributes.fromWhere = states.LAST_PHONE_READ;
        response.ask(
            (allRecommendedPhones.length === 1 ? "You seem interested. Brilliant! " : "") + 
            responsePhoneDetails +
            ". That was the last of the recommended phones for your budget. Do you want to try a different budget \
            to know the details of some more phones?");
    }
}

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

    var speechOutput = [];

    speechOutput.push("Hi There. I'm Santi, I think I'm a product owner at gif gaff. I doubt it or may not. \
    I may be or definitely I am. Whatever it comes, I'm not a product owner. Oops, I am. You see I'm already tired.\
    I'm asked by Hazel to find your lost phone. Oh. What Hazel. Alright. Sorry, I'm asked to find a new phone for you \
    within your budget. What is your budget?");

    speechOutput.push("Hi There. I'm Hazel, scrum master at gif gaff, usually busy writing meeting notes that nobody\
    cares. And always curling my hair in the air for no reason. I'm tired with my team, especially the phones team. \
    So, I have taken a break today, and\
    helping people find a suitable new phone within their budget. What is your budget?");

    speechOutput.push("Hi There. I'm Prasheen, basically I'm an architect at gif gaff, basically attend too many meetings,\
    basically draw some diagrams that nobody pays attention to, \
    basically you see I'm tired of myself. So I have basically taken a break today, and \
    basically helping people find a suitable new phone within their budget. Basically, What is your budget?");

    speechOutput.push("Hi There. I'm Chris, Chief Swearing officer at gif gaff. Don't worry, I won't fucking swear at\
    you today. Wonder why I'm here. I have been expelled by John from my fucking job for a day that his ears are literally bleeding \
    hearing my swears this morning about fucking p g s. So I have taken a fucking break today, and \
    helping people find a suitable fucking new phone within their budget. What is your fucking budget?");

    var repromptText = "What is your budget";
    var randomNum = Math.floor(Math.random() * 4) + 1;

    response.ask(speechOutput[randomNum - 1], repromptText);
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
        var aroundBudget = intent.slots.aroundBudget.value;

        if (!minBudget) minBudget = 0;
        
        if (aroundBudget !== undefined) {
            minBudget = (aroundBudget * 0.75) | 0;
            maxBudget = (aroundBudget * 1.25) | 0;
        }

        session.attributes.minBudget = minBudget;
        session.attributes.maxBudget = maxBudget;

        var phoneFinder = require('./phone-finder');

        var phonesWithinBudget = phoneFinder.makeRecommendations(minBudget, maxBudget);

        if (phonesWithinBudget.length === 0) {
            response.ask("Sorry, we at gif gaff do not sell any phones within your budget at the moment. \
            Tell me a different budget to search for.");
            return;
        }

        if (phonesWithinBudget.length === 1) {
            var theOnlyPhone = phonesWithinBudget[0];

            session.attributes.fromWhere = states.ONLY_PHONE_AVAILABLE;
            session.attributes.recommendedPhones = phonesWithinBudget;

            response.ask(
                format("I have found one phone for you: \
                        {title}. Do you want to know the details of this phone?", theOnlyPhone));
            return;
        }

        var responseString = "";
        var responseDetails = {};

        if (phonesWithinBudget.length === 2) {
            responseString = 
                "I have found 2 phones for you: \
                {phone1Title}, {phone2Title}. Say 1, or 2 to hear the \
                details about the corresponding phone";

            responseDetails = {
                phone1Title: phonesWithinBudget[0].title,
                phone2Title: phonesWithinBudget[1].title
            };

            responseString = format(responseString, responseDetails);

            session.attributes.recommendedPhones = phonesWithinBudget;
            response.ask(responseString);
            return;
        }

        responseString = 
            "I have found {phoneCount} phones for you. \
            The top 3 recommended phones are {phone1Title}, \
            {phone2Title}, and {phone3Title}. Say 1, 2 or 3 to hear some \
            details about the corresponding phone";

        responseDetails = {
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
        var chosenPhone = intent.slots.chosenPhone.value.toUpperCase();

        var chosenPhoneIndex = 0;

        switch (chosenPhone) {
            case "1":
                chosenPhoneIndex = 0;
                break;
            case "2":
                chosenPhoneIndex = 1;
                break;
            case "3":
                chosenPhoneIndex = 2;
                break;
            default:
                chosenPhoneIndex = 0;
                break;
        }

        readPhones(intent, session, response, chosenPhoneIndex);
    },
    "YesNoIntent": function(intent, session, response) {
        var yesOrNo = intent.slots.yesOrNo.value.toUpperCase();

        var fromWhere = session.attributes.fromWhere;

        session.attributes.fromWhere = null;

        switch(fromWhere) {
            case states.ONLY_PHONE_AVAILABLE:
            case states.ONE_PHONE_REMAINING:
                handleOnePhone();
                break;
            case states.LAST_PHONE_READ:
                handleLastPhoneRead();
                break;
        }

        ////////////////////////////////////////////////////////////////////////////
        function handleOnePhone() {
            if (yesOrNo === "YES") {
                readPhones(intent, session, response);
            } else {
                response.tell(
                    "Alright. I'm sending a mail to you with the details of these recommended phones.\
                    Have a great day!");
            }
        }

        function handleLastPhoneRead() {
            if (yesOrNo === "YES") {
                session.attributes.recommendedPhones = null;
                response.ask("Excellent! Lets do this again. What is your revised budget?");
            } else {
                response.tell(
                    "Alright. I'm sending a mail to you with the details of these recommended phones.\
                    Have a great day!");
            }
        }
    },
    "TestIntent": function(intent, session, response) {
        var phoneChoice = intent.slots.phoneChoice.value.toUpperCase();

        var responseString = "";

        switch (phoneChoice) {
            case "ONE":
                responseString = "you said one";
                break;
            case "TWO":
                responseString = "you said two";
                break;
            case "THREE":
                responseString = "you said three";
                break;
            case "1":
                responseString = "You said numeric one";
                break;
            default:
                responseString = "Nothing matched";
                break;
        }
        response.tell(responseString);
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