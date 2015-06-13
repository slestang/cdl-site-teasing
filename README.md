# Capitole du Libre website

Page du site de teasing, en général publié lorsqu'on sait les dates, et avant l'appel à conférence.
Cette page de teasing est ensuite utiisée en tant que homepage du site contenant le programme et l'appel à projet.

Pour contribuer au fichier `www/index.html`, pas besoin d'installer quoi que ce soit.

## Installation (pour le thème)

Les feuilles de styles de ce projet sont automatiquement compilées depuis les fichiers less, puis minifiées par l'outil [Gulp](http://gulpjs.com/) (un [bon tutoriel](http://www.sitepoint.com/introduction-gulp-js/)).

Prérequis : Installer nodejs

    !console
    # Installer gulp en global
    npm install -g gulp

    # Installer les dépendances du projets (dans `package.json`)
    npm install

## Compiler le thème

Les fichiers de travail `less` et `js` sont dans le dossier `src`. Une commande permet de surveiller les modificaitons de ce dossier, puis de regénérer les fichiers css à chaque modification. Pour ce servir de cet outil :

    !console
    gulp watch
