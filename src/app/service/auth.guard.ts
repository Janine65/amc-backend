import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AccountService, AlertService } from '@app/service';
import { AlertType } from '@model/alert';

@Injectable({ providedIn: 'root'})
export class AuthGuard  {
    constructor(
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const user = this.accountService.userValue;
        if (user && user.role && user.role != '') {
            // authorised so return true
            console.log(user, route.data)
            return this.checkPermission(route.data['role']);
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
    async checkPermission(permission?: string) {
        if (permission) {
            if (this.accountService.userValue) {
                if (this.accountService.userValue.role === permission || this.accountService.userValue.role === 'admin')
                    return true;
                else {
                    await this.router.navigateByUrl('/');
                    this.alertService.alert({ autoClose: true, fade: false, type: AlertType.Error, message: 'Keine Berechtigung für diesen Task', keepAfterRouteChange: false });
                    return false;
                }
            } else {
                return false;
            }
        }

        return true;
    }
}