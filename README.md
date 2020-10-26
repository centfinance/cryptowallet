<div align="center">
  <img alt="ReDoc logo" src="https://raw.githubusercontent.com/centfinance/Community/main/media-pack/logo.png" width="400px" />

  ### Cent.Wallet - A mobile crypto wallet with a focus on DeFI
 
</div>

## Prerequisites

You will need to have Node.js `>= 8.11.0` installed on your machine.


  

## Installing

In the directory where you want to keep the repository, run

`git clone https://github.com/Atlas3T/cryptowallet.git`

  

In the root of the directory run

`npm install`

  

## Running the app in the Android Emulator

  

### Prerequisites

You will need to have OpenJDK and AndroidStudio installed.

  

**OpenJDK**

`sudo apt-get install openjdk-8-jre`

and

`sudo apt-get install openjdk-8-jdk`

  

**AndroidStudio**

1. Download AndroidStudio [here](https://developer.android.com/studio/)

  

2. And follow installation steps [here

](https://developer.android.com/studio/install)

  

3. Add Android installation to your path:

  

`

export ANDROID_HOME="$HOME/Android/Sdk"

PATH=$PATH:$ANDROID_HOME/tools; PATH=$PATH:$ANDROID_HOME/platform-tools

`

4. Start Android studio by changing into the folder you installed it in and run `./studio.sh`

5. Open the “Configure” menu at the bottom of the window

6. Select the desired SDKs and click on “Apply” to install the SDKs

7. Open the emulator. Leave it open.

8. In the root directory of the project run

`quasar dev -m cordova -T android`

This should build and push the app into the emulator.

You may encounter issues with:

**Gradle**

Find the path to the Gradle on your system and export it

`export PATH=$PATH:/home/konrad/Gradle/gradle-4.10.2/bin`

  
  

## Running the tests

`npm run test:unit -- --watch`

`npm run test:unit -- --coverage`

  

## Deployment

  

## Prerequisites

  

You will need to have Cordova installed on your machine.

[Install guide for Android](https://cordova.apache.org/docs/en/latest/guide/platforms/android/)

  

### Android

  

`quasar build -m cordova -T android`

  

`cd src-cordova`

  

#### Development

`cordova run android`

Apk is located at /src-cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk

#### Production

`cordova build android`

Apk is located at /src-cordova/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
