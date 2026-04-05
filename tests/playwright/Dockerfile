FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /work/tests/playwright

COPY tests/playwright/package.json ./
RUN npm install

COPY tests/playwright ./

CMD ["npm", "run", "test"]
