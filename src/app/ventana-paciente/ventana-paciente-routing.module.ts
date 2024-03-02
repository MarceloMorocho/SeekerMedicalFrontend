import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VentanaPacientePage } from './ventana-paciente.page';

const routes: Routes = [
  {
    path: '',
    component: VentanaPacientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class VentanaPacientePageRoutingModule {}