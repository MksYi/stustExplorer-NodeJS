// require Modules
var stust 	= require('../lib/stust/stust'); //Login
var flip = require('../lib/stust/flip'); //Flip
var stustClass = require('../lib/stust/stustClass'); //ClassDATA
var examSeat = require('../lib/stust/examSeat'); //ExamSeat
var search = require('../lib/stust/search')//Search
var analysis = require('../lib/stust/analysis')
var survey = require('../lib/stust/survey')
var moment = require('moment');
var express = require('express');
var router 	= express.Router();

/* Get Data Start */
router.route('/getAbsenteeism')
	.get(function(req, res){
		res.set({ 'content-type': 'application/json; charset=utf-8' });
		stustClass.displyNowAbsenteeism( req, res, function(classTableArr){
			res.end( JSON.stringify({classTableArr}, null, 10) );
		} );
	});

router.route('/getExamSeat')
	.get(function(req, res){
		res.set({ 'content-type': 'application/json; charset=utf-8' });
		examSeat.displyExamSeat( req, res, function(ExamSeatTableArr){
			res.end( JSON.stringify({ExamSeatTableArr}, null, 10) );
		});
	});

router.route('/getflipnotice')
	.get(function(req, res){
		res.set({ 'content-type': 'application/json; charset=utf-8' });
		flip.Notice( req, res, req.cookies.loginId, function( EventTableArr, CommentTableArr, BulletinTableArr, Event_hrefs, Comment_hrefs, Bulletin_hrefs){
			res.end(JSON.stringify({EventTableArr, CommentTableArr, BulletinTableArr, Event_hrefs, Comment_hrefs, Bulletin_hrefs}, null, 10));
		} );
	});

router.route('/getflipurl')
	.get(function(req, res){
		res.set({ 'content-type': 'application/json; charset=utf-8' });
		flip.getCourseUrl( req, res, req.cookies.loginId, function(courseNameArr, courseHrefs, teacherNameArr, teacherHrefs){
			res.end(JSON.stringify({courseNameArr, courseHrefs, teacherNameArr, teacherHrefs}, null, 10));
		} );
	});

router.route('/getUserAnalysis')
	.get(function(req, res){
		res.set({ 'content-type': 'application/json; charset=utf-8' });
		analysis.getUserData( req, res, function(BrowsersArr, SystemArr, ipArr, loginDate, loginCount, loginTotal, collegeDaysArr , collegeTotalArr, hourArr){
			res.end(JSON.stringify({BrowsersArr, SystemArr, ipArr, loginDate, loginCount, loginTotal, collegeDaysArr , collegeTotalArr, hourArr}, null, 10) );
		} );
	});
/* Get Data End */

/* About Search and Search API Start */
router.route('/api')
	.get(function(req, res){
		res.set({ 'content-type': 'application/json; charset=utf-8' });
		search.api(req, res, function(result){
			res.end(JSON.stringify(result, null, 10));
		});
	});

router.route('/search')
	.get(function(req, res){
		search.action(req, res, function(is_schoolSite, key){
			console.log('is_schoolSite: ' + is_schoolSite);
			console.log('GET: ' + key);
			if(is_schoolSite == "yes"){
				res.redirect(key);
			}else{
				res.redirect('https://www.google.com.tw/search?q=' + key);
			}
		});
	});
/* About Search and Search API End */

/* Building Start */
router.route('/getSurvey')
	.get(function(req, res){
		res.set({ 'content-type': 'application/json; charset=utf-8' });
		survey.getUserData( req, res, function(){
			res.end(JSON.stringify({}, null, 10) );
		} );
	});
/* Building End */

/* Page Router */
router.route('/about')
	.get(function(req, res){
		res.render('about.jade');			
	});

router.route('/examseat')
	.get(function(req, res) {
		if ( req.cookies && req.cookies.stustPortalCookie && (req.cookies.stustPortalCookie != '')){
			res.render('examSeat.jade',{usrName: req.cookies.name});			
		}
		else {
			examSeat.login( req, res, req.cookies.loginId, req.cookies.loginPass, function() {
					res.redirect('/examseat');
			});
		}
	});

router.route('/leave')
	.get(function(req, res) {
		res.render('leave.jade',{	usrName: req.cookies.name,
									eportalUsr: req.cookies.loginId,
									eportalPass: req.cookies.loginPass });
	});

router.route('/flip')
	.get(function(req, res) {
		if ( req.cookies && req.cookies.stustFlipCookie && (req.cookies.stustFlipCookie != '')){
			res.render('flip.jade',{usrName: req.cookies.name});			
		}
		else {
			flip.login( req, res, req.cookies.loginId, req.cookies.loginPass, function() {
				res.redirect('/flip');
			});
		}
	})

router.route('/stustSurvey')
	.get(function(req, res) {
		res.render('stustSurvey.jade',{usrName: req.cookies.name});
	})

router.route('/course')
	.get(function(req, res) {
		res.render('course.jade',{usrName: req.cookies.name});
	})

router.route('/analysis')
	.get(function(req, res) {
		res.render('analysis.jade',{usrName: req.cookies.name});
	})
/* Page Router End */


/* Logout (Normal) */
// Logout 		-> logout.jade 		-> act=logout
// Clear(cookie)-> logout Eportal 	-> LoginPage

/* Logout (TimeOut)*/
// Page 		->  act=logout & timeout=true
// 					LoginPage
router.route('/logout')
	.get(function(req, res){
		res.cookie('name', '' );
		res.cookie('stustPortalCookie', '' );
		res.cookie('stustFlipCookie', '' );
		res.cookie('PageLogin', '' );
		res.cookie('leaveLogin', '' );
		res.cookie('loginId', '' );
		res.cookie('loginPass', '' );
		res.render('logout.jade');
	})
/* Logout End */

router.route('/')
	.get(function(req, res){
		if ( req.query.act == 'logout' ) {
			if ( req.cookies.loginId && req.cookies.loginPass && req.query.timeout == 'true' )
				res.render('login.jade', {  defaultUsr: req.cookies.loginId,
											defaultPass: req.cookies.loginPass, 
											errorMsg: '登入逾時，已自動登出。',
											clearBtn: '= true' });
			else
				res.render('login.jade', {	defaultUsr:'',
											defaultPass:'',
											errorMsg: '已經登出。',
											clearBtn: '= false' });
			
		}else if ( req.query.act == 'login' ) {
			if ( req.cookies && req.cookies.name && (req.cookies.name != '') ) {
				flip.login( req, res, req.cookies.loginId, req.cookies.loginPass, function() {
					res.redirect('./');
				});
			}
			else 
				res.render('login.jade', { defaultUsr:'', defaultPass: '', errorMsg: '登入失敗, 帳號密碼不正確?' });
		}
		else {

			if ( req.cookies && req.cookies.name && (req.cookies.name  != '') && req.cookies.loginId && req.cookies.loginPass ) 
				res.render('mainPage.jade', { 	usrName: req.cookies.name,
												eportalUsr: req.cookies.loginId,
												eportalPass: req.cookies.loginPass });		
			
			else {
		
				if (req.cookies.loginId && req.cookies.loginPass )
					res.render('login.jade', {	defaultUsr:req.cookies.loginId,
												defaultPass:req.cookies.loginPass });
				else
					res.render('login.jade', { defaultUsr:'', defaultPass: '' });
			}
			
		}
	});

/* Main| Loging Event Start */
router.route('/')
	.post(function(req, res) {
		stust.login( req.body.usrId, req.body.usrPass, req, res, function(){
			res.redirect('./?act=login');
		});
	});
/* Main| Loging Event End */

// export module
module.exports = router;