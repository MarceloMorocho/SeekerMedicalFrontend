import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { GestionarPerfilFarmaciaPage } from './gestionar-perfil-farmacia.page';

describe('GestionarPerfilFarmaciaPage', () => {
  let component: GestionarPerfilFarmaciaPage;
  let fixture: ComponentFixture<GestionarPerfilFarmaciaPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionarPerfilFarmaciaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarPerfilFarmaciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});