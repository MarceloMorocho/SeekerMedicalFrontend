import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VentanaMedicoPage } from './ventana-medico.page';

const routes: Routes = [
  {
    path: '',
    component: VentanaMedicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class VentanaMedicoPageRoutingModule {}