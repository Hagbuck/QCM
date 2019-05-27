const MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');
const uri = "mongodb+srv://Serveur:root@clusterqcm-ahdvt.gcp.mongodb.net/admin";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  
  const col_Utilisateur = client.db("QCMDB").collection("Utilisateur");
  const col_QCM = client.db("QCMDB").collection("QCM");
  const col_Session = client.db("QCMDB").collection("Session");


  //exemple d'insertion
  /*
  col_Utilisateur.insertOne({"nom":"Le Un","prenom":"Attila","mail":"attila@un.com","mdp":"PIRATE"});
	*/

  //exemple de requete
  /*
  var requete = { mail: "attila@deux.com" };
  col_Utilisateur.find(requete,{ projection: { _id: 0, mdp: 1}}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
  });*/

    var o_id = new mongo.ObjectID("5ce3e7d3a25fbb167836817b");
    var requete = { _id: o_id };
    
    col_QCM.find(requete,{ projection: {valeur: 0}}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
  });
  /*
  col_Utilisateur.find({}, { projection: { _id: 0, nom: 1, prenom: 1 } }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
  });
	*/

  client.close();
});