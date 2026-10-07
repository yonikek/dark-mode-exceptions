(function () {
    "use strict";

    const lightCSS = `
        :root {
            color-scheme: light only !important;
        }
    `;

    function isWhitelisted(domains) {
        const hostname = window.location.hostname;

        return domains.some((domain) =>
            hostname === domain ||
            hostname.endsWith("." + domain)
        );
    }

    function applyStyle(domains) {
        const systemIsDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        /*
         * Light system:
         * Do nothing. The site behaves normally.
         */
        if (!systemIsDark) {
            return;
        }

        /*
         * Dark system + whitelisted:
         * Do nothing. Chromium's Force Dark is allowed to work.
         */
        if (isWhitelisted(domains)) {
            return;
        }

        /*
         * Dark system + not whitelisted:
         * Prevent Chromium Force Dark from darkening the page.
         */
        const style = document.createElement("style");
        style.id = "dark-mode-exceptions-style";
        style.textContent = lightCSS;

        (document.head || document.documentElement).appendChild(style);
    }

    chrome.storage.sync.get(
        ["excludedDomains"],
        (result) => {
            const excludedDomains = result.excludedDomains || [];

            applyStyle(excludedDomains);
        }
    );
})();
