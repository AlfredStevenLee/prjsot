var express = require('express');
var bp = require('body-parser');
var session = require('express-session');
var multer = require('multer');


var app = express();

//session timeout 시간을 1시간으로 설정 60분 X 60초 X 1초 milliseconds 1000
app.use(session({
  secret: '!@#SOT_SEC_CODE$!@#*',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 3600000}
}));

app.use(bp.urlencoded({extended: true}));
app.use(bp.json());


app.set('views', __dirname);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//error handler
/*
app.use(function(error, req, res, next){
  console.log("\n\n-------- 에러 발생 --------\n\n");
  console.log(error.message);
  console.log("\n\n--------------------------\n\n");
  res.send("사용자가 많아 응답이 느려지고 있습니다. 잠시후에 이용해 주십시요.");
});
*/

var router = require('../router/mainrouter')(app);  // router 파일에서 body-parser를 사용할 것이므로 app.use에 body-parser를 적용한 다음줄에 router를 정의해야 작동 됨


var server = app.listen(8080, function(){
  console.log("Express server has started on port 8080....")
});

app.use(express.static('../public'));
app.use('/uploads',express.static('../uploads'));
app.use(error_handler);
function error_handler(err, req, res, next) {
  console.log("\n\n\n#####--- Error occurred from [ "+req.path+" ] SVR---#####\n");
  console.log("## DATE TIME : "+new Date());
  console.log("## ");
  console.log("## ERROR : "+err);
  console.log("## ");
  console.log("\n###################################################\n\n\n");

  res.send("SERVER_EXCEPTION");
  //next(err);
}
