
/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
 */

'use strict';
// const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ACCESS_TOKEN = 'EAAgBNNw4zGABAFLAIrd9iIkpXAesz1kKdERl94THZCrzYo28cnFGgrZB2lZC4tdemKkd7EeNT0QMUCcxtulyOWAKRerXQNSBZCMnnGF2A8sZBGZBXr44Fjjzc2KATRKu5MVeSToe7QrGYDAAtZCjovRYKMN7akwqFMZBA4Qy6hsg0AZDZD';

var userMap = new Map()
//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://booht:password1@ds151917.mlab.com:51917/booht';
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Message Model
const Model = require('./models/Message');
const gcloud_cli = require('./gcloud-storage/gcloud-client');

const
  FIRST_QN = "FIRST_QN",
  GREETINGS = "GREETINGS",
  TIME = "TIME",
  MORE_DETAILS = "MORE_DETAILS",
  CONTACT = "CONTACT",
  KEY_IN_DETAILS = "KEY_IN_DETAILS",
  RESPONSE_RECORDED = "RESPONSE_RECORDED",
  DEFAULT = "DEFAULT",
  SESSION_END = "SESSION_END"


// Imports dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(1337, () => console.log('webhook is listening'));

app.get('/', (req, res) => {
  res.send(200)
})
// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(`webhook_event: ${JSON.stringify(webhook_event)}`);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        
        handlePostback(sender_psid, webhook_event.postback);
      }
      
    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "b6fc1881-6863-4437-890f-9d9e322d9710";
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

function processPayload(sender_psid, payload, text) {
  console.log(`payload: ${payload}`)
  var isDefault = false;
  let response = {
    "text": "Can't understand what you're saying, please rephrase that."
  };
  switch (payload) {
    case FIRST_QN:
      response = {
        "text": `Hey there, I am ... Are you here to report a potential case of human trafficking?`,
        "quick_replies": yesNoQuickReply(GREETINGS)
      }
      break;
    case GREETINGS:
      if (text == "Yes") {  // move to output 2a
        response = {
          "text": `What date (dd/mm/yyyy) did you witness the suspicious activity?`
        }
      } else {
        payload = SESSION_END;
        response = {
          "text": `Sure, let me know if you change your mind.`
        }
      }
      break;
    case TIME:
      response = {
        "text": `On ${text}, roughly what time (HH:MM) did you lose the item?`
      }
      break;
    case MORE_DETAILS:
      response = {
        "text": "Sure thing, can you share some details on what you saw?",
        "quick_replies": yesNoQuickReply(CONTACT)
      }
      break;
    case CONTACT:
      if (text == "Yes") {
        response = {
          "text": "Please key in details..."
        }
      } else {
        payload = SESSION_END;
        response = {
          "text": `Sure, let me know if you change your mind.`
        }
      }
      break;
    case KEY_IN_DETAILS:
      response = {
        "text": "May I have your email address and/or contact number?",
        "quick_replies": [
          {
            "content_type": "user_phone_number"
          }, 
          {
            "content_type": "user_email"
          }
        ]
      }
    case RESPONSE_RECORDED:
      response = {
        "text": "Thank you so much. Your response has been recorded."
      }
    default:
      isDefault = true;
      payload = DEFAULT;
    break;
  }
  
  var qns = userMap.get(sender_psid);
  qns.push(payload);
  userMap.set(sender_psid, qns);

  console.log(`qns: ${qns}`)
  return response;
}

function isEmail(emailText) {
  var emailReg = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
  return emailText.match(emailReg)
}

function isPhoneNum(phoneText) {
  return phoneText.match(/\d{8,}/)
}

function isDate(dateText) {
  var dateformat = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
  return dateText.match(dateformat);
}

function isTime(timeText) {
  var timeformat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeText.match(timeformat);
}

function yesNoQuickReply(payload) {
  return [
    {
      "content_type": "text", 
      "title": "Yes",
      "payload": payload
    },
    {
      "content_type": "text", 
      "title": "No",
      "payload": payload
    }
  ]
}

function reset(sender_psid) {
  userMap.set(sender_psid, []);
}

async function handleMessage(sender_psid, received_message) {
  let response;
  
  const newMessage = new Message({
    senderId: sender_psid,
    messageText: received_message.text,
    attachmentUrl: ''
  });

  await newMessage.save();

  // Checks if the message contains text
  if (received_message.text) {    
    let payload = null;
    console.log(received_message)

    let userQns = userMap.get(sender_psid);
    if (userQns == null) {
      reset(sender_psid)
      payload = FIRST_QN;
    } else {
      var mostRecentQn = userQns[userQns.length - 1];
      if (mostRecentQn == CONTACT) {
        payload = KEY_IN_DETAILS;
      } 

      if (mostRecentQn == SESSION_END || mostRecentQn == RESPONSE_RECORDED) {
        reset(sender_psid);
        payload = FIRST_QN;
      }

      if (mostRecentQn == DEFAULT) {
        for (let i = userQns.length - 1; i >= 0; i--) {
          if (userQns[i] != DEFAULT) {
            payload = userQns[i];
            break;
          }
        }
      }
    }

    if (isDate(received_message.text)) {
      payload = TIME
    } 

    if (isTime(received_message.text)) {
      payload = MORE_DETAILS
    }

    if (received_message.quick_reply) {
      payload = received_message.quick_reply.payload;

      if (isEmail(payload) || isPhoneNum(payload)) {
        payload = RESPONSE_RECORDED;
      }
    }
    response = processPayload(sender_psid, payload, received_message.text)
    console.log(`response: ${response}`)
  } else if (received_message.attachments) {
    
    // if user shares location 
    let lat, lng = null;
    if(received_message.attachments[0].payload.coordinates)
    {
        console.log(received_message.attachments[0].payload.coordinates)
        lat = received_message.attachments[0].payload.coordinates.lat;
        lng = received_message.attachments[0].payload.coordinates.long;

        const newMessage = new Message({
          senderId: sender_psid,
          messageText: 'lat=${lat},lng=${lng}',
          attachmentUrl: ''
        })
        await newMessage.save()

        response = {
          "text": `You shared your location ${lat}, ${lng}`
        } 
    } else {

      // if user shares image / other media types
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      console.log("ATTACHMENT URL: " + attachment_url)

      if (attachment_url) {
      gcloud_cli.upload(attachment_url);
      }

      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Is this the right picture?",
              "subtitle": "Tap a button to answer.",
              "image_url": attachment_url,
              "buttons": [
                {
                  "type": "postback",
                  "title": "Yes!",
                  "payload": "yes",
                },
                {
                  "type": "postback",
                  "title": "No!",
                  "payload": "no",
                }
              ],
            }]
          }
        }
      }
    }

  } 
  
  // Send the response message
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
   let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}