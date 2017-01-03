# GOES notifier

Interview wait times for a TSA Global Entry interview at SFO are (as of Jan 2017) about 6 months. However, if you get lucky you might be able to get an interview slot that someone else reschedules.

This script automatically checks the Global Entry interview schedule for your given airport and texts you when there's an appointment available within 30 days, allowing you to "snipe" a cancelled appointment.

## Setup

1. Clone this repo
2. Install casper, phantom

    ```
    npm install -g phantomjs
    npm install -g casperjs
    ```

3. Make a Twilio account / messaging service / phone number: [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
4. Make a config file

    ```
    cp config.js.example config.js
    ```

5. Write your information to the config file
  - username: your GOES username
  - password: your GOES password
  - airport: code for the airport you want to subscribe to (SFO is 5446)
  - accountSid: your Twilio account SID
  - authToken: your Twilio production auth token
  - serviceSid: your Twilio Messaging service
  - toNumber: the phone number you want to be sending texts to
  - fromNumber: your Twilio phone number
6. Set up a cronjob to run the script

    ```
    crontab -e
    ```

    then add

    ```
    */5 * * * * /PATH/TO/SCRIPT/goes.sh
    ```

7. You should be all set.
