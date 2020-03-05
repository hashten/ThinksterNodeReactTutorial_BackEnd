var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    passport = require('passport'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose'),
    obj = JSON.parse(fs.readFileSync('connectionData.json', 'utf8'));

var connectionString = "mongodb://account:key@account.documents.azure.com:10255/?ssl=true";
var isProduction = process.env.NODE_ENV === 'production';
if(isProduction){
  var connectionString = obj.connectionString;
  var stringSplit1 = connectionString.split("://")[1];
  var stringSplit2 = stringSplit1.split('@');
  var userNamePassword = stringSplit2[0];
  userNamePassword = userNamePassword.split(':');
  var userName = userNamePassword[0];
  var password = userNamePassword[1];
  var databaseName = obj.databaseName;
  var collectionName = obj.collectionName;
  connectionString = ("mongodb://" + encodeURIComponent(userName) + ":" + encodeURIComponent(password) + "@" + stringSplit2[1]);
}

// Create global app object
var app = express();


app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
  app.use(errorhandler());
}

if(isProduction){
  mongoose.connect(connectionString); //Can i specify process.env.MONGODB_URI from keyvault instead?
} else {
  mongoose.connect(connectionString);
  mongoose.set('debug', true);
}

require('./models/User');
require('./models/Article');
require('./models/Comment');
require('./config/passport');
app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
