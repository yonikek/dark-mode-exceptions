(function () {
    "use strict";

    const whitelistedDomains = [];

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
        // Only activate the extension when the OS/browser is in dark mode.
        const systemIsDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        // Light system theme: never interfere with the page.
        if (!systemIsDark) {
            return;
        }

        // Dark system + whitelisted site:
        // leave Chromium Force Dark alone.
        if (isWhitelisted(domains)) {
            return;
        }

        // Dark system + non-whitelisted site:
        // prevent Chromium Force Dark from affecting it.
        const style = document.createElement("style");
        style.id = "dark-mode-whitelist-style";
        style.textContent = lightCSS;

        (document.head || document.documentElement).appendChild(style);
    }

    chrome.storage.sync.get(
        ["whitelistedDomains"],
        (result) => {
            const domains = result.whitelistedDomains || whitelistedDomains;
            applyStyle(domains);
        }
    );
})();
