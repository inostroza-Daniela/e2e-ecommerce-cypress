FROM cypress/included:16.2.1

ENV CI=true

WORKDIR /e2e

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ENTRYPOINT ["npx", "cypress", "run"]
CMD ["--browser", "electron"]
