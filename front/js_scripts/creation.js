/*** VARIABLES ***/
var count_response = 2;
var count_question = 1;

$(document).ready(function() {
	/*if(!userLogged){
		Swal.fire({
			type : "error",
			title:"Accès interdit",
			text:"Vous devez vous authetifier pour accèder à cette partie du site."
		});
		window.setTimeout(function(){ window.location="index"; },2000);
	}*/
	/*else{*/
		checkQuestionIsDeletable();
		checkOptionIsDeletable(count_question);
	/*}*/

});

/**
* @desc Ajoute une proposition à la question choisie.
* @param question_concerned La question dans laquelle on souhaite ajouter une proposition
*/
function add_response(question_concerned){
	count_response++;

	var txt =` \
	<div class="form-inline reponse" id="q`+question_concerned+`r`+count_response+`" > \
		<input type="text" class="form-control text_reponse" placeholder="Un choix ..." required/> \
		<div class="custom-control custom-switch"> \
			<input type="checkbox" class="custom-control-input" id="customSwitch`+question_concerned +`_`+ count_response+`"> \
			<label class="custom-control-label" for="customSwitch`+question_concerned +`_`+count_response+`"></label> \
		</div> \
		<div class="remove_module_response"> <i class="fas fa-trash-alt" onclick="delete_option(\'`+question_concerned+`\',\'`+count_response+`\');"></i> </div> \
	</div>`;

	$('#q'+question_concerned+'r').append(txt);
	checkOptionIsDeletable(question_concerned);
}

/**
* @desc Ajoute une question au QCM.
*/
function add_question(){
	count_question++;
	var txt = `  \
	<div id="q`+count_question+`" class="questionIndiv"> \
		<div class="form-inline"> \
			<label for="question_intitule" id="label_question"> Question : </label> \
			<input type="text" class="form-control question_intitule" required/> \
			<div class="add_module_response"> <i class="fas fa-plus-circle" onclick="add_response(\'`+count_question+`\');"></i>  </div> \
			<div class="remove_module_question"> <i class="fas fa-trash-alt" onclick="delete_question(\'`+count_question+`\');"></i> </div>  \
		</div> \
		<div class="reponse_block" id="q`+count_question+`r"> \
			<div class="form-inline reponse" id="q`+count_question+`r1"> \
				<input type="text" class="form-control text_reponse"  placeholder="Un choix..." required/> \
				<div class="custom-control custom-switch"> \
					<input type="checkbox" class="custom-control-input" id="customSwitch`+count_question+`_1"> \
					<label class="custom-control-label" for="customSwitch`+count_question+`_1"></label> \
				</div> \
				<div class="remove_module_response"> <i class="fas fa-trash-alt" onclick="delete_option(\'`+count_question+`\',\'1\');"></i> </div> \
			</div> \
			<div class="form-inline reponse" id="q`+count_question+`r2"> \
				<input type="text" class="form-control text_reponse" placeholder="Un choix..." required/> \
				<div class="custom-control custom-switch"> \
					<input type="checkbox" class="custom-control-input" id="customSwitch`+count_question+`_2"> \
					<label class="custom-control-label" for="customSwitch`+count_question+`_2"></label> \
			</div> \
			<div class="remove_module_response"> <i class="fas fa-trash-alt" onclick="delete_option(\'`+count_question+`\',\'2\');"></i> </div> \
			</div></div></div><hr>`;

	$('#question_block').append(txt);
	checkQuestionIsDeletable();
	checkOptionIsDeletable(count_question);
}

/**
* @desc Supprime une option d'une question
* @param question_concerned id de la question dans laquelle se situe la proposition à supprimer
* @param option_concerned id de l'option à surrpimer
*/
function delete_option(question_concerned,option_concerned){
	$('#q'+question_concerned+'r'+option_concerned).remove();
	checkOptionIsDeletable(question_concerned);
}

/**
* @desc Supprime une option d'une question
* @param question_concerned id de la question à supprimer
*/
function delete_question(question_concerned){
	$('#q'+question_concerned+'+ hr').remove();
	$('#q'+question_concerned).remove();
	checkQuestionIsDeletable();
}

/**
* @desc Verifie si le nombre de question est suffisant pour en supprimer.
*/
function checkQuestionIsDeletable(){
	//Si il y a plus de une question
	if($('.remove_module_question').length > 1){
		$('.remove_module_question').css('display','block');
	}
	else{$('.remove_module_question').css('display','none');}

}

/**
* @desc Verifie si le nombre de proposition d'une question est suffisant pour en supprimer.
* @param question_concerned id de la question à laquelle est ratachée la proposition.
*/
function checkOptionIsDeletable(question_concerned){
	//count options
	if($('#q'+question_concerned+' .remove_module_response').length >2){
		$('#q'+question_concerned+' .remove_module_response').css('display','block');
	}
	else{$('#q'+question_concerned+' .remove_module_response').css('display','none');}
}

/**
* @desc Encapsule les données du QCM dans un objet.
*/
function encaps_data(){
	var arrayQuestion = [];
	var arrayReponse = [];
	var arrayIsTrue = [];

	var listQuestions = $(".questionIndiv");
	//pour toute les questions
	listQuestions.each(function(){
		arrayReponse = [];
		arrayIsTrue = [];

		var id = $(this).attr('id');
		var intitule = $('#'+id+' .question_intitule').val();

		//pour toutes les réponses aux questions
		$('#'+id+' .text_reponse').each(function(){
			var valI = $(this).val();
			arrayReponse.push(valI);
		});

		//pour chaque check box
		$('#'+id+' input[type="checkbox"]').each(function(){
			var valT = $(this).is(":checked");
			
			if(valT)
				arrayIsTrue.push("vrai");
			else
				arrayIsTrue.push("faux");
		});

		var arrayProposition =buildPropositionObjet(arrayReponse,arrayIsTrue);
		arrayQuestion.push({"intitule" : intitule, "propositions" : arrayProposition});
	})

	return arrayQuestion;
}

/**
* @desc Ordonne correctement la proposition et sa valeur associée (true ou false)
*/
function buildPropositionObjet(arrayReponse,arrayIsTrue){
	var arrayProposition = [];
	for(var i=0;i<arrayIsTrue.length;i++){
		var proposition = {};
		proposition.reponse = arrayReponse[i];
		proposition.valeur = arrayIsTrue[i];
		arrayProposition.push(proposition);
	}
	return arrayProposition;
}

/**
*/
function displayIHMValidation(){

}


/**
* @desc Envoie du QCM vers le serveur
* @warnin HARDCODE HERE
* @TODO reecuperation du créateur automatique
*/
function sendQCM(){
	var qcmO = {};
	var titre = $("#titre").val();
	qcmO.titre = titre;
	qcmO.createur = userLogged;
	qcmO.questions = encaps_data();

	console.log(qcmO);

	$.ajax({
		url : "./qcm",
		type : 'POST',
		data : qcmO,
		dataType : "json",
		success  : function(data){
	 	console.log(data)
	 	parseDataCreation(data);
	},
	error : function(resultat, statut, erreur){
		console.log("[ERROR] -> Fail to sendQCM()");
		console.log(erreur);
		Swal.fire({
			type: 'error',
			title: 'Erreur Serveur',
			text: erreur
		});
	}
	});//END AJAX

}

/**
* @desc Verifie la bonne prise en compte du QCM
* @TODO redirection vers IHM consulation des QCM de l'auteur
*/
function parseDataCreation(data){
	if(data.type != 'Success'){
		Swal.fire({
			type: 'error',
			title: 'Erreur Serveur',
			text: 'Une erreur serveur est survenue.'
		});
	}

	else{
		Swal.fire({
			type: 'success',
			title: 'QCM créé',
			text: 'QCM créé avec succés.'
		});
		window.setTimeout(function(){ window.location="profil"; },1500);	}
}
