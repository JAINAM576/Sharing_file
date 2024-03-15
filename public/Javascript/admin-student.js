alert_func("Welcome " + getCookie("email"))

var add_student = {};
var ExcelToJSON = function () {

    this.parseExcel = function (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary'
            });
            workbook.SheetNames.forEach(function (sheetName) {
                // Here is your object
                var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                var json_object = JSON.stringify(XL_row_object);
                add_student = JSON.parse(json_object);
                console.log(add_student);
            })
        };

        reader.onerror = function (ex) {
            console.log(ex);
        };

        reader.readAsBinaryString(file);
    };
};

function handleFileSelect(evt) {

    var files = evt.target.files; // FileList object
    var xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0]);
}

function addStudent() {
    loading_ani(1)
    if (add_student[0] && add_student[0].Enrollment && add_student[0].Name && add_student[0].Branch
        && add_student[0].Batch && add_student[0].BatchYear && add_student[0].Enrollment) {
        $.post("/add/students",
            {
                student: add_student
            },
            function (data, status) {
                loading_ani(0)
                alert_func(data);
            });
    }
    else if (!add_student[0]) {
        loading_ani(0)
        alert_danger('Add File');
    }
    else {
        loading_ani(0)
        alert_danger('All the columns are not there please check');
    }

}

//attendance analysis
$.get("/getallbranch/distinct", function (data, status) {
    for (var i = 0; i < data.length; i++) {
        $("#branch_analysis").append(`<option>${data[i].branch}</option>`);
        $("#u_branch").append(`<option>${data[i].branch}</option>`);
        $("#student_branch").append(`<option>${data[i].branch}</option>`);
    }
});


// attendance section
const d = new Date();
let year = d.getFullYear();
var i = year - 4
$("#u_batchyear").append(`<option>4th Year (${i}-${i + 4})</option>`);
$("#batchyear_analysis").append(`<option>4th Year (${i}-${i + 4})</option>`); i++;
$("#u_batchyear").append(`<option>3rd Year (${i}-${i + 4})</option>`);
$("#batchyear_analysis").append(`<option>3rd Year (${i}-${i + 4})</option>`); i++;
$("#u_batchyear").append(`<option>2nd Year (${i}-${i + 4})</option>`);
$("#batchyear_analysis").append(`<option>2nd Year (${i}-${i + 4})</option>`); i++;
$("#u_batchyear").append(`<option>1st Year (${i}-${i + 4})</option>`);
$("#batchyear_analysis").append(`<option>1st Year (${i}-${i + 4})</option>`); i++;
$("#u_batchyear").append(`<option>New (${i}-${i + 4})</option>`);
$("#batchyear_analysis").append(`<option>New (${i}-${i + 4})</option>`); i++;

//search attendance make graphs
function attendance_analysis() {
    var branch = $("#branch_analysis").val();
    var year = $("#batchyear_analysis").val();
    var fromdate = "2023-01-01";
    if (branch == "Select" || year == "Select") {
        alert_danger("Fill All Details.")
    }
    else {
        //display none to flex
        loading_ani(1)
        $("#myChart_container").css('display', 'block');
        $("#percentage_container").css('display', 'block');
        //year val
        year = year.slice((year.length - 10), year.length - 1);

        //distinct sub and type
        $.post("/analysis/subject",
            {
                branch: branch,
                year: year,
                fromdate: fromdate
            },

            function (data, status) {
                if (data && data[0]) {
                    var attendance = [], subjectInfo = [], x1Values = [];

                    $("#attendance_table").html(`<thead><tr></tr></thead><tbody></tbody>`);

                    $("#attendance_table thead tr").append(`<th>Enrollment</th><th>Name</th>`);
                    //subject
                    $("#date_subject_analysis").html(`<option>All</option>`)
                    //percentage
                    $("#percentage_subject").html(`<option>All</option>`)
                    for (var i = 0; i < data.length; i++) {
                        //table
                        $("#attendance_table thead tr").append(`<th>${data[i].subject} <span style="display:block">( ${data[i].type} )</spna></th>`);
                        //variable
                        subjectInfo.push({ subject: data[i].subject, type: data[i].type, attendance: 0, total: 0, date: ` ` });
                        //chart
                        x1Values.push(data[i].subject)
                        //subject
                        $("#percentage_subject").append(`<option>${data[i].subject}</option>`)
                        $("#date_subject_analysis").append(`<option>${data[i].subject}</option>`)
                    }
                    //raw data of attendance    
                    $.post("/analysis/getalldata",
                        {
                            branch: branch,
                            year: year,
                            fromdate: fromdate
                        },
                        //making attendance array of obj & total of subjects
                        function (data, status) {
                            attendance = giveattendance(data, subjectInfo);
                            var append_row, y1Values = [];
                            for (var i = 0; i < attendance.length; i++) {
                                append_row = `<tr><td>${attendance[i].enrollment}</td><td>${attendance[i].name}</td>`;
                                for (var j = 0; j < subjectInfo.length; j++) {
                                    if (y1Values[j] && y1Values[j] != undefined && data[i].attendance == 1)
                                        y1Values[j] += attendance[i].subjectInfo[j].attendance;
                                    else if (data[i].attendance == 1)
                                        y1Values[j] = attendance[i].subjectInfo[j].attendance;
                                    append_row += `<td>${attendance[i].subjectInfo[j].attendance} / ${attendance[i].subjectInfo[j].total}</td>`;
                                }
                                append_row += `</tr>`;
                                $("#attendance_table tbody").append(append_row);
                            }
                            new DataTable('#attendance_table');
                            $("#attendance_table").dataTable({
                                "destroy": true,
                            });

                            //first doughnut chart
                            var barColors = [
                                "#b91d47",
                                "#00aba9",
                                "#2b5797",
                                "#e8c3b9",
                                "#1e7145",
                                "#1e8145"

                            ];
                            new Chart("myChart1", {
                                type: "doughnut",
                                data: {
                                    labels: x1Values,
                                    datasets: [{
                                        backgroundColor: barColors,
                                        data: y1Values
                                    }]
                                },
                                options: {
                                    title: {
                                        display: true,
                                        text: "Total students present in class"
                                    }
                                }
                            });
                            //chart2
                            date_analysis();

                            //percentage wise attendance
                            percentage_count();

                            //teacher_info
                            var teacher_data = [];
                            for (var x = 0; x < subjectInfo.length; x++) {
                                teacher_data.push({ teacher_id: data[x].teacher_id, teacher_name: "Unknown", teacher_sub: subjectInfo[x].subject })
                            }
                            teacher_info(teacher_data)

                            loading_ani(0)
                        });
                }
                else {
                    loading_ani(0)
                    alert_danger("No data Found");
                }
            });
    }
};

function teacher_info(teacher_data) {
    $("#teacher_info_container").css('display', 'block')
    for (var x = 0; x < teacher_data.length; x++) {
        index = teachers.findIndex(obj => obj.id = teacher_data[x].teacher_id)
        if(index != -1){
            teacher_data[x].teacher_name = teachers[index].name
        }
    }
    $("#teacher_info_table").DataTable({
        destroy: true,
        data: teacher_data,
        bLengthChange: true,
        columns: [
            { data: "teacher_id", title: "Teacher ID" },
            { data: "teacher_name", title: "Name" },
            { data: "teacher_sub", title: "Subject" }
        ],
    });
}
function date_analysis() {
    var subject = $("#date_subject_analysis").val();
    var xValues = [0], yValues = [0];//attendance & date

    for (var x = 0; x < attendance.length; x++) {
        for (var y = 0; y < attendance[x].subjectInfo.length; y++) {
            if (attendance[x].subjectInfo[y].subject == subject || subject == "All") {
                var index;
                var thisdates = splitcomma(attendance[x].subjectInfo[y].date);
                for (var z = 0; z < thisdates.length - 1; z++) {
                    var index = yValues.findIndex(x => x === thisdates[z]);
                    if (index == -1) {
                        yValues.push(thisdates[z]);
                        xValues.push(0);
                        index = yValues.length - 1;
                    }
                    xValues[index] += 1;
                }
            }

        }
    }
    yValues.sort();
    new Chart("myChart", {
        type: "line",
        options: {

        },
        data: {
            labels: yValues,
            datasets: [{
                fill: false,
                lineTension: 0,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: xValues
            }]
        },
        options: {
            legend: { display: false },
            scales: {
                yAxes: [{ ticks: { min: 6, max: 16 } }],
            },
            scales: {
                x: {
                    type: 'time',
                }
            }
        }
    });
}

function percentage_count() {
    var subject = $("#percentage_subject").val();
    $("#percent_0_content").html(` `);
    $("#percent_40_content").html(` `);
    $("#percent_75_content").html(` `);
    for (var x = 0; x < attendance.length; x++) {
        var total = 0, percentage = 0, total_day = 0;
        for (var y = 0; y < attendance[x].subjectInfo.length; y++) {
            if (attendance[x].subjectInfo[y].subject == subject || subject == "All") {
                total += attendance[x].subjectInfo[y].attendance;
            }
            total_day += attendance[x].subjectInfo[y].total;
        }
        if (subject != "All") {
            var i = attendance[x].subjectInfo.findIndex(object => object.subject === subject)
            total_day = attendance[x].subjectInfo[i].total
        }
        percentage = ((100 * total) / total_day).toFixed(2);
        if (percentage < 40) {
            $("#percent_0_content").append(`
                    <span class="btn btn-secondary mybackgray my-1 enroll_info" id="${attendance[x].enrollment}" >${attendance[x].enrollment}</span>
                    <span>,</span>`);
        }
        else if (percentage < 75) {
            $("#percent_40_content").append(`
                    <span class="btn btn-secondary mybackgray my-1 enroll_info" id="${attendance[x].enrollment}">${attendance[x].enrollment}</span>
                    <span>,</span>`);
        }
        else {
            $("#percent_75_content").append(`
                    <span class="btn btn-secondary mybackgray my-1 enroll_info" id="${attendance[x].enrollment}">${attendance[x].enrollment}</span>
                    <span>,</span>`);
        }
    }

}
$(document).ready(function () {
    $("#all_info_percentage").on('click', '.enroll_info', function () {
        $("#modal_percentage").modal('show');
        var enrollment = Number(this.id), text, total = 0, percentage = 0, subject, total_day = 0;
        index = attendance.findIndex(object => object.enrollment === enrollment);

        text = `<p>Enrollment : ${enrollment}</p><p>Name : ${attendance[index].name}</p>`;
        for (var y = 0; y < attendance[index].subjectInfo.length; y++) {
            total += attendance[index].subjectInfo[y].attendance;
            subject = attendance[index].subjectInfo[y].subject;
        }
        for (key in attendance[index].subjectInfo) {
            total_day += attendance[index].subjectInfo[key].total;
        }
        if (total_day != 0) {
            percentage = ((100 * total) / total_day).toFixed(2);
            text += `<p>All : ${percentage} %</p>`
        }
        else {
            text += `<p>All : None</p>`
        }

        for (var y = 0; y < attendance[index].subjectInfo.length; y++) {
            total = attendance[index].subjectInfo[y].attendance;
            subject = attendance[index].subjectInfo[y].subject;
            if (attendance[index].subjectInfo[y].total != 0) {
                percentage = (100 * total) / attendance[index].subjectInfo[y].total;
                text += `<p>${subject} : ${(percentage).toFixed(2)} % </p>`
            }
            else {
                text += `<p>${subject} : None</p>`
            }

        }
        text += `<buttton class="btn btn-primary" >Mail</button>`;

        $("#modal_percentage .modal-body").html(text);
    });
});


$("#percentage_subject").change(function () {
    percentage_count();
});
$("#date_subject_analysis").change(function () {
    date_analysis();
});


var attendance = []
function giveattendance(data, subjectInfo) {
    var j = 0, index, index2;
    attendance = [];

    if (data && subjectInfo) {
        for (var i = 0; i < data.length; i++) {
            index = attendance.findIndex(object => object.enrollment === data[i].enrollment);
            if (index == -1) {
                attendance.push({ enrollment: data[i].enrollment, name: data[i].name, subjectInfo: structuredClone(subjectInfo), email: data[i].email });
                index = attendance.length - 1;
            }
            index2 = -1;

            for (j = 0; j < subjectInfo.length; j++) {

                if (attendance[index].subjectInfo[j].subject == data[i].subject
                    && attendance[index].subjectInfo[j].type == data[i].type) {
                    index2 = j;
                }

            }
            if (data[i].attendance == 1) {
                if (index2 != -1) {
                    (attendance[index].subjectInfo[index2].attendance) += 1;
                    (attendance[index].subjectInfo[index2].date) += ` ${data[i].date},`;
                }
            }
            if (index2 != -1) {
                (attendance[index].subjectInfo[index2].total) += 1;
            }
        }
        return attendance;
    }
}


$(document).ready(function () {
    $("#add_one_student").submit(function () {
        loading_ani(1)
        var student = {
            "enrollment": $("#student_enrollment").val(),
            "name": $("#student_name").val(),
            "branch": $("#student_branch").val(),
            "batchyear": $("#student_batchyear").val(),
            "batch": $("#student_batch").val(),
            "sem": $("#student_sem").val(),
            "email": $("#student_email").val(),
            "contact": $("#student_contact").val()
        }
        if (student) {
            $("#add_one_student").modal('hide');
            //query success
            $.post("/add/one/student",
                {
                    student: student
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
            loading_ani(0)
            alert("Fill All Details");
        }
        return false;
    });
});



document.getElementById('upload').addEventListener('change', handleFileSelect, false);