var https = require('https');
var qs = require('querystring');
var AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
    try{
        console.log(JSON.stringify(event));
    
        // Lauch Request
        if (event.request.type == 'LaunchRequest') {
            // Initialize Session
            callback(null, reprompt("Let's Play Carta Game! Are you ready? Say Next."));
        
        // Session End
        }else if(event.request.type == 'SessionEndedRequest'){
            callback(null, endSession("Good bye"));
        
        // Pause Intent
        }else if(event.request.intent.name == 'AMAZON.PauseIntent'){
            callback(null, endSession("Pause the Game"));
        
        // Resume Intent
        }else if(event.request.intent.name == 'AMAZON.ResumeIntent'){
            callback(null, endSession("Restart the Game"));
        
        // Stop Intent
        }else if(event.request.intent.name == 'AMAZON.StopIntent'){
            callback(null, endSession("See you"));
        
        // Next Intent
        }else{
            // Get Next Carta
            var done = {};
            var count = 0;
            if(event.session.attributes.done){
                done = event.session.attributes.done;
                count = event.session.attributes.count;
            }
            var num = 0;
            do{
                num = Math.floor( Math.random() * process.env.max) + 1;
                num = ( '000' + num ).slice( -3 );
                console.log(`Number=${num}`);
            }while(done[num]);
            done[num] = true;
            count++;
            if(count < process.env.max){
                callback(null, response(done, count, num));
            }else{
                callback(null, final(num));
            }

        }
    } catch (err) {
        console.log(err);
        callback(err);
    }
};  

function reprompt(output){
    return {
        "version": "1.0",
        "sessionAttributes": {"done": {}, "count": 0},
        "response": {
            outputSpeech: {
                type: 'PlainText',
                text: output
            },
            card: {
                type: "Simple",
                title: "Carta",
                content: output
            },
            reprompt: {
                outputSpeech: {
                    type: 'PlainText',
                    text: output,
                }
            },
            shouldEndSession: false
        }
    };
}

function endSession(output){
    return {
        "version": "1.0",
        "response": {
            outputSpeech: {
                type: 'PlainText',
                text: output
            },
            card: {
                type: "Simple",
                title: "Carta",
                content: output
            },
            shouldEndSession: true
        }
    };
}

function response(done, count, s3_key) {
    return {
        "version": "1.0",
        "sessionAttributes": {"done": done, "count": count},
        "response": {
            outputSpeech: {
                type: 'SSML',
                ssml: "<speak><audio src=\"https://s3.amazonaws.com/" + process.env.bucket + "/carta_" + s3_key + ".mp3\" /></speak>"
            },
            card: {
                type: "Simple",
                title: "Translator",
                content: "Play Carta"
            },
            shouldEndSession: false
        }
    };

}


function final(s3_key) {
    return {
        "version": "1.0",
        "response": {
            outputSpeech: {
                type: 'SSML',
                ssml: "<speak>It's final card!<break time=\"1s\" /><audio src=\"https://s3.amazonaws.com/" + process.env.bucket + "/carta_" + s3_key + ".mp3\" /></speak>"
            },
            card: {
                type: "Simple",
                title: "Translator",
                content: "Final Card"
            },
            shouldEndSession: true
        }
    };

}
