require('dotenv').config();
const express = require("express");
const path = require('path');
const hbs = require("hbs");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");      //is a middleware which parses cookies attached to the client request object.


require("./db/conn");
const User = require("./model/user");
const AddUser = require("./model/adduser");
const auth = require("./middleware/auth");

const app = express();

const port = process.env.PORT || 8080;

//path
const staticPath = path.join(__dirname, "../public");
const templatesPath = path.join(__dirname, "./templates/views");
const partialsPath = path.join(__dirname, "./templates/partials");

//bootstrap setup
app.use('/css', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname, "../node_modules/jquery/dist")));

//static path
app.use(express.static(staticPath));


//set view engine
app.set("view engine", "hbs");
app.set("views", templatesPath);
hbs.registerPartials(partialsPath);

//middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));


// //routes

app.get("/", auth, (req, res) => {
    res.render("index");
});

//register route

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        password = req.body.password;
        cpassword = req.body.cpassword;
        if (password === cpassword) {
            const userData = new User({

                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                password: password,
                cpassword: cpassword
            });

            // console.log("the success part" + userData);
            const token = await userData.generateAuthToken();
            // console.log("the token part" + token);

            // cookies
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000000),
                httpOnly: true
            });

            const result = await userData.save();
            // console.log(result);
            res.status(201).render('index')
        } else {
            res.status(401).send('passwords are not matching')
        }

    } catch (e) {
        res.status(500).send(e);
    }
})

//login route
app.get("/login", (req, res) => {
    res.render("login");
});

app.post('/login', async (req, res) => {
    try {

        uEmail = req.body.email;
        uPassword = req.body.password;

        const userData = await User.findOne({ email: uEmail });
        const isMatch = await bcrypt.compare(uPassword, userData.password);


        const token = await userData.generateAuthToken();
        // console.log("the token part " + token);

        // cookies
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 11100000),
            httpOnly: true,
            // secure:true
        });


        if (isMatch) {
            res.status(201).render("index");
        }
        else {
            res.status(400).send('<h1> Invalid login details. </h1>');
        }
    } catch (e) {
        res.status(500).send('<h1> Please fill valid login details. </h1>');
    }
});


//logout 

app.get("/logout/", auth, async (req, res) => {

    try {
        // console.log(req.user);         //returns user's  details // req.user it comes from auth page

        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("logout successfully");

        await req.user.save();
        res.render("login");

    } catch (error) {
        res.status(500).send(error);
    }

});


//add user route
app.get("/adduser", auth, (req, res) => {
    res.render("add-user");
});


app.post("/adduser", async (req, res) => {
    try {

        const userData = new AddUser({

            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            comments: req.body.comments,
        });
        const result = await userData.save();
        console.log(result);
        res.status(201).render('add-user', { alert: 'User added successfully' })


    } catch (e) {
        res.status(500).send(e);
    }
})


//view individual user 

app.get("/viewuser/:id", auth, async (req, res) => {
    try {
        _id = req.params.id;
        const result = await AddUser.findById(_id,
            (err, rows) => {
                if (!err) {
                    res.render('view-user', { rows });
                } else {
                    console.log(err);
                }
                // console.log('The data from user table: \n', rows);
            });


    } catch (e) {
        console.log(e);
    }
});

//view all the users

app.get("/viewall", auth, async (req, res) => {
    try {
        const result = await AddUser.find(
            (err, rows) => {
                if (!err) {
                    res.render('index', { rows });
                } else {
                    console.log(err);
                }
                // console.log('The data from user table: \n', rows);
            });


    } catch (e) {
        console.log(e);
    }
});


//edit user


app.get("/edituser/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const updateUser = await AddUser.findById(_id,
            (err, rows) => {
                if (!err) {
                    res.status(200).render('edit-user', { rows });
                } else {
                    console.log(err);
                }
                // console.log('The data from user table: \n', rows);
            });
    } catch (e) {
        res.status(404).send(e);
    }

});

//update user

app.post("/edituser/:id", auth, async (req, res) => {
    try {
        const { firstname, lastname, email, phone, comments } = req.body;


        const _id = req.params.id;
        const updateUser = await AddUser.findByIdAndUpdate(_id, req.body, {
            new: true,
        },
            (err, rows) => {
                if (!err) {
                    res.status(200).render('edit-user', { rows, alert: `${firstname} has been updated.` });
                } else {
                    console.log(err);
                }
                // console.log('The data from user table: \n', rows);
            });

    } catch (e) {
        res.status(404).send(e);
    }

});

// delete User
app.get("/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const updateUser = await AddUser.findByIdAndDelete(_id,
            (err, rows) => {
                if (!err) {
                    res.render('index', { alert: `${_id} has been removed` });
                } else {
                    console.log(err);
                }
                // console.log('The data from user table: \n', rows);
            });
    } catch (e) {
        res.status(404).send(e);
    }

});



//error route
// app.get("/*", (req, res) => {
//     res.render("404", {
//         errorMsg: 'Opps! Page Not Found'
//     });
// });


//server listen
app.listen(port, () => console.log(`connection at ${8080}`));