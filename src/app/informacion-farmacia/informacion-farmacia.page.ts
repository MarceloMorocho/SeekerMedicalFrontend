import { Component, OnInit, Inject } from '@angular/core';
import { NavController, MenuController, AlertController, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser'; // Se utiliza para evitar problemas de seguridad al manipular URLs de datos
import { AuthService } from '../servicios/auth.service'; // Ruta de auth.service
import { Router, ActivatedRoute } from '@angular/router';;
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

const ipServidor = '192.168.0.115:8080';  // Dirección IP del servidor

@Component({
  selector: 'app-informacion-farmacia',
  templateUrl: './informacion-farmacia.page.html',
  styleUrls: ['./informacion-farmacia.page.scss'],
})

export class InformacionFarmaciaPage implements OnInit {
  farRuc: string = '';
  filtrosAplicados: string = '';
  envioDomicilio: boolean = false;
  atencion247: boolean = false;
  listaFarmacias: any[] = [];
  filtrosSeleccionados: string[] = [];
  paciente: any = {}; // Modelo de datos del médico
  identifierKey: string = '';
  username: string = '';
  farmacia: any;
  
  constructor(private router: Router, 
    @Inject(LaunchNavigator) private launchNavigator: LaunchNavigator,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private http: HttpClient,
    private menuCtrl: MenuController,
    private sanitizer: DomSanitizer,
    private alertController: AlertController,
    private authService: AuthService, 
    private platform: Platform,
    private callNumber: CallNumber,
    private socialSharing: SocialSharing,
    private activatedRoute: ActivatedRoute) {}
    
  ngOnInit() {
    this.verificarUbicacion(); // Verificar la ubicación al cargar la página
    // Obtener identifierKey y username del servicio
    this.identifierKey = this.authService.getIdentifierKey();
    this.username = this.authService.getUsername();
    // Obtener información específica del paciente desde AuthService
    this.paciente = this.authService.getPacienteData();
    // Transforma la imagen en base64
    console.log('Paciente:', this.paciente);
    if (this.paciente && this.paciente.pacFotografiaBase64) {
      this.paciente.pacFotografiaURL = 'data:image/jpeg;base64,' + this.paciente.pacFotografiaBase64;
    }
    // Imprimir farRuc en la consola
    console.log('farRuc en informacion-farmacia.page.ts:', this.farRuc);
    // Obtener el estado de navegación de la información de la farmacia
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['farmacia']) {
      this.farmacia = state['farmacia'];
      this.farRuc = this.farmacia.farRuc; // Obtener farRuc
    } 
  }
  
  ionViewDidEnter() {
    this.verificarUbicacion(); // Verificar la ubicación cada vez que se ingrese a la página
  }
  
  // Solicitud de activación de ubicación actual al usuario
  ubicacionActivada: boolean = false;
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
               'Si no habilita la ubicación, no se obtendrá la distancia y dirección de su domicilio con respecto al médico.',
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
            farmacia.farLogotipoURL = 'data:image/jpeg;base.farLogotipoBase64';
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

  // Mostrar si está abierta o cerrada la farmacia
  estaAbierto(farmacia: any): boolean {
    const horaActual = new Date().getHours(); // Obtener la hora actual
    for (const horario of farmacia.horariosAtencion) {
      if (this.horarioCoincideConHora(horario.hm1Inicio, horario.hm1Fin, horaActual)) {
        return true; // La farmacia está abierta
      }
      // Verificar el segundo horario (hm2) solo si hm2Inicio no es vacío
      if (horario.hm2Inicio !== null && horario.hm2Fin !== null) {
        if (this.horarioCoincideConHora(horario.hm2Inicio, horario.hm2Fin, horaActual)) {
          return true; // La farmacia está abierta
        }
      }
    }
    // Si la hora actual no coincide con ningún rango, la farmacia está cerrada
    return false;
  }

  horarioCoincideConHora(inicio: number, fin: number, horaActual: number): boolean {
    // Asegurarse de que los horarios de inicio y fin no sean nulos
    if (inicio !== null && fin !== null) {
      // Verificar si la hora actual está dentro del rango
      return horaActual >= inicio && horaActual <= fin;
    }
    // Si los horarios son nulos, no coinciden con la hora actual
    return false;
  }

  abrirMenuIzquierdo() {
    console.log('Abriendo menú izquierdo');
    if (!this.menuCtrl.isEnabled('menuIzquierdo')) {
      this.menuCtrl.enable(true, 'menuIzquierdo');
    }
    this.menuCtrl.open('menuIzquierdo');
  }
  
  // Llamar al número registrado por la farmacia
  llamarFarmaciaCon(farTelefonoCon: string) {
    if (this.platform.is('cordova')) {
      // Si estamos en un dispositivo móvil mediante Cordova
      this.callNumber.callNumber(farTelefonoCon, true)
        .then(() => console.log('Llamada exitosa'))
        .catch((error: any) => console.error('Error al llamar:', error));
    } else {
      // Manejar la lógica para navegadores web u otros casos
      console.log('Llamada no compatible en este entorno.');
    }
  }

  llamarFarmaciaMov(farTelefonoMov: string) {
    if (this.platform.is('cordova')) {
      // Si estamos en un dispositivo móvil mediante Cordova
      this.callNumber.callNumber(farTelefonoMov, true)
        .then(() => console.log('Llamada exitosa'))
        .catch((error: any) => console.error('Error al llamar:', error));
    } else {
      // Manejar la lógica para navegadores web u otros casos
      console.log('Llamada no compatible en este entorno.');
    }
  }

  abrirGoogleMaps(latitud: number, longitud: number) {
    if (latitud && longitud) {
      const options: LaunchNavigatorOptions = {
        start: '', // Dejo esto en blanco para usar la ubicación actual
      };
      this.launchNavigator.navigate([latitud, longitud], options)
      .then(success => console.log('Launched navigator'), error => console.log('Error launching navigator', error));
    }
  }

  abrirWhatsApp() {
    const phoneNumber = this.farmacia.farTelefonoMov;
    const message = 'Hola, por favor, escríbame su requerimiento';
    const imageUrl = this.farmacia.farLogotipo;
    // Verificar si estamos en un dispositivo móvil
    if (this.platform.is('cordova')) {
      // Usar el plugin SocialSharing para compartir a través de WhatsApp
      this.socialSharing.shareViaWhatsAppToReceiver(
        phoneNumber, // Número de teléfono
        message, // Mensaje
        imageUrl // URL de la imagen
      ).then(() => {
        console.log('Compartido exitosamente a través de WhatsApp');
      }).catch((error) => {
        console.error('Error al compartir a través de WhatsApp:', error);
      });
    } else {
      // Manejar la lógica para navegadores web u otros casos
      console.log('Compartir a través de WhatsApp no compatible en este entorno.');
    }
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
    this.authService.setPacienteData(null);
    this.authService.setIdentifierKey('');
    this.authService.setUsername('');
    localStorage.setItem('backvalue','home');
    this.router.navigateByUrl('/home');
  }
}