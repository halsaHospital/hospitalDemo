import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import getRelatedAccounts from '@salesforce/apex/DoctorPatientController.getRelatedAccounts';

export default class DoctorPatientTree extends NavigationMixin(LightningElement) {
    @api recordId;
    @track items = [];
    @track error;
    @track recordType = '';

    @wire(getRelatedAccounts, { accountId: '$recordId' })
    wiredRelated({ error, data }) {
        if (data) {
            this.recordType = data.recordType;
            const relatedItems = data.relatedList;

            let treeLabel = 'Related Records';
            if (this.recordType === 'Doctors') {
                treeLabel = 'Related Patients Records';
            } else if (this.recordType === 'Patients') {
                treeLabel = 'Related Doctors Records';
            }

            this.items = [{
                label: treeLabel,
                name: 'root',
                expanded: true,
                items: relatedItems
            }];
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.items = [];
        }
    }

    get headerLabel() {
        if (this.recordType === 'Doctors') return 'Doctors Record Page';
        if (this.recordType === 'Patients') return 'Patients Record Page';
        return 'Record Page';
    }

    get errorMessage() {
        if (!this.error) return '';
        if (this.error.body && this.error.body.message) {
            return this.error.body.message;
        }
        return this.error.message || this.error;
    }
    handleSelect(event) {
        const selectedId = event.detail.name;

        if (selectedId === 'root') {
            return;
        }

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: selectedId,
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }
}