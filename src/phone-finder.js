var jsonQuery = require('json-query')
var jsonfile = require('jsonfile');

function makeRecommendations(minBudget, maxBudget, os, memory){
    var phones = require('./phoneData')
    
    //query budget
    // Add 10% to be cheeky
    //budget = (budget*100)*1.05;

    minBudget = minBudget * 100;
    maxBudget = maxBudget * 100;

    budgetFiltered = jsonQuery('phones[* price >= '+ minBudget + ' & price <= ' + maxBudget + ']'
                                , {data: phones}).value;
    
    //query OS

    //jsonQuery('phones[*os=IOS]', {data: phones}).value

    return budgetFiltered;

    //query memory
}

function formatData (){
    var rawPhones = require('./rawjson/phonesDump')._payload.values;

    var phones = [];

    console.log("Formatting data");

    for(i = 0; i<rawPhones.length; i++){
        var phone = rawPhones[i];

        if (phone.title === "TEST FRAUD" || phone.title === "TEST TRANSACT"){
            continue;
        }

        var updatedPhone = {
            title: "",
            price: "",
            os: "",
            memory: "",
            colors: []
        };

        // Handle title
        updatedPhone.title = phone.title + " " + phone.memory;

        // Handle cost
        updatedPhone.price = parseInt(phone.price);

        // Handle OS
        updatedPhone.os = phone.make_name === "Apple" ? "IOS" : "Android";

        // Handle memory
        updatedPhone.memory = phone.memory;

        // Check if its a repeat phone
        if (i > 0) {
            var prevPhoneTitle = rawPhones[i-1].title + " " + rawPhones[i-1].memory;
        }if (i > 0 && updatedPhone.title !== prevPhoneTitle){
            // If not a repeat
            updatedPhone.colors.push(phone.color)
            phones.push(updatedPhone);
        } else if ( i > 0 ){ 
            // If a repeat, add color
            phones[phones.length-1].colors.push(phone.color);
        }
    }

    function priceSort(a,b) {
    if (a.price > b.price)
        return -1;
    if (a.price < b.price)
        return 1;
    return 0;
    }
    phones.sort(priceSort)

    jsonData = {phones: phones};

    var file = 'phoneData.json';
    jsonfile.writeFile(file, jsonData, {spaces: 2}, function(err) {
        console.error(err);
    })
};


module.exports = {
    makeRecommendations: makeRecommendations,
    formatData : formatData
}
