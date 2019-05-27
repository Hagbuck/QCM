/**
 * Polytech QCM
 * server.js
 */

 /**
  * Modules dependencies
  */
let express         = require('express')
  , session         = require('express-session')
  , http            = require('http')
  , fs              = require('fs')
  , body_parser     = require('body-parser')
  , props_reader    = require('properties-reader')
  , process         = require('process')
  , io          	= require('socket.io')(http)
  , shared_session  = require("express-socket.io-session")
  , ejs             = require('ejs')
  , logger          = require('./back/logger')
  , db              = require('./back/db')
;

/**
 * default value and constants
 */
let port            =   8080;
let properties_file =   __dirname + '/conf.properties';
let web_folder      =   __dirname;
let uri             = "mongodb+srv://Serveur:root@clusterqcm-ahdvt.gcp.mongodb.net/admin";

/**
 * function get now date and time
 */
function getNow(){
    let date    = new Date();
    let day     = date.getDate();
    let month   = date.getMonth()+1;
    let year    = date.getFullYear();
    let hours   = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    day     =  (day >= 10)       ? day       : "0" + day;
    month   =  (month >= 10)     ? month     : "0" + month;
    hours   =  (hours >= 10)     ? hours     : "0" + hours;
    minutes =  (minutes >= 10)   ? minutes   : "0" + minutes;
    seconds =  (seconds >= 10)   ? seconds   : "0" + seconds;

    return year + "-" + month + "-" + day + " " + hours + "-" + minutes + "-" + seconds;
}

/**
 * Apply all properties to the server
 * This function must be called before the server start
 */
function apply_properties(props){
    let props_port= props.get('server.port');

    if(props_port)
        port = props_port;
}

/**
 * Read all properties from a properties object
 */
function read_all_properties(props){
    props.each((key, value) => {
        logger.debug("[" + key + "] : " + value);
    });
}

/**
 * Authentication and Authorization Middleware
 */
let auth = function(req, res, next) {
  if (req.session && req.session.mail)
    return next();
  else
    return res.sendStatus(401);
};

/**
 * Main execution
 */
let properties;
db.connect(uri);

try{
    logger.info('Load properties from : ' + properties_file);
    properties = props_reader(properties_file);
    read_all_properties(properties);
    apply_properties(properties);
}catch(err){
    logger.error(err);
}

let app = express();
let router = express.Router();

app.use(body_parser.json());
app.use(body_parser.urlencoded({
  extended: true
}));
app.use(express.static(web_folder));

let sess = session({
    secret: 'QuinoaConcombreMangue',
    resave: true,
    saveUninitialized: true
})
app.use(sess);

app.set('port', process.env.PORT || port);
app.set('view engine', 'ejs');
app.set('views', __dirname);


let server = http.createServer(app).listen(app.get('port'), function(){
    logger.info('Express server listening on port ' + app.get('port'));
    logger.info('Startup completed');
});

app.get(['/', '/index'], function(req, res){
    return res.render('index');
});

app.get('/profil', function(req, res){
    return res.render('profil');
});

app.get('/creation', function(req, res){
    return res.render('creation');
});

app.get('/lancement', function(req, res){
    return res.render('lancement');
});

app.get('/session', function(req, res){
    return res.render('session');
});

app.get('/loggedmail', auth, function(req, res){
    return res.send({ mail: req.session.mail });
})

app.get('/qcm', async function(req, res){
    if(req.query.title){
	    let qcm_title  = req.query.title;
	    let qcm_author = req.session.mail;

	    let r = await db.get_QCM(qcm_title, qcm_author);

	    return res.send(r);
    }

    else if(req.query.id){
	    let qcm_id  = req.query.id;
	    let r = await db.get_QCM_whithout_answer(qcm_id);
	    return res.send(r);
    }

});

app.post('/qcm', auth, function(req, res){
    let qcm = req.body;

    let ack = db.insert_new_qcm(qcm);

    if(ack){
        return res.send({type: 'Success', text: 'QCM successfully register'});
    } else {
        return res.send({type: 'Error', text: 'Failed to save the QCM'});
    }
});

app.get('/qcmList', auth, async function(req, res){

    let uid = req.query.createur;
    let r = await db.get_QCMList(uid);
    return res.send(r);

})

app.get('/user', async function(req, res){
    let nom = req.query.nom;

    let r = await db.get_user_by_name(nom);

    return res.send(r);
})

app.get('/login', function(req, res){
    return res.render("test_login");
})

app.post('/login', async function(req, res){
    let mail        = req.body.mail;
    let password    = req.body.password;

    let check_ok    = false;
    let db_pw       = await db.get_pswd(mail);

    for(let i = 0; i < db_pw.length; ++i){
        if (db_pw[i].mdp == password)
            check_ok = true;
    }

    if(mail && password
    && check_ok){ // Check DB
        req.session.mail = mail;
        return res.send({type: 'Success', text: 'User successfully logged'});
    } else {
        return res.send({type: 'Error', text: 'Tuple (User/password) doesn\'t exist'});
    }
})

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.send({type: 'Success', text: 'User logout'});
});

app.use("*",function(req,res){
    return res.render('404');
});

let srv = app.listen();

process.on('SIGINT', () => {
    logger.info('Closing MongoDB ...');
    db.close();
    logger.info('Shutting down server ...');
    srv.close();
    logger.info('Exiting process ...');
    process.exit();
});


io.listen(server);

io.use(shared_session(sess));

let logged = []
var current_qcm;
let question_id = 0;
let current_session; reset_session();
let session_state = 'pending';
let results = [];
let owner = '';
let responses_q; reset_reponses_q();
let question_state = 'unlock';
let qcm_id;

function reset_reponses_q(participants = 0){
    reponses_q = {
            participants : participants,
            responses: 0
        };
}

function reset_session(){
    current_session = {
                        titreQCM : '',
                        createur : '',
                        date : '',
                        notes: []
                    };
}

function load_result(){
    results = [];
    for(let i = 0; i < current_qcm.questions[question_id].propositions.length; ++i){
        results.push({
                        proposition: current_qcm.questions[question_id].propositions[i].reponse,
                        valeur: 0
                    });
    }
}

io.on('connection', function(socket){
    logger.debug('An user is connected');

    socket.on('join', function(obj){
        logger.debug('(From Users) an user join the QCM');

        let pseudo = obj.pseudo;
        let flag = obj.flag;

        /* Session is already started, can't be joined */
        if(session_state == 'started'){
            logger.error('Session already started, can\'t be joined');
            socket.emit('failure', 'Session already started, can\'t be joined');
        }
        /* Teacher logged (don't add into logged array) */
        else if (flag == 'open'){
            session_state = 'joinable';
            logger.debug(pseudo + ' open QCM');
            reset_session(); logger.error('RESET SESSION');
            owner = pseudo;
            socket.handshake.session.pseudo = pseudo;
            qcm_id = obj.qcm_id;
            logger.debug('QCM id : ' + qcm_id);
        }
        /* Session is not joinable */
        else if(session_state != 'joinable'){
            socket.handshake.session.pseudo = undefined;
            socket.emit('failure', 'QCM is not joinable');
            logger.error('QCM is not joinable');
        }
        /* Can't join session without pseudo */
        else if(!pseudo) {
            socket.handshake.session.pseudo = undefined;
            socket.emit('failure', 'Pseudo is undefined');
            logger.error('Pseudo is undefined');
        }
        /* Pseudo already logged -> need another pseudo */
        else if(logged.includes(pseudo)) {
            socket.handshake.session.pseudo = undefined;
            socket.emit('failure', pseudo + ' has already join the lobby');
            logger.error(pseudo + ' has already join the lobby');
        }
        /* The QCM id is right*/
        else if(obj.qcm_id != qcm_id){
            socket.handshake.session.pseudo = undefined;
            socket.emit('failure', obj.qcm_id + ' is a wrong QCM id');
            logger.error(obj.qcm_id + ' is a wrong QCM id');
        }
        /* Can join the session */
        else {
            logged.push(pseudo);

            socket.handshake.session.pseudo = pseudo;
            socket.handshake.session.save();

            logger.debug(pseudo + ' join QCM');
            socket.emit('users_logged', logged);
            socket.broadcast.emit('users_logged', logged);
        }
    });

    socket.on('start_qcm', function(obj){
        logger.debug('(From Teacher) Start QCM');

        db.get_QCM_by_id(obj.id).then(function(result) {
            current_qcm = result[0];

            session_state = 'started';
            question_state = 'unlock';
            load_result();
            console.log(results);
            reset_reponses_q(logged.length);

            if(current_qcm){
                logger.debug(obj.id + ' loaded');

                /** Create session **/
                current_session.titreQCM = current_qcm.titre;
                current_session.createur = current_qcm.createur;
                current_session.date = getNow();

                for(let i = 0; i < logged.length; ++i){
                    let responses_array = [];
                    for(let j = 0; j < current_qcm.questions.length; ++j){
                        responses_array.push({ question : current_qcm.questions[j].intitule, resultat : 'faux'});
                    }

                    current_session.notes.push({pseudo: logged[i], reponses: responses_array});
                }

                console.log(current_session.notes);

                socket.emit('start', 'start');
                socket.broadcast.emit('start', 'start');
            } else {
                socket.emit('failure', 'QCM ' + obj.id + ' can\'t be loaded');
            }
        });
    });

    /** Call from teacher **/
    socket.on('next_question', function(obj){
        ++question_id;

        load_result();

        if(current_qcm && current_qcm.questions)
            logger.debug('(From Teacher) Next Question (' + question_id + '/' + current_qcm.questions.length + ')');
        else
             logger.debug('(From Teacher) Next Question');

         reset_reponses_q(logged.length);
         question_state = 'unlock';
         logger.debug('Question is unlocked');

        socket.emit('next', 'next');
        socket.broadcast.emit('next', 'next');
    });

    socket.on('send_response', function(obj){
        logger.debug('(From Users) Get response');

        if(question_state != 'lock'){
            let propositions = current_qcm.questions[question_id].propositions;
            let response_is_right = true;

            for(let i = 0; i < propositions.length; ++i){
                let response = propositions[i];

                if(response.valeur != obj[i].valeur){
                    response_is_right = false;
                }

                if(obj[i].valeur == 'vrai'){
                    for(let j = 0; j < results.length; ++j){
                        if(results[j].proposition == obj[i].reponse) ++results[j].valeur;
                    }
                }
            }
           //console.log(results);

            // Add one point to the pupil if he has a right answer
            if(response_is_right){
                for(let i = 0; i < current_session.notes.length; ++i){
                    let user = current_session.notes[i];

                    if(user.pseudo == socket.handshake.session.pseudo){

                        for(let j = 0; j < user.reponses.length; ++j){
                            if(user.reponses[j].question == current_qcm.questions[question_id].intitule){
                                user.reponses[j].resultat = 'vrai';
                            }
                        }
                    }
                }
            }
            //console.log(current_session);

            ++reponses_q.responses;


            socket.broadcast.emit('response', reponses_q);
            socket.emit('response', reponses_q);
        } else {
            logger.error('User can\'t send response because question is locked');
        }


    });

    socket.on('send_correction', function(obj){
        logger.debug('(From Teacher) Send correction');
        question_state = 'lock';
        logger.debug('Question is locked');

        /** To the pupils **/
        socket.broadcast.emit('correction', current_qcm.questions[question_id].propositions);
        /** To the teacher **/
        socket.emit('result', results);
    });

    socket.on('end_qcm', function(ojb){
        logger.debug('(From Teacher) End QCM');
        session_state = 'pending';
        logger.debug('Save session into DB');
        db.insert_new_session(current_session);

        question_id = 0;

        socket.broadcast.emit('end', 'end');
	    socket.emit('end_prof');
    });

    socket.on('get_statistic', function(obj){
        logger.debug('(From Teacher) Get statistic');
        let statistic = [];

        /* Create all question in statistique */
        for(let i = 0; i < current_qcm.questions.length; ++i){
            statistic.push({question: current_qcm.questions[i].intitule, valeur: 0});
        }

        /* Fill statistic object with users responses */
        for(let i = 0; i < current_session.notes.length; ++i){  /* For each user */
            let user =  current_session.notes[i];
            for(let j = 0; j < user.reponses.length; ++j){      /* For each answer */
                let response = user.reponses[j];

                if(response.resultat == 'vrai'){

                    for(let k = 0; k < statistic.length; ++k){
                        if(statistic[k].question == response.question){
                            ++statistic[k].valeur;
                        }
                    }
                }
            }
        }

        console.log(statistic);

        socket.emit('statistic', statistic);
    })

    socket.on('get_note', function(obj){
        logger.debug('(From Users) Get note');

        let pseudo = socket.handshake.session.pseudo;
        let note = {note : 0};
        for(let i = 0; i < current_session.notes.length; ++i){
            let user = current_session.notes[i];

            if(user.pseudo == pseudo){
                for(let j = 0; j < user.reponses.length; ++j){
                    let response = user.reponses[j];
                    if(response.resultat == 'vrai'){
                        ++note.note;
                    }
                }
            }
        }
        socket.emit('note', note);
    });

    socket.on('disconnect', function(obj){
        let pseudo = socket.handshake.session.pseudo;

        if(pseudo)
        {
            if(pseudo == owner){
                session_state = 'pending';
                logger.debug(pseudo + ' Disconnected (session = pending)');
                socket.broadcast.emit('failure', 'Teacher disconnected');
                reset_session();
            }

            for( var i = logged.length-1; i >= 0; i--){
                if ( logged[i] === pseudo ) logged.splice(i, 1);
            }

            socket.emit('users_logged', logged);
            socket.broadcast.emit('users_logged', logged);
        }

        logger.debug(pseudo + ' user disconnected');
    });
});
