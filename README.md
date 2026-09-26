# 소방관 현장 진입 타이머

소방관 현장 진입 시간을 추적하는 안전 관리 PWA 앱입니다.

- 배포 주소: https://field-safety-timer-119.web.app
- 배포: `firebase deploy --only hosting` (Firebase 프로젝트 `field-safety-timer-119`, 호스팅 폴더 `public/`)

## 주요 기능

- **대(팀) 관리**: 최대 7개 대까지 관리, 대명 수정 가능, 배정층 설정
- **타이머 기능**: 각 대별 진입 시작/철수 관리
- **알림 시스템**: 15분 경고, 20분 위험 알림 (진동 + 사운드 + 시각적)
- **게이지 UI**: 시간 경과 시각화
- **PWA 지원**: 오프라인 동작, 모바일 설치 가능
- **Firebase 연동**: 데이터 백업 및 동기화 (선택사항)

## Firebase 설정 (선택사항)

Firebase 연동을 원하는 경우 다음 단계를 따르세요:

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: field-safety-timer)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. Firestore 데이터베이스 설정

1. Firebase Console에서 "Firestore Database" 선택
2. "데이터베이스 만들기" 클릭
3. 보안 규칙 설정:
   - 테스트 모드로 시작 (개발용)
   - 또는 프로덕션 모드 (실제 운영용)
4. 위치 선택 (asia-northeast3 - 서울 권장)

### 3. 웹앱 추가 및 설정

1. Firebase Console에서 프로젝트 설정 (톱니바퀴 아이콘)
2. "일반" 탭에서 "앱 추가" > "웹" 선택
3. 앱 닉네임 입력 (예: Field Safety Timer)
4. "Firebase SDK 추가" 페이지에서 설정 정보 복사

### 4. 앱에 Firebase 설정 적용

`firebase-config.js` 파일을 열고 Firebase 설정 정보를 입력하세요:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 5. Firestore 보안 규칙 (선택사항)

더 안전한 운영을 위해 다음 보안 규칙을 적용할 수 있습니다:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /fieldSafetyTimer/{document} {
      allow read, write: if true; // 모든 접근 허용 (테스트용)
      // 실제 운영시에는 더 엄격한 규칙 적용 권장
    }
  }
}
```

## 로컬 실행

Firebase 설정 없이도 앱은 완전히 동작합니다. 모든 데이터는 브라우저의 로컬 스토리지에 저장됩니다.

1. 웹 서버에서 파일들 서빙
2. `index.html` 파일을 브라우저에서 열기
3. PWA로 설치하려면 브라우저의 "홈 화면에 추가" 사용

## 사용법

### 대 추가
- 우상단 "+" 버튼 클릭
- 대명과 배정층 입력
- 저장

### 진입 타이머 시작
- 대 카드에서 "진입 시작" 버튼 클릭
- 타이머가 자동으로 시작됨

### 알림
- 15분 경과: 노란색 경고 알림
- 20분 경과: 빨간색 위험 알림
- 진동, 소리, 시각적 알림 제공

### 철수
- "철수" 버튼 클릭하여 타이머 종료

### 설정
- 우상단 톱니바퀴 버튼으로 설정 변경
- 경고/위험 시간 조정
- 알림 설정 변경

## 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase Firestore (선택사항)
- **PWA**: Service Worker, Web App Manifest
- **UI**: 반응형 디자인, 모바일 최적화

## 브라우저 지원

- Chrome (권장)
- Firefox
- Safari
- Edge

## 라이선스

MIT License

## 기여

버그 리포트나 기능 제안은 이슈로 등록해 주세요.