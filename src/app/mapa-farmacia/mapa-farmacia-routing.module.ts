import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapaFarmaciaPage } from './mapa-farmacia.page';

const routes: Routes = [
  {
    path: '',
    component: MapaFarmaciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class MapaFarmaciaPageRoutingModule {}