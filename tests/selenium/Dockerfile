FROM node:20-slim

WORKDIR /work/tests/selenium

COPY tests/selenium/package.json ./
RUN npm install

COPY tests/selenium ./

CMD ["npm", "run", "test"]
