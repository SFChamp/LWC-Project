import { LightningElement,wire,api } from 'lwc';
import getLeavesRequest from '@salesforce/apex/leaveRequestController.getLeaveRequests';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    {label : 'Request Id', fieldName: 'Name', cellAttributes: {class: {fieldName: 'cellClass'} }},
    {label : 'From Date', fieldName: 'From_Date__c', cellAttributes: {class: {fieldName: 'cellClass'} }},
    {label : 'To Date', fieldName: 'To_Date__c', cellAttributes: {class: {fieldName: 'cellClass'} }},
    {label : 'Reason', fieldName: 'Reason__c', cellAttributes: {class: {fieldName: 'cellClass'} }},
    {label : 'Status', fieldName: 'Status__c', cellAttributes: {class: {fieldName: 'cellClass'} }},
    {label : 'Manager Comment', fieldName: 'Manager_Comment__c', cellAttributes: {class: {fieldName: 'cellClass'} }},
    {
        type: "button", typeAttributes: {
            label: 'Edit',
            title: 'Edit',
            name: 'Edit',
            value: 'edit',
            disabled: {fieldName: 'isEditDisabled'},
            cellAttributes: {class: {fieldName: 'cellClass'} }
        }
    }
];

export default class LeaveRequest extends LightningElement {
    columns = COLUMNS;
    LeaveRequest = [];
    myLeavesWireResult;
    showModalPopup = false;
    recordId = '';
    currentUserId = Id;

    @wire(getLeavesRequest)
    wiredMyLeaves(result){
        this.myLeavesWireResult = result;
        if(result.data){
            this.LeaveRequest = result.data.map(a=> ({
                ...a,
                userName: a.User__r.Name,
                cellClass: a.Status__c == 'Approved' ? 'slds-theme_success' : a.Status__c == 'Rejected' ? 'slds-theme_warning' : '',
                isEditDisabled : a.Status__c != 'Pending'
            }));
        }
        if(result.error){
            console.log('Error Occured While Fetching data', result.error);
        }
    }

    get noRecordsFound(){
        return this.LeaveRequest.length == 0;
    }
    rowActionHandler(event){
        this.showModalPopup = true;
        this.recordId = event.details.row.Id;
    }
    newRequestClickHandler() {
        this.showModalPopup = true;
        this.recordId = '';
    }

    modalCloseHandler(){
        this.showModalPopup = false;
    }

    successHandler(event){
        this.showModalPopup = false;
        this.showToast('Data saved successfully');
        this.refreshGrid();
    }
    @api
    refreshGrid() {
        refreshApex(this.myLeavesWireResult);
    }
    showToast(message, title = 'success', variant = 'success') {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}