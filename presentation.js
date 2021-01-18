namespace("com.subnodal.accounts.presentation", function(exports) {
    var subElements = require("com.subnodal.subelements");
    var l10n = require("com.subnodal.subelements.l10n");

    var logic = require("com.subnodal.accounts.logic");

    var elements = {};

    exports.pages = {
        REDIRECT: 0,
        SIGN_IN: 1,
        CREATE_ACCOUNT: 2,
        PLATFORM_ERROR: 3
    };

    var page = exports.pages.REDIRECT;
    var errorMessage = null;
    var platformErrorMessage = null;

    exports.getPage = function() {
        return page;
    };

    exports.visitPage = function(pageToVisit) {
        page = pageToVisit;
        errorMessage = null;

        subElements.render();
    };

    exports.signIn = function() {
        errorMessage = null;

        var previousPage = exports.getPage();

        try {
            logic.signIn(elements.email.value, elements.password.value).then(logic.continueToPlatform).catch(function(error) {
                exports.visitPage(previousPage);

                subElements.render();

                if (error.code == logic.errorCodes.INVALID_EMAIL) {
                    errorMessage = "error_invalidEmail";
                    } else if (error.code == logic.errorCodes.ACCOUNT_NOT_FOUND) {
                    errorMessage = "error_accountNotFound";
                } else if (error.code == logic.errorCodes.ACCOUNT_SUSPENDED) {
                    errorMessage = "error_accountSuspended";
                } else if (error.code == logic.errorCodes.INCORRECT_PASSWORD) {
                    errorMessage = "error_incorrectPassword";
                }

                subElements.render();
            });

            exports.visitPage(exports.pages.REDIRECT);
        } catch (e) {
            if (e.name == "AuthError" && e.code == logic.errorCodes.NO_EMAIL) {
                errorMessage = "error_noEmail";
            } else if (e.name == "AuthError" && e.code == logic.errorCodes.NO_PASSWORD) {
                errorMessage = "error_noPassword";
            }
        }

        subElements.render();
    };

    exports.createAccount = function() {
        errorMessage = null;

        var previousPage = exports.getPage();

        try {
            logic.createAccount(elements.email.value, elements.password.value, elements.confirmPassword.value, elements.createConsent.checked).then(logic.continueToPlatform).catch(function(error) {
                exports.visitPage(previousPage);

                subElements.render();

                if (error.code == logic.errorCodes.ACCOUNT_EXISTS) {
                    errorMessage = "error_accountExists";
                } else if (error.code == logic.errorCode.INVALID_EMAIL) {
                    errorMessage = "error_invalidEmail";
                } else if (error.code == logic.errorCode.UNAVAILABLE) {
                    errorMessage = "error_unavailable";
                } else if (error.code == logic.errorCode.WEAK_PASSWORD) {
                    errorMessage = "error_weakPassword";
                }

                subElements.render();
            });

            exports.visitPage(exports.pages.REDIRECT);
        } catch (e) {
            if (e.name == "AuthError" && e.code == logic.errorCodes.CONSENT_NOT_GIVEN) {
                errorMessage = "error_consentNotGiven";
            } else if (e.name == "AuthError" && e.code == logic.errorCodes.NO_EMAIL) {
                errorMessage = "error_noEmail";
            } else if (e.name == "AuthError" && e.code == logic.errorCodes.NO_PASSWORD) {
                errorMessage = "error_noPassword";
            } else if (e.name == "AuthError" && e.code == logic.errorCodes.WEAK_PASSWORD) {
                errorMessage = "error_weakPassword";
            } else if (e.name == "AuthError" && e.code == logic.errorCodes.NO_PASSWORD_CONFIRMATION) {
                errorMessage = "error_noPasswordConfirmation";
            } else if (e.name == "AuthError" && e.code == logic.errorCodes.PASSWORD_CONFIRMATION_MISMATCH) {
                errorMessage = "error_passwordConfirmationMismatch";
            }
        }

        subElements.render();
    };

    exports.getErrorMessage = function() {
        return errorMessage != null ? l10n.translate(errorMessage) : null;
    };

    exports.exit = function() {
        if (window.opener && window.opener != window) {
            close();
        } else {
            window.history.back();
        }
    };

    subElements.ready(function() {
        elements = {
            email: document.getElementById("email"),
            password: document.getElementById("password"),
            confirmPassword: document.getElementById("confirmPassword"),
            createConsent: document.getElementById("createConsent")
        };
    });
});