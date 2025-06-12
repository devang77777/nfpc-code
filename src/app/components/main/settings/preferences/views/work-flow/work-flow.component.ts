import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';

@Component({
  selector: 'app-work-flow',
  templateUrl: './work-flow.component.html',
  styleUrls: ['./work-flow.component.scss']
})
export class WorkFlowComponent implements OnInit {

  workFlowModuleList: any[] = [];
  workFlowList: any[] = [];
  workFlowSelected: any;

  constructor(private router: Router, private apiService: ApiService, private dataService: DataEditor) { }

  ngOnInit(): void {
    this.getWorkFlowList();
    this.getWorkFlowModuleList();
  }

  getWorkFlowModuleList() {
    this.workFlowModuleList = [];
    this.apiService.getWorkFlowModuleList().subscribe((res: any) => {
      if (res.status) {
        this.workFlowModuleList = res.data;
      }
    });
  }

  getWorkFlowList() {
    this.workFlowList = [];
    this.apiService.getWorkFlowList().subscribe((res: any) => {
      if (res.status) {
        this.workFlowList = res.data;
      }
    });
  }

  open() {

    this.router.navigateByUrl('settings/preference/add');
  }

  deleteWorkFlowItems(workdata: any) {
    this.apiService.deleteWorkFlowItem(workdata.uuid).subscribe((res: any) => {
      if (res.status) {
        //console.log("deleted work flow: ", res);
        this.getWorkFlowList();
      }
    })
  }

  setWorkDetail(work) {

    this.dataService.sendData(work)
    this.router.navigate(['settings/preference/detail']);

  }
  editworkflow(work) {
    this.dataService.sendData(work);
    this.router.navigate(['settings/preference/edit'])
  }

}
