import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {NavController, AlertController} from '@ionic/angular';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

// OnInit es la interface
export class LoginPage implements OnInit {
  public tUsuario: string;
  imgUsuario: string="assets/imagenes/general.png";
  username: string = "";
  password: string = "";
 
  constructor(private alertController: AlertController, 
    private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private navCtrl: NavController,
    private authService: AuthService) { 
     this.tUsuario = "";
  }

  /* ngOnInit es el método de la interface para inicializar o ejecutar tareas que tienen que ver con Angular y 
  realizar llamadas a servicios que solo deben realizarse una vez */
  ngOnInit() {
    var tipousuario = this.activatedRoute.snapshot.queryParamMap.get("tipousuario");
    if(tipousuario==null){
      tipousuario="";
    }
    this.tUsuario=tipousuario;
    switch(this.tUsuario){
      case "paciente": this.imgUsuario="assets/imagenes/paciente.png";break;
      case "medico": this.imgUsuario="assets/imagenes/medico.png";break;
      case "farmacia": this.imgUsuario="assets/imagenes/farmacia.png"; break;
    }
  }

  // MostrarPassword
  public mostrarPassword: boolean = false;
  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
    const inputElement = document.querySelector('ion-input[name="password"]') as HTMLInputElement;
    inputElement.type = this.mostrarPassword ? 'text' : 'password';
  }

  // Autenticaciónn del usuario
  errorAutenticacion: boolean = false;
  async login() {
    try {
      this.errorAutenticacion = false;
      this.authService.autenticar({
        username: this.username,
        password: this.password,
        tipoUsuario: this.tUsuario,
      }).subscribe(
        (response: any) => {
          const message = response && response.message ? response.message : '';
          console.log(message);
          console.log('Respuesta del servidor:', response);
          if (message.includes('Inicio de sesión exitoso')) {
            let identifierKey;
            switch (this.tUsuario) {
              case 'paciente':
                identifierKey = 'pacCi';
                this.authService.setPacienteData(response.paciente); // Almacena la información del paciente
                console.log('Datos del paciente:', response.paciente);
                break;
              case 'medico':
                identifierKey = 'medCi';
                this.authService.setMedicoData(response.medico); // Almacena la información del médico
                console.log('Datos del médico:', response.medico);
                break;
              case 'farmacia':
                identifierKey = 'farRuc';
                this.authService.setFarmaciaData(response.farmacia); // Almacena la información de la farmacia
                console.log('Datos de la farmacia:', response.farmacia);
                break;
            }
            // Almacena el tipo de usuario, hay que asegurar de que identifierKey no sea undefined antes de asignarlo
            if (identifierKey !== undefined) {
              this.authService.setIdentifierKey(identifierKey);
            }            
            this.authService.setUsername(this.username);
            switch (this.tUsuario) {
              case 'paciente':
                this.router.navigateByUrl('/ventana-paciente');
                break;
              case 'medico':
                this.router.navigateByUrl('/ventana-medico');
                break;
              case 'farmacia':
                this.router.navigateByUrl('/ventana-farmacia');
                break;
            }
          } else {
            console.error('Mensaje de respuesta inesperado:', message);
            this.errorAutenticacion = true;
          }
        },
        (error) => {
          console.error(error);
          if (error.status === 401) {
            this.errorAutenticacion = true;
          } else {
          // Agrega la información de la URL al mensaje de error
          const errorMessage = `Ocurrió un error durante la autenticación. URL: ${error.url}`;
          this.presentErrorAlert(errorMessage);          }
        }
      );
    } catch (error) {
      console.error(error);
      this.presentErrorAlert('Ocurrió un error durante la autenticación');
    }
  }
  
  async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  goRegistro(){
    switch(this.tUsuario){
      case "medico": this.router.navigateByUrl('/registrar-medico');break;
      case "paciente": this.router.navigateByUrl('/registrar-paciente');break;
      case "farmacia": this.router.navigateByUrl('/registrar-farmacia');break;
    }
  }

  goOlvidoClave(){
    switch(this.tUsuario){
      case "medico": this.router.navigateByUrl('/olvido-clave-medico');break;
      case "paciente": this.router.navigateByUrl('/olvido-clave-paciente');break;
      case "farmacia": this.router.navigateByUrl('/olvido-clave-farmacia');break;
    }
  }

  goHome(){
    localStorage.setItem('backvalue','Regresar');
    this.router.navigateByUrl('/home');
  }
}