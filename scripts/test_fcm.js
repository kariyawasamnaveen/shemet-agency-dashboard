const admin = require('firebase-admin');

// Initialize Firebase Admin using default fallback
try {
  admin.initializeApp({
    projectId: "dating-live-app-477af"
  });
} catch (e) {
  console.error("Firebase Admin initialization failed. Make sure you are logged in via firebase-tools or have a service account.");
  process.exit(1);
}

async function runTest() {
  try {
    const db = admin.firestore();
    
    // 1. Target User
    let targetUid = "9mgIyX9hQ7Sva8nLkZ0ZEjmIWqx1"; // Default Naveen's UID
    console.log(`Simulating a notification payload for ${targetUid}...`);

    // 2. Insert a document into their notifications collection
    const docRef = await db.collection("users").doc(targetUid).collection("notifications").add({
      title: "Automated Backend Test \uD83E\uDD16",
      body: "If you see this, the Cloud Function FCM integration is 100% working natively!",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      data: {
        type: "system_test",
        source: "backend_automation"
      }
    });
    
    console.log(`Successfully created test notification: ${docRef.id}`);
    console.log("Waiting for 5 seconds to let the Cloud Function process it...");
    
    // 3. Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 4. Verify if the Cloud Function modified the document
    const finalDoc = await docRef.get();
    const finalData = finalDoc.data();
    
    if (finalData.status === "sent") {
      console.log(`\n\u2705 SUCCESS! Cloud Function processed the event and dispatched FCM.`);
      console.log(`\u2705 Message ID assigned by FCM: ${finalData.messageId}`);
    } else if (finalData.status === "failed") {
      console.log(`\n\u274C CLOUD FUNCTION FIRED, but FCM rejected the payload.`);
      console.log(`\u274C Error reason: ${finalData.error}`);
    } else {
      console.log(`\n\u26A0\uFE0F Cloud function did not update the document. finalData:`, finalData);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Test Script Error:", err);
    process.exit(1);
  }
}

runTest();
