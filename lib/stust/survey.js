var fs = require('fs');
var request = require('request');
var iconv 	= require('iconv-lite');
var cheerio = require('cheerio');
var moment	= require('moment');
var stustJar = require('./stustJar');

var login = function(req, res, usr, pass, callback) {
	let j = stustJar.getEportalJar(req);
	request.get({
		url: 'https://eportal.stust.edu.tw/teaching_feedback/Stud_FeedBack.aspx',
		jar: j,
	},function(error, response, body) {	
		res.cookie('stustFlipCookie', j.getCookieString('http://flip.stust.edu.tw/'));
		callback();
		}
	)
}

var Notice = function(req, res, usr, pass, callback	) {
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
			
		console.log(EventTableArr, CommentTableArr, BulletinTableArr, Event_hrefs, Comment_hrefs, Bulletin_hrefs)
		return callback(EventTableArr, CommentTableArr, BulletinTableArr, Event_hrefs, Comment_hrefs, Bulletin_hrefs);
	})
}	

module.exports.Notice = Notice;
module.exports.login = login;


