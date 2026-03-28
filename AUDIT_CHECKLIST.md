# Pitchside Professional Audit — Implementation Checklist

## PART 1 — DESIGN SYSTEM ✅
- [x] Color palette enforced (--bg, --bg2-4, --acc, red/amber, --txt-txt3, --bdr-bdr2)
- [x] Typography (DM Sans primary, Bebas Neue headings)
- [x] Spacing scale (4px base)
- [x] Border radius and shadows
- [x] Button component styles (primary/secondary/ghost/danger)
- [x] Card and input components

## PART 2 — NAVIGATION ✅
- [x] Desktop top nav (logo, tabs, user menu)
- [x] Mobile bottom nav (4 tabs + safe area)
- [x] AppNav integrated into board/playbook/pressing

## PART 3 — TACTICS BOARD 🚧
- [ ] Pitch aspect ratio locked (CSS aspect-ratio: 145/90)
- [ ] Player circles (home #00e07a, away #f59e0b)
- [ ] Player position labels below circles
- [ ] Player name tooltips on hover
- [ ] Squad name panel (edit names, persists in plays)
- [ ] Mode selector (Move/Draw/Ink)
- [ ] Run drawing with bezier curves
- [ ] Training items placement
- [ ] Zone highlighting
- [ ] Text labels
- [ ] Animation system
- [ ] Phase system
- [ ] Complete toolbar

## PART 4 — SAVE AND LOAD
- [ ] Save modal
- [ ] Playbook grid with filters
- [ ] Load/Duplicate/Delete

## PART 5 — PRESSING SYSTEM
- [x] Already built (verify all 5 steps work)

## PART 6 — LEGAL & COMPLIANCE
- [ ] /privacy page
- [ ] /terms page
- [ ] Footer on all pages
- [ ] Cookie consent
- [ ] Age confirmation on register
- [ ] Proper naming (no "GAA", use "Gaelic Football")
- [ ] Copyright notice

## PART 7 — LANDING PAGE
- [ ] Hero section
- [ ] Features grid (6 items)
- [ ] Pricing cards (Free/Pro/Club/County)
- [ ] Testimonials
- [ ] Professional footer

## PART 8 — AUTH PAGES
- [ ] Login page redesign
- [ ] Register page with age check
- [ ] Password reset

## PART 9 — PERFORMANCE
- [ ] npm run build: 0 errors
- [ ] Canvas memory management
- [ ] RLS policies on Supabase
- [ ] Service worker caching

## PART 10 — MOBILE UX
- [ ] 12px+ player circles
- [ ] Touch drag accuracy
- [ ] Bottom sheet sidebar on mobile
- [ ] Modal responsive on small screens

## PART 11 — FINAL PUSH
- [ ] All builds passing
- [ ] Lighthouse > 80
- [ ] Real phone testing
- [ ] GitHub push

---

## CRITICAL PATH (Priority Order)
1. Squad name panel + persist names ← DO NEXT
2. Canvas aspect ratio locking
3. Player tooltips and badges
4. Legal pages + footer
5. Landing page
6. Auth pages UX
7. Mobile testing
