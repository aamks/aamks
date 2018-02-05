import { TestBed, inject } from '@angular/core/testing';

import { HttpManagerService } from './http-manager.service';

describe('HttpManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpManagerService]
    });
  });

  it('should be created', inject([HttpManagerService], (service: HttpManagerService) => {
    expect(service).toBeTruthy();
  }));
});
