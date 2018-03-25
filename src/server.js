var express = require('express');
var bp = require('body-parser');
var session = require('express-session');
var multer = require('multer');

var app = express();


app.use(session({
  secret: '!@#SOT_SEC_CODE!@#*',
  resave: false,
  saveUninitialized: true
}));

app.use(bp.urlencoded({extended: true}));
app.use(bp.json());


app.set('views', __dirname);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var router = require('../router/mainrouter')(app);  // router 파일에서 body-parser를 사용할 것이므로 app.use에 body-parser를 적용한 다음줄에 router를 정의해야 작동 됨

var server = app.listen(8080, function(){
  console.log("Express server has started on port 8080....")
});

app.use(express.static('../public'));
app.use('/uploads',express.static('../uploads'));
