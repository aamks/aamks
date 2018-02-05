import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UiState } from './ui-state';
import { of } from 'rxjs/observable/of';
import { get, set } from 'lodash';

@Injectable()
export class UiStateService {

  uiState: UiState = new UiState();

  constructor() { }

  public getUiState(): Observable<UiState> {
    return of(this.uiState);
  }

  /** Increase begin parameter */
  public increaseRange(path: string) {
    let begin = get(this.uiState, path + '.begin');
    set(this.uiState, path + '.begin', begin + this.uiState.listRange);
  }

  /** Decrease begin parameter */
  public decreaseRange(path: string) {
    let begin = get(this.uiState, path + '.begin');
    set(this.uiState, path + '.begin', begin - this.uiState.listRange);
  }

}
