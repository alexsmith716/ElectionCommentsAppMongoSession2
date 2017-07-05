
require('dotenv').load()
process.env.NODE_ENV = 'development'

// var cluster = require('cluster')
var express = require('express')
var helmet = require('helmet')
var https = require('https')
var path = require('path')
// var favicon = require('serve-favicon')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var fs = require('fs')
var morgan = require('morgan')
var rfs = require('rotating-file-stream')
var passport = require('passport')
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
var createError = require('http-errors')
require('./theAPI/model/dbConnector')
var sanitize = require('./shared/sanitizeInput')
var onFinished = require('on-finished')
var setUpAuthentication = require('./theAPI/model/authentication')
var serverRoutes = require('./theServer/routes/serverRoutes')
var apiRoutes = require('./theAPI/routes/apiRoutes')
var renderableCustomErrorObject = require('./shared/renderableCustomErrorObject')
var url = require('url')
var app = express()

app.use(helmet())
// app.use(helmet.noCache())

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

var logDirectory = path.join(__dirname, 'httpRequestLog')

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

var accessLogStream = rfs('access.log', {
  interval: '1d',
  path: logDirectory
})

// app.use(morgan('dev'))
app.use(morgan('combined', {stream: accessLogStream}))

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

var options = {
  key: fs.readFileSync(path.join(__dirname, './ssl/thisgreatappPEM.pem')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/thisgreatappCRT.crt'))
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

setUpAuthentication()

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.set('views', path.join(__dirname, 'theServer', 'views'))
app.set('view engine', 'pug')

// app.use(favicon(__dirname + '/public/images/favicon.ico'))
app.use(express.static(path.join(__dirname, 'public')))

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

// var cookieExpireDate = new Date( Date.now() + 14 * 24 * 60 * 60 )
// 1 hour(s)
var sessionExpireDate = 6 * 60 * 60 * 1000
// 1 minute
// var sessionExpireDate = 1 * 60 * 1000
// 10 minutes
// var sessionExpireDate = 10 * 60 * 1000

app.use(session({
  store: new MongoStore({
    url: 'mongodb://localhost/pec2016s',
    autoRemove: 'native'
  }),
  name: 'id',
  secret: process.env.SESSION_SECRET,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: sessionExpireDate
  }
}))

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(passport.initialize())
app.use(passport.session())

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(function (req, res, next) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> GOING THROUGH APP NOW <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
  // console.log('REQ.baseUrl ++: ', req.baseUrl)
  // console.log('REQ.cookies ++: ', req.cookies)
  // console.log('REQ.signedCookies ++: ', req.signedCookies)
  // console.log('REQ.secure ++: ', req.secure)
  // console.log('REQ.fresh ++: ', req.fresh)
  // console.log('REQ.stale ++: ', req.stale)
  // console.log('REQ.protocol ++: ', req.protocol)
  //console.log('REQ.method ++: ', req.method)
  // console.log('REQ.route ++: ', req.route)
  // console.log('REQ.url ++: ', req.url)
  //console.log('REQ.originalUrl ++: ', req.originalUrl)
  ///console.log('REQ.path ++: ', req.path)
  // console.log('REQ.headers ++: ', req.headers)
  // console.log('REQ.headers.referer ++: ', req.headers['referer'])
  // console.log('REQ.headers.user-agent ++: ', req.headers['user-agent'])
  // console.log('REQ.query ++: ', req.query)
  // console.log('REQ.query.token ++: ', req.query.token)
  // console.log('REQ.session ++: ', req.session)
  // console.log('REQ.sessionID ++: ', req.sessionID)
  // console.log('REQ.user ++: ', req.user)
  // req.user ? console.log('REQ.user._id: ', req.user._id) : null
  // console.log('REQ.body ++: ', req.body)
  // console.log('REQ.params ++: ', req.params)
  // console.log('RES.headersSent ++: ', res.headersSent)

  var reqBody = sanitize(req.body)
  var reqQuery = sanitize(req.query)
  var reqParams = sanitize(req.params)

  if (reqBody['badInput'] || reqQuery['badInput'] || reqParams['badInput']) {
    var err = new Error('Bad Request')
    err.status = 400
    return next(err)
  } else {
    next()
  }
})

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(function (req, res, next) {

  res.locals.currentUser = req.user
  res.locals.reqUrl = req.originalUrl

  var expr = /\/api/
  if ( !expr.test(req.originalUrl) ) {
    req.session.currentRoute ? req.session.referingRoute = req.session.currentRoute : null
    req.session.currentRoute = req.originalUrl
  }

  console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ GOING THROUGH APP NOW ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')

  if(res.locals.currentUser){
    req.session.paginateFrom = res.locals.sortDocsFrom;
    req.session.lastPageVisited = '/indexView';
  }

  next()
})

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

if (app.get('env') === 'development') {
  app.locals.pretty = true
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(function (req, res, next) {

  /*
  var timer = setTimeout(function () {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Ending Timed-Out Request <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
    var err = new Error('Gateway Timeout, req.originalUrl: '+req.originalUrl)
    err.status = 504
    next(err)
  }, 30000)
  */
  onFinished(req, function () {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> APP onFinished REQ <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
  })

  onFinished(res, function () {
    // clearTimeout(timer)
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> APP onFinished RES <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
  })

  next()
})

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use('/', serverRoutes)
app.use('/api', apiRoutes)

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(function (req, res, next) {
  console.log('############################# APP UNCAUGHT ERR HANDLER 404 #####################################')
  var err = new Error('Not Found, req.originalUrl: '+req.originalUrl)
  err.status = 404
  next(err)
})

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


if (app.get('env') === 'development') {

  app.use(function (err, req, res, next) {
    console.log('############################# APP UNCAUGHT ERR HANDLER DEVELOPMENT ############################')

    res.status(err.status || 500)

    //console.log('############################# DEV ERR: ', err)
    //console.log('############################# DEV ERR.code: ', err.code)
    //console.log('############################# DEV ERR.status: ', err.status)
    //console.log('############################# DEV ERR.name: ', err.name)
    //console.log('############################# DEV ERR.message: ', err.message)
    //console.log('############################# DEV ERR.referer: ', err.referer)
    //console.log('############################# ++++++++++++++++++++++++++++++++++++++++')
    //console.log('############################# DEV REQ.originalUrl: ',  req.originalUrl)
    //console.log('############################# DEV REQ.HEADERS.referer: ', req.headers['referer'])
    //console.log('############################# DEV REQ.xhr: ', req.xhr)

    var referer

    if (req.headers['referer']) {
      referer = url.parse(req.headers['referer']).pathname
    }

    req.session.renderableErr = renderableCustomErrorObject( err )

    console.log('############################# APP UNCAUGHT ERR HANDLER DEVELOPMENT > req.session.renderableErr ############################: ', req.session.renderableErr)

    if (req.xhr) {

      console.log('############################# APP UNCAUGHT ERR HANDLER DEVELOPMENT > YES XHR ############################')
      res.json({'response': 'error', 'type': 'error', 'err': req.session.renderableErr})

    } else {

      if (referer) {
        console.log('############################# APP UNCAUGHT ERR HANDLER DEVELOPMENT > NO XHR - referer #############################: ', referer)
        res.redirect(referer)

      } else {
        console.log('############################# APP UNCAUGHT ERR HANDLER DEVELOPMENT > NO XHR - other #############################')
        res.redirect('/notifyerror')

      }
    }
  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports = app

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.set('port', process.env.PORT || 3000)
var server = https.createServer(options, app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port)
})
