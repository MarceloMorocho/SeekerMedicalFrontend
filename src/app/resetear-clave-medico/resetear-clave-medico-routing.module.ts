import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResetearClaveMedicoPage } from './resetear-clave-medico.page';

const routes: Routes = [
  {
    path: '',
    component: ResetearClaveMedicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class ResetearClaveMedicoPageRoutingModule {}