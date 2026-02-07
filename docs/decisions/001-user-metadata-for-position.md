# 001. 캐릭터 위치 저장에 user_metadata 사용

## 상태
적용됨

## 날짜
2025-02-08

## 맥락
- 현재 Supabase에 DB 테이블 없음 (auth만 사용 중)
- service role key 없음, anon key만 보유
- 접속할 때마다 랜덤 스폰되어 UX가 불편함
- 서버 재시작 시 모든 위치 정보 소멸

## 결정
Supabase `auth.users` 테이블의 `user_metadata` JSON 필드에 `last_position` 저장

```json
{
  "display_name": "박선춘",
  "last_position": { "x": 5, "y": 3 }
}
```

### API 호출 방식
```
PUT https://{project}.supabase.co/auth/v1/user
Authorization: Bearer {유저JWT}
Content-Type: application/json

{
  "data": {
    "last_position": { "x": 5, "y": 3 }
  }
}
```

## 장점
- 별도 테이블 생성 불필요
- service role key 없이 유저 JWT만으로 업데이트 가능
- 기존 auth 구조 유지
- 구현 간단

## 단점
- 위치 히스토리 저장 불가
- 복잡한 쿼리 불가 (예: "특정 영역에 있는 유저 조회")
- user_metadata는 유저 본인만 수정 가능

## 향후 계획 (테이블 필요 시)
인벤토리, 아이템, 채팅 로그 등 복잡한 기능 추가 시 별도 테이블 생성 필요:

```sql
-- 예시: 향후 필요할 수 있는 테이블
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  position_x INT,
  position_y INT,
  last_seen TIMESTAMP,
  inventory JSONB
);
```

## 수정 파일
- `backend/ws/manager.py` - 위치 저장/불러오기 로직
- `backend/ws/endpoint.py` - 접속 시 저장된 위치로 스폰
