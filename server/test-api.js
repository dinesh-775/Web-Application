import assert from "assert";

const BASE_URL = "http://localhost:5000/api";

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: response.status, data };
}

async function runTests() {
  console.log("=== STARTING BACKEND API TESTS ===");

  // 1. President Login
  console.log("1. Logging in as President...");
  const loginRes = await api("/auth/login", {
    method: "POST",
    body: { email: "president@ganesh.local", password: "ChangeMe123!" }
  });
  assert.strictEqual(loginRes.status, 200, "President login should succeed");
  const presToken = loginRes.data.token;
  console.log("   Logged in. Token:", presToken.slice(0, 15) + "...");

  // 2. Fetch admin profile
  console.log("2. Fetching admin profile...");
  const meRes = await api("/auth/me", {
    headers: { Authorization: `Bearer ${presToken}` }
  });
  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meRes.data.user.role, "PRESIDENT");
  assert.strictEqual(meRes.data.user.passwordHash, undefined, "Sensitive fields must not be exposed");

  // 3. Register a member (public)
  console.log("3. Registering new member...");
  const email = `testmember_${Date.now()}@example.com`;
  const regRes = await api("/member-applications", {
    method: "POST",
    body: {
      name: "John Doe",
      email,
      phone: "9876543210",
      address: "123 Street",
      occupation: "Engineer"
    }
  });
  assert.strictEqual(regRes.status, 201);
  const applicationId = regRes.data.data._id;
  console.log(`   Registration submitted. App ID: ${applicationId}`);

  // 4. Admin list applications
  console.log("4. Listing pending applications as President...");
  const listAppsRes = await api("/member-applications", {
    headers: { Authorization: `Bearer ${presToken}` }
  });
  assert.strictEqual(listAppsRes.status, 200);
  const pendingApp = listAppsRes.data.find(a => a._id === applicationId);
  assert.ok(pendingApp, "New application should be listed");
  assert.strictEqual(pendingApp.status, "PENDING");

  // 5. Admin approve application
  console.log("5. Approving member application...");
  const approveRes = await api(`/member-applications/${applicationId}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${presToken}` }
  });
  assert.strictEqual(approveRes.status, 200);
  const memberId = approveRes.data.member._id;
  console.log(`   Approved. Member DB ID: ${memberId}`);

  // 6. Member login with default password
  console.log("6. Logging in as new member...");
  const memLoginRes = await api("/auth/login", {
    method: "POST",
    body: { email, password: "ChangeMe123!" }
  });
  assert.strictEqual(memLoginRes.status, 200);
  let memToken = memLoginRes.data.token;
  console.log("   Logged in. Token parsed.");

  // 7. Member change password
  console.log("7. Changing password as member...");
  const changePwdRes = await api("/auth/change-password", {
    method: "POST",
    headers: { Authorization: `Bearer ${memToken}` },
    body: { currentPassword: "ChangeMe123!", newPassword: "NewPassword123!" }
  });
  assert.strictEqual(changePwdRes.status, 200);
  console.log("   Password changed successfully.");

  // 8. Verify login fails with old password, succeeds with new password
  console.log("8. Verifying login credentials...");
  const failLogin = await api("/auth/login", {
    method: "POST",
    body: { email, password: "ChangeMe123!" }
  });
  assert.strictEqual(failLogin.status, 401, "Old password must fail");

  const successLogin = await api("/auth/login", {
    method: "POST",
    body: { email, password: "NewPassword123!" }
  });
  assert.strictEqual(successLogin.status, 200, "New password must succeed");
  memToken = successLogin.data.token;

  // 9. Member update own profile
  console.log("9. Updating member profile details...");
  const updateProfileRes = await api("/members/profile", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${memToken}` },
    body: { phone: "1112223333", address: "Updated Address 456", occupation: "Senior Engineer" }
  });
  assert.strictEqual(updateProfileRes.status, 200);
  assert.strictEqual(updateProfileRes.data.member.phone, "1112223333");
  assert.strictEqual(updateProfileRes.data.member.address, "Updated Address 456");

  // 10. Submit CASH payment (remains PENDING)
  console.log("10. Member submitting cash payment request...");
  const cashRes = await api("/payments", {
    method: "POST",
    headers: { Authorization: `Bearer ${memToken}` },
    body: { amount: 500, paymentMethod: "CASH", referenceNumber: "CASHREF-789" }
  });
  assert.strictEqual(cashRes.status, 201);
  const paymentId = cashRes.data.payment._id;
  assert.strictEqual(cashRes.data.payment.status, "PENDING", "Cash must be PENDING initially");
  console.log(`    Cash payment request submitted. Payment ID: ${paymentId}`);

  // 11. Check that pending cash does not affect finance summary
  console.log("11. Verifying finance summary totals only sum SUCCESS...");
  const initialFinance = await api("/finance/summary");
  assert.strictEqual(initialFinance.status, 200);
  const initialReceived = initialFinance.data.totalReceived;
  console.log(`    Initial total received: ₹${initialReceived}`);

  // 12. Approve cash payment as President
  console.log("12. Admin approving cash payment...");
  const approveCashRes = await api(`/payments/${paymentId}/approve-cash`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${presToken}` }
  });
  assert.strictEqual(approveCashRes.status, 200);
  const receiptId = approveCashRes.data.receipt._id;
  console.log(`    Approved. Receipt ID: ${receiptId}`);

  // 13. Verify finance summary updated
  console.log("13. Verifying total received is updated with approved cash payment...");
  const updatedFinance = await api("/finance/summary");
  assert.strictEqual(updatedFinance.data.totalReceived, initialReceived + 500, "Finance summary should increase by 500");

  // 14. Check audit logs
  console.log("14. Verifying audit logs for the cash payment approval...");
  const auditLogsRes = await api("/audit-logs", {
    headers: { Authorization: `Bearer ${presToken}` }
  });
  assert.strictEqual(auditLogsRes.status, 200);
  const hasApproveCashLog = auditLogsRes.data.some(log => log.action === "APPROVE_CASH_PAYMENT" && log.entityId === paymentId);
  assert.ok(hasApproveCashLog, "Audit log for cash approval must be written");
  console.log("    Audit log verified.");

  // 15. Verify security authorization on receipt downloading
  console.log("15. Verifying receipt access control...");
  
  // Member download own receipt (should succeed)
  console.log("    Downloading own receipt as member...");
  const memberDLRes = await api(`/receipts/${receiptId}/download`, {
    headers: { Authorization: `Bearer ${memToken}` }
  });
  assert.strictEqual(memberDLRes.status, 200, "Member should be allowed to download own receipt");

  // Admin download member receipt (should succeed)
  console.log("    Downloading receipt as Admin...");
  const adminDLRes = await api(`/receipts/${receiptId}/download`, {
    headers: { Authorization: `Bearer ${presToken}` }
  });
  assert.strictEqual(adminDLRes.status, 200, "Admin should be allowed to download any receipt");

  // Anonymous download member receipt (should fail)
  console.log("    Downloading receipt without auth token (Anonymous)...");
  const anonDLRes = await api(`/receipts/${receiptId}/download`);
  assert.strictEqual(anonDLRes.status, 401, "Anonymous download should be blocked with 401");

  // Another member download receipt (should fail)
  console.log("    Creating second member to test cross-member access...");
  const email2 = `testmember2_${Date.now()}@example.com`;
  const regRes2 = await api("/member-applications", {
    method: "POST",
    body: { name: "Jane Smith", email: email2, phone: "9876543211" }
  });
  const appId2 = regRes2.data.data._id;
  await api(`/member-applications/${appId2}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${presToken}` }
  });
  const mem2Login = await api("/auth/login", {
    method: "POST",
    body: { email: email2, password: "ChangeMe123!" }
  });
  const mem2Token = mem2Login.data.token;

  console.log("    Downloading first member's receipt as second member...");
  const crossDLRes = await api(`/receipts/${receiptId}/download`, {
    headers: { Authorization: `Bearer ${mem2Token}` }
  });
  assert.strictEqual(crossDLRes.status, 403, "Cross-member download must return 403 Forbidden");

  // 16. Verify online UPI payment and duplicate protection
  console.log("16. Verifying UPI payment duplicate protection...");
  const upiPayRes = await api("/payments", {
    method: "POST",
    headers: { Authorization: `Bearer ${memToken}` },
    body: { amount: 300, paymentMethod: "UPI" }
  });
  assert.strictEqual(upiPayRes.status, 201);
  const upiPaymentId = upiPayRes.data.payment._id;

  const demoSuccessRes1 = await api(`/payments/${upiPaymentId}/demo-success`, {
    method: "POST",
    headers: { Authorization: `Bearer ${memToken}` },
    body: { transactionId: "TXN12345" }
  });
  assert.strictEqual(demoSuccessRes1.status, 200);

  console.log("    Attempting to confirm same transaction ID again...");
  const duplicatePayRes = await api("/payments", {
    method: "POST",
    headers: { Authorization: `Bearer ${memToken}` },
    body: { amount: 300, paymentMethod: "UPI" }
  });
  const duplicatePaymentId = duplicatePayRes.data.payment._id;
  const demoSuccessRes2 = await api(`/payments/${duplicatePaymentId}/demo-success`, {
    method: "POST",
    headers: { Authorization: `Bearer ${memToken}` },
    body: { transactionId: "TXN12345" }
  });
  assert.strictEqual(demoSuccessRes2.status, 409, "Should fail with duplicate transaction protection");
  console.log("    Duplicate payment protection verified.");

  console.log("=== ALL API TESTS PASSED SUCCESSFULLY ===");
}

runTests().catch(e => {
  console.error("!!! TEST FAILED !!!");
  console.error(e);
  process.exit(1);
});
