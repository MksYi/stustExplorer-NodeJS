var fs = require('fs');
var request = require('request');
var iconv 	= require('iconv-lite');
var stustJar = require('./stustJar');
var cheerio = require('cheerio');

var displyNowAbsenteeism = function( req, res, callback ) {
	"use strict";

	let classTableArr = [];

	let j = stustJar.getClassJar(req);

	request.get(
	{
		url: 'https://course.stust.edu.tw/CourSel/Pages/MyTimeTable.aspx',
		encoding: null,
		jar: j,
	},
	function(e, r, b)
	{
		let body = iconv.decode(b, 'utf-8');
		if (body.indexOf('登入') > -1) {
			callback(null);
			return;
		}
		let $ = cheerio.load(body, {decodeEntities: false});
		/* STUST Class Table */
		var week = {'ClassTime':'', 'Monday':'', 'Tuesday':'', 'Wednesday':'', 'Thursday':'', 'Friday':'', 'Saturday':''};
		var weekList = ['ClassTime', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		let count = weekList.length;

		$("#ctl00_ContentPlaceHolder1_dg_dt tbody tr").each(function(i, elem){
			let aboutTime = $(elem).find('td');
			let aboutCourse = $(aboutTime).find('span');


			if($(aboutTime[0]).html()){
				var data = $(aboutTime[0]).html().replace(/<(font|\/font)[^>]*>/g, "").split(/<br>*| ~ /)

				week[weekList[0]] = { 	'ClassNo': 	data[0], /* 第3節 */
										'ClassStart': 	data[1], /* 10:10 */
										'ClassEnd':		data[2]} /* 11:00 */
			}

			for (var i = 1; i < count; i++) {
				if($(aboutCourse[i-1]).html()){
					var data = $(aboutCourse[i-1]).html().replace('<br>','').split(/<br>*|\ /);

					week[weekList[i]] = {	'Course': 		data[0], /* 程式設計 */
											'TearcherName': data[1], /* 隔壁老王 */
											'ClassRoom': 	data[2]};/* C309 */
				}else{
					week[weekList[i]] = {	'Course': 		'', 
											'TearcherName': '', 
											'ClassRoom': 	''};
				}
			}

			classTableArr.push({
				'ClassTime': week[weekList[0]],
				'Monday': week[weekList[1]],
				'Tuesday': week[weekList[2]],
				'Wednesday': week[weekList[3]],
				'Thursday': week[weekList[4]],
				'Friday': week[weekList[5]],
				'Saturday': week[weekList[6]],
			})
		});
		callback(classTableArr);
		return;
	});
}



// export modules
module.exports.displyNowAbsenteeism = displyNowAbsenteeism;
