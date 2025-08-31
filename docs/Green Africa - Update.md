# **GreenAfrica Ecosystem Overview** 

## **1\) What GreenAfrica does — in one minute**

GreenAfrica turns plastic bottle recycling into instant rewards. People drop PEP bottles into a **reverse vending machine** (a smart bin with a camera and sensors). A companion **web app** tracks each person’s impact and lets them redeem rewards like airtime or data. Hosts (schools, malls, estates, events) get a visible, turnkey sustainability program with transparent impact stats.

## **2\) The ecosystem at a glance**

Person → Mobile App (creates Green ID)  
      ↘ scan/enter Green ID on the machine’s tablet  
Reverse vending machine (camera \+ sensors) → records short clips while bottles are dropped  
        ↘ AI verification service counts/validates PEP  
              ↘ Green Points added to the person’s wallet  
                    ↘ Redeem for airtime/data in the app  
                          ↘ Public impact stats (bottles, CO₂, locations)

**Why it works:** Fast onboarding, fun rewards, and visible impact build a repeat habit.

## **3\) Who it’s for**

* **Recyclers:** anyone with the mobile app (students, shoppers, tenants of complex apartments).

* **Hosts:** locations that place a reverse vending machine (campuses, malls, estates, events, complexes).

* **Partners:** airtime/data providers; city and corporate sustainability teams.

## **4\) User web App — simple journey**

1. **Onboard**: download → verify phone/email → choose a username → app creates your **Green ID**.

2. **Recycle**: at a participating location, enter or scan your Green ID on the machine’s tablet to start a session.

3. **Drop bottles**: the camera records **30‑second segments** while you recycle; the app can notify you live.

4. **Verification**: AI confirms bottles are PEP and counts them.

5. **Rewards**: **Green Points** land in your wallet. Convert to **airtime** or **data** in a tap.

6. **Grow your impact**: track bottles, CO₂ saved, badges, and referrals that earn bonus points.

**web app screens (non‑exhaustive):**

* Onboarding • Register/Login • Verify Phone/Email • Set Username • Dashboard (Points, CO₂, Bottles, Cash Earned) • Green ID • Convert Points → Rewards • Refer & Earn • Badges/Levels • Notifications • Logout

## **5\) Tablet App on the reverse vending machine — session flow**

1. **Attract screen:** *“Enter Green ID or Register.”*

2. **No app yet?** Shows a QR code linking to the website/app stores to download the mobile app.

3. **Enter Green ID** → *“Welcome, {username}”*.

4. **Start**: tap **Start** (or auto‑start after a 5‑second countdown).

5. **Recording**: camera captures **30‑second clips** while bottles are deposited; a gentle beep ticks down the timer.

6. **Finish early?** Tap **Finish**. Need more time? Tap **Submit & Continue** to queue the last clip and start another 30‑second window.

7. **Idle safety**: if there’s no interaction for 10 seconds after a window ends, the tablet auto‑submits and ends the session.

8. **Result**: the system verifies submissions and shows *“Congrats\! \+XX points added.”* Then **auto‑logout**.

**Why clips?** Small chunks upload reliably on spotty networks and can be processed in parallel.

##  **6\) Website Landing Page**

•⁠  Be a ⁠Host Form

•⁠  ⁠Map (With markers)

•⁠  ⁠Location Dashboard (After clicking on the Marker)

•⁠  ⁠Hero (Device Video)

•⁠  ⁠Download App Store Icons

•⁠  ⁠Stats

## **6\) Rewards & game layer**

* **Green Points → Airtime/Data** (instant redemption in the app).

* **Badges & levels** for milestones (e.g., 50, 200, 500 bottles).

* **Refer & Earn**: share a link or code; both people get bonus points when the new user recycles.

## **7\) Host experience (schools, malls, estates, events)**

* **Request a device** via a simple form (or WhatsApp for first pilots).

* **We install** the reverse vending machine and tablet; provide a quick start kit.

* **Dashboard**: running totals (bottles, CO₂, active users), leaderboards, and a public map pin.

* **Stories**: photos and short clips for social posts and CSR reports.

## **8\) Trust, safety & fairness (plain language)**

* **PEP‑only**: AI checks that items are PEP bottles; non‑PEP is rejected.

* **Anti‑gaming**: weight/volume checks and duplicate detection reduce cheating.

* **Session limits**: short windows \+ auto‑logout prevent piggybacking on another user’s account.

* **Privacy**: video is used for validation and then managed according to policy; we don’t sell personal data.

## **9\) Light technical overview (non‑technical wording)**

**Main pieces:**

* **Web app** (Android/iOS): sign‑in, wallet, rewards, referrals, badges, and the Green ID.

* **Tablet app** on the machine: runs sessions, records 30‑second clips, queues uploads.

* **AI verification**: counts bottles and confirms material type from the clips.

* **Rewards service**: converts Green Points into airtime/data.

* **Impact ledger**: each deposit creates a tamper‑resistant record on chain; a simple dashboard rolls up stats.

**How a deposit is processed:**

1. Tablet finishes a 30‑second clip → uploads to the verification service.

2. AI returns **(is PEP? how many?)**.

3. Points are calculated → user’s wallet is credited → a public proof is recorded on chain.

4. The web app receives a push notification with the result.

**Works offline:** if the tablet is offline, clips and results **queue** and sync later; users still see points as soon as the machine reconnects.

## **10\) Data, privacy, and security (promises we keep)**

* **Personal data**: phone/email, username, and Green ID only for account and rewards; no location tracking by default.

* **Video**: used for verification and safety; retention kept minimal per policy; access is restricted.

* **Security**: encrypted transport and hardened tablets; automatic session logouts; admin access with audit trails.

## **11\) What success looks like (simple KPIs)**

* **Recycling**: bottles per day per location; unique recyclers per week.

* **Impact**: total PEP diverted (kg) and CO₂ saved (t).

* **Engagement**: repeat rate, referral rate, time‑to‑first‑redeem.

* **Reliability**: verification accuracy, upload success rate, and average processing time.

## **12\) Roadmap (plain view)**

* **Pilot**: a handful of locations; tighten the user flow; confirm AI accuracy; tweak rewards.

* **Scale**: add more locations, richer badges, brand partners, and a public impact map.

* **Community**: school competitions, estate leagues, and seasonal challenges.

## **13\) Glossary (no acronyms)**

* **Reverse vending machine**: the smart bin that accepts bottles and issues rewards.

* **Green ID**: your unique code to start a session at the machine.

* **Green Points**: the in‑app currency earned from verified deposits.

## **14\) Open questions (for the team to decide)**

* What are the minimum and maximum points per deposit window?

* Target video retention period?

* Redemption partners beyond airtime/data?

* Badging thresholds and seasons?

* Offline grace limits per location (e.g., queue size)?

