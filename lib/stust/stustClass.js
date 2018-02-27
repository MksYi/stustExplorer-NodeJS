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
		url: 'http://course.stust.edu.tw/CourSel/Pages/MyTimeTable.aspx',
		encoding: null,
		jar: j,
	},
	function(e, r, b)
	{
		let body = iconv.decode(b, 'utf-8');
		if (body.indexOf('登入') > -1) {
			callback(null, null);
			return;
		}
		let $ = cheerio.load(body);
		/* STUST Class Table */
		$("#ctl00_ContentPlaceHolder1_dg_dt tbody tr").each(function(i, elem){
	        let itemArr = $(elem).find('td');
	        /*.replace(/[\A\n\Z\n] g,'')*/
	        let classTime = $(itemArr[0]).text().replace(/[\n\Z\n] */g,'')
	        let Monday = $(itemArr[1]).text().replace(/[\n\Z\n] */g,'')
	        let Tuesday = $(itemArr[2]).text().replace(/[\n\Z\n] */g,'')
	        let Wednesday = $(itemArr[3]).text().replace(/[\n\Z\n] */g,'')
	        let Thursday = $(itemArr[4]).text().replace(/[\n\Z\n] */g,'')
	        let Friday = $(itemArr[5]).text().replace(/[\n\Z\n] */g,'')
	        let Saturday = $(itemArr[6]).text().replace(/[\n\Z\n] */g,'')
	        /*let Sunday = $(itemArr[7]).text().replace(/[\A\n\Z\n] /g,'')*/

			Monday = Monday.split(" ")
			Tuesday = Tuesday.split(" ")
			Wednesday = Wednesday.split(" ")
			Thursday = Thursday.split(" ")
			Friday = Friday.split(" ")
			Saturday = Saturday.split(" ")

			if(Monday[0]) {
				Monday.push(Monday[0].substr(Monday[0].length - 3, Monday[0].length))
				Monday[0] = (Monday[0].substr(0, Monday[0].length - 3))
			}
			if(Tuesday[0]) {
				Tuesday.push(Tuesday[0].substr(Tuesday[0].length - 3, Tuesday[0].length))
				Tuesday[0] = (Tuesday[0].substr(0, Tuesday[0].length - 3))
			}
			if(Wednesday[0]) {
				Wednesday.push(Wednesday[0].substr(Wednesday[0].length - 3, Wednesday[0].length))
				Wednesday[0] = (Wednesday[0].substr(0, Wednesday[0].length - 3))
			}
			if(Thursday[0]) {
				Thursday.push(Thursday[0].substr(Thursday[0].length - 3, Thursday[0].length))}
				Thursday[0] = (Thursday[0].substr(0, Thursday[0].length - 3))
			if(Friday[0]) {
				Friday.push(Friday[0].substr(Friday[0].length - 3, Friday[0].length))
				Friday[0] = (Friday[0].substr(0, Friday[0].length - 3))
			}
			if(Saturday[0]) {
				Saturday.push(Saturday[0].substr(Saturday[0].length - 3, Saturday[0].length))
				Saturday[0] = (Saturday[0].substr(0, Saturday[0].length - 3))
			}
			//Tearcher
			if(!Monday[2]) {Monday[2] = ""}
			if(!Tuesday[2]) {Tuesday[2] = ""}
			if(!Wednesday[2]) {Wednesday[2] = ""}
			if(!Thursday[2]) {Thursday[2] = ""}
			if(!Friday[2]) {Friday[2] = ""}
			if(!Saturday[2]) {Saturday[2] = ""}

			//Class Room
			if(!Monday[1]) {Monday[1] = ""}
			if(!Tuesday[1]) {Tuesday[1] = ""}
			if(!Wednesday[1]) {Wednesday[1] = ""}
			if(!Thursday[1]) {Thursday[1] = ""}
			if(!Friday[1]) {Friday[1] = ""}
			if(!Saturday[1]) {Saturday[1] = ""}

			classTableArr.push({
				classTime,
				Monday,
				Tuesday,
				Wednesday,
				Thursday,
				Friday,
				Saturday
			});
		});
		return callback(classTableArr);;
	});
}



// export modules
module.exports.displyNowAbsenteeism = displyNowAbsenteeism;
