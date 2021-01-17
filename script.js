/*
    Subnodal Accounts

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

var subElements = require("com.subnodal.subelements");
var requests = require("com.subnodal.subelements.requests");
var l10n = require("com.subnodal.subelements.l10n");

var _ = l10n.translate;

const pages = {
    REDIRECT: 0,
    SIGN_IN: 1,
    CREATE_ACCOUNT: 2
};

var page = pages.SIGN_IN;

function visitPage(pageToVisit) {
    page = pageToVisit;

    subElements.render();
}

Promise.all([
    requests.getJson("locale/en_GB.json"),
    requests.getJson("locale/fr_FR.json")
]).then(function(resources) {
    subElements.init({
        languageResources: {
            "en_GB": resources[0],
            "fr_FR": resources[1]
        },
        localeCode: localStorage.getItem("locale") || undefined,
        fallbackLocaleCode: "en_GB"
    });

    subElements.ready(function() {
        for (var i = 0; i < l10n.getLanguageResourceCodes().length; i++) {
            var option = document.createElement("option");

            option.value = l10n.getLanguageResourceCodes()[i];
            option.text = l10n.getLocaleName(l10n.getLanguageResourceCodes()[i], true);
            
            document.getElementById("language").appendChild(option);
        }

        document.getElementById("language").value = l10n.getLocaleCode();

        document.getElementById("language").addEventListener("change", function(event) {
            l10n.switchToLocale(event.target.value);
            localStorage.setItem("locale", event.target.value);

            subElements.render();
        });
    });
});