
var express = require('express')
var router = express.Router()
var apiControllers = require('../controller/apiMainCtrls')
var cookieParser = require('cookie-parser')
var auth = require('../../shared/auth')
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    console.log('+++++++++++++ API ROUTES > AUTHENTICATED ++++++++++++')
  }else{
    console.log('+++++++++++++ API ROUTES > NOT AUTHENTICATED ++++++++++++')
  }
  next()
})

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/loginuser', csrfProtection, apiControllers.ajaxLoginUser)
router.post('/signupuser', csrfProtection, apiControllers.ajaxSignUpUser)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/forgotpassword', csrfProtection, apiControllers.ajaxForgotPassword)
router.put('/evaluateuserprofile', csrfProtection, apiControllers.ajaxEvaluateUserProfile)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/evaluateuseremail', csrfProtection, apiControllers.ajaxEvaluateUserEmail)

router.post('/validatenewemailpasswordservice', csrfProtection, auth.ensureAuthenticated, apiControllers.ajaxValidateNewEmailPasswordService)
router.put('/newuserdataitem', csrfProtection, auth.ensureAuthenticated, auth.ensureAuthenticatedNewUserDataItem, apiControllers.ajaxNewUserDataItem)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/userprofile/:userid', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.getUserProfileResponse)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
router.get('/comments', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.getCommentsResponse)
router.post('/comments/maincomment', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.postMainCommentResponse)
router.post('/comments/subcomment/:subcommentid', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.postSubCommentResponse)
router.get('/:commentid', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.getOneCommentResponse)

module.exports = router
