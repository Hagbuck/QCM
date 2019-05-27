/**
* @desc Affiche l'interface de join d'un QCM
* @TODO Appel AJAX associé -> redirection si OK / sinon msg erreur
*/
function displayIHMJoin(){

	Swal.mixin({
		input: 'text',
		confirmButtonText: 'Next &rarr;',
		showCancelButton: true,
		confirmButtonColor: 'orange',
		progressSteps: ['1', '2']
	}).queue([
	{
		title: 'Votre identifiant',
		text: 'Identifiant utilisateur'
	},
	{
		title: 'Identifiant du QCM',
		text: 'Identifiant QCM',
	}
]).then((result) => {
	if (result.value) {
		var results = result.value
		//Vérification des identifiant entrées
		if(
			results[0] == undefined || results[1] == undefined ||
			results[0] == "" || results[1] == ""
		){
			Swal.fire({type: 'error',title: 'Erreur Syntax',text: 'La Syntax des informations n\'est pas valide.'})
		}
		else{window.location = "lancement?&id="+results[1]+"&pseudo="+results[0];}
	}});
}

/**
* @desc Vérifie que l'identifiant de QCM spécifié est valide et joignable
* @TODO Ajout état QCM -> ouvert / fermé ?
*/
function checkIfQCMExist(qcm_id){
	return true;
}
