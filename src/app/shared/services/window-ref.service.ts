import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";

// @ts-ignore
// tslint:disable-next-line:no-empty-interface
export interface CustomWindowInterface extends Window {}

function getWindow(): any {
  // @ts-ignore
  return window;
}

@Injectable()
export class WindowRefService extends BaseService {
  get nativeWindow(): CustomWindowInterface {
    return getWindow();
  }

  scroll(options: any) {
    this.nativeWindow.scroll(options);
  }

  getCurrentUrl(): URL {
    return new URL(this.nativeWindow.document.URL);
  }

  locationAssign(url: string) {
    this.nativeWindow.location.assign(url);
  }
}
