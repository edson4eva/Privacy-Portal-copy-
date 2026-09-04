Feature: End-to-End Regression Test for Verified User in Privacy Portal

  Background:
    Given I open the login page

  Scenario Outline: Verified User Navigates Privacy Portal and Files Complaint Successfully
    When I enter valid credentials for user "<userName>", "<password>"
    Then I click Access Privacy Portal in the modal banner
    Then I validate the new privacy feature page heading
    When I click on services accessed from the new privacy feature page
    Then I validate the services accessed page heading
    Then I validate the services accessed page title
    When I click on View services
    # intermittent failure due to loading time for the services accessed page & table
    Then I validate the services accessed count
    When I search for "<search>" service
    Then I validate the searched services
    When I click on the "<service>" view details link
    Then I validate the service details page heading
    Then I validate the service category
    When I click on Back to services accessed page
    When I navigate to Privacy complaint page
    Then I validate privacy complaint page heading
    When I click on File a complaint
    When I click on Start a complaint
    Then I validate the user is on the select department page
    When I click on the select department button
    Then I select Department "<department>" from dropdown menu
    When I click on Next button from step-1
    Then I validate the user is on the provide details page
    Then I click on the privacy concerns checkbox
    Then I enter details in describe circumstances field "<describecircumstances>"
     # There is a bug in development related to this fields - PRVP-853
    And I validate firstName and lastName are pre-filled
    And I enter "<email>" as the email and "<confirmemail>" as the confirm email
    # And I enter "<confirmemail>" as the confirm email
    When I click on Next button from step-2
    Then I validate the user is on the attach documents page
    When I click on Next button from step-3
    Then I validate the user is on the review and submit page
    Then I validate the heading of each container in step-4
    Then I validate the attach document container has information modal
    When I click on the Submit button
    Then I validate the success message page
    When I click on the view complaint history button
    Then I validate the complaint history page heading
    And I validate the latest submitted complaint

    Examples:
      | userName                                   | password    |search| service       | department          | describecircumstances | email                                      | confirmemail                               |
      | pp_integrationPersonalVerified@testing.com | Test1ng@123 |Fine| Fine payments | Energy and Minerals | Energy and Minerals   | pp_integrationPersonalVerified@testing.com | pp_integrationPersonalVerified@testing.com |
