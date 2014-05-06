
function verify_session(token){
  /* binda il bottone per verificare la sessione */
  $("#uno").on('click', function(){
    alert('click');
    $.xmlrpc({
      url: 'http://api.opensubtitles.org/xml-rpc',
      methodName: 'NoOperation',
      params: [token],
      success: function(response, status, jqXHR) { console.log(response); },
      error: function(jqXHR, status, error) { alert('errore');}
    });
  });
};

var search_imdb = function(token, sublanguageid, imdbid){
  var xmml= "<methodCall><methodName>SearchSubtitles</methodName><params><param><value><string>"+token+"</string></value></param><param><value><array><data><value><struct><member><name>sublanguageid</name><value><string>"+sublanguageid+"</string></value></member><member><name>imdbid</name><value><string>"+imdbid+"</string></value></member></struct></value></data></array></value></param></params></methodCall>";

  $.ajax({
    url: 'http://api.opensubtitles.org/xml-rpc', 
    type: "POST",
    contentType: "text/xml",
    data: xmml,
    success: function(response){
      var array = new Array();
      re = $.xmlrpc.parseDocument(response);
      console.log(re);
      $.each(re[0].data, function(index, value) {

        array.push(new Object({
          "name":"<i class='fa fa-file'></i><a href='"+value.SubDownloadLink+"'>"+value.SubFileName+"</a>",
          "language":   value.LanguageName
        }));
      });
      $('#example').dataTable({
        "pageLength": 5 ,
        "order": [],
        "ordering": false,
        "lengthChange": false,
        "info": false,
        "destroy": true,
        "data": array,
        "columns": [
        { "data": "name" },
        { "data": "language" },
        ]
      });
      $(".panel").has(".content-home").hide();
      $(".panel").has(".content-result").show();
      $(".panel").has(".content-result").addClass('animated fadeIn');
      $(".content-result").show();
      retrieve_info(token, imdbid);
    }
  });

}  

var sendd_xml  = function(token, sublanguageid, moviehash, moviebytesize, imdbid ){

  var xmml= "<methodCall><methodName>SearchSubtitles</methodName><params><param><value><string>"+token+"</string></value></param><param><value><array><data><value><struct><member><name>sublanguageid</name><value><string>"+sublanguageid+"</string></value></member><member><name>moviehash</name><value><string>"+moviehash+"</string></value></member><member><name>moviebytesize</name><value><double>"+moviebytesize+"</double></value></member></struct></value></data></array></value></param></params></methodCall>";
  $.ajax({
    url: 'http://api.opensubtitles.org/xml-rpc', 
    type: "POST",
    contentType: "text/xml",
    data: xmml,
    success: function(response){
      var re = $.xmlrpc.parseDocument(response);
      console.log(re);
      var array = new Array();
      if(!re[0].data){
        var title = $("#caption-film").html();

        $.xmlrpc({
          url: 'http://api.opensubtitles.org/xml-rpc',
          methodName: 'SearchMoviesOnIMDB',
          params: [token, title],
          success: function(response, status, jqXHR) {
            re = response[0].data[0];
            console.log('ci siamo');
            console.log(response); 
            imdbid = re.id;
            for(i = 1; i<5; i++){
              $('#wrong-'+i).html(response[0].data[i].title+"<input type='hidden' value='"+response[0].data[i].id+"'>" );
            }
            search_imdb(token, sublanguageid,  imdbid);
            
            
          },
          error: function(jqXHR, status, error) { alert('errore');}
        });
      } else {
       $.each(re[0].data, function(index, value) {

        array.push(new Object({
          "name":"<i class='fa fa-file'></i><a href='"+value.SubDownloadLink+"'>"+value.SubFileName+"</a>",
          "language":   value.LanguageName
        }));
      }); 
       $('#example').dataTable({
        "pageLength": 5 ,
        "order": [],
        "ordering": false,
        "lengthChange": false,
        "info": false,
        "destroy": true,
        "data": array,
        "columns": [
        { "data": "name" },
        { "data": "language" },
        ]
      });
       $(".panel").has(".content-home").hide();
       $(".panel").has(".content-result").show();
       $(".panel").has(".content-result").addClass('animated fadeIn');
       $(".content-result").show();
       retrieve_info(token, re[0].data[0].IDMovieImdb);

     }
     



   }
 });

};

var retrieve_info  = function (token , imdbid) {
 $.xmlrpc({
  url: 'http://api.opensubtitles.org/xml-rpc',
  methodName: 'GetIMDBMovieDetails',
  params: [token, imdbid],
  success: function(response, status, jqXHR) {
    console.log(response[0].data.cover);
    $("#film-img").attr("src", response[0].data.cover);
    $("#film-title").html(response[0].data.title);
    $("#film-plot").html(response[0].data.plot);
  },
  error: function(jqXHR, status, error) { alert('errore');}
});
}



