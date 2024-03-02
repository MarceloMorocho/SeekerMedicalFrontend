import { Component, OnInit } from '@angular/core';
import { NavController, MenuController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser'; // Se utiliza para evitar problemas de seguridad al manipular URLs de datos
import { AuthService } from '../servicios/auth.service'; // Ruta de auth.service
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Inject } from '@angular/core';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

const ipServidor = '192.168.0.115:8080'; // Dirección IP del servidor

@Component({
  selector: 'app-informacion-medico',
  templateUrl: './informacion-medico.page.html',
  styleUrls: ['./informacion-medico.page.scss'],
})

export class InformacionMedicoPage implements OnInit {
  medCi: string = '';
  filtrosAplicados: string = '';
  especialidad: string = '';
  atencionDomicilio: boolean = false;
  servicioEnfermeria: boolean = false;
  farmaciaMedicacion: boolean = false;
  atencion247: boolean = false;
  selectedEspecialidad: string | null = null;
  listaMedicos: any[] = [];
  filtrosSeleccionados: string[] = [];
  paciente: any = {};
  identifierKey: string = '';
  username: string = '';
  medico: any;
  
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
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    // Verificar la ubicación al cargar la página
    this.verificarUbicacion();
    this.obtenerEspecialidadesDesdeBackend();  // Permite obtener las especialidades médicas desde el backend
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
    // Imprimir medCi en la consola
    console.log('medCi en informacion-medico.page.ts:', this.medCi);
    // Obtener el estado de navegación del médico
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['medico']) {
      this.medico = state['medico'];
      this.medCi = this.medico.medCi; 
    }
  }
  
  ionViewDidEnter() {
    this.verificarUbicacion(); // Verificar la ubicación cada vez que la página haya ingresado
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
                // Asignar la distancia al médico
                medico.distanciaDesdeUsuario = distancia;
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
              this.router.navigate(['/listado-medico']);
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

  // Llamar a los números registrados por el médico
  llamarMedicoCon(medTelefonoCon: string) {
    if (this.platform.is('cordova')) {
      // Si estamos en un dispositivo móvil mediante Cordova
      this.callNumber.callNumber(medTelefonoCon, true)
        .then(() => console.log('Llamada exitosa'))
        .catch((error: any) => console.error('Error al llamar:', error));
    } else {
      // Manejar la lógica para navegadores web u otros casos
      console.log('Llamada no compatible en este entorno.');
    }
  }

  llamarMedicoMov(medTelefonoMov: string) {
    if (this.platform.is('cordova')) {
      // Si estamos en un dispositivo móvil mediante Cordova
      this.callNumber.callNumber(medTelefonoMov, true)
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
        start: '',
      };
      this.launchNavigator.navigate([latitud, longitud], options)
        .then(success => console.log('Launched navigator'), error => console.log('Error launching navigator', error));
    }
  }

  abrirWhatsApp() {
    const phoneNumber = this.medico.medTelefonoMov;
    const message = 'Hola, por favor, escríbame su requerimiento';
    const imageUrl = this.medico.medFotografia;
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

  // Mostrar si está abierto o cerrado el consultorio médico 
  estaAbierto(medico: any): boolean {
    const horaActual = new Date().getHours(); // Obtener la hora actual
    for (const horario of medico.horariosAtencion) {
      if (this.horarioCoincideConHora(horario.hm1Inicio, horario.hm1Fin, horaActual)) {
        return true; // El médico está abierto
      }
      // Verificar el segundo horario (hm2) solo si hm2Inicio no es vacío
      if (horario.hm2Inicio !== null && horario.hm2Fin !== null) {
        if (this.horarioCoincideConHora(horario.hm2Inicio, horario.hm2Fin, horaActual)) {
          return true; // El médico está abierto
        }
      }
    }
    // Si la hora actual no coincide con ningún rango, el médico está cerrado
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

  goSalir(){
    // Limpiar datos de autenticación y redirigir a la página de inicio
    this.authService.setPacienteData(null);
    this.authService.setIdentifierKey('');
    this.authService.setUsername('');
    localStorage.setItem('backvalue','home');
    this.router.navigateByUrl('/home');
  }
}