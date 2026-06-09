# Vercel + GCP (planned)

Terraform will provision:

- **Vercel project** — hosts the Vue frontend
- **Cloud Functions** — API backend (auth, memories, mixes)
- **Firestore** — database for users, memories, and mix metadata

## Status

Not implemented yet. Use `npm run design` locally to preview the UI with mock data.

## Planned layout

```
terraform/
├── vercel/          Vercel project + env vars
├── gcp/             Cloud Functions + Firestore
└── modules/         Shared modules
```
