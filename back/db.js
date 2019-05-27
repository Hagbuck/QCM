/**
 * Polytech QCM
 * server.js
 */

 let MongoClient = require('mongodb').MongoClient;

module.exports = {
    /// Collection Utilisateur
    /**
     * Insert a new user
     */
    client : {},
    
    connect : function(uri){
        this.client = new MongoClient(uri, { useNewUrlParser: true })
        this.client.connect(err => { if(err) throw err; })
    },

    insert_new_user : async function(user){
        const col_Utilisateur = this.client.db("QCMDB").collection("Utilisateur");
        return col_Utilisateur.insertOne(user);
    }
    ,
    /**
     * Get a list of user from DB
     */
    get_user_by_name : async function(name){
        const col_Utilisateur = this.client.db("QCMDB").collection("Utilisateur");
        var requete = { nom: name };

        let r = await col_Utilisateur.find(requete).toArray();
        console.log(r);
        return r;
    }
    ,
    /**
     * Get password of an user from mail
     */
    get_pswd : async function(mail_user){
        const col_Utilisateur = this.client.db("QCMDB").collection("Utilisateur");
        var requete = { mail: mail_user };

        let r = await col_Utilisateur.find(requete,{ projection: { _id: 0, mdp: 1}}).toArray();
        return r;
    }
    ,

    /**
     * Get name and first name from mail
     */
    get_name_and_fname : async function(mail_user){
        const col_Utilisateur = this.client.db("QCMDB").collection("Utilisateur");
        var requete = { mail: mail_user };

        let r = await col_Utilisateur.find(requete,{ projection: { _id: 0, nom: 1, prenom: 1}}).toArray();
        console.log(r);
        return r;
    }
    ,

    // Collection QCM

    /**
     * Insert a new QCM into the DB
     */
    insert_new_qcm : async function(qcm){
        const col_QCM = this.client.db("QCMDB").collection("QCM");
        return col_QCM.insertOne(qcm);
    }
    ,
    /**
     * Get all QCM from mail
     */
    get_QCMList : async function(mail_user){
        const col_QCM = this.client.db("QCMDB").collection("QCM");
        var requete = { createur: mail_user };

        let r = await col_QCM.find(requete).toArray();
        console.log(r);
        return r;
    }
    ,
    /**
     * Get creator from QCM name
     */
    get_creator: async function(QCM_name){
        const col_QCM = this.client.db("QCMDB").collection("QCM");
        var requete = { titre: QCM_name };

        let r = await col_QCM.find(requete,{ projection: { _id: 0, createur: 1}}).toArray();
        console.log(r);
        return r;
    }
    ,
    /**
     * Get QCM from QCM(titre,mail)
     */
     get_QCM: async function(QCM_name, mail_user){
        const col_QCM = this.client.db("QCMDB").collection("QCM");
        var requete = { titre: QCM_name, createur: mail_user };

        let r = await col_QCM.find(requete).toArray();
        console.log(r);
        return r;
    }
    ,
    /**
     * Get QCM from _id
     */
     get_QCM_by_id: async function(id){
        const col_QCM = this.client.db("QCMDB").collection("QCM");
        var mongo = require('mongodb');
        var o_id = new mongo.ObjectID(id);
        var requete = { _id: o_id };

        let r = await col_QCM.find(requete).toArray();
        //console.log(r);
        return r;
    }
    ,
    /**
     * Get QCM without answer (for student)
     */
    get_QCM_whithout_answer: async function(id){
        const col_QCM = this.client.db("QCMDB").collection("QCM");
        var mongo = require('mongodb');
        var o_id = new mongo.ObjectID(id);
        var requete = { _id: o_id };

        let r = await col_QCM.find(requete,{ projection: {valeur: 0}}).toArray();
        //console.log(r);
        return r;
    }
    ,
    /**
     * Delete a QCM from its id
     */
    delete_QCM: async function(id){
        const col_QCM = this.client.db("QCMDB").collection("QCM");
        var mongo = require('mongodb');
        var o_id = new mongo.ObjectID(id);
        var requete = { _id: o_id };

        var requete = {titre: title, mail: mail_user}
        return col_QCM.deleteOne(requete);
    }
    ,

    //Collection Session

    /**
     * Insert a new session
     */
    insert_new_session: async function(session){
        const col_Session = this.client.db("QCMDB").collection("Session");
        return col_Session.insertOne(session);
    }
    ,
    /**
     * Get session from qcm title + mail user + date
     */
     get_session: async function(QCM_name, mail_user, date){
        const col_Session = this.client.db("QCMDB").collection("Session");
        var requete = { titre: QCM_name, createur: mail_user, date: date};

        let r = await col_Session.find(requete).toArray();
        console.log(r);
        return r;
    }
    ,
    /**
     * Get all sessions from mail
     */
    get_all_sessions: async function(mail_user){
        const col_Session = this.client.db("QCMDB").collection("Session");
        var requete = { createur: mail_user};

        let r = await col_Session.find(requete).toArray();
        console.log(r);
        return r;
    }
    ,

    /**
     * Get all sessions from mail + QCM_title
     */
    get_all_sessions_from_QCM: async function(QCM_name, mail_user){
        const col_Session = this.client.db("QCMDB").collection("Session");
        var requete = { titreQCM: QCM_name, createur: mail_user};

        let r = await col_Session.find(requete).toArray();
        console.log(r);
        return r;
    }
    ,

    /**
     * Get last session from mail + QCM_title
     */
    get_last_session_from_QCM: async function(QCM_name, mail_user){
        const col_Session = this.client.db("QCMDB").collection("Session");
        var requete = { titreQCM: QCM_name, createur: mail_user};

        let r = await col_Session.find(requete).limit(1).sort({$natural:-1}).toArray();
        console.log(r);
        return r;
    }
    ,



    /**
     * Close the connection between server and DB
     */
    close: function(){
        this.client.close();
    }
};