
var express = require('express')
var router = express.Router()
var apiControllers = require('../controller/apiMainCtrls')
var cookieParser = require('cookie-parser')
var auth = require('../../shared/auth')
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })

// router.get('/index', csrfProtection, apiControllers.getIndexResponse)

router.get('/comments', csrfProtection, apiControllers.getCommentsResponse)
router.post('/comments/maincomment', csrfProtection, apiControllers.postMainCommentResponse)
router.post('/comments/subcomment/:subcommentid', csrfProtection, apiControllers.postSubCommentResponse)
router.get('/:commentid', csrfProtection, apiControllers.getOneCommentResponse)

router.get('/userprofile/:userid', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.getUserProfileResponse)

router.post('/loginuser', csrfProtection, apiControllers.ajaxLoginUser)

router.post('/forgotpassword', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.ajaxForgotPassword)

router.post('/signupuser', csrfProtection, apiControllers.ajaxSignUpUser)

router.put('/evaluateuserprofile', csrfProtection, apiControllers.ajaxEvaluateUserProfile)

router.put('/userprofileemailpass', csrfProtection, apiControllers.ajaxUserProfileEmailPass)

router.post('/evaluateuseremail', csrfProtection, apiControllers.ajaxEvaluateUserEmail)

module.exports = router
