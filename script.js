// =====================================
// GREENHARVEST ERP SIMULATION
// Purchase-to-Pay Workflow
// =====================================

// HTML element selector
const $ = id => document.getElementById(id);

// Currency formatter
const cash = n =>
    n == null
        ? '—'
        : 'KES ' + Number(n).toLocaleString('en-KE');

// Initial application state
let s = {
    scenario: 'normal',
    stage: 0,
    received: 0,
    invoice: null,
    blocked: false,
    paid: false,
    logs: []
};

// Available demonstration scenarios
const scenarios = {
    normal: {
        id: '001',
        qty: 100,
        invoice: 120000
    },

    mismatch: {
        id: '002',
        qty: 100,
        invoice: 132000
    },

    partial: {
        id: '003',
        qty: 80,
        invoice: 120000
    }
};

// =====================================
// AUDIT LOG
// =====================================

function log(title, detail) {

    s.logs.unshift({
        title,
        detail,
        time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    });

}

// =====================================
// RESET THE SIMULATION
// =====================================

function reset(which = s.scenario) {

    s = {
        scenario: which,
        stage: 0,
        received: 0,
        invoice: null,
        blocked: false,
        paid: false,
        logs: []
    };

    $('tx').textContent =
        'GH-PO-2026-' + scenarios[which].id;

    // Highlight selected scenario
    document.querySelectorAll('[data-s]').forEach(button => {

        button.classList.toggle(
            'selected',
            button.dataset.s === which
        );

    });

    log(
        'Demo transaction initialized',
        'System · Requisition created'
    );

    render();

}

// =====================================
// WORKFLOW STAGE NAMES
// =====================================

const names = [
    'Purchase requisition created',
    'Purchase order approved',
    'Goods receipt recorded',
    'Supplier invoice checked',
    'Payment decision'
];

// =====================================
// UPDATE THE DASHBOARD
// =====================================

function render() {

    let d = scenarios[s.scenario];

    let variance =
        s.invoice === null
            ? null
            : s.invoice - 120000;

    // Current workflow stage
    $('stageNo').textContent =
        'STEP ' + (s.stage + 1) + ' OF 5';

    $('stageTitle').textContent =
        names[s.stage];

    // Stage descriptions
    const desc = [

        'The storekeeper requests 100 bags of fertilizer for the Embu collection centre.',

        'The procurement officer approves the request and creates a purchase order for KES 120,000.',

        'The warehouse records the physical delivery and updates inventory.',

        'Finance compares the purchase order, goods receipt and supplier invoice.',

        'The finance manager reviews the control result and decides whether payment can be released.'

    ];

    $('description').textContent =
        desc[s.stage];

    // Stage details
    let vals = [

        ['Requested quantity', '100 bags'],
        ['Estimated value', 'KES 120,000'],
        ['Department', 'Stores']

    ];

    if (s.stage === 1) {

        vals = [

            ['PO reference', 'GH-PO-2026-' + d.id],
            ['Order quantity', '100 bags'],
            ['PO value', 'KES 120,000']

        ];

    }

    if (s.stage === 2) {

        vals = [

            ['Ordered', '100 bags'],
            ['Received', s.received + ' bags'],
            [
                'Delivery',
                s.received === 100
                    ? 'Complete'
                    : 'Partial'
            ]

        ];

    }

    if (s.stage >= 3) {

        vals = [

            ['PO value', cash(120000)],
            ['Invoice value', cash(s.invoice)],
            ['Goods received', s.received + ' bags']

        ];

    }

    if (s.stage === 4) {

        vals = [

            ['Supplier', 'Umoja Farm Supplies'],
            ['Invoice amount', cash(s.invoice)],
            [
                'Payment',
                s.blocked
                    ? 'On hold'
                    : s.paid
                        ? 'Released'
                        : 'Eligible'
            ]

        ];

    }

    $('details').innerHTML = vals.map(v =>

        '<div>' +
            '<small>' + v[0] + '</small>' +
            '<b>' + v[1] + '</b>' +
        '</div>'

    ).join('');

    // =================================
    // CONTROL MESSAGES
    // =================================

    let note =
        'CONTROL POINT — ' +
        [

            'Every purchase begins with an authorized requisition and documented business need.',

            'The purchase order records the supplier, agreed quantity and price. Approval should be separate from requesting.',

            'The warehouse receipt is evidence that goods arrived and updates inventory.',

            'The ERP checks purchase order, goods receipt and invoice before payment.',

            'Payment must only be released after all required checks and approvals.'

        ][s.stage];

    if (s.blocked) {

        note =
            'EXCEPTION — Payment is blocked. Investigate the discrepancy and obtain approved supporting documents before any payment.';

    } else if (
        s.stage === 3 &&
        s.scenario === 'normal'
    ) {

        note =
            'MATCH PASSED — PO, goods receipt and invoice agree. The invoice can proceed to payment approval.';

    }

    $('alert').textContent = note;

    $('alert').className =
        'notice ' +
        (
            s.blocked
                ? 'bad'
                : s.stage === 4 || s.stage === 3
                    ? 'good'
                    : ''
        );

    // =================================
    // WORKFLOW PROGRESS INDICATORS
    // =================================

    document.querySelectorAll('.step').forEach((el, i) => {

        el.classList.toggle(
            'done',
            i < s.stage
        );

        el.classList.toggle(
            'current',
            i === s.stage
        );

    });

    // Transaction status
    $('status').textContent =
        s.blocked
            ? 'Exception held'
            : s.paid
                ? 'Completed'
                : s.stage
                    ? 'In progress'
                    : 'Not started';

    $('status').style.background =
        s.blocked
            ? '#fcebea'
            : s.paid
                ? '#e8f5ed'
                : '#f0f2f1';

    // =================================
    // NEXT ACTION BUTTON
    // =================================

    $('next').disabled =
        s.blocked || s.paid;

    $('next').textContent =
        s.stage === 0
            ? 'Approve requisition & create PO →'
            : s.stage === 1
                ? 'Record goods received →'
                : s.stage === 2
                    ? 'Submit supplier invoice →'
                    : s.stage === 3
                        ? 'Run three-way match →'
                        : 'Authorize payment →';

    $('progress').textContent =
        (s.paid ? 5 : s.stage) +
        ' of 5 stages completed';

    // =================================
    // DASHBOARD INDICATORS
    // =================================

    $('goodsKpi').textContent =
        s.received + ' / 100 bags';

    $('goodsSub').textContent =
        s.received === 100
            ? 'Full delivery recorded'
            : s.received
                ? 'Partial delivery recorded'
                : 'Awaiting receipt';

    $('invoiceKpi').textContent =
        s.invoice === null
            ? 'Not submitted'
            : s.blocked
                ? 'On hold'
                : 'Matched';

    $('paymentKpi').textContent =
        s.paid
            ? 'Released'
            : s.blocked
                ? 'Blocked'
                : 'Not released';

    // =================================
    // FINANCIAL SUMMARY
    // =================================

    $('sumInvoice').textContent =
        cash(s.invoice);

    $('variance').textContent =
        variance === null
            ? '—'
            : (variance > 0 ? '+' : '') + cash(variance);

    $('eligible').textContent =
        s.paid
            ? cash(s.invoice)
            : 'KES 0';

    $('match').textContent =
        s.paid
            ? 'Passed'
            : s.blocked
                ? 'Exception'
                : s.invoice
                    ? 'Pending review'
                    : 'Pending';

    $('meter').style.width =
        (
            s.paid
                ? 100
                : s.blocked
                    ? 55
                    : s.invoice
                        ? 85
                        : s.received
                            ? 60
                            : s.stage
                                ? 30
                                : 0
        ) + '%';

    // =================================
    // TRANSACTION RECORDS
    // =================================

    let rows = [

        [
            'Purchase requisition',
            'GH-REQ-001',
            '100 bags',
            'Created',
            'ok'
        ],

        [
            'Purchase order',
            s.stage >= 1
                ? 'GH-PO-2026-' + d.id
                : 'Pending',
            cash(120000),
            s.stage >= 1
                ? 'Approved'
                : 'Pending',
            s.stage >= 1
                ? 'ok'
                : 'pending'
        ],

        [
            'Goods receipt',
            s.received
                ? 'GH-GR-001'
                : 'Pending',
            s.received + ' bags',
            s.received === 100
                ? 'Received'
                : s.received
                    ? 'Partial'
                    : 'Pending',
            s.received === 100
                ? 'ok'
                : s.received
                    ? 'warn'
                    : 'pending'
        ],

        [
            'Supplier invoice',
            s.invoice
                ? 'GH-INV-001'
                : 'Pending',
            cash(s.invoice),
            s.invoice
                ? (s.blocked ? 'On hold' : 'Matched')
                : 'Pending',
            s.blocked
                ? 'bad'
                : s.invoice
                    ? 'ok'
                    : 'pending'
        ],

        [
            'Payment voucher',
            s.paid
                ? 'GH-PV-001'
                : 'Pending',
            s.paid
                ? cash(s.invoice)
                : '—',
            s.paid
                ? 'Released'
                : s.blocked
                    ? 'Blocked'
                    : 'Pending',
            s.paid
                ? 'ok'
                : s.blocked
                    ? 'bad'
                    : 'pending'
        ]

    ];

    $('records').innerHTML = rows.map(r =>

        '<tr>' +
            '<td>' + r[0] + '</td>' +
            '<td>' + r[1] + '</td>' +
            '<td>' + r[2] + '</td>' +
            '<td>' +
                '<span class="tag ' +
                (r[4] === 'ok' ? '' : r[4]) +
                '">' + r[3] + '</span>' +
            '</td>' +
        '</tr>'

    ).join('');

    // =================================
    // AUDIT LOG DISPLAY
    // =================================

    $('audit').innerHTML = s.logs.map(x =>

        '<div class="entry">' +
            '<i></i>' +
            '<div>' +
                '<b>' + x.title + '</b>' +
                '<small>' + x.detail + '</small>' +
            '</div>' +
            '<time>' + x.time + '</time>' +
        '</div>'

    ).join('');

}

// =====================================
// PROCESS THE NEXT WORKFLOW STAGE
// =====================================

function next() {

    if (s.blocked || s.paid) {
        return;
    }

    let role = $('role').value;

    // STEP 1: APPROVE REQUISITION
    if (s.stage === 0) {

        if (
            !['Procurement Officer', 'Department Manager']
            .includes(role)
        ) {

            alert(
                'Select Procurement Officer or Department Manager for this approval.'
            );

            return;
        }

        s.stage = 1;

        log(
            'Requisition approved · PO created',
            role + ' · Purchase order GH-PO created'
        );

    }

    // STEP 2: RECEIVE GOODS
    else if (s.stage === 1) {

        if (role !== 'Warehouse Officer') {

            alert(
                'Select Warehouse Officer to record goods receipt.'
            );

            return;
        }

        s.received =
            scenarios[s.scenario].qty;

        s.stage = 2;

        log(
            'Goods receipt recorded',
            role + ' · ' + s.received + ' of 100 bags received'
        );

    }

    // STEP 3: SUBMIT INVOICE
    else if (s.stage === 2) {

        if (role !== 'Finance Officer') {

            alert(
                'Select Finance Officer to submit the supplier invoice.'
            );

            return;
        }

        s.invoice =
            scenarios[s.scenario].invoice;

        s.stage = 3;

        log(
            'Supplier invoice submitted',
            role + ' · Invoice ' + cash(s.invoice)
        );

    }

    // STEP 4: THREE-WAY MATCHING
    else if (s.stage === 3) {

        if (role !== 'Finance Officer') {

            alert(
                'Select Finance Officer to perform invoice matching.'
            );

            return;
        }

        if (
            s.received !== 100 ||
            s.invoice !== 120000
        ) {

            s.blocked = true;
            s.stage = 4;

            let why =
                s.received !== 100
                    ? 'Quantity mismatch: only ' +
                      s.received + ' of 100 bags received.'
                    : 'Price mismatch: invoice exceeds PO by ' +
                      cash(s.invoice - 120000) + '.';

            log(
                'Three-way match failed · Payment held',
                role + ' · ' + why
            );

        } else {

            s.stage = 4;

            log(
                'Three-way match passed',
                role + ' · PO, receipt and invoice agree'
            );

        }

    }

    // STEP 5: AUTHORIZE PAYMENT
    else if (s.stage === 4) {

        if (role !== 'Finance Manager') {

            alert(
                'Select Finance Manager to authorize payment.'
            );

            return;
        }

        s.paid = true;

        log(
            'Payment authorized',
            role + ' · Payment voucher released for ' +
            cash(s.invoice)
        );

    }

    render();

}

// =====================================
// EVENT LISTENERS
// =====================================

// Next workflow stage
$('next').addEventListener(
    'click',
    next
);

// Reset button
$('reset').addEventListener(
    'click',
    () => reset()
);

// Scenario selection buttons
document.querySelectorAll('[data-s]').forEach(button => {

    button.addEventListener(
        'click',
        () => reset(button.dataset.s)
    );

});

// Initialize the application
reset('normal');
