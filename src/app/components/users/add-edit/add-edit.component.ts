import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { User } from '@app/models';
import { AccountService } from '@app/service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
  providers: [ConfirmationService]
})
export class AddEditComponent {
  user! : User
  withRole = false
  wihtPwd = true
  subs! : Subscription
  
  constructor(
    private accountService: AccountService, 
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig,
    private messageService: MessageService,
    private confirmationService: ConfirmationService) {
      if (config.data) {
        this.wihtPwd = config.data.withPwd;
        this.withRole = config.data.withRole;    
        if (config.data.user) {
          this.user = config.data.user;
        } else {
          this.user = accountService.userValue;
        }
      }
  }

  back(f: NgForm) {
    if (f.dirty) {
      this.confirmationService.confirm({
        message: 'Du hast noch nicht-gespeicherte Veränderungen. Bist Du sicher, dass du diese verlieren willst?',
        accept: () => {
          this.accountService.getById(this.user.id || -1)
          .subscribe(
            {next: (user) => {
              this.user = user
              this.ref.close();
              }
            })
          }
      });      

    } else {
      this.ref.close();
    }
  }

  newPwd(f: NgForm) {
    if (f.dirty) {
      this.messageService.add({
        detail: 'Du hast noch nicht-gespeicherte Veränderungen. Bitte diese zuerst speichern oder zurück und nochmals öffnen.',
        icon: 'pi pi-exclamation-triangle',
        closable: true,
        severity: 'error',
        sticky: true
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Für den User ' + this.user.name + ' wird ein neues Passwort gesetzt. Bist Du dir da sicher?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.accountService.newPasswort(this.user.email || '')
        .subscribe(
          {next: () => {
            this.ref.close();
            }
          })
        }
    });      

  }

  save(f: NgForm) {
    if (f.invalid) {
      this.messageService.add({detail: 'Die Daten sind noch nicht korrekt und können nicht gespeichert werden', closable: true, severity: 'error', summary: 'User speichern' } );
      return;
    }

    if (this.wihtPwd) {
      if (f.value['password'] !== f.value['passwordV']) {
        this.messageService.add({detail: 'Die Passwörter sind identisch', closable: true, severity: 'error', summary: 'User speichern' } );
        return;
      }
      this.user.password = f.value['password'];
    }

    if (this.user.id == undefined || this.user.id < 0) {
       // neuer user
       this.accountService.register(this.user).subscribe(
        {next: (newUser) => {
          this.ref.close(newUser)
        }}
      )
    } else {
      this.accountService.update(this.user.id || -1, this.user).subscribe(
        {next: () => {
          this.ref.close(this.user)
        }}
      )
    }

    this.ref.close(this.user);
  }

}
