//cookies
var id=getCookie("id")
var role=getCookie("role")
var email=getCookie("email")
var pass=getCookie("pass")

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

alert_func("Welcome " + getCookie("email"))

//set default today's date
function formatDate() {
    let date = new Date();
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}
$(document).ready(function () {
    $('#date').val(formatDate());
});


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




//button back color of days
let day_selected;
$(document).ready(function () {
    $("#days>button").click(function () {
        
         day_selected = $(this).html();
     
  
        //colorchange
        $("#days>button").removeClass("btn-color-change");
        $(this).addClass("btn-color-change");
        //datainput
        let period_no_include=[]
        for (day in timetable) {
            if (timetable[day].day == day_selected) {
                let temp=timetable[day]
                let obj={
                    branch:undefined,
                    batch:undefined,
                    sem:undefined,
                    subject:undefined,
                    type:undefined,
                    period_no:undefined,
                    day:undefined
                }
                for (period in temp) {
                 
                  obj[period]=temp[period]
               
                }
            
                $(`#branch-${obj.period_no}`).html(obj.branch);
                $(`#batch-${obj.period_no}`).html(obj.batch);
                $(`#sem-${obj.period_no}`).html(obj.sem);
                $(`#subject-${obj.period_no}`).html(obj.subject);
                $(`#type-${obj.period_no}`).html(obj.type);
                period_no_include.push(obj.period_no)
            }
          
        }
        for (let index = 1; index < 7; index++) {
            if(!period_no_include.includes(index)){
                $(`#branch-${index}`).html("No value");
                $(`#batch-${index}`).html("No value");
                $(`#sem-${index}`).html("No value");
                $(`#subject-${index}`).html("No value");
                $(`#type-${index}`).html("No value");
            }
            
        }
    });
});

let obj={
    
    branch:undefined,
    batch:[],
    sem:undefined,
    subject:undefined,
    type:undefined,
    period_no:undefined,
    day:undefined
};
let obj1={
    
    branch:undefined,
    batch:[],
    sem:undefined,
    subject:undefined,
    type:undefined,
    period_no:undefined,
    day:undefined
};
let fas_fas=document.getElementsByClassName("fa-times")
let sub_selected_classes=document.getElementsByClassName("sub_selected")
let fa_classes=document.getElementsByClassName("fa-edit")
let branch=document.getElementById('subject')
let batch=document.getElementById('batch')
let subject=document.getElementById('teacher_subject')
let sem=document.getElementById("sem")
let type=document.getElementById("type")
let selcted=document.getElementById("selected")
let check=false
let select_batch=[]
for (let index = 0; index < fa_classes.length; index++) {
    fa_classes[index].addEventListener('click',(e)=>{
      
        let id=e.target.id
        period_no=id.split("_")[0].split("-")[1]
        obj.period_no=period_no
        if(day_selected==undefined){
            day_selected="Monday"
        }
        obj.day=day_selected

        
        let branch_branch=document.getElementById(`branch-${period_no}`)
        let batch_batch=document.getElementById(`batch-${period_no}`)
        let type_type=document.getElementById(`type-${period_no}`)
        let sem_sem=document.getElementById(`sem-${period_no}`)
        let subject_subject=document.getElementById(`subject-${period_no}`)
        obj1.branch=branch_branch
        obj1.batch=batch_batch
        obj1.type=type_type
        obj1.subject=subject_subject
        obj1.sem=sem_sem
        
         select_batch=batch_batch.innerText.split(',')
//set the selected value in model
if(sem_sem.innerText!="No value"){

    sem.value=sem_sem.innerText
    type.value=type_type.innerText
  
}
else{
    select_batch=[]
}





        let j=`<option selected value="-1">Select Branch:</option>`
        mymap.forEach((key,element) => {
          if (element==(branch_branch.innerText)){
            j+=`<option selected value='${element}'>${element}</option>`
          
          }
          else{

              j+=`<option  value='${element}'>${element}</option>`
          }
        });

        branch.innerHTML=j
         
        var event = new Event('change');
        branch.dispatchEvent(event)
        j=`<option selected value="-1">Select Subject:</option>`
     
        teacher_subject.forEach((element)=>{
            if (element==subject_subject.innerText){
                j+=`<option selected value=${element}>${element}</option>`
            }
            else{

                j+=`<option  value=${element}>${element}</option>`
            }
        })
      
subject.innerHTML=j

        
    })
}

branch.addEventListener('change',(e)=>{
    if(check){
        select_batch=[]
    }
    selected.innerHTML=""
    let sel=""
select_batch.forEach((element,index)=>{
    select_batch[index]=select_batch[index].trim()
    sel+=`
    <div class="Another" style="display:flex">
    <div class="sub_selected" style="cursor:pointer">${element}  </div>
    <i class="fas fa-times" style="margin-right:5px;cursor:pointer"></i>
    </div>
    `
})
selcted.innerHTML=sel
fas_fas=document.getElementsByClassName("fa-times")
sub_selected_classes=document.getElementsByClassName("sub_selected")
invoke()

    let j=`<option selected value="-1">Select Batch:</option>`
    if (e.target.value==-1){
        batch.innerHTML=j


    }
    else{
if(mymap.get(e.target.value)!=undefined){
    
    mymap.get(e.target.value).forEach((element) => {
        if(!(select_batch.includes(element))){

            j+=`<option  value=${element}>${element}</option>`
        }
    });
     batch.innerHTML=j

   
}
else{


}
    }
    
    check=true

})

function invoke(){




for (let index = 0; index < fas_fas.length; index++) {
   
    fas_fas[index].addEventListener('click',(e)=>{
       
        val=e.srcElement.nextSibling.parentElement.firstElementChild.innerText.trim()
    
        let sel=''
        selected.innerHTML=""
        select_batch=select_batch.filter((x)=>x!=val)
        select_batch.forEach((element,index)=>{
            select_batch[index]=select_batch[index].trim()
            sel+=`
            <div class="Another" style="display:flex">
            <div class="sub_selected" style="cursor:pointer">${element}  </div>
            <i class="fas fa-times" style="margin-right:5px;cursor:pointer"></i>
            </div>
            `
        })
        selcted.innerHTML=sel
        fas_fas=document.getElementsByClassName("fa-times")
        sub_selected_classes=document.getElementsByClassName("sub_selected")
    
    let j='<option  value=-1>Select batch:</option>'
        mymap.get(branch.value).forEach((element) => {
            if(!(select_batch.includes(element))){

                j+=`<option  value=${element}>${element}</option>`
            }
        });
         batch.innerHTML=j
        invoke()
    })

    sub_selected_classes[index].addEventListener('click',(e)=>{
       
    val=e.target.innerText.trim()

    let sel=''
    selected.innerHTML=""
    select_batch=select_batch.filter((x)=>x!=val)
    select_batch.forEach((element,index)=>{
        select_batch[index]=select_batch[index].trim()
        sel+=`
        <div class="Another" style="display:flex">
        <div class="sub_selected" style="cursor:pointer">${element}  </div>
        <i class="fas fa-times" style="margin-right:5px;cursor:pointer"></i>
        </div>
        `
    })
    selcted.innerHTML=sel
    fas_fas=document.getElementsByClassName("fa-times")
    sub_selected_classes=document.getElementsByClassName("sub_selected")

let j='<option  value=-1>Select batch:</option>'
    mymap.get(branch.value).forEach((element) => {
        if(!(select_batch.includes(element))){

            j+=`<option  value=${element}>${element}</option>`
        }
    });
     batch.innerHTML=j
    invoke()
    })
}
}

function close_reboot(){
    check=false
    select_batch=[]
}

batch.addEventListener('change',(e)=>{
    if(e.target.value!=-1){

    
    select_batch.push(e.target.value)
    selected.innerHTML=""
    let sel=""
select_batch.forEach((element,index)=>{
    select_batch[index]=select_batch[index].trim()
    sel+=`   <div class="Another" style="display:flex">
    <div class="sub_selected" style="cursor:pointer">${element}  </div>
    <i class="fas fa-times" style="margin-right:5px;cursor:pointer"></i>
    </div>`
})
selected.innerHTML=sel
fas_fas=document.getElementsByClassName("fa-times")
sub_selected_classes=document.getElementsByClassName("sub_selected")
invoke()    


j="<option  value=-1>Select batch:</option>"

mymap.get(branch.value).forEach((element) => {
    if(!(select_batch.includes(element))){

        j+=`<option  value=${element}>${element}</option>`
    }
});
 batch.innerHTML=j
}

})

function submit_update(){
if(branch.value==-1 || select_batch.length==0||subject.value==-1 || sem.value==-1 ||type.value==-1 ){
    alert_danger("Please select all values")

    return ;
}
obj.branch=branch.value
obj.batch=select_batch
obj.type=type.value
obj.sem=sem.value
obj.subject=subject.value
$.post("/teacher_time_table_insert",obj,(data,status)=>{
 
    if(data=="done"){
        alert_func("Success")
        obj1.branch.innerText=obj.branch
        obj1.sem.innerText=obj.sem
        obj1.type.innerText=obj.type
        obj1.subject.innerText=obj.subject
        let str=""
        for (let index = 0; index < obj.batch.length-1; index++) {
          str+=obj.batch[index]+","
          
        }
        str+=obj.batch[obj.batch.length-1]
        obj1.batch.innerText=str
        document.getElementById("close").click()
    }
})

}

//know day of date yyyy-mm-dd 
function getLocalizedDate(dateStr) {
    var d = new Date(dateStr);
    return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
}

//global var
//Teacher ID


var id = 1, timetable = [];
var period;
var submit_attendance = [];

//timetable data 
$.get("/teacher/timetable",
    function (data, status) {
        if (data && data == "") {
            for (var thisPeriod = 1; thisPeriod < 7; thisPeriod++) {
                $(`#branch-${thisPeriod}`).html("No value");
                $(`#batch-${thisPeriod}`).html("No value");
                $(`#sem-${thisPeriod}`).html("No value");
                $(`#subject-${thisPeriod}`).html("No value");
                $(`#type-${thisPeriod}`).html("No value");
            }
        }
        else{
            timetable = data;
            for (period in timetable) {
                if (timetable[period].day == "Monday") {
                    var thisPeriod = timetable[period].period_no;
                    $(`#branch-${thisPeriod}`).html(timetable[period].branch);
                    $(`#batch-${thisPeriod}`).html(timetable[period].batch);
                    $(`#sem-${thisPeriod}`).html(timetable[period].sem);
                    $(`#subject-${thisPeriod}`).html(timetable[period].subject);
                    $(`#type-${thisPeriod}`).html(timetable[period].type);
                }
                else {
                    for (var thisPeriod = 1; thisPeriod < 7; thisPeriod++) {
                        $(`#branch-${thisPeriod}`).html("No value");
                        $(`#batch-${thisPeriod}`).html("No value");
                        $(`#sem-${thisPeriod}`).html("No value");
                        $(`#subject-${thisPeriod}`).html("No value");
                        $(`#type-${thisPeriod}`).html("No value");
                    }
                }
            }
        }
        for (period in timetable) {
            if (timetable[period].day == "Monday") {
                var thisPeriod = timetable[period].period_no;
                $(`#branch-${thisPeriod}`).html(timetable[period].branch);
                $(`#batch-${thisPeriod}`).html(timetable[period].batch);
                $(`#sem-${thisPeriod}`).html(timetable[period].sem);
                $(`#subject-${thisPeriod}`).html(timetable[period].subject);
                $(`#type-${thisPeriod}`).html(timetable[period].type);
            }
            else {
                for (var thisPeriod = 1; thisPeriod < 7; thisPeriod++) {
                    $(`#branch-${thisPeriod}`).html("No value");
                    $(`#batch-${thisPeriod}`).html("No value");
                    $(`#sem-${thisPeriod}`).html("No value");
                    $(`#subject-${thisPeriod}`).html("No value");
                    $(`#type-${thisPeriod}`).html("No value");
                }
            }
        }
    }
).fail(
    function () {
        alert_danger("Attendance is already there")
    }
);



// !  for branch and batch storage
let mymap=new Map()

//! for teacher teaching storage
let teacher_subject=[]


$.get("/get_branch_batch",
function (data,status){

if (data=="error" && !data ){
    alert_danger("Something went wrong")
}
else{
data.forEach(element => {
 let branch=element.branch
 let batch =element.batch   
 let batch_arr=[];
 if(mymap.get(branch)==undefined){
    batch_arr.push(batch)
    mymap.set(branch,batch_arr)
 }
 else{
    batch_arr=mymap.get(branch)
    batch_arr.push(batch)

    mymap.set(branch,batch_arr)
 }

});


}

}).fail(
    function (){
        alert_danger("Something went wrong")
    }
)

$.get("/teacher_subject",
function (data,status){

if (data=="error" && !data ){
    alert_danger("Something went wrong")
}
else{
data.forEach(element => {
    teacher_subject.push(element.name)

});

}

}).fail(
    function (){
        alert_danger("Something went wrong")
    }
)



let count;
function attendance_search() {
    //day,date,period
    var date = $("#date").val();
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = getLocalizedDate(date);
    let day = weekday[d.getDay()];
    var period_no = $("#period").val();

    //check input
    if (period_no == "Select") {
        alert_danger("Input All Values");
    }
    else if (day == 'Sunday') {
        alert_danger('Take extra class');
    }
    else {
        const time = ["10:30AM - 11:30AM", "11:30AM - 12:30PM", "1:00PM - 2:00PM",
            "2:00PM - 3:00PM", "3:15PM - 4:15PM", "4:15AM - 5:15AM"];
          
        var index = timetable.findIndex(obj => (obj.period_no == period_no) && (obj.day == day))
        if (index != -1) {
            period = {
                no: timetable[index].period_no,
                time: time[period_no - 1],
                day: timetable[index].day,
                branch: timetable[index].branch,
                batch: timetable[index].batch,
                sem: timetable[index].sem,
                subject: timetable[index].subject,
                type: timetable[index].type
            }
            $("#period-details").css({ "display": "flex" });
            $("#this-period").html("#" + period.no);
            $("#this-period-time").html(period.time);
            $("#this-day").html(period.day);
            $("#this-branch").html(period.branch);
            $("#this-sem").html(period.sem);
            $("#this-sub").html(period.subject);
            $("#this-type").html(period.type);
            $("#this-batch").html(period.batch);
            var batcharray = splitcomma(period.batch)
            $.post("/getstudents",
                {
                    sem: period.sem,
                    branch: period.branch,
                    batch: batcharray
                },
                function (data, status) {

                    if (status == 'success') {
                     console.warn(data,"data")
                     count=data
                        $("#attendance_table").DataTable({
                            destroy: true,
                            data: data,
                            bLengthChange: true,
                            columns: [
                                { data: "enrollment", title: "Enrollment" },
                                { data: "name", title: "Name" },
                                { data: "batch", title: "Batch" },
                                {
                                    data: "enrollment",
                                    render: (data, type, row, meta) => {
                                        return (`<input type="checkbox" id="` + data + `" class="present_check">`);
                                    },
                                    title: "Attendance",
                                },
                            ],
                        });
                        create_class1()
                    }
                });
        }
        else {
            alert_danger("Period on this day is not assigned");
        }

    }
}
let pages;
let present_check
function create_class1(){
    // console.log("hello")
     present_check=document.getElementsByClassName("present_check")
     for (let index = 0; index < present_check.length; index++) {
       
        present_check[index].addEventListener("click",(e)=>{
            attenadance_selection.set(e.target.id,document.getElementById(e.target.id).checked)
            console.log(e.target.id,"ids")
        })
     }
    // console.log(present_check,"present")
    pages=document.getElementsByClassName("pagination")
    console.log(pages,"pages")
    for (let index = 0; index < pages.length; index++) {
       pages[index].addEventListener("click",(e)=>{
           create_class1()


       })
        
    }

}

function  update_attendance_search() {
    //day,date,period
    var date = $("#update_date").val();
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = getLocalizedDate(date);
    let day = weekday[d.getDay()];
    var period_no = $("#update_period").val();

    //check input
    if (period_no == "Select") {
        alert_danger("Input All Values");
    }
    else if (day == 'Sunday') {
        alert_danger('Take extra class');
    }
    else {
        const time = ["10:30AM - 11:30AM", "11:30AM - 12:30PM", "1:00PM - 2:00PM",
            "2:00PM - 3:00PM", "3:15PM - 4:15PM", "4:15AM - 5:15AM"];
        var index = timetable.findIndex(obj => (obj.period_no == period_no) && (obj.day == day))
        console.warn(timetable,"timetable")
        if (index != -1) {
            console.warn(index,"index")
            period = {
                no: timetable[index].period_no,
                time: time[period_no - 1],
                day: timetable[index].day,
                branch: timetable[index].branch,
                batch: timetable[index].batch,
                sem: timetable[index].sem,
                subject: timetable[index].subject,
                type: timetable[index].type
            }
            $("#period-details").css({ "display": "flex" });
            $("#this-period").html("#" + period.no);
            $("#this-period-time").html(period.time);
            $("#this-day").html(period.day);
            $("#this-branch").html(period.branch);
            $("#this-sem").html(period.sem);
            $("#this-sub").html(period.subject);
            $("#this-type").html(period.type);
            $("#this-batch").html(period.batch);
            var batcharray = splitcomma(period.batch)
            $.post("/getstudents_already",
                {
                    sem: period.sem,
                    branch: period.branch,
                    batch: batcharray,
                    date:date,
                    period:timetable[index].period_no
                },
                function (data, status) {
                    if (status == 'success') {
                        if(data=="0"){
                            alert_danger("Period on this day is not assigned");
                            $("#update_attendance_table").DataTable().clear().destroy()
                            new DataTable('#update_attendance_table');
                            // $('#table_id').DataTable().clear().destroy();
                            return 
                        }
                        $("#update_attendance_table").DataTable({
                            destroy: true,
                            data: data,
                            bLengthChange: true,
                            columns: [
                                { data: "enrollment", title: "Enrollment" },
                                { data: "name", title: "Name" },
                                { data: "batch", title: "Batch" },
                                {
                                    data: "attendance",
                                    
                                        render: (data, type, row, meta) => {
                                            return (`<div class="displaying" style="display:inline-block;">${data}</div> <label class="switch ">
                                            ${data}
                                            <input type="checkbox" class="attendace">
                                            <span class="slider round "></span>
                                          </label>
                                          `);
                                        },
                                    title: "Attendance",
                                   
                                },
                                
                            ],
                        });
                       
                        create_class()
                    }
                });
        }
        else {
            alert_danger("Period on this day is not assigned");
        }

    }
}


// !event handling
let updated_attendace=new Map()
let attendace_update;
let displaying;
// function hope(){
//    var attendace_update=document.getElementsByClassName("attendace") 
//    console.warn("no")
//    for (let index = 0; index < attendace_update.length; index++) {
//     if(attendace_update[index].checked){
//         attendace_update[index].checked=false
//     }
//     else{
//         attendace_update[index].checked=true
//     }
//     attendace_update[index].addEventListener('change',(e)=>{
//                     console.log(e.value,e)
                    
//                   let  enrollment_no= e.target.closest('td').closest('tr').innerHTML.split('td')[1].split(">")[1].split("<")[0]   
//            console.log(enrollment_no,"enrollement")
//             let toggle_val=e.srcElement.offsetParent.nextSibling.parentNode.children[0].innerText
//             console.log(toggle_val,"toggle")
//             if(toggle_val=="1"){
//                 e.srcElement.offsetParent.nextSibling.parentNode.children[0].innerText="0" 
//                 toggle_val="0"
//             }
//             else{
//                 e.srcElement.offsetParent.nextSibling.parentNode.children[0].innerText="1" 
//                 toggle_val="1"
//             }
            
//             console.log(toggle_val,"toggle")
          
//             updated_attendace.set(enrollment_no,toggle_val)
//            attendace_update=[]
//                 })
                
//             }
            
// }
function create_class(){
    displaying=document.getElementsByClassName("displaying")
    attendace_update=document.getElementsByClassName("attendace")
    for (let index = 0; index < displaying.length; index++) {
                console.log(displaying[index],"hello")
        if(displaying[index].innerText=="1"){
            attendace_update[index].checked=true
        }
    }
console.log("hello")

//         attendace_update[index].addEventListener('change',(e)=>{
//             console.log(e.value,e)
            
//           let  enrollment_no= e.target.closest('td').closest('tr').innerHTML.split('td')[1].split(">")[1].split("<")[0]   
//    console.log(enrollment_no,"enrollement")
//     let toggle_val=e.srcElement.offsetParent.childNodes[0].textContent.trim()
//     console.log(toggle_val,"toggle")
//     if(toggle_val=="1"){
//         e.srcElement.offsetParent.childNodes[0].textContent="0" 
//         toggle_val="0"
//     }
//     else{
//         e.srcElement.offsetParent.childNodes[0].textContent="1" 
//         toggle_val="1"
//     }
//     displaying[index].innerText=toggle_val
//     console.log(toggle_val,"toggle")
  
//     updated_attendace.set(enrollment_no,toggle_val)
   
//         })
        
//     }
//  let   pages=document.getElementById("update_attendance_table")
//     console.log(pages,"pages")
//   pages.addEventListener("change",(e)=>{
//     console.warn("yeah")
//   })

}
// $('#update_attendance_table').on('page.dt', ()=>{
//     console.log("happed")
   
// } )
$(document).on('click', '.paginate_button', function(e) {
    // Event handler logic here
    console.log("huahuauah")
    create_class()
    displaying=document.getElementsByClassName("displaying")
    for (let index = 0; index < displaying.length; index++) {
                console.log(displaying[index],"hello")
        if(displaying[index].innerText=="1"){
            attendace_update[index].checked=true
        }
    }
});
$(document).on('click', '.temp', function(e) {
    // Event handler logic here
    console.log("huahuauah")
  
    displaying=document.getElementsByClassName("displaying")
    for (let index = 0; index < displaying.length; index++) {
                console.log(displaying[index],"hello")
        if(displaying[index].innerText=="1"){
            attendace_update[index].checked=true
        }
    }
});
$(document).on('change', '.attendace', function(e) {
    // Event handler logic here
    console.log('Button clicked',e);
    let  enrollment_no= e.target.closest('td').closest('tr').innerHTML.split('td')[1].split(">")[1].split("<")[0]   
    console.log(enrollment_no,"enrollement")
     let toggle_val=e.currentTarget.offsetParent.nextSibling.parentNode.children[0].innerText.trim()
     console.log(toggle_val,"toggle")
     if(toggle_val=="1"){
         e.currentTarget.offsetParent.childNodes[0].textContent="0" 
         toggle_val="0"
     }
     else{
         e.currentTarget.offsetParent.childNodes[0].textContent="1" 
         toggle_val="1"
     }
    //  displaying[index].innerText=toggle_val
     console.log(toggle_val,"toggle")
     e.currentTarget.offsetParent.nextSibling.parentNode.children[0].innerText=toggle_val
     console.log(e.currentTarget.offsetParent.nextSibling.parentNode.children[0],"iuguajyfuv")
     updated_attendace.set(enrollment_no,toggle_val)
});
function ToggleAll(){
  
    // console.log(attendace_update[index].checked,"toggles")
    // if(attendace_update[index].checked){

            //     attendace_update[index].checked=false
            //     displaying[index].innerText="0"
            // }
            // else{
                //     attendace_update[index].checked=true
                //     displaying[index].innerText="1"
                // }
               
              let   event_triggering=document.querySelectorAll(".attendace")

              event_triggering.forEach(function(input) {
    // Create a new 'change' event


    // Dispatch the 'change' event on the current input element
    input.click()
});
//             let j=document.getElementsByClassName("temp")
// j[0].click()
            
        
}
//submit attendance
function submit() {

 
    if (count && count != undefined) {
        console.log(attenadance_selection,"hyoia")
        submit_attendance = []
      
        for (i = 0; i < count.length; i++) {

            var check = count[i].enrollment;

            let val=document.getElementById(count[i].enrollment);
let val1=false;
console.log(check,val,"check")
            if (check != undefined) {
                if(val==undefined){
                    val1=false
                }
                else{
val1=val.checked
                    
                }
                if(attenadance_selection.get(String(check))){
                    console.log(attenadance_selection.get(String(check)),"i7agtiavku")
                    val1=attenadance_selection.get(String(check))
                }
                enrollment = check;
                submit_attendance.push(new attendance(enrollment, 1, $("#date").val(), period.subject, period.type, period.no, val1));
            }
        }
        console.warn(submit_attendance,"subkiy")
        $.post("/add/attendance",
            {
                submit_attendance: submit_attendance
            },
            function (data, status) {
                if (status = "success")
                    alert_func(data);
            }).fail(
                function () {
                    alert_danger("Attendance is already there")
                }
            );
    }

}
function update_submit() {
     console.log(updated_attendace)
updated_attendace1=Array.from(updated_attendace)
    var count = updated_attendace1.length;
   
    if (count && count != undefined) {
        submit_attendance = []
        for (i = 0; i < count; i++) {
            var check = updated_attendace1[i];
            if (check != undefined && check.length!=0) {
                val = check[1];
                enrollment = check[0];
                submit_attendance.push(new attendance(enrollment, 1, $("#update_date").val(), period.subject, period.type, period.no, val));
            }
        }
        $.post("/update/attendance",
            {
                submit_attendance: submit_attendance
            },
            function (data, status) {
                if (status = "success")
                    alert_func(data);
            }).fail(
                function () {
                    alert_danger("Attendance is already there")
                }
            );
    }

}
class attendance {
    constructor(enrollment, teacher_id, date, subject, type, periodno, present) {
        this.enrollment = enrollment;
        this.teacher_id = teacher_id;
        this.date = date;
        this.subject = subject;
        this.type = type;
        this.periodno = periodno;
        this.attendance = present;
    }
}

//check all
let attenadance_selection=new Map()

function checkAll() {
    var count = $('#attendance_table .present_check').length;
    for (var i = 0; i < count; i++) {
        var check = document.getElementById("attendance_table").getElementsByClassName("present_check")[i];
        check.checked = true;
        attenadance_selection.set(check.id,true)
        console.log(check,"checking")
    }
}

$(document).ready(function () {
    $(".main-button").click(function () {
        var id = $(this).attr("id");
        console.log(id,"ogso8gfawlo")
        if (id == "select_attendance") {
            $("#select_timetable").removeClass("activebtn");
            $("#select_student").removeClass("activebtn");
            $('#select_update_attendance').removeClass("activebtn")
            $("#select_attendance").addClass("activebtn");

            $("#timetable_container").addClass("displaynone");
            $("#student_container").addClass("displaynone");
            $("#update_attendance_container").addClass("displaynone")
            $("#attendance_container").removeClass("displaynone");
        }
        else if (id == "select_timetable" ) {
            $("#select_timetable").addClass("activebtn");
            $("#select_student").removeClass("activebtn");
            $("#select_attendance").removeClass("activebtn");
            $('#select_update_attendance').removeClass("activebtn")

            $("#timetable_container").removeClass("displaynone");
            $("#student_container").addClass("displaynone");
            $("#update_attendance_container").addClass("displaynone")
            $("#attendance_container").addClass("displaynone");
        }
        else if (id == "select_student") {
            $("#select_timetable").removeClass("activebtn");
            $("#select_student").addClass("activebtn");
            $("#select_attendance").removeClass("activebtn");
            $('#select_update_attendance').removeClass("activebtn")

            $("#timetable_container").addClass("displaynone");
            $("#student_container").removeClass("displaynone");
            $("#update_attendance_container").addClass("displaynone")
            $("#attendance_container").addClass("displaynone");
        }
        else if(id=="select_update_attendance"){
            $("#select_timetable").removeClass("activebtn");
            $("#select_student").removeClass("activebtn");
            $("#select_attendance").removeClass("activebtn");
            $('#select_update_attendance').addClass("activebtn")

            $("#timetable_container").addClass("displaynone");
            $("#student_container").addClass("displaynone");
            $("#update_attendance_container").removeClass("displaynone")
            $("#attendance_container").addClass("displaynone");   
        }
        document.getElementById('tue').click()

    })
    $(".j").click(function () {
        var id = $(this).attr("id");
        console.log(id,"ogso8gfawlo")
        if (id == "select_attendance") {
            $("#select_timetable").removeClass("activebtn");
            $("#select_student").removeClass("activebtn");
            $("#select_attendance").addClass("activebtn");
            $('#select_update_attendance').removeClass("activebtn")

            $("#timetable_container").addClass("displaynone");
            $("#student_container").addClass("displaynone");
            $("#attendance_container").removeClass("displaynone");
            $("#update_attendance_container").addClass("displaynone")
        }
        else if (id == "select_timetable" ) {
            $("#select_timetable").addClass("activebtn");
            $("#select_student").removeClass("activebtn");
            $("#select_attendance").removeClass("activebtn");
            $('#select_update_attendance').removeClass("activebtn")


            $("#timetable_container").removeClass("displaynone");
            $("#student_container").addClass("displaynone");
            $("#attendance_container").addClass("displaynone");
            $("#update_attendance_container").addClass("displaynone")
        }
        else if (id == "select_student") {
            $("#select_timetable").removeClass("activebtn");
            $("#select_student").addClass("activebtn");
            $("#select_attendance").removeClass("activebtn");
            $('#select_update_attendance').removeClass("activebtn")

            $("#timetable_container").addClass("displaynone");
            $("#student_container").removeClass("displaynone");
            $("#attendance_container").addClass("displaynone");
            $("#update_attendance_container").addClass("displaynone")
        }
        else if(id=="select_update_attendance"){
            $("#select_timetable").removeClass("activebtn");
            $("#select_student").removeClass("activebtn");
            $("#select_attendance").removeClass("activebtn");
            $('#select_update_attendance').addClass("activebtn")

            $("#timetable_container").addClass("displaynone");
            $("#student_container").addClass("displaynone");
            $("#update_attendance_container").removeClass("displaynone")
            $("#attendance_container").addClass("displaynone");   
        }
//         let menuToggle = document.querySelector('.menu-toggle');
// let event=new Event('click')
// menuToggle.dispatchEvent(event)
// document.getElementById('tue').click()
closeMobileNavbar()
    })

})

var alert_s = `<div id="alert_box" class="alert alert-success d-flex alert-dismissible fade"
    style="width: 30%;position: fixed;right:70px" role="alert">
    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
        <use xlink:href="#check-circle-fill" />
    </svg>
    <div>
        <span id="alert_text"></span>
        <button type="button" class="btn-close" onclick='alert_close()' aria-label="Close"></button>
    </div> </div>`;
var alert_d = `<div id="alert_box2" class="alert alert-danger d-flex alert-dismissible fade"
    style = "width: 30% ;position: fixed;right:70px" role="alert">
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


alert_func("Welcome " + getCookie("email"))

//Format of get/post req
/*
$("button").click(function () {
    $.get("demo_test.asp", function (data, status) {
        alert("Data: " + data + "\nStatus: " + status);
    });
});
//post req  
$("button").click(function () {
    $.post("demo_test_post.asp",
        {
            name: "Donald Duck",
            city: "Duckburg"
        },
        function (data, status) {
            alert("Data: " + data + "\nStatus: " + status);
        });
});*/


// for navbar

// const menuToggle = document.querySelector('.menu-toggle');
// const navbar = document.querySelector('.navbar');

// menuToggle.addEventListener('click', () => {
//   navbar.classList.toggle('active');
//   document.getElementById("nav_responsive").classList.toggle("display_flex")
// });





let teacher_name=document.getElementById("teacher_name")
let teacher_email=document.getElementById("teacher_email")
let teacher_contact=document.getElementById("teacher_contact")
function geting_info(){
    $.get("/teacher_information",(data,status)=>{
    
        if(data=="error"){
            alert_danger("something went wrong")
        }
        else{
           
            teacher_name.value=data[0].name
            teacher_email.value=data[0].email
            teacher_contact.value=data[0].contact
        }
    })

}
function update_teacher(){
    if(teacher_name.value.length==0 || teacher_email.value.length==0 || teacher_contact.value.length!=10  ){
alert_danger("Please fill correct values")
    }
    else{
        alert("Are u sure?")
        let teacher_update={
            name:teacher_name.value,
            email:teacher_email.value,
            contact:teacher_contact.value
        }
        $.post("/update_teacher_info",teacher_update,(data,status)=>{
            if(data=="error"){
                alert_danger("Something went wrong ")
            }
            else{
                alert_func("Success")
                document.getElementById("close1").click()
            }
        })
    }
}


// responsive navbar
const navbar = document.getElementById("navbar");
const navbarToggle = navbar.querySelector(".navbar-toggle");


function openMobileNavbar() {

  console.log("hello")
  navbar.classList.add("opened");
  navbarToggle.setAttribute("aria-expanded", "true");
}

function closeMobileNavbar() {

  navbar.classList.remove("opened");
  
  navbarToggle.setAttribute("aria-expanded", "false");
}

navbarToggle.addEventListener("click", () => {
  if (navbar.classList.contains("opened")) {
    console.log("hello_here")
    closeMobileNavbar();
    
  } else {
    console.log("hello_here1")
    openMobileNavbar();
  }
});

const navbarMenu = navbar.querySelector("#navbar-menu");
const navbarLinksContainer = navbar.querySelector(".navbar-links");


navbarLinksContainer.addEventListener("click", (clickEvent) => {
  console.log("hello_here2")
  clickEvent.stopPropagation();
});

navbarMenu.addEventListener("click", closeMobileNavbar);

document
  .getElementById("options")
  .querySelectorAll("input[name='navtype']")
  .forEach((option) => {
    option.addEventListener("change", (e) => {
      console.log("hello_here4")
      const navType = e.target.id.split("-").join(" ");
      navbarMenu.classList = navType;
    });
  });
