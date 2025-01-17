import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Action, Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { ActivatedRoute, Router } from "@angular/router";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormGroup } from "@angular/forms";
import { LoadingService } from "@shared/services/loading.service";
import {
  ApproveEquipmentItemEditProposalSuccess,
  ApproveEquipmentItemSuccess,
  CreateAccessoryEditProposal,
  CreateCameraEditProposal,
  CreateFilterEditProposal,
  CreateMountEditProposal,
  CreateSensorEditProposal,
  CreateSoftwareEditProposal,
  CreateTelescopeEditProposal,
  EquipmentActionTypes,
  FindEquipmentItemEditProposals,
  LoadBrand,
  LoadEquipmentItem
} from "@features/equipment/store/equipment.actions";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { Actions, ofType } from "@ngrx/effects";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { EquipmentItemEditorMode } from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { ItemBrowserComponent } from "@shared/components/equipment/item-browser/item-browser.component";
import { Observable } from "rxjs";
import {
  selectBrand,
  selectEditProposalsForItem,
  selectEquipmentItem
} from "@features/equipment/store/equipment.selectors";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Location } from "@angular/common";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { RejectItemModalComponent } from "@features/equipment/components/reject-item-modal/reject-item-modal.component";
import { ApproveItemModalComponent } from "@features/equipment/components/approve-item-modal/approve-item-modal.component";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MergeIntoModalComponent } from "@features/equipment/components/migration/merge-into-modal/merge-into-modal.component";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { BrandInterface } from "@features/equipment/types/brand.interface";

@Component({
  selector: "astrobin-equipment-explorer",
  templateUrl: "./explorer.component.html",
  styleUrls: ["./explorer.component.scss"]
})
export class ExplorerComponent extends BaseComponentDirective implements OnInit {
  EquipmentItemType = EquipmentItemType;
  EquipmentItemEditorMode = EquipmentItemEditorMode;

  @Input()
  activeType: EquipmentItemType;

  @Input()
  activeId: EquipmentItemBaseInterface["id"];

  @Input()
  activeEditProposalId: EditProposalInterface<EquipmentItemBaseInterface>["id"];

  @Input()
  routingBasePath = "/equipment/explorer";

  selectedItem: EquipmentItemBaseInterface | null = null;

  editMode = false;
  editForm = new FormGroup({});
  editModel: Partial<EditProposalInterface<EquipmentItemBaseInterface>> = {};

  selectedItemEditProposals$: Observable<EditProposalInterface<EquipmentItemBaseInterface>[]>;

  @ViewChild("itemBrowser")
  private _itemBrowser: ItemBrowserComponent;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly windowRefService: WindowRefService,
    public readonly location: Location,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  get proposeEditButtonDisabled(): boolean {
    return !this.editForm.valid;
  }

  ngOnInit() {
    this._initActiveId();
    this._initActions();
  }

  _initActiveId() {
    if (this.activeId) {
      this.store$.dispatch(new LoadEquipmentItem({ id: this.activeId, type: this.activeType }));

      this.store$
        .select(selectEquipmentItem, { id: this.activeId, type: this.activeType })
        .pipe(
          filter(item => !!item),
          take(1)
        )
        .subscribe(item => this.setItem(item));
    }
  }

  _initActions() {
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS),
        takeUntil(this.destroyed$),
        map((action: ApproveEquipmentItemEditProposalSuccess) => action.payload.editProposal),
        filter(editProposal => editProposal.editProposalTarget === this.selectedItem?.id),
        tap(editProposal =>
          this.store$.dispatch(new LoadEquipmentItem({ id: this.selectedItem.id, type: this.activeType }))
        ),
        switchMap(() =>
          this.store$.select(selectEquipmentItem, { id: this.selectedItem.id, type: this.activeType }).pipe(
            filter(item => !!item),
            take(1)
          )
        )
      )
      .subscribe(item => {
        this.setItem(item);
      });
  }

  startEditMode() {
    if (this.equipmentItemService.getType(this.selectedItem) === EquipmentItemType.CAMERA) {
      const camera: CameraInterface = this.selectedItem as CameraInterface;
      if (camera.modified) {
        this.popNotificationsService.warning(
          `"Modified" cameras cannot be edited directly. Please find the regular version of this camera and
          edit that.`
        );
        return;
      }
    }

    this.editMode = true;
    this.editModel = { ...this.selectedItem };

    const scrollToName = () => {
      const $element = this.windowRefService.nativeWindow.document.querySelector("#equipment-item-field-name");
      if ($element) {
        $element.scrollIntoView({ behavior: "smooth" });
      } else {
        setTimeout(() => {
          scrollToName();
        }, 100);
      }
    };

    scrollToName();
  }

  endEditMode() {
    this.editMode = false;
    this.editModel = {};
    this.editForm.reset();
  }

  startMigrationMode() {
    const modal: NgbModalRef = this.modalService.open(MergeIntoModalComponent);
    const componentInstance: MergeIntoModalComponent = modal.componentInstance;

    componentInstance.activeType = this.activeType;
    componentInstance.equipmentItem = this.selectedItem;
  }

  startApproval() {
    const modal: NgbModalRef = this.modalService.open(ApproveItemModalComponent);
    const componentInstance: ApproveItemModalComponent = modal.componentInstance;

    componentInstance.equipmentItem = this.selectedItem;

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS),
        map((action: ApproveEquipmentItemSuccess) => action.payload.item),
        filter(item => item.id === this.selectedItem.id),
        take(1)
      )
      .subscribe(item => {
        this.setItem(item);
        this.popNotificationsService.success(this.translateService.instant("Item approved."));
      });
  }

  startRejection() {
    const modal: NgbModalRef = this.modalService.open(RejectItemModalComponent);
    const componentInstance: RejectItemModalComponent = modal.componentInstance;

    componentInstance.equipmentItem = this.selectedItem;

    modal.closed.pipe(take(1)).subscribe(() => {
      this.resetBrowser();
    });
  }

  resetBrowser() {
    this._itemBrowser.reset();
    this.selectedItem = null;
    this.endEditMode();
  }

  setItem(item: EquipmentItemBaseInterface) {
    this.selectedItem = item;

    if (!!item.brand) {
      this.store$.dispatch(new LoadBrand({ id: item.brand }));
    }

    this.endEditMode();
    this.loadEditProposals();
  }

  onItemSelected(item: EquipmentItemBaseInterface) {
    const _setItem = (brand: BrandInterface | null) => {
      const slug = UtilsService.slugify(
        `${!!brand ? brand.name : this.translateService.instant("(DIY)")} ${item.name}`
      );

      this.setItem(item);

      this.location.replaceState(`${this.routingBasePath}/${this.activeType.toLowerCase()}/${item.id}/${slug}`);
    };

    if (item) {
      if (!!item.brand) {
        this.store$
          .select(selectBrand, item.brand)
          .pipe(
            filter(brand => !!brand),
            take(1)
          )
          .subscribe(brand => {
            _setItem(brand);
          });
      } else {
        _setItem(null);
      }
    } else {
      this.location.replaceState(`${this.routingBasePath}/${this.activeType.toLowerCase()}`);
    }
  }

  onCreationModeStarted() {
    this.selectedItem = null;
    this.endEditMode();
  }

  proposeEdit() {
    let action: Action;
    let actionSuccessType: EquipmentActionTypes;

    // Remove id and set `editModelTarget`.
    const { id, ...editModelWithTarget } = { ...this.editModel, ...{ editProposalTarget: this.editModel.id } };

    switch (this.activeType) {
      case EquipmentItemType.SENSOR:
        action = new CreateSensorEditProposal({
          sensor: editModelWithTarget as EditProposalInterface<SensorInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.CAMERA:
        action = new CreateCameraEditProposal({
          camera: editModelWithTarget as EditProposalInterface<CameraInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.TELESCOPE:
        action = new CreateTelescopeEditProposal({
          telescope: editModelWithTarget as EditProposalInterface<TelescopeInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.MOUNT:
        action = new CreateMountEditProposal({
          mount: editModelWithTarget as EditProposalInterface<MountInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.FILTER:
        action = new CreateFilterEditProposal({
          filter: editModelWithTarget as EditProposalInterface<FilterInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_FILTER_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.ACCESSORY:
        action = new CreateAccessoryEditProposal({
          accessory: editModelWithTarget as EditProposalInterface<AccessoryInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_ACCESSORY_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.SOFTWARE:
        action = new CreateSoftwareEditProposal({
          software: editModelWithTarget as EditProposalInterface<SoftwareInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_SOFTWARE_EDIT_PROPOSAL_SUCCESS;
        break;
    }

    if (action) {
      this.loadingService.setLoading(true);
      this.store$.dispatch(action);
      this.actions$
        .pipe(
          ofType(actionSuccessType),
          take(1),
          map(
            (result: { payload: { editProposal: EditProposalInterface<EquipmentItemBaseInterface> } }) =>
              result.payload.editProposal
          )
        )
        .subscribe((createdEditProposal: EditProposalInterface<EquipmentItemBaseInterface>) => {
          this.editProposalCreated();
          this.loadingService.setLoading(false);
        });
    }
  }

  editProposalCreated() {
    this.popNotificationsService.success(
      this.translateService.instant(
        "Thanks! Your edit proposal has been submitted and will be reviewed as soon as possible."
      )
    );
    this.loadEditProposals();
    this.endEditMode();
  }

  loadEditProposals() {
    this.store$.dispatch(new FindEquipmentItemEditProposals({ item: this.selectedItem }));
    this.selectedItemEditProposals$ = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS_SUCCESS),
      take(1),
      switchMap(() => this.store$.select(selectEditProposalsForItem, this.selectedItem))
    );
  }

  typeSupportsMigrateInto() {
    return this.activeType !== EquipmentItemType.SENSOR;
  }
}
