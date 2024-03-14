//cookies
var id = getCookie("id")
var role = getCookie("role")
var email = getCookie("email")
var pass = getCookie("pass")

function splitcomma(originalString) {
    separatedArray = [];

    // Index of end of the last string
    let previousIndex = 0;
    let lastIndex = 0;
    for (i = 0; i < originalString.length; i++) {
        // Check the character for a comma

        if (originalString[i] == ",") {

            // Split the string from the last index
            // to the comma
            separated = originalString.slice(previousIndex, i);
            separated = separated.trim();
            separatedArray.push(separated);

            // Update the index of the last string
            previousIndex = i + 1;
        }

    }

    // Push the last string into the array
    separatedArray.push((originalString.slice(previousIndex, i)).trim());
    return (separatedArray);
}

function addBranch() {
    loading_ani(1)
    var branch = $("#branch").val();
    var batch = $("#batch").val();
    batch = splitcomma(batch);
    if (branch && batch) {
        $.post("/add/branch",
            {
                branch: branch,
                batch: batch
            },
            function (data, status) {
                if (data == "0") {
                    loading_ani(0)
                    alert_danger(`Already Exists`)
                }
                else {
                    loading_ani(0)
                    alert_func(data);
                }
            }).fail(function () {
                loading_ani(0)
                alert_danger(`Some error in inserting`)
            });
        $("#addbranch").modal('hide');
    }
    else {
        loading_ani(0)
        $("#addbranch").modal('hide');
        alert_danger("No data is there")
    }
}
function addSubject() {
    var subject = $("#subject").val();
    var code = $("#code").val();
    if (subject && code) {
        loading_ani(1)
        $.post("/add/subject",
            {
                name: subject,
                code: code
            },
            function (data, status) {
                if (data == "0") {
                    loading_ani(0)
                    alert_danger(`Already Exists`)
                }
                else {
                    loading_ani(0)
                    alert_func(data);
                }
            }).fail(function () {
                loading_ani(0)
                alert_danger(`Some error in inserting`)
            });
        $("#addsubject").modal('hide');
    }
    else {
        $("#addsubject").modal('hide');
        alert_danger("NO data is there")
    }

}
$(document).ready(function () {
    $("#addSubject-form").submit(function () {
        addSubject()
        return false;
    })
})
$(document).ready(function () {
    $("#addBranch-form").submit(function () {
        addBranch()
        return false;
    })
})
//for success
var alert_s = `<div id="alert_box" class="alert alert-success d-flex alert-dismissible fade" role="alert">
    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
        <use xlink:href="#check-circle-fill" />
    </svg>
    <div>
        <span id="alert_text"></span>
        <button type="button" class="btn-close" onclick='alert_close()' aria-label="Close"></button>
    </div> </div>`;
var alert_d = `<div id="alert_box2" class="alert alert-danger d-flex alert-dismissible fade" role="alert">
    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:">
    <use xlink:href="#exclamation-triangle-fill" />
    </svg>
    <div>
    <span id="alert_text2"></span>
    <button type="button" class="btn-close" onclick='alertd_close()' aria-label="Close"></button>
    </div> </div>`;
function alert_func(text) {
    $("#alert_main_container").html(alert_s);
    $("#alert_text").html(text);
    $("#alert_box").removeClass("hide");
    setTimeout(function () { $("#alert_box").addClass("show") }, 100);
    setTimeout(function () { alert_close() }, 4000);
}
function alert_close() {
    $("#alert_box").removeClass("show");
    $("#alert_box").addClass("hide");
}
//for error
function alert_danger(text) {
    $("#alert_main_container").html(alert_d);
    $("#alert_text2").html(text);
    $("#alert_box2").removeClass("hide");
    setTimeout(function () { $("#alert_box2").addClass("show") }, 100);
    setTimeout(function () { alertd_close() }, 4000);
}
function alertd_close() {
    $("#alert_box2").removeClass("show");
    $("#alert_box2").addClass("hide");
}


function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function delete_cookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function logout() {
    delete_cookie("id");
    delete_cookie("role");
    delete_cookie("email");
    delete_cookie("pass");
    $.get("/logout", function (data, status) {
        window.location.assign("/login");
    }).fail(function () {
        alert_danger("Sorry Cannot Logout")
    });
}




// responsive navbar
const navbar = document.getElementById("navbar");
const navbarToggle = navbar.querySelector(".navbar-toggle");


function openMobileNavbar() {
    navbar.classList.add("opened");
    navbarToggle.setAttribute("aria-expanded", "true");
}

function closeMobileNavbar() {

    navbar.classList.remove("opened");

    navbarToggle.setAttribute("aria-expanded", "false");
}

navbarToggle.addEventListener("click", () => {
    if (navbar.classList.contains("opened")) {
        closeMobileNavbar();

    } else {
        openMobileNavbar();
    }
});

const navbarMenu = navbar.querySelector("#navbar-menu");
const navbarLinksContainer = navbar.querySelector(".navbar-links");


navbarLinksContainer.addEventListener("click", (clickEvent) => {
    clickEvent.stopPropagation();
});

navbarMenu.addEventListener("click", closeMobileNavbar);

document
    .getElementById("options")
    .querySelectorAll("input[name='navtype']")
    .forEach((option) => {
        option.addEventListener("change", (e) => {
            const navType = e.target.id.split("-").join(" ");
            navbarMenu.classList = navType;
        });
    });




let assign_subject = document.getElementById("assign_subject")
let assign_code = document.getElementById("assign_code")
let assign_teacher = document.getElementById("assign_teacher")
let assign_type = document.getElementById("assign_type")
let close_model = document.getElementById("close_model")
let subject_code = new Map()
let id_email = new Map()
assign_code.disabled = true

$.get("/get_subjects", (data, status) => {
    if (data == -1) {
        console.log("something went wrong in admin js assign subject")
    }
    else {
        let j = "<option value=-1>Select subject</option>"
        let j1 = "<option value=-1>Select Code</option>"
        data.forEach((element) => {
            j += `<option value=${element.name}>${element.name}</option>`
            j1 += `<option value=${element.code}>${element.code}</option>`
            subject_code.set(element.name, element.code)
        })
        assign_subject.innerHTML = j
        assign_code.innerHTML = j1
    }
})
$.get("/get_teachers", (data, status) => {
    if (data == -1) {
        console.log("something went wrong in admin js assign teacher")
    }
    else {
        let j = "<option value=-1>Select Teacher id:</option>"

        data.forEach((element) => {
            id_email.set(element.id, element.email)
            j += `<option value=${element.id}>${element.id} ( ${element.name} )</option>`

        })
        assign_teacher.innerHTML = j
    }
})


assign_subject.addEventListener("change", (e) => {
    let val = e.target.value
    if (val != -1) {
        assign_code.value = subject_code.get(e.target.value)
    }
})

btn_assign.addEventListener("click", (e) => {
    if (assign_code.value == -1 || assign_subject.value == -1 || assign_teacher.value == -1 || assign_type.value == -1) {
        alert_danger("Please select all values")
        return
    }
    loading_ani(1)
    let obj = {
        subject: assign_subject.value,
        code: assign_code.value,
        id: assign_teacher.value,
        email: id_email.get(Number(assign_teacher.value)),
        type: assign_type.value
    }
    $.post("/assign_teacher_subject", obj, (data, status) => {
        if (data == -1 || data == "error") {
            loading_ani(0)
            alert_danger("Something went wrong")
        }
        else {
            close_model.click()
            loading_ani(0)
            alert_func("Assigned Successfully")
        }
    }).fail(function () {
        close_model.click()
        loading_ani(0)
        alert_danger("Something went wrong, might be assigned already")
    })
})

$(document).ready(function () {
    $("#update_sem").submit(function () {
        u_branch = $("#u_branch").val();
        year = $("#u_batchyear").val();
        year = year.slice((year.length - 10), year.length - 1);
        u_batchyear = year;
        if (u_batchyear && u_branch) {
            loading_ani(1)
            $("#update_sem").modal('hide');
            $.post("/update/sem",
                {
                    "u_branch": u_branch,
                    "u_batchyear": u_batchyear
                },
                function (data, status) {
                    loading_ani(0)
                    alert_func(data);
                }
            ).fail(function () {
                loading_ani(0)
                alert_danger(`Some Error Occured`);
            });

        }
        else {
            alert("Fill All Details");
        }
        $("update_sem").modal("hide");
        return false;
    });
});

$(".modal").addClass('fade');

function loading_ani(x) {
    if (x == 1) {
        $("#loader").css("display", "block")
        $("#right-sec").css("cursor", "wait !importatnt")
    }
    else if (x == 0) {
        $("#loader").css("display", "none")
        $("#right-sec").css("cursor", "static !importatnt")
    }
}