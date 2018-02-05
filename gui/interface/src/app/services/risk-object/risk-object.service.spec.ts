import { TestBed, inject } from '@angular/core/testing';

import { RiskObjectService } from './risk-object.service';

describe('RiskObjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RiskObjectService]
    });
  });

  it('should be created', inject([RiskObjectService], (service: RiskObjectService) => {
    expect(service).toBeTruthy();
  }));
});
