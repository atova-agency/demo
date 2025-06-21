Collaborative chat system developed with Rust Axum

We are going to build a collaborative chat system using Rust and the Axum web framework.

The system will have multiple users who can join different chat rooms and send messages in real-time.

We'll use WebSockets for real-time communication.

Steps:

1. Setup the project and dependencies.

2. Create a WebSocket endpoint to handle connections.

3. Manage chat rooms and users (we'll use a shared state with Arc and RwLock).

4. Broadcast messages to all users in the same room.

We'll have the following structure:

- A `ServerState` that holds all the rooms and their participants.

- Each room will have a name and a set of WebSocket connections (participants).

- When a user connects, they specify the room they want to join.

- We'll use an `RwLock` to allow concurrent read access and exclusive write access.

Dependencies in Cargo.toml:

[dependencies]

axum = { version = "0.7", features = ["ws"] }

tokio = { version = "1.0", features = ["full"] }

futures = "0.3"

serde = { version = "1.0", features = ["derive"] }

serde_json = "1.0"

tracing = "0.1"

tracing-subscriber = "0.3"

We'll also set up basic logging with tracing.

Let's design the state:

use std::collections::HashMap;

use std::sync::Arc;

use tokio::sync::RwLock;

use tokio::sync::broadcast;

use axum::extract::ws::WebSocket;

However, note: We cannot store a `WebSocket` directly because it doesn't implement `Clone` and we want to send to multiple.

Instead, we can use a `broadcast` channel per room? But then we have to manage the channels.

Alternatively, we can have:

struct Room {

// We'll store the sender part of a broadcast channel for the room.

tx: broadcast::Sender<Message>,

}

But then we have to manage the receivers for each user? And also remove them when they disconnect.

Another approach is to store each user's WebSocket sender in the room and then iterate over them to send a message.

However, that requires an RwLock on the room to access the set of senders. Also, we need to remove the sender when the connection is closed.

We'll go with:

type Sender = tokio::sync::mpsc::UnboundedSender<axum::extract::ws::Message>;

type Room = HashMap<usize, Sender>;  // Key is some user id? But we don't have user ids. Instead, we can use a set of senders.

But note: We want to remove the sender when the connection is closed. We can use a unique identifier for each connection.

Alternatively, we can use a set of senders without keys and then when we want to remove, we have to find the sender? That might be inefficient.

Instead, we can have each room be a `broadcast::Sender` and then each user will subscribe to the channel. The problem with broadcast channel is that it doesn't retain messages if a user is slow, and we have to manage the subscriptions.

Considering simplicity and the fact that we want to handle disconnections, we can store the senders in a set and then remove them when the connection is closed.

Let's design:

struct Room {

participants: HashMap<usize, Sender>,

}

We'll generate a unique id for each connection in the room.

But note: We are using WebSocket and each connection is a task. We can have the task holding a receiver for the room? Actually, no. We are going to have two tasks per connection? One for receiving from the socket and one for receiving from the room? That complicates.

Instead, we can have:

When a user connects to a room:

- We create a channel for the room to send messages to the user? Not exactly.

We can do:

- The main state has a map of room names to RoomState.

- RoomState has a broadcast channel? Or we can have a set of WebSocket senders.

We'll go with a set of WebSocket senders. But note: WebSocket senders are not clonable? Actually, they are! Because `axum::extract::ws::WebSocket` is a wrapper around `tokio_tungstenite::WebSocketStream` which has a `split` method that gives a `WriteHalf` and `ReadHalf`. The `WriteHalf` can be stored and used to send messages. But note: the `WriteHalf` is not `Send`? Actually, it is, because it's wrapped in an `axum::extract::ws::Message` and we are using `UnboundedSender` for each connection.

How about we store an `tokio::sync::mpsc::UnboundedSender<axum::extract::ws::Message>` for each participant? We can create an unbounded channel for each connection? Actually, we can use a `futures::stream::SplitSink`? But that requires the context of the WebSocket.

Alternatively, we can use `tokio::spawn` to run each connection and then within the connection, we can split the socket and then have a task that receives from a channel and writes to the socket. And the main room will hold the sender part of that channel.

So:

For each WebSocket connection:

- Split the socket into sink and stream.

- Create an unbounded channel for the sink.

- Spawn a task that takes messages from the channel and sends them to the sink.

- Then store the sender of that channel in the room.

When we want to broadcast, we just send the message to every channel in the room.

This way, we avoid having to lock the room for the entire time of sending a message.

Steps for a connection:

1. Extract the room name from the request (maybe in the path: `/ws/{room}`).

2. Upgrade to WebSocket.

3. Split the socket into `sink` and `stream`.

4. Create an unbounded channel for the sink.

5. Spawn a task that reads from the channel and forwards to the sink.

6. Insert the sender of the channel into the room's participant set (with a unique id for removal).

7. Then, we have a loop that reads from the `stream` (messages from the client). Each message we receive, we broadcast to the room (excluding ourselves? or including? usually we want to broadcast to everyone including the sender? or exclude? Typically, we exclude the sender because they already sent it? But in chat, we want to echo to the sender too? Actually, it's common to echo the message back to the sender so they see it in their own chat. Alternatively, we can have the client handle that? But let's broadcast to everyone including the sender.

8. When the stream ends (client disconnects), we remove the sender from the room.

We'll need a way to remove the sender when the connection is closed. We can do this by having the room state hold the senders and a way to remove by an id.

We'll assign a unique id for each connection (like a UUID or a simple counter). We'll use a simple counter for now.

We'll have:

struct Room {

participants: HashMap<usize, Sender>,

}

struct ServerState {

rooms: RwLock<HashMap<String, Room>>,

next_connection_id: AtomicUsize,

}

But note: we are going to have to lock the entire rooms map to add a participant? Then lock the room to broadcast? That might be heavy. Alternatively, we can use a broadcast channel per room? That would be more efficient.

Let's reconsider: with a broadcast channel per room, we can have:

struct Room {

tx: broadcast::Sender<Arc<Message>>,  // We use Arc to avoid cloning the message for each subscriber?

}

But broadcast channel already clones the message for each subscriber. So we can just use `broadcast::Sender<Message>`.

Then, when a user connects:

- Get the room (or create it) and get the broadcast sender.

- Subscribe to the broadcast channel (which gives a receiver).

- Then, we split the socket and spawn two tasks:

a) Task to read from the socket and broadcast to the room (using the broadcast sender).

b) Task to read from the broadcast receiver and send to the sink.

- We have to avoid sending the message back to the sender? Actually, the broadcast channel sends to everyone, including the sender? But that's what we want? Actually, no: the sender doesn't need to receive their own message via the broadcast? Because they already know it. But it's simpler to have the client handle duplicate messages? Or we can avoid it by having the sender not receive the message? That is, we can have the broadcaster not send to the sender? But then how?

Alternatively, we can have the message include the connection id of the sender? Then the client can ignore its own messages? But that's at the client side.

We can do:

When a user sends a message, we broadcast it to the entire room (including the sender). Then, the client will see the message and display it. The client can know its own connection id? But we don't send the id to the client. We could assign an id and send it to the client upon connection? That complicates.

Another idea: in the broadcast, we can avoid sending to the sender by having the sender not subscribe to the broadcast? But then how do they get others' messages? They do subscribe, but we can skip their own messages? We can tag each message with the sender's id? Then, when we receive from the broadcast, we check if it's our own id? But that requires storing the connection id per task.

We can do:

When a user connects, we get a receiver from the broadcast channel. Then, we also store the sender part of the broadcast channel and our own connection id.

The task that reads from the socket:

- Reads a message and then sends it to the broadcast channel with the connection id.

The task that reads from the broadcast receiver:

- Receives a tuple (connection_id, message) or a struct that includes the sender id.

- Then, if the sender id is the same as our own id, we skip? Or we can send it? Actually, we want to echo the message? Then we should send it. But then the client will see duplicate messages? Because they sent it and then see it again? That's not good.

Actually, the client will send a message and then the server broadcasts it. Then the client will receive it and display. That's one message. But if the client is displaying the message as soon as they send it (without waiting for the server), then they don't need to display it again? So we can avoid sending it to the sender? But then the client will not see other clients' messages? They will, but not their own? That's not typical. The typical solution is that the client doesn't wait for the server to display the message? That is, when the user hits send, the client appends the message to the chat window immediately and then sends it to the server. Then, when the broadcast comes, if it's the same message (by the same user) then the client ignores it? But that requires matching.

This is getting complicated.

Let's go back to the first approach: storing a set of senders per room. We'll use an `RwLock` per room? And then when broadcasting, we lock the room and then send to each sender? But that might block if one sender is slow? We can use `try_send`? But we don't want to block the entire room for one slow client.

We can have:

struct Room {

participants: RwLock<HashMap<usize, Sender>>,

}

Then, when broadcasting, we lock the room (read lock) and then for each sender, we do:

if let Err(e) = sender.unbounded_send(msg.clone()) {

// This sender has been closed? Then we remove it.

// But we cannot remove it while iterating because we have a read lock? We need a write lock.

// So we cannot remove it during the broadcast.

So we have to remove dead senders asynchronously? We can have a separate task that does cleanup? Or we can note the dead ones and then remove them after the broadcast? But that would require a write lock and we are holding a read lock.

Alternatively, we can use a `DashMap` for the room? But that's an external dependency.

Given the complexity, we'll start with a simple approach: store the senders in a `RwLock<HashMap<usize, Sender>>` and when sending a message, we lock the room, iterate over the senders, and for each one, we try to send. If sending fails, we note the id and then remove it after we finish the iteration? But we cannot remove it because we are holding the lock? We can collect the dead ids and then remove them in a separate step? But then we need to lock again.

We can do:

let dead_ids = {

let participants = room.participants.read().await;

let mut dead_ids = Vec::new();

for (id, tx) in participants.iter() {

if tx.send(msg.clone()).is_err() {

dead_ids.push(*id);

}

}

dead_ids

};

if !dead_ids.is_empty() {

let mut participants = room.participants.write().await;

for id in dead_ids {

participants.remove(&id);

}

}

But note: between the read lock and the write lock, the state might have changed? For example, a new participant might have joined? But that's okay because the dead_ids we collected are from the previous state. And we remove them. Also, during the write lock, we remove the dead ones. But note: the same sender might have been removed by a previous dead detection? Or by the disconnection handler? Actually, we don't have a disconnection handler? We are relying on the send failure to remove.

However, we also have to remove the sender when the connection is closed? We have two ways to remove:

- When the sending fails (as above).

- When the connection is closed, we can explicitly remove the sender? That would be better because we don't wait for a send failure.

So we can do:

In the connection task, when the connection is closed (either by error or by the stream ending), we remove the sender from the room.

We'll have:

// After adding the sender to the room, we run:

let (mut ws_sender, mut ws_receiver) = socket.split();

let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();

let room_name = ...; // we have to capture the room name

// Task to send messages from the channel to the WebSocket.

let send_task = tokio::spawn(async move {

while let Some(msg) = rx.recv().await {

if ws_sender.send(msg).await.is_err() {

break;

}

}

});

// Now, we add the sender (tx) to the room state.

let connection_id = state.get_next_connection_id();

state.add_participant(&room_name, connection_id, tx.clone()).await;

// Then, we have the receive task: read from the WebSocket and broadcast to the room.

let recv_task = tokio::spawn(async move {

while let Some(Ok(msg)) = ws_receiver.next().await {

// Broadcast this message to the room (to all participants, including ourselves)

state.broadcast(&room_name, msg).await;

}

});

// Wait for either task to complete? Then remove the participant.

tokio::select! {

_ = send_task => {},

_ = recv_task => {},

}

// Remove the participant from the room.

state.remove_participant(&room_name, connection_id).await;

This way, we remove the participant as soon as the connection is closed.

Now, the state methods:

async fn add_participant(&self, room_name: &str, id: usize, sender: Sender) {

let mut rooms = self.rooms.write().await;

let room = rooms.entry(room_name.to_string()).or_insert_with(|| Room {

participants: RwLock::new(HashMap::new()),

});

let mut participants = room.participants.write().await;

participants.insert(id, sender);

}

async fn broadcast(&self, room_name: &str, msg: axum::extract::ws::Message) {

let rooms = self.rooms.read().await;

if let Some(room) = rooms.get(room_name) {

let participants = room.participants.read().await;

for (_, sender) in participants.iter() {

// We ignore errors? Because if there's an error, the connection is dead and will be removed by the task when it ends.

let _ = sender.send(msg.clone());

}

}

}

async fn remove_participant(&self, room_name: &str, id: usize) {

let mut rooms = self.rooms.write().await;

if let Some(room) = rooms.get_mut(room_name) {

let mut participants = room.participants.write().await;

participants.remove(&id);

// If the room becomes empty, we can remove the room? Or leave it for future participants? We'll leave it.

}

}

But note: we are cloning the message for every participant. That might be expensive for large messages? But for chat, messages are small.

Also, we are holding the read lock on the room's participants for the entire broadcast. That might block new participants from joining? But broadcasts are quick? And we are using async locks? So other tasks can yield.

However, we are using `RwLock` from `tokio` which is fair and async.

We'll design the state:

struct Room {

participants: tokio::sync::RwLock<HashMap<usize, Sender>>,

}

struct ServerState {

rooms: tokio::sync::RwLock<HashMap<String, Room>>,

next_connection_id: std::sync::atomic::AtomicUsize,

}

We have to be careful: `AtomicUsize` is for synchronous atomic operations. We are in an async environment, but we are only incrementing it when we add a participant. We can use `tokio::sync::Mutex` for the next_connection_id? But that's overkill. We can use `Arc<AtomicUsize>`.

Alternatively, we can use a `tokio::sync::watch` channel? Or we can use a `RwLock<usize>`. But `AtomicUsize` is safe and efficient.

We'll use:

next_connection_id: Arc<std::sync::atomic::AtomicUsize>,

And to get the next id:

let id = state.next_connection_id.fetch_add(1, std::sync::atomic::Ordering::SeqCst);

But note: we are in an async context, but `fetch_add` is synchronous and fast.

Now, let's write the code.

We'll have:

use axum::{

routing::get,

extract::{WebSocketUpgrade, Path, State},

response::Response,

Router,

};

use std::sync::atomic::AtomicUsize;

use std::collections::HashMap;

use futures::stream::StreamExt;

We'll define:

type Sender = tokio::sync::mpsc::UnboundedSender<axum::extract::ws::Message>;

struct Room {

participants: tokio::sync::RwLock<HashMap<usize, Sender>>,

}

#[derive(Clone)]

struct ServerState {

rooms: tokio::sync::RwLock<HashMap<String, Room>>,

next_connection_id: Arc<AtomicUsize>,

}

Then, we create the router:

let state = ServerState {

rooms: RwLock::new(HashMap::new()),

next_connection_id: Arc::new(AtomicUsize::new(0)),

};

let app = Router::new()

.route("/ws/:room", get(websocket_handler))

.with_state(state);

The handler:

async fn websocket_handler(

ws: WebSocketUpgrade,

Path(room): Path<String>,

State(state): State<ServerState>,

) -> Response {

ws.on_upgrade(move |socket| handle_socket(socket, room, state))

}

async fn handle_socket(socket: WebSocket, room: String, state: ServerState) {

// Split the socket

let (mut ws_sender, mut ws_receiver) = socket.split();

let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();

// Spawn the task that sends messages from the channel to the WebSocket.

let send_task = tokio::spawn(async move {

while let Some(msg) = rx.recv().await {

if ws_sender.send(msg).await.is_err() {

break;

}

}

});

// Generate a connection id

let id = state.next_connection_id.fetch_add(1, Ordering::SeqCst);

state.add_participant(&room, id, tx).await;

// Now, the receive task: receive from the WebSocket and broadcast.

let recv_task = tokio::spawn(async move {

while let Some(Ok(msg)) = ws_receiver.next().await {

state.broadcast(&room, msg).await;

}

});

// Wait for either task to finish

tokio::select! {

_ = send_task => recv_task.abort(),

_ = recv_task => send_task.abort(),

}

// Remove the participant

state.remove_participant(&room, id).await;

}

We have to implement the state methods as above.

However, note: in `broadcast`, we are cloning the message for every participant. That might be acceptable for small messages, but we can avoid by using an `Arc`? But `axum::extract::ws::Message` doesn't implement `Clone` for large messages? Actually, it does: it has a `Message::Binary` which is a `Vec<u8>` and cloning that is expensive. So we might want to use `Arc<Message>`? But then we have to wrap it.

Alternatively, we can change the `Sender` to send `Arc<Message>`? Then we clone the Arc. But we are not sure if `Message` is expensive to clone? For text messages, it's cheap. For binary, it might be expensive.

Let's look: `axum::extract::ws::Message` is defined as:

pub enum Message {

Text(String),

Binary(Vec<u8>),

// ... others

}

So cloning a Text is cheap (it's just an Arc<String> internally? Actually, `String` is a `Vec<u8>` so it's a heap allocation). But we are in a chat, so messages are small. We can try without and then optimize if needed.

We'll proceed without Arc.

Now, let's write the state methods.

We'll implement:

impl ServerState {

async fn add_participant(&self, room_name: &str, id: usize, sender: Sender) {

let mut rooms = self.rooms.write().await;

let room = rooms.entry(room_name.to_string()).or_insert_with(|| Room {

participants: RwLock::new(HashMap::new()),

});

let mut participants = room.participants.write().await;

participants.insert(id, sender);

}

async fn broadcast(&self, room_name: &str, msg: axum::extract::ws::Message) {

let rooms = self.rooms.read().await;

if let Some(room) = rooms.get(room_name) {

let participants = room.participants.read().await;

for sender in participants.values() {

// We ignore the error: if the send fails, the connection is dead and will be cleaned up when the task ends.

let _ = sender.send(msg.clone());

}

}

}

async fn remove_participant(&self, room_name: &str, id: usize) {

let mut rooms = self.rooms.write().await;

if let Some(room) = rooms.get_mut(room_name) {

let mut participants = room.participants.write().await;

participants.remove(&id);

// If the room becomes empty, we could remove the room? But we leave it.

}

}

}

However, note: we are holding the `rooms` write lock for the entire time of adding a participant? That might block other operations? But adding a participant is not frequent.

We can avoid holding the write lock for the entire time by only locking the rooms map long enough to get the room, and then locking the room's participants separately.

But the above is acceptable for now.

Let's run it.

We'll also set up tracing.

main:

#[tokio::main]

async fn main() {

tracing_subscriber::fmt::init();

let state = ServerState {

rooms: RwLock::new(HashMap::new()),

next_connection_id: Arc::new(AtomicUsize::new(0)),

};

let app = Router::new()

.route("/ws/:room", get(websocket_handler))

.with_state(state);

let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();

tracing::debug!("listening on {}", listener.local_addr().unwrap());

axum::serve(listener, app).await.unwrap();

}

We'll test with two clients.

Note: This design is simple but might not scale to many rooms and many participants because of the locking. For a small scale, it's acceptable.

Let's write the code accordingly.

To build a collaborative chat system using Rust and Axum, we'll create a WebSocket-based solution with real-time messaging and room management. Here's a structured implementation:
Step 1: Add Dependencies (Cargo.toml)
toml

[package]
name = "axum-chat"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = { version = "0.7", features = ["ws"] }
tokio = { version = "1.0", features = ["full", "sync"] }
futures = "0.3"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"
uuid = { version = "1.0", features = ["v4"] }

Step 2: Main Application Structure
rust

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path, State,
    },
    response::Response,
    routing::get,
    Router,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{Arc, atomic::{AtomicU32, Ordering}},
};
use tokio::sync::{broadcast, RwLock};
use uuid::Uuid;

// Message structure
#[derive(Debug, Serialize, Deserialize, Clone)]
enum ChatEvent {
    Join { user_id: String, username: String },
    Leave { user_id: String },
    Message { user_id: String, content: String },
}

// Room structure
struct ChatRoom {
    tx: broadcast::Sender<ChatEvent>,
    user_count: AtomicU32,
}

// Global application state
#[derive(Clone)]
struct AppState {
    rooms: Arc<RwLock<HashMap<String, ChatRoom>>>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app_state = AppState {
        rooms: Arc::new(RwLock::new(HashMap::new())),
    };

    let app = Router::new()
        .route("/ws/:room_id", get(websocket_handler))
        .with_state(app_state);

    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

Step 3: WebSocket Connection Handler
rust

async fn websocket_handler(
    ws: WebSocketUpgrade,
    Path(room_id): Path<String>,
    State(state): State<AppState>,
) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, room_id, state))
}

async fn handle_socket(socket: WebSocket, room_id: String, state: AppState) {
    let user_id = Uuid::new_v4().to_string();
    let username = format!("User{}", user_id.chars().take(4).collect::<String>());

    // Get or create room
    let room = {
        let mut rooms = state.rooms.write().await;
        rooms.entry(room_id.clone()).or_insert_with(|| {
            let (tx, _) = broadcast::channel(100);
            ChatRoom {
                tx,
                user_count: AtomicU32::new(0),
            }
        })
    };

    // Join room
    room.user_count.fetch_add(1, Ordering::SeqCst);
    let mut rx = room.tx.subscribe();
    let _ = room.tx.send(ChatEvent::Join {
        user_id: user_id.clone(),
        username: username.clone(),
    });

    // Split socket
    let (mut sender, mut receiver) = socket.split();

    // Send messages to client
    let mut send_task = tokio::spawn(async move {
        while let Ok(event) = rx.recv().await {
            let message = serde_json::to_string(&event).unwrap();
            if sender.send(Message::Text(message)).await.is_err() {
                break;
            }
        }
    });

    // Receive messages from client
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            if let Ok(event) = serde_json::from_str::<ChatEvent>(&text) {
                if let ChatEvent::Message { .. } = event {
                    let _ = room.tx.send(event);
                }
            }
        }
    });

    // Cleanup on disconnect
    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    };

    // Leave room
    let _ = room.tx.send(ChatEvent::Leave {
        user_id: user_id.clone(),
    });
    room.user_count.fetch_sub(1, Ordering::SeqCst);
    
    // Remove room if empty
    if room.user_count.load(Ordering::SeqCst) == 0 {
        state.rooms.write().await.remove(&room_id);
    }
}

Step 4: Frontend Example (HTML/JS)
html

<!DOCTYPE html>
<html>
<body>
  <input id="message" placeholder="Type message...">
  <button onclick="sendMessage()">Send</button>
  <div id="chat"></div>

  <script>
    const ws = new WebSocket("ws://localhost:3000/ws/room1");
    const userId = crypto.randomUUID();
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const chatDiv = document.getElementById("chat");
      
      switch(data.Join || data.Leave || data.Message) {
        case data.Join:
          chatDiv.innerHTML += `<p>${data.username} joined</p>`;
          break;
        case data.Leave:
          chatDiv.innerHTML += `<p>${data.user_id} left</p>`;
          break;
        case data.Message:
          chatDiv.innerHTML += `<p><b>${data.user_id}:</b> ${data.content}</p>`;
          break;
      }
    };

    function sendMessage() {
      const input = document.getElementById("message");
      ws.send(JSON.stringify({
        Message: {
          user_id: userId,
          content: input.value
        }
      }));
      input.value = "";
    }
  </script>
</body>
</html>

Key Features:

    Room Management:

        Dynamic room creation/deletion

        Atomic user counting

        Automatic cleanup of empty rooms

    Real-time Communication:

        Broadcast messages to all room participants

        Efficient WebSocket handling

        JSON-based message protocol

    Message Types:

        Join/leave notifications

        Text messaging

        User identification

    Scalability:

        Lock-free user counting

        Efficient broadcast channels

        Per-room isolated state

Running the System:

    Start server: cargo run

    Open multiple browser tabs to file:///path/to/chat.html

    Chat messages will appear in real-time across all tabs

Enhancements:

    Add authentication

    Implement message persistence

    Add rate limiting

    Implement admin controls

    Add file sharing support

    Implement WebRTC for peer-to-peer communication

This implementation provides a foundation for a scalable, real-time chat system using Rust's async capabilities and Axum's WebSocket support. The architecture ensures efficient resource usage while maintaining real-time communication between clients.
