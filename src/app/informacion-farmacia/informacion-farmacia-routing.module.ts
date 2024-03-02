import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InformacionFarmaciaPage } from './informacion-farmacia.page';

const routes: Routes = [
  {
    path: '',
    component: InformacionFarmaciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class InformacionFarmaciaPageRoutingModule {}