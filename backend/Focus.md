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
   ├─ 📄 parser.js (47 lines) - JavaScript file for client-side functionality
   ├─ 📄 server.js (95 lines) - JavaScript file for client-side functionality
   ├─ 📄 storage.js (23 lines) - JavaScript file for client-side functionality
   ├─ 📄 test-parser.js (130 lines) - JavaScript file for client-side functionality
   ├─ 📁 config
   │  └─ 📄 database.js (142 lines) - JavaScript file for client-side functionality
   ├─ 📁 controllers
   │  └─ 📄 signalController.js (144 lines) - JavaScript file for client-side functionality
   ├─ 📁 middleware
   │  ├─ 📄 auth.js (44 lines) - JavaScript file for client-side functionality
   │  └─ 📄 error.js (28 lines) - JavaScript file for client-side functionality
   ├─ 📁 routes
   │  ├─ 📄 auth.js (122 lines) - JavaScript file for client-side functionality
   │  ├─ 📄 signals.js (267 lines) - JavaScript file for client-side functionality
   │  └─ 📄 users.js (134 lines) - JavaScript file for client-side functionality
   └─ 📁 services
      └─ 📁 mql5
         ├─ 📄 MQL5Service.js (276 lines) - JavaScript file for client-side functionality
         ├─ 📄 demo.js (96 lines) - JavaScript file for client-side functionality
         └─ 📄 index.js (12 lines) - JavaScript file for client-side functionality

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

`src\services\mql5\demo.js` (96 lines)
Functions:
- MQL5Service
- error
- getSignalData
- join
- log
- mkdir
- runDemo

`src\middleware\error.js` (28 lines)
Functions:
- error
- errorHandler
- json

`src\services\mql5\MQL5Service.js` (276 lines)
Functions:
- Error
- FastHtmlCleaner
- MQL5Fetcher
- MQL5Parser
- SimpleHtmlParser
- _advancedParsing
- _fastParsing
- _mergeConfig
- _normalParsing
- clean
- clearCache
- constructor
- createLogger
- debug
- emit
- error
- fetchPage
- getSignalData
- info
- load
- now
- parseSignal
- setParsingMode
- super
- validateSignalUrl
- warn

`src\parser.js` (47 lines)
Functions:
- Error
- MQL5Service
- constructor
- error
- getSignalData
- log
- parseSignal
- validateSignalUrl

`src\server.js` (95 lines)
Functions:
- MQL5Service
- callback
- config
- error
- exit
- express
- function
- getSignalData
- json
- log
- origin
- push
- use

`src\controllers\signalController.js` (144 lines)
Functions:
- MQL5Service
- connect
- deleteSignal
- error
- getSignalData
- json
- parseAndSaveSignal
- parseSignal
- query
- release
- updateSignalData

`src\routes\signals.js` (267 lines)
Functions:
- Error
- MQL5Service
- Router
- connect
- delete
- error
- getSignalData
- json
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

`src\test-parser.js` (130 lines)
Functions:
- MQL5Parser
- _renderPage
- createLogger
- error
- exit
- info
- process
- readFile
- runTests
- testHtmlCleaner
- testMql5Parser

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
**Files:** 14  |  **Lines:** 1,560

## 📁 File Distribution
- .js: 14 files (1,560 lines)

*Updated: April 09, 2025 at 07:37 PM*