Feature: Services Accessed for Basic User
  As a basic user,
  I want to view my services accessed page, so that I can see the services I have used.

  Scenario Outline: Basic user views services accessed
    Given I open the login page
    When I enter valid credentials for user "<userName>", "<password>"
    Then I click Access Privacy Portal in the modal banner
    Then I validate the new privacy feature page heading
    When I click on services accessed from the new privacy feature page
    Then I validate services accessed page heading
    Then I validate services accessed page title
    And I should see the alert icon
    And I get the alert text message
    When I click on back to personal information page
    Then I validate personal information page heading

    Examples:
      | userName                                | password    | status |
      | pp_integrationPersonalBasic@testing.com | Test1ng@123 | Basic  |