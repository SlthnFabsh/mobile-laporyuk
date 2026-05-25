# PROMPT untuk Lanjutkan Development Mobile App di AI Lain

Gunakan prompt ini jika Anda ingin melanjutkan pengembangan mobile app dengan AI assistant lain.

---

## 📌 FULL CONTEXT PROMPT

```
Saya memiliki project multi-platform LaporYuk:
- Backend: Express.js (port 3000/api) 
- Frontend (Web): Next.js (port 3001)
- Mobile: Expo/React Native (PHASE 1 COMPLETE ✅)

PROJECT MOBILE APP STATUS:
- Status: Phase 1 Complete - Production Ready
- Framework: Expo/React Native dengan TypeScript
- UI State: Fully styled and responsive
- API Integration: 100% connected to backend
- Auth: Token-based with AsyncStorage

✅ SUDAH SELESAI:
1. Login/Register screens dengan full validation
2. Laporan CRUD (Create, Read, Update, Delete)
3. Image upload (multiple files)
4. User profile & management
5. Navigation structure (tabs + stacks)
6. Reusable UI components
7. API client dengan interceptors
8. All backend endpoints connected

📁 FILE STRUCTURE:
- src/app/(auth)/ → Login/Register
- src/app/(tabs)/ → Home/Create/Profile  
- src/app/(tabs)/laporan/ → Detail/Edit
- src/config/api.ts → Axios client
- src/context/AuthContext.tsx → State
- src/components/ → Reusable UI
- src/hooks/ → Custom hooks

SAYA INGIN:
[MASUKKAN REQUIREMENT ANDA DI SINI]

DETAIL REQUIREMENT:
- Yang ingin ditambah: [FITUR]
- Prioritas: [High/Medium/Low]
- Design notes: [CATATAN DESIGN]
- Backend changes: [Apakah perlu endpoint baru?]

LATAR BELAKANG:
[KONTEKS TAMBAHAN JIKA ADA]

FILE DOKUMENTASI TERSEDIA:
- IMPLEMENTATION_GUIDE.md → Setup & feature details
- CONTINUATION_GUIDE.md → Phase 2 options
- MOBILE_APP_SUMMARY.md → Complete overview
```

---

## 🎯 TEMPLATE UNTUK BERBAGAI USE CASE

### Jika Ingin Tambah Comments
```
Saya ingin menambahkan sistem comments di mobile app.

Requirements:
- View comments on laporan detail screen
- Add new comment form
- Show comment author, time, content
- Delete comment if user is author
- Refresh comments after adding

Expected UI:
- Comments section below laporan description
- List of existing comments
- Input field at bottom to add comment

Backend: Sudah ada API /comments endpoints [yes/no]

Timeline: [Flexible/Urgent]
```

### Jika Ingin Tambah Filters
```
Saya ingin enhance laporan list dengan filtering.

Features:
- Filter by status (pending/approved/rejected)
- Search by title
- Sort options
- Date range filtering

Design: Similar dengan web app

Backend: Gunakan query params [confirmed]

Timeline: [When needed]
```

### Jika Ingin Tambah Notifications
```
Saya ingin push notifications untuk status updates.

Features:
- Notify when laporan status changes
- Notify on new comments
- Local notifications

Platform: Android/iOS/Both

Backend setup: [Yes/No]

Timeline: [ASAP/Later]
```

### Jika Ingin UI Polish
```
Mobile app sudah functional, saya ingin improve UX/UI.

Improvements:
- Dark mode support
- Loading animations
- Better error states
- Image caching
- Pull-to-refresh improvements

Brand colors: [Provide if different]

Animation style: [Subtle/Bold/None]
```

---

## 🗂️ QUICK FOLDER REFERENCE

Kalau AI bertanya file mana yang perlu diedit:

```
Untuk menambah fitur baru:

1. New Screen/Feature
   → Create di: src/app/(tabs)/[feature].tsx
   → Add navigation di: src/app/(tabs)/_layout.tsx

2. API Call
   → Use: src/config/api.ts
   → Handle error & loading state

3. New Component
   → Create di: src/components/[Component].tsx
   → Export & reuse di screens

4. New State/Logic
   → Create hook di: src/hooks/use[Feature].ts
   → Use di component dengan: const { ... } = useFeature()

5. API Client Config
   → Edit: src/config/api.ts untuk middleware
   → Edit: .env.local untuk URL

6. Auth Logic
   → Edit: src/context/AuthContext.tsx
   → Use di screen dengan: const { ... } = useAuth()
```

---

## 🚨 IMPORTANT INFO UNTUK AI

**Platform:** Expo/React Native
- Testing: npm start → pilih platform (android/ios/web)
- Build: expo build-android atau build-ios
- Dependencies: Use npm atau yarn (tidak pod install untuk iOS)

**TypeScript:** Project sudah fully typed, maintain konsistensi

**Color Scheme:** 
- Primary: #3B82F6 (Blue)
- Success: #10B981, Danger: #EF4444
- Background: #F8FAFC

**Navigation:**
- Menggunakan Expo Router
- Auth flow: /app/_layout.tsx
- Protected routes: Auth context check
- Tabs: /app/(tabs)/_layout.tsx

**API:**
- Backend: http://localhost:3000/api
- Config: .env.local (EXPO_PUBLIC_API_URL)
- Client: axios dengan token interceptor
- Images: FormData multipart

**Styling:**
- React Native StyleSheet
- Responsive: Gunakan Dimensions atau percentages
- Icons: react-native-heroicons (solid)

---

## ✅ CHECKLIST SEBELUM MINTA AI

Pastikan Anda siap dengan:

- [ ] Deskripsi jelas tentang apa yang ingin ditambahkan
- [ ] Design mockup atau referensi (jika ada)
- [ ] Apakah butuh API endpoint baru?
- [ ] Prioritas dan timeline
- [ ] Platform target (Android/iOS/Web)
- [ ] Integrasi dengan existing features?

---

## 🎓 TIPS UNTUK AI YANG BAIK

Ketika memberikan prompt:

1. **Spesifik** - Jangan vague, describe dengan detail
2. **Context** - Jelaskan bagaimana fitur fit dengan app
3. **Design** - Reference existing UI atau provide mockup
4. **Backend** - Confirm apakah API endpoints sudah ada
5. **Testing** - Define testing criteria

---

## 📞 NEXT AI COMMAND EXAMPLES

```
"Saya punya mobile app Lapor…yuk yang sudah phase 1 done. 
Saya mau tambah comments feature ke laporan detail screen. 
Backend sudah siap dengan /comments endpoints. 
Tolong implement sesuai design web app yang sudah ada. 
Jangan forget image untuk comment author."

"Phase 1 mobile app LaporYuk complete. Skrang saya butuh:
1. Filter by status (pending/approved/rejected)
2. Search functionality
3. Sort options
Implement di home.tsx dengan sama UI pattern. 
API supports query params."

"Mobile app berjalan baik. User request dark mode + animations.
Tolong add dark mode support + loading animations.
Keep consistency dengan light mode design.
Reference: Tailwind dark: prefix pattern."
```

---

## 🎯 SUMMARY UNTUK AI SELANJUTNYA

**Say This:**
> "Project LaporYuk mobile app Phase 1 complete. Codebase clean, TypeScript strong typing, semua core features working. Saya mau [REQUEST]. Dapat guidance/reference dari CONTINUATION_GUIDE.md dan code existing sudah well-structured. Just extend following patterns yang ada."

**And Provide:**
1. Specific requirements
2. Design references if available
3. Timeline
4. Backend API status

---

**Template ini dibuat: 2026-05-25**
**Mobile App Status: ✅ Production Ready**
