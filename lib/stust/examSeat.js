var fs = require('fs');
var request = require('request');
var iconv 	= require('iconv-lite');
var cheerio = require('cheerio');
var moment	= require('moment');
var stustJar = require('./stustJar');

var viewState = ''
var eventValidation = ''

var login = function( req, res, usr, pass, callback) {
	"use strict";
	let j = stustJar.getPortalJar(req);
	request({
			url: 'https://portal.stust.edu.tw/examseat/login.aspx',
			method: "GET",
			followAllRedirects: true,
		}, function (e, r, b) {
			var $ = cheerio.load(b);
			viewState = $('#__VIEWSTATE').val();
			eventValidation = $('#__EVENTVALIDATION').val();
			request.post({
						url: 'https://portal.stust.edu.tw/examseat/login.aspx',
						encoding: null,
						jar: j,
						form: {
							__EVENTTARGET:                                  '',
							__EVENTARGUMENT: 								'',
							__VIEWSTATE:                                    viewState,
							__EVENTVALIDATION:                              eventValidation,
							txtStud_No: 									usr,
							txtPasswd: 										pass,
							Button1: 										'登入',
						},			
						headers: {
					referer: 'https://portal.stust.edu.tw/examseat/Default.aspx'
				}
			}, 	function(error, response, body){
					request.get({
						url: 'https://portal.stust.edu.tw/examseat/Default.aspx',
						jar: j,
					}, 	function(eee, rrr, bbb){
						res.cookie( 'stustPortalCookie',
									j.getCookieString('https://portal.stust.edu.tw/'),
									{ expires: new Date(Date.now() + 600000), httpOnly: true});
						callback();
						}
					)
				}
				
			)
		}
	)
}
 



var displyExamSeat = function( req, res, callback ) {
	"use strict";
	let j = stustJar.getPortalJar(req);
	var ExamSeatTableArr = []
	var examTypeValue
	request.get({
			url: 'http://portal.stust.edu.tw/examseat/Default.aspx',
			jar: j,
	}, 	function(eee, rrr, bbb){
		var $ = cheerio.load(bbb);
		viewState = $('#__VIEWSTATE').val();
		eventValidation = $('#__EVENTVALIDATION').val();
		examTypeValue = $('#exam_type_0').val();
		request.post({
			url: 'http://portal.stust.edu.tw/examseat/Default.aspx',
			jar: j,
			form: {
			__EVENTTARGET:                                  '',
			__EVENTARGUMENT: 								'',
			__VIEWSTATE:                                    viewState,
			__EVENTVALIDATION:                              eventValidation,
			exam_type: 										examTypeValue, 
			Button1: 										'開始查詢'
			},			
			headers: {
				referer: 'http://portal.stust.edu.tw/examseat/Default.aspx'
			},
		}, 	function(error, response, body){
			request.get({
			url: 'http://portal.stust.edu.tw/examseat/ShowResult.aspx',
			jar: j,
			}, 	function(eee, rrr, bbb){
					let $ = cheerio.load(bbb);
					var count;
					$("#DataGrid1 tbody tr").each(function(i, elem){
				        let itemArr = 		$(elem).find('td');
				        let date = 			$(itemArr[0]).text()
				        let period = 		$(itemArr[1]).text()
				        let time_of_exam = 	$(itemArr[2]).text()
				        let room = 			$(itemArr[3]).text()
				        let row = 			$(itemArr[4]).text()
				        let column = 		$(itemArr[5]).text()
				        let subject = 		$(itemArr[6]).text()
				        let class_name = 	$(itemArr[7]).text()
				        let teacher = 		$(itemArr[8]).text()

						ExamSeatTableArr.push({
						    date,
						    period,
						    time_of_exam,
						    room,
						    row,
						    column,
						    subject,
						    class_name,
						    teacher
						});

						count = i;
					});

					if (count == 0){
						callback();
					}else{
						callback(ExamSeatTableArr);
					}

				return;
				}
			)}
		)
	})

}

module.exports.login 		= login;
module.exports.displyExamSeat = displyExamSeat;
