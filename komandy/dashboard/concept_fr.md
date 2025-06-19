---
title: "Kômandy: Vision conceptuelle"
header-includes:
  <link rel="icon" href="./static/img/logo.svg">
  <link rel="stylesheet" href="./static/css/style.css" />
---

<main>
Kômandy est une plateforme de gestion de projets terrain axée sur la simplicité et l'efficacité.

Kômandy organise votre travail grâce aux rubriques clés suivantes :

1. Chantiers : Unité organisationnelle de niveau supérieur contenant les projets et les membres de l'équipe.
2. Projets : Ensemble de tâches connexes au sein d'un chantier.
3. Tâches : Éléments de travail individuels à réaliser.
4. Équipes : Groupes cadres-employés collaborant sur des chantiers et des projets.
5. Pointage : Gérez le temps et la présence de vos employés sur le terrain.

# Flux de travail de base

Un flux de travail typique dans Kômandy ressemble à ceci :

- Créer un chantier
- Inviter des membres de l'équipe à y participer ou assigner des équipiers
- Créer des projets au sein des chantiers
- Ajouter des tâches à vos projets
- Assigner des tâches aux membres de vos équipes
- Suivre l'avancement des tâches

## 1. Chantier

### Qu'est-ce qu'un chantier?

Le chantier est une unité organisationnelle de niveau supérieur de Kômandy.
Il sert de conteneur pour les projets, les tâches et les membres d'une équipe.
Un chantier est un espace dédié à une équipe, un service ou un domaine de travail spécifique.

#### Créer un chantier

Pour créer un chantier :

- Cliquez sur le sélecteur de chantier en haut à gauche
- Sélectionnez « Créer une chantier »
- Saisissez un nom pour votre chantier
- Cliquez sur « Créer »

#### Gestion des chantiers - Paramètres

Chaque chantier possède ses propres paramètres que vous pouvez configurer :

- Cliquez sur le sélecteur de chantiers en haut à gauche
- Sélectionnez le chantier que vous souhaitez gérer
- Cliquez sur « Paramètres » dans la barre latérale

Depuis la page des paramètres, vous pouvez :

- Modifier le nom du chantier
- Configurer les paramètres spécifiques au chantier

#### Passer d'un chantier à un autre

Si vous avez plusieurs chantiers, vous pouvez facilement passer d'un chantier à un autre:

- Cliquez sur le sélecteur de chantiers en haut à gauche
- Sélectionnez le chantier vers lesquel vous souhaitez passer

#### Supprimer un chantier

Pour supprimer un chantier :

- Accédez aux paramètres du chantier
- Faites défiler la page jusqu'en bas
- Cliquez sur « Supprimer le chantier »
- Confirmez la suppression

Remarque : La suppression d'un chantier entraîne la suppression définitive de tous les projets, 
tâches et données qui lui sont associés. Cette action est irréversible. (Solution possible: git)


## 2. Projets

### Que sont les projets ?

Dans Kômandy, les projets regroupent des tâches liées au sein d'un chantier.
Ils vous aident à organiser votre travail en groupes logiques.
Un projet peut représenter un espace de travail, un client, un service, 
une flotte de véhicules ou toute autre organisation de vos tâches.

#### Créer un projet

Pour créer un projet :

- Accédez au chantier où vous souhaitez créer le projet.
- Cliquez sur « Projets » dans la barre latérale.
- Cliquez sur le bouton « Nouveau projet ».
- Saisissez un nom et une description (facultatif) pour votre projet.
- Cliquez sur « Créer ».

Le projet sera créé et vous serez redirigé vers la vue tableau. 🎉

#### Vues des projets

Dans Kômandy, chaque projet peut être visualisé de différentes manières :

- Vue Liste : affiche les tâches sous forme de liste simple
- Vue Tableau : affiche les tâches organisées par statut dans un tableau de type Kanban

Pour passer d'une vue à l'autre, utilisez le sélecteur de vue dans l'en-tête du projet.

### Paramètres du projet

Pour accéder aux paramètres du projet :

- Accédez au projet
- Cliquez sur le bouton « Paramètres » dans l'en-tête du projet

Vous serez redirigé vers la page des paramètres du projet.

Depuis la page des paramètres, vous pouvez :

- Modifier le nom et la description du projet
- Configurer les paramètres spécifiques au projet

### Archivage et suppression de projets

Lorsqu'un projet est terminé ou n'est plus nécessaire, vous pouvez :

- Archiver : conserve les données du projet, mais le supprime de la liste des projets actifs
- Supprimer : supprime définitivement le projet et toutes ses tâches (NOTE: Option à voir)

Pour archiver ou supprimer un projet, accédez aux paramètres du projet et faites défiler la page jusqu'en bas.

## 3. Tâches

### Qu'est-ce qu'une tâche?

Les tâches sont les éléments de travail fondamentaux de Kômandy. 
Elles représentent des actions spécifiques à réaliser dans le cadre d'un projet. 
Chaque tâche peut avoir différents attributs, tels que des responsables, 
des dates d'échéance, un statut et un suivi du temps.

#### Créer des tâches

Pour créer une tâche :

- Accédez au projet dans lequel vous souhaitez créer la tâche.
- Cliquez sur le bouton « Nouvelle tâche ».
- Saisissez un titre pour votre tâche.
- Ajoutez des informations supplémentaires.
- Cliquez sur « Créer ».

La tâche sera ajoutée à la liste des tâches du projet. 🎉

#### Propriétés des tâches

Les tâches dans Kômandy possèdent plusieurs propriétés 
qui vous aident à suivre et à gérer votre travail :

- Titre : Brève description de la tâche
- Description : Informations détaillées sur les tâches à effectuer
- Statut : État actuel de la tâche (par exemple, À faire, En cours, Terminé)
- Responsable : Personne responsable de la réalisation de la tâche
- Échéance : Date limite de réalisation de la tâche
- Priorité : Niveau d'importance de la tâche
- Suivi du temps : Enregistrement du temps passé sur la tâche

#### Gestion des tâches

Vous pouvez gérer les tâches de plusieurs manières :

- Modifier : Cliquez sur une tâche pour accéder à ses détails et la modifier.
- Modifier le statut : Faites glisser les tâches entre les colonnes de la vue Tableau (Kanban) ou sélectionnez un nouveau statut dans la vue Liste.
- Attribuer : Attribuez ou réattribuez des tâches aux membres de l'équipe.
- Commenter : Ajoutez des commentaires pour discuter de la tâche avec votre équipe.
- Suivi du temps : Démarrez et arrêtez le suivi du temps pour enregistrer la durée du travail.
- Tâche parente (NOTE: find better wording)

## 4. Équipes

### Gestion d'équipe dans Kômandy

Kômandy vous permet de collaborer avec les membres de votre équipe sur différents chantiers et projets. 
Une gestion d'équipe efficace est essentielle à une collaboration réussie.

#### Inviter des membres de l'équipe

NOTE: Field workers form should be different from Member form
TODO: make a distinction between a member and a worker.

Pour inviter quelqu'un à vos chantiers :

- Accédez aux paramètres des chantiers
- Cliquez sur l'onglet « Membres »
- Cliquez sur « Inviter un membre »
- Saisissez l'adresse e-mail de la personne à inviter
- Sélectionnez le rôle approprié pour le nouveau membre
- Cliquez sur « Envoyer l'invitation »

La personne invitée aura accès aux chantiers après s'être connectée. 🎉

#### Gérer les membres de l'équipe

Pour gérer les membres de l'équipe existants :

- Accédez aux paramètres des chantiers
- Cliquez sur l'onglet « Membres »

De là, vous pouvez :

- Ajouter un membre au chantier
- Supprimer un membre d'un chantier

## 5. Clock-in

Gérez le temps et la présence de vos employés sur le terrain.

### Accompagnement des employés sur le terrain

Prenez des décisions éclairées en obtenant une vue d'ensemble des performances de vos collaborateurs:
De la performance et de la productivité globales, au temps consacré aux projets et aux tâches.

### Suivi des présences

Assurez-vous d'avoir un aperçu de la disponibilité et de la productivité de votre équipe.
Suivez facilement les arrivées tardives ou les départs anticipés.

Le système vous aide à maintenir la productivité de votre équipe, même sans connexion.
Exploitez la prise en charge réseau hors ligne de Kômandy pour un accès 
et une capture de données continus, avec une synchronisation automatique une fois le réseau rétabli.


[TODO]: 

select tech             Commentaires
----------------------- --------------------------------------
Text-based Time-Clock   (pointage par SMS: extra cost!)
IVR                     (pointage par voix: à voir: compliqué?)
QR code                 (pointage par scan par le superviseur surplace: Lent)
NFC                     (pointage par tap sur le phone du superviseur surplace: Plus rapide)


### Fonctionnalités clés

Avec ce système, vous ne vous contentez pas de suivre le temps: vous prenez le contrôle de votre journée.
Que vous gériez plusieurs sites ou que vous jongliez avec différents plannings de travail,
ces fonctionnalités vous aident à éliminer les incertitudes et vous permettent de vous concentrer 
sur l'avancement de vos projets sans les tracas de la gestion manuelle des feuilles de temps.

L'application de pointage Kômandy pour les travailleurs de terrain présente les fonctionnalités suivantes :

- Fonctionnalité hors ligne : La possibilité de suivre le temps de travail, même sans connexion internet, est essentielle pour les travailleurs de terrain.
- Pointage d'entrée et de sortie facile : Une interface simple et intuitive permet aux employés d'enregistrer leurs heures de travail.
- Rapports de temps détaillés : Possibilité de générer des rapports sur les heures de travail, les projets et les tâches.
- Application mobile : Une application mobile dédiée, facile d'accès et d'utilisation pour les travailleurs de terrain.


### Règles simples de suivi du temps

- Définissez des plages horaires d'arrivée et de départ spécifiques : évitez les entrées en avance ou en retard.
- Définissez des durées minimales de quart : évitez les enregistrements incomplets accidentels.
- Personnalisez les règles par site.
  * S'adapter aux différentes exigences du projet.
  * Adapter les temps de pause aux différents projets.
- Suivi des heures supplémentaires : signalez automatiquement les heures dépassant les limites de travail normales.

Par défaut, l'intégration avec les systèmes de paie n'est pas disponible.
Notre objectif principal est de garantir l'indépendance, la petite taille et la réactivité de Kômandy.
Cependant, la possibilité d'exporter les données de temps vers les systèmes de paie pour une intégration transparente pourrait être ajoutée.

# À propos des tâches

## Dépendances des tâches

Les projets complexes comportent souvent des tâches qui dépendent de la réalisation d'autres tâches.

La fonctionnalité de dépendance des tâches permet aux utilisateurs de :

- Créer des relations prédécesseur/successeur entre les tâches
  * Créer des sous-tâches au sein de tâches existantes
- Visualiser les dépendances dans les vues Tableau et Chronologie
  * Visualiser les relations parent-enfant dans l'interface utilisateur
  * Naviguer facilement entre les tâches parentes et enfant
- Marquer les tâches parentes comme terminées lorsque toutes les sous-tâches sont terminées
- Recevoir des notifications lorsque les tâches bloquantes sont terminées
- Filtrer les tâches par état de dépendance (bloquée, bloquante, etc.)
- Détecter et prévenir les dépendances circulaires

Les dépendances sont accessibles en cas de besoin, sans surcharger les vues principales des tâches.
Ils offrent un moyen naturel d'organiser un travail complexe sans encombrer la vue principale du tableau.
Ils maintient une interface utilisateur claire tout en ajoutant de puissantes fonctionnalités d'organisation.


## Déplacement de tâches entre projets

La réorganisation des tâches est courante à mesure que les projets évoluent et que les priorités changent.
La possibilité de déplacer des tâches entre projets est une fonctionnalité standard des outils de gestion de projet éprouvés.
Les utilisateurs ont souvent besoin de réorganiser leur travail en déplaçant des tâches entre différents projets.

Les fonctionnalités de l'application permettent aux utilisateurs de :

- Déplacer des tâches d'un projet à un autre tout en préservant toutes les données de la tâche ;
- Ajuster éventuellement le statut des tâches lors du déplacement entre des projets avec des flux de travail différents ;
- Conserver l'historique des tâches, les commentaires et les pièces jointes pendant le déplacement ;
- Proposer une interface utilisateur claire pour la sélection du projet de destination.

## Pièces jointes aux tâches

Les pièces jointes sont essentielles pour fournir du contexte et de la documentation aux tâches.
Les utilisateurs doivent partager des fichiers liés aux tâches (documents, images, fichiers de conception, etc.).
Les outils externes de partage de fichiers peuvent créer des flux de travail déconnectés.

La fonctionnalité de pièces jointes permet aux utilisateurs de :

- Importer des fichiers directement dans les fiches de tâches
- Prévisualiser les types de fichiers courants (images, PDF, etc.)
- Télécharger les pièces jointes
- Gérer les pièces jointes (supprimer, remplacer)

Remarque : Une fiche de tâche est une tâche et ses sous-tâches directement liées, souvent séquentielles.

Cette fonctionnalité conserve les fichiers pertinents avec les tâches auxquelles ils appartiennent.
Elle réduit les changements de contexte et améliore l'efficacité du flux de travail sans ajouter de complexité inutile.

## Planification minimale des tâches

La planification des tâches est essentielle à la planification des projets.
Une planification efficace des tâches est essentielle à la planification des projets et à l'allocation des ressources.
Les paramètres par défaut configurables aident les équipes à maintenir des pratiques cohérentes.

Améliorez la fonctionnalité de gestion des échéances pour inclure :

- Dates d'échéance par défaut configurables (par exemple, +1 semaine après la création)
- Préréglages de dates d'échéance au niveau de l'équipe ou du projet
- Indicateurs visuels pour les tâches en cours ou en retard
- Intégration de la vue Calendrier
- Modification des dates d'échéance par lots

Cette fonctionnalité simplifie le processus de définition des dates d'échéance 
tout en offrant une flexibilité adaptée aux différents flux de travail des équipes, 
réduisant ainsi le travail manuel et préservant la clarté.

## Rappels et notifications de tâches

Les utilisateurs manquent souvent des échéances ou des mises à jour importantes en raison 
de l'absence de système de rappel ou de notification intégré.
Cela entraîne des retards et des problèmes de communication dans l'exécution des projets.

Des notifications ponctuelles sont essentielles pour maintenir les projets sur la bonne voie 
et garantir que les membres de l'équipe sont informés de leurs responsabilités 
et des modifications apportées à leur travail.

Le système de notifications complet de Kômandy comprend :

- Rappels d'échéance (horaires configurables)
- Notifications d'attribution de tâches
- Alertes de commentaires et de mentions
- Notifications de changement de statut
- Préférences de notification par utilisateur
- Plusieurs canaux de diffusion (dans l'application, par e-mail, etc.)

Cela réduit le besoin de suivi manuel tout en permettant aux utilisateurs de contrôler 
les notifications qu'ils reçoivent, leur permettant ainsi de rester informés sans être débordés.


# Autres concepts clés

## Fonctionnalité de recherche globale

À mesure que les projets se développent, trouver des tâches ou des informations spécifiques 
devient de plus en plus difficile sans des fonctionnalités de recherche performantes.

Une fonctionnalité de recherche globale permet aux utilisateurs de :

- Rechercher dans tous les projets et chantiers auxquels ils ont accès ;
- Filtrer les résultats de recherche selon différents critères (statut, responsable, date, etc.) ;
- Rechercher dans les descriptions et les commentaires des tâches ;
- Enregistrer les recherches fréquentes pour un accès rapide.

Une recherche efficace des informations devient essentielle à mesure que le volume des tâches 
et des projets augmente.
Elle simplifie la recherche d'informations sans nécessiter de navigation complexe 
ni de mémorisation de l'emplacement de stockage, rendant ainsi l'ensemble du système plus accessible.

## Visualisation du projet

Les graphes et tableaux offrent une visualisation intuitive :

- Dates de début et de fin des tâches
- Interdépendances entre les tâches
- Jalons clés du projet
- Chronologie globale du projet et aperçu de son avancement

## Contrôle d'accès basé sur les rôles (RBA)

À mesure que les équipes se développent et collaborent avec des intervenants externes,
la capacité à contrôler précisément qui peut voir et modifier des informations spécifiques
devient essentielle pour la sécurité et la gestion des flux de travail.
Un contrôle d'accès approprié est essentiel pour la sécurité et la gestion des flux de travail.

Les équipes ont besoin de niveaux d'autorisation différents selon les utilisateurs.
Cela permet de partager des tableaux avec des intervenants externes
ou de limiter les opérations sensibles à certains membres de l'équipe.

Kômandy met en œuvre un système complet de contrôle d'accès basé sur les rôles, comprenant :

- Paramètres d'autorisations au niveau du projet
- Contrôles d'accès au niveau des tâches
- Rôles prédéfinis (Administrateur, Collaborateur, Lecteur)
- Autorisations d'accès temporaires avec expiration
- Création de rôles personnalisés avec autorisations granulaires
- Règles d'héritage des autorisations
- Journalisation des modifications d'autorisations
- Journaux d'audit détaillés des autorisations
- Indicateurs visuels des restrictions d'autorisations

Chaque utilisateur ne voit que ce dont il a besoin en fonction de ses autorisations, 
garantissant ainsi une expérience claire et ciblée.



</main>
