import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IndicaPaginaService } from '../indica-pagina.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AlertController, NavController, MenuController  } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AuthService } from '../servicios/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // DomSanitizer para garantizar la seguridad al manipular URLs

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

const ipServidor = '192.168.0.115:8080'; // Dirección IP del servidor

interface EspMedico {
  emmId: number; // Id de EspMedMedicos
}

interface HorarioAtencion {
  hmId: number; // Id de HorarioAtencion
}

@Component({
  selector: 'app-gestionar-perfil-medico',
  templateUrl: './gestionar-perfil-medico.page.html',
  styleUrls: ['./gestionar-perfil-medico.page.scss'],
})

export class GestionarPerfilMedicoPage implements OnInit {
  medico: any = {}; // Modelo de datos del médico
  identifierKey: string = '';
  username: string = '';
  listaMedicos: any[] = [];
  filtrosAplicados: string = '';
  especialidad: string = '';
  atencionDomicilio: boolean = false;
  servicioEnfermeria: boolean = false;
  farmaciaMedicacion: boolean = false;
  atencion247: boolean = false;
  selectedEspecialidad: string[] = [];
  filtrosSeleccionados: string[] = [];
  medUbicacionLat: number;
  medUbicacionLon: number;
  medCi: string = '';
  medCiRegistrado: string = '';
  medCorreoElecRegistrado: string = '';
  medCorreoElec: string = '';
  emmIdObtenido: number | null = null;
  emDescripcionMostrar: string = '';
  emDescripcion: { emId: number, emDescripcion: string }[] = [];
  emmIds: number[] = [];
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
    this.numpages=5;
    this.idnavactual=1; 
    this.navegacion=datos.crear_paginador(this.numpages,this.idnavactual);
    this.medUbicacionLat = this.medico.medUbicacionLat;
    this.medUbicacionLon = this.medico.medUbicacionLon; 
    this.ordenarDias(); // Ordena los días alfabéticamente
  }

  ngOnInit() {
    this.cambiarPaginacion();
    this.activarSeccionActual();
    this.obtenerEspecialidadesDesdeBackend();
    this.mostrarTab("pagContinuar");
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica del médico desde AuthService
    const medicoData = this.authService.getMedicoData();
    this.medico = { ...medicoData };
    this.medCi = this.medico.medCi;
    this.medCorreoElec = this.medico.medCorreoElec;
    console.log('Médico:', this.medico);
    /// Imprimir información de EspMedMedicos
    if (this.medico) {
      console.log('EspMedMedicos:', this.medico.espMedMedicos);
      // Extraer emmId de EspMedMedicos
      this.emmIds = this.medico.espMedMedicos.map((espMedico: EspMedico) => espMedico.emmId);
      console.log('emmIds:', this.emmIds);
    } else {
      console.error('No se encontró información de EspMedMedicos para el médico.');
    }
    // Imprimir información de horariosAtencion
    if (this.medico) {
      console.log('Horarios de Atención:', this.medico.horariosAtencion);
      // Extraer hmId de horariosAtencion
      this.hmIds = this.medico.horariosAtencion.map((horario: HorarioAtencion) => horario.hmId);
      console.log('hmIds:', this.hmIds);
    } else {
      console.error('No se encontraron horarios de atención para el médico.');
    }
    if (this.medico && this.medico.medFotografiaBase64) {
      this.medico.medFotografiaURL = 'data:image/jpeg;base64,' + this.medico.medFotografiaBase64;
    }
    // Suscribir a los cambios en la ruta y recargar los datos cuando hay cambios
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
    if(this.idnavactual==this.numpages){
      this.mostrarTab("tab5");
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
    this.cargarDatosMedico(); // Recarga los datos del médico cuando la página está a punto de mostrarse
    this.mostrarVistaPreviaFotografia(); // Muestra la vista previa de la fotografía después de cargar los datos
    this.validarCamposObligatorios(); // Llama al método para validar los campos obligatorios
  }

  // Método para cargar datos del médico
  cargarDatosMedico() {
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica del médico desde AuthService
    this.medico = this.authService.getMedicoData();
    // Verificar si se obtuvieron datos del médico
    if (this.medico) {
    this.medCiRegistrado = this.medico.medCi; // Cédula registrada
    this.medCorreoElecRegistrado = this.medico.medCorreoElec; // Correo registrado
    // Almacena la ubicación
    this.medUbicacionLat = this.medico.medUbicacionLat;
    this.medUbicacionLon = this.medico.medUbicacionLon;
    console.log('Médico:', this.medico);
    if (this.medico.medFotografiaBase64) {
      this.medico.medFotografiaURL = 'data:image/jpeg;base64,' + this.medico.medFotografiaBase64;
    }
    this.obtenerInformacionMedico(); // Llamar a obtenerInformacionMedico()
    } else {
      console.error('No se pudieron obtener datos del médico.');
    }
  }

  async obtenerInformacionMedico() {
    try {
      console.log('El método obtenerInformacionMedico() se está ejecutando.');
      // Obtener información completa de médicos con sus especialidades
      const especialidadesResponse = await this.http.get<any[]>(`http://${ipServidor}/especialidadesMedicas/all`, { responseType: 'json' }).toPromise();
      // Verificar si especialidadesResponse es undefined o null
      if (especialidadesResponse) {
        console.log('Información completa de especialidades médicas:', especialidadesResponse);
        // Iterar sobre cada médico
        especialidadesResponse.forEach(medico => {
          // Verificar si espMedMedicos tiene elementos
          if (medico.espMedMedicos.length > 0) {
            medico.espMedMedicos.forEach((espMedico: { emmId: number; }) => {
              const emmId = espMedico.emmId;
              const emDescripcion = medico.emDescripcion;
              console.log(`emmId: ${emmId}, emDescripcion: ${emDescripcion}`);
              // Verificar si el emmId está en emmIds obtenidos en ngOnInit
              if (this.emmIds.includes(emmId)) {
                // Asignar valores a las variables del componente
                this.emmIdObtenido = emmId;
                this.emDescripcionMostrar = emDescripcion;
                // Añadir emDescripcionMostrar a las especialidades preseleccionadas
                if (!this.selectedEspecialidad.includes(emDescripcion)) {
                  this.selectedEspecialidad.push(emDescripcion);
                }
                // Agregar un console.log para indicar que la comparación fue exitosa
                console.log(`Comparación exitosa. emmId: ${emmId} está en emmIds: ${this.emmIds}`);
              }
            });
          } else {
            console.warn('Advertencia: espMedMedicos está vacío para el médico.');
          }
        });
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
                    // Añadir diaDescripcionMostrar a las especialidades preseleccionadas
                    if (!this.selectedEspecialidad.includes(this.diaDescripcionMostrar)) {
                      this.selectedEspecialidad.push(this.diaDescripcionMostrar);
                    }
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
        } else {
          console.error('Error: especialidadesResponse es undefined o null.');
        }
      }
    } catch (error) {
      console.error('Error al obtener la información del médico:', error);
    }
  }

  // Método para validar que los campos sean obligatorios y se habiliten el botón continuar
  formInvalido = false; // Variable para controlar si se muestra el mensaje de alerta
  habilitarBotonTab1 = false;
  habilitarBotonTab2 = false;
  habilitarBotonTab3 = false;
  habilitarBotonTab4 = false;
  habilitarBotonTab5 = false;
  async validarCamposObligatorios() {
    // Verifica si los campos obligatorios en el tab actual están completos
    if (this.idnavactual === 1) {
      if ( 
        // Campos obligatorios del tab 1
        this.medico.medDenominacion &&
        this.medico.medNombres &&
        this.medico.medApellidos &&
        this.medico.medCi &&
        this.medico.medCorreoElec
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
        this.selectedEspecialidad && this.selectedEspecialidad.length > 0 &&
        this.medico.medDescripcionPro 
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
        this.medico.medUbicacionLat !== null && this.medico.medUbicacionLon !== null) {
        this.habilitarBotonTab3 = true;
      } else {
        this.habilitarBotonTab3 = false;
      }
    } else
    if (this.idnavactual === 4) {
      if ( 
        // Campos obligatorios del tab 4
        this.medico.medDireccionCalles &&
        this.medico.medDireccionCom &&
        this.medico.medTelefonoMov
      ) {
        this.habilitarBotonTab4 = true;  
        this.formInvalido = false;
      } else {
        this.habilitarBotonTab4 = false;
        this.formInvalido = true;
      }
    } else 
    if (this.idnavactual === 5) { 
      // Verifica si al menos un elemento ha sido agregado a la lista de días y horarios
      if (this.diasYHorariosSeleccionados.length > 0) {
        this.habilitarBotonTab5 = true;
        this.formInvalido = false; // Establecer a false cuando los campos se completan correctamente
      } else {
        this.habilitarBotonTab5 = false;  
        this.formInvalido = true; // Muestra un mensaje de alerta
      }
      // Condición para mostrar el mensaje de alerta si no hay días y horarios seleccionados
      if (this.idnavactual === 5 && this.diasYHorariosSeleccionados.length === 0) {
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

  // Método para validar la cédula ecuatoriana
  cedulaInvalido: boolean = false;
  respuestaBackendExistenciaCedula: string = '';
  respuestaBackendCedulaEcuatoriana: string = '';
  validarCedulaEcuatorianaYExistencia() {
    this.cedulaInvalido = false;
    // Obtener medCi registrado en el sistema y medCi ingresado
    const medCiIngresado = this.medico.medCi;
    console.log('medCiRegistrado:', this.medCiRegistrado);
    console.log('medCiIngresado:', medCiIngresado);
    // Verificar si la cédula ingresada es diferente a la cédula registrada
    if (medCiIngresado !== this.medCiRegistrado) {
      // Si son diferentes, realizar la validación de existencia y cédula ecuatoriana
      this.http.get<string>(`http://${ipServidor}/medicos/validaExistenciaMedCi/${medCiIngresado}`, { responseType: 'text' as 'json' })
      .subscribe(response => {
        this.respuestaBackendExistenciaCedula = response;
        if (this.respuestaBackendExistenciaCedula === 'El médico ya existe') {
          this.mostrarMensajeCedulaEcuatorianaYExistencia('El médico ya está registrado en la base de datos');
          this.cedulaInvalido = true;
        }
      });
      this.http.get<string>(`http://${ipServidor}/medicos/validaCedulaEcuatoriana/${medCiIngresado}`, { responseType: 'text' as 'json' })
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

  // Método para validar el correo electrónico
  correoInvalido: boolean = false;
  respuestaBackendExistenciaCorreoElec: string = '';
  respuestaBackendValidaCorreoElec: string = '';
  validarCorreoElec() {
    this.correoInvalido = false; // Restablece el valor de correoInvalido a falso antes de realizar las validaciones
    // Obtener medCorreoElec registrado en el sistema y medCorreoElec ingresado
    const medCorreoElecIngresado = this.medico.medCorreoElec;
    console.log('medCorreoElecRegistrado:', this.medCorreoElecRegistrado);
    console.log('medCorreoElecIngresado:', medCorreoElecIngresado);
    // Verificar si el medCorreoElec ingresado es diferente al medCorreoElec registrado
    if (medCorreoElecIngresado !== this.medCorreoElecRegistrado) {
      // Si son diferentes, realizar la validación de existencia y validación del correo electrónico
      this.http.get<string>(`http://${ipServidor}/medicos/validaExistenciaMedCorreoElec/${medCorreoElecIngresado}`, { responseType: 'text' as 'json' })
      .subscribe(response => {
        this.respuestaBackendExistenciaCorreoElec = response;
        if (this.respuestaBackendExistenciaCorreoElec === 'El correo ya existe') {
          this.mostrarMensajeValidaCorreoElecYExistencia('El correo ya está registrado en la base de datos');
          this.correoInvalido = true;
        }
      });
      this.http.get<string>(`http://${ipServidor}/medicos/validaCorreoElec/${medCorreoElecIngresado}`, { responseType: 'text' as 'json' })
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

  // Método para cargar la imagen
  selectedFile: File | null = null;
  cargarFotografia(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type.startsWith('image/')) {
        this.selectedFile = selectedFile;
        this.mostrarVistaPreviaFotografia(); // Muestra la vista previa de la nueva fotografía
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

  // Variable para almacenar la URL segura de la fotografía
  medicoFotografiaURL: SafeUrl | null = null;
  // Método para mostrar la vista previa de la fotografía
  mostrarVistaPreviaFotografia() {
    const imageUrl = this.getSelectedFileUrl();
    if (imageUrl) {
      this.medicoFotografiaURL = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
      // Forzar la verificación de cambios después de actualizar la URL
      this.cdRef.detectChanges();
      console.log('Vista previa de la fotografía mostrada:', this.medicoFotografiaURL);
    } else {
      console.log('No hay datos de imagen disponibles para mostrar la vista previa.');
      this.medicoFotografiaURL = null;
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
  buscarLugar: string = ''; // Variables empleados en google maps
  nombre: string = '';
  direccion: string = '';

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
          this.buscarLugares(); // Llama al método para buscar lugares con las nuevas coordenadas
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

  onMarkerPositionChanged(event: any) {
    console.log('Marcador movido');
    const newPosition = event.target.getPosition();
    this.medico.medUbicacionLat = newPosition.lat();
    this.medico.medUbicacionLon = newPosition.lng();
    console.log('Nueva posición del marcador:', newPosition.lat(), newPosition.lng());
    // Llama al método para actualizar los datos del lugar con las nuevas coordenadas
    this.actualizarDatosDelLugar(this.medUbicacionLat, this.medUbicacionLon);
  }

  // Método para buscar lugares en google maps
  buscarLugares() {
    this.http.get(`${this.apiUrl}?query=${this.buscarLugar}`).subscribe(
      (data: any) => {
        if (data && data.results && data.results.length > 0) {
          const lugar = data.results[0];
          this.nombre = lugar.name;
          this.direccion = lugar.formatted_address;
          this.medUbicacionLat = lugar.geometry.location.lat;
          this.medUbicacionLon = lugar.geometry.location.lng;
          // Actualiza las propiedades de latitud y longitud
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

  // Método actualizarDatosDelLugar
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

  // Método para validar la Descripción Profesional
  medDescripcionProInvalido = false; // Inicialmente se considera no válido
  validarDescripcionPro() {
    if (this.medico.medDescripcionPro.length < 30) {
      this.medDescripcionProInvalido = true;
    } else {
      this.medDescripcionProInvalido = false;
    }
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
            this.actualizarMedico(); // Método actualizarMedico() para guardar en la base de datos
          },
        },
      ],
    });
    await alert.present();
  }

  //Método para actualizar la información del médico
  async actualizarMedico() {
    // Valida la existencia del médico registrado en el sistema
    const medCi = this.medico.medCi;
    // Eliminar las especialidades existentes del médio para luego volver a guardar
    for (const emmId of this.emmIds) {
      try {
        const deleteEspMedMedicoResponse = await this.http.delete(`http://${ipServidor}/espMedMedicos/${emmId}/delete`).toPromise();
        console.log(`Esp med médicos eliminado con éxito: ${emmId}`, deleteEspMedMedicoResponse);
      } catch (deleteError) {
        console.error(`Error al eliminar esp med médicos ${emmId}:`, deleteError);
      }
    }  
    // Eliminar los horarios de atención existentes del médico para luego volver a guardar
    for (const hmId of this.hmIds) {
      try {
        const deleteHorarioResponse = await this.http.delete(`http://${ipServidor}/horariosAtencion/${hmId}/delete`).toPromise();
        console.log(`Horario de atención eliminado con éxito: ${hmId}`, deleteHorarioResponse);
      } catch (deleteError) {
        console.error(`Error al eliminar horario de atención ${hmId}:`, deleteError);
      }
    }
    // Inicializa la propiedad medFotografia con la imagen en bytes
    try {
      console.log('Datos del médico antes de enviar la solicitud:', this.medico);
      if (this.selectedFile) {
        const bytes = await this.convertirImagenABytes(this.selectedFile);
        this.medico.medFotografia = this.convertirBytesAImagenBase64(bytes);
      } 
      // Antes de realizar el envío del médico, se inicializa los campos de ion-toggle en false si son null o undefined
      this.medico.medTagW = this.medico.medTagW || false;
      this.medico.medTagD = this.medico.medTagD || false;
      this.medico.medTagE = this.medico.medTagE || false;
      this.medico.medTagM = this.medico.medTagM || false;
      this.medico.medTag247 = this.medico.medTag247 || false;
      console.log('URL de la solicitud:', `http://${ipServidor}/medicos/${medCi}/update`);
      // URL para actualizar los datos del médico en el backend
      const medicoResponse = await this.http.put<any>(`http://${ipServidor}/medicos/${medCi}/update`, this.medico).toPromise();
      console.log('Respuesta de la API (Médico):', medicoResponse);
      if (medicoResponse === true) {
        console.log('Éxito', 'Médico actualizado con éxito');
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
        let allDataSaved = true; // Variable para verificar si se han guardado todos los datos correctamente
        if (this.selectedEspecialidad) {
          for (const emDescripcion of this.selectedEspecialidad) {
            // Obtiene el emId correspondiente a la especialidad médica desde el backend
            const emIdResponse = await this.http.get<any>(`http://${ipServidor}/especialidadesMedicas/byEmDescripcion/${emDescripcion}`).toPromise();
            const emId = emIdResponse.emId;
            // URL para guardar los datos de espMedMedicos en el backend
            const espMedMedicoRequest = { medCi: this.medico.medCi, emId: emId };
            const espMedMedicoResponse = await this.http.post<any>('http://${ipServidor}/espMedMedicos/save', espMedMedicoRequest).toPromise();
            console.log('Respuesta de la API (espMedMedicos):', espMedMedicoResponse);
            if (espMedMedicoResponse === true) {
              console.log('Relación médico-especialidad registrada con éxito.');
            } else {
              console.error('Error al registrar la relación médico-especialidad. Verifica la respuesta del backend:', espMedMedicoResponse.error);
              allDataSaved = false; // Establece la bandera en falso si hay un error
            }
          }
        } else {
          console.error('this.selectedEspecialidad es nulo o indefinido.');
          allDataSaved = false; // Establece la bandera en falso si hay un error
        }
        if (allDataSaved) { // Solo navega si todos los datos se han guardado correctamente
          this.mostrarAlerta('Éxito', 'Médico actualizado con éxito');
        } else {
          console.error('Error al registrar algún dato. La información no se guardará.');
        }
      }  else {
          console.error('Error al actualizar la información del médico:', medicoResponse.error);
      }
    } catch (error) {
      console.error('Error en el bloque try:', error);
      // Maneja errores específicos
      if (error instanceof HttpErrorResponse) {
        if (error.status === 422) {
          const errorMessage = error.error.message;
          console.error('Error', 'No se pudo actualizar la información del mmédico:', errorMessage);
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
            // Redirige a una página de ventana-medico
            this.navCtrl.navigateForward('/ventana-medico');
          },
        },
      ],
    });
    await alert.present();
  }

  goVentanaMedico(){
    localStorage.setItem('backvalue','ventanaMedico');
    this.router.navigateByUrl('/ventana-medico');
  }  

  goResetearClave(){
    localStorage.setItem('backvalue','resetearClaveMedico');
    this.router.navigateByUrl('/resetear-clave-medico');
  }
  
  goGestionarPerfil(){
    localStorage.setItem('backvalue','gestionarPerfilMedico');
    this.router.navigateByUrl('/gestionar-perfil-medico');
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
    this.authService.setMedicoData(null);
    this.authService.setIdentifierKey('');
    this.authService.setUsername('');
    localStorage.setItem('backvalue','home');
    this.router.navigateByUrl('/home');
  }
}