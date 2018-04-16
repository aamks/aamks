import { UiStateService } from '../../../services/ui-state/ui-state.service';
import { UiState } from '../../../services/ui-state/ui-state';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fds-menu',
  templateUrl: './fds-menu.component.html',
  styleUrls: ['./fds-menu.component.scss']
})
export class FdsMenuComponent implements OnInit {

  uiState: UiState;

  constructor(private uiStateService: UiStateService) { }

  ngOnInit() {
    // Sync services
    this.uiStateService.getUiState().subscribe(uiState => this.uiState = uiState);
  }

  // Toggle open or close menu main items
  toggleMenu(menuItem: string) {
    this.uiState.fdsMenu[menuItem] = !this.uiState.fdsMenu[menuItem];
  }

  activate(option: string) {
    this.uiState.active = option;
  }


}
