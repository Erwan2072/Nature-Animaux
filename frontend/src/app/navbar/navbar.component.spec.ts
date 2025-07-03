import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { provideHttpClient } from '@angular/common/http';  // Pour AuthService
import { RouterTestingModule } from '@angular/router/testing';  // Pour RouterLink/Navigation

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavbarComponent,
        RouterTestingModule  //  Fournit RouterLink, ActivatedRoute...
      ],
      providers: [
        provideHttpClient()  //  Fournit HttpClient à AuthService ou autre
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
