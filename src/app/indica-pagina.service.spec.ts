import { TestBed } from '@angular/core/testing';
import { IndicaPaginaService } from './indica-pagina.service';

describe('IndicaPaginaService', () => {
  let service: IndicaPaginaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndicaPaginaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});