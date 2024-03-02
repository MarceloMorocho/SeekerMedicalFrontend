import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrarFarmaciaPage } from './registrar-farmacia.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrarFarmaciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class RegistrarFarmaciaPageRoutingModule {}