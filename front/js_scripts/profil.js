$(document).ready(function() {
	loadUserQCM(userLogged);
});

function loadUserQCM(userID){
	$.ajax({
		url : "./qcmList",
		type : 'get',
		data : {"createur" : userID},
		dataType : "json",
		success  : function(data){
			console.log(data)
			parseDataListQCM(data)
		},
		error : function(resultat, statut, erreur){
			console.log("[ERROR] -> Fail to logOut()");
			console.log(erreur);
		}
	});
}

function parseDataListQCM(data){
	var tabledata = [];

	for(var i=0;i<data.length;i++){
		let str_action = "<a href='lancement?id="+data[i]._id+"&pseudo="+userLogged+"'> <i class='fas fa-play-circle launchIcon'></i> </a>";
		tabledata.push({"titre" : data[i].titre ,"nombre" : data[i].questions.length,"lancer" : str_action})
	}

	var table = new Tabulator("#qcm_tab", {
		data:tabledata,           //load row data from array
		layout:"fitColumns",      //fit columns to width of table
		//responsiveLayout:"hide",  //hide columns that dont fit on the table
		tooltips:true,            //show tool tips on cells
		pagination:"local",       //paginate the data
		paginationSize:5,         //allow 7 rows per page of data
		resizableRows:true,       //allow row order to be changed
		headerFilterPlaceholder:"filter data...", //set column header placeholder text
		initialSort:[             //set the initial sort order of the data
			{column:"titre", dir:"asc"},
		],
		columns:[                 //define the table columns
			{title:"Titre", field:"titre"},
			{title:"Questions", field:"nombre",width:150, align:"center"},
			{title:"Lancer", field:"lancer",formatter:"html",width:100, align:"center"},
		],
	});
}
