
var fs  = require('fs')
var https   = require('https')
var request = require('request')
var passport = require('passport')
var pugCompiler = require('../../shared/pugCompiler')
var mailer = require('../../shared/mailer')
var sanitizeInputModule = require('../../shared/sanitizeInput')
var serverSideValidation = require('../../shared/serverSideValidation')
var stateNamer = require('../../shared/stateNamer')
var url = require('url')
var auth = require('basic-auth')
var path = require('path')
var pug = require('pug')

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
    }

    res.redirect('/')

  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getIndex = function (req, res, next) {

  var locals = { 
    pageHeader: {
      title: 'Election App 2016!'
    },
    subtitle: 'Log In or Sign Up to join the discussion'
  }

  res.render('indexView', locals, function (err, html) {

    if (err) {
      return next(err)

    } else {
      res.send(html)
    }
  })
}

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
  request(requestOptions, function(err, code, body) {
    if(err){
      handleError(req, res, err);
    }else if (code.statusCode === 200) {
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
      handleError(req, res, code.statusCode);
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
    request(requestOptions, function(err, code, body) {
      if (code.statusCode === 201) {
        res.redirect('/comments');
      } else if (code.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
          m = 'Error has ocurred (serverMainCtrls.js > requestAddNewComment)';
          res.redirect('/comments/?err='+m);
      } else {
          handleError(req, res, code.statusCode);
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
    request(requestOptions, function(err, code, body) {
      if (code.statusCode === 201) {
        res.redirect('/comments');
      } else if (code.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
          m = 'Error has ocurred > serverMainCtrls.js > postSubComment)';
          res.redirect('/comments/subcomment/' + sanitizeInput1 + '/?err='+m);
      } else {
          handleError(req, res, code.statusCode);
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

  // var jsonString
  // req.session.renderableErr ? jsonString = req.session.renderableErr : null

  res.render('login', { csrfToken: req.csrfToken(), err: req.session.renderableErr }, function (err, html) {

    if (err) {
      return next(err)
    }

    req.session.renderableErr ? req.session.renderableErr = null : null
    res.send(html)

  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getSignup = function (req, res, next) {
  res.render('signup', { csrfToken: req.csrfToken(), validateEmailService: 'usersignup' }, function (err, html) {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getUserHome = function (req, res, next) {

  res.render('userHome', { err: req.session.renderableErr }, function (err, html) {

    if (err) {
      return next(err)
    }

    req.session.renderableErr ? req.session.renderableErr = null : null
    res.send(html)

  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getUserProfile = function (req, res, next) {
  var requestOptions, path
  path = '/api/userprofile/' + res.locals.currentUser.id

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    auth : {'username': res.locals.currentUser.email, 'password': res.locals.currentUser.datecreated.toISOString()},
    json : {}
  }
  // res.locals.currentUser.email

  request(requestOptions, function (err, code, body) {

    if (err) {

      next(err)

    } else if (code.statusCode === 200) {

      res.locals.currentUser.stateFull = stateNamer(body.state)

      res.render('userProfile', {
        csrfToken: req.csrfToken(),
        responseBody: body,
        validateEmailService: 'userprofile'
      })

    } else {

      next(body)

    }
  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getMembersOnly = function (req, res, next) {
  var locals = { 
    title: 'Members Only Page',
    pageHeader: {
      header: 'Hello Authorized Users!'
    }
  }
  res.render('membersonly', locals, function (err, html) {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getNotifyError = function (req, res, next) {
  res.render('notifyError', { err: req.session.renderableErr }, function (err, html) {
    if (err) {
      return next(err)
    }
    req.session.renderableErr ? req.session.renderableErr = null : null
    res.send(html)
  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getLoginOrSignup = function (req, res, next) {
  res.render('loginorsignup', function (err, html) {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

module.exports.getResouces = function (req, res, next) {
  var locals = { 
    title: 'Resources',
    header: 'Resouces!',
    content: 'ThisGreatApp! is all about people sharing their favorite novelties across America.\n\nAut tenetur sit quam aliquid quia dolorum voluptate. Numquam itaque et hic reiciendis. Et eligendi quidem officia maiores. Molestiae ex sed vel architecto nostrum. Debitis culpa omnis perspiciatis vel eum. Vitae doloremque dolor enim aut minus.\n\nPossimus quaerat enim voluptatibus provident. Unde commodi ipsum voluptas ut velit. Explicabo voluptas at alias voluptas commodi. Illum et nihil ut nihil et. Voluptas iusto sed facere maiores.'
    }
  res.render('basicView', locals, function (err, html) {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

module.exports.getDummyPage = function (req, res, next) {
  var locals = { 
    title: 'Dummy Test Page',
    header: 'Dummy Test Page!',
    content: 'Dummy Page content.\n\nThisGreatApp! is all about people sharing their favorite novelties across America.\n\nAut tenetur sit quam aliquid quia dolorum voluptate. Numquam itaque et hic reiciendis. Et eligendi quidem officia maiores. Molestiae ex sed vel architecto nostrum. Debitis culpa omnis perspiciatis vel eum. Vitae doloremque dolor enim aut minus.\n\nPossimus quaerat enim voluptatibus provident. Unde commodi ipsum voluptas ut velit. Explicabo voluptas at alias voluptas commodi. Illum et nihil ut nihil et. Voluptas iusto sed facere maiores.v'
    }
  res.render('basicView', locals, function (err, html) {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

module.exports.getAbout = function (req, res, next) {
  var locals = { 
    title: 'About',
    header: 'About!',
    content: 'ThisGreatApp! is all about people sharing their favorite novelties across America.\n\nAut tenetur sit quam aliquid quia dolorum voluptate. Numquam itaque et hic reiciendis. Et eligendi quidem officia maiores. Molestiae ex sed vel architecto nostrum. Debitis culpa omnis perspiciatis vel eum. Vitae doloremque dolor enim aut minus.\n\nPossimus quaerat enim voluptatibus provident. Unde commodi ipsum voluptas ut velit. Explicabo voluptas at alias voluptas commodi. Illum et nihil ut nihil et. Voluptas iusto sed facere maiores.'
    }
  res.render('basicView', locals, function (err, html) {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

module.exports.getContact = function (req, res, next) {
  var locals = { 
    title: 'Contact',
    header: 'Contact!',
    content: 'ThisGreatApp! can be contacted by calling 1-800-555-1234.\n\nDolorem necessitatibus aliquam libero magni. Quod quaerat expedita at esse. Omnis tempora optio laborum laudantium culpa pariatur eveniet consequatur.'
    }
  res.render('basicView', locals, function (err, html) {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

module.exports.getTeam = function (req, res, next) {
  var locals = { 
    title: 'Team',
    header: 'Meet the Team',
    content: 'The team behind ThisGreatApp! are a dedicated bunch who enjoy sharing favorite places and experiences.\n\nAt vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.'
    }
  res.render('basicView', locals, function (err, html) {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

module.exports.getCustomerService = function (req, res, next) {
  var locals = { 
    title: 'Customer Service',
    header: 'ThisGreatApp\'s Customer Service',
    content: 'We at ThisGreatApp are dedicated to providing the highest level of customer service.\n\nAt vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.'
    }
  res.render('basicView', locals, function (err, html) {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}
