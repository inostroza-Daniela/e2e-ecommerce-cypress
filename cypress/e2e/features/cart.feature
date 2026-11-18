@cart
Feature: Shopping cart
  As a customer
  I want to collect the products I intend to buy
  So that I can review them before paying

  Background:
    Given I am logged in as a "standard" customer

  Scenario: An empty cart shows no item counter
    Then the cart counter should not be displayed

  @smoke
  Scenario: Adding products updates the cart counter
    When I add the following products to the cart:
      | product               |
      | Sauce Labs Backpack   |
      | Sauce Labs Bike Light |
    Then the cart counter should show 2
    And the added products should be marked as in the cart

  Scenario: Cart lists the selected products with quantity and price
    When I add the following products to the cart:
      | product                 |
      | Sauce Labs Bolt T-Shirt |
      | Sauce Labs Onesie       |
    And I open the cart
    Then the cart should list each selected product with quantity 1 and its catalog price

  Scenario: Customer removes a product from the cart
    Given my cart already contains:
      | product                  |
      | Sauce Labs Backpack      |
      | Sauce Labs Fleece Jacket |
    When I open the cart
    And I remove "Sauce Labs Backpack" from the cart
    Then the cart should only contain "Sauce Labs Fleece Jacket"
    And the cart counter should show 1

  Scenario: Cart keeps its contents while the customer keeps shopping
    When I add "Sauce Labs Onesie" to the cart
    And I open the cart
    And I continue shopping
    Then the added products should be marked as in the cart
    And the cart counter should show 1
