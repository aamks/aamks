import { TestBed, inject } from '@angular/core/testing';

import { IdGeneratorService } from './id-generator.service';

describe('IdGeneratorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IdGeneratorService]
    });
  });

  it('should be created', inject([IdGeneratorService], (service: IdGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
