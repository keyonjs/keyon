# Convention


## Objet paramétrable

Les objets paramétrable sont des objets où les paramétres sont modifiables sans setter/getter. Par exemple l'objet keyonPipeline est un objet paramétrable.

Ce qui permet de définir des propriétés à tout moment.


```js
const test = new keyonPipeline([...])

test.myParam1 = "test"
test.myParam2 = {at: "top"}
```

Dans le cas l'objet paramétrable les méthodes et propriétés directement liée au fonctionnement de l'objet doivent être préfixés de **$** comme pour **pipe.$error()** ce qui indique que la méthode est dépendante de l'objet et ne doit pas être touché.

Lorsqu'un objet n'est pas paramétrable alors vous devez éviter d'utiliser le préfixe **$**
