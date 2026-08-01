# Vantillu Database Schema

## Models

### Admin
Stores staff accounts.
- `id`: PK
- `username`, `email`: Unique
- `password_hash`: String
- `role`: Enum (Owner, Admin, Manager, Cashier, DeliveryBoy, KitchenStaff)
- `version`: Integer (Optimistic Locking)
- `is_deleted`: Boolean (Soft Delete)

### Order
Stores customer orders.
- `id`: PK
- `order_number`: Unique String (e.g. ORD-17224213-ABCD)
- `idempotency_key`: Unique String (UUID)
- `status`: String (Pending, Accepted, Preparing, Ready, Served, Completed, Cancelled)
- `payment_method`: String (COD, UPI)
- `transaction_id`: String (UPI Ref)
- `version`: Integer

### MenuItem
Stores the active menu.
- `id`: PK
- `name`: String
- `category`: String
- `price_small`: Float (nullable)
- `price_full`: Float
- `is_available`: Boolean
- `version`: Integer

### AuditLog
Immutable append-only table for tracking administrative actions.
- `id`: PK
- `user_id`: FK to Admin
- `action`: String (CREATE, UPDATE, DELETE)
- `target_table`: String
- `target_id`: String
- `old_value_json`: JSON
- `new_value_json`: JSON
