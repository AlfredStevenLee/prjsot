var dbpool = require("./dbcon").pool;


//메인 컨트롤러 파일
//아래와 같이 export를 통해 하나씩 메소드를 지정하고 그 내부에서 렌더링 할 파일로 redirection하면서 결과값을 함게 보내 줌

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
      callback(null, err);
      throw err;
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
        throw err;
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

      //Release connection
      connection.release();
      callback(null, result_str);

    });
  });

};
