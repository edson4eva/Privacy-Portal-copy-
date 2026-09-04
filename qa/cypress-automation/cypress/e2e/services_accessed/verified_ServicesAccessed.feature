Feature: View Services Accessed
  As a verified user,
  I want to view my Services Accessed page,
  so that I can see the services I have used.

  Background:
    Given I open the login page

  Scenario Outline: Verified user view services accessed with service access history
    When I enter valid credentials for user "<email>", "<password>"
    Then I close the modal banner
    Then I should see the personal information page
    Then I should see the user status "<status>"
    When I click on privacy portal menu
    And I navigate to services accessed page
    Then I validate the services accessed page heading
    Then I validate the services accessed page title
    When I click on View services
    Then I validate the table headers "<headers>"
    And I validate the services accessed table
    When I click on the "<service>" view details link
    Then I validate the service details page heading
    And I validate the service category
    And I validate the service access history log
    And I validate the service details accordion boxes
    When I click back to services accessed button
    Then I validate the services accessed page heading

    Examples:
      | email                                      | password    | status   | headers                                        | service           |
      | pp_integrationPersonalVerified@testing.com | Test1ng@123 | Verified | Service accessed, Date accessed, Time, Details | Class 1 Road Test |

  Scenario Outline: Verified user view services accessed with no service access history
    When I enter valid credentials for user "<email>", "<password>"
    Then I close the modal banner
    Then I should see the personal information page
    Then I should see the user status "<status>"
    When I click on privacy portal menu
    And I navigate to services accessed page
    Then I validate the services accessed page heading
    Then I validate the services accessed page title
    When I click on View services
    Then I validate the table headers "<headers>"
    And I validate the services accessed table
    When I click on the "<service>" view details link
    Then I validate the service details page heading
    And I validate the service category
    And I validate the service access history log
    And I validate the modal message
    When I click back to services accessed button
    Then I validate the services accessed page heading

    Examples:
      | email                                      | password    | status   | headers                                        | service                |
      | pp_integrationPersonalVerified@testing.com | Test1ng@123 | Verified | Service accessed, Date accessed, Time, Details | Notary Public Renewals |

  #This scenario cannot be tested since we dont have any account without service access history
  # Scenario Outline: Verified user with no services accessed
  #   When I enter valid credentials for user "<email>", "<password>"
  #   Then I close the modal banner
  #   Then I should see the personal information page
  #   Then I should see the user status "<status>"
  #   When I click on privacy portal menu
  #   And I navigate to services accessed page
  #   Then I validate the services accessed page heading
  #   Then I validate the services accessed page title
  #   And I validate the alert icon
  #   And I get the alert text message
  #   When I click back to personal information page
  #   Then I validate personal information page heading
  #   Examples:
  #     | email                                      | password    | status   |
  #     | pp_integrationPersonalVerified@testing.com | Test1ng@123 | Verified |

  Scenario Outline: Verified user access services using search, filter, sort, and pagination
    When I enter valid credentials for user "<email>", "<password>"
    Then I close the modal banner
    Then I should see the personal information page
    Then I should see the user status "<status>"
    When I click on privacy portal menu
    And I navigate to services accessed page
    Then I validate the services accessed page heading
    Then I validate the services accessed page title
    When I click on View services
    Then I validate the services accessed count
    When I search for "<search>" service
    Then I validate the searched services
    And I cancel the searched service
    When I filter the services by "<category>"
    And I click on view services button in filter
    Then I validate the filtered services
    When I filter the services by "<category>" and sort by "<sortby>"
    And I click on view services button in filter
    When I click on filter button to remove the filtered "<category>"
    And I click on cancel icon in filter
    Then I validate the services accessed count
    Then I validate the services accessed pagination controls
    When I click on next page icon
    Then I validate the services on the next page by checking the page number
    When I click on previous page icon
    Then I validate the services on the previous page by checking the page number
    When I click on page number thru dropdown "<page>"
    Then I validate the services on the selected page
    When I click on personal information page
    Then I validate the personal information page heading

    Examples:
      | email                                      | password    | status   | search | category | sortby          | page |
      | pp_integrationPersonalVerified@testing.com | Test1ng@123 | Verified | Child  | justice  | Latest accessed |    3 |
