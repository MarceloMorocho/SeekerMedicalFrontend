import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, MenuController, NavController, Platform } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../servicios/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // DomSanitizer para garantizar la seguridad al manipular URLs

const ipServidor = '192.168.0.115:8080'; // Dirección IP delservidor

@Component({
  selector: 'app-gestionar-perfil-paciente',
  templateUrl: './gestionar-perfil-paciente.page.html',
  styleUrls: ['./gestionar-perfil-paciente.page.scss'],
})

export class GestionarPerfilPacientePage implements OnInit {
  paciente: any = {}; // Modelo de datos del paciente
  identifierKey: string = '';
  username: string = '';
  pacCi: string = '';
  pacCiRegistrado: string = '';
  pacCorreoElecRegistrado: string = '';
  pacCorreoElec: string = '';
 
  constructor(
    private navCtrl: NavController,
    private alertController: AlertController,
    private router: Router, 
    private http: HttpClient,
    private activatedRoute: ActivatedRoute, 
    private authService: AuthService,
    private menuCtrl: MenuController,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef) { }
  
  ngOnInit() {
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica del paciente desde AuthService
    const pacienteData = this.authService.getPacienteData();
    this.paciente = { ...pacienteData };
    this.pacCi = this.paciente.pacCi;
    this.pacCorreoElec = this.paciente.pacCorreoElec;
    console.log('Paciente actualizado:', this.paciente);    
    console.log('Paciente:', this.paciente);
    if (this.paciente && this.paciente.pacFotografiaBase64) {
      this.paciente.pacFotografiaURL = 'data:image/jpeg;base64,' + this.paciente.pacFotografiaBase64;
    }
    // Suscribir a los cambios en la ruta y recargar los datos cuando hay cambios
    this.activatedRoute.params.subscribe(params => {
    });
  }
 
  ionViewWillEnter() {     
    this.cargarDatosPaciente(); // Recarga los datos del paciente cuando la página está a punto de mostrarse     
    this.mostrarVistaPreviaFotografia(); // Muestra la vista previa de la fotografía después de cargar los datos
  }

  // Método para cargar datos del paciente
  cargarDatosPaciente() {
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica del paciente desde AuthService
    this.paciente = this.authService.getPacienteData();
    this.pacCiRegistrado = this.paciente.pacCi;  // Cédula registrada
    this.pacCorreoElecRegistrado = this.paciente.pacCorreoElec;  // Correo registrado
    console.log('Paciente:', this.paciente);
    if (this.paciente && this.paciente.pacFotografiaBase64) {
      this.paciente.pacFotografiaURL = 'data:image/jpeg;base64,' + this.paciente.pacFotografiaBase64;
    }
  }

  // Método para validar que los campos sean obligatorios y se habiliten el botón continuar
  formInvalido = false; // Variable para controlar si se muestra el mensaje de alerta
  validarCamposObligatorios() {
    // Verifica si los campos obligatorios están completos
    if (
      // Campos obligatorios del tab 1
      this.paciente.pacNombres &&
      this.paciente.pacApellidos &&
      this.paciente.pacCi &&
      this.paciente.pacCorreoElec &&
      this.paciente.pacTelefonoMov
    ) {
      this.formInvalido = false;
    } else {
      this.formInvalido = true;
    }
  } 

  // Método para validar los nombres
  pacNombresInvalido = false; // Inicialmente se considera no válido
  validarNombres() {
    if (this.paciente.pacNombres.length < 3) {
      this.pacNombresInvalido = true;
    } else {
      this.pacNombresInvalido = false;
    }
  }

  // Método para validar los apellidos
  pacApellidosInvalido = false; // Inicialmente se considera no válido
  validarApellidos() {
    if (this.paciente.pacApellidos.length < 3) {
      this.pacApellidosInvalido = true;
    } else {
      this.pacApellidosInvalido = false;
    }
  }

  // Método para validar la cédula ecuatoriana
  cedulaInvalido: boolean = false;
  respuestaBackendExistenciaCedula: string = '';
  respuestaBackendCedulaEcuatoriana: string = '';
  validarCedulaEcuatorianaYExistencia() {
    this.cedulaInvalido = false;
    // Obtener pacCi registrado en el sistema y pacCi ingresado
    const pacCiIngresado = this.paciente.pacCi;
    console.log('pacCiRegistrado:', this.pacCiRegistrado);
    console.log('pacCiIngresado:', pacCiIngresado);
    // Verificar si la cédula ingresada es diferente a la cédula registrada
    if (pacCiIngresado !== this.pacCiRegistrado) {
      // Si son diferentes, realizar la validación de existencia y cédula ecuatoriana
      this.http.get<string>(`http://${ipServidor}/pacientes/validaExistenciaPacCi/${pacCiIngresado}`, { responseType: 'text' as 'json' })
      .subscribe(response => {
        this.respuestaBackendExistenciaCedula = response;
        if (this.respuestaBackendExistenciaCedula === 'El paciente ya existe') {
          this.mostrarMensajeCedulaEcuatorianaYExistencia('El paciente ya está registrado en la base de datos');
          this.cedulaInvalido = true;
        }
      });
      this.http.get<string>(`http://${ipServidor}/pacientes/validaCedulaEcuatoriana/${pacCiIngresado}`, { responseType: 'text' as 'json' })
      .subscribe(response => {
        this.respuestaBackendCedulaEcuatoriana = response;
        if (this.respuestaBackendCedulaEcuatoriana === 'La cédula no es válida') {
          this.mostrarMensajeCedulaEcuatorianaYExistencia('La cédula no es válida');
          this.cedulaInvalido = true;
        }
      });
    }
  }

  async mostrarMensajeCedulaEcuatorianaYExistencia(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Método para validar el correo electrónico del paciente
  correoInvalido: boolean = false;
  respuestaBackendExistenciaCorreoElec: string = '';
  respuestaBackendValidaCorreoElec: string = '';
  validarCorreoElec() {
  this.correoInvalido = false; // Restablece el valor de correoInvalido a falso antes de realizar las validaciones
  // Obtener pacCorreoElec registrado en el sistema y pacCorreoElec ingresado
  const pacCorreoElecIngresado = this.paciente.pacCorreoElec;
  console.log('pacCorreoElecRegistrado:', this.pacCorreoElecRegistrado);
  console.log('pacCorreoElecIngresado:', pacCorreoElecIngresado);
  // Verificar si el pacCorreoElec ingresado es diferente al pacCorreoElec registrado
  if (pacCorreoElecIngresado !== this.pacCorreoElecRegistrado) {
    // Si son diferentes, realizar la validación de existencia y validación del correo electrónico
    this.http.get<string>(`http://${ipServidor}/pacientes/validaExistenciaPacCorreoElec/${pacCorreoElecIngresado}`, { responseType: 'text' as 'json' })
      .subscribe(response => {
        this.respuestaBackendExistenciaCorreoElec = response;
        if (this.respuestaBackendExistenciaCorreoElec === 'El correo ya existe') {
          this.mostrarMensajeValidaCorreoElecYExistencia('El correo ya está registrado en la base de datos');
          this.correoInvalido = true;
        }
      });
      this.http.get<string>(`http://${ipServidor}/pacientes/validaCorreoElec/${pacCorreoElecIngresado}`, { responseType: 'text' as 'json' })
      .subscribe(response => {
        this.respuestaBackendValidaCorreoElec = response;
        if (this.respuestaBackendValidaCorreoElec === 'El correo no es válido') {
          this.mostrarMensajeValidaCorreoElecYExistencia('El correo no es válido');
          this.correoInvalido = true;
        }
      });
    }
  }

  async mostrarMensajeValidaCorreoElecYExistencia(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Método para validar el número de teléfono móvil
  pacTelefonoMovInvalido = false; // Inicialmente se considera no válido
  validarTelefonoMov() {
    if (this.paciente.pacTelefonoMov) {
      const telefonoPattern = /^\d{10}$/; // Expresión regular para 10 dígitos
      if (!telefonoPattern.test(this.paciente.pacTelefonoMov)) {
        this.pacTelefonoMovInvalido = true;
      } else {
        this.pacTelefonoMovInvalido = false;
      }
    } else {
      this.pacTelefonoMovInvalido = false; // Considera válido si el campo está vacío
    }
  }
  
  // Método para registrar la imagen y transformarla a byte
  selectedFile: File | null = null;
  cargarFotografia(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type.startsWith('image/')) {
        this.selectedFile = selectedFile;
        this.mostrarVistaPreviaFotografia(); // Muestra la vista previa de lafotografía
      } else {
        console.error('El archivo seleccionado no es una imagen.');
      }
    } else {
      // Si no se selecciona ningún archivo, no hace nada (no cambia selectedFile)
      // Muestra la vista previa de la fotografía actual en la base de datos
      this.mostrarVistaPreviaFotografia();
    }
  }
 
  // Método que convierte la imagen en bytes
  convertirImagenABytes(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        resolve(bytes);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // Método para convertir bytes a cadena Base64
  convertirBytesAImagenBase64(bytes: Uint8Array): string {
    const byteArray = Array.from(bytes);
    return btoa(String.fromCharCode.apply(null, byteArray));
  }

  // Variable para almacenar la URL segura de la imagen
  pacienteFotografiaURL: SafeUrl | null = null;
  // Método para mostrar la vista previa de la fotografía
  mostrarVistaPreviaFotografia() {
    const imageUrl = this.getSelectedFileUrl();
    if (imageUrl) {
      this.pacienteFotografiaURL = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
      // Forzar la verificación de cambios después de actualizar la URL
      this.cdRef.detectChanges();
      console.log('Vista previa de la fotografía mostrada:', this.pacienteFotografiaURL);
    } else {
      console.log('No hay datos de imagen disponibles para mostrar la vista previa.');
      this.pacienteFotografiaURL = null;
    }
  }

  // Método para obtener la URL segura de la imagen seleccionada
  getSelectedFileUrl(): string | null {
    if (this.selectedFile) {
      return URL.createObjectURL(this.selectedFile);
    } else {
      return null;
    }
  }

  // Método para actualizar la información del paciente
  async actualizarPaciente() {
    // Valida la existencia del paciente registrado en el sistema
    const pacCi = this.paciente.pacCi;
    try {
      console.log('Datos del paciente antes de enviar la solicitud:', this.paciente);
      if (this.selectedFile) {
        const bytes = await this.convertirImagenABytes(this.selectedFile);
        this.paciente.pacFotografia = this.convertirBytesAImagenBase64(bytes);
      }
      // Envía el objeto paciente actualizado al backend
      this.http.put(`http://${ipServidor}/pacientes/${pacCi}/update`, this.paciente).subscribe(
        (response) => {
          console.log('Paciente actualizado con éxito', response);
          // Muestra una alerta de éxito
          this.mostrarAlerta('Éxito', 'Paciente actualizado con éxito');
        },
        (error) => {
          console.error('Error al actualizar la información del paciente:', error);
          // Muestra una alerta de error
          this.mostrarAlerta('Error', 'No se pudo actualizar la información del paciente');
        }
      );
    } catch (error) {
      console.error('Error en el bloque try:', error);
      // Maneja errores específicos
      if (error instanceof HttpErrorResponse) {
        if (error.status === 422) {
          const errorMessage = error.error.message;
          console.error('Error al actualizar la información del paciente:', errorMessage);
          this.mostrarAlerta('Error de validación', errorMessage);
        }
      }
    }
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            console.log('Botón OK presionado');
            // Redirige a una página de ventana-paciente
            this.navCtrl.navigateForward('/ventana-paciente');
          },
        },
      ],
    });
    await alert.present();
  }
      
  // Mostrar la alerta de confirmación al terminar de llenar el formulario
  async mostrarAlertaConfirmacion() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Está seguro de que los datos modificados están correctos?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Operación cancelada');
          },
        },
        {
          text: 'Aceptar',
          handler: () => {
            console.log('Usuario continuó');
            this.actualizarPaciente(); // Método actualizarPaciente() para guardar en la base de datos
          },
        },
      ],
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

  abrirMenuIzquierdo() {
    if (!this.menuCtrl.isEnabled('menuIzquierdo')) {
      this.menuCtrl.enable(true, 'menuIzquierdo');
    }
    this.menuCtrl.open('menuIzquierdo');
  }

  goVentanaPaciente(){
    localStorage.setItem('backvalue','ventanaPaciente');
    this.router.navigateByUrl('/ventana-paciente');
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
    localStorage.setItem('backvalue','resetearClave');
    this.router.navigateByUrl('/resetear-clave');
  }
  
  goSalir(){
    // Limpiar datos de autenticación y redirigir a la página de inicio
    this.authService.setPacienteData(null);
    this.authService.setIdentifierKey('');
    this.authService.setUsername('');
    localStorage.setItem('backvalue','home');
    this.router.navigateByUrl('/home');
  }
  
  goListadoMedico(){
    localStorage.setItem('backvalue','listadoMedico');
    this.router.navigateByUrl('/listado-medico');
  }
}