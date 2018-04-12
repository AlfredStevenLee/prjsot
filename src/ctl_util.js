var dbpool = require("./dbcon").pool;


//메인 컨트롤러 파일
//아래와 같이 export를 통해 하나씩 메소드를 지정하고 그 내부에서 렌더링 할 파일로 redirection하면서 결과값을 함게 보내 줌



/**
 * 빗썸에서 currency 정보를 가지고 옴. 최근 데이터 조회는 아래 쿼리로 함
 * select * from currency order by id desc limit 0,1;
 */
exports.getCurrencyInfo = function(currency) {
  //console.log('Job Executed from router : '+new Date());

  const https = require("https");

  const url = "https://api.bithumb.com/public/ticker/"+currency;
  https.get(url, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    res.on("end", () => {
      //console.log(body);
      body = JSON.parse(body);
      /*console.log(">>last status : "+body.status);
      console.log(">>last price : "+body.data.closing_price);
      console.log(">>last update : "+body.data.date);*/
      var eth_krw = parseInt(body.data.closing_price);
      var sot_krw = eth_krw/100;
      if(body.status == "0000") {
        dbpool.getConnection(function(err, connection){

          if (err)
          {
            console.log(">> can't get sql connection!");
            connection.release();
            throw err;
          }

          //Make Query
          var sql = "insert into currency values(null,?,?,now()) ";

          //Execute SQL
          connection.query(sql,[eth_krw, sot_krw] ,function(err_sql, rows)
          {
            if (err_sql)
            {
              connection.release();
              console.log(">> error from sql");
              throw err_sql;
            }

            //Release connection
            connection.release();
          });
        });
      }
    });
  });
}



exports.sendmailByAdmin = function(req, res, _to, _subject, _body, callback) {
  var nodemailer = require('nodemailer');

  var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'dwsmile@gmail.com',
      pass: 'dwlee1975!'
    }
  });

  var mailOption = {
    from: 'SOT Innovation <dwsmile@gmail.com>',
    to: _to,
    subject: _subject,
    html: _body
  };

  smtpTransport.sendMail(mailOption, function(error, response) {
    if(error) {
      console.log(">>error from sendmailAdmin : "+error);
      callback(error, "FAIL");
    } else {
      smtpTransport.close();
      callback(error, "SUCCESS");
    }
  });

};

exports.getHash = function(_input) {
  var crypto = require('crypto');
  var result = crypto.createHash('md5').update(_input).digest("hex");
  //console.log(">> hashed password : "+result);
  return result;
};

exports.getVerificationSecid = function(_email) {
  var crypto = require('crypto');
  var data = _email + Math.round((Math.random()*100)+Math.floor(new Date()/1000));
  //console.log("#1 : "+data);
  var result = crypto.createHash('md5').update(data).digest("hex");
  //console.log("#2 : "+result);
  return result;
};

exports.checkNullNumber = function(val) {
  //console.log("check1 > "+val);
  if (!val) {
    //console.log("check1-1 > val is null");
    val = 0;
  }
  //console.log("check2 >"+val+"<");
  return val;
};

exports.checkNullString = function(val) {
  //console.log("check1 > "+val);
  if (!val) {
    //console.log("check1-1 > val is null");
    val = "null";
  }
  //console.log("check2 >"+val+"<");
  return val;
};

exports.prod_category = function(req, res, default_val, callback) {

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
    var sql = "select cd_val, cd from code where cd_group ='PROD_CAT' order by cd_order asc";

    //Execute SQL
    connection.query(sql, function(err_sql, rows)
    {
      var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        throw err_sql;
      }

      //Send result & Redirect to view
      if(rows.length == 0)
      {
        //Login failed
        console.log(">> sql no rows!");
        result_str = "Get prod_category error!";
      }
      else
      {
        //console.log(">> got data : rows = "+rows.length);
        if(default_val) {
          result_str = "<option value=''>select item</option>";
        }

        for(var i=0; i<rows.length; i++){
          result_str += "<option value='"+rows[i].cd+"'>"+rows[i].cd_val+"</option>";
        }
      }

      //console.log(result_str);

      //Release connection
      connection.release();
      callback(null, result_str);

    });
  });
};


exports.get_currency = function(req, res, callback) {

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
    var sql = "select eth_krw, sot_krw from currency order by id desc limit 0,1 ";

    //Execute SQL
    connection.query(sql, function(err_sql, rows)
    {
      var results = {"eth_krw":"0", "sot_krw":"0"};
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        throw err_sql;
      }

      //Send result & Redirect to view
      if(rows.length == 0)
      {
        //Login failed
        console.log(">> sql no rows from currency!");
      }
      else
      {
        results = {"eth_krw":rows[0].eth_krw, "sot_krw":rows[0].sot_krw};
      }

      //Release connection
      connection.release();
      callback(null, results);

    });
  });
};
