var dbpool = require("./dbcon").pool;


//메인 컨트롤러 파일
//아래와 같이 export를 통해 하나씩 메소드를 지정하고 그 내부에서 렌더링 할 파일로 redirection하면서 결과값을 함게 보내 줌

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
    var sql = "insert into member(email, password, name, logdate) values(?, ?, ?, now())";
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
      //Send result & Redirect to view. Something have to be sent back
      res.send("RESIGT_SUCCESS");

      //Release connection
      connection.release();
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
    var sql = "select id, email from member where email = ? and password = ?";
    var param = req.body;

    //console.log(">> login proceeding : "+param.member_email+" / "+param.member_password);

    //Execute SQL
    connection.query(sql, [param.member_email, param.member_password] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        console.log(">> error from sql");
        throw err;
      }

      //Send result & Redirect to view
      if(rows.length == 0)
      {
        //Login failed
        //console.log(">> login fail");
        res.send("LOGIN_FAIL");
      }
      else
      {
        //login success
        //console.log(">> login success");

        //register user data in session
        var session = req.session;
        session.member_id = rows[0].id;
        session.member_email = rows[0].email;
        session.login = true;
        //console.log(">> get login data from session: "+session.login);
        res.send("LOGIN_SUCCESS");
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
