import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadSolutionFailure, LoadSolutionsSuccess, LoadSolutionSuccess } from "@app/store/actions/solution.actions";
import { selectSolution } from "@app/store/selectors/app/solution.selectors";
import { State } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { SolutionApiService } from "@shared/services/api/classic/platesolving/solution/solution-api.service";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, map, mergeMap, take } from "rxjs/operators";

@Injectable()
export class SolutionEffects {
  LoadSolution: Observable<LoadSolutionSuccess | LoadSolutionFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_SOLUTION),
      mergeMap(action =>
        this.store$.select(selectSolution, action.payload).pipe(
          mergeMap(solutionFromStore =>
            solutionFromStore !== null
              ? of(solutionFromStore).pipe(
                  take(1),
                  map(solution => new LoadSolutionSuccess(solution))
                )
              : this.solutionApiService.getSolution(action.payload.contentType, action.payload.objectId).pipe(
                  map(solution => (!!solution ? new LoadSolutionSuccess(solution) : new LoadSolutionFailure())),
                  catchError(error => EMPTY)
                )
          )
        )
      )
    )
  );

  LoadSolutions: Observable<LoadSolutionsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_SOLUTIONS),
      mergeMap(action =>
        this.solutionApiService.getSolutions(action.payload.contentType, action.payload.objectIds).pipe(
          map(solutions => new LoadSolutionsSuccess(solutions)),
          catchError(error => EMPTY)
        )
      )
    )
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly solutionApiService: SolutionApiService
  ) {}
}
