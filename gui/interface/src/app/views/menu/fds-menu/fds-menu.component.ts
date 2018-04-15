import { UiStateService } from '../../../services/ui-state/ui-state.service';
import { MainService } from '../../../services/main/main.service';
import { UiState } from '../../../services/ui-state/ui-state';
import { Main } from '../../../services/main/main';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fds-menu',
  templateUrl: './fds-menu.component.html',
  styleUrls: ['./fds-menu.component.scss']
})
export class FdsMenuComponent implements OnInit {

  main: Main;
  uiState: UiState;

  constructor(private mainService: MainService, private uiStateService: UiStateService) { }

  ngOnInit() {
    // Sync services
    this.mainService.getMain().subscribe(main => this.main = main);
    this.uiStateService.getUiState().subscribe(uiState => this.uiState = uiState);
  }

  // Toggle open or close menu main items
  toggleMenu(menuItem: string) {
    this.uiState.fdsMenu[menuItem] = !this.uiState.fdsMenu[menuItem];
  }

  activate(option: string) {
    this.uiState.fdsActive = option;
  }


}
