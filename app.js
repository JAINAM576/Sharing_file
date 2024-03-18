//REQUIRED FILES
const favicon = require('serve-favicon');
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const session = require('express-session');
const connectLivereload = require("connect-livereload");
const nodemailer = require("nodemailer")

// Returns a middleware to serve favicon 


const app = express();
//faviicon
app.use(favicon(__dirname + '/public/SVG/logo.jpg'));
//CONNECTIONS
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
var pool = mysql.createConnection({
  host: "localhost",
  database: "attendance_management",
  user: "root",
  password: "root",
  dateStrings: true
});
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 86400000, secure: false }
}));
pool.connect(function (err) {
  if (err) {
    console.log("database not connected");
    throw err;
  }
  else {
    console.log("database connected");
  }
});
//admin
const Auth1 = (req, res, next) => {
  if (req.session.userid && req.session.role == 'Admin') {
    next(); // User is authenticated, continue to next middleware
  } else {
    res.redirect('/'); // User is not authenticated, redirect to login page
  }
}
const Auth2 = (req, res, next) => {
  if (req.session.userid && req.session.role == 'Teacher') {
    next(); // User is authenticated, continue to next middleware
  } else {
    res.redirect('/'); // User is not authenticated, redirect to login page
  }
}

const Auth = (req, res, next) => {
  if (req.session.userid && req.session.role == 'Teacher' || req.session.role == 'Admin') {
    next(); // User is authenticated, continue to next middleware
  } else {
    res.redirect('/'); // User is not authenticated, redirect to login page
  }
}

//REDIRECT
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/Pages/login.html");
});
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/Pages/login.html");
});
app.get("/404", (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Error/404.html");
});
app.get("/serverdown", (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Error/serverdown.html");
});
app.get("/503", (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Error/503.html");
});
app.get("/500", (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Error/500.html");
});
app.get("/admin/student", Auth1, (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Admin-Student.html");
});
app.get("/admin/teacher", Auth1, (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Admin-Teacher.html");
});
app.get("/admin/update", Auth1, (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Update.html");
});
app.get("/teacher", Auth2, (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Teacher.html");
});
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Signup.html");
});
//teacher request html
app.get("/pending", (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Request/Teacher_req.html");
});
//CODE
app.get("/forgot_pass", (req, res) => {
  res.sendFile(__dirname + "/public/Pages/forgot_pass.html");
})


//for signup
app.post('/signup', (req, res) => {
  const { role, name, email, pass, mobileNumber } = req.body;
  // Validate user credentials
  pool.query(
    "select email from employee where email=?", [email], (error, results) => {
      if (results && results[0]) {
        res.status(500).json("Email is already used");
      }
      else {
        pool.query(
          "select email from teacher_req where email=?", [email], (error, results) => {
            if (results && results[0]) {
              res.status(500).json("Email is already used");
            }
            else {
              pool.query(
                "insert  into teacher_req values(?,?,?,?,?)",
                [name, role, pass, email, mobileNumber],
                (error, results) => {
                  if (error) {
                    console.log(error)
                    res.redirect('/503');
                  }
                  else {
                    res.redirect('/pending');
                  }
                }
              );
            }
          });
      }
    });
});
app.post('/login', (req, res) => {
  const { role, email, pass } = req.body;
  // Validate user credentials
  pool.query(
    "SELECT * FROM employee where email=(?)",
    [email],
    (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json('/500');
      }
      else if (results && results[0]) {
        if (results[0].pass == pass && results[0].role == role) {
          req.session.userid = results[0].id;
          req.session.email = email;
          req.session.pass = pass;
          req.session.role = role;
          if (role == 'Admin')
            res.status(200).json('/admin/student');
          else
            res.status(200).json('/teacher');
        }
        else {
          res.status(200).json('/503');
        }
      }
      else {
        res.status(200).json('/503');
      }
    }
  );
});

//logout
app.get('/logout', (req, res) => {
  req.session.destroy(function () {
    res.clearCookie('userid');
    res.clearCookie('email');
    res.clearCookie('pass');
    res.clearCookie('role');
    res.status(200).json("Logout")
  });
})


//teacher
app.post("/getstudents", Auth2, (req, res) => {
  const { sem, branch, batch } = req.body;
  var condition = `(batch='` + batch[0] + `'`, i = 1;
  for (i = 1; i < (batch.length); i++) {
    condition += ` OR batch='` + batch[i] + `'`;
  }
  condition += `)`;
  pool.query(
    `SELECT name,enrollment,batch FROM student where sem=(?) AND branch=(?) AND` + condition,
    [sem, branch],
    (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json("failed");
      }
      else {
        res.status(200).json(results);
      }
    }
  );
});
app.post("/getstudents_already", (req, res) => {
  let id = req.session.userid
  const { sem, branch, batch, date, period } = req.body;
  var condition = `(batch='` + batch[0] + `'`, i = 1;
  for (i = 1; i < (batch.length); i++) {
    condition += ` OR batch='` + batch[i] + `'`;
  }
  condition += `)`;
  pool.query(
    `select s.enrollment,s.name ,s.batch,a.attendance  from student as s  inner join   attendance
    as a on s.enrollment=a.enrollment where sem=(?) and branch=(?)  and  a.date=(?) and a.teacher_id=(?) and a.periodno=(?) and ` + condition,
    [sem, branch, date, id, period],
    (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json("failed");
      }
      else if (results && results[0]) {
        res.status(200).json(results);
      }
      else {
        res.status(200).send("0");
      }

    }
  );
});
app.post("/add/attendance", Auth2, (req, res) => {
  const { submit_attendance } = req.body;
  let id = req.session.userid
  pool.query(
    "SELECT * FROM attendance where date=(?) AND periodno=(?) AND teacher_id=(?)",
    [submit_attendance[0].date, submit_attendance[0].periodno, id],
    (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json("failed");
      }
      else if (results && results[0]) {
        res.status(500).json("Attendance is already there");
      }
      else {
        var val = -1;
        for (i = 0; i < (submit_attendance.length); i++) {
          if (submit_attendance[i].attendance == 'true') {
            val = 1;
          }
          else if (submit_attendance[i].attendance == 'false') {
            val = 0;
          }
          pool.query(
            `insert into attendance(attendance,date,enrollment,periodno,subject,teacher_id,type) 
                        values(? , ?, ?, ?, ?, ?, ?);`,
            [val, submit_attendance[i].date, submit_attendance[i].enrollment,
              submit_attendance[i].periodno, submit_attendance[i].subject, id,
              submit_attendance[i].type],
            (error, results) => {
              if (error) {
                console.log(error)
                res.status(500).json("failed");
              }
            }
          );
        }
        res.status(200).json("Attendance added successfully");
      }
    }
  );
});

app.post("/update/attendance", Auth2, (req, res) => {
  let { submit_attendance } = req.body
  let id = req.session.userid
  for (let index = 0; index < submit_attendance.length; index++) {
    pool.query("update attendance set attendance=(?) where enrollment=(?) and teacher_id=(?) and date=(?) and periodno=(?)", [submit_attendance[index].attendance, submit_attendance[index].enrollment, id, submit_attendance[index].date, submit_attendance[index].periodno], (error, result) => {
      if (error) {
        console.log(`error occured at ${index}`, error)
        res.send("error")
      }
    })

  }
  res.send("done")
})

app.post("/add/students", Auth1, (req, res) => {
  const { student } = req.body;
  for (i = 0; i < (student.length); i++) {
    division = student.Batch[0];
    pool.query(
      `insert into student(name,enrollment,branch,batch,division,batchyear,sem,email,contact) 
                        values(? , ?, ?, ?, ?, ?, ?, ?, ?);`,
      [student[i].Name, student[i].Enrollment, student[i].Branch, student[i].Batch,
        division, student[i].BatchYear, student[i].Sem, student[i].Email, student[i].Contact],
      (error, results) => {
        if (error) {
          console.log(error)
          res.status(200).json(`Problem Accured While inserting ${student[i].Name}`)
        }
      }
    );
  }
  res.status(200).json("successful");
});


app.post("/add/branch", Auth1, (req, res) => {
  const { branch, batch } = req.body;

  var condition = `(batch='` + batch[0] + `'`,
    i = 1;
  for (i = 1; i < batch.length; i++) {
    condition += ` OR batch='` + batch[i] + `'`;
  }
  condition += `)`;
  // first check if the branch already exists or not
  pool.query(
    "SELECT * FROM field where branch=(?) AND " + condition,
    [branch],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json("Some error there");
      } else if (results && results[0]) {
        //res.status(200).json(results);
        //the branch already exists
        // you can show in frontend that branch exists
        res.status(200).json(0);
      } else {
        batch.forEach((batchh) => {
          pool.query(
            `INSERT INTO field (branch, batch) VALUES (?, ?);`,
            [branch, batchh],
            (error, results) => {
              if (error) {
                console.error(
                  `Error inserting batch ${batchh}: ${error.message}`
                );
                res.status(500).json("Error inserting" + branch + "(" + batchh + ")");
              }
            }
          );
        });

        res.status(200).json("Successfully inserted");
      }
    }
  );
});


//---------------------------------ADD SUBJECT -----------------------------------------------------------
app.post("/add/subject", Auth1, (req, res) => {
  const { name, code } = req.body;
  // first check if the subject already exists or not
  pool.query(
    "SELECT * FROM subject where code=(?)",
    [code],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json(`Error inserting subject code ${code}`);
      } else if (results && results[0]) {
        //res.status(200).json(results);
        //the subject already exists
        // you can show in frontend that subject exists  
        res.status(200).json(0);
      } else {
        pool.query(
          `INSERT INTO subject (name, code) VALUES (?, ?);`,
          [name, code],
          (error, results) => {
            if (error) {
              console.error(
                `Error inserting subject code ${code}: ${error.message}`
              );
              res.status(500).json(`Error inserting subject code ${code}`);
            } else {
            }
          }
        );
        // ADD HERE HOW THE ADMIN WILL SEE THE SUCCESS MESSSAGE
        res.status(200).json(`Subject ${name} inserted successfully`);
      }
    }
  );
});

//----------------------  GETALL TEACHERS ------------------------------------
app.get("/getallteachers", Auth1, (req, res) => {
  pool.query(
    "SELECT id,name,email,contact FROM employee WHERE role = 'Teacher' and status=1;",
    (error, results) => {
      if (error) {
        console.log(error);
      } else {

        res.status(200).json(results);
      }
    }
  );
});

//----------------------  GETALL BRANCH ---------------------------------------
app.get("/getallbranch", Auth1, (req, res) => {
  pool.query("SELECT * FROM field;", (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json("failed");
    } else {
      res.status(200).json(results);
    }
  });
});
//----------------------  GETALL DISTINCT BRANCH ---------------------------------------
app.get("/getallbranch/distinct", Auth, (req, res) => {
  pool.query("SELECT distinct branch FROM field;", (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json("failed");
    } else {
      res.status(200).json(results);
    }
  });
});

//----------------------  GET ID ---------------------------------------
app.get("/getid", Auth, (req, res) => {
  res.status(200).json(req.session.userid);
});

//--------------------------- Get All Subjects ------------------------------------------------
app.get("/getallsubjects", Auth1, (req, res) => {
  pool.query(
    `SELECT * FROM subject`,
    (error, results) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.status(200).json(results);
      }
    }
  );
});
//--------------------------- Get All Teaching ------------------------------------------------
app.get("/getallteaching", Auth1, (req, res) => {
  pool.query(
    `select employee.name as teacher,employee.id,subject.name as subject, subject.code, teaching.type from teaching 
    inner join employee inner join subject where teaching.id = employee.id and subject.code=teaching.code`,
    (error, results) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.status(200).json(results);
      }
    }
  );
});
//--------------------------- Get All Subjects ------------------------------------------------
app.get("/getallstudents", Auth1, (req, res) => {
  pool.query(
    `SELECT * FROM student`,
    (error, results) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.status(200).json(results);
      }
    }
  );
});

//----------------------  GETALL TEACHER'S TIMETABLE ------------------------------------
app.get("/teacher/timetable", Auth2, (req, res) => {
  var id = req.session.userid;
  pool.query(
    "SELECT * FROM teacher_timetable WHERE id = ?;", [id],
    (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.status(200).json(results);
      }
    }
  );
});

//-----------------------teacher analysis--------------------------
app.post("/teacher/studentinfo/subject", Auth2, (req, res) => {
  var { fromdate, branch, year, todate } = req.body;
  pool.query(`SELECT DISTINCT attendance.subject,attendance.type FROM attendance INNER JOIN student ON attendance.enrollment=student.enrollment 
  WHERE attendance.date >= "${fromdate}" And  attendance.date <= "${todate}"
  AND student.branch="${branch}" AND student.batchyear="${year}" AND attendance.teacher_id=${req.session.userid}`, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json("failed");
    } else {

      res.status(200).json(results);
    }
  });
});

app.post("/teacher/studentinfo", Auth2, (req, res) => {
  var { fromdate, branch, year, todate } = req.body;
  pool.query(`SELECT * FROM attendance INNER JOIN student ON attendance.enrollment=student.enrollment 
  WHERE attendance.date >= "${fromdate}" And  attendance.date <= "${todate}" AND student.branch="${branch}" AND student.batchyear="${year}" AND attendance.teacher_id=${req.session.userid}`, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json("failed");
    } else {
      res.status(200).json(results);
    }
  });
});

//!check if row is in or not then insert/update
app.post("/teacher_time_table_insert", Auth2, (req, res) => {
  let id = req.session.userid
  let { branch, batch, sem, subject, type, period_no, day } = req.body
  let str = ""
  for (let index = 0; index < batch.length - 1; index++) {
    str += batch[index] + ","

  }
  str += batch[batch.length - 1]
  pool.query("select * from teacher_timetable where id=(?) and period_no=(?) and day=(?)", [id, period_no, day], (error, result) => {
    if (error) {
      console.log(error, "error")
      res.send("error")
    }
    else {
      if (result.length == 0) {
        pool.query("insert into teacher_timetable value(?,?,?,?,?,?,?,?)", [id, branch, str, sem, subject, type, period_no, day], (error, result) => {
          if (error) {
            console.log(error, "error")
            res.send("error")
          }
          else {
            res.send("done")
          }
        })
      }
      else {
        pool.query("update  teacher_timetable set branch=(?),batch=(?) , sem=(?) ,subject=(?) , type=(?)  where id=(?) and period_no=(?) and day=(?)", [branch, str, sem, subject, type, id, period_no, day], (error, result) => {
          if (error) {
            console.log(error, "error")
            res.send("error")
          } else {
            res.send("done")
          }
        })
      }
    }
  })


})

//!! get teacher teaching subject
app.get("/teacher_subject", Auth2, (req, res) => {
  let id = req.session.userid;
  pool.query("select a.name from subject as a inner join teaching as t on a.code=t.code where id=(?)", [id], (error, result) => {
    if (error) {
      console.log("error in get teacher teaching subject", error)
      res.send("error")
    }
    else {
      res.send(result)
    }
  })
})
//!! get teacher teaching subject
app.post("/distinct/sem", Auth, (req, res) => {
  let { branch, batch } = req.body
  pool.query("select distinct sem from student where branch=(?) and batchyear=(?)", [branch, batch], (error, result) => {
    if (error) {
      console.log("error in get teacher teaching subject", error)
      res.send("error")
    }
    else {
      res.status(200).json(result)
    }
  })
})
app.post("/sem_info", Auth, (req, res) => {
  let { branch, batch } = req.body
  pool.query("select distinct * from sem_info  where branch=(?) and batchyear=(?)", [branch, batch], (error, result) => {
    if (error) {
      console.log("error in get teacher teaching subject", error)
      res.send("error")
    }
    else {
      res.status(200).json(result)
    }
  })
})


app.post("/add/one/student", Auth1, (req, res) => {
  const { student } = req.body;
  division = student.batch[0];
  pool.query(
    `insert into student(name,enrollment,branch,batch,division,batchyear,sem,email,contact) 
                        values(? , ?, ?, ?, ?, ?, ?, ?, ?);`,
    [student.name, student.enrollment, student.branch, student.batch,
      division, student.batchyear, student.sem, student.email, student.contact],
    (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json(`Problem Accured While inserting ${student.name}`)
      }
      else {
        res.status(200).json(`Successfully inserting ${student.name}`)
      }
    }
  );
});
//--------------------------- Update Student -----------------------------------------------------
app.post("/update/student", Auth1, (req, res) => {
  const { newData } = req.body;
  if (!newData) {
    res.status(400).json({ error: "Bad Request - Missing required data " });
  } else {
    pool.query(
      "SELECT * FROM student WHERE enrollment = ? ;",
      [newData.newenrollment],
      (error, results) => {
        if (error) {
          res.status(500).json(error);
        } else if (newData.oldenrollment != newData.newenrollment && results && results[0]) {
          res.status(500).json("Enrollment is already there");
        } else {
          pool.query(
            "UPDATE student SET name = ? ,enrollment =? ,branch = ? ,division = ? ,batch  = ? ,batchyear = ? ,  sem  = ? ,    email = ? ,   contact= ? WHERE enrollment = ?;",
            [
              newData.name,
              newData.newenrollment,
              newData.branch,
              newData.division,
              newData.batch,
              newData.batchyear,
              newData.sem,
              newData.email,
              newData.contact,
              newData.oldenrollment
            ],
            (error, results) => {
              if (error) {
                console.log(error);
                res.status(500).json(error);
              } else {
                res.status(200).json("Successfully updated");
              }
            }
          );
        }
      }
    );
  }
});

//------------------------------------Update employee (not updating id or role)------------------------------------
app.post("/update/employee", Auth1, (req, res) => {
  const { empydata_new } = req.body;

  if (!empydata_new || !empydata_new.id) {
    res.status(500).json({ error: "Bad Request - Missing required data or id" });
  } else {
    pool.query(
      "SELECT * FROM employee WHERE id = ? ",
      [empydata_new.id],
      (error, results) => {
        if (error) {
          res.status(500).json({ error: "Internal Server Error" });
        }
        else if (results && results[0]) {
          pool.query(
            "UPDATE employee SET name = ?, email= ? ,contact = ?  WHERE id = ?;",
            [
              empydata_new.name,
              empydata_new.email,
              empydata_new.contact,
              empydata_new.id,
            ],
            (error, results) => {
              if (error) {
                console.log(error);
                res.status(500).json({ error: "Internal Server Error" });
              } else {
                //res.json(results);
                res.status(200).json("Successfully Updated the data");
              }
            }
          );
        }
        else {
          res.status(500).json("No data like this");
        }
      }
    );
  }
});

// -----------------------------Update branch-------------------------------------------
app.post("/update/branch", Auth1, (req, res) => {
  const { newData } = req.body;

  if (!newData) {
    res.status(500).json({ error: "Bad Request - Missing required data" });
  } else {
    pool.query(
      "SELECT * FROM field WHERE branch = ? AND  batch = ?",
      [newData.newbranch, newData.newbatch],
      (error, results) => {
        if (error) {
          res.status(500).json(error);
        } else if (results && results[0]) {
          res.status(200).json(`Already there`);
        } else {
          pool.query(
            "UPDATE field SET branch = ?, batch= ? WHERE branch = ? and batch = ?;",
            [newData.newbranch, newData.newbatch, newData.oldbranch, newData.oldbatch],
            (error, results) => {
              if (error) {
                console.log(error);
                res.status(500).json(error);
              } else {
                res.status(200).json(`Successfully updated`);
              }
            }
          );
        }
      }
    );
  }
});

// //--------------------------------Update subject--------------------------
app.post("/update/subject", Auth1, (req, res) => {
  const { newData } = req.body;

  if (!newData) {
    res.status(500).json({ error: "Bad Request - Missing required data " });
  } else {
    pool.query(
      "SELECT * FROM subject WHERE code = ?",
      [newData.newcode, newData.name],
      (error, results) => {
        if (error) {
          res.status(500).json(error);
        } else if (results && results[0] && newData.newcode != newData.oldcode) {
          console.log(results[0]);
          res.status(200).json(`Already there`);
        } else {
          pool.query(
            "UPDATE subject SET name = ? ,code = ? WHERE code = ?",
            [newData.name, newData.newcode, newData.oldcode],
            (error, results) => {
              if (error) {
                res.status(500).json(error);
              } else {
                res.status(200).json(`Successfully Updated the data`);
              }
            }
          );
        }
      }
    );
  }
});

////------------------------- Delete employee (not deleting id or role) ----------------------------
app.post("/delete/employee", Auth1, (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    res.status(400).json({ error: "Bad Request - Missing required id" });
  } else {
    pool.query(
      "UPDATE employee SET status = 0 WHERE id=(?)",
      [employeeId],
      (error, results) => {
        if (error) {
          res.status(500).json(error);
        } else {
          res.status(200).json("Sucessfully Deleted");
        }
      }
    );
  }
});



// //--------------------------Update subject-------------------------------
app.post("/update/subject", Auth1, (req, res) => {
  const { newData } = req.body;

  if (!newData) {
    res.status(400).json({ error: "Bad Request - Missing required data " });
  } else {
    pool.query(
      "SELECT * FROM subject WHERE code = ? AND name = ?",
      [newData.newcode, newData.name],
      (error, results) => {
        if (error) {
          res.status(500).json(error);
        } else if (results && results[0]) {
          console.log(results[0]);
        } else {
          pool.query(
            "UPDATE subject SET name = ? ,code = ? WHERE code = ?",
            [newData.name, newData.newcode, newData.oldcode],
            (error, results) => {
              if (error) {
                res.status(500).json(error);
              } else {
                res.status(200).json(`Successfully Updated`);
              }
            }
          );
        }
      }
    );
  }
});

////------------------------- Update Sem ----------------------------
app.post("/update/sem", Auth1, (req, res) => {
  const { u_branch, u_batchyear, date, sem } = req.body;
  if (!u_branch || !u_batchyear) {
    res.status(500).json({ error: "Bad Request - Missing required id" });
  } else {
    pool.query(
      "UPDATE student SET sem = sem+1 WHERE branch=(?) and batchyear=(?)",
      [u_branch, u_batchyear],
      (error, results) => {
        if (error) {
          console.error(error)
          res.status(500).json(error);
        } else {
          pool.query("insert into sem_info (datetype, date, branch, batchyear, sem) values ((?),(?),(?),(?),(?))", ["To", date, u_branch, u_batchyear, sem-1], ((error3, results3) => {
            if (error3) {
              console.error(error3)
              res.status(500).json(error3);
            }
            else{
              pool.query("insert into sem_info (datetype, date, branch, batchyear, sem) values ((?),(?),(?),(?),(?))", ["From", date, u_branch, u_batchyear, sem], ((error4, results4) => {
                if (error4) {
                  console.error(error4)
                  res.status(500).json(error4);
                } 
                else{   
                  res.status(200).json("Sucessfully Updated");
                }
              }))
            }
          }))
          
        }
      }
    );
  }
});


// //--------------------------Delete student------------------------------
app.post("/delete/student", Auth1, (req, res) => {
  const { newData } = req.body;

  if (!newData) {
    res.status(500).json({ error: "Bad Request - Missing required data " });
  } else {
    pool.query(
      "DELETE FROM student WHERE enrollment = ?",
      [newData.enrollment],
      (error, results) => {
        if (error) {
          res.status(500).json(error);
        }
        else if (!results && results[0]) {
          res.status(200).json(`Code is not found`);
        }
        else {
          res.status(200).json(`Successfully Updated the data`);
        }
      }
    );
  }
});
// -------------------------------Delete branch-----------------------------------------
app.post("/delete/branch", Auth1, (req, res) => {
  const { newData } = req.body;

  pool.query(
    "SELECT * FROM field WHERE branch = ? AND batch = ?",
    [newData.branch, newData.batch],
    (error, results) => {
      if (error) {
        res.status(500).json(error);
      } else {
        pool.query(
          "DELETE FROM field WHERE branch = ? AND batch = ?",
          [newData.branch, newData.batch],
          (error, results) => {
            if (error) {
              res.status(500).json(error);
            } else {
              res.status(200).json(`Successfully Deleted`);
            }
          }
        );
      }
    }
  );
});
// //--------------------------Delete subject------------------------------
app.post("/delete/subject", Auth1, (req, res) => {
  const { newData } = req.body;

  if (!newData) {
    res.status(500).json({ error: "Bad Request - Missing required data " });
  } else {
    pool.query(
      "DELETE FROM subject WHERE code = ?",
      [newData.code],
      (error, results) => {
        if (error) {
          res.status(500).json(error);
        }
        else if (!results && results[0]) {
          res.status(200).json(`Code is not found`);
        }
        else {
          res.status(200).json(`Successfully Updated the data`);
        }
      }
    );
  }
});


app.post("/analysis/subject", Auth1, (req, res) => {
  var { fromdate, branch, year, todate } = req.body;
  pool.query(`SELECT DISTINCT attendance.subject,attendance.type FROM attendance INNER JOIN student ON attendance.enrollment=student.enrollment 
  WHERE attendance.date >= "${fromdate}" And  attendance.date <= "${todate}" AND student.branch="${branch}" AND student.batchyear="${year}"`, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json("failed");
    } else {

      res.status(200).json(results);
    }
  });
});


app.post("/analysis/getalldata", Auth1, (req, res) => {
  var { fromdate, branch, year, todate } = req.body;
  pool.query(`SELECT * FROM attendance INNER JOIN student ON attendance.enrollment=student.enrollment 
  WHERE attendance.date >= "${fromdate}" And  attendance.date <= "${todate}" AND student.branch="${branch}" AND student.batchyear="${year}"`, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json("failed");
    } else {

      res.status(200).json(results);
    }
  });
});


//for teacher request
app.post("/teacher_req", Auth1, (req, res) => {
  const { email } = req.body

  query = email == 1 ? "SELECT name,role,email,contact,pass  FROM teacher_req where email=(?) or 1;" : "SELECT name,role,email,contact,pass  FROM teacher_req where email=(?) ;"
  pool.query(query, [email], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json("failed");
    } else {

      res.status(200).json(results);
    }
  });
})

//! ACCEPTED AND REJECTED THE REQUEST 
app.post('/teacher_req_decision/:id', Auth1, (req, res) => {
  const { email, name, role, contact, pass } = req.body
  id = Number(req.params.id)



  pool.query('delete from teacher_req where email=(?)', [email], (error, result) => {
    if (error) {
      console.log(error, "in decision")
      res.send("error")
    }
    else {
      if (id == 1) {
        pool.query("insert into employee (role,name,pass,email,contact,status) values(?,?,?,?,?,?)", [role, name, pass, email, contact, 1], (error, result) => {
          if (error) {
            console.log(error, "in decision in insertion")
            res.send("error")
          }
          else {


            async function send(to_mail, message, subject, email) {

              const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "jainamsanghavi008@gmail.com",
                  pass: "yadznuqzkalbilnu",
                },
              });
              const mailoptions = {
                from: "jainamsanghavi008@gmail.com",
                to: to_mail,

                html: email,
                subject: subject,
              };
              try {
                const result = await transporter.sendMail(mailoptions);
                res.send("done")
              } catch (error) {
                console.log("error in  req  ", error);
                res.send("error")

              }
            }
            text = id == 1 ? `<h3>Hello </h3> 
       
      <hr>
     Congratulation !  your request   has been accepted by Authority.  
     
      <hr>
      
     <div>For more detail you can contact to your department head
     and you can see your dashboard when you log into your account.</div>
      <hr>
     
      
     <div>Best regards.</div>
      <hr>
    
     `: `<h3>Hello </h3> 
       
     <hr>
    Sorry !  your request   has been Rejected by Authority.  
    
     <hr>
     
    <div>For more detail you can contact to your department head</div>
     <hr>
    
     
    <div>Best regards.</div>
     <hr>
    
    `;
            send(
              email,
              '',
              `Regarding ${role} Request `,
              text,
            );
          }
        })
      }
      else {

        async function send(to_mail, message, subject, email) {

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "jainamsanghavi008@gmail.com",
              pass: "yadznuqzkalbilnu",
            },
          });
          const mailoptions = {
            from: "jainamsanghavi008@gmail.com",
            to: to_mail,

            html: email,
            subject: subject,
          };
          try {
            const result = await transporter.sendMail(mailoptions);
            res.send("done")
          } catch (error) {

            console.log("error in  req  ", error);
            res.send("error")

          }
        }
        text = id == 1 ? `<h3>Hello </h3> 
   
  <hr>
 Congratulation !  your request   has been accepted by Authority.  
 
  <hr>
  
 <div>For more detail you can contact to your department head
 and you can see your dashboard when you log into your account.</div>
  <hr>
 
  
 <div>Best regards.</div>
  <hr>

 `: `<h3>Hello </h3> 
   
 <hr>
Sorry !  your request   has been Rejected by Authority.  

 <hr>
 
<div>For more detail you can contact to your department head</div>
 <hr>

 
<div>Best regards.</div>
 <hr>

`;
        send(
          email,
          '',
          `Regarding ${role}  Request `,
          text,
        );
      }
    }
  })



})

//get _batch and branch
app.get("/get_branch_batch", Auth2, (req, res) => {
  pool.query("select * from field", (error, result) => {
    if (error) {
      console.log("error in branch and batch", error)
      res.send("error")
    }
    else {
      res.send(result)
    }
  })
})


//! get teacher informations
app.get("/teacher_information", Auth2, (req, res) => {
  let id = req.session.userid
  pool.query("select name,email,contact from employee where id=(?)", [id], (error, result) => {
    if (error) {
      console.log(error, "error in teacher info")
      res.send("error")
    }
    else {
      res.send(result)
    }
  })
})
app.post("/update_teacher_info", Auth2, (req, res) => {
  let id = req.session.userid
  let { name, contact, email } = req.body
  pool.query("update employee set name=(?) , email= (?) , contact=(?) where id=(?)", [name, email, contact, id], (error, result) => {
    if (error) {
      console.log("error in update ", error)
      res.send("error")
    }
    else {
      res.send("done")
    }
  })
})

//!check email
let email_getter = {
  email: undefined,
  otp: undefined
}
app.post("/email_check", (req, res) => {
  let { email, role } = req.body


  pool.query("select * from employee where email=(?) and role=(?) ", [email, role], (error, result) => {
    if (error) {
      console.log("error in email check", error)
      res.send("error")
    }
    else {
      if (result.length == 0) {
        res.send("0")
      }
      else {
        email_getter.email = email
        res.send("1")
      }
    }
  })

})


//!geting get otp html
app.get("/get_otp", (req, res) => {
  if (email_getter.email == undefined) {
    res.redirect("/503")
  }
  res.sendFile(__dirname + "/public/Pages/get_otp.html");
})
//!geting get password html
app.get("/set_new_pass", (req, res) => {
  if (email_getter.email == undefined) {
    res.redirect("/503")
  }
  res.sendFile(__dirname + "/public/Pages/set_new_pass.html");
})


app.get("/get_otp_resend", (req, res) => {
  if (email_getter.email == undefined) {
    res.redirect("/503")
  }
  let otp_text = "";
  function generateOTP(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      otp += charset[randomIndex];
    }
    return otp;

  }
  const otpLength = 6; // Specify the length of OTP you want
  const generatedOTP = generateOTP(otpLength);
  async function send(to_mail, message, subject, email) {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jainamsanghavi008@gmail.com",
        pass: "yadznuqzkalbilnu",
      },
    });
    const mailoptions = {
      from: "jainamsanghavi008@gmail.com",
      to: to_mail,

      html: email,
      subject: subject,
    };
    try {
      const result = await transporter.sendMail(mailoptions);
      email_getter.otp = generatedOTP
      res.send("1")
    } catch (error) {

      console.log("error in  req  ", error);
      res.send("error")

    }
  }

  send(
    email_getter.email,
    '',
    'Resend OTP',
    generatedOTP,
  );
})
app.post("/verify_otp", (req, res) => {
  let { otp } = req.body
  if (otp == email_getter.otp) {
    res.send("1")
  }
  else {
    res.send("0")
  }
})


//!upDATE NEW password
app.post("/update_pass", (req, res) => {
  if (email_getter.email == undefined) {
    res.send("/503")
  }
  let { password } = req.body
  pool.query("update attendance_management.employee set pass=(?) where email=(?)", [password, email_getter.email], (error, result) => {
    if (error) {
      console.log(error, "error in set new pass")
      res.send("0")
    }
    else {
      async function send(to_mail, message, subject, email) {

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "jainamsanghavi008@gmail.com",
            pass: "yadznuqzkalbilnu",
          },
        });
        const mailoptions = {
          from: "jainamsanghavi008@gmail.com",
          to: to_mail,

          html: email,
          subject: subject,
        };
        try {
          const result = await transporter.sendMail(mailoptions);
          res.send("1")
        } catch (error) {

          console.log("error in  req  ", error);
          res.send("error")

        }
      }

      send(
        email_getter.email,
        '',
        'Password changes',
        "Your password changed successfully.",
      );

    }
  })


})

// getting subjects
app.get("/get_subjects", (req, res) => {
  pool.query("select * from subject", (error, result) => {
    if (error) {
      console.log(error, "error in get subjects")
      res.send(-1)

    }
    else if (result.length == 0) {
      res.send(-1)
    }
    else {
      res.send(result)
    }
  })
})

//getting teachers

app.get("/get_teachers", (req, res) => {
  pool.query("select id,email,name from employee where role='Teacher' and status='1'", (error, result) => {
    if (error) {
      console.log(error, "error in get teachers")
      res.send(-1)

    }
    else if (result.length == 0) {
      res.send(-1)
    }
    else {
      res.send(result)
    }
  })
})

//assign subject

app.post("/assign_teacher_subject", (req, res) => {
  let { id, email, subject, code, type } = req.body
  pool.query("insert into teaching values(?,?,?)", [id, code, type], (error, result) => {
    if (error) {
      console.log(error, "error in get teachers")
      res.status(500).json("-1")
    }
    else {
      async function send(to_mail, message, subject, email) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "jainamsanghavi008@gmail.com",
            pass: "yadznuqzkalbilnu",
          },
        });
        const mailoptions = {
          from: "jainamsanghavi008@gmail.com",
          to: to_mail,

          html: email,
          subject: subject,
        };
        try {
          const result = await transporter.sendMail(mailoptions);
          res.send("done")
        } catch (error) {

          console.log("error in  req  ", error);
          res.send("error")

        }
      }
      text = `<h3>Hello </h3> 
       
      <hr>
     New Subject:${subject}  is assigned to you by authority.
     
      <hr>
      
     <div>We hope You  will perform your duty honestly .</div>
      <hr>
     
      
     <div>Thank you.</div>
      <hr>
    
     
       
    `;
      send(
        email,
        '',
        `Regarding Subject assign   `,
        text,
      );
    }
  })
})

app.post(`/getperiods/ondate`, Auth2, (req, res) => {
  var { date } = req.body;
  if (date && date != "") {
    pool.query(`SELECT distinct periodno from attendance where date="${date}" and teacher_id=${req.session.userid}`, (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json("failed");
      } else {
        res.status(200).json(results);
      }
    })
  }
})

//!Remove time_table detail 
app.post("/remove_timetable_period",(req,res)=>{
  
  let {branch,batch,sem,type,period_no,day,subject}=req.body

  
  pool.query("delete from teacher_timetable where batch=(?) and branch=(?) and sem=(?) and type=(?) and period_no=(?) and day=(?) and subject=(?)",[batch,branch,sem,type,period_no,day,subject],(error,result)=>{
    if(error){
      res.sendStatus(503)
    }
    else{
      res.sendStatus(200)
    }
  })

})

// !send mail to all students
app.post("/send_all_emails",(req,res)=>{
  console.log(req.body)
  let {message,sub,emails}=req.body
  let check_error=false
  let index=0
  async function send(to_mail, message, subject, email) {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jainamsanghavi008@gmail.com",
        pass: "yadznuqzkalbilnu",
      },
      pool:true,
    });
    const mailoptions = {
      from: "jainamsanghavi008@gmail.com",
      to: to_mail,

      html: email,
      subject: subject,
    };
    try {
      const result = await transporter.sendMail(mailoptions);
    console.log("helo")
    return 1
   
    } catch (error) {
      console.log("error in  req  ", error);
      // res.status(200).send(`error at ${index}`)
      return 0
    }
  }
  async function send_mail(){

    for (index = 0; index < emails.length; index++) {
      
      let flag=await send(
        emails[index],
        '',
        sub,
        message,
        );
        // console.log(flag)
        if(flag==0){
          throw new SyntaxError('This is a syntax error');
          break
        }
      }

      return 1
    }
let j= send_mail()
 j.then(()=>{
   
    res.status(200).send("1")
  
 }).catch(()=>{
  res.status(200).send("Network Error")
  console.log("error")
 })
})
//404
app.all('*', (req, res) => {
  res.sendFile(__dirname + "/public/Pages/Error/404.html");
});
//PORT
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server started on ${PORT} `);
});



