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

  Scenario Outline: Shipping information requires the <missing field>
    Given my cart already contains:
      | product           |
      | Sauce Labs Onesie |
    When I open the cart
    And I proceed to checkout
    And I submit my shipping information without the "<missing field>"
    Then I should see the checkout error "<message>"
    And I should remain on the shipping information step

    Examples:
      | missing field | message                        |
      | first name    | Error: First Name is required  |
      | last name     | Error: Last Name is required   |
      | postal code   | Error: Postal Code is required |

  Scenario: Cancelling checkout keeps the cart intact
    Given my cart already contains:
      | product               |
      | Sauce Labs Bike Light |
    When I open the cart
    And I proceed to checkout
    And I cancel the checkout
    Then the cart should only contain "Sauce Labs Bike Light"
