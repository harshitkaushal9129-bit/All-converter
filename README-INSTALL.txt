FILE CONVERTER PRO - UPDATED PWA PACKAGE
========================================

WHAT WAS FIXED / ADDED
- Added Web App Manifest link in index.html.
- Added 192x192 and 512x512 PNG app icons.
- Registered the service worker automatically on HTTPS/localhost.
- Updated service worker cache list to include HTML, CSS, JS, manifest and icons.
- Added App Info details and developer information (Kaushalji, based on the original app text).
- Added YouTube link (opens YouTube homepage; replace with your own channel URL if desired).
- Added Instagram share button. On supported devices it opens the native share sheet; choose Instagram there.
- Added live date/time and an interactive monthly calendar.

HOW TO INSTALL ON ANDROID
1. Upload/extract this entire folder to an HTTPS hosting service (for example GitHub Pages, Netlify or your own HTTPS hosting).
2. Open the hosted index.html URL in Chrome.
3. Wait for the page to load, then use Chrome menu > Install app / Add to Home screen.
4. If Chrome does not show Install immediately, refresh after the service worker has completed registration.

IMPORTANT
- PWA installation does not work reliably by opening index.html directly as file://.
- A secure HTTPS website (or localhost during development) is required for service workers.
- The YouTube button currently opens https://www.youtube.com/ because no specific channel URL was supplied.
- Instagram does not provide a universal website URL that can prefill a post. The share button uses Android's share sheet when available.
- This is a web app/PWA package, not an APK. A native Android APK requires a separate Android wrapper/build process.
