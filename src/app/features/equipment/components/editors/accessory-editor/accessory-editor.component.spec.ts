import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AccessoryEditorComponent } from "./accessory-editor.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { AppModule } from "@app/app.module";
import { BrandEditorCardComponent } from "@features/equipment/components/editors/brand-editor-card/brand-editor-card.component";

describe("AccessoryEditorComponent", () => {
  let component: AccessoryEditorComponent;
  let fixture: ComponentFixture<AccessoryEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(AccessoryEditorComponent, EquipmentModule)
      .mock(AppModule)
      .provide([provideMockStore({ initialState }), provideMockActions(() => new ReplaySubject<any>())])
      .mock(BrandEditorCardComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessoryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
