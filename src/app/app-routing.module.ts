import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'registrar-medico',
    loadChildren: () => import('./registrar-medico/registrar-medico.module').then( m => m.RegistrarMedicoPageModule)
  },
  {
    path: 'registrar-paciente',
    loadChildren: () => import('./registrar-paciente/registrar-paciente.module').then( m => m.RegistrarPacientePageModule)
  },
  {
    path: 'registrar-farmacia',
    loadChildren: () => import('./registrar-farmacia/registrar-farmacia.module').then( m => m.RegistrarFarmaciaPageModule)
  },
  {
    path: 'olvido-clave-paciente',
    loadChildren: () => import('./olvido-clave-paciente/olvido-clave-paciente.module').then( m => m.OlvidoClavePacientePageModule)
  },
  {
    path: 'ventana-paciente',
    loadChildren: () => import('./ventana-paciente/ventana-paciente.module').then( m => m.VentanaPacientePageModule)
  },
  {
    path: 'ventana-medico',
    loadChildren: () => import('./ventana-medico/ventana-medico.module').then( m => m.VentanaMedicoPageModule)
  },
  {
    path: 'ventana-farmacia',
    loadChildren: () => import('./ventana-farmacia/ventana-farmacia.module').then( m => m.VentanaFarmaciaPageModule)
  },
  {
    path: 'listado-medico',
    loadChildren: () => import('./listado-medico/listado-medico.module').then( m => m.ListadoMedicoPageModule)
  },
  {
    path: 'mapa-medico',
    loadChildren: () => import('./mapa-medico/mapa-medico.module').then( m => m.MapaMedicoPageModule)
  },
  {
    path: 'informacion-medico',
    loadChildren: () => import('./informacion-medico/informacion-medico.module').then( m => m.InformacionMedicoPageModule)
  },
  {
    path: 'listado-farmacia',
    loadChildren: () => import('./listado-farmacia/listado-farmacia.module').then( m => m.ListadoFarmaciaPageModule)
  },
  {
    path: 'mapa-farmacia',
    loadChildren: () => import('./mapa-farmacia/mapa-farmacia.module').then( m => m.MapaFarmaciaPageModule)
  },
  {
    path: 'informacion-farmacia',
    loadChildren: () => import('./informacion-farmacia/informacion-farmacia.module').then( m => m.InformacionFarmaciaPageModule)
  },
  {
    path: 'registro-exitoso',
    loadChildren: () => import('./registro-exitoso/registro-exitoso.module').then( m => m.RegistroExitosoPageModule)
  },
  {
    path: 'registro-erroneo',
    loadChildren: () => import('./registro-erroneo/registro-erroneo.module').then( m => m.RegistroErroneoPageModule)
  },
  {
    path: 'resetear-clave-paciente',
    loadChildren: () => import('./resetear-clave-paciente/resetear-clave-paciente.module').then( m => m.ResetearClavePacientePageModule)
  },
  {
    path: 'resetear-clave-medico',
    loadChildren: () => import('./resetear-clave-medico/resetear-clave-medico.module').then( m => m.ResetearClaveMedicoPageModule)
  },
  {
    path: 'resetear-clave-farmacia',
    loadChildren: () => import('./resetear-clave-farmacia/resetear-clave-farmacia.module').then( m => m.ResetearClaveFarmaciaPageModule)
  },
  {
    path: 'olvido-clave-medico',
    loadChildren: () => import('./olvido-clave-medico/olvido-clave-medico.module').then( m => m.OlvidoClaveMedicoPageModule)
  },
  {
    path: 'olvido-clave-farmacia',
    loadChildren: () => import('./olvido-clave-farmacia/olvido-clave-farmacia.module').then( m => m.OlvidoClaveFarmaciaPageModule)
  },
  {
    path: 'gestionar-perfil-medico',
    loadChildren: () => import('./gestionar-perfil-medico/gestionar-perfil-medico.module').then( m => m.GestionarPerfilMedicoPageModule)
  },
  {
    path: 'gestionar-perfil-paciente',
    loadChildren: () => import('./gestionar-perfil-paciente/gestionar-perfil-paciente.module').then( m => m.GestionarPerfilPacientePageModule)
  },
  {
    path: 'gestionar-perfil-farmacia',
    loadChildren: () => import('./gestionar-perfil-farmacia/gestionar-perfil-farmacia.module').then( m => m.GestionarPerfilFarmaciaPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }