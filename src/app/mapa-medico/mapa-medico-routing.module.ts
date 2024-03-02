import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapaMedicoPage } from './mapa-medico.page';

const routes: Routes = [
  {
    path: '',
    component: MapaMedicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class MapaMedicoPageRoutingModule {}