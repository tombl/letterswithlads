install:
    cd frontend && npm install
    cd backend && npm install

start-frontend:
    cd frontend && npx vite

build-frontend:
    cd frontend && npx vite build

start-backend:
    cd backend && npx nodemon -w dist dist

build-backend:
    cd backend && npx tsc

build: build-backend build-frontend

prod-backend $PORT="8080":
    cd backend && node dist

prod-frontend port="3000":
    cd frontend && serve -s dist -p {{port}}