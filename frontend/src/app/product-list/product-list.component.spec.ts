import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { provideHttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ApiService } from '../services/api.service';  //  Chemin adapté
import { AuthService } from '../services/auth.service';  //  Chemin adapté

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  //  Mocks pour éviter les erreurs API lors des tests
  const mockApiService = {
    getProducts: jasmine.createSpy('getProducts').and.returnValue(of({ products: [], next: null, previous: null }))
  };

  const mockAuthService = {
    getToken: jasmine.createSpy('getToken').and.returnValue(of('FAKE_TOKEN')),
    logout: jasmine.createSpy('logout')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductListComponent,
        RouterTestingModule  //  Si tu as du RouterLink ou router-outlet dans le component
      ],
      providers: [
        provideHttpClient(),
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
