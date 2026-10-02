// 데이터 저장 — 이 기기(브라우저)에만 저장한다
// -------------------------------------------------------------
// 예전에는 Firebase(Firestore)에도 같이 저장하려 했지만,
//  1) 연결 확인용으로 읽던 "test" 컬렉션이 권한 거부되어 클라우드 저장이 한 번도 동작하지 않았고
//  2) 저장 키가 "teams" / "settings" 하나뿐이라, 동기화가 되면 서로 다른 현장의 휴대폰들이
//     같은 팀 목록을 덮어써 버리는 구조였다.
// 현장마다 각자 휴대폰에서 쓰는 타이머이므로 기기 저장(localStorage)만 쓴다.
// (파일 이름은 서비스워커 캐시 목록과 맞추려고 그대로 둔다)

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("저장 실패:", error);
  }
}

async function loadData(key, defaultValue = null) {
  try {
    const localData = localStorage.getItem(key);
    return localData ? JSON.parse(localData) : defaultValue;
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    return defaultValue;
  }
}

function deleteData(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("삭제 실패:", error);
  }
}

function clearAllData() {
  ["teams", "settings"].forEach(deleteData);
}
