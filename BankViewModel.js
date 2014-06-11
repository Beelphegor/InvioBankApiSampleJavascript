var BankViewModel = function (apiClient) {

    var date = ko.observable(moment().format('YYYY-MM-DD'));
    var payments = ko.observableArray();
    var paymentsProcessed = ko.observableArray();
    var remittances = ko.observableArray();
    var remittancesProcessed = ko.observableArray();
    var pendingAccounts = ko.observableArray();

    var getPendingAccounts = function () {
        pendingAccounts.removeAll();
        apiClient.PendingAccounts.GetAll()
            .then(function (response) {
                $.each(response.approvalRequests, function (index, r) {
                    r = $.extend({}, r, {
                        processing: ko.observable(false),
                    });
                    pendingAccounts.push(r);
                });
            });
    };

    getPendingAccounts();

    var approvedAccounts = function(pendingAccount) {
        var reference = prompt("Transaction Reference #");
        apiClient.PendingAccounts.ApprovedAcounts(pendingAccount.bankAccount.id, reference).done(getPendingAccounts);
    };

    var denyAccounts = function (pendingAccount) {
        var reference = prompt("Transaction Reference #");
        var reason = prompt("Reason for failure");
        apiClient.PendingAccounts.DenialAccount(pendingAccount.bankAccount.id, reason, reference).done(getPendingAccounts);
    };

    var getRemittances = function () {
        remittances.removeAll();
        apiClient.Remittances.GetAll()
            .then(function (response) {
                $.each(response.remittances, function (index, r) {
                    r = $.extend({}, r, {
                        processing: ko.observable(false),
                    });
                    remittances.push(r);
                });
            });
    };

    getRemittances();

    var getPayments = function (thisDate) {
        payments.removeAll();
        apiClient.Payments.GetAllForDate(thisDate)
            .then(function (response) {
                $.each(response.payments, function (index, p) {
                    p = $.extend({}, p, {
                        processing: ko.observable(false),
                        paymentDateFormatted: moment(p.paymentDate).format('YYYY-MM-DD')
                    });
                    payments.push(p);
                });
            });
    };

    getPayments(date());

    date.subscribe(function (newVal) {
        getPayments(newVal);
    });

    var processPayment = function (payment) {
        payment.processing(true);
        var reference = prompt("Transaction Reference #");
        var newBalance = prompt("New Account Balance");
        apiClient.Payments.ProcessPayment(payment.id, newBalance, reference).then(function () {
            payments.remove(payment);
            payment = $.extend({}, payment, { status: 'Exito', reason: '', reference: reference });
            paymentsProcessed.push(payment);
        });
    };

    var failPayment = function (payment) {
        payment.processing(true);
        var reference = prompt("Transaction Reference #");
        var reason = prompt("Reason for failure");
        apiClient.Payments.FailPayment(payment.id, reason, reference).then(function () {
            payments.remove(payment);
            payment = $.extend({}, payment, { status: 'Error', reason: reason, reference: reference });
            paymentsProcessed.push(payment);
        });
    };

    var failRemittance = function (remittance) {
        remittance.processing(true);
        var reference = prompt("Transaction Reference #");
        var reason = prompt("Reason for failure");
        apiClient.Remittances.FailRemittance(remittance.id, reason, reference).then(function () {
            remittances.remove(remittance);
            remittance = $.extend({}, remittance, { status: 'Error', reason: reason, reference: reference });
            remittancesProcessed.push(remittance);
        });
    };

    var processRemittance = function (remittance) {
        remittance.processing(true);
        var reference = prompt("Transaction Reference #");
        var newBalance = prompt("New Account Balance");
        apiClient.Remittances.ProcessRemittance(remittance.id, newBalance, reference).then(function () {
            remittances.remove(remittance);
            remittance = $.extend({}, remittance, { status: 'Exito', reason: '', reference: reference });
            remittancesProcessed.push(remittance);
        });
    };



    return {
        Date: date,
        Payments: payments,
        ProcessPayment: processPayment,
        FailPayment: failPayment,
        ProcessedPayments: paymentsProcessed,
        Remittances: remittances,
        ProcessRemittance: processRemittance,
        FailRemittance: failRemittance,
        ProcessedRemittances: remittancesProcessed,
        PendingAccounts: pendingAccounts,
        ApprovedAccounts: approvedAccounts,
        DenyAccounts: denyAccounts
    };
};
