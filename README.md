[![Keyon Logo](https://raw.githubusercontent.com/keyonjs/keyon/master/docs/logo.png)](https://keyon.io/)


## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 8 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install -g keyon
```

## Run Unit test

```bash
$ npm run test
```

## Generate documentations

```bash
$ npm run doc
```

## Schémas

### Définir un schéma complexe

```js
keyon.schema.$fusion("accounts", {
	whitelabel: {
		// ui: field shown
		$label: "Attached whitelabel",

		// ui: under field help
		$help: "Une aide à comprendre",

		// ui: error displayed field
		$error: "Can not validate whitelabel",

		// documentation
		$doc: "Whitelabel reference",

		// grâce à la clé de rôle il est possible de réécrire totalement le
		// comportement du champs selon le rôle actuel
		// réécriture fonction des rôles
		$role: {
			admin: {
				// les admin peut editer
				$noupdate: false,
			}
		},

		// genre du champs
		$kind: {
			type: Types.Relationship,
			ref: 'whitelabels',
			index: true,

			// va ajouter _id dans le champs link dans la table de référence
			// si le champs de la référence est un tableau, push dans le tableau
			// créer une référence inversée de accounts>whitelabel
			// en cas de suppression, le lien est supprimé dans la référence
			link: "accountId",

			// indique que le champs peut sélectionner plusieurs entrées dans
			// la référence sous forme de badge. Au niveau du schéma le champs
			// retourne un tableau de reference
			// 'link' peut continuer à fonctionner
			// le champs est transposé en champs select (multiple si nécessaire)
			many: true,
		},

		// Interdire l'édition du champs, crée puis non modifiable
		$noupdate: true,

		// Interdire la création la création du champs
		// require et initial sont ignoré
		$nocreate: true,

		// champs secret qui ne sera jamais envoyé par les API
		// require et initial sont ignoré
		$hidden: true,

		// TODO
		// ajouter le tracking du champs
		// ajoutera 4 champs createAt createBy updateAt updateBy
		$track: true,

		// le requis, initial doit être défini à true
		$required: true,

		// champs faisant parti des besoins initiaux à la création
		$initial: true,

		// allow sorting
		$sort: true,

		// allow searching
		$search: true,

		// autoriser la popularisation le champs dans les appels list
		$listPopulate: true,

		// populariser automatiquement le champs dans les appels list
		$listAutoPopulate: true,

		// autoriser la popularisation le champs dans les appels get
		$getPopulate: true,

		// populariser automatiquement le champs dans les appels get
		$getAutoPopulate: true,

		// executé lors de l'update et création
		// id=null pour création
		// Executé après le vérificateur du typage
		// next(error)
		$onVerify: (doc, input, next) => { },

		// executé avant le rendu du typag de champs
		// permet de définir une valeur arbitraire
		$onValue: (doc, next) => {},
	}
);
```

### Configurer les API

```js
keyon.schema.$access("accounts", {
	$role: {
		admin: {
			nodelete: false,

			// le listing administratif peut être différent
			onList: (pipe, id) => {	}
		}
	},

	noupdate: false,
	nocreate: false,
	nodelete: false,
	nolist: false,
	noget: false,

	// ne transmet pas les informations du schéma au client
	nooptions: false,

	track: true,

	maxPerPage: 100,

	// Server side
	//
	// Gestionnaire d'accès et filtrage contraint des API
	// il est possible d'insèrer un controle d'accès ici
	// ou un filtre contraint
	onAccess: (pipe, type, next) => {},

	// remplace simplement (hook) les callback relatifs au
	// traitement de requêtes
	onDeleteEarly: (pipe, document, next) => { },
	onDeleteLate: (pipe, document, next) => { },

	onUpdateEarly: (pipe, id, input, next) => { },
	onUpdateLate: (pipe, id, input, next) => { },

	onCreateEarly: (pipe, id, next) => {}
	onCreateLate: (pipe, id, next) => {}

	onGetEarly: (pipe, id, next) => {}
	onGetLate: (pipe, id, next) => {}

	onListEarly: (pipe, id, next) => {}
	onListLate: (pipe, id, next) => {}

	onOptionsEarly: (pipe) => { pipe.$next() }
	onOptionsLate: (pipe) => { pipe.$next() }

	// callback de gestion
	onError: (pipe) => { }, // informative
	onDone: (pipe) => { }, // informative
});
```

### Controle de flux des API

## GET /api/!schema/options
* schema.**onAccess()**
* schema.**onOptionsEarly()**
* schema.options()
* schema.**onOptionsLate()**
* schema.**onDone()**

## GET /api/!schema/get/:uuid?&populate
* schema.**onAccess()**
* driver.**cleanUUIDCopy()**
* schema.**onGetEarly()**
* driver.get()
* driver.**cleanOutput()**
	* field.**onFormat()**
* schema.**onGetLate()**
* schema.**onDone()**

### POST /api/!schema/create
1) driver.**cleanInputCopy()**
	1) field.**onValue()**
	2) field.**onVerify()**
2) schema.**onAccess()**
3) schema.**onCreateEarly()**;
4) driver.create()
5) driver.**cleanOutput()**
	1) field.**onFormat()**
6) schema.onCreateLate()
7) driver.document.**save()**
8) schema.**onDone()**

## POST /api/!schema/update/:uuid
* schema.**onAccess()**
* driver.**cleanInputCopy()**
	* field.**onValue()**
	* onVerify()<z
* schema.**onUpdateEarly()**;
* driver.update()
* driver.**cleanOutput()**
	* field.**onFormat()**
* schema.**onUpdateLate()**;
* driver.document.**save()**
* schema.**onDone()**

## DELETE /api/!schema/delete/:uuid
* driver.**cleanUUIDCopy()**
* schema.**onAccess()**
* schema.**onDeleteEarly()**
* driver.delete()
* schema.**onDeleteLate()**
* schema.**onDone()**

## GET&POST /api/!schema/list?search&skip&limit&order&populate&filters
* schema.**onAccess()**
* driver.**cleanSearchCopy()**
* schema.**onListEarly()**
* driver.list()
* driver.**cleanOutput()**
	* field.**onFormat()**
* schema.**onListLate()**
* schema.**onDone()**


## Flow

## Controler le flux des Routers
application d'un hook dans l’exécution des requêtes server-side concernant un schéma.
ce n'est pas une fonction native express.js. req et res sont des objets spécifique au framework.
Par exemple, si vous souhaitez ajouter un controle de permission à l'entrée des API
c'est le meilleur d'endroit pour le faire car vous accèdez aux réponses standardisés

next() est un callback async

```js
keyon.$use("mySchema", (pipe) => {

	// une fois authentifier il est possible d'activer le role amdin
	// sur les schémas le temps de la requête et surtout l'intégralité du framework.
	req.setRole("admin")

	// à tout moment il est possible de récupèrer le role actuellement utilisé.
	const role = req.getRole();
	next();
});
```

dans ce cas le hook d'execution est appliqué à l'enssemble de l'application chargée.

```js
keyon.$use((pipe) => {
	next();
});
```


#### Assertion du système

Avant d’exécuter une requête, le système peut vérifier si les différents important service fonctionne correctement et auquel cas il est possible d'afficher une page d'indisponibilité où indiquer au proxy que le système ne peut pas délivrer la page (erreur 500).

### Contrôler les rôles

Les rôles permet de contrôler l'accès à des API et à des champs d'une schéma. Il ne remplace pas un système d'authentification mais est complémentaire à celui-ci.

Le besoin de gestion de role se fait sentir lorsqu'on a besoin de fournir certains champs à à un style d'utilisateur. Un champs peut être visible ou modifiable par un administrateur.

Cela permet d'empiler plusieurs niveau de roles dans l'application et permet d'obtenir une grande granularité au niveau de la gestion des permissions.

De plus, les roles permet d'aussi de contextualiser la documentation des API (et les API en elles mêmes)

Pour commencer il faut définir un role connu du framework

```js
// Déclaration simplifiée d'un role
// doit être executé au prologue du programme
keyon.role.$fusion("admin")
```

```js
// Déclarer étendue d'un role avec un checkpoint d'entrée
// keyon.role.$fusion() ne retournera jamais une erreur et les
// checkpoints peuvent être empilée
keyon.role.$fusion("admin", (req, res, next) => { // assignator
	// à chaque entrée de context admin le
	console.log("Admin access from "+req.remoteIp);
})
```
