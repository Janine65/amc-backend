import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { last } from 'rxjs/operators';
import { AccountService, AlertService } from '@app/service';
import { AlertType } from '@app/models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  loading = false;
  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    return
  }

  async onReset(f: NgForm) {
    // reset alerts on submit
    this.alertService.clear();

    if (f.value['email'] == '') {
      this.alertService.alert({ autoClose: false, fade: false, type: AlertType.Error, message: 'Email nicht ausgefüllt', keepAfterRouteChange: false });
      return;
    }

    this.submitted = true;
    this.loading = true;
    this.accountService.newPasswort(f.value['email'])
      .pipe(last())
      .subscribe({
        next: async () => {
          // get return url from query parameters or default to home page
          this.alertService.alert({ autoClose: false, fade: false, type: AlertType.Success, message: 'Mail gesendet mit neuem Passwort', keepAfterRouteChange: false });
          await this.router.navigateByUrl('/');
        }
      })
  }

  onSubmit(f: NgForm) {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (f.invalid) {
      this.alertService.alert({ autoClose: false, fade: false, type: AlertType.Error, message: 'Formular nicht korrekt ausgefüllt', keepAfterRouteChange: false });
      return;
    }

    this.loading = true;

    this.accountService.login(f.value['email'], f.value['password'])
      .pipe(last())
      .subscribe({
        next: async () => {
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          console.log(returnUrl)
          await this.router.navigateByUrl(returnUrl);
          window.location.reload();
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
}
