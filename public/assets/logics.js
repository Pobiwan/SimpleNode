$(document).ready(function(){
  console.log('Website successfully loaded');

  $('#psw').on("click", function() {
    $('#myPopup').toggleClass('show');
  });

  $('#psw').on("blur", function() {
    $('#myPopup').toggleClass('hide');
  });

  $('#reportForm').on("submit", function(e) {
    e.preventDefault();
    var formData = new FormData();
    var title = $('#title1').val();
    var location = $('#location1').val();
    var description = $('#text1').val();
    var timestamp = new Date();
    formData.append('title',title);
    formData.append('location',location);
    formData.append('description',description);
    formData.append('timestamp',timestamp);
    var imageFiles = document.getElementById('imageFiles');
    var imageList = imageFiles.files;
    for (var i = 0; i < imageList.length; i++) {
      var image = imageList[i];
  // Check the file type.
      if (!image.type.match('image.*')) {
        continue;
      }
    // Add the file to the request.
      formData.append('myimage', image);
    }
    var request = $.ajax({
      type: 'POST',
      url: '/uploadFault',
      data: formData,
      contentType: false,
      cache: false,
      dataType:"text",
      processData: false,
      success:function(data){
        alert(data);
        window.location.href='/logout'
      }
    })

  });

  $('#loginForm').on("submit", function(e) {
    e.preventDefault();
    var username = $('#name1').val().trim();
    var password = $('#pw1').val().trim();
    var loginDetails = {username:username,password:password};
    var request = $.ajax({
      type: 'GET',
      url: '/loginCheck/username/password',
      data: loginDetails,
      dataType:"json",
      success:function(data){
        //console.log('data is ' + JSON.stringify(data));
        if(data.message == 'User Authenticated'){
          if(data.userrole == 'user'){
            window.location.href = '/logissue'
          }else{
            window.location.href = '/adminPage'
          }
        }else{
          alert(data.message);
        }
      }
      })
  });

  $('#submitForm').on("submit", function(e) {
    e.preventDefault();
    var username = $('#name2').val().trim();
    var email = $('#email2').val().trim();
    var password = $('#psw').val().trim();
    var creationDetails = {un:username,email:email,pw:password};
    var request = $.ajax({
      type: 'POST',
      url: '/submitNewUser',
      data: creationDetails,
      dataType:"text",
      success:function(data){
        alert(data);
        location.reload();
      },
      error:function(error){
        alert(error);
        location.reload();
      }
    })

  })
});
