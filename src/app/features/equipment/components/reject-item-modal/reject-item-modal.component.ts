import { Component, Input, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import {
  EquipmentItemBaseInterface,
  EquipmentItemReviewerRejectionReason
} from "@features/equipment/types/equipment-item-base.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "@shared/services/loading.service";
import { take, takeUntil } from "rxjs/operators";
import { EquipmentActionTypes, RejectEquipmentItem } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldMessageLevel, FormlyFieldService } from "@shared/services/formly-field.service";
import { Router } from "@angular/router";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Component({
  selector: "astrobin-reject-item-modal",
  templateUrl: "./reject-item-modal.component.html",
  styleUrls: ["./reject-item-modal.component.scss"]
})
export class RejectItemModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    reason?: EquipmentItemReviewerRejectionReason;
    comment: string;
  } = {
    reason: null,
    comment: null
  };

  @Input()
  equipmentItem: EquipmentItemBaseInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly router: Router,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.fields = [
      {
        key: "reason",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        id: "reason",
        templateOptions: {
          required: true,
          clearable: false,
          label: this.translateService.instant("Reason"),
          options: [
            {
              value: EquipmentItemReviewerRejectionReason.TYPO,
              label: this.translateService.instant("The item has a typo in its name")
            },
            {
              value: EquipmentItemReviewerRejectionReason.WRONG_BRAND,
              label: this.translateService.instant(
                "The item doesn't seem to have the correct brand, or the brand is misspelled, or it's the " +
                  "duplicate of an existing brand."
              )
            },
            {
              value: EquipmentItemReviewerRejectionReason.INACCURATE_DATA,
              label: this.translateService.instant("The item has some inaccurate data")
            },
            {
              value: EquipmentItemReviewerRejectionReason.INSUFFICIENT_DATA,
              label: this.translateService.instant("The item has insufficient data")
            },
            {
              value: EquipmentItemReviewerRejectionReason.OTHER,
              label: this.translateService.instant("Other")
            }
          ]
        },
        hooks: {
          onInit: (field: FormlyFieldConfig) => {
            const message = {
              level: FormlyFieldMessageLevel.WARNING,
              text:
                `${this.translateService.instant("Please note")}:` +
                this.translateService.instant("consider making an edit proposal instead.")
            };

            field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
              switch (value) {
                case EquipmentItemReviewerRejectionReason.TYPO:
                case EquipmentItemReviewerRejectionReason.INACCURATE_DATA:
                case EquipmentItemReviewerRejectionReason.INSUFFICIENT_DATA:
                  this.formlyFieldService.addMessage(field.templateOptions, message);
                  break;
                default:
                  this.formlyFieldService.removeMessage(field.templateOptions, message);
              }
            });
          }
        }
      },
      {
        key: "comment",
        type: "textarea",
        id: "comment",
        wrappers: ["default-wrapper"],
        templateOptions: {
          label: this.translateService.instant("Comment"),
          required: false,
          rows: 4
        }
      }
    ];
  }

  reject() {
    this.loadingService.setLoading(true);

    const reason: EquipmentItemReviewerRejectionReason = this.form.get("reason").value;
    const comment: string = this.form.get("comment").value;

    this.store$.dispatch(
      new RejectEquipmentItem({
        item: this.equipmentItem,
        reason,
        comment
      })
    );

    this.actions$.pipe(ofType(EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS), take(1)).subscribe(() => {
      this.loadingService.setLoading(false);
      this.modal.close();
      this.router.navigateByUrl(`/equipment/explorer`).then(() => {
        this.popNotificationsService.success(this.translateService.instant("Item rejected."));
      });
    });
  }
}
