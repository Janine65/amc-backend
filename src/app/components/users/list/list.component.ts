/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit } from '@angular/core';
import { TableData, TableOptions, TableToolbar } from '@app/components/shared/basetable/basetable.component';
import { User } from '@app/models';
import { AccountService } from '@app/service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { AddEditComponent } from '../add-edit/add-edit.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class ListComponent implements OnInit {
  userList: User[] = [];
  loading = true;
  subs!: Subscription;

  dialogRef?: DynamicDialogRef;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];

  constructor(
    private accountService: AccountService, 
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService) { }

  ngOnInit(): void {

    this.cols = [
      { field: 'id', header: 'ID', format: false, sortable: false, filtering: false, filter: '', pipe: DecimalPipe, args: '1.0-0' },
      { field: 'name', header: 'Name', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'email', header: 'Email', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'role', header: 'Rolle', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'last_login', header: 'Letzter Login', format: false, sortable: true, filtering: true, filter: 'text' },
    ];

    this.toolbar = [
      { label: "Ändern", btnClass: "p-button-primary p-button-outlined", icon: "pi pi-user-edit", 
        isDefault: true, disabledWhenEmpty: true,  disabledNoSelection: true, clickfnc: this.editUser, roleNeeded: '', isEditFunc: true },
      { label: "Register", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-user-plus", 
        isDefault: false, disabledWhenEmpty: false, disabledNoSelection: false, clickfnc: this.addUser, roleNeeded: '', isEditFunc: false },
      { label: "Löschen", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-user-minus", 
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.delUser, roleNeeded: '', isEditFunc: false },
    ];

    this.accountService.getAll()
      .subscribe((list) => {
          console.log('got value ' + list);
          this.userList = list;
          this.loading = false;
        });
    }

    addUser = () => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const thisRef: ListComponent = this;
      console.log("Register User");
      const newUser = new User();
      newUser.role = 'user'
  
      thisRef.dialogRef = thisRef.dialogService.open(AddEditComponent, {
        data: {
          user: newUser,
          withRole: true,
          withPwd: false
        },
        header: 'Neuen Benutzer registrieren',
        width: '70%',
        height: '70%',
        resizable: true, 
        modal: true, 
        maximizable: true, 
        draggable: true
      });
      thisRef.dialogRef.onClose.subscribe((user: User) => {
        if (user) {
          this.userList.push(user)
          console.log(user)
        }
      });
    }

    editUser = (selRec?: TableData | undefined) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const thisRef: ListComponent = this;
      console.log("Benutzer anpassen", selRec);
      const newUser = structuredClone(selRec);
  
      thisRef.dialogRef = thisRef.dialogService.open(AddEditComponent, {
        data: {
          user: newUser,
          withRole: true,
          withPwd: false
        },
        header: 'User ändern',
        width: '70%',
        height: '70%',
        resizable: true, 
        modal: true, 
        maximizable: true, 
        draggable: true
      });
      thisRef.dialogRef.onClose.subscribe((user: User) => {
        if (user) {
          // update List
          thisRef.userList = thisRef.userList.map(obj => [user].find(o => o.id === obj.id) || obj);
          console.log(user)
        }
      });
    }    

    delUser = (selRec?: TableData) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const thisRef: ListComponent = this;
      console.log("Delete User");
      thisRef.confirmationService.confirm({
        message: 'Bist Du sicher, dass du diesen Benutzer löschen willst?',
        accept: () => {
            thisRef.accountService.delete((selRec as User).id || -1).subscribe(
              {next: () => {
                thisRef.userList.splice(thisRef.userList.indexOf((selRec as User)),1)
                thisRef.messageService.add({summary: "User löschen", detail: "Der User wurde gelöscht", severity: "info", sticky: false})
              }}
            )
          }
      });      
    }

}
