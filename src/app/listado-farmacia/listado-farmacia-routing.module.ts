import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoFarmaciaPage } from './listado-farmacia.page';

const routes: Routes = [
  {
    path: '',
    component: ListadoFarmaciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class ListadoFarmaciaPageRoutingModule {}