import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { FilterInterface, FilterType } from "@features/equipment/types/filter.interface";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";

export enum FilterDisplayProperty {
  TYPE = "TYPE",
  BANDWIDTH = "BANDWIDTH",
  SIZE = "SIZE"
}

@Injectable({
  providedIn: "root"
})
export class FilterService extends BaseService implements EquipmentItemServiceInterface {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService
  ) {
    super(loadingService);
  }

  humanizeType(type: FilterType) {
    const map = {
      [FilterType.H_ALPHA]: this.translateService.instant("Hydrogen-alpha (Hα)"),
      [FilterType.H_BETA]: this.translateService.instant("Hydrogen-beta (Hβ)"),
      [FilterType.SII]: this.translateService.instant("Sulfur-II (SII)"),
      [FilterType.OIII]: this.translateService.instant("Oxygen-III (OIII)"),
      [FilterType.NII]: this.translateService.instant("Nitrogen-II (NII)"),
      [FilterType.UV]: this.translateService.instant("Ultraviolet (UV)"),
      [FilterType.IR]: this.translateService.instant("Infrared (IR)"),
      [FilterType.MULTIBAND]: this.translateService.instant("Multiband"),
      [FilterType.LP]: this.translateService.instant("Light pollution suppression"),
      [FilterType.L]: this.translateService.instant("Luminance/clear (L)"),
      [FilterType.R]: this.translateService.instant("Red channel (R)"),
      [FilterType.G]: this.translateService.instant("Green channel (G)"),
      [FilterType.B]: this.translateService.instant("Blue channel (B)"),
      [FilterType.ND]: this.translateService.instant("Neutral density (ND)"),
      [FilterType.UHC]: this.translateService.instant("Ultra High Contrast (UHC)"),
      [FilterType.SKY_GLOW]: this.translateService.instant("Sky glow"),
      [FilterType.SOLAR]: this.translateService.instant("Solar"),
      [FilterType.LUNAR]: this.translateService.instant("Lunar"),
      [FilterType.COMETARY]: this.translateService.instant("Cometary"),
      [FilterType.PHOTOMETRIC_U]: this.translateService.instant("Photometric Ultraviolet"),
      [FilterType.PHOTOMETRIC_B]: this.translateService.instant("Photometric Blue"),
      [FilterType.PHOTOMETRIC_V]: this.translateService.instant("Photometric Visual"),
      [FilterType.PHOTOMETRIC_R]: this.translateService.instant("Photometric Red"),
      [FilterType.PHOTOMETRIC_I]: this.translateService.instant("Photometric Infrared"),
      [FilterType.OTHER]: this.translateService.instant("Other")
    };

    return map[type];
  }

  getSupportedPrintableProperties(): string[] {
    return [FilterDisplayProperty.TYPE, FilterDisplayProperty.BANDWIDTH, FilterDisplayProperty.SIZE];
  }

  getPrintableProperty$(
    item: FilterInterface,
    property: FilterDisplayProperty,
    propertyValue?: any
  ): Observable<string> {
    switch (property) {
      case FilterDisplayProperty.TYPE:
        return of(this.humanizeType(propertyValue || item.type));
      case FilterDisplayProperty.BANDWIDTH:
        propertyValue = parseInt(propertyValue, 10);
        return of(propertyValue || item.bandwidth ? `${propertyValue || item.bandwidth} nm` : "");
      case FilterDisplayProperty.SIZE:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.size ? `${propertyValue || item.size} mm` : "");
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }

  getPrintablePropertyName(propertyName: FilterDisplayProperty, shortForm = false): string {
    switch (propertyName) {
      case FilterDisplayProperty.TYPE:
        return this.translateService.instant("Type");
      case FilterDisplayProperty.BANDWIDTH:
        return shortForm
          ? this.translateService.instant("Bandwidth")
          : this.translateService.instant("Bandwidth") + " (nm)";
      case FilterDisplayProperty.SIZE:
        return shortForm ? this.translateService.instant("Size") : this.translateService.instant("Size") + " (mm)";
      default:
        throw Error(`Invalid property: ${propertyName}`);
    }
  }
}
