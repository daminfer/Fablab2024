// Fonctions pour la connexion au serveur MQTT
function onConnectionLost(){ // si connection perdue
	connected_flag=0;
	console.log("connection perdue");
	document.getElementById("btn_action").value = "Connexion";
	document.getElementById("status").innerHTML = "<b>Déconnecté !!! </b>";
	document.getElementById("statusparam").innerHTML = "<b>Déconnecté !!! <b>";
	document.getElementById("status_messages").innerHTML ="<b>Déconnecté !!!!</b>";

}
function onFailure(message) { // si erreur de connexion
	console.log("Erreur de connexion !!");
	document.getElementById("status_messages").innerHTML = "Erreur de connexion - Essayez à nouveau ";
	setTimeout(MQTTconnect, reconnectTimeout); // reconnexion automatique après un certain temps
	}

function onMessageArrived(r_message){// quand un message arrive
	console.log("message arrivé : "+r_message.payloadString.toString());
	try {
			dataJson= JSON.parse(r_message.payloadString.toString());// récupération des données JSON
	}
	catch(err){// si erreur
		document.getElementById("status_messages").innerHTML = "Erreur Json en réception: "+err;
		dataJson = "";
	}
	if(dataJson.hasOwnProperty('IdClient')&&(connected_flag==1)){
		if(dataJson.IdClient != clientId){
				if(dataJson.hasOwnProperty('Display')&&(connected_flag==1)){ // 

					var i = 0;
					while (i < Nblignes){
							var j = 0;
							while (j < Nbcolonnes){
								var num = Number(dataJson.Display[i]);
								Matrix[i][j] = (num & Math.pow(2,7-j))/Math.pow(2,7-j);
								j++;
							}
					i++;
					}
					//console.log("Matrix "+Matrix[0][i]);
					miseAjour(Matrix);

					
				}
				
				if(dataJson.hasOwnProperty('Rotation')){ // si dans la json le champ ...
					if (dataJson.Rotation == 1){
							rotate('left');
					}
					if (dataJson.Rotation == 2){
							rotate('right');
					}
					if (dataJson.Rotation == 0) {
					//		console.log("stop rotation");
							clearInterval(rotationL);
							clearInterval(rotationR);
							rotationL = 0;
							rotationR = 0;
					}
					if (dataJson.Rotation == 3) {
								alterner()

					}
					console.log("rotation "+dataJson.Rotation);
				}
		}
	}
	
	try {// on essaie les instructions suivantes (si une erreur survient ça ne bloque pas le programme)
		out_msg="Message reçu : "+r_message.payloadString+" - ";// affichage informations du message
		out_msg=out_msg+" Sujet : "+r_message.destinationName +"<br/>";
		document.getElementById("out_messages").innerHTML+=out_msg;
		if (row==5){// comptage des lignes pour l'affichage
			row=1;
			document.getElementById("out_messages").innerHTML=out_msg;
			}
		else
			row+=1;
			mcount+=1;
			//console.log(mcount+"  "+row);
		}
	catch(err){// si erreur
		document.getElementById("out_messages").innerHTML="erreur : "+err.message;
	}
}

function onConnect() { // fonction qui est exécutée lorsque le connexion au serveur MQTT est réalisée
  // lorsque la connexion est effectuée, s'abonne à des sujets et envoie un message pour connaitre l'état des leds
document.getElementById("status_messages").innerHTML ="Connected to "+host +" on port "+port;
connected_flag=1;// on est connecté au serveur MQTT
document.getElementById("btn_action").value = "Déconnexion";
document.getElementById("btn_action").style.backgroundColor = "#40f169";
document.getElementById("status").innerHTML = "<b>Connecté</b>";
document.getElementById("statusparam").innerHTML = "<b>Connecté</b>";
console.log("on Connect "+connected_flag);
suscribe_topics(topicSub1,1);
publishMsg(topicPub1,'{"EtatsLED":true}',0,false);// pour savoir si les leds sont allumées ou éteintes

$("#btn1").css({"pointer-events":"auto","opacity":"1"});
//$("#btn2").css({"pointer-events":"auto","opacity":"1"});

}

// fonction pour se connecter ou se deconnecter du serveur MQTT
function ConnexDeconnex()
  {
	if (connected_flag==1){// deconnexion
		mqtt.disconnect();
		connected_flag==0;
		document.getElementById("btn_action").value = "Connexion";
		document.getElementById("btn_action").style.backgroundColor = "#ff7e8b";
		$("#btn1").css({"pointer-events":"none","opacity": "0.4"});
		
	}else {// connexion
		MQTTconnect();
	}
}

// fonction pour se connecter au serveur MQTT
function MQTTconnect() {
	var clean_sessions=document.forms["connform"]["clean_sessions"].value;// lecture du formulaire
	var user_name=document.forms["connform"]["username"].value;
	console.log("clean= "+clean_sessions);
	var password=document.forms["connform"]["password"].value;

	if (clean_sessions=document.forms["connform"]["clean_sessions"].checked)
		clean_sessions=true
	else
		clean_sessions=false

	document.getElementById("status_messages").innerHTML ="";
	var s = document.forms["connform"]["server"].value;
	var p = document.forms["connform"]["port"].value;
	if (p!="")
	{
		port=parseInt(p);
		}
	if (s!="")
	{
		host=s;
		console.log("host"+host);
	}

	console.log("connexion à "+ host +" "+ port +"clean session="+clean_sessions);
	clientId = "iot_20"+RandomString(8);// création d'un numéro d'identification pour le client, ce numéro doit être unique
	console.log("clientId "+ clientId);
	document.getElementById("status_messages").innerHTML='connexion en cours...';
	
	mqtt = new Paho.MQTT.Client(host,port,clientId); // création de l'objet connexion au serveur MQTT

	var options = { // options pour le connexion
		timeout: 30,
		cleanSession: clean_sessions,
		onSuccess: onConnect,
		onFailure: onFailure,
		useSSL:true,
	};
	
	if (user_name !="")
		options.userName=document.forms["connform"]["username"].value;
	if (password !="")
		options.password=document.forms["connform"]["password"].value;
	
	mqtt.onConnectionLost = onConnectionLost;// fonctions qui seront lancées lorsque le connexion est perdue ou lorsqu'un message arrive.
	mqtt.onMessageArrived = onMessageArrived;

	if (password !=""){
		mqtt.connect(options);
	}else {
		$('#monTab a[href="#menu2"]').tab('show');// sélectionne le menu2 si pas de mot de passe pour la connexion
	}
	return false;// nécessaire ici pour le formulaire (si false les données sont gardées dans le navigateur et ne sont pas envoyées vers un autre fichier)
}


// fonction pour s'abonner à un sujet
function suscribe_topics(topic,qos){
	document.getElementById("status_messages").innerHTML ="";
	if (connected_flag==0){
		out_msg="<b>Pas de connexion, les messages ne peuvent être envoyés</b>"
		console.log(out_msg);
		document.getElementById("status_messages").innerHTML = out_msg;
	}
	var stopic= topic.toString();
	var sqos = parseInt(qos);
	if (sqos>2)
		sqos=0;
		console.log("Abonnement au sujet : "+stopic +" QOS " +sqos);
		document.getElementById("status_messages").innerHTML = " Abonnement au sujet : "+stopic;
	var soptions={
		qos:sqos,
	};
	mqtt.subscribe(stopic,soptions);
}

// publier un message
function publishMsg(topic,data,qos,retain){
	if (connected_flag==0){
		out_msg="<b>Pas de connexion, les messages ne peuvent être envoyés</b>"
		console.log(out_msg);
	}
	var pqos=parseInt(qos);
	if (pqos>2)
		pqos=0;
	var msg = data;
		console.log(msg);

	var ptopic = topic;
	var pretain = retain;
	if (pretain)
		retain_flag=true;
	else
		retain_flag=false;
	var message = new Paho.MQTT.Message(msg);
	if (ptopic=="")
		message.destinationName = "test-topic";
	else
		message.destinationName = ptopic;
	message.qos=pqos;
	message.retained=retain_flag;
	mqtt.send(message);
}

// autres fonctions

// génération d'une chaine de caractères aléatoires
function RandomString(longueur){
	return Math.random().toString(30).substr(2, longueur+2)
}


