import {Component, Input, OnInit} from '@angular/core';
import {Status} from "./status.enum";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  @Input()
  message: string = "";

  @Input()
  status: string = "sent";

  constructor() { }

  ngOnInit(): void {
  }

}
