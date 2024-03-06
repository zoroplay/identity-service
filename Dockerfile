FROM node:18
RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY entrypoint.sh /app/entrypoint.sh
COPY . .

RUN npm install

RUN npm run proto:install
RUN npm run proto:install
RUN npm run proto:identity
RUN npm run proto:bonus

RUN chmod +x /app/entrypoint.sh

RUN npm run build
EXPOSE 80
EXPOSE 5000
ENTRYPOINT [ "/app/entrypoint.sh" ]
CMD ["npm", "start"]