FROM node:krypton-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY ./ ./

EXPOSE 5173

CMD ["npx", "vite", "dev", "--host","0.0.0.0"]
