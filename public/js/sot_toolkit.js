
//제휴사업자 api 연계를 위한 키 설정. ready시에 할당됨
var g_apikey;

$(document).ready(function(){
  //var shoptag = $("shop-sot").toArray();
  //alert(shoptag.length);

  runUI();

  /*
  "<div id='sot_container' class='sot_container'>
    <img id='sot_prod_img' src='http://127.0.0.1:8080/uploads/dummy.jpg' class='sot_prod_img'>
    <div class='sot_content_container'>
      <div id='sot_prod_name' class='sot_prod_content'>Product name is ..</div>
      <div class='sot_prod_content'>
        <div id='sot_prod_price' class='sot_prod_content'>Price is 000 SOT</div>
        <div id='sot_prod_detail' class='sot_prod_detail'>detail info.</div>
        <input type='hidden' id='sot_prod_id'>
      </div>
    </div>
  </div>"
  */

  /*
  $("shop-sot").each(function(){
    alert($(this).attr("item"));
    //$(this).addClass("shop");
    //$(this).before("<span style='font-size:5pt;color:red;font-weight:bold;vertical-align:super'>SOT</span>");
  });
  */

  /*
  alert(shoptag[0].innerHTML);

  //태그 배열 탐색 - 일반 HTML 오브젝트 테그를 사용해야 함
  for(var i=0; i<shoptag.length; i++) {
    //alert(shoptag[i].html());
    shoptag[i].style.color = "red";
  }
  */
});

function runUI() {

  g_apikey = $("shop-sot-apikey").attr("key");
  //alert(g_apikey);

  if($("shop-sot").length > 0) {

    if($("#sot_box").length > 0) {$("#sot_box").remove();}
    if($("#sot_notice_box").length > 0) {$("#sot_notice_box").remove();}
    if($("#sot_prod_box").length > 0) {$("#sot_prod_box").remove();}

    //SOT shop 태그 기본 설정부
    $("shop-sot").addClass("shop");
    //태그 링크 추가
    $("shop-sot").before("<span style='font-size:5pt;color:red;font-weight:bold;vertical-align:super'>SOT</span>");
    //태그 이벤트 추가
    $("shop-sot").mouseenter(function(){sot_find_product($(this),"BOTTOM");});
    //상품정보 출력 상자 생성
    $("body").append("<div id='sot_box' class='sot_box'><div id='sot_container' class='sot_container'><img id='sot_prod_img' src='http://127.0.0.1:8080/uploads/dummy.jpg' class='sot_prod_img'><div class='sot_content_container'><div id='sot_prod_name' class='sot_prod_name'>Product name is ..</div><div class='sot_prod_content'><div id='sot_prod_price' class='sot_prod_price'>Price is 000 SOT</div><div id='sot_prod_detail' class='sot_prod_detail'><a href='#' id='sot_view_more' target='_blank'>more</a></div></div></div></div></div>");

    $("#sot_box").mouseleave(function(){
      clearTimeout(prod_window);
      $(this).fadeOut("fast");
    });


    //SOT 알림 메시지 출력부분
    $("body").append("<div id='sot_notice_box' class='sot_box' style='minwidth:30%'><div id='sot_notice_content' class='sot_notice_container'>SOT Notice Area.</div></div>");
    $("#sot_notice_box").css("top", ($(window).height()/2 - 80));
    $("#sot_notice_box").css("left", $(window).width()/2 - 170);
    $("#sot_notice_content").html("지금 이 페이지에는 SOT 코인으로 구매 가능한 "+$("shop-sot").length+"개의 최저가 상품이 있습니다. <br><br>SOT 링크에서 확인하세요!");
    $("#sot_notice_box").fadeIn("slow");
    setTimeout("hideMsgNotice()",2500);


    //우측 상단 SOT product box toolkit 생성부분
    $("body").append("<div id='sot_prod_box' class='sot_box' style='minwidth:30%;z-index:10180'><div id='sot_product_content' class='sot_product_container'></div></div>");
    $("#sot_product_content").append("<div style='margin-bottom:10px;font-size:12pt'>-SOT shop-</div>");
    $("shop-sot").each(function(){
      var item = $(this).attr("item");
      if(item == undefined) {
        $("#sot_product_content").append("<shop-sot-prodbox class='sot_product_item'>"+$(this).text()+"</shop-sot-prodbox>");
      } else {
        $("#sot_product_content").append("<shop-sot-prodbox class='sot_product_item' item='"+item+"'>"+$(this).text()+"</shop-sot-prodbox>");
      }
    });

    $("#sot_prod_box").css("position", "fixed");
    $("#sot_prod_box").css("top", 10);
    $("#sot_prod_box").css("left", $(window).width() - 100);
    $("shop-sot-prodbox").mouseenter(function(){sot_find_product($(this),"LEFT");});
    $("#sot_prod_box").fadeIn("slow");

    $(window).resize(function(){
      $("#sot_prod_box").css("left", $(window).width() - 100);
    });

  }

}

function hideMsgNotice() {
  $("#sot_notice_box").fadeOut("slow");
}

//상품검색된 내용을 cache에 담았다가 재사용. 중복된 조회를 방지하기 위함
var prodMap = {};
var prod_window;

function sot_find_product(obj, positionSystem) {

  var searchType;
  var searchKey;
  var attr = obj.attr("item");

  if (attr == undefined) {
    searchType = "BY_NAME";
    searchKey = obj.text();
  } else {
    if($.isNumeric(attr)) {
      searchType = "BY_PROD_CD";
    } else {
      searchType = "BY_CATEGORY";
    }
    searchKey = obj.attr("item");
  }

  //alert("searchType : "+searchType+" / searchKey : "+searchKey);
  //
  var offsetSOT = obj.offset();


  //Cache에서 기존 조회된 상품 상세 정보를 찾으면 이를 재활용 함
  var hashKeyCache = searchType+"&&"+searchKey;
  var prodCache = prodMap[hashKeyCache];
  if(prodCache != undefined) {
    $("#sot_prod_img").attr("src",prodCache.img_url);
    $("#sot_prod_name").text(prodCache.prod_name);
    $("#sot_prod_price").text(prodCache.prod_price);
    $("#sot_view_more").attr("href",prodCache.view_more);

    if(positionSystem == "BOTTOM") {
      $("#sot_box").css("top", offsetSOT.top+20);
      $("#sot_box").css("left", offsetSOT.left);
      //$("#sot_box").fadeIn("fast");
    } else if (positionSystem == "LEFT") {
      $("#sot_box").css("top", offsetSOT.top);
      $("#sot_box").css("left", offsetSOT.left-220);
      //$("#sot_box").fadeIn("fast");
    }
    $("#sot_box").fadeIn("fast",function(){
      clearTimeout(prod_window);
      prod_window = setTimeout("$('#sot_box').fadeOut('fast')", 4000);
    });

    return false;
  }

  //Cache에 없는 경우에만 서버에서 불러옴
  //Get data from platform and set to #sot_prod_img, #sot_prod_name, #sot_prod_price, #sot_prod_id
  //
  var addr = "http://127.0.0.1:8080/action_find_product";

  $.post(addr,
  {
    searchType : searchType,
    searchKey : searchKey,
    ad_biz_code : g_apikey
  },
  function(data, status){
    if(status == "success"){
      //$("#regist_form").html("Thank you for registration. <br> your email is "+email+". We sent verification email to you. Please confirm it soon.");

      if(data == "NO_DATA") {
        alert("NO DATA FOUND");
      } else {
        var img_url = "http://127.0.0.1:8080/uploads/"+data[0].img_url;
        var prod_name = data[0].prod_name;
        var prod_price = data[0].price_sot.toFixed(2)+" SOT";
        var view_more = " http://127.0.0.1:8080/sot_view_product?prod_id="+data[0].id+"&ad_biz_code="+g_apikey;

        $("#sot_prod_img").attr("src",img_url);
        $("#sot_prod_name").text(prod_name);
        $("#sot_prod_price").text(prod_price);
        $("#sot_view_more").attr("href",view_more);

        var hashKey = searchType+"&&"+searchKey;
        var prodObj = new Object();
        prodObj.img_url = img_url;
        prodObj.prod_name = prod_name;
        prodObj.prod_price = prod_price;
        prodObj.view_more = view_more;
        prodMap[hashKey] = prodObj;

        //View the result
        if(positionSystem == "BOTTOM") {
          $("#sot_box").css("top", offsetSOT.top+20);
          $("#sot_box").css("left", offsetSOT.left);
          //$("#sot_box").fadeIn("fast");
        } else if (positionSystem == "LEFT") {
          $("#sot_box").css("top", offsetSOT.top);
          $("#sot_box").css("left", offsetSOT.left-220);
          //$("#sot_box").fadeIn("fast");
        }
        $("#sot_box").fadeIn("fast",function(){
          clearTimeout(prod_window);
          prod_window = setTimeout("$('#sot_box').fadeOut('fast')", 4000);
        });
      }
    } else {
      alert("There's some problem . Please try it in seconds.");
    }
  });
}
