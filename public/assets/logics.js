$(document).ready(function(){
  console.log('Website successfully loaded');

  $('#psw').on("click", function() {
    $('#myPopup').toggleClass('show');
  });

  $('#psw').on("blur", function() {
    $('#myPopup').toggleClass('hide');
  });

  // logic for sme registration
  $('#smeForm').on("submit", function(e) {
    e.preventDefault();
    var formData = new FormData();
    var email = $('#email').val(); 
    var companyname = $('#companyname').val();
    var location = $('#location1').val();
    var postal = $('#postal').val();
    var foundingdate = $('#foundingdate').val();
    var capital = $('#capital').val();
    var userposition = $('#userposition').val();
    // identify by email
    formData.append('email',email);
    formData.append('companyname',companyname);
    formData.append('location',location);
    formData.append('postal',postal);
    formData.append('foundingdate',foundingdate);
    formData.append('capital',capital);
    formData.append('userposition',userposition);
    var imageFiles = document.getElementById('annualReport');
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
      url: '/uploadForm',
      data: formData,
      contentType: false,
      cache: false,
      dataType:"text",
      processData: false,
      success:function(data){
        console.log(data);
        window.location.href='/logout';
      }
    })

  });

  // login in form submit logic
  $('#loginForm').on("submit", function(e) {
    e.preventDefault();
    var username = $('#name1').val().trim();
    var password = $('#pw1').val().trim();
    var loginDetails = {username:username,password:password};
    //sending ajax request 
    var request = $.ajax({
      type: 'GET',
      url: '/loginCheck/username/password',
      data: loginDetails,
      dataType:"json",
      success:function(data){
        //console.log('data is ' + JSON.stringify(data));
        if(data.message == 'User Authenticated'){
          if(data.userrole == 'USER'){
            window.location.href = '/userpage';
          }else{
            // if user is sme
            //window.location.href = '/smepage';
          }
        }else{
          alert(data.message);
        }
      }
      })
  });

  // registration form submit logic
  $('#submitForm').on("submit", function(e) {
    e.preventDefault();
    var username = $('#name2').val().trim();
    var email = $('#email2').val().trim();
    var password = $('#psw').val().trim();
    var role = $('#typeOfUser :selected').val();
    var creationDetails = {un:username,email:email,pw:password,role:role};
    var request = $.ajax({
      type: 'POST',
      url: '/submitNewUser',
      data: creationDetails,
      dataType:"json",
      success:function(data){
        if (data.role === 'USER'){
         alert(`New user account for ${data.username} created, you can login now`);
         window.location.reload();
        }else{
          // sme account 
          console.log('redirecting to sme form after sme users are created') ;
          window.location.href = '/smeForm/' + data.username + '/' + data.email;              
        }
        //location.reload();
      },
      error:function(xhr,status,thrownError){
        console.log('error is',xhr);
        alert('Duplicate email, please enter a new email!');
        $('#email2').val('');
        $('#email2').focus();
      }
    })
  })
});
