module.exports = function(app)
{

  //라우터에서 multer file uploader 사용선언
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


  //라우터 시작시 스케줄러 자동시작    [초] 분 시 일 월 요일
  var schedule = require('node-schedule');
  var j = schedule.scheduleJob('*/10 * * * *', function(){   // _부분은 지울 것  /5은 매 5초, 매분을 의미 -> 현재 매 10분 마다
    require("../src/ctl_util").getCurrencyInfo("ETH");
  });

  //test page
  app.get('/', function(req, res){
    res.render('sot_index.html', {req : req, res : res});
  });

  //url integration tester
  app.get('/sot_tester', function(req, res){
    res.render('sot_index_tester.html', {req : req, res : res});
  });
  //test용
  app.get('/index_style', function(req, res){
    res.render('../index_style.html', {req : req, res : res});
  });

  app.get('/about', function(req, res){
    res.render('about.html', {req : req, res : res});
  });

  app.get('/api_setting', function(req, res){
    var async = require('async');

    async.series([
      function(callback){
        require("../src/ctl_product").prod_list_api(req, res, function(err, data){
          callback(err, data);
        });
      },function(callback){
        require("../src/ctl_member").get_biz_wallet(req, res, function(err, data){
          callback(err, data);
        });
      }
    ],function(err, results) {
        res.render('../sot_config_api.html', {req : req, res : res, prod_list : results[0], biz_wallet : results[1] });
      }
    );
  });


  app.get('/sot_view_product', function(req, res){
    //console.log(">>sot_view_product biz code check : "+req.query.ad_biz_code);

    if(req.query.ad_biz_code != undefined) {
      require("../src/ctl_product").api_prod_view_logging(req, res);
    }

    var async = require('async');

    async.series([
      function(callback){
        require("../src/ctl_product").prod_view(req, res, function(err, data){
          callback(null, data);
        });
      },function(callback){
        require("../src/ctl_util").get_currency(req, res, function(err, data){
          callback(null, data);
        });
      }
    ],function(err, results) {
        //res.render('../sot_register_product.html', {req : req, res : res, common_util : results[0], common_util2 : results[1]});
        res.render('../sot_view_product.html', {req : req, res : res, prod_detail : results[0], currency : results[1] });
      }
    );
  });


  app.get('/sotmain', function(req, res){

    var async = require('async');

    async.series([
      function(callback){
        require("../src/ctl_product").prod_list(req, res, function(err, data){
          callback(null, data);
        });
      },function(callback){
        require("../src/ctl_util").get_currency(req, res, function(err, data){
          callback(null, data);
        });
      }
    ],function(err, results) {
        res.render('../sot_main.html', {req : req, res : res, prod_list : results[0], currency : results[1] });
      }
    );
  });


  app.get('/sot_product_list', function(req, res){

    var async = require('async');

    async.series([
      function(callback){
        require("../src/ctl_product").prod_list(req, res, function(err, data){
          callback(null, data);
        });
      }
    ],function(err, results) {
        //res.render('../sot_register_product.html', {req : req, res : res, common_util : results[0], common_util2 : results[1]});
        res.render('../sot_product_list.html', {req : req, res : res, prod_list : results[0] });
      }
    );
  });

  app.get('/contract_buyer', function(req, res){

    var async = require('async');

    async.series([
      function(callback){
        require("../src/ctl_product").contract_list_buyer(req, res, function(err, data){
          callback(null, data);
        });
      }
    ],function(err, results) {
        res.render('../sot_contract_buyer.html', {req : req, res : res, contract_list : results[0] });
      }
    );
  });


  app.get('/favorite_product', function(req, res){
    var async = require('async');

    async.series([
      function(callback){
        require("../src/ctl_product").get_favorite_list(req, res, function(err, data) {
          callback(null, data);
        });
      },function(callback){
        require("../src/ctl_util").get_currency(req, res, function(err, data){
          callback(null, data);
        });
      }
    ],function(err, results) {
        res.render('../sot_favorite_product.html', {req : req, res : res, favorite : results[0],  currency : results[1] });
      }
    );
  });


  app.get('/config_member', function(req, res){
    var async = require('async');

    async.series([
      function(callback){
        require("../src/ctl_member").get_bizinfo(req, res, function(err, data) {
          callback(null, data);
        });
      }
    ],function(err, results) {
        res.render('../sot_config_member.html', {req : req, res : res, bizinfo : results[0] });
      }
    );
  });


  app.get('/verify_email', function(req, res){
    var async = require('async');

    async.series([
      function(callback){
        require("../src/ctl_member").verify_member(req, res, function(err, data) {
          callback(null, data);
        });
      }
    ],function(err, results) {
        res.render('../sot_verify_member.html', {req : req, res : res, verify_result : results[0], emailaddr : req.query.emailaddr });
      }
    );
  });


  app.get('/editor', function(req, res){
    res.render('../editor.html', {req : req, res : res});
  });

  app.get('/dbtest', require("../src/ctl_dbtest").test); //Router 파일이 있는 위치 기준으로 컨트롤러 파일 경로를 써줌

  app.get('/register_member', function(req, res){
    res.render('../sot_register_member.html', {req : req, res : res});
  });

  app.get('/register_bizinfo', function(req, res){
    res.render('../sot_register_bizinfo.html', {req : req, res : res});
  });

  app.get('/login_member', function(req, res){
    res.render('../sot_login_member.html', {req : req, res : res});
  });

  app.post('/action_logout_member', require("../src/ctl_member").logout_member);

  app.post('/action_register_member', require("../src/ctl_member").register_member);

  app.post('/action_config_member', require("../src/ctl_member").config_member);

  app.post('/action_check_member_email', require("../src/ctl_member").check_member_email);

  app.post('/action_register_bizinfo', require("../src/ctl_member").register_bizinfo);

  app.post('/action_config_bizinfo', require("../src/ctl_member").config_bizinfo);

  app.post('/action_login_member', require("../src/ctl_member").login_member);

  //상품대표이미지 등록 : file upload시 코딩 패턴
  app.post('/action_register_product', upload.single('prod_img'), require("../src/ctl_product").register_product);

  //상품설명이미지 등록 : summernote에서 발송
  app.post('/action_edit_product_image', upload.single('imagefile'), require("../src/ctl_product").register_product_edit_image);

  app.get('/register_product', function(req, res){

    //async를 이용해서 여러개의 callback데이터를 가지고 오는 방법임
    //series안에 callback(null, data)의 data값이 순차적으로 맨 아래 function(err, results) 부분의 results에 배열로 쌓이게 됨
    var async = require('async');

    async.series([
      function(callback){
        require("../src/ctl_util").prod_category(req, res, true, function(err, data){
          callback(null, data);
        });
      },function(callback){
        require("../src/ctl_util").get_currency(req, res, function(err, data){
          callback(null, data);
        });
      }
    ],function(err, results) {
        //res.render('../sot_register_product.html', {req : req, res : res, common_util : results[0], common_util2 : results[1]});
        res.render('../sot_register_product.html', {req : req, res : res, prod_category : results[0], currency : results[1] });
      }
    );
  });


  app.post('/action_buy_product', require("../src/ctl_product").buy_product);

  app.post('/action_confirm_contract', require("../src/ctl_product").confirm_contract);

  app.post('/action_cancel_contract', require("../src/ctl_product").cancel_contract);

  app.post('/action_fav_toggle', require("../src/ctl_product").fav_toggle);

  // API용 router
  app.post('/action_find_product', require("../src/ctl_product").api_find_product_biz);
  app.get('/sot_api_integrator', require("../src/ctl_product").api_integration_by_url);
  /* url기반 api호출 예제 : http://127.0.0.1:8080/sot_api_integrator?siteurl=http://127.0.0.1:8080/sot_tester */




}
