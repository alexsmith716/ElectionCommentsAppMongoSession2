
var mongoose = require('mongoose')
var Comment = mongoose.model('Comment')
var User = mongoose.model('User')

//var User = require('../model/userSchema.js')
//var Comment = require('../model/commentsSchema')
var paginate = require('mongoose-range-paginate')
var pugCompiler = require('../../shared/pugCompiler')
var nodemailer = require('nodemailer')
var passport = require('passport')
//var mongoose = require('mongoose')
var serverSideValidation = require('../../shared/serverSideValidation.js')
var evaluateUserEmail = require('../../shared/evaluateUserEmail.js')
var evaluateUserEmailVerify = require('../../shared/evaluateUserEmailVerify.js')
var evaluateUserPasswordVerify = require('../../shared/evaluateUserPasswordVerify.js')
var stateNamer = require('../../shared/stateNamer.js')
var auth = require('basic-auth')
var customError = require('../../shared/customError.js')
var createError = require('http-errors')
var sortKey = 'time'
var sort = '-' + sortKey
var sortDocsFrom = 0

var sendJSONresponse = function (res, status, content) {
  res.status(status)
  res.json(content)
}

module.exports.getIndexResponse = function (req, res) {
  sendJSONresponse(res, 200), { "response": "getIndexResponse Response!!!" }
}

module.exports.getUserHomeResponse = function (req, res) {
  sendJSONresponse(res, 200), { "response": "getUserHomeResponse Response!!!" }
}

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
var buildGetCommentsResponse = function(req, res, results) {
  var responseBody = [];
  results.forEach(function(doc) {
    responseBody.push({
      id: doc._id,
      displayname: doc.displayname,
      commenterId: doc.commenterId,
      city: doc.city,
      state: doc.state,
      datecreated: doc.datecreated,
      candidate: doc.candidate,
      comment: doc.comment,
      recommended: doc.recommended,
      subComments: doc.subComments
    });
  });
  return responseBody;
};

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
function getQuery() {
  return Comment.find()
    .where({})
}

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
module.exports.getCommentsResponse = function(req, res) {
  paginate(getQuery(), { sort: sort, limit: 5 }).exec(function (err, results) {
    var responseBody;
    if (err) {
      sendJSONresponse(res, 404, err);
    } else {
      sortDocsFrom = 4;
      responseBody = buildGetCommentsResponse(req, res, results);
      sendJSONresponse(res, 200, responseBody);
    }
  })
};

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
var doAddComment = function(req, res, location, author) {
  if (!location) {
    sendJSONresponse(res, 404, "locationid not found");
  } else {
    location.reviews.push({
      author: author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });
    location.save(function(err, location) {
      var thisReview;
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        updateAverageRating(location._id);
        thisReview = location.reviews[location.reviews.length - 1];
        sendJSONresponse(res, 201, thisReview);
      }
    });
  }
};

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
module.exports.postMainCommentResponse = function(req, res) {
  Comment.create({
    displayname: req.body.displayname,
    commenterId: req.body.commenterId,
    city: req.body.city,
    state: req.body.state,
    candidate: req.body.candidate,
    comment: req.body.comment
  }, function(err, electioncomment) {
    if (err) {
      sendJSONresponse(res, 400, err);
    } else {
      sendJSONresponse(res, 201, electioncomment);
    }
  });
};

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
module.exports.postSubCommentResponse = function(req, res) {
  if (!req.params.subcommentid) {
    sendJSONresponse(res, 404, { 'response': "subcommentid not found" });
    return; 
  }
  Comment.findById(req.params.subcommentid).select('subComments').exec(function(err, comment) {
    if (err) {
      sendJSONresponse(res, 400, err);
    }else{
      comment.subComments.push({
        displayname: req.body.displayname,
        commenterId: req.body.commenterId,
        city: req.body.city,
        state: req.body.state,
        comment: req.body.comment
      });
      comment.save(function(err, comment) {
        var newComment;
        if (err) {
          sendJSONresponse(res, 400, err);
        } else {
          newComment = comment.subComments[comment.subComments.length - 1];
          sendJSONresponse(res, 201, newComment);
        }
      });
    }
  });
};

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
var getCommentUser = function(req, res, cb) {
  if (req.payload.email) {
    User.findOne({ email : req.payload.email }).exec(function(err, user) {
        if (!user) {
          sendJSONresponse(res, 404, { "response": "User not found" });
          return;
        } else if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        console.log(user);
        cb(req, res, user.name);
      });
  } else {
    sendJSONresponse(res, 404, { "response": "User not found" });
    return;
  }
};

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
module.exports.getOneCommentResponse = function(req, res) {
  if (req.params && req.params.commentid) {
    User.findById(req.params.commentid).exec(function(err, results) {
        if (!results) {
          sendJSONresponse(res, 404, {"response": "commentid not found"});
        } else if (err) {
          sendJSONresponse(res, 404, err);
        }
        sendJSONresponse(res, 200, results);
      });
  } else {
    sendJSONresponse(res, 404, {
      "response": "No commentid in request"
    });
  }
};

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
module.exports.editOneComment = function(req, res) {
  // ++++++++++++++++++++
};

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
module.exports.deleteOneComment = function(req, res) {
  var commentsid = req.params.commentsid;
  if (!commentsid) {
    sendJsonResponse(res, 404, {
    "response": "Not found, locationid and reviewid are both required"
  });
    return; 
  }

  if (commentsid) {
    User.findByIdAndRemove(commentsid).exec(function(err, comment) {
          if (err) {
            sendJSONresponse(res, 404, err);
          }
          sendJSONresponse(res, 204, null);
        }
    );
  } else {
    sendJSONresponse(res, 404, { "response": "No commentid in request" });
  }
};

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

// AbcdefghijklmnopqrstUvwxyzabcdefghIjklmnopqrstuvwxyz
module.exports.ajaxEvaluateUserProfile = function (req, res, next) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>> > API > ajaxEvaluateUserProfile > req.body:', req.body)

  User.findById(res.locals.currentUser.id).exec(function (err, user) {
  // User.findOne({email : res.locals.currentUser.email}).exec(function(err, user) {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 0000000000 1')

    var voo = parseInt('771111777', 10)

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 0000000000 2: ', typeof voo)

    user.firstname = ''
    // user[reqBodyProp] = reqBodyValue

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 0000000000 3: ', typeof user.firstname)

    user.save(function (err, user) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 1:', err)

      if (err) {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 2:')
        return next(err)

      } else {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 3:')
        sendJSONresponse(res, 201, { 'response': 'success', 'updatedData': user.firstname })

      }
    })

  })
  /*
  var exceptionError = {'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyerror'}
  var newError
  var reqBodyProp
  var reqBodyValue
  var template = {}
  var updatedData

  var templateMain = {firstname: 'required', 
    lastname: 'required', 
    city: 'required', 
    state: 'required'}

  for (var p in req.body) {

    if (p !== '_csrf') {

      reqBodyProp = p
      reqBodyValue = req.body[reqBodyProp]

      if (reqBodyProp in templateMain) {

        template[reqBodyProp] = 'required'
        template['expectedResponse'] = 'false'

        serverSideValidation(req, res, template, function (validatedResponse) {

          var validationErrors = false

          if (validatedResponse.status === 'err') {
            return next(validatedResponse.message)

          } else {
            for (var prop in validatedResponse) {
              if (validatedResponse[prop].error !== false && validatedResponse[prop].error !== 'match') {

                validationErrors = true
                break

              }
            }
          }

          if (!validationErrors) {

            User.findById(res.locals.currentUser.id).exec(function (err, user) {

              if (err) {
                return next(err)
              }

              if (!user) {
                sendJSONresponse(res, 201, { 'response': 'error' })
                return
              }

              user[reqBodyProp] = reqBodyValue

              if (reqBodyProp === 'state') {
                updatedData = stateNamer(req, res, reqBodyValue)
                reqBodyValue = updatedData
              }

              console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 02aaaa:', reqBodyProp)
              console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 02:', reqBodyValue)

              user.save(function (err, user) {

                console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 1:', err)

                if (err) {

                  console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 2:')
                  return next(err)

                } else {

                  console.log('>>>>>>>>>>>>>>>>>>>>>>>>> API > ajaxEvaluateUserProfile > user.save 3:')
                  sendJSONresponse(res, 201, { 'response': 'success', 'updatedData': reqBodyValue })

                }
              })

            })

          }else{
            sendJSONresponse(res, 201, { 'response': 'error', 'validatedData': validatedResponse })
          }
        })
      }
    }
    break
  }
  */
}

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getUserProfileResponse = function (req, res, next) {

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> API > getUserProfileResponse <<<<<<<<<<<<<<<<<<<<<<<<<<<<: ')
  var newCustomError
  var credentials = auth(req)

  if (req.params && req.params.userid) {

    User.findById(req.params.userid).exec(function (err, user) {

      // return next(createError(400, 'Bad Request!'))
      // err = new Error('Bad Request')
      // err.status = 400
      // user = false

      if (err) {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> API > getUserProfileResponse > ERR <<<<<<<<<<<<<<<<<<<<<<<<<<<<: ', err)

        sendJSONresponse(res, 400, err)

      } else if (!user) {

        err = new customError('userid not found', 404)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> API > getUserProfileResponse > !USER <<<<<<<<<<<<<<<<<<<<<<<<<<<<: ', err)

        for (var p in err) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> API > getUserProfileResponse > err[p] <<<<<<<<<<<<<<<<<<<<<<<<<<<<: ', p, ' :: ', err[p])
        }

        sendJSONresponse(res, 404, err)

      } else if (!credentials || credentials.name !== user.email || credentials.pass !== user.datecreated.toISOString()) {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> API > getUserProfileResponse > !credentials <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        err = new customError('Unauthorized', 401)
        sendJSONresponse(res, 401, err)

      } else {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> API > getUserProfileResponse > ELSE <<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        sendJSONresponse(res, 200, user)

      }

    })

  } else {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> API > getUserProfileResponse 6<<<<<<<<<<<<<<<<<<<<<<<<<<<<: ')
    err = new customError('Not found, userid required', 404)
    sendJSONresponse(res, 404, err)

  }
}


/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

/*
{ type: 'email',
  data: 'aaa2@aaa.com',
  _csrf: 'fNYPBLkq-uefK1iNSAQMCsbUfHiMmnfm98Wo',
  email: 'aaa2ffdvdfvdfv@aaa.com',
  confirmEmail: 'aaa2ffdvdfvdfv@aaa.com' }
*/

module.exports.ajaxNewUserDataItem = function (req, res, next) {

  console.log('####### > API > ajaxNewUserDataItem 1 req.body:', req.body)

  var u = req.body.type.charAt(0).toUpperCase()+req.body.type.slice(1)
  var template = {}
  var nk
  var confirmK
  var newUserDataItem

  req.body.type === 'email' ? confirmK = 'confirmEmail' : null
  req.body.type === 'password' ? confirmK = 'confirmPassword' : null

  Object.keys(req.body).forEach(function(k) {
    if(k === 'newUserDataItem'){
      newUserDataItem = true
      nk = req.body.type
      req.body[nk] = req.body[k];
      delete req.body[k];
    }
    if(k === 'confirmNewUserDataItem'){
      newUserDataItem = true
      nk = confirmK
      req.body[nk] = req.body[k];
      delete req.body[k];
    }
  })

  console.log('####### > API > ajaxNewUserDataItem 2 NEW req.body:', req.body)

  template[req.body.type] = 'required'
  template[confirmK] = 'required'
  template['expectedResponse'] = 'false'

  console.log('####### > API > ajaxNewUserDataItem 3 template:', template)

  // ==============================================================================================

  if(req.body.type === 'email' && req.session.userValidatedEmail.isValidated){

    console.log('####### > API > ajaxNewUserDataItem 4 ++++++++++++++++++++')

    console.log('####### > API > ajaxNewUserDataItem 5 ++++++++++++++++++++')

    // ==============================================================================================

    serverSideValidation(req, res, template, function (validatedResponse) {

      console.log('####### > API > ajaxNewUserDataItem 5 > serverSideValidation > validatedResponse 1: ', validatedResponse)

      var validationErrors = false

      if (validatedResponse.status === 'err') {

        console.log('####### > API > ajaxNewUserDataItem 5 > serverSideValidation > validatedResponse2: ', validatedResponse)
        return next(validatedResponse.message)

      } else {

        console.log('####### > API > ajaxNewUserDataItem 5 > serverSideValidation > validatedResponse3: ', validatedResponse)

        for (var prop in validatedResponse) {

          if (validatedResponse[prop].error !== false && validatedResponse[prop].error !== 'match') {

            console.log('####### > API > ajaxNewUserDataItem 5 > serverSideValidation > validatedResponse4: ', validatedResponse)
            validationErrors = true
            break

          }
        }
      }

      if (!validationErrors) {

        // No errors, save user's new data change in Db
        // return response success 201
        req.session.userValidatedEmail.isValidated = false
        console.log('####### > API > ajaxNewUserDataItem 5 > serverSideValidation > validatedResponse5 > req.body: ', req.body)
        console.log('####### > API > ajaxNewUserDataItem 5 > serverSideValidation > validatedResponse5: ', validatedResponse)

        User.findById(res.locals.currentUser.id).exec(function (err, user) {
          if (err) {
            return next(err)
          }

          if (!user) {
            sendJSONresponse(res, 201, { 'response': 'error' })
            return
          }

          user['email'] = req.body.email

          user.save(function (err) {
            if (err) {
              return next(err)

            } else {
              sendJSONresponse(res, 201, { 'response': 'success' })

            }
          })

        })

      } else {

        newUserDataItem ? validatedResponse['newUserDataItem'] = true : null
        console.log('####### > API > ajaxNewUserDataItem 5 > serverSideValidation > validatedResponse6 > req.body: ', req.body)
        console.log('####### > API > ajaxNewUserDataItem 5 > serverSideValidation > validatedResponse6: ', validatedResponse)

        
        sendJSONresponse(res, 201, { 'response': 'error', 'validatedData': validatedResponse })

      }

    })

  }

  // ==============================================================================================

  if (req.body.type === 'password' && req.session.userValidatedEmail.isValidated && req.session.userValidatedPassword.isValidated) {

    console.log('####### > API > ajaxNewUserDataItem 8 ++++++++++++++++++++')

    serverSideValidation(req, res, template, function (validatedResponse) {

      console.log('####### > API > ajaxNewUserDataItem 9 > serverSideValidation > validatedResponse 1: ', validatedResponse)

      var validationErrors = false

      if (validatedResponse.status === 'err') {

        req.session.userValidatedEmail.isValidated = false
        req.session.userValidatedPassword.isValidated = false

        console.log('####### > API > ajaxNewUserDataItem 10 > serverSideValidation > validatedResponse2: ', validatedResponse)
        return next(validatedResponse.message)

      } else {

        console.log('####### > API > ajaxNewUserDataItem 11 > serverSideValidation > validatedResponse3: ', validatedResponse)

        for (var prop in validatedResponse) {

          if (validatedResponse[prop].error !== false && validatedResponse[prop].error !== 'match') {

            console.log('####### > API > ajaxNewUserDataItem 12 > serverSideValidation > validatedResponse4: ', validatedResponse)
            validationErrors = true
            break

          }
        }

      }

      if (!validationErrors) {

        // No errors, save user's new data in Db

        req.session.userValidatedEmail.isValidated = false
        req.session.userValidatedPassword.isValidated = false
        console.log('####### > API > ajaxNewUserDataItem 14 > serverSideValidation > validatedResponse5: ', validatedResponse)

      } else {

        console.log('####### > API > ajaxNewUserDataItem 15 > serverSideValidation > validatedResponse6: ', validatedResponse)

        newUserDataItem ? validatedResponse['newUserDataItem'] = true : null
        sendJSONresponse(res, 201, { 'response': 'error', 'validatedData': validatedResponse })

      }

    })
  }
}

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.ajaxValidateNewUserDataService = function (req, res, next) {

  if (req.body.type === 'email') {

    evaluateUserEmailVerify(req, res, true, function (response) {

      if (response.status === 'err') {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> ajaxValidateNewUserDataService >  evaluateUserEmailVerify > ERR <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<: ', response.message)

        return next(response.message)

      } else {
        
        sendJSONresponse(res, response.status, { 'response': response.response })

      }
    })
  }

  if (req.body.type === 'password' && req.session.userValidatedEmail.isValidated) {

    var nd = new Date()
    var millis = nd.getTime() - req.session.userValidatedEmail.timeStamp
    var nds = new Date(millis)
    var foo = 'foo'

    // if (foo === 'foo') {
    if (nds.getMinutes() > 4){
    // if (nds.getMinutes() > 0) {
    
      req.session.userValidatedEmail.isValidated = false

      var u = req.body.type.charAt(0).toUpperCase()+req.body.type.slice(1)

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>> ajaxValidateNewUserDataService 1 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

      sendJSONresponse(res, 201, { 'response': 'error', 'alertDanger': ' You\'re request to change the '+ u +' has timed out. Please try changing your '+ u +' again.' })

    } else {

      evaluateUserPasswordVerify(req, res, true, function (response) {

        if (response.status === 'err') {

          return next(response.message)

        } else {

          sendJSONresponse(res, response.status, { 'response': response.response })

        }
      })
    }

  }
}

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.ajaxEvaluateUserEmail = function (req, res, next) {

  evaluateUserEmail(req.body.email, req.body.expectedResponse, function (response) {

    if (response.status === 'err') {

      console.log('###### ERROR! > ajaxEvaluateUserEmail > evaluateUserEmail > err1?: ', response.message)
      return next(response.message)

    } else {

      sendJSONresponse(res, response.status, { 'response': response.response })

    }
  })
}

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

// will include nodemailer for ForgotPassword later/last
// for client, only testing if email is invalid, otherwise indicating instructions sent to reset password
// but instructions only really sent if email is a registered email
module.exports.ajaxForgotPassword = function (req, res, next) {
  var template = {email: 'required',
                  expectedResponse: 'false'}

  var testerJOB = {email: '   aaa  1@aaa.com     '}
  // req.body = testerJOB

  serverSideValidation(req, res, template, function (validatedResponse) {
    var validationErrors = false

    if (validatedResponse.status === 'err') {
      return next(validatedResponse.message)

    } else {
      for (var prop in validatedResponse) {
        if (validatedResponse[prop].error === 'empty' || validatedResponse[prop].error === 'invalid') {
          validationErrors = true
          break;

        }
      }
    }

    if (!validationErrors) {
      if (validatedResponse['email'].error === 'registered') {
        // Nodemailer will be initiated here +++++++
        sendJSONresponse(res, 201, { 'response': 'success' })

      } else {
        sendJSONresponse(res, 201, { 'response': 'success' })

      }
      
    } else {
      sendJSONresponse(res, 201, { 'response': 'error' })

    }
  })
}

var validateMaxLengthUserInput = function (val,maxlen) {
  var newVal = (val.length) - maxlen
  newVal = (val.length) - newVal
  newVal = val.slice(0,newVal)
  return newVal
}

module.exports.ajaxLoginUser = function (req, res, next) {
  // res.app.locals.foober = true
  var template = {email: 'required',
                  password: 'required', 
                  expectedResponse: 'true'}

  var testerJOB = {email: 'aaa1@aa a.com',
                    password: '  pppp   '}
  // req.body = testerJOB

  serverSideValidation(req, res, template, function (validatedResponse) {
    var validationErrors = false

    if (validatedResponse.status === 'err') {
      return next(validatedResponse.message)

    } else {
      for (var prop in validatedResponse) {
        if (validatedResponse[prop].error !== false && validatedResponse[prop].error !== 'match') {
          validationErrors = true
          break

        }
      }
    }

    if (!validationErrors) {
      passport.authenticate('local', function (err, user, info) {
        if (err) {
          return next(err)

        }

        if (!user) {
          sendJSONresponse(res, 201, { 'response': 'error' })
          return

        }

        req.logIn(user, function (err) {
          if (err) { 
            return next(err)

          } else {
            user.previouslogin = user.lastlogin
            user.lastlogin = new Date()

            user.save(function (err, success) {
              if (err) {
                return next(err)

              } else {
                sendJSONresponse(res, 201, { 'response': 'success', 'redirect': 'https://localhost:3000/userhome' })

              }
            })
          }
        })
      })(req, res)
    } else {
      sendJSONresponse(res, 201, { 'response': 'error', 'validatedData': validatedResponse })

    }
  })
}

module.exports.ajaxSignUpUser = function (req, res, next) {
  var template = {displayname: 'required', 
                        email: 'required',
                        confirmEmail: 'required', 
                        password: 'required', 
                        confirmPassword: 'required',
                        firstname: 'required', 
                        lastname: 'required', 
                        city: 'required', 
                        state: 'required',
                        expectedResponse: 'false'}

  var testerJOB = {displayname: ' displaynameABC123',
                    email: 'aaa1@aaa.com',
                    confirmEmail: '        aaa@aaa.com     ',
                    password: 'pppp',
                    confirmPassword: 'pppp ',
                    firstname: '          Abcdefghijklmnopqrst             ',
                    lastname: '   Ccccc Cityyyyyyyy     ',
                    city: '               AbcdefghijklmnopqrstUvwxyzabcdefghIjklmnopqrstuvwxyz          ',
                    state: 'NY'}

  var testerJOB2 = {displayname: ' displaynameABC123',
                    email: 'aaa1@aaa.com',
                    confirmEmail: '        aaa@aaa.com     ',
                    password: 'pppp',
                    confirmPassword: 'pppp '}
  // req.body = testerJOB2

  serverSideValidation(req, res, template, function (validatedResponse) {
    var validationErrors = false

    if (validatedResponse.status === 'err') {
      return next(validatedResponse.message)

    } else {
      for (var prop in validatedResponse) {
        if (validatedResponse[prop].error !== false && validatedResponse[prop].error !== 'match') {
          validationErrors = true
          break

        }
      }
    }

    if (!validationErrors) {
      var newUser = new User()

      // var stateFull = stateNamer(req, res, req.body.state)

      // req.body.state = {
        // full: stateFull,
        // initials: req.body.state
      // }

      newUser.displayname = req.body.displayname
      newUser.email = req.body.email
      newUser.firstname = req.body.firstname
      newUser.lastname = req.body.lastname
      newUser.city = req.body.city
      newUser.state = req.body.state

      newUser.setPassword(req.body.password, function (err, result) {
        if (err) {
          return next(err);

        } else {
          newUser.save(function (err) {
            if (err) {
              return next(err)

            } else {
              passport.authenticate('local', function (err, user, info) {
                if (err) {
                  return next(err)

                }

                if (!user) {
                  sendJSONresponse(res, 201, { 'response': 'error' })
                  return
        
                }

                if (user) {
                  req.logIn(user, function (err) {
                    if (err) { 
                      return next(err)

                    }

                    req.session.save(function (err) {
                      if (err) {
                        return next(err)

                      }
                      sendJSONresponse(res, 201, { 'response': 'success', 'redirect': 'https://localhost:3000/userhome' })
                    })
                  })
                }
              })(req, res, next)
            }
          })
        }
      })

    }else{
      sendJSONresponse(res, 201, { 'response': 'error', 'validatedData': validatedResponse })

    }
  })
}
