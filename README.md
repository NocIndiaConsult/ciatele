# CiaTelecom Store

Single-company ecommerce storefront for ISP, Cable TV, Fiber, ONT and Modem products with direct WhatsApp inquiry.

## Included

- Customer-facing store page
- Separate vendor-only admin page
- Search, category filters and sorting
- One-click WhatsApp inquiry from every product card
- Booking form that opens a formatted WhatsApp message
- Vendor image upload from admin
- Render static deployment config

## Current WhatsApp number

Configured in [app.js](/C:/Users/LENOVO/Documents/cia%20tel/app.js):

```js
const WHATSAPP_NUMBER = "919238585559";
```

## Pages

- Customer store: `/index.html`
- Vendor admin: `/admin.html`

## Important note

Current admin product data is stored in browser storage.

That means:

- Added products appear instantly in the store
- They remain available in that browser on refresh
- For real multi-device admin after deployment, connect Supabase or Firebase

## Local preview

```powershell
python -m http.server 3001 --bind 0.0.0.0
```

Then open:

- `http://localhost:3001/index.html`
- `http://localhost:3001/admin.html`

## Render deployment

1. Push this project to GitHub.
2. Create a new `Static Site` on Render.
3. Connect the repository.
4. Render will detect [render.yaml](/C:/Users/LENOVO/Documents/cia%20tel/render.yaml).
5. Deploy.

