Axum sqlx PostgreSQL SQL for a fleet rental management system desktop and mobile. 
With     
- Fuel tracking columns
- Employee/staff management tables
- Promotion/discount system
- Insurance management
- Multi-location support enhancements
- Maintenance tracking

We are designing a database for a fleet rental management system that supports both desktop and mobile.

The system should include:

1. Fuel tracking

2. Employee/staff management

3. Promotion/discount system

4. Insurance management

5. Multi-location support

6. Maintenance tracking

We'll use PostgreSQL and design the tables accordingly.

Let's break down the requirements:

1. Fuel Tracking:

- We need to track fuel usage for each vehicle. This may include:

* vehicle_id (foreign key to vehicle table)

* fuel_quantity (e.g., in liters)

* fuel_cost

* date

* odometer_reading (to track mileage at the time of fueling)

* fueling_location (optional, but useful for multi-location)

2. Employee/Staff Management:

- We'll have a table for employees/staff.

* employee_id (primary key)

* name, contact info, role, etc.

* location_id (for multi-location, foreign key to location table)

3. Promotion/Discount System:

- We need to manage promotions or discounts that can be applied to rentals.

* promotion_id (primary key)

* code (optional, if using promo codes)

* description

* discount_type (e.g., percentage, fixed amount)

* discount_value

* valid_from, valid_to

* conditions (like minimum rental days, etc.)

4. Insurance Management:

- We might have multiple insurance plans and track which vehicle has which insurance.

- Also, we may want to track the insurance details for each rental (since the customer might choose an insurance plan at rental time).

- Let's create:

* insurance_plan table: plan_id, name, description, daily_cost, coverage_details

* Then, in the rental table, we can have a foreign key to the insurance_plan chosen.

5. Multi-location Support:

- We'll have a location table to represent different branches.

* location_id (primary key)

* address, city, state, country, phone, etc.

- Vehicles will be assigned to a location (current location).

- Employees are assigned to a location.

6. Maintenance Tracking:

- We need to schedule and track maintenance for vehicles.

* maintenance_id (primary key)

* vehicle_id

* maintenance_type (e.g., oil change, tire rotation)

* maintenance_date

* cost

* description

* odometer_reading (optional, but good to track)

* location_id (where the maintenance was performed)

We'll also need core tables for:

- Customers

- Vehicles

- Rentals

Let's design the tables step by step.

Step 1: Locations

Table: locations

location_id   SERIAL PRIMARY KEY,

address       TEXT,

city          VARCHAR(100),

state         VARCHAR(100),

country       VARCHAR(100),

postal_code   VARCHAR(20),

phone         VARCHAR(20)

Step 2: Employees

Table: employees

employee_id   SERIAL PRIMARY KEY,

first_name    VARCHAR(50) NOT NULL,

last_name     VARCHAR(50) NOT NULL,

email         VARCHAR(100) UNIQUE,

phone         VARCHAR(20),

hire_date     DATE NOT NULL,

job_title     VARCHAR(100),

location_id   INTEGER REFERENCES locations(location_id) ON DELETE SET NULL

Step 3: Vehicle Types (e.g., SUV, Sedan, Truck)

Table: vehicle_types

type_id       SERIAL PRIMARY KEY,

type_name     VARCHAR(50) NOT NULL,

description   TEXT

Step 4: Vehicles

Table: vehicles

vehicle_id        SERIAL PRIMARY KEY,

make              VARCHAR(50) NOT NULL,

model             VARCHAR(50) NOT NULL,

year              INTEGER NOT NULL,

license_plate     VARCHAR(20) UNIQUE NOT NULL,

current_mileage   INTEGER,   -- in km or miles, but we need to be consistent

color             VARCHAR(30),

type_id           INTEGER REFERENCES vehicle_types(type_id) ON DELETE SET NULL,

status            VARCHAR(20) NOT NULL CHECK (status IN ('available', 'rented', 'maintenance', 'out_of_service')),

current_location  INTEGER REFERENCES locations(location_id) ON DELETE SET NULL,

daily_rate        NUMERIC(10,2) NOT NULL

Step 5: Customers

Table: customers

customer_id   SERIAL PRIMARY KEY,

first_name    VARCHAR(50) NOT NULL,

last_name     VARCHAR(50) NOT NULL,

email         VARCHAR(100) UNIQUE,

phone         VARCHAR(20) NOT NULL,

address       TEXT,

driver_license_number VARCHAR(50) UNIQUE,

driver_license_expiry DATE

Step 6: Insurance Plans

Table: insurance_plans

plan_id       SERIAL PRIMARY KEY,

plan_name     VARCHAR(100) NOT NULL,

description   TEXT,

daily_cost    NUMERIC(10,2) NOT NULL,

coverage_details TEXT

Step 7: Promotions

Table: promotions

promotion_id     SERIAL PRIMARY KEY,

promo_code       VARCHAR(50) UNIQUE,  -- can be null if not code-based

description      TEXT,

discount_type    VARCHAR(10) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),

discount_value   NUMERIC(10,2) NOT NULL,  -- if percentage, then 10 means 10%

valid_from       DATE,

valid_to         DATE,

min_rental_days  INTEGER DEFAULT 0,

max_discount     NUMERIC(10,2)  -- optional: cap on discount

Step 8: Rentals

Table: rentals

rental_id        SERIAL PRIMARY KEY,

customer_id      INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,

vehicle_id       INTEGER NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,

pickup_location  INTEGER NOT NULL REFERENCES locations(location_id),

dropoff_location INTEGER REFERENCES locations(location_id),  -- can be null if not returned yet

start_date       TIMESTAMP NOT NULL,

end_date         TIMESTAMP NOT NULL,

actual_end_date  TIMESTAMP, -- when the vehicle was actually returned

total_cost       NUMERIC(10,2),

insurance_plan_id INTEGER REFERENCES insurance_plans(plan_id) ON DELETE SET NULL,

promotion_id     INTEGER REFERENCES promotions(promotion_id) ON DELETE SET NULL,

employee_id      INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL, -- who handled the rental

Step 9: Fuel Tracking

Table: fuel_purchases

fuel_id          SERIAL PRIMARY KEY,

vehicle_id       INTEGER NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,

purchase_date    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

quantity         NUMERIC(10,2) NOT NULL, -- liters

cost_per_unit    NUMERIC(10,2) NOT NULL, -- cost per liter

total_cost       NUMERIC(10,2) GENERATED ALWAYS AS (quantity * cost_per_unit) STORED,

odometer_reading INTEGER NOT NULL, -- at the time of fueling

location_id      INTEGER REFERENCES locations(location_id) ON DELETE SET NULL,

notes            TEXT

Step 10: Maintenance Tracking

Table: maintenance_records

maintenance_id   SERIAL PRIMARY KEY,

vehicle_id       INTEGER NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,

maintenance_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

maintenance_type VARCHAR(100) NOT NULL,

description      TEXT,

cost             NUMERIC(10,2),

odometer_reading INTEGER,

location_id      INTEGER REFERENCES locations(location_id) ON DELETE SET NULL,

employee_id      INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL -- who performed the maintenance

We might also consider a table for rental charges, but for simplicity, we are including total_cost in rentals.

However, note that rental cost might be calculated based on:

base_cost = (number of days) * daily_rate

plus insurance daily cost for the duration

minus discount from promotion

But we are storing the total_cost as a calculated value at the time of rental creation/return.

Alternatively, we could break down the charges and store line items, but for now, we'll keep it simple.

Let's create the tables in SQL.

Here's a comprehensive PostgreSQL schema for a fleet rental management system using SQLx/Axum, incorporating all your requirements:
sql

CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(location_id) ON DELETE SET NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL,
    auth_level VARCHAR(20) CHECK (auth_level IN ('admin', 'manager', 'staff'))
);

CREATE TABLE vehicle_types (
    type_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    daily_rate NUMERIC(10,2) NOT NULL
);

CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    type_id INT REFERENCES vehicle_types(type_id) NOT NULL,
    location_id INT REFERENCES locations(location_id) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    color VARCHAR(30),
    current_mileage INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL 
        CHECK (status IN ('available', 'rented', 'maintenance', 'out_of_service')),
    last_service_date DATE
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    driver_license VARCHAR(50) UNIQUE NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE insurance_plans (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    daily_cost NUMERIC(8,2) NOT NULL,
    coverage_details TEXT NOT NULL
);

CREATE TABLE promotions (
    promotion_id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    discount_type VARCHAR(10) NOT NULL 
        CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(8,2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    max_uses INT DEFAULT NULL
);

CREATE TABLE rentals (
    rental_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id) NOT NULL,
    vehicle_id INT REFERENCES vehicles(vehicle_id) NOT NULL,
    employee_id INT REFERENCES employees(employee_id) NOT NULL,
    pickup_location INT REFERENCES locations(location_id) NOT NULL,
    dropoff_location INT REFERENCES locations(location_id) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    actual_end_date TIMESTAMP,
    base_cost NUMERIC(10,2) NOT NULL,
    insurance_id INT REFERENCES insurance_plans(plan_id),
    promotion_id INT REFERENCES promotions(promotion_id),
    total_cost NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL 
        CHECK (status IN ('active', 'completed', 'cancelled'))
);

CREATE TABLE fuel_purchases (
    fuel_id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(vehicle_id) NOT NULL,
    employee_id INT REFERENCES employees(employee_id) NOT NULL,
    location_id INT REFERENCES locations(location_id) NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    liters NUMERIC(8,2) NOT NULL,
    cost_per_liter NUMERIC(8,2) NOT NULL,
    total_cost NUMERIC(10,2) GENERATED ALWAYS AS (liters * cost_per_liter) STORED,
    odometer_reading INT NOT NULL
);

CREATE TABLE maintenance (
    maintenance_id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(vehicle_id) NOT NULL,
    location_id INT REFERENCES locations(location_id) NOT NULL,
    service_date DATE NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    cost NUMERIC(10,2) NOT NULL,
    odometer INT NOT NULL,
    next_service_due DATE
);

CREATE TABLE rental_discounts (
    rental_id INT REFERENCES rentals(rental_id) ON DELETE CASCADE,
    promotion_id INT REFERENCES promotions(promotion_id),
    discount_applied NUMERIC(8,2) NOT NULL,
    PRIMARY KEY (rental_id, promotion_id)
);

Key Features Explained:

    Multi-Location Management:

        locations table stores branch details

        Foreign keys in vehicles, employees, and rentals

        Location-specific fuel purchases and maintenance tracking

    Fuel Tracking:

        fuel_purchases table captures:

            Fuel quantity (liters) and cost

            Odometer readings

            Location of purchase

            Automatically calculated total cost

    Employee Management:

        employees table with role-based access control

        Location assignment for staff

        Authentication levels for system access

    Promotion System:

        Time-bound promotions with usage limits

        Support for percentage or fixed discounts

        Dedicated mapping table (rental_discounts) for application tracking

    Insurance Management:

        Separate insurance_plans table

        Daily cost structure with coverage details

        Optional attachment to rentals

    Maintenance Tracking:

        Full service history in maintenance table

        Cost tracking and service types

        Next service due dates for preventive scheduling

    Core Rental Operations:

        Flexible rental status tracking

        Multi-location pickup/dropoff

        Cost calculation with insurance and promotions

        Actual return time tracking

Usage Notes:

    Use GENERATED columns for automatic cost calculations

    CHECK constraints ensure data integrity

    Foreign keys enforce relational integrity

    Status fields use enumerations for consistent state management

    Index critical fields like rental.status, vehicle.status, and promotions.code

This schema supports both desktop and mobile interfaces through normalized relationships and efficient status tracking. The structure allows for expansion with additional features like GPS tracking integration or customer loyalty programs.

---

with code

Rust Axum with sqlx and Postgre to make a fleet rental management system desktop and mobile. 

With     
- Fuel tracking columns
- Employee/staff management tables
- Promotion/discount system
- Insurance management
- Multi-location support enhancements
- Maintenance tracking

We are going to design a fleet rental management system using Rust with Axum (web framework), SQLx (async SQL toolkit), and PostgreSQL. The system will support both desktop and mobile (via responsive web design). We'll cover the following features:

1. Fuel tracking

2. Employee/staff management

3. Promotion/discount system

4. Insurance management

5. Multi-location support

6. Maintenance tracking

We'll break down the project into:

- Database schema (PostgreSQL tables and relationships)

- API endpoints (using Axum)

- Brief on how to structure the project

Let's start with the database schema.

### Database Schema

We'll have the following tables:

1. **locations** - for multi-location support

2. **employees** - staff management

3. **customers** - to store customer information

4. **vehicles** - fleet of rental vehicles

5. **fuel_logs** - for fuel tracking

6. **maintenance_logs** - for maintenance tracking

7. **insurances** - insurance management

8. **promotions** - for discounts and promotions

9. **rentals** - to manage vehicle rentals

Let me define each table:

#### 1. locations

- id: SERIAL PRIMARY KEY

- name: VARCHAR(255) NOT NULL

- address: TEXT NOT NULL

- phone: VARCHAR(20)

- manager_id: INTEGER REFERENCES employees(id) [nullable, because a location might not have a manager assigned immediately]

#### 2. employees

- id: SERIAL PRIMARY KEY

- first_name: VARCHAR(50) NOT NULL

- last_name: VARCHAR(50) NOT NULL

- email: VARCHAR(255) UNIQUE NOT NULL

- phone: VARCHAR(20)

- location_id: INTEGER REFERENCES locations(id) [nullable if an employee is not assigned to a location yet]

- role: VARCHAR(50) [e.g., 'manager', 'staff', 'mechanic']

- hire_date: DATE NOT NULL

- termination_date: DATE [nullable, if still employed]

#### 3. customers

- id: SERIAL PRIMARY KEY

- first_name: VARCHAR(50) NOT NULL

- last_name: VARCHAR(50) NOT NULL

- email: VARCHAR(255) UNIQUE NOT NULL

- phone: VARCHAR(20) NOT NULL

- driver_license: VARCHAR(50) NOT NULL

- address: TEXT

#### 4. vehicles

- id: SERIAL PRIMARY KEY

- make: VARCHAR(50) NOT NULL

- model: VARCHAR(50) NOT NULL

- year: INTEGER NOT NULL

- registration_number: VARCHAR(20) UNIQUE NOT NULL

- current_location_id: INTEGER REFERENCES locations(id) NOT NULL

- status: VARCHAR(20) [e.g., 'available', 'rented', 'maintenance']

- odometer: INTEGER [current mileage]

- fuel_type: VARCHAR(20) [e.g., 'gasoline', 'diesel', 'electric']

- fuel_capacity: INTEGER [in liters or kWh if electric?]

#### 5. fuel_logs

- id: SERIAL PRIMARY KEY

- vehicle_id: INTEGER REFERENCES vehicles(id) NOT NULL

- employee_id: INTEGER REFERENCES employees(id) NOT NULL [who recorded the fuel log]

- amount: NUMERIC(10,2) NOT NULL [amount of fuel added, in liters or kWh]

- cost_per_unit: NUMERIC(10,2) NOT NULL [cost per liter/kWh]

- total_cost: NUMERIC(10,2) NOT NULL

- odometer_reading: INTEGER NOT NULL [at the time of refueling]

- date: DATE NOT NULL

- notes: TEXT

#### 6. maintenance_logs

- id: SERIAL PRIMARY KEY

- vehicle_id: INTEGER REFERENCES vehicles(id) NOT NULL

- employee_id: INTEGER REFERENCES employees(id) NOT NULL [who performed the maintenance]

- service_type: VARCHAR(100) NOT NULL [e.g., 'oil change', 'tire rotation']

- date: DATE NOT NULL

- odometer_reading: INTEGER NOT NULL

- cost: NUMERIC(10,2) NOT NULL

- notes: TEXT

#### 7. insurances

- id: SERIAL PRIMARY KEY

- vehicle_id: INTEGER REFERENCES vehicles(id) NOT NULL

- policy_number: VARCHAR(100) NOT NULL

- provider: VARCHAR(100) NOT NULL

- coverage_type: VARCHAR(100) [e.g., 'comprehensive', 'liability']

- start_date: DATE NOT NULL

- end_date: DATE NOT NULL

- premium: NUMERIC(10,2) NOT NULL

#### 8. promotions

- id: SERIAL PRIMARY KEY

- code: VARCHAR(50) UNIQUE NOT NULL

- description: TEXT

- discount_type: VARCHAR(20) [e.g., 'percentage', 'fixed']

- discount_value: NUMERIC(10,2) NOT NULL

- start_date: DATE NOT NULL

- end_date: DATE NOT NULL

- max_uses: INTEGER [nullable, if unlimited]

- current_uses: INTEGER DEFAULT 0

#### 9. rentals

- id: SERIAL PRIMARY KEY

- customer_id: INTEGER REFERENCES customers(id) NOT NULL

- vehicle_id: INTEGER REFERENCES vehicles(id) NOT NULL

- pickup_location_id: INTEGER REFERENCES locations(id) NOT NULL

- dropoff_location_id: INTEGER REFERENCES locations(id) NOT NULL

- start_date: DATE NOT NULL

- end_date: DATE NOT NULL

- actual_end_date: DATE [nullable, if not returned yet]

- total_cost: NUMERIC(10,2) NOT NULL

- promotion_id: INTEGER REFERENCES promotions(id) [nullable, if no promotion used]

- insurance_id: INTEGER REFERENCES insurances(id) [nullable, if no insurance selected? or maybe we have default insurance?]

- status: VARCHAR(20) [e.g., 'reserved', 'active', 'completed', 'cancelled']

### API Endpoints (Axum)

We'll create endpoints for:

- Locations: CRUD

- Employees: CRUD

- Customers: CRUD

- Vehicles: CRUD

- Fuel Logs: CRUD

- Maintenance Logs: CRUD

- Insurances: CRUD

- Promotions: CRUD

- Rentals: CRUD

We'll use RESTful design for the endpoints. We'll also have authentication and authorization (but that is beyond the scope of this design). We assume we'll use JWT for authentication and have role-based access control (RBAC).

### Project Structure

We'll use a typical Axum project structure:

```

src/

├── main.rs

├── error.rs         # Custom error handling

├── models/

│   ├── mod.rs       # Module for models

│   ├── location.rs

│   ├── employee.rs

│   └── ...          # Other models

├── routes/

│   ├── mod.rs       # Combines all routes

│   ├── location.rs

│   ├── employee.rs

│   └── ...          # Other route modules

├── db/

│   ├── mod.rs       # Database connection and setup

└── handlers/

├── mod.rs       # Module for handlers

├── location.rs

├── employee.rs

└── ...          # Other handlers

```

### Setting Up

We'll use `sqlx` with a connection pool and `axum` with `tokio`. We'll also use `serde` for serialization/deserialization.

### Example: Location Model and Handlers

Let's create a simple example for the `Location` model and CRUD operations.

#### `src/models/location.rs`

```rust

use serde::{Deserialize, Serialize};

use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize, Deserialize)]

pub struct Location {

pub id: i32,

pub name: String,

pub address: String,

pub phone: Option<String>,

pub manager_id: Option<i32>,

}

#[derive(Debug, Serialize, Deserialize)]

pub struct CreateLocation {

pub name: String,

pub address: String,

pub phone: Option<String>,

pub manager_id: Option<i32>,

}

#[derive(Debug, Serialize, Deserialize)]

pub struct UpdateLocation {

pub name: Option<String>,

pub address: Option<String>,

pub phone: Option<String>,

pub manager_id: Option<i32>,

}

```

#### `src/handlers/location.rs`

```rust

use axum::{

extract::{Path, State},

http::StatusCode,

Json,

};

use sqlx::PgPool;

use crate::models::location::{Location, CreateLocation, UpdateLocation};

use crate::error::AppError;

pub async fn create_location(

State(pool): State<PgPool>,

Json(payload): Json<CreateLocation>,

) -> Result<(StatusCode, Json<Location>), AppError> {

let location = sqlx::query_as!(

Location,

r#"

INSERT INTO locations (name, address, phone, manager_id)

VALUES ($1, $2, $3, $4)

RETURNING id, name, address, phone, manager_id

"#,

payload.name,

payload.address,

payload.phone,

payload.manager_id

)

.fetch_one(&pool)

.await?;

Ok((StatusCode::CREATED, Json(location)))

}

pub async fn get_location(

Path(id): Path<i32>,

State(pool): State<PgPool>,

) -> Result<Json<Location>, AppError> {

let location = sqlx::query_as!(

Location,

r#"SELECT id, name, address, phone, manager_id FROM locations WHERE id = $1"#,

id

)

.fetch_one(&pool)

.await?;

Ok(Json(location))

}

// Similarly for update and delete

```

#### `src/routes/location.rs`

```rust

use axum::{

routing::{get, post, put, delete},

Router,

};

use crate::handlers::location::{create_location, get_location, update_location, delete_location};

use crate::AppState;

pub fn location_router() -> Router<AppState> {

Router::new()

.route("/", post(create_location))

.route("/:id", get(get_location).put(update_location).delete(delete_location))

}

```

#### `src/main.rs`

```rust

mod error;

mod models;

mod routes;

mod db;

mod handlers;

use axum::{routing::get, Router};

use std::net::SocketAddr;

use dotenv::dotenv;

use sqlx::postgres::PgPoolOptions;

use std::sync::Arc;

#[derive(Clone)]

pub struct AppState {

pool: sqlx::PgPool,

}

#[tokio::main]

async fn main() {

dotenv().ok();

let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

let pool = PgPoolOptions::new()

.connect(&database_url)

.await

.expect("Failed to create pool");

let state = AppState { pool: Arc::new(pool) };

let app = Router::new()

.route("/", get(|| async { "Hello, World!" }))

.merge(routes::location::location_router())

// ... merge other routers

.with_state(state);

let addr = SocketAddr::from(([127, 0, 0, 1], 3000));

axum::Server::bind(&addr)

.serve(app.into_make_service())

.await

.unwrap();

}

```

### Note on Frontend

For a desktop and mobile application, we can build a responsive web application (using a frontend framework like React, Vue, or Svelte) that consumes these APIs. Alternatively, we can build native mobile apps that use the same API.

### Conclusion

This is a high-level design. We have defined the database schema and started setting up the Axum project. Each feature (fuel tracking, employee management, etc.) will follow the same pattern. We have to implement the CRUD operations for each model and then integrate them.

We also need to consider:

- Authentication and authorization

- Input validation

- Error handling

- Logging

- Testing

But this gives a solid foundation to build upon.

Here's a comprehensive design for a Fleet Rental Management System using Rust, Axum, SQLx, and PostgreSQL. This solution includes the requested features with database schema, API endpoints, and system architecture.
Database Schema (PostgreSQL)
sql

-- Locations
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL
);

-- Employees
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
    is_active BOOLEAN DEFAULT true
);

-- Vehicles
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance')),
    current_mileage INTEGER NOT NULL,
    fuel_type VARCHAR(20) NOT NULL
);

-- Fuel Tracking
CREATE TABLE fuel_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    liters NUMERIC(5,2) NOT NULL,
    cost_per_liter NUMERIC(5,2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Tracking
CREATE TABLE maintenance (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('routine', 'repair', 'accident')),
    description TEXT NOT NULL,
    cost NUMERIC(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed'))
);

-- Insurance
CREATE TABLE insurance (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    policy_number VARCHAR(100) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    coverage_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium NUMERIC(10,2) NOT NULL
);

-- Promotions
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_type VARCHAR(10) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    max_uses INTEGER
);

-- Rentals
CREATE TABLE rentals (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    customer_id INTEGER NOT NULL, -- External CRM reference
    pickup_location INTEGER REFERENCES locations(id),
    dropoff_location INTEGER REFERENCES locations(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    actual_end_date TIMESTAMP,
    total_cost NUMERIC(10,2) NOT NULL,
    promotion_id INTEGER REFERENCES promotions(id),
    insurance_option_id INTEGER REFERENCES insurance(id),
    status VARCHAR(20) DEFAULT 'reserved' CHECK (status IN ('reserved', 'active', 'completed', 'cancelled'))
);

API Endpoints (Axum Router)
rust

// src/main.rs
use axum::{routing, Router};
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() {
    let pool = PgPoolOptions::new()
        .connect("postgres://user:pass@localhost/db")
        .await
        .unwrap();

    let app = Router::new()
        .route("/vehicles", routing::get(handlers::list_vehicles))
        .route("/fuel", routing::post(handlers::add_fuel_record))
        .route("/maintenance", routing::post(handlers::create_maintenance))
        .route("/promotions", routing::post(handlers::create_promotion))
        .route("/rentals", routing::post(handlers::create_rental))
        .route("/rentals/:id/return", routing::put(handlers::return_vehicle))
        .with_state(pool);

    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

// src/handlers.rs
use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::{PgPool, postgres::PgQueryAs};

pub async fn add_fuel_record(
    State(pool): State<PgPool>,
    Json(payload): Json<FuelRecord>,
) -> Result<Json<FuelRecord>, String> {
    let record = sqlx::query!(
        r#"
        INSERT INTO fuel_records 
        (vehicle_id, employee_id, liters, cost_per_liter)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
        payload.vehicle_id,
        payload.employee_id,
        payload.liters,
        payload.cost_per_liter
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Json(record))
}

// Similar handlers for other endpoints...

Key Features Implementation

    Multi-Location Support

        Vehicle transfers between locations

        Location-specific availability endpoints
    rust

// Get available vehicles by location
pub async fn list_available_vehicles(
    State(pool): State<PgPool>,
    Path(location_id): Path<i32>
) -> Json<Vec<Vehicle>> {
    sqlx::query_as!(
        Vehicle,
        "SELECT * FROM vehicles 
         WHERE location_id = $1 AND status = 'available'",
        location_id
    )
    .fetch_all(&pool)
    .await
    .unwrap()
}

Maintenance Tracking

    Automated status updates

    Maintenance history endpoint

sql

-- Automatically update vehicle status
CREATE TRIGGER maintenance_status_update
AFTER INSERT OR UPDATE ON maintenance
FOR EACH ROW
EXECUTE PROCEDURE update_vehicle_status();

Promotion System

    Validation middleware

rust

pub async fn apply_promotion(
    promotion_code: &str,
    total_cost: f64,
    pool: &PgPool
) -> Result<f64, String> {
    let promo = sqlx::query!(
        "SELECT * FROM promotions 
         WHERE code = $1 AND NOW() BETWEEN valid_from AND valid_until",
        promotion_code
    )
    .fetch_optional(pool)
    .await?;

    match promo {
        Some(p) => {
            let discount = match p.discount_type.as_str() {
                "percentage" => total_cost * (p.discount_value / 100.0),
                "fixed" => p.discount_value,
                _ => 0.0
            };
            Ok((total_cost - discount).max(0.0))
        }
        None => Err("Invalid promotion".into()),
    }
}

Fuel Tracking

    Consumption reports

rust

pub async fn fuel_consumption_report(
    vehicle_id: i32,
    pool: &PgPool
) -> Json<FuelReport> {
    let records = sqlx::query!(
        "SELECT date, liters, cost_per_liter 
         FROM fuel_records 
         WHERE vehicle_id = $1 
         ORDER BY date DESC",
        vehicle_id
    )
    .fetch_all(pool)
    .await
    .unwrap();
    
    // Calculate metrics...
}

Insurance Management

    Expiration alerts (cron job)

sql

    -- Get expiring policies
    SELECT * FROM insurance 
    WHERE end_date BETWEEN NOW() AND NOW() + INTERVAL '30 days';

Mobile Support Strategy

    Responsive Design

        Use Tailwind CSS for frontend components

        Grid-based layouts with flexbox

    API Optimization

        Pagination for large datasets

        Field selection parameter
    rust

// Pagination example
pub async fn list_vehicles(
    Query(pagination): Query<PaginationParams>,
    State(pool): State<PgPool>
) -> Json<PaginatedResponse<Vehicle>> {
    let page = pagination.page.unwrap_or(1);
    let per_page = pagination.per_page.unwrap_or(10);
    
    // SQL query with LIMIT/OFFSET...
}

Authentication

    JWT with refresh tokens

    Role-based access control

rust

    // Middleware example
    pub async fn auth_middleware(
        TypedHeader(Authorization(bearer)): TypedHeader<Authorization<Bearer>>,
        State(pool): State<PgPool>,
        request: Request,
        next: Next
    ) -> Result<impl IntoResponse, StatusCode> {
        let claims = verify_jwt(bearer.token())?;
        let user = get_user_from_db(claims.sub, &pool).await?;
        
        // Attach user to request
        let mut req = request;
        req.extensions_mut().insert(user);
        Ok(next.run(req).await)
    }

System Architecture
text

Client (Mobile/Desktop) 
↓ ↑
REST API (Axum) 
↓ ↑
Business Logic Layer 
↓ ↑
Repository (SQLx) 
↓ ↑
PostgreSQL Database

Deployment Considerations

    Containerization
    Dockerfile

    FROM rust:latest
    WORKDIR /app
    COPY . .
    RUN cargo build --release
    CMD ["./target/release/fleet_rental"]

    Database Optimization

        Indexes on foreign keys

        Partition rental table by date

        Connection pooling with PgBouncer

    Monitoring

        Prometheus for metrics

        Sentry for error tracking

        Log aggregation with Loki

This design provides:

    Full CRUD operations for all entities

    Complex business logic for rentals and promotions

    Maintenance lifecycle management

    Multi-location inventory tracking

    Mobile-friendly API design

    Automated status transitions

    Financial tracking capabilities

To enhance the system further, consider adding:

    Real-time vehicle tracking integration

    Document generation (rental agreements, invoices)

    Payment gateway integration

    Predictive maintenance alerts

    Fleet utilization analytics dashboard



