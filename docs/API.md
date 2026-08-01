# Vantillu API Reference

Base URL: `/api/v1`

## Orders
- `POST /orders`: Place a new order. Requires `idempotency_key` in the JSON payload.
- `GET /orders`: List all orders (Admin only).
- `PUT /orders/<id>/status`: Update order status. Requires `version` for optimistic locking.

## Menu
- `GET /menu`: Fetch the menu (Cached for 60s in memory).
- `POST /admin/menu`: Create a new menu item.
- `PUT /admin/menu/<id>`: Update a menu item. Requires `version`.
- `DELETE /admin/menu/<id>`: Soft-delete a menu item.

## Reservations
- `POST /reservations`: Book a table. Uses `SELECT FOR UPDATE` to prevent double booking.
- `GET /reservations`: List reservations.
- `PUT /reservations/<id>/status`: Update reservation status. Requires `version`.

## Health
- `GET /health`: Shallow health check.
- `GET /health/ready`: Deep health check (tests database connection).
