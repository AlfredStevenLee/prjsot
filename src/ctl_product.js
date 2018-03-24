var dbpool = require("./dbcon").pool;
var common_util = require("./ctl_util");

//메인 컨트롤러 파일
//아래와 같이 export를 통해 하나씩 메소드를 지정하고 그 내부에서 렌더링 할 파일로 redirection하면서 결과값을 함게 보내 줌

exports.register_product = function(req, res) {
  var param = req.body;

  //console.log(">>>>> req : "+param.prod_name);
  //console.log(">>>>> file path : "+req.file.path);
  //console.log(">>>>> file name : "+req.file.filename);
  var prod_cat = param.prod_cat;
  var prod_name = param.prod_name;
  var prod_img = (!req.file) ? "null" : req.file.filename;
  var prod_price_krw = param.prod_price_krw;
  var prod_price_sot = common_util.checkNullNumber(param.prod_price_sot);
  var prod_price_eth = common_util.checkNullNumber(param.prod_price_eth);
  var prod_logis_yn = param.prod_logis_yn;
  var prod_active_yn = param.prod_active_yn;
  var prod_desc = param.prod_desc;

  /*
  console.log("---------------------------");
  console.log(prod_cat);
  console.log(prod_name);
  console.log(prod_img);
  console.log(prod_price_krw);
  console.log(prod_price_sot);
  console.log(prod_price_eth);
  console.log(prod_logis_yn);
  console.log(prod_active_yn);
  console.log(prod_desc);
  */


  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      callback(null, err);
      throw err;
    }

    //Make Query
    var sql = "insert into product(cat_id, prod_name, img_url, price_krw, price_sot, price_eth, description, logistics_yn, active_yn, register_id, logdate) values(?,?,?,?,?,?,?,?,?,?,now())";
    //var param = req.body;
    //console.log(">> start register");

    //Execute SQL
    connection.query(sql, [prod_cat, prod_name, prod_img, prod_price_krw, prod_price_sot, prod_price_eth, prod_desc, prod_logis_yn, prod_active_yn, req.session.member_id] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : "+err_sql);
        throw err;
      }
      //Send result & Redirect to view. Something have to be sent back
      res.send("RESIGT_SUCCESS");

      //Release connection
      connection.release();
    })
  })

};
