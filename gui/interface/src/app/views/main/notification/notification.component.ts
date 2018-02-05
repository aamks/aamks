import { Component, OnInit } from '@angular/core';
import { HttpManagerService } from '../../../services/http-manager/http-manager.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  constructor(private httpManagerService:HttpManagerService) { }

  ngOnInit() {
  }

}
