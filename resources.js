namespace("com.subnodal.accounts.resources", function(exports) {
    var core = require("com.subnodal.subelements.core");

    var logic = require("com.subnodal.accounts.logic");

    var firebaseConfig = {
        apiKey: "AIzaSyAcLPA0mVAdC1Hv2zzxSx3FHTvBueJqYPA",
        authDomain: "subnodal-storage.firebaseapp.com",
        databaseURL: "https://subnodal-storage.firebaseio.com",
        projectId: "subnodal-storage",
        storageBucket: "subnodal-storage.appspot.com",
        messagingSenderId: "557010120711",
        appId: "1:557010120711:web:d9ab615282b9c1d4463aa2"
    };

    firebase.initializeApp(firebaseConfig);

    var userId = null;

    exports.signIn = function(email, password) {
        return new Promise(function(resolve, reject) {
            firebase.auth().signInWithEmailAndPassword(email, password).then(resolve).catch(function(error) {
                switch (error.code) {
                    case "auth/invalid-email":
                        reject({message: error.message, code: logic.errorCodes.INVALID_EMAIL});
                        break;
                    
                    case "auth/user-disabled":
                        reject({message: error.message, code: logic.errorCodes.ACCOUNT_SUSPENDED});
                        break;
                    
                    case "auth/user-not-found":
                        reject({message: error.message, code: logic.errorCodes.ACCOUNT_NOT_FOUND});
                        break;
                    
                    case "auth/wrong-password":
                        reject({message: error.message, code: logic.errorCodes.INCORRECT_PASSWORD});
                        break;
                    
                    default:
                        reject({message: error.message, code: logic.errorCodes.UNKNOWN});
                        break;
                }
            });
        });
    };

    exports.createAccount = function(email, password) {
        return new Promise(function(resolve, reject) {
            firebase.auth().createUserWithEmailAndPassword(email, password).then(resolve).catch(function(error) {
                switch (error.code) {
                    case "auth/email-already-in-use":
                        reject({message: error.message, code: logic.errorCodes.ACCOUNT_EXISTS});
                        break;
                    
                    case "auth/invalid-email":
                        reject({message: error.message, code: logic.errorCodes.INVALID_EMAIL});
                        break;
                    
                    case "auth/operation-not-allowed":
                        reject({message: error.message, code: logic.errorCodes.UNAVAILABLE});
                        break;
                    
                    case "auth/weak-password":
                        reject({message: error.message, code: logic.errorCodes.WEAK_PASSWORD});
                        break;
                    
                    default:
                        reject({message: error.message, code: logic.errorCodes.UNKNOWN});
                        break;
                }
            });
        });
    };

    exports.awaitSignIn = function() {
        return new Promise(function(resolve, reject) {
            firebase.auth().onAuthStateChanged(function(user) {
                resolve(!!user);
            });
        });
    };

    exports.getPlatform = function(platformId) {
        return new Promise(function(resolve, reject) {
            firebase.database().ref("platforms/" + platformId).once("value").then(function(snapshot) {
                console.log(snapshot.val());
                if (snapshot.val() != null) {
                    resolve(snapshot.val());
                } else {
                    reject({message: "Unknown platform identifier", code: logic.errorCodes.UNKNOWN_PLATFORM});
                }
            });
        });
    };

    exports.getCurrentUserTokens = function(platformId) {
        return new Promise(function(resolve, reject) {
            if (typeof(platformId) != "string") {
                reject({message: "Please specify the platform ID as a string", code: logic.errorCodes.TYPE_MISMATCH});

                return;
            }

            if (userId == null) {
                reject({message: "Please sign in before getting user tokens", code: logic.errorCodes.NOT_SIGNED_IN});

                return;
            }

            firebase.database().ref("users/" + userId + "/tokens/" + platformId).once("value").then(function(snapshot) {
                if (snapshot.val() != null) {
                    resolve(snapshot.val());
                } else {
                    var tokens = {
                        public: core.generateKey(16),
                        private: core.generateKey(64)
                    };

                    firebase.database().ref("users/" + userId + "/tokens/" + platformId).set(tokens).then(function() {
                        resolve(tokens);
                    }).catch(function(error) {
                        reject({message: error.message, code: logic.errorCodes.UNKNOWN});
                    });
                }
            }).catch(function(error) {
                reject({message: error.message, code: logic.errorCodes.UNKNOWN});
            });
        });
    };

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            userId = user.uid;
        } else {
            userId = null;
        }
    });
});