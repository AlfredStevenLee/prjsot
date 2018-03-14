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

    //Execute SQL
    connection.query(sql, [param.member_email, param.member_password, param.member_name] , function(err_sql, rows)
    {
      if (err_sql)
      {
        connection.release();
        //console.log(">> error from sql");
        throw err;
      }
      //Send result & Redirect to view
      res.send("regist ok");

      //Release connection
      connection.release();
    })
  })
};
