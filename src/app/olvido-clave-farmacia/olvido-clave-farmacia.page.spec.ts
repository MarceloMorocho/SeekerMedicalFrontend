import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { OlvidoClaveFarmaciaPage } from './olvido-clave-farmacia.page';

describe('OlvidoClaveFarmaciaPage', () => {
  let component: OlvidoClaveFarmaciaPage;
  let fixture: ComponentFixture<OlvidoClaveFarmaciaPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OlvidoClaveFarmaciaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OlvidoClaveFarmaciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
