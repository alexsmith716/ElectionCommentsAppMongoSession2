
var cookieParser = require('cookie-parser')
var csrf = require('csurf')
var bodyParser = require('body-parser')
var express = require('express')
var router = express.Router()
var serverControllers = require('../controller/serverMainCtrls')
var nocache = require('nocache')
var auth = require('../../shared/auth')
var csrfProtection = csrf({ cookie: true })

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.use(function (req, res, next) {
  next()
})

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/', serverControllers.getIndex)
router.get('/loginorsignup', serverControllers.getLoginOrSignup)
router.get('/dummypage', serverControllers.getDummyPage)
router.get('/resources', serverControllers.getResouces)
router.get('/about', serverControllers.getAbout)
router.get('/contact', serverControllers.getContact)
router.get('/team', serverControllers.getTeam)
router.get('/customerservice', serverControllers.getCustomerService)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/signup', csrfProtection, serverControllers.getSignup)
router.get('/login', csrfProtection, serverControllers.getLogin)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// router.get('/rendernotifyerror', serverControllers.renderNotifyError)
router.get('/notifyerror', serverControllers.getNotifyError)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/userhome', auth.ensureAuthenticated, serverControllers.getUserHome)
router.get('/membersonly', auth.ensureAuthenticated, serverControllers.getMembersOnly)
router.get('/userprofile', csrfProtection, auth.ensureAuthenticated, serverControllers.getUserProfile)
router.get('/logout', auth.ensureAuthenticated, serverControllers.getLogout)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// holding off on updating comments for next project version +++++++++++++++++++++++++++++++
router.get('/comments', csrfProtection, auth.ensureAuthenticated, serverControllers.getComments)
router.post('/comments/maincomment', csrfProtection, auth.ensureAuthenticated, serverControllers.postMainComment)
router.post('/comments/subcomment/:subcommentid', csrfProtection, auth.ensureAuthenticated, serverControllers.postSubComment)

module.exports = router
