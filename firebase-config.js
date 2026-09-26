// Firebase 설정 (Compat 버전 사용)
const firebaseConfig = {
  apiKey: "AIzaSyDudTdLiqL53XFTqaAGDGlWGOU1Rla58Fc",
  authDomain: "field-safty-timer.firebaseapp.com",
  projectId: "field-safty-timer",
  storageBucket: "field-safty-timer.firebasestorage.app",
  messagingSenderId: "264856505885",
  appId: "1:264856505885:web:2449cf79b220374f9240f4",
};

// Firebase 초기화
let app;
let db;

try {
  app = firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log("Firebase 연결 성공");
} catch (error) {
  console.warn("Firebase 연결 실패, 오프라인 모드로 동작:", error);

  // Firebase 연결에 실패해도 로컬 스토리지로 동작하도록 설정
  db = null;
}

// Firebase 연결 상태 확인
let isFirebaseConnected = false;

if (db) {
  // 연결 테스트
  db.collection("test")
    .limit(1)
    .get()
    .then(() => {
      isFirebaseConnected = true;
      console.log("Firebase Firestore 연결 확인됨");
    })
    .catch((error) => {
      console.warn("Firestore 연결 실패:", error);
      isFirebaseConnected = false;
    });
}

// 데이터 저장 함수
function saveData(key, data) {
  // 로컬 스토리지에 저장
  localStorage.setItem(key, JSON.stringify(data));

  // Firebase가 연결되어 있으면 Firebase에도 저장
  if (isFirebaseConnected && db) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("fieldSafetyTimer")
      .doc(key)
      .set({
        data: data,
        updatedAt: timestamp,
      })
      .catch((error) => {
        console.warn("Firebase 저장 실패:", error);
      });
  }
}

// 데이터 로드 함수
async function loadData(key, defaultValue = null) {
  try {
    // 먼저 로컬 스토리지에서 로드
    const localData = localStorage.getItem(key);
    let data = localData ? JSON.parse(localData) : defaultValue;

    // Firebase가 연결되어 있으면 Firebase에서도 로드하여 비교
    if (isFirebaseConnected && db) {
      try {
        const doc = await db.collection("fieldSafetyTimer").doc(key).get();
        if (doc.exists) {
          const firebaseData = doc.data().data;
          const firebaseTimestamp = doc.data().updatedAt;

          // Firebase 데이터가 더 최신이면 사용
          // (실제 구현에서는 더 정교한 동기화 로직이 필요할 수 있습니다)
          data = firebaseData;

          // 로컬 스토리지도 업데이트
          localStorage.setItem(key, JSON.stringify(firebaseData));
        }
      } catch (error) {
        console.warn("Firebase 로드 실패, 로컬 데이터 사용:", error);
      }
    }

    return data;
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    return defaultValue;
  }
}

// 데이터 삭제 함수
function deleteData(key) {
  // 로컬 스토리지에서 삭제
  localStorage.removeItem(key);

  // Firebase에서도 삭제
  if (isFirebaseConnected && db) {
    db.collection("fieldSafetyTimer")
      .doc(key)
      .delete()
      .catch((error) => {
        console.warn("Firebase 삭제 실패:", error);
      });
  }
}

// 전체 데이터 초기화 함수
function clearAllData() {
  // 로컬 스토리지 초기화
  const keys = ["teams", "settings"];
  keys.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Firebase 초기화
  if (isFirebaseConnected && db) {
    keys.forEach((key) => {
      db.collection("fieldSafetyTimer")
        .doc(key)
        .delete()
        .catch((error) => {
          console.warn("Firebase 삭제 실패:", error);
        });
    });
  }
}
