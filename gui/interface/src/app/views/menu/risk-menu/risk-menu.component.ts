import { UiState } from '../../../services/ui-state/ui-state';
import { Component, OnInit } from '@angular/core';
import { UiStateService } from '../../../services/ui-state/ui-state.service';

@Component({
  selector: 'app-risk-menu',
  templateUrl: './risk-menu.component.html',
  styleUrls: ['./risk-menu.component.scss']
})
export class RiskMenuComponent implements OnInit {

  uiState: UiState;

  constructor(private uiStateService: UiStateService) { }

  ngOnInit() {
    // Sync services
    this.uiStateService.getUiState().subscribe(uiState => this.uiState = uiState);
  }

  // Toggle open or close menu main items
  toggleMenu(menuItem: string) {
    this.uiState.riskMenu[menuItem] = !this.uiState.riskMenu[menuItem];
  }

  activate(option: string) {
    this.uiState.active = option;
  }
}
