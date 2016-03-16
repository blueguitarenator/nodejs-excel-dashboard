var express = require('express');
var router = express.Router();

var db = null;

/*
 * POST search athlete with email
 */
router.post('/search', function (req, res) {
    db = req.db;
    var email = req.body.email;
    var sql = 'SELECT * FROM Athletes WHERE email = ?';
    sql = db.format(sql, email);
    var query = db.query(sql, function (err, rows) {
        if (err) throw err;
        res.json(rows);
    });
    console.log(query.sql);
});

/*
 * GET athlete's sessions
 */
router.get('/sessionsbydate/:bydate', function(req, res) {
    db = req.db;
    var date = req.params.bydate;
    console.log(date);
    var sql = "SELECT hour, fullname FROM Sessions s join AthleteSession ss ON s.id=ss.sessionId JOIN Athletes a ON ss.athleteId=a.id WHERE s.datetime = ? ORDER BY hour;";
    sql = db.format(sql, date);
    db.query(sql, function (err, rows) {
        if (err) throw err;
        console.log(rows);
        res.json(rows);
    });
});

/*
 * GET athlete's sessions
 */
router.get('/sessions/:id', function (req, res) {
    db = req.db;
    var athleteId = req.params.id;
    var sql = 'SELECT datetime, hour FROM Sessions s JOIN AthleteSession ss ON s.id=ss.sessionId JOIN Athletes a ON ss.athleteId=a.id WHERE a.id=' + athleteId;
    db.query(sql, function (err, rows) {
        if (err) throw err;
        console.log(rows);
        res.json(rows);
    });
});

function getSessionId(date, hour, callback) {
    db.query('SELECT * FROM Sessions WHERE datetime between ? and ? and hour=?', [date, date, hour], function (err, rows) {
        if (err) throw err;
        if (rows.length === 1) {
            callback(null, rows[0].id);
        } else {
            callback(null, null);
        }
    });
}

function insertSession(date, hr, callback) {
    var post = {datetime: date, hour: hr};
    var sql = "INSERT INTO Sessions SET ?";
    sql = db.format(sql, post);
    db.query(sql, function(err, result) {
        if (err) throw err;
        callback(null, result);
    });
}

function insertAthleteSession(sid, aid, callback) {
    var post = { sessionId: sid, athleteId: aid };
    var sql = 'INSERT INTO AthleteSession SET ?';
    sql = db.format(sql, post);
    db.query(sql, function(err) {
        callback(err);
    });
}

router.post('/athletesession', function (req, res) {
    db = req.db;
    var sessionDate = req.body.date;
    var sessionHour = req.body.hour;
    var athleteId = req.body.athleteId;

    getSessionId(sessionDate, sessionHour, function(err, id) {
        if (err) throw err;
        if (id === null) {
            insertSession(sessionDate, sessionHour, function(err1, result) {
                if (err1) throw err;
                insertAthleteSession(result.insertId, athleteId, function (err2) {
                    res.send(
                        (err2 === null) ? { msg: '' } : { msg: err2 }
                    );
                });
            });
        } else {
            insertAthleteSession(id, athleteId, function (err1) {
                res.send(
                    (err1 === null) ? { msg: '' } : { msg: err1 }
                );
            });
        }
    });
});

module.exports = router;
