import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OlvidoClaveFarmaciaPage } from './olvido-clave-farmacia.page';

const routes: Routes = [
  {
    path: '',
    component: OlvidoClaveFarmaciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class OlvidoClaveFarmaciaPageRoutingModule {}