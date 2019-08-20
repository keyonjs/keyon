# Data driver

Les méthodes de update(), delete, get(), list() sont contraints par de un champs **pipe.constraints** du pipeline. Cela permet d'apposer un filtre prioritaire sur la requêtes (si l'utilisateur a accès au document)

Conceptuellement la contrainte se place comme suivant :

```js
const filters = Object.assign(filters, pipe.constraints)
filters.$and = pipe.filters;
```

Ainsi, la contrainte force le filtre à être exécuté dans un certain contexte. keyonPipeline

* {@see keyonPipeline}
* {keyonPipeline}
* @see keyonPipeline
* [cdsqcdsq](keyonPipeline)
