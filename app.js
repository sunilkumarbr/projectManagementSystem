/***********************node modules************************/
var express = require('express')
var bodyparser = require('body-parser');
var mongo = require('mongodb');
var emailExistence = require('email-existence');
var randToken = require('rand-token');
var nodemailer = require('nodemailer');
var session = require('express-session');
var ejs = require('ejs');

var app = express();

var collection; //db collection holder

/***********************middlewares************************/
app.use(express.static('views'));
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(session({
    secret: 'assignment9'
}));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

/***********************email configuration************************/
var transporter = nodemailer.createTransport('SMTP', {
    service: 'gmail',
    auth: {
        user: 'no.replay.assignment9@gmail.com',
        pass: 'assignment9'
    }
});

/***********************connection to mongodb************************/
var db;

var mongoClient = mongo.MongoClient;
mongo.connect("mongodb://projectManagemant:sunil@ds056698.mongolab.com:56698/projectmanagement", function(error, r) {
    if (error)
        throw error;
    else {
        console.log("Connected to db");
        db = r;

        collection = db.collection('user');
    }
})



var sess; //session variable

/*check whether the user have already logged in if so redirect them to dashboard else ask them to login*/
app.get('/', function(req, res) {
    sess = req.session;
    if (sess.user) {
        res.redirect('/u/0/dashboard');
    } else {
        res.render('index');
    }
});

/***********************display dashbord to the logged in user************************/
app.get('/u/0/dashboard', loaduser, function(req, res) {
    sess = req.session;
    personal = db.collection(sess.user);
    pRecord = personal.find();
    pRecord.toArray(function(e, r) {
        if (e)
            console.log('personol find err:', e);
        else {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('welcome', {
                username: sess.user,
                record: r
            });
        }
    });

});



function loaduser(req, res, next) {

    sess = req.session;
    if (sess.user) {
        next();
    } else {
        res.redirect('/');
    }
}

/***********************signup, for the new user************************/
app.post('/signup', function(req, res) {
    collection.count({
        email: req.body.email
    }, function(e, c) {
        if (e) throw e;
        else if (c === 1)
            res.send({
                status: 0,
                result: 'You are already registered'
            });
        else {
            emailExistence.check(req.body.email, function(err, r) {
                if (err || r === false)
                    res.send({
                        status: -1,
                        result: 'invalid email-id, please make sure that you have entered mail-id that exist'
                    });
                else {
                    if (r === true) {
                        var token = randToken.generate(50);
                        collection.insert({
                            email: req.body.email,
                            password: req.body.password,
                            authentication: {
                                token: token,
                                activate: false
                            }
                        });

                        var mailOption = {
                            to: req.body.email,
                            subject: 'email-verification',
                            generateTextFromHTML: true,
                            html: '<h3>Thankyou for registering, Complete Your Activation to Get Started....<br/>click the below link to confirm email-id</h3><p><a href="http://localhost:3232/confirm/' + token + '">http://localhost:3232/confirm/' + token + '</a>'
                        };
                        transporter.sendMail(mailOption, function(e, r) {
                            if (e)
                                console.log('send err:' + e);
                            else
                                console.log('sent:', r);
                        });


                        res.send({
                            status: 1,
                            result: 'signed-up successfully, check your mail in-box to confirm the mail-id'
                        });
                    }
                }
            });
        }
    });
});

/***********************email confirmation************************/
app.get('/confirm/:token', function(req, res) {
    c = collection.find({
        'authentication.token': req.params.token
    });
    c.toArray(function(e, record) {
        if (e)
            console.log(e);
        else {
            if (record[0] === undefined)
                res.send('<body style="text-align:center;background:#C5C1AA;"><h3>Unable to confirm now, This link might be used already (OR) The user may not exist</h3><a href="/">signup again</a></body>');
            else {

                collection.update({
                    'authentication.token': req.params.token
                }, {
                    $set: {
                        'authentication.token': null,
                        'authentication.activate': true
                    }
                });
                res.send('<body style="text-align:center;background:#C5E3BF;"><h3>You have been successfully registered<br/>Thankyou for confirming, you can now login with your user details</h3><a href="/">login</a></body>');
            }
        }
    });
});

/***********************validate user before logging in************************/
app.post('/login', function(req, res) {
    col = collection.find({
        email: req.body.email
    });
    col.toArray(function(e, record) {
        if (e)
            console.log(e);
        else {
            if (record[0] === undefined)
                res.send({
                    status: -1,
                    result: 'user not exist, Please signup if do not have user account'
                });
            else {
                if (record[0].authentication.activate === false)
                    res.send({
                        status: 0,
                        result: 'please activate your account by confirming your mail-id..go to mail inbox'
                    });
                else if (record[0].password === req.body.password) {
                    sess = req.session;
                    sess.user = req.body.email;
                    res.send({
                        status: 1,
                        result: 'user exist'
                    });
                } else
                    res.send({
                        status: -1,
                        result: 'password is not correct'
                    });

            }
        }
    });
});

/***********************logout and destroy the session************************/
app.get('/logout', function(req, res) {

    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });

});

/***********************adding new project to table************************/
app.post('/add', function(req, res) {
    sess = req.session;
    personal = db.collection(sess.user);
    personal.insert({
        email: sess.user,
        name: req.body.name,
        description: req.body.description,
        sDate: req.body.sDate,
        dDate: req.body.dDate
    });
    pRecord = personal.find();
    pRecord.toArray(function(e, r) {
        if (e)
            console.log('personol find err:', e);
        else {
            res.send(r);
        }
    });

});

/***********************delete************************/
app.post('/delete', function(req, res) {
    sess = req.session;
    personal = db.collection(sess.user);
    personal.remove({
        _id: new mongo.ObjectID(req.body.id)
    }, 1);

    pRecord = personal.find();
    pRecord.toArray(function(e, r) {
        if (e)
            console.log('personol find err:', e);
        else {
            res.send(r);
        }
    });

});

/***********************updating the edited values************************/
app.post('/edit', function(req, res) {
    sess = req.session;
    personal = db.collection(sess.user);
    personal.update({
        _id: new mongo.ObjectID(req.body.id)
    }, {
        $set: {
            email: sess.user,
            name: req.body.name,
            description: req.body.description,
            sDate: req.body.sDate,
            dDate: req.body.dDate
        }
    });
    pRecord = personal.find();
    pRecord.toArray(function(e, r) {
        if (e)
            console.log('personol find err:', e);
        else {
            res.send(r);
        }
    });
});

/***********************resending activation link again************************/
app.post('/verifictionLinkResend', function(req, res) {
    personal = db.collection('user');
    pRecord = personal.find({
        email: req.body.email
    });
    pRecord.toArray(function(e, r) {
        if (e)
            console.log('personol find err:', e);
        else {
            if (r[0] === undefined)
                res.send({
                    status: 0,
                    result: 'invalid email address, signup up if you dont have account'
                });
            else {
                var mailOption = {
                    to: req.body.email,
                    subject: 'email-verification',
                    generateTextFromHTML: true,
                    html: '<h3>Thankyou for registering, Complete Your Activation to Get Started....<br/>click the below link to confirm email-id</h3><p><a href="http://localhost:3232/confirm/' + r[0].authentication.token + '">http://localhost:3232/confirm/' + r[0].authentication.token + '</a>'
                };
                transporter.sendMail(mailOption, function(e, r) {
                    if (e)
                        console.log('send err:' + e);
                    else
                        console.log('sent:', r);
                });
                res.send({
                    status: 1,
                    result: 'activation link have been sent to your mail address, Please check and confirm now'
                });
            }
        }
    });
});

/***********************listining port************************/
var port= Number(process.env.PORT||3232);
app.listen(port, function() {
    console.log('running at '+port);
});