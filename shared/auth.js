
var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var exceptionError = {'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyerror'};

module.exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    var newExceptionError = new Error('Bad Request');
    newExceptionError.status = 400;
    return next(newExceptionError);
  }
}

module.exports.ensureAuthenticatedAPI = function (req, res, next) {
  var hAuth = req.headers['authorization']
  var expr = /Basic/
  if (hAuth !== undefined && expr.test(hAuth)) {
    return next()
  }else{
    sendJSONresponse(res, 400, exceptionError)
  }
}

module.exports.noCache = function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
    //res.header('Expires', '-1')
    //res.header('Pragma', 'no-cache')
    return next()
}
