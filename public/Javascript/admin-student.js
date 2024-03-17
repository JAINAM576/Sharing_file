alert_func("Welcome " + getCookie("email"))
function blockinter(){
    document.getElementById("overlay").style.display="block"
}
function unblockinter(){
    document.getElementById("overlay").style.display="none"
}
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
                if (!data || data == "") {
                    loading_ani(0)
                    alert_danger("No data available");
                    return;
                }

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
                    //attendance / total
                    //date / alldates
                    subjectInfo.push({ subject: data[i].subject, type: data[i].type, attendance: 0, total: 0, date: ` `, alldates: ` ` });
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


            });
    }
};

function teacher_info(teacher_data) {
    $("#teacher_info_container").css('display', 'block')
    for (var x = 0; x < teacher_data.length; x++) {
        index = teachers.findIndex(obj => obj.id = teacher_data[x].teacher_id)
        if (index != -1) {
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

let email_75_100=[]
let email_40_75=[]
let email_0_40=[]
function percentage_count() {
    email_75_100=[]
    email_40_75=[]
    email_0_40=[]
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
            email_0_40.push(attendance[x].email)
            $("#percent_0_content").append(`
                    <span class="btn btn-secondary mybackgray my-1 enroll_info" id="${attendance[x].enrollment}" >${attendance[x].enrollment}</span>
                    <span>,</span>`);
        }
        else if (percentage < 75) {
            email_40_75.push(attendance[x].email)
            $("#percent_40_content").append(`
                    <span class="btn btn-secondary mybackgray my-1 enroll_info" id="${attendance[x].enrollment}">${attendance[x].enrollment}</span>
                    <span>,</span>`);
        }
        else {
            email_75_100.push(attendance[x].email)
            $("#percent_75_content").append(`
                    <span class="btn btn-secondary mybackgray my-1 enroll_info" id="${attendance[x].enrollment}">${attendance[x].enrollment}</span>
                    <span>,</span>`);
        }
    }

}
let single_mail=undefined
$(document).ready(function () {
    $("#all_info_percentage").on('click', '.enroll_info', function () {
        $("#modal_percentage").modal('show');
        var enrollment = Number(this.id), text, total = 0, percentage = 0, subject, total_day = 0;
        index = attendance.findIndex(object => object.enrollment === enrollment);
single_mail=attendance[index].email
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
                text += `<p>${subject} : ${(percentage).toFixed(2)} %  <button onclick="opendates(${index},${y})" class="p-0 normal_button">
                <svg style="height:20px;width:20px;transform:translateY(-4px)" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 121">
                <defs><style>.cls-1{fill:#ef4136;}.cls-1,.cls-3,.cls-4,.cls-6{fill-rule:evenodd;}.cls-2{fill:gray;}.cls-3{fill:#fff;}.cls-4{fill:#c72b20;}.cls-5,.cls-6{fill:#1a1a1a;}</style></defs>
                <path class="cls-1" d="M11.52,6.67h99.84a11.57,11.57,0,0,1,11.52,11.52V44.94H0V18.19A11.56,11.56,0,0,1,11.52,6.67Zm24.79,9.75A9.31,9.31,0,1,1,27,25.73a9.31,9.31,0,0,1,9.31-9.31Zm49.79,0a9.31,9.31,0,1,1-9.31,9.31,9.31,9.31,0,0,1,9.31-9.31Z"/>
                <path class="cls-2" d="M111.36,121H11.52A11.57,11.57,0,0,1,0,109.48V40H122.88v69.46A11.56,11.56,0,0,1,111.36,121Z"/><path class="cls-3" d="M12.75,117.31h97.38a9.1,9.1,0,0,0,9.06-9.06V40H3.69v68.23a9.09,9.09,0,0,0,9.06,9.06Z"/>
                <path class="cls-4" d="M86.1,14.63a11.11,11.11,0,1,1-7.85,3.26l.11-.1a11.06,11.06,0,0,1,7.74-3.16Zm0,1.79a9.31,9.31,0,1,1-9.31,9.31,9.31,9.31,0,0,1,9.31-9.31Z"/><path class="cls-4" d="M36.31,14.63a11.11,11.11,0,1,1-7.85,3.26l.11-.1a11.08,11.08,0,0,1,7.74-3.16Zm0,1.79A9.31,9.31,0,1,1,27,25.73a9.31,9.31,0,0,1,9.31-9.31Z"/>
                <path class="cls-5" d="M80.54,4.56C80.54,2,83,0,86.1,0s5.56,2,5.56,4.56V25.77c0,2.51-2.48,4.56-5.56,4.56s-5.56-2-5.56-4.56V4.56Z"/>
                <path class="cls-5" d="M30.75,4.56C30.75,2,33.24,0,36.31,0s5.56,2,5.56,4.56V25.77c0,2.51-2.48,4.56-5.56,4.56s-5.56-2-5.56-4.56V4.56Z"/>
                <path class="cls-6" d="M22,85.62H36a1.79,1.79,0,0,1,1.79,1.79v11.7A1.8,1.8,0,0,1,36,100.9H22a1.8,1.8,0,0,1-1.8-1.79V87.41A1.8,1.8,0,0,1,22,85.62Z"/>
                <path class="cls-6" d="M54.58,85.62H68.64a1.79,1.79,0,0,1,1.79,1.79v11.7a1.8,1.8,0,0,1-1.79,1.79H54.58a1.8,1.8,0,0,1-1.79-1.79V87.41a1.8,1.8,0,0,1,1.79-1.79Z"/>
                <path class="cls-6" d="M86.87,85.62h14.06a1.8,1.8,0,0,1,1.79,1.79v11.7a1.8,1.8,0,0,1-1.79,1.79H86.87a1.8,1.8,0,0,1-1.79-1.79V87.41a1.79,1.79,0,0,1,1.79-1.79Z"/>
                <path class="cls-6" d="M22,56.42H36a1.8,1.8,0,0,1,1.79,1.8V69.91A1.8,1.8,0,0,1,36,71.7H22a1.8,1.8,0,0,1-1.8-1.79V58.22a1.81,1.81,0,0,1,1.8-1.8Z"/><path class="cls-6" d="M54.58,56.42H68.64a1.8,1.8,0,0,1,1.79,1.8V69.91a1.8,1.8,0,0,1-1.79,1.79H54.58a1.79,1.79,0,0,1-1.79-1.79V58.22a1.8,1.8,0,0,1,1.79-1.8Z"/>
                <path class="cls-6" d="M86.87,56.42h14.06a1.8,1.8,0,0,1,1.79,1.8V69.91a1.8,1.8,0,0,1-1.79,1.79H86.87a1.79,1.79,0,0,1-1.79-1.79V58.22a1.8,1.8,0,0,1,1.79-1.8Z"/></svg></button></p>`
            }
            else {
                text += `<p>${subject} : None</p>`
            }

        }
        text += `<buttton class="btn btn-primary"  data-bs-toggle="modal"
        data-bs-target="#send_email_modal">Mail</button>`;

        $("#modal_percentage .modal-body").html(text);
    });
});

function opendates(i1, i2) {
    $("#datewise_table").modal('show')
    $("#open_table_date").html(`<thead><tr></tr></thead><tbody><tr></tr></tbody>`)
    allDates = splitcomma(attendance[i1].subjectInfo[i2].alldates);
    presentDates = splitcomma(attendance[i1].subjectInfo[i2].date);
    $("#datewise_table_title").html(`Datewise Attendance "${attendance[i1].subjectInfo[i2].subject}"`);
    for (let x = 0; x < allDates.length - 1; x++) {
        if (allDates[x] == " ")
            continue
        $("#open_table_date thead tr").append(`<th>${allDates[x]}</th>`)
    }
    console.log(allDates, presentDates)
    for (let x = 0; x < allDates.length - 1; x++) {
        var index = presentDates.findIndex((e) => e == allDates[x])
        if (index == -1)
            $("#open_table_date tbody tr").append(`<td class="table-danger">No</td>`)
        else {
            presentDates[index] = `none`
            $("#open_table_date tbody tr").append(`<td class="table-success">Yes</td>`)
        }

    }
    let btn_email=document.getElementsByClassName("btn_email")
    let array=[email_75_100,email_40_75,email_0_40]
    for (let index = 0; index < btn_email.length; index++) {
       if(array[index].length==0){
        btn_email[index].style.display="none"
       }
       else{
        btn_email[index].style.display="block"
       }
        
    }
}


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
            (attendance[index].subjectInfo[index2].alldates) += ` ${data[i].date},`;
            if (index2 != -1) {
                (attendance[index].subjectInfo[index2].total) += 1;
            }
        }
        return attendance;
    }
}
$(document).ready(function(){
    $("#send_email_modal").submit(function(){
        console.log("clicked")
        let message=$("#msg").val()
        let sub=$("#email_sub").val()
        let sender_obj={
            emails:undefined,
            sub:sub,
            message:message

        }
if(flag_send_75_100){
    flag_send_75_100=false
    sender_obj.emails=email_75_100
    console.log(email_75_100,"75-100")
}
else if(flag_send_40_75){
    flag_send_40_75=false
    sender_obj.emails=email_40_75
    console.log(email_40_75,"40-75")
}
else if(flag_send_0_40){
    flag_send_0_40=false
    sender_obj.emails=email_0_40
    console.log(email_0_40,"0-40")
}
else{
    sender_obj.emails=[single_mail]
    console.log(single_mail)
}
if(sender_obj.emails.length!=0 && sender_obj.message.length!=0 && sender_obj.sub.length!=0){
    
    blockinter()
    loading_ani(1)
    $.post("/send_all_emails",sender_obj,(data,status)=>{
        document.getElementById("close_email").click()
        console.log(data)
        if(data!="1"){
            unblockinter()
            alert_danger(data)
        }
        else{
unblockinter()
            alert_func("Success")
        }
        loading_ani(0)
       
    }).fail(
        function(){
            unblockinter()
            document.getElementById("close").click()
            alert_danger("Something went wrong")
            
        }
    )
}
else{
    return false
}

        return false
    })
})
let flag_send_75_100=false
let flag_send_40_75=false
let flag_send_0_40=false

let email_sub=document.getElementById("email_sub")
let msg=document.getElementById("msg")
function  send_75_100(){
    flag_send_75_100=true
    email_sub.value=`75-100% Attendance/${$("#percentage_subject").val()}`
    // console.log(email_75_100,"75-100")
}
function  send_40_75(){
    flag_send_40_75=true
    email_sub.value=`40-75% Attendance/${$("#percentage_subject").val()}`
    // console.log(email_40_75,"40-75")
}
function  send_0_40(){
    flag_send_0_40=true
    email_sub.value=`0-40% Attendance/${$("#percentage_subject").val()}`
    // console.log(email_0_40,"0-40")
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