// require Modules
var MongoClient = require('mongodb').MongoClient;

url = decodeURIComponent("mongodb%3A%2F%2FherokuR%3ASTUSTv1Master%40ds117758.mlab.com%3A17758%2Fstust-master");

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
			var is_school, check_search; 
			if(data){
				check_search = data.url;
				is_school = 'yes';
			}else{
				check_search = search;
				is_school = 'no';
			}
			db.collection('userSearch',function(err, collection){
				collection.insert({	"Search": search, 
									"School Site": is_school });
			});
			db.close();
			callback(is_school, check_search);
		});
	});
}

// export modules
module.exports.api 		= api;
module.exports.action 	= action;
