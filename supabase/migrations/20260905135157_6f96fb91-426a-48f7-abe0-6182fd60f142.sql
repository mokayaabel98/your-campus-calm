CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text,
  donor_email text,
  tier text NOT NULL DEFAULT 'custom',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES',
  method text NOT NULL DEFAULT 'mpesa',
  status text NOT NULL DEFAULT 'pending',
  message text,
  phone text,
  reference text NOT NULL DEFAULT concat('WLD-', upper(substr(replace((gen_random_uuid())::text, '-', ''), 1, 10))),
  checkout_request_id text,
  receipt_number text,
  result_desc text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.donations TO authenticated;
GRANT INSERT ON public.donations TO anon;
GRANT ALL ON public.donations TO service_role;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can start a donation" ON public.donations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admins read donations" ON public.donations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update donations" ON public.donations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER donations_touch_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.notify_admins(_title text, _body text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.notifications (user_id, title, body)
  SELECT ur.user_id, _title, _body FROM public.user_roles ur WHERE ur.role = 'admin';
$$;

REVOKE ALL ON FUNCTION public.notify_admins(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_admins(text, text) TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION public.alert_admins_new_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_admins(
    'New payment attempt',
    concat('A student started a payment of KES ', NEW.amount_kes, ' (ref ', NEW.reference, ') via ', NEW.method, '.')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER payments_alert_admins
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.alert_admins_new_payment();

CREATE OR REPLACE FUNCTION public.alert_admins_new_donation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_admins(
    'New donation',
    concat(coalesce(NEW.donor_name, 'A supporter'), ' pledged ', NEW.currency, ' ', NEW.amount, ' (', NEW.tier, ', ref ', NEW.reference, ').')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER donations_alert_admins
  AFTER INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.alert_admins_new_donation();

CREATE OR REPLACE FUNCTION public.alert_admins_new_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_admins(
    'New student account',
    concat(coalesce(NEW.display_name, 'A student'), ' created an account.')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_alert_admins
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.alert_admins_new_account();

CREATE POLICY "admins insert counsellors" ON public.counsellors
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));