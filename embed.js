/*
    Subnodal Accounts

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

var subElements = require("com.subnodal.subelements");
var core = require("com.subnodal.subelements.core");
var requests = require("com.subnodal.subelements.requests");
var l10n = require("com.subnodal.subelements.l10n");

var _ = l10n.translate;

function openPopup() {
    if (core.parameter("platform") != null) {
        window.open("/?platform=" + encodeURIComponent(core.parameter("platform")), "popUpWindow", "width=550,height=600");
    } else {
        window.open("/", "popUpWindow", "width=550,height=600");
    }
}

Promise.all([
    requests.getJson("locale/en_GB.json"),
    requests.getJson("locale/fr_FR.json"),
    requests.getJson("locale/zh_CN.json")
]).then(function(resources) {
    subElements.init({
        languageResources: {
            "en_GB": resources[0],
            "fr_FR": resources[1],
            "zh_CN": resources[2]
        },
        localeCode: localStorage.getItem("locale") || undefined,
        fallbackLocaleCode: "en_GB"
    });
});

window.addEventListener("message", function(event) {
    if (event.origin != "https://accounts.subnodal.com") {
        return;
    }

    window.top.location.replace(event.data);
});