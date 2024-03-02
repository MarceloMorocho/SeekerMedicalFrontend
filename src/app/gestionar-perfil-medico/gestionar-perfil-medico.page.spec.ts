import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { GestionarPerfilMedicoPage } from './gestionar-perfil-medico.page';

describe('GestionarPerfilMedicoPage', () => {
  let component: GestionarPerfilMedicoPage;
  let fixture: ComponentFixture<GestionarPerfilMedicoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionarPerfilMedicoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarPerfilMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});