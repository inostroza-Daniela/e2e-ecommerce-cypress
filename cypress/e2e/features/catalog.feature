@catalog
Feature: Product catalog
  As a logged in customer
  I want to explore the available products
  So that I can find what I want to buy

  Background:
    Given I am logged in as a "standard" customer

  @smoke
  Scenario: Catalog lists every product with its price
    Then I should see every product in the store with its price

  Scenario Outline: Customer sorts the catalog by <sort option>
    When I sort the products by "<sort option>"
    Then the products should be ordered by <criterion> in <direction> order

    Examples:
      | sort option         | criterion | direction  |
      | Name (A to Z)       | name      | ascending  |
      | Name (Z to A)       | name      | descending |
      | Price (low to high) | price     | ascending  |
      | Price (high to low) | price     | descending |

  Scenario: Product details match the catalog listing
    When I open the details of "Sauce Labs Fleece Jacket"
    Then I should see the name and price listed in the catalog for that product
    When I go back to the products
    Then I should see the product catalog

  @responsive
  Scenario Outline: Catalog layout adapts to a <device> screen
    Given I am using a "<device>" screen
    Then the products should be displayed in <grid>
    And each product image should be placed <position> its details

    Examples:
      | device  | grid      | position |
      | mobile  | 1 column  | above    |
      | tablet  | 1 column  | beside   |
      | desktop | 2 columns | beside   |

  @visual
  Scenario: Catalog page matches the approved design
    Then the page should match the approved "catalog-page" design
