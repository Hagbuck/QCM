var userLogged = undefined;

/**
* @desc Tente de se connecter
* @TODO Appel AJAX, session utilisateur lancé etc...
*/
function displayIHMConnexion(){

	Swal.mixin({
		input: 'text',
		confirmButtonText: 'Next &rarr;',
		showCancelButton: true,
		confirmButtonColor: 'orange',
		progressSteps: ['1', '2']
	}).queue([
	{
		title: 'Votre identifiant',
		text: 'Identifiant'
	},
	{
		title: 'Votre mot de passe',
		text: 'Mot de passe',
		input : 'password'
	}
]).then((result) => {
	if (result.value) {
		var results = result.value
		//Vérification des identifiant entrées
		if(
			results[0] == undefined || results[1] == undefined ||
			results[0] == "" || results[1] == ""
		){
			Swal.fire({type: 'error',title: 'Erreur Syntax',text: 'La Syntax des identifiants n\'est pas valide.'})
		}

		else
		{
			//AJAX REQUEST
			$.ajax({
				url : "./login",
				type : 'post',
				data : {"mail" : results[0], "password" : results[1]},
				dataType : "json",
				success  : function(data){
					console.log(data)
					parseDataConnexion(data)
				},
				error : function(resultat, statut, erreur)
				{
					console.log("[ERROR] -> Fail to testConnexion()");
					console.log(erreur)
					Swal.fire({type: 'error',title: 'Erreur de Connexion',text: erreur})
				}});//END AJAX
		}
	}});

}



function parseDataConnexion(dataJSON){
	if(dataJSON.type == "Success"){
		Swal.fire({type: "success",title: 'Connexion',text: 'Connexion validée.'});
		window.setTimeout(function(){ window.location.reload(); },1500);
	}
	else
		Swal.fire({type: "error",title: 'Connexion',text: dataJSON.text});
}


function displayLogOut(){
	Swal.fire({
		title: 'Log Out',
		text: "Voulez-vous vous déconnecter ?",
		type: 'warning',
		showCancelButton: true,
		confirmButtonColor: 'orange',
		cancelButtonColor : '#6B6A6A',
		confirmButtonText: 'Déconnexion',
		cancelButtonText : 'Annuler'
	}).then((result) => {
		if (result.value) {
			$.ajax({
				url : "./logout",
				type : 'get',
				data : {},
				dataType : "json",
				success  : function(data){
					console.log(data)
					parseDataLogOut(data)
				},
				error : function(resultat, statut, erreur){
					console.log("[ERROR] -> Fail to logOut()");
					console.log(erreur)
					Swal.fire({type: 'error',title: 'Erreur Serveur',text: erreur});
				}
	 	});}
	});
}

function parseDataLogOut(dataJSON){
	if(dataJSON.type == 'Success'){
		Swal.fire({type: 'success',title: 'Déconnexion',text: "Vous avez été déconnecté."});
		window.setTimeout(function(){ window.location.reload(); },1500);
	}
	else{
		Swal.fire({type: 'error',title: 'Déconnexion',text: "Erreur serveur lors de la déconnexion."});
	}
}


function checkSession(){
	//AJAX REQUEST
	$.ajax({
		url : "./loggedmail",
		type : 'get',
		data : {},
		dataType : "json",
		success  : function(data){
			console.log(data)
			parseDataUser(data)
		},
		error : function(resultat, statut, erreur)
		{
			console.log("[ERROR] -> Fail to checkSession()");
			console.log(erreur);
			$(".profContent").remove();
		}});//END AJAX
}


function parseDataUser(data){
	if(data.mail != undefined){
		userLogged = data.mail;
		$('#profilLi').css("display","inline-block");
		$('#userMail').html(data.mail);
		$('#loginlogout').attr("onclick","displayLogOut()");
		$('#loginlogout').html("<li><i class='fas fa-sign-out-alt'></i>Déconnexion</li>");
		//On supprime les contente eleve
		$(".eleveContent").remove();
	}
	else
		$(".profContent").remove();
}

$(document).ready(function() {
	checkSession();
});


function getLoggedUser(){return userLogged;}
