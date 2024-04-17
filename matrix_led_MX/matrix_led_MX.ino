/* Bibliothèques */
#include <SimpleTimer.h>// Bibliothèque utilisée pour exécuter une fonction à intervalle de temps régulier ( lien pour télécharger la bibliothèque : https://github.com/jfturcot/SimpleTimer )
#include <ArduinoJson.h>// Bibliothèque nécessaire pour lire les données au format Json.
#include "LedControl.h" // Bibliothèque Matrix LED

/*
 Connexion de matrice LED MX72XX (LedControl) sur Arduino Méga (Bornes numériques)
 pin 10 > DIN  DataIn 
 pin 9 > CLK 
 pin 8 > CS LOAD
 */
LedControl lc=LedControl(10,9,8,1);// Data/CLK/CS / et numéro du dispositif :1

/* temporisation pour affichage */
unsigned long delaytime1=500;
unsigned long delaytime2=1000;
//affichage

byte Matrix[8]={B00000000,B00000000,B00111100,B00100100,B00100100,B00111100,B00000000,B00000000};// valeur Départ chaque byte représente l'affichage d'une ligne

String inputString = "";  // variable de type chaine de caratères qui contiendra les caractères de commande reçue sur le port serie

SimpleTimer timer;// objet timer permet d'exécuter une fonction à intervalle de temps régulier > on l'utilisera pour la fonction EnvoiDonnees (pas utilisé pour l'instant)
int periode = 1000; // periode des mesures en ms pour le timer

int rotation = 0; // si déplacement des motifs : 0 "non"  1 "gauche"  2 "droite"
bool flag = false; // variable booléenne qui sera mise à vrai si au moins une led a été modifiée


// Initialisation
void setup() {

  // initialise la communication avec le port série à la vitesse de 9600 bits par seconde
  Serial.begin(9600);
  
  // initilisation du MAX72XX qui est en power-saving mode au départ
  lc.shutdown(0,false); //  mode power-saving  off
  lc.setIntensity(0,8);// intensité moyenne des leds (0 à 16)
  lc.clearDisplay(0);// efface l'écran

  //timer.setInterval(periode, EnvoiDonnees); // définit un timer qui va exécuter la fonction EnvoiDonnees toutes les periodes
  
  affiche(Matrix); // affiche le dessin initial (un carré)
}

// Boucle d'exécution
void loop() {
  //timer.run();// exécute en permanence le timer  > lecture des données toutes les périodes

  switch (rotation) {
  case 0:
    // rien
  break;// gauche
  case 1:
    moveLeft(); // modification des valeurs
    affiche(Matrix); // affichage du motif
   break;
  case 2:// droite
    moveRight();
    affiche(Matrix);
   break;
  case 3:// alterne
    alterne();
    break;
  default:
    // if nothing else matches, do the default
    // default is optional
   break;
  }
  

}// fin loop

void affiche(byte a[8]) {  // fonction pour afficher le motif

  for(int row=0;row<8;row++) {
    lc.setRow(0,row,a[row]);
  }
  delay(delaytime1); // pause entre 2 affichage en ms
}

void moveLeft(){ // déplacement à gauche des valeurs
  for (int i = 0; i < 8;i++){
    byte firstVal = (Matrix[i]& B10000000)>> 7;
    Matrix[i] = (Matrix[i]<<1) | firstVal;
  }
}

void moveRight(){ // déplacement à droite des valeurs
  for (int i = 0; i < 8;i++){
    byte firstVal = (Matrix[i]& B00000001);
    Matrix[i] = (Matrix[i]>>1) | (firstVal<<7);
  }
}

void efface() { // efface les valeurs et l'affichage
  for(int lign=0;lign<8;lign++) {
    Matrix[lign] = B00000000;
  }
  rotation = 0;
  lc.clearDisplay(0);// efface l'écran;
}

void alterne(){
  byte M1[8]={0x55,0xAA,0x55,0xAA,0x55,0xAA,0x55,0xAA};
  byte M2[8]={0xAA,0x55,0xAA,0x55,0xAA,0x55,0xAA,0x55};
  affiche(M1);
  delay(200);
  affiche(M2);
}

void miseAjour(byte M[8]) {
  
    for (int i = 0; i < 8;i++){
      Matrix[i] = M[i];
    }
}
