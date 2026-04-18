#Web app
#Author - Destiny Childress

##Overview

This is a full-stack web application built with an Express/SQLite backend and a React frontend. This site allows users to log in, register, create posts, send messages, manage friendships, and join groups.

##Features

* User login/registration
* Password change/reset
* View/edit user profile
* View/create posts
* Send/receive messages
* Add/manage friends
* Join/create groups

##Tech Stack

**Frontend**
* React
* Axios
* React Router

**Backend**
* Node.js
* Express
* SQLite
* JWT Authentication
* bcrypt

##Installation/Setup

###Clone repository

git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd web-app

###Start the backend

cd backend
npm install
npm run dev

Backend is on: http://localhost:3000

###Start the frontend

cd frontend
npm install
npm run dev

Frontend runs on: http://localhost:5173

##How to Use

* Register a new account
* Log in
* Navigate through the app:
  - Home page shows user info
  - Posts page for creating/viewing posts
  - Messages page for sending messages
  - Friends page manages friendships
  - Groups page for creating/joining groups
* Change password/reset password as needed
* Log out and back in to verify persistence

##API Notes

* All protected routes require JWT token
* Token stored in localStorage
* Axios automatically attaches token to requests

##Known Limitations

* Minimal UI styling, focusing on functionality
* No real-time messaging, manual refresh required currently
* No email verification for password reset as of now
