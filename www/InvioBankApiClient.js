var ApiClient = function() {

    var token = "52644e86-2b8f-43a7-8a42-af9065aa4014";
    var bankId = "occidente";
    
    var baseUrl = "http://inviomobileapi.apphb.com/bank/"+bankId;
    if (window.location.hostname === "localhost") {
        baseUrl = "http://localhost:38397/bank/" + bankId;
    }

    return {
        Payments: {
            GetAllForDate: function(date) {
                var start = moment(date).startOf('day').toISOString();
                var end = moment(date).endOf('day').toISOString();
                return $.get(baseUrl + "/payments/unpaid?start=" + start + "&end=" + end + "&token=" + token);
            },
            ProcessPayment: function(paymentOrderId, newAccountBalance, reference) {
                var now = moment();
                return $.post(baseUrl + "/payments/success", {
                    token: token,
                    paymentOrderId: paymentOrderId,
                    paymentDate: now.format('YYYY-MM-DD'),
                    accountBalance: newAccountBalance,
                    reference: reference
                });
            },
            FailPayment: function(paymentOrderId, reason, reference) {
                var now = moment();
                return $.post(baseUrl + "/payments/failure", {
                    token: token,
                    paymentOrderId: paymentOrderId,
                    dateOfFailure: now.format('YYYY-MM-DD'),
                    reason: reason,
                    reference: reference
                });
            }
        },
        Remittances: {
            GetAll: function() {
                return $.get(baseUrl + "/remittances/pending?token=" + token);
            },
            ProcessRemittance: function(remittanceId, newAccountBalance, reference) {
                var now = moment();
                return $.post(baseUrl + "/remittances/success", {
                    token: token,
                    remittanceId: remittanceId,
                    dateProcessed: now.format('YYYY-MM-DD'),
                    accountBalance: newAccountBalance,
                    reference: reference
                });
            },
            FailRemittance: function(remittanceId, reason, reference) {
                var now = moment();
                return $.post(baseUrl + "/remittances/failure", {
                    token: token,
                    remittanceId: remittanceId,
                    DateOfFailure: now.format('YYYY-MM-DD'),
                    reason: reason,
                    reference: reference
                });
            }
        },
        PendingAccounts: {
            GetAll: function() {
                return $.get(baseUrl + "/bankAccountApprovalRequests/pending?token=" + token);
            },
            ApprovedAcounts: function(accountId, reference) {
                return $.ajax({
                    url: baseUrl + "/bankAccountApprovalRequests/" + accountId + "/approve",
                    data: {
                        reference: reference,
                        token: token
                    },
                    type: 'PUT'
                });
            },
            DenialAccount: function(accountId, reason, reference) {
                return $.ajax({
                    url: baseUrl + "/bankAccountApprovalRequests/" + accountId + "/deny",
                    data: {
                        reason: reason,
                        reference: reference,
                        token: token
                    },
                    type: 'PUT'
                });
            },
            Details: function(approvalRequestId) {
                return $.get(baseUrl + "/bankAccountApprovalRequests/" + approvalRequestId, { token: token });
            }
        }

    };
};
