import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VentanaFarmaciaPage } from './ventana-farmacia.page';

const routes: Routes = [
  {
    path: '',
    component: VentanaFarmaciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class VentanaFarmaciaPageRoutingModule {}