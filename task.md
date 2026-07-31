# Vantillu Resto Multi-Page Implementation Checklist

- [x] **Phase 1: Database & Context Setup**
  - [x] Write `frontend/data/menu.ts` containing the entire parsed menu catalog from the 5 menu cards
  - [x] Refactor `CartContext.tsx` to support portion variations (`Half` | `Full` | `Single`) as unique items in the cart

- [x] **Phase 2: Component Refinement**
  - [x] Refactor `FoodCard.tsx` to implement portion selector tags and the Blinkit-style add-to-cart counter
  - [x] Refactor `CartDrawer.tsx` to support and render portion choices in the checkout list
  - [x] Refactor `layout.tsx` to remove the floating sidebar and build an elegant, responsive top navbar (collapsing into a mobile menu)

- [x] **Phase 3: Route Creation (Next.js Multi-page)**
  - [x] Refactor `app/page.tsx` as the home/landing page (cinematic opener, hero 3D visualizer, Nizam Biryani spotlight, reviews, footer)
  - [x] Create `app/menu/page.tsx` as the dedicated full menu page with category tabs, search, sorting, and portion cards
  - [x] Create `app/reserve/page.tsx` as the table reservation form page
  - [x] Create `app/party/page.tsx` as the event catering inquiry form page
  - [x] Create `app/admin/page.tsx` as the secure login & live operations dashboard portal page

- [x] **Phase 4: Verification & Run**
  - [x] Run `npm run build` in `frontend/` to ensure everything typechecks and compiles properly
  - [x] Start backend and frontend local servers and perform end-to-end tests
  - [x] Update `walkthrough.md` report
