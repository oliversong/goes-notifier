var config = require('./config');

var waitFor = function(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis || 3000;  // < Default Max Timout is 3s
  var start = new Date().getTime();
  var condition = false;
  var interval = setInterval(function() {
    if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
      // If not time-out yet and condition not yet fulfilled
      condition = (typeof(testFx) === 'string' ? eval(testFx) : testFx()); // < defensive code
    } else {
      if (!condition) {
        // If condition still not fulfilled (timeout but condition is 'false')
        console.log("'waitFor()' timeout");
        phantom.exit(1);
      } else {
        // Condition fulfilled (timeout and/or condition is 'true')
        console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
        typeof(onReady) === 'string' ? eval(onReady) : onReady();  // Do what it's supposed to do once the condition is fulfilled
        clearInterval(interval);  // Stop this interval
      }
    }
  }, 250);  // repeat check every 250ms
};

var page = require('webpage').create();
var url = 'https://goes-app.cbp.dhs.gov/goes/jsp/login.jsp';
var jquery = 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js'
var username = config.username;
var password = config.password;

page.open(url, function(status) {
  page.includeJs(jquery, function() {
    console.log('Status: ' + status);
    console.log('Clicking on login button...');
    page.evaluate(function(username, password) {
      // fill in username/pass
      $('#j_username').val(username);
      $('#j_password').val(password);
      $('#SignIn').click();
    }, username, password);
    waitFor(function() {
      console.log('Waiting for checkbox...');
      var evaluation = page.evaluate(function() {
        return document.getElementById('checkMe');
      });
      return evaluation;
    }, function() {
      console.log('Checkbox found. Clicking on checkbox...')
      var evaluation = page.evaluate(function() {
        $('#checkMe').click();
      });
      waitFor(function() {
        console.log('Waiting on manage appointments button...')
        var evaluation = page.evaluate(function() {
          return $('input[name=manageAptm]').length
        });
      }, function() {
        console.log('Appointments button found. Clicking on button...');
        var evaluation = page.evaluate(function() {
          $('input[name=manageAptm]').click();
        });
        phantom.exit();
      });
    });
  });
});
