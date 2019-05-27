/**
 * Delete an user
 */
async function db_delete_user(mail_user){
    const col_Utilisateur = client.db("QCMDB").collection("Utilisateur");

    var requete = {mail: mail_user}
    return col_Utilisateur.deleteOne(requete);
}

/**
 * Delete a QCM
 */
async function db_delete_QCM(mail_user, title){
    const col_QCM = client.db("QCMDB").collection("QCM");

    var requete = {titre: title, mail: mail_user}
    return col_QCM.deleteOne(requete);
}

/**
 * Delete a session
 */
async function db_delete_session(mail_user, title, date_session){
    const col_Session = client.db("QCMDB").collection("Session");

    var requete = {titre: title, mail: mail_user, date: date_session}
    return col_Session.deleteOne(requete);
}