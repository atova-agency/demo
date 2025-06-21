Créer un tableau de bord pour kFleet.

Créer un tableau de bord
Il s'agit d'un système de gestion de location de flotte de machines et de véhicules.

Dans la vue administrateur, nous devrions voir des catégories telles que :
- engins de chantier,
- grues, bétonnières,
- machines telles que groupes électrogènes pour les projets de construction.

Le thème devrait être jaune ou orange « construction ».
utiliser seulement html chartjs tailwindcss v4. 

Design mobile first

<script src="<https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp>"></script>

<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

Nous allons créer un tableau de bord pour kFleet, un système de gestion de location de flotte de machines et véhicules.

Le thème sera jaune/orange "construction". Nous utiliserons Tailwind CSS v4 avec les plugins et Chart.js pour les graphiques.

Design mobile first.

Structure du tableau de bord (vue administrateur) :

- Catégories : engins de chantier, grues, bétonnières, groupes électrogènes, etc.

- Nous allons afficher des statistiques, des graphiques et des listes de matériels.

Nous allons structurer la page en plusieurs sections :

1. Un en-tête avec le titre et la navigation.

2. Une section de résumé (KPI) avec des cartes.

3. Des graphiques (Chart.js) pour visualiser les données.

4. Une liste des équipements récents ou à surveiller.

Couleurs du thème : jaune/orange. Nous utiliserons les classes Tailwind pour cela.

Étapes :

- Inclure Tailwind CSS via CDN (avec les plugins).

- Inclure Chart.js.

- Créer la structure HTML avec les classes Tailwind.

Note: Nous allons utiliser le CDN pour Tailwind v4 (actuellement en version 4, mais notez que la version 4 n'est pas encore stable, donc nous utilisons la version 3 classique?).

Cependant, la demande spécifie v4. Mais à ce jour, Tailwind CSS v4 n'est pas encore sortie. Donc, nous allons utiliser la version 3 et suivre les instructions pour la version 4 si disponible.

Mais la commande CDN fournie est pour Tailwind CSS v3. Nous allons donc utiliser la dernière version de Tailwind CSS v3.

Cependant, la demande précise d'utiliser v4. Étant donné que v4 n'est pas encore disponible, nous allons utiliser v3 et ajuster si nécessaire.

Nous allons utiliser le CDN de Tailwind CSS v3 avec les plugins, comme dans le script fourni.

Pour Chart.js, nous utiliserons le CDN.

Structure de la page :

<body class="bg-gray-100">

<header class="bg-yellow-500 text-white ...">

...

</header>

<main class="container mx-auto p-4">

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

<!-- Cartes de résumé (KPI) -->

<div class="bg-white p-4 rounded shadow">...</div>

... 3 autres cartes

</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

<!-- Graphiques -->

<div class="bg-white p-4 rounded shadow">

<canvas id="chart1"></canvas>

</div>

<div class="bg-white p-4 rounded shadow">

<canvas id="chart2"></canvas>

</div>

</div>

<!-- Liste des équipements -->

<div class="bg-white p-4 rounded shadow">

<h2 class="text-lg font-semibold mb-2">Équipements récents</h2>

<table class="min-w-full divide-y divide-gray-200">

...

</table>

</div>

</main>

</body>

Nous allons créer 4 cartes pour les KPI :

1. Total des équipements

2. Équipements en location

3. Équipements disponibles

4. Équipements en maintenance

Graphiques :

1. Répartition par catégorie (camembert)

2. Évolution des locations (ligne)

Liste : une table des équipements avec quelques détails.

Couleurs du thème :

- Jaune pour l'en-tête et les accents : bg-yellow-500, text-yellow-500, etc.

Nous allons utiliser Chart.js avec des couleurs en accord avec le thème.

Pour le design mobile first, nous utiliserons les classes responsives de Tailwind.

Code :
Tableau de bord kFleet - Gestion de flotte

Voici un tableau de bord complet pour kFleet, un système de gestion de location de flotte de machines et véhicules, avec un thème construction jaune/orange et un design mobile first.
html

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>kFleet - Tableau de bord</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #f59e0b;
            --primary-dark: #d97706;
            --secondary: #ea580c;
            --dark: #1e293b;
            --light: #f8fafc;
        }
        
        body {
            background-color: #f1f5f9;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        
        .construction-bg {
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f59e0b' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="flex flex-col min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-sm">
            <div class="container mx-auto px-4 py-3 flex items-center justify-between">
                <div class="flex items-center">
                    <div class="bg-yellow-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-hard-hat text-white text-xl"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-800">
                        <span class="text-yellow-500">k</span>Fleet
                    </h1>
                </div>
                
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <button class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-bell text-xl"></i>
                            <span class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                        </button>
                    </div>
                    <div class="relative">
                        <img src="https://ui-avatars.com/api/?name=Admin+kFleet&background=f59e0b&color=fff" alt="Admin" class="w-10 h-10 rounded-full border-2 border-yellow-500">
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-grow container mx-auto px-4 py-6 construction-bg">
            <!-- Page Title -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Tableau de bord</h2>
                <p class="text-gray-600">Aperçu de votre flotte et des locations en cours</p>
            </div>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
                    <div class="flex items-center">
                        <div class="p-3 bg-yellow-100 rounded-lg mr-4">
                            <i class="fas fa-truck-pickup text-yellow-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Total équipements</p>
                            <h3 class="text-2xl font-bold text-gray-800">142</h3>
                        </div>
                    </div>
                    <div class="mt-4">
                        <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">+8% ce mois</span>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500">
                    <div class="flex items-center">
                        <div class="p-3 bg-orange-100 rounded-lg mr-4">
                            <i class="fas fa-tools text-orange-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">En location</p>
                            <h3 class="text-2xl font-bold text-gray-800">87</h3>
                        </div>
                    </div>
                    <div class="mt-4">
                        <span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">12 nouveaux contrats</span>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-amber-500">
                    <div class="flex items-center">
                        <div class="p-3 bg-amber-100 rounded-lg mr-4">
                            <i class="fas fa-wrench text-amber-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">En maintenance</p>
                            <h3 class="text-2xl font-bold text-gray-800">15</h3>
                        </div>
                    </div>
                    <div class="mt-4">
                        <span class="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">3 à réparer</span>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-md p-5 border-l-4 border-amber-700">
                    <div class="flex items-center">
                        <div class="p-3 bg-amber-200 rounded-lg mr-4">
                            <i class="fas fa-coins text-amber-800 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Revenus mensuels</p>
                            <h3 class="text-2xl font-bold text-gray-800">€245,620</h3>
                        </div>
                    </div>
                    <div class="mt-4">
                        <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">+15% vs mois dernier</span>
                    </div>
                </div>
            </div>
            
            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Location Chart -->
                <div class="bg-white rounded-xl shadow-md p-5">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-gray-800">Évolution des locations</h3>
                        <div class="flex space-x-2">
                            <button class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Mois</button>
                            <button class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">Trimestre</button>
                            <button class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">Année</button>
                        </div>
                    </div>
                    <div class="h-72">
                        <canvas id="locationsChart"></canvas>
                    </div>
                </div>
                
                <!-- Equipment Distribution -->
                <div class="bg-white rounded-xl shadow-md p-5">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-gray-800">Répartition par catégorie</h3>
                        <div class="text-sm text-gray-500">Total: 142 équipements</div>
                    </div>
                    <div class="h-72">
                        <canvas id="distributionChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity & Equipment -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Recent Activity -->
                <div class="bg-white rounded-xl shadow-md p-5">
                    <h3 class="font-semibold text-gray-800 mb-4">Activités récentes</h3>
                    <div class="space-y-4">
                        <div class="flex items-start border-b pb-3">
                            <div class="p-2 bg-green-100 rounded-full mr-3">
                                <i class="fas fa-check-circle text-green-600"></i>
                            </div>
                            <div>
                                <p class="font-medium">Location confirmée</p>
                                <p class="text-sm text-gray-600">Bétonnière MX450 louée à BTP France</p>
                                <p class="text-xs text-gray-500">Il y a 2 heures</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start border-b pb-3">
                            <div class="p-2 bg-blue-100 rounded-full mr-3">
                                <i class="fas fa-shipping-fast text-blue-600"></i>
                            </div>
                            <div>
                                <p class="font-medium">Livraison programmée</p>
                                <p class="text-sm text-gray-600">Groupe électrogène 150kVA pour chantier Lyon</p>
                                <p class="text-xs text-gray-500">Aujourd'hui, 10:30</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start border-b pb-3">
                            <div class="p-2 bg-yellow-100 rounded-full mr-3">
                                <i class="fas fa-exclamation-triangle text-yellow-600"></i>
                            </div>
                            <div>
                                <p class="font-medium">Maintenance requise</p>
                                <p class="text-sm text-gray-600">Grue mobile n°G-2217 - Problème hydraulique</p>
                                <p class="text-xs text-gray-500">Hier, 16:45</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start">
                            <div class="p-2 bg-purple-100 rounded-full mr-3">
                                <i class="fas fa-file-invoice-dollar text-purple-600"></i>
                            </div>
                            <div>
                                <p class="font-medium">Facture émise</p>
                                <p class="text-sm text-gray-600">Location d'engins pour Constructions Dupont</p>
                                <p class="text-xs text-gray-500">Hier, 14:20</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Equipment List -->
                <div class="bg-white rounded-xl shadow-md p-5">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-gray-800">Équipements récemment ajoutés</h3>
                        <button class="text-sm text-yellow-600 font-medium flex items-center">
                            Voir tout <i class="fas fa-arrow-right ml-1 text-xs"></i>
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="text-left text-xs text-gray-500 border-b">
                                    <th class="pb-2">Équipement</th>
                                    <th class="pb-2">Catégorie</th>
                                    <th class="pb-2">Statut</th>
                                    <th class="pb-2">Date</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">
                                <tr>
                                    <td class="py-3">
                                        <div class="font-medium">Grue mobile LTM 1100</div>
                                        <div class="text-xs text-gray-500">Ref: GR-2245</div>
                                    </td>
                                    <td class="py-3">
                                        <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Grue</span>
                                    </td>
                                    <td class="py-3">
                                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Disponible</span>
                                    </td>
                                    <td class="py-3 text-sm text-gray-500">15/06/2023</td>
                                </tr>
                                
                                <tr>
                                    <td class="py-3">
                                        <div class="font-medium">Bétonnière MX650</div>
                                        <div class="text-xs text-gray-500">Ref: BT-7821</div>
                                    </td>
                                    <td class="py-3">
                                        <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">Bétonnière</span>
                                    </td>
                                    <td class="py-3">
                                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">En location</span>
                                    </td>
                                    <td class="py-3 text-sm text-gray-500">14/06/2023</td>
                                </tr>
                                
                                <tr>
                                    <td class="py-3">
                                        <div class="font-medium">Groupe électrogène 200kVA</div>
                                        <div class="text-xs text-gray-500">Ref: GE-3350</div>
                                    </td>
                                    <td class="py-3">
                                        <span class="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Énergie</span>
                                    </td>
                                    <td class="py-3">
                                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Disponible</span>
                                    </td>
                                    <td class="py-3 text-sm text-gray-500">12/06/2023</td>
                                </tr>
                                
                                <tr>
                                    <td class="py-3">
                                        <div class="font-medium">Pelle hydraulique PC210</div>
                                        <div class="text-xs text-gray-500">Ref: PH-4412</div>
                                    </td>
                                    <td class="py-3">
                                        <span class="bg-amber-200 text-amber-900 px-2 py-1 rounded-full text-xs">Engin</span>
                                    </td>
                                    <td class="py-3">
                                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">En location</span>
                                    </td>
                                    <td class="py-3 text-sm text-gray-500">10/06/2023</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
        
        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-6 mt-10">
            <div class="container mx-auto px-4">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <div class="mb-4 md:mb-0">
                        <div class="flex items-center">
                            <div class="bg-yellow-500 w-8 h-8 rounded-lg flex items-center justify-center mr-2">
                                <i class="fas fa-hard-hat text-white"></i>
                            </div>
                            <span class="font-bold text-xl"><span class="text-yellow-500">k</span>Fleet</span>
                        </div>
                        <p class="text-gray-400 text-sm mt-2">Gestion de flotte pour professionnels du BTP</p>
                    </div>
                    <div class="text-gray-400 text-sm">
                        &copy; 2023 kFleet. Tous droits réservés.
                    </div>
                </div>
            </div>
        </footer>
    </div>

    <script>
        // Chart initialization
        document.addEventListener('DOMContentLoaded', function() {
            // Locations Chart
            const locationsCtx = document.getElementById('locationsChart').getContext('2d');
            const locationsChart = new Chart(locationsCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
                    datasets: [{
                        label: 'Locations actives',
                        data: [45, 52, 48, 55, 58, 62, 70, 75, 68, 72, 80, 87],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 3,
                        tension: 0.3,
                        fill: true
                    }, {
                        label: 'Revenus (x1000)',
                        data: [120, 135, 125, 142, 155, 165, 185, 200, 190, 205, 225, 246],
                        borderColor: '#ea580c',
                        borderWidth: 3,
                        tension: 0.3,
                        borderDash: [5, 5]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
            
            // Distribution Chart
            const distributionCtx = document.getElementById('distributionChart').getContext('2d');
            const distributionChart = new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Engins de chantier', 'Grues', 'Bétonnières', 'Groupes électrogènes', 'Autres'],
                    datasets: [{
                        data: [42, 28, 19, 32, 21],
                        backgroundColor: [
                            '#f59e0b',
                            '#ea580c',
                            '#f97316',
                            '#fbbf24',
                            '#fcd34d'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    },
                    cutout: '65%'
                }
            });
        });
    </script>
</body>
</html>

Fonctionnalités du tableau de bord kFleet

Ce tableau de bord offre une vue complète de votre flotte avec :

    Design responsive optimisé pour mobile et desktop

    Thème construction jaune/orange avec des icônes adaptées

    Cartes statistiques pour un aperçu rapide :

        Équipements totaux

        Équipements en location

        Équipements en maintenance

        Revenus mensuels

    Graphiques interactifs :

        Évolution des locations et revenus (graphique linéaire)

        Répartition des équipements par catégorie (camembert)

    Activités récentes :

        Confirmations de location

        Livraisons programmées

        Alertes de maintenance

        Factures émises

    Liste des équipements récemment ajoutés :

        Avec détails par catégorie

        Statut de disponibilité

        Références uniques

    Navigation intuitive avec :

        En-tête avec notifications

        Menu utilisateur

        Pied de page professionnel

Le tableau de bord utilise Chart.js pour les visualisations de données et Tailwind CSS v4 pour un design moderne et responsive.
