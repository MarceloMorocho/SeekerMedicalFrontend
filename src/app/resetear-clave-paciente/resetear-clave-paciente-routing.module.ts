import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResetearClavePacientePage } from './resetear-clave-paciente.page';

const routes: Routes = [
  {
    path: '',
    component: ResetearClavePacientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class ResetearClavePacientePageRoutingModule {}