import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Add this for new routing components
import { ProjectsComponent } from './views/main/projects/projects.component';
import { MeshComponent } from './views/main/fds/geometry/mesh/mesh.component';
import { ObstructionComponent } from './views/main/fds/geometry/obstruction/obstruction.component';
import { GeneralComponent } from './views/main/fds/general/general.component';
import { MaterialComponent } from './views/main/fds/geometry/material/material.component';
import { SurfaceComponent } from './views/main/fds/geometry/surface/surface.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectsComponent
  },
  {
    path: 'general',
    component: GeneralComponent
  },
  {
    path: 'geometry/mesh',
    component: MeshComponent
  },
  {
    path: 'geometry/material',
    component: MaterialComponent
  },
  {
    path: 'geometry/surface',
    component: SurfaceComponent
  },
  {
    path: 'geometry/obstruction',
    component: ObstructionComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
