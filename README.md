# E2E E-commerce Test Suite · Cypress + Cucumber

[![E2E Tests](https://github.com/inostroza-Daniela/e2e-ecommerce-cypress/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/inostroza-Daniela/e2e-ecommerce-cypress/actions/workflows/e2e-tests.yml)
![Cypress](https://img.shields.io/badge/Cypress-16-17202C?logo=cypress&logoColor=white)
![Cucumber](https://img.shields.io/badge/BDD-Cucumber-23D96C?logo=cucumber&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

End-to-end UI tests for **[Swag Labs](https://www.saucedemo.com)**, the public e-commerce demo maintained by Sauce Labs. The suite covers the full purchase journey (login, catalog, cart and checkout), negative paths, responsive layout and visual regression, written as business-readable Gherkin scenarios on top of a Page Object Model.

## Why Swag Labs

- Its markup exposes stable `data-test` attributes, so selectors do not depend on CSS classes or DOM position.
- It ships purpose-built personas (locked out, slow, etc.) that make negative and resilience scenarios deterministic.
- It has a complete checkout with validations and tax calculation, which allows real business assertions instead of "page loaded" checks.
- Its source is public ([saucelabs/sample-app-web](https://github.com/saucelabs/sample-app-web)), so expected behaviour can be verified against the implementation.

## Stack

| Concern | Tool |
| --- | --- |
| Test runner | [Cypress](https://www.cypress.io) 16 (JavaScript) |
| BDD | [@badeball/cypress-cucumber-preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor) + esbuild |
| Design pattern | Page Object Model + custom commands |
| Reporting | [cypress-mochawesome-reporter](https://github.com/LironEr/cypress-mochawesome-reporter) with embedded failure screenshots |
| Visual regression | [@simonsmith/cypress-image-snapshot](https://github.com/simonsmith/cypress-image-snapshot) |
| Static analysis | ESLint + eslint-plugin-cypress |
| Containers | Docker (`cypress/included`) |
| CI/CD | GitHub Actions |

## Coverage

| Feature | Scenarios |
| --- | --- |
| `login.feature` | Valid login · unknown credentials · locked out user · required fields · slow responses · logout ends the session · visual baseline |
| `catalog.feature` | Full product listing · sorting by name and price (both directions) · product detail · responsive layout on mobile, tablet and desktop · visual baseline |
| `cart.feature` | Empty cart · cart counter · quantities and prices · removing items · cart persistence while browsing |
| `checkout.feature` | Complete purchase with order totals and 8% tax · mandatory shipping fields · cancelling checkout |

28 scenarios in total. Tags allow running slices of the suite: `@smoke`, `@e2e`, `@visual`, `@responsive`, plus one tag per feature.

## Project structure

```
cypress/
├── e2e/
│   ├── features/            Gherkin specifications
│   └── step_definitions/    Step implementations (one file per feature + shared steps)
├── pages/                   Page Objects
│   └── components/          Reusable UI fragments (header, menu, cart badge)
├── fixtures/                Test data: users, products, customer, devices
├── snapshots/               Approved baselines for visual regression
└── support/                 Custom commands, global hooks and helpers
```

## Design decisions

- **Login once, reuse everywhere.** `cy.login(username, password)` performs a real UI login wrapped in `cy.session()`, cached across specs and validated against the session cookie. Login itself is tested through the UI in `login.feature`; every other feature starts already authenticated, which keeps scenarios fast and independent.
- **Deep links without redirects.** The demo is a single-page app on GitHub Pages: requesting `/inventory.html` directly returns HTTP 404 and a script redirects to `/?/inventory.html`. `cy.visitRoute()` goes straight to the canonical URL, so tests keep strict status-code checks instead of disabling them.
- **State is seeded, not clicked.** Scenarios that need a pre-filled cart write it straight into the application's storage before the page loads (`cy.visitWithCart`). Only the scenarios that test adding products go through the UI to do it.
- **No hard waits.** Every wait is an assertion that Cypress retries (`should`), an explicit timeout, or a network alias created with `cy.intercept()`. The `cypress/no-unnecessary-waiting` lint rule turns any `cy.wait(ms)` into a build error.
- **Network control.** Third-party telemetry is stubbed on every test so results never depend on an external service. Failed logins are captured through an intercept to assert that they are reported to error monitoring **without leaking the password**.
- **Data lives in fixtures.** Users, prices, shipping data and device sizes come from `cypress/fixtures`; expected totals are computed from them, not hardcoded.
- **Independent scenarios.** Each scenario creates its own state, uses Cypress aliases for scenario-scoped data, and can run alone.

## Getting started

Requirements: Node.js 22+ and npm. Docker is optional (required only to update visual baselines).

```bash
git clone https://github.com/inostroza-Daniela/e2e-ecommerce-cypress.git
cd e2e-ecommerce-cypress
npm ci
```

## Running the tests

| Command | What it does |
| --- | --- |
| `npm run cy:open` | Opens the Cypress UI to run scenarios interactively |
| `npm test` | Runs the whole suite headless |
| `npm run test:local` | Runs headless excluding `@visual` (recommended on macOS/Windows, see below) |
| `npm run test:smoke` | Runs only `@smoke` scenarios |
| `npm run lint` | Static analysis |

Any Cucumber tag expression can be passed directly:

```bash
npx cypress run --expose "tags=@checkout and not @visual"
```

## Running with Docker

The image is based on `cypress/included` and pinned to the same Cypress version as `package.json`, so local runs and CI execute in an identical environment.

```bash
npm run docker:build
npm run docker:test
```

The container runs Chrome. Reports, failure screenshots and snapshot diffs are written back to the host under `cypress/results/` and `cypress/snapshots/`.

## Visual regression

Screenshots render differently across operating systems (fonts, anti-aliasing), so baselines are generated and compared **only inside the Docker image**, the same one CI uses. The image is built for `linux/amd64` to match GitHub-hosted runners, including on Apple Silicon.

```bash
npm run docker:build
npm run docker:snapshots
git add cypress/snapshots
```

CI runs with `requireSnapshots=true`, so a missing baseline fails the build instead of being silently created. When a comparison fails, the diff image is uploaded as a build artifact.

Baselines can also be regenerated on the CI runner itself: trigger the workflow manually with **update_snapshots** enabled, download the `visual-baselines` artifact and commit its contents to `cypress/snapshots/`.

## Reports

Each run generates an HTML report with charts, the Gherkin steps of every scenario and embedded screenshots for failures:

```
cypress/results/report/index.html
```

In CI the report is published as the `mochawesome-report` artifact of every workflow run.

## BDD example

Scenarios describe behaviour in business language; implementation details live in step definitions and Page Objects.

```gherkin
@checkout
Feature: Checkout
  As a customer with products in my cart
  I want to complete my purchase
  So that my order is placed

  Background:
    Given I am logged in as a "standard" customer

  @smoke @e2e
  Scenario: Customer buys products from the catalog
    When I add the following products to the cart:
      | product                 |
      | Sauce Labs Backpack     |
      | Sauce Labs Bolt T-Shirt |
    And I open the cart
    Then the cart should list each selected product with quantity 1 and its catalog price
    When I proceed to checkout
    And I submit my shipping information
    Then the order overview should list the selected products
    And the order total should be the item total plus 8% tax
    When I confirm the order
    Then I should see the order confirmation
    And the cart counter should not be displayed
```

## Continuous integration

The workflow in `.github/workflows/e2e-tests.yml` runs on every push to `main`, on pull requests and on demand:

1. **lint**: installs dependencies without the Cypress binary and runs ESLint.
2. **e2e**: builds the Docker image and runs the full suite, uploading the Mochawesome report and, on failure, screenshots and visual diffs.

A manual run (`workflow_dispatch`) accepts a tag expression to execute a subset of scenarios.

## Scope notes

- The demo has no inventory or stock management, so "out of stock" scenarios are not applicable.
- The catalog offers sorting but no filtering; sorting is covered for every option.
- Tests run against a public site; one retry is enabled in run mode to absorb transient network issues without hiding consistent failures.

## Author

**Daniela Inostroza Mancilla** · QA Automation Engineer
[GitHub](https://github.com/inostroza-Daniela) · [LinkedIn](https://www.linkedin.com/in/daniela-inostrozam/)

Licensed under the [MIT License](LICENSE).
