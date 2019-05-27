const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Serveur:root@clusterqcm-ahdvt.gcp.mongodb.net/admin";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {

  const col_Utilisateur = client.db("QCMDB").collection("Utilisateur");
  const col_QCM = client.db("QCMDB").collection("QCM");
  const col_Session = client.db("QCMDB").collection("Session");


  var qcm ={"titre" : "QCM démo","createur":"gerard.mansoif@u-psud.fr","questions":[{"intitule":"Quel est l'animal préféré de Valentin ?","propositions":[{"reponse":"requin","valeur":"faux"},{"reponse":"chat","valeur":"faux"},{"reponse":"lama","valeur":"vrai"},{"reponse":"poulpe","valeur":"faux"}]},{"question":"Quel est le végétal préféré de Valentin ?","reponse":[{"reponse":"chêne","valeur":"faux"},{"reponse":"Corentin","valeur":"vrai"}]}]};


  col_QCM.insertOne(objet_test);
  col_Utilisateur.insertOne({"nom":"Le Deux","prenom":"Attila","mail":"attila@deux.com","mdp":"PIRATE"});
  col_Utilisateur.insertOne({"nom":"Le Un","prenom":"Attila","mail":"attila@un.com","mdp":"PIRATE"});
  col_Session.insertOne({"titreQCM":"QCM démo","date":"2019-05-20 15:25:20","createur":"gerard.mansoif@u-psud.fr","notes":[{"mail_eleve":"regis@legenie.fr","note":"20"},{"mail_eleve":"thibaud.germain@u-psud.fr","note":"15"}]});

  client.close();
});