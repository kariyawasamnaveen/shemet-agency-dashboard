import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAzXH0KH0UzjOt2AERgaX4SVNS6OGWygCY",
    projectId: "dating-live-app-477af",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTest() {
  try {
    const targetUid = "9mgIyX9hQ7Sva8nLkZ0ZEjmIWqx1";
    console.log(`Simulating a notification payload for ${targetUid}...`);
    
    const docRef = await addDoc(collection(db, "users", targetUid, "notifications"), {
      title: "Automated Backend Test \uD83E\uDD16",
      body: "If you see this, the Cloud Function FCM integration is working natively!",
      read: false,
      createdAt: serverTimestamp(),
      data: { type: "system_test" }
    });
    
    console.log(`Successfully created test notification: ${docRef.id}`);
    console.log("Waiting 5 seconds for Cloud Function to process...");
    await new Promise(r => setTimeout(r, 5000));
    
    const snap = await getDoc(docRef);
    const finalData = snap.data();
    
    if (finalData.status === "sent") {
      console.log(`\n\u2705 SUCCESS! Cloud Function processed the event.`);
      console.log(`\u2705 Message ID: ${finalData.messageId}`);
    } else if (finalData.status === "failed") {
      console.log(`\n\u274C CLOUD FUNCTION FIRED, but FCM rejected it.`);
      console.log(`\u274C Error reason: ${finalData.error}`);
    } else {
      console.log(`\n\u26A0\uFE0F Cloud function did not update the document. Full payload:`);
      console.log(finalData);
    }
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

runTest();
