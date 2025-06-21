Run Rust Dioxus App on Physical Phone
how to run Rust Dioxus app in physical phone during development from linux Ubuntu

We are going to run a Rust Dioxus app on a physical phone during development from Ubuntu.

Steps:

1. Enable USB debugging on the phone.

2. Install necessary tools on Ubuntu (adb, Rust, Dioxus CLI, etc.).

3. Set up the project for mobile (if not already).

4. Build and run the app on the connected phone.

Let's break it down:

### Step 1: Enable USB Debugging on Your Phone

- Go to Settings > About Phone and tap "Build number" 7 times to enable Developer options.

- Go back to Settings > Developer options and enable "USB debugging".

### Step 2: Install Required Tools on Ubuntu

#### Install ADB (Android Debug Bridge)

```bash

sudo apt update

sudo apt install android-tools-adb android-tools-fastboot

```

#### Install Rust

If you don't have Rust installed:

```bash

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

source $HOME/.cargo/env

```

#### Install Dioxus CLI

```bash

cargo install dioxus-cli

```

#### Install Android targets for Rust

```bash

rustup target add aarch64-linux-android  # for 64-bit ARM

# or if you have a 32-bit ARM device (unlikely for modern phones) you might need armv7-linux-androideabi

```

### Step 3: Set Up the Project for Mobile

If you haven't created a Dioxus project:

```bash

dioxus create my_app

cd my_app

```

Dioxus mobile support is currently in development. As of now, you might need to use the `dioxus` mobile template or configure manually.

For mobile, you need to set up the Android project. Dioxus CLI provides a way to initialize the mobile project:

```bash

dioxus init-mobile

```

This command will generate an `android` and `ios` directory in your project.

### Step 4: Build and Run on the Phone

#### Connect your phone via USB and check with adb:

```bash

adb devices

```

You should see your device listed. If it says unauthorized, check the phone and allow the computer.

#### Build and run for Android:

Dioxus CLI has a command to build and run the app on the connected device:

```bash

dioxus build --target android  # Build the APK

dioxus deploy --target android  # Install and run on the connected device

```

Alternatively, you can use:

```bash

dioxus android run

```

If you encounter any issues, you might need to set up the Android SDK and NDK. The Dioxus CLI might guide you through it, but here are some steps:

### Additional Setup: Android SDK and NDK

1. Download Android Studio from [the official site](https://developer.android.com/studio).

2. Install it and then open Android Studio. Go to SDK Manager and install the SDK for the Android version you are targeting (e.g., Android 11 or 12).

3. Also, install the NDK (Side by Side) and CMake from the SDK Manager.

4. Set environment variables:

Add to your `~/.bashrc` or `~/.zshrc`:

```bash

export ANDROID_HOME=$HOME/Android/Sdk

export PATH=$PATH:$ANDROID_HOME/emulator

export PATH=$PATH:$ANDROID_HOME/tools

export PATH=$PATH:$ANDROID_HOME/tools/bin

export PATH=$PATH:$ANDROID_HOME/platform-tools

export PATH=$PATH:$ANDROID_HOME/ndk/<ndk_version>  # replace <ndk_version> with the version you installed, e.g., 25.1.8937393

```

Then source the file.

5. You might also need to set the `ANDROID_NDK_ROOT` environment variable to the NDK path.

### Note:

- The Dioxus mobile support is evolving, so check the official documentation for the latest: [Dioxus Mobile Guide](https://dioxuslabs.com/learn/0.5/getting_started/mobile_support)

- You might encounter issues with the NDK version. Currently, Dioxus might require NDK 25 or 26. Check the Dioxus documentation for the required version.

### Troubleshooting:

- If you get an error about `jni.h` not found, you may need to install the JDK (OpenJDK 11 or 17):

```bash

sudo apt install openjdk-17-jdk

```

- If the build fails due to missing Android SDK, ensure the environment variables are set correctly and the SDK is installed.

### Alternative: Use the `cargo-apk` tool

Dioxus uses `cargo-apk` under the hood. You can also try building with:

```bash

cargo install cargo-apk

cargo apk run

```

But note that for a Dioxus project, the `dioxus` CLI is the recommended way.

### Summary of Commands:

```bash

# Set up the project

dioxus create my_app

cd my_app

dioxus init-mobile

# Connect phone and check

adb devices

# Build and run

dioxus android run

```

Remember to keep an eye on the Dioxus documentation and GitHub for updates as mobile support is actively being developed.

To run a Rust Dioxus app on a physical Android phone during development from Ubuntu Linux, follow these steps:
1. Enable USB Debugging on Your Phone

    Go to Settings > About Phone and tap Build Number 7 times to enable Developer Options.

    In Developer Options, enable USB Debugging.

    Connect your phone to Ubuntu via USB. When prompted, allow USB debugging from your computer.

2. Install Required Tools on Ubuntu
bash

# Install ADB (Android Debug Bridge)
sudo apt update && sudo apt install adb

# Install Rust via rustup (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Dioxus CLI
cargo install dioxus-cli --locked

# Install Android targets for Rust
rustup target add aarch64-linux-android  # For 64-bit ARM devices
# rustup target add armv7-linux-androideabi   # For older 32-bit ARM (if needed)

3. Configure Android SDK/NDK

    Download Android Command Line Tools:
    Download the latest "commandlinetools-linux" ZIP from Android Studio.

    Set Up SDK/NDK:

bash

# Unzip tools (e.g., to ~/android-sdk)
mkdir -p ~/android-sdk/cmdline-tools
unzip ~/Downloads/commandlinetools-linux-*.zip -d ~/android-sdk/cmdline-tools
mv ~/android-sdk/cmdline-tools/cmdline-tools ~/android-sdk/cmdline-tools/latest

# Add to PATH in ~/.bashrc or ~/.zshrc:
echo 'export ANDROID_HOME="$HOME/android-sdk"' >> ~/.bashrc
echo 'export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Install required packages
sdkmanager --install "platform-tools" "platforms;android-33" "ndk;26.1.10909125" "build-tools;34.0.0"

# Verify NDK path (typically under $ANDROID_HOME/ndk)
ls $ANDROID_HOME/ndk

4. Configure Dioxus for Android

Add this to your project's .cargo/config.toml (create it if missing):
toml

[target.aarch64-linux-android]
linker = "$ANDROID_HOME/ndk/<ndk-version>/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android34-clang"
# Replace <ndk-version> with your NDK folder name (e.g., 26.1.10909125)

5. Build and Deploy the App
bash

# Navigate to your Dioxus project
cd your-dioxus-project

# Build the Android APK
dioxus build --target android --release  # Or omit --release for debug build

# Install the APK on your phone
adb install -r ./target/aarch64-linux-android/release/apk/YourApp


