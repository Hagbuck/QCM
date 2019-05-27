/*** VARIABLES ***/

var run_question = 0; //Numero de question en cours
var jsonObjet = {}; //Objet JSON
var strWaitCorrection = "En attente de correction <i class='fas fa-spinner' id='spinnerCorrection'></i>";
var strNoWaitCorrection = 'Valider mes réponses <i style="margin-left: 10px;" class="fas fa-clipboard-check"></i>';

/**
* @desc Affiche une question du QCM
* @param questionO Objet JSON de la question
* @param index Numero de la question
*/
function display_question(questionO,index){
	var str = `
	<div id="q`+index+`" class="questionIndiv">
		<div class="form-inline">
			<label for="question_intitule" id="label_question"> Question : </label>
			<input type="text" class="form-control question_intitule" value="`+questionO.intitule+`" required disabled/>
		</div>
		<div class="reponse_block" id="q`+index+`r">
		<!--HERE -->
		</div><hr>`;

	$("#question_block").append(str);

	//Pour chaque proposition, on l'affiche
	for(var i=0;i<questionO.propositions.length;i++){
		display_reponse(questionO.propositions[i],index,i);
	}

	if(userLogged)
		$(".eleveContent").remove();
	else
		$(".profContent").remove();

}

/**
* @desc Affiche une proposition d'une question du QCM
* @param propO Objet JSON de la proposition
* @param indexQ Numero de la question liée
* @param indexR Numero de la proposition
* @TODO : Adaptation en fonction du profil eleve = checkbox / prof = compteur de selection de la réponse
*/
function display_reponse(propO,indexQ,indexR){
	var str = `
	<div class="form-inline reponse" id="q`+indexQ+`r`+indexR+`">
		<input type="text" class="form-control text_reponse"  placeholder="Un choix..." value="`+propO.reponse+`" required disabled/>
		<div class="custom-control custom-switch eleveContent">
			<input type="checkbox" class="custom-control-input largeBox" id="customSwitch`+indexQ+`_`+indexR+`">
			<label class="custom-control-label" for="customSwitch`+indexQ+`_`+indexR+`"></label>
		</div>
		<span class="afterVerif" id="afterVerif`+indexR+`"></span>
	</div>`;

	$("#q"+indexQ+"r").append(str);
}

/**
* @desc Passe à la question suivante du QCM.
* @warning Utilisable uniquement pour le profil professeur.
* @TODO Envoi de la requête de passage à la question suivante (SOCKET)
*/
function nextQuestion(){
	//RESET VALID QUESTION
	$("#valideReponse").html(strNoWaitCorrection)
	$("#valideReponse").attr("onclick","submitReponse()");
	$("#blockResults").html("");

	$("#q"+run_question).remove();
	run_question++;
	display_question(jsonObjet.questions[run_question],run_question);

	//Si c'est la dernière question on switch le bouton de question suivante pour le bouton de fin du QCM
	if(run_question == jsonObjet.questions.length-1){
		$("#nextQuestion").attr("onclick","endQCM()");
		$("#nextQuestion").html("Finir le QCM <i style='margin-left: 10px;' class='far fa-times-circle'></i>");
	}
}

function correction(){
	console.log("[EVENT] ~ Ask for correction.")
	socket.emit("send_correction");
	$("#correction").css("display","none");
	$("#nextQuestion").css("display","block");
}

function askNextQuestion(){
	console.log("[EVENT] ~ Request next question.")
	socket.emit("next_question");
	//RESET CORRECTION BUTTON
	$("#correction").css("display","block");
	$("#nextQuestion").css("display","none");
}

/**
* @desc Lance la correction de la question
* @warning Utilisable uniquement pour le profil professeur.
* @TODO Envoi de la requête de correction aux élèves
*/
function correctionQuestion(){

}

/**
* @desc Lance la vérification des réponses de l'élève
* @param responseObject Objet contenant les réponses de la question
* @warning Utilisable uniquement pour le profil élève - trigger par socket de correction du prof.
* @TODO Vérification de la cohérence entre les résultats de l'élève et la correction contenue dans l'objet
	+ Envoie des choix et résultats aux serveurs
*/
function checkCorrection(correctionObject){
	var responseObject = encaps_reponse_user();
	var allTrue = true;
	var nbBonneReponse = 0;

	for(var i=0;i<correctionObject.length;i++){
		if(responseObject[i].reponse == correctionObject[i].reponse
		&& responseObject[i].valeur == correctionObject[i].valeur){
			nbBonneReponse++;
		}
		else{allTrue = false;}
		//Check only correction
		if(correctionObject[i].valeur == "vrai")
			$("#afterVerif"+i).html("<i class='fas fa-check-circle' style='color:green;'></i>");
		else
			$("#afterVerif"+i).html("<i class='fas fa-times-circle' style='color:red;'></i>");
	}

	let str_score = nbBonneReponse + "/" + correctionObject.length;
	let congrats ="";
	let color = "orange";
	if(allTrue){congrats=" Félicitations !";color = "green"}
	$('#blockResults').html("Vous avez eu "+str_score+" bonnes réponse(s)."+congrats);
	$('#blockResults').css("color",color);

}



/**
* @desc Met à jour l'IHM avec les résultats des élèves
* @warning Utilisable uniquement pour le profil professeur.
* @TODO Trigger par la réception des résultats des élèves (socket)
*/
function majIHMForResults(data){
	console.log(data);
	for(var i=0;i<data.length;i++){
		$("#afterVerif"+i).html(""+data[i].valeur);
	}
}

/**
* @desc Envoie les réponses de l'utilisateur au back
*/
function submitReponse(){
	console.log("[EVENT] ~ Send responses.")
	var responseObject = encaps_reponse_user();
	socket.emit("send_response",responseObject);
	//MAJ IHM
	$("[type='checkbox']").attr('disabled',"");
	$("#valideReponse").html(strWaitCorrection);
	$("#valideReponse").removeAttr("onclick");
}

function encaps_reponse_user(){
	var arrayReponse = [];
	var arrayIsTrue = [];
	var arrayObject = {};

	var listQuestions = $(".questionIndiv");
	//pour toute les questions
	listQuestions.each(function(){
		arrayReponse = [];
		arrayIsTrue = [];

		var id = $(this).attr('id');

		//pour toutes les réponses aux questions
		$('#'+id+' .text_reponse').each(function(){
			var valI = $(this).val();
			arrayReponse.push(valI);
		});

		//pour chaque check box
		$('#'+id+' input[type="checkbox"]').each(function(){
			var valT = $(this).is(":checked");
			arrayIsTrue.push(valT);
		});

		arrayObject =  buildPropositionObjet(arrayReponse,arrayIsTrue);
	})
	return arrayObject;
}

/**
* @desc Ordonne correctement la proposition et sa valeur associée (true ou false)
*/
function buildPropositionObjet(arrayReponse,arrayIsTrue){

	var arrayProposition = [];
	for(var i=0;i<arrayIsTrue.length;i++){
		var proposition = {};
		proposition.reponse = arrayReponse[i];
		//CONVERT REPONSE
		var strTrue = "";
		if(arrayIsTrue[i])
			strTrue = "vrai";
		else
			strTrue = "faux"

		proposition.valeur = strTrue;
		arrayProposition.push(proposition);
	}
	return arrayProposition;
}

/**
* @desc Met fin au QCM
* @TODO Encapsulation des résultats et envoie aux serveurs, redirection sur la page de stats
*/
function endQCM(){
	Swal.fire("QCM Terminé","Le QCM est terminé.","success");
	socket.emit("end_qcm");
}

/**
* @desc Recupère un QCM
* @param qcmtitre Titre du QCM à récupérer
* @TODO Get par identifiant unique, get d'un objet dénué des réponses aux propositions
*/
function get_QCM(qcmId){
	//APPEL AJAX DE RECUPERATION
	$.ajax({
		url : "./qcm",
		type : 'GET',
		data : {"id" : qcmId},
		dataType : "json",
		success  : function(data){
	 	console.log(data)
	 	parseDataRecuperation(data);
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
* @desc Parse les datas reçu par le serveur lors du get du QCM
* @param jo JsonObject à parser
* @TODO Contrôle supplémentaire (OPTION)
*/
function parseDataRecuperation(jo){
	console.log(jo[0]);
	//Si l'objet est valide, alors on tente de l'afficher
	if(jo[0].createur != undefined)
		display_QCM(jo[0]);
}

/**
* @desc Affichage du QCM et de sa première queston
* @param jo JsonObject du QCM
*/
function display_QCM(jsonO){
	$("#titre").attr("value",jsonO.titre); //maj du titre
	jsonObjet = jsonO; //save l'objet
	__QCM_OBJECT = jsonO;
	display_question(jsonO.questions[0],0); //affichage de la question 0

	/*
	// Résidu de méthode pour afficher d'un coup toute les questions
	for(var i=0;i<jsonO.questions.length;i++){
		display_question(jsonO.questions[i],i);
	}*/
}

function majIHMSyntese(data){
	var total = jsonObjet.questions.length;
	var mynote = data.note;
	var wrong = total - mynote;
	//build charset
	//syntheseBlock
	var datadisplay = {
		datasets: [{
			data: [mynote, wrong],
			backgroundColor: ["#91A437","#AA3939"]
		}],
		labels: ['Bonnes réponses','Mauvaises réponses']
	};

	var ctx = document.getElementById('chartRes').getContext('2d');
	var chart = new Chart(ctx, {
		type: 'doughnut',data:datadisplay});

	$("#scoreSpan").html(mynote + "/" + total);
	$("#main_form").fadeOut("slow");
	$("#syntheseBlock").fadeIn("slow");
}

function majIHMStats(data,listUser){
	//LIST
	var listValue = [];
	var listQuestions = [];
	var listColor = [];

	//LIMITE
	var limite25percent = (25 * listUser.length) / 100;
	var limite75percent = (75 * listUser.length) / 100;

	//OTHER
	var sumValue = 0;

	for(var i=0;i<=data.length-1;i++){
		listValue.push(data[i].valeur);
		listQuestions.push(data[i].question);
		sumValue+=data[i].valeur; //increment sum
		//INSERT A COLOR
		if(data[i].valeur <= limite25percent)
			listColor.push("#AA3939");
		else if(data.valeur >= limite75percent)
			listColor.push('#91A437');
		else
			listColor.push("#D96200");
	}

	//dont show label
	var optionsData =  {scales:{
		xAxes: [{ ticks: {display: false } }]},
		yAxes: [{ ticks: {beginAtZero: true}}]
	};

	var datadisplay = {
		datasets: [{
			data: listValue,
			backgroundColor: listColor,
			label : '# de réponses correctes'
		}],
		labels: listQuestions
	};

	var ctx = document.getElementById('chartRes').getContext('2d');
	var chart = new Chart(ctx, {
		type: 'bar',data:datadisplay,options : optionsData});

	$("#main_form").fadeOut("slow");
	$("#syntheseBlock").fadeIn("slow");
	var avgTotal = sumValue / listValue.length;
	$("#syntheseBlock h3").html("Moyenne : "+avgTotal);

}

function majIHMStudentReady(data){
	console.log(data)
	var str_allReady = ""
	if(data.participants == data.responses)
		str_allReady = "<br><span style='color:#91A437'>Tous les élèves ont répondu.</span>";

	$("#blockResults").html("Nombre de réponse : "+data.responses+"/"+data.participants+str_allReady);
}
