
var express = require('express')
var router = express.Router()
var apiControllers = require('../controller/apiMainCtrls')
var cookieParser = require('cookie-parser')
var auth = require('../../shared/auth')
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/loginuser', csrfProtection, apiControllers.ajaxLoginUser)
router.post('/signupuser', csrfProtection, apiControllers.ajaxSignUpUser)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/forgotpassword', csrfProtection, apiControllers.ajaxForgotPassword)
router.put('/evaluateuserprofile', csrfProtection, apiControllers.ajaxEvaluateUserProfile)
router.put('/newuserdataitem', csrfProtection, apiControllers.ajaxNewUserDataItem)

router.post('/validatedataservice', csrfProtection, auth.ensureAuthenticated, apiControllers.ajaxValidateDataService)

router.post('/evaluateuseremail', csrfProtection, apiControllers.ajaxEvaluateUserEmail)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/userprofile/:userid', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.getUserProfileResponse)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
router.get('/comments', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.getCommentsResponse)
router.post('/comments/maincomment', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.postMainCommentResponse)
router.post('/comments/subcomment/:subcommentid', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.postSubCommentResponse)
router.get('/:commentid', csrfProtection, auth.ensureAuthenticatedAPI, apiControllers.getOneCommentResponse)

module.exports = router
