# Project Focus: frontend

**Current Goal:** Project directory structure and information

**Project Context:**
Type: Language: javascript
Target Users: Users of frontend
Main Functionality: Project directory structure and information
Key Requirements:
- Type: JavaScript/Node.js Project
- Language: javascript
- Framework: react
- File and directory tracking
- Automatic updates

**Development Guidelines:**
- Keep code modular and reusable
- Follow best practices for the project type
- Maintain clean separation of concerns

# 📁 Project Structure
├─ 📄 vite.config.js (54 lines) - JavaScript file for client-side functionality
└─ 📁 src
   ├─ 📄 theme.js (48 lines) - JavaScript file for client-side functionality
   ├─ 📁 auth
   │  └─ 📄 useAuth.js (10 lines) - JavaScript file for client-side functionality
   ├─ 📁 hooks
   │  ├─ 📄 useResponsive.js (25 lines) - JavaScript file for client-side functionality
   │  ├─ 📄 useSettings.js (12 lines) - JavaScript file for client-side functionality
   │  └─ 📄 useWidth.js (30 lines) - JavaScript file for client-side functionality
   ├─ 📁 services
   │  ├─ 📄 axios.js (43 lines) - JavaScript file for client-side functionality
   │  ├─ 📄 localStorage.js (28 lines) - JavaScript file for client-side functionality
   │  └─ 📁 api
   │     ├─ 📄 admin.js (46 lines) - JavaScript file for client-side functionality
   │     ├─ 📄 auth.js (33 lines) - JavaScript file for client-side functionality
   │     ├─ 📄 signal.js (57 lines) - JavaScript file for client-side functionality
   │     └─ 📄 user.js (28 lines) - JavaScript file for client-side functionality
   ├─ 📁 theme
   │  ├─ 📄 index.js (22 lines) - JavaScript file for client-side functionality
   │  ├─ 📄 palette.js (21 lines) - JavaScript file for client-side functionality
   │  ├─ 📄 shadows.js (8 lines) - JavaScript file for client-side functionality
   │  └─ 📄 typography.js (17 lines) - JavaScript file for client-side functionality
   └─ 📁 utils
      ├─ 📄 formatDate.js (17 lines) - JavaScript file for client-side functionality
      ├─ 📄 formatNumber.js (18 lines) - JavaScript file for client-side functionality
      └─ 📄 validate.js (19 lines) - JavaScript file for client-side functionality

# 🔍 Key Files with Methods

`src\services\api\admin.js` (46 lines)
Functions:
- delete
- patch
- post
- put

`src\services\api\auth.js` (33 lines)
Functions:
- post

`src\services\axios.js` (43 lines)
Functions:
- create
- getItem
- log
- reject
- removeItem

`src\utils\formatDate.js` (17 lines)
Functions:
- floor
- formatDate
- formatDuration

`src\utils\formatNumber.js` (18 lines)
Functions:
- fCurrency
- fNumber
- fPercent
- format

`src\theme\index.js` (22 lines)
Functions:
- createTheme

`src\services\localStorage.js` (28 lines)
Functions:
- getItem
- parse
- removeItem

`src\services\api\signal.js` (57 lines)
Functions:
- delete
- post
- put

`src\theme.js` (48 lines)
Functions:
- createTheme

`src\auth\useAuth.js` (10 lines)
Functions:
- Error
- useAuth
- useContext

`src\services\api\user.js` (28 lines)
Functions:
- delete
- put

`src\hooks\useResponsive.js` (25 lines)
Functions:
- useResponsive
- useTheme

`src\hooks\useSettings.js` (12 lines)
Functions:
- Error
- useContext
- useSettings

`src\hooks\useWidth.js` (30 lines)
Functions:
- addEventListener
- handleResize
- removeEventListener
- setWidth
- useState
- useTheme
- useWidth

`src\utils\validate.js` (19 lines)
Functions:
- test

# 📊 Project Overview
**Files:** 19  |  **Lines:** 536

## 📁 File Distribution
- .js: 19 files (536 lines)

*Updated: April 04, 2025 at 05:37 PM*