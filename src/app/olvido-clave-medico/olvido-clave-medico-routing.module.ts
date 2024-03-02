import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OlvidoClaveMedicoPage } from './olvido-clave-medico.page';

const routes: Routes = [
  {
    path: '',
    component: OlvidoClaveMedicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class OlvidoClaveMedicoPageRoutingModule {}