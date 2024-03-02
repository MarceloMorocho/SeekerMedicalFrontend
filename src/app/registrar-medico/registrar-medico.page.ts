import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IndicaPaginaService } from '../indica-pagina.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AlertController, NavController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SafeUrl } from '@angular/platform-browser';

const ipServidor = '192.168.0.115:8080'; // Dirección IP del servidor

// Mapeo de días a diaId
// En TypeScript, no se puede declarar una constante directamente dentro de una clase. 
// Debe hacerse fuera de la clase o dentro de un método. 
const diasIdMapping: { [key: string]: number } = {
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
  'Sábado': 6,
  'Domingo': 7
};

@Component({
  selector: 'app-registrar-medico',
  templateUrl: './registrar-medico.page.html',
  styleUrls: ['./registrar-medico.page.scss'],
})

export class RegistrarMedicoPage implements OnInit {
  medico: any = { }; // Modelo de datos del médico
  // Declaración para cambiar de paginación tab
  private navegacion : string;
  idnavactual : number;
  private numpages : number;
  private paginacion: IndicaPaginaService = new IndicaPaginaService;

  constructor(private navCtrl: NavController, 
    private geolocation: Geolocation, 
    private router: Router, 
    private route: ActivatedRoute, 
    private datos: IndicaPaginaService, 
    private http: HttpClient, 
    private alertController: AlertController) { 
    this.numpages=6;
    this.idnavactual=1; 
    this.navegacion=datos.crear_paginador(this.numpages,this.idnavactual);
    this.selectedEspecialidad = []; // Inicialización cuando selecciona las especialidades
    this.medico.medUbicacionLat = this.medUbicacionLat;
    this.medico.medUbicacionLon = this.medUbicacionLon;
    this.ordenarDias(); // Ordena los días alfabéticamente
  }
 
  ngOnInit() {
    this.cambiarPaginacion();
    this.activarSeccionActual();
    this.obtenerEspecialidadesDesdeBackend();  // Permite obtener las especialidades médicas desde el backend
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
      this.mostrarTab("tab6");
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
  habilitarBotonTab4 = false;
  habilitarBotonTab5 = false;
  habilitarBotonTab6 = false;
  async validarCamposObligatorios() {
    // Verifica si los campos obligatorios en el tab actual están completos
    if (this.idnavactual === 2) {
      if ( 
        // Campos obligatorios del tab 2
        this.medico.medDenominacion &&
        this.medico.medNombres &&
        this.medico.medApellidos &&
        this.medico.medCi &&
        this.medico.medCorreoElec
      ) {
        this.habilitarBotonTab2 = true;
        this.formInvalido = false;
      } else {
        this.habilitarBotonTab2 = false;
        this.formInvalido = true;
      }
    } else 
    if (this.idnavactual === 3) {
      if ( 
        // Campos obligatorios del tab 3       
        this.selectedEspecialidad && this.selectedEspecialidad.length > 0 &&
        this.medico.medDescripcionPro 
      ) {
        this.habilitarBotonTab3 = true;
        this.formInvalido = false;
      } else {
        this.habilitarBotonTab3 = false;
        this.formInvalido = true;
      }
    } else  
    if (this.idnavactual === 4) { 
      if ( 
        // Campos obligatorios del tab 4
        this.medico.medUbicacionLat !== null && this.medico.medUbicacionLon !== null) {
        this.habilitarBotonTab4 = true;
      } else {
        this.habilitarBotonTab4 = false;
      }
      } else
    if (this.idnavactual === 5) {
      if ( 
        // Campos obligatorios del tab 5
        this.medico.medDireccionCalles &&
        this.medico.medDireccionCom &&
        this.medico.medTelefonoMov
      ) {
        this.habilitarBotonTab5 = true;  
        this.formInvalido = false;
      } else {
        this.habilitarBotonTab5 = false;
        this.formInvalido = true;
      }
    } else 
    if (this.idnavactual === 6) {
      if ( 
        // Campos obligatorios del tab 6
        this.medico.medClave &&
        this.medConfirmarClave &&
        this.medico.medClave === this.medConfirmarClave
      ) { 
        // Verifica si al menos un elemento ha sido agregado a la lista de días y horarios
        if (this.diasYHorariosSeleccionados.length > 0) {
          this.habilitarBotonTab6 = true;
          this.clavesDifieren = false; // Las claves coinciden
          this.formInvalido = false; // Establecer a false cuando los campos se completan correctamente
        } else {
          this.habilitarBotonTab6 = false;
          this.clavesDifieren = true; // Las claves no coinciden
          this.formInvalido = true; // Muestra un mensaje de alerta
        }
      } 
      // Agregar esta condición para mostrar el mensaje de alerta si no hay días y horarios seleccionados
      if (this.idnavactual === 6 && this.diasYHorariosSeleccionados.length === 0) {
      this.formInvalido = true;
      }
    }
  }

  // Método para validar los nombres
  medNombresInvalido = false; // Inicialmente se considera no válido
  validarNombres() {
    if (this.medico.medNombres.length < 3) {
      this.medNombresInvalido = true;
    } else {
      this.medNombresInvalido = false;
    }
  }

  // Método para validar los apellidos
  medApellidosInvalido = false; // Inicialmente se considera no válido
  validarApellidos() {
    if (this.medico.medApellidos.length < 3) {
    this.medApellidosInvalido = true;
    } else {
    this.medApellidosInvalido = false;
    }
  }

  // Método para validar la cédula
  cedulaInvalido: boolean = false;
  respuestaBackendExistenciaCedula: string = '';
  respuestaBackendCedulaEcuatoriana: string = '';

  validarCedulaEcuatorianaYExistencia() {
    this.cedulaInvalido = false;
    // Valida la existencia del médico registrado en el sistema
    const cedula = this.medico.medCi;
    this.http.get<string>(`http://${ipServidor}/medicos/validaExistenciaMedCi/${cedula}`, { responseType: 'text' as 'json' })
    .subscribe(response => {
      this.respuestaBackendExistenciaCedula = response;
      // Verifica si la respuesta contiene "El médico ya existe" y muestra un mensaje en consecuencia
      if (this.respuestaBackendExistenciaCedula === 'El médico ya existe') {
        this.mostrarMensajeCedulaEcuatorianaYExistencia('El médico ya está registrado en la base de datos');
        // Establece cedulaInvalido en verdadero si la validación falla
        this.cedulaInvalido = true;
      }
    });

    // Valida la cédula ecuatoriana
    this.http.get<string>(`http://${ipServidor}/medicos/validaCedulaEcuatoriana/${cedula}`, { responseType: 'text' as 'json' })
    .subscribe(response => {
      this.respuestaBackendCedulaEcuatoriana = response;
       // Verifica si la respuesta contiene "La cédula no es válida" y muestra un mensaje en consecuencia
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

  // Método para validar el correo electrónico del médico
  correoInvalido: boolean = false;
  respuestaBackendExistenciaCorreoElec: string = '';
  respuestaBackendValidaCorreoElec: string = '';
  validarCorreoElec() {
    // Restablece el valor de correoInvalido a falso antes de realizar las validaciones
    this.correoInvalido = false;
    // Valida la existencia del correo electrónico registrado en el sistema
    const correoElec= this.medico.medCorreoElec;
    this.http.get<string>(`http://${ipServidor}/medicos/validaExistenciaMedCorreoElec/${correoElec}`, { responseType: 'text' as 'json' })
    .subscribe(response => {
      this.respuestaBackendExistenciaCorreoElec = response;
      // Verifica si la respuesta contiene "El correo ya existe" y muestra un mensaje en consecuencia
      if (this.respuestaBackendExistenciaCorreoElec === 'El correo ya existe') {
        this.mostrarMensajeValidaCorreoElecYExistencia('El correo ya está registrado en la base de datos');
        // Establece correoInvalido en verdadero si la validación falla
        this.correoInvalido = true; 
      }
    });

    // Validar el correo electrónico
    this.http.get<string>(`http://${ipServidor}/medicos/validaCorreoElec/${correoElec}`, { responseType: 'text' as 'json' })
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
  // Variables para el avatar predeterminado y la imagen seleccionada
  defaultAvatarUrl = 'assets/imagenes/avatar.png'; // Ruta a la imagen de avatar predeterminada
  cargarFotografia(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      // Verifica si el archivo seleccionado es una imagen
      if (selectedFile.type.startsWith('image/')) {
        // Convierte la imagen a bytes
        this.convertirImagenABytes(selectedFile).then((bytes) => {
          this.medico.medFotografia = Array.from(bytes);
          this.selectedFile = selectedFile;
        });
      } else {
        // Muestra un mensaje de error si el archivo no es una imagen
        console.error('El archivo seleccionado no es una imagen.');
        this.selectedFile = null;
        // Establece el avatar predeterminado
        this.medico.medFotografia = this.defaultAvatarUrl;
      }
    } else {
      // No se seleccionó ningún archivo, establece el avatar predeterminado
      this.selectedFile = null;
      this.medico.medFotografia = this.defaultAvatarUrl;
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

  // Método para validar la Descripción Profesional
  medDescripcionProInvalido = false; // Inicialmente se considera no válido
  validarDescripcionPro() {
    if (this.medico.medDescripcionPro.length < 30) {
      this.medDescripcionProInvalido = true;
    } else {
      this.medDescripcionProInvalido = false;
    }
  }

  // Obtención de especialidades desde el backend
  especialidades: string[] = [];
  obtenerEspecialidadesDesdeBackend() {
    this.http.get<any[]>(`http://${ipServidor}/especialidadesMedicas/all`)
      .subscribe(
        (especialidades: any[]) => {
          this.especialidades = especialidades.map(e => e.emDescripcion);
        },
        error => {
          console.error('Error al obtener especialidades desde el backend:', error);
        }
      );
  }

  // Método para la ubicación a través de google maps
  private apiUrl = `http://${ipServidor}/buscar_lugares_maps`; // URL del servidor Spring Boot
  // Variable para rastrear si los permisos se han solicitado
  private locationPermissionsRequested = false;
  // Variables empleadas en google maps
  buscarLugar: string = ''; 
  nombre: string = ' Cuenca';
  direccion: string = ' Cuenca, Ecuador'; 
  medUbicacionLat: number = -2.900128; 
  medUbicacionLon: number = -79.005896;

  // Llama al método para obtener la ubicación en ionViewDidEnter
  async ionViewDidEnter() {
    if (this.idnavactual === 4 && !this.locationPermissionsRequested) {
      await this.checkLocationPermission();
      this.locationPermissionsRequested = true; // Marca los permisos como solicitados
    }
    if ('geolocation' in navigator) {
      try {
        const position = await this.geolocation.getCurrentPosition();
        this.medico.medUbicacionLat = position.coords.latitude;
        this.medico.medUbicacionLon = position.coords.longitude;

        // Verifica si se ha ingresado algún lugar en el campo de búsqueda
        if (this.buscarLugar.trim() !== '') {
          // Llama al método para buscar lugares con las nuevas coordenadas
          this.buscarLugares();
        } else {
          // Si no se ha ingresado un lugar, al menos actualiza la vista de la ubicación actual
          this.actualizarDatosDelLugar(this.medico.medUbicacionLat, this.medico.medUbicacionLon);
          // Llama a mostrarMensajeDeBusqueda después de actualizar los datos del lugar
          this.mostrarMensajeDeBusqueda();
        }
      } catch (error) {
        // Maneja errores al obtener la ubicación actual
        console.error('Error al obtener la ubicación actual:', error);
        this.showGeolocationAlert();
        // Llama a mostrarMensajeDeBusqueda después de mostrar la alerta
        this.mostrarMensajeDeBusqueda();
      }
    } else {
      // Si la geolocalización no está habilitada, establece las coordenadas iniciales en Cuenca, Ecuador
      this.medico.medUbicacionLat = -2.900128; // Latitud de Cuenca, Ecuador
      this.medico.medUbicacionLon = -79.005896; // Longitud de Cuenca, Ecuador
      // Llama al método para actualizar los datos del lugar con las coordenadas iniciales
      this.actualizarDatosDelLugar(this.medico.medUbicacionLat, this.medico.medUbicacionLon);
      // Llama a mostrarMensajeDeBusqueda después de actualizar los datos del lugar
      this.mostrarMensajeDeBusqueda();
    }
  }

  async checkLocationPermission() {
    try {
      const position = await this.geolocation.getCurrentPosition();
      this.medico.medUbicacionLat = position.coords.latitude;
      this.medico.medUbicacionLon = position.coords.longitude;
    } catch (error) {
      // Ubicación desactivada o error al acceder a la ubicación
      this.showGeolocationAlert();
      // Llama a mostrarMensajeDeBusqueda después de mostrar la alerta
      this.mostrarMensajeDeBusqueda();
    }
  }

  async showGeolocationAlert() {
    const confirm = await this.alertController.create({
      header: 'Ubicación deshabilitada',
      message: 'Los servicios de geolocalización están deshabilitados. Para una mejor experiencia de usuario, habilita la ubicación manualmente en la configuración de tu dispositivo',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.mostrarMensajeDeBusqueda();
          }
        }
      ]
    });
    await confirm.present();
  }

  async mostrarMensajeDeBusqueda() {
    if (this.idnavactual === 4) {
      const alert = await this.alertController.create({
        header: 'Búsqueda Manual',
        message: 'Debido a que no ha habilitado la ubicación de su dispositivo, por favor, busque su dirección por el nombre',
        buttons: ['OK']
      });

      await alert.present();
    }
  }

  // Método para buscar lugares en google maps
  // Agrega una variable para rastrear si la ubicación actual está habilitada
  // Método cuando pulso sobre el botón "Buscar por nombre"
  buscarLugares() {
    this.http.get(`${this.apiUrl}?query=${this.buscarLugar}`).subscribe(
      (data: any) => {
        if (data && data.results && data.results.length > 0) {
          const lugar = data.results[0];
          this.nombre = lugar.name;
          this.direccion = lugar.formatted_address;
          this.medUbicacionLat = lugar.geometry.location.lat;
          this.medUbicacionLon = lugar.geometry.location.lng;
          // Actualiza las propiedades de latitud y longitud del médico
          this.medico.medUbicacionLat = lugar.geometry.location.lat;
          this.medico.medUbicacionLon = lugar.geometry.location.lng;
        } else {
          // Muestra una alerta si no se encuentran resultados
          this.mostrarAlertaLugar('No se encontraron resultados', 'No se encontraron lugares para la búsqueda');
        }
      },
      (error) => {
        console.error('Error al buscar lugares:', error);
        // Muestra un mensaje de error en caso de error
        this.mostrarAlertaLugar('Error', 'Ocurrió un error al buscar lugares. Por favor, inténtelo de nuevo');
      }
    );
  }

  mostrarAlertaLugar(titulo: string, mensaje: string) {
    const alert = this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });

    alert.then((res) => {
      res.present();
    });
  }

  // Método cuando pulso sobre el botón "Ubicación actual"
  ubicarAutomaticamente() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.medUbicacionLat = position.coords.latitude;
        this.medUbicacionLon = position.coords.longitude;
        console.log('Ubicación actual:', this.medUbicacionLat, this.medUbicacionLon);
        // Verifica si se ha ingresado algún lugar en el campo de búsqueda
        if (this.buscarLugar.trim() !== '') {
          // Llama al método para buscar lugares con las nuevas coordenadas
          this.actualizarDatosDelLugar(this.medUbicacionLat, this.medUbicacionLon);
        } 
      }, (error) => {
        this.showGeolocationAlert();
      });
    } else {
      console.error('La geolocalización no está disponible en este dispositivo');
    }
  }

  // Define el método actualizarDatosDelLugar
  actualizarDatosDelLugar(medUbicacionLat: number, medUbicacionLon: number) {
    // API de Geocodificación inversa de Google Maps para obtener los datos del lugar
    const apiKey = 'AIzaSyC11776nnpYQTWenID5bQgLBGVNu1RZb9M'; // API de Google Maps
    // URL para la solicitud de geocodificación inversa
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${medUbicacionLat},${medUbicacionLon}&key=${apiKey}`;
    this.http.get(geocodingUrl).subscribe(
      (data: any) => {
        if (data.status === 'OK' && data.results.length > 0) {
          const resultado = data.results[0];

          // Busca el componente de tipo "localidad" (ciudad) en la respuesta
          const localidadComponent = resultado.address_components.find((component: any) => component.types.includes('locality'));
          if (localidadComponent) {
            this.nombre = localidadComponent.long_name;
          } else {
            // Si no se encuentra la localidad, muestra un mensaje de error
            this.nombre = 'Localidad no encontrada';
          }
          // Establece la dirección completa
          this.direccion = resultado.formatted_address;
          // Llama al método para actualizar los datos del lugar con las nuevas coordenadas
          this.actualizarDatosDelLugar(this.medUbicacionLat, this.medUbicacionLon);
        } else {
          // No se encontraron resultados válidos
          this.mostrarAlertaMaps('Error', 'No se encontraron resultados válidos para la ubicación');
        }
      },
      (error) => {
        console.error('Error en la solicitud de geocodificación:', error);
        this.mostrarAlertaMaps('Error', 'Ocurrió un error al obtener los datos del lugar');
      }
    );
  }

  mostrarAlertaMaps(titulo: string, mensaje: string) {
    this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    }).then((alert) => {
      alert.present();
    });
  }

  onMarkerPositionChanged(event: any) {
    console.log('Marcador movido');
    const newPosition = event.target.getPosition();
    this.medico.medUbicacionLat = newPosition.lat();
    this.medico.medUbicacionLon = newPosition.lng();
    console.log('Nueva posición del marcador:', newPosition.lat(), newPosition.lng());
    // Llama al método para actualizar los datos del lugar con las nuevas coordenadas
    this.actualizarDatosDelLugar(this.medUbicacionLat, this.medUbicacionLon);
  }
  
  // Método para validar la dirección de las calles
  medDireccionCallesInvalido = false; // Inicialmente se considera no válido
  validarDireccionCalles() {
    if (this.medico.medDireccionCalles.length < 5) {
      this.medDireccionCallesInvalido = true;
    } else {
      this.medDireccionCallesInvalido = false;
    }
  }

  // Método para validar la dirección de edificios, piso, oficinas
  medDireccionComInvalido = false; // Inicialmente se considera no válido
  validarDireccionCom() {
    if (this.medico.medDireccionCom.length < 3) {
      this.medDireccionComInvalido = true;
    } else {
      this.medDireccionComInvalido = false;
    }
  }

  // Método para validar el número de teléfono móvil
  medTelefonoConInvalido = false; // Inicialmente se considera no válido
  validarTelefonoCon() {
    if (this.medico.medTelefonoCon) {
      const telefonoPattern = /^\d{9}$/; // Expresión regular para 9 dígitos exactamente
      if (!telefonoPattern.test(this.medico.medTelefonoCon)) {
        this.medTelefonoConInvalido = true;
      } else {
        this.medTelefonoConInvalido = false;
      }
    } else {
      this.medTelefonoConInvalido = false; // Considerar válido si el campo está vacío
    }
  }
 
  // Método para validar el número de teléfono móvil
  medTelefonoMovInvalido = false; // Inicialmente se considera no válido
  validarTelefonoMov() {
    if (this.medico.medTelefonoMov) {
      const telefonoPattern = /^\d{10}$/; // Expresión regular para 10 dígitos
      if (!telefonoPattern.test(this.medico.medTelefonoMov)) {
        this.medTelefonoMovInvalido = true;
      } else {
        this.medTelefonoMovInvalido = false;
      }
    } else {
    this.medTelefonoMovInvalido = false; // Considera válido si el campo está vacío
    }
  }

  // Método para validar la clave registrada por el médico
  medClaveInvalido = false; // Inicialmente se considera válida
  validarClave(){
    if (this.medico.medClave && this.medico.medClave.length < 8) {
      this.medClaveInvalido = true;
    } else {
      this.medClaveInvalido = false;
    }
  }

  // Método para comparar las claves
  clavesDifieren = false;
  medConfirmarClave: string = ''; 
  compararClaves() {
      if (this.medico.medClave !== this.medConfirmarClave) {
        console.log('Las contraseñas no coinciden');
        this.clavesDifieren = true;
      } else {
        console.log('Las contraseñas coinciden');
        this.clavesDifieren = false;
      }
    } 

   // Método para abrir el modal de horarios de servicio
  isModalOpenHorario = false;
  setOpenHorario(isOpenHorario: boolean){
    this.isModalOpenHorario = isOpenHorario;
  }

  // Arreglo para almacenar los días y horarios seleccionados
  diasYHorariosSeleccionados: { diaDescripcion: string, hm1Inicio: string, hm1Fin: string, hm2Inicio: string, hm2Fin: string }[] = [];

  diaDescripcion: { [key: string]: boolean } = {
    'Lunes': false,
    'Martes': false,
    'Miércoles': false,
    'Jueves': false,
    'Vieres': false,
    'Sábado': false,
    'Domingo': false,
  };

  // Método para manejar cambios en los días seleccionados
  getDiasSeleccionados(): string[] {
    return Object.keys(this.diaDescripcion).filter(dia => this.diaDescripcion[dia]);
  }

  // Manejo de horarios
  hm1Inicio: string = "";
  hm1Fin: string = "";
  hm2Inicio: string = "";
  hm2Fin: string = "";

  // Método para manejar el evento de agregar días y horarios
  async agregarDiasYHorarios() {
    // Obtiene los días seleccionados
    const diasSeleccionados = this.getDiasSeleccionados();
    // Verifica que se hayan seleccionado almenos un día
    if (diasSeleccionados.length === 0) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Seleccione al menos un día',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Verifica si alguno de los días ya ha sido seleccionado
    for (const dia of diasSeleccionados) {
      // Comprueba si el día ya está en la lista
      if (this.diasYHorariosSeleccionados.some(item => item.diaDescripcion === dia)) {
        const alert = await this.alertController.create({
          header: 'Error',
          message: `El día ${dia} ya ha sido añadido`,
          buttons: ['OK']
        });
        await alert.present();
        return;
      }
    }
    // Valida que hm1Inicio y hm1Fin estén llenas y cumplan con el formato
    if (!this.hm1Inicio || !this.hm1Fin || !this.validarFormato24Horas(this.hm1Inicio) || !this.validarFormato24Horas(this.hm1Fin)) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Debe ingresar el primer intervalo de tiempo en un formato válido (00:00 - 23:59)',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    // Si se ingresaron hm2Inicio o hm2Fin, también deben cumplir con el formato 24 horas
    if ((this.hm2Inicio || this.hm2Fin) && (!this.validarFormato24Horas(this.hm2Inicio) || !this.validarFormato24Horas(this.hm2Fin))) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Debe ingresar el segundo intervalo de tiempo en un formato válido (00:00 - 23:59)',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    // Lógica para agregar días y horarios
    for (const diaDescripcion of diasSeleccionados) {
      const diaRequest = {
          diaDescripcion: diaDescripcion
      };
      let hm2Inicio = this.hm2Inicio || null;
      let hm2Fin = this.hm2Fin || null;
      // Si no se ingresó ningún valor en hm2Inicio o hm2Fin, asigna null
      if (!this.hm2Inicio && !this.hm2Fin) {
        hm2Inicio = null;
        hm2Fin = null;
      }
      this.diasYHorariosSeleccionados.push({
        diaDescripcion,
        hm1Inicio: this.hm1Inicio,
        hm1Fin: this.hm1Fin,
        hm2Inicio: this.hm2Inicio || '',
        hm2Fin: this.hm2Fin || ''
      });
    }
    // Ordena los días alfabéticamente
    this.ordenarDias();
    // Cerrar el modal
    this.isModalOpenHorario = false;
    // Restablecer los valores de las casillas de verificación
    for (const key of Object.keys(this.diaDescripcion)) {
    this.diaDescripcion[key] = false;
    }
  }

  // Método para ordenar los días alfabéticamente
  ordenarDias() {
    // Define el orden de los días de la semana
    const ordenDiasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    // Ordena los días y horarios según el orden predefinido
    this.diasYHorariosSeleccionados.sort((a, b) => {
      const indexA = ordenDiasSemana.indexOf(a.diaDescripcion);
      const indexB = ordenDiasSemana.indexOf(b.diaDescripcion);
      return indexA - indexB;
    });
  }
  
  // Método que permite poner los valores vacíos en las horas
  resetearHorario() {
    this.hm1Inicio = '';
    this.hm2Inicio = '';
    this.hm1Fin = '';
    this.hm2Fin = '';
  }

  formatoHora(event: any, campo: string) {
    const input = event.target;
    let value = input.value;
    // Elimina cualquier caracter que no sea un dígito o ':'
    value = value.replace(/[^\d:]/g, '');
    // Asegura que la longitud no sea mayor de 5 caracteres
    if (value.length > 5) {
      value = value.substr(0, 5);
    }
    // Añade automáticamente los dos puntos después de ingresar dos dígitos para la hora
    if (value.length === 2 && value.indexOf(':') === -1) {
      value += ':';
    }
    // Actualiza el valor del campo de entrada
    input.value = value;
    // Actualiza la propiedad según el campo ingresado
    if (campo === 'hm1Inicio') {
      this.hm1Inicio = value;
    } else if (campo === 'hm2Inicio') {
      this.hm2Inicio = value;
    } else if (campo === 'hm1Fin') {
      this.hm1Fin = value;
    } else if (campo === 'hm2Fin') {
      this.hm2Fin = value;
    }
  }

  validarFormato24Horas(hora: string) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(hora);
  }

  eliminarDiasYHorarios(index: number) {
    // Elimina el día y horario correspondiente al índice proporcionado
    if (index >= 0 && index < this.diasYHorariosSeleccionados.length) {
      this.diasYHorariosSeleccionados.splice(index, 1);
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
            // Se agrega el método registrarMedico() para guardar en la base de datos
            this.registrarMedico();
          },
        },
      ],
    });
    await alert.present();
  }
  
  // Método para registrar toda la información ingresada por el médico
  selectedEspecialidad: string[];
  emDescripcion: { emId: number, emDescripcion: string }[] = [];
  async registrarMedico() {
    try {
      console.log('Datos del médico antes de enviar la solicitud:', this.medico);
      if (this.selectedFile) {
        const bytes = await this.convertirImagenABytes(this.selectedFile);
        this.medico.medFotografia = Array.from(bytes);
      } else {
        const avatarResponse = await fetch(this.defaultAvatarUrl);
        const avatarBlob = await avatarResponse.blob();
        const avatarArrayBuffer = await new Response(avatarBlob).arrayBuffer();
        this.medico.medFotografia = Array.from(new Uint8Array(avatarArrayBuffer));
      }
      // Antes de realizar el envío del médico, se inicializa los campos de ion-toggle en false si son null o undefined
      this.medico.medTagW = this.medico.medTagW || false;
      this.medico.medTagD = this.medico.medTagD || false;
      this.medico.medTagE = this.medico.medTagE || false;
      this.medico.medTagM = this.medico.medTagM || false;
      this.medico.medTag247 = this.medico.medTag247 || false;
      // URL para guardar los datos del médico en el backend
      const medicoResponse = await this.http.post<any>(`http://${ipServidor}/medicos/save`, this.medico).toPromise();
      console.log('Respuesta de la API (Médico):', medicoResponse);
      if (medicoResponse === true) {
        console.log('Médico registrado con éxito.');
        for (const diaHorario of this.diasYHorariosSeleccionados) {
          const diaRequest = {
            diaDescripcion: diaHorario.diaDescripcion
          };
          const diaId = diasIdMapping[diaHorario.diaDescripcion];
          if (diaId !== undefined) {
          } else {
            console.error('El díaId es undefined. Verifica la respuesta del backend o la configuración del mapeo de días.');
          }
          if (diaId) {
            const horarioDeAtencion = {
              diaId: diaId,
              medCi: this.medico.medCi,
              hm1Inicio: diaHorario.hm1Inicio,
              hm1Fin: diaHorario.hm1Fin,
              hm2Inicio: diaHorario.hm2Inicio,
              hm2Fin: diaHorario.hm2Fin
            };
            // URL para guardar los datos de los horarios de atención en el backend
            const horarioResponse = await this.http.post(`http://${ipServidor}/horariosAtencion/save`, horarioDeAtencion).toPromise();
            console.log('Horarios de atención registrados con éxito', horarioResponse);
          } else {
            console.error('Error al registrar el día. Verifica la respuesta del backend:', diaId);
          }
        }
        // Después de guardar los horarios, guarda la relación entre el médico y la especialidad en espMedMedicos
        let allDataSaved = true; // Variable para verificar si se han guardado todos los datos correctamente
        for (const emDescripcion of this.selectedEspecialidad) {
          // Obtiene el emId correspondiente a la especialidad médica desde el backend
          const emIdResponse = await this.http.get<any>(`http://${ipServidor}/especialidadesMedicas/byEmDescripcion/${emDescripcion}`).toPromise();
          const emId = emIdResponse.emId;
          // URL para guardar los datos de la espMedMedicos en el backend
          const espMedMedicoRequest = { medCi: this.medico.medCi, emId: emId };
          const espMedMedicoResponse = await this.http.post<any>(`http://${ipServidor}/espMedMedicos/save`, espMedMedicoRequest).toPromise();
          console.log('Respuesta de la API (espMedMedicos):', espMedMedicoResponse);
          if (espMedMedicoResponse === true) {
            console.log('Relación médico-especialidad registrada con éxito.');
          } else {
            console.error('Error al registrar la relación médico-especialidad. Verifica la respuesta del backend:', espMedMedicoResponse.error);
            allDataSaved = false; // Establece la bandera en falso si hay un error
          }
        }  if (allDataSaved) {
          // Solo navega si todos los datos se han guardado correctamente
          this.navCtrl.navigateForward('/registro-exitoso');
        } else {
          console.error('Error al registrar algún dato. La información no se guardará.');
        }
      } else {
          console.error('Error al registrar el médico. Verifica la respuesta del backend:', medicoResponse.error);
        }
    } catch (error) {
      console.error('Error en el bloque try:', error);
      // Maneja errores específicos
      if (error instanceof HttpErrorResponse) {
        if (error.status === 422) {
          const errorMessage = error.error.message;
          console.error('Error al registrar médico:', errorMessage);
          // Navega a la página "registro-erroneo" y pasa el mensaje de error como parámetro
          this.router.navigate(['/registro-erroneo', { mensajeError: errorMessage }]);
        } else {
          // Otros errores HTTP
          console.error('Error HTTP al registrar médico:', error.statusText);
        }
      } else {
          // Otros tipos de errores
          console.error('Error desconocido al registrar médico:', error);
        }
    }
  }
   
  // Método para regresar a página home
  goHome(){
    localStorage.setItem('backvalue','Regresar');
    this.router.navigateByUrl('/home');
  }
}