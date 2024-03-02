import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistroErroneoPage } from './registro-erroneo.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroErroneoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class RegistroErroneoPageRoutingModule {}