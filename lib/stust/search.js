// require Modules
fs = require('fs');
var request = require('request');
var iconv 	= require('iconv-lite');
var stustJar = require('./stustJar');
var moment	= require('moment');
const cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;

url = "mongodb://herokuR:STUSTv1Master@ds117758.mlab.com:17758/stust-master";
//url = "mongodb://localhost:27017/stustMasterDB";

var api = function(req, res, callback){
	var search = req.param('search');

	if(!search){callback()}
		search = search.replace(/[ /!@#$%^_&*\<>{()}\[\].\\]+/g, "");

	var searchDB
	if(search){
		searchDB = new RegExp(search, "ig");
		searchDB = {name: searchDB}
	}else{
		searchDB = {index: /(?:)/ig}
	}
	var result = [search]

	MongoClient.connect(url, function(err,db){
		if(err) throw err;
		db.collection("searchList").find(searchDB,{_id:0}).limit(12).toArray(function(err, data) {
			db.close();
			var dataTemp = []
			for(x in data){
				dataTemp.push(data[x].name)
			}
			result.push(dataTemp)
			callback(result);
		});
	});
}

var action = function( req, res, callback) {
	"use strict";
	/* GET action */
	var search = req.param('action');
	if(!search){ callback()}
	search = search.replace(/[ /!@#$%^_&*\<>{()}\[\].\\]+/g, "");

	var searchDB = new RegExp(search, "i");

	MongoClient.connect(url, function(err,db){
		if(err) throw err;
		db.collection("searchList").findOne({name: searchDB},{_id:0, name:0},function(err, data) {
			db.close();
			if(data){
				callback('yes', data.url);
			}else{
				callback('no',search);
			}
		});
	});
}

// export modules
module.exports.api 		= api;
module.exports.action 	= action;
