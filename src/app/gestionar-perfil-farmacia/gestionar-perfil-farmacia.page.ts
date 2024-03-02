import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IndicaPaginaService } from '../indica-pagina.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AlertController, NavController, MenuController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AuthService } from '../servicios/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // DomSanitizer para garantizar la seguridad al manipular URLs

// Mapeo de días a diaId
// En TypeScript, no se puede declarar una constante directamente dentro de una clase
// Debe hacerse fuera de la clase o dentro de un método 
const diasIdMapping: { [key: string]: number } = {
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
  'Sábado': 6,
  'Domingo': 7
};

const ipServidor = '192.168.0.115:8080';  // Dirección IP del servidor

interface HorarioAtencion {
  hmId: number; // Id de HorarioAtencion
}

@Component({
  selector: 'app-gestionar-perfil-farmacia',
  templateUrl: './gestionar-perfil-farmacia.page.html',
  styleUrls: ['./gestionar-perfil-farmacia.page.scss'],
})

export class GestionarPerfilFarmaciaPage implements OnInit {
  farmacia: any = {}; // Modelo de datos de la farmacia
  identifierKey: string = '';
  username: string = '';
  listaFarmacias: any[] = [];
  filtrosAplicados: string = '';
  atencionDomicilio: boolean = false;
  atencion247: boolean = false;
  filtrosSeleccionados: string[] = [];
  farUbicacionLat: number;
  farUbicacionLon: number;
  farRuc: string = '';
  farRucRegistrado: string = '';
  farCorreoElecRegistrado: string = '';
  farCorreoElec: string = '';
  hmIds: number[] = [];
  hmIdObtenido: number | null = null;
  diaDescripcionMostrar: string = '';
  // Declaración para cambiar de paginación tab
  private navegacion : string;
  idnavactual : number;
  private numpages : number;
  private paginacion: IndicaPaginaService = new IndicaPaginaService;
  
  constructor(
    private navCtrl: NavController, 
    private geolocation: Geolocation, 
    private router: Router, 
    private route: ActivatedRoute, 
    private activatedRoute: ActivatedRoute,
    private datos: IndicaPaginaService, 
    private http: HttpClient, 
    private alertController: AlertController,
    private authService: AuthService,
    private menuCtrl: MenuController,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef) { 
    this.numpages=4;
    this.idnavactual=1; 
    this.navegacion=datos.crear_paginador(this.numpages,this.idnavactual);
    this.farUbicacionLat = this.farmacia.farUbicacionLat; 
    this.farUbicacionLon = this.farmacia.farUbicacionLon;
    this.ordenarDias(); // Ordena los días alfabéticamente
  }

  ngOnInit() {
    this.cambiarPaginacion();
    this.activarSeccionActual();
    this.mostrarTab("pagContinuar");
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica de la farmacia desde AuthService
    const farmaciaData = this.authService.getFarmaciaData(); 
    this.farmacia = { ...farmaciaData };
    this.farRuc = this.farmacia.farRuc;
    this.farCorreoElec = this.farmacia.farCorreoElec;
    console.log('Farmacia:', this.farmacia);
    // Imprimir la información de horariosAtencion
    if (this.farmacia) {
      console.log('Horarios de Atención:', this.farmacia.horariosAtencion);
      // Extraer hmId de horariosAtencion
      this.hmIds = this.farmacia.horariosAtencion.map((horario: HorarioAtencion) => horario.hmId);
      console.log('hmIds:', this.hmIds);
    } else {
    console.error('No se encontraron horarios de atención para la farmacia.');
    }
    if (this.farmacia && this.farmacia.farLogotipoBase64) {
      this.farmacia.farLogotipoURL = 'data:image/jpeg;base64,' + this.farmacia.farLogotipoBase64;
    }
    // Suscribir a los cambios en la ruta y recargar los datos de la farmacia cuando hay cambios
    this.activatedRoute.params.subscribe(params => {
    });
  }
  
  cambiarPaginacion(){
    let myDiv = <HTMLElement>document.getElementById("paginacion");
    myDiv.innerHTML = this.navegacion;
  }

  activarSeccionActual(){
    for (let x=1;x<=this.numpages;x++){
      var identificador="tab"+x;
      if (x==this.idnavactual){
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
    if (this.idnavactual==this.numpages){
      this.mostrarTab("tab4");
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

  ionViewWillEnter() {
    this.cargarDatosFarmacia(); // Recarga los datos de la farmacia cuando la página está a punto de mostrarse
    this.mostrarVistaPreviaLogotipo(); // Muestra la vista previa de la fotografía después de cargar los datos
    this.validarCamposObligatorios(); // Llama al método para validar los campos obligatorios
  }

  // Método para cargar datos de la farmacia
  cargarDatosFarmacia() {
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica de la farmacia desde AuthService
    this.farmacia = this.authService.getFarmaciaData();
    // Verificar si se obtuvieron datos de la farmacia
    if (this.farmacia) {
      this.farRucRegistrado = this.farmacia.farRuc; // Ruc registrado
      this.farCorreoElecRegistrado = this.farmacia.farCorreoElec; // Correo registrado
      // Almacena la ubicación
      this.farUbicacionLat = this.farmacia.farUbicacionLat;
      this.farUbicacionLon = this.farmacia.farUbicacionLon;
      console.log('Farmacia:', this.farmacia);
      if (this.farmacia.farLogotipoBase64) {
        this.farmacia.farLogotipoURL = 'data:image/jpeg;base64,' + this.farmacia.farLogotipoBase64;
      }
      this.obtenerInformacionFarmacia(); // Llamar a obtenerInformacionFarmacia()
    } else {
      console.error('No se pudieron obtener datos de la farmacia.');
    }
  }

  // Obtener información de la farmacia
  async obtenerInformacionFarmacia() {
    try {
      console.log('El método obtenerInformacionFarmacia() se está ejecutando.');
      // Obtener los días
      const diasResponse = await this.http.get<any[]>(`http://${ipServidor}/dias/all`, { responseType: 'json' }).toPromise();
      // Verificar si diasResponse es undefined o null
      if (diasResponse) {
        console.log('Información completa de días:', diasResponse);
        // Iterar sobre cada día
        diasResponse.forEach(dia => {
          // Verificar si horariosAtencion tiene elementos
          if (dia.horariosAtencion.length > 0) {
            // Obtener todos los hmId y diaDescripcion en este día
            const horariosEnEsteDia = dia.horariosAtencion.map((horario: { hmId: number; }) => ({
              hmId: horario.hmId,
              diaDescripcion: dia.diaDescripcion
            }));
            // Comparar cada hmId con hmIds obtenidos en ngOnInit
            horariosEnEsteDia.forEach((horarioEnEsteDia: { hmId: number; diaDescripcion: string; }) => {
              console.log(`Comparando hmId: ${horarioEnEsteDia.hmId} con hmIds: ${this.hmIds}`);
              if (this.hmIds.includes(horarioEnEsteDia.hmId)) {
                // Asignar valores a las variables
                this.hmIdObtenido = horarioEnEsteDia.hmId;
                this.diaDescripcionMostrar = horarioEnEsteDia.diaDescripcion;
                // Buscar los valores correspondientes para hm1Inicio, hm1Fin, hm2Inicio, hm2Fin
                const horarioEncontrado = dia.horariosAtencion.find((h: any) => h.hmId === this.hmIdObtenido);
                if (horarioEncontrado) {
                  this.hm1Inicio = horarioEncontrado.hm1Inicio;
                  this.hm1Fin = horarioEncontrado.hm1Fin;
                  this.hm2Inicio = horarioEncontrado.hm2Inicio;
                  this.hm2Fin = horarioEncontrado.hm2Fin;
                  // Añadir los resultados al array
                  this.diasYHorariosSeleccionados.push({
                    diaDescripcion: this.diaDescripcionMostrar,
                    hm1Inicio: this.hm1Inicio,
                    hm1Fin: this.hm1Fin,
                    hm2Inicio: this.hm2Inicio,
                    hm2Fin: this.hm2Fin
                  });
                  // Agregar un console.log para indicar que la comparación fue exitosa
                  console.log(`Comparación exitosa. hmId: ${this.hmIdObtenido} está en hmIds: ${this.hmIds}`);
                  // Imprimir en consola los valores correspondientes
                  console.log('Valores encontrados:', 'hm1Inicio:', this.hm1Inicio, 'hm1Fin:',this.hm1Fin, 'hm2Inicio:',this.hm2Inicio, 'hm2Fin:',this.hm2Fin);
                }
              }
            });
            // Imprimir en consola los resultados
            console.log('Horarios en el día', dia.diaDescripcion, ':', horariosEnEsteDia);
            } else {
              console.warn('Advertencia: horariosAtencion está vacío para el día.');
            }
          });
        } 
      }
      catch (error) {
      console.error('Error al obtener la información de la farmacia:', error);
    }
  }

  // Método para validar que los campos sean obligatorios y se habiliten el botón continuar
  formInvalido = false; // Variable para controlar si se muestra el mensaje de alerta
  habilitarBotonTab1 = false;
  habilitarBotonTab2 = false;
  habilitarBotonTab3 = false;
  habilitarBotonTab4 = false;
  async validarCamposObligatorios() {
    // Verifica si los campos obligatorios en el tab actual están completos
    if (this.idnavactual === 1) {
      if ( 
        // Campos obligatorios del tab 1
        this.farmacia.farRuc &&
        this.farmacia.farNombreNegocio &&
        this.farmacia.farCorreoElec
      ) {
        this.habilitarBotonTab1 = true;
        this.formInvalido = false;
      } else {
        this.habilitarBotonTab1 = false;
        this.formInvalido = true;
      }
    } else  
    if (this.idnavactual === 2) { 
      if ( 
        // Campos obligatorios del tab 2
        this.farmacia.farUbicacionLat !== null && this.farmacia.farUbicacionLon !== null) {
        this.habilitarBotonTab2 = true;
      } else {
        this.habilitarBotonTab2 = false;
      }
      } else
    if (this.idnavactual === 3) {
      if ( 
        // Campos obligatorios del tab 3
        this.farmacia.farDireccionCalles &&
        this.farmacia.farDireccionCom &&
        this.farmacia.farTelefonoMov
      ) {
        this.habilitarBotonTab3 = true;  
        this.formInvalido = false;
      } else {
        this.habilitarBotonTab3 = false;
        this.formInvalido = true;
      }
    } else 
    if (this.idnavactual === 4) { 
        // Verifica si al menos un elemento ha sido agregado a la lista de días y horarios
        if (this.diasYHorariosSeleccionados.length > 0) {
          this.habilitarBotonTab4 = true;
          this.formInvalido = false; // Establecer a false cuando los campos se completan correctamente
        } else {
          this.habilitarBotonTab4 = false;  
          this.formInvalido = true; // Muestra un mensaje de alerta
        }
        // Condición para mostrar el mensaje de alerta si no hay días y horarios seleccionados
        if (this.idnavactual === 4 && this.diasYHorariosSeleccionados.length === 0) {
        this.formInvalido = true;
       }
    }
  }

  // Método para validar el nombre del negocio
  farNombreNegocioInvalido = false; // Inicialmente se considera no válido
  validarNombreNegocio() {
    if (this.farmacia.farNombreNegocio.length < 3) {
      this.farNombreNegocioInvalido = true;
    } else {
      this.farNombreNegocioInvalido = false;
    }
  }

  // Método para validar el RUC natural y jurídico
  rucInvalido: boolean = false;
  respuestaBackendExistenciaRuc: string = '';
  respuestaBackendRuc: string = '';
  validarRucYExistencia() {
    this.rucInvalido = false;
    // Obtener farRuc registrado en el sistema y farRuc ingresado
    const farRucIngresado = this.farmacia.farRuc;
    console.log('farRucRegistrado:', this.farRucRegistrado);
    console.log('farRucIngresado:', farRucIngresado);
    // Verificar si el ruc ingresado es diferente al ruc registrado en el sistema
    if (farRucIngresado !== this.farRucRegistrado) {
      this.http.get<string>(`http://${ipServidor}/farmacias/validaExistenciaFarRuc/${farRucIngresado}`, { responseType: 'text' as 'json' })
      .subscribe(response => {
        this.respuestaBackendExistenciaRuc = response;
        // Verifica si la respuesta contiene "La farmacia ya existe" y muestra un mensaje en consecuencia
        if (this.respuestaBackendExistenciaRuc === 'La farmacia ya existe') {
          this.mostrarMensajeRucYExistencia('La farmacia ya está registrada en la base de datos');
          this.rucInvalido = true; // Establece rucInvalido en verdadero si la validación falla
        }
      });
      // Valida el RUC de persona natural y jurídico
      this.http.get<string>(`http://${ipServidor}/farmacias/validaRuc/${farRucIngresado}`, { responseType: 'text' as 'json' })
      .subscribe(response => {
        this.respuestaBackendRuc = response;
        if (this.respuestaBackendRuc === 'El RUC no es válido') {
          this.mostrarMensajeRucYExistencia('El RUC no es válido');
          this.rucInvalido = true; // Establece rucInvalido en verdadero si la validación falla
        }
      });
    }
  }

  async mostrarMensajeRucYExistencia(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Método para validar el correo electrónico
  correoInvalido: boolean = false;
  respuestaBackendExistenciaCorreoElec: string = '';
  respuestaBackendValidaCorreoElec: string = '';
  validarCorreoElec() {
    this.correoInvalido = false; // Restablece el valor de correoInvalido a falso antes de realizar las validaciones
    // Obtener farCorreoElec registrado en el sistema y farCorreoElec ingresado
    const farCorreoElecIngresado = this.farmacia.farCorreoElec;
    console.log('farCorreoElecRegistrado:', this.farCorreoElecRegistrado);
    console.log('farCorreoElecIngresado:', farCorreoElecIngresado);
    // Verificar si el farCorreoElec ingresado es diferente al farCorreoElec registrado
    if (farCorreoElecIngresado !== this.farCorreoElecRegistrado) {
      // Si son diferentes, realizar la validación de existencia y validación del correo electrónico
      this.http.get<string>(`http://${ipServidor}/farmacias/validaExistenciaFarCorreoElec/${farCorreoElecIngresado}`, { responseType: 'text' as 'json' })
      .subscribe(response => {
        this.respuestaBackendExistenciaCorreoElec = response;
        if (this.respuestaBackendExistenciaCorreoElec === 'El correo ya existe') {
          this.mostrarMensajeValidaCorreoElecYExistencia('El correo ya está registrado en la base de datos');
          this.correoInvalido = true;
        }
      });
      this.http.get<string>(`http://${ipServidor}/farmacias/validaCorreoElec/${farCorreoElecIngresado}`, { responseType: 'text' as 'json' })
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

  // Método para cargar la imagen (logotipo)
  selectedFile: File | null = null;
  cargarLogotipo(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type.startsWith('image/')) {
        this.selectedFile = selectedFile;
        this.mostrarVistaPreviaLogotipo(); // Muestra la vista previa de la imagen
      } else {
        console.error('El archivo seleccionado no es una imagen.');
      }
    } else {
      // Si no se selecciona ningún archivo, no hace nada (no cambia selectedFile)
      // Muestra la vista previa de la fotografía actual en la base de datos
      this.mostrarVistaPreviaLogotipo();
    }
  }

  // Método para transformar la imagen a byte
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

  // Variable para almacenar la URL segura del logotipo
  farmaciaLogotipoURL: SafeUrl | null = null;
  // Método para mostrar la vista previa del logotipo
  mostrarVistaPreviaLogotipo() {
    const imageUrl = this.getSelectedFileUrl();
    if (imageUrl) {
      this.farmaciaLogotipoURL = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
      // Forzar la verificación de cambios después de actualizar la URL
      this.cdRef.detectChanges();
      console.log('Vista previa de la fotografía mostrada:', this.farmaciaLogotipoURL);
    } else {
      console.log('No hay datos de imagen disponibles para mostrar la vista previa.');
      this.farmaciaLogotipoURL = null;
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

  // Método para abrir el modal de horarios de servicio
  isModalOpenHorario = false;
  setOpenHorario(isOpenHorario: boolean){
    this.isModalOpenHorario = isOpenHorario;
  }

  // Método para la ubicación a través de google maps
  private apiUrl = `http://${ipServidor}/buscar_lugares_maps`; // URL del servidor Spring Boot
  private locationPermissionsRequested = false; // Variable para rastrear si los permisos se han solicitado
  buscarLugar: string = ''; // Variables empleadas en google maps
  nombre: string = '';
  direccion: string = '';

  // Llama al método para obtener la ubicación en ionViewDidEnter
  async ionViewDidEnter() {
    if (this.idnavactual === 2 && !this.locationPermissionsRequested) {
      await this.checkLocationPermission();
      this.locationPermissionsRequested = true; // Marca los permisos como solicitados
    }
    if ('geolocation' in navigator) {
      try {
        const position = await this.geolocation.getCurrentPosition();
        this.farmacia.farUbicacionLat = position.coords.latitude;
        this.farmacia.farUbicacionLon = position.coords.longitude;
        // Verifica si se ha ingresado algún lugar en el campo de búsqueda
        if (this.buscarLugar.trim() !== '') {
          this.buscarLugares(); // Llama al método para buscar lugares con las nuevas coordenadas
        } else {
          // Si no se ha ingresado un lugar, al menos actualiza la vista de la ubicación actual
          this.actualizarDatosDelLugar(this.farmacia.farUbicacionLat, this.farmacia.farUbicacionLon);
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
      this.farmacia.farUbicacionLat = -2.900128; // Latitud de Cuenca, Ecuador
      this.farmacia.farUbicacionLon = -79.005896; // Longitud de Cuenca, Ecuador
      // Llama al método para actualizar los datos del lugar con las coordenadas iniciales
      this.actualizarDatosDelLugar(this.farmacia.farUbicacionLat, this.farmacia.farUbicacionLon);
      // Llama a mostrarMensajeDeBusqueda después de actualizar los datos del lugar
      this.mostrarMensajeDeBusqueda();
    }
  }

  async checkLocationPermission() {
    try {
      const position = await this.geolocation.getCurrentPosition();
      this.farmacia.farUbicacionLat = position.coords.latitude;
      this.farmacia.farUbicacionLon = position.coords.longitude;
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
    if (this.idnavactual === 3) {
      const alert = await this.alertController.create({
        header: 'Búsqueda Manual',
        message: 'Debido a que no ha habilitado la ubicación de su dispositivo, por favor, busque su dirección por el nombre',
        buttons: ['OK']
      });

      await alert.present();
    }
  }

  // Método cuando pulso sobre el botón "Ubicación actual"
  ubicarAutomaticamente() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.farUbicacionLat = position.coords.latitude;
        this.farUbicacionLon = position.coords.longitude;
        console.log('Ubicación actual:', this.farUbicacionLat, this.farUbicacionLon);
        // Verifica si se ha ingresado algún lugar en el campo de búsqueda
        if (this.buscarLugar.trim() !== '') {
          // Llama actualizarDatosDelLugar() para buscar lugares con las nuevas coordenadas
          this.actualizarDatosDelLugar(this.farUbicacionLat, this.farUbicacionLon);
        }
      }, (error) => {
        this.showGeolocationAlert();
      });
    } else {
      console.error('La geolocalización no está disponible en este dispositivo');
    }
  }

  onMarkerPositionChanged(event: any) {
    console.log('Marcador movido');
    const newPosition = event.target.getPosition();
    this.farmacia.farUbicacionLat = newPosition.lat();
    this.farmacia.farUbicacionLon = newPosition.lng();
    console.log('Nueva posición del marcador:', newPosition.lat(), newPosition.lng());
    // Llama al método para actualizar los datos del lugar con las nuevas coordenadas
    this.actualizarDatosDelLugar(this.farUbicacionLat, this.farUbicacionLon);
  }

  // Método para buscar lugares en google maps
  buscarLugares() {
    this.http.get(`${this.apiUrl}?query=${this.buscarLugar}`).subscribe(
      (data: any) => {
        if (data && data.results && data.results.length > 0) {
          const lugar = data.results[0];
          this.nombre = lugar.name;
          this.direccion = lugar.formatted_address;
          this.farUbicacionLat = lugar.geometry.location.lat;
          this.farUbicacionLon = lugar.geometry.location.lng;
          // Actualiza las propiedades de latitud y longitud
          this.farmacia.farUbicacionLat = lugar.geometry.location.lat;
          this.farmacia.farUbicacionLon = lugar.geometry.location.lng;
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

  // Método actualizarDatosDelLugar
  actualizarDatosDelLugar(farUbicacionLat: number, farUbicacionLon: number) {
    // API de Geocodificación inversa de Google Maps para obtener los datos del lugar
    const apiKey = 'AIzaSyC11776nnpYQTWenID5bQgLBGVNu1RZb9M'; // API de Google Maps
    // URL para la solicitud de geocodificación inversa
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${farUbicacionLat},${farUbicacionLon}&key=${apiKey}`;
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
          this.actualizarDatosDelLugar(this.farUbicacionLat, this.farUbicacionLon);
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

  // Método para validar la dirección de las calles
  farDireccionCallesInvalido = false; // Inicialmente se considera no válido
  validarDireccionCalles() {
    if (this.farmacia.farDireccionCalles.length < 5) {
      this.farDireccionCallesInvalido = true;
    } else {
      this.farDireccionCallesInvalido = false;
    }
  }

  // Método para validar la dirección de edificios, piso, oficinas
  farDireccionComInvalido = false; // Inicialmente se considera no válido
  validarDireccionCom() {
    if (this.farmacia.farDireccionCom.length < 3) {
      this.farDireccionComInvalido = true;
    } else {
      this.farDireccionComInvalido = false;
    }
  }

  // Método para validar el número de teléfono móvil
  farTelefonoConInvalido = false; // Inicialmente se considera no válido
  validarTelefonoCon() {
    if (this.farmacia.farTelefonoCon) {
      const telefonoPattern = /^\d{9}$/; // Expresión regular para 9 dígitos exactamente
      if (!telefonoPattern.test(this.farmacia.farTelefonoCon)) {
        this.farTelefonoConInvalido = true;
      } else {
        this.farTelefonoConInvalido = false;
      }
    } else {
      this.farTelefonoConInvalido = false; // Considerar válido si el campo está vacío
    }
  }

  // Método para validar el número de teléfono móvil
  farTelefonoMovInvalido = false; // Inicialmente se considera no válido
  validarTelefonoMov() {
    if (this.farmacia.farTelefonoMov) {
      const telefonoPattern = /^\d{10}$/; // Expresión regular para 10 dígitos
      if (!telefonoPattern.test(this.farmacia.farTelefonoMov)) {
        this.farTelefonoMovInvalido = true;
      } else {
        this.farTelefonoMovInvalido = false;
      }
    } else {
      this.farTelefonoMovInvalido = false; // Considera válido si el campo está vacío
    }
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
    // Verifica que se hayan seleccionado al menos un día
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
    this.ordenarDias(); // Ordena los días alfabéticamente
    this.isModalOpenHorario = false; // Cerrar el modal
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

  // Método para verificar el formato de la hora
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
            this.actualizarFarmacia(); // Método actualizarFarmacia() para guardar en la base de datos
          },
        },
      ],
    });
    await alert.present();
  }
  
  //Método para actualizar la información de la farmacia
  async actualizarFarmacia() {
    // Validar la existencia de la farmacia registrada en el sistema
    const farRuc = this.farmacia.farRuc; 
    // Eliminar los horarios de atención existentes de la farmacia para luego volver a guardar
    for (const hmId of this.hmIds) {
      try {
        const deleteHorarioResponse = await this.http.delete(`http://${ipServidor}/horariosAtencion/${hmId}/delete`).toPromise();
        console.log(`Horario de atención eliminado con éxito: ${hmId}`, deleteHorarioResponse);
      } catch (deleteError) {
        console.error(`Error al eliminar horario de atención ${hmId}:`, deleteError);
      }
    }
    // Inicializa la propiedad farLogotipo con la imagen en bytes
    try {
      console.log('Datos de la farmacia antes de enviar la solicitud:', this.farmacia);
      if (this.selectedFile) {
        const bytes = await this.convertirImagenABytes(this.selectedFile);
        this.farmacia.farLogotipo = this.convertirBytesAImagenBase64(bytes);
      } 
      // Antes de realizar el envío de la farmacia, se inicializa los campos de ion-toggle en false si son null o undefined
      this.farmacia.farTagW = this.farmacia.farTagW || false;
      this.farmacia.farTagD = this.farmacia.farTagD || false;
      this.farmacia.farTag247 = this.farmacia.farTag247 || false;
      const farmaciaResponse = await this.http.put<any>(`http://${ipServidor}/farmacias/${farRuc}/update`, this.farmacia).toPromise();
      // URL para actualizar los datos de la farmacia en el backend
      console.log('URL de la solicitud:', `http://${ipServidor}/farmacias/${farRuc}/update`);
      console.log('Respuesta de la API (Farmacia):', farmaciaResponse);
      if (farmaciaResponse === true) {
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
              farRuc: this.farmacia.farRuc,
              hm1Inicio: diaHorario.hm1Inicio,
              hm1Fin: diaHorario.hm1Fin,
              hm2Inicio: diaHorario.hm2Inicio,
              hm2Fin: diaHorario.hm2Fin
            };
            // URL para guardar los datos de los horarios de atención
            const horarioResponse = await this.http.post(`http://${ipServidor}/horariosAtencion/save`, horarioDeAtencion).toPromise();
            console.log('Horarios de atención registrados con éxito', horarioResponse);
          } else {
            console.error('Error al registrar el día. Verifica la respuesta del backend:', diaId);
          }
        }
        let allDataSaved = true; // Variable para verificar si se han guardado todos los datos correctamente
        if (allDataSaved) { // Solo navega si todos los datos se han guardado correctamente
        this.mostrarAlerta('Éxito', 'Farmacia actualizada con éxito');
        } else {
          console.error('Error al registrar algún dato. La información no se guardará.');
        }
      }  else {
          console.error('Error al actualizar la información de la farmacia:', farmaciaResponse.error);
        }
    } catch (error) {
      console.error('Error en el bloque try:', error);
      // Maneja errores específicos
      if (error instanceof HttpErrorResponse) {
        if (error.status === 422) {
          const errorMessage = error.error.message;
          console.error('Error', 'No se pudo actualizar la información de la farmacia:', errorMessage);
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
            // Redirige a una página de ventana-farmacia
            this.navCtrl.navigateForward('/ventana-farmacia');
          },
        },
      ],
    });
    await alert.present();
  }

  goVentanaFarmacia(){
    localStorage.setItem('backvalue','ventanaFarmacia');
    this.router.navigateByUrl('/ventana-farmacia');
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

  goSalir(){
    // Limpiar datos de autenticación y redirigir a la página de inicio
    this.authService.setFarmaciaData(null);
    this.authService.setIdentifierKey('');
    this.authService.setUsername('');
    localStorage.setItem('backvalue','home');
    this.router.navigateByUrl('/home');
  }
}