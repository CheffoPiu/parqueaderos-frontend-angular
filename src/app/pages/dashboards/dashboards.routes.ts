import { Routes } from '@angular/router';

// dashboards
import { AppDashboard1Component } from './dashboard1/dashboard1.component';
import { AppDashboard2Component } from './dashboard2/dashboard2.component';
import { AppAnalisisAfluenciasComponent } from './analisis-afluencias/analisis-afluencias.component';
import { AppClientesComponent } from './clientes/clientes.component';
import { AppParqueaderosComponent } from './parqueaderos/parqueaderos.component';

export const DashboardsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard1',
        component: AppDashboard1Component,
        data: {
          title: 'Dashboard 1',
        },
      },
      {
        path: 'dashboard2',
        component: AppDashboard2Component,
        data: {
          title: 'Dashboard 2',
        },
      },
      {
        path: 'analisis-afluencias',
        component: AppAnalisisAfluenciasComponent,
        data: {
          title: 'Analisis afluencias',
        },
      },
      {
        path: 'clientes',
        component: AppClientesComponent,
        data: {
          title: 'Clientes',
        },
      },
      {
        path: 'parqueaderos',
        component: AppParqueaderosComponent,
        data: {
          title: 'Parqueaderos',
        },
      },
    ],
  },
];
