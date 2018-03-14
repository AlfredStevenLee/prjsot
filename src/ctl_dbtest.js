var dbpool = require("./dbcon").pool;


//메인 컨트롤러 파일
//아래와 같이 export를 통해 하나씩 메소드를 지정하고 그 내부에서 렌더링 할 파일로 redirection하면서 결과값을 함게 보내 줌

exports.test = function(req, res) {

  //getConnection
  dbpool.getConnection(function(err, connection){
    if (err)
    {
      connection.release();
      callback(null, err);
      throw err;
    }

    //Make Query
    var param = ["dwsmile@gmail.com"];

    //Execute SQL
    connection.query("select * from member where email = ?", param , function(err, rows)
    {
      //Send result & Redirect to view
      res.render('about.html',{title:"Sot_Title", length:10, result: rows});

      //Release connection
      connection.release();
    })
  })
};
