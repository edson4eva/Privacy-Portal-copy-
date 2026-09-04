Feature: Launching Alberta.ca Account-
  Navigate to New Privacy Feature, Services Accessed, and Privacy Complaint Page 

  Background:
    Given I open the login page

  Scenario Outline: User can navigate to Privacy Portal features pages
    When I enter valid credentials for user "<userName>", "<password>"
    Then I close the modal banner
    When I click on privacy portal menu
    And I navigate to new privacy feature page
    Then I validate new privacy feature page heading
    When I navigate to services accessed page
    Then I validate services accessed page heading
    When I navigate to privacy complaint page
    Then I validate privacy complaint page heading
    When I navigate to complaints history page
    Then I validate complaints history page heading

    Examples:
      | userName                                   | password    | status   |
      | pp_integrationPersonalBasic@testing.com    | Test1ng@123 | Basic    |
      | pp_integrationPersonalVerified@testing.com | Test1ng@123 | Verified |
