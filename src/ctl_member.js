var dbpool = require("./dbcon").pool;
var common_util = require("./ctl_util");

//메인 컨트롤러 파일
//아래와 같이 export를 통해 하나씩 메소드를 지정하고 그 내부에서 렌더링 할 파일로 redirection하면서 결과값을 함게 보내 줌

exports.verify_member = function(req, res, callback) {
  var verify_id = req.query.secid;
  var emailaddr = req.query.emailaddr;

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
    var sql = "select verify_id, verify_yn from member where email = ? ";

    //console.log(">> prod selected : "+prod_id);
    //Execute SQL
    connection.query(sql, emailaddr, function(err_sql, rows)
    {
      var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : verify member select data : "+err_sql);
        throw err;
      }

      if(rows.length == 0) {
        result_str = "NO_USER";
      } else {
        if(rows[0].verify_id == verify_id) {
          if(rows[0].verify_yn == 'Y') {
            result_str = "VERIFY_EXIST";
          } else {
            result_str = "VERIFY_SUCCESS";
          }
        } else {
          result_str = "NO_USER";
        }
      }

      if (result_str == "VERIFY_SUCCESS") {
        //update verify_yn to 'Y'
        sql = "update member set verify_yn='Y' where email = ? ";
        connection.query(sql, emailaddr, function(err_sql, rows)
        {
          if (err_sql)
          {
            connection.release();
            console.log(">> error from sql : verify_member update to Y : "+err_sql);
            throw err;
          }

          //Release connection
          connection.release();
          callback(null, result_str);
        });

      } else {
        connection.release();
        callback(null, result_str);
      }

    });
  });
};


exports.register_member = function(req, res) {

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      callback(null, err);
      throw err;
    }

    //Make Query
    var sql = "insert into member(email, password, name, verify_id, verify_yn, logdate) values(?, ?, ?, null, 'N', now())";
    var param = req.body;
    //console.log(">> start register");

    //Execute SQL
    connection.query(sql, [param.member_email, param.member_password, param.member_name] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        throw err;
      }

      //Send verification email
      var subject = "Verification email from SOT";
      var verification_secid = common_util.getVerificationSecid(param.member_email);

      var body = "<h3>Congratulation! Your account created.<h3><br><br>";
      body += "For your information safety, please verify email address by clicking below.<br>";
      body += "<a href='http://127.0.0.1:8080/verify_email?secid="+verification_secid+"&emailaddr="+param.member_email+"'>[Click here for verification]</a><br><br>";
      body += "Thank you.<br>-SOT Innovation Team-";

      common_util.sendmailByAdmin(req, res, param.member_email, subject, body, function(err, data){
        if (err) {
          connection.release();
          console.log(">>error from register member / send verification email : "+err);
          res.send("RESIGT_FAIL");
        } else {
          //register verification information into DB
          sql = "update member set verify_id = ? where email = ? ";
          connection.query(sql, [verification_secid, param.member_email] , function(err_sql, rows)
          {
            if (err_sql)
            {
              connection.release();
              console.log(">> error from sql");
              throw err;
            } else {
              console.log(">>sending & updating verification OK! : "+data);

              //Release connection
              connection.release();
              console.log(">>connection released # from member register");

              //send result
              res.send("RESIGT_SUCCESS");
            }
          });
        }
      });
    })
  })
};

exports.register_bizinfo = function(req, res) {

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      callback(null, err);
      throw err;
    }

    //Make Query
    var sql = "insert into provider values(null,?,?,?,?,?,?,?,now())";
    var param = req.body;
    //console.log(">> start register");

    //Execute SQL
    connection.query(sql, [param.provider_name, param.description, param.contact_phone, param.contact_address, param.biz_regist_no, param.payment_wallet_addr, req.session.member_id] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        throw err;
      }

      var session = req.session;
      session.biz = true;

      //Send result & Redirect to view. Something have to be sent back
      res.send("RESIGT_SUCCESS");

      //Release connection
      connection.release();
    })
  })
};

exports.login_member = function(req, res) {

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      callback(null, err);
      throw err;
    }

    //Make Query
    //var sql = "select id, email from member where email = ? and password = ?";
    var sql = "select a.id as id, a.email as email, b.id as biz, a.verify_yn from member a left outer join provider b on b.register_id = a.id where a.email = ? and a.password = ? ";
    var param = req.body;

    //console.log(">> login proceeding : "+param.member_email+" / "+param.member_password);

    //Execute SQL
    connection.query(sql, [param.member_email, param.member_password] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : member login");
        throw err;
      }

      //Send result & Redirect to view
      if(rows.length == 0)
      {
        //Login failed
        console.log(">> login fail");
        res.send("LOGIN_FAIL");
      }
      else
      {
        //login success

        if(rows[0].verify_yn == 'N') {
          res.send("NOT_VERIFIED");
        } else {

          //register user data in session
          var session = req.session;
          session.member_id = rows[0].id;
          session.member_email = rows[0].email;
          session.login = true;

          if(rows[0].biz != null) {
            //console.log("biz id : "+rows[0].biz);
            session.biz = true;
          }

          res.send("LOGIN_SUCCESS");
        }
      }

      //Release connection
      connection.release();

    })
  })
};

exports.logout_member = function(req, res) {
  var session = req.session;
  if (session.login) {
    session.destroy(function(err){
      if(err) {
        consol.log(err);
      } else{
        res.send("LOGOUT_SUCCESS");
      }
    });
  }
};
