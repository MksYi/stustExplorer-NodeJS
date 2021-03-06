var request = require('request');

var getClassJar = function(req) {
	"use strict";

	let jar = request.jar();

	if (req 
		&& req.cookies 
		&& req.cookies.PageLogin
		&& (req.cookies.PageLogin != '') ) {

		req.cookies.PageLogin.split(';').map(function (val) { 
			jar.setCookie( request.cookie(val), 'https://course.stust.edu.tw' );			
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
