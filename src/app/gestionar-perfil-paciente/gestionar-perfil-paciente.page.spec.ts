import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { GestionarPerfilPacientePage } from './gestionar-perfil-paciente.page';

describe('GestionarPerfilPacientePage', () => {
  let component: GestionarPerfilPacientePage;
  let fixture: ComponentFixture<GestionarPerfilPacientePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionarPerfilPacientePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarPerfilPacientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});