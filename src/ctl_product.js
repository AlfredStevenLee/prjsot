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

//상품 설명 작성시 이미지 업로드하는 부분
exports.register_product_edit_image = function(req, res) {

  //console.log(">>>>> req : "+param.prod_name);
  //console.log(">>>>> file path : "+req.file.path);
  //console.log(">>>>> file name : "+req.file.filename);

  var prod_img_name = (!req.file) ? "null" : "/uploads/"+req.file.filename;

  res.send(prod_img_name);

};


exports.prod_list = function(req, res, callback) {

  //getConnection
  dbpool.getConnection(function(err, connection){

    if (err)
    {
      console.log(">> can't get sql connection!");
      connection.release();
      callback(null, err);
      throw err;
    }

    //Make Query
    var sql = "select id, prod_name, img_url, price_krw, price_sot, price_eth from product where active_yn = 'Y' ";

    //Execute SQL
    connection.query(sql, function(err_sql, rows)
    {
      //var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        throw err;
      }

      //Release connection
      connection.release();
      callback(null, rows);

    });
  });
};


exports.prod_view = function(req, res, callback) {
  var prod_id = req.query.prod_id;

  //getConnection
  dbpool.getConnection(function(err, connection){

    if (err)
    {
      console.log(">> can't get sql connection!");
      connection.release();
      callback(null, err);
      throw err;
    }

    //Make Query
    var sql = "select a.id, a.cat_id, b.cd_val 'cat_name', a.prod_name, a.img_url, a.price_krw, a.price_sot, a.price_eth, ";
    sql += "a.description, a.logistics_yn, a.active_yn, a.register_id 'seller_id', c.email 'seller_email', c.name 'seller_name', d.payment_wallet_addr ";
    sql += "from product a, code b, member c, provider d ";
    sql += "where a.id = ? and a.cat_id = b.cd and b.cd_group = 'PROD_CAT' and c.id = a.register_id and d.register_id = a.register_id ";

    //console.log(">> prod selected : "+prod_id);
    //Execute SQL
    connection.query(sql, prod_id, function(err_sql, rows)
    {
      //var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : prod_view : "+err_sql);
        throw err;
      }

      //Release connection
      connection.release();
      callback(null, rows);

    });
  });
};


exports.buy_product = function(req, res) {
  var param = req.body;

  var prod_id = param.prod_id;
  var buyer_account = param.buyer_account;
  var contract_address = param.contract_address;
  var buyer_id = req.session.member_id;

  //console.log(">> prod id : "+JSON.stringify(param)+" / "+param.prod_id);
  //console.log(">> buyer id : "+buyer_id);

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      callback(null, err);
      throw err;
    }

    //Make Query
    var sql = "insert into contract ";
    sql += "select null, a.id, a.register_id, b.id, ?, c.payment_wallet_addr, ?, a.price_krw, a.price_sot, a.price_eth, 'REG', 0, null, now() ";
    sql += " from product a, member b, provider c ";
    sql += " where a.id = ? and b.id = ? and c.register_id = a.register_id";
    //var param = req.body;
    //console.log(">> start register");

    //Execute SQL : save contract info to db
    connection.query(sql, [contract_address, buyer_account, prod_id, buyer_id] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : "+err_sql);
        throw err;
      }

      //get contract no and return it
      sql = "select max(id) cur_id from contract where buyer_id = ?";
      connection.query(sql, [buyer_id] , function(err_sql, rows)
      {
        if (err_sql)
        {
          connection.release();
          console.log(">> error from sql : "+err_sql);
          throw err;
        }
        //send contract no
        //console.log("contract id : "+rows[0].cur_id);
        res.send((rows[0].cur_id).toString());

        //Release connection
        connection.release();
      });
    });
  });
};
