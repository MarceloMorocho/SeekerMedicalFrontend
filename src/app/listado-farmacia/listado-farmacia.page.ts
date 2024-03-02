import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, MenuController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser'; // Se utiliza para evitar problemas de seguridad al manipular URLs de datos
import { AuthService } from '../servicios/auth.service'; // Ruta de auth.service

const ipServidor = '192.168.0.115:8080';  // Dirección IP del servidor

@Component({
  selector: 'app-listado-farmacia',
  templateUrl: './listado-farmacia.page.html',
  styleUrls: ['./listado-farmacia.page.scss'],
})

export class ListadoFarmaciaPage implements OnInit {
  filtrosAplicados: string = '';
  envioDomicilio: boolean = false;
  atencion247: boolean = false;
  listaFarmacias: any[] = [];
  filtrosSeleccionados: string[] = [];
  paciente: any = {};  // Initialize paciente as an empty object
  identifierKey: string = '';
  username: string = '';
  farmaciaMarcada: any | null = null;
  farmaciaSeleccionada: any | null = null;
  
  constructor(private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private navCtrl: NavController,
    private http: HttpClient,
    private menuCtrl: MenuController,
    private sanitizer: DomSanitizer,
    private alertController: AlertController,
    private authService: AuthService) { }
 
  ngOnInit() {
    this.verificarUbicacion(); // Verificar la ubicación al cargar la página
    this.obtenerListadoFarmacias(); // Llamar a obtenerListadoFarmacias()
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica del paciente desde AuthService
    this.paciente = this.authService.getPacienteData();
    // Transformar la imagen en base64
    console.log('Paciente:', this.paciente);
    if (this.paciente && this.paciente.pacFotografiaBase64) {
      this.paciente.pacFotografiaURL = 'data:image/jpeg;base64,' + this.paciente.pacFotografiaBase64;
    }
  }
  
  ionViewDidEnter() {
    this.verificarUbicacion(); // Verificar la ubicación cada vez que la página haya ingresado
  }
  
  // Método para establecer la farmacia seleccionada al pasar el ratón
  establecerFarmaciaSeleccionada(farmacia: any) {
    this.farmaciaSeleccionada = farmacia;
  }

  // Método para deseleccionar la farmacia al salir del ratón
  deseleccionarFarmacia() {
    this.farmaciaSeleccionada = null;
  }

  // Solicitud de activación de ubicación actual al usuario
  ubicacionActivada: boolean = false;
  // Método para verificar la ubicación
  async verificarUbicacion() {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition( // Utilizar watchPosition para seguir la ubicación en tiempo real
          (position) => {
            this.ubicacionActivada = true; // Ubicación activada
            // Guardar las coordenadas de la ubicación actual
            const ubicacionActual = {
              latitud: position.coords.latitude,
              longitud: position.coords.longitude
            };
            // Calcular la distancia para cada farmacia
            this.listaFarmacias.forEach((farmacia) => {
              if (farmacia.farUbicacionLat && farmacia.farUbicacionLon) {
                // Calcular la distancia usando la fórmula de Haversine
                const distancia = this.calcularDistancia(
                  ubicacionActual.latitud,
                  ubicacionActual.longitud,
                  farmacia.farUbicacionLat,
                  farmacia.farUbicacionLon
                );
                // Asignar la distancia a la farmacia
                farmacia.distanciaDesdeUsuario = distancia;
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
               'Si no habilita la ubicación, no se obtendrá la distancia y dirección de su domicilio con respecto a la farmacia.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            if (this.ubicacionActivada) {
              this.router.navigate(['/listado-farmacia']);
            }
          },
        },
      ],
    });
    await alert.present();
  }
 
  async obtenerListadoFarmacias() {
    try {
      // Obtener los días
      const diasResponse = await this.http.get<any[]>(`http://${ipServidor}/dias/all`, { responseType: 'json' }).toPromise();
      // Obtener lista de farmacias
      const farmaciasResponse = await this.http.get<any[]>(`http://${ipServidor}/farmacias/all`, { responseType: 'json' }).toPromise();
      // Verificar si la respuesta de farmacias y días es undefined
      if (farmaciasResponse !== undefined && diasResponse !== undefined) {
        this.listaFarmacias = farmaciasResponse;
        // Obtener los hmId de HorariosAtencion en el listado de farmacias
        const hmIdsFarmacias: number[] = this.listaFarmacias.flatMap((farmacia: { horariosAtencion?: { hmId: number }[] }) =>
          farmacia.horariosAtencion ? farmacia.horariosAtencion.map(horario => horario.hmId) : []
        );
        // Filtrar los días que están en el listado de farmacias
        const diasEnFarmacias = diasResponse.filter((dia: { horariosAtencion?: { hmId: number }[] }) =>
          dia.horariosAtencion ? dia.horariosAtencion.some(horario => hmIdsFarmacias.includes(horario.hmId)) : false
        );
        // Iterar sobre los días y las farmacias para imprimir diaDescripcion
        diasEnFarmacias.forEach((dia: { diaDescripcion: string, horariosAtencion?: { hmId: number, diaDescripcion?: string }[] }) => {
          const diaDescripcion = dia.diaDescripcion;
          console.log(`Dia Descripcion: ${diaDescripcion}`);
          this.listaFarmacias.forEach((farmacia: { horariosAtencion?: { hmId: number, diaDescripcion?: string }[] }) => {
            // Utilizar el operador de navegación segura (?.) para evitar errores si horariosAtencion o dia.horariosAtencion son undefined
            farmacia.horariosAtencion?.forEach((horarioDia: { hmId: number, diaDescripcion?: string }) => {
              if (hmIdsFarmacias.includes(horarioDia.hmId)) {
                // Asignar diaDescripcion solo al horario correspondiente al día actual
                if (dia.horariosAtencion?.some(horario => horario.hmId === horarioDia.hmId)) {
                  horarioDia.diaDescripcion = diaDescripcion;
                }
              }
            });
          });
        });
        // Cargar las imágenes directamente en la lista
        this.listaFarmacias.forEach((farmacia: { farLogotipoBase64?: string; farLogotipoURL?: string }) => {
          if (farmacia.farLogotipoBase64) {
            farmacia.farLogotipoURL = 'data:image/jpeg;base64,' + farmacia.farLogotipoBase64;
          }
        });
        console.log('Lista de farmacias:', this.listaFarmacias);
        console.log('Listado de días:', diasResponse);
      } else {
        // Manejar el caso en que farmaciasResponse o diasResponse es undefined
        console.error('La respuesta de farmacias o días es undefined');
      }
    } catch (error) {
      console.error('Error al obtener lista de farmacias:', error);
    }
  }
  
  // Método que se ejecuta cuando se aplican los filtros
  mostrarListado: boolean = true;
  ordenarPorDistancia: boolean = false;
  aplicarFiltros() {
    console.log('Antes de filtrar:', this.listaFarmacias.length);
    // Inicializar los filtros seleccionados antes de aplicarlos
    this.filtrosSeleccionados = [];
    // Agregar servicios seleccionados como "true"
    if (this.envioDomicilio) {
      this.filtrosSeleccionados.push('Envío a Domicilio');
    }
    if (this.atencion247) {
      this.filtrosSeleccionados.push('Servicio Médico 24/7');
    }
    // Concatenar los filtros seleccionados
    this.filtrosAplicados = this.filtrosSeleccionados.join(', ');
    // Imprimir los atributos de filtrado
    console.log('Atributos de filtrado:', {
      envioDomicilio: this.envioDomicilio,
      servicioMedico247: this.atencion247
    });
    // Verificar si la ubicación está habilitada y ordenar por distancia
    this.ordenarPorDistancia = this.ubicacionActivada;
    // Filtrar el listado de farmacias
    this.filtrarListadoFarmacias();
    // Cerrar el menú derecho después de aplicar los filtros
    this.menuCtrl.close('menuDerecho');
  }

  // Método para filtrar listado de farmacias
  async filtrarListadoFarmacias() {
    // Verificar si no hay filtros seleccionados y mostrar todo el listado
    if (!this.envioDomicilio && !this.atencion247) {
      // Mostrar todo el listado original (sin filtros)
      this.obtenerListadoFarmacias();
      return;
    }
    // Ordenar la lista por distancia si la opción está habilitada, de lo contrario, ordenar alfabéticamente por nombre
    if (this.ubicacionActivada) {
      this.listaFarmacias.sort((a, b) => a.distanciaDesdeUsuario.valor - b.distanciaDesdeUsuario.valor);
    } else {
      this.listaFarmacias.sort((a, b) => {
        const nombreA = `${a.farNombreNegocio}`.toLowerCase();
        const nombreB = `${b.farNombreNegocio}`.toLowerCase();
        return nombreA.localeCompare(nombreB);
      });
    }
    // Filtrar el listado de farmacias
    this.listaFarmacias = this.listaFarmacias.filter((farmacia) => {
      // Verificar si todos los filtros son verdaderos
      const pasaFiltros =
        (!this.envioDomicilio || farmacia.farTagD) &&
        (!this.atencion247 || farmacia.farTag247);
      if (pasaFiltros) {
        // Imprimir información de filtrado para cada farmacia
        console.log(`Farmacia ${farmacia.farmaciasResponse}:`);
        console.log('Atención a domicilio coincide:', this.envioDomicilio);
        console.log('Atención 24/7 coincide:', this.atencion247);
        console.log('Fue filtrado:', true);
      } else {
        console.log(`Farmacia ${farmacia.farRuc} no cumple con los filtros.`);
      }
      return pasaFiltros;
    });
    const hayCoincidencias = this.listaFarmacias.length > 0;
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
      this.envioDomicilio = false;
      this.atencion247 = false;
      this.verificarUbicacion();
      this.obtenerListadoFarmacias();
    }
  }

  // Mostrar si está abierto o cerrado la farmacia
  estaAbierto(farmacia: any): boolean {
    const horaActual = new Date().getHours(); // Obtener la hora actual
    // Iterar sobre los horarios de atención de la farmacia
    for (const horario of farmacia.horariosAtencion) {
      // Verificar el primer horario (hm1)
      if (this.horarioCoincideConHora(horario.hm1Inicio, horario.hm1Fin, horaActual)) {
        return true; // La farmacia está abierta
      }
      // Verificar el segundo horario (hm2) solo si hm2Inicio no es vacío
      if (horario.hm2Inicio !== null && horario.hm2Fin !== null && this.horarioCoincideConHora(horario.hm2Inicio, horario.hm2Fin, horaActual)) {
        return true; // La farmacia está abierta
      }
    }
    // Si la hora actual no coincide con ningún rango, la farmacia está cerrada
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

  // Método para navegar a la página de información de la farmacia con parámetros
  irAInformacionFarmacia(farmacia: any) {
    // Mostrar la información de la farmacia en la consola
    console.log('Información de la farmacia:', farmacia);
    this.router.navigate(['/informacion-farmacia'], { state: { farmacia } });
  }

  abrirMenuIzquierdo() {
    if (!this.menuCtrl.isEnabled('menuIzquierdo')) {
      this.menuCtrl.enable(true, 'menuIzquierdo');
    }
    this.menuCtrl.open('menuIzquierdo');
  }

  abrirMenuDerecho() {
    if (!this.menuCtrl.isEnabled('menuDerecho')) {
      this.menuCtrl.enable(true, 'menuDerecho');
    }
    this.menuCtrl.open('menuDerecho');
  }

  goVentanaPaciente(){
    localStorage.setItem('backvalue','ventanaPaciente');
    this.router.navigateByUrl('/ventana-paciente');
  }  

  goListadoFarmacia(){
    localStorage.setItem('backvalue','listadoFarmacia');
    this.router.navigateByUrl('/listado-farmacia');
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
    localStorage.setItem('backvalue','listadoFarmacia');
    this.router.navigateByUrl('/listado-farmacia');
  }

  goBuscarMedicoMapa(){
    localStorage.setItem('backvalue','mapaFarmacia');
    this.router.navigateByUrl('/mapa-farmacia');
  }

  goGestionarPerfil(){
    localStorage.setItem('backvalue','gestionarPerfilPaciente');
    this.router.navigateByUrl('/gestionar-perfil-paciente');
  }
  
  goResetearClave(){
    localStorage.setItem('backvalue','resetearClavePaciente');
    this.router.navigateByUrl('/resetear-clave-paciente');
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