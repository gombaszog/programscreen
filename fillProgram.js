/* INIT */
$(function() {
  initLiveTimeMaintainer();
  init();
});

function init() {
	getProgramFromLocalStorage();
	getProgramFromTheServer();
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

}

/*  CONSTANT */
var days = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
var monthNames = ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"];
var serverurl = "https://gombaszog.sk/api/program"; //Where to get the JSON
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
    var now = Date.now();
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
      if(nowFound && now < startTime && morePrograms > 0){
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
    if(programsToRender.length > 0){
      actProgram.style.display = "block";
      while(actProgram.firstChild){
        actProgram.removeChild(actProgram.firstChild);
      }
      for(var i=0; i < programsToRender.length; i++){
        actProgram.appendChild(programItemCreator(programsToRender[i].id, programsToRender[i].name, programsToRender[i].description, programsToRender[i].partner, programsToRender[i].location, new Date(programsToRender[i].start), new Date(programsToRender[i].end), programsToRender[i].alert, programsToRender[i].type));
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
}

/* PROGRAM ITEM ROW CREATEOR */
function programItemCreator(id, title, description, organizer, location, start, end, alert, type){
	var mainNode = document.createElement("DIV");
	var firstBox = document.createElement("DIV");
	var locationNode = document.createElement("DIV");
	var timeBlock = document.createElement("DIV");
	var timeStartNode = document.createElement("SPAN");
	var timeEndNode = document.createElement("SPAN");
  var organizerNode = document.createElement("DIV");

	var secondBox = document.createElement("DIV");
	var titleNode = document.createElement("DIV");

	var descriptionBox = document.createElement("DIV");
	var descriptionNode = document.createElement("SPAN");

  if(alert){
    mainNode.setAttribute("id", "alertprogram");
  }
  else{
    mainNode.setAttribute("id", "program_"+id);
  }

  mainNode.setAttribute("class", "col-xs-12 items row")
  firstBox.setAttribute("class", "col-md-2 col-xs-4");
	locationNode.setAttribute("class", "programloc col-xs-12");
  timeStartNode.setAttribute("class", "programtime-start");
	timeEndNode.setAttribute("class", "programtime-end");
  timeBlock.setAttribute("class",  "col-xs-12 timeblock");
  organizerNode.setAttribute("class", "organizer col-xs-12")

	secondBox.setAttribute("class", "col-md-10 col-xs-8");
	titleNode.setAttribute("class", "col-md-12 itemtitle");
	descriptionBox.setAttribute("class", "col-md-12 itemdescription")
	descriptionNode.setAttribute("class", "");

	var startShow = fillZeros(start.getHours()) + ":" + fillZeros(start.getMinutes());
	var endShow = ((new Date(end-start)).getMinutes() === 1)?"":" - " + fillZeros(end.getHours()) + ":" + fillZeros(end.getMinutes());
	var locShow = location ? location : "";
	var orgShow = organizer? organizer: "";
  var typeShow = type? type: "";
  var titleShow = title? title: "";
  var descriptionShow = description? description: "";

	mainNode.appendChild(firstBox);

	firstBox.appendChild(timeBlock);
	firstBox.appendChild(locationNode);
	firstBox.appendChild(organizerNode);
	timeBlock.appendChild(timeStartNode);
	timeBlock.appendChild(timeEndNode);

	mainNode.appendChild(secondBox);
	secondBox.appendChild(titleNode);
	secondBox.appendChild(descriptionBox);
	descriptionBox.appendChild(descriptionNode);

  timeStartNode.innerHTML = startShow;
	timeEndNode.innerHTML = endShow;
  locationNode.innerHTML = locShow;
  organizerNode.innerHTML = orgShow;

  titleNode.innerHTML = titleShow + " - " + "<span class='typeshow'>" + typeShow + "</span>";
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
