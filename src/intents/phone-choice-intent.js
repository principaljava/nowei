module.exports = {
    main: function(intent, session, response) {
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

            responseString = format(responseString, {
                title: chosenPhoneTitle,
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
    handleLastPhone: function(intent, session, response) {
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
    }
}