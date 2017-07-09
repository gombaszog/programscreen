/* INIT */
/*$(function() {
  initLiveTimeMaintainer();
  init();
  testjs();
});
*/
/* ONLOAD FUNCTION */
function load(){
  iframe();
  if(parameter){
    if(parameter[0] == "noheader" || parameter[1] == "noheader" || parameter[2] == "noheader" || parameter[3] == "noheader"){
      var deleteDiv = document.getElementById("container");
      deleteDiv.removeChild(deleteDiv.childNodes[1]);
    }
    else{
      initLiveTimeMaintainer();
    }
  }
  else{
    initLiveTimeMaintainer();
  }
  init();
}

function init() {
	getProgramFromLocalStorage();
	getProgramFromTheServer();
    // refresh the screen in every minute
    setInterval(renderPrograms, 60*1000);
    // refresh the program data in every 5 minutes
    setInterval(getProgramFromTheServer, 5*60*1000 + 400);

    /*
    setInterval(function(){
    if(count == 3){ // 3 == 5 min intervals
      count = 0;
      getProgramFromTheServer();
    }
    else{
      count += 1;
      renderPrograms();
    }
  }, 60*1000);
*/
}

/* FOR IFRAME PARAMETERS
parameters: noheader, nodescription, noalert, fulldescription
*/
function iframe(){
  var url = window.location.href;
  url = url.split("?");
  if(url[1]){
    parameter = url[1].split("&");
  }
  else{
    parameter = "";
  }
  return parameter;
}

/*  CONSTANT */
var days = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
var monthNames = ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"];
var serverurl = "https://www.gombaszog.sk/api/program"; //Where to get the JSON
var programData = {};
var oldProgramData = {};
var count = 0;

/* USEFUL STUFF */
function fillZeros(st){
	if((st.toString().length)<2) {
		return "0" + st.toString();
	}
	return st;
}

function month(cmonth){ // month of the year
	return monthNames[cmonth];
}

function day(cday){ // day of the week
	return days[cday];
}

/* HEADER TIME AND DATE */
function initLiveTimeMaintainer(){
  var now = new Date();
  var t = (60000 - (now.getSeconds() * 1000)) / 2;
  document.getElementById("clockheading").innerHTML = fillZeros(now.getHours()) + ":" + fillZeros(now.getMinutes());
  document.getElementById("clockdategsz").innerHTML = day(now.getDay());
  document.getElementById("clockdate").innerHTML = now.getFullYear() + ". " + month(now.getMonth()) + " " +  + now.getDate() + ".";
  var timeout = setTimeout(initLiveTimeMaintainer, t);
}

/* RENDER ACTIVE PROGRAMS */
function renderPrograms(){
  if(programData.program){
    /* FOR TEST */

    var tempdate = new Date();
    var tempsec = tempdate.getSeconds();
    var temphour = tempdate.getHours();
    var tempmins = tempdate.getMinutes();

    //var now = new Date("2017-07-15T"+fillZeros(temphour)+":"+fillZeros(tempmins)+":"+fillZeros(tempsec)+".000+0200");
    //var now = Date.now();
    var now = new Date("2017-07-12T16:00:00.000+02:00");
    var programsToRender = [];
    var nowFound = false;
    var morePrograms = 2;
    for(var i=0; i<programData.program.length; i++){
      programData.program[i].alert = false;
      var startTime = new Date(programData.program[i].start);
      var endTime = new Date(programData.program[i].end);
      if(oldProgramData.program){
        for(var k=0; k < oldProgramData.program.length; k++){
          if(oldProgramData.programSum != programData.programSum){
            if(oldProgramData.program[k].id == programData.program[i].id){
              if(oldProgramData.program[k].name != programData.program[i].name ||
                  oldProgramData.program[k].description != programData.program[i].description ||
                    oldProgramData.program[k].partner != programData.program[i].partner ||
                      oldProgramData.program[k].location != programData.program[i].location ||
                        oldProgramData.program[k].start != programData.program[i].start ||
                          oldProgramData.program[k].end != programData.program[i].end){
                  programData.program[i].alert = true;
              }
            }
          }
        }
      }

      if(startTime < now && now < endTime){
        programData.program[i].type = "folyamatban";
        programsToRender.push(programData.program[i]);
        nowFound = true;
        continue;
      }
        
      if(/*nowFound &&*/ now < startTime && morePrograms > 0){
        var difi = (startTime-now)/(60*1000);
        if(difi < 50) {
        programData.program[i].type = "hamarosan";
        }
        else {
        programData.program[i].type = "később"
        }
        programsToRender.push(programData.program[i]);
        morePrograms--;
      }
      if(morePrograms === 0){
        break;
      }
    }
    oldProgramData = {};
    var actProgram = document.getElementById("actualwrap");
    console.log(programsToRender.length + " program listázása");
    if(programsToRender.length > 0){
      actProgram.style.display = "block";
      while(actProgram.firstChild){
        actProgram.removeChild(actProgram.firstChild);
      }
      for(var i=0; i < programsToRender.length; i++){
        actProgram.appendChild(programItemCreator(programsToRender[i].id, programsToRender[i].name, programsToRender[i].description, programsToRender[i].partner, programsToRender[i].location, new Date(programsToRender[i].start), new Date(programsToRender[i].end), false, programsToRender[i].type));
      }
    }
    else{
      actProgram.style.display = "none";
    }
  }
  setTimeout(function(){
    if(document.getElementById("alertprogram")){
      var alertdiv = document.getElementById("alertprogram");
      alertdiv.setAttribute("id", "program");
    }
  }, 10*1000);
  blinker();
}

/* PROGRAM ITEM ROW CREATEOR */
function programItemCreator(id, title, description, partner, location, start, end, alert, type){
	var mainNode = document.createElement("DIV");
	var firstBox = document.createElement("DIV");
	var locationNode = document.createElement("DIV");
	var timeBlock = document.createElement("DIV");
	var timeStartNode = document.createElement("SPAN");
	var timeEndNode = document.createElement("SPAN");
    var partnerNode = document.createElement("DIV");

	var secondBox = document.createElement("DIV");
	var titleNode = document.createElement("DIV");

	var descriptionBox = document.createElement("DIV");
	var descriptionNode = document.createElement("SPAN");

	var thirdBox = document.createElement("DIV");

	var fourthBox = document.createElement("DIV");

  if(alert){
    if(parameter){
      if(parameter[0] == "noalert" || parameter[1] == "noalert" || parameter[2] == "noalert" || parameter[3] == "noalert"){
        mainNode.setAttribute("id", "program_"+id);
      }
      else{
        mainNode.setAttribute("id", "alertprogram");
      }
    }
    else{
    mainNode.setAttribute("id", "alertprogram");
    }
  }
  else{
    mainNode.setAttribute("id", "program_"+id);
  }

  mainNode.setAttribute("class", "col-xs-12 items row");
  firstBox.setAttribute("class", "col-md-2 col-xs-4");
  locationNode.setAttribute("class", "location");
  timeStartNode.setAttribute("class", "programtime-start");
  timeEndNode.setAttribute("class", "programtime-end");
  timeBlock.setAttribute("class",  "col-xs-12 timeblock");
  partnerNode.setAttribute("class", "partner")
  secondBox.setAttribute("class", "col-md-6  col-xs-4");
  titleNode.setAttribute("class", "col-md-12 itemtitle");
  descriptionNode.setAttribute("class", "");
  thirdBox.setAttribute("class", "col-md-4 col-xs-4");


 if(type=="folyamatban") {
    timeStartNode.setAttribute("class", "programtime-start running");
    timeEndNode.setAttribute("class", "programtime-end running");
  }

	var startShow = fillZeros(start.getHours()) + ":" + fillZeros(start.getMinutes());
	var endShow = ((new Date(end-start)).getMinutes() === 1)?"":" - " + fillZeros(end.getHours()) + ":" + fillZeros(end.getMinutes());
	var locShow = location ? location : "";
	var partnerShow = partner ? partner: "";
    var typeShow = type? type: "";
    var titleShow = title? title: "";
    var descriptionShow = description? description: "";

	mainNode.appendChild(firstBox);

	firstBox.appendChild(timeBlock);

	timeBlock.appendChild(timeStartNode);
	timeBlock.appendChild(timeEndNode);

	mainNode.appendChild(secondBox);
	secondBox.appendChild(titleNode);

    mainNode.appendChild(thirdBox);
    thirdBox.appendChild(locationNode);

    mainNode.appendChild(fourthBox);
    fourthBox.appendChild(partnerNode);

  if(parameter){
    if (parameter[0] == "nodescription" || parameter[1] == "nodescription" || parameter[2] == "nodescription" || parameter[3] == "nodescription"){
    }
    else if(parameter[0] == "fulldescription" || parameter[1] == "fulldescription" || parameter[2] == "fulldescription" || parameter[3] == "fulldescription"){
      descriptionBox.setAttribute("class", "col-md-12 itemdescriptionfull")
      secondBox.appendChild(descriptionBox);
      descriptionBox.innerHTML = descriptionShow;
      }
    else{
      descriptionBox.setAttribute("class", "col-md-12 itemdescription")
      secondBox.appendChild(descriptionBox);
      descriptionBox.appendChild(descriptionNode);
      descriptionNode.innerHTML = descriptionShow;
    }
  }
  else{
    descriptionBox.setAttribute("class", "col-md-12 itemdescription")
    secondBox.appendChild(descriptionBox);
    descriptionBox.appendChild(descriptionNode);
    descriptionNode.innerHTML = descriptionShow;
  }

  timeStartNode.innerHTML = startShow;
	timeEndNode.innerHTML = endShow;
  locationNode.innerHTML = locShow;
partnerNode.innerHTML = partnerShow;
  titleNode.innerHTML = titleShow; /*+ " - " + "<span class='typeshow'>" + typeShow + "</span>";*/
	descriptionNode.innerHTML = descriptionShow;

	return mainNode;
}


/* UPDATE LOCAL STORAGE */
function updateStorage(){
  localStorage.gombaProgramData = JSON.stringify(programData);
}

/* LOCAL REQUEST */
function getProgramFromLocalStorage() {
	if (localStorage.gombaProgramData) {
		programData = JSON.parse(localStorage.gombaProgramData);
	}
}


/* SERVER REQUEST */
function getProgramFromTheServer(){
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET", serverurl);
  xmlhttp.onreadystatechange = function(){
    if(xmlhttp.readyState === 4){
      if(xmlhttp.status === 200){
        var answer = JSON.parse(xmlhttp.responseText);
        if(!programData.programSum || programData.programSum != answer.sum){
          oldProgramData.program = programData.program;
          oldProgramData.programSum = programData.programSum;
          programData.programSum = answer.sum;
          programData.program = answer.program;
          console.log("Programok frissítve!");
          updateStorage();
        }
        else{
          console.log("Programok aktuálisak!");
        }
      }
      else{
        console.log("Hiba: " + xmlhttp.statusText);
      }
      renderPrograms();
    }
  }
  xmlhttp.send();
}
