# Database setup
1. Start MongoDB locally, or create a MongoDB Atlas cluster.
2. Set `MONGODB_URI` in `server/.env`.
3. Start the backend. Mongoose creates the `users`, `documents` and `activities` collections when the first records are inserted.
4. Use MongoDB Compass to connect to the same URI and inspect the `collabspace` database.

No fabricated seed users are included. Register test accounts through the application.
