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
      callback(err, null);
      return false;
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
        callback(err_sql, null);
        return false;
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
            callback(err_sql, null);
            return false;
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



exports.get_bizinfo = function(req, res, callback) {
  var bizyn = req.session.biz;

  if(bizyn == true) {
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
      /*
      +---------------------+------------------+------+-----+---------+----------------+
      | Field               | Type             | Null | Key | Default | Extra          |
      +---------------------+------------------+------+-----+---------+----------------+
      | id                  | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
      | provider_name       | varchar(30)      | NO   |     | NULL    |                |
      | description         | varchar(50)      | YES  |     | NULL    |                |
      | contact_phone       | varchar(30)      | NO   |     | NULL    |                |
      | contact_address     | varchar(100)     | YES  |     | NULL    |                |
      | biz_regist_no       | varchar(30)      | YES  |     | NULL    |                |
      | payment_wallet_addr | varchar(60)      | NO   |     | NULL    |                |
      | register_id         | int(10) unsigned | NO   |     | NULL    |                |
      | logdate             | datetime         | NO   |     | NULL    |                |
      +---------------------+------------------+------+-----+---------+----------------+
      */
      var sql = "select provider_name, description, contact_phone, contact_address, biz_regist_no, payment_wallet_addr from provider where id = ? ";

      //console.log(">> prod selected : "+prod_id);
      //Execute SQL
      connection.query(sql, req.session.biz_id, function(err_sql, rows)
      {
        var result_str = "";
        if (err_sql)
        {
          connection.release();
          console.log(">> error from sql : get bizinfo : "+err_sql);
          callback(err_sql, null);
          return false;
        }

        callback(null, rows[0]);
        connection.release();
      });
    });
  } else {
    callback(null, null);
  }
};



exports.check_member_email = function(req, res, next) {

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    var sql = "select email from member where email = ? ";
    var param = req.body;
    //console.log(">> start register");

    //Execute SQL
    connection.query(sql, [param.member_email] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : check member email");
        next(err_sql);
        return false;
      }

      if (rows.length == 0) {
        res.send("CHECK_OK");
      } else {
        res.send("CHECK_FAIL");
      }

      //Release connection
      connection.release();
    })
  })
};

exports.config_member = function(req, res, next) {

  var param = req.body;
  var email = param.member_email;
  var password = param.member_password;
  var name = param.member_name;

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    var sql = "select email from member where email = ? and password = ? ";


    //Execute SQL
    connection.query(sql, [email, common_util.getHash(password)] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : check member email");
        next(err_sql);
        return false;
      }

      if (rows.length == 0) {
        res.send("UPDATE_FAIL");
        //Release connection
        connection.release();
      } else {
        sql = "update member set name = ? where email = ? and password = ? ";
        connection.query(sql, [name, email, common_util.getHash(password)] , function(err_sql, rows)
        {
          if (err_sql)
          {
            connection.release();
            console.log(">> error from sql : check member email");
            next(err_sql);
            return false;
          }
          req.session.member_name = name;
          res.send("UPDATE_OK");

          //Release connection
          connection.release();
        });
      }
    });
  });
};


exports.register_member = function(req, res, next) {

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    var sql = "insert into member(email, password, name, verify_id, verify_yn, logdate) values(?, ?, ?, null, 'N', now())";
    var param = req.body;
    //console.log(">> start register");

    //Execute SQL
    connection.query(sql, [param.member_email, common_util.getHash(param.member_password), param.member_name] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        next(err_sql);
        return false;
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
          //res.send("RESIGT_FAIL");
          next(err);
          return false;
        } else {
          //register verification information into DB
          sql = "update member set verify_id = ? where email = ? ";
          connection.query(sql, [verification_secid, param.member_email] , function(err_sql, rows)
          {
            if (err_sql)
            {
              connection.release();
              console.log(">> error from sql");
              next(err_sql);
              return false;
            } else {
              //console.log(">>sending & updating verification OK! : "+data);

              //Release connection
              connection.release();
              //console.log(">>connection released # from member register");

              //send result
              res.send("RESIGT_SUCCESS");
            }
          });
        }
      });
    })
  })
};


exports.goodbye_member = function(req, res, next) {
  var member_id = req.session.member_id;
  var member_email = req.session.member_email;
  var member_password = common_util.getHash(req.body.member_password);

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }
    /*
    1.패스워드가 맞는지 확인 : select id from member where id=? and password=?
    2.진행중 계약이 있는지 확인 : select count(contract_status) from contract where (seller_id = 1 or buyer_id=1) and contract_status = 'REG';
    3.맴버정보 삭제 : delete from member where id = ?;
    4.사업자정보 삭제 : delete from provider where register_id = ?;
    5.판매상품정보 비활성화 : update product set active_yn = 'N' where register_id = ?;
    6.관심상품 삭제 : delete from favorite where member_id = ?;
    7.세션초기화 및 페이지 리로드(client단)
    8.email 발송
    */

    //Make Query
    var sql1 = "select id from member where id=? and password=? ";
    var sql2 = "select count(contract_status) as c_cnt from contract where (seller_id=? or buyer_id=?) and contract_status = 'REG' ";
    var sql3 = "delete from member where id = ? ";
    var sql4 = "delete from provider where register_id = ? ";
    var sql5 = "update product set active_yn = 'N' where register_id = ? ";
    var sql6 = "delete from favorite where member_id = ? ";

    //Execute SQL
    // SQL1-----------------------------
    connection.query(sql1, [member_id, member_password] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : goodbye1");
        next(err_sql);
        return false;
      }

      if(rows.length == 0) {
        res.send("INCORRECT_PASS");
        connection.release();
      } else {

        //SQL2-----------------------------
        connection.query(sql2, [member_id, member_id] , function(err_sql, rows)
        {
          if (err_sql)
          {
            connection.release();
            console.log(">> error from sql : goodbye2");
            next(err_sql);
            return false;
          }

          if(rows[0].c_cnt > 0) {
            res.send("REMAIN_CONTRACT");
            connection.release();
          } else {

            //SQL3-----------------------------
            connection.query(sql3, [member_id] , function(err_sql, rows)
            {
              if (err_sql)
              {
                connection.release();
                console.log(">> error from sql : goodbye3");
                next(err_sql);
                return false;
              }

              //SQL4-----------------------------
              connection.query(sql4, [member_id] , function(err_sql, rows)
              {
                if (err_sql)
                {
                  connection.release();
                  console.log(">> error from sql : goodbye4");
                  next(err_sql);
                  return false;
                }

                //SQL5-----------------------------
                connection.query(sql5, [member_id] , function(err_sql, rows)
                {
                  if (err_sql)
                  {
                    connection.release();
                    console.log(">> error from sql : goodbye5");
                    next(err_sql);
                    return false;
                  }

                  //SQL6-----------------------------
                  connection.query(sql6, [member_id] , function(err_sql, rows)
                  {
                    if (err_sql)
                    {
                      connection.release();
                      console.log(">> error from sql : goodbye6");
                      next(err_sql);
                      return false;
                    }

                    connection.release();

                    //SESSION7----------------------------
                    var session = req.session;

                    if (session.login) {

                      session.destroy(function(err){
                        if(err) {
                          consol.log(err);
                          next(err);
                          return false;
                        } else {

                          var subject = "SOT 회원탈퇴가 정상적으로 완료되었습니다";

                          var body = "<h3>그동안 많은 관심 가져주셔서 감사합니다.<h3><br><br>";
                          body += "회원님의 개인 정보는 안전하게 잘 삭제되었습니다.<br>";
                          body += "앞으로 다시 뵐 수 있기를 바랍니다.<br>-SOT Innovation -";

                          common_util.sendmailByAdmin(req, res, member_email, subject, body, function(err, data){
                            if (err) {
                              console.log(">>error from goodbye member / send verification email : "+err);
                              next(err);
                              return false;
                            }

                            //맴버탈퇴 마지막 성공!!!
                            res.send("GOODBYE_SUCCESS");
                          });

                        }
                      });
                    }

                  });

                });

              });

            });

          }

        });

      }

    });

  });

};


exports.register_bizinfo = function(req, res, next) {

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
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
        next(err_sql);
        return false;
      }

      //Get biz_id
      sql = "select id from provider where register_id = ? ";
      connection.query(sql, req.session.member_id , function(err_sql, rows)
      {
        if (err_sql)
        {
          connection.release();
          console.log(">> error from sql");
          next(err_sql);
          return false;
        }

        var session = req.session;
        session.biz = true;
        session.biz_id = rows[0].id;

        //Send result & Redirect to view. Something have to be sent back
        res.send("RESIGT_SUCCESS");

        //Release connection
        connection.release();
      });
    });
  });
};


exports.config_bizinfo = function(req, res, next) {

  var param = req.body;
  var email = param.member_email;
  var password = param.member_password;
  //console.log(">>> "+email+" / "+password);

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    var sql = "select email from member where email = ? and password = ? ";


    //Execute SQL
    connection.query(sql, [email, common_util.getHash(password)] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : config_bizinfo #1 : "+err_sql);
        next(err_sql);
        return false;
      }

      if (rows.length == 0) {
        res.send("UPDATE_FAIL");
        //Release connection
        connection.release();
      } else {
        /*
        +---------------------+------------------+------+-----+---------+----------------+
        | Field               | Type             | Null | Key | Default | Extra          |
        +---------------------+------------------+------+-----+---------+----------------+
        | id                  | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
        | provider_name       | varchar(30)      | NO   |     | NULL    |                |
        | description         | varchar(50)      | YES  |     | NULL    |                |
        | contact_phone       | varchar(30)      | NO   |     | NULL    |                |
        | contact_address     | varchar(100)     | YES  |     | NULL    |                |
        | biz_regist_no       | varchar(30)      | YES  |     | NULL    |                |
        | payment_wallet_addr | varchar(60)      | NO   |     | NULL    |                |
        | register_id         | int(10) unsigned | NO   |     | NULL    |                |
        | logdate             | datetime         | NO   |     | NULL    |                |
        +---------------------+------------------+------+-----+---------+----------------+
        */
        sql = "update provider set provider_name=?, description=?, contact_phone=?, contact_address=?, biz_regist_no=?, ";
        sql += " payment_wallet_addr=? where id = ? ";
        //console.log(">> biz id : "+req.session.biz_id+" / "+req.session.biz);
        connection.query(sql, [param.provider_name, param.description, param.contact_phone, param.contact_address, param.biz_regist_no, param.payment_wallet_addr, req.session.biz_id] , function(err_sql, rows)
        {
          if (err_sql)
          {
            connection.release();
            console.log(">> error from sql : config_bizinfo #2 : "+err_sql);
            next(err_sql);
            return false;
          }
          res.send("UPDATE_OK");

          //Release connection
          connection.release();
        });
      }
    });
  });
};


exports.login_member = function(req, res, next) {

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      next(err);
      return false;
    }

    //Make Query
    //var sql = "select id, email from member where email = ? and password = ?";
    var sql = "select a.id as id, a.email as email, b.id as biz, a.verify_yn, a.name as name from member a left outer join provider b on b.register_id = a.id where a.email = ? and a.password = ? ";
    var param = req.body;

    //console.log(">> login proceeding : "+param.member_email+" / "+param.member_password);

    //Execute SQL
    connection.query(sql, [param.member_email, common_util.getHash(param.member_password)] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : member login");
        next(err_sql);
        return false;
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
          session.member_name = rows[0].name;
          session.login = true;

          if(rows[0].biz != null) {
            //console.log("biz id : "+rows[0].biz);
            session.biz = true;
            session.biz_id = rows[0].biz;
          }

          res.send("LOGIN_SUCCESS");
        }
      }

      //Release connection
      connection.release();

    })
  })
};

exports.get_biz_wallet = function(req, res, callback) {

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
    var sql = "select payment_wallet_addr as biz_wallet from provider where register_id = ? ";

    //Execute SQL
    connection.query(sql, req.session.member_id, function(err_sql, rows)
    {
      //var result_str = "";
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql : get_biz_wallet");
        callback(err_sql, null);
        return false;
        //throw err_sql;
        //res.redirect("http://127.0.0.1:8080/");
      }

      //Release connection
      connection.release();
      callback(null, rows);

    });
  });
};

exports.logout_member = function(req, res, next) {
  var session = req.session;
  if (session.login) {
    session.destroy(function(err){
      if(err) {
        next(err);
        return false;
      } else{
        res.send("LOGOUT_SUCCESS");
      }
    });
  }
};
