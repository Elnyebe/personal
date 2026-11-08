# Johndrey's Portfolio

This is my portfolio site. It has a few examples of my web, Python, and game scripting work, along
with some information about my IT support experience.

The site is made with HTML, CSS, and JavaScript. It runs on GitHub Pages from the repository root,
so there is no build step.

## Making changes

- Edit the page content and project descriptions in `index.html`.
- Change the layout and colors in `css/site.css`.
- Update the interactions in `js/site.js`.
- The project illustrations are in `assets/images/`.

The résumé download is built from the experience and education sections in `index.html`. To change
the résumé, update those entries there. The project cards use SVG illustrations; update the image's
`src` and `alt` text in `index.html` if you replace one.

## Publishing

In the repository on GitHub, open **Settings → Pages**. Set the source to **Deploy from a branch**,
then select `main` and `/(root)`. GitHub will show the site address on that page after it deploys.

## Security

The site has a Content Security Policy that limits where it can load scripts and images from. Since
this is a public static site, its source files are public too. Keep passwords and API keys out of the
repository, and protect the GitHub account that can publish changes with two-factor authentication.
