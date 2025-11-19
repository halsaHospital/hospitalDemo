public with sharing class DoctorPatientController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getRelatedAccounts(Id accountId) {
        Account acc = [
            SELECT Id, RecordType.Name
            FROM Account
            WHERE Id = :accountId
            LIMIT 1
        ];
        
        List<Map<String, Object>> relatedList = new List<Map<String, Object>>();
        
        if (acc.RecordType.Name == 'Doctors') {
            for (Opportunity rel : [
                SELECT Id, Name, Attending_Doctor__c
                FROM Opportunity
                WHERE Attending_Doctor__c = :accountId
            ]) {
                Map<String, Object> node = new Map<String, Object>();
                node.put('label', rel.Name);
                node.put('name', rel.Id);
                node.put('expanded', false);
                relatedList.add(node);
            }
            for (Account rel : [
                SELECT Id, Name, Doctor__c
                FROM Account
                WHERE Doctor__c = :accountId
            ]) {
                Map<String, Object> node = new Map<String, Object>();
                node.put('label', rel.Name);
                node.put('name', rel.Id);
                node.put('expanded', false);
                relatedList.add(node);
            }
        } else if (acc.RecordType.Name == 'Patients') {
            for (Opportunity rel : [
                SELECT Attending_Doctor__c, Attending_Doctor__r.Name
                FROM Opportunity
                WHERE AccountId = :accountId
            ]) {
                Map<String, Object> node = new Map<String, Object>();
                node.put('label', rel.Attending_Doctor__r.Name);
                node.put('name', rel.Attending_Doctor__c);
                node.put('expanded', false);
                relatedList.add(node);
            }
        } else {
            Map<String, Object> node = new Map<String, Object>();
            node.put('label', 'Account record type must be Doctor or Patient');
            node.put('name', acc.Id);
            node.put('expanded', false);
            relatedList.add(node);
        }
        
        return new Map<String, Object>{
            'recordType' => acc.RecordType.Name,
                'relatedList' => relatedList
                };
                    }
    
}