import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Platform, MenuController} from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-ventana-paciente',
  templateUrl: './ventana-paciente.page.html',
  styleUrls: ['./ventana-paciente.page.scss'],
})

export class VentanaPacientePage implements OnInit {
  paciente: any = {};
  identifierKey: string = '';
  username: string = '';

  constructor(
    private alertController: AlertController,
    private router: Router, 
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private menuCtrl: MenuController,
    private platform: Platform) { 
    }

  ngOnInit() {
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica del paciente desde AuthService
    this.paciente = this.authService.getPacienteData();
    console.log('Paciente:', this.paciente);
    if (this.paciente && this.paciente.pacFotografiaBase64) {
      this.paciente.pacFotografiaURL = 'data:image/jpeg;base64,' + this.paciente.pacFotografiaBase64;
    }
  }

  async alertaConfirmarSalida() {
    const alert = await this.alertController.create({
      header: 'Confirmar salida',
      message: '¿Está seguro de cerrar su sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancelado');
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.goSalir();
          }
        }
      ]
    });
    await alert.present();
  }
  
  goBuscarFarmaciaListado(){
    localStorage.setItem('backvalue','listadoFarmacia');
    this.router.navigateByUrl('/listado-farmacia');
  }

  goBuscarFarmaciaMapa(){
    localStorage.setItem('backvalue','mapaFarmacia');
    this.router.navigateByUrl('/mapa-farmacia');
  }
 
  goBuscarMedicoListado(){
    localStorage.setItem('backvalue','listadoMedico');
    this.router.navigateByUrl('/listado-medico');
  }

  goBuscarMedicoMapa(){
    localStorage.setItem('backvalue','mapaMedico');
    this.router.navigateByUrl('/mapa-medico');
  }

  goGestionarPerfil(){
    localStorage.setItem('backvalue','gestionarPerfilPaciente');
    this.router.navigateByUrl('/gestionar-perfil-paciente');
  }
  
  goResetearClave(){
    localStorage.setItem('backvalue','resetearClavePaciente');
    this.router.navigateByUrl('/resetear-clave-paciente');
  }
  
  abrirMenuIzquierdo() {
    if (!this.menuCtrl.isEnabled('menuIzquierdo')) {
      this.menuCtrl.enable(true, 'menuIzquierdo');
    }
    this.menuCtrl.open('menuIzquierdo');
  }
  
  goSalir(){
    // Limpiar datos de autenticación y redirigir a la página de inicio
    this.authService.setPacienteData(null);
    this.authService.setIdentifierKey('');
    this.authService.setUsername('');
    localStorage.setItem('backvalue','home');
    this.router.navigateByUrl('/home');
  }
}