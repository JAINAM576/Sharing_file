var teacherdata = [], branchdata = [], studentdata = [], teachingdata = [], subjectdata = [], tr_no, tr_real_no;

$.get("/getallteachers", function (data, status) {
    if (status == 'success') {
        var i = 0;
        $("#teacher_table").DataTable({
            destroy: true,
            data: data,
            bLengthChange: true,
            columns: [
                { data: "id", title: "ID" },
                { data: "name", title: "Name" },
                { data: "email", title: "Email" },
                { data: "contact", title: "Contact" },
                {
                    data: "name",
                    render: (data, type, row, meta) => {
                        return (`<button type="button" id="` + i++ + `_teacher" class="check_teacher edit_icon" >
                        <?xml version="1.0" ?><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" class="edit_svg"/></svg>
                        </button>`);
                    },
                    title: "Update"
                },
            ],
        });
        teacherdata = data;
    }
});
// teacher edit button
$(document).ready(function () {
    $("#teacher_table").on('click', '.check_teacher', function () {
        tr_no = $(this).attr("id");
        tr_no = tr_no.split("_");
        tr_no = tr_no[0];

        if (teacherdata[tr_no].name && teacherdata[tr_no].email && teacherdata[tr_no].contact) {
            $("#update_teacher").modal('show');
            $("#teacher_name").val(teacherdata[tr_no].name);
            $("#teacher_email").val(teacherdata[tr_no].email);
            $("#teacher_contact").val(teacherdata[tr_no].contact);
        }
    });
});
// teacher submit button
$(document).ready(function () {
    $("#update_teacher").submit(function () {
        var teacher = {
            "name": $("#teacher_name").val(),
            "email": $("#teacher_email").val(),
            "contact": $("#teacher_contact").val(),
            "id": teacherdata[tr_no].id
        }
        if (teacher && teacher.name && teacher.contact && teacher.id) {
            loading_ani(1)
            $("#update_teacher").modal('hide');
            //query success
            $.post("/update/employee",
                {
                    empydata_new: teacher
                },
                function (data, status) {
                    var update_row = document.getElementById(`${tr_no}_teacher`).parentElement.parentElement;
                    update_row.childNodes[0].innerHTML = teacher.name;
                    update_row.childNodes[1].innerHTML = teacher.email;
                    update_row.childNodes[2].innerHTML = teacher.contact;

                    teacherdata[tr_no].name = teacher.name;
                    teacherdata[tr_no].email = teacher.email;
                    teacherdata[tr_no].contact = teacher.contact;
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
        return false;
    });
});
$(document).ready(function () {
    $("#update_teacher").on('click', '.delete-btn', function () {
        if (!confirm('Are you sure?')) {
            return false
        }
        else {
            //delete req
            loading_ani(1)
            $("#update_teacher").modal('hide');
            $.post("/delete/employee",
                {
                    employeeId: teacherdata[tr_no].id
                },
                function (data, status) {
                    var table = $('#teacher_table').DataTable();
                    var row = $(`#${tr_no}_teacher`).parent().parent();
                    table.row(row).remove().draw();
                    loading_ani(0)
                    alert_func(data);
                }
            ).fail(function () {
                loading_ani(0)
                alert_danger(`Some Error Occured`);
            });
        }
    });
});

//branch table
$.get("/getallbranch", function (data, status) {
    if (status == 'success') {
        var i = 0;
        $("#branch_table").DataTable({
            destroy: true,
            data: data,
            bLengthChange: true,
            columns: [
                { data: "branch", title: "Branch" },
                { data: "batch", title: "Batch" },
                {
                    data: "branch",
                    render: (data, type, row, meta) => {
                        return (`<button type="button" id="` + i++ + `_branch" class="check_branch  edit_icon" >
                        <?xml version="1.0" ?><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" class="edit_svg"/></svg>
                        </button>`);
                    },
                    title: "Update"
                },
            ],
        });
        branchdata = data;
    }
});

// branch edit button
$(document).ready(function () {
    $("#branch_table").on('click', '.check_branch', function () {
        tr_no = $(this).attr("id");
        tr_no = tr_no.split("_");
        tr_no = tr_no[0];


        if (branchdata[tr_no].branch && branchdata[tr_no].batch) {
            $("#update_branch").modal('show');
            $("#field_branch").val(branchdata[tr_no].branch);
            $("#field_batch").val(branchdata[tr_no].batch);
        }
    });
});


// branch submit button
$(document).ready(function () {
    $("#update_branch").submit(function () {
        var branch = {
            "newbranch": $("#field_branch").val(),
            "newbatch": $("#field_batch").val(),
            "oldbranch": branchdata[tr_no].branch,
            "oldbatch": branchdata[tr_no].batch
        }
        if (branch && branch.newbranch && branch.oldbranch && branch.newbatch && branch.oldbatch) {
            $("#update_branch").modal('hide');
            loading_ani(1)
            $.post("/update/branch",
                {
                    newData: branch
                },
                function (data, status) {
                    if (data != "Already there") {
                        var update_row = document.getElementById(`${tr_no}_branch`).parentElement.parentElement;
                        update_row.childNodes[0].innerHTML = branch.newbranch;
                        update_row.childNodes[1].innerHTML = branch.newbatch;

                        branchdata[tr_no].branch = branch.newbranch;
                        branchdata[tr_no].batch = branch.newbatch;
                    }
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
        return false;
    });
});

// branch delete button

$(document).ready(function () {
    $("#update_branch").on('click', '.delete-btn', function () {
        if (!confirm('Are you sure?')) {
            return false
        }
        else {
            
            $("#update_branch").modal("hide")
            //delete req
            loading_ani(1)
            var newData = {
                "branch": $("#field_branch").val(),
                "batch": $("#field_batch").val()
            }

            $.post("/delete/branch",
                {
                    newData: newData
                },
                function (data, status) {
                    var table = $('#branch_table').DataTable();
                    var row = $(`#${tr_no}_branch`).parent().parent();
                    table.row(row).remove().draw()
                    loading_ani(0)
                    alert_func(data);
                }
            ).fail(function () {
                loading_ani(0)
                alert_danger(`Some Error Occured`);
            });
        }
    });
});

//Subject table
$.get("/getallsubjects", function (data, status) {
    var i = 0;
    $("#subject_table").DataTable({
        destroy: true,
        data: data,
        bLengthChange: true,
        columns: [
            { data: "name", title: "Subject" },
            { data: "code", title: "Code" },
            {
                data: "name",
                render: (data, type, row, meta) => {
                    return (`<button type="button" id="` + (i++) + `_subject" class="check_subject  edit_icon" >
                        <?xml version="1.0" ?><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" class="edit_svg"/></svg>
                        </button>`);
                },
                title: "Update"
            },
        ],
    });
    subjectdata = data;
});

// subject edit button
$(document).ready(function () {
    $("#subject_table").on('click', '.check_subject', function () {
        tr_no = $(this).attr("id");
        tr_no = tr_no.split("_");
        tr_no = tr_no[0];

        if (subjectdata[tr_no].name && subjectdata[tr_no].code) {
            $("#update_subject").modal('show');
            $("#subject_name").val(subjectdata[tr_no].name);
            $("#subject_code").val(subjectdata[tr_no].code);
        }
    });
});



// subject submit button
$(document).ready(function () {

    $("#update_subject").submit(function () {
        var subject = {
            "name": $("#subject_name").val(),
            "newcode": $("#subject_code").val(),
            "oldcode": subjectdata[tr_no].code
        }
        if (subject && subject.name && subject.newcode && subject.oldcode) {
            $("#update_subject").modal('hide');
            loading_ani(1)
            $.post("/update/subject",
                {
                    newData: subject
                },
                function (data, status) {
                    if (data != "Already there") {
                        subjectdata[tr_no].code = subject.newcode;
                        subjectdata[tr_no].name = subject.name;

                        var update_row = document.getElementById(`${tr_no}_subject`).parentElement.parentElement;
                        update_row.childNodes[0].innerHTML = subject.name;
                        update_row.childNodes[1].innerHTML = subject.newcode;
                    }

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

        return false;
    });
});

// subject delete button

$(document).ready(function () {
    $("#update_subject").on('click', '.delete-btn', function () {
        if (!confirm('Are you sure?')) {
            return false
        }
        else {
            //delete req
            loading_ani(1)
            $("#update_subject").modal('hide');
            var newData = {
                "code": $("#subject_code").val()
            }
            $.post("/delete/subject",
                {
                    newData: newData
                },
                function (data, status) {
                    var table = $('#subject_table').DataTable();
                    var row = $(`#${tr_no}_subject`).parent().parent();
                    table.row(row).remove().draw()
                    loading_ani(0)
                    alert_func(data);
                }
            ).fail(function () {
                loading_ani(0)
                alert_danger(`Some Error Occured`);
            });
        }
    });
});

// //Teaching table
// $.get("/getallteaching", function (data, status) {
//     var i = 0;
//     $("#teaching_table").DataTable({
//         destroy: true,
//         data: data,
//         bLengthChange: true,
//         columns: [
//             { data: "id", title: "ID" },
//             { data: "teacher", title: "Teacher" },
//             { data: "subject", title: "Subject" },
//             { data: "code", title: "Code" },
//             { data: "type", title: "Type" },
//             {
//                 data: "teacher",
//                 render: (data, type, row, meta) => {
//                     return (`<button type="button" name="` + (i++) + `" class="check_teaching  edit_icon" >
//                         <?xml version="1.0" ?><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" class="edit_svg"/></svg>
//                         </button>`);
//                 },
//                 title: "Update"
//             },
//         ],
//     });
//     teachingdata = data;
// });

// // steaching edit button
// $(document).ready(function () {
//     $("#teaching_table").on('click', '.check_teaching', function () {
//         //$("#update_teaching").modal("show")
//         tr_no = $(this).attr("name");
//         if (teachingdata && teachingdata[tr_no].code && teachingdata[tr_no].id) {
//             alert_func(tr_no)
//         }
//     });
// });



// // teaching submit button
// $(document).ready(function () {

//     $("#update_subject").submit(function () {
//         var subject = {
//             "name": $("#subject_name").val(),
//             "newcode": $("#subject_code").val(),
//             "oldcode": subjectdata[tr_no].code
//         }
//         if (subject && subject.name && subject.newcode && subject.oldcode) {
//             $("#update_subject").modal('hide');

//             $.post("/update/subject",
//                 {
//                     newData: subject
//                 },
//                 function (data, status) {
//                     if (data != "Already there") {
//                         subjectdata[tr_no].code = subject.newcode;
//                         subjectdata[tr_no].name = subject.name;

//                         tr_no++;

//                         var update_row = document.getElementsByClassName("check_subject")[tr_no].parentElement.parentElement;
//                         update_row.childNodes[0].innerHTML = subject.name;
//                         update_row.childNodes[1].innerHTML = subject.newcode;
//                     }


//                     alert_func(data);
//                 }
//             ).fail(function () {
//                 alert_danger(`Some Error Occured`);
//             });

//         }
//         else {
//             alert("Fill All Details");
//         }

//         return false;
//     });
// });

// // teaching delete button

// $(document).ready(function () {
//     $("#update_subject").on('click', '.delete-btn', function () {
//         if (!confirm('Are you sure?')) {
//             return false
//         }
//         else {
//             //delete req
//             tr_no = Number(tr_no)
//             var deleted = 0;
//             for (val in subjectdelete) {
//                 if (val < tr_no) {
//                     deleted++;
//                 }
//             }
//             var new_tr = tr_no - deleted + 1;
//             $("#update_subject").modal('hide');
//             var newData = {
//                 "code": $("#subject_code").val()
//             }
//             $.post("/delete/subject",
//                 {
//                     newData: newData
//                 },
//                 function (data, status) {
//                     var table = document.getElementById('subject_table');
//                     table.deleteRow(new_tr);
//                     subjectdelete.push(tr_no);
//                     console.log(subjectdelete)
//                     alert_func(data);
//                 }
//             ).fail(function () {
//                 alert_danger(`Some Error Occured`);
//             });
//         }
//     });
// });


//student table
$.get("/getallstudents", function (data, status) {
    studentdata = data;
    var i = 0;
    $("#student_table").DataTable({
        destroy: true,
        data: studentdata,
        bLengthChange: true,
        columns: [
            { data: "enrollment", title: "Enrollment" },
            { data: "name", title: "Name" },
            { data: "branch", title: "Branch" },
            { data: "batchyear", title: "Batchyear" },
            { data: "division", title: "Division" },
            { data: "batch", title: "Batch" },
            { data: "sem", title: "Sem" },
            { data: "email", title: "Email" },
            { data: "contact", title: "Contact" },
            {
                data: "name",
                render: (data, type, row, meta) => {
                    return (`<button type="button" id="` + i++ + `_student" class="check_student edit_icon" >
                        <?xml version="1.0" ?><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" class="edit_svg"/></svg>
                        </button>`);
                },
                title: "Update"
            },
        ],
    });
});
// student edit button
$(document).ready(function () {
    $("#student_table").on('click', '.check_student', function () {
        tr_no = $(this).attr("id");
        tr_no = tr_no.split("_");
        tr_no = tr_no[0];

        if (studentdata) {
            $("#update_student").modal('show');
            $("#student_enrollment").val(studentdata[tr_no].enrollment);
            $("#student_name").val(studentdata[tr_no].name);
            $("#student_branch").val(studentdata[tr_no].branch);
            $("#student_batchyear").val(studentdata[tr_no].batchyear);
            $("#student_division").val(studentdata[tr_no].division);
            $("#student_batch").val(studentdata[tr_no].batch);
            $("#student_sem").val(studentdata[tr_no].sem);
            $("#student_email").val(studentdata[tr_no].email);
            $("#student_contact").val(studentdata[tr_no].contact);
        }
    });
});
// student submit button
$(document).ready(function () {
    $("#update_student").submit(function () {

        var student = {
            "oldenrollment": studentdata[tr_no].enrollment,
            "newenrollment": $("#student_enrollment").val(),
            "name": $("#student_name").val(),
            "branch": $("#student_branch").val(),
            "batchyear": $("#student_batchyear").val(),
            "division": $("#student_division").val(),
            "batch": $("#student_batch").val(),
            "sem": $("#student_sem").val(),
            "email": $("#student_email").val(),
            "contact": $("#student_contact").val()
        }
        if (student) {
            loading_ani(1)
            $("#update_student").modal('hide');
            //query success
            $.post("/update/student",
                {
                    newData: student
                },
                function (data, status) {
                    var update_row = document.getElementById(`${tr_no}_student`).parentElement.parentElement;
                    update_row.childNodes[0].innerHTML = student.newenrollment;
                    update_row.childNodes[1].innerHTML = student.name;
                    update_row.childNodes[2].innerHTML = student.branch;
                    update_row.childNodes[3].innerHTML = student.batchyear;
                    update_row.childNodes[4].innerHTML = student.division;
                    update_row.childNodes[5].innerHTML = student.batch;
                    update_row.childNodes[6].innerHTML = student.sem;
                    update_row.childNodes[7].innerHTML = student.email;
                    update_row.childNodes[8].innerHTML = student.contact;

                    studentdata[tr_no].name = student.name
                    studentdata[tr_no].enrollment = student.newenrollment;
                    studentdata[tr_no].branch = student.branch;
                    studentdata[tr_no].batchyear = student.batchyear;
                    studentdata[tr_no].division = student.division;
                    studentdata[tr_no].batch = student.batch;
                    studentdata[tr_no].sem = student.sem;
                    studentdata[tr_no].email = student.email;
                    studentdata[tr_no].contact = student.contact;

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
        return false;
    });
});

$(document).ready(function () {
    $("#update_student").on('click', '.delete-btn', function () {
        if (!confirm('Are you sure?')) {
            return false
        }
        else {
            loading_ani(1)
            //delete req
            $("#update_student").modal('hide');
            $.post("/delete/student",
                {
                    newData: { "enrollment": studentdata[tr_no].enrollment }
                },
                function (data, status) {
                    var table = $('#student_table').DataTable();
                    var row = $(`#${tr_no}_student`).parent().parent();
                    table.row(row).remove().draw()
                    loading_ani(0)
                    alert_func(data);
                }
            ).fail(function () {
                loading_ani(0)
                alert_danger(`Some Error Occured`);
            });
        }
    });
});
