FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY src ./src
COPY uploads ./uploads
EXPOSE 4000
CMD ["npm", "start"]
