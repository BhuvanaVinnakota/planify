PLANIFY — Setup Instructions
============================

1. MYSQL SETUP
   - Open MySQL Workbench or terminal
   - Run: mysql -u root -p < schema.sql
   - This creates the database, tables, and sample data

2. UPDATE YOUR MYSQL PASSWORD
   - Open server.js
   - Find: password: '',
   - Change to your MySQL root password

3. INSTALL DEPENDENCIES
   - Open terminal in this folder
   - Run: npm install

4. START THE SERVER
   - Run: npm start
   - Open browser: http://localhost:3000

5. LOGIN
   - Email:    bhuvana@example.com
   - Password: password123

FILE STRUCTURE
==============
planify/
├── public/
│   ├── index.html       ← Login / Register page
│   ├── dashboard.html   ← Main dashboard (Today)
│   ├── upcoming.html    ← Pending tasks
│   ├── sticky.html      ← Sticky notes wall
│   ├── profile.html     ← User profile & stats
│   ├── script.js        ← Shared JS functions
│   ├── shared.css       ← Sidebar & layout styles
│   ├── index.css        ← Login page styles
│   ├── dashboard.css    ← Dashboard styles
│   ├── upcoming.css     ← Upcoming page styles
│   ├── sticky.css       ← Sticky wall styles
│   └── profile.css      ← Profile page styles
├── server.js            ← Node.js + Express + MySQL backend
├── schema.sql           ← MySQL database schema
├── package.json         ← Dependencies
└── README.txt           ← This file
