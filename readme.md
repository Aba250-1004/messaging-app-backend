## Messaging App Backend
---

## Links
* Deployed App amc-messenger.surge.sh
* [Frontend Repo](https://github.com/Aba250-1004/messaging-app-frontend)

---

## Technology Used

* bcryptjs
* body-parser
* dotenv
* express
* jsonwebtoken
* mongoose

---

## General Approach

Blue Barracudas Boutique was created with a a simple online store in mind for users to sell and buy products.

* Brainstormed user stories, wireframes, and routes to have an idea of how the app will be built.
* Created RESTful routes in the backend.
* Created components and connected them to the database models.
* Displayed user and message data from backend onto frontend.
* Styled using Materialize.

---

## Setup
* fork and clone repo
* `npm i`

---

## Routes

#### Auth
* Sign Up - POST
* Login - POST
* Delete User - DELETE
* Change Email - PUT
* Change Username - PUT
* Change Password - PUT
* Change About - PUT
* Get Profile - GET

#### Message
* getConversation - GET
* createConversationWithNewMessage - POST
* sendMessageToExistingGroup - POST
* getUserConversations - GET

#### User
* Test All Access - GET
* Test User Access - GET
* Test Admin Access - GET

---
