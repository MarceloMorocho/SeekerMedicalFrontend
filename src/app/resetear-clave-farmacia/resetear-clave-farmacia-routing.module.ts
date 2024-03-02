import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResetearClaveFarmaciaPage } from './resetear-clave-farmacia.page';

const routes: Routes = [
  {
    path: '',
    component: ResetearClaveFarmaciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class ResetearClaveFarmaciaPageRoutingModule {}