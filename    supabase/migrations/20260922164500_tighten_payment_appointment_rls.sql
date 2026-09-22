-- Security fix: the original policies only checked `student_id = auth.uid()`
-- on INSERT/UPDATE for payments and appointments, without restricting which
-- values a client could set for `status` / `amount_kes`. That let a signed-in
-- student use the Supabase client directly (bypassing the app's own booking
-- and payment flows) to:
--   1. insert a `payments` row with status = 'paid' and a receipt of their
--      choosing, making a session look paid on their dashboard and in the
--      admin console without ever going through M-Pesa/Paystack;
--   2. insert a `payments` row with an arbitrary (lower) `amount_kes`,
--      then legitimately pay that tampered amount via the real M-Pesa/
--      Paystack flow, undercutting the counsellor's real session fee;
--   3. update their own `appointments` row straight to `status = 'confirmed'`,
--      skipping counsellor/admin approval entirely;
--   4. insert a `donations` row with status = 'paid' outright.
-- This migration closes all four by constraining what the client-writable
-- policies allow, while leaving admin/service-role/webhook paths untouched
-- (those already go through supabaseAdmin, which bypasses RLS).

-- PAYMENTS --------------------------------------------------------------
DROP POLICY IF EXISTS "students create own payments" ON public.payments;

CREATE POLICY "students create own payments" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND status = 'pending'
    AND appointment_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.counsellors c ON c.id = a.counsellor_id
      WHERE a.id = appointment_id
        AND a.student_id = auth.uid()
        AND c.session_fee_kes = amount_kes
    )
  );

-- APPOINTMENTS ------------------------------------------------------------
DROP POLICY IF EXISTS "students create own appointments" ON public.appointments;
DROP POLICY IF EXISTS "students update own appointments" ON public.appointments;

CREATE POLICY "students create own appointments" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND status = 'requested');

-- Students may only cancel their own appointment; they can no longer flip
-- it straight to 'confirmed' or 'completed' themselves.
CREATE POLICY "students cancel own appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid() AND status = 'cancelled');

-- Counsellors (for their own appointments) and admins keep full control.
CREATE POLICY "staff update appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (public.is_my_counsellor_record(counsellor_id) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_my_counsellor_record(counsellor_id) OR public.has_role(auth.uid(), 'admin'));

-- DONATIONS ---------------------------------------------------------------
DROP POLICY IF EXISTS "anyone can start a donation" ON public.donations;

CREATE POLICY "anyone can start a donation" ON public.donations
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');