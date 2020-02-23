# BooHT
A simple Facebook Messenger bot developed for the purpose of a social hackathon.

## Local Set up

Follow the steps below to start your own local bot server.

### Installation

- Ensure that you have [ngrok](https://dashboard.ngrok.com/get-started) installed.
 

The below command will install all the necessary packages.
```
npm install // This will install all the necessary packages.
```

The below command will begin running the bot locally.
```
node .
```

The below command will begin forwarding all messages on ngrok client to your local machine. Note the port no.(ie. 1337)
```
./ngrok http 1337
```
