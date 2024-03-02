import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionarPerfilFarmaciaPage } from './gestionar-perfil-farmacia.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarPerfilFarmaciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class GestionarPerfilFarmaciaPageRoutingModule {}