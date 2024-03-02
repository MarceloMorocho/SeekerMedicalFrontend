import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrarPacientePage } from './registrar-paciente.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrarPacientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class RegistrarPacientePageRoutingModule {}