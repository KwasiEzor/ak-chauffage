# Improvement Plan

This plan captures the first remediation pass after the professional code review.

## Immediate Fixes

1. Repair the production startup path so `npm start` runs a valid server entrypoint.
2. Fix PostgreSQL insert handling so created records return IDs reliably.
3. Align admin authentication with the migrated `admins.active` column.
4. Route all frontend mutations through shared auth/CSRF helpers.
5. Fix broken route contracts for contact export, media upload, and legal-page admin loading.

## Next Pass

1. Add integration coverage for login, contact submission, media upload, contact export, and invoice creation.
2. Reduce admin bundle size with route-level/code-level splitting.
3. Move mutable runtime data out of git-tracked files and document persistence strategy.
4. Tighten deployment docs and environment validation to match the actual runtime.
