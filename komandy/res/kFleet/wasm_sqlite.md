ust wasm wasm-bindgen sqlite in the browser

We are going to use `sqlite` in the browser via WebAssembly (WASM) in a Rust project. However, note that running a full SQLite database in the browser is possible, but we have to consider the environment limitations (like no direct filesystem access). We can use a virtual filesystem or store the database in IndexedDB.

A popular approach is to use the `sql.js` library (SQLite compiled to JavaScript), but if we want to use Rust and WASM, we can consider:

1. **Compiling SQLite to WASM**: We can compile the SQLite C code to WASM and then use it from Rust. However, this might be complex because we need to set up the Emscripten toolchain and handle the C to Rust/WASM interop.

2. **Using a Rust SQLite crate that supports WASM**: There are crates like `rusqlite` that can be compiled to WASM, but note that `rusqlite` by default relies on system SQLite and may not work in the browser without adjustments.

Alternatively, we can use a pure Rust SQLite implementation that works in WASM. One such implementation is `sqlite3` (the crate is named `sqlite` on crates.io) which is a pure Rust SQLite implementation. However, note that it might not be as fully featured as the C version.

Another approach is to use `wasm-bindgen` to interact with JavaScript and use `sql.js` from Rust. This way, we can leverage the existing `sql.js` library and avoid recompiling SQLite in Rust.

Given the requirements, let's consider the following:

We want to use `wasm-bindgen` and Rust to interact with SQLite in the browser. We have two main options:

**Option 1: Use `sql.js` via `wasm-bindgen`**

We can use the `sql.js` library by creating bindings to it from Rust. This involves:

- Adding `sql.js` as a dependency in our HTML or via a bundler.

- Using `wasm-bindgen` to call JavaScript functions that use `sql.js`.

Alternatively, we can use a crate that already provides bindings to `sql.js`. There is a crate called `sql-js` (https://crates.io/crates/sql-js) that provides Rust bindings for `sql.js`. However, it hasn't been updated recently.

**Option 2: Use a pure Rust SQLite that works in WASM**

We can use the `sqlite` crate (https://crates.io/crates/sqlite) which is a pure Rust implementation. It supports `wasm32-unknown-unknown` target. This might be simpler because we don't need to deal with JavaScript interop for the database operations.

Let's go with **Option 2** for a pure Rust/WASM solution.

Steps:

1. Create a new Rust library project with `wasm-bindgen`:

```sh

cargo new --lib wasm-sqlite-demo

cd wasm-sqlite-demo

```

2. Update `Cargo.toml`:

```toml

[package]

name = "wasm-sqlite-demo"

version = "0.1.0"

edition = "2021"

[lib]

crate-type = ["cdylib"]

[dependencies]

wasm-bindgen = "0.2"

sqlite = "0.34.0" # This is a pure Rust SQLite implementation

```

3. We'll write some code to open an in-memory database, create a table, insert data, and query it.

However, note: In the browser, we don't have a filesystem. The `sqlite` crate by default uses `std::fs` for persistent storage, which isn't available in WASM. But we can use an in-memory database. If we want persistence, we need to store the database bytes in IndexedDB and restore them when needed. For simplicity, we'll start with an in-memory database.

Example code in `src/lib.rs`:

```rust

use sqlite::State;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]

pub fn run_sqlite_demo() -> Result<(), JsValue> {

// Open an in-memory database

let connection = sqlite::open(":memory:").map_err(|e| JsValue::from_str(&e.to_string()))?;

// Create a table

connection.execute("

CREATE TABLE users (name TEXT, age INTEGER);

").map_err(|e| JsValue::from_str(&e.to_string()))?;

// Insert some data

connection.execute("

INSERT INTO users VALUES ('Alice', 42);

INSERT INTO users VALUES ('Bob', 69);

").map_err(|e| JsValue::from_str(&e.to_string()))?;

// Query the data

let mut statement = connection.prepare("

SELECT * FROM users;

").map_err(|e| JsValue::from_str(&e.to_string()))?;

while let State::Row = statement.next().map_err(|e| JsValue::from_str(&e.to_string()))? {

let name = statement.read::<String, _>("name").map_err(|e| JsValue::from_str(&e.to_string()))?;

let age = statement.read::<i64, _>("age").map_err(|e| JsValue::from_str(&e.to_string()))?;

web_sys::console::log_1(&format!("name: {}, age: {}", name, age).into());

}

Ok(())

}

```

This example uses `web_sys::console::log_1` to log to the browser console. We need to add `web-sys` as a dependency and enable the `console` feature.

4. Update `Cargo.toml` to include `web-sys`:

```toml

[dependencies]

wasm-bindgen = "0.2"

sqlite = "0.34.0"

[dependencies.web-sys]

version = "0.3"

features = ["console"]

```

5. Build the project:

We need to build the project for the `wasm32-unknown-unknown` target and then run `wasm-bindgen` to generate the JavaScript bindings.

First, install the target if you haven't:

```sh

rustup target add wasm32-unknown-unknown

```

Then, build:

```sh

cargo build --target wasm32-unknown-unknown --release

```

After building, we use `wasm-bindgen` to post-process the WASM file:

```sh

wasm-bindgen --target web --out-dir ./pkg ./target/wasm32-unknown-unknown/release/wasm_sqlite_demo.wasm

```

6. Create an `index.html` file in the project root to load the WASM module:

```html

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<title>SQLite in WASM</title>

<script type="module">

import init, { run_sqlite_demo } from './pkg/wasm_sqlite_demo.js';

async function run() {

await init();

run_sqlite_demo();

}

run().catch(console.error);

</script>

</head>

<body>

<h1>Check the console for SQLite output</h1>

</body>

</html>

```

7. Serve the files using a simple HTTP server (like `python3 -m http.server`) and open the page.

However, note that the `sqlite` crate is a pure Rust implementation and may not have the full functionality of SQLite. Also, it does not support persisting the database to disk in the browser. If you need persistence, you would have to:

- Serialize the entire database to a byte array (using `connection.serialize()`? but the `sqlite` crate doesn't have a direct method for that).

- Store the byte array in IndexedDB.

- On next load, read from IndexedDB and deserialize.

But the `sqlite` crate doesn't currently support deserializing from a byte array. So for a production scenario with persistence, using `sql.js` might be a better option because it has built-in support for loading from/saving to binary arrays and can be stored in IndexedDB.

Alternatively, we could use the `sqlite3` C library compiled to WASM and use it via `wasm-bindgen` and a virtual filesystem that uses IndexedDB. This is what projects like [absurd-sql](https://github.com/jlongster/absurd-sql) do, but that's more complex.

Given the complexity, if you require persistence, I would recommend using `sql.js` and interacting with it via `wasm-bindgen` and JavaScript FFI. Or, if you are okay with a more experimental approach, you could try the `sqlite` crate and see if you can get the database as a byte array (if it provides that) and then store it.

But for the purpose of this demo, we are just using an in-memory database and logging the results.

Let me know if you have any questions or need further adjustments.

To use SQLite in a browser with Rust and WebAssembly (WASM), follow this step-by-step guide. Since browsers lack direct filesystem access, we'll use a virtual filesystem and IndexedDB for persistence. The solution involves compiling SQLite to WASM and using wasm-bindgen for JavaScript interoperability.
Key Tools & Libraries

    sql.js: SQLite compiled to JavaScript + WASM

    wasm-bindgen: Rust↔JavaScript interoperability

    web-sys: Bindings for Web APIs

    js-sys: Bindings for JavaScript standard objects

Step-by-Step Implementation
1. Add Dependencies to Cargo.toml
toml

[package]
name = "web-sqlite-demo"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
js-sys = "0.3"
web-sys = { version = "0.3", features = ["Window", "Document", "Element", "console"] }

2. Create Rust Library (lib.rs)
rust

use wasm_bindgen::prelude::*;
use js_sys::{Array, Uint8Array};
use web_sys::console;

// Load SQL.js and initialize SQLite
#[wasm_bindgen]
pub async fn init_db() -> Result<(), JsValue> {
    let window = web_sys::window().expect("no global window");
    let document = window.document().expect("no document");
    
    // Dynamically load SQL.js from CDN
    let script = document.create_element("script")?;
    script.set_attribute("src", "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js")?;
    document.head().unwrap().append_child(&script)?;

    // Wait for script to load
    let promise = js_sys::Promise::new(&mut |resolve, _| {
        script.set_onload(Some(&resolve));
    });
    wasm_bindgen_futures::JsFuture::from(promise).await?;

    console::log_1(&"SQL.js loaded".into());
    Ok(())
}

#[wasm_bindgen]
pub fn run_query(sql: &str) -> Result<JsValue, JsValue> {
    let db = new_db()?;
    // Execute SQL and return results as JSON
    let results = db.exec(sql)?;
    Ok(serde_wasm_bindgen::to_value(&results)?)
}

// Create a new in-memory database
#[wasm_bindgen]
pub fn new_db() -> Result<js_sys::Object, JsValue> {
    let sql_js = js_sys::eval("new window.SQL.Database()")?;
    Ok(sql_js.into())
}

3. Build WASM Bundle
bash

# Install target
rustup target add wasm32-unknown-unknown

# Build
cargo build --target wasm32-unknown-unknown --release

# Generate JS bindings
wasm-bindgen --target web --out-dir ./pkg \
  ./target/wasm32-unknown-unknown/release/web_sqlite_demo.wasm

4. Create HTML/JavaScript Frontend (index.html)
html

<!DOCTYPE html>
<html>
<head>
    <title>Rust WASM SQLite Demo</title>
</head>
<body>
    <button id="run">Run Query</button>
    <pre id="output"></pre>

    <script type="module">
        import init, { init_db, run_query } from './pkg/web_sqlite_demo.js';

        (async () => {
            await init();
            await init_db();

            document.getElementById("run").addEventListener("click", async () => {
                const results = await run_query(`
                    CREATE TABLE users (id INTEGER, name TEXT);
                    INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob');
                    SELECT * FROM users;
                `);
                document.getElementById("output").textContent = 
                    JSON.stringify(results, null, 2);
            });
        })();
    </script>
</body>
</html>

5. Serve with a Local Server
bash

# Install HTTP server (if needed)
npm install -g http-server

# Run server (from project root)
http-server

Visit http://localhost:8080 and click the button to execute SQL.
Key Notes

    Persistence:

        Use db.export() to get a Uint8Array of the database.

        Store it in IndexedDB via web-sys bindings.

        Load it later with new SQL.Database(savedArray).

    Alternatives:

        rusqlite: Requires patching for WASM (no direct filesystem).

        absurd-sql: Advanced solution with IndexedDB backend.

    Error Handling:

        Wrap database operations in Result<T, JsValue>.

        Use web_sys::console::error_1 for logging errors.

How It Works

    SQL.js loads SQLite as a WASM module.

    Rust functions initialize the DB and run queries via wasm-bindgen.

    Queries are executed in-memory; results are serialized to JSON.

    For persistence, serialize the DB to bytes and store in IndexedDB.

This approach leverages battle-tested SQL.js while keeping Rust logic minimal. For a pure Rust solution, explore patching rusqlite with virtual filesystems (e.g., wasmfs).


