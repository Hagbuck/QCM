// Collection Utilisateur

/**
 * Insert a new user
 */
async function db_insert_new_user(user){
    const col_Utilisateur = client.db("QCMDB").collection("Utilisateur");
    return col_Utilisateur.insertOne(user);
}

/**
 * Get a list of user from DB
 */
async function db_get_user_by_name(name){
    const col_Utilisateur = client.db("QCMDB").collection("Utilisateur");
    var requete = { nom: name };
    
    let r = await col_Utilisateur.find(requete).toArray();
    console.log(r);
    return r;
}

/**
 * Get password of an user from mail
 */
async function db_get_pswd(mail_user){
    const col_Utilisateur = client.db("QCMDB").collection("Utilisateur");
    var requete = { mail: mail_user };
    
    let r = await col_Utilisateur.find(requete,{ projection: { _id: 0, mdp: 1}}).toArray();
    console.log(r);
    return r;
}


/**
 * Get name and first name from mail
 */
async function db_get_name_and_fname(mail_user){
    const col_Utilisateur = client.db("QCMDB").collection("Utilisateur");
    var requete = { mail: mail_user };
    
    let r = await col_Utilisateur.find(requete,{ projection: { _id: 0, nom: 1, prenom: 1}}).toArray();
    console.log(r);
    return r;
}


// Collection QCM

/**
 * Insert a new QCM into the DB
 */
async function db_insert_new_qcm(qcm){
    const col_QCM = client.db("QCMDB").collection("QCM");
    return col_QCM.insertOne(qcm);
}

/**
 * Get all QCM from mail
 */
async function db_get_QCM(mail_user){
    const col_QCM = client.db("QCMDB").collection("QCM");
    var requete = { createur: mail_user };
    
    let r = await col_QCM.find(requete).toArray();
    console.log(r);
    return r;
}

/**
 * Get creator from QCM name
 */
async function db_get_creator(QCM_name){
    const col_QCM = client.db("QCMDB").collection("QCM");
    var requete = { titre: QCM_name };
    
    let r = await col_QCM.find(requete,{ projection: { _id: 0, createur: 1}}).toArray();
    console.log(r);
    return r;
}

/**
 * Get QCM from QCM(titre,mail)
 */
 async function db_get_QCM(QCM_name, mail_user){
    const col_QCM = client.db("QCMDB").collection("QCM");
    var requete = { titre: QCM_name, createur: mail_user };
    
    let r = await col_QCM.find(requete).toArray();
    console.log(r);
    return r;
}

/**
 * Get QCM from _id
 */
 async function db_get_QCM_by_id(id){
    const col_QCM = client.db("QCMDB").collection("QCM");
    var requete = { _id: id };
    
    let r = await col_QCM.find(requete).toArray();
    console.log(r);
    return r;
}


/**
 * Get QCM without answer (for student)
 */
async function db_get_QCM_whithout_answer(id){
    const col_QCM = client.db("QCMDB").collection("QCM");
    var mongo = require('mongodb');
    var o_id = new mongo.ObjectID(id);
    var requete = { _id: o_id };
    
    let r = await col_QCM.find(requete,{ projection: {valeur: 0}}).toArray();
    console.log(r);
    return r;    
}

//Collection Session

/**
 * Insert a new session
 */
async function db_insert_new_session(session){
    const col_Session = client.db("QCMDB").collection("Session");
    return col_Session.insertOne(session);
}

/**
 * Get session from qcm title + mail user + date
 */
 async function db_get_questions(QCM_name, mail_user,date){
    const col_Session = client.db("QCMDB").collection("Session");
    var requete = { titre: QCM_name, createur: mail_user, date: date};
    
    let r = await col_QCM.find(requete).toArray();
    console.log(r);
    return r;
}
