(function () {
    "use strict";

    const lightCSS = `
        :root {
            color-scheme: light only !important;
        }
    `;

    const styleId = "dark-mode-exception-style";

    function getCurrentDomain() {
        return window.location.hostname;
    }

    function isWhitelisted(domains) {
        const currentDomain = getCurrentDomain();

        return domains.some((domain) => {
            return (
                currentDomain === domain ||
                currentDomain.endsWith("." + domain)
            );
        });
    }

    function applyException(shouldApply) {
        let style = document.getElementById(styleId);

        if (shouldApply) {
            if (!style) {
                style = document.createElement("style");
                style.id = styleId;
                style.textContent = lightCSS;

                (document.head || document.documentElement).appendChild(style);
            }
        } else {
            if (style) {
                style.remove();
            }
        }
    }

    function update(domains) {
        const systemIsDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        const whitelisted = isWhitelisted(domains);

        /*
         * Light system:
         *   Always apply the original light-mode exception.
         *
         * Dark system:
         *   Apply the exception everywhere EXCEPT whitelisted domains.
         */
        const shouldApplyException =
            !systemIsDark || !whitelisted;

        applyException(shouldApplyException);
    }

    function loadDomains() {
        chrome.storage.sync.get(
            ["excludedDomains"],
            (result) => {
                const domains = result.excludedDomains || [];
                update(domains);
            }
        );
    }

    // Initial state.
    loadDomains();

    // React when the system theme changes.
    const mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );

    mediaQuery.addEventListener("change", loadDomains);

    // React immediately when the whitelist changes in the popup.
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (
            areaName === "sync" &&
            changes.excludedDomains
        ) {
            update(changes.excludedDomains.newValue || []);
        }
    });
})();
