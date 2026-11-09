CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  service text,
  customer_name text,
  customer_email text,
  customer_phone text,
  notes text,
  status text NOT NULL CHECK (status IN ('confirmed','blocked','cancelled')),
  created_at timestamptz DEFAULT now(),
  CHECK (status='blocked' OR (service IS NOT NULL AND customer_name IS NOT NULL AND customer_email IS NOT NULL AND customer_phone IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS one_occupant_per_slot ON appointments (booking_date,booking_time) WHERE status IN ('confirmed','blocked');
CREATE INDEX IF NOT EXISTS appointments_by_date ON appointments (booking_date,booking_time);
CREATE INDEX IF NOT EXISTS appointments_by_email ON appointments (customer_email,created_at);
CREATE TABLE IF NOT EXISTS login_attempts (fingerprint text PRIMARY KEY, attempts integer NOT NULL, first_attempt timestamptz NOT NULL, blocked_until timestamptz);
