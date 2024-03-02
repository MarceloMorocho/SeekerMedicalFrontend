import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Platform, MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-ventana-farmacia',
  templateUrl: './ventana-farmacia.page.html',
  styleUrls: ['./ventana-farmacia.page.scss'],
})

export class VentanaFarmaciaPage implements OnInit { 
  farmacia: any = {};
  identifierKey: string = '';
  username: string = '';

  constructor(
    private alertController: AlertController,
    private router: Router, 
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private menuCtrl: MenuController,
    private platform: Platform) { }

  ngOnInit() {
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica de la faramcia desde AuthService
    this.farmacia = this.authService.getFarmaciaData();
    console.log('Farmacia:', this.farmacia);
    if (this.farmacia && this.farmacia.farLogotipoBase64) {
      this.farmacia.farLogotipoURL = 'data:image/jpeg;base64,' + this.farmacia.farLogotipoBase64;
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
    localStorage.setItem('backvalue','resetearClaveFarmacia');
    this.router.navigateByUrl('/resetear-clave-farmacia');
  }

  goGestionarPerfil(){
    localStorage.setItem('backvalue','gestionarPerfilFarmacia');
    this.router.navigateByUrl('/gestionar-perfil-farmacia');
  }

  abrirMenuIzquierdo() {
    if (!this.menuCtrl.isEnabled('menuIzquierdo')) {
      this.menuCtrl.enable(true, 'menuIzquierdo');
    }
    this.menuCtrl.open('menuIzquierdo');
  }

  goSalir(){
    // Limpiar datos de autenticación y redirigir a la página de inicio
    this.authService.setFarmaciaData(null);
    this.authService.setIdentifierKey('');
    this.authService.setUsername('');
    localStorage.setItem('backvalue','home');
    this.router.navigateByUrl('/home');
  }
}