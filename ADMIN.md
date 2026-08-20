# Admin / Operations

The starter exposes authenticated admin endpoints under `/api/admin/*`.

Admin is granted when either:
- Better Auth user `role` is `admin`, or
- the signed-in email matches the `ADMIN_EMAIL` Worker secret/variable.

Endpoints:
- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/webhooks`
- `GET /api/admin/flags`
- `PUT /api/admin/flags/:key`

Build a product-specific admin UI only when needed. Keep these endpoints private and never expose admin state through client-provided role values.
