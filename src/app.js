var express = require('express');
var app = express();
var router = require('../router/mainrouter')(app);

app.set('views', __dirname);
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


var server = app.listen(8080, function(){
  console.log("Express server has started on port 8080....")
});

app.use(express.static('../public'));
