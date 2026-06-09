FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm install --workspace=frontend --workspace=backend

COPY frontend ./frontend
COPY backend ./backend

RUN npm run build -w frontend

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json ./
COPY backend/package.json ./backend/

RUN npm install --workspace=backend --omit=dev

COPY --from=build /app/frontend/dist ./frontend/dist
COPY backend ./backend

RUN mkdir -p /app/backend/data /app/backend/uploads

EXPOSE 3000

CMD ["node", "backend/src/index.js"]
