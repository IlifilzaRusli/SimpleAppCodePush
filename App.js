import React, { Component } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import CodePush from "react-native-code-push";

export default class App extends Component {
    constructor() {
        super();
        this.state = { restartAllowed: true };
    }

    codePushStatusDidChange(syncStatus) {
        switch(syncStatus) {
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                this.setState({ syncMessage: "Checking for update." });
                break;
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                this.setState({ syncMessage: "Downloading package." });
                break;
            case CodePush.SyncStatus.AWAITING_USER_ACTION:
                this.setState({ syncMessage: "Awaiting user action." });
                break;
            case CodePush.SyncStatus.INSTALLING_UPDATE:
                this.setState({ syncMessage: "Installing update." });
                break;
            case CodePush.SyncStatus.UP_TO_DATE:
                this.setState({ syncMessage: "App up to date.", progress: false });
                break;
            case CodePush.SyncStatus.UPDATE_IGNORED:
                this.setState({ syncMessage: "Update cancelled by user.", progress: false });
                break;
            case CodePush.SyncStatus.UPDATE_INSTALLED:
                this.setState({ syncMessage: "Update installed and will be applied on restart.", progress: false });
                break;
            case CodePush.SyncStatus.UNKNOWN_ERROR:
                this.setState({ syncMessage: "An unknown error occurred.", progress: false });
                break;
        }
    }

    codePushDownloadDidProgress(progress) {
        this.setState({ progress });
    }

    /** Update is downloaded silently, and applied on restart (recommended) */
    sync() {
        CodePush.sync(
            {},
            this.codePushStatusDidChange.bind(this),
            this.codePushDownloadDidProgress.bind(this)
        );
    }

    /** Update pops a confirmation dialog, and then immediately reboots the app */
    syncImmediate() {
        CodePush.sync(
            {
                installMode: CodePush.InstallMode.IMMEDIATE,
                updateDialog: true
            },
            this.codePushStatusDidChange.bind(this),
            this.codePushDownloadDidProgress.bind(this)
        );
    }

    render() {
        let progressView;

        if (this.state.progress) {
            progressView = (
                <Text style={styles.messages}>{this.state.progress.receivedBytes} of {this.state.progress.totalBytes} bytes received</Text>
            );
        }

        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Welcome to App V1!
                </Text>
                <TouchableOpacity onPress={this.sync.bind(this)}>
                    <Text style={styles.syncButton}>Press for background sync</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.syncImmediate.bind(this)}>
                    <Text style={styles.syncButton}>Press for dialog-driven sync</Text>
                </TouchableOpacity>
                {progressView}
                <Text style={styles.messages}>{this.state.syncMessage || ""}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#F5FCFF",
        paddingTop: 50
    },
    image: {
        margin: 30,
        width: Dimensions.get("window").width - 100,
        height: 365 * (Dimensions.get("window").width - 100) / 651,
    },
    messages: {
        marginTop: 30,
        textAlign: "center",
    },
    restartToggleButton: {
        color: "blue",
        fontSize: 17
    },
    syncButton: {
        color: "green",
        fontSize: 17
    },
    welcome: {
        fontSize: 20,
        textAlign: "center",
        margin: 20
    },
});

let codePushOptions = { checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME };

App = CodePush(codePushOptions)(App);

