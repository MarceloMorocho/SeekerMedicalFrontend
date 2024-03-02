import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IndicaPaginaService } from '../indica-pagina.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { SafeUrl } from '@angular/platform-browser';

const ipServidor = '192.168.0.115:8080'; // Dirección IP del servidor

@Component({
  selector: 'app-registrar-paciente',
  templateUrl: './registrar-paciente.page.html',
  styleUrls: ['./registrar-paciente.page.scss'],
})

export class RegistrarPacientePage implements OnInit {
  paciente: any = {}; // Modelo de datos del paciente
  // Declaración para cambiar de paginación tab
  private navegacion : string;
  idnavactual : number;
  private numpages : number;
  private paginacion: IndicaPaginaService = new IndicaPaginaService;

  constructor(
    private navCtrl: NavController, 
    private router: Router, 
    private route: ActivatedRoute, 
    private datos: IndicaPaginaService, 
    private http: HttpClient, 
    private platform: Platform,
    private alertController: AlertController) { 
    this.numpages=3;
    this.idnavactual=1;
    this.navegacion=datos.crear_paginador(this.numpages,this.idnavactual);
  }

  ngOnInit() {
    this.cambiarPaginacion();
    this.activarSeccionActual();
  }

  cambiarPaginacion(){
    let myDiv = <HTMLElement>document.getElementById("paginacion");
    myDiv.innerHTML = this.navegacion;
  }

  activarSeccionActual(){
    for(let x=1;x<=this.numpages;x++){
      var identificador="tab"+x;
      if(x==this.idnavactual){
        this.mostrarTab(identificador);
      } else {
        this.ocultarTab(identificador);
      }
    }
  }

  ocultarTab(identificador: string){
    const elemento=<HTMLElement>document.getElementById(identificador);
    if (elemento != null) {
      elemento.classList.add("ion-hide");
    }
  }

  mostrarTab(identificador: string){
    const elemento=<HTMLElement>document.getElementById(identificador);
    if (elemento != null) {
      elemento.classList.remove("ion-hide");
    }
  }

  resetControl(identificador: string){
    var input= document.getElementById(identificador) as HTMLInputElement;
    input.value="";
  }

  setControl(identificador:string, valor:string){
    var input= document.getElementById(identificador) as HTMLInputElement;
    input.value=valor;
  }

  // Permite avanzar entre los tap
  siguienteTab(){
    if(this.idnavactual==this.numpages){
      this.mostrarTab("tab3");
      this.mostrarTab("pagContinuar");
      this.ocultarTab("mensajeExito");
      this.mostrarAlertaConfirmacion(); //Activa el mensaje de confirmación cuando se termina de llenar el formulario
    } else {
      this.idnavactual++;
      this.activarSeccionActual();
    }
    this.navegacion=this.paginacion.crear_paginador(this.numpages,this.idnavactual);
    this.cambiarPaginacion();
  }

  // Permite retroceder entre los tap
  retrocederTab() {
    if (this.idnavactual > 1) {
      this.idnavactual--;
      this.activarSeccionActual();
      this.navegacion = this.paginacion.crear_paginador(this.numpages, this.idnavactual);
      this.cambiarPaginacion();
    }
  }

  // Método para abrir el modal de términos y condiciones de servicio
  isModalOpen: boolean  = false;
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  // Método para validar que acepten los términos y condiciones de servicio
  public terminos: boolean = false;
  onTerminosChecked(event: any) {
    if(event.detail.checked) {
      this.mostrarTab("pagContinuar");
    } else if (!event.detail.checked) {
      this.ocultarTab("pagContinuar");
    }
  }

  // Método para validar que los campos sean obligatorios y se habilite el botón continuar
  formInvalido = false; // Variable para controlar si se muestra el mensaje de alerta
  habilitarBotonTab2 = false;
  habilitarBotonTab3 = false;
  async validarCamposObligatorios() {
    // Verifica si los campos obligatorios en el tab actual están completos
    if (this.idnavactual === 2) {
      if (
        // Campos obligatorios del tab 2
        this.paciente.pacNombres &&
        this.paciente.pacApellidos &&
        this.paciente.pacCi &&
        this.paciente.pacCorreoElec &&
        this.paciente.pacTelefonoMov
      ) {
        this.habilitarBotonTab2 = true;
        this.formInvalido = false;
      } else {
        this.habilitarBotonTab2 = false;
        this.formInvalido = true;
      }
    } else if (this.idnavactual === 3) {
      if (
        // Campos obligatorios del tab 3
        this.paciente.pacClave &&
        this.pacConfirmarClave &&
        this.paciente.pacClave === this.pacConfirmarClave
      ) {
        this.habilitarBotonTab3 = true;
        this.clavesDifieren = false; // Las claves coinciden
        this.formInvalido = false;
      } else {
        this.habilitarBotonTab3 = false;
        this.clavesDifieren = true; // Las claves no coinciden
        this.formInvalido = true;
      }
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
    // Valida la existencia del paciente registrado en el sistema
    const cedula = this.paciente.pacCi;
    this.http.get<string>(`http://${ipServidor}/pacientes/validaExistenciaPacCi/${cedula}`, { responseType: 'text' as 'json' })
    .subscribe(response => {
      this.respuestaBackendExistenciaCedula = response;
      // Verifica si la respuesta contiene "El paciente ya existe" y muestra un mensaje en consecuencia
      if (this.respuestaBackendExistenciaCedula === 'El paciente ya existe') {
        this.mostrarMensajeCedulaEcuatorianaYExistencia('El paciente ya está registrado en la base de datos');
        // Establece cedulaInvalido en verdadero si la validación falla
        this.cedulaInvalido = true;
      }
    });
    // Valida la cédula ecuatoriana
    this.http.get<string>(`http://${ipServidor}/pacientes/validaCedulaEcuatoriana/${cedula}`, { responseType: 'text' as 'json' })
    .subscribe(response => {
      this.respuestaBackendCedulaEcuatoriana = response;
      if (this.respuestaBackendCedulaEcuatoriana === 'La cédula no es válida') {
        this.mostrarMensajeCedulaEcuatorianaYExistencia('La cédula no es válida');
        // Establece cedulaInvalido en verdadero si la validación falla
        this.cedulaInvalido = true;
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

  // Método para validar el correo electrónico del paciente
  correoInvalido: boolean = false;
  respuestaBackendExistenciaCorreoElec: string = '';
  respuestaBackendValidaCorreoElec: string = '';
  validarCorreoElec() {
    // Restablece el valor de correoInvalido a falso antes de realizar las validaciones
    this.correoInvalido = false;
    // Valida la existencia del correo electrónico registrado en el sistema
    const correoElec= this.paciente.pacCorreoElec;
    this.http.get<string>(`http://${ipServidor}/pacientes/validaExistenciaPacCorreoElec/${correoElec}`, { responseType: 'text' as 'json' })
    .subscribe(response => {
      this.respuestaBackendExistenciaCorreoElec = response;
      // Verificar si la respuesta contiene "El usuario ya existe" y mostrar un mensaje en consecuencia
      if (this.respuestaBackendExistenciaCorreoElec === 'El correo ya existe') {
        this.mostrarMensajeValidaCorreoElecYExistencia('El correo ya está registrado en la base de datos');
        // Establece correoInvalido en verdadero si la validación falla
        this.correoInvalido = true; 
      }
    });
    // Validar el correo electrónico
    this.http.get<string>(`http://${ipServidor}/pacientes/validaCorreoElec/${correoElec}`, { responseType: 'text' as 'json' })
    .subscribe(response => {
    this.respuestaBackendValidaCorreoElec = response;
      // Verifica si la respuesta contiene "El correo no es válido" y muestra un mensaje en consecuencia
      if (this.respuestaBackendValidaCorreoElec === 'El correo no es válido') {
        this.mostrarMensajeValidaCorreoElecYExistencia('El correo no es válido');
        // Establece correoInvalido en verdadero si la validación falla
        this.correoInvalido = true;
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

  // Método para registrar la foto y transformarla a byte
  selectedFile: File | null = null;
  defaultAvatarUrl = 'assets/imagenes/avatar.png'; // Ruta a la imagen de avatar predeterminada
  cargarFotografia(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      // Verifica si el archivo seleccionado es una imagen
      if (selectedFile.type.startsWith('image/')) {
        // Convierte la imagen a bytes
        this.convertirImagenABytes(selectedFile).then((bytes) => {
          this.paciente.pacFotografia = Array.from(bytes);
          this.selectedFile = selectedFile;
        });
      } else {
        // Muestra un mensaje de error si el archivo no es una imagen
        console.error('El archivo seleccionado no es una imagen.');
        this.selectedFile = null;
        // Establece el avatar predeterminado
        this.paciente.pacFotografia = this.defaultAvatarUrl;
      }
    } else {
      // No se seleccionó ningún archivo, establece el avatar predeterminado
      this.selectedFile = null;
      this.paciente.pacFotografia = this.defaultAvatarUrl;
    }
  }
  
  getSelectedFileUrl(): SafeUrl | null {
    return this.selectedFile ? URL.createObjectURL(this.selectedFile) : null;
  }

  // Este método convierte la imagen en bytes
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

  // Método para validar la clave registrada por el paciente
  pacClaveInvalido = false; // Inicialmente se considera válida
  validarClave(){
    if (this.paciente.pacClave && this.paciente.pacClave.length < 8) {
      this.pacClaveInvalido = true;
    } else {
      this.pacClaveInvalido = false;
    }
  }

  // Método para comparar las claves
  clavesDifieren = false;
  pacConfirmarClave: string = ''; 
  compararClaves() {
    if (this.paciente.pacClave !== this.pacConfirmarClave) {
      console.log('Las contraseñas no coinciden');
      this.clavesDifieren = true;
    } else {
      console.log('Las contraseñas coinciden');
      this.clavesDifieren = false;
    }
  } 
  
  // Utilizado para mostrar la alerta de confirmación al terminar de llenar el formulario
  async mostrarAlertaConfirmacion() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Está seguro de que los datos registrados están correctos?',
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
            // Se agrega el método registrarPaciente() para guardar en la base de datos
            this.registrarPaciente();
          },
        },
      ],
    });
    await alert.present();
  }

  // Método para registrar los datos del paciente en la base de datos a través de spring boot
  async registrarPaciente() {
    try {
      console.log('Datos del paciente antes de enviar la solicitud:', this.paciente);
      if (this.selectedFile) {
        const bytes = await this.convertirImagenABytes(this.selectedFile);
        this.paciente.pacFotografia = Array.from(bytes);
      } else {
        const avatarResponse = await fetch(this.defaultAvatarUrl);
        const avatarBlob = await avatarResponse.blob();
        const avatarArrayBuffer = await new Response(avatarBlob).arrayBuffer();
        this.paciente.pacFotografia = Array.from(new Uint8Array(avatarArrayBuffer));
      }
      // Se envía el objeto paciente al backend
      this.http.post(`http://${ipServidor}/pacientes/save`, this.paciente).subscribe(
      (response) => {
        console.log('Paciente registrado con éxito', response);
        // Redirige a una página de éxito
        this.navCtrl.navigateForward('/registro-exitoso');
      }
      );
    } catch (error) {
      console.error('Error en el bloque try:', error);
      // Maneja errores específicos
      if (error instanceof HttpErrorResponse) {
        if (error.status === 422) {
          const errorMessage = error.error.message;
          console.error('Error al registrar paciente:', errorMessage);
          // Navega a la página "registro-erroneo" y pasa el mensaje de error como parámetro
          this.router.navigate(['/registro-erroneo', { mensajeError: errorMessage }]);
        }
      }
    }
  }

  // Método para regresar a página home
  goHome(){
    localStorage.setItem('backvalue','Regresar');
    this.router.navigateByUrl('/home');
  }
}