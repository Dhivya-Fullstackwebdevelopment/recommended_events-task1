SETUP (run once, then every time you work)

1) Start MongoDB (Compass should show a green dot on localhost:27017)

2) Backend
   cd backend
   npm install
   npm run seed      (optional: loads data/*.json into MongoDB; the server also does this by itself when collections are empty)
   npm run dev       -> http://localhost:8000

3) Frontend (new terminal)
   cd frontend
   npm install
   npm run dev       -> http://localhost:5173
