var programData;

function getProgramFromLocalStorage() {
	if (localStorage.gombaProgramData) {
		programData = localStorage.gombaProgramData;
	}
}

function init() {
	getProgramFromLocalStorage();
	reRead();
}

function renderPrograms() {

}

function updateStorage() {
	// clone
	localStorage.gombaProgramData = JSON.parse(JSON.stringify(programData));
}

function getProgramFromTheServer() {
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET", 'https://gombaszog.sk/api/program');
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4) {
			if(xmlhttp.status === 200){
				var answer = JSON.parse(xmlhttp.responseText);
				if(!programData.programSum || programData.programSum != answer.sum){
					// console.log("Programs will be updated, old time is " + parseInt(gd.time) + ", actual is " + parseInt(answer.time));
					programData.programSum = answer.sum;
					programData.program = answer.program;
					console.log("Programok frissítve!");
					updateStorage();
					renderPrograms();
				} else {
					console.log("Program is upToDate");
				}
			}else{
				console.log('Program fetch error: ' + xmlhttp.statusText )
				renderPrograms();
			}
		}
	}
	xmlhttp.send();
}

function periodicallyRefresh() {
	// refresh the screen in every minute
	setInterval(renderPrograms, 60*1000);
	// refresh the program data in every 5 minutes
	setInterval(getProgramFromTheServer, 5*60*1000 + 400);
}

$(function() {
	getProgramFromTheServer();
});