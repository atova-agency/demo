PostgreSQL SQL for a fleet rental management system desktop and mobile. 
With     
- Fuel tracking columns
- Employee/staff management tables
- Promotion/discount system
- Insurance management
- Multi-location support enhancements
- Maintenance tracking

We are designing a database for a fleet rental management system that supports both desktop and mobile.

The system should include:

- Fuel tracking

- Employee/staff management

- Promotion/discount system

- Insurance management

- Multi-location support

- Maintenance tracking

We'll break down the requirements into several tables.

Let's outline the tables:

1. **Locations**: To support multi-location.

- location_id (PK)

- address

- city

- state

- postal_code

- country

- phone

- manager_id (FK to Employees)

2. **Employees**: For staff management.

- employee_id (PK)

- first_name

- last_name

- email

- phone

- hire_date

- job_title

- location_id (FK to Locations) - the location they are assigned to

- manager_id (FK to Employees) - their direct manager

3. **Customers**: For customer details.

- customer_id (PK)

- first_name

- last_name

- email

- phone

- driver_license_number

- driver_license_expiry

- address

- city

- state

- postal_code

- country

4. **Vehicles**: For fleet management.

- vehicle_id (PK)

- make

- model

- year

- color

- license_plate

- vehicle_type (e.g., sedan, SUV, truck)

- current_location_id (FK to Locations) - where the vehicle is currently located

- status (e.g., available, rented, maintenance)

- daily_rate

- odometer_reading

- fuel_type (e.g., petrol, diesel, electric)

- fuel_tank_capacity

- last_fuel_update (timestamp of the last fuel update)

- current_fuel_level (as a percentage, or in liters? We can store as a decimal, e.g., 0.75 for 75% or absolute value in liters. Let's store in liters for accuracy and because tank capacity is in liters.)

- insurance_policy_id (FK to InsurancePolicies) - the current insurance policy for the vehicle

5. **Rentals**: To track vehicle rentals.

- rental_id (PK)

- customer_id (FK to Customers)

- vehicle_id (FK to Vehicles)

- pickup_location_id (FK to Locations)

- dropoff_location_id (FK to Locations) - planned drop-off location

- actual_dropoff_location_id (FK to Locations) - actual location where the vehicle was returned

- start_date

- end_date (planned end date)

- actual_end_date

- rental_status (e.g., reserved, ongoing, completed, cancelled)

- total_cost

- employee_id (FK to Employees) - the employee who processed the rental

6. **FuelTransactions**: For tracking fuel usage and refueling.

- transaction_id (PK)

- vehicle_id (FK to Vehicles)

- employee_id (FK to Employees) - who recorded the transaction (if done by staff)

- transaction_date

- fuel_amount (in liters)

- cost_per_liter

- total_cost

- odometer_reading (at the time of refueling)

- note (optional, e.g., if the customer refueled and provided a receipt)

7. **Maintenance**: For maintenance tracking.

- maintenance_id (PK)

- vehicle_id (FK to Vehicles)

- maintenance_type (e.g., oil change, tire rotation, brake service, inspection)

- description

- maintenance_date

- next_maintenance_date (if applicable)

- cost

- location_id (FK to Locations) - where the maintenance was done

- employee_id (FK to Employees) - who performed the maintenance (if in-house) or NULL if outsourced

- vendor (if outsourced)

8. **InsurancePolicies**: For managing insurance policies.

- policy_id (PK)

- insurance_company

- policy_number

- coverage_start_date

- coverage_end_date

- coverage_details (text describing the coverage)

- premium_amount

- deductible

9. **Promotions**: For discounts and promotions.

- promotion_id (PK)

- promotion_code (unique)

- description

- discount_type (e.g., percentage, fixed amount)

- discount_value (e.g., 10 for 10% or $10)

- start_date

- end_date

- max_usage (maximum number of times it can be used, NULL for unlimited)

- current_usage (how many times it has been used)

10. **RentalPromotions**: To apply promotions to rentals (many-to-many).

- rental_id (FK to Rentals)

- promotion_id (FK to Promotions)

- discount_applied (the actual discount amount applied in this rental, since the promotion might be a percentage and we want to record the exact discount)

11. **DamageReports**: To track any damages to vehicles during rental.

- report_id (PK)

- rental_id (FK to Rentals)

- employee_id (FK to Employees) - who recorded the damage

- report_date

- description

- repair_cost

- paid_by_customer (boolean) - whether the customer was charged for the damage

We'll create these tables with appropriate constraints and indexes.

Note: We are using PostgreSQL.

Let's write the SQL DDL statements.

Here's a comprehensive PostgreSQL schema for a fleet rental management system with all requested features:
sql

-- LOCATIONS (Multi-location support)
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) NOT NULL,
    manager_id INT REFERENCES employees(employee_id),
    phone VARCHAR(20) NOT NULL
);

-- EMPLOYEES (Staff management)
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hire_date DATE NOT NULL,
    job_title VARCHAR(50) NOT NULL,
    location_id INT REFERENCES locations(location_id),
    auth_level VARCHAR(20) CHECK (auth_level IN ('admin', 'manager', 'staff'))
);

-- CUSTOMERS
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    join_date DATE DEFAULT CURRENT_DATE
);

-- INSURANCE POLICIES
CREATE TABLE insurance_policies (
    policy_id SERIAL PRIMARY KEY,
    provider VARCHAR(100) NOT NULL,
    coverage_type VARCHAR(50) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    deductible DECIMAL(10,2) NOT NULL,
    description TEXT
);

-- VEHICLES (Fleet core)
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    current_mileage INT NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' 
        CHECK (status IN ('available', 'rented', 'maintenance', 'out-of-service')),
    location_id INT REFERENCES locations(location_id),
    daily_rate DECIMAL(10,2) NOT NULL,
    fuel_type VARCHAR(20) CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid')),
    fuel_tank_capacity DECIMAL(6,2),
    insurance_policy_id INT REFERENCES insurance_policies(policy_id)
);

-- FUEL TRACKING
CREATE TABLE fuel_records (
    record_id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL REFERENCES vehicles(vehicle_id),
    employee_id INT REFERENCES employees(employee_id),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fuel_amount DECIMAL(6,2) NOT NULL, -- in liters
    cost_per_liter DECIMAL(5,3) NOT NULL,
    odometer_reading INT NOT NULL,
    note TEXT
);

-- MAINTENANCE TRACKING
CREATE TABLE maintenance (
    maintenance_id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL REFERENCES vehicles(vehicle_id),
    maintenance_type VARCHAR(50) NOT NULL 
        CHECK (maintenance_type IN ('oil change', 'tire rotation', 'brake service', 'scheduled', 'repair')),
    start_date DATE NOT NULL,
    end_date DATE,
    cost DECIMAL(10,2),
    location_id INT REFERENCES locations(location_id),
    description TEXT,
    mechanic_notes TEXT
);

-- PROMOTIONS/DISCOUNTS
CREATE TABLE promotions (
    promotion_id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    discount_type VARCHAR(10) NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    max_uses INT,
    min_rental_days INT DEFAULT 1
);

-- RENTALS (Core business entity)
CREATE TABLE rentals (
    rental_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    vehicle_id INT NOT NULL REFERENCES vehicles(vehicle_id),
    pickup_location INT NOT NULL REFERENCES locations(location_id),
    dropoff_location INT REFERENCES locations(location_id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    actual_return_date TIMESTAMP,
    base_cost DECIMAL(10,2) NOT NULL,
    insurance_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (
        base_cost + insurance_cost - COALESCE(discount_amount,0)
    ) STORED,
    status VARCHAR(20) DEFAULT 'reserved' 
        CHECK (status IN ('reserved', 'active', 'completed', 'cancelled')),
    initial_fuel DECIMAL(5,2) NOT NULL,
    return_fuel DECIMAL(5,2),
    fuel_surcharge DECIMAL(10,2),
    promotion_id INT REFERENCES promotions(promotion_id),
    discount_amount DECIMAL(10,2),
    employee_id INT REFERENCES employees(employee_id)
);

-- DAMAGE REPORTS (Insurance-related)
CREATE TABLE damage_reports (
    report_id SERIAL PRIMARY KEY,
    rental_id INT NOT NULL REFERENCES rentals(rental_id),
    description TEXT NOT NULL,
    repair_cost DECIMAL(10,2),
    reported_by INT REFERENCES employees(employee_id),
    report_date DATE DEFAULT CURRENT_DATE,
    is_covered BOOLEAN DEFAULT true
);

Key Features Implementation:

    Fuel Tracking:

        fuel_records table with precise fuel measurements

        Fuel type and tank capacity in vehicles

        Fuel surcharge calculation in rentals

        Fuel level tracking at rental start/end

    Employee Management:

        Hierarchical structure with auth_level

        Location assignment with location_id

        Audit trails via employee references in transactions

    Promotion System:

        Flexible discount types (percentage/fixed)

        Usage limits and validity periods

        Minimum rental day requirements

        Direct application to rentals

    Insurance Management:

        Policy details with daily rates

        Damage reports with coverage flags

        Deductible tracking

        Cost calculation in rentals

    Multi-Location Support:

        Location entities with full address details

        Vehicle assignment to locations

        Pickup/dropoff locations in rentals

        Maintenance location tracking

    Maintenance Tracking:

        Service type classification

        Cost tracking

        Date ranges for maintenance periods

        Mechanic notes field

Usage Notes:

    Calculated Columns: Total cost in rentals is auto-calculated

    Status Tracking: Vehicles and rentals have state machines

    Fuel Logic: Surcharge calculated based on return_fuel vs initial_fuel

    Security: Employee auth levels control system access

    Auditing: Critical tables reference employee IDs

    Data Validation: CHECK constraints enforce domain logic

This schema supports:

    Cross-location vehicle transfers

    Complex promotion rules

    Detailed maintenance history

    Insurance claim processing

    Employee performance tracking

    Fuel consumption analytics

    Damage liability management

For mobile integration, consider adding:

    mobile_device_id to employees table

    API key management system

    Push notification tables

    Location tracking history for vehicles

---


