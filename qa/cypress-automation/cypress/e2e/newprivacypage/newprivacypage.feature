Feature: Validate the core functionality of the new privacy feature page

  Scenario Outline: User navigates to the new privacy feature page and performs actions
    Given I open the login page
    When I enter valid credentials for user "<userName>", "<password>"
    Then I click Access Privacy Portal in the modal banner
    Then I validate the new privacy feature page heading
    Then I validate the first title on the new privacy feature page
    Then I capture the bullet points under the first container
    Then I validate the second title on the new privacy feature page
    Then I capture the heading of all the containers names under second title
    Then I validate the third title on the new privacy feature page
    Then I capture the heading of all the containers names under third title


    Examples:
      | userName                                   | password    | 
      |pp_integrationPersonalVerified2@testing.com | Test1ng@123 | 

