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
import { ProjectService } from './services/project/project.service';
import { MainService } from './services/main/main.service';

// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './views/header/header.component';
import { MenuComponent } from './views/menu/menu.component';
import { MainComponent } from './views/main/main.component';
import { ProjectsComponent } from './views/main/projects/projects.component';

// Risk components
import { RiskComponent } from './views/main/risk/risk.component';

// Directives
import { IntegerInputDirective } from './directives/inputs/integer-input.directive';

import { NotificationComponent } from './views/main/notification/notification.component';
import { IdGeneratorService } from './services/id-generator/id-generator.service';
import { CadService } from './services/cad/cad.service';
import { DecimalInputDirective } from './directives/inputs/decimal-input.directive';
import { StringInputDirective } from './directives/inputs/string-input.directive';
import { UiStateService } from './services/ui-state/ui-state.service';
import { RiskMenuComponent } from './views/menu/risk-menu/risk-menu.component';
import { UserSettingsComponent } from './views/main/user-settings/user-settings.component';
import { CategoryService } from './services/category/category.service';
import { RampFilterPipe } from './pipes/ramp-filter/ramp-filter.pipe';
import { StepsSortPipe } from './pipes/steps-sort/steps-sort.pipe';
import { RiskScenarioService } from './services/risk-scenario/risk-scenario.service';
import { BuildingCharacteristicComponent } from './views/main/risk/building-characteristic/building-characteristic.component';
import { ResultsComponent } from './views/main/risk/results/results.component';
import { SettingsComponent } from './views/main/risk/settings/settings.component';
import { GeneralRiskComponent } from './views/main/risk/general-risk/general-risk.component';
import { BuildingInfrastructureComponent } from './views/main/risk/building-infrastructure/building-infrastructure.component';
import { JsonRiskService } from './services/json-risk/json-risk.service';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ProjectsComponent,
    HeaderComponent,
    MenuComponent,
    RiskComponent,
    NotificationComponent,
    RiskMenuComponent,
    UserSettingsComponent,
    IntegerInputDirective,
    DecimalInputDirective,
    StringInputDirective,
    RampFilterPipe,
    StepsSortPipe,
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
    NotifierModule.withConfig({
        position: { horizontal: { position: 'right', } },
        behaviour: { autoHide: 3000, },
      })
  ],
  providers: [
    MainService,
    HttpManagerService,
    WebsocketService,
    ProjectService,
    RiskScenarioService,
    IdGeneratorService,
    UiStateService,
    CategoryService,
    CadService,
    JsonRiskService,
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
