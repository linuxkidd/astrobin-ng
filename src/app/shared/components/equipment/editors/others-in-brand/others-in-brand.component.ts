import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";

@Component({
  selector: "astrobin-equipment-others-in-brand",
  templateUrl: "./others-in-brand.component.html",
  styleUrls: ["./others-in-brand.component.scss"]
})
export class OthersInBrandComponent extends BaseComponentDirective {
  @Input()
  items: EquipmentItemBaseInterface[];

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }

  get message(): string {
    return this.translateService.instant(
      "This brand has <strong>{{0}}</strong> items in AstroBin's database. Take a look at them so you can be " +
        "consistent with the naming conventions:",
      {
        0: this.items?.length
      }
    );
  }
}
