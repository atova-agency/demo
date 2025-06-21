---
title: MVP
header-includes:
  <link rel="icon" href="./static/img/favicon.svg">
  <link rel="stylesheet" href="./static/css/vpkely.css" />
  <link rel="stylesheet" href="./static/css/lang.css" />
---

 
<main>
<pre>NOTE: <code>RFC: Document interne à commenter</code></pre>

On nous demande de faire un MVP et donner une estimation du temps et coût 
pour une application web et mobile en Rust Axum, Postgres sqlx, frontend Nextjs15 
ou react native à partir du cahiers des charge suivant:

# Cahier des Charges HFF 

<h2>Gestion du Service HFF Rental</h2>

## 1. Contexte et Objectifs

L'objectif de ce projet est de mettre en place un système de gestion
optimisé pour le service de location de nos machines. La solution devra
permettre un suivi précis et en temps réel de la flotte, des contrats, des
clients, du personnel et des opérations de maintenance.

## 2. Périmètre Fonctionnel

2.1 Suivi de la Flotte Machines

Localisation en temps réel des machines sur une carte (rouge/vert
OFF/ON) (source de données : TAGIP ; MTEC ; VisionLink)
En cliquant sur une machine, savoir chez qui elle est, sous quel
contrat (avec contrat relié automatiquement) et le chauffeur qui la
conduit (une partie des données venant d’irium et une partie saisie manuelle)
Distinction des machines en location, disponibles, en maintenance
etc sur un planning vivant (relié avec docuware pour le suivi de BADM qui est
le casier (localisation) de nos machines)

Fiche machine détaillée :
- Photo
- Fiche technique
- Assurance avec alerte pour renouvellement
- Contrôle technique, CNAVT- contrôle levage avec rappels
automatiques pour les concernées

2.2 Gestion des Devis et Contrats

Devis réalisé sur Odoo – envoyé pour signature par docuware – besoin de
communication entre docuware et Odoo pour le suivi des devis (statuts)

Création et suivi des devis (en cours, validé, refusé etc)

- Relances automatiques pour les clients non-répondants
- Intégration de la grille tarifaire par type de machine et client afin de
créer des devis automatiquement en quelques clics.
- Génération et envoi automatique des devis via nos mails
- Conversion des devis en contrat validé
- Possibilité d’envoyer le contrat au DG pour signature électronique
(via docuware) + envoi au client en direct pour signature (docuware)
- Création de facture chaque fin de mois selon les contrats (voir API irum)

2.3 Planification et Gestion Logistique

Planning interactif/simple des machines

- Gestion des demandes de véhicules en interne sans nécessité d’e-
mails à l’aide d’un planning ouvert avec possibilité de réserver
automatiquement son véhicule, pour tel trajet ; avec tel marchandises etc..
- Vision globale du planning logistique

2.4 Gestion du Personnel Rental

Fiche du personnel avec :

- Permis de conduire
- Visite médicale
- Alertes pour mises à jour
- Sanctions enregistré
- Les congés etc

Planning et statut en temps réel des employés

- Affectation automatique des opérateurs disponible avec les
compétences aux machines (pour les remplacement)
- Mettre les opérateurs sur leur machine attitrée automatiquement
- Demande de congé + pointage réalisé par les superviseurs
facilement, en sélectionnent et filtrant selon leur chantier

2.5 Reporting et Suivi des Performances

Rapports mensuels sur :

- État de la flotte
- Nombre de machines en location
- Suivi des contrats
- Situation du personnel
- Indicateurs de performance etc

2.6 CRM

- Suivi client avec les opportunités etc
- Fiche client

## 3. Exigences Techniques

- Interface intuitive et accessible depuis mobile et desktop
- Automatisation des relances et alertes
- Sécurisation des données
- Intégration avec les outils existants

## 4. Déploiement et Accompagnement

- Phase de développement et tests
- Formation des utilisateurs
- Maintenance et support
 
---

Dans cette partie, nous allons définir un MVP (Minimum Viable Product) qui couvre les fonctionnalités essentielles 
du cahier des charges, en se concentrant sur un development modulaire permettant une base solide et extensible.

# Analyse du Cahier des Charges

Le projet est complexe et implique plusieurs modules :

1. Suivi de la flotte de machines (avec intégrations externes)
2. Gestion des devis et contrats (intégration Odoo et Docuware)
3. Planification et gestion logistique
4. Gestion du personnel
5. Reporting
6. CRM

Pour le MVP, nous mettrons en priorité les fonctionnalités qui apportent le plus de valeur 
et qui sont réalisables sans ajouté trop de complexité, notement à cause de l'intégration externe, et possible "legacy system". 
Nous devons aussi tenir compte des intégrations nécessaires (Odoo, Docuware, TAGIP, MTEC, VisionLink, Irium) 
qui peuvent être partiellement simulées en MVP.

## Choix Technologiques

- **Backend**: Rust avec Axum (pour la performance et la sécurité)
- **Base de données**: PostgreSQL avec sqlx (pour un accès asynchrone et sécurisé)
- **Frontend Web**: Next.js 15 (avec App Router et Server Components pour une meilleure performance)
- **Mobile**: React Native (pour une application mobile cross-platform) OU une application web responsive. 

Nous proposons de commencer par une application web responsive (Next.js) 
et développer plus tard une application React Native si nécessaire.

## MVP - Fonctionnalités Prioritaires

1. **Suivi de la flotte de machines**:

- Carte montrant l'état des machines (ON/OFF) avec une couleur (rouge/vert). Pour le MVP, nous utiliserons des données simulées ou une intégration basique avec une source de données (par exemple, VisionLink via une API mock).
- Fiche machine détaillée (photo, fiche technique, assurance, contrôles techniques) avec alertes pour renouvellement (à définir par une date et un système de notification simple).

2. **Gestion des devis et contrats**:

- Création manuelle d'un devis (sans intégration Odoo/Docuware dans un premier temps, mais en prévoyant l'architecture pour plus tard).
- Conversion du devis en contrat.
- Génération d'une facture à la fin du mois (pour un contrat donné, sans intégration avec Irium dans le MVP).

3. **Gestion du personnel**:

- Fiche personnel avec informations de base (permis, visite médicale) et alertes pour renouvellement.
- Planning des employés (affichage simple, sans affectation automatique dans le MVP).

4. **Authentification et autorisation**:

- Système de connexion avec rôles (admin, superviseur, opérateur).

5. **Tableau de bord**:

- Vue d'ensemble de l'état de la flotte, des contrats en cours, et du personnel.

## Fonctionnalités à reporter (post-MVP)

- Intégrations complexes (Odoo, Docuware, TAGIP, MTEC, VisionLink, Irium) : ces intégrations nécessitent des développements spécifiques et des accords avec les fournisseurs. En MVP, nous allons simuler les données ou permettre une saisie manuelle.
- Planification logistique avancée (réservation automatique de véhicules, gestion des demandes sans email).
- Affectation automatique des opérateurs aux machines.
- CRM complet (fiche client et suivi des opportunités) : une version simplifiée (fiche client) peut être incluse dans le MVP.
- Reporting avancé : dans le MVP, on se limite à un tableau de bord simple.

## Estimation du Temps et Coût

### Hypothèses

L'équipe est composée de :

- 1 chef de projet (20% du temps)
- 1 développeur Rust backend
- 1 développeur frontend Next.js
- 1 développeur React Native (si on fait le mobile en même temps) ou on utilise le responsive web d'abord.

NOTE: Les intégrations externes sont complexes et seront partiellement mockées en MVP (simulation).

### Détail des Tâches

#### Phase 1: Conception et setup (2 semaines)

- Conception détaillée de l'architecture et des modèles de données
- Setup des environnements de développement et de production
- Mise en place CI/CD

#### Phase 2: Développement Backend (Rust) (8 semaines)

- Module d'authentification et autorisation
- CRUD pour les machines (avec gestion des alertes d'assurance et contrôles techniques)
- CRUD pour les devis, contrats, factures (simplifié)
- CRUD pour le personnel (avec gestion des alertes de permis et visite médicale)
- CRUD clients (simplifié pour le CRM)
- Endpoints pour le tableau de bord (statistiques de base)

#### Phase 3: Développement Frontend Web (Next.js) (6 semaines)

- Pages d'authentification
- Tableau de bord (carte des machines, indicateurs clés)
- Liste et fiche détaillée des machines
- Gestion des devis et contrats (création, visualisation)
- Gestion du personnel (fiches, planning simple)
- Gestion des clients (fiche)

#### Phase 4: Développement Mobile (React Native) (6 semaines) [Optionnel pour MVP]

- Nous pourrions décider de ne faire que le web responsive pour le MVP et de développer l'app mobile après. 
Cela réduirait le temps de MVP.

#### Phase 5: Tests, Déploiement et Formation (2 semaines)

- Tests manuels et automatiques
- Déploiement en préproduction et production
- Formation des utilisateurs clés

### Estimation Totale MVP (sans mobile)

**Temps total**:  

- 2 (setup) + 8 (backend) + 6 (frontend web) + 2 (tests/déploiement) = 18 semaines.

**Coût**:  

- Taux journalier moyen (pour Madagascar) : 240 € (varie selon l'expérience)
- Nombre de jours : 18 semaines * 5 jours/semaine = 90 jours.
- Coût développement : 90 jours * 240 €/jour = 21 600 €.

À cela s'ajoutent les coûts de gestion de projet (chef de projet 20% du temps) 
et d'autres frais (hébergement, outils). 
On peut estimer environ 15% de plus, soit un total d'environ **24 840 €**.


Pour information

- Taux journalier moyen (pour la France) : 500 € (varie selon l'expérience et la localisation)
- Nombre de jours : 18 semaines * 5 jours/semaine = 90 jours.
- Coût développement : 90 jours * 500 €/jour = 45 000 €.


### Estimation MVP avec application mobile (React Native)

- **Temps total**: 18 semaines (sans mobile) + 6 semaines (mobile) = 24 semaines.
- **Coût**: 24 semaines * 5 jours/semaine * 240 €/jour = 28 800 € + 15% = **33 120 €**.

pour information

- **Coût** en France: 24 semaines * 5 jours/semaine * 500 €/jour = 60 000 € + 10% = **66 000 €**.

## Recommandation

Pour le MVP, nous recommandons de commencer par l'application web responsive (Next.js) 
et de différer le développement natif mobile (React Native) à une phase ultérieure. 
Cela permettra de valider le produit plus rapidement et à moindre coût.

## Risques

- Les intégrations avec les systèmes externes (Odoo, Docuware, etc.) sont un risque majeur. En MVP, nous les mockerons, mais il faudra prévoir du temps supplémentaire pour les intégrations réelles.
- La complexité de la gestion des alertes et des plannings peut entraîner des dépassements.

## Conclusion

MVP proposé (sans mobile) : **25 000 €** et **18 semaines**.

pour information 
MVP proposé en France (sans mobile) : **50 000 €** et **18 semaines**.


# MVP 

<h2>Minimum Viable Product - HFF Rental Management</h2>

Objectif : Livrer une version minimale fonctionnelle en 4 mois, couvrant les modules critiques avec des intégrations simplifiées.
Fonctionnalités Prioritaires du MVP

## 1. Suivi de la flotte machines

- Carte interactive (Leaflet/Mapbox) montrant l'état ON/OFF des machines (données mockées ou API VisionLink simplifiée).
- Fiche machine : photo, fiche technique, alertes pour assurance/contrôles (sans Docuware intégré).
- Exclu du MVP : Intégration Docuware complète, TAGIP/MTEC.

## 2. Gestion des devis et contrats

- Création manuelle (mocks) de devis (grille tarifaire préconfigurée).
- Conversion devis → contrat + génération de PDF pour signature.
- Exclu du MVP : Intégration Odoo/Docuware, relances automatiques, facturation auto via Irium.

## 3. Planification logistique

- Planning simple des machines (disponible/en location) avec calendrier (FullCalendar.io).
- Réservation manuelle de véhicules pour trajets internes.

## 4. Gestion du personnel

- Fiche employé : permis, visite médicale, alertes de renouvellement.

- Planning des opérateurs (statut disponible/indisponible).
- Exclu du MVP : Affectation automatique des opérateurs, pointage.

## 5. Tableau de bord reporting

- Indicateurs clés : % machines en location, état du parc, contrats en cours.

## 6. Authentification

- Rôles : Admin, Superviseur, Opérateur.


# Stack Technique

Composant	        Choix
----------------  ----------------------------------
Backend	          Rust (Axum) + SQLx (Postgres) + Tokio
Frontend          Web	Next.js 15 (App Router, Server Actions, Shadcn/ui)
Mobile	          React Native (Expo) pour MVP léger sur iOS/Android
Base de données	  PostgreSQL (modèle relationnel pour machines, contrats, personnel, etc.)
Cartes	          Mapbox GL JS / Leaflet
Styling	          Tailwind CSS

# Estimation 

## Temps & Coût

Phase	                    Temps	      Coût (TJM 240€)     Détails	
-----------------------   ----------- -----------------   -------------------------------------------------------------------------
Conception	              3 semaines	3 600 €             Architecture, modélisation DB, UX/UI	
Backend (Rust)	          8 semaines	9 600 €             API REST (machines, contrats, personnel), alertes, intégration VisionLink	
Frontend Web (Next.js)	  6 semaines	7 200 €             Tableau de bord, cartes, gestion contrats, planning	
Mobile (React Native)	    4 semaines	4 800 €             Vues simplifiées : fiche machine, planning, réservation
Tests & Déploiement	      3 semaines	3 600 €             Tests E2E (Playwright), déploiement VPS (Fly.io/Docker)

Total MVP		24 semaines	28 800 €


<!-- 
Phase	                    Détails	                                                                    Temps	      Coût (TJM 600€)
------------              --------------------------                                                  ---------   -----
Conception	              Architecture, modélisation DB, UX/UI	                                      3 semaines	 9 000 €
Backend (Rust)	          API REST (machines, contrats, personnel), alertes, intégration VisionLink	  8 semaines	24 000 €
Frontend Web (Next.js)	  Tableau de bord, cartes, gestion contrats, planning	                        6 semaines	18 000 €
Mobile (React Native)	    Vues simplifiées : fiche machine, planning, réservation	                    4 semaines	12 000 €
Tests & Déploiement	      Tests E2E (Playwright), déploiement VPS (Fly.io/Docker)	                    3 semaines	9 000 €

Total MVP		24 semaines	72 000 €
-->

## Hypothèses & Risques

Intégrations externes :  

- VisionLink (localisation machines) via API REST mockée pour le MVP.
- Odoo/Docuware/Irium reportées à la V2 (coût additionnel estimé : +5000€ <span style="display:none;">+15 000€</span>).

Équipe :  

- 1 dev Rust, 1 dev Next.js, 1 dev React Native, 1 chef de projet (mi-temps).

Coûts annexes :  

- Hébergement (Postgres + VPS) : ~200€/mois.
- Licences (googlemap? tagIP?):  à prevoir : ~500€/an si à l'étranger.

# Recommandations

- Démarrer sans mobile : Utiliser Next.js PWA pour réduire coûts à 25 000€ (délai -4 semaines).
- Mock initial : Simuler Docuware/Odoo via webhooks basiques pour valider les flux.

Étapes post-MVP :

- Intégration Odoo/Docuware (Python middleware).
- Facturation automatique (API Irium).
- Système de pointage personnel (Near Field Communication, biométrie mobile?).

Livrable MVP : Application web (Next.js) + app mobile légère (React Native) 
avec modules cœur opérationnels en 6 mois.
</main>

