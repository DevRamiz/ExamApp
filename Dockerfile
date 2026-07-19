FROM node:22-alpine AS client-build
WORKDIR /client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/src ./src
COPY --from=client-build /client/dist /app/public
ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && npm start"]
