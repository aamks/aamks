import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Add this for new routing components
import { ProjectsComponent } from './views/main/projects/projects.component';
import { GeneralRiskComponent } from './views/main/risk/general-risk/general-risk.component';
import { BuildingCharacteristicComponent } from './views/main/risk/building-characteristic/building-characteristic.component';
import { BuildingInfrastructureComponent } from './views/main/risk/building-infrastructure/building-infrastructure.component';
import { SettingsComponent } from './views/main/risk/settings/settings.component';
import { ResultsComponent } from './views/main/risk/results/results.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectsComponent
  },
  {
    path: 'risk/general',
    component: GeneralRiskComponent
  },
  {
    path: 'risk/characteristic',
    component: BuildingCharacteristicComponent
  },
  {
    path: 'risk/infrastructure',
    component: BuildingInfrastructureComponent
  },
  {
    path: 'risk/settings',
    component: SettingsComponent
  },
  {
    path: 'risk/results',
    component: ResultsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
