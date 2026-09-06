# Complete Donations, Team Management, and Contact Actions

## What will be built

- Add a public **Donate** page with preset and custom amounts, donor details, one-time or monthly giving controls, KES M-Pesa and international card choices, clear payment states, and a receipt/reference confirmation.
- Add Donate links to the main navigation and footer so supporters can reach it easily.
- Upgrade the admin counsellor area into a **Team** tab showing total, professional, peer, approved, and active counts.
- Add a validated form for administrators to create professional or peer counsellors with their name, title, qualifications, focus areas, languages, session fee, session formats, and approval status.
- Keep the existing approval, activation, and availability controls working after a counsellor is added.
- Make the centre email, phone number, and WhatsApp details clickable and consistent across the footer, contact page, privacy page, and relevant help content.
- Remove decorative em dashes and dash-style list markers from visible copy, replacing them with clearer punctuation or proper list styling. Preserve meaningful hyphens, phone numbers, time/date ranges, and established scientific terms.

## Payments and email boundaries

- Reuse the existing M-Pesa donation and counselling payment flow and the existing card checkout/webhook groundwork.
- Keep card actions honest when no live card account is connected: users will see a clear unavailable message rather than a false success. Connecting a card account remains required before real card charges can be accepted.
- Keep current in-app admin alerts for new accounts, payment attempts, and donations.
- Transactional signup, booking-status, and admin emails remain pending until a verified sender domain is connected. The contact address will remain `support.campuswell@gmail.com`, but a Gmail address alone cannot serve as the verified sending domain.

## Technical details

- Create the `/donate` route with complete route metadata and wire it to the existing validated donation server function.
- Extend the current admin page with form state, validated database insertion, query refresh, count summaries, loading/empty/error states, and existing design-system controls.
- Correct the M-Pesa donation callback so it can reconcile donation records as well as counselling payments.
- Add monthly giving only where the active payment method can genuinely support recurrence; do not imply that M-Pesa STK creates an automatic subscription.
- Validate with build logs plus desktop/mobile browser checks of the Donate, Contact, and Admin experiences.
