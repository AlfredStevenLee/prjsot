var dbpool = require("./dbcon").pool;


//메인 컨트롤러 파일
//아래와 같이 export를 통해 하나씩 메소드를 지정하고 그 내부에서 렌더링 할 파일로 redirection하면서 결과값을 함게 보내 줌

exports.msg_list_html_maker = function(req, msglist) {

  var result = "";
  var myid = req.session.member_id;

  if(msglist.length == 0) {
    return  "NO_DATA";
  }
  /*
  +---------------------+------------------+------+-----+---------+-------+
  | Field               | Type             | Null | Key | Default | Extra |
  +---------------------+------------------+------+-----+---------+-------+
  | msg_from            | int(10) unsigned | NO   |     | NULL    |       |
  | msg_to              | int(10) unsigned | NO   |     | NULL    |       |
  | msg_text            | varchar(500)     | YES  |     | NULL    |       |
  | related_contract_id | int(10) unsigned | YES  |     | NULL    |       |
  | type                | char(3)          | NO   |     | NULL    |       |
  | logdate             | datetime         | NO   |     | NULL    |       |
  +---------------------+------------------+------+-----+---------+-------+
  */

  for(var i=0; i < msglist.length; i++ ) {
    result +="<article class=\"article_box\">";

    result +="  <div class=\"content\" >";

    if(msglist[i].msg_from == myid) {
      //보낸 메시지
      result +="    <div class='msgbox_header msgbox_header_out' style=\"margin-bottom:10px;position:relative\">";
      result += "      <span class='ui-icon ui-icon-arrowthick-1-w'></span><span>"+msglist[i].to_name+"</span><a href='javascript:msgTo("+msglist[i].msg_to+","+msglist[i].related_contract_id+")'><span class='ui-icon ui-icon-comment'></span></a>";
    } else {
      //받은 메시지
      result +="    <div class='msgbox_header msgbox_header_in' style=\"margin-bottom:10px;position:relative\">";
      result += "      <span class='ui-icon ui-icon-arrowthick-1-e'></span><span>"+msglist[i].from_name+"</span><a href='javascript:msgTo("+msglist[i].msg_from+","+msglist[i].related_contract_id+")'><span class='ui-icon ui-icon-comment'></span></a>";
    }

    result += "        <span class='msgbox_logdate'>"+msglist[i].logdate+"</span>";

    result +="    </div>";

    result +="    <div class='msgbox_text'>"+msglist[i].msg_text+"</div>";

    if(msglist[i].related_contract_id > 0) {
      if(msglist[i].seller_id == myid) {
        //판매상품
        result +="    <div class='msgbox_text'><a href=\"javascript:pageUrlAddParam(\'/contract_seller?cntrno="+msglist[i].related_contract_id+"\')\">판매계약</a></div>";
      } else {
        //구매상품
        result +="    <div class='msgbox_text'><a href=\"javascript:pageUrlAddParam(\'/contract_buyer?cntrno="+msglist[i].related_contract_id+"\')\">구매계약</a></div>";
      }
    }

    result +="  </div>";
    result +="</article>";
  }

   return result;
};


exports.contract_buyer_list_html_maker = function(contract_list) {

  var result = "";

  if(contract_list.length == 0) {
    return  "NO_DATA";
  }

  for(var i=0; i < contract_list.length; i++ ) {
    result +="<article class=\"article_box\">";
    result +="  <a href=\"javascript:view_prod_detail('"+contract_list[i].prod_id+"')\" class=\"image\">";
    result +="    <div style=\"color:#000000\">"+contract_list[i].logged_date+" </div>";
    result +="    <div class=\"small_img_box\"><img src=\"/uploads/"+contract_list[i].img_url+"\" class=\"small_img_clip\" /></div>";
    result +="  </a>";

    result +="  <div class=\"content\" style=\"margin-left:10px\">";
    result +="    <div style=\"margin-bottom:10px;position:relative\">";
    result +="      <span id=\"CNTR_STAT_"+contract_list[i].id +"\">"+ contract_list[i].contract_status_val +"</span>";
    if (contract_list[i].contract_status == "REG") {
      result +="    <span id=\"REG_"+contract_list[i].id+"\">";
      result +="       [<a href=\"javascript:doConfirmContract("+ contract_list[i].id +")\">구매확정</a> /";
      result +="       <a href=\"javascript:doCancelContract("+contract_list[i].id+")\">구매취소</a>]";
      result +="    </span>";
    }
    //result +="      <span style=\"position:absolute;right:3px\">계약 : "+contract_list[i].logged_date+" </span>";
    result +="    </div>";

    result +="    <div>"+contract_list[i].prod_name+"</div>";
    result +="    <div>"+contract_list[i].price_sot.toFixed(2)+" SOT ("+contract_list[i].price_krw+" KRW) </div>";
    result +="    <div>결제지갑 : "+contract_list[i].buyer_account_no+" </div>";

    if(contract_list[i].logistics_yn == "Y") {
      result +="    <div class='logis_text_box'><div class='logis_text_content'>택배주소 : ("+contract_list[i].logis_zip+") "+contract_list[i].logis_addr1+" "+contract_list[i].logis_addr2+"</div></div>";
    }

    result +="    <div><a href='javascript:viewSellerInfo("+contract_list[i].seller_id+")'>판매자정보</a> | <a href='javascript:msgTo("+contract_list[i].seller_id+","+contract_list[i].id+")'>문의하기</a></div>";

    result +="  </div>";
    result +="</article>";
  }

   return result;
};


exports.contract_seller_list_html_maker = function(contract_list) {

  var result = "";

  if(contract_list.length == 0) {
    return  "NO_DATA";
  }

  for(var i=0; i < contract_list.length; i++ ) {
    result +="<article class=\"article_box\">";
    result +="  <a href=\"javascript:view_prod_detail('"+contract_list[i].prod_id+"')\" class=\"image\">";
    result +="    <div style=\"color:#000000\">"+contract_list[i].logged_date+" </div>";
    result +="    <div class=\"small_img_box\"><img src=\"/uploads/"+contract_list[i].img_url+"\" class=\"small_img_clip\" /></div>";
    result +="  </a>";
    result +="  <div class=\"content\" style=\"margin-left:10px\">";

    result +="    <div style=\"margin-bottom:10px;position:relative\">";
    result +="      <span id=\"CNTR_STAT_"+contract_list[i].id +"\">"+ contract_list[i].contract_status_val +"</span>";
    if (contract_list[i].contract_status == "REG") {
      result +="    <span id=\"REG_"+contract_list[i].id+"\">";
      //result +="       [<a href=\"javascript:doConfirmContract("+ contract_list[i].id +")\">구매확정</a> /"; //판매자는 확정 못함
      result +="       [<a href=\"javascript:doCancelContract("+contract_list[i].id+")\">판매취소</a>]";
      result +="    </span>";
    }
    //result +="      <span style=\"position:absolute;right:3px\">계약 : "+contract_list[i].logged_date+" </span>";
    result +="    </div>";

    result +="    <div>"+contract_list[i].prod_name+"</div>";
    result +="    <div>"+contract_list[i].price_sot.toFixed(2)+" SOT ("+contract_list[i].price_krw+" KRW) </div>";
    result +="    <div>결제지갑 : "+contract_list[i].seller_account_no+" </div>";

    if(contract_list[i].logistics_yn == "Y") {
      result +="    <div class='logis_text_box'><div class='logis_text_content' id='logis_addr_"+contract_list[i].id+"'>택배주소 : ("+contract_list[i].logis_zip+") "+contract_list[i].logis_addr1+" "+contract_list[i].logis_addr2+"</div></div>";
    }

    result +="    <div><a href=\"javascript:viewBuyerInfo("+contract_list[i].buyer_id+","+contract_list[i].id+", 'logis_addr_"+contract_list[i].id+"')\">구매자정보</a> | <a href='javascript:msgTo("+contract_list[i].buyer_id+","+contract_list[i].id+")'>쪽지보내기</a></div>";

    result +="  </div>";
    result +="</article>";
  }

   return result;
};



exports.my_product_html_maker = function(prod_list, currency) {

  var result = "";

  if(prod_list.length == 0) {
    return  "NO_DATA";
  }

  for(var i=0; i < prod_list.length; i++ ) {

		result += "<article class=\"article_box\">";
		result += "	<a href=\"javascript:view_prod_detail('"+prod_list[i].id +"')\" class=\"image\">";
		result += "		<div class=\"small_img_box\"><img src=\"/uploads/"+prod_list[i].img_url+"\" class=\"small_img_clip\"/></div>";
		result += "	</a>";
		result += "	<div class=\"content\" style=\"margin-left:10px\">";
		result += "		<div class=\"content\" style=\"margin-bottom:10px\"> "+prod_list[i].prod_name +"</div>";


    var pre_krw = prod_list[i].price_krw;
    var cur_krw = prod_list[i].price_sot * currency.sot_krw;
    var gap_diff = cur_krw - pre_krw;
    var gap_percent = (gap_diff*100/pre_krw).toFixed(1);
    var gap_symbol = "";
    if(gap_diff == 0) {
      gap_symbol = "";
    } else if(gap_diff < 0) {
      gap_symbol = "↓";
    } else {
      gap_symbol = "↑";
    }

    result +="    <div>";
    result +="      판매가격 : "+ prod_list[i].price_sot.toFixed(2) +" SOT";
    result +="    </div>";
    result +="    <div>";
    result +="      시세변화 : 등록 "+ pre_krw +"원, 현재 "+ cur_krw.toFixed(0) +"원/"+gap_percent+"% "+gap_symbol;
    result +="    </div>";
    result +="    <div>구매 "+ prod_list[i].sellcount +" 회</div>";
    result +="  </div>";
    result +="</article>";
   }

   return result;
};

exports.product_html_maker = function(prod_list, currency) {

  var result = "";

  if(prod_list.length == 0) {
    return  "NO_DATA";
  }

  for(var i=0; i < prod_list.length; i++ ) {

    result += "<article class=\"article_box_main\">";
    result += "  <a href=\"javascript:view_prod_detail('"+prod_list[i].id+"')\" class=\"image\">";
    result +="     <div class=\"small_img_box_main\"><img src=\"/uploads/"+prod_list[i].img_url+"\" class=\"small_img_clip_main\" /></div>";
    result += "  </a>";
    result +="  <p> "+prod_list[i].prod_name+" </p>";

    var pre_krw = prod_list[i].price_krw;
    var cur_krw = prod_list[i].price_sot * currency.sot_krw;
    var gap_diff = cur_krw - pre_krw;
    var gap_percent = (gap_diff*100/pre_krw).toFixed(1);
    var gap_symbol = "";
    if(gap_diff == 0) {
      gap_symbol = "";
    } else if(gap_diff < 0) {
      gap_symbol = "↓";
    } else {
      gap_symbol = "↑";
    }

    result +="  <span>";
    result +="    "+prod_list[i].price_sot.toFixed(2)+" SOT (등록가 "+pre_krw+" 원, 현재 "+cur_krw.toFixed(0)+" 원 / "+gap_percent+"% "+gap_symbol+" )";
    result +="  </span>";
    result +="  <div>구매 "+prod_list[i].sellcount+" 회</div>";
    result +="</article>";
   }

   return result;
};




exports.errorHandler = function(req, res, err) {
  console.log("\n\n\n#####--- Error occurred from [ "+req.path+" ] ---#####\n");
  console.log("## DATE TIME : "+new Date());
  console.log("## ");
  console.log("## ERROR : "+err);
  console.log("## ");
  console.log("\n###################################################\n\n\n");
  res.render('../sot_under_mgmt.html', {req : req, res : res});
};


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
            console.log(">>>>>>>>>>>> ERROR from getCurrency Info : can't get sql connection! : "+err);
            connection.release();
            return false;
          }

          //Make Query
          var sql = "insert into currency values(null,?,?,now()) ";

          //Execute SQL
          connection.query(sql,[eth_krw, sot_krw] ,function(err_sql, rows)
          {
            if (err_sql)
            {
              connection.release();
              console.log(">>>>>>>>>>>> ERROR from getCurrency Info : SQL ERROR : "+err_sql);
              return false;
            }

            //Release connection
            connection.release();
          });
        });
      }
    });
  });
};



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
        callback(err_sql, null);
        return false;
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
        callback(err_sql, null);
        return false;
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
