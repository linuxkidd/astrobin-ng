import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { LoadTelescope } from "@app/store/actions/telescope.actions";
import { selectTelescope } from "@app/store/selectors/app/telescope.selectors";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";
import { GearService } from "@shared/services/gear/gear.service";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-telescope",
  templateUrl: "./telescope.component.html",
  styleUrls: ["./telescope.component.scss"]
})
export class TelescopeComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  telescope$: Observable<TelescopeInterface>;

  @Input()
  id: number;

  @Input()
  loadDelay = 0;

  constructor(public readonly store$: Store<State>, public readonly gearService: GearService) {
    super(store$);
  }

  ngOnInit(): void {
    if (this.id === undefined) {
      throw new Error("Attribute 'id' is required");
    }

    this.telescope$ = this.store$.select(selectTelescope, this.id);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.store$.dispatch(new LoadTelescope(this.id));
    }, this.loadDelay);
  }
}
