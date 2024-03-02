import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoMedicoPage } from './listado-medico.page';

const routes: Routes = [
  {
    path: '',
    component: ListadoMedicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class ListadoMedicoPageRoutingModule {}