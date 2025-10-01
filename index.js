/* eslint @typescript-eslint/prefer-nullish-coalescing: 0 */
import React, { Component, createContext } from "react";
import {
    View,
    Text,
    Pressable,
    Modal,
    Animated,
    Easing,
    Platform,
    AppState
} from "react-native";
import sdkStyles, { setSize, sdkColors } from "@chainplatform/layout";

const PinLockContext = createContext();

let showPinLockGlobal = null;
let hidePinLockGlobal = null;
let setPinLockGlobal = null;

export class PinLockProvider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            enteredPin: "",
            tempNewPin: null,
            mode: props.correctPin ? "unlock" : "setup",
            shakeAnim: new Animated.Value(0),
            appState: AppState.currentState,
            lastBackgroundTime: null,
        };
    }

    componentDidMount() {
        this.appStateListener = AppState.addEventListener("change", this._handleAppStateChange);
        showPinLockGlobal = this.showPinLock;
        hidePinLockGlobal = this.hidePinLock;
        setPinLockGlobal = this.setPinLock;
    }

    componentWillUnmount() {
        if (this.appStateListener) this.appStateListener.remove();
        showPinLockGlobal = null;
        hidePinLockGlobal = null;
        setPinLockGlobal = null;
    }

    _handleAppStateChange = (nextAppState) => {
        const { appState, lastBackgroundTime } = this.state;
        const { lockOnResume = false, autoLockMinutes = null } = this.props;

        if (appState === "active" && nextAppState === "background") {
            this.setState({ lastBackgroundTime: Date.now() });
        }
        if ((appState === "background" || appState === "inactive") && nextAppState === "active" && this.props.correctPin) {
            if (lockOnResume) {
                this.showPinLock();
            } else if (autoLockMinutes && lastBackgroundTime) {
                const diff = (Date.now() - lastBackgroundTime) / 60000;
                if (diff >= autoLockMinutes) {
                    this.showPinLock();
                }
            }
        }
        this.setState({ appState: nextAppState });
    };

    showPinLock = ({ onUnlock = null } = {}) => {
        let { correctPin } = this.props;
        correctPin = (correctPin).toString();
        this.setState({
            visible: true,
            enteredPin: "",
            tempNewPin: null,
            mode: correctPin ? "unlock" : "setup",
            onUnlock,
        });
    };

    hidePinLock = () => {
        this.setState({ visible: false, enteredPin: "", tempNewPin: null });
    };

    setPinLock = () => {
        this.setState({ mode: "setup", enteredPin: "", tempNewPin: null, visible: true });
    };

    handleKeyPress = (digit) => {
        const { enteredPin, tempNewPin, mode, onUnlock } = this.state;
        let { correctPin, onSetPin } = this.props;
        correctPin = (correctPin).toString();
        const pinLength = correctPin ? correctPin.length : 6;

        if (enteredPin.length < pinLength) {
            const newPin = enteredPin + digit;
            this.setState({ enteredPin: newPin }, () => {
                if (newPin.length === pinLength) {
                    if (mode === "unlock") {
                        if (newPin === correctPin) {
                            this.hidePinLock();
                            if (onUnlock) onUnlock();
                        } else {
                            this.triggerShake();
                            this.setState({ enteredPin: "" });
                        }
                    } else if (mode === "setup") {
                        this.setState({ tempNewPin: newPin, enteredPin: "", mode: "confirm" });
                    } else if (mode === "confirm") {
                        if (newPin === tempNewPin) {
                            this.hidePinLock();
                            if (onSetPin) onSetPin(newPin);
                        } else {
                            this.triggerShake();
                            this.setState({ enteredPin: "", tempNewPin: null, mode: "setup" });
                        }
                    }
                }
            });
        }
    };

    triggerShake = () => {
        Animated.sequence([
            Animated.timing(this.state.shakeAnim, { toValue: 10, duration: 50, easing: Easing.linear, useNativeDriver: Platform.OS !== "web" }),
            Animated.timing(this.state.shakeAnim, { toValue: -10, duration: 50, easing: Easing.linear, useNativeDriver: Platform.OS !== "web" }),
            Animated.timing(this.state.shakeAnim, { toValue: 6, duration: 50, easing: Easing.linear, useNativeDriver: Platform.OS !== "web" }),
            Animated.timing(this.state.shakeAnim, { toValue: -6, duration: 50, easing: Easing.linear, useNativeDriver: Platform.OS !== "web" }),
            Animated.timing(this.state.shakeAnim, { toValue: 0, duration: 50, easing: Easing.linear, useNativeDriver: Platform.OS !== "web" }),
        ]).start();
    };

    renderDots = () => {
        const { enteredPin } = this.state;
        const pinLength = this.props.correctPin ? ((this.props.correctPin).toString()).length : 6;

        return (
            <View style={{ flexDirection: sdkStyles.flexRow, marginBottom: setSize(20) }}>
                {Array(pinLength).fill(0).map((_, i) => (
                    <View key={i} style={{
                        width: setSize(16),
                        height: setSize(16),
                        borderRadius: setSize(8),
                        marginHorizontal: setSize(6),
                        backgroundColor: i < enteredPin.length ? "#000" : "#ccc"
                    }} />
                ))}
            </View>
        );
    };

    renderKeypad = () => {
        const rows = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["0"]];
        return (
            <View style={{ justifyContent: sdkStyles.center, alignItems: sdkStyles.center }}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: sdkStyles.flexRow, justifyContent: sdkStyles.center }}>
                        {row.map((d) => (
                            <Pressable key={d} style={{
                                width: setSize(60),
                                height: setSize(60),
                                borderRadius: setSize(30),
                                backgroundColor: sdkColors.border,
                                justifyContent: sdkStyles.center,
                                alignItems: sdkStyles.center,
                                margin: setSize(6)
                            }} onPress={() => this.handleKeyPress(d)}>
                                <Text style={{ fontSize: setSize(20), fontWeight: sdkStyles.fw600 }}>{d}</Text>
                            </Pressable>
                        ))}
                        {rowIndex === 3 && (this.state.mode === "setup" || this.state.mode === "confirm") && this.props.correctPin && (
                            <View style={{
                                width: setSize(60),
                                height: setSize(60),
                                borderRadius: setSize(30),
                                backgroundColor: sdkColors.transparent,
                                justifyContent: sdkStyles.center,
                                alignItems: sdkStyles.center,
                                margin: setSize(6)
                            }}></View>
                        )}
                        {rowIndex === 3 && (this.state.mode === "setup" || this.state.mode === "confirm") && this.props.correctPin && (
                            <Pressable style={{
                                width: setSize(60),
                                height: setSize(60),
                                borderRadius: setSize(30),
                                backgroundColor: sdkColors.border,
                                justifyContent: sdkStyles.center,
                                alignItems: sdkStyles.center,
                                margin: setSize(6)
                            }} onPress={() => this.hidePinLock()}>
                                <Text style={{ fontSize: setSize(20), fontWeight: sdkStyles.fw600 }}>X</Text>
                            </Pressable>
                        )}
                    </View>
                ))}
            </View>
        );
    };

    render() {
        const { visible, shakeAnim, mode } = this.state;
        let headerText = this.props.headerText ? this.props.headerText : "Enter PIN";
        const setupText = this.props.setupText ? this.props.setupText : "Set a new PIN";
        const confirmText = this.props.confirmText ? this.props.confirmText : "Confirm your PIN";
        const resetText = this.props.resetText ? this.props.resetText : "Reset PIN";
        const cancelText = this.props.cancelText ? this.props.cancelText : "Cancel";
        if (mode === "setup") headerText = setupText;
        if (mode === "confirm") headerText = confirmText;
        return (
            <PinLockContext.Provider>
                {this.props.children}
                <Modal visible={visible} transparent>
                    <Pressable style={{
                        flex: 1,
                        backgroundColor: sdkColors.white,
                        justifyContent: sdkStyles.center,
                        alignItems: sdkStyles.center
                    }} onPress={this.triggerShake}>
                        <Animated.View style={{
                            backgroundColor: sdkColors.white, padding: setSize(20),
                            borderRadius: setSize(12), width: setSize(250),
                            alignItems: sdkStyles.center, transform: [{ translateX: shakeAnim }]
                        }}>
                            <Text style={{
                                fontSize: setSize(18),
                                fontWeight: sdkStyles.fwBold,
                                marginBottom: setSize(20)
                            }}>{headerText}</Text>
                            {this.renderDots()}
                            {this.renderKeypad()}
                            {mode === "unlock" && (<Pressable style={{
                                marginTop: setSize(15),
                                paddingVertical: setSize(8),
                                paddingHorizontal: setSize(12),
                                borderRadius: setSize(6),
                                backgroundColor: sdkColors.border
                            }} onPress={() => this.setPinLock()}>
                                <Text style={{
                                    fontSize: setSize(14),
                                    fontWeight: sdkStyles.fw600
                                }}>{resetText}</Text>
                            </Pressable>)}
                            {(mode === "setup" || mode === "confirm") && this.props.correctPin && (
                                <Pressable style={{
                                    marginTop: setSize(15),
                                    paddingVertical: setSize(8),
                                    paddingHorizontal: setSize(12),
                                    borderRadius: setSize(6),
                                    backgroundColor: sdkColors.border
                                }} onPress={() => this.showPinLock()}>
                                    <Text style={{
                                        fontSize: setSize(14),
                                        fontWeight: sdkStyles.fw600
                                    }}>{cancelText}</Text>
                                </Pressable>)}
                        </Animated.View>
                    </Pressable>
                </Modal>
            </PinLockContext.Provider>
        );
    }
}

export function showPinLock(options) { if (showPinLockGlobal) showPinLockGlobal(options); }
export function hidePinLock() { if (hidePinLockGlobal) hidePinLockGlobal(); }
export function setPinLock() { if (setPinLockGlobal) setPinLockGlobal(); }