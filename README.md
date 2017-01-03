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

## License
MIT

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
