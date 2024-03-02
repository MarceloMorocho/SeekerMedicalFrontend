import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Platform, MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-ventana-medico',
  templateUrl: './ventana-medico.page.html',
  styleUrls: ['./ventana-medico.page.scss'],
})

export class VentanaMedicoPage implements OnInit {
  medico: any = {};
  identifierKey: string = '';
  username: string = '';

  constructor(
    private alertController: AlertController,
    private router: Router, 
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private menuCtrl: MenuController,
    private platform: Platform,) {}

  ngOnInit() {
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica del médico desde AuthService
    this.medico = this.authService.getMedicoData();
    console.log('Medico:', this.medico);
    if (this.medico && this.medico.medFotografiaBase64) {
      this.medico.medFotografiaURL = 'data:image/jpeg;base64,' + this.medico.medFotografiaBase64;
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

  goResetearClave(){
    localStorage.setItem('backvalue','resetearClaveMedico');
    this.router.navigateByUrl('/resetear-clave-medico');
  }

  goGestionarPerfil(){
    localStorage.setItem('backvalue','gestionarPerfilMedico');
    this.router.navigateByUrl('/gestionar-perfil-medico');
  }

  abrirMenuIzquierdo() {
    if (!this.menuCtrl.isEnabled('menuIzquierdo')) {
      this.menuCtrl.enable(true, 'menuIzquierdo');
    }
    this.menuCtrl.open('menuIzquierdo');
  }

  goSalir(){
    // Limpiar datos de autenticación y redirigir a la página de inicio
    this.authService.setMedicoData(null);
    this.authService.setIdentifierKey('');
    this.authService.setUsername('');
    localStorage.setItem('backvalue','home');
    this.router.navigateByUrl('/home');
  }
}