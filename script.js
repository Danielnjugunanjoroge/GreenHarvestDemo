
const normalBtn = document.getElementById("normalBtn");
const errorBtn = document.getElementById("errorBtn");
const resetBtn = document.getElementById("resetBtn");

const steps = document.querySelectorAll("#steps li");

function updateLog(message) {
    const item = document.createElement("li");
    item.textContent =
        new Date().toLocaleTimeString() + " - " + message;

    document.getElementById("log").prepend(item);
}

function setResult(message, type) {
    const result = document.getElementById("result");
    result.textContent = message;
    result.className = type;
}

function resetSteps() {
    steps.forEach(step => {
        step.classList.remove("completed", "blocked");
    });
}

function runNormalTransaction() {
    resetSteps();

    steps.forEach(step => {
        step.classList.add("completed");
    });

    document.getElementById("inventory").textContent =
        "+100 fertilizer bags recorded";

    document.getElementById("payable").textContent =
        "KES 120,000 recorded";

    document.getElementById("payment").textContent =
        "Authorized in demo";

    document.getElementById("poMatch").textContent =
        "Matched";

    document.getElementById("receiptMatch").textContent =
        "100 bags received";

    document.getElementById("invoiceMatch").textContent =
        "KES 120,000 matched";

    setResult(
        "SUCCESS: All documents match. Inventory and accounts payable have been updated. Payment is authorized in this simulation.",
        "success"
    );

    updateLog("Normal transaction completed successfully.");
}

function runInvoiceMismatch() {
    resetSteps();

    // The invoice is KES 132,000, but the order is KES 120,000.
    for (let i = 0; i < 5; i++) {
        steps[i].classList.add("completed");
    }

    steps[5].classList.add("blocked");

    document.getElementById("inventory").textContent =
        "+100 bags received";

    document.getElementById("payable").textContent =
        "Not posted - invoice on hold";

    document.getElementById("payment").textContent =
        "Blocked pending review";

    document.getElementById("poMatch").textContent =
        "KES 120,000";

    document.getElementById("receiptMatch").textContent =
        "100 bags received";

    document.getElementById("invoiceMatch").textContent =
        "KES 132,000 - MISMATCH";

    setResult(
        "EXCEPTION: The invoice is KES 12,000 higher than the purchase order. Finance must investigate before payment.",
        "error"
    );

    updateLog("Invoice mismatch detected. Payment held for review.");
}

function resetDemo() {
    resetSteps();

    document.getElementById("inventory").textContent =
        "Not posted";

    document.getElementById("payable").textContent =
        "Not posted";

    document.getElementById("payment").textContent =
        "Pending";

    document.getElementById("poMatch").textContent =
        "Pending";

    document.getElementById("receiptMatch").textContent =
        "Pending";

    document.getElementById("invoiceMatch").textContent =
        "Pending";

    setResult("Select a button to run the workflow.", "");

    document.getElementById("log").innerHTML = "";

    updateLog("Demo reset.");
}

normalBtn.addEventListener("click", runNormalTransaction);
errorBtn.addEventListener("click", runInvoiceMismatch);
resetBtn.addEventListener("click", resetDemo);
