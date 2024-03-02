import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../servicios/auth.service';
import { HttpClient } from '@angular/common/http';

const ipServidor = '192.168.0.115:8080'; // Dirección IP del servidor

@Component({
  selector: 'app-olvido-clave-farmacia',
  templateUrl: './olvido-clave-farmacia.page.html',
  styleUrls: ['./olvido-clave-farmacia.page.scss'],
})

export class OlvidoClaveFarmaciaPage implements OnInit {
  farmacia: any = {}; // Modelo de datos del farmacia
  
  constructor(private router: Router, 
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private http: HttpClient, 
    private authService: AuthService) {}

  ngOnInit() {
  }

  // Método para validar el RUC natural y jurídico
  rucInvalido: boolean = false;
  respuestaBackendExistenciaRuc: string = '';
  respuestaBackendRuc: string = '';
  validarRucYExistencia() {
    this.rucInvalido = false;
    // Valida la existencia de la farmacia registrada en el sistema
    const farRuc = this.farmacia.farRuc;
    // Valida el RUC de persona natural y jurídico
    this.http.get<string>(`http://${ipServidor}/farmacias/validaRuc/${farRuc}`, { responseType: 'text' as 'json' })
    .subscribe(response => {
      this.respuestaBackendRuc = response;
      // Verifica si la respuesta contiene "La farmacia ya existe" y muestra un mensaje en consecuencia
      if (this.respuestaBackendRuc === 'El RUC no es válido') {
        this.mostrarMensajeRucYExistencia('El RUC no es válido');
        // Establece rucInvalido en verdadero si la validación falla
        this.rucInvalido = true;
      } else {
        // El RUC es válido, ahora verifica la existencia en la base de datos
        this.http.get<string>(`http://${ipServidor}/farmacias/validaExistenciaFarRuc/${farRuc}`, { responseType: 'text' as 'json' })
        .subscribe(response => {
          this.respuestaBackendExistenciaRuc = response;
          // Verifica si la respuesta contiene "La farmacia ya existe" y muestra un mensaje en consecuencia
          if (this.respuestaBackendExistenciaRuc === 'La farmacia ya existe') {
            // Establece rucInvalido en verdadero si la validación falla
            this.rucInvalido = false;
          } else {
            this.rucInvalido = true;
            this.mostrarMensajeRucYExistencia('La farmacia no está registrada en la base de datos');
          }
        });
      }   
    });
  }

  async mostrarMensajeRucYExistencia(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Método para validar el correo electrónico de la farmacia
  correoInvalido: boolean = false;
  respuestaBackendExistenciaCorreoElec: string = '';
  respuestaBackendValidaCorreoElec: string = '';
  validarCorreoElec() {
    // Restablece el valor de correoInvalido a falso antes de realizar las validaciones
    this.correoInvalido = false;
    // Valida la existencia de la farmacia registrada en el sistema
     const farRuc = this.farmacia.farRuc;
    // Valida el correo electrónico
    const farCorreoElec = this.farmacia.farCorreoElec;
    this.http.get<string>(`http://${ipServidor}/farmacias/validaCorreoElec/${farCorreoElec}`, { responseType: 'text' as 'json' })
    .subscribe(validacionResponse => {
      this.respuestaBackendValidaCorreoElec = validacionResponse;
      if (this.respuestaBackendValidaCorreoElec === 'El correo no es válido') {
        // Muestra el mensaje de correo no válido
        this.mostrarMensajeValidaCorreoElecYExistencia('El correo no es válido');
        // Establece correoInvalido en verdadero si la validación falla
        this.correoInvalido = true;
      } else {
        // El correo es válido, ahora verifica su existencia en la base de datos
        this.http.get<string>(`http://${ipServidor}/farmacias/validaCorreoPerteneceFarmacia/${farRuc}/${farCorreoElec}`, { responseType: 'text' as 'json' })
        .subscribe(existenciaResponse => {
          this.respuestaBackendExistenciaCorreoElec = existenciaResponse;
          if (this.respuestaBackendExistenciaCorreoElec === 'El correo electrónico pertenece a la farmacia') {
            // Establece correoInvalido en falso si verifica que el correo pertenece a la farmacia en la base de datos
            this.correoInvalido = false;
          } else {
            // Si el correo no pertenece a la farmacia, deshabilita el botón
            this.correoInvalido = true;
            this.mostrarMensajeValidaCorreoElecYExistencia('El correo electrónico no coincide con los datos registrados de la farmacia');
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
      this.farmacia.farRuc &&
      this.farmacia.farCorreoElec 
    ) {
      this.formInvalido = false;
    } else {
      this.formInvalido = true;
    }
  }

  async enviarClaveTemporal() {
    try {
      const farRuc = this.farmacia.farRuc;
      const farCorreoElec = this.farmacia.farCorreoElec;
      // Realizar la solicitud HTTP al backend
      const response = await this.http.get<string>(`http://${ipServidor}/farmacias/enviarClaveTemporal/${farRuc}/${farCorreoElec}`, { responseType: 'text' as 'json' }).toPromise();
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