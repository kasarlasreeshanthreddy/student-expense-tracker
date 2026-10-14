# Student Expense Tracker — deployment-ready

Stack: React + Vite frontend, Java Spring Boot REST API, embedded H2 database.

## Local run
Backend terminal:
```powershell
cd backend
mvn spring-boot:run
```
Frontend terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## GitHub
Create a repository named `student-expense-tracker`, then from this project root:
```powershell
git init
git add .
git commit -m "Initial Student Expense Tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/student-expense-tracker.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username. If the repository already exists and has commits, follow GitHub's instructions or clone it first to avoid history conflicts.

## Vercel frontend
Import the GitHub repository in Vercel.
- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL` = your deployed backend base URL (for example `https://your-backend.onrender.com`, no `/api/expenses` suffix)
Redeploy after setting the environment variable.

## Render backend
Create a new Web Service from the same GitHub repository and choose Docker.
- Root Directory: `backend`
- Dockerfile path: `./Dockerfile`
- Environment variable `FRONTEND_URL` = your Vercel frontend URL (for example `https://your-project.vercel.app`)
- Environment variable `SPRING_DATASOURCE_URL` = `jdbc:h2:mem:expenses;DB_CLOSE_DELAY=-1`
- Environment variable `SPRING_DATASOURCE_USERNAME` = `sa`
- Environment variable `SPRING_DATASOURCE_PASSWORD` = leave empty if dashboard permits, otherwise set any value and also use that same value in the URL/config as appropriate.

Important: this H2 cloud configuration is in-memory. It is suitable for a quick college demo, but expense records reset whenever the backend restarts. For durable cloud storage, use a hosted persistent database and configure its JDBC URL/credentials instead.
