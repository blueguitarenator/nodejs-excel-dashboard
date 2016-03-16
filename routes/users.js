var express = require('express');
var router = express.Router();


/*
 * POST search athlete with email
 */
router.post('/search', function (req, res) {
    var db = req.db;
    console.log(req.body.email);
    var strQuery = 'SELECT * FROM Athletes where email="' + req.body.email + '"';
    console.log(strQuery);
    var query = db.query(strQuery, function (err, rows) {
        if (err) {
            throw err;
        } else {
            console.log(rows);
            res.json(rows);
        }
    });
    console.log(query.sql);
});

/*
 * GET athlete's sessions
 */
router.get('/sessions/:id', function (req, res) {
    console.log("YAHOOOOOO");
    var db = req.db;
    var athleteId = req.params.id;
    var strQuery = 'SELECT datetime, hour FROM Sessions s join AthleteSession ss ON s.id=ss.sessionId JOIN Athletes a ON ss.athleteId=a.id WHERE a.id=' + athleteId;
    db.query(strQuery, function (err, rows) {
        if (err) {
            throw err;
        } else {
            console.log(rows);
            res.json(rows);
        }
    });
});

router.post('/athletesession', function (req, res) {
    var db = req.db;
    var sessionDate = req.body.date;
    var sessionHour = req.body.hour;
    var athleteId = req.body.athleteId;
    var sessionId = -1;
    db.query('select * from Sessions where datetime between ? and ? and hour=?', [sessionDate, sessionDate, sessionHour], function (err, rows) {
        if (err) throw err;
        console.log("No error getting session");
        if (rows.length === 0) {
            // session does not exist yet.  Create it.
            console.log("Session did not exist yet");
            db.query('insert into Sessions (datetime, hour) values (?, ?)', [sessionDate, sessionHour], function (err, result) {
                if (err) throw err;
                console.log("No error inserting the new session");
                sessionId = getSessionId(db, sessionDate, sessionHour);
                console.log(sessionId);
            });
        } else {
            // session already existed
            console.log("This session already existed");
            sessionId = rows[0].id;
        }
        console.log("ath: " + athleteId);
        console.log("ses: " + sessionId);
        db.query('INSERT INTO AthleteSession (athleteId, sessionId) VALUES (?, ?)', [athleteId, sessionId], function (err, result) {
            if (err) {
                console.log("There was an error inserting athleteSession");
            } else {
                console.log("No error insert AS");
            }
            res.send(
                (err === null) ? { msg: '' } : { msg: err }
            );

        });
    });
});

//var insertAthlete = function insertAthleteSession(req, res) {
//    var db = req.db;
//    db.query('INSERT INTO AthleteSession (athleteId, sessionId) VALUES (?, ?)', [req.body.athleteId, req.sessionId], function (err, result) {
//        if (err) {
//            throw err;
//        }
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//}
//
//var getSession = function getSession(req, res, next) {
//    var db = req.db;
//    console.log("SHIT: " + date + " " + hour + " " + id);
//    db.query('select * from Sessions where datetime between ? and ? and hour=?', [sessionDate, sessionDate, sessionHour], function (err, rows) {
//        console.log("Dinner");
//        if (err) {
//            console.log("select session err");
//            throw err;
//        }
//        else {
//            console.log("Did not error");
//            if (rows.length === 0) {
//                console.log("No session found. insert new session");
//                db.query('insert into Sessions (datetime, hour) values (?, ?)', [sessionDate, sessionHour], function (err, result) {
//                    if (err) throw err;
//                    req.sessionId = result.id;
//                });
//            } else {
//                console.log("Session exists. Callback with row: " + rows[0].id);
//                req.sessionId = rows[0].id;
//            }
//        }
//    });
//    next();
//}
/*
 * POST athlete's session choice
 */
//router.post('/athletesession', [getSession, insertAthlete]);
// function(req, res, next) {
//    var db = req.db;
//    var sessionDate = req.body.date;
//    var sessionHour = req.body.hour;
//    var athleteId = req.body.athleteId;
//    var sessionId = -1;
//
//    getSession(db, sessionDate, sessionHour, athleteId, function(err, sessionId) {
//        if (err) {
//            // error handling code goes here
//            console.log("ERROR : ",err);
//        } else {
//            // code to execute on data retrieval
//            console.log("result from db is : ",sessionId);
//            insertAthleteSession(db, athleteId, sessionId, function(err, data) {
//                res.send(
//                    (err === null) ? { msg: '' } : { msg: err }
//                );
//            });
//        }
//    });
//});



function getSessionId(db, date, hour) {
    db.query('select * from Sessions where datetime between ? and ? and hour=?', [date, date, hour], function(err, rows) {
        return rows[0].id;
    });
};

module.exports = router;
