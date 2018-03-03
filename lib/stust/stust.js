// require Modules
fs = require('fs');
var http = require('http');
var request = require('request');
var iconv 	= require('iconv-lite');
var stustJar = require('./stustJar');
var moment	= require('moment');
const cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;

var viewState = ''
var eventValidation = ''

var userAgentCheck = function(browser, userIP, usr, usrName){

	var os = 'unknown'
	if(browser.match(/Mobile\/*/) ? true : false){
		//Moblie
		if(browser.match(/(iPhone)+/g) ? true : false){
			//Iphone
			os = "iOS"
		}else if(browser.match(/(Linux; Android)+/g) ? true : false){
			//Android
			os = "Android"
		}else{
			//Other Moblie OS
			os = "Other"
		}
	}else{ 	//PC
		if(browser.match(/(Windows)+/g) ? true : false){
			//is Windows
			os = "Windows"
		}else if(browser.match(/(Mac)+/g) ? true : false){
			//is MAC
			os = "Mac"
		}else if(browser.match(/(Linux)+/g) ? true : false){
			//is Linux
			os = "Linux"
		}else{
			//Other OS
			os = "Other"
		}
	} 

	var Browser = "Chrome"
	if (browser.match(/Chrome\//) ? true : false){
		if(browser.match(/Edge\//) ? true : false){
			Browser = "Edge";
		}
		if(browser.match(/Opera|OPR\//) ? true : false){
			Browser = "Opera";
		}
	}else if(browser.match(/Firefox|FxiOS\//) ? true : false){
		Browser = "Firefox";
	}else if(browser.match(/Safari\//) ? true : false){
		Browser = "Safari";
	}else if(browser.match(/.NET\//) ? true : false){
		Browser = "IE";
	}else{
		Browser = "Other";
	}

	var date = new Date();
 	var userLoginYear = date.getFullYear()
 	var userLoginMonth = date.getMonth()+1
 	var userLoginDay = date.getDate()
	var userLoginHour = date.getHours();
	//console.log("H:" + userLoginHour);
	//MongoDB 沒有架設請註解
	MongoClient.connect("mongodb://herokuR:STUSTv1Master@ds117758.mlab.com:17758/stust-master",function(err,db){
		if(err) throw err;
		//Write databse Insert/Update/Query code here..
		db.collection('userData',function(err,collection){
			collection.insert({	Browser: Browser, 
								System: os,
								userID: usr,
								loginYear: userLoginYear ,
								loginMonth: userLoginMonth, 
								loginDay: userLoginDay ,
								loginHour: userLoginHour, 
								loginIP: userIP,
								});
		});
		db.close(); //關閉連線
	});
}

var login = function( usr, pass, req, res, callback) {
	"use strict";
	let j = stustJar.getClassJar(req);

	request({
			url: 'http://course.stust.edu.tw/CourSel/Login.aspx',
			method: "GET",
			followAllRedirects: true,
		}, function (e, r, body) {
				var $ = cheerio.load(body);
				viewState = $('#__VIEWSTATE').val();
				eventValidation = $('#__EVENTVALIDATION').val();
				request.post({
							url: 'http://course.stust.edu.tw/CourSel/Login.aspx',
							// jar: j,
							encoding: null,
							jar: j,
							headers: {
								referer: 'http://course.stust.edu.tw/CourSel/Board.aspx'
							},
							form: {
								__EVENTTARGET:                                  '',
								__EVENTARGUMENT: 								'',
								__VIEWSTATE:                                   	viewState,
								__EVENTVALIDATION:                              eventValidation,
								Login1$UserName: 								usr,
								Login1$Password: 								pass,
								Login1$LoginButton: 							'登入',
							}
					}, 	function(error, response, body){
						request.get({
								url: 'http://course.stust.edu.tw/CourSel/Board.aspx',
								jar: j,
						}, 	function(eee, rrr, bbb){

							let $ = cheerio.load(bbb);
							var classTableArr = []
							$("#ctl00_lab_show_pname").each(function(i, elem){
							    let usrName = $(elem).text().replace(/[\r\n\t ]/g,'')
								res.cookie('name', ( usrName  == null ? '' : usrName));
								res.cookie('loginId', usr);
								res.cookie('loginPass', pass);
								res.cookie('PageLogin', j.getCookieString('http://course.stust.edu.tw/') );

								userAgentCheck(req.headers['user-agent'], req.connection.remoteAddress, usr, usrName);
							});

							callback();
							}
						);}
				);
		});
} 

// export modules
module.exports.login = login;


