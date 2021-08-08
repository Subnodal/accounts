namespace("com.subnodal.accounts.logic", function(exports) {
    var core = require("com.subnodal.subelements.core");

    var presentation = require("com.subnodal.accounts.presentation");
    var resources = require("com.subnodal.accounts.resources");

    exports.errorCodes = {
        UNKNOWN: 0,
        NO_EMAIL: 1,
        NO_PASSWORD: 2,
        INVALID_EMAIL: 3,
        ACCOUNT_SUSPENDED: 4,
        ACCOUNT_NOT_FOUND: 5,
        INCORRECT_PASSWORD: 6,
        CONSENT_NOT_GIVEN: 7,
        ACCOUNT_EXISTS: 8,
        UNAVAILABLE: 9,
        WEAK_PASSWORD: 10,
        NO_PASSWORD_CONFIRMATION: 11,
        PASSWORD_CONFIRMATION_MISMATCH: 12,
        UNKNOWN_PlATFORM: 13,
        NOT_SIGNED_IN: 14,
        TYPE_MISMATCH: 15,
        PLATFORM_MISCONFIGURATION: 16
    };

    exports.AuthError = class extends Error {
        constructor(message, code) {
            super(message);

            this.name = "AuthError";
            this.code = code;
        }
    };

    exports.signIn = function(email, password) {
        if (email.trim() == "") {
            throw new exports.AuthError("Please enter an email address", exports.errorCodes.NO_EMAIL);
        }

        if (password.trim() == "") {
            throw new exports.AuthError("Please enter a password", exports.errorCodes.NO_PASSWORD);
        }

        return resources.signIn(email.trim(), password.trim());
    };

    exports.createAccount = function(email, password, confirmPassword, consentGiven) {
        if (!consentGiven) {
            throw new exports.AuthError("Please accept the Terms of Use and Privacy Policy", exports.errorCodes.CONSENT_NOT_GIVEN);
        }

        if (email.trim() == "") {
            throw new exports.AuthError("Please enter an email address", exports.errorCodes.NO_EMAIL);
        }

        if (password.trim() == "") {
            throw new exports.AuthError("Please enter a password", exports.errorCodes.NO_PASSWORD);
        }

        if (password.trim().length < 6) {
            throw new exports.AuthError("Your password must be at least 6 characters long", exports.errorCodes.WEAK_PASSWORD);
        }

        if (confirmPassword.trim() == "") {
            throw new exports.AuthError("Please confirm your password by entering it again", exports.errorCodes.NO_PASSWORD_CONFIRMATION);
        }

        if (confirmPassword.trim() != password.trim()) {
            throw new exports.AuthError("Your password does not match your confirmed password", exports.errorCodes.PASSWORD_CONFIRMATION_MISMATCH);
        }

        return resources.createAccount(email.trim(), password.trim());
    };

    function redirectToUrl(url) {
        if (window.opener && window.opener != window) {
            window.opener.postMessage(url, "https://accounts.subnodal.com");

            close();
        } else {
            window.location.replace(url);
        }
    }

    function redirectWithUserTokens(platformData, userTokens) {
        if (typeof(platformData.completeUrl) != "string") {
            return Promise.reject({message: "No completion URL was supplied", code: exports.errorCodes.PLATFORM_MISCONFIGURATION});
        }

        redirectToUrl(platformData.completeUrl.replace(/{public}/g, encodeURIComponent(userTokens.public)).replace(/{private}/g, encodeURIComponent(userTokens.private)));
    }

    function redirectWithProfileToken(platformData, profileToken) {
        if (typeof(platformData.completeUrl) != "string") {
            return Promise.reject({message: "No completion URL was supplied", code: exports.errorCodes.PLATFORM_MISCONFIGURATION});
        }

        redirectToUrl(platformData.completeUrl.replace(/{token}/g, encodeURIComponent(profileToken)));
    }

    exports.continueToPlatform = function() {
        if (core.parameter("platform") != null) {
            var platformData = null;

            resources.getPlatform(core.parameter("platform")).then(function(data) {
                platformData = data;

                if (platformData.profileAuth) {
                    return resources.getProfileToken().then((profileToken) => redirectWithProfileToken(platformData, profileToken));
                } else {
                    return resources.getCurrentUserTokens(core.parameter("platform")).then((userTokens) => redirectWithUserTokens(platformData, userTokens));
                }
            }).catch(function(error) {
                console.error(error);

                presentation.visitPage(presentation.pages.PLATFORM_ERROR);
            });
        } else {
            presentation.visitPage(presentation.pages.PLATFORM_ERROR);
        }
    };

    exports.init = function() {
        resources.awaitSignIn().then(function(signedIn) {
            if (signedIn && core.parameter("switchAccounts") != "true") {
                exports.continueToPlatform();
            } else {
                presentation.visitPage(presentation.pages.SIGN_IN);
            }
        })
    };
});