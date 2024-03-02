import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionarPerfilPacientePage } from './gestionar-perfil-paciente.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarPerfilPacientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class GestionarPerfilPacientePageRoutingModule {}