import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { JsonApiServiceInterface } from "@shared/services/api/classic/json/json-api.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { BaseClassicApiService } from "../base-classic-api.service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class JsonApiService extends BaseClassicApiService implements JsonApiServiceInterface {
  configUrl = environment.classicApiUrl + "/json-api";

  constructor(public loadingService: LoadingService, private http: HttpClient) {
    super(loadingService);
  }

  getBackendConfig(): Observable<BackendConfigInterface> {
    return this.http.get<BackendConfigInterface>(`${this.configUrl}/common/app-config/`);
  }

  toggleUseHighContrastThemeCookie(): Observable<void> {
    return this.http.post<void>(
      `${this.configUrl}/user/toggle-use-high-contrast-theme-cookie/`,
      {},
      { withCredentials: true }
    );
  }

  urlIsAvailable(url: string): Observable<boolean> {
    return this.http
      .get<{ available: boolean }>(`${this.configUrl}/common/url-is-available/?url=${url}`)
      .pipe(map(response => response.available));
  }
}
