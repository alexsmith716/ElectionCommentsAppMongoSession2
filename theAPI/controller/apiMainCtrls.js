
var User = require('../model/userSchema.js');
var Comment = require('../model/commentsSchema');
var paginate = require('mongoose-range-paginate');
var pugCompiler = require('../../shared/pugCompiler');
var nodemailer = require('nodemailer');
var passport = require('passport');
var mongoose    = require('mongoose');
var serverSideValidation = require('../../shared/serverSideValidation.js');
var evaluateUserEmail = require('../../shared/evaluateUserEmail.js');
var stateNamer = require('../../shared/stateNamer.js');

var sortKey = 'time'
var sort = '-' + sortKey
var sortDocsFrom = 0;

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.getIndexResponse = function(req, res) {
  sendJSONresponse(res, 200), { "response": "getIndexResponse Response!!!" };
};

module.exports.getUserHomeResponse = function(req, res) {
  sendJSONresponse(res, 200), { "response": "getUserHomeResponse Response!!!" };
};

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


function getQuery() {
  return Comment.find()
    .where({})
}

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


module.exports.getUserProfileResponse = function(req, res) {
  if (req.params && req.params.userid) {
    User.findById(req.params.userid).exec(function(err, user) {
        if (!user) {
          sendJSONresponse(res, 404, { "response": "userid not found" });
          return;
        } else if (err) {
          sendJSONresponse(res, 404, err);
          return;
        }
        sendJSONresponse(res, 200, user);
      });
  } else {
    sendJSONresponse(res, 404, { "response": "No userid in request" });
  }
};


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


module.exports.editOneComment = function(req, res) {
  //
};

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



module.exports.updateUserResponse = function(req, res) {
  if (!req.params.userid) {
    sendJSONresponse(res, 404, { "response": "All fields required" });
    return;
  }
  User.findById(req.params.userid).exec(function(err, user) {
    if (err) {
      sendJSONresponse(res, 400, err);
      return;
    } 
    if (!user || user === null) {
      sendJSONresponse(res, 404, user);
      return;
    }
    user.previouslogin = user.lastlogin;
    user.lastlogin = new Date();
    user.save(function(err, success) {
      if (err) {
        sendJSONresponse(res, 404, err);
      } else {
        sendJSONresponse(res, 200, success);
      }
    });
  });
};


module.exports.ajaxEvaluateRegisteredUser = function(req, res, next) {

  if(!req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, { 'message': 'error' });
  }else{

    passport.authenticate('local', function(err, user, info){
      if (err) {
        sendJSONresponse(res, 404, { 'message': 'error' });
        return;
      }
      if (info) {

        // returns message either incorrect username or password
        sendJSONresponse(res, 401, { 'message': 'error' });
        return;

      }
      if(user){

        sendJSONresponse(res, 201, { 'message': 'success' });

      }
    })(req, res, next);
  }
};




/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */




module.exports.ajaxEvaluateUserProfile = function(req, res, next) {

	var errResponse = {'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyError'};
	var reqBody = req.body;
  var reqBodyProp;
  var reqBodyValue;
	var template = {};
	var templateMain = {email: 'required',
	                      confirmEmail: 'required', 
	                      password: 'required', 
	                      confirmPassword: 'required',
	                      firstname: 'required', 
	                      lastname: 'required', 
	                      city: 'required', 
	                      state: 'required'};

  if(Object.keys(req.body).length == 2){

    for (var p in reqBody){

      if(p !== '_csrf') {

        reqBodyProp = p;
        reqBodyValue = reqBody[reqBodyProp];

        if(reqBodyProp in templateMain){

          template[reqBodyProp] = 'required';
          template['expectedResponse'] = 'false';

          serverSideValidation(req, res, template, function(validatedResponse) {

            var validationErrors = false;

            if(validatedResponse.status === 'err') {

              return next(validatedResponse.message);

            }else{

              for(var prop in validatedResponse) {

                // needs to be tested 
                //validatedResponse[prop].error !== false && validatedResponse[prop].error !== 'match'
                if(validatedResponse[prop].error === 'empty' || validatedResponse[prop].error === 'invalid'){

                  validationErrors = true;
                  break;

                }
              }
            }

            if(!validationErrors){

                User.findById(res.locals.currentUser.id).exec(function(err, user) {

                  if(err){

                    return next(err);

                  }

                  if(!user){

                    sendJSONresponse(res, 201, { 'response': 'error' });
                    return;

                  }

                  if(reqBodyProp === 'state'){

                    var stateInit = stateNamer(req, res, reqBodyValue);

                    reqBodyValue = {
                      full: reqBodyValue,
                      initials: stateInit
                    };

                  }

                  user[reqBodyProp] = reqBodyValue;

                  user.save(function(err) {
                  
                    if (err) {
                    
                      return next(err);
                    
                    } else {
                    
                      sendJSONresponse(res, 201, { 'response': 'success' });
                    
                    }
                  
                  });
          
                });
              
            }else{

              sendJSONresponse(res, 201, { 'response': 'error', 'validatedData': validatedResponse });

            }
          });

        }
      }
      break;
    }

  }else{

    sendJSONresponse(res, 400, errResponse);

  }
};




module.exports.ajaxEvaluateUserEmail = function(req, res) {

  evaluateUserEmail(req.body.email, req.body.expectedResponse, function(response) {

    if(response.status === 'err'){

      return next(response.message);

    }else{

      sendJSONresponse(res, response.status, { 'response': response.response });

    }

  });
  
};



// will include nodemailer for ForgotPassword later/last
// for client, only testing if email is invalid, otherwise indicating instructions sent to reset password
// but instructions only really sent if email is a registered email

module.exports.ajaxForgotPassword = function(req, res, next) {

  var template = {email: 'required',
                  expectedResponse: 'false'};

  var testerJOB = {email: '   aaa  1@aaa.com     '};

  //req.body = testerJOB;

  serverSideValidation(req, res, template, function(validatedResponse) {

    var validationErrors = false;

    if(validatedResponse.status === 'err') {

      return next(validatedResponse.message);

    }else{

      for(var prop in validatedResponse) {

        if(validatedResponse[prop].error === 'empty' || validatedResponse[prop].error === 'invalid'){

          validationErrors = true;
          break;

        }
      }
    }

    if(!validationErrors){

      if(validatedResponse['email'].error === 'registered'){

        // Nodemailer will be initiated here +++++++
        sendJSONresponse(res, 201, { 'response': 'success' });

      }else{

        sendJSONresponse(res, 201, { 'response': 'success' });

      }
      
    }else{
      
      sendJSONresponse(res, 201, { 'response': 'error' });

    }
  });
};



var validateMaxLengthUserInput = function (val,maxlen) {
  var newVal = (val.length) - maxlen;
  newVal = (val.length) - newVal;
  newVal = val.slice(0,newVal);
  return newVal;
};



module.exports.ajaxLoginUser = function(req, res, next){

  var template = {email: 'required',
                  password: 'required', 
                  expectedResponse: 'true'};

  var testerJOB = {email: 'aaa1@aa a.com',
                    password: '  pppp   '};

  // req.body = testerJOB;

  serverSideValidation(req, res, template, function(validatedResponse) {

    var validationErrors = false;

    if(validatedResponse.status === 'err') {

      return next(validatedResponse.message);

    }else{

      for(var prop in validatedResponse) {

        if(validatedResponse[prop].error !== false && validatedResponse[prop].error !== 'match'){

          validationErrors = true;
          break;

        }
      }
    }

    if(!validationErrors){

      passport.authenticate('local', function(err, user, info){

        if (err) {

          return next(err);

        }

        if (!user) {

          sendJSONresponse(res, 201, { 'response': 'error' });
          return;

        }

        req.logIn(user, function(err) {
          
          if (err) { 

            return next(err);

          }else{

            user.previouslogin = user.lastlogin;
            user.lastlogin = new Date();

            user.save(function(err, success) {

              if (err) {

                return next(err);

              } else {

                sendJSONresponse(res, 201, { 'response': 'success', 'redirect': 'https://localhost:3000/userhome' });

              }

            });

          }
        });
      })(req, res);

    }else{
      
      sendJSONresponse(res, 201, { 'response': 'error', 'validatedData': validatedResponse });

    }
  });
};


module.exports.ajaxSignUpUser = function(req, res, next){

  var template = {displayname: 'required', 
                        email: 'required',
                        confirmEmail: 'required', 
                        password: 'required', 
                        confirmPassword: 'required',
                        firstname: 'required', 
                        lastname: 'required', 
                        city: 'required', 
                        state: 'required',
                        expectedResponse: 'false'};

  var testerJOB = {displayname: ' displaynameABC123',
                    email: 'aaa1@aaa.com',
                    confirmEmail: '        aaa@aaa.com     ',
                    password: 'pppp',
                    confirmPassword: 'pppp ',
                    firstname: '          Abcdefghijklmnopqrst             ',
                    lastname: '   Ccccc Cityyyyyyyy     ',
                    city: '               AbcdefghijklmnopqrstUvwxyzabcdefghIjklmnopqrstuvwxyz          ',
                    state: 'New York'};

  var testerJOB2 = {displayname: ' displaynameABC123',
                    email: 'aaa1@aaa.com',
                    confirmEmail: '        aaa@aaa.com     ',
                    password: 'pppp',
                    confirmPassword: 'pppp '};

  //req.body = testerJOB2;

  serverSideValidation(req, res, template, function(validatedResponse) {

    var validationErrors = false;

    if(validatedResponse.status === 'err') {

      return next(validatedResponse.message);

    }else{

      for(var prop in validatedResponse) {

        if(validatedResponse[prop].error !== false && validatedResponse[prop].error !== 'match'){

          validationErrors = true;
          break;

        }
      }

    }

    if(!validationErrors){

      var newUser = new User();

      var stateFull = stateNamer(req, res, req.body.state);

      req.body.state = {
        full: stateFull,
        initials: req.body.state
      };

      newUser.displayname = req.body.displayname;
      newUser.email = req.body.email;
      newUser.firstname = req.body.firstname;
      newUser.lastname = req.body.lastname;
      newUser.city = req.body.city;
      newUser.state = req.body.state;

      newUser.setPassword(req.body.password, function(err, result){

        if (err) {

          return next(err);

        }else{

          newUser.save(function(err) {

            if (err) {

              return next(err);

            } else {

              passport.authenticate('local', function(err, user, info){

                if (err) {

                  return next(err);

                }

                if (!user) {
        
                  sendJSONresponse(res, 201, { 'response': 'error' });
                  return;
        
                }

                if(user){

                  req.logIn(user, function(err) {

                    if (err) { 

                      return next(err);

                    }

                    req.session.save(function (err) {

                      if (err) {

                        return next(err);

                      }

                      sendJSONresponse(res, 201, { 'response': 'success', 'redirect': 'https://localhost:3000/userhome' });

                    });

                  });

                }
                
              })(req, res, next);

            }

          });

        }
      });

    }else{

      sendJSONresponse(res, 201, { 'response': 'error', 'validatedData': validatedResponse });

    }

  });
};

