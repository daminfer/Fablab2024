
/* Evenement  : SerialEvent, déclenché chaque fois qu'une caractère arrive sur le port série .
  c'est la console ou le client connecté via MQTT qui envoie les caractères
 */

void serialEvent() {
  while (Serial.available()) {
    // lecture du caractère tant qu'il n'y a pas de nouvelle ligne.  \n est le caractère d'échappement pour une nouvelle ligne.
    inputString = Serial.readStringUntil('\n');
    ReceptionChaine(inputString); // Lance la fonction ReceptionChaine pour effectuer les commandes demandées par l'utilisateur (ici allumager des led)
    inputString = "";// après traitement efface la chaine de caractère reçus 
  }
}
