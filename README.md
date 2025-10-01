# 📌 @chainplatform/pin

<a href="https://npmjs.com/package/@chainplatform/pin">
  <img src="https://img.shields.io/npm/v/@chainplatform/pin.svg"></img>
  <img src="https://img.shields.io/npm/dt/@chainplatform/pin.svg"></img>
</a>
<a href="hhttps://x.com/intent/follow?screen_name=doansan"><img src="https://img.shields.io/twitter/follow/doansan.svg?label=Follow%20@doansan" alt="Follow @doansan"></img></a>

A lightweight **second-layer security** module for React Native / React Native Web.  
Provides a **PIN lock overlay** that can be triggered globally, with support for setting/resetting PIN.

---

## ✨ Features

- 🔒 PIN entry overlay for second-layer security  
- ⏳ Auto lock after inactivity (`autoLockMinutes`) – optional  
- 🔄 Lock on app resume (`lockOnResume`) – optional  
- 🚪 Require PIN on app start (`requirePinOnStart`) – optional  
- 🆕 Supports **setting and resetting PIN** without storage  
- 🎯 Easy to trigger anywhere with `showPinLock`, `hidePinLock`, `setPinLock`  
- ✅ Works in both **Class Components** and **Function Components**

---

## 📦 Installation

```bash
npm install @chainplatform/pin
# or
yarn add @chainplatform/pin
```

---

## 🚀 Usage

### 1. Wrap your app with `PinLockProvider`

```jsx
import React from "react";
import { PinLockProvider } from "@chainplatform/pin";
import AppNavigator from "./AppNavigator";

export default function App() {
  return (
    <PinLockProvider
      autoLockMinutes={5}      // ⏳ optional: auto lock after 5 minutes inactivity
      lockOnResume={true}      // 🔄 optional: lock when app comes back from background
      requirePinOnStart={true} // 🚪 optional: lock immediately when app starts
      correctPin="123456"      // 🔑 initial correct PIN, required
      onSetPin={(pin) => console.log("New PIN set:", pin)} // Callback when PIN is set
      
      // Optional text customization
      headerText="Enter your PIN"
      setupText="Set a new PIN"
      confirmText="Confirm your PIN"
      resetText="Reset PIN"
      cancelText="Cancel"
    >
      <AppNavigator />
    </PinLockProvider>
  );
}
```

---

### 2. Trigger PIN Lock anywhere

```jsx
import React, { Component } from "react";
import { View, Text, Button } from "react-native";
import { showPinLock, hidePinLock, setPinLock } from "@chainplatform/pin";

export default class ProfileScreen extends Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>👤 Profile Screen</Text>
        <Button
          title="Lock this screen"
          onPress={() =>
            showPinLock({
              correctPin: "999999",
              onUnlock: () => alert("Profile Unlocked!"),
            })
          }
        />
        <Button title="Reset PIN" onPress={() => setPinLock()} />
      </View>
    );
  }
}
```

---

## ⚙️ API

### 🔑 `PinLockProvider` Props

| Prop               | Type      | Default | Description |
|--------------------|-----------|---------|-------------|
| `autoLockMinutes`  | `number`  | `null`  | ⏳ Optional. Auto lock after X minutes of inactivity. |
| `lockOnResume`     | `boolean` | `false` | 🔄 Optional. Lock when app comes back from background. |
| `requirePinOnStart`| `boolean` | `false` | 🚪 Optional. Require PIN immediately when app first opens. |
| `correctPin`       | `string`  | `null`  | 🔑 Initial PIN to unlock. Required for first setup. |
| `onSetPin`         | `function`| `null`  | Callback when a new PIN is successfully set. |

---

### 🔧 Global API

- `showPinLock(options)` – Show the PIN overlay  
- `hidePinLock()` – Hide the PIN overlay  
- `setPinLock()` – Start the PIN setup/reset flow  

#### `showPinLock(options)`

| Option       | Type       | Default   | Description |
|--------------|------------|-----------|-------------|
| `correctPin` | `string`   | `"123456"`| The correct PIN to unlock. |
| `onUnlock`   | `function` | `null`    | Callback when PIN is correct. |

---

## 🆕 Features: PIN Setup / Reset

- When `correctPin` is not set, the overlay enters **setup mode** automatically  
- User enters a new PIN → confirm PIN → triggers `onSetPin` callback  
- While unlocking, user can **reset PIN** → enters setup mode  
- Cancel button available in **setup/confirm mode** to abort

---

## ✅ Summary

- Wrap your app in `PinLockProvider` with optional props  
- Use global API `showPinLock`, `hidePinLock`, `setPinLock` anywhere  
- Supports **first-time PIN setup**, **unlock**, **reset**, and **cancel**  
- Works with **class components** or **function components**