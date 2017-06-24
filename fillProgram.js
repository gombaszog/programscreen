var programData;

var programOpen = {};

function fillZeros(st){
	if((st.toString().length)<2) {
		console.log("0" + st.toString());
		return "0" + st.toString();
	}
	return st;
}



function getProgramFromLocalStorage() {
	if (localStorage.gombaProgramData) {
		programData = JSON.parse(localStorage.gombaProgramData);
	}
}

function init() {
	programData = {};
	getProgramFromLocalStorage();
	getProgramFromTheServer();
	renderPrograms();
}



function renderPrograms() {
	console.log("Rendering actual programs.");
	if(programData.program) {
		// var now = Date.now();
		var now = new Date("2017-07-13T16:50:00.000+02:00");
		var morePrograms = 2;
		var programsToRender = [];
		var nowFound = false;
		for(var i=0; i<programData.program.length; i++){
			var startTime = new Date(programData.program[i].start);
			var endTime = new Date(programData.program[i].end);
			// if the time is in the interval, render it.
			if (startTime < now && now < endTime) {
				// console.log("As ongoing program, will show " + programData.program[i].name + " " + programData.program[i].id);
				programData.program[i].type = "ongoing";
				programsToRender.push(programData.program[i]);
				nowFound = true;
				continue;
			}
			// if no interval specified, if the program started less then half our before, render it
			var difi = (now-startTime)/(60*1000);
			if (0 < difi && difi < 20) {
				// console.log("As just started program, will show " + programData.program[i].name);
				programData.program[i].type = "ongoing";
				programsToRender.push(programData.program[i]);
				nowFound = true;
				continue;
			}
			// render the morePrograms number of following programs.
			if(nowFound && now < startTime && morePrograms > 0){
				// console.log("As next not started program, will show " + programData.program[i].name);
				var difi = (startTime-now)/(60*1000);
				if (difi < 50) {
					programData.program[i].type = "soon";
				} else {
					programData.program[i].type = "later";
				}
				programsToRender.push(programData.program[i]);
				morePrograms--;
			}
			if (morePrograms === 0) {
				break;
			}
		}
		console.log("Will render " + programsToRender.length + " actual programs");
		if(programsToRender.length > 0) {
			var actProgramHeading = document.getElementById("actualwrap");
			actProgramHeading.style.display = "block";
			while (actProgramHeading.firstChild) {
				actProgramHeading.removeChild(actProgramHeading.firstChild);
			}
			for (var i=0; i < programsToRender.length; i++) {
				console.log(programsToRender[i].id + programsToRender[i].name + programsToRender[i].description + programsToRender[i].partner + programsToRender[i].location + programsToRender[i].start +  programsToRender[i].end  + false)
				actProgramHeading.appendChild(programItemCreator(programsToRender[i].id, programsToRender[i].name, programsToRender[i].description, programsToRender[i].partner, programsToRender[i].location, new Date(programsToRender[i].start), new Date(programsToRender[i].end), false, programsToRender[i].type));
			}
		} else {
			var actProgram = document.getElementById("actualwrap");
			actProgram.style.display = "none";
		}

	}
}

function programItemCreator(id, title, description, organizer, location, start, end, lookOpen, type){
	var mainNode = document.createElement("DIV");
	var firstBox = document.createElement("DIV");
	var locationNode = document.createElement("DIV");
	var yellowNode = document.createElement("DIV");
	var timeBlock = document.createElement("DIV");
	var timeStartNode = document.createElement("SPAN");
	var timeEndNode = document.createElement("SPAN");
	var secondBox = document.createElement("DIV");
	var titleNode = document.createElement("DIV");
	var descriptionBox = document.createElement("DIV");
	var descriptionNode = document.createElement("SPAN");

	mainNode.setAttribute("class", "col-xs-12 items row");
  firstBox.setAttribute("class", "col-md-2 col-xs-4");
	timeBlock.setAttribute("class",  "col-xs-12 timeblock");
	locationNode.setAttribute("class", "programloc col-xs-12");

	secondBox.setAttribute("class", "col-md-10 col-xs-8");
	titleNode.setAttribute("class", "col-md-12 itemtitle");
	descriptionBox.setAttribute("class", "col-md-12 itemdescription")
	descriptionNode.setAttribute("class", "");

	timeStartNode.setAttribute("class", "programtime-start");
	timeEndNode.setAttribute("class", "programtime-end");
	yellowNode.setAttribute("class", "col-md-12 yellownode " + type);



	var startShow = fillZeros(start.getHours()) + ":" + fillZeros(start.getUTCMinutes());
	var endShow = ((new Date(end-start)).getUTCMinutes() === 1)?"":" - " + fillZeros(end.getHours()) + ":" + fillZeros(end.getUTCMinutes());
	var locShow = location ? location : "&nbsp;";
	var orgShow = (organizer?" - " + organizer:"");

	mainNode.appendChild(firstBox);
	firstBox.appendChild(timeBlock);
	firstBox.appendChild(locationNode);
	firstBox.appendChild(yellowNode);
	timeBlock.appendChild(timeStartNode);
	timeBlock.appendChild(timeEndNode);
	mainNode.appendChild(secondBox);
	secondBox.appendChild(titleNode);
	secondBox.appendChild(descriptionBox);
	descriptionBox.appendChild(descriptionNode);

	titleNode.innerHTML = title;
	timeStartNode.innerHTML = startShow;
	timeEndNode.innerHTML = endShow;
  locationNode.innerHTML = locShow;
	descriptionNode.innerHTML = description;


	return mainNode;
}

function humanDayName(index) {
	var days = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
	return days[index];
}

function humanDate(notHumanDate) {
	var dd = new Date(notHumanDate);
	var day = dd.getDate();
	var monthIndex = dd.getMonth();
	var year = dd.getFullYear();
	var dayname = humanDayName(dd.getDay());
	var hour = dd.getHours();
	var minutes = dd.getMinutes();
	return hour + ":" + minutes + " " + year + "/" + (1 + monthIndex) + "/" + day + "/" + dayname;
}

var monthNames = ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"];

function moty(cmonth){ // month of the year
	return monthNames[cmonth] || "Július";
}

var days = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];

function dotw(cday){ // day of the week
	return days[cday];
}

function initLiveTimeMaintainer() {
	var startDate = new Date("2017-07-08T00:01:00.000+02:00");
	var endDate = new Date("2017-07-08T23:59:00.000+02:00");
	var now = new Date();
	document.getElementById("clockheading").innerHTML = fillZeros(now.getHours()) + ":" + fillZeros(now.getMinutes());
	if (startDate < now && now < endDate) {
		document.getElementById("clockdategsz").innerHTML = getGDay(now.getUTCDate()).name + ", " + dotw(now.getDay());
	}
	else {
		document.getElementById("clockdategsz").innerHTML = dotw(now.getDay());
	}
	document.getElementById("clockdate").innerHTML = now.getFullYear() + ". " + moty(now.getUTCMonth()) + " " +  + now.getUTCDate() + ".";
	liveClockRunner = setInterval(function() {
		now = new Date();
		document.getElementById("clockheading").innerHTML = fillZeros(now.getHours()) + ":" + fillZeros(now.getMinutes());
		if (startDate < now && now < endDate) {
			document.getElementById("clockdategsz").innerHTML = getGDay(now.getUTCDate()).name + ", " + dotw(now.getDay());
		}
		else {
			document.getElementById("clockdategsz").innerHTML = dotw(now.getDay());
		}
		document.getElementById("clockdate").innerHTML = now.getFullYear() + ". " + moty(now.getUTCMonth()) + " " +  + now.getUTCDate() + ".";
	}, 30000);
}

function updateStorage() {
	// clone
	localStorage.gombaProgramData = JSON.stringify(programData);
}

function getProgramFromTheServer() {
	//*
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET", 'https://kadbudapest.hu/cachemeteo/cacheProgram.php');
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4) {
			if(xmlhttp.status === 200){
				var answer = JSON.parse(xmlhttp.responseText);
				if(!programData.programSum || programData.programSum != answer.sum){
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
	/*
	$.ajax({
	    url: "https://gombaszog.sk/api/program",

	    type: "GET",

	    // Tell jQuery we're expecting JSONP
	    dataType: "jsonp",

	    // Work with the response
	    success: function( response ) {
	        console.log( response ); // server response
	    }
	});*/
}

function periodicallyRefresh() {
	// refresh the screen in every minute
	setInterval(renderPrograms, 60*1000);
	// refresh the program data in every 5 minutes
	setInterval(getProgramFromTheServer, 5*60*1000 + 400);
}


$(function() {
	init();
	initLiveTimeMaintainer();
});
