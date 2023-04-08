import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, NgForm } from '@angular/forms';
import { first } from 'rxjs/operators';
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
  onSubmit(f: NgForm) {
      this.submitted = true;

      // reset alerts on submit
      this.alertService.clear();

      // stop here if form is invalid
      if (f.invalid) {
        this.alertService.alert({autoClose: false, fade: false, type: AlertType.Error, message:'Formular nicht korrekt ausgefüllt', keepAfterRouteChange: false});
        return;
      }
  
      this.loading = true;
      
      this.accountService.login(f.value['email'],f.value['password'])
          .pipe(first())
          .subscribe({
              next: () => {
                  // get return url from query parameters or default to home page
                  const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                  console.log(returnUrl)
                  this.router.navigateByUrl(returnUrl);
              },
              error: error => {
                  this.alertService.error(error);
                  this.loading = false;
              }
          });
  }
}
