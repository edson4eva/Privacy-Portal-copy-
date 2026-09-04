Feature: Basic user files a complaint
As a basic user, I want to file a complaint so that my concerns are submitted successfully.

  Scenario Outline: Basic user files a privacy complaint
    Given I open the login page
    When I enter valid credentials for user "<userName>", "<password>"
    And I click Access Privacy Portal in the modal banner
    Then I validate the new privacy feature page heading
    When I click on file a complaint from the new privacy feature page
    Then I validate the privacy complaint page heading
    When I click on File a complaint
    Then I validate the collection notice page heading
    When I click on Start a complaint
# Step 1: Department and Service
    Then I validate the user is on the select department page
    When I click on the select department button
    Then I select Department "<department>" from dropdown menu
    And I enter "<service>" in the service textbox field
    When I click on Next button from step-1
# Step 2: Provide Details
    Then I validate the user is on the provide details page
    And I validate the selected department "<department>" and service "<service>" is displayed
    When I click on edit button in the step-2
    Then I capture the mandatory field entered on step-1 department
    When I click on Next button from step-1
    Then I click the on the privacy concerns checkbox
    Then I enter details in describe circumstances field "<describecircumstances>"
    Then I enter "<employeename>" in the employee name field
    And I enter "<firstName>" as the first name and "<lastName>" as the last name
    And I enter "<email>" as the email and "<confirmemail>" as the confirm email
    When I click on Next button from step-2
# Step 3: Attach Documents
    Then I validate the user is on the attach documents page
    When I validate the uplod files container is active
    Then I upload the png file and pdf file
    And I enter the document description in the "<describedocuments>" field
    When I click on Next button from step-3
# Step 4: Review and Submit
    Then I validate the user is on the review and submit page
    When I click on the edit button in the step-4 for select department
    Then I validate that user is on the select department page
    When I click on Next button from step-1
    Then I click on Next button from step-2
    Then I click on Next button from step-3
    When I click on the edit button in the step-4 for provide details
    Then I validate that user is on the provide details page
    Then I click on Next button from step-2
    Then I click on Next button from step-3
    When I click on the edit button in the step-4 for attach documents
    Then I validate that user is on the attach documents page
    When I click on Next button from step-3
    Then I click on the submit button
    Then I validate the success message page
    When I click on the view complaint history button
    Then I validate the complaint history page heading
    And I validate the latest submitted complaint
    When I click on back to privacy complaint button
    Then I validate the privacy complaint page heading

    Examples:
      | userName                                 | password    | department        | service                                                               | describecircumstances                                                                                                                                                                                                              | employeename | firstName | lastName    | email                                   | confirmemail                            | describedocuments       |
      | pp_integrationPersonalBasic@testing.com  | Test1ng@123 | Tourism and Sport | Tourism and Sports                                                    | The data was missused and it was occurred yesterday.                                                                                                                                                                               | Test         | John      | Smith       | pp_integrationPersonalBasic@testing.com | pp_integrationPersonalBasic@testing.com | Test document pdf & png |
      | pp_integrationBusinessBasic1@testing.com | Test1ng@123 | Justice           | There are several time when my data was used incorrectly in Justice!! | Can you describe the circumstances under which you believe your personal information was improperly accessed, collected, used, disclosed, or destroyed? Please provide any details or evidence that may support your complaint.#@! | first_name   | Eva'er'er | first''name | pp_integrationPersonalBasic@testing.com | pp_integrationPersonalBasic@testing.com | pdf document            |
#Note: user basic user for names & email validation and select departments & circumstances
