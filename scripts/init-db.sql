CREATE SCHEMA IF NOT EXISTS products;
CREATE SCHEMA IF NOT EXISTS orders;

GRANT ALL PRIVILEGES ON SCHEMA products TO ecommerce;
GRANT ALL PRIVILEGES ON SCHEMA orders TO ecommerce;

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'orders' AND table_name = 'order_statuses'
  ) THEN
    INSERT INTO orders.order_statuses (description, is_active, created_at, updated_at)
    SELECT 'pending', true, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM orders.order_statuses WHERE description = 'pending');

    INSERT INTO orders.order_statuses (description, is_active, created_at, updated_at)
    SELECT 'delivered', true, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM orders.order_statuses WHERE description = 'delivered');

    INSERT INTO orders.order_statuses (description, is_active, created_at, updated_at)
    SELECT 'cancelled', true, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM orders.order_statuses WHERE description = 'cancelled');
  END IF;
END
$$;
