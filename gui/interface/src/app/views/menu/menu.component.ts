import { Component, OnInit } from '@angular/core';
import { MainService } from '../../services/main/main.service';
import { Main } from '../../services/main/main';
import { UiState } from '../../services/ui-state/ui-state';
import { UiStateService } from '../../services/ui-state/ui-state.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  main:Main;
  uiState:UiState;

  constructor(private mainService:MainService, private uiStateService:UiStateService) { }

  ngOnInit() {
    // Sync services
    this.mainService.getMain().subscribe(main => this.main = main);
    this.uiStateService.getUiState().subscribe(uiState => this.uiState = uiState);
  }

  activate(option: string) {
    this.uiState.active = option;
  }

}
