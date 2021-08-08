/*
    Subnodal Accounts

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.accounts", function(exports) {
    var subElements = require("com.subnodal.subelements");
    var requests = require("com.subnodal.subelements.requests");
    var l10n = require("com.subnodal.subelements.l10n");

    var logic = require("com.subnodal.accounts.logic");
    var presentation = require("com.subnodal.accounts.presentation");
    var resources = require("com.subnodal.accounts.resources");

    window._ = l10n.translate;

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
    
        subElements.ready(function() {
            for (var i = 0; i < l10n.getLanguageResourceCodes().length; i++) {
                var option = document.createElement("option");
    
                option.value = l10n.getLanguageResourceCodes()[i];
                option.text = l10n.getLocaleName(l10n.getLanguageResourceCodes()[i], true);
                
                document.querySelector("#language").appendChild(option);
            }
    
            document.querySelector("#language").value = l10n.getLocaleCode();
    
            document.querySelector("#language").addEventListener("change", function(event) {
                l10n.switchToLocale(event.target.value);
                localStorage.setItem("locale", event.target.value);
    
                document.querySelector("title").textContent = _("title");
    
                subElements.render();
            });
    
            document.querySelector("title").textContent = _("title");
    
            logic.init();
        });
    });
});