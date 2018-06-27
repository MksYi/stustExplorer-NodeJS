// Require Modules
var express = require('express');
var compression = require('compression');
//var proxiedRequest = request.defaults({'proxy': 'http://127.0.0.1:8888'});
var config 	= require(__dirname + '/config.json');
var logger	= require(__dirname + '/lib/logger/logger')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var session = require('express-session');
// Require apps
var app 	= express();

// App Settings
process.env.TZ 		= 'Asia/Taipei'
app.set('port', process.env.PORT || config.port); 	//設定 PORT
app.set('views', __dirname + '/views');			  	// 設定 view 路徑及 jade 模板系統
app.set('view engine', 'jade');
app.use(compression()); 	// 採用 gzip 壓縮
app.use(express.static(__dirname + '/public'));
app.use(logger.logger);		// 啟用記錄輸出
app.use(bodyParser());		// 啟用 body parser 以處理 post 資料
// app.use(cookieParser())

// Session 
app.use(cookieParser('MksYeeeeeeeeeeeeeeee'));
app.use(session({
	secret: 'MksYeeeeeeeeeeeeeeee',
	resave: true,
	saveUninitialized: false,
	cookie: {
		maxAge: 2400000 * 1000 // 40分鐘
	}
}));
console.log('[*] 初始化完畢')

// Routers
r_main = require(__dirname + '/router/main');

app.use('/', r_main);

// Listen to port
app.listen(app.get('port'), '0.0.0.0' ,function(){
	console.log('[*] 伺服器監聽於連接埠' + app.get('port'));
});

// HerokuApp Don't Sleeping!!
var http = require("http");
setInterval(function() {
    http.get("http://stust-explorer.herokuapp.com");
}, 300000); // every 5 minutes (300000)