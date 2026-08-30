-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('student', 'peer', 'counsellor', 'admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Student',
  contact_email text,
  phone text,
  allow_email_notifications boolean NOT NULL DEFAULT true,
  allow_sms_notifications boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- auto profile + default student role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, contact_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(COALESCE(NEW.email, 'Student'), '@', 1)),
    NEW.email
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- COUNSELLORS ---------------------------------------------------------
CREATE TYPE public.counsellor_kind AS ENUM ('professional', 'peer');

CREATE TABLE public.counsellors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  kind public.counsellor_kind NOT NULL,
  title text,
  qualifications text,
  focus_areas text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  bio text,
  session_fee_kes integer NOT NULL DEFAULT 0,
  supports_online boolean NOT NULL DEFAULT true,
  supports_in_person boolean NOT NULL DEFAULT true,
  is_approved boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.counsellors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.counsellors TO authenticated;
GRANT ALL ON public.counsellors TO service_role;
ALTER TABLE public.counsellors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can view approved counsellors" ON public.counsellors FOR SELECT TO anon, authenticated
  USING (is_approved AND is_active);
CREATE POLICY "admins manage counsellors" ON public.counsellors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counsellor_id uuid NOT NULL REFERENCES public.counsellors(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 50,
  is_booked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (counsellor_id, starts_at)
);
GRANT SELECT ON public.availability_slots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_slots TO authenticated;
GRANT ALL ON public.availability_slots TO service_role;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can view open slots" ON public.availability_slots FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.counsellors c WHERE c.id = counsellor_id AND c.is_approved AND c.is_active));
CREATE POLICY "admins manage slots" ON public.availability_slots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- APPOINTMENTS --------------------------------------------------------
CREATE TYPE public.appointment_status AS ENUM ('requested', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.session_format AS ENUM ('online', 'in_person');

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counsellor_id uuid NOT NULL REFERENCES public.counsellors(id) ON DELETE RESTRICT,
  slot_id uuid REFERENCES public.availability_slots(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 50,
  format public.session_format NOT NULL DEFAULT 'online',
  status public.appointment_status NOT NULL DEFAULT 'requested',
  student_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_my_counsellor_record(_counsellor_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.counsellors c WHERE c.id = _counsellor_id AND c.user_id = auth.uid());
$$;

CREATE POLICY "students read own appointments" ON public.appointments FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.is_my_counsellor_record(counsellor_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "students create own appointments" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "students update own appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR public.is_my_counsellor_record(counsellor_id) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (student_id = auth.uid() OR public.is_my_counsellor_record(counsellor_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER appointments_touch BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- keep slots in sync
CREATE OR REPLACE FUNCTION public.sync_slot_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slot_id IS NOT NULL THEN
      UPDATE public.availability_slots SET is_booked = true WHERE id = NEW.slot_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' AND OLD.slot_id IS NOT NULL THEN
      UPDATE public.availability_slots SET is_booked = false WHERE id = OLD.slot_id;
    END IF;
    IF NEW.slot_id IS DISTINCT FROM OLD.slot_id THEN
      IF OLD.slot_id IS NOT NULL THEN
        UPDATE public.availability_slots SET is_booked = false WHERE id = OLD.slot_id;
      END IF;
      IF NEW.slot_id IS NOT NULL AND NEW.status <> 'cancelled' THEN
        UPDATE public.availability_slots SET is_booked = true WHERE id = NEW.slot_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER appointments_slot_sync
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.sync_slot_booking();

-- SESSION NOTES -------------------------------------------------------
CREATE TABLE public.session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_notes TO authenticated;
GRANT ALL ON public.session_notes TO service_role;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "author only notes" ON public.session_notes FOR ALL TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

-- PAYMENTS ------------------------------------------------------------
CREATE TYPE public.payment_method AS ENUM ('mpesa', 'card', 'mobile_money', 'bank', 'sponsored', 'free');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'waived');

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_kes integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KES',
  method public.payment_method NOT NULL DEFAULT 'mpesa',
  status public.payment_status NOT NULL DEFAULT 'pending',
  reference text NOT NULL DEFAULT concat('WLW-', upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read own payments" ON public.payments FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "students create own payments" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "admins update payments" ON public.payments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER payments_touch BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistance_requests TO authenticated;
GRANT ALL ON public.assistance_requests TO service_role;
ALTER TABLE public.assistance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read own assistance" ON public.assistance_requests FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "students create own assistance" ON public.assistance_requests FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "admins update assistance" ON public.assistance_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- NOTIFICATIONS -------------------------------------------------------
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "own notifications insert" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- AUDIT LOGS ----------------------------------------------------------
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_appointment_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id)
  VALUES (auth.uid(), lower(TG_OP) || CASE WHEN TG_OP = 'UPDATE' THEN ':' || NEW.status::text ELSE '' END, 'appointment', NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER appointments_audit
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.log_appointment_change();

-- SEED ----------------------------------------------------------------
INSERT INTO public.counsellors (id, display_name, kind, title, qualifications, focus_areas, languages, bio, session_fee_kes, is_approved, is_active) VALUES
('11111111-1111-4111-8111-111111111111', 'Dr. Amina W.', 'professional', 'Clinical Psychologist', 'PhD Clinical Psychology, KCPA registered', ARRAY['Anxiety','Depression','Academic pressure'], ARRAY['English','Kiswahili'], 'Fifteen years supporting young adults through anxiety, low mood and exam stress.', 1500, true, true),
('22222222-2222-4222-8222-222222222222', 'Joseph K.', 'professional', 'Counselling Psychologist', 'MSc Counselling Psychology, KAPC member', ARRAY['Relationships','Grief','Burnout'], ARRAY['English','Kiswahili'], 'Warm, practical sessions focused on coping skills and recovery from loss.', 1200, true, true),
('33333333-3333-4333-8333-333333333333', 'Wanjiru M.', 'peer', 'Trained Peer Counsellor', 'Certified peer support training, supervised monthly', ARRAY['Homesickness','Study stress','Making friends'], ARRAY['English','Kiswahili'], 'Third-year student who listens without judgement. Not a licensed therapist.', 0, true, true),
('44444444-4444-4444-8444-444444444444', 'Brian O.', 'peer', 'Trained Peer Counsellor', 'Certified peer support training, supervised monthly', ARRAY['Money worries','Motivation','Social anxiety'], ARRAY['English','Sheng'], 'Here for a calm chat about anything weighing on you. Not a licensed therapist.', 0, true, true);

INSERT INTO public.availability_slots (counsellor_id, starts_at)
SELECT c.id, (date_trunc('day', now()) + (d || ' days')::interval + (h || ' hours')::interval)
FROM public.counsellors c
CROSS JOIN generate_series(1, 14) AS d
CROSS JOIN unnest(ARRAY[9, 11, 14, 16]) AS h
WHERE (d + h) % 3 <> 0
ON CONFLICT DO NOTHING;