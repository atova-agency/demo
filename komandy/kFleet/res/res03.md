make a dashboard for kFleet. It is a vehicle fleet and rental admin view
in plain html tailwindcss v4. Use <script src="<https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp>"></script>
or <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
The vehicles are road construction vehicle and machinery

We are creating a dashboard for kFleet, a vehicle fleet and rental admin view.

The dashboard will be built with plain HTML and use Tailwind CSS v4 via CDN.

We'll include the necessary plugins: forms, typography, aspect-ratio, line-clamp.

The dashboard will show:

- An overview of the fleet (total vehicles, available, rented, under maintenance)

- A list or grid of vehicles with their details (image, name, status, etc.)

- Some charts for visualization (using a charting library, but we'll use Chart.js for simplicity, included via CDN)

- A section for recent rentals or alerts

Steps:

1. Setup the HTML structure and include Tailwind CSS from the CDN.

2. Include Chart.js for any graphs (like utilization over time).

3. Design the dashboard with a sidebar and main content.

4. Use responsive design with Tailwind classes.

Let's break down the structure:

- Sidebar: for navigation (could have links to different views, but we are focusing on the dashboard)

- Main content:

* Header: with a title and user profile

* Stats grid: showing key numbers (total vehicles, available, rented, maintenance)

* Charts: two charts (e.g., utilization rate, maintenance status distribution)

* Recent rentals: a table of recent rentals

Since we are using road construction vehicles and machinery, we'll use appropriate images and names.

Note: We are using static data for demonstration.

Let's code accordingly.
kFleet - Construction Fleet & Rental Dashboard

I'll create a comprehensive dashboard for managing road construction vehicles and machinery with Tailwind CSS v4. The dashboard will include key metrics, vehicle inventory, maintenance status, and rental management.
html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>kFleet - Construction Fleet Management</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#0d9488',
                        secondary: '#0c4a6e',
                        accent: '#ea580c',
                        dark: '#1e293b'
                    }
                }
            }
        }
    </script>
    <style>
        .sidebar {
            scrollbar-width: thin;
            scrollbar-color: #0d9488 #1e293b;
        }
        .sidebar::-webkit-scrollbar {
            width: 6px;
        }
        .sidebar::-webkit-scrollbar-track {
            background: #1e293b;
        }
        .sidebar::-webkit-scrollbar-thumb {
            background-color: #0d9488;
            border-radius: 10px;
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        .status-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
    </style>
</head>
<body class="bg-slate-100 text-slate-800 flex h-screen">
    <!-- Sidebar -->
    <div class="sidebar bg-dark text-white w-64 flex flex-col overflow-y-auto">
        <div class="p-6">
            <h1 class="text-2xl font-bold text-primary flex items-center">
                <i class="fas fa-truck-pickup mr-2"></i>kFleet
            </h1>
            <p class="text-slate-400 text-sm mt-1">Construction Fleet Management</p>
        </div>
        
        <nav class="flex-1 px-4 py-6">
            <ul>
                <li class="mb-1">
                    <a href="#" class="flex items-center p-3 bg-primary rounded-lg text-white">
                        <i class="fas fa-tachometer-alt mr-3"></i>Dashboard
                    </a>
                </li>
                <li class="mb-1">
                    <a href="#" class="flex items-center p-3 hover:bg-slate-700 rounded-lg text-slate-300">
                        <i class="fas fa-truck mr-3"></i>Fleet Inventory
                    </a>
                </li>
                <li class="mb-1">
                    <a href="#" class="flex items-center p-3 hover:bg-slate-700 rounded-lg text-slate-300">
                        <i class="fas fa-calendar-check mr-3"></i>Rentals
                    </a>
                </li>
                <li class="mb-1">
                    <a href="#" class="flex items-center p-3 hover:bg-slate-700 rounded-lg text-slate-300">
                        <i class="fas fa-tools mr-3"></i>Maintenance
                    </a>
                </li>
                <li class="mb-1">
                    <a href="#" class="flex items-center p-3 hover:bg-slate-700 rounded-lg text-slate-300">
                        <i class="fas fa-map-marker-alt mr-3"></i>Locations
                    </a>
                </li>
                <li class="mb-1">
                    <a href="#" class="flex items-center p-3 hover:bg-slate-700 rounded-lg text-slate-300">
                        <i class="fas fa-file-invoice-dollar mr-3"></i>Billing
                    </a>
                </li>
            </ul>
            
            <div class="mt-8 pt-6 border-t border-slate-700">
                <h3 class="text-xs uppercase text-slate-500 font-bold px-3 mb-3">Reports</h3>
                <ul>
                    <li class="mb-1">
                        <a href="#" class="flex items-center p-3 hover:bg-slate-700 rounded-lg text-slate-300">
                            <i class="fas fa-chart-line mr-3"></i>Utilization
                        </a>
                    </li>
                    <li class="mb-1">
                        <a href="#" class="flex items-center p-3 hover:bg-slate-700 rounded-lg text-slate-300">
                            <i class="fas fa-wrench mr-3"></i>Maintenance Costs
                        </a>
                    </li>
                    <li class="mb-1">
                        <a href="#" class="flex items-center p-3 hover:bg-slate-700 rounded-lg text-slate-300">
                            <i class="fas fa-dollar-sign mr-3"></i>Revenue
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
        
        <div class="p-4 border-t border-slate-700">
            <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span class="font-bold">AJ</span>
                </div>
                <div class="ml-3">
                    <p class="font-medium">Admin Johnson</p>
                    <p class="text-sm text-slate-400">Fleet Manager</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Topbar -->
        <header class="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
            <div class="flex items-center">
                <h2 class="text-xl font-bold text-dark">Fleet Dashboard</h2>
                <div class="ml-4 relative">
                    <input type="text" placeholder="Search vehicles..." class="pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <i class="fas fa-search absolute left-3 top-3 text-slate-400"></i>
                </div>
            </div>
            
            <div class="flex items-center space-x-4">
                <button class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                    <i class="fas fa-bell text-slate-600"></i>
                </button>
                <button class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                    <i class="fas fa-cog text-slate-600"></i>
                </button>
            </div>
        </header>
        
        <!-- Stats Section -->
        <div class="p-6 bg-slate-50 border-b border-slate-200">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-white rounded-xl shadow p-5 border-l-4 border-primary">
                    <div class="flex justify-between">
                        <div>
                            <p class="text-slate-500">Total Vehicles</p>
                            <h3 class="text-3xl font-bold mt-2">48</h3>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <i class="fas fa-truck text-primary text-xl"></i>
                        </div>
                    </div>
                    <div class="mt-3">
                        <span class="text-green-600 text-sm font-medium"><i class="fas fa-arrow-up mr-1"></i> 12% from last month</span>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow p-5 border-l-4 border-secondary">
                    <div class="flex justify-between">
                        <div>
                            <p class="text-slate-500">Currently Rented</p>
                            <h3 class="text-3xl font-bold mt-2">32</h3>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                            <i class="fas fa-calendar-check text-secondary text-xl"></i>
                        </div>
                    </div>
                    <div class="mt-3">
                        <span class="text-slate-500 text-sm">67% utilization</span>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow p-5 border-l-4 border-accent">
                    <div class="flex justify-between">
                        <div>
                            <p class="text-slate-500">Under Maintenance</p>
                            <h3 class="text-3xl font-bold mt-2">8</h3>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                            <i class="fas fa-tools text-accent text-xl"></i>
                        </div>
                    </div>
                    <div class="mt-3">
                        <span class="text-red-600 text-sm font-medium">3 overdue</span>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
                    <div class="flex justify-between">
                        <div>
                            <p class="text-slate-500">Monthly Revenue</p>
                            <h3 class="text-3xl font-bold mt-2">$142,380</h3>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <i class="fas fa-dollar-sign text-green-500 text-xl"></i>
                        </div>
                    </div>
                    <div class="mt-3">
                        <span class="text-green-600 text-sm font-medium"><i class="fas fa-arrow-up mr-1"></i> 8.2% from last month</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Main Dashboard -->
        <div class="flex-1 overflow-auto p-6">
            <div class="mb-6 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-dark">Equipment Overview</h3>
                <div class="flex space-x-3">
                    <button class="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                        <i class="fas fa-plus mr-2"></i>Add Vehicle
                    </button>
                    <button class="px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-50">
                        <i class="fas fa-filter mr-2"></i>Filter
                    </button>
                </div>
            </div>
            
            <!-- Vehicle Grid -->
            <div class="dashboard-grid">
                <!-- Vehicle Card 1 -->
                <div class="bg-white rounded-xl shadow overflow-hidden relative">
                    <div class="status-badge bg-green-100 text-green-800">Available</div>
                    <div class="aspect-square bg-gray-200 flex items-center justify-center">
                        <i class="fas fa-tractor text-6xl text-slate-400"></i>
                    </div>
                    <div class="p-4">
                        <h4 class="font-bold text-lg">Caterpillar D6T Dozer</h4>
                        <p class="text-slate-600 text-sm mt-1">ID: CT-786-D6T</p>
                        <div class="flex justify-between mt-4">
                            <div>
                                <p class="text-xs text-slate-500">Location</p>
                                <p class="text-sm font-medium">Site A, West Lot</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">Hourly Rate</p>
                                <p class="text-sm font-medium">$85/hr</p>
                            </div>
                        </div>
                    </div>
                    <div class="border-t border-slate-100 p-3 flex">
                        <button class="flex-1 py-2 text-center text-primary hover:bg-primary/10 rounded-lg">
                            <i class="fas fa-info-circle mr-1"></i> Details
                        </button>
                        <button class="flex-1 py-2 text-center text-green-600 hover:bg-green-100 rounded-lg">
                            <i class="fas fa-calendar-plus mr-1"></i> Rent
                        </button>
                    </div>
                </div>
                
                <!-- Vehicle Card 2 -->
                <div class="bg-white rounded-xl shadow overflow-hidden relative">
                    <div class="status-badge bg-blue-100 text-blue-800">Rented</div>
                    <div class="aspect-square bg-gray-200 flex items-center justify-center">
                        <i class="fas fa-truck-monster text-6xl text-slate-400"></i>
                    </div>
                    <div class="p-4">
                        <h4 class="font-bold text-lg">Komatsu HD785-8 Dump Truck</h4>
                        <p class="text-slate-600 text-sm mt-1">ID: KM-985-HD7</p>
                        <div class="flex justify-between mt-4">
                            <div>
                                <p class="text-xs text-slate-500">Rented To</p>
                                <p class="text-sm font-medium">BuildCo Inc.</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">Return Date</p>
                                <p class="text-sm font-medium">Jun 30, 2023</p>
                            </div>
                        </div>
                    </div>
                    <div class="border-t border-slate-100 p-3 flex">
                        <button class="flex-1 py-2 text-center text-primary hover:bg-primary/10 rounded-lg">
                            <i class="fas fa-info-circle mr-1"></i> Details
                        </button>
                        <button class="flex-1 py-2 text-center text-purple-600 hover:bg-purple-100 rounded-lg">
                            <i class="fas fa-file-invoice mr-1"></i> Invoice
                        </button>
                    </div>
                </div>
                
                <!-- Vehicle Card 3 -->
                <div class="bg-white rounded-xl shadow overflow-hidden relative">
                    <div class="status-badge bg-red-100 text-red-800">Maintenance</div>
                    <div class="aspect-square bg-gray-200 flex items-center justify-center">
                        <i class="fas fa-road text-6xl text-slate-400"></i>
                    </div>
                    <div class="p-4">
                        <h4 class="font-bold text-lg">Volvo SD115B Paver</h4>
                        <p class="text-slate-600 text-sm mt-1">ID: VO-115-SD1</p>
                        <div class="flex justify-between mt-4">
                            <div>
                                <p class="text-xs text-slate-500">Issue</p>
                                <p class="text-sm font-medium">Hydraulic Leak</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">Est. Repair</p>
                                <p class="text-sm font-medium">3 days</p>
                            </div>
                        </div>
                    </div>
                    <div class="border-t border-slate-100 p-3 flex">
                        <button class="flex-1 py-2 text-center text-primary hover:bg-primary/10 rounded-lg">
                            <i class="fas fa-info-circle mr-1"></i> Details
                        </button>
                        <button class="flex-1 py-2 text-center text-accent hover:bg-accent/10 rounded-lg">
                            <i class="fas fa-wrench mr-1"></i> Track
                        </button>
                    </div>
                </div>
                
                <!-- Vehicle Card 4 -->
                <div class="bg-white rounded-xl shadow overflow-hidden relative">
                    <div class="status-badge bg-green-100 text-green-800">Available</div>
                    <div class="aspect-square bg-gray-200 flex items-center justify-center">
                        <i class="fas fa-compress text-6xl text-slate-400"></i>
                    </div>
                    <div class="p-4">
                        <h4 class="font-bold text-lg">JCB 3CX Backhoe Loader</h4>
                        <p class="text-slate-600 text-sm mt-1">ID: JC-003-3CX</p>
                        <div class="flex justify-between mt-4">
                            <div>
                                <p class="text-xs text-slate-500">Location</p>
                                <p class="text-sm font-medium">Main Yard</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">Hourly Rate</p>
                                <p class="text-sm font-medium">$65/hr</p>
                            </div>
                        </div>
                    </div>
                    <div class="border-t border-slate-100 p-3 flex">
                        <button class="flex-1 py-2 text-center text-primary hover:bg-primary/10 rounded-lg">
                            <i class="fas fa-info-circle mr-1"></i> Details
                        </button>
                        <button class="flex-1 py-2 text-center text-green-600 hover:bg-green-100 rounded-lg">
                            <i class="fas fa-calendar-plus mr-1"></i> Rent
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Charts and Tables Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <!-- Utilization Chart -->
                <div class="bg-white rounded-xl shadow p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-lg text-dark">Fleet Utilization</h3>
                        <select class="border border-slate-300 rounded-lg px-3 py-1 text-sm">
                            <option>Last 7 Days</option>
                            <option selected>Last 30 Days</option>
                            <option>Last 90 Days</option>
                        </select>
                    </div>
                    <div class="h-64 flex items-end justify-between pt-4">
                        <div class="flex flex-col items-center w-1/6">
                            <div class="w-full bg-primary/20 rounded-t-md" style="height: 70%"></div>
                            <p class="text-xs mt-1">Mon</p>
                        </div>
                        <div class="flex flex-col items-center w-1/6">
                            <div class="w-full bg-primary/30 rounded-t-md" style="height: 80%"></div>
                            <p class="text-xs mt-1">Tue</p>
                        </div>
                        <div class="flex flex-col items-center w-1/6">
                            <div class="w-full bg-primary rounded-t-md" style="height: 95%"></div>
                            <p class="text-xs mt-1">Wed</p>
                        </div>
                        <div class="flex flex-col items-center w-1/6">
                            <div class="w-full bg-primary/80 rounded-t-md" style="height: 90%"></div>
                            <p class="text-xs mt-1">Thu</p>
                        </div>
                        <div class="flex flex-col items-center w-1/6">
                            <div class="w-full bg-primary/60 rounded-t-md" style="height: 75%"></div>
                            <p class="text-xs mt-1">Fri</p>
                        </div>
                        <div class="flex flex-col items-center w-1/6">
                            <div class="w-full bg-primary/40 rounded-t-md" style="height: 40%"></div>
                            <p class="text-xs mt-1">Sat</p>
                        </div>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-100">
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full bg-primary mr-2"></div>
                            <p class="text-sm">Current Utilization: 67%</p>
                            <div class="ml-4 w-3 h-3 rounded-full bg-secondary mr-2"></div>
                            <p class="text-sm">Target: 75%</p>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Rentals Table -->
                <div class="bg-white rounded-xl shadow p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-lg text-dark">Recent Rentals</h3>
                        <button class="text-primary text-sm font-medium">View All</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="text-left text-xs text-slate-500 border-b border-slate-100">
                                    <th class="pb-3">Client</th>
                                    <th class="pb-3">Equipment</th>
                                    <th class="pb-3">Duration</th>
                                    <th class="pb-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-slate-100">
                                    <td class="py-3">
                                        <div class="font-medium">BuildCo Inc.</div>
                                        <div class="text-xs text-slate-500">Jun 15, 2023</div>
                                    </td>
                                    <td class="py-3">Dump Truck</td>
                                    <td class="py-3">14 days</td>
                                    <td class="py-3 text-right font-medium">$12,600</td>
                                </tr>
                                <tr class="border-b border-slate-100">
                                    <td class="py-3">
                                        <div class="font-medium">RoadMasters LLC</div>
                                        <div class="text-xs text-slate-500">Jun 12, 2023</div>
                                    </td>
                                    <td class="py-3">Asphalt Paver</td>
                                    <td class="py-3">7 days</td>
                                    <td class="py-3 text-right font-medium">$8,400</td>
                                </tr>
                                <tr class="border-b border-slate-100">
                                    <td class="py-3">
                                        <div class="font-medium">City Infrastructure</div>
                                        <div class="text-xs text-slate-500">Jun 10, 2023</div>
                                    </td>
                                    <td class="py-3">Excavator</td>
                                    <td class="py-3">30 days</td>
                                    <td class="py-3 text-right font-medium">$18,000</td>
                                </tr>
                                <tr class="border-b border-slate-100">
                                    <td class="py-3">
                                        <div class="font-medium">Highway Constructors</div>
                                        <div class="text-xs text-slate-500">Jun 8, 2023</div>
                                    </td>
                                    <td class="py-3">Bulldozer</td>
                                    <td class="py-3">10 days</td>
                                    <td class="py-3 text-right font-medium">$9,500</td>
                                </tr>
                                <tr>
                                    <td class="py-3">
                                        <div class="font-medium">Bridge Builders</div>
                                        <div class="text-xs text-slate-500">Jun 5, 2023</div>
                                    </td>
                                    <td class="py-3">Crane</td>
                                    <td class="py-3">21 days</td>
                                    <td class="py-3 text-right font-medium">$25,200</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

Key Features of the kFleet Dashboard

    Modern Dashboard Layout

        Left sidebar navigation with fleet management sections

        Top header with search and user controls

        Responsive grid layout that adapts to different screen sizes

    Key Metrics Overview

        Total vehicles count with growth indicator

        Currently rented equipment with utilization rate

        Maintenance status with overdue alerts

        Monthly revenue tracking

    Construction Equipment Management

        Visual status badges (Available, Rented, Maintenance)

        Equipment details with ID, location, and pricing

        Quick action buttons for rental management

        Visual representation of different machinery types

    Data Visualization

        Fleet utilization chart showing weekly patterns

        Recent rentals table with financial information

        Color-coded status indicators for quick scanning

    Fleet-Specific Design Elements

        Construction vehicle icons for different equipment types

        Status indicators tailored for rental operations

        Utilization metrics for equipment efficiency

        Maintenance tracking for downtime management

The dashboard uses a color scheme appropriate for industrial applications, with teal as the primary color and orange accents for important alerts. All components are built with Tailwind CSS v4 and include responsive design for both desktop and mobile viewing.


