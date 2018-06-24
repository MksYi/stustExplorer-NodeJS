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
		res.cookie( 'stustFlipCookie',
					j.getCookieString('http://flip.stust.edu.tw/'),
					{ expires: new Date(Date.now() + 1200000), httpOnly: true });
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
	var Notice_hrefs = [];
	

	request.get({
		url: 'http://flip.stust.edu.tw/user/' + usr + '/myCourse',
		encoding: null,
		jar: j,
	},function(error, response, b) {	
		let body = iconv.decode(b, 'utf-8');
		if (body.indexOf('上次登入') == -1) {
			callback(null, null, null, null, null, null, null, null);
			return;
		}
		let $ = cheerio.load(body)
		/* Event Start */
		$('#eventTbody tr a').each(function() {
			var link = $(this).attr('href');

			if(link && link.match(/exercise/)){
					Event_hrefs.push({link});
			};
		});	

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
		/* Event End */
		
		/* Comment Start */
		$("#commentTbody tr a").each(function() {
			var link = $(this).attr('href');
			
			if(link && link.match(/course/)){
					Comment_hrefs.push({link});
			};
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
		/* Comment End */
		
		/* Bulletin Start */
		$('#bulletinTbody tr a').each(function() {
			var link = $(this).attr('href');
			
			if(link && link.match(/bulletin/)){
					Bulletin_hrefs.push({link});
			};
		});

		for (var i = 0; i < Bulletin_hrefs.length; i++) {
			var elem = 			$("#bulletin_tr" + i);
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
		}
		/* Bulletin End */

		/* Notice Start */
		request.get({
			url: 'http://flip.stust.edu.tw/user/' + usr + '/newest/doclist',
			encoding: null,
			jar: j,
		},function(error, response, bb) {
			let body = iconv.decode(bb, 'utf-8');
			if (body.indexOf('上次登入') == -1) {
				callback(EventTableArr, CommentTableArr, BulletinTableArr, null, Event_hrefs, Comment_hrefs, Bulletin_hrefs, null);;
				return;
			}
			let $ = cheerio.load(body)

			$("#docTbody tr").each(function(i, elem){
				let itemArr = 		$(elem).find('td');
				let item = 			$(itemArr).text().split(/\s*[\t\n\Z]\s*/)
				var item_class = 	item[2].split("_");
				let num = 			item[0];
				let title = 		item[1];
				let course = 		item_class[0];
				let _class = 		item_class[1].substr(0, item_class[1].length - 5);
				let date = 			item_class[1].substr(item_class[1].length - 5);

				NoticeTableArr.push({
						num,
						title,
						date,
						course,
						_class,
				});
			});
				$('#docTbody tr a').each(function() {
					var link = $(this).attr('href');
					
					if(link && link.match(/media/)){
							Notice_hrefs.push({link});
					};
				});
		/* Notice Start */
				callback(EventTableArr, CommentTableArr, BulletinTableArr, NoticeTableArr, Event_hrefs, Comment_hrefs, Bulletin_hrefs, Notice_hrefs);
			return 

		});
		return 
	})
}

var getFlipCourseUrlAndMainEvent = function(req, res, usr, callback){
	"use strict"
	let j = stustJar.getFlipJar(req);

	var courseNameArr = [];
	var courseHrefs = [];

	var teacherNameArr = [];
	var teacherHrefs = [];

	var NewEventArr = [];
	var CommentEventArr = [];
	var Bulletin_hrefs = [];
	var BulletinEventArr = [];
	var NoticeEventArr = [];
	request.get({
		url: 'http://flip.stust.edu.tw/user/' + usr + '/myCourse',
		encoding: null,
		jar: j,
	},function(error, response, b) {
		let body = iconv.decode(b, 'utf-8');
		if (body.indexOf('上次登入') == -1) {
			callback(null, null, null, null);
			return;
		}
		let $ = cheerio.load(body)

		/* Course & Tercher Url Start */
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
		/* Course & Tercher Url End */

		/* Course Event Start */
		$("#eventTbody tr").each(function(i, elem){
			let itemArr = 		$(elem).find('td');
			var item = 			$(itemArr[0]).text().split(/\. |[\(]|[\)]/);
			var item_class = 	$(itemArr[1]).text().split("_");
			let num = 			item[0];
			let course = 		item_class[0];
			if(num == "沒有資料"){
				return false;
			}					
			NewEventArr.push({course});
		});

		$("#commentTbody tr").each(function(i, elem){
			let itemArr = 		$(elem).find('td');
			var item = 			$(itemArr[0]).text().split(/\. |[\(]|[\)]/);
			var item_class = 	$(itemArr[1]).text().split("_");
			let num = 			item[0];
			let course = 		item_class[0];
			if(num == "沒有資料"){
				return false;
			}				
			CommentEventArr.push({course});
		});			

		/* Bulletin Start */
		$('#bulletinTbody tr a').each(function() {
			var link = $(this).attr('href');
			
			if(link && link.match(/bulletin/)){
					Bulletin_hrefs.push({link});
			};
		});

		for (var i = 0; i < Bulletin_hrefs.length; i++) {
			var elem = 			$("#bulletin_tr" + i);
			let itemArr = 		$(elem).find('td');
			var item = 			$(itemArr[0]).text().split(/\. |[\(]|[\)]/);
			var item_class = 	$(itemArr[1]).text().split("_");
			let num = 			item[0];
			let course = 		item_class[0];
			if(num == "沒有資料"){
				return false;
			}			
			BulletinEventArr.push({course});
		}
		/* Bulletin End */

		/* Notice Start */
		request.get({
			url: 'http://flip.stust.edu.tw/user/' + usr + '/newest/doclist',
			encoding: null,
			jar: j,
		},function(error, response, bb) {
			let body = iconv.decode(bb, 'utf-8');
			if (body.indexOf('上次登入') == -1) {
				callback(courseNameArr, courseHrefs, teacherNameArr, teacherHrefs, NewEventArr, CommentEventArr, BulletinEventArr, NoticeEventArr);
				return;
			}
			let $ = cheerio.load(body)

			$("#docTbody tr").each(function(i, elem){
				let itemArr = 		$(elem).find('td');
				let item = 			$(itemArr).text().split(/\s*[\t\n\Z]\s*/)
				var item_class = 	item[2].split("_");
				let num = 			item[0];
				let course = 		item_class[0];
				if(num > 10){
					return false;
				}
				NoticeEventArr.push({course});
			});
			
		/* Notice Start */
			function dedup(arr) {
				var hashTable = {};

				return arr.filter(function (el) {
					var key = JSON.stringify(el);
					var match = Boolean(hashTable[key]);

					return (match ? false : hashTable[key] = true);
				});
			}

			NewEventArr = dedup(NewEventArr);
			CommentEventArr = dedup(CommentEventArr);
			BulletinEventArr = dedup(BulletinEventArr);
			NoticeEventArr = dedup(NoticeEventArr);
			/* Course Event End */	
			callback(courseNameArr, courseHrefs, teacherNameArr, teacherHrefs, NewEventArr, CommentEventArr, BulletinEventArr, NoticeEventArr);
			return 
		});
		return 
	});
}


module.exports.getFlipCourseUrlAndMainEvent = getFlipCourseUrlAndMainEvent;
module.exports.Notice = Notice;
module.exports.login = login;
