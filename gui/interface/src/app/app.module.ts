import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http'

// Ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// KaTex
import { KatexModule } from 'ng-katex';

// angular-notifier
import { NotifierModule } from 'angular-notifier';

// Perfect Scrollbar
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
// Perfect Scrollbar settings
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

// Http interceptor
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpManagerInterceptor } from './services/http-manager/http-manager-interceptor'
import { HttpManagerService } from './services/http-manager/http-manager.service';

// Services
import { webSocket } from 'rxjs/observable/dom/webSocket';
import { WebsocketService } from './services/websocket/websocket.service';
import { FdsScenarioService } from './services/fds-scenario/fds-scenario.service';
import { ProjectService } from './services/project/project.service';
import { MainService } from './services/main/main.service';

// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './views/header/header.component';
import { MenuComponent } from './views/menu/menu.component';
import { MainComponent } from './views/main/main.component';
import { ProjectsComponent } from './views/main/projects/projects.component';
// FDS components
import { MeshComponent } from './views/main/fds/geometry/mesh/mesh.component';
import { ObstructionComponent } from './views/main/fds/geometry/obstruction/obstruction.component';
// Risk components
import { RiskComponent } from './views/main/risk/risk.component';

// Directives
import { IntegerInputDirective } from './directives/inputs/integer-input.directive';

import { NotificationComponent } from './views/main/notification/notification.component';
import { IdGeneratorService } from './services/id-generator/id-generator.service';
import { Mesh } from './services/fds-object/mesh';
import { CadService } from './services/cad/cad.service';
import { LibraryService } from './services/library/library.service';
import { DecimalInputDirective } from './directives/inputs/decimal-input.directive';
import { StringInputDirective } from './directives/inputs/string-input.directive';
import { UiStateService } from './services/ui-state/ui-state.service';
import { FdsMenuComponent } from './views/menu/fds-menu/fds-menu.component';
import { RiskMenuComponent } from './views/menu/risk-menu/risk-menu.component';
import { UserSettingsComponent } from './views/main/user-settings/user-settings.component';
import { CategoryService } from './services/category/category.service';
import { GeneralComponent } from './views/main/fds/general/general.component';
import { MaterialComponent } from './views/main/fds/geometry/material/material.component';
import { RampChartComponent } from './views/main/fds/shared/ramp-chart/ramp-chart.component';
import { RampFilterPipe } from './pipes/ramp-filter/ramp-filter.pipe';
import { StepsSortPipe } from './pipes/steps-sort/steps-sort.pipe';
import { SurfaceComponent } from './views/main/fds/geometry/surface/surface.component';
import { UniqueSelectComponent } from './views/main/fds/shared/unique-select/unique-select.component';
import { BasicComponent } from './views/main/fds/ventilation/basic/basic.component';
import { JetfanComponent } from './views/main/fds/ventilation/jetfan/jetfan.component';
import { FiresComponent } from './views/main/fds/fire/fires/fires.component';
import { CombustionComponent } from './views/main/fds/fire/combustion/combustion.component';
import { DumpComponent } from './views/main/fds/output/dump/dump.component';
import { BoundaryComponent } from './views/main/fds/output/boundary/boundary.component';
import { SliceComponent } from './views/main/fds/output/slice/slice.component';
import { IsosurfaceComponent } from './views/main/fds/output/isosurface/isosurface.component';
import { DeviceComponent } from './views/main/fds/output/device/device.component';
import { RampComponent } from './views/main/fds/ramp/ramp.component';
import { InputFileComponent } from './views/main/fds/input-file/input-file.component';
import { RiskScenarioService } from './services/risk-scenario/risk-scenario.service';
import { BuildingCharacteristicComponent } from './views/main/risk/building-characteristic/building-characteristic.component';
import { ResultsComponent } from './views/main/risk/results/results.component';
import { SettingsComponent } from './views/main/risk/settings/settings.component';
import { GeneralRiskComponent } from './views/main/risk/general-risk/general-risk.component';
import { BuildingInfrastructureComponent } from './views/main/risk/building-infrastructure/building-infrastructure.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ProjectsComponent,
    HeaderComponent,
    MenuComponent,
    RiskComponent,
    MeshComponent,
    GeneralComponent,
    ObstructionComponent,
    NotificationComponent,
    FdsMenuComponent,
    RiskMenuComponent,
    UserSettingsComponent,
    IntegerInputDirective,
    DecimalInputDirective,
    StringInputDirective,
    MaterialComponent,
    RampChartComponent,
    RampFilterPipe,
    StepsSortPipe,
    SurfaceComponent,
    UniqueSelectComponent,
    BasicComponent,
    JetfanComponent,
    FiresComponent,
    CombustionComponent,
    DumpComponent,
    BoundaryComponent,
    SliceComponent,
    IsosurfaceComponent,
    DeviceComponent,
    RampComponent,
    InputFileComponent,
    BuildingCharacteristicComponent,
    ResultsComponent,
    SettingsComponent,
    GeneralRiskComponent,
    BuildingInfrastructureComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    KatexModule,
    PerfectScrollbarModule,
    NgSelectModule,
    NotifierModule.withConfig(
      {
        position: {
          horizontal: {
            position: 'left',
            distance: 12
          },
          vertical: {
            position: 'bottom',
            distance: 12,
            gap: 10
          }
        },
        theme: 'material',
        behaviour: {
          autoHide: 5000,
          onClick: false,
          onMouseover: 'pauseAutoHide',
          showDismissButton: true,
          stacking: 4
        },
        animations: {
          enabled: true,
          show: {
            preset: 'slide',
            speed: 300,
            easing: 'ease'
          },
          hide: {
            preset: 'fade',
            speed: 300,
            easing: 'ease',
            offset: 50
          },
          shift: {
            speed: 300,
            easing: 'ease'
          },
          overlap: 150
        }
      }
    )
  ],
  providers: [
    MainService,
    HttpManagerService,
    LibraryService,
    WebsocketService,
    ProjectService,
    FdsScenarioService,
    RiskScenarioService,
    IdGeneratorService,
    UiStateService,
    CategoryService,
    CadService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpManagerInterceptor,
      multi: true,
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
