
var cookieParser      = require('cookie-parser');
var csrf              = require('csurf');
var bodyParser        = require('body-parser');
var express 			    = require('express');
var router 				    = express.Router();
var serverControllers = require('../controller/serverMainCtrls');
var auth              = require('../../shared/auth');
var csrfProtection 		= csrf({ cookie: true });

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/', serverControllers.getIndex);
router.get('/loginorsignup', serverControllers.getLoginOrSignup);
router.get('/dummypage', serverControllers.getDummyPage);
router.get('/resources', serverControllers.getResouces);
router.get('/about', serverControllers.getAbout);
router.get('/contact', serverControllers.getContact);
router.get('/team', serverControllers.getTeam);
router.get('/customerservice', serverControllers.getCustomerService);

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/signup', csrfProtection, serverControllers.getSignup);
router.get('/login', csrfProtection, serverControllers.getLogin);

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/rendernotifyerror', serverControllers.renderNotifyError);
router.get('/notifyerror', serverControllers.getNotifyError);

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


router.get('/userhome', auth.ensureAuthenticated, serverControllers.getUserHome);

router.get('/membersonly', auth.ensureAuthenticated, serverControllers.getMembersOnly);

router.get('/comments', auth.ensureAuthenticated, csrfProtection, serverControllers.getComments);

router.post('/comments/maincomment', auth.ensureAuthenticated, csrfProtection, serverControllers.postMainComment);

router.post('/comments/subcomment/:subcommentid', auth.ensureAuthenticated, csrfProtection, serverControllers.postSubComment);

router.get('/userprofile', auth.ensureAuthenticated, csrfProtection, auth.noCache, serverControllers.getUserProfile);

router.get('/logout', auth.ensureAuthenticated, serverControllers.getLogout);

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = router;