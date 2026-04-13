const email = `storetest.${Date.now()}@example.com`;
const password = "SecurePassword123!";
const PUBLISHABLE_KEY = "pk_b05c7fec33f14d99c616b81f5d41a816d240984d762b8424570cb565f28b06b5";
const API = "http://127.0.0.1:9001";

async function testFullFlow() {
  // 1. Register
  console.log("1. Registering...");
  const regRes = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, first_name: "Test", role: "buyer" })
  });
  const regData = await regRes.json();
  console.log(`   Status: ${regRes.status}`, regData.message || regData);

  // 2. Login
  console.log("\n2. Logging in via /auth/customer/emailpass...");
  const loginRes = await fetch(`${API}/auth/customer/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  console.log(`   Status: ${loginRes.status}`);
  
  if (!loginData.token) {
    console.log("   ERROR:", loginData);
    return;
  }
  console.log("   Token received ✅");

  // 3. Fetch /store/me with publishable key
  console.log("\n3. Fetching /store/me...");
  const meRes = await fetch(`${API}/store/me`, {
    headers: {
      "Authorization": `Bearer ${loginData.token}`,
      "x-publishable-api-key": PUBLISHABLE_KEY
    }
  });
  const meData = await meRes.json();
  console.log(`   Status: ${meRes.status}`);
  if (meRes.ok) {
    console.log("   Customer ID:", meData.customer?.id);
    console.log("   Email:", meData.customer?.email);
    console.log("   /store/me ✅");
  } else {
    console.log("   ERROR:", meData);
  }
}

testFullFlow();
