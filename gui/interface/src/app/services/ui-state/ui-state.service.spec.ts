import { TestBed, inject } from '@angular/core/testing';

import { UiStateService } from './ui-state.service';

describe('UiStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UiStateService]
    });
  });

  it('should be created', inject([UiStateService], (service: UiStateService) => {
    expect(service).toBeTruthy();
  }));
});
