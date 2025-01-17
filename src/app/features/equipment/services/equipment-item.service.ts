import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { TranslateService } from "@ngx-translate/core";
import { EditProposalChange, EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { Observable, of } from "rxjs";
import { getEquipmentItemType } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemServiceFactory } from "@features/equipment/services/equipment-item.service-factory";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";

export enum EquipmentItemDisplayProperty {
  BRAND = "BRAND",
  NAME = "NAME",
  WEBSITE = "WEBSITE",
  IMAGE = "IMAGE"
}

@Injectable({
  providedIn: "root"
})
export class EquipmentItemService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly utilsService: UtilsService,
    public readonly translateService: TranslateService,
    public readonly equipmentItemServiceFactory: EquipmentItemServiceFactory,
    public readonly equipmentApiService: EquipmentApiService
  ) {
    super(loadingService);
  }

  getType(item: EquipmentItemBaseInterface): EquipmentItemType {
    return getEquipmentItemType(item);
  }

  humanizeType(type: EquipmentItemType) {
    switch (type) {
      case EquipmentItemType.CAMERA:
        return this.translateService.instant("Camera");
      case EquipmentItemType.SENSOR:
        return this.translateService.instant("Sensor");
      case EquipmentItemType.TELESCOPE:
        return this.translateService.instant("Telescope");
      case EquipmentItemType.MOUNT:
        return this.translateService.instant("Mount");
      case EquipmentItemType.FILTER:
        return this.translateService.instant("Filter");
      case EquipmentItemType.ACCESSORY:
        return this.translateService.instant("Accessory");
      case EquipmentItemType.SOFTWARE:
        return this.translateService.instant("Software");
    }
  }

  getName$(item: EquipmentItemBaseInterface | BrandInterface): Observable<string> {
    try {
      return this.getPrintableProperty$(
        item as EquipmentItemBaseInterface,
        EquipmentItemDisplayProperty.NAME,
        item.name
      );
    } catch (e) {
      return of(item.name);
    }
  }

  getPrintableProperty$(
    item: EquipmentItemBaseInterface,
    propertyName: any,
    propertyValue: any
  ): Observable<string | null> {
    if (propertyValue === undefined || propertyValue === null) {
      return of(null);
    }

    const service = this.equipmentItemServiceFactory.getService(item);
    if (service.getSupportedPrintableProperties().indexOf(propertyName) > -1) {
      return service.getPrintableProperty$(item, propertyName, propertyValue);
    }

    switch (propertyName) {
      case EquipmentItemDisplayProperty.BRAND:
        return of(propertyValue.toString());
      case EquipmentItemDisplayProperty.NAME:
        return of(propertyValue.toString());
      case EquipmentItemDisplayProperty.WEBSITE:
        return of(propertyValue.toString());
      case EquipmentItemDisplayProperty.IMAGE:
        return of(
          propertyValue || item[propertyName]
            ? `<a href="${propertyValue || item[propertyName]}" target="_blank">${this.translateService.instant(
                "Image"
              )}</a>`
            : null
        );
    }
  }

  getPrintablePropertyName(type: EquipmentItemType, propertyName: any, shortForm = false): string {
    switch (propertyName) {
      case EquipmentItemDisplayProperty.BRAND:
        return this.translateService.instant("Brand");
      case EquipmentItemDisplayProperty.NAME:
        return this.translateService.instant("Name");
      case EquipmentItemDisplayProperty.WEBSITE:
        return this.translateService.instant("Website");
      case EquipmentItemDisplayProperty.IMAGE:
        return this.translateService.instant("Image");
    }

    return this.equipmentItemServiceFactory.getServiceByType(type).getPrintablePropertyName(propertyName, shortForm);
  }

  propertyNameToPropertyEnum(propertyName: string): string {
    return UtilsService.camelCaseToCapsCase(propertyName);
  }

  changes(
    item: EquipmentItemBaseInterface,
    editProposal: EditProposalInterface<EquipmentItemBaseInterface>
  ): Observable<EditProposalChange[]> {
    if (this.getType(item) !== this.getType(editProposal)) {
      throw Error("Cannot detect changes for items of different types");
    }

    const ignoredKeys = [
      "id",
      "created",
      "createdBy",
      "updated",
      "deleted",

      "reviewedBy",
      "reviewedTimestamp",
      "reviewerDecision",
      "reviewerRejectionReason",
      "reviewerComment",

      "editProposalOriginalProperties",
      "editProposalTarget",
      "editProposalBy",
      "editProposalCreated",
      "editProposalUpdated",
      "editProposalIp",
      "editProposalComment",
      "editProposalReviewedBy",
      "editProposalReviewTimestamp",
      "editProposalReviewIp",
      "editProposalReviewComment",
      "editProposalReviewStatus",

      "modified"
    ];

    const nonNullableKeys = ["image"];

    const _getChanges = (createModifiedVariantChange: boolean): EditProposalChange[] => {
      const changes: EditProposalChange[] = [];

      let originalProperties:
        | {
            name: string;
            value: string | null;
          }[]
        | null = null;

      if (editProposal.editProposalOriginalProperties) {
        originalProperties = editProposal.editProposalOriginalProperties.split(",").map(property => {
          const pair = property.split("=");
          const name = pair[0];
          let value: any = pair[1];

          if (value === "null" || value === "") {
            value = null;
          } else if (value?.toLowerCase() === "true") {
            value = true;
          } else if (value?.toLowerCase() === "false") {
            value = false;
          } else if (UtilsService.isString(value) && UtilsService.isNumeric(value) && value.indexOf(".") > -1) {
            try {
              value = parseFloat(value);
            } catch (e) {}
          } else if (UtilsService.isString(value) && UtilsService.isNumeric(value)) {
            try {
              value = parseInt(value, 10);
            } catch (e) {}
          }

          return { name, value };
        });
      }

      for (const key of Object.keys(item)) {
        let originalProperty = null;

        if (!!editProposal.editProposalReviewStatus && !!originalProperties) {
          originalProperty = originalProperties.find(property => UtilsService.toCamelCase(property.name) === key);
        }

        if (ignoredKeys.indexOf(key) > -1) {
          continue;
        }

        if (nonNullableKeys.indexOf(key) > -1 && (editProposal[key] === null || editProposal[key] === undefined)) {
          continue;
        }

        if ((!!originalProperty && originalProperty.value !== editProposal[key]) || item[key] !== editProposal[key]) {
          if (!editProposal.editProposalReviewStatus) {
            // The edit proposal is pending: build a diff using the current status of the item.
            changes.push({ propertyName: key, before: item[key], after: editProposal[key] });
          } else if (!!originalProperties) {
            // The edit proposal has been finalized: build a diff using the original edit proposal properties.
            if (!!originalProperty) {
              changes.push({ propertyName: key, before: originalProperty.value, after: editProposal[key] });
            }
          }
        }
      }

      if (createModifiedVariantChange) {
        changes.push({ propertyName: "createModifiedVariant", before: "false", after: "true" });
      }

      return changes;
    };

    return new Observable<EditProposalChange[]>(observer => {
      if (this.getType(item) === EquipmentItemType.CAMERA && editProposal.createModifiedVariant) {
        // We need to make sure we're actually requesting to create a modified variant. The original item does not store
        // if a modified variant was created, so we need to try and find it.
        this.equipmentApiService
          .getByProperties(EquipmentItemType.CAMERA, {
            brand: item.brand,
            name: item.name,
            modified: true
          })
          .subscribe(modifiedVariant => {
            observer.next(_getChanges(!modifiedVariant));
            observer.complete();
          });
      } else {
        observer.next(_getChanges(false));
        observer.complete();
      }
    });
  }

  nameChangeWarningMessage(): string {
    return this.translateService.instant(
      "<strong>Careful!</strong> Change the name only to fix a typo or the naming convention. This operation will " +
        "change the name of this equipment item <strong>for all AstroBin images that use it</strong>, so you should " +
        "not change the name if it becomes a different product."
    );
  }
}
