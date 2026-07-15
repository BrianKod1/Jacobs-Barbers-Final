# Jacobs Barbers — Final Concepts

The two final concept directions for jacobsbarbers.ca, both matching the client's reference site (cream background, white cards, black headings, grey small text, hamburger "Menu" button). The only difference between them is the hero photo.

## Versions

- **v6-precise/** — hero photo: hands cutting hair with scissors and a comb
- **v7-new-hero/** — hero photo: a straight razor and combs on a towel

## Viewing locally

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## Deploying with GitHub Pages

1. Push this repo to GitHub (see below).
2. In Settings → Pages, set Source to "Deploy from a branch," branch `main`, folder `/ (root)`.
3. The landing page will be at `https://<username>.github.io/<repo-name>/`, with each version at `/v6-precise/` and `/v7-new-hero/`.

## Pushing to GitHub

This folder is already an initialized git repository with one commit.

```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```
