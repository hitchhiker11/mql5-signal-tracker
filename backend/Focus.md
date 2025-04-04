# Project Focus: backend

**Current Goal:** Project directory structure and information

**Project Context:**
Type: Language: javascript
Target Users: Users of backend
Main Functionality: Project directory structure and information
Key Requirements:
- Type: JavaScript/Node.js Project
- Language: javascript
- Framework: express
- File and directory tracking
- Automatic updates

**Development Guidelines:**
- Keep code modular and reusable
- Follow best practices for the project type
- Maintain clean separation of concerns

# 📁 Project Structure
└─ 📁 src
   ├─ 📄 parser.js (143 lines) - JavaScript file for client-side functionality
   ├─ 📄 server.js (94 lines) - JavaScript file for client-side functionality
   ├─ 📄 storage.js (23 lines) - JavaScript file for client-side functionality
   ├─ 📁 config
   │  └─ 📄 database.js (142 lines) - JavaScript file for client-side functionality
   ├─ 📁 controllers
   │  └─ 📄 signalController.js (201 lines) - JavaScript file for client-side functionality
   ├─ 📁 middleware
   │  ├─ 📄 auth.js (44 lines) - JavaScript file for client-side functionality
   │  └─ 📄 error.js (28 lines) - JavaScript file for client-side functionality
   └─ 📁 routes
      ├─ 📄 auth.js (122 lines) - JavaScript file for client-side functionality
      ├─ 📄 signals.js (265 lines) - JavaScript file for client-side functionality
      └─ 📄 users.js (134 lines) - JavaScript file for client-side functionality

# 🔍 Key Files with Methods

`src\middleware\auth.js` (44 lines)
Functions:
- error
- isAdmin
- json
- query
- verify
- verifyToken

`src\routes\auth.js` (122 lines)
Functions:
- Router
- compare
- error
- hash
- json
- query
- sign

`src\config\database.js` (142 lines)
Functions:
- Pool
- config
- connect
- error
- exit
- hash
- initDatabase
- log
- query
- release
- update_updated_at_column

`src\middleware\error.js` (28 lines)
Functions:
- error
- errorHandler
- json

`src\parser.js` (143 lines)
Functions:
- A
- Error
- constructor
- error
- load
- parseAuthorSignals
- parseDistribution
- parseGeneralInfo
- parseStatistics
- parseTradeHistory
- push
- trim
- validateSignalUrl

`src\server.js` (94 lines)
Functions:
- MQL5Parser
- callback
- config
- error
- exit
- express
- function
- json
- log
- origin
- parseSignal
- push
- use

`src\controllers\signalController.js` (201 lines)
Functions:
- Error
- MQL5Parser
- connect
- deleteSignal
- error
- json
- parseAndSaveSignal
- parseSignal
- query
- release
- updateSignalData

`src\routes\signals.js` (265 lines)
Functions:
- Error
- MQL5Parser
- Router
- connect
- delete
- error
- json
- parseSignal
- post
- query
- release
- use

`src\storage.js` (23 lines)
Functions:
- Map
- Storage
- constructor
- getAllSignals
- getSignal
- saveSignal

`src\routes\users.js` (134 lines)
Functions:
- Router
- compare
- error
- hash
- json
- query
- use

# 📊 Project Overview
**Files:** 10  |  **Lines:** 1,196

## 📁 File Distribution
- .js: 10 files (1,196 lines)

*Updated: April 04, 2025 at 05:37 PM*