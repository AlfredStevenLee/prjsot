var dbpool = require("./dbcon").pool;
var common_util = require("./ctl_util");

//메인 컨트롤러 파일
//아래와 같이 export를 통해 하나씩 메소드를 지정하고 그 내부에서 렌더링 할 파일로 redirection하면서 결과값을 함게 보내 줌

exports.fav_toggle = function(req, res, next) {

  var param = req.body;

  var prod_id = param.prod_id;
  var fav_yn = param.fav_yn;
  var member_id = req.session.member_id;

  //console.log(">> fav start!")
  if (member_id == null) {
    //console.log(">> fav no login!")
    res.send("NO_LOGIN");
    return false;
  }
  //console.log(">> fav login! - continue")

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    var sql = "null";
    if(fav_yn == "Y") {
      sql = "delete from favorite where member_id=? and prod_id=? ";
    } else {
      sql = "insert into favorite values(?, ?, now()) ";
    }

    //var param = req.body;
    //console.log(">> start register");

    //Execute SQL
    connection.query(sql, [member_id, prod_id] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : "+err_sql);
        next(err_sql);
        return false;
      }
      //Send result & Redirect to view. Something have to be sent back
      res.send("RESIGT_SUCCESS");

      //Release connection
      connection.release();
    })
  })
};

exports.register_product = function(req, res, next) {
  var param = req.body;

  //console.log(">>>>> req : "+param.prod_name);
  //console.log(">>>>> file path : "+req.file.path);
  //console.log(">>>>> file name : "+req.file.filename);
  var prod_cat = param.prod_cat;
  var prod_name = param.prod_name;
  var prod_img = (!req.file) ? "def_prod_img.png" : req.file.filename;
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
      next(err);
      return false;
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
        next(err_sql);
        return false;
      }
      //Send result & Redirect to view. Something have to be sent back
      res.send("RESIGT_SUCCESS");

      //Release connection
      connection.release();
    })
  })
};


exports.modify_product = function(req, res, next) {
  var param = req.body;

  //console.log(">>>>> req : "+param.prod_name);
  //console.log(">>>>> file path : "+req.file.path);
  //console.log(">>>>> file name : "+req.file.filename);
  var prod_cat = param.prod_cat;
  var prod_name = param.prod_name;
  var img_origin = param.img_origin;
  var prod_img = (!req.file) ? img_origin : req.file.filename;
  var prod_price_krw = param.prod_price_krw;
  var prod_price_sot = common_util.checkNullNumber(param.prod_price_sot);
  var prod_price_eth = common_util.checkNullNumber(param.prod_price_eth);
  var prod_logis_yn = param.prod_logis_yn;
  var prod_active_yn = param.prod_active_yn;
  var prod_desc = param.prod_desc;
  var prod_id = param.prod_id;


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
      next(err);
      return false;
    }

    //Make Query
    //var sql = "insert into product(cat_id, prod_name, img_url, price_krw, price_sot, price_eth, description, logistics_yn, active_yn, register_id, logdate) values(?,?,?,?,?,?,?,?,?,?,now())";
    var sql = "update product set cat_id=?, prod_name=?, img_url=?, price_krw=?, price_sot=?, price_eth=?, description=?, logistics_yn=?, active_yn=?, logdate=now() where id=? and register_id=? ";

    //var param = req.body;
    //console.log(">> start register");

    //Execute SQL
    connection.query(sql, [prod_cat, prod_name, prod_img, prod_price_krw, prod_price_sot, prod_price_eth, prod_desc, prod_logis_yn, prod_active_yn, prod_id, req.session.member_id] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : "+err_sql);
        next(err_sql);
        return false;
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


exports.get_favorite_list = function(req, res, callback) {

  //getConnection
  dbpool.getConnection(function(err, connection){

    if (err)
    {
      console.log(">> can't get sql connection!");
      connection.release();
      callback(err, null);
      return false;
    }

    //Make Query
    var sql = "select a.id, a.prod_name, a.img_url, a.price_krw, a.price_sot, a.price_eth, a.logistics_yn, count(b.prod_id) as sellcount from product a left outer join contract b on b.prod_id = a.id, favorite c where a.active_yn = 'Y' and a.id = c.prod_id and c.member_id = ? group by a.id, a.prod_name, a.img_url, a.price_krw, a.price_sot, a.price_eth, a.logistics_yn ";

    //Execute SQL
    connection.query(sql, req.session.member_id ,function(err_sql, rows)
    {
      //var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        callback(err_sql, null);
        return false;
      }

      //Release connection
      connection.release();
      callback(null, rows);

    });
  });
};


exports.my_biz_product = function(req, res, callback) {

  //## for Paging ################################
  var pageNum = req.body.pageNum;
  var pageSize = 10;
  if ((pageNum == undefined) || (pageNum < 1)) {
    pageNum = 1;
  }
  var startPage = (pageNum-1)*pageSize;
  //##############################################

  //getConnection
  dbpool.getConnection(function(err, connection){

    if (err)
    {
      console.log(">> can't get sql connection!");
      connection.release();
      callback(err, null);
      return false;
    }

    //Make Query
    var sql = "select a.id, a.prod_name, a.img_url, a.price_krw, a.price_sot, a.price_eth, a.logistics_yn, a.active_yn, count(b.prod_id) as sellcount from product a left outer join contract b on b.prod_id = a.id where a.register_id=? group by a.id, a.prod_name, a.img_url, a.price_krw, a.price_sot, a.price_eth, a.logistics_yn, a.active_yn order by a.id desc limit ?,?";

    //Execute SQL
    connection.query(sql, [req.session.member_id, startPage, pageSize], function(err_sql, rows)
    {
      //var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        callback(err_sql, null);
        return false;
      }

      //Release connection
      connection.release();
      callback(null, rows);

    });
  });
};


exports.prod_list = function(req, res, callback) {

  //## for Paging ################################
  var pageNum = req.body.pageNum;
  var pageSize = 10;
  if ((pageNum == undefined) || (pageNum < 1)) {
    pageNum = 1;
  }
  var startPage = (pageNum-1)*pageSize;
  //##############################################


  //getConnection
  dbpool.getConnection(function(err, connection){

    if (err)
    {
      console.log(">> can't get sql connection!");
      connection.release();
      callback(err, null);
      return false;
    }

    //Make Query
    var sql = "select a.id, a.prod_name, a.img_url, a.price_krw, a.price_sot, a.price_eth, ";
    sql += "          a.logistics_yn, count(b.prod_id) as sellcount ";
    sql += "     from product a left outer join contract b on b.prod_id = a.id ";
    sql += "    where a.active_yn = 'Y' ";
    sql += "    group by a.id, a.prod_name, a.img_url, a.price_krw, a.price_sot, a.price_eth, a.logistics_yn order by a.id desc ";
    sql += "    limit ?, ?";

    //Execute SQL
    connection.query(sql,[startPage, pageSize], function(err_sql, rows)
    {
      //var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        callback(err_sql, null);
        return false;
      }

      //Release connection
      connection.release();
      callback(null, rows);

    });
  });
};

exports.prod_list_api = function(req, res, callback) {

  //getConnection
  dbpool.getConnection(function(err, connection){

    if (err)
    {
      console.log(">> can't get sql connection!");
      connection.release();
      callback(err, null);
      return false;
    }

    //Make Query
    var sql = "select id, prod_name, img_url, price_sot from product where register_id = ? ";

    //Execute SQL
    connection.query(sql, common_util.checkNullString(req.session.member_id), function(err_sql, rows)
    {
      var result_str = "";

      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : prod_list_api");
        callback(err_sql, null);
        return false;
      }

      if(rows.length == 0)
      {
        result_str = "NO_DATA";
      }
      else
      {
        for(var i=0; i<rows.length; i++){
          result_str += "<option value='"+rows[i].id+"' img_url='http://127.0.0.1:8080/uploads/"+rows[i].img_url+"' price_sot='"+rows[i].price_sot.toFixed(2)+"'>"+rows[i].prod_name+"</option>";
        }
      }

      //Release connection
      connection.release();
      callback(null, result_str);

    });
  });
};


exports.contract_list_buyer = function(req, res, callback) {

  //## for Paging ################################
  var pageNum = req.body.pageNum;
  var pageSize = 10;
  if ((pageNum == undefined) || (pageNum < 1)) {
    pageNum = 1;
  }
  var startPage = (pageNum-1)*pageSize;
  //##############################################

  //getConnection
  dbpool.getConnection(function(err, connection){

    if (err)
    {
      console.log(">> can't get sql connection!");
      connection.release();
      callback(err, null);
      return false;
    }

    //Make Query
    var sql = "select a.id, a.prod_id, a.seller_id, a.buyer_id, a.smart_contract_no, a.seller_account_no, a.buyer_account_no, a.price_krw, a.price_sot, a.price_eth, a.contract_status, b.prod_name, b.img_url, c.cd_val as contract_status_val, b.logistics_yn, a.logis_zip, a.logis_addr1, a.logis_addr2 from contract a, product b, code c where buyer_id = ? and b.id = a.prod_id and c.cd = a.contract_status and c.cd_group='CNTR_STAT' order by a.logdate desc limit ?,? ";
    var buyer_id = req.session.member_id;

    //Execute SQL
    connection.query(sql, [buyer_id, startPage, pageSize], function(err_sql, rows)
    {
      //var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        callback(err_sql, null);
        return false;
      }

      //Release connection
      connection.release();
      callback(null, rows);

    });
  });
};


exports.get_prod_full = function(req, res, callback) {
  var prod_id = req.query.prod_id;
  var member_id = req.session.member_id;

  //getConnection
  dbpool.getConnection(function(err, connection){

    if (err)
    {
      console.log(">> can't get sql connection!");
      connection.release();
      callback(err, null);
      return false;
    }

    //Make Query
    var sql = "select a.id, a.cat_id, a.prod_name, a.img_url, a.price_krw, a.price_sot, a.price_eth, ";
    sql += "          a.description, a.logistics_yn, a.active_yn ";
    sql += "     from product a ";
    sql += "    where a.id = ? and a.register_id = ? ";

    //console.log(">> prod selected : "+prod_id);
    //Execute SQL
    connection.query(sql, [prod_id, member_id], function(err_sql, rows)
    {
      //var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : get_prod_full : "+err_sql);
        callback(err_sql, null);
        return false;
      }

      //Release connection
      connection.release();
      callback(null, rows[0]);

    });
  });
};


exports.prod_view = function(req, res, callback) {
  var prod_id = req.query.prod_id;
  var member_id = req.session.member_id;

  //getConnection
  dbpool.getConnection(function(err, connection){

    if (err)
    {
      console.log(">> can't get sql connection!");
      connection.release();
      callback(err, null);
      return false;
    }

    //Make Query
    var sql = "select a.id, a.cat_id, b.cd_val 'cat_name', a.prod_name, a.img_url, a.price_krw, a.price_sot, a.price_eth, ";
    sql += "a.description, a.logistics_yn, a.active_yn, a.register_id 'seller_id', c.email 'seller_email', c.name 'seller_name', d.payment_wallet_addr, d.contact_phone, d.contact_address, d.provider_name, count(e.prod_id) as sellcount, ";
    sql += "(select 'Y' from favorite g where g.member_id = ? and g.prod_id = a.id) as fav ";
    sql += "from product a left outer join contract e on e.prod_id = a.id, code b, member c, provider d  ";
    sql += "where a.id = ? and a.cat_id = b.cd and b.cd_group = 'PROD_CAT' and c.id = a.register_id and d.register_id = a.register_id ";

    //console.log(">> prod selected : "+prod_id);
    //Execute SQL
    connection.query(sql, [member_id, prod_id], function(err_sql, rows)
    {
      //var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : prod_view : "+err_sql);
        callback(err_sql, null);
        return false;
      }

      //Release connection
      connection.release();
      callback(null, rows);

    });
  });
};


exports.buy_product = function(req, res, next) {
  var param = req.body;

  var prod_id = param.prod_id;
  var buyer_account = param.buyer_account;
  var contract_address = param.contract_address;
  var buyer_id = req.session.member_id;
  var logis_zip = common_util.checkNullString(param.logis_zip);
  var logis_addr1 = common_util.checkNullString(param.logis_addr1);
  var logis_addr2 = common_util.checkNullString(param.logis_addr2);

  //console.log(">> prod id : "+JSON.stringify(param)+" / "+param.prod_id);
  //console.log(">> buyer id : "+buyer_id);

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    var sql = "insert into contract ";
    sql += "select null, a.id, a.register_id, b.id, ?, c.payment_wallet_addr, ?, a.price_krw, a.price_sot, a.price_eth, 'REG', ?, ?, ?, 0, null, now() ";
    sql += " from product a, member b, provider c ";
    sql += " where a.id = ? and b.id = ? and c.register_id = a.register_id";
    //var param = req.body;
    //console.log(">> start register");

    //Execute SQL : save contract info to db
    connection.query(sql, [contract_address, buyer_account, logis_zip, logis_addr1, logis_addr2, prod_id, buyer_id] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : "+err_sql);
        next(err_sql);
        return false;
      }

      //get contract no and return it
      sql = "select max(id) cur_id from contract where buyer_id = ?";
      connection.query(sql, [buyer_id] , function(err_sql, rows)
      {
        if (err_sql)
        {
          connection.release();
          console.log(">> error from sql : "+err_sql);
          next(err_sql);
          return false;
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

exports.confirm_contract = function(req, res, next) {
  var param = req.body;
  var contract_id = param.contract_id;

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    var sql = "update contract set contract_status = 'CNT' where id = ? ";

    connection.query(sql, [contract_id] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : "+err_sql);
        next(err_sql);
        return false;
      }

      //console.log("contract id : "+rows[0].cur_id);
      res.send("SUCCESS");

      //Release connection
      connection.release();
    });
  });
};

exports.cancel_contract = function(req, res, next) {
  var param = req.body;
  var contract_id = param.contract_id;

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    var sql = "update contract set contract_status = 'CLS' where id = ? ";

    connection.query(sql, [contract_id] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : "+err_sql);
        next(err_sql);
        return false;
      }

      //console.log("contract id : "+rows[0].cur_id);
      res.send("SUCCESS");

      //Release connection
      connection.release();
    });
  });
};

exports.api_find_product_biz = function(req, res, next) {
  var param = req.body;
  var searchType = param.searchType;  // BY_NAME, BY_PROD_CD, BY_CATEGORY
  var searchKey = param.searchKey;
  var ad_biz_code = param.ad_biz_code;

  //console.log(">>Find product request : "+searchType+"/"+searchKey+"/"+ad_biz_code)

  if(ad_biz_code == undefined) {
    console.log(">> NO_API_CODE");
    res.send("NO_DATA");
    return false;
  }

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    var sql = "";
    if (searchType == "BY_PROD_CD") {
      sql = "select id, prod_name, img_url, price_sot from product where id = "+searchKey+" and active_yn = 'Y' ";
    } else if (searchType == "BY_NAME") {
      sql = "select id, prod_name, img_url, price_sot from product where prod_name like '%"+searchKey+"%' and active_yn = 'Y' limit 0,1 ";
      //searchKey = "'%"+searchKey+"%'";
    } else {
      // BY_CATEGORY   ***************** make query new ******
      sql = "select id, prod_name, img_url, price_sot from product where prod_name like '%"+searchKey+"%' and active_yn = 'Y' limit 0,1 ";
    }

    //Execute SQL
    connection.query(sql, function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql. find_product_biz : "+err_sql);
        next(err_sql);
        return false;
      }

      //Send result & Redirect to view. Something have to be sent back
      var result_rows = rows;

      //console.log(">> Referer : "+req.header("Referer"));
      //console.log(">> api_code : "+ad_biz_code);

      var http_referer = req.header("Referer");
      var remote_ip = req.ip;

      sql = "insert into biz_api_history values(?,?,?,?,?,now()) ";
      connection.query(sql, [ad_biz_code, http_referer, remote_ip, searchType, searchKey] ,function(err_sql, rows)
      {
        if (err_sql)
        {
          connection.release();
          console.log(">> error from sql. find_product_biz / referer insert : "+err_sql);
          next(err_sql);
          return false;
        }

        if(result_rows.length == 0) {
          res.send("NO_DATA");
        } else {
          res.send(result_rows);
        }

        //Release connection
        connection.release();
      });
    });
  });
};



exports.api_prod_view_logging = function(req, res, next) {
  var param = req.query;
  var searchType = "BY_URL_VISIT";  // BY_NAME, BY_PROD_CD, BY_CATEGORY
  var searchKey = param.prod_id;
  var ad_biz_code = param.ad_biz_code;

  //console.log(">>Find product request : "+searchType+"/"+searchKey+"/"+ad_biz_code)

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    var sql = "";
    var http_referer = req.header("Referer");
    var remote_ip = req.ip;

    sql = "insert into biz_api_history values(?,?,?,?,?,now()) ";
    connection.query(sql, [ad_biz_code, http_referer, remote_ip, searchType, searchKey] ,function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql. find_product_biz / url visit insert : "+err_sql);
        next(err_sql);
        return false;
      }

      //Release connection
      connection.release();
    });

  });
};


exports.api_integration_by_url = function(req, res, next) {
  //console.log("\n\n\n===============================");
  var paramUrl = req.query.siteurl;

  //check parameter exist or not
  if (paramUrl == undefined) {
    //console.log(">> api_integraion_by_url : NO_PARAMETER_SITE_URL");
    res.send("ERR_NO_SITEURL_FOUND");
    return false;
  }

  //check parameter type : http or https
  const {URL} = require('url');
  var urlObj = new URL(paramUrl);
  //console.log("REQUESTED URL : "+urlObj.toString());
  //console.log("host : "+urlObj.host);
  //console.log("hostname : "+urlObj.hostname);

  var https = null;
  var urlprotocol = urlObj.protocol;

  if(urlprotocol == "http:") {
    //console.log("HTTP PROTOCOL");
    https = require("http");
  } else if(urlprotocol == "https:") {
    //console.log("HTTPS PROTOCOL");
    https = require("https");
  } else {
    res.send("ERR_NO_SUPPORTED_PROTOCOL");
    return false;
  }

  //res.send("test ok");
  //return false;

  https.get(paramUrl, resdata => {
    resdata.setEncoding("utf8");
    let body = "";
    resdata.on("data", data => {
      body += data;
    });
    resdata.on("end", () => {
      //console.log("------------------------");
      //console.log(body);

      const cheerio = require('cheerio');
      const $ = cheerio.load(body, {decodeEntities: false});
      $('head').append("<link rel='stylesheet' href='http://127.0.0.1:8080/css/sot_style.css' />");
      $('head').append("<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js'></script>");
      $('head').append("<script src='http://127.0.0.1:8080/js/sot_toolkit.js'></script>");
      //console.log("------------------------");
      //console.log($.html());

      res.send($.html());

    });
  });
};
