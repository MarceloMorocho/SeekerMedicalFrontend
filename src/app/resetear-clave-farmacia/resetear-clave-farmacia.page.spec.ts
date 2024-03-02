import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ResetearClaveFarmaciaPage } from './resetear-clave-farmacia.page';

describe('ResetearClaveFarmaciaPage', () => {
  let component: ResetearClaveFarmaciaPage;
  let fixture: ComponentFixture<ResetearClaveFarmaciaPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetearClaveFarmaciaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetearClaveFarmaciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});