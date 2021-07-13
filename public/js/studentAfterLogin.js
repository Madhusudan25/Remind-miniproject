$(document).ready(function () {
  window.addEventListener("load", () => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  });
});

getDetails();
$(".append").append(
  '<a class="nav-item nav-link navigation-items profile"  style="color: rgba(0, 0, 0, 1)"><img id="profilepic" src="/images/download.jpg" width="30px" /><span id="profileName"></span></a>'
);

$(".append").append(
  '<a class="nav-item nav-link navigation-items profile" style="color: rgba(0, 0, 0, 1)" href="/logout">Logout</a>'
);

function getDetails() {
  var hrefurl = window.location.href;
  console.log(hrefurl);
  if (hrefurl.endsWith("#")) {
    hrefurl = hrefurl.slice(0, -1);
  }
  const url = hrefurl + "/getDetails";
  console.log("Student Onload triggered");
  $.ajax({
    url: url,
    type: "post",
    data: {},
    success: function (d) {
      dynamicOnloadFill(d.data);
    },
    error: function (request, status, error) {
      alert(request.responseText);
    },
  });
}

function dynamicOnloadFill(student) {
  console.log(student);
  var name = student.name;
  var workSchedule = student.studentSchedule;
  var assignments = student.givenAssignment;
  var profilePic = student.profilePic;
  var customlists = student.customLists;

  if (profilePic != undefined) {
    console.log("Profilepic found");
    $("#profilepic").attr("src", profilePic);
  } else {
    console.log("Profilepic not found");
  }

  $("#profileName").text(name);

  workSchedule.forEach((item) => {
    $("#work-schedule-list")
      .append(`<li class="list-group-item"><input type="checkbox" 
        onchange="handleDelete(event)" name="checkbox" 
        id=${item._id} value=${item._id} /> ${item.name}</li>`);
  });

  assignments.sort(function (a, b) {
    return new Date(b.deadline) - new Date(a.deadline);
  });

  // console.log(assignments);

  assignments.forEach((assignment) => {
    handlePostedAssignmentDisplay(assignment);
  });

  customlists.forEach((list) => {
    displayCustomListsDynamic(list);
  });
}

function displayCustomListsDynamic(list) {
  $("#accordionExample").append(`
  <div class="accordion-item">
  <h2 class="accordion-header">
    <button
      class="accordion-button collapsed"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#${list.listName}"
      aria-expanded="false"
      aria-controls="collapseTwo"
    >
    ${list.listName}
    <i
      class="fas fa-trash-alt deleteListIcon"
      onclick="deleteCustomList(event)"
      name=${list._id}
      value=${list.listName}
    ></i>
    </button>
  </h2>
  <div
    id=${list.listName}
    class="accordion-collapse collapse"
    aria-labelledby="headingTwo"
    data-bs-parent="#accordionExample"
  >
    <div class="accordion-body">
    <ul class="list-group" id="${list.listName}${list._id}">
  </ul>
  <br /><br />
  <div class="input-group mb-3">
    <input
      type="text"
      class="form-control"
      aria-describedby="button-addon2"
    />
    <button
      class="btn btn-outline-success"
      type="button"
      id=${list._id}
      value="${list.listName}"
      onclick="customListItemHandler(event)"
    >
      Add
    </button>
  </div>
    </div>
  </div>
</div>`);

  list.description.forEach((item) => {
    $(`#${list.listName}${list._id}`).append(`<li class="list-group-item">
        <input type="checkbox" onchange="dltCustomListItem(event)" name=${list.listName} 
        id="${item._id}" value="${item._id}" />
        ${item.name}
      </li>`);
  });
}

function handlePostedAssignmentDisplay(data) {
  // var formattedPostedDate=new Date(data.postedTime).toLocaleDateString();
  var formattedDeadlineDate = new Date(data.deadline).toLocaleDateString();

  let result = data.postedTime.match(/\d\d:\d\d/);
  // var formattedPostedTime=formatTime(result[0]);

  result = data.deadline.match(/\d\d:\d\d/);
  var formattedDeadlineTime = formatTime(result[0]);
  // <div class="postedTime">Posted : ${formattedPostedDate} ${formattedPostedTime}</div>

  $("#postedAssignmentDisplay")
    .prepend(`<li class="list-group-item studentAssignmentli">
        <div class="deadlineTime">
            <div class="displaySubject">
                Subject :${data.subject}
            </div>
            <i class="fas fa-trash-alt deleteIcon" onclick="deleteAssignment(event)" id=${data._id}></i>
            Deadline :${formattedDeadlineDate}  ${formattedDeadlineTime}
        </div>
        <br />
        <div>
            ${data.description}
        </div>
    </li>`);
}

function deleteAssignment(e) {
  var id = e.target.id;
  console.log(e.target.id);

  var result = confirm("Are you sure you want to delete this assignmnent?");
  if (result) {
    var hrefurl = window.location.href;
    if (hrefurl.endsWith("#")) {
      hrefurl = hrefurl.slice(0, -1);
    }
    const url = hrefurl + "/deleteAssignment";
    console.log(url);
    const data = {
      id: id,
    };

    $.ajax({
      url: url,
      type: "post",
      data: data,
      success: function (d) {
        // getDetails();
        console.log(d.assignments);
        var assignments = d.assignments;
        assignments.sort(function (a, b) {
          return new Date(b.deadline) - new Date(a.deadline);
        });

        $("#postedAssignmentDisplay").empty();
        assignments.forEach((assignment) => {
          handlePostedAssignmentDisplay(assignment);
        });
      },
      error: function (request, status, error) {
        alert(request.responseText);
      },
    });
  }
}

$("#work-schedule-button").click((e) => {
  e.preventDefault();
  console.log("Clicked");
  if ($("#work-schedule").val() === "") {
    alert("Please enter something before proceeding!!!");
    return false;
  }
  // const url=$("#form-work-schedule").attr("action");
  var hrefurl = window.location.href;
  if (hrefurl.endsWith("#")) {
    hrefurl = hrefurl.slice(0, -1);
  }
  const url = hrefurl + "/workschedule";
  console.log(url);
  const workScheduleData = {
    listItem: $("#work-schedule").val(),
  };

  $.ajax({
    url: url,
    type: "post",
    data: workScheduleData,
    success: function (d) {
      $("#work-schedule-list").append(
        `<li class="list-group-item"><input type="checkbox" onchange="handleDelete(event)" name="checkbox" id=${d.item_id} value=${d.item_id} /> ${d.description}</li>`
      );
      $("#work-schedule").val("");
    },
    error: function (request, status, error) {
      alert(request.responseText);
    },
  });
});

function handleDelete(e) {
  e.preventDefault();
  var hrefurl = window.location.href;
  if (hrefurl.endsWith("#")) {
    hrefurl = hrefurl.slice(0, -1);
  }
  const url = hrefurl + "/workschedule/delete";
  const deleteData = {
    array_id: e.target.value,
  };

  var result = confirm("Are you sure you want to remove this!");

  if (result) {
    $.ajax({
      url: url,
      type: "post",
      data: deleteData,
      success: function (d) {
        const array = d.array;
        $("#work-schedule-list").empty();
        array.forEach((data) => {
          $("#work-schedule-list").append(
            `<li class="list-group-item"><input type="checkbox" onchange="handleDelete(event)" name="checkbox" id=${data._id} value=${data._id} /> ${data.name}</li>`
          );
        });
      },
      error: function (request, status, error) {
        alert(request.responseText);
      },
    });
  } else {
    $("#" + e.target.id).prop("checked", false);
  }
}

$("#createNewCustomList").click((e) => {
  if ($("#newListTextbox").val() === "") {
    alert("Please enter the list name before proceeding!!!");
    return false;
  } else {
    var hrefurl = window.location.href;
    var data = {
      listName: $("#newListTextbox").val(),
    };
    if (hrefurl.endsWith("#")) {
      hrefurl = hrefurl.slice(0, -1);
    }
    const url = hrefurl + "/createCustomList";

    $.ajax({
      url: url,
      type: "post",
      data: data,
      success: function (d) {
        $("#newListTextbox").val("");
        displayCustomList(d.newList);
      },
      error: function (request, status, error) {
        alert(request.responseText);
        $("#newListTextbox").val("");
      },
    });
  }
});

function displayCustomList(data) {
  $("#accordionExample").append(`
<div class="accordion-item">
<h2 class="accordion-header">
    <button
    class="accordion-button collapsed"
    type="button"
    data-bs-toggle="collapse"
    data-bs-target="#${data.listName}"
    aria-expanded="false"
    aria-controls="collapseTwo"
    >
    ${data.listName}
    <i
      class="fas fa-trash-alt deleteListIcon"
      onclick="deleteCustomList(event)"
      name=${data._id}
      value=${data.listName}
    ></i>
    </button>
</h2>
<div
    id=${data.listName}
    class="accordion-collapse collapse"
    aria-labelledby="headingTwo"
    data-bs-parent="#accordionExample"
>
    <div class="accordion-body">
    <ul class="list-group" id="${data.listName}${data._id}">
    <li class="list-group-item">
    <input type="checkbox" name="item1" id="item1" />
    btn-primary
    </li>
    <li class="list-group-item">
    <input type="checkbox" name="item2" id="item2" />
    btn-secondary
    </li>
    <li class="list-group-item">
    <input type="checkbox" name="item3" id="item3" />
    btn-warning
    </li>
</ul>
<br /><br />
<div class="input-group mb-3">
    <input
    type="text"
    class="form-control"
    aria-describedby="button-addon2"
    />
    <button
    class="btn btn-outline-success"
    type="button"
    id=${data._id}
    value="${data.listName}"
    onclick="customListItemHandler(event)"
    >
    Add
    </button>
</div>
    </div>
</div>
</div>`);
}

function customListItemHandler(e) {
  var description = $("#" + e.target.id)
    .prev()
    .val();

  if (description === "") {
    alert("Please enter something before proceeding!!!");
    return false;
  }
  var hrefurl = window.location.href;
  if (hrefurl.endsWith("#")) {
    hrefurl = hrefurl.slice(0, -1);
  }
  const url = hrefurl + "/addItemToCustomList";
  const data = {
    listname: e.target.value,
    listId: e.target.id,
    description: description,
  };
  $.ajax({
    url: url,
    type: "post",
    data: data,
    success: function (d) {
      console.log(d);
      $("#" + d.ulId).append(`<li class="list-group-item">
        <input type="checkbox" onchange="dltCustomListItem(event)" name=${d.listName} id="${d.itemId}" value="${d.itemId}" />
        ${d.description}
        </li>`);
      $("#" + e.target.id)
        .prev()
        .val("");
    },
    error: function (request, status, error) {
      alert(request.responseText);
    },
  });
}

// **************************
function deleteCustomList(e) {
  var hrefurl = window.location.href;
  if (hrefurl.endsWith("#")) {
    hrefurl = hrefurl.slice(0, -1);
  }
  const url = hrefurl + "/deleteStudentCustomList";
  const deleteData = {
    listName: e.target.attributes.value.nodeValue,
    listId: e.target.attributes.name.nodeValue,
  };
  var result = confirm("Are you sure you want to remove this list!");
  if (result) {
    $.ajax({
      url: url,
      type: "post",
      data: deleteData,
      success: function (d) {
        // console.log(d.array);
        $("#accordionExample").empty();
        d.array.forEach((element) => {
          displayCustomListsDynamic(element);
        });
      },
      error: function (request, status, error) {
        alert(request.responseText);
      },
    });
  } else {
    return false;
  }
}

function dltCustomListItem(e) {
  var hrefurl = window.location.href;
  if (hrefurl.endsWith("#")) {
    hrefurl = hrefurl.slice(0, -1);
  }
  const url = hrefurl + "/deleteCustomListItem";
  const deleteData = {
    listName: e.target.name,
    itemId: e.target.value,
  };
  var result = confirm("Are you sure you want to remove this!");
  if (result) {
    $.ajax({
      url: url,
      type: "post",
      data: deleteData,
      success: function (d) {
        console.log(d);
        var ulId = d.listName + d.listId;
        $("#" + ulId).empty();

        d.description.forEach((element) => {
          $("#" + ulId).append(`<li class="list-group-item">
            <input type="checkbox" onchange="dltCustomListItem(event)" name=${d.listName} id="${element._id}" value="${element._id}" />
            ${element.name}
            </li>`);
        });
      },
      error: function (request, status, error) {
        alert(request.responseText);
      },
    });
  } else {
    $("#" + e.target.id).prop("checked", false);
  }
}

function formatTime(time) {
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ];
  if (time.length > 1) {
    time = time.slice(1);
    time[5] = +time[0] < 12 ? " AM" : " PM";
    time[0] = +time[0] % 12 || 12;
  }
  return time.join("");
}
