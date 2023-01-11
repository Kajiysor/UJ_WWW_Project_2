var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3')

router.get('/', function(req, res, next) {

    if(req.authorized){

        var db = new sqlite3.Database('notes.db');
        let query = `SELECT Login FROM Users WHERE Id=${req.user_id}`;
        db.all(query, (err, rows) => {
            const user_login = rows[0].Login;
            
            let notes_query = `SELECT Title, Text, Tags FROM Notes WHERE "User ID"=${req.user_id}`;
            db.all(notes_query, (err, data) => {
                res.render('notes_list', {user: user_login, data: data});
            });
        });

    }else{
        req.status = 403;
        res.redirect('/users/login');
    }
});

router.get('/create', (req, res) => {
    res.render('create_note', {});
});

router.post('/create', (req, res) => {

    if (req.authorized) {
        var db = new sqlite3.Database('notes.db');

        let note_title = req.body.title;
        let note_text = req.body.text;
        let note_tags = req.body.tags;

        let query = `INSERT INTO Notes(Title, Text, Tags, "User ID") VALUES("${note_title}", "${note_text}", "${note_tags}", "${req.user_id}")`;

        db.run(query);

        res.redirect('/notes');
    }else{
        req.status = 403;
        res.redirect('/users/login');
    }
});

router.get('/delete:title', (req, res) => {

    if (req.authorized) {
        var db = new sqlite3.Database('notes.db');
        let query = `DELETE FROM Notes WHERE Title="${req.params.title}" AND "User ID"=${req.user_id};`;
        db.run(query);

        res.redirect('/notes');
    } else {
        req.status = 403;
        res.redirect('/users/login');
    }
});

router.get('/update:title', (req, res) => {
    if (req.authorized) {

        var db = new sqlite3.Database('notes.db');
        let notes_query = `SELECT Title, Text, Tags FROM Notes WHERE Title="${req.params.title}" AND "User ID"=${req.user_id}`;
        db.all(notes_query, (err, data) => {
            if (data.length >= 1) {
                res.render('update_note', { row: data[0] });
            } else {
                res.redirect('/notes')
            }
        });
    } else {
        req.status = 403;
        res.redirect('/users/login');
    }
});

router.post('/update:title', (req, res) => {
    
    if (req.authorized) {
        var db = new sqlite3.Database('notes.db');
        
        let new_title = req.body.title;
        let new_text = req.body.text;
        let new_tag = req.body.tags;

        let notes_query = `SELECT Title, Text, Tags FROM Notes WHERE Title="${req.params.title}" AND "User ID"=${req.user_id}`;
        db.all(notes_query, (err, data) => {
            if (data.length >= 1) {
                if (new_title.length == 0) {
                    new_title = data[0].Title;
                }
                if (new_text.length == 0) {
                    new_text = data[0].Text;
                }
        
                if (new_tag.length == 0) {
                    new_tag = data[0].Tags;
                }
        
                let update_query = `UPDATE Notes SET Title = "${new_title}", Text = "${new_text}", Tags = "${new_tag}" WHERE "User ID"=${req.user_id} AND Title="${req.params.title}";`;
                db.run(update_query);
        
                res.redirect('/notes');
            }
        });

    } else { 
        req.status = 403;
        res.redirect('/users/login');
    }
});




module.exports = router;
