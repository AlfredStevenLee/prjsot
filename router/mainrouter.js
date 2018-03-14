module.exports = function(app)
{
  app.get('/', function(req, res){
    res.render('sot_index.html');
  });
  app.get('/about', function(req, res){
    res.render('about.html',{title:"Sot_Title", length:10});
  });
  app.get('/sotmain', function(req, res){
    res.render('../sot_main.html');
  });

  app.get('/dbtest', require("../src/ctl_dbtest").test); //Router 파일이 있는 위치 기준으로 컨트롤러 파일 경로를 써줌

  app.get('/register_member', function(req, res){
    res.render('../sot_register_member.html');
  });

  app.post('/action_register_member', require("../src/ctl_member").register_member);
  /*app.post('/action_register_member',function(req, res){
    console.log(">>> router \n"+req.body);
  });*/


}
