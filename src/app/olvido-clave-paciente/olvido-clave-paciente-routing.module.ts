import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OlvidoClavePacientePage } from './olvido-clave-paciente.page';

const routes: Routes = [
  {
    path: '',
    component: OlvidoClavePacientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class OlvidoClavePacientePageRoutingModule {}