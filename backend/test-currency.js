// OMR Currency Logic Test Suite
const assert = require('assert');

// 1. OMR Baisa Conversion Rule
function toBaisa(omr) {
    return Math.round(omr * 1000);
}

function fromBaisa(baisa) {
    return baisa / 1000;
}

// 2. Safe Money Math Addition
function addMoney(a, b) {
    const baisaA = toBaisa(a);
    const baisaB = toBaisa(b);
    return fromBaisa(baisaA + baisaB);
}

// 3. Safe Invoice Calculation
function calculateInvoiceTotal(subtotal, tax, discount) {
    const baisaSubtotal = toBaisa(subtotal);
    const baisaTax = toBaisa(tax);
    const baisaDiscount = toBaisa(discount);
    const totalBaisa = baisaSubtotal + baisaTax - baisaDiscount;
    return fromBaisa(totalBaisa);
}

// 4. OMR Formatting Rule
function formatOMR(amount) {
    return 'OMR ' + parseFloat(amount).toFixed(3);
}

// Run Tests
try {
    console.log('Running OMR Currency Tests...');

    // Test 1: Baisa Conversion
    assert.strictEqual(toBaisa(1.000), 1000, '1 OMR must equal 1000 Baisa');
    assert.strictEqual(fromBaisa(1000), 1.000, '1000 Baisa must equal 1 OMR');
    console.log('✔ Test 1 Passed: 1 OMR = 1000 Baisa');

    // Test 2: Safe Decimal Addition
    const sum = addMoney(10.123, 5.456);
    assert.strictEqual(sum, 15.579, '10.123 + 5.456 must equal 15.579');
    console.log('✔ Test 2 Passed: 10.123 + 5.456 = 15.579');

    // Test 3: Subtotal + Tax - Discount
    const total = calculateInvoiceTotal(100.550, 5.028, 10.250);
    assert.strictEqual(total, 95.328, '100.550 + 5.028 - 10.250 must equal 95.328');
    assert.strictEqual(total.toFixed(3), '95.328', 'Final total must be formatted with 3 decimals');
    console.log('✔ Test 3 Passed: Subtotal + Tax - Discount is accurate to 3 decimals');

    // Test 4: OMR Format
    assert.strictEqual(formatOMR(10.5), 'OMR 10.500', '10.5 must format to OMR 10.500');
    assert.strictEqual(formatOMR(10.555), 'OMR 10.555', '10.555 must format to OMR 10.555');
    console.log('✔ Test 4 Passed: OMR formatting matches OMR 10.500 standard');

    console.log('\nAll OMR currency tests passed successfully! 🚀');
} catch (error) {
    console.error('❌ Test Failed:', error.message);
    process.exit(1);
}
