Feature: Error Message and Modal Popup Validation
  As a user,
  I want to receive clear error messages and see informative modal popups
  So that I can understand what actions are required or what went wrong during my interaction with the application.

  Scenario: Error Message and Modal Popup Validation
    Given I open the login page
    When I enter valid credentials for user "<userName>", "<password>"
    And I close the modal banner
    Then I should see the personal information page
    When I click on privacy portal menu
    And I navigate to Privacy complaint page
    Then I validate privacy complaint page heading
    When I click on File a complaint
    And I click on Start a complaint
    Then I validate the user is on the select department page
    When I click on Next button from step-1
    Then I see the error message for step-1 as "Select a department"
    Then I select Department "<department>" from dropdown menu
    When I click on Next button from step-1
    Then I validate the user is on the provide details page
    When I click on Next button from step-2
    Then I see the error message for privacy concern under step-2 as "Choose one concern"
    Then I click on the privacy concerns checkbox
    When I click on Next button from step-2
    Then I see the error message for describe circumstances under step-2 as "Describe circumstances"
    Then I enter details in describe circumstances field "<describecircumstances>"
    When I click on Next button from step-2
    Then I see the error message for first name under step-2 as "Provide your first name"
    Then I see the error message for last name under step-2 as "Provide your last name"
    And I enter "<wrgformatfirstName>" as the first name and "<lastName>" as the last name
    When I click on Next button from step-2
    Then I see the error message for incorrect format first name under step-2 as "Name can only include letters, spaces, hyphens, and apostrophes."
    Then I clear the first name field
    And I enter "<firstName>" as the first name
    When I click on Next button from step-2
    Then I see the error message for email under step-2 as "Provide your email"
    Then I see the error message for confirm email under step-2 as "Confirm your email"
    And I enter "<email>" as the email and "<wrgemail>" as the confirm email
    When I click on Next button from step-2
    Then I see the error message for email mismatch under step-2 as "Your email confirmation must match your email"
    Then I clear the confirm your email field
    And I enter incorrect format email "<wrgformatemail>" as the confirm email
    When I click on Next button from step-2
    Then I see the error message for incorrect format email under step-2 as "Write correct email format"
    Then I clear the confirm your email field
    And I enter "<confirmemail>" as the confirm email
    When I click on Next button from step-2
    Then I validate the user is on the attach documents page
    When I validate the uplod files container is active
    Then I upload the pdf file
    When I click on Next button from step-3
    Then I see the error message for document description under step-3 as "Describe documentation"
    And I enter the document description in the "<describedocuments>" field
    When I click on Back button from step-3
    When I click on Back button from step-2
    When I click on Back button from step-1
    Then I see a modal popup with the message "If you leave this page, changes made will be lost. Would you like to proceed?"
    When I click on Cancel in the modal popup
    Then I validate the user is on the select department page
    When I click on Next button from step-1
    When I click on Next button from step-2
    When I click on Next button from step-3
    Then I validate the user is on the review and submit page
    Then I click on the submit button
    Then I validate the success message page
    # When I click on privacy portal menu

    Examples:
      | userName                                | password    | department | describecircumstances                                        | wrgformatfirstName | lastName | firstName | email                                   | wrgemail                                 | wrgformatemail              | confirmemail                            | describedocuments |
      | pp_integrationPersonalBasic@testing.com | Test1ng@123 | Health     | I have concerns about how my personal data is being handled. | John_doe           | Doe      | John      | pp_integrationPersonalBasic@testing.com | pp_integrationPersonalBasic1@testing.com | pp_integrationPersonalBasic | pp_integrationPersonalBasic@testing.com | PDF documents     |
