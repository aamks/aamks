import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Add this for new routing components
import { ProjectsComponent } from './views/main/projects/projects.component';
import { MeshComponent } from './views/main/fds/geometry/mesh/mesh.component';
import { ObstructionComponent } from './views/main/fds/geometry/obstruction/obstruction.component';
import { GeneralComponent } from './views/main/fds/general/general.component';
import { MaterialComponent } from './views/main/fds/geometry/material/material.component';
import { SurfaceComponent } from './views/main/fds/geometry/surface/surface.component';
import { BasicComponent } from './views/main/fds/ventilation/basic/basic.component';
import { JetfanComponent } from './views/main/fds/ventilation/jetfan/jetfan.component';
import { FiresComponent } from './views/main/fds/fire/fires/fires.component';
import { CombustionComponent } from './views/main/fds/fire/combustion/combustion.component';
import { DumpComponent } from './views/main/fds/output/dump/dump.component';
import { BoundaryComponent } from './views/main/fds/output/boundary/boundary.component';
import { SliceComponent } from './views/main/fds/output/slice/slice.component';
import { IsosurfaceComponent } from './views/main/fds/output/isosurface/isosurface.component';
import { DeviceComponent } from './views/main/fds/output/device/device.component';
import { InputFileComponent } from './views/main/fds/input-file/input-file.component';

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

  {
    path: 'ventilation/basic',
    component: BasicComponent
  },
  {
    path: 'ventilation/jetfan',
    component: JetfanComponent
  },

  {
    path: 'fire/fires',
    component: FiresComponent
  },
  {
    path: 'fire/combustion',
    component: CombustionComponent
  },

  {
    path: 'output/dump',
    component: DumpComponent
  },
  {
    path: 'output/boundary',
    component: BoundaryComponent
  },
  {
    path: 'output/slice',
    component: SliceComponent
  },
  {
    path: 'output/isosurface',
    component: IsosurfaceComponent
  },
  {
    path: 'output/device',
    component: DeviceComponent
  },
  {
    path: 'input',
    component: InputFileComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
