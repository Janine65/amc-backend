import { Component, OnInit } from '@angular/core';
import { from, Subscription } from 'rxjs';
import { BackendService } from 'src/app/service/backend.service';
import { Adresse } from 'src/app/service/datatypes';

@Component({
  selector: 'app-adressen',
  templateUrl: './adressen.component.html',
  styles: [
  ]
})
export class AdressenComponent implements OnInit {

  adressList : Adresse[] = [];
  loading = true;
  subs!: Subscription;

  constructor(private backendService: BackendService) {}
  ngOnInit(): void {
  
    this.subs = from(this.backendService.getAdressenData())
      .subscribe(list => {
        this.adressList = list;
        this.loading = false;
      });
    
  }

}
