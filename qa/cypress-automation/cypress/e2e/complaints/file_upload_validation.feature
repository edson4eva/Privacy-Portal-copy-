Feature: Validate File Upload Feature in Complaint Form
    As a user,
    I want to upload supporting documents when filing a complaint,
    So that I can provide evidence and receive appropriate validation feedback.

  Scenario: Upload valid files (PDF, DOC, JPEG, PNG) within size and count limits
    Given I open the login page
    When I enter valid credentials for user "<userName>", "<password>"
    And I close the modal banner
    Then I should see the personal information page
    When I click on privacy portal menu
    And I navigate to Privacy complaint page
    Then I validate privacy complaint page heading
    When I click on File a complaint
    And I click on Start a complaint
#Step-1: Department and Service
    Then I validate the user is on the select department page
    When I click on the select department button
    Then I select Department "<department>" from dropdown menu
    When I click on Next button from step-1
#Step-2: Provide Details
    Then I validate the user is on the provide details page
    Then I click on the privacy concerns checkbox
    Then I enter details in describe circumstances field "<describecircumstances>"
    And I enter "<firstName>" as the first name and "<lastName>" as the last name
    And I enter "<email>" as the email and "<confirmemail>" as the confirm email
    When I click on Next button from step-2
    Then I validate the user is on the attach documents page
    When I validate the upload files container is active
#Step-3: Attach Documents
    When I upload the following valid files:
      | fileName     | fileType |
      | sample1.pdf  | PDF      |
      | sample2.docx | DOCX     |
      | sample3.jpg  | JPG      |
      | sample4.png  | PNG      |
      | sample5.png  | PNG      |
# Uploading valid files
    And I enter the document description in the field as "Valid documents for upload"
    Then I should not see any file upload error messages
    When I click on Next button from step-3
    Then I validate the user is on the review and submit page

    Examples:
      | userName                                | password    | department          | describecircumstances           | firstName | lastName | email                                   | confirmemail                            |
      | pp_integrationPersonalBasic@testing.com | Test1ng@123 | Energy and Minerals | Test complaints on files upload | John      | Doe      | pp_integrationPersonalBasic@testing.com | pp_integrationPersonalBasic@testing.com |

  Scenario: Upload more than 5 files
    Given I open the login page
    When I enter valid credentials for user "<userName>", "<password>"
    And I close the modal banner
    Then I should see the personal information page
    When I click on privacy portal menu
    And I navigate to Privacy complaint page
    Then I validate privacy complaint page heading
    When I click on File a complaint
    And I click on Start a complaint
#Step-1: Department and Service
    Then I validate the user is on the select department page
    When I click on the select department button
    Then I select Department "<department>" from dropdown menu
    When I click on Next button from step-1
#Step-2: Provide Details
    Then I validate the user is on the provide details page
    Then I click on the privacy concerns checkbox
    Then I enter details in describe circumstances field "<describecircumstances>"
    And I enter "<firstName>" as the first name and "<lastName>" as the last name
    And I enter "<email>" as the email and "<confirmemail>" as the confirm email
    When I click on Next button from step-2
    Then I validate the user is on the attach documents page
    When I validate the upload files container is active
#Step-3: Attach Documents
    When I upload the following files:
      | fileName     | fileType |
      | sample1.pdf  | PDF      |
      | sample2.docx | DOCX     |
      | sample3.jpg  | JPG      |
      | sample4.png  | PNG      |
      | sample5.png  | PNG      |
      | sample6.pdf  | PDF      |
# Uploading more than 5 files
    And I enter the document description in the "Too many documents" field
    When I click on Next button from step-3
    Then I should see the file count error message "You cannot upload more than 5 documents"

    Examples:
      | userName                                | password    | department          | describecircumstances           | firstName | lastName | email                                   | confirmemail                            |
      | pp_integrationPersonalBasic@testing.com | Test1ng@123 | Energy and Minerals | Test complaints on files upload | John      | Doe      | pp_integrationPersonalBasic@testing.com | pp_integrationPersonalBasic@testing.com |

  Scenario: Upload a file larger than 10MB
    Given I open the login page
    When I enter valid credentials for user "<userName>", "<password>"
    And I close the modal banner
    Then I should see the personal information page
    When I click on privacy portal menu
    And I navigate to Privacy complaint page
    Then I validate privacy complaint page heading
    When I click on File a complaint
    And I click on Start a complaint
#Step-1: Department and Service
    Then I validate the user is on the select department page
    When I click on the select department button
    Then I select Department "<department>" from dropdown menu
    When I click on Next button from step-1
#Step-2: Provide Details
    Then I validate the user is on the provide details page
    Then I click on the privacy concerns checkbox
    Then I enter details in describe circumstances field "<describecircumstances>"
    And I enter "<firstName>" as the first name and "<lastName>" as the last name
    And I enter "<email>" as the email and "<confirmemail>" as the confirm email
    When I click on Next button from step-2
    Then I validate the user is on the attach documents page
    When I validate the upload files container is active
    When I upload a file named "largefile.pdf" with size greater than 10MB
    Then I should see the file size error message "The file must be less than 10MB"

    Examples:
      | userName                                | password    | department          | describecircumstances           | firstName | lastName | email                                   | confirmemail                            |
      | pp_integrationPersonalBasic@testing.com | Test1ng@123 | Energy and Minerals | Test complaints on files upload | John      | Doe      | pp_integrationPersonalBasic@testing.com | pp_integrationPersonalBasic@testing.com |

  Scenario: Upload a file with an invalid file type
    Given I open the login page
    When I enter valid credentials for user "<userName>", "<password>"
    And I close the modal banner
    Then I should see the personal information page
    When I click on privacy portal menu
    And I navigate to Privacy complaint page
    Then I validate privacy complaint page heading
    When I click on File a complaint
    And I click on Start a complaint
#Step-1: Department and Service
    Then I validate the user is on the select department page
    When I click on the select department button
    Then I select Department "<department>" from dropdown menu
    When I click on Next button from step-1
#Step-2: Provide Details
    Then I validate the user is on the provide details page
    Then I click on the privacy concerns checkbox
    Then I enter details in describe circumstances field "<describecircumstances>"
    And I enter "<firstName>" as the first name and "<lastName>" as the last name
    And I enter "<email>" as the email and "<confirmemail>" as the confirm email
    When I click on Next button from step-2
    Then I validate the user is on the attach documents page
    When I validate the upload files container is active
    When I upload a file named "Test.txt" with file type "txt"
    Then I should see the file type error message "Invalid file type"

    Examples:
      | userName                                | password    | department          | describecircumstances           | firstName | lastName | email                                   | confirmemail                            |
      | pp_integrationPersonalBasic@testing.com | Test1ng@123 | Energy and Minerals | Test complaints on files upload | John      | Doe      | pp_integrationPersonalBasic@testing.com | pp_integrationPersonalBasic@testing.com |
