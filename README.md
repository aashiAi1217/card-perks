# Perks 💳

A checklist for every credit and perk on your cards, so nothing expires unused.

Cards covered (benefits as of October 2026): Amex Platinum, Chase Sapphire Reserve, Amex Gold,
Chase Freedom Unlimited, Bilt Blue.

- **Month / Quarter / Half-year / Year / Setup** tabs show the perks that reset on that cadence,
  the current period, days left, and dollars left to capture.
- **Ending soon** surfaces anything unused that resets within 10 days, across all cadences.
- Tap the circle to mark a perk used. Tap the row for the how-to, partial-amount tracking
  (for big credits like the $300 travel credit), and a "hide, not for me" button.
- **Cards** tab: fee math for the year (credits captured vs. annual fee), earning rates,
  the account-anniversary month for the Sapphire Reserve travel credit, and hidden perks.
- **Which card?** tab: a cheat sheet for which card to use where, plus stacking tips.
- Confetti when a period hits 100%.

Data lives in localStorage. Back up / restore JSON from the `⋯` menu.

## Updating the benefits

Everything is in `src/data/cards.js`. Each perk has an `amount`, a `cadence`
(`monthly | quarterly | semiannual | annual | anniversary | once | ongoing`), merchants, a tip,
and an optional `expires` date. Perks past `expires` disappear automatically.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml` and publishes to
`https://aashiai1217.github.io/card-perks/`. First-time setup: `./publish.sh`.
