Feature: Verified user files a complaint with pre-filled information
    As a Verified user, I want to file a complaint with pre-filled personal information to ensure efficient submission.

  Scenario Outline: Verified user files a complaint with pre-filled personal information
    Given I open the login page
    When I enter valid credentials for user "<userName>", "<password>"
    And I close the modal banner
    Then I should see the personal information page
    Then I should see the user status "<status>"
    And I capture the firstname and lastname of the user
    When I click on privacy portal menu
    And I navigate to Privacy complaint page
    Then I validate privacy complaint page heading
    When I click on File a complaint
    Then I validate the collection notice page heading
    And I click on Start a complaint
#Step-1: Department and Service
    Then I validate the user is on the select department page
    When I click on the select department button
    Then I select Department "<department>" from dropdown menu
    When I click on Next button from step-1
#Step-2: Provide Details
    Then I validate the user is on the provide details page
    And I validate the selected department "<department>" and service is displayed
    Then I click on the privacy concerns checkbox
    Then I enter details in describe circumstances field "<describecircumstances>"
    # There is a bug in development related to this fields - PRVP-853
    And I validate firstName and lastName are pre-filled
    And I verify the email field is pre-filled but editable
    And I enter "<email>" as the email and "<confirmemail>" as the confirm email
    # And I enter "<confirmemail>" as the confirm email
    When I click on Next button from step-2
#Step-3: Attach Documents
    Then I validate the user is on the attach documents page
    When I click on Next button from step-3
#Step-4: Review and Submit
    Then I validate the user is on the review and submit page
    Then I validate the heading of each container in step-4
    Then I validate the attach document container has information modal
    When I click on the Submit button
    Then I validate the success message page
    When I click on privacy portal menu
    And I navigate to Privacy complaint page
    And I click on the view complaint history button
    Then I validate the complaint history page heading
    And I validate the latest submitted complaint

    Examples:
      | userName                                    | password    | status   | department | describecircumstances                                                                                                                                                                                                              | email                                   | confirmemail                            |
      | pp_integrationPersonalVerified2@testing.com | Test1ng@123 | Verified | Health     | The data was missused and it was occurred yesterday.                                                                                                                                                                               | pp_integrationPersonalBasic@testing.com | pp_integrationPersonalBasic@testing.com |
    #   | pp_integrationPersonalVerified2@testing.com | Test1ng@123 | Verified | Justice    | Can you describe the circumstances under which you believe your personal information was improperly accessed, collected, used, disclosed, or destroyed? Please provide any details or evidence that may support your complaint.#@! | pp_integrationPersonalBasic@testing.com | pp_integrationPersonalBasic@testing.com |
