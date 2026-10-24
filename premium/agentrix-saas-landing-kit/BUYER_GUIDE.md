# Agentrix SaaS Landing Kit | Buyer access guide

**Two editable SaaS landing-page designs:** Atlas Analytics and Fieldnote CRM.

**Product state:** Private launch preview. This guide describes the planned customer delivery process; there is **no active production checkout** at this time.

## What you receive

A downloadable ZIP archive containing:

- `templates/atlas/index.html`: dark analytics SaaS landing page
- `templates/fieldnote/index.html`: light CRM landing page
- `README.md`: setup and customization
- `LICENSE.txt`: commercial usage terms
- `docs/launch-checklist.md`: preparation for publishing

Both layouts include their own HTML, CSS and JavaScript. No hosted SaaS account, backend, lead capture or Stripe integration comes with the templates. Illustrative customer numbers and prices are fictional.

## How access works after launch

1. Complete the authorized **Agentrix** checkout once it is available.
2. **Copy and securely save the ZIP password** displayed on the payment-success confirmation screen. It is not published on GitHub or in this guide.
3. Download the publicly hosted, [password-protected ZIP](AGENTRIX_SaaS_Landing_Kit_ENCRYPTED_v0.1.1.zip).
4. On Windows, right-click the downloaded `.zip` and select **Extract All**; on macOS, open it with Archive Utility or a compatible ZIP extractor; on Linux, use a ZIP extractor supporting password-protected archives. Enter the password from the payment-success screen. If the system extractor doesn't prompt for it or reports unsupported encryption, use a reputable ZIP app that supports traditional password-protected ZIP files.
5. Open either template's `index.html` with your browser. Customize your branding, page copy, links and sample data before publishing a real website.

**Keep your original payment confirmation and password.** At launch, password recovery by email is not yet part of the delivery mechanism. Never share your password publicly.

## Verify the downloaded archive

The staged encrypted ZIP version **0.1.1** has this SHA-256 digest:

```
ab4761f751446eb69eb48625df687bc23874231a8993e8de15f3ff152c998136
```

On Windows PowerShell, run `Get-FileHash .\AGENTRIX_SaaS_Landing_Kit_ENCRYPTED_v0.1.1.zip -Algorithm SHA256`; on macOS or Linux, run `shasum -a 256 AGENTRIX_SaaS_Landing_Kit_ENCRYPTED_v0.1.1.zip` (or `sha256sum`). Compare the output to the value above. A mismatch means you should obtain a fresh file before using it.

## Need to know

- These are **frontend website templates**, not full working SaaS platforms.
- The password-protected ZIP uses compatibility-focused legacy ZIP encryption. It is an access gate for an initial low-volume launch, not a piracy-proof or modern AES-encrypted software license system.
- Reuse for your own and client websites is permitted as described in the included commercial license. Reselling the original template files as a template kit is not permitted.
- The optional [encrypted HTML unlock package](AGENTRIX_SaaS_Landing_Kit_LOCKED.html) is a technical alternative, but the ZIP above is the planned simpler customer delivery method.
- No live checkout is linked from this guide while delivery validation is incomplete.