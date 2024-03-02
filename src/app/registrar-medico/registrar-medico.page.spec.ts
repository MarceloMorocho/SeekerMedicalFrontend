import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RegistrarMedicoPage } from './registrar-medico.page';

describe('RegistrarMedicoPage', () => {
  let component: RegistrarMedicoPage;
  let fixture: ComponentFixture<RegistrarMedicoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    declarations: [ RegistrarMedicoPage ],
    imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});