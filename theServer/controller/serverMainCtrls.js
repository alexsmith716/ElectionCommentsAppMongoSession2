
var fs  = require('fs')
var https   = require('https')
var request = require('request')
var passport = require('passport')
var pugCompiler = require('../../shared/pugCompiler')
var mailer = require('../../shared/mailer')
var sanitizeInputModule = require('../../shared/sanitizeInput')
require('../../shared/sessionPrototype')
var customError = require('../../shared/customError')
var serverSideValidation = require('../../shared/serverSideValidation')
var stateNamer = require('../../shared/stateNamer')
var customError = require('../../shared/customError')
var customObjectEnumerable = require('../../shared/customObjectEnumerable')
var renderableErrorObject = require('../../shared/renderableErrorObject')
var url = require('url')
var auth = require('basic-auth')

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

var apiOptions = {
  server : 'https://localhost:3000'
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'https://my-awesome-app123.com';
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

var handleError = function (req, res, statusCode) {
  // ++++++++++++++++++++++++++++++++++++++
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getLogout = function (req, res, next) {
  req.logout()

  req.session.destroy(function (err) {
    if (err) {
      return next(err)
    } else {
      res.redirect('/')

    }
  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getIndex = function (req, res, next) {
  var htitle = 'Election App 2016!'
  var stitle = 'Log In or Sign Up to join the discussion'
  res.render('indexView', {
    pageHeader: {
      title: htitle
    },
    subtitle: stitle
  })
}
/*
module.exports.getIndex = function(req, res, next){
  var newCustomError;
  var requestOptions, path;
  path = '/api/index';

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };

  request(requestOptions, function(err, response) {
    //return next(createError(400, 'Bad Request.'));

    if(res.app.locals.foober === true){
      //res.app.locals.foober = false;
      //return next(createError(400, 'Bad Request.'));
    }

    if(err){
      return next(err);

    }else if (response.statusCode === 200) {
      var htitle = 'Election App 2016!';
      var stitle = 'Log In or Sign Up to join the discussion';
      res.render('indexView', {
        pageHeader: {
          title: htitle
        },
        subtitle: stitle
      })

    }else{
      newCustomError = new Error('Bad Request');
      newCustomError.status = 400;
      return next(newCustomError);

    }
  });
};
*/


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
module.exports.getComments = function(req, res){
  var requestOptions, path;
  path = '/api/comments';
  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  request(requestOptions, function(err, response, body) {
    if(err){
      handleError(req, res, err);
    }else if (response.statusCode === 200) {
      var htitle = 'Election App 2016!';
      var stitle = 'Log In or Sign Up to join the discussion';
      var message;
      if (!(body instanceof Array)) {
        message = 'API path error!';
        body = [];
      } else {
        if (!body.length) {
          //message = 'No data found!';
        }
      }
      res.render('commentsView', {
        csrfToken: req.csrfToken(),
        sideBlurb: 'The 2016 presidential election is upon us! Who do you support and what are your comments regarding this hotly contested event?',
        responseBody: body,
        message: message
      })
    }else{
      handleError(req, res, response.statusCode);
    }
  });
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
module.exports.postMainComment = function(req, res){
  var requestOptions, path, postdata;
  path = '/api/comments/mainComment';

  postdata = {
    displayname: res.locals.currentUser.displayname,
    commenterId: res.locals.currentUser.id,
    city: res.locals.currentUser.city,
    state: res.locals.currentUser.state,
    candidate: req.body.candidate,
    comment: req.body.comment
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };

  if (!postdata.displayname || !postdata.commenterId || !postdata.city || !postdata.state || !postdata.candidate || !postdata.comment) {
    m = 'All Sign up fields required';
    res.redirect('/comments/?err='+m);
  } else {
    request(requestOptions, function(err, httpResponse, body) {
      if (httpResponse.statusCode === 201) {
        res.redirect('/comments');
      } else if (httpResponse.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
          m = 'Error has ocurred (serverMainCtrls.js > requestAddNewComment)';
          res.redirect('/comments/?err='+m);
      } else {
          handleError(req, res, httpResponse.statusCode);
      }
    });
  }
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
module.exports.postSubComment = function(req, res){
  var requestOptions, path, postdata;
  var sanitizeSubcommentid = sanitizeInputModule(req.params.subcommentid);
  path = '/api/comments/subcomment/' + sanitizeSubcommentid;

  postdata = {
    displayname: res.locals.currentUser.displayname,
    commenterId: res.locals.currentUser.id,
    city: res.locals.currentUser.city,
    state: res.locals.currentUser.state,
    comment: req.body.comment
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };

  if (!postdata.displayname || !postdata.commenterId || !postdata.city || !postdata.state || !postdata.comment) {
    m = 'All Comment Reply fields required';
    res.redirect('/comments/subcomment/' + sanitizeInput1 + '/?err='+m);
  } else {
    request(requestOptions, function(err, response, body) {
      if (response.statusCode === 201) {
        res.redirect('/comments');
      } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
          m = 'Error has ocurred > serverMainCtrls.js > postSubComment)';
          res.redirect('/comments/subcomment/' + sanitizeInput1 + '/?err='+m);
      } else {
          handleError(req, res, response.statusCode);
      }
    });
  }
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
module.exports.getAddNewComment = function(req, res) {
    res.render('addNewCommentView', {
    title: 'MEANCRUDApp',
    sideBlurb: 'The 2016 presidential election is upon us! Who do you support and what are your comments regarding this hotly contested event?'
    });

};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getLogin = function (req, res, next) {
  req.session.regenerate(function (err) {
    if (err) {
      return next(err)

    } else {
      console.log('######### SERVER ########### getLogin ++++')

      res.render('login', {
        csrfToken: req.csrfToken()
      })
    }
  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getSignup = function (req, res, next) {
  req.session.regenerate(function (err) {
    if (err) {
      return next(err)

    } else {
      res.render('signup', {
        csrfToken: req.csrfToken()

      })
    }
  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
module.exports.getUserHome = function (req, res) {
  res.render('userHome', { err: req.session.renderableErr }, function (err, html) {
    if (err) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserHome 1 >>>>>>>>>>>>>>>>>>>>>>>>>> err: ', err)
    } else {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserHome 2 >>>>>>>>>>>>>>>>>>>>>>>>>>')
      req.session.renderableErr = null
      res.send(html)
    }
  })
}

module.exports.getUserHomeX = function (req, res) {
  res.render('', { err: req.session.renderableErr }, function (err, html) {
    if (err) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserHome 1 >>>>>>>>>>>>>>>>>>>>>>>>>> err: ', err)
    } else {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserHome 2 >>>>>>>>>>>>>>>>>>>>>>>>>>')
      req.session.renderableErr = null
      res.send(html)
    }
  })
}
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getUserProfile = function (req, res, next) {
  var newCustomError
  var requestOptions, path
  path = '/api/userprofile/' + res.locals.currentUser.id
  // var referer = url.parse(req.headers['referer']).pathname
  var referer = res.locals.referer

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 1<<<<<<<<<<<<<<<<<<<<<<<<<<<< req.headers: ', req.headers)

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    auth : {'username': res.locals.currentUser.email, 'password': res.locals.currentUser.datecreated.toISOString()},
    json : {'referer': referer}
  }
  // res.locals.currentUser.email

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 1<<<<<<<<<<<<<<<<<<<<<<<<<<<< DDDCCCC!!!: ', res.locals.currentUser.datecreated.toISOString())

  request(requestOptions, function (err, response, body) {

    // server-side error 
    if (err) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 2<<<<<<<<<<<<<<<<<<<<<<<<<<<<ERR err: ', err)
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 2<<<<<<<<<<<<<<<<<<<<<<<<<<<<ERR referer: ', referer)
      req.session.renderableErr = renderableErrorObject(err)
      res.redirect(referer)
      // res.redirect('/userhomex')


    } else if (response.statusCode === 200) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
      
      res.locals.currentUser.stateFull = stateNamer(req, res, body.state)

      res.render('userProfile', {
        csrfToken: req.csrfToken(),
        responseBody: body
      })

    // api-side error 
    } else {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<BODY: ', body)
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<BODY.referer: ', body.referer)
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<BODY.stack: ', body.stack)
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<BODY.Stack: ', body.Stack)
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<BODY.name: ', body.name)
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<BODY.message: ', body.message)
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<BODY.status: ', body.status)
      req.session.renderableErr = renderableErrorObject(body)
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVER > getUserProfile 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<req.session.renderableErr: ', req.session.renderableErr)
      res.redirect(referer)

    }

  })
}


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getMembersOnly = function (req, res) {
  res.render('membersonly', {
    title: 'Members Only Page',
    pageHeader: {
      header: 'Hello Authorized Users!'
    }
  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.renderNotifyError = function (req, res) {

}

module.exports.getNotifyError = function (req, res, next) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> getNotifyError > notifyErrorMessageObject <<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

  res.render('notifyError', {
    //
  })
}
/*
module.exports.renderNotifyError = function (req, res) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> renderNotifyError <<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

  if (req.session.notifyErrorMessageObject) {
    res.locals.notifyErrorMessageObject = req.session.notifyErrorMessageObject
  }

  var notifyMessage = 'A website error recently occurred, please try to Log In or Sign Up again. If this problem continues, please contact customer service.'
  var notifyMessageType = 'danger'

  res.render('notifyError', {
    message: notifyMessage,
    type: notifyMessageType
  })

}

module.exports.getNotifyError = function (req, res, next) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> getNotifyError > notifyErrorMessageObject <<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

  req.logout()
  req.session.destroy(function (err) {
    if (err) {
      return next(err)
    } else {
      res.redirect('/rendernotifyerror')
    }
  })
}
*/
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getLoginOrSignup = function (req, res) {
  res.render('loginorsignup', {
    /* +++++++= */
  })
}

module.exports.getResouces = function (req, res) {
  res.render('basicView', {
    title: 'Resources',
    header: 'Resouces!',
    content: 'ThisGreatApp! is all about people sharing their favorite novelties across America.\n\nAut tenetur sit quam aliquid quia dolorum voluptate. Numquam itaque et hic reiciendis. Et eligendi quidem officia maiores. Molestiae ex sed vel architecto nostrum. Debitis culpa omnis perspiciatis vel eum. Vitae doloremque dolor enim aut minus.\n\nPossimus quaerat enim voluptatibus provident. Unde commodi ipsum voluptas ut velit. Explicabo voluptas at alias voluptas commodi. Illum et nihil ut nihil et. Voluptas iusto sed facere maiores.'
  })
}

module.exports.getDummyPage = function (req, res) {
  res.render('basicView', {
    title: 'Dummy Test Page',
    header: 'Dummy Test Page!',
    content: 'Dummy Page content.\n\nThisGreatApp! is all about people sharing their favorite novelties across America.\n\nAut tenetur sit quam aliquid quia dolorum voluptate. Numquam itaque et hic reiciendis. Et eligendi quidem officia maiores. Molestiae ex sed vel architecto nostrum. Debitis culpa omnis perspiciatis vel eum. Vitae doloremque dolor enim aut minus.\n\nPossimus quaerat enim voluptatibus provident. Unde commodi ipsum voluptas ut velit. Explicabo voluptas at alias voluptas commodi. Illum et nihil ut nihil et. Voluptas iusto sed facere maiores.v'
  })
}

module.exports.getAbout = function (req, res) {
  res.render('basicView', {
    title: 'About',
    header: 'About!',
    content: 'ThisGreatApp! is all about people sharing their favorite novelties across America.\n\nAut tenetur sit quam aliquid quia dolorum voluptate. Numquam itaque et hic reiciendis. Et eligendi quidem officia maiores. Molestiae ex sed vel architecto nostrum. Debitis culpa omnis perspiciatis vel eum. Vitae doloremque dolor enim aut minus.\n\nPossimus quaerat enim voluptatibus provident. Unde commodi ipsum voluptas ut velit. Explicabo voluptas at alias voluptas commodi. Illum et nihil ut nihil et. Voluptas iusto sed facere maiores.'
  })
}

module.exports.getContact = function (req, res) {
  res.render('basicView', {
    title: 'Contact',
    header: 'Contact!',
    content: 'ThisGreatApp! can be contacted by calling 1-800-555-1234.\n\nDolorem necessitatibus aliquam libero magni. Quod quaerat expedita at esse. Omnis tempora optio laborum laudantium culpa pariatur eveniet consequatur.'
  })
}

module.exports.getTeam = function (req, res) {
  res.render('basicView', {
    title: 'Team',
    header: 'Meet the Team',
    content: 'The team behind ThisGreatApp! are a dedicated bunch who enjoy sharing favorite places and experiences.\n\nAt vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.'
  })
}

module.exports.getCustomerService = function (req, res) {
  res.render('basicView', {
    title: 'Customer Service',
    header: 'ThisGreatApp\'s Customer Service',
    content: 'We at ThisGreatApp are dedicated to providing the highest level of customer service.\n\nAt vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.'
  })
}
