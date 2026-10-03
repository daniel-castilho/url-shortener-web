# Assistive Technology Test Evidence (Epic 14.20)

**Status:** Template — awaiting manual NVDA/VoiceOver runs  
**Required per Epic 14.20:** Real AT test runs on stable + authenticated routes  
**Coverage:** NVDA (Windows/Chrome) + VoiceOver (macOS/Safari)  
**Reviewer:** [Name]  
**Date:** [YYYY-MM-DD]

---

## Test Matrix

| Route | State | NVDA (Win/Chrome) | VoiceOver (macOS/Safari) | Findings | Remediation |
|-------|-------|-------------------|--------------------------|----------|-------------|
| `/login` | Anonymous | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/login` | Invalid creds (401) | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/login` | Blocked account (403) | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/` | Anonymous (shorten form) | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/` | Authenticated (shorten form) | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/` | Success (short URL shown) | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/` | Error (400/429/5xx) | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/links` | Empty state | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/links` | List + pagination | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/links/:id` | Detail view | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/links/:id` | Edit mode | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/links/:id` | Archive confirm dialog | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/admin/users` | Admin list + actions | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |
| `/admin/users/:id/links` | User links + force-archive | ☐ Pass / ☐ Fail | ☐ Pass / ☐ Fail | | |

---

## Checklist per Route/State

### Keyboard Navigation
- [ ] Tab/Shift+Tab moves focus in logical order (left-to-right, top-to-bottom)
- [ ] Focus indicator visible on all interactive elements
- [ ] No keyboard traps (except modal dialogs)
- [ ] All primary actions reachable via keyboard (Enter/Space on buttons, links)
- [ ] Skip links present if needed (not required for this SPA)

### Focus Management
- [ ] Modal dialogs (Radix Dialog): focus moves to dialog on open
- [ ] Focus trapped within dialog (Tab cycles inside)
- [ ] Escape closes dialog and returns focus to trigger
- [ ] Dialog close (X/Cancel) returns focus to trigger
- [ ] Page-level focus not lost after route navigation

### Screen Reader Announcements
- [ ] Page title announced on load
- [ ] Main landmarks present (`<main>`, `<nav>`, `<header>`)
- [ ] Form labels associated (`<label for>` or `aria-label`)
- [ ] Error messages announced (prefer `aria-live="polite"` or `role="alert"`)
- [ ] Success/toast messages announced
- [ ] Dynamic content changes announced (list updates, pagination)
- [ ] Button/link accessible names clear (no "Click here", "Read more")

### Semantic Structure
- [ ] Heading hierarchy (h1 → h2 → h3) logical
- [ ] Lists use `<ul>`/`<ol>`/`<li>`
- [ ] Tables (if any) have headers and scope
- [ ] ARIA roles only where native HTML insufficient

### Forms
- [ ] Required fields announced (`aria-required` or required attr)
- [ ] Invalid fields announced (`aria-invalid` + error message)
- [ ] Error messages linked to inputs (`aria-describedby`)
- [ ] Autocomplete attributes where appropriate

---

## NVDA Test Log (Windows 10/11 + Chrome)

**Tester:** [Name]  
**Date:** [YYYY-MM-DD]  
**NVDA Version:** [e.g., 2024.1]  
**Chrome Version:** [e.g., 128.x]  

| Route/State | Observation | Severity (Critical/Major/Minor) | Action |
|-------------|-------------|----------------------------------|--------|
| | | | |

---

## VoiceOver Test Log (macOS + Safari)

**Tester:** [Name]  
**Date:** [YYYY-MM-DD]  
**macOS Version:** [e.g., 14.6]  
**Safari Version:** [e.g., 17.5]  

| Route/State | Observation | Severity (Critical/Major/Minor) | Action |
|-------------|-------------|----------------------------------|--------|
| | | | |

---

## Known Gaps / Accepted Exceptions

| Route/State | Gap Description | Reason | Owner | Target Date |
|-------------|-----------------|--------|-------|-------------|
| | | | | |

---

## Sign-off

**NVDA Reviewer:** _________________________ **Date:** _______________  
**VoiceOver Reviewer:** _________________________ **Date:** _______________  
**Owner Approval:** _________________________ **Date:** _______________
