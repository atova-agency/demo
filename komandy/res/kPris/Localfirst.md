local-first Collaborative chat system developed with Rust Axum

- Add authentication
- Implement message persistence on local machine
- Add rate limiting
- Implement admin controls
- Add file direct sharing support
- Implement WebRTC for peer-to-peer communication

We are building a local-first collaborative chat system using Rust and Axum.

The requirements are:

1. Add authentication

2. Implement message persistence on local machine

3. Add rate limiting

4. Implement admin controls

5. Add file direct sharing support

6. Implement WebRTC for peer-to-peer communication

We'll break down the tasks and design the system accordingly.

Steps:

1. Authentication:

- We'll use JWT (JSON Web Tokens) for authentication.

- We'll have a login endpoint that returns a JWT token upon successful authentication.

- The token will be used to authenticate subsequent requests.

2. Message Persistence:

- We'll use SQLite for local storage of messages. It's lightweight and suitable for local-first.

- We'll have a database module to handle database operations.

3. Rate Limiting:

- We'll use `axum::extract::Extension` to share a rate limiter state (using `governor` crate) across routes.

- We'll limit the number of requests per minute for each user.

4. Admin Controls:

- We'll have an admin role. Admin can delete messages, ban users, etc.

- We'll add middleware to check for admin privileges.

5. File Direct Sharing:

- We'll allow users to upload files and share them with others.

- We'll store the files on the local filesystem and provide a link to download.

6. WebRTC for P2P:

- We'll use a crate like `webrtc-rs` to implement peer-to-peer communication.

- We'll need signaling: we can use our Axum server for signaling.

- We'll have endpoints for exchanging SDP offers and answers.

Project Structure:

We'll structure the project as follows:

- `main.rs`: Entry point, sets up the Axum router and server.

- `auth.rs`: Handles authentication (login, token validation).

- `db.rs`: Database setup and operations (using `sqlx` with SQLite).

- `models.rs`: Data models (User, Message, etc.).

- `routes.rs`: Defines the API routes.

- `rate_limit.rs`: Rate limiting setup.

- `admin.rs`: Admin controls (middleware and routes).

- `file_share.rs`: File upload and download.

- `webrtc.rs`: WebRTC signaling.

Let's start by setting up the project.

Dependencies (Cargo.toml):

[dependencies]

axum = { version = "0.7", features = ["headers", "json"] }

tokio = { version = "1.0", features = ["full"] }

serde = { version = "1.0", features = ["derive"] }

serde_json = "1.0"

sqlx = { version = "0.7", features = ["runtime-tokio", "sqlite"] }

jsonwebtoken = "8.3"

chrono = "0.4"

tower_http = { version = "0.4", features = ["cors"] }

governor = "0.6"

uuid = { version = "1.0", features = ["v4"] }

webrtc = "0.4"  # Check for the latest version and features

futures = "0.3"

mime = "0.3"

tokio-util = { version = "0.7", features = ["compat"] }

We'll create the modules step by step.

Note: This is a high-level overview and each module will be implemented accordingly.

Implementation:

1. `main.rs`:

- Set up the Axum app with routes.

- Initialize the database.

- Add middleware for rate limiting and authentication.

2. `auth.rs`:

- Define a struct for the user credentials (username and password).

- Define a struct for the JWT claims.

- Create functions to generate and validate tokens.

3. `db.rs`:

- Initialize the SQLite database.

- Define functions to create tables (users, messages, files, etc.).

- Implement CRUD operations for messages and users.

4. `models.rs`:

- Define structs for:

User: id, username, password_hash, role (admin or user)

Message: id, user_id, content, timestamp

File: id, user_id, filename, path, mime_type, size, timestamp

5. `routes.rs`:

- Define the routes for:

- POST /login

- POST /register (if we allow registration)

- GET /messages (get recent messages)

- POST /messages (send a message)

- POST /upload (file upload)

- GET /download/{file_id} (file download)

- WebRTC signaling endpoints (POST /offer, POST /answer, etc.)

6. `rate_limit.rs`:

- Use `governor` to create a rate limiter.

- Create a middleware that checks the rate limit for each user (by IP or by user id).

7. `admin.rs`:

- Middleware to check if the user is admin.

- Routes for admin actions (DELETE /messages/{id}, POST /ban/{user_id}, etc.)

8. `file_share.rs`:

- Endpoint for file upload: store the file in a directory (e.g., `./files`), save metadata to DB.

- Endpoint for file download: retrieve the file by id and serve it.

9. `webrtc.rs`:

- We'll create a signaling server for WebRTC.

- We'll have endpoints:

- POST /webrtc/offer: to receive an offer from a peer and relay to the other peer (via WebSocket or store in DB and notify)

- POST /webrtc/answer: to receive an answer and relay.

However, note that WebRTC signaling is typically done via a signaling channel (like WebSocket). We might use WebSockets for real-time signaling.

Since Axum supports WebSockets, we can set up a WebSocket endpoint for signaling.

We'll create a WebSocket handler that manages the signaling between peers.

We'll use `axum::extract::ws` for WebSockets.

We'll have a WebSocket route: `/ws` and then handle signaling messages.

Given the complexity, we'll start with the basic HTTP endpoints and then extend to WebSockets for signaling.

Due to the complexity and breadth of the requirements, we'll focus on the core features first.

We'll start by setting up the database and authentication.

Let's write the code step by step.

Note: This is a simplified version for demonstration. In production, you would need to handle errors, security, and edge cases more thoroughly.

To build a local-first collaborative chat system with Rust Axum that meets your requirements, here's a structured approach:
1. Authentication
rust

// JWT-based authentication
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String, // User ID
    exp: usize,  // Expiration time
    role: String, // "user" or "admin"
}

// Middleware for protected routes
async fn auth_middleware(
    TypedHeader(bearer): TypedHeader<Authorization<Bearer>>,
    Extension(db): Extension<DbPool>,
) -> Result<Identity, AuthError> {
    let token = bearer.token();
    let claims = decode::<Claims>(token, &SECRET_KEY, &Validation::default())?;
    
    // Verify user exists in DB
    sqlx::query!("SELECT id FROM users WHERE id = $1", claims.sub)
        .fetch_one(&db)
        .await?;
    
    Ok(Identity { user_id: claims.sub, role: claims.role })
}

2. Local Message Persistence
rust

// SQLite storage
sqlx::migrate!("./migrations").run(&pool).await?;

// Messages table schema
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

3. Rate Limiting
rust

use governor::{DefaultDirectRateLimiter, Quota, RateLimiter};

// Per-user rate limiting
let limiter = RateLimiter::direct(Quota::per_minute(30)); // 30 requests/min

// Middleware
async fn rate_limit_middleware(
    identity: Identity,
    State(limiter): State<DefaultDirectRateLimiter>,
) -> Result<(), StatusCode> {
    limiter.check_key(&identity.user_id)
        .map_err(|_| StatusCode::TOO_MANY_REQUESTS)?;
    Ok(())
}

4. Admin Controls
rust

// Admin-only endpoint example
#[derive(Deserialize)]
struct BanRequest {
    user_id: String,
    reason: String,
}

async fn ban_user(
    identity: Identity,
    Json(payload): Json<BanRequest>,
) -> Result<(), StatusCode> {
    if identity.role != "admin" {
        return Err(StatusCode::FORBIDDEN);
    }
    
    sqlx::query!(
        "INSERT INTO bans (user_id, reason) VALUES ($1, $2)",
        payload.user_id,
        payload.reason
    ).execute(&db).await?;
    
    Ok(())
}

5. File Sharing
rust

// Multipart file handling
async fn upload_file(
    identity: Identity,
    mut multipart: Multipart,
) -> Result<Json<FileResponse>, StatusCode> {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let file_name = field.file_name().unwrap().to_string();
        let data = field.bytes().await.unwrap();
        
        // Save to local filesystem
        let path = format!("./uploads/{}", uuid::Uuid::new_v4());
        tokio::fs::write(&path, &data).await?;
        
        // Store metadata in DB
        sqlx::query!(
            "INSERT INTO files (owner_id, path, name) VALUES ($1, $2, $3)",
            identity.user_id,
            path,
            file_name
        ).execute(&db).await?;
    }
    
    Ok(Json(FileResponse { success: true }))
}

6. WebRTC P2P Implementation
rust

// Signaling server setup
use axum::extract::ws::{WebSocket, Message};

async fn webrtc_handler(
    ws: WebSocketUpgrade,
    identity: Identity,
) -> impl IntoResponse {
    ws.on_upgrade(|mut socket| async move {
        while let Some(Ok(msg)) = socket.recv().await {
            if let Message::Text(s) = msg {
                // Forward signaling messages
                let parsed: SignalMessage = serde_json::from_str(&s).unwrap();
                
                // Store offers/answers in DB for peer discovery
                sqlx::query!(
                    "INSERT INTO signals (user_id, target_id, data) 
                    VALUES ($1, $2, $3)",
                    identity.user_id,
                    parsed.target,
                    parsed.data
                ).execute(&db).await;
            }
        }
    })
}

System Architecture
text

Frontend
  │
  │ (HTTPS)
  ▼
Axum Server (Rust)
├── Authentication (JWT)
├── Rate Limiting
├── REST API
│   ├── /messages → CRUD
│   ├── /files → Upload/Download
│   └── /admin → Ban/Moderation
│
├── Signaling Server (WebSockets)
│   └── WebRTC negotiation
│
└── SQLite Database
    ├── users
    ├── messages
    ├── files
    └── signals

Key Dependencies
toml

[dependencies]
axum = { version = "0.7", features = ["ws", "multipart"] }
tokio = { version = "1.0", features = ["full"] }
sqlx = { version = "0.7", features = ["sqlite", "runtime-tokio"] }
jsonwebtoken = "9.0"
governor = "0.6"
webrtc = "0.6"
serde = { version = "1.0", features = ["derive"] }
uuid = { version = "1.0", features = ["v4"] }

Security Considerations

    JWT Security:

        Use HS512 with 256-bit secrets

        Short expiration times (15-30 mins)

        Secure cookie storage

    File Uploads:

        Validate file types

        Scan for malware

        Serve from isolated domain

    WebRTC:

        Use DTLS encryption

        Validate peer identities

        TURN relay fallback

    Rate Limits:

        Different limits for auth/anon users

        Separate buckets for file uploads

Deployment

    Local-First Sync:

        Use CRDTs for message synchronization

        Implement conflict-free file versioning

        SQlite WAL for concurrent access

    Admin Controls:

        Real-time ban propagation

        Message purge capability

        Activity monitoring dashboard

This architecture provides a secure, scalable foundation while prioritizing offline functionality. For production deployment, add:

    Automated backups

    End-to-end encryption (e.g., via MLS protocol)

    NAT traversal for WebRTC

    Load-balanced signaling servers

Would you like me to elaborate on any specific component or provide implementation details for the frontend integration?
