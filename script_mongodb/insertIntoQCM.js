const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Serveur:root@clusterqcm-ahdvt.gcp.mongodb.net/admin";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const col_QCM = client.db("QCMDB").collection("QCM");


  var objet_test ={"titre" : "QCM démo","createur":"gerard.mansoif@u-psud.fr","questions":[{"intitule":"Quel est l'animal préféré de Valentin ?","propositions":[{"reponse":"requin","valeur":"faux"},{"reponse":"chat","valeur":"faux"},{"reponse":"lama","valeur":"vrai"},{"reponse":"poulpe","valeur":"faux"}]},{"question":"Quel est le végétal préféré de Valentin ?","reponse":[{"reponse":"chêne","valeur":"faux"},{"reponse":"Corentin","valeur":"vrai"}]}]};


  col_QCM.insertOne(objet_test);
	
  client.close();
});