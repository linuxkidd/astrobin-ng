import { CurrencyPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { State } from "@app/store/state";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { PaymentsApiConfigInterface } from "@features/subscriptions/interfaces/payments-api-config.interface";
import { PaymentsApiService } from "@features/subscriptions/services/payments-api.service";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { Observable } from "rxjs";
import { distinctUntilChanged, startWith, switchMap, take, takeUntil, tap } from "rxjs/operators";

declare var Stripe: any;

@Component({
  selector: "astrobin-subscriptions-buy-page",
  templateUrl: "./subscriptions-buy-page.component.html",
  styleUrls: ["./subscriptions-buy-page.component.scss"]
})
export class SubscriptionsBuyPageComponent extends BaseComponentDirective implements OnInit {
  alreadySubscribed$: Observable<boolean>;
  price$: Observable<number>;
  product: PayableProductInterface;
  bankDetailsMessage$: Observable<string>;
  bankLocations = [
    { id: "USA", label: "United States of America" },
    { id: "EU", label: "Europe" },
    { id: "GB", label: "Great Britain" },
    { id: "AUS", label: "Australia" },
    { id: "CH", label: "Switzerland" }
  ];
  selectedBankLocation = "USA";
  currencyPipe: CurrencyPipe;

  constructor(
    public readonly store: Store<State>,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly paymentsApiService: PaymentsApiService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translate: TranslateService,
    public readonly titleService: TitleService,
    public readonly subscriptionsService: SubscriptionsService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly jsonApiService: JsonApiService
  ) {
    super();

    this.translate.onLangChange
      .pipe(takeUntil(this.destroyed$), startWith({ lang: this.translate.currentLang }))
      .subscribe(event => {
        this.currencyPipe = new CurrencyPipe(event.lang);
      });
  }

  get moreInfoMessage() {
    const url = "https://welcome.astrobin.com/pricing";

    return this.translate.instant(
      "For more information about this and other subscription plans, please visit the {{0}}pricing{{1}} page.",
      {
        0: `<a href="${url}" target="_blank">`,
        1: `</a>`
      }
    );
  }

  get upgradeMessage(): string {
    return this.translate.instant(
      "AstroBin doesn't support subscription upgrades at the moment, but we're happy to make it happen manually. If " +
        "you're on a lower subscription tier and would like to upgrade to <strong>{{0}}</strong>, please just buy it " +
        "and then contact us at {{1}} to get a refund for the unused time on your old subscription. Thanks!",
      {
        0: this.subscriptionsService.getName(this.product),
        1: "<a href=\"mailto:support@astrobin.com\">support@astrobin.com</a>"
      }
    );
  }

  get bankDetails(): string {
    switch (this.selectedBankLocation) {
      case "CH":
        return (
          "BANK       : PostFinance Switzerland\n" +
          "BENEFICIARY: Salvatore Iovene\n" +
          "IBAN       : CH97 0900 0000 6922 3618 4\n" +
          "SWIFT / BIC: POFICHBEXXX"
        );
      case "AU":
        return "BENEFICIARY: AstroBin\n" + "ACCOUNT #  : 412756021\n" + "BSB CODE   : 802-985";
      case "GB":
        return (
          "BENEFICIARY: AstroBin\n" +
          "ACCOUNT #  : 52990073\n" +
          "SORT CODE  : 23-14-70\n" +
          "IBAN       : GB79 TRWI 2314 7052 9900 73"
        );
      case "EU":
        return "BENEFICIARY: AstroBin\n" + "IBAN       : BE76 9671 5599 8695\n" + "SWIFT / BIC: TRWIBEB1XXX ";
      case "USA":
      default:
        return (
          "Paying from inside the USA\n" +
          "ACCOUNT #: 9600000000061714\n" +
          "ROUTING #: 084009519\n\n" +
          "Paying from outside the USA\n" +
          "ACCOUNT #: 8310788830\n" +
          "SWIFT/BIC: CMFGUS33"
        );
    }
  }

  ngOnInit(): void {
    this.loadingService.setLoading(true);

    this.activatedRoute.params.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      this.product = params["product"];

      if (
        [PayableProductInterface.LITE, PayableProductInterface.PREMIUM, PayableProductInterface.ULTIMATE].indexOf(
          this.product
        ) === -1
      ) {
        this.router.navigateByUrl("/page-not-found", { skipLocationChange: true });
        return;
      }

      this.titleService.setTitle(this.subscriptionsService.getName(this.product));

      this.alreadySubscribed$ = this.store.pipe(
        take(1),
        switchMap(state =>
          this.userSubscriptionService.hasValidSubscription(
            state.auth.userProfile,
            this.subscriptionsService.getSameTierOrAbove(this.product)
          )
        )
      );

      this.subscriptionsService.currency$
        .pipe(takeUntil(this.destroyed$), distinctUntilChanged())
        .subscribe(currency => {
          this.selectedBankLocation = {
            USD: "USA",
            EUR: "EU",
            GBP: "GB",
            AUD: "AUS",
            CHF: "CH"
          }[currency];

          this.price$ = this.subscriptionsService.getPrice(this.product).pipe(
            takeUntil(this.destroyed$),
            tap(() => this.loadingService.setLoading(false))
          );

          this.bankDetailsMessage$ = this.price$.pipe(
            takeUntil(this.destroyed$),
            switchMap(price =>
              this.translate.stream(
                "Please make a deposit of {{ currency }} {{ amount }} to the following bank details and then email " +
                  "us at {{ email_prefix }}{{ email }}{{ email_postfix }} with your username so we may upgrade your " +
                  "account manually.",
                {
                  currency: "",
                  amount: `<strong>${this.currencyPipe.transform(price, this.subscriptionsService.currency)}</strong>`,
                  email_prefix: "<a href='mailto:support@astrobin.com'>",
                  email: "support@astrobin.com",
                  email_postfix: "</a>"
                }
              )
            )
          );
        });
    });
  }

  buy(): void {
    let stripe: any;
    let config: PaymentsApiConfigInterface;
    let userId: number;

    this.loadingService.setLoading(true);

    this.store
      .pipe(
        tap(state => {
          userId = state.auth.user.id;
        }),
        switchMap(() => this.paymentsApiService.getConfig().pipe(tap(_config => (config = _config)))),
        switchMap(() => {
          stripe = Stripe(config.publicKey);
          return this.paymentsApiService.createCheckoutSession(
            userId,
            this.product,
            this.subscriptionsService.currency
          );
        })
      )
      .subscribe(response => {
        if (response.sessionId) {
          stripe.redirectToCheckout({ sessionId: response.sessionId });
        } else {
          this.popNotificationsService.error(response.error || this.translate.instant("Unknown error"));
          this.loadingService.setLoading(false);
        }
      });
  }
}