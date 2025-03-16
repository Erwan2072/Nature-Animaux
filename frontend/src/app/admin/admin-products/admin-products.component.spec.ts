import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminProductsComponent } from './admin-products.component';
import { provideHttpClient } from '@angular/common/http';  // 🔥 Ajout pour injecter HttpClient

describe('AdminProductsComponent', () => {
  let component: AdminProductsComponent;
  let fixture: ComponentFixture<AdminProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductsComponent],
      providers: [provideHttpClient()]  // ✅ Fournit HttpClient pour ApiService
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
