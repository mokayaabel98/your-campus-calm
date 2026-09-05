REVOKE EXECUTE ON FUNCTION public.alert_admins_new_payment() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.alert_admins_new_donation() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.alert_admins_new_account() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_appointment_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_slot_booking() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_my_counsellor_record(uuid) FROM anon;