import { TestBed, inject } from '@angular/core/testing';

import { RiskScenarioService } from './risk-scenario.service';

describe('RiskScenarioService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RiskScenarioService]
    });
  });

  it('should be created', inject([RiskScenarioService], (service: RiskScenarioService) => {
    expect(service).toBeTruthy();
  }));
});
