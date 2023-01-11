var express = require('express');
const sqlite3 = require("sqlite3");
var router = express.Router();
var uuid = require('uuid');

router.get('/login', function (req, res, next) {
    res.render('login');

});

router.get('/register', function (req, res, next) {
    res.render('register');

});

router.post('/login', (req, res) => {

    let user_name = req.body.login;
    let user_password = req.body.password;

    var db = new sqlite3.Database('notes.db');
    let query = `SELECT Id, Password from Users WHERE Login="${user_name}"`;
    db.all(query, (err, rows) => {
        if (rows.length == 1) {
            if (rows[0].Password == user_password) {
                // poprawne logowanie
                const user_id = rows[0].Id;

                const session_id = uuid.v4();

                var date = new Date();
                date.setTime(Date.now() + 1000 * 1200);

                res.cookie("session", session_id,
                    {
                        secure: false,
                        httpOnly: false,
                        sameSite: false,
                        path: '/',
                        expires: date
                    });

                let query = `INSERT INTO Sessions (UUID, UserId, Validity) VALUES ("${session_id}", "${user_id}", "${date.toString()}")`;
                db.run(query);

                res.redirect('/notes');
            }
        } else {
            req.status = 403;
            res.send("Failed login.");
        }
    });

});


router.post('/register', (req, res) => {

    let user_name = req.body.login;
    let user_password = req.body.password;

    var db = new sqlite3.Database('notes.db');
    let query = `SELECT SUM(Id) FROM Users`;
    let num;

    db.all(query, (err, rows) => {
        num = rows[0]['SUM(Id)'] + 1;

        let query_register = `INSERT INTO Users(Id, Login, Password) VALUES (${num}, "${user_name}", "${user_password}")`;
        db.run(query_register);

        const session_id = uuid.v4();

        var date = new Date();
        date.setTime(Date.now() + 1000 * 1200);

        res.cookie("session", session_id,
            {
                secure: false,
                httpOnly: false,
                sameSite: false,
                path: '/',
                expires: date
            });

        let query = `INSERT INTO Sessions (UUID, UserId, Validity) VALUES ("${session_id}", "${num}", "${date.toString()}")`;
        db.run(query);

        res.redirect('/notes');
    });


});

module.exports = router;
