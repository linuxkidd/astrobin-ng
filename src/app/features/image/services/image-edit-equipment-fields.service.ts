import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { BaseService } from "@shared/services/base.service";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { of } from "rxjs";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

@Injectable({
  providedIn: null
})
export class ImageEditEquipmentFieldsService extends BaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService
  ) {
    super(loadingService);
  }

  getImagingTelescopes(): FormlyFieldConfig {
    return {
      key: "imagingTelescopes2",
      type: "equipment-item-browser",
      id: "image-imaging-telescopes-field",
      templateOptions: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Telescopes or lenses"),
        itemType: EquipmentItemType.TELESCOPE
      }
    };
  }

  getImagingCameras(): FormlyFieldConfig {
    return {
      key: "imagingCameras2",
      type: "equipment-item-browser",
      id: "image-imaging-cameras-field",
      templateOptions: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Cameras"),
        itemType: EquipmentItemType.CAMERA
      }
    };
  }

  getMounts(): FormlyFieldConfig {
    return {
      key: "mounts2",
      type: "equipment-item-browser",
      id: "image-mounts-field",
      templateOptions: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Mounts"),
        itemType: EquipmentItemType.MOUNT
      }
    };
  }

  getFilters(): FormlyFieldConfig {
    return {
      key: "filters2",
      type: "equipment-item-browser",
      id: "image-filters-field",
      templateOptions: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Filters"),
        itemType: EquipmentItemType.FILTER
      }
    };
  }

  getAccessories(): FormlyFieldConfig {
    return {
      key: "accessories2",
      type: "equipment-item-browser",
      id: "image-accessories-field",
      templateOptions: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Accessories"),
        itemType: EquipmentItemType.ACCESSORY
      }
    };
  }

  getSoftware(): FormlyFieldConfig {
    return {
      key: "software2",
      type: "equipment-item-browser",
      id: "image-software-field",
      templateOptions: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Software"),
        itemType: EquipmentItemType.SOFTWARE
      }
    };
  }

  getShowGuidingEquipment(): FormlyFieldConfig {
    return {
      key: "showGuidingEquipment",
      type: "checkbox",
      wrappers: ["default-wrapper"],
      id: "image-show-guiding-equipment-field",
      defaultValue:
        (this.imageEditService.model.guidingTelescopes2 && this.imageEditService.model.guidingTelescopes2.length > 0) ||
        (this.imageEditService.model.guidingCameras2 && this.imageEditService.model.guidingCameras2.length > 0),
      templateOptions: {
        required: false,
        label: this.translateService.instant("Show guiding equipment")
      }
    };
  }

  getGuidingTelescopes(): FormlyFieldConfig {
    return {
      key: "guidingTelescopes2",
      type: "equipment-item-browser",
      id: "image-guiding-telescopes-field",
      hideExpression: () => !this.imageEditService.model.showGuidingEquipment,
      templateOptions: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Guiding telescopes or lenses"),
        itemType: EquipmentItemType.TELESCOPE
      }
    };
  }

  getGuidingCameras(): FormlyFieldConfig {
    return {
      key: "guidingCameras2",
      type: "equipment-item-browser",
      id: "image-guiding-cameras-field",
      hideExpression: () => !this.imageEditService.model.showGuidingEquipment,
      templateOptions: {
        multiple: true,
        required: false,
        label: this.translateService.instant("Guiding cameras"),
        itemType: EquipmentItemType.CAMERA
      }
    };
  }
}