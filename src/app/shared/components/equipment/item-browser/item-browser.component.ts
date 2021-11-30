import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Action, Store } from "@ngrx/store";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { forkJoin, Observable, of } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import {
  CreateAccessory,
  CreateCamera,
  CreateFilter,
  CreateMount,
  CreateSensor,
  CreateSoftware,
  CreateTelescope,
  EquipmentActionTypes,
  EquipmentItemCreationSuccessPayloadInterface,
  FindAllEquipmentItems,
  FindAllEquipmentItemsSuccess,
  LoadBrand,
  LoadEquipmentItem
} from "@features/equipment/store/equipment.actions";
import { filter, first, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { Actions, ofType } from "@ngrx/effects";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { selectBrand, selectBrands, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { WindowRefService } from "@shared/services/window-ref.service";
import { LoadingService } from "@shared/services/loading.service";
import { ConfirmItemCreationModalComponent } from "@shared/components/equipment/editors/confirm-item-creation-modal/confirm-item-creation-modal.component";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";

type Type = EquipmentItemBaseInterface["id"];
type TypeUnion = Type | Type[] | null;

@Component({
  selector: "astrobin-equipment-item-browser",
  templateUrl: "./item-browser.component.html",
  styleUrls: ["./item-browser.component.scss"]
})
export class ItemBrowserComponent extends BaseComponentDirective implements OnInit {
  EquipmentItemType = EquipmentItemType;

  @Input()
  id = "equipment-item-field";

  @Input()
  initialValue: TypeUnion = null;

  @Input()
  label: string;

  @Input()
  showLabel = true;

  @Input()
  required = true;

  @Input()
  multiple = false;

  model: { value: TypeUnion } = { value: null };
  form: FormGroup = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  creationMode = false;
  subCreationMode = false;

  q: string = null;

  creationForm: FormGroup = new FormGroup({});
  creationModel: Partial<EquipmentItemBaseInterface> = {};

  @ViewChild("equipmentItemLabelTemplate")
  equipmentItemLabelTemplate: TemplateRef<any>;

  @ViewChild("equipmentItemOptionTemplate")
  equipmentItemOptionTemplate: TemplateRef<any>;

  @Input()
  type: EquipmentItemType;

  @Output()
  creationModeStarted = new EventEmitter<void>();

  @Output()
  creationModeEnded = new EventEmitter<void>();

  @Output()
  subCreationModeStarted = new EventEmitter<void>();

  @Output()
  subCreationModeEnded = new EventEmitter<void>();

  @Output()
  valueChanged = new EventEmitter<EquipmentItemBaseInterface | EquipmentItemBaseInterface[] | null>();

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly modalService: NgbModal,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }

  ngOnInit() {
    setTimeout(() => this._setFields(), 1);
  }

  reset() {
    this.model = { value: null };
    this.form.reset();
    this.fields[0].templateOptions.options = of([]);
  }

  startCreationMode() {
    this.creationMode = true;
    this.creationModeStarted.emit();
  }

  endCreationMode() {
    this.creationMode = false;
    this.creationForm.reset();
    this.creationModel = {};
    this.creationModeEnded.emit();
  }

  startSubCreationMode() {
    this.subCreationMode = true;
    this.subCreationModeStarted.emit();
  }

  endSubCreationMode() {
    this.subCreationMode = false;
    this.subCreationModeEnded.emit();
  }

  setValue(value: TypeUnion) {
    if (!value) {
      return;
    }

    if (this.multiple) {
      if ((value as Type[]).length === 0) {
        return;
      }

      (value as Type[]).forEach(id => this.store$.dispatch(new LoadEquipmentItem({ id, type: this.type })));

      forkJoin(
        (value as Type[]).map(id =>
          this.store$.select(selectEquipmentItem, { id, type: this.type }).pipe(
            filter(item => !!item),
            tap(item => {
              if (!!item.brand) {
                this.store$.dispatch(new LoadBrand({ id: item.brand }));
              }
            }),
            switchMap(item => {
              if (!!item.brand) {
                return this.store$.select(selectBrand, item.brand).pipe(
                  filter(brand => !!brand),
                  map(brand => ({ item, brand }))
                );
              }

              return of({ item, brand: null });
            }),
            first()
          )
        )
      )
        .pipe(first())
        .subscribe((results: { item: EquipmentItemBaseInterface; brand: BrandInterface }[]) => {
          const fieldConfig = this.fields[0];

          fieldConfig.templateOptions.options = of(
            results.map(result => this._getNgOptionValue(result.brand, result.item))
          );

          this.model = { value };
          this.form.get("value").setValue(value);
          this.valueChanged.emit(results.map(result => result.item));
        });
    } else {
      this.store$.dispatch(new LoadEquipmentItem({ id: value as Type, type: this.type }));
      this.store$
        .select(selectEquipmentItem, { id: value, type: this.type })
        .pipe(
          filter(item => !!item),
          tap(item => {
            if (!!item.brand) {
              this.store$.dispatch(new LoadBrand({ id: item.brand }));
            }
          }),
          switchMap(item => {
            if (!!item.brand) {
              return this.store$.select(selectBrand, item.brand).pipe(
                filter(brand => !!brand),
                map(brand => ({ item, brand }))
              );
            }

            return of({ item, brand: null });
          })
        )
        .subscribe(({ item, brand }) => {
          const fieldConfig = this.fields[0];

          fieldConfig.templateOptions.options = of([this._getNgOptionValue(brand, item)]);

          this.model = { value };
          this.form.get("value").setValue(value);
          this.valueChanged.emit(item);
        });
    }
  }

  createItem() {
    const data: EquipmentItemBaseInterface = {
      ...this.creationModel,
      ...this.creationForm.value
    };

    const modalRef = this.modalService.open(ConfirmItemCreationModalComponent);
    modalRef.componentInstance.item = data;

    modalRef.closed.pipe(take(1)).subscribe((item: EquipmentItemBaseInterface) => {
      if (item.id === undefined) {
        let action: Action;
        let actionSuccessType: EquipmentActionTypes;

        switch (this.type) {
          case EquipmentItemType.SENSOR:
            action = new CreateSensor({ sensor: item as SensorInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_SENSOR_SUCCESS;
            break;
          case EquipmentItemType.CAMERA:
            const createModifiedVariant = (data as any).createModifiedVariant || false;
            delete (data as any).createModifiedVariant;

            action = new CreateCamera({ camera: item as CameraInterface, createModifiedVariant });
            actionSuccessType = EquipmentActionTypes.CREATE_CAMERA_SUCCESS;
            break;
          case EquipmentItemType.TELESCOPE:
            action = new CreateTelescope({ telescope: item as TelescopeInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_TELESCOPE_SUCCESS;
            break;
          case EquipmentItemType.MOUNT:
            action = new CreateMount({ mount: item as MountInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_MOUNT_SUCCESS;
            break;
          case EquipmentItemType.FILTER:
            action = new CreateFilter({ filter: item as FilterInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_FILTER_SUCCESS;
            break;
          case EquipmentItemType.ACCESSORY:
            action = new CreateAccessory({ accessory: item as AccessoryInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_ACCESSORY_SUCCESS;
            break;
          case EquipmentItemType.SOFTWARE:
            action = new CreateSoftware({ software: item as SoftwareInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_SOFTWARE_SUCCESS;
            break;
        }

        if (action) {
          this.loadingService.setLoading(true);
          this.store$.dispatch(action);
          this.actions$
            .pipe(
              ofType(actionSuccessType),
              take(1),
              map((result: { payload: EquipmentItemCreationSuccessPayloadInterface }) => result.payload.item)
            )
            .subscribe((createdItem: EquipmentItemBaseInterface) => {
              this.itemCreated(createdItem);
              this.loadingService.setLoading(false);
            });
        }
      } else {
        this.itemCreated(item);
      }
    });
  }

  itemCreated(item: EquipmentItemBaseInterface) {
    this.endCreationMode();
    this.endSubCreationMode();

    const _addItem = () => {
      if (this.multiple) {
        this.setValue([...((this.model.value as Type[]) || []), item.id]);
      } else {
        this.setValue(item.id);
      }

      setTimeout(() => {
        this.windowRefService.nativeWindow.document.querySelector(`#${this.id}`).scrollIntoView({ behavior: "smooth" });
      }, 1);
    };

    if (!!item.brand) {
      this.store$.dispatch(new LoadBrand({ id: item.brand }));

      this.store$
        .select(selectBrand, item.brand)
        .pipe(
          filter(brand => !!brand),
          take(1)
        )
        .subscribe(brand => {
          _addItem();
        });
    } else {
      _addItem();
    }
  }

  onCancel() {
    this.endSubCreationMode();
    this.endCreationMode();
  }

  onSubCreationInProgress(inProgress: boolean) {
    if (inProgress) {
      this.startSubCreationMode();
    } else {
      this.endSubCreationMode();
    }
  }

  _setFields() {
    const _addTag = () => {
      this.startCreationMode();
      setTimeout(() => {
        this.windowRefService.nativeWindow.document
          .getElementById("create-new-item")
          .scrollIntoView({ behavior: "smooth" });
      }, 1);
    };

    this.model = { value: this.initialValue };

    this.currentUser$
      .pipe(
        takeUntil(this.destroyed$),
        map(currentUser => {
          this.fields = [
            {
              key: "value",
              type: "ng-select",
              id: `${this.id}`,
              expressionProperties: {
                "templateOptions.disabled": () => this.creationMode
              },
              defaultValue: this.model,
              templateOptions: {
                required: this.required,
                clearable: true,
                label: this.showLabel ? this.label || this.translateService.instant("Find equipment item") : null,
                options: this._getOptions().pipe(takeUntil(this.destroyed$)),
                onSearch: (term: string) => {
                  this._onSearch(term);
                },
                labelTemplate: this.equipmentItemLabelTemplate,
                optionTemplate: this.equipmentItemOptionTemplate,
                addTag: !!currentUser ? _addTag : undefined,
                striped: true,
                multiple: this.multiple,
                closeOnSelect: true
              },
              hooks: {
                onInit: (field: FormlyFieldConfig) => {
                  field.formControl.valueChanges
                    .pipe(
                      takeUntil(this.destroyed$),
                      switchMap((value: TypeUnion) => {
                        if (!value || (Array.isArray(value) && value.length === 0)) {
                          return of([]);
                        }

                        if (Array.isArray(value)) {
                          return forkJoin(
                            (value as EquipmentItemBaseInterface["id"][]).map(id =>
                              this.store$
                                .select(selectEquipmentItem, {
                                  id,
                                  type: this.type
                                })
                                .pipe(
                                  filter(item => !!item),
                                  first()
                                )
                            )
                          ).pipe(filter(items => items.length > 0));
                        }

                        return this.store$
                          .select(selectEquipmentItem, {
                            id: value as EquipmentItemBaseInterface["id"],
                            type: this.type
                          })
                          .pipe(
                            filter(item => !!item),
                            map(item => [item])
                          );
                      })
                    )
                    .subscribe((items: EquipmentItemBaseInterface[]) => {
                      this.valueChanged.emit(this.multiple ? items : items[0]);
                    });
                }
              }
            }
          ];
        })
      )
      .subscribe(() => {
        this.setValue(this.initialValue);
      });
  }

  _getOptions(): Observable<any> {
    if (!this.model.value) {
      return of([]);
    }

    if (this.multiple) {
      const value: Type[] = this.model.value as Type[];

      if (!value || value.length === 0) {
        return of([]);
      }

      (value as Type[]).forEach(id => this.store$.dispatch(new LoadEquipmentItem({ id, type: this.type })));

      return forkJoin(
        value.map(itemId =>
          this.store$.select(selectEquipmentItem, { id: itemId, type: this.type }).pipe(
            takeUntil(this.destroyed$),
            filter(item => !!item),
            tap(item => {
              if (!!item.brand) {
                this.store$.dispatch(new LoadBrand({ id: item.brand }));
              }
            }),
            switchMap(item => {
              if (!!item.brand) {
                return this.store$.select(selectBrand, item.brand).pipe(
                  takeUntil(this.destroyed$),
                  filter(brand => !!brand),
                  map(brand => ({ brand, item }))
                );
              }

              return of({ brand: null, item });
            }),
            map(({ brand, item }) => this._getNgOptionValue(brand, item)),
            first()
          )
        )
      );
    }

    this.store$.dispatch(new LoadEquipmentItem({ id: this.model.value as Type, type: this.type }));

    return this.store$.select(selectEquipmentItem, { id: this.model.value, type: this.type }).pipe(
      filter(item => !!item),
      tap(item => {
        if (!!item.brand) {
          this.store$.dispatch(new LoadBrand({ id: item.brand }));
        }
      }),
      switchMap(item => {
        if (!!item.brand) {
          return this.store$.select(selectBrand, item.brand).pipe(
            takeUntil(this.destroyed$),
            filter(brand => !!brand),
            map(brand => ({ brand, item }))
          );
        }

        return of({ brand: null, item });
      }),
      map(({ brand, item }) => this._getNgOptionValue(brand, item))
    );
  }

  _onSearch(q: string) {
    if (!q || q.length < 1) {
      return of([]);
    }

    this.q = q;

    const field = this.fields[0];
    this.store$.dispatch(
      new FindAllEquipmentItems({
        q,
        type: this.type
      })
    );

    field.templateOptions.options = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS),
      take(1),
      map((action: FindAllEquipmentItemsSuccess) => action.payload.items),
      tap(items => {
        const uniqueBrands: BrandInterface["id"][] = [];
        for (const item of items) {
          if (!!item.brand && uniqueBrands.indexOf(item.brand) === -1) {
            uniqueBrands.push(item.brand);
          }
        }
        uniqueBrands.forEach(id => this.store$.dispatch(new LoadBrand({ id })));
      }),
      switchMap(items =>
        this.store$.select(selectBrands).pipe(
          filter(brands => {
            for (const item of items) {
              if (!!item.brand && !brands.find(brand => brand.id === item.brand)) {
                return false;
              }
            }

            return true;
          }),
          take(1),
          map(brands => ({
            brands,
            items
          }))
        )
      ),
      map((result: { brands: BrandInterface[]; items: EquipmentItemBaseInterface[] }) =>
        result.items.map(item => {
          const brand = result.brands.find(b => b.id === item.brand);
          return this._getNgOptionValue(brand, item);
        })
      )
    );
  }

  _getNgOptionValue(brand: BrandInterface | null, item: EquipmentItemBaseInterface): any {
    return {
      value: item.id,
      label: `${!!brand ? brand.name : this.translateService.instant("(DIY)")} ${item.name}`,
      brand,
      item
    };
  }
}