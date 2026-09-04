Feature: File a Complaint on Different Devices

  Scenario Outline: User files a complaint on different <device>
    Given I open the login page
    When I set the device to "<device>"
    And I enter valid credentials for user "<userName>", "<password>"
    Then I close the modal banner
    When I click on privacy portal menu
    And I navigate to Privacy complaint page
    When I click on File a complaint
    When I click on Start a complaint
    When I click on the select department button
    Then I select Department "<department>" from dropdown menu
    When I click on Next button from step-1
    Then I click on the privacy concerns checkbox
    Then I enter details in describe circumstances field "<describecircumstances>"
    And I enter "<firstName>" as the first name and "<lastName>" as the last name
    And I enter "<email>" as the email and "<confirmemail>" as the confirm email
    When I click on Next button from step-2
    When I click on Next button from step-3
    Then I click on the submit button
    Then I validate the success message page

    Examples:
      | device        | userName                                 | password    | department                | describecircumstances           | firstName | lastName | email                                    | confirmemail                             |
      | iphone-13     | pp_integrationPersonalBasic1@testing.com | Test1ng@123 | Energy and Minerals       | Test complaint on iphone-13     | John      | Doe      | pp_integrationPersonalBasic1@testing.com | pp_integrationPersonalBasic1@testing.com |
      | samsung-s22   | pp_integrationPersonalBasic2@testing.com | Test1ng@123 | Forestry and Parks        | Test complaint on samsung-s22   | Jane      | Smith    | pp_integrationPersonalBasic1@testing.com | pp_integrationPersonalBasic1@testing.com |
      | iphone-15+    | pp_integrationPersonalBasic@testing.com  | Test1ng@123 | Infrastructure            | Test complaint on iphone-15+    | Bob       | Brown    | pp_integrationPersonalBasic1@testing.com | pp_integrationPersonalBasic1@testing.com |
      | ipad-10th     | pp_integrationBusinessBasic1@testing.com | Test1ng@123 | Health                    | Test complaint on ipad-10th     | Alice     | Johnson  | pp_integrationPersonalBasic1@testing.com | pp_integrationPersonalBasic1@testing.com |
      | galaxy-tab-s8 | pp_integrationPersonalBasic@testing.com  | Test1ng@123 | Technology and Innovation | Test complaint on galaxy-tab-s8 | David     | Wilson   | pp_integrationPersonalBasic1@testing.com | pp_integrationPersonalBasic1@testing.com |
  