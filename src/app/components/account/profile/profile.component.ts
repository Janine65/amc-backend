import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/service';
import { DialogService } from 'primeng/dynamicdialog';
import { AddEditComponent } from '../../users/add-edit/add-edit.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [DialogService]
})
export class ProfileComponent implements OnInit {
  constructor(
    private accountService: AccountService, 
    private router: Router,
    private dialogService: DialogService) { }

     ngOnInit(): void {
      const dialogRef = this.dialogService.open(AddEditComponent, {
        data: {
          user: this.accountService.userValue,
          withRole: false,
          withPwd: true
        },
        header: 'User ändern',
        width: '70%',
        height: '70%',
        resizable: true, 
        modal: true, 
        maximizable: true, 
        draggable: true
      });
      dialogRef.onClose.subscribe(() => {
        this.router.navigate(['/']);
      });      
     }
}
