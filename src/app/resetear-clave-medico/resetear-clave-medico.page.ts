import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Platform, MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../servicios/auth.service';

const ipServidor = '192.168.0.115:8080'; // Dirección IP del servidor

@Component({
  selector: 'app-resetear-clave-medico',
  templateUrl: './resetear-clave-medico.page.html',
  styleUrls: ['./resetear-clave-medico.page.scss'],
})

export class ResetearClaveMedicoPage implements OnInit {
  medico: any = {};
  identifierKey: string = '';
  username: string = '';
  claveActual: string = '';
  nuevaClave: string = '';
  medCi: string = '';
  medClave: string = '';

  constructor(
    private alertController: AlertController,
    private router: Router, 
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private menuCtrl: MenuController,
    private platform: Platform) {}
    
  ngOnInit() {
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica del médico desde AuthService
    this.medico = this.authService.getMedicoData();
    // Obtener medCi y medClave desde el médico
    this.medCi = this.medico.medCi;
    this.medClave = this.medico.medClave;
    console.log('Medico:', this.medico);
    if (this.medico && this.medico.medFotografiaBase64) {
      this.medico.medFotografiaURL = 'data:image/jpeg;base64,' + this.medico.medFotografiaBase64;
    }
  }
    
  // Método para validar la clave registrada por el médico
  claveInvalido = false; // Inicialmente se considera válida
  validarClave(){
    if (this.nuevaClave && this.nuevaClave.length < 8) {
      this.claveInvalido = true;
    } else {
      this.claveInvalido = false;
    }
     console.log('Validar clave:', this.nuevaClave);
  }

  // Método para comparar las claves
  clavesDifieren = false;
  confirmarClave: string = ''; 
  compararClaves() {
    if (this.nuevaClave && this.nuevaClave !== this.confirmarClave) {
      console.log('Las contraseñas no coinciden');
      this.clavesDifieren = true;
    } else {
      console.log('Las contraseñas coinciden');
      this.clavesDifieren = false;
    }
    console.log('Nueva clave:', this.nuevaClave);
    console.log('Confirmar clave:', this.confirmarClave);
  }  

  // Método para actualizar la clave
  actualizarClave() {
    // Validar la longitud de la nueva clave
    if (this.nuevaClave.length < 8) {
      this.mostrarAlerta('Error', 'La nueva clave debe tener al menos 8 caracteres');
      return;
    } 
    // Asegurarse de que haya un valor válido para medCi
    if (!this.medCi) {
      console.error('Error: medCi no está definido.');
      return;
    }
    // Definir el endpoint y el cuerpo de la solicitud
    const endpoint = `http://${ipServidor}/medicos/${this.medCi}/updateClave`;
    const body = {
      medClave: this.claveActual,
      medNuevaClave: this.nuevaClave,
    };
    // Realizar la solicitud al servidor
    this.http.put(endpoint, body).subscribe(
      (response: any) => {
        console.log('Respuesta del servidor:', response);
        // Mostrar un mensaje de éxito al usuario
        this.mostrarAlerta('Éxito', 'Clave actualizada con éxito');
        // Redirigir a la página 'ventana-medico'
        this.router.navigate(['/ventana-medico']);
      },
      (error: any) => {
        console.error('Error en la solicitud:', error);
        // Mostrar un mensaje de error al usuario
        this.mostrarAlerta('Error', error.error || 'Hubo un error al actualizar la clave');
      }
    );
    console.log('Endpoint:', endpoint);
    console.log('Body:', body);
  }
  
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  async alertaConfirmarSalida() {
    const alert = await this.alertController.create({
      header: 'Confirmar salida',
      message: '¿Está seguro de salir de la aplicación?',
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
  
  goGestionarPerfil(){
    localStorage.setItem('backvalue','gestionarPerfilMedico');
    this.router.navigateByUrl('/gestionar-perfil-medico');
  }

  goVentanaMedico(){
    localStorage.setItem('backvalue','ventanaMedico');
    this.router.navigateByUrl('/ventana-medico');
  }  

  goResetearClave(){
    localStorage.setItem('backvalue','resetearClaveMedico');
    this.router.navigateByUrl('/resetear-clave-medico');
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