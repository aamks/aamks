import { TestBed, inject } from '@angular/core/testing';

import { CadService } from './cad.service';

describe('CadService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CadService]
    });
  });

  it('should be created', inject([CadService], (service: CadService) => {
    expect(service).toBeTruthy();
  }));
});
