$(document).ready(function () {
  console.log("ready!");
});

$("#submitBtn").click((e) => {
  e.preventDefault();

  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if ($("#username").val() == "") {
    addChangeUsername();
    return false;
  }

  if ($("#name").val() == "") {
    addChangeName();
    return false;
  }

  if ($("#password").val() == "") {
    addChangePwd();
    return false;
  }

  if (!regex.test($("#username").val())) {
    addChangeUsername();
    return false;
  }

  var formData = {
    name: $("#name").val(),
    username: $("#username").val(),
    password: $("#password").val(),
    usertype: $("#submitBtn").val(),
  };

  console.log(formData);
  var url = $("#form").attr("action");
  console.log(url);
  $.ajax({
    url: url,
    type: "post",
    data: formData,
    success: function (d) {
      console.log(d);
      window.location.href = d.url;
    },
    error: function (request, status, error) {
      console.log(request);
      console.log(status);
      console.log(error);
      alert(request.responseText);
    },
  });
});

function addChangeUsername() {
  $("#username").val("");
  $("#password").val("");
  setTimeout(function () {
    $("#username").attr("placeholder", "Username@gmail.com");
    $("#username").css("border", "none");
  }, 2000);
  $("#username").attr("placeholder", "Enter valid Email Id");
  $("#username").css("border", "2px solid red");
}

function addChangePwd() {
  $("#password").val("");
  setTimeout(function () {
    $("#password").css("border", "none");
  }, 2000);
  $("#password").attr("placeholder", "Please enter valid password");
  $("#password").css("border", "2px solid red");
}

function addChangeName() {
  $("#name").val("");
  setTimeout(function () {
    $("#name").css("border", "none");
  }, 2000);
  $("#name").attr("placeholder", "Please enter your name");
  $("#name").css("border", "2px solid red");
}
