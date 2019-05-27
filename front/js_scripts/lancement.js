var __PSEUDO = "";
var __IDQCM = "";
var __QCM_OBJECT = {};
var socket;
var listUser = [];

//BEGIN SOCKET
$(document).ready(function() {
	setParameterURL();

	socket = io().connect();
	emit_depend_prof_or_student();/*
	if(__PSEUDO){socket.emit("join",{"pseudo" : __PSEUDO,"flag" : "open"});}
	else{socket.emit("join",{"pseudo" : __PSEUDO});}*/

	socket.on("users_logged",function(data){
		console.log(data);
		fillTab(data);
	});

	//SOCKET ERROR
	socket.on("failure",function(data){
		Swal.fire({type : "error",title : "Erreur Socket", text : data});
		window.setTimeout(function(){ window.location="index"; },2000);
	})

	socket.on("start",function(data){
		console.log("[START] ~ Question start.");
		$("#loadComponet").fadeOut("slow");
		$("#main_form").fadeIn("slow");
		$('input[type="text"]').attr("disabled","");
		get_QCM(__IDQCM);
	})

	socket.on("next",function(data){
		console.log("[EVENT] ~ Next question.");
		nextQuestion();
	})

	socket.on("correction",function(data){
		console.log("[EVENT] ~ Correction received.")
		checkCorrection(data);
	})

	socket.on("result",function(data){
		console.log("[EVENT] ~ Results received.")
		majIHMForResults(data);
	})

	socket.on("end",function(data){
		console.log("Fin du QCM");
		socket.emit("get_note");
	});

	socket.on('end_prof', function(){
		socket.emit('get_statistic');
	})

	socket.on("note",function(data){
		console.log("[EVENT] ~ Récéption des résultats.")
		majIHMSyntese(data);
	})

	socket.on("statistic",function(data){
		console.log("[EVENT] ~ All stats.")
		console.log(data);
		//window.setTimeout(function(){ window.location="index"; },1500);
		majIHMStats(data,listUser);
	})

	socket.on("response",function(data){
		console.log("[EVENT] ~ An student has submit a response.")
		majIHMStudentReady(data);
	})

});

function beginQCM(){
	Swal.fire({
		title: 'Lancement du QCM',
		text: "Vous allez lancer le QCM.",
		type: 'warning',
		showCancelButton: true,
		confirmButtonColor: 'orange',
		cancelButtonColor : '#6B6A6A',
		confirmButtonText: 'Go',
		cancelButtonText : 'Annuler'
	}).then((result) => {

		if (result.value) {
			socket.emit("start_qcm",{"id" : __IDQCM});
		}

	});
}

function setParameterURL(){
	var url_string =  window.location.href;
	var url = new URL(url_string);
	__IDQCM = url.searchParams.get("id");
	__PSEUDO = url.searchParams.get("pseudo");

	//IHM MAJ
	$('#titleQCM h1').html(__IDQCM);
}

function fillTab(data){
	//reset listUser
	listUser = [];

	var tabledata = [];
	$('#nbParicipants').html(data.length);

	for(var i=0;i<data.length;i++){
		tabledata.push({"id" : i , "nom" : data[i]})
		listUser.push(data[i]);
	}

	var table = new Tabulator("#participantsTab", {
		data:tabledata,           //load row data from array
		layout:"fitColumns",      //fit columns to width of table
		//responsiveLayout:"hide",  //hide columns that dont fit on the table
		tooltips:true,            //show tool tips on cells
		pagination:"local",       //paginate the data
		paginationSize:5,         //allow 7 rows per page of data
		resizableRows:true,       //allow row order to be changed
		initialSort:[             //set the initial sort order of the data
			{column:"name", dir:"asc"},
		],
		columns:[                 //define the table columns
			{title:"id", field:"id",width:150,align:"center"},
			{title:"nom", field:"nom"},
		],
	});
}


function emit_depend_prof_or_student(){
	$.ajax({
		url : "./loggedmail",
		type : 'get',
		data : {},
		dataType : "json",
		success  : function(data){
			console.log(data)
			parseLoggedData(data)
		},
		error : function(resultat, statut, erreur)
		{
			console.log("[ERROR] -> Fail to get an user logged");
			console.log(erreur);
			socket.emit("join",{"pseudo" : __PSEUDO,"qcm_id":__IDQCM});
		}});//END AJAX
}

function parseLoggedData(data){
	if(!data.mail){socket.emit("join",{"pseudo" : __PSEUDO,"qcm_id":__IDQCM});}
	else{socket.emit("join",{"pseudo" : __PSEUDO,"flag" : "open","qcm_id":__IDQCM});}
}
