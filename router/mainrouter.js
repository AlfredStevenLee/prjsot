module.exports = function(app)
{

  var multer = require('multer');
  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, '../uploads')
    },
    filename: function(req, file, cb) {
      let extArray = file.mimetype.split("/");
      let extension = extArray[extArray.length-1];
      cb(null, file.fieldname+'-'+Date.now()+'.'+extension);
    }
  });

  var upload = multer({ storage : storage, limits : {fileSize:'50mb'}});

  app.get('/', function(req, res){
    res.render('sot_index.html', {req : req, res : res});
  });
  app.get('/about', function(req, res){
    res.render('about.html', {req : req, res : res});
  });
  app.get('/sotmain', function(req, res){
    res.render('../sot_main.html', {req : req, res : res});
  });

  app.get('/dbtest', require("../src/ctl_dbtest").test); //Router 파일이 있는 위치 기준으로 컨트롤러 파일 경로를 써줌

  app.get('/register_member', function(req, res){
    res.render('../sot_register_member.html', {req : req, res : res});
  });

  app.get('/login_member', function(req, res){
    res.render('../sot_login_member.html', {req : req, res : res});
  });

  app.post('/action_logout_member', require("../src/ctl_member").logout_member);

  app.post('/action_register_member', require("../src/ctl_member").register_member);

  app.post('/action_login_member', require("../src/ctl_member").login_member);

  //file upload시 코딩 패턴
  app.post('/action_register_product', upload.single('prod_img'), require("../src/ctl_product").register_product);

  app.get('/register_product', function(req, res){

    //async를 이용해서 여러개의 callback데이터를 가지고 오는 방법임
    //series안에 callback(null, data)의 data값이 순차적으로 맨 아래 function(err, results) 부분의 results에 배열로 쌓이게 됨
    var async = require('async');

    async.series([
      function(callback){
        require("../src/ctl_util").prod_category(req, res, true, function(err, data){
          callback(null, data);
        });
      } /*
      ,function(callback){
        require("../src/ctl_util").prod_category(req, res, function(err, data){
          callback(null, "<option>datafrom3!!</option>"+data);
        });
      }*/
    ],function(err, results) {
        //res.render('../sot_register_product.html', {req : req, res : res, common_util : results[0], common_util2 : results[1]});
        res.render('../sot_register_product.html', {req : req, res : res, prod_category : results[0] });
      }
    );
  });





}
