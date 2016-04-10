# Citizen Choice

![Logo Citizen Choice](http://www.soyez-heureux.com/logoCC.png  "Citizen Choice logo")

## C'est quoi ?

Citizen Choice est une borne de sondage d'opinion faite pour les citoyens par les citoyens.

## Comment ?

Basé sur un Raspberry Pi, Il permet de poser des questions à choix fermés (Oui / Non ou Pour / Contre) via un écran qui affiche la question et 2 boutons pour faire le choix (bouton vert et rouge)

Une parti d'administration permet l'ajout de question et la vision des statistiques

## Installation

* Préparer la carte SD avec Raspbian (Version testée : 2016-03-18)
* Câblez les boutons comme le schéma ci-dessous :
![Wiring Citizen Choice](http://www.soyez-heureux.com/CitizenChoice.jpg  "Wiring Citizen Choice")
* Une fois le raspberry Pi lancé, lancez le terminal et exécutez ces commandes :
```
curl -sLS https://apt.adafruit.com/add | sudo bash
sudo aptitude dist-upgrade && sudo aptitude install node
sudo aptitude install sqlite3
sudo reboot
```
* Le raspberry redémarre et ensuite, clonez le dépôt et lancez Citizen Choice :
```
git clone https://github.com/fkosmala/CitizenChoice
cd CitizenChoice
npm start
```
* Vous pouvez maintenant lancer Firefox et aller sur http://localhost:8001/admin pour ajouter une question. Le nom d'utilisateur est *admin* et le mot de passe est *citizen*

* Ensuite allez sur http://localhost:8001/ pour voir la question et Commencer le sondage :)

