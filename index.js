const express = require("express");
const app = express();
const port = 3000;
const methodOverride = require('method-override');
const path = require("path");
const mysql = require('mysql2');
const multer = require('multer');


app.set("views engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); 
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'projectGroup',
    password: "password",
});
// check connection
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:');
        return;
    }
    console.log('Connected to the database.');
});

app.listen(port, () => { 
    console.log("app is listening proceed");
})
app.get("/about", (req, res) => {
    res.render("about.ejs");
});
app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});
app.get("/", (req, res) => {
    res.render("home.ejs");
});
app.get("/signup", (req, res) => {
    res.render("signupPage.ejs");
});
app.get("/login", (req, res) => {
    res.render("loginPage.ejs");
});
// get the log in form details
app.post("/login", async (req, res) => {
    let { username, email, password } = req.body;
    // const hashedPassword = await bcrypt.hash(password, saltRounds);
    let q = "SELECT * FROM users WHERE (username = ? AND email = ?) AND password = ?";
    try {
        connection.query(q, [username, email, password], (err, result) => {
            if (err) {
                console.error('Error querying database:', err);
                return res.status(500).send('Error logging in.');
            }
            if (result.length === 0) {
                return res.status(404).send('No user found.');
            }
            const data = result[0];
            
            res.redirect(`/group/${result[0].id}`);
        })
    } catch (error) {
        console.log(error);
    }
});
// response from signup 
app.post("/signup", async (req, res) => {
    
    let { username, email, password } = req.body;
    // const hashedPassword = await bcrypt.hash(password, saltRounds);
    let q = "INSERT INTO users (username, email, password) VALUES (?, ?, ?);";
    try {
        connection.query(q, [username, email, password], (err, result) => {
            if (err) throw err;
            res.redirect("/login");
        })
    } catch (error) {
        console.log(error);
    }
});
// group page 
app.get("/group/:userid", (req, res) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'projectGroup',
        password: "password",
    });
    const userid = req.params.userid;
    let q = "SELECT * FROM `groups` WHERE id IN (SELECT group_id FROM user_groups WHERE user_id = ?)";
    try {
        connection.query(q, [userid], (err, result) => {
            if (err) throw err;
            
            res.render("group.ejs", { group: result, userid });
        });
    } catch (error) {
        console.log(error);
    }
});
// create group
app.get("/group/:id/create", (req, res) => {
    let userid = req.params.id;
    res.render("groupform.ejs", { userid });
});
// getting group form response 
app.post("/group/create", (req, res) => {
    let { groupname, description, userid } = req.body;
    
    let q = "INSERT INTO `groups` (name,description) VALUES (?,?);";
    try {
        connection.query(q, [groupname, description], (err, result) => {
            if (err) {
                console.error('Error inserting into groups table:', err);
                return res.status(500).send('Error adding group.');
            }
            const groupid = result.insertId;
            let q2 = "INSERT INTO user_groups (user_id, group_id) VALUES (?, ?);";
            connection.query(q2, [userid, groupid], (err) => {
                if (err) {
                    console.error('Error linking group to user:', err);
                    return res.status(500).send('Error adding group.');
                }
                console.log('Group created and linked to user successfully.');
                res.redirect(`/group/${userid}`);
            });
        });
    } catch (error) {
        console.log(error);
    }
});
// add to existing group
app.get("/group/:id/add", (req, res) => {
    const userid = req.params.id;
    res.render("existinggroup.ejs", { userid });
});
// getting add new group response
app.post("/group/add", (req, res) => {
    let { groupname, groupid, userid } = req.body;
    let q1 = "SELECT * FROM `groups` where id = ? AND name = ?;";
    try {
        connection.query(q1, [groupid, groupname], (err, result) => {
            if (err) {
                console.error('Error checking group existence:', err);
                return res.status(500).send('Error checking group existence.');
            }
            if (result.length === 0) {
                console.log("No group exists with the provided ID and name.");
                return res.status(404).send("No group exists with the provided ID and name.");
            }
            let q2 = "SELECT * FROM user_groups WHERE user_id = ? AND group_id = ?";
            connection.query(q2, [userid, groupid], (err, result) => {
                if (err) {
                    console.error('Error checking user-group association:', err);
                    return res.status(500).send('Error checking user-group association.');
                }

                if (result.length > 0) {
                    console.log("User is already in the specified group.");
                    return res.status(400).send("User is already in the specified group.");
                }
                let q3 = "INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)";
                connection.query(q3, [userid, groupid], (err, result) => {
                    if (err) {
                        console.error('Error adding user to group:', err);
                        return res.status(500).send('Error adding user to group.');
                    }
                    console.log('User added to group successfully.');
                    res.redirect(`/group/${userid}`);
                });
            });
        });
    } catch (error) {
        console.log(error);
    }
});

// click on group and get photos
app.get("/group/:userid/:groupid/photo", (req, res) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'projectGroup',
        password: 'password',
    });
    let userid = req.params.userid;
    let groupid = req.params.groupid;
    let q = "SELECT * FROM photos WHERE group_id = ?;";
    try {
        connection.query(q, [groupid], (error, photoResult) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error retrieving photos.');
            }
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                database: 'projectGroup',
                password: 'password',
            });
            let q2 = "SELECT * FROM users WHERE id IN (SELECT user_id FROM user_groups WHERE group_id = ?);";
            connection.query(q2, [groupid], (err, membersResult) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error retrieving group members.');
                }
                res.render("groupPhotos.ejs", { photos: photoResult, groupid, members: membersResult,userid});
            });
        });
    } catch (error) {
        console.log(error);
    }
    connection.end();
});
app.post('/upload-photos', upload.array('photos', 10), (req, res) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'projectGroup',
        password: "password",
    });
    const group_id = req.body.group_id;
    const user_id = req.body.user_id;
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).send('No files uploaded');
    }
    const insertPromises = [];
    files.forEach(file => {
        const image = file.buffer;
        const q = "INSERT INTO photos (group_id, image_blob,user_id) VALUES (?,?,?)";
        const promise = new Promise((resolve, reject) => {
            connection.query(q, [group_id, image,user_id], (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(`File uploaded successfully: ${file.originalname}`);
                    resolve(result);
                }
            });
        });
        insertPromises.push(promise);
    });

    Promise.all(insertPromises)
        .then(() => {
            res.redirect(`/group/${user_id}/${group_id}/photo`);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        })
        .finally(() => {
            connection.end();
        });
});

app.post("/:userid/:groupid/leave", (req, res) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'projectGroup',
        password: "password",
    });
    let userid = req.body.userid;
    let groupid = req.body.groupid;
    let q = "DELETE FROM user_groups WHERE user_id = ? AND group_id = ?;";
    try {
        connection.query(q, [userid, groupid], (err, result) => {
            if (err) throw err;
            res.redirect(`/group/${userid}`);
        })
    } catch (error) {x
        console.log(error);
    }
    connection.end();
});
