var fs = require('fs');
var request = require('request');

var getCourseCookies = function(req){
	let jar = request.jar();

	if (req 
		&& req.cookies 
		&& req.cookies.PageLogin
		&& (req.cookies.PageLogin != '') ) {

		req.cookies.PageLogin.split(';').map(function (val) { 
			jar.setCookie( request.cookie(val), 'http://course.stust.edu.tw' );			
		});
	}
	return jar;
}


var getClassJar = function(req) {
	"use strict";

	let jar = request.jar();

	if (req 
		&& req.cookies 
		&& req.cookies.PageLogin
		&& (req.cookies.PageLogin != '') ) {

		req.cookies.PageLogin.split(';').map(function (val) { 
			jar.setCookie( request.cookie(val), 'http://course.stust.edu.tw' );			
		});
	}
	
	return jar;
}


var getMoodleJar = function(req) {
	"use strict";
	
	let jar = request.jar();

	if (req 
		&& req.cookies 
		&& req.cookies.isuMoodleCookie
		&& (req.cookies.isuMoodleCookie != '') ) {
		
		req.cookies.isuMoodleCookie.split(';').map(function (val) { 
			jar.setCookie( request.cookie(val), 'http://moodle.isu.edu.tw' );			
		});
	}

	return jar;
}

var getPortalJar = function(req) {
	"use strict";
	let jar = request.jar();

	if (req 
		&& req.cookies 
		&& req.cookies.stustPortalCookie
		&& (req.cookies.stustPortalCookie != '') ) {
		
		req.cookies.stustPortalCookie.split(';').map(function (val) { 
			jar.setCookie( request.cookie(val), 'http://portal.stust.edu.tw/' );			
		});
	}

	return jar;
}

var getEportalJar = function(req) {
	"use strict";
	let jar = request.jar();

	if (req 
		&& req.cookies 
		&& req.cookies.stustEportalCookie
		&& (req.cookies.stustEportalCookie != '') ) {
		
		req.cookies.stustEportalCookie.split(';').map(function (val) { 
			jar.setCookie( request.cookie(val), 'https://eportal.stust.edu.tw' );			
		});
	}

	return jar;
}

var getFlipJar = function(req) {
	"use strict";
	let jar = request.jar();

	if (req 
		&& req.cookies 
		&& req.cookies.stustFlipCookie
		&& (req.cookies.stustFlipCookie != '') ) {
		
		req.cookies.stustFlipCookie.split(';').map(function (val) { 
			jar.setCookie( request.cookie(val), 'http://flip.stust.edu.tw/' );
		});
	}

	return jar;
}


module.exports.getFlipJar 	= getFlipJar;
module.exports.getClassJar 	= getClassJar;
module.exports.getPortalJar = getPortalJar;
module.exports.getEportalJar= getEportalJar;
module.exports.getMoodleJar = getMoodleJar;