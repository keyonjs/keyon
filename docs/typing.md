# Typing in Keyon

Le typage de la données en base est fort++ (ou très fort) dans la mesure où il est possible de conditionner la lecture et l'écriture de ce champs.

Keyon pilote les types du coté du serveur mais aussi du coté de client. Le design de typage de Keyon repose sur 2 niveaux de types: les types haut et bas (ou nativeTypes).

Le types haut servent à piloter le comportement d'un champs à la fois du coté serveur mais aussi client. À contrario les types bas (ou nativeTypes) servent à piloter des champs contenu dans les données stockés.

Les typage haut sont nécessairement associés avec au moins un typage bas. Cela afin de savoir comment stocker la données.

La composition d'un type haut est essentiel à Keyon car il permet de controler avec finesses:
* L'extension de schéma (server side)
	* Le typage bas des entrées (server side)
* Le filtrage du champs dans un listing (client side)
* L'apparence du champs dans un tableau (client side)
* L'apparence du champs dans un formulaire (client side)
* L'apparence du champs en vue standalone-editing (client side)

Dans le design de Keyon le typage se retrouver en 4eme position de la pile.

6) Access Interface (API, Library)
5) Model
4) \> **Types** <
3) Schematic
2) Driver
1) Keyon Kernel

## Client side
Keyon intègre massivement Reactjs comme générateur AntDesign comme famework React front-end. Cela permet de couvrir l’ensemble des besoins d'affichage des types hauts. De plus, il est possible d'intégrer dans un plugin Keyon la modification (sous forme de surcouche) de l’ensemble du framework.

De même, Il est possible d'intégrer les outils de contrôle Javascript sans avoir à utiliser Reactjs, il est ainsi possible d'utiliser les API Keyon front-end dans des scripts / site vanillajs

## Typage Haut

* Relationship - lien avec un autre schéma
* ComID - Générateur de référence de communication
* Email - Controller d'e-mail
* Password
* Name
* Phone
* Key - encodage simplifiée
* Text
* Boolean
* Switch
* Date
	* Month
	* Hour
* Daterange
* File
* Time
* TimeString
* Virtual - Crée un champs virtuel

## Typage Bas

D'autre typage bas seront ajouté

* Double = 1
* String = 2
* Reference = 3
* Id = 4
* Boolean = 5
* Date = 6
* Regex = 7
* Javascript = 8
* Integer = 9

## Data Driver
Keyon essai de trouver des points de comptabilitsé inter-database afin de rendre possible l'usage de plusieurs sources de base de données dans l'application. La plupart des type on été donc pensée afin de permettre l'usage de différent driver en dessous du typage.

## Decomposing Name type

Le champs Name est intéressant à prendre en exemple car il va à la fois piloter plusieurs champs en database, effectuer des vérifications spécifiques et présenter la données différemment pour l'utilisateur.

Pour le développeur, appliquer les bons type permet d'économiser des lignes de code. Dans le cas de Name, le développeur économisera la gestion d'un champs en plus (s'il veut dissocier first et last name).

## Plugins
Keyon embarque un grand nombre de types haut, ce qui permet d'intensifier le développement d'application. Cependant il peut arriver de vouloir gérer un type haut spécifiquement. Comme par exemple une signature DSA (qui n'existe pas encore).

Dans Keyon, les types sont vues quasiement comme des applications indépendante composées d'une partie server side et d'une autre partie client side.

Et bien il est possible de développer et intégrer très rapidement son propre typage haut.

### Preparer l'arbre de fichiers

### Fusionner le type

### Utiliser le type
