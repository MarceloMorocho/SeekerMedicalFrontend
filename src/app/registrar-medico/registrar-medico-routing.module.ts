import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrarMedicoPage } from './registrar-medico.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrarMedicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class RegistrarMedicoPageRoutingModule {}