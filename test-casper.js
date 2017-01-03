var config = require('./config');
var casper = require('casper').create({
  clientScripts: ['./jquery.min.js'],
});

var url = 'https://goes-app.cbp.dhs.gov/goes/jsp/login.jsp';
var username = config.username;
var password = config.password;
var providedDay;

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
  this.waitForSelector('#selectedEnrollmentCenter');
});

casper.then(function() {
  this.echo('Airport dropdown found, selecting next...');
  this.evaluate(function() {
    $('#selectedEnrollmentCenter').value = 5446;
    $('input[name=next]').click();
  });
});

casper.then(function() {
  this.echo('Waiting on calendar to render...');
  this.waitForSelector('.date');
});

casper.then(function() {
  this.echo('Calendar found. Parsing date...');
  providedDay = this.evaluate(function() {
    console.log('try');
    var day = $('.date td')[0].innerHTML;
    console.log(day);
    var monthYear = $('.date div')[1].innerText;
    console.log(monthYear);
    return day + ' ' + monthYear;
  });
});

casper.then(function() {
  this.echo('Date found: ' + providedDay);

  var nextDay = new Date(providedDay);
  var today = new Date();
  console.log('Next available: ' + nextDay);
  console.log('Today: ' + today);
  var oneDay = 1000 * 60 * 60 * 24;
  var numDays = Math.ceil(
    (nextDay.getTime() - today.getTime()) / (oneDay)
  );
  this.echo('Number of days away: ' + numDays);

  if (numDays < 30) {
    // twilio text
    this.echo('New appointment slot available within a month');
  } else {
    this.echo('No appointment slots available within a month');
  }
});

casper.run(function() {
  this.echo('Done');
  return;
});
