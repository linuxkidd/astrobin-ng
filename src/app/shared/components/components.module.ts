import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { formlyConfig } from "@app/formly.config";
import { ObjectsInFieldComponent } from "@app/shared/components/misc/objects-in-field/objects-in-field.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbTooltipModule
} from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { FORMLY_CONFIG, FormlyModule } from "@ngx-formly/core";
import { FormlySelectModule } from "@ngx-formly/core/select";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { BreadcrumbComponent } from "@shared/components/misc/breadcrumb/breadcrumb.component";
import { CameraComponent } from "@shared/components/misc/camera/camera.component";
import { FormlyFieldChunkedFileComponent } from "@shared/components/misc/formly-field-chunked-file/formly-field-chunked-file.component";
import { FormlyFieldImageCropperComponent } from "@shared/components/misc/formly-field-image-cropper/formly-field-image-cropper.component";
import { FormlyFieldNgSelectComponent } from "@shared/components/misc/formly-field-ng-select/formly-field-ng-select.component";
import { FormlyFieldStepperComponent } from "@shared/components/misc/formly-field-stepper/formly-field-stepper.component";
import { FullscreenImageViewerComponent } from "@shared/components/misc/fullscreen-image-viewer/fullscreen-image-viewer.component";
import { ImageComponent } from "@shared/components/misc/image/image.component";
import { LoadingIndicatorComponent } from "@shared/components/misc/loading-indicator/loading-indicator.component";
import { RefreshButtonComponent } from "@shared/components/misc/refresh-button/refresh-button.component";
import { TelescopeComponent } from "@shared/components/misc/telescope/telescope.component";
import { TextLoadingIndicatorComponent } from "@shared/components/misc/text-loading-indicator/text-loading-indicator.component";
import { PipesModule } from "@shared/pipes/pipes.module";
import { NgWizardModule } from "ng-wizard";
import { NgxFilesizeModule } from "ngx-filesize";
import { ImageCropperModule } from "ngx-image-cropper";
import { NgxImageZoomModule } from "ngx-image-zoom";
import { UploadxModule } from "ngx-uploadx";
import { LoginFormComponent } from "./auth/login-form/login-form.component";
import { LoginModalComponent } from "./auth/login-modal/login-modal.component";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";
import { EmptyListComponent } from "./misc/empty-list/empty-list.component";
import { ReadOnlyModeComponent } from "./misc/read-only-mode/read-only-mode.component";
import { UsernameComponent } from "./misc/username/username.component";
import { FormlyWrapperComponent } from "@shared/components/misc/formly-wrapper/formly-wrapper.component";
import { FormlyFieldGoogleMapComponent } from "@shared/components/misc/formly-field-google-map/formly-field-google-map.component";
import { ToggleButtonComponent } from "@shared/components/misc/toggle-button/toggle-button.component";
import { NgToggleModule } from "ng-toggle-button";
import { FormlyFieldCKEditorComponent } from "@shared/components/misc/formly-field-ckeditor/formly-field-ckeditor.component";
import { FileValueAccessorDirective } from "@shared/components/misc/formly-field-file/file-value-accessor.directive";
import { FormlyFieldFileComponent } from "@shared/components/misc/formly-field-file/formly-field-file.component";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { NothingHereComponent } from "@shared/components/misc/nothing-here/nothing-here.component";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { NestedCommentsComponent } from "@shared/components/misc/nested-comments/nested-comments.component";
import { NestedCommentComponent } from "@shared/components/misc/nested-comments/nested-comment.component";
import { TimeagoModule } from "ngx-timeago";
import { ItemBrowserComponent } from "@shared/components/equipment/item-browser/item-browser.component";
import { ItemSummaryComponent } from "@shared/components/equipment/summaries/item-summary/item-summary.component";
import { BrandSummaryComponent } from "@shared/components/equipment/summaries/brand-summary/brand-summary.component";
import { CameraEditorComponent } from "@shared/components/equipment/editors/camera-editor/camera-editor.component";
import { SensorEditorComponent } from "@shared/components/equipment/editors/sensor-editor/sensor-editor.component";
import { TelescopeEditorComponent } from "@shared/components/equipment/editors/telescope-editor/telescope-editor.component";
import { MountEditorComponent } from "@shared/components/equipment/editors/mount-editor/mount-editor.component";
import { FilterEditorComponent } from "@shared/components/equipment/editors/filter-editor/filter-editor.component";
import { SoftwareEditorComponent } from "@shared/components/equipment/editors/software-editor/software-editor.component";
import { BaseItemEditorComponent } from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { BrandEditorCardComponent } from "@shared/components/equipment/editors/brand-editor-card/brand-editor-card.component";
import { BrandEditorFormComponent } from "@shared/components/equipment/editors/brand-editor-form/brand-editor-form.component";
import { AccessoryEditorComponent } from "@shared/components/equipment/editors/accessory-editor/accessory-editor.component";
import { SimilarItemsSuggestionComponent } from "@shared/components/equipment/similar-items-suggestion/similar-items-suggestion.component";
import { ConfirmItemCreationModalComponent } from "@shared/components/equipment/editors/confirm-item-creation-modal/confirm-item-creation-modal.component";
import { OthersInBrandComponent } from "@shared/components/equipment/editors/others-in-brand/others-in-brand.component";
import { CustomToastComponent } from "@shared/components/misc/custom-toast/custom-toast.component";
import { NestedCommentsModalComponent } from "@shared/components/misc/nested-comments-modal/nested-comments-modal.component";
import { NestedCommentsCountComponent } from "@shared/components/misc/nested-comments-count/nested-comments-count.component";
import { CountDownComponent } from "@shared/components/misc/count-down/count-down.component";
import { ScrollToTopComponent } from "@shared/components/misc/scroll-to-top/scroll-to-top.component";

const modules = [
  CommonModule,
  FontAwesomeModule,
  FormsModule,
  FormlySelectModule,
  ImageCropperModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbTooltipModule,
  NgSelectModule,
  NgToggleModule,
  NgxFilesizeModule,
  NgxImageZoomModule,
  NgWizardModule,
  PipesModule,
  ReactiveFormsModule,
  RouterModule,
  TimeagoModule,
  TranslateModule,
  FormlyModule,
  UploadxModule
];

const components = [
  BreadcrumbComponent,
  CameraComponent,
  CountDownComponent,
  CustomToastComponent,
  EmptyListComponent,
  FileValueAccessorDirective,
  FooterComponent,
  FormlyFieldChunkedFileComponent,
  FormlyFieldCKEditorComponent,
  FormlyFieldFileComponent,
  FormlyFieldGoogleMapComponent,
  FormlyFieldImageCropperComponent,
  FormlyFieldNgSelectComponent,
  FormlyFieldStepperComponent,
  FormlyWrapperComponent,
  FullscreenImageViewerComponent,
  HeaderComponent,
  ImageComponent,
  LoadingIndicatorComponent,
  LoginFormComponent,
  LoginModalComponent,
  NestedCommentComponent,
  NestedCommentsComponent,
  NestedCommentsModalComponent,
  NestedCommentsCountComponent,
  NothingHereComponent,
  ObjectsInFieldComponent,
  ReadOnlyModeComponent,
  RefreshButtonComponent,
  ScrollToTopComponent,
  TelescopeComponent,
  TextLoadingIndicatorComponent,
  ToggleButtonComponent,
  UsernameComponent,

  // Equipment
  ItemBrowserComponent,
  ItemSummaryComponent,
  BrandSummaryComponent,
  CameraEditorComponent,
  SensorEditorComponent,
  TelescopeEditorComponent,
  MountEditorComponent,
  FilterEditorComponent,
  AccessoryEditorComponent,
  SoftwareEditorComponent,
  BaseItemEditorComponent,
  BrandEditorCardComponent,
  BrandEditorFormComponent,
  SimilarItemsSuggestionComponent,
  ConfirmItemCreationModalComponent,
  OthersInBrandComponent
];

const services = [UsernameService];

@NgModule({
  imports: [modules],
  declarations: components,
  exports: components,
  providers: [
    {
      provide: FORMLY_CONFIG,
      useFactory: formlyConfig,
      multi: true,
      deps: [TranslateService, JsonApiService]
    },
    ...services
  ]
})
export class ComponentsModule {}
