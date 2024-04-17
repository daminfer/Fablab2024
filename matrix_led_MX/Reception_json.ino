
// fonction ReceptionChaine 

// pour test tapez dans la console :  {"Display":[60,0,255,0,156,0,200,0]} choisir la bonne vitesse de communicaton et nouvelle ligne dans la console) 
// ou {"Rotation":1}  
// ou {"Rotation":2} // ou {"Rotation":0} ....ou {"Rotation":3} pour écran la fonction alterner....
 
void ReceptionChaine(String chaine){
  // réservation mémoire (512 octets)
  StaticJsonDocument<512> docR; // document au format JSON pour la Réception 
  String IdClient = "-";
  DeserializationError error = deserializeJson(docR, chaine); // lecture de la chaine et transformation au format Json
  //Serial.println("fonction Réception lancée ! "); 
  JsonObject obj = docR.as<JsonObject>();// Création d'ou objet JSON qui permet certaines opérations : comme vérifier si un champ existe dans le document json docRn 
  
  // Test pour savoir si le décodage de la chaine en json est correct
  if (error) {
      if (error != "EmptyInput"){// si la ligne est vide ne le signale pas si non affiche le type de l'erreur
        Serial.print(F("Erreur deserializeJson() : "));
        Serial.println(error.c_str());
      }
  }
  
  if (obj.containsKey("IdClient")) {//
      IdClient = docR["IdClient"].as<String>(); 
      //
  }
  
  if (obj.containsKey("Display")) { // si le champ Display existe dans l'objet Json on modifie 
      for(int i=0;i<8;i++) {
          Matrix[i] = (byte)docR["Display"][i];
      }
      //Serial.println(b[0],BIN);
      Serial.println("OK Reçu");
      affiche(Matrix);
      flag = true;
  }
  
  if (obj.containsKey("Efface")) {// 
      bool Eff = (bool)docR["Efface"];
      if (Eff){
        efface();
      }
      flag = true;
  }
  
  if (obj.containsKey("Rotation")) {// 
      rotation = (int)docR["Rotation"];
      if (rotation == 3){
           byte M1[8]={0x55,0xAA,0x55,0xAA,0x55,0xAA,0x55,0xAA};
           miseAjour(M1);
      }     
      flag=true;
      
  }

  if (obj.containsKey("EtatsLED")) {// si l'état des leds est demandé on met le flag à true et les valeurs seront renvoyées vers le serveur MQTT
     if ((bool)docR["EtatsLED"]){
         flag =true;
     }    
  }
  
  if (flag){  // si flag  == true > on renvoie l'état des leds au format JSON et le type de mouvement gauche ou droite
    String reponse = "{\"Display\":["; 
    reponse = reponse + Matrix[0]+","+ Matrix[1]+","+ Matrix[2]+","+Matrix[3]+","+ Matrix[4]+","+Matrix[5]+","+ Matrix[6]+","+Matrix[7]+"],\"Rotation\":"+rotation+",\"IdClient\":\""+IdClient+"\"}";
    Serial.println(reponse);
    flag =false;
    
  }
}// fin fonction RéceptionChaine
