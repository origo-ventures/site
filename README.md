# Origo Ventures — Website

## Events (easy editing)
Edit ONLY `assets/js/events-data.js`.
- Copy one event block, paste at the TOP, change the text, save.
- 1st event = Current Event (Home page + top of Events page). 2nd, 3rd... = Upcoming Events.
- Events page and Home update automatically. Each event shows 'Get Ticket' (ticketLink) and 'Contact' buttons.
- Event images: put files in assets/images/events/ and set `image: "assets/images/events/name.jpg"`.

## Companies
Edit ONLY `assets/js/companies-data.js` (4 placeholders included). Put logos/photos in assets/images/companies/.

## About page (Founder)
In about.html replace the Photo box with <img src="assets/images/founder.jpg"> and the QR box with <img src="assets/images/qr-code.png"> (comments mark both spots).

## Brand color
Change `--accent` at the top of assets/css/style.css (currently a placeholder brown #b07a4b).

## NDA events
Edit the `window.ORIGO_NDA` list at the bottom of assets/js/events-data.js. Photos go in assets/images/nda/.

## Other notes
- Placeholder company/contact/social content must be replaced.
- Contact form is front-end only; connect a backend/email service.

## Photos (automatic)
Drop photos into assets/images/<folder>/ with the exact names in that folder's README.txt. If a file is missing, a placeholder box shows instead. After replacing a file, hard refresh (Ctrl+Shift+R).

## Control panel (GitHub Pages)
Open yourdomain.com/origo-control.html (see GITHUB-SETUP.txt).
It edits assets/js/*-data.js and uploads photos to assets/images/ through the GitHub API.
Data files: content-data.js (page text), pages-data.js (extra pages), events-data.js, nda-data.js,
companies-data.js, site-data.js (contact, founder, home ventures).
