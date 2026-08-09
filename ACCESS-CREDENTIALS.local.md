# Resusci-Time preview access credentials (LOCAL ONLY — do not commit or share publicly)

Generated for CDST working-group preview access. Passwords are not stored in the repo —
only SHA-256 hashes are in `src/accessControl.ts`.

| Username       | Password     | Intended use                          |
| -------------- | ------------ | ------------------------------------- |
| jon            | Rt-cysGl4c   | Developer (Jon Ostrowski)             |
| laurence       | Rt-Ks2TRME   | Service lead / working group          |
| reviewer       | Rt-efZ5GKs   | Clinical reviewer                     |
| workinggroup   | Rt-FhKkFRc   | Shared working-group account          |

Notes:
- Required on **preview** builds only (session until the browser tab is closed).
- Client-side gate on static hosting — slows casual access; not full server auth.
- Rotate passwords by regenerating hashes in `src/accessControl.ts` if shared widely.
