import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  // ✅ Mock AuthService avec un faux token
  const mockAuthService = {
    getToken: () => of('FAKE_TOKEN')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ✅ Vérifie qu'aucune requête pendante
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products with fake token', () => {
    const mockResponse = {
      results: [{ id: 1, name: 'Produit Test' }],
      next: null,
      previous: null
    };

    service.getProducts(1).subscribe((data) => {
      expect(data.products.length).toBe(1);
      expect(data.products[0].name).toBe('Produit Test');
      expect(data.next).toBeNull();
    });

    const req = httpMock.expectOne('http://127.0.0.1:8000/products/?page=1');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer FAKE_TOKEN');
    req.flush(mockResponse);
  });

  // Tu peux ajouter d'autres tests (addProduct, getProductById...) si besoin.
});
