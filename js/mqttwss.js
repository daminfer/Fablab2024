
var dataJson;// les données reçues au format json

var connected_flag= 0 // indicateur de connexion au serveur mqtt
var mqtt; // objet pour connexion au serveur mqtt
var reconnectTimeout = 2000;
var host="mqtt.univ-cotedazur.fr"; // url du serveur 
var port=443;// 443 uns ou 8083 wp  port du serveur mqtt
var row=0; // ligne pour affichage des données reçues dans l'onglet paramètre
var clientId; // identification client pour le mqtt (ce n'est pas le login)
var out_msg=""; // message reçu
var mcount=0; // variable de comptage pour afficher un certain nombre de lignes des données reçues

var demo, // références à des élements html
	htmlmatrix,
    base,
    mat = new Array(),// contient des élements html led
	rotationL = 0,
    rotationR = 0;
	rotationA = 0; // alternance

var Nblignes = 8;
var Nbcolonnes = 8;
var Matrix = new Array(); //valeur des leds 0 ou 1  


var topicPub1 = "FABLAB_20_21/Matrix/in/";
var topicSub1 = "FABLAB_20_21/Matrix/out/";


$(document).ready(function() {// attend que la page soit chargée avant de lancer le script javascript
                //$(function() { // autre écriture de la ligne précédente
			
	demo = document.getElementById("demo"),
    htmlmatrix = document.getElementById("matrix"),
    base = document.getElementById("base");

	for (var i = 0; i < Nblignes; i++){
		mat[i] = newLine(i);// mat contient les lignes du tableau
		Matrix[i] = newLineValeur();// contient les valeurs 0 ou 1
	} 

	
// désactivation des boutons
//$("#btn1").css({"pointer-events":"none","opacity":"0.4"});

});// fin doc ready					

	// Création d'une ligne contenant des elements html LED
function newLine(row){
  var line = new Array();
  for (var i = 0; i < Nbcolonnes; i++){
    var led = document.createElement("div");
	var inputCol = document.createElement("input");
	inputCol.setAttribute("type", "hidden");
	inputCol.setAttribute("value", i);
	led.appendChild(inputCol);
	var inputRow = document.createElement("input");
	inputRow.setAttribute("type", "hidden");
	inputRow.setAttribute("value", row);
	led.appendChild(inputRow);
    led.onclick = function(){
		onOff(this);
	};
    led.className = "led off";
    htmlmatrix.appendChild(led);
    line[i] = led;
  }
  return line;
}

function newLineValeur(){ // valeurs des leds
  var line = new Array();
  for (var i = 0; i < Nbcolonnes; i++){
    line[i] = 0;// leds éteintes au départ
  }
  return line;
}


function clearM() { // pour effacer
	stop();
	for ( var i = 0; i < mat.length; i++) 
		for ( var j = 0; j < mat[i].length; j++){
			mat[i][j].className = "led off";
			Matrix[i][j] = 0; // on éteint
		}
	if (connected_flag==1){
	publishMsg(topicPub1,'{"Efface":true]}',1,false);
	}
}

function stop() { // pour arrêter le mvt gauche ou droite
	clearInterval(rotationL);
	clearInterval(rotationR);
	if (connected_flag==1){ // si connexion au serveur mqtt
	publishMsg(topicPub1,'{"Rotation":0}',1,false);
	
	}
	rotationL = 0;
	rotationR = 0;
	rotationA = 0;
}

function rotate(dir) { // déplacement à gauche ou à droite
    if (dir == "left" && rotationL == 0){
      rotationL =  setInterval(function(){moveLeft()},500);
	  if (connected_flag==1){
	  publishMsg(topicPub1,'{"Rotation":1}',1,false);
	  }
      clearInterval(rotationR);// 
      rotationR = 0;
    }
    else if (dir == "right" && rotationR == 0){
      rotationR =  setInterval(function(){moveRight()},500);
	  if (connected_flag==1){
	  publishMsg(topicPub1,'{"Rotation":2]}',1,false);
	  }
      clearInterval(rotationL);
      rotationL = 0;
    }
	rotationA = 0;
}

function moveLeft(){ //déplacement à gauche
  for (var i = 0; i < mat.length; i++){
    var first = mat[i][0].className; // pour les élements Html
    for ( var j = 0; j < mat[i].length-1; j++) mat[i][j].className = mat[i][j+1].className;
    mat[i][mat[i].length-1].className = first;
	
	var firstVal = Matrix[i][0]; // pour les valeurs 
    for ( var j = 0; j < Matrix[i].length-1; j++) Matrix[i][j] = Matrix[i][j+1];
    Matrix[i][Matrix[i].length-1] = firstVal;
  
  
  }
}

function moveRight(){
  for (var i = 0; i < mat.length; i++){
    var last = mat[i][mat[i].length-1].className;
    for (var j = mat[i].length-1; j > 0; j--) mat[i][j].className = mat[i][j-1].className;
    mat[i][0].className = last;
	
	var lastVal = Matrix[i][Matrix[i].length-1];
    for (var j = Matrix[i].length-1; j > 0; j--) Matrix[i][j] = Matrix[i][j-1];
    Matrix[i][0] = lastVal;
  }
}



function fill() { // tout allumer
    for ( var i = 0; i < mat.length; i++) 
    for ( var j = 0; j < mat[i].length; j++){
		mat[i][j].className = "led";
		Matrix[i][j]= 1;// on allume
	} 
    stop();
	Publier();
}

function alterner() { // alterner

	clearInterval(rotationR);
	rotationR = 0;
	if (rotationA == 0 ){
			//stop();

			for ( var i = 0; i < mat.length/2; i++) 
			for ( var j = 0; j < mat[i].length/2; j++){
				mat[i*2][2*j].className = "led";
				Matrix[i*2][2*j]= 1;// on allume
				mat[i*2][2*j+1].className = "led off";
				Matrix[i*2][2*j+1]= 0;// on eteind
				
				mat[i*2+1][2*j].className = "led off";
				Matrix[i*2+1][2*j]= 0;// on eteind
				mat[i*2+1][2*j+1].className = "led";
				Matrix[i*2+1][2*j+1]= 1;//

			}
			rotationL =  setInterval(function(){moveLeft()},800);
			if (connected_flag==1){
				publishMsg(topicPub1,'{"Rotation":3}',1,false);// commande alterner pour l'arduino
			}
			rotationA = 1;
	}
	if (rotationL == 0 ){
		rotationL =  setInterval(function(){moveLeft()},500);
	}

}

// allumer ou éteindre une led par click
function onOff (led) {
  if (led.className == "led off"){
		led.className = "led"; // changement de la classe pour l'affichage html
		//console.log(" Col "+led.childNodes[0].value);
		//console.log(" Row "+led.childNodes[1].value);
		Matrix[led.childNodes[1].value][led.childNodes[0].value]= 1;// modification des valeurs on allume
		console.log(Matrix[led.childNodes[1].value][led.childNodes[0].value]);
	}
  else{
		led.className = "led off";
		Matrix[led.childNodes[1].value][led.childNodes[0].value]= 0;// on éteint
  }
	Publier();
}


function miseAjour(Arr){// après pour réception mqtt mise àjour de l'affichage des leds
	var i = 0;
		while (i < Arr.length){
			var j = 0;
			while (j< Arr[i].length){
				if ( Arr[i][j] == 1){
					mat[i][j].className = "led";
				}else {
					mat[i][j].className = "led off";
				}
				j++;
			}
			i++;
	  }
}

function Publier(){ // envoyer sur mqtt
	if (connected_flag==1){
		publishMsg(topicPub1,'{"IdClient":"'+clientId+'","Display":['+valeurLigne(0)+','+valeurLigne(1)+','+valeurLigne(2)+','+valeurLigne(3)+','+valeurLigne(4)+','+valeurLigne(5)+','+valeurLigne(6)+','+valeurLigne(7)+']}',0,false);
		console.log('{"Display":['+valeurLigne(0)+','+valeurLigne(1)+','+valeurLigne(2)+','+valeurLigne(3)+','+valeurLigne(4)+','+valeurLigne(5)+','+valeurLigne(6)+','+valeurLigne(7)+']}');
		//publishMsg(topicPub1,'{"Display":[255,255,255,0,0,0,0,255]}',0,false);
		
	}
}

function valeurLigne(num){ // renvoie la valeur d'une ligne en décimal
	var i =0;
	var valeur = 0;
	while (i < Matrix[num].length){
		valeur += Matrix[num][i]*Math.pow(2,7-i);
		i++;
	}
	return valeur;
}

