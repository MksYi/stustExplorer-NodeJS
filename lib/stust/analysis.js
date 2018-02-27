// require Modules
fs = require('fs');
var request = require('request');
var iconv 	= require('iconv-lite');
var moment	= require('moment');
var MongoClient = require('mongodb').MongoClient;

//4			四技
// A3 		103學年
//   NN 	系所
//     XXX	流水號
//4A_NNXXX 
var Colleges = function(userID){
	var Engineering = {	"12":"機械工程系(自動化控制組)",
						"14":"機械工程系(微奈米技術組)",
						"15":"機械工程系(先進車輛組)",
						"G0":"資訊工程系",
						"36":"電子工程系(網路與通訊工程組)",
						"37":"電子工程系(晶片設計組)",
						"39":"電子工程系(系統應用組)",
						"3A":"電子工程系(微電子組)",
						"27":"電機工程系(生醫電子組)",
						"28":"電機工程系(電能資訊組)",
						"2C":"電機工程系(控制與晶片組)",
						"L0":"光電工程系",
						"40":"化學工程與材料工程系",
						"H0":"生物科技系"
					}
	var Business = {"1B":"企業電子化學位學程",
					"90":"資訊管理系",
					"B0":"休閒事業管理系",
					"M0":"餐旅管理系",
					"D0":"行銷與流通管理系",
					"A0":"會計資訊系",
					"52":"工業管理與資訊系(工業管理組)",
					"55":"工業管理與資訊系(電子商務組)",
					"60":"國際企業系",
					"80":"財務金融系",
					"70":"企業管理系"
					}
	var Humanities = {"C0":"應用英文系",
					  "E0":"應用日語系",
					  "I0":"幼兒保育系",
					  "1E":"高齡服務學士學位學程"
					 }
	var Digital = {	"J2":"視覺傳達設計系(商業設計組)",
					"J3":"視覺傳達設計系(動畫設計組)",
					"J5":"視覺傳達設計系(創意生活設計組)",
					"F0":"資訊傳播系",
					"1C":"創新產品設計系",
					"K0":"多媒體與電腦娛樂科學系",
					"1D":"流行音樂產業系"
				  }
	userID = userID.toUpperCase();
	for (var key in Engineering){
		if(key == userID)  {
			return "Engineering";
	  	}
	}
	for (var key in Business){
		if(key == userID)  {
			return "Business";
	  	}
	}
	for (var key in Humanities){
		if(key == userID)  {
			return "Humanities";
	  	}
	}
	for (var key in Digital){
		if(key == userID)  {
			return "Digital";
	  	}
	}
	return "unknown";
}


var getUserData = function(req, res, callback) {
	"use strict";
	var BrowsersArr = [["IE", 0], ["Edge", 0], ["Chrome", 0], ["Opera", 0], ["Firefox", 0], ["Safari", 0], ["Other", 0]];
	var SystemArr = [["Windows", 0], ["Mac", 0], ["Linux", 0], ["iOS", 0], ["Android", 0], ["Other", 0]];
	var ipArr = [["inSchool", 0], ["outSchool", 0]];
	var loginDate = [];
	var loginCount = [];
	var loginTotal = [];
	var collegeDaysArr = [[], [], [], [], []];
	var collegeTotalArr = [[], [], [], [], []];
	var hourArr = [[]];
	var url = "mongodb://herokuR:STUSTv1Master@ds117758.mlab.com:17758/stust-master";
	MongoClient.connect(url, function(err, db) {
	if (err) throw err;
		db.collection("userData").find({},{_id:0}).toArray(function(err, result) {
			if (err) throw err;
			db.close();

			var pushTmp = 0;
			var countTmp = 0;
			var	hourTmp = -1;
			var hourCount = 0;
			var hourArrCount = 0;
			var sw = 0;
			var collegePushTmpArr= [0, 0, 0, 0, 0];
			var collegeCountTmpArr= [0, 0, 0, 0, 0];
			var collegeCountArr = [0, 0, 0, 0, 0];

			for(var i in result) {
				//Hours Count
				if(hourTmp == -1 || hourTmp == result[i].loginHour){
					hourCount++;
				}else{
					hourArr[hourArrCount] = new Array()
					hourArr[hourArrCount++].push(Date.UTC(result[i].loginYear, result[i].loginMonth, result[i].loginDay, result[i].loginHour), hourCount);
					hourCount = 1;
				}
				hourTmp = result[i].loginHour;

				//Login Count
				loginDate.push(result[i].loginYear + "-" + result[i].loginMonth + "-" + result[i].loginDay);
				if(loginDate.length >= 2){
					if(loginDate[loginDate.length-1] == loginDate[loginDate.length-2]){
						loginDate.pop();
						countTmp = Number(i) + 1;
						sw = 0;

					}else{
						loginCount.push(Number(countTmp) - Number(pushTmp));
						for(var j = 0; j < collegeCountArr.length; j++){
							collegeDaysArr[j].push(collegeCountArr[j] - Number(collegePushTmpArr[j]));
							collegeCountTmpArr[j] = collegeCountArr[j];
						}

						if(sw == 0){
							pushTmp = countTmp;
							for(var j = 0; j < collegeCountArr.length; j++){
								collegePushTmpArr[j] = collegeCountTmpArr[j];
							}
							countTmp = Number(i) + 1;
							sw = 1;
						}
					}
				}

				//UserID analysis
				var college = Colleges(result[i].userID.substring(3, 5));
				if(college == "Engineering"){
					collegeCountArr[0]++; //Engineering
				}else if(college == "Business"){
					collegeCountArr[1]++; //Business
				}else if(college == "Humanities"){
					collegeCountArr[2]++; //Humanities
				}else if(college == "Digital"){
					collegeCountArr[3]++; //Digital
				}else{
					collegeCountArr[4]++; //unknown
				}

				//About IP 
				var ip = Number(result[i].loginIP.substring(0, 3));
				if(ip == 120 || ip == 10){
					ipArr[0][1]++; //in School
				}else if(ip != 127){
					ipArr[1][1]++; //out School
				}

				//Browsers
				var Browsers = result[i].Browser;
				for(var j = 0; j < BrowsersArr.length; j++){
					if (Browsers == BrowsersArr[j][0]){
						BrowsersArr[j][1]++;
					}
				}

				//SYSTEM 		
				var systems = result[i].System;
				for(var j = 0; j < SystemArr.length; j++){
					if (systems == SystemArr[j][0]){
						SystemArr[j][1]++;
					}
				}
			}

			//Login Count
			loginCount.push(Number(countTmp)-Number(pushTmp));
			for(var i = 0; i < loginCount.length; i++){
				loginTotal.push(Number(countTmp));
				//collegeDaysArr[i].push(Number(collegeCountArr[i]) - Number(pushTmp));
				for(var j = 0; j < collegeTotalArr.length; j++){
					collegeTotalArr[j].push(collegeCountArr[j]);
				}
			}
			for(var i = 0; i < collegeCountArr.length; i++){
				collegeDaysArr[i].push(collegeCountArr[i] - Number(collegePushTmpArr[i]));
			}
			// console.log("collegeDaysArr[0]:" + collegeDaysArr[0]);
			// console.log("collegeDaysArr[1]:" + collegeDaysArr[1]);
			// console.log("collegeDaysArr[2]:" + collegeDaysArr[2]);
			// console.log("collegeDaysArr[3]:" + collegeDaysArr[3]);
			// console.log("collegeDaysArr[4]:" + collegeDaysArr[4]);

			// console.log("collegeTotalArr:" + collegeTotalArr);
			// console.log("collegeTotalArr[0]:" + collegeTotalArr[0]);
			// console.log("collegeTotalArr[1]:" + collegeTotalArr[1]);
			// console.log("collegeTotalArr[2]:" + collegeTotalArr[2]);
			// console.log("collegeTotalArr[3]:" + collegeTotalArr[3]);
			// console.log("collegeTotalArr[4]:" + collegeTotalArr[4]);

			// console.log("countTmp:" + countTmp);
			// console.log("pushTmp:" + pushTmp);

			// console.log("loginDate:" + loginDate);
			// console.log("loginCount:" + loginCount);
			// console.log("loginTotal:" + loginTotal);

			//ip
			var ipArrCount = Number(ipArr[0][1]) + Number(ipArr[1][1]);
			ipArr[0][1] = (ipArr[0][1]/ipArrCount)*100;
			ipArr[1][1] = (ipArr[1][1]/ipArrCount)*100;

			//Browsers
			var max = -1
			var maxCount = 0
			for(var i = 0; i < BrowsersArr.length; i++){
				if(max == BrowsersArr[i][1]){
					maxCount++;
				}else if(max < BrowsersArr[i][1]){
					max = BrowsersArr[i][1];
					maxCount = 1;
				}
			}
			if (maxCount >= 2){
				max = maxCount;
			}
			for(var i = 0; i < BrowsersArr.length; i++){
				BrowsersArr[i][1] = ((BrowsersArr[i][1]/max)*100).toFixed(2)
			}

			//System
			var max = -1
			var maxCount = 0
			for(var i = 0; i < SystemArr.length; i++){
				if(max == SystemArr[i][1]){
					maxCount++;
				}else if(max < SystemArr[i][1]){
					max = SystemArr[i][1];
					maxCount = 1;
				}
			}
			if (maxCount >= 2){
				max = maxCount;
			}

			for(var i = 0; i < SystemArr.length; i++){
				SystemArr[i][1] = ((SystemArr[i][1]/max)*100).toFixed(2)
			}
			return callback(BrowsersArr, SystemArr, ipArr, loginDate, loginCount, loginTotal, collegeDaysArr , collegeTotalArr, hourArr);
		});
	});
}	
module.exports.getUserData = getUserData;
