
var express 		= require('express');
var router 			= express.Router();
var apiControllers 	= require('../controller/apiMainCtrls');
var auth            = require('../../shared/auth');
var cookieParser      = require('cookie-parser');
var csrf              = require('csurf');
var csrfProtection 		= csrf({ cookie: true });

router.get('/index', apiControllers.getIndexResponse);



router.get('/comments', apiControllers.getCommentsResponse);
router.post('/comments/maincomment', auth.ensureAuthenticated, apiControllers.postMainCommentResponse);
router.post('/comments/subcomment/:subcommentid', auth.ensureAuthenticated, apiControllers.postSubCommentResponse);



router.get('/userprofile/:userid', auth.ensureAuthenticated, apiControllers.getUserProfileResponse);
router.put('/login/:userid', apiControllers.updateUserResponse);
router.get('/:commentid', auth.ensureAuthenticated, apiControllers.getOneCommentResponse);



router.post('/loginuser', csrfProtection, apiControllers.ajaxLoginUser);
router.post('/forgotpassword', csrfProtection, apiControllers.ajaxForgotPassword);

router.post('/signupuser', csrfProtection, apiControllers.ajaxSignUpUser);
router.put('/evaluateuserprofile', auth.ensureAuthenticated, csrfProtection, apiControllers.ajaxEvaluateUserProfile);

router.post('/evaluateuseremail', csrfProtection, apiControllers.ajaxEvaluateUserEmail);

router.post('/evaluateregistereduser', apiControllers.ajaxEvaluateRegisteredUser);

module.exports = router;