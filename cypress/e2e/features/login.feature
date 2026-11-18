@login
Feature: Login
  As a registered customer
  I want to sign in to the store
  So that I can browse products and place orders

  @smoke
  Scenario: Customer logs in with valid credentials
    Given I am on the login page
    When I log in as a "standard" customer
    Then I should see the product catalog

  Scenario: Login is rejected for unknown credentials
    Given I am on the login page
    When I log in as an "unregistered" customer
    Then I should see the login error "Username and password do not match any user in this service"
    And I should remain on the login page
    And the failed attempt should be reported to error monitoring without exposing the password

  Scenario: Locked out customer cannot log in
    Given I am on the login page
    When I log in as a "locked out" customer
    Then I should see the login error "Sorry, this user has been locked out."
    And I should remain on the login page
    And the failed attempt should be reported to error monitoring without exposing the password

  Scenario Outline: Login requires both username and password
    Given I am on the login page
    When I try to log in as a "standard" customer without a <missing field>
    Then I should see the login error "<message>"

    Examples:
      | missing field | message              |
      | username      | Username is required |
      | password      | Password is required |

  Scenario: Login succeeds even when the store responds slowly
    Given I am on the login page
    When I log in as a "slow" customer
    Then I should see the product catalog within 10 seconds

  Scenario: Logging out ends the session
    Given I am logged in as a "standard" customer
    When I log out
    Then I should be on the login page
    And I should not be able to open the catalog without logging in again

  @visual
  Scenario: Login page matches the approved design
    Given I am on the login page
    Then the page should match the approved "login-page" design
