-- Signal Protocol registration IDs can exceed int32; store as bigint.

ALTER TABLE public.backend_devices
  ALTER COLUMN registration_id TYPE bigint;
