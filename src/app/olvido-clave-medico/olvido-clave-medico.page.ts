import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../servicios/auth.service';
import { HttpClient } from '@angular/common/http';

const ipServidor = '192.168.0.115:8080'; // Dirección IP del servidor

@Component({
  selector: 'app-olvido-clave-medico',
  templateUrl: './olvido-clave-medico.page.html',
  styleUrls: ['./olvido-clave-medico.page.scss'],
})

export class OlvidoClaveMedicoPage implements OnInit {
  medico: any = {}; // Modelo de datos del medico

  constructor(private router: Router, 
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private http: HttpClient, 
    private authService: AuthService) {}

  ngOnInit() {
  }

  // Método para validar la cédula ecuatoriana
  cedulaInvalido: boolean = false;
  respuestaBackendExistenciaCedula: string = '';
  respuestaBackendCedulaEcuatoriana: string = '';
  validarCedulaEcuatorianaYExistencia() {
    this.cedulaInvalido = false;
    // Valida la existencia del médico registrado en el sistema
    const medCi = this.medico.medCi;
    this.http.get<string>(`http://${ipServidor}/medicos/validaCedulaEcuatoriana/${medCi}`, { responseType: 'text' as 'json' })
    .subscribe(response => {
    this.respuestaBackendCedulaEcuatoriana = response;
      if (this.respuestaBackendCedulaEcuatoriana === 'La cédula no es válida') {
        // Muestra el mensaje de cédula no válida
        this.mostrarMensajeCedulaEcuatorianaYExistencia('La cédula no es válida');
        // Establece cedulaInvalido en verdadero si la validación falla
        this.cedulaInvalido = true;
      } else {
        // La cédula es válida, ahora verifica la existencia en la base de datos
        this.http.get<string>(`http://${ipServidor}/medicos/validaExistenciaMedCi/${medCi}`, { responseType: 'text' as 'json' })
        .subscribe(existenciaResponse => {
          this.respuestaBackendExistenciaCedula = existenciaResponse;
          if (this.respuestaBackendExistenciaCedula === 'El médico ya existe') {
            // Habilita el botón si el médico está registrado
            this.cedulaInvalido = false;
          } else {
            // Si el médico no existe, deshabilita el botón
            this.cedulaInvalido = true;
            this.mostrarMensajeCedulaEcuatorianaYExistencia('El médico no está registrado en la base de datos');
          }
        });
      }
    });
  }

  async mostrarMensajeCedulaEcuatorianaYExistencia(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Método para validar el correo electrónico del médico
  correoInvalido: boolean = false;
  respuestaBackendExistenciaCorreoElec: string = '';
  respuestaBackendValidaCorreoElec: string = '';
  validarCorreoElec() {
    // Restablece el valor de correoInvalido a falso antes de realizar las validaciones
    this.correoInvalido = false;
    // Valida la existencia del médico registrado en el sistema
    const medCi = this.medico.medCi;
    // Valida el correo electrónico
    const medCorreoElec = this.medico.medCorreoElec;
    this.http.get<string>(`http://${ipServidor}/medicos/validaCorreoElec/${medCorreoElec}`, { responseType: 'text' as 'json' })
    .subscribe(validacionResponse => {
      this.respuestaBackendValidaCorreoElec = validacionResponse;
      if (this.respuestaBackendValidaCorreoElec === 'El correo no es válido') {
        // Muestra el mensaje de correo no válido
        this.mostrarMensajeValidaCorreoElecYExistencia('El correo no es válido');
        // Establece correoInvalido en verdadero si la validación falla
        this.correoInvalido = true;
      } else {
        // El correo es válido, ahora verifica su existencia en la base de datos
        this.http.get<string>(`http://${ipServidor}/medicos/validaCorreoPerteneceMedico/${medCi}/${medCorreoElec}`, { responseType: 'text' as 'json' })
        .subscribe(existenciaResponse => {
          this.respuestaBackendExistenciaCorreoElec = existenciaResponse;
          if (this.respuestaBackendExistenciaCorreoElec === 'El correo electrónico pertenece al médico') {
            // Establece correoInvalido en falso si verifica que el correo pertenece al médico en la base de datos
            this.correoInvalido = false;
          } else {
            // Si el correo no pertenece al médico, deshabilita el botón
            this.correoInvalido = true;
            this.mostrarMensajeValidaCorreoElecYExistencia('El correo electrónico no coincide con los datos registrados del médico');
          }
        });
      }
    });
  }

  async mostrarMensajeValidaCorreoElecYExistencia(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }


  // Método para validar que los campos sean obligatorios y se habiliten el botón continuar
  formInvalido = false; // Variable para controlar si se muestra el mensaje de alerta
  validarCamposObligatorios() {
    if (
      // Campos obligatorios
      this.medico.medCi &&
      this.medico.medCorreoElec 
    ) {
      this.formInvalido = false;
    } else {
      this.formInvalido = true;
    }
  }

  async enviarClaveTemporal() {
    try {
      const medCi = this.medico.medCi;
      const medCorreoElec = this.medico.medCorreoElec;
      // Realizar la solicitud HTTP al backend
      const response = await this.http.get<string>(`http://${ipServidor}/medicos/enviarClaveTemporal/${medCi}/${medCorreoElec}`, { responseType: 'text' as 'json' }).toPromise();
      // Mostrar un mensaje de éxito
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Clave temporal enviada con éxito. \nRevisa tu bandeja de entrada o correo no deseado. \n¡Modifícala inmediatamente una vez ingresado al sistema!',
        buttons: [{
          text: 'OK',
          handler: () => {
            // Redirigir a la página de inicio (home)
            this.router.navigate(['/home']);
          }
        }]
      });
      await alert.present();
    } catch (error) {
      // Mostrar un mensaje de error
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Error al enviar la clave temporal. Intenta nuevamente.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  goHome(){
    localStorage.setItem('backvalue','Home');
    this.router.navigateByUrl('/home');
  }
}