import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Platform, MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../servicios/auth.service';

const ipServidor = '192.168.0.115:8080'; // Dirección IP del servidor

@Component({
  selector: 'app-resetear-clave-paciente',
  templateUrl: './resetear-clave-paciente.page.html',
  styleUrls: ['./resetear-clave-paciente.page.scss'],
})

export class ResetearClavePacientePage implements OnInit {
  paciente: any = {};  // Initialize paciente as an empty object
  identifierKey: string = '';
  username: string = '';
  claveActual: string = '';
  nuevaClave: string = '';
  pacCi: string = '';
  pacClave: string = '';

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
    // Obtener información específica del paciente desde AuthService
    this.paciente = this.authService.getPacienteData();
    // Obtener pacCi y pacClave desde el paciente
    this.pacCi = this.paciente.pacCi;
    this.pacClave = this.paciente.pacClave;
    console.log('Paciente:', this.paciente);
    if (this.paciente && this.paciente.pacFotografiaBase64) {
      this.paciente.pacFotografiaURL = 'data:image/jpeg;base64,' + this.paciente.pacFotografiaBase64;
    }
  }
    
  // Método para validar la clave registrada por el paciente
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
    // Asegurarse de que haya un valor válido para pacCi
    if (!this.pacCi) {
      console.error('Error: pacCi no está definido.');
      return;
    }
    // Definir el endpoint y el cuerpo de la solicitud
    const endpoint = `http://${ipServidor}/pacientes/${this.pacCi}/updateClave`;
    const body = {
      pacClave: this.claveActual,
      pacNuevaClave: this.nuevaClave,
    };
    // Realizar la solicitud al servidor
    this.http.put(endpoint, body).subscribe(
      (response: any) => {
        console.log('Respuesta del servidor:', response);
        // Mostrar un mensaje de éxito al usuario
        this.mostrarAlerta('Éxito', 'Clave actualizada con éxito');
        // Redirigir a la página 'ventana-paciente'
        this.router.navigate(['/ventana-paciente']);
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

  goVentanaPaciente(){
    localStorage.setItem('backvalue','ventanaPaciente');
    this.router.navigateByUrl('/ventana-paciente');
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