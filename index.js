var config = require('./config');
var casper = require('casper').create({
  clientScripts: ['./jquery.min.js'],
});
var OAuth = require('oauth-1.0a');
var jsSHA = require('jssha');


var oauth = OAuth({
  consumer: {
    key: config.twitter.consumerKey,
    secret: config.twitter.consumerSecret,
  },
  signature_method: 'HMAC-SHA1',
  hash_function: function(base_string, key) {
    var shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.setHMACKey(key, 'TEXT');
    shaObj.update(base_string);
    return shaObj.getHMAC('B64');
  },
});
var url = 'https://goes-app.cbp.dhs.gov/goes/jsp/login.jsp';
var username = config.username;
var password = config.password;
var airport = config.airport;
var accountSid = config.twilio.accountSid;
var serviceSid = config.twilio.serviceSid;
var authToken = config.twilio.authToken;
var toNumber = config.twilio.toNumber;
var fromNumber = config.twilio.fromNumber;
var twitterLinked = (
  config.twitter.accessToken &&
  config.twitter.accessTokenSecret &&
  config.twitter.consumerKey &&
  config.twitter.consumerSecret
);
var providedDay;
var notify;

function CasperException(message, stack) {
  this.name = 'CasperException';
  this.message = message;
  this.stack = stack;
}

casper.on('error', function(msg, backtrace) {
  this.echo('Exception: ' + msg + backtrace);
  this.capture('./out/error.png');
  throw new CasperException(msg, backtrace);
});

casper.on('remote.message', function(msg) {
  this.echo('remote console.log:' + msg);
});

casper.start(url);

casper.then(function() {
  this.echo('Landed on page: ' + this.getTitle());
});

casper.then(function() {
  this.echo('Clicking on login button...');
  this.evaluate(function(u, p) {
    $('#j_username').val(u);
    $('#j_password').val(p);
    $('#SignIn').click();
  }, username, password);
});

casper.then(function() {
  this.echo('Waiting for checkbox...');
  this.waitForSelector('#checkMe');
});

casper.then(function() {
  this.echo('Checkbox found. Clicking on checkbox...');
  this.evaluate(function() {
    $('#checkMe').click();
  });
});

casper.then(function() {
  this.echo('Waiting on manage appointments button...');
  this.waitForSelector('input[name=manageAptm]');
});

casper.then(function() {
  this.echo('Appointments button found. Clicking on button...');
  this.evaluate(function() {
    $('input[name=manageAptm]').click();
  });
});

casper.then(function() {
  this.echo('Waiting on reschedule appointment button...');
  this.waitForSelector('input[name=reschedule]');
});

casper.then(function() {
  this.echo('Reschedule button found. Clicking on button...');
  this.evaluate(function() {
    $('input[name=reschedule]').click();
  });
});

casper.then(function() {
  this.echo('Waiting on airport dropdown...');
  this.waitForSelector("input[value='"+airport+"']");
});

casper.then(function() {
  this.echo('Airport dropdown found, selecting next...');
  this.evaluate(function(airport) {
    $("input[value='"+airport+"']").click();
    $('input[name=next]').click();
  }, airport);
});

casper.then(function() {
  this.echo('Waiting on calendar to render...');
  this.waitForSelector(".entry");
  // grab onclick function of the first element because it has a date embedded
  var onClickFunction = this.getElementsAttribute('.entry', 'onclick');
  var d = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/.exec(onClickFunction);
  var rawDate = d[1] + '/' + d[2] + '/' + d[3] + ' ' + d[4] + ':' + d[5]; // 2017/01/01 00:00
  providedDay = new Date(Date.parse(rawDate));
});

casper.then(function() {
  this.echo('Date found: ' + providedDay);

  var nextDay = new Date(providedDay);
  var today = new Date();
  this.echo('Next available: ' + nextDay, 'INFO');
  this.echo('Today: ' + today);
  var oneDay = 1000 * 60 * 60 * 24;
  var numDays = Math.ceil(
    (nextDay.getTime() - today.getTime()) / (oneDay)
  );
  this.echo('Number of days away: ' + numDays);

  if (numDays < config.threshold) {
    notify = true;
    this.echo('New appointment slot available within threshold', 'CRITICAL');
  } else {
    notify = false;
    this.echo('No appointment slots available within threshold', 'CRITICAL');
  }
});

casper.then(function() {
  if (notify) {
    this.echo('Sending twilio request...');
    this.open(
      'https://' + accountSid + ':' + authToken + '@' +
      'api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages',
      {
        method: 'post',
        data: {
          To: toNumber,
          From: fromNumber,
          Body: 'New appointment slot open: ' + providedDay,
          MessagingServiceSid: serviceSid,
        },
      }
    ).then(function() {
      require('utils').dump(this.getPageContent());
    });
  }
});

casper.then(function() {
  if (twitterLinked && notify) {
    this.echo('Sending twitter request...');
    var message = 'New appointment slot open: ' + providedDay;
    var requestData = {
      url: 'https://api.twitter.com/1.1/statuses/update.json',
      method: 'POST',
      data: {
        status: message,
      },
    };
    var token = {
      key: config.twitter.accessToken,
      secret: config.twitter.accessTokenSecret,
    };
    this.open(
      requestData.url,
      {
        method: requestData.method,
        data: requestData.data,
        headers: oauth.toHeader(oauth.authorize(requestData, token)),
      }
    );
  }
});

casper.run(function() {
  this.echo('Done');
  this.exit();
});
