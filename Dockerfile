FROM node:alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npx prisma generate
CMD ["node","app/index.js"]