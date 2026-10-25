# Purple website

Static site built with Jekyll. GitHub Pages builds it for you: no software to install.

## Publish on GitHub Pages

1. Create a new repository on GitHub and upload everything in this folder (keep the folder structure; include the files starting with `_` and `.gitignore`).
2. In the repository go to **Settings → Pages**. Under "Build and deployment" choose **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
3. After a minute or two the site is live at the address shown on that page.
4. If the address is `https://USERNAME.github.io/REPO-NAME/`, open `_config.yml` and set `baseurl: "/REPO-NAME"`. If you use your own domain, leave `baseurl` empty and add the domain in Settings → Pages.

## Where things live

| To change… | Edit |
|---|---|
| Links for manifesto PDF, donations, join form, comment form, imprint | `_config.yml` |
| The 12 policy areas | `_themes/*.md` ("What we stand for" statement goes in the body, below the `---`) |
| A policy | `_policies/<area>/<policy>.md` (summary at the top, full text below the `---`) |
| A bill (Parts, clauses, schedules) | `_bills/*.md` (explanatory notes go below the `---`) |
| Speeches & Writing list | `_data/writing.yml` |
| Donation figures and donors over £1,000 | `_data/donations.yml` (set `example: false` once real) |
| Home, About, Donate, Join, Privacy pages | `index.html`, `about.html`, `donate.html`, `join.html`, `privacy.html` |
| Colours, fonts, layout | `assets/css/style.css` |

### Add a policy
Copy an existing file in `_policies/`, give it a new `key`, set `theme` to the area's key (e.g. `money`), and list any bills by key. It appears automatically on the area page, the Policies page, search and any linked bill.

### Full policy papers
Upload the paper to `assets/papers/<policy-key>.pdf` and uncomment the `paper:` line at the top of the policy file. Until then the policy page says the paper is being prepared.

### Add a bill
Copy `_bills/tax-bill.md`, give it a new `key`, list the policies it delivers, and fill in `parts`. Clauses can be just a title, or a title plus `text:` once drafted.

### Photos and video
Put images in `assets/img/`. On a policy, uncomment `image:` / `video:` at the top of its file. For the home page photo, see the comment in `index.html`.

## Before launch
- Upload `assets/purple-manifesto.pdf` and `assets/purple-constitution.pdf`.
- Replace everything shown in pale lilac `[brackets]`, including the "What we stand for" statement on each of the 12 area pages.
- Privacy notice: legal review.
- Imprint in `_config.yml`: real name and address.
- Set `comment_form_endpoint`, `join_form_url` and `donate_url`. Until then those buttons show a "coming soon" message.
