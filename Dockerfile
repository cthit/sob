FROM node:18-alpine
COPY . .
RUN yarn install --production
CMD ["node", "src/index.js"]
EXPOSE 3000