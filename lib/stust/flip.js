var fs = require('fs');
var request = require('request');
var iconv 	= require('iconv-lite');
var cheerio = require('cheerio');
var moment	= require('moment');
var stustJar = require('./stustJar');

var login = function(req, res, usr, pass, callback) {
	let j = stustJar.getFlipJar(req);
	request.get({
		url: 'http://flip.stust.edu.tw/service/loginagent/?account=' + usr + '&password=' + pass,
		jar: j,
	},function(error, response, body) {	
		res.cookie('stustFlipCookie', j.getCookieString('http://flip.stust.edu.tw/'));
		callback();
		}
	)
}

var Notice = function(req, res, usr, callback) {
	"use strict";
	let j = stustJar.getFlipJar(req);
	
	var EventTableArr = [];
	var CommentTableArr = [];
	var BulletinTableArr = [];
	var NoticeTableArr = [];
	
	var Event_hrefs = [];
	var Comment_hrefs = [];
	var Bulletin_hrefs = [];
	

	request.get({
		url: 'http://flip.stust.edu.tw/user/' + usr + '/myCourse',
		jar: j,
	},function(error, response, body) {	
		let $ = cheerio.load(body)
		
			$("#eventTbody tr").each(function(i, elem){
				let itemArr = 		$(elem).find('td');
				var item = 			$(itemArr[0]).text().split(/\. |[\(]|[\)]/);
				var item_class = 	$(itemArr[1]).text().split("_");
				let num = 			item[0];
				let title = 		item[1];
				let date = 			item[item.length-2];
				let course = 		item_class[0];
				let _class = 		item_class[1];
					
				EventTableArr.push({
						num,
						title,
						date,
						course,
						_class,
				});
			});
			
			$("#commentTbody tr").each(function(i, elem){
				let itemArr = 		$(elem).find('td');
				var item = 			$(itemArr[0]).text().split(/\. |[\(]|[\)]/);
				var item_class = 	$(itemArr[1]).text().split("_");
				let num = 			item[0];
				let title = 		item[1];
				let date = 			item[item.length-2];
				let course = 		item_class[0];
				let _class = 		item_class[1];
				
				CommentTableArr.push({
						num,
						title,
						date,
						course,
						_class,
				});
			});			
			
			$("#bulletinTbody tr").each(function(i, elem){
				let itemArr = 		$(elem).find('td');
				var item = 			$(itemArr[0]).text().split(/\. |[\(]|[\)]/);
				var item_class = 	$(itemArr[1]).text().split("_");
				let num = 			item[0];
				let title = 		item[1];
				let date = 			item[item.length-2];
				let course = 		item_class[0];
				let _class = 		item_class[1];
				
				BulletinTableArr.push({
						num,
						title,
						date,
						course,
						_class,
				});
			});
			
			$('#eventTbody tr a').each(function() {
				var link = $(this).attr('href');

				if(link && link.match(/exercise/)){
						Event_hrefs.push({link});
				};
			});	
			
			$("#commentTbody tr a").each(function() {
				var link = $(this).attr('href');
				
				if(link && link.match(/course/)){
						Comment_hrefs.push({link});
				};
			});	
			
			$('#bulletinTbody tr a').each(function() {
				var link = $(this).attr('href');
				    
				if(link && link.match(/bulletin/)){
						Bulletin_hrefs.push({link});
				};
			});
		return callback(EventTableArr, CommentTableArr, BulletinTableArr, Event_hrefs, Comment_hrefs, Bulletin_hrefs);
	})
}

var getCourseUrl = function(req, res, usr, callback){
	"use strict"
	
	let j = stustJar.getFlipJar(req);
	var courseNameArr = [];
	var courseHrefs = [];

	var teacherNameArr = [];
	var teacherHrefs = [];

	request.get({
			url: 'http://flip.stust.edu.tw/user/' + usr + '/myCourse',
			jar: j,
		},function(error, response, body) {	
			let $ = cheerio.load(body)
			$("#xboxL-inline .body .info").each(function(i, elem){
				let itemArr = $(elem).find('a');
				var course = 	$(itemArr[0]).text().trim().split("_");
				var teacher = 	$(itemArr[1]).text().trim().split("_");
				course = course[0]
				courseNameArr.push({course})
				teacherNameArr.push({teacher})
			});

			$("#xboxL-inline .body .info a").each(function(){
				var link = $(this).attr('href');
				if(link && link.match(/course/)){
					courseHrefs.push({link});
				};
			});
			$("#xboxL-inline .body .inst a").each(function(){
				var link = $(this).attr('href');
				if(link && link.match(/instructor/)){
					teacherHrefs.push({link});
				};

			});
			return callback(courseNameArr, courseHrefs, teacherNameArr, teacherHrefs);

		}
	)
}

module.exports.getCourseUrl = getCourseUrl;
module.exports.Notice = Notice;
module.exports.login = login;
