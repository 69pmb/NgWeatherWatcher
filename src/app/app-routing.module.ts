import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard', loadChildren:
      () => import('./application-modules/dashboard/dashboard.module')
        .then(m => m.DashboardModule), canActivate: [AuthGuard]
  },
  {
    path: 'user', loadChildren:
      () => import('./application-modules/user/user.module')
        .then(m => m.UserModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
