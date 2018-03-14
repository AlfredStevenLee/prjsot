var express = require('express');
var app = express();
var bp = require('body-parser');

app.set('views', __dirname);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bp.urlencoded({extended: true}));
app.use(bp.json());

var router = require('../router/mainrouter')(app);  // router 파일에서 body-parser를 사용할 것이므로 app.use에 body-parser를 적용한 다음줄에 router를 정의해야 작동 됨

var server = app.listen(8080, function(){
  console.log("Express server has started on port 8080....")
});

app.use(express.static('../public'));
