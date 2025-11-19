import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';

import ID_FIELD from '@salesforce/schema/Opportunity.Id';
import REASON_FIELD from '@salesforce/schema/Opportunity.Choose_a_reason_for_Closed_lost__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Opportunity.Description';
import STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';

const FIELDS = [STAGE_FIELD, REASON_FIELD];

export default class ClosedLostReason extends LightningElement {
    @api recordId;
    @track reason = '';
    @track description = '';
    @track showDescription = false;
    @track isClosedLost = false;
    
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    opportunity({ data }) {
        if (data) {
            const stage = data.fields.StageName.value;
            const reasonVal = data.fields.Choose_a_reason_for_Closed_lost__c.value;
            if(stage === 'Closed Lost' && !reasonVal) {
                this.isClosedLost = true;
            }
        }
    }
    get reasonOptions() {
        return [
            { label: 'Dead on Arrival', value: 'Dead on Arrival' },
            { label: 'Referred Elsewhere', value: 'Referred Elsewhere' },
            { label: 'Patient Withdrawal', value: 'Patient Withdrawal' },
            { label: 'Other', value: 'Other' }
        ];
    }

    // Handle Reason selection
    handleReasonChange(event) {
        this.reason = event.detail.value;
        this.showDescription = this.reason === 'Other';
    }

    // Handle Description input
    handleDescriptionChange(event) {
        this.description = event.detail.value;
    }

    closeModal() {
        this.isClosedLost = false;
    }


    // Save to Opportunity
    handleSubmit() {
        // Validate
        if (this.reason === 'Other' && !this.description.trim()) {
            alert('Please provide a description for "Other".');
            return;
        }

        // Prepare fields
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[REASON_FIELD.fieldApiName] = this.reason;
        fields[DESCRIPTION_FIELD.fieldApiName] = this.description;
        this.isClosedLost = false;

        // Update record
        updateRecord({ fields })
            .then(() => {
                alert('Opportunity updated successfully!');
            })
            .catch(error => {
                console.error(error);
                alert('Error updating Opportunity: ' + error.body.message);
            });
    }
}