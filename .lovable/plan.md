
The user wants two things:
1. Add a global, non-intrusive "AI Assistant" launcher available on every page (floating action button style).
2. They will then test the /ai page end-to-end (this is a manual test for them, not for me).

So my plan focuses on point 1: a global AI launcher.

**Design approach:**
- A Floating Action Button (FAB) fixed bottom-right, visible on all pages.
- Uses the existing primary gradient (from-primary to-primary-glow) and Sparkles icon — coherent with the AIChat header.
- Small (size-12), with a subtle pulse/glow, tooltip on hover ("Chiedi a Vireo AI" / localized).
- On click → navigates to `/ai`.
- Hidden when already on `/ai` (avoid redundancy).
- Hidden on auth pages (login/signup/forgot/reset) to keep them clean.
- Only visible when user is logged in (since /ai requires auth).
- Mobile-friendly: positioned to not cover the bottom nav / important CTAs (bottom-4 right-4, with safe-area padding).
- Add localized labels in all 5 locale files.

**Files to create/edit:**
- Create `src/components/AIAssistantFAB.tsx` — the floating launcher.
- Edit `src/App.tsx` — mount the FAB once globally inside the Router so it appears on all routes.
- Edit `src/i18n/locales/{it,en,es,fr,de}.json` — add `ai.fab_label` and `ai.fab_tooltip` keys.

**Implementation sketch:**
```tsx
// AIAssistantFAB.tsx
- useAuth() → only render if user
- useLocation() → hide on /ai, /login, /signup, /forgot-password, /reset-password
- Tooltip wrapper from shadcn
- Link to /ai with fixed bottom-4 right-4 z-40
- size-12 rounded-full bg-gradient-to-br from-primary to-primary-glow
- Sparkles icon, subtle animate-pulse glow ring
```

No backend changes needed. The /ai testing portion is for the user to perform manually after this lands.

## Plan

### Add a global AI assistant launcher

**1. New component `src/components/AIAssistantFAB.tsx`**
- Floating circular button fixed at `bottom-4 right-4` (with safe-area padding for mobile), `z-40` so it stays above content but below modals/toasts.
- Visual: `size-12 rounded-full` with `bg-gradient-to-br from-primary to-primary-glow`, soft shadow + subtle glow ring, `Sparkles` icon in white.
- Hover: slight scale + tooltip "Chiedi a Vireo AI" (localized).
- Hidden when: user not logged in, current route is `/ai`, `/login`, `/signup`, `/forgot-password`, or `/reset-password`.
- Smooth fade/slide-in animation on mount.

**2. `src/App.tsx`**
- Mount `<AIAssistantFAB />` once inside the `<BrowserRouter>` (after `<Routes>`) so it overlays every page globally.

**3. Localization**
- Add `ai.fab_tooltip` ("Chiedi a Vireo AI" / "Ask Vireo AI" / ES / FR / DE) to all 5 locale JSON files.

### Why this is coherent and non-intrusive
- Reuses the same gradient + `Sparkles` icon already used in the AI Chat header → instant visual recognition.
- Fixed in the bottom-right corner — the conventional, expected location for assistant launchers.
- Auto-hides on the auth flow and on /ai itself to avoid clutter.
- Compact (48px) and respects the existing design tokens (no new colors).

### Testing (manual, after implementation)
The user will then:
- Open any page → see the floating sparkle button bottom-right.
- Click it → lands on `/ai`.
- Test the existing /ai flow as described (suggestions, streaming, voice, language switch, 10-msg quota).

