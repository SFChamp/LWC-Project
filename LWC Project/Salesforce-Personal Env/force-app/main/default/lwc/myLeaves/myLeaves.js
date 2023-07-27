import { LightningElement,wire } from 'lwc';
import getMyLeaves from '@salesforce/apex/leaveRequestController.getMyLeaves';
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
export default class MyLeaves extends LightningElement {
    columns = COLUMNS;
    myLeaves = [];
    myLeavesWireResult;
    showModalPopup = false;
    recordId = '';
    currentUserId = Id;

    @wire(getMyLeaves)
    wiredMyLeaves(result){
        this.myLeavesWireResult = result;
        if(result.data){
            this.myLeaves = result.data.map(a=> ({
                ...a,
                cellClass: a.Status__c == 'Approved' ? 'slds-theme_success' : a.Status__c == 'Rejected' ? 'slds-theme_warning' : '',
                isEditDisabled : a.Status__c != 'Pending'
            }));
        }
        if(result.error){
            console.log('Error Occured While Fetching data', result.error);
        }
    }

    get noRecordsFound(){
        return this.myLeaves.length == 0;
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
        refreshApex(this.myLeavesWireResult);
    }
    submitHandler(event){
        event.preventDefault();
        const field = {...event.detail.fields };
        field.Status__c = 'Pending';
        if(new Date(field.From_Date__c) > new Date(field.To_Date__c)){
            this.showToast('From Date Should not be greater than to date','error','error'); 
        }else if(new Date > new Date(field.From_Date__c)){
            this.showToast('From Date Should not be less than today','error','error'); 
        }else{
            this.refs.leaveRequestFrom.submit(field);
        }
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