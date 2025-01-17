import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ReviewGearRenamingProposalsComponent } from "./review-gear-renaming-proposals.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { ActivatedRoute } from "@angular/router";

describe("ReviewGearRenamingProposalsComponent", () => {
  let component: ReviewGearRenamingProposalsComponent;
  let fixture: ComponentFixture<ReviewGearRenamingProposalsComponent>;

  beforeEach(async () => {
    await MockBuilder(ReviewGearRenamingProposalsComponent, AppModule).provide([
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: { get: key => "camera" }
          }
        }
      }
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewGearRenamingProposalsComponent);
    component = fixture.componentInstance;

    jest.spyOn(component, "getProposals").mockImplementation(() => {});

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
