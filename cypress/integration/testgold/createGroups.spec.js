const login = {
  email: "",
  password: "",
};

let defaultGroupId = "886d0770-4e7d-461d-8134-07653ba277dc";
let defaultPolicyId = "10dea6c7-ec1a-4c19-a88c-f62d83dc78da";

const verifyNotification = (
  isVisible,
  color = null,
  title = null,
  message = null
) => {
  let beVisible = isVisible ? "be.visible" : "not.exist";

  if (title) {
    cy.contains("#notification-toasters", title).should(beVisible); // NOTE: This errors when TestGold is enabled.
  } else {
    cy.get("#notification-toasters").should(beVisible);
  }

  if (isVisible) {
    cy.get('button[data-action="close"]').parent().as("notification");
    cy.get("@notification", { timeout: 4000 }).should(
      "have.css",
      "background-color",
      color
    ); // Shortened timeout because wrong error displays in Cypress if the notification dismisses before assertion times-out

    if (message) {
      cy.get("#notification-toasters")
        .find('div[class*="message"]')
        .as("notificationMessage");
      cy.get("@notificationMessage", { timeout: 4000 }).should(
        "have.text",
        message
      ); // Shortened timeout because wrong error displays in Cypress if the notification dismisses before assertion times-out
    }
  }
};

context("Groups Create -", () => {
  beforeEach(() => {
    // login
    cy.visit(Cypress.config().baseUrl);
    cy.get("#emailAddress").type(login.email);
    cy.get("#nextButton").click();
    cy.get("#password").type(login.password);
    cy.get("#loginButton").click();
    cy.get('[data-cy="dialog-close"]'); // Ensure dashboard is loaded; quick hack

    cy.visit("/settings/groups");
    cy.get("div.nested-groups-contanier").as("groupsTable");
  });

  afterEach(() => {
    // Clean up groups
    // If this cannot execute. Manually clean up groups before rerunning
    cy.wait(2000); // quick fix for stability
    cy.get("input[type='checkbox']").eq(1).click({ force: true });
    cy.get("#delete-group").click();
    cy.get("#delete-group-notification").click(); // NOTE: Seems that with TestGold enabled, cy.get() is not honoring the cypress timeout (configured for 10 seconds) for the element to be visible.
  });

  describe("Create a New Group Validation:", () => {
    it("Use Special Characters in Group Name", () => {
      const specialCharacters = "~!@#$%^&*()_+{}|:\"<>?/*-[]\\;',.`";

      cy.get("#new-group").click();
      cy.get("#group-name").type(specialCharacters);
      cy.get("#group-policy-id").select(defaultPolicyId);
      cy.get("#add-group").click();
      cy.wait(1500); // Wait for group to be added

      cy.get("@groupsTable") // NOTE: This errors with TestGold enabled.
        .children()
        .eq(2)
        .then(($row) => {
          cy.wrap($row)
            .find("span")
            .as("groupName")
            .should("have.text", specialCharacters);
        });
    });
  });

  describe("Create a New Group with:", () => {
    it("Default Policy", () => {
      const groupName = "TestGroup";

      cy.get("#new-group").click();
      cy.get("#group-name").type(groupName);
      cy.get("#group-policy-id").select(defaultPolicyId);
      cy.get("#add-group").click();

      const color = "rgb(87, 181, 115)";
      const title = "Group was successfully created.";
      verifyNotification(true, color, title);
    });
  });
});
