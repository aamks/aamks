import { TestBed, inject } from '@angular/core/testing';

import { FdsScenarioService } from './fds-scenario.service';

describe('FdsScenarioService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FdsScenarioService]
    });
  });

  it('should be created', inject([FdsScenarioService], (service: FdsScenarioService) => {
    expect(service).toBeTruthy();
  }));
});
