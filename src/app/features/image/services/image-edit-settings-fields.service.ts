import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import {
  DownloadLimitationOptions,
  FullSizeLimitationDisplayOptions,
  LicenseOptions,
  MouseHoverImageOptions
} from "@shared/interfaces/image.interface";
import { KeyValueTagsValidator } from "@features/image/services/image-edit.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: null
})
export class ImageEditSettingsFieldsService extends BaseService {
  constructor(public readonly loadingService: LoadingService, public readonly translateService: TranslateService) {
    super(loadingService);
  }

  getLicenseField(): any {
    return {
      key: "license",
      type: "ng-select",
      id: "image-license-field",
      templateOptions: {
        required: true,
        clearable: false,
        label: this.translateService.instant("License"),
        description: this.translateService.instant(
          "You can associate a Creative Commons license with your content if you wish, to grant " +
            "people the right to use your work under certain circumstances. For more information on what your options " +
            "are, please visit the {{0}}Creative Commons website{{1}}.",
          {
            0: `<a target="_blank" href="https://creativecommons.org/choose/">`,
            1: `</a>`
          }
        ),
        options: [
          {
            value: LicenseOptions.ALL_RIGHTS_RESERVED,
            label: this.translateService.instant("None (All rights reserved)")
          },
          {
            value: LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_SHARE_ALIKE,
            label: this.translateService.instant("Attribution-NonCommercial-ShareAlike Creative Commons")
          },
          {
            value: LicenseOptions.ATTRIBUTION_NON_COMMERCIAL,
            label: this.translateService.instant("Attribution-NonCommercial Creative Commons")
          },
          {
            value: LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_NO_DERIVS,
            label: this.translateService.instant("Attribution-NonCommercial-NoDerivs Creative Commons")
          },
          {
            value: LicenseOptions.ATTRIBUTION,
            label: this.translateService.instant("Attribution Creative Commons")
          },
          {
            value: LicenseOptions.ATTRIBUTION_SHARE_ALIKE,
            label: this.translateService.instant("Attribution-ShareAlike Creative Commons")
          },
          {
            value: LicenseOptions.ATTRIBUTION_NO_DERIVS,
            label: this.translateService.instant("Attribution-NoDerivs Creative Commons")
          }
        ]
      }
    };
  }

  getMouseHoverImageField(): any {
    return {
      key: "mouseHoverImage",
      type: "ng-select",
      id: "image-mouse-hover-image-field",
      templateOptions: {
        required: true,
        clearable: false,
        label: this.translateService.instant("Mouse hover image"),
        description: this.translateService.instant(
          "Choose what will be displayed when somebody hovers the mouse over this image. Please note: only " +
            "revisions with the same width and height of your original image can be considered."
        ),
        options: [
          {
            value: MouseHoverImageOptions.NOTHING,
            label: this.translateService.instant("Nothing")
          },
          {
            value: MouseHoverImageOptions.SOLUTION,
            label: this.translateService.instant("Plate-solution annotations (if available)")
          },
          {
            value: MouseHoverImageOptions.INVERTED,
            label: this.translateService.instant("Inverted monochrome")
          }
        ]
      }
    };
  }

  getKeyValueTagsField(): any {
    return {
      key: "keyValueTags",
      type: "textarea",
      wrappers: ["default-wrapper"],
      id: "image-key-value-tags-field",
      templateOptions: {
        label: this.translateService.instant("Key/value tags"),
        description:
          this.translateService.instant(
            "Provide a list of unique key/value pairs to tag this image with. Use the '=' symbol between key and " +
              "value, and provide one pair per line. These tags can be used to sort images by arbitrary properties."
          ) +
          " <a target='_blank' href='https://welcome.astrobin.com/image-collections'>" +
          this.translateService.instant("Learn more") +
          "</a>.",
        required: false,
        rows: 4
      },
      validators: {
        validation: [KeyValueTagsValidator]
      }
    };
  }

  getAllowCommentsField(): any {
    return {
      key: "allowComments",
      type: "checkbox",
      id: "image-allow-comments-field",
      templateOptions: {
        label: this.translateService.instant("Allow comments")
      }
    };
  }

  getFullSizeDisplayLimitationField(): any {
    return {
      key: "fullSizeDisplayLimitation",
      type: "ng-select",
      id: "image-full-size-display-limitation-field",
      templateOptions: {
        clearable: false,
        label: this.translateService.instant("Allow full-size display"),
        options: [
          {
            value: FullSizeLimitationDisplayOptions.EVERYBODY,
            label: this.translateService.instant("Everybody")
          },
          {
            value: FullSizeLimitationDisplayOptions.PAYING,
            label: this.translateService.instant("Paying members only")
          },
          {
            value: FullSizeLimitationDisplayOptions.MEMBERS,
            label: this.translateService.instant("Members only")
          },
          {
            value: FullSizeLimitationDisplayOptions.ME,
            label: this.translateService.instant("Me only")
          },
          {
            value: FullSizeLimitationDisplayOptions.NOBODY,
            label: this.translateService.instant("Nobody")
          }
        ]
      }
    };
  }

  getDownloadLimitationField(): any {
    return {
      key: "downloadLimitation",
      type: "ng-select",
      id: "image-download-limitation-field",
      templateOptions: {
        clearable: false,
        label: this.translateService.instant("Display download menu"),
        options: [
          {
            value: DownloadLimitationOptions.EVERYBODY,
            label: this.translateService.instant("Everybody")
          },
          {
            value: DownloadLimitationOptions.ME_ONLY,
            label: this.translateService.instant("Me only")
          }
        ]
      }
    };
  }
}
