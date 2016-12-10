/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Hello World to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */
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

        session.attributes.recommendedPhones = phonesWithinBudget;

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
        var chosenPhone = allRecommendedPhones[chosenPhoneIndex]; 
        var chosenPhoneTitle = chosenPhone.title;

        var otherPhoneTitles = allRecommendedPhones.filter(function(elt, index) {
                return index !== chosenPhoneIndex;
            }).map(function(elt) {
                return elt.title;
            });
        
        session.attributes.phoneChoiceIntentState = "RemainingTwoPhones";
        
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