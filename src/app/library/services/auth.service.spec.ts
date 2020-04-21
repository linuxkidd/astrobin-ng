import { HttpClientTestingModule } from "@angular/common/http/testing";
import { fakeAsync, flush, TestBed } from "@angular/core/testing";
import { WindowRefService } from "@lib/services/window-ref.service";
import { of } from "rxjs";
import { AuthClassicApiService } from "./api/classic/auth/auth-classic-api.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, AuthClassicApiService, WindowRefService]
    })
  );

  beforeEach(() => {
    service = TestBed.inject(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("login/logout", () => {
    beforeEach(() => {
      jest.spyOn(service.authClassicApi, "login").mockReturnValue(of("123"));
    });

    it("should work with classic api", fakeAsync(done => {
      service.login("foo", "bar").subscribe(result => {
        expect(result).toEqual(true);
        expect(service.getClassicApiToken()).toBe("123");

        flush();

        service.logout();

        expect(service.getClassicApiToken()).toBe(null);

        done();
      });
    }));
  });
});