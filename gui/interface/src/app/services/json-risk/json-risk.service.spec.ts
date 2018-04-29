import { TestBed, inject } from '@angular/core/testing';

import { JsonRiskService } from './json-risk.service';

describe('JsonRiskService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonRiskService]
    });
  });

  it('should be created', inject([JsonRiskService], (service: JsonRiskService) => {
    expect(service).toBeTruthy();
  }));
});
