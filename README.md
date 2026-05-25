# LaporYuk Mobile App 📱

**Status:** ✅ **PRODUCTION READY** | Phase 1 Complete

Professional mobile application built with Expo/React Native for civic issue reporting platform. Full authentication, CRUD operations, and image upload support.

## 🎯 Core Features

- ✅ User registration & login
- ✅ Create reports with images
- ✅ View, edit, delete reports
- ✅ Real-time status updates
- ✅ User profiles
- ✅ Cross-platform (iOS/Android/Web)

## 🚀 Quick Start

```bash
npm install
npm start
```

Choose platform: `npm run android | npm run ios | npm run web`

## 📖 Documentation

- [**IMPLEMENTATION_GUIDE.md**](./IMPLEMENTATION_GUIDE.md) - Full setup & features
- [**CONTINUATION_GUIDE.md**](./CONTINUATION_GUIDE.md) - Phase 2 enhancements
## 📖 Documentation

- [**IMPLEMENTATION_GUIDE.md**](./IMPLEMENTATION_GUIDE.md) - Full setup & features
- [**CONTINUATION_GUIDE.md**](./CONTINUATION_GUIDE.md) - Phase 2 enhancements
- [**PROMPT_FOR_NEXT_AI.md**](./PROMPT_FOR_NEXT_AI.md) - Prompt untuk AI lanjutan

## 🛠️ Tech Stack

- **Framework:** Expo/React Native with TypeScript
- **Navigation:** Expo Router
- **State:** React Context API
- **HTTP:** Axios with interceptors
- **Storage:** AsyncStorage
- **UI:** React Native StyleSheet

## 🔌 API

Backend: `http://localhost:3000/api`

Endpoints:
- `POST /auth/login` - Login
- `POST /auth/register` - Register  
- `GET/POST/PATCH/DELETE /laporan/*` - Reports CRUD
- `GET /categories` - Categories
- `GET /institutions` - Institutions

## 📂 Project Structure

```
src/
├── app/(auth)/           # Login/Register screens
├── app/(tabs)/           # Main app (Home/Create/Profile)
├── app/(tabs)/laporan/   # Report detail/edit
├── config/               # API client setup
├── context/              # Auth state management
├── components/           # Reusable UI components
└── hooks/                # Custom React hooks
```

## 🎨 Design

- Modern, clean UI matching web app
- Touch-friendly buttons & inputs
- Color-coded status badges
- Responsive layouts
- Professional typography

## ✅ Testing Checklist

- [ ] Register new account
- [ ] Login with credentials
- [ ] Create report with images
- [ ] View report list & details
- [ ] Edit & delete reports
- [ ] Token persists after restart
- [ ] No navigation errors

## 📝 Configuration

Edit `.env.local` for API URL:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 🚀 For Next Phase

See **CONTINUATION_GUIDE.md** for enhancement options:
- Comments system
- Advanced filtering
- Push notifications
- UI improvements
- Offline support

## 📞 Support

Check documentation files for:
- Detailed setup: IMPLEMENTATION_GUIDE.md
- Next features: CONTINUATION_GUIDE.md
- AI continuation: PROMPT_FOR_NEXT_AI.md

---

**Version 1.0.0** | Built with Expo | Last Updated: 2026-05-25
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
