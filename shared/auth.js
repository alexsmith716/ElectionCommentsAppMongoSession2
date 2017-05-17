
var sendJSONresponse = function(res, status, content) {
  res.status(status)
  res.json(content)
}

var exceptionError = {'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyerror'}

module.exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    // res.redirect('/loginorsignup')
    var newExceptionError = new Error('Bad Request')
    newExceptionError.status = 400
    return next(newExceptionError)
  }
}

module.exports.ensureAuthenticatedAPI = function (req, res, next) {
  var hAuth = req.headers['authorization']
  var expr = /Basic/
  if (hAuth !== undefined && expr.test(hAuth)) {
    return next()
  } else {
    sendJSONresponse(res, 400, exceptionError)
  }
}


module.exports.ensureAuthenticatedNewUserDataItem = function (req, res, next) {

  console.log('## auth > ensureAuthenticatedNewUserDataItem +++++++++++++++++')

  var u =  req.body.type.charAt(0).toUpperCase()+req.body.type.slice(1)
  var nd = new Date()

  // if type === email     >>>   (if req.session.userValidatedEmail.time > 5 minutes, then ERROR: 'response': 'error', 'alertDanger')
  // you have 5 minutes to submit form, otherwise you repeat 'nextSubmitNewUserDataItemForm' from start

  // if type === password  >>>   (if req.session.userValidatedPassword.time > 5 minutes, then ERROR: 'response': 'error', 'alertDanger')
  // you have 5 minutes to submit form, otherwise you repeat 'nextSubmitNewUserDataItemForm' from start

  if (req.body.type === 'email' && req.session.userValidatedEmail.validated) {

    console.log('## auth > ensureAuthenticatedNewUserDataItem > req.session.userValidatedEmail:', req.session.userValidatedEmail.validated)

    var dmillis = nd.getTime() - req.session.userValidatedEmail.time
    var dmillis = new Date(dmillis)

    req.session.userValidatedEmail.validated = false

    if(dmillis.getMinutes() > 1){

      console.log('## auth > ensureAuthenticatedNewUserDataItem > EMAIL > BAAAAAAAAAD')
      sendJSONresponse(res, 201, { 'response': 'error', 'alertDanger': ' An Error occurred processing your request, please try changing your '+ u +' again.' })

    } else {

      console.log('## auth > ensureAuthenticatedNewUserDataItem > EMAIL > GOOOOOOOOOD')
      return next()

    }

  }else if (req.body.type === 'password' && req.session.userValidatedEmail.validated && req.session.userValidatedPassword.validated) {

    console.log('## auth > ensureAuthenticatedNewUserDataItem > req.session.userValidatedPassword:', req.session.userValidatedPassword.validated)

    var pmillis = nd.getTime() - req.session.userValidatedPassword.time
    var pmillis = new Date(pmillis)

    req.session.userValidatedEmail.validated = false
    req.session.userValidatedPassword.validated = false

    if(pmillis.getMinutes() > 1){

      console.log('## auth > ensureAuthenticatedNewUserDataItem > PASSWORD > BAAAAAAAAAD')
      sendJSONresponse(res, 201, { 'response': 'error', 'alertDanger': ' An Error occurred processing your request, please try changing your '+ u +' again.' })

    } else {

      console.log('## auth > ensureAuthenticatedNewUserDataItem > PASSWORD > GOOOOOOOOOD')
      return next()

    }

  } else {

    sendJSONresponse(res, 400, exceptionError)

  }

}

module.exports.noCache = function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
    //res.header('Expires', '-1')
    //res.header('Pragma', 'no-cache')
    return next()
}
