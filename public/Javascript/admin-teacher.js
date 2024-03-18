
$.post("/teacher_req", { email: 1 },
    function (data, error) {
        $('#request_table').html('<thead><tr></tr></thead><tbody></tbody>')
        $('#request_table thead tr').append('<th>Name</th><th>Email</th><th>Contact:</th><th>Accepted/Rejected</th>')
        data.forEach(element => {
            text = '<tr>'
            text += "<td>" + element.name + "</td>"

            text += "<td>" + element.email + "</td>"
            text += "<td>" + element.contact + "</td>"
            id_accepted = element.email.split('@')[0] + ".accepted"
            id_rejected = element.email.split('@')[0] + ".rejected"
            text += `<td ><img src='../images/check.png' style='width:30px;height:30px;margin-right:10px' id=${id_accepted} class="accepted"></img> <img src='../images/delete.png'  style='width:30px;height:30px' id=${id_rejected} class="rejected"></img></td>`
            text += "</tr>"
            $('#request_table tbody').append(text)

        });
        // $("#request_table").DataTable();
        // new DataTable('#request_table');
        $("#request_table").dataTable({
            "destroy": true,
        });
    }
)

msg_id = document.getElementById('msg')

window.addEventListener('click', (e) => {
    id_dec = e.target.id
    a_r = id_dec.split('.')[1]
    if (a_r == "accepted") {
        loading_ani(1)
        //geting the whole gmail
        id_dec = id_dec.split('.')[0] + "@gmail.com"
        //TODO post the request for removing clicked row and send the mail from teacher_req
        let email_obj = {
            email: id_dec
        }
        $.post("/teacher_req", email_obj, function (data, error) {
            if (data) {
                $.post("/teacher_req_decision/1", data[0], function (data, error) {
                    if (data == "error") {
                        loading_ani(0)
                        alert_danger("Something went wrong")
                        msg_id.style.display = 'none'
                    }
                    else {
                        loading_ani(0)
                        //for removing click row
                        alert_func("Added Successfully")
                        e.target.closest('td').closest('tr').remove()
                        msg_id.style.display = 'none'
                    }
                })
            }
        })
        //for displaying msg  
        msg_id.classList.remove('danger')
        msg_id.classList.add('success')
        msg_id.style.display = 'block'

        msg_id.innerText = "Accepted"

    }
    else if (a_r == "rejected") {
        loading_ani(1)
        //geting the whole gmail
        id_dec = id_dec.split('.')[0] + "@gmail.com"

        //TODO post the request for removing clicked row and send mail from teacher_req
        let email_obj = {
            email: id_dec
        }

        $.post("/teacher_req_decision/0", email_obj, function (data, error) {
            if (data == "error") {
                loading_ani(0)
                alert_danger("Something went wrong")
                msg_id.style.display = 'none'
            }
            else {
                //for removing click row
                loading_ani(0)
                
                alert_func("Rejected Successfully")
                e.target.closest('td').closest('tr').remove()
                msg_id.style.display = 'none'

            }
        })

        //for displaying msg  
        msg_id.classList.remove('success')
        msg_id.classList.add('danger')
        msg_id.style.display = 'block'

        msg_id.innerText = "Rejected"

    }

})  