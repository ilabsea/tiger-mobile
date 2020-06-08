# Tiger

Tiger is an android application that allows user to read and listen to stories.

# Development Set up on Mac OS X
## Dependencies

Run the following command to install Node, Watchman, and JDK using Homebrew.

  ```
  $ brew install node
  $ brew install watchman
  $ brew tap AdoptOpenJDK/openjdk
  $ brew cask install adoptopenjdk8
  ```

Tiger uses Node version (8.11.3) JDK (8 or newer)

## React Native Set up

Run the following command in a Terminal to install React Native command line interface.

  ```
  $ npm install -g react-native-cli
  ```

## Android development environment
1. Install Android Studio
2. Install the Android SDK
3. Configure the ANDROID_HOME environment variable

For more detail: refer to https://facebook.github.io/react-native/docs/getting-started > Select tab React Native CLI Quickstart > Select Development OS (Mac OS) > Select Target OS(Android ) > Go to section Android development environment

## Running in Android
After you have clone the project to your computer, you need to run command in a Terminal as following:
  ```
  $ npm install
  $ react-native link
  ```

If you have problem with react-native link please refer to library that is in `package.json` to link manually. Dependencies libraries to link are:

  - [@react-native-community/async-storage](https://github.com/react-native-community/async-storage)
  - [react-native-device-info](https://github.com/react-native-community/react-native-device-info)
  - [react-native-fs](https://github.com/itinance/react-native-fs)
  - [react-native-i18n](https://github.com/AlexanderZaytsev/react-native-i18n)
  - [react-native-sound](https://github.com/zmxv/react-native-sound)
  - [react-native-splash-screen](https://github.com/crazycodeboy/react-native-splash-screen)
  - [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons)
  - [realm](https://github.com/realm)

To run react native android application, please connect your android device or run android emulator. Then run command in a Terminal.

  ```
  $ react native run-android
  ```

# Release to Playstore

To release to playstore you need to:
  - Edit url end point in `app/environments/environment.js`
  ```
  apiUrl: 'your_server_api_url',
  domain: 'your_domain_server'
  ```
  - Increase versionCode and versionName in `android/app/build.gradle`
  ```
  defaultConfig {
      ...
      versionCode xxx
      versionName 'x.x.x'
      ...
  }
  ```
  - Place tiger release keystore in `android/app/`
  - Edit file `android/gradle.properties`

  ```
  MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
  MYAPP_RELEASE_KEY_ALIAS=my-key-alias
  MYAPP_RELEASE_STORE_PASSWORD=*****
  MYAPP_RELEASE_KEY_PASSWORD=*****
  ````

Generating the release bundle

  ```
  $ cd android
  $ ./gradlew bundleRelease
  ```
You will get app.aab in `android/app/build/outputs/bundle/release/app.aab`.

For more detail refer to https://facebook.github.io/react-native/docs/signed-apk-android
