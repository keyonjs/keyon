# Pipeline

Afin de simplifier la transmission d'arguments au niveau du traitement de la requête un objet **keyonPipeline** permet de gérer l'interaction entre le demandeur et l'action. Cette objet gère l’exécution de la requêtes, qu'elle provienne d'un appel d'API, CLI ou Library.

Le pipeline va donc gérer **l’exécution**, les **données en entrée / sortie**, les **erreurs** et les **logs**. Selon le niveau d'execution il est possible de fusionner des données (entrée et sortie) à différent niveau d'execution. Ce qui permet par exemple à un plugin d'ajouter des champs virtuels en sorti ou générer des erreurs si nécessaire.

Si vous deviez un jour utiliser les callback de schéma ou tout autre outil qui permettrait d'entrer dans la gestion de flux IO passerait systèmatiquement par pipeline.

Celui-ci est un objet paramétrable **keyonPipeline** qui permet de gérer l'intégralité du flux IO. Il permet notamment:

* Gérer l'entrée des données
* Gérer la sortie des données
* Déclencher l'opération suivante
* Gérer les erreurs
* Gérer les logs

Vous êtes libre de définir les propriétés voulues mais il est conventionnellement interdit de définir une propriété commençant par **$**.

## Composition de la library

### pipe.$set()

Cette méthode permet de définir la prochaine opération à exécuter.

### pipe.$next()

Cette méthode permet d’exécuter la prochaine opération asynchrone.

### pipe.$end()

Lorsque l’exécution du pipeline est terminé cette appel permet d'indiquer à la l’émetteur que l’exécution s'est terminé (avec ou sans erreur). L’exécution du pipeline est une promesse et la preuve de sa fin doit être su par l’émetteur.

### pipe.$error(code, explained)

Informe qu'il y a une erreur dans l’exécution du pipeline. Le **code** erreur correspond à une code erreur HTTP indicatif (404, 500...) et **explained** correspond à une description du problème rencontré.

Dans ce cas, $error() executera systèmatiquement $end().

## Execution du pipeline

Lors que le pipeline est initialisé il est essentiel de définir au moins sa source au travers de l'argument **source**, l'autre argument **end** est optionnel et permet de savoir lorsque le pipeline a terminé.

Lors de l'execution du pipeline vous pouvez définir des propriétés. Typiquement le cas se pose lorsque vous voulez controller les permissions d'un utilisateur lors de l'execution d'un callback de schéma. En général un control de la session est effectué en amont. En général on va utiliser keyon.$use() pour vérifier cela avant l'execution du callback.

Ainsi lors de keyon.$use() vous pouvez indiquer des informations qui seront réutilisés plus tard.

```js
// global default
keyon.$use((pipe) => {

	// verify auth
	// [...]

	// set pipe informations
	pipe.isAdmin = user.isAdmin;

	// you can add user object into pipeline directly
	pipe.user = user;

	pipe.$next();
});
```

Plus tard vous pouvez donc utiliser ce callback:

```js
keyon.schema.$access("accounts", {
	onAccess: (pipe) => {
		if(pipe.user.isAdmin !== true) {
			// in this case pipe.$end() will be executed
			// then you don't need to callit
			pipe.$error(403, "Forbidden");
			return;
		}

		// use accepted log admin action
		pipe.$logs.admin = true;
	},
});
```


## Starting Flow

### API Flow
Usage: **Embedded**

* expressJS()
* createPipeline() Refere to keyonPipeline
* mapping express to keyon request
	* \- > pipe.origin = "API"
	* req.params > pipe.params
	* req.body > pipe.body
	* req.request.remoteAddress = pipe.source
* mapping express to keyon response
	* \- > pipe.reply()
	* \- > pipe.error()
	* \- > pipe.errorField()
* callRouter()


### CLI Flow
Usage: **Semi-Embedded**, generating simple binary

  * subcommander()
  * createPipeline() Refere to keyonPipeline
    * \- > pipe.origin = "CLI"
	* tty/user > pipe.source
  * callRouter()

### React Flow
Usage: **Embedded**

### Admin Flow
Usage: **Embedded**

### Library Flow
Usage: **Embedded**

### API Lib Flow
Usage: **Standalone**
