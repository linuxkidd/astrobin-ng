import { testBrand, testTelescope } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create telescope with brand process creation", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/telescope");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findTelescopes");
      });

      it("should create a brand", () => {
        cy.equipmentItemBrowserCreateBrand(
          "#equipment-item-field-brand",
          "Test brand",
          "https://www.test-brand.com/",
          testBrand
        );
      });

      it("should have prefilled the name", () => {
        cy.get("#equipment-item-field-name").should("have.value", "Test");
      });

      it("should fill the type", () => {
        cy.ngSelectOpen("#telescope-field-type");
        cy.ngSelectOptionClick("#telescope-field-type", 1);
        cy.ngSelectValueShouldContain("#telescope-field-type", "Refractor: achromatic");
      });

      it("should hide the 'Aperture' and show naming convention info if type is 'Camera lens'", () => {
        cy.ngSelectOpen("#telescope-field-type");
        cy.ngSelectOptionClick("#telescope-field-type", 23);

        cy.get("#telescope-field-aperture").should("not.be.visible");
        cy.get(".info-feedback span")
          .contains("The recommended naming convention for camera lenses is")
          .should("be.visible");

        cy.ngSelectOpen("#telescope-field-type");
        cy.ngSelectOptionClick("#telescope-field-type", 1);

        cy.get("#telescope-field-aperture").should("be.visible");
      });

      it("should input the 'Aperture'", () => {
        cy.get("#telescope-field-aperture").type("80");
      });

      it("should show 'Min/Max focal length' only if 'Fixed focal length' is unchecked", () => {
        cy.get("#telescope-field-min-focal-length").should("not.be.visible");
        cy.get("#telescope-field-max-focal-length").should("not.be.visible");
        cy.get("label[for=telescope-field-fixed-focal-length]").click();
        cy.get("#telescope-field-min-focal-length").should("be.visible");
        cy.get("#telescope-field-max-focal-length").should("be.visible");
        cy.get("#telescope-field-min-focal-length").type("800");
        cy.get("#telescope-field-max-focal-length").type("1600");
      });

      it("should create the item", () => {
        cy.route("POST", "**/api/v2/equipment/telescope/", testTelescope).as("createTelescope");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title")
          .contains("Confirm item creation")
          .should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Telescope");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Type", "Refractor: achromatic");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Aperture", "80 mm");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Focal length", "800 - 1600 mm");

        cy.get(".modal-footer .btn-danger").click();

        cy.wait("@createTelescope");

        cy.ngSelectValueShouldContain("#equipment-item-field", "Test brand Test");
      });
    });
  });
});
