import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InformacionMedicoPage } from './informacion-medico.page';

const routes: Routes = [
  {
    path: '',
    component: InformacionMedicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class InformacionMedicoPageRoutingModule {}