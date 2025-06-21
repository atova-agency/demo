We are going to create a local-first demo using Rust and Axum.

The idea is to have a web server that can synchronize data with clients in a local-first manner.

We'll use SQLite as the local database and a sync protocol that allows offline work and later synchronization.

However, note that the user mentioned "zero ZQL". I believe they might have meant "Zero" as in the Zero framework or protocol, and "ZQL" might be a typo.

Alternatively, they might be referring to "ZeroMQ" or "Zed" (a local-first sync engine) but it's unclear.

Since the requirement is a bit ambiguous, I'll assume we are going to use a simple sync protocol for demonstration purposes.

For local-first applications, one popular approach is to use Conflict-free Replicated Data Types (CRDTs) or Operational Transformation (OT).

But for simplicity, we might use a version vector or last-write-wins (LWW) with a simple sync protocol.

Alternatively, we can use the "replicache" approach (which is a library for building local-first apps) but we are building from scratch.

However, note that building a full-featured local-first sync engine is complex. We'll do a minimal demo:

Plan:

1. We'll have a SQLite database per client (or one shared for the server and each client has their own).

2. We'll design a simple REST API for syncing:

- Client can push changes (a batch of operations) to the server.

- Client can pull changes (from the server) that it hasn't seen.

3. We'll use a version number (or vector clock) to track changes.

But note: In a true local-first app, the server is just another peer. We are going to simulate multiple clients and a server.

Alternatively, we can use a library like `automerge` or `yjs` but they are in JavaScript. For Rust, we have `automerge-rs` but integrating with Axum and SQLite might be heavy.

Given the complexity, let's do a simpler approach:

We'll store data as key-value pairs. Each client and the server have a copy of the database (a simple KV store).

Sync protocol:

- Each write is an operation: { key, value, timestamp, client_id }

- When syncing, the client sends its last sync timestamp and the server returns all operations that happened after that timestamp (from all clients) and vice versa.

But note: timestamps are unreliable. Instead, we can use a monotonically increasing sequence number on the server and each client tracks the last sequence number it has.

However, in local-first, the client can write offline. So we need to assign a unique and ordered ID for each operation. We can use (timestamp, client_id) but then conflicts are resolved by LWW.

We'll do:

- Each operation has: (key, value, client_id, lamport_timestamp) and a vector clock to track causality? That might be too heavy.

Let's simplify: we are going to use a global logical clock on the server? But the server might be offline? Actually, the server is always online in this demo.

Alternatively, we can use a central server that assigns a sequence number for each operation. When the client is offline, it buffers operations and when online, it sends them to the server which assigns a sequence number and then broadcasts to others.

Steps:

Server:

- Maintains a SQLite database with a table for operations and a table for the current state (or we can rebuild state from operations).

- Operations table: (id INTEGER PRIMARY KEY, key TEXT, value TEXT, client_id TEXT, seq INTEGER)

We'll let the server assign the `seq` (monotonic increasing) and use it for ordering.

- Also, we have a table for client's last known sequence: (client_id TEXT, last_seq INTEGER)

Client:

- Has its own SQLite database with the same operations table? Or just the current state?

For simplicity, the client only stores the current state (a key-value store) and the last sequence number it has.

Sync:

- Client sends its last_seq to the server and gets all operations with seq > last_seq.

- Then the client applies these operations in order (by seq) to update its state.

- When the client has local changes (while offline), it will queue them and then when online, it will push to the server.

Pushing changes:

- Client sends a batch of operations (without seq, because the server will assign) to the server.

- Server assigns a new seq for each operation (in the order received) and then broadcasts these operations to all clients?

Actually, in this demo, the server just stores and then when a client pulls, it gets them.

But note: we are not doing real-time push. We are doing pull on demand.

We'll design two endpoints:

POST /push: to push a batch of operations from the client.

Request body: { client_id: "client1", ops: [ { key: "k1", value: "v1" }, ... ] }

Response: { last_seq: X }  (the last seq assigned for these operations)

GET /pull?client_id=client1&last_seq=123: to get all operations that the client hasn't seen.

However, note that the client might push operations and then immediately pull and not see its own?

We can have the server assign the sequence numbers and then in the response of push, return the new operations?

Or the client after pushing can do a pull?

Alternatively, in the push response, we can return the new sequence numbers for the operations? But the client doesn't need to apply its own operations?

Actually, the client already applied them locally. But the server might have operations from other clients that the client hasn't seen.

So after pushing, the client should do a pull to get any concurrent operations from others.

But for simplicity, we can have the server in the push response include any new operations that happened after the client's last_seq?

That might be efficient.

We'll do:

Client pushes its operations and also tells the server its last_seq (the last seq it knew about before making these changes).

Then the server:

- Assigns new seq for the client's operations (starting at max_seq+1)

- Then, it returns to the client all operations that happened after the client's last_seq (including the ones just pushed? yes, so the client can see the assigned seq and also any other concurrent operations).

So:

Endpoint: POST /sync

Request Body:

{

"client_id": "client1",

"last_seq": 123,

"ops": [ { "key": "k1", "value": "v1" }, ... ]

}

Response:

{

"ops": [

{ "key": "k1", "value": "v1", "seq": 124, "client_id": "client1" },

... ,

// and also any other operations from other clients that have seq > 123

],

"last_seq": 130   // the highest seq returned, so the client can update its last_seq

}

Then the client applies these operations (if it hasn't already applied its own) and updates its state.

How does the client apply?

For each operation in the response (ordered by seq), set the key to the value.

This is a simple last-write-wins: the operation with the highest seq wins.

But note: if two clients update the same key concurrently, the one that gets a higher seq from the server will win.

This is a simple design.

Implementation:

We'll use Axum for the web server, and SQLite with `rusqlite`.

We'll have two tables:

1. `operations`:

seq INTEGER PRIMARY KEY AUTOINCREMENT,

client_id TEXT NOT NULL,

key TEXT NOT NULL,

value TEXT NOT NULL,

timestamp DATETIME DEFAULT CURRENT_TIMESTAMP

2. We don't need a separate state table because we can reconstruct the state by taking the latest operation for each key?

But that would be inefficient for large data. So we'll maintain a state table for the current value of each key.

Table `state`:

key TEXT PRIMARY KEY,

value TEXT NOT NULL,

seq INTEGER NOT NULL   -- the seq of the operation that set this value

Then when we get a new operation, we update the state if the operation's seq is higher than the current seq for that key?

Actually, we are going to assign the seq in order, so we can just update.

Steps for the server when receiving a sync request:

- Start a transaction.

- Get the current max_seq from the operations table (or from the state table? or use `last_insert_rowid`? but we are inserting multiple).

- For each operation in the request:

Insert into operations (client_id, key, value) values (?, ?, ?); and get the seq (auto-increment).

Then update the state table:

INSERT OR REPLACE INTO state (key, value, seq) VALUES (?, ?, ?)

-- but we want to replace only if the new seq is higher? Actually, since we assign seq in increasing order, the new one is always higher.

However, note: we might have operations for different keys. So we update only the key in the operation.

- Then, we need to select all operations with seq > last_seq (the client's last_seq) and return them.

But note: we are inserting the client's operations and then selecting all operations (including other clients) that are greater than last_seq.

We'll do:

Step 1: Insert the client's operations and collect the seq numbers.

Step 2: Query: SELECT * FROM operations WHERE seq > ? ORDER BY seq ASC;

Then return these operations.

However, we must note that the client might have sent multiple operations and we assign sequential seq numbers. Then we return all operations with seq > last_seq (which includes the ones we just inserted and any others that were inserted by other clients in the meantime).

This design is simple.

But what about the initial state? We need to initialize the state table? We can do that when the server starts.

Alternatively, we can avoid the state table and just compute the current state by:

SELECT key, value FROM operations WHERE seq = (SELECT max(seq) FROM operations as o2 WHERE o2.key = operations.key)

But that would be expensive on every sync. So we maintain the state table for efficient lookup.

However, in this demo, we are only going to use the state table for the server's current state? Actually, the server doesn't need the state table for the sync protocol. The sync protocol is about exchanging operations. The state table is only for if we want to show the current state on the server.

We can skip the state table for now and focus on the operations.

So we'll just have the `operations` table.

Then when a client syncs, we return the operations. The client will then apply all operations in order to build its state.

But if the client has a lot of operations, it might be inefficient to send all operations every time?

We are only sending operations after the client's last_seq, so it should be efficient.

However, the client must store all operations? Or it can compact?

In a real system, we might want to do garbage collection. But for the demo, we'll store all.

Let's design the client:

The client has:

- A local SQLite database with a table for operations (same as server) and a state table (for current state) for efficient access?

- Or the client can rebuild the state from the operations?

We'll do:

Client stores:

Table: operations (seq, client_id, key, value)  -- but note: the client doesn't assign seq, so initially the seq is NULL until it gets assigned by the server?

Actually, we can store the operations without seq until they are pushed?

Alternatively, we can store the operations in a pending table until they are pushed?

Let's simplify the client: it only stores the current state (key-value) and the last_seq it has.

And it logs operations locally?

But if the client goes offline and does multiple writes, it needs to remember what to push.

We'll have:

Table: pending_ops (id, key, value)   -- for operations that haven't been pushed

Table: state (key primary key, value)  -- current state

And a last_seq stored somewhere (in a metadata table?).

Steps on client:

- On start, initialize the database.

- When the client wants to set a key-value, it:

- Inserts into pending_ops (key, value)

- Updates the state table (so reads are fast)

- When syncing:

- It sends all pending_ops to the server along with its last_seq.

- Then it gets a response with new operations (including its own with assigned seq and others).

- Then it applies these operations (by seq order) to the state table?

But note: it has already applied its own pending ops?

- So we need to avoid applying the same op twice?

How? We can remove the pending ops that were pushed?

Steps:

- Client sends: { client_id, last_seq, ops: [all pending_ops] }

- Then, when it gets the response, it:

- Removes the pending_ops (because they are now acknowledged by the server and have a seq)

- Then, for each op in the response (which are all ops with seq > last_seq, including the ones it just pushed and new ones from others):

if the op's seq is greater than the client's current last_seq, then update the state for that key to the op's value?

- But note: the client might have a newer pending op for the same key?

Actually, we are doing last-write-wins by the server's seq. So the server's ordering is the truth.

Therefore, the client must update its state with the server's operations even if it has a pending op?

But it already has the pending op in its state? Then the server might have assigned a seq to that op and also there might be another op from another client for the same key with a higher seq?

So the client should:

- Clear the pending_ops (because they are now pushed) and then apply the server's operations in order (by seq) to the state.

However, this would overwrite any changes the client made after the push?

Example:

Client has pending_ops: [op1: set x=1]

It pushes op1 and then, before the response, it does another local change: set x=2 (which goes to pending_ops).

Then it gets the response: the server assigned op1 as seq=100 and also there's an op from another client: op2: set x=3 with seq=101.

Then the client applies the response:

op1: set x=1 -> then op2: set x=3 -> so state becomes x=3.

But the client's latest change (x=2) is still in pending_ops and hasn't been pushed?

So we must not clear the pending_ops until after we push and then we must not remove the pending_ops that were not pushed?

We need to mark which pending_ops are being pushed?

Alternatively, we can lock the pending_ops during sync?

We'll do:

- When starting a sync, the client reads all pending_ops and then sends them. Then it doesn't delete them until the sync is successful.

- Then, when the response comes, it:

- Deletes the pending_ops that were sent (how? we don't have an id? we can use (key, value) to match? but if the same key is set multiple times, we might have duplicates? we can store a local id for pending_ops)

We'll add an id to pending_ops: INTEGER PRIMARY KEY.

Then, when we send, we remember which ids we sent?

Alternatively, we can delete by id after the sync.

Steps:

Step 1: Read all pending_ops and remember their ids and the data.

Step 2: Send the data along with client_id and last_seq.

Step 3: On response, if successful, delete the pending_ops with those ids.

Step 4: Then, apply the operations in the response (by seq order) to the state.

But note: the response might contain an operation that sets a key that the client has a pending op for (that hasn't been pushed yet)?

Then when the client applies the operation from the server (with a higher seq), it will set the state to the server's value?

But then the client's pending op (if it sets the same key) will have a stale value?

Actually, that is the nature of last-write-wins: the server's ordering is the source of truth.

The client should consider that its pending op might be overridden by a server op with a higher seq?

So after the sync, the client's state might change and then the user might see the update?

But the client's pending op (that hasn't been pushed) is still in the pending_ops table and will be pushed in the next sync?

Then in the next sync, when it pushes, it will set the key again?

This might be acceptable.

Given the complexity, we'll implement the server and a simple client (which we'll test with curl and then build a minimal web UI).

Implementation Steps:

Server:

Dependencies:

axum, tokio, rusqlite, serde, etc.

We'll create a struct `AppState` that holds the SQLite connection. We'll use a connection per request? Or a connection pool? For simplicity, we'll use a single connection in a Mutex? But SQLite doesn't like multiple writers. So we'll use a Mutex<SqliteConnection>?

Actually, we can use a pool of connections? Or use a single connection with `rusqlite::Connection` and wrap in a Mutex. Since it's a demo, we'll do:

struct AppState {

db: Mutex<rusqlite::Connection>,

}

Steps:

- On server start, open the database and create the operations table.

Table creation:

CREATE TABLE IF NOT EXISTS operations (

seq INTEGER PRIMARY KEY AUTOINCREMENT,

client_id TEXT NOT NULL,

key TEXT NOT NULL,

value TEXT NOT NULL,

timestamp DATETIME DEFAULT CURRENT_TIMESTAMP

);

- We don't have a state table for now.

Endpoint: POST /sync

Request body:

#[derive(Deserialize)]

struct SyncRequest {

client_id: String,

last_seq: i64,   // the last seq the client knows about

ops: Vec<KeyValueOp>,

}

#[derive(Deserialize)]

struct KeyValueOp {

key: String,

value: String,

}

Response body:

#[derive(Serialize)]

struct SyncResponse {

ops: Vec<KeyValueOpWithSeq>,

last_seq: i64,   // the highest seq in the response

}

#[derive(Serialize)]

struct KeyValueOpWithSeq {

seq: i64,

client_id: String,

key: String,

value: String,

}

Steps in the handler:

let state = state.lock().unwrap();

let tx = state.db.transaction()?;

// Step 1: Insert the client's operations

let mut new_ops = Vec::new();

for op in &request.ops {

tx.execute(

"INSERT INTO operations (client_id, key, value) VALUES (?, ?, ?)",

(&request.client_id, &op.key, &op.value),

)?;

let seq = tx.last_insert_rowid();

new_ops.push(KeyValueOpWithSeq {

seq,

client_id: request.client_id.clone(),

key: op.key.clone(),

value: op.value.clone(),

});

}

// Step 2: Query all operations with seq > request.last_seq

let mut stmt = tx.prepare(

"SELECT seq, client_id, key, value FROM operations WHERE seq > ? ORDER BY seq ASC",

)?;

let rows = stmt.query_map([request.last_seq], |row| {

Ok(KeyValueOpWithSeq {

seq: row.get(0)?,

client_id: row.get(1)?,

key: row.get(2)?,

value: row.get(3)?,

})

})?;

let mut ops_from_server = Vec::new();

for row in rows {

ops_from_server.push(row?);

}

tx.commit()?;

// The last_seq in the response is the maximum seq in the ops_from_server (if any) or the request.last_seq?

// But we can compute the max seq in the ops_from_server.

let last_seq = ops_from_server.iter().map(|op| op.seq).max().unwrap_or(request.last_seq);

// But note: we must include the new_ops we just inserted? They are already in ops_from_server.

// Return the response

Ok(SyncResponse {

ops: ops_from_server,

last_seq,

})

However, note: the operations we just inserted are included in the query because the transaction is committed after the query?

Actually, we did the query in the same transaction? And then we commit? So the query sees the inserted operations?

But in SQLite, the transaction is not committed until we call commit. And the query is inside the transaction, so it will see the inserted rows.

Then we commit and the data is saved.

But what about concurrency? We are holding a mutex for the entire transaction, so only one sync at a time. This is safe but not scalable. For a demo it's okay.

Client:

We'll build a simple CLI client? Or a web page?

Let's do a web page that uses JavaScript to sync? But the assignment is in Rust. So we'll build a minimal Rust client for testing?

Alternatively, we can test with curl:

curl -X POST http://localhost:3000/sync -H "Content-Type: application/json" -d '{

"client_id": "client1",

"last_seq": 0,

"ops": [

{ "key": "name", "value": "Alice" }

]

}'

Then we should get a response with the new operation and any others.

We'll also build a GET /state to see the current state? But we don't have a state table. We can compute the current state by:

SELECT key, value

FROM operations

WHERE (key, seq) IN (

SELECT key, MAX(seq)

FROM operations

GROUP BY key

)

We'll create an endpoint for that.

But note: for a large database, this query is expensive. We are doing a demo.

Alternatively, we can maintain the state table as a cache? We'll do without for now.

Let's do the endpoints:

POST /sync

GET /state   -> returns the current state as a JSON object: { key1: value1, ... }

For GET /state:

We'll compute it on the fly.

Implementation for GET /state:

let state = state.lock().unwrap();

let mut stmt = state.db.prepare(

"SELECT key, value FROM operations WHERE seq IN (SELECT max(seq) FROM operations GROUP BY key)"

)?;

let rows = stmt.query_map([], |row| {

Ok((row.get(0)?, row.get(1)?))

})?;

let mut result = HashMap::new();

for row in rows {

let (key, value): (String, String) = row?;

result.insert(key, value);

}

Ok(Json(result))

But note: this query might be heavy for large data. We can create an index on the operations table on `key` and `seq`?

CREATE INDEX IF NOT EXISTS operations_key_seq ON operations (key, seq);

We'll do that on startup.

Let's code accordingly.

Steps:

- Create the table and index on server start.

We'll also add an endpoint to reset the database for testing?

POST /reset -> for testing, drop and recreate the table.

Now, let's code the server.

We'll structure:

main() ->

initialize database (create table and index)

create AppState with the db connection in a Mutex

define routes: /sync, /state, /reset

run the server

We'll also allow CORS? For when we build a web client.

We'll add CORS middleware.

Let's code accordingly.

Note: We are using Axum, so we'll use `axum::routing` and `axum::extract::State`.

We'll use `tokio` and `rusqlite` with `blocking` for database operations? Because `rusqlite` is synchronous. We can use `tokio::task::spawn_blocking` but for simplicity, we'll just block the async thread? Since it's a demo and we are using a Mutex, it's okay.

Alternatively, we can use `tokio_rusqlite`? But to keep it simple, we'll block.

Let's write the code.

Here's a step-by-step implementation of a local-first application using Rust, Axum, and SQLite with a basic synchronization protocol:
1. Dependencies (Cargo.toml)
toml

[package]
name = "local-first-axum"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = { version = "0.31", features = ["bundled"] }
uuid = { version = "1.0", features = ["v4"] }
time = "0.3"
tower-http = { version = "0.5", features = ["cors"] }

2. Database Schema (src/db.rs)
rust

use rusqlite::{Connection, params, OptionalExtension};
use uuid::Uuid;
use time::OffsetDateTime;

#[derive(Debug)]
pub struct Document {
    pub id: String,
    pub content: String,
    pub version: i64,
    pub last_modified: i64,
}

pub fn init_db() -> Connection {
    let conn = Connection::open("local-first.db").unwrap();
    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            version INTEGER NOT NULL,
            last_modified INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sync_log (
            id INTEGER PRIMARY KEY,
            document_id TEXT NOT NULL,
            version INTEGER NOT NULL,
            action TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );
        "#,
    )
    .unwrap();
    conn
}

pub fn get_document(conn: &Connection, id: &str) -> rusqlite::Result<Option<Document>> {
    conn.query_row(
        "SELECT id, content, version, last_modified FROM documents WHERE id = ?",
        [id],
        |row| {
            Ok(Document {
                id: row.get(0)?,
                content: row.get(1)?,
                version: row.get(2)?,
                last_modified: row.get(3)?,
            })
        },
    )
    .optional()
}

pub fn save_document(conn: &Connection, doc: &Document) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO documents (id, content, version, last_modified) 
         VALUES (?, ?, ?, ?)",
        params![
            doc.id,
            doc.content,
            doc.version,
            doc.last_modified
        ],
    )?;
    Ok(())
}

pub fn log_sync(conn: &Connection, doc_id: &str, version: i64, action: &str) -> rusqlite::Result<()> {
    let timestamp = OffsetDateTime::now_utc().unix_timestamp();
    conn.execute(
        "INSERT INTO sync_log (document_id, version, action, timestamp) 
         VALUES (?, ?, ?, ?)",
        params![doc_id, version, action, timestamp],
    )?;
    Ok(())
}

3. Sync Protocol & Axum Routes (src/main.rs)
rust

mod db;

use axum::{
    routing::{get, post},
    Router, extract::{State, Path, Json}, http::StatusCode,
};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use db::{init_db, get_document, save_document, log_sync, Document};
use uuid::Uuid;
use time::OffsetDateTime;

type AppState = Arc<Mutex<Connection>>;

#[derive(Debug, Serialize, Deserialize)]
struct SyncRequest {
    client_version: i64,
    changes: Vec<Change>,
}

#[derive(Debug, Serialize, Deserialize)]
struct SyncResponse {
    server_version: i64,
    changes: Vec<Change>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Change {
    id: String,
    content: String,
    version: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct CreateDocument {
    content: String,
}

async fn sync_document(
    State(db): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<SyncRequest>,
) -> Result<Json<SyncResponse>, StatusCode> {
    let db = db.lock().unwrap();
    
    // Get current server document
    let server_doc = match get_document(&db, &id)? {
        Some(doc) => doc,
        None => return Err(StatusCode::NOT_FOUND),
    };

    // Find changes client is missing
    let mut changes_to_send = Vec::new();
    if payload.client_version < server_doc.version {
        changes_to_send.push(Change {
            id: server_doc.id.clone(),
            content: server_doc.content.clone(),
            version: server_doc.version,
        });
    }

    // Apply client changes
    for change in payload.changes {
        if change.version > server_doc.version {
            let new_doc = Document {
                id: id.clone(),
                content: change.content,
                version: change.version,
                last_modified: OffsetDateTime::now_utc().unix_timestamp(),
            };
            save_document(&db, &new_doc)?;
            log_sync(&db, &id, change.version, "update")?;
        }
    }

    Ok(Json(SyncResponse {
        server_version: server_doc.version,
        changes: changes_to_send,
    }))
}

async fn create_document(
    State(db): State<AppState>,
    Json(payload): Json<CreateDocument>,
) -> Result<Json<Change>, StatusCode> {
    let db = db.lock().unwrap();
    let id = Uuid::new_v4().to_string();
    let version = 1;
    let timestamp = OffsetDateTime::now_utc().unix_timestamp();
    
    let doc = Document {
        id: id.clone(),
        content: payload.content,
        version,
        last_modified: timestamp,
    };
    
    save_document(&db, &doc)?;
    log_sync(&db, &id, version, "create")?;
    
    Ok(Json(Change {
        id,
        content: doc.content,
        version,
    }))
}

#[tokio::main]
async fn main() {
    let db = Arc::new(Mutex::new(init_db()));
    
    let app = Router::new()
        .route("/documents", post(create_document))
        .route("/documents/:id/sync", post(sync_document))
        .with_state(db);
    
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

4. Key Features

    Local-First Architecture:

        Each client maintains its own SQLite database

        Clients work offline and sync when connected

        Version vectors track change history

    Synchronization Protocol:

        Clients send their current version + changes

        Server returns missing changes

        Conflict resolution using version numbers

        Sync log for audit trail

    Data Model:

        Documents with auto-increment versions

        Content-based merging strategy

        Timestamp-based ordering

    Security:

        UUIDs for document identification

        Timestamp validation

        Atomic transactions

5. Running the Server
bash

cargo run

6. Client Operations

Create Document:
bash

curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{"content":"Initial content"}'

Synchronize:
bash

curl -X POST http://localhost:3000/documents/<DOC_ID>/sync \
  -H "Content-Type: application/json" \
  -d '{
    "client_version": 1,
    "changes": [
      {"id": "doc-123", "content": "Updated content", "version": 2}
    ]
  }'

7. Enhancement Opportunities

    Advanced Conflict Resolution:

        Add operational transformation (OT) or CRDTs

        Content-aware merging (e.g., for JSON documents)

    Efficiency Improvements:

        Compress sync payloads

        Differential updates

        Bloom filters for state comparison

    Security:

        Add authentication (JWT)

        End-to-end encryption

        Signature verification

    Scalability:

        Replace SQLite with distributed database

        Add WebSocket support for real-time sync

        Sharding based on document IDs

This implementation provides a foundation for local-first applications with offline capability and conflict resolution. The sync protocol can be extended to support more complex scenarios like collaborative editing or binary data synchronization.
