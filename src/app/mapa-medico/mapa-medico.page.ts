import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, MenuController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser'; // DomSanitizer se utiliza para evitar problemas de seguridad al manipular URLs de datos
import { AuthService } from '../servicios/auth.service'; // Ruta de auth.service
import { Geolocation } from '@ionic-native/geolocation/ngx';

const ipServidor = '192.168.0.115:8080'; // Dirección IP del servidor

@Component({
  selector: 'app-mapa-medico',
  templateUrl: './mapa-medico.page.html',
  styleUrls: ['./mapa-medico.page.scss'],
})

export class MapaMedicoPage implements OnInit {
  filtrosAplicados: string = '';
  especialidad: string = '';
  atencionDomicilio: boolean = false;
  servicioEnfermeria: boolean = false;
  farmaciaMedicacion: boolean = false;
  atencion247: boolean = false;
  selectedEspecialidad: string | null = null;
  medUbicacionLat: number = -2.900128; // Define la propiedad latitud
  medUbicacionLon: number = -79.005896; // Define la propiedad longitud
  listaMedicos: any[] = [];
  filtrosSeleccionados: string[] = [];
  paciente: any = {};  // Initialize paciente as an empty object
  identifierKey: string = '';
  username: string = '';
  map: any;
  nombre: string = ' Cuenca'; // Define la propiedad nombre
  direccion: string = ' Cuenca, Ecuador'; // Define la propiedad dirección

  constructor(private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private navCtrl: NavController,
    private http: HttpClient,
    private menuCtrl: MenuController,
    private sanitizer: DomSanitizer,
    private alertController: AlertController,
    private authService: AuthService,
    private geolocation: Geolocation) {}
 
  ngOnInit() {
    this.initializeMap();
    // Verificar la ubicación al cargar la página
    this.verificarUbicacion();
    this.obtenerEspecialidadesDesdeBackend();  // Permite obtener las especialidades médicas desde el backend
    this.obtenerListadoMedicos(); // Llamar a obtenerListadoMedicos() después de obtener las especialidades
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica del paciente desde AuthService
    this.paciente = this.authService.getPacienteData();
    // Cargar la imagen en base64
    console.log('Paciente:', this.paciente);
    if (this.paciente && this.paciente.pacFotografiaBase64) {
      this.paciente.pacFotografiaURL = 'data:image/jpeg;base64,' + this.paciente.pacFotografiaBase64;
    }
  }
  
  ionViewDidEnter() {
    this.verificarUbicacion(); // Verificar la ubicación cada vez que la página haya ingresado
  }

  // Método para inicializar el mapa y mostrar marcadores
  async initializeMap() {
    // Verificar si la geolocalización está disponible
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.medUbicacionLat = position.coords.latitude;
          this.medUbicacionLon = position.coords.longitude;
          // Inicializar el mapa
          this.initMap();
          // Mostrar marcador en la ubicación actual del médico
          this.addCurrentLocationMarker();
        },
        (error) => {
          console.error('Error al obtener la ubicación actual:', error);
        }
      );
    } else {
      console.error('La geolocalización no está disponible.');
    }
  }

  // Método para inicializar el mapa con opciones iniciales
  initMap() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      const mapOptions = {
        center: new google.maps.LatLng(this.medUbicacionLat, this.medUbicacionLon),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };
      this.map = new google.maps.Map(mapElement, mapOptions);
      // Iterar sobre la lista de médicos y agregar marcadores
      this.listaMedicos.forEach((medico) => {
        if (medico.medUbicacionLat && medico.medUbicacionLon) {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(medico.medUbicacionLat, medico.medUbicacionLon),
            map: this.map,
            title: `${medico.medNombres} ${medico.medApellidos}`,
            draggable: false,
          });
          marker.addListener('click', () => {
            this.mostrarInformacionMedico(medico);
          });
        }
      });
    } else {
      console.error('Elemento del mapa no encontrado.');
    }
  }

  // Método para agregar un marcador en la ubicación actual del paciente
  addCurrentLocationMarker() {
    const currentLocationMarker = new google.maps.Marker({
      position: new google.maps.LatLng(this.medUbicacionLat, this.medUbicacionLon),
      map: this.map,
      title: 'Ubicación Actual del Paciente',
      draggable: true,
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Icono azul
    });
    currentLocationMarker.addListener('dragend', (event: any) => {
      if (event.latLng) {
        this.onMarkerPositionChanged(event.latLng);
      }
    });
  }

  // Método para mostrar información detallada del médico
  mostrarInformacionMedico(medico: any) {
    console.log('Información del médico:', medico);
  }

  // Método para manejar la posición cambiada del marcador
  onMarkerPositionChanged(latLng: any) {
    console.log('Nueva posición del marcador:', latLng.lat(), latLng.lng());
  }

  // Solicitud de activación de ubicación actual al usuario
  ubicacionActivada: boolean = false;
  // Método para verificar si la ubicación está habilitada y ordenar por distancia
  async verificarUbicacion() {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (position) => {
            // Ubicación activada
            this.ubicacionActivada = true;
            // Guardar las coordenadas de la ubicación actual
            const ubicacionActual = {
              latitud: position.coords.latitude,
              longitud: position.coords.longitude
            };
            // Calcular la distancia para cada médico
            this.listaMedicos.forEach((medico) => {
              if (medico.medUbicacionLat && medico.medUbicacionLon) {
                // Calcular la distancia usando la fórmula de Haversine
                const distancia = this.calcularDistancia(
                  ubicacionActual.latitud,
                  ubicacionActual.longitud,
                  medico.medUbicacionLat,
                  medico.medUbicacionLon
                );
                // Verificar si distancia es undefined antes de asignarla al médico
                if (distancia) {
                  // Asignar la distancia al médico
                  medico.distanciaDesdeUsuario = distancia;
                }
              }
            });
          },
          (error) => {
            // Ubicación desactivada
            this.mostrarAlertaUbicacion();
          }
        );
      } else {
        // Navegador no compatible con la geolocalización
        this.mostrarAlertaUbicacion();
      }
    } catch (error) {
      console.error('Error al verificar ubicación:', error);
    }
  }

  // Calcular la distancia con respecto al paciente
  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): { valor: number; unidad: string } {
    const R = 6371; // Radio de la Tierra en kilómetros
    const toRadians = (degrees: number): number => {
      return degrees * (Math.PI / 180);
    };
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanciaMetros = R * c * 1000; // Distancia en metros
    // Definir el umbral para mostrar la distancia en kilómetros
    const umbralKilometros = 1000;
    if (distanciaMetros >= umbralKilometros) {
      // Si la distancia es mayor o igual a 1000 metros, convertir a kilómetros
      return { valor: distanciaMetros / 1000, unidad: 'km' };
    } else {
      // Si la distancia es menor a 1000 metros, mostrar en metros
      return { valor: distanciaMetros, unidad: 'm' };
    }
  }

  async mostrarAlertaUbicacion() {
    const alert = await this.alertController.create({
      header: 'Activar Ubicación',
      message: 'Es necesario activar manualmente la ubicación del dispositivo para mejorar la experiencia de usuario. ' +
               'Si no habilita la ubicación, no se obtendrá la distancia y dirección de su domicilio con respecto al consultorio médico.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            if (this.ubicacionActivada) {
              this.router.navigate(['/mapa-medico']);
            }
          },
        },
      ],
    });
    await alert.present();
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

  // Método para obtener el listado de los médicos
  async obtenerListadoMedicos() {
    try {
      // Obtener especialidades médicas
      const especialidadesResponse = await this.http.get<any[]>(`http://${ipServidor}/especialidadesMedicas/all`, { responseType: 'json' }).toPromise();
      // Obtener especialidad médica del médico
      const espMedMedicosResponse = await this.http.get<any[]>(`http://${ipServidor}/espMedMedicos/all`, { responseType: 'json' }).toPromise();
      // Obtener los días
      const diasResponse = await this.http.get<any[]>(`http://${ipServidor}/dias/all`, { responseType: 'json' }).toPromise();
      // Obtener lista de médicos
      const medicosResponse = await this.http.get<any[]>(`http://${ipServidor}/medicos/all`, { responseType: 'json' }).toPromise();
      // Verificar si la respuesta de médicos y días es undefined
      if (medicosResponse !== undefined && diasResponse !== undefined && especialidadesResponse !== undefined) {
        this.listaMedicos = medicosResponse;
        // Obtener los emmId de EspMedMedicos en el listado de médicos
        const emmIdsMedicos: number[] = this.listaMedicos.flatMap((medico: { espMedMedicos?: { emmId: number }[] }) =>
          medico.espMedMedicos ? medico.espMedMedicos.map(espMedico => espMedico.emmId) : []
        );
        // Filtrar las especialidades que están en el listado de médicos
        const especialidadesEnMedicos = especialidadesResponse.filter((em: { espMedMedicos?: { emmId: number }[] }) =>
          em.espMedMedicos ? em.espMedMedicos.some(espMedico => emmIdsMedicos.includes(espMedico.emmId)) : false
        );
        // Iterar sobre los días y los médicos para imprimir diaDescripcion
        especialidadesEnMedicos.forEach((em: { emDescripcion: string, espMedMedicos?: { emmId: number, emDescripcion?: string }[] }) => {
          const emDescripcion = em.emDescripcion;
          console.log(`em Descripcion: ${emDescripcion}`);
          this.listaMedicos.forEach((medico: { espMedMedicos?: { emmId: number, emDescripcion?: string }[] }) => {
            // Utilizar el operador de navegación segura (?.) para evitar errores si horariosAtencion o dia.horariosAtencion son undefined
            medico.espMedMedicos?.forEach((espMedicoEm: { emmId: number, emDescripcion?: string }) => {
              if (emmIdsMedicos.includes(espMedicoEm.emmId)) {
                // Asignar diaDescripcion solo al horario correspondiente al día actual
                if (em.espMedMedicos?.some(espMedico => espMedico.emmId === espMedicoEm.emmId)) {
                  espMedicoEm.emDescripcion = emDescripcion;
                }
              }
            });
          });
        });
        // Obtener los hmId de HorariosAtencion en el listado de médicos
        const hmIdsMedicos: number[] = this.listaMedicos.flatMap((medico: { horariosAtencion?: { hmId: number }[] }) =>
          medico.horariosAtencion ? medico.horariosAtencion.map(horario => horario.hmId) : []
        );
        // Filtrar los días que están en el listado de médicos
        const diasEnMedicos = diasResponse.filter((dia: { horariosAtencion?: { hmId: number }[] }) =>
          dia.horariosAtencion ? dia.horariosAtencion.some(horario => hmIdsMedicos.includes(horario.hmId)) : false
        );
        // Iterar sobre los días y los médicos para imprimir diaDescripcion
        diasEnMedicos.forEach((dia: { diaDescripcion: string, horariosAtencion?: { hmId: number, diaDescripcion?: string }[] }) => {
          const diaDescripcion = dia.diaDescripcion;
          console.log(`Dia Descripcion: ${diaDescripcion}`);
          this.listaMedicos.forEach((medico: { horariosAtencion?: { hmId: number, diaDescripcion?: string }[] }) => {
            // Utilizar el operador de navegación segura (?.) para evitar errores si horariosAtencion o dia.horariosAtencion son undefined
            medico.horariosAtencion?.forEach((horarioDia: { hmId: number, diaDescripcion?: string }) => {
              if (hmIdsMedicos.includes(horarioDia.hmId)) {
                // Asignar diaDescripcion solo al horario correspondiente al día actual
                if (dia.horariosAtencion?.some(horario => horario.hmId === horarioDia.hmId)) {
                  horarioDia.diaDescripcion = diaDescripcion;
                }
              }
            });
          });
        });
        // Cargar las imágenes directamente en la lista
        this.listaMedicos.forEach((medico: { medFotografiaBase64?: string; medFotografiaURL?: string }) => {
          if (medico.medFotografiaBase64) {
            medico.medFotografiaURL = 'data:image/jpeg;base64,' + medico.medFotografiaBase64;
          }
        });
        console.log('Lista de médicos:', this.listaMedicos);
        console.log('Lista esp med médico:', espMedMedicosResponse);
        console.log('Listado de especialidades médicas:', especialidadesResponse);
        console.log('Listado de días:', diasResponse);
      } else {
        // Manejar el caso en que medicosResponse o diasResponse es undefined
        console.error('La respuesta de médicos o días es undefined');
      }
    } catch (error) {
      console.error('Error al obtener lista de médicos:', error);
    }
  }
  
  // Método que se ejecuta cuando se aplican los filtros
  mostrarListado: boolean = true;
  ordenarPorDistancia: boolean = false;

  
  // Método para aplicar filtros
  aplicarFiltros() {
    console.log('Antes de filtrar:', this.listaMedicos.length);
    // Inicializar los filtros seleccionados antes de aplicarlos
    this.filtrosSeleccionados = [];
    // Agregar especialidad seleccionada
    if (this.selectedEspecialidad) {
      this.filtrosSeleccionados.push(this.selectedEspecialidad);
    }
    // Agregar servicios seleccionados como "true"
    if (this.atencionDomicilio) {
      this.filtrosSeleccionados.push('Atención a Domicilio');
    }
    if (this.servicioEnfermeria) {
      this.filtrosSeleccionados.push('Servicio de Enfermería');
    }
    if (this.farmaciaMedicacion) {
      this.filtrosSeleccionados.push('Farmacia / Medicación');
    }
    if (this.atencion247) {
      this.filtrosSeleccionados.push('Servicio Médico 24/7');
    }
    // Concatenar los filtros seleccionados
    this.filtrosAplicados = this.filtrosSeleccionados.join(', ');
    // Imprimir los atributos de filtrado
    console.log('Atributos de filtrado:', {
      especialidad: this.selectedEspecialidad,
      atencionDomicilio: this.atencionDomicilio,
      servicioEnfermeria: this.servicioEnfermeria,
      farmaciaMedicacion: this.farmaciaMedicacion,
      servicioMedico247: this.atencion247
    });
    // Verificar si la ubicación está habilitada y ordenar por distancia
    this.ordenarPorDistancia = this.ubicacionActivada;
    // Filtrar el listado de médicos
    this.filtrarListadoMedicos();
    // Cerrar el menú derecho después de aplicar los filtros
    this.menuCtrl.close('menuDerecho');
  }
  // Método para filtrar listado de médicos
  async filtrarListadoMedicos() {
    // Verificar si no hay filtros seleccionados y mostrar todo el listado
    if (!this.selectedEspecialidad && !this.atencionDomicilio && !this.servicioEnfermeria && !this.farmaciaMedicacion && !this.atencion247) {
      // Mostrar todo el listado original (sin filtros)
      this.obtenerListadoMedicos();
      return;
    }
    // Ordenar la lista por distancia si la opción está habilitada, de lo contrario, ordenar alfabéticamente por nombre
    if (this.ubicacionActivada) {
      this.listaMedicos.sort((a, b) => a.distanciaDesdeUsuario.valor - b.distanciaDesdeUsuario.valor);
    } else {
      this.listaMedicos.sort((a, b) => {
        const nombreA = `${a.medDenominacion} ${a.medNombres} ${a.medApellidos}`.toLowerCase();
        const nombreB = `${b.medDenominacion} ${b.medNombres} ${b.medApellidos}`.toLowerCase();
        return nombreA.localeCompare(nombreB);
      });
    }
    // Obtener la especialidad seleccionada
    const especialidadSeleccionada = this.selectedEspecialidad;
    // Filtrar el listado de médicos
    this.listaMedicos = this.listaMedicos.filter((medico) => {
      const especialidadCoincide = !especialidadSeleccionada || medico.espMedMedicos?.some((espMedico: any) => espMedico.emDescripcion === especialidadSeleccionada);
      // Verificar si todos los filtros son verdaderos y la especialidad coincide
      const pasaFiltros =
        (!this.selectedEspecialidad || especialidadCoincide) &&
        (!this.atencionDomicilio || medico.medTagD) &&
        (!this.servicioEnfermeria || medico.medTagE) &&
        (!this.farmaciaMedicacion || medico.medTagM) &&
        (!this.atencion247 || medico.medTag247);
      if (pasaFiltros) {
        // Imprimir información de filtrado para cada médico
        console.log(`Médico ${medico.id}:`);
        console.log('Especialidad coincide:', especialidadCoincide);
        console.log('Atención a domicilio coincide:', this.atencionDomicilio);
        console.log('Servicio de enfermería coincide:', this.servicioEnfermeria);
        console.log('Farmacia / Medicación coincide:', this.farmaciaMedicacion);
        console.log('Servicio médico 24/7 coincide:', this.atencion247);
        console.log('Fue filtrado:', true);
      } else {
        console.log(`Médico ${medico.medCi} no cumple con los filtros.`);
      }
      return pasaFiltros;
    });

    const hayCoincidencias = this.listaMedicos.length > 0;
    if (!hayCoincidencias) {
      // Mostrar la alerta si no hay coincidencias
      await this.mostrarAlertaNoCoincidencias();
    }
  }

  async mostrarAlertaNoCoincidencias() {
    const alert = await this.alertController.create({
      header: 'No se encontraron coincidencias',
      message: 'Por favor, ajusta los filtros para obtener resultados.',
      buttons: ['OK']
    });
    await alert.present();
  }

  resetearFiltros() {
    if (this.filtrosAplicados) {
      this.selectedEspecialidad = null;
      this.atencionDomicilio = false;
      this.servicioEnfermeria = false;
      this.farmaciaMedicacion = false;
      this.atencion247 = false;
      this.verificarUbicacion();
      this.obtenerListadoMedicos();
    }
  }

  // Mostrar si está abierto o cerrado el consultorio médico 
  estaAbierto(medico: any): boolean {
    const horaActual = new Date().getHours(); // Obtener la hora actual

    // Iterar sobre los horarios de atención del médico
    for (const horario of medico.horariosAtencion) {
      // Verificar el primer horario (hm1)
      if (this.horarioCoincideConHora(horario.hm1Inicio, horario.hm1Fin, horaActual)) {
        return true; // El médico está abierto
      }
      // Verificar el segundo horario (hm2) solo si hm2Inicio no es vacío
      if (horario.hm2Inicio !== null && horario.hm2Fin !== null && this.horarioCoincideConHora(horario.hm2Inicio, horario.hm2Fin, horaActual)) {
        return true; // El médico está abierto
      }
    }
    // Si la hora actual no coincide con ningún rango, el médico está cerrado
    return false;
  }

  // Método para verificar si la hora actual coincide con el rango especificado
  horarioCoincideConHora(inicio: number, fin: number, horaActual: number): boolean {
    return inicio !== null && fin !== null && horaActual >= inicio && horaActual <= fin;
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

  abrirMenuIzquierdo(){
    this.menuCtrl.enable(true, 'menuIzquierdo');
    this.menuCtrl.open('menuIzquierdo');
  }

  abrirMenuDerecho(){
    this.menuCtrl.enable(true, 'menuDerecho');
    this.menuCtrl.open('menuDerecho');
  }

  goVentanaPaciente(){
    localStorage.setItem('backvalue','ventanaPaciente');
    this.router.navigateByUrl('/ventana-paciente');
  }  

  goListadoMedico(){
    localStorage.setItem('backvalue','listadoMedico');
    this.router.navigateByUrl('/listado-medico');
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
  
  irAInformacionMedico(medico: any) {
    // Mostrar la información del médico en la consola
    console.log('Información del médico:', medico);
    // Navegar a la página informacion-medico y pasar el médico como parámetro
    this.router.navigate(['/informacion-medico'], { state: { medico } });
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