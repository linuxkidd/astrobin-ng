context("Image edit (existing)", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.route("GET", "**/api/v2/images/image/?hash=abc123", "fixture:api/images/image_1_by_hashes.json").as("getImage");
    cy.route("GET", "/abc123/0/thumb/hd/", "fixture:api/images/image_thumbnail_1_regular_loaded").as("getThumbnail");
    cy.route(
      "GET",
      "**/api/v2/remote-source-affiliation/remote-source-affiliate/",
      "fixture:api/remote-source-affiliation/remote-source-affiliates.json"
    ).as("getRemoteSourceAffiliates");
    cy.route("GET", "**/api/v2/groups/group/?members=1", "fixture:api/groups/groups.json").as("getGroups");
    cy.route("GET", "**/api/v2/users/locations/", { count: 0, results: [] }).as("getUsersLocations");
  });

  it("should navigate to the edit page", () => {
    cy.login();

    cy.route(
      "GET",
      "**/common/userprofiles/current",
      "fixture:api/common/userprofile_current_1_with_locations.json"
    ).as("getCurrentUserProfile");

    cy.visitPage("/i/abc123/edit");
    cy.wait("@getImage");
    cy.wait("@getUsersLocations");
    cy.url().should("contain", "/i/abc123/edit");
  });

  it("should not show the 'new editor' alert", () => {
    cy.get("#new-editor-alert").should("not.exist");
  });

  it("should have all tabs", () => {
    cy.get("#image-stepper-field .nav-link").should("have.length", 5);
  });

  it("should have the #1 fragment", () => {
    cy.url().should("contain", "#1");
  });

  it("should have prefilled the basic information step", () => {
    cy.get("#image-title-field").should("have.value", "Test image");
    cy.get("#image-description-field").should("have.value", "This is a test");
    cy.get("#image-link-field").should("have.value", "https://www.example.com/1/");
    cy.get("#image-link-to-fits-field").should("have.value", "ftps://www.example.com/file.fits");
  });

  it("should have prefilled the content step", () => {
    cy.get("#image-stepper-basic-information .form-actions .btn")
      .contains("Next")
      .click();

    cy.url().should("contain", "#2");

    cy.get("#image-acquisition-type-field .ng-value").should("contain.text", "Regular");
    cy.get("#image-subject-type-field .ng-value").should("contain.text", "Deep sky");
    cy.get("#image-data-source-field .ng-value").should("contain.text", "Backyard");

    cy.get("#image-groups-field .ng-value")
      .contains("First test group")
      .should("exist");
    cy.get("#image-groups-field .ng-value")
      .contains("Second test group")
      .should("exist");
    cy.get("#image-groups-field .ng-value")
      .contains("Third test group")
      .should("exist");
  });

  it("should have locations", () => {
    cy.get("#image-locations-field").click();

    cy.get("#image-locations-field .ng-value")
      .contains("Home observatory")
      .should("exist");

    cy.get("#image-locations-field .ng-option")
      .contains("Backyard observatory")
      .should("exist");
  });

  it("should have prefilled the watermark step", () => {
    cy.get("#image-stepper-content .form-actions .btn")
      .contains("Next")
      .click();

    // Skip over thumbnail step.
    cy.get("#image-stepper-thumbnail .form-actions .btn")
      .contains("Next")
      .click();

    cy.url().should("contain", "#4");

    cy.get("#image-watermark-field").should("be.checked");
    cy.get("#image-watermark-text-field").should("have.value", "Copyright astrobin-dev");
    cy.get("#image-watermark-position-field .ng-value").should("contain.text", "Bottom left");
    cy.get("#image-watermark-size-field .ng-value").should("contain.text", "Medium");
    cy.get("#image-watermark-opacity-field").should("have.value", "50");
  });

  it("should have prefilled the settings step", () => {
    cy.get("#image-stepper-watermark .form-actions .btn")
      .contains("Next")
      .click();

    cy.url().should("contain", "#5");

    cy.get("#image-license-field .ng-value").should(
      "contain.text",
      "Attribution-NonCommercial-ShareAlike Creative Commons"
    );
    cy.get("#image-mouse-hover-image-field .ng-value").should("contain.text", "Inverted monochrome");
    cy.get("#image-allow-comments-field").should("be.checked");
  });
});
