import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DataEditor } from 'src/app/services/data-editor.service';
import { CommonToasterService } from 'src/app/services/common-toaster.service';

@Component({
  selector: 'app-workflowrule',
  templateUrl: './workflowrule.component.html',
  styleUrls: ['./workflowrule.component.scss']
})
export class WorkflowruleComponent implements OnInit {
  workFlowModuleList: any[] = [];
  workFlowList: any[] = [];
  workFlowSelected: any;

  constructor(
    private commonToasterService: CommonToasterService,
    private route: Router, 
    private apiService: ApiService, 
    private dataService: DataEditor) { }

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
    this.route.navigate(['settings/preference/addWorkflow']);
  }

  deleteWorkFlowItems(workdata: any) {
    this.apiService.deleteWorkFlowItem(workdata.uuid).subscribe((res: any) => {
      if (res.status) {
        this.commonToasterService.showInfo("Deleted", "Sucessfully deleted work flow rule");
        this.getWorkFlowList();
      }
    })
  }

  setWorkDetail(work) {
    this.dataService.sendData(work)
    this.route.navigate(['settings/preference/detailprefernce']);

  }
  
  editworkflow(work) {
    this.dataService.sendData(work);
    this.route.navigate(['settings/preference//editreference'])
  }
}
