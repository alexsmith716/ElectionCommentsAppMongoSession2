
var express = require('express')
var router = express.Router()
var apiControllers = require('../controller/apiMainCtrls')
var cookieParser = require('cookie-parser')
var nocache = require('nocache')
var auth = require('../../shared/auth')
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.use(function (req, res, next) {
  next()
})

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/loginuser', csrfProtection, apiControllers.ajaxLoginUser)
router.post('/signupuser', csrfProtection, apiControllers.ajaxSignUpUser)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/forgotpassword', csrfProtection, apiControllers.ajaxForgotPassword)
router.put('/userprofile', csrfProtection, auth.ensureAuthenticated, apiControllers.ajaxEvaluateUserProfile)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/usersignup', csrfProtection, apiControllers.expectedResponseSignUp, apiControllers.ajaxEvaluateUserEmail)
router.post('/userprofile', csrfProtection, apiControllers.expectedResponseUserProfile, apiControllers.ajaxEvaluateUserEmail)

router.post('/validatenewuserdataservice', csrfProtection, auth.ensureAuthenticated, apiControllers.ajaxValidateNewUserDataService)

router.put('/newuserdatapathchange', csrfProtection, auth.ensureAuthenticated, auth.ensureAuthenticatedNewUserDataItem, apiControllers.ajaxNewUserDataItem)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/userprofile/:userid', csrfProtection, auth.basicAuthenticationAPI, apiControllers.getUserProfileResponse)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/comments', csrfProtection, auth.basicAuthenticationAPI, apiControllers.getCommentsResponse)
router.post('/comments/maincomment', csrfProtection, auth.basicAuthenticationAPI, apiControllers.postMainCommentResponse)
router.post('/comments/subcomment/:subcommentid', csrfProtection, auth.basicAuthenticationAPI, apiControllers.postSubCommentResponse)
router.get('/:commentid', csrfProtection, auth.basicAuthenticationAPI, apiControllers.getOneCommentResponse)

module.exports = router
