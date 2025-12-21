# 단체 주문 통합 (Group Order Collector)

## 1. 개요

### 1.1 문제 정의
- 회식, 단체 주문 시 "뭐 먹을래?" 질문 반복
- 핸드폰을 돌려가며 메뉴를 선택하거나 메신저로 메뉴 취합하는 번거로움
- 주문자가 각자의 주문을 일일이 메모하고 정리해야 하는 불편함
- 실시간 주문 현황 파악 어려움
- 정산 시 계산의 복잡함

### 1.2 솔루션
- 한 가게에서 여러 사람의 주문을 모아서 정리하는 웹 앱
- QR 코드 또는 링크로 간편하게 참여
- 각자 자신의 디바이스에서 메뉴 선택
- 실시간 주문 현황 확인
- 자동 집계 및 정산

### 1.3 타겟 사용자
- 회식을 주관하는 직장인
- 단체 배달 주문을 하는 동아리/팀
- 스터디 그룹, 친구 모임 등

## 2. 유사 서비스 분석

### 2.1 배달의민족 함께주문 기능
**출처**: [우아한형제들 기술블로그](https://techblog.woowahan.com/10232/)

#### 기능 분석
- **도입 시기**: 2022년 10월 (쿠팡이츠는 2022년 8월 선도입)
- **작동 방식**:
  1. 가게 상세 화면에서 "함께주문" 버튼 클릭
  2. 카카오톡 등으로 링크 공유
  3. 초대된 친구들이 각자 메뉴 선택
  4. 결제 담당자가 최종 주문 및 결제

#### 장점
- 배민 앱 내에서 모든 과정 완결
- 실제 주문까지 연동

#### 한계
- 배민 가맹점에만 한정
- 앱 설치 필수
- 현금/직접 주문 시 사용 불가

### 2.2 우리 앱의 차별화 포인트
- 어떤 가게/식당이든 사용 가능 (비가맹점, 오프라인 식당 포함)
- 앱 설치 불필요 (웹 기반)
- 메뉴를 직접 입력하거나 자유 입력 모드 지원
- 주문서 형태로 출력하여 전화/방문 주문 가능
- 정산 기능 포함

## 3. 오픈소스 라이브러리

### 3.1 QR 코드 생성
```bash
npm install qrcode
npm install @types/qrcode --save-dev
```

**공식 문서**: [node-qrcode](https://github.com/soldair/node-qrcode)

**기능**:
- Canvas 또는 SVG로 QR 코드 생성
- URL을 QR 코드로 인코딩
- 커스터마이징 옵션 (색상, 크기 등)

### 3.2 BroadcastChannel API
**참고 자료**:
- [DigitalOcean Tutorial](https://www.digitalocean.com/community/tutorials/js-broadcastchannel-api)
- [Telerik Guide](https://www.telerik.com/blogs/ultimate-guide-broadcast-channel-api)
- [TabStateSync Library](https://github.com/robertluiz/TabStateSync)

**기능**:
- 같은 origin의 여러 탭/윈도우 간 실시간 통신
- localStorage 이벤트보다 안정적
- 메시지 전송/수신 간단

**브라우저 지원**:
- Chrome, Firefox, Edge 지원
- Safari 일부 버전 미지원 → localStorage fallback 필요

### 3.3 localStorage
- 주문 데이터 영구 저장
- 페이지 새로고침 시에도 데이터 유지
- BroadcastChannel 미지원 브라우저의 폴백

### 3.4 html2canvas (주문서 이미지 변환)
```bash
npm install html2canvas
npm install @types/html2canvas --save-dev
```

**기능**:
- HTML 요소를 Canvas로 변환
- PNG 이미지 다운로드
- 카카오톡 공유용 이미지 생성

## 4. 기술 스택

### 4.1 프론트엔드
- **프레임워크**: Vite + React 19 + TypeScript
- **스타일링**: Tailwind CSS v4
- **상태관리**: React useState/useContext
- **라우팅**: React Router v6

### 4.2 데이터 저장
- **로컬 저장소**: localStorage
- **탭 간 동기화**: BroadcastChannel API
- **폴백**: localStorage 'storage' 이벤트

### 4.3 라이브러리
- `qrcode`: QR 코드 생성
- `html2canvas`: 주문서 이미지 변환
- `nanoid`: 고유 ID 생성

## 5. 핵심 기능 및 구현

### 5.1 주문 세션 생성 (호스트)

#### UI 플로우
1. 가게/식당 이름 입력
2. 메뉴 입력 방식 선택:
   - **고정 메뉴 모드**: 미리 메뉴와 가격 입력
   - **자유 입력 모드**: 참가자가 직접 메뉴명 입력
3. 세션 생성 후:
   - 고유 세션 ID 생성 (nanoid)
   - QR 코드 생성 (참여 링크 인코딩)
   - 링크 복사 버튼
   - 카카오톡 공유 버튼
4. 마감 시간 설정 (선택)

#### 구현 상세
```typescript
interface OrderSession {
  id: string;
  restaurantName: string;
  mode: 'fixed' | 'free';
  menus: MenuItem[];
  deadline?: Date;
  createdAt: Date;
  hostName: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

function createSession(data: {
  restaurantName: string;
  mode: 'fixed' | 'free';
  menus: MenuItem[];
  deadline?: Date;
  hostName: string;
}): OrderSession {
  const sessionId = nanoid(10);
  const session: OrderSession = {
    id: sessionId,
    ...data,
    createdAt: new Date(),
  };

  // localStorage에 저장
  localStorage.setItem(`session:${sessionId}`, JSON.stringify(session));

  return session;
}
```

### 5.2 주문 참여 (참가자)

#### UI 플로우
1. QR 스캔 또는 링크 클릭 → 세션 페이지 진입
2. 닉네임 입력 (중복 체크)
3. 메뉴 선택:
   - **고정 메뉴 모드**: 메뉴 리스트에서 선택 + 수량 조절
   - **자유 입력 모드**: 메뉴명, 가격 직접 입력
4. 특이사항/요청사항 메모 (선택)
5. 제출 버튼 클릭

#### 구현 상세
```typescript
interface Order {
  id: string;
  sessionId: string;
  participantName: string;
  items: OrderItem[];
  specialRequest?: string;
  submittedAt: Date;
}

interface OrderItem {
  id: string;
  menuId?: string; // 고정 메뉴 모드에서만
  menuName: string;
  price: number;
  quantity: number;
}

function submitOrder(sessionId: string, order: Omit<Order, 'id' | 'submittedAt'>): void {
  const orderId = nanoid(10);
  const fullOrder: Order = {
    ...order,
    id: orderId,
    submittedAt: new Date(),
  };

  // localStorage에 저장
  const ordersKey = `orders:${sessionId}`;
  const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
  existingOrders.push(fullOrder);
  localStorage.setItem(ordersKey, JSON.stringify(existingOrders));

  // BroadcastChannel로 실시간 알림
  const channel = new BroadcastChannel(`session:${sessionId}`);
  channel.postMessage({
    type: 'NEW_ORDER',
    order: fullOrder,
  });
}
```

### 5.3 주문 현황 (호스트 대시보드)

#### UI 구성
- **참여자 목록**: 아바타 + 닉네임 (실시간 업데이트)
- **메뉴별 집계**: 메뉴명, 수량, 소계
- **총 금액**: 모든 주문의 합계
- **1인당 금액**: 총 금액 ÷ 참여자 수
- **미주문자 표시**: 아직 주문하지 않은 참가자 하이라이트

#### 실시간 업데이트
```typescript
function useLiveOrders(sessionId: string) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // 초기 로드
    const ordersKey = `orders:${sessionId}`;
    const initialOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    setOrders(initialOrders);

    // BroadcastChannel 리스너
    const channel = new BroadcastChannel(`session:${sessionId}`);
    channel.onmessage = (event) => {
      if (event.data.type === 'NEW_ORDER') {
        setOrders(prev => [...prev, event.data.order]);
      } else if (event.data.type === 'UPDATE_ORDER') {
        setOrders(prev => prev.map(o =>
          o.id === event.data.order.id ? event.data.order : o
        ));
      } else if (event.data.type === 'DELETE_ORDER') {
        setOrders(prev => prev.filter(o => o.id !== event.data.orderId));
      }
    };

    // localStorage fallback (Safari 등)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ordersKey && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [sessionId]);

  return orders;
}
```

### 5.4 주문 마감 및 정리

#### 주문서 생성
```typescript
interface OrderSummary {
  restaurantName: string;
  totalAmount: number;
  perPersonAmount: number;
  participantCount: number;
  menuSummary: MenuSummaryItem[];
  orders: Order[];
}

interface MenuSummaryItem {
  menuName: string;
  totalQuantity: number;
  unitPrice: number;
  subtotal: number;
}

function generateOrderSummary(sessionId: string): OrderSummary {
  const session: OrderSession = JSON.parse(
    localStorage.getItem(`session:${sessionId}`) || '{}'
  );
  const orders: Order[] = JSON.parse(
    localStorage.getItem(`orders:${sessionId}`) || '[]'
  );

  // 메뉴별 집계
  const menuMap = new Map<string, MenuSummaryItem>();

  orders.forEach(order => {
    order.items.forEach(item => {
      const key = item.menuName;
      if (menuMap.has(key)) {
        const existing = menuMap.get(key)!;
        existing.totalQuantity += item.quantity;
        existing.subtotal += item.price * item.quantity;
      } else {
        menuMap.set(key, {
          menuName: item.menuName,
          totalQuantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.price * item.quantity,
        });
      }
    });
  });

  const menuSummary = Array.from(menuMap.values());
  const totalAmount = menuSummary.reduce((sum, item) => sum + item.subtotal, 0);
  const participantCount = new Set(orders.map(o => o.participantName)).size;

  return {
    restaurantName: session.restaurantName,
    totalAmount,
    perPersonAmount: Math.ceil(totalAmount / participantCount),
    participantCount,
    menuSummary,
    orders,
  };
}
```

#### 카카오톡 공유용 텍스트
```typescript
function generateShareText(summary: OrderSummary): string {
  let text = `📋 ${summary.restaurantName} 단체 주문\n\n`;

  text += `👥 참여 인원: ${summary.participantCount}명\n\n`;

  text += `📝 주문 내역:\n`;
  summary.menuSummary.forEach(item => {
    text += `  • ${item.menuName} x ${item.totalQuantity}개 = ${item.subtotal.toLocaleString()}원\n`;
  });

  text += `\n💰 총 금액: ${summary.totalAmount.toLocaleString()}원\n`;
  text += `💵 1인당: ${summary.perPersonAmount.toLocaleString()}원\n\n`;

  text += `📋 개인별 주문:\n`;
  summary.orders.forEach(order => {
    const orderTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
    text += `  [${order.participantName}] ${orderTotal.toLocaleString()}원\n`;
    order.items.forEach(item => {
      text += `    - ${item.menuName} x ${item.quantity}\n`;
    });
    if (order.specialRequest) {
      text += `    메모: ${order.specialRequest}\n`;
    }
  });

  return text;
}
```

#### PNG 이미지 다운로드
```typescript
import html2canvas from 'html2canvas';

async function downloadOrderImage(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // 고해상도
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
```

### 5.5 정산

#### 개인별 금액 계산
```typescript
interface ParticipantBill {
  participantName: string;
  items: OrderItem[];
  totalAmount: number;
}

function calculateIndividualBills(sessionId: string): ParticipantBill[] {
  const orders: Order[] = JSON.parse(
    localStorage.getItem(`orders:${sessionId}`) || '[]'
  );

  return orders.map(order => {
    const totalAmount = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      participantName: order.participantName,
      items: order.items,
      totalAmount,
    };
  });
}
```

#### 1/N 정산 계산
```typescript
function calculateEvenSplit(sessionId: string): { perPerson: number; participants: string[] } {
  const summary = generateOrderSummary(sessionId);

  return {
    perPerson: summary.perPersonAmount,
    participants: Array.from(new Set(summary.orders.map(o => o.participantName))),
  };
}
```

## 6. 데이터 모델 (TypeScript)

### 6.1 완전한 타입 정의
```typescript
// ============================================
// 세션 관련
// ============================================
interface OrderSession {
  id: string;
  restaurantName: string;
  mode: 'fixed' | 'free';
  menus: MenuItem[];
  deadline?: Date;
  createdAt: Date;
  hostName: string;
  isActive: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
}

// ============================================
// 주문 관련
// ============================================
interface Order {
  id: string;
  sessionId: string;
  participantName: string;
  items: OrderItem[];
  specialRequest?: string;
  submittedAt: Date;
  updatedAt?: Date;
}

interface OrderItem {
  id: string;
  menuId?: string; // 고정 메뉴 모드에서만
  menuName: string;
  price: number;
  quantity: number;
  options?: string[]; // 맵기, 사이즈 등
}

// ============================================
// 집계 관련
// ============================================
interface OrderSummary {
  restaurantName: string;
  totalAmount: number;
  perPersonAmount: number;
  participantCount: number;
  menuSummary: MenuSummaryItem[];
  orders: Order[];
  generatedAt: Date;
}

interface MenuSummaryItem {
  menuName: string;
  totalQuantity: number;
  unitPrice: number;
  subtotal: number;
  orderedBy: string[]; // 누가 주문했는지
}

interface ParticipantBill {
  participantName: string;
  items: OrderItem[];
  totalAmount: number;
  isPaid?: boolean;
}

// ============================================
// BroadcastChannel 메시지
// ============================================
type BroadcastMessage =
  | { type: 'NEW_ORDER'; order: Order }
  | { type: 'UPDATE_ORDER'; order: Order }
  | { type: 'DELETE_ORDER'; orderId: string }
  | { type: 'SESSION_CLOSED'; sessionId: string }
  | { type: 'DEADLINE_UPDATED'; deadline: Date };
```

### 6.2 localStorage 키 규칙
```typescript
// 세션 정보
const SESSION_KEY = (id: string) => `session:${id}`;

// 세션의 모든 주문
const ORDERS_KEY = (sessionId: string) => `orders:${sessionId}`;

// 내 주문 정보 (참가자 입장)
const MY_ORDER_KEY = (sessionId: string, participantName: string) =>
  `myorder:${sessionId}:${participantName}`;

// 세션 리스트 (호스트가 생성한 세션들)
const SESSION_LIST_KEY = 'session:list';
```

## 7. localStorage 기반 실시간 동기화

### 7.1 BroadcastChannel 유틸리티
```typescript
class OrderBroadcaster {
  private channel: BroadcastChannel | null = null;
  private sessionId: string;
  private listeners: Map<string, Function[]> = new Map();

  constructor(sessionId: string) {
    this.sessionId = sessionId;

    // BroadcastChannel 지원 확인
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(`session:${sessionId}`);
      this.channel.onmessage = this.handleMessage.bind(this);
    } else {
      // Fallback: localStorage 이벤트 사용
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  private handleMessage(event: MessageEvent<BroadcastMessage>) {
    const { type } = event.data;
    const callbacks = this.listeners.get(type) || [];
    callbacks.forEach(cb => cb(event.data));
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key?.startsWith(`orders:${this.sessionId}`)) {
      // localStorage가 변경되면 전체 주문 목록 다시 로드
      const callbacks = this.listeners.get('STORAGE_CHANGED') || [];
      callbacks.forEach(cb => cb({ type: 'STORAGE_CHANGED', key: event.key }));
    }
  }

  on(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  off(type: string, callback: Function) {
    const callbacks = this.listeners.get(type) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  broadcast(message: BroadcastMessage) {
    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // Fallback: localStorage 직접 업데이트
      // 다른 탭의 storage 이벤트가 트리거됨
      const key = `broadcast:${this.sessionId}:${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(message));
      // 임시 키는 즉시 삭제
      setTimeout(() => localStorage.removeItem(key), 100);
    }
  }

  close() {
    if (this.channel) {
      this.channel.close();
    }
    window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    this.listeners.clear();
  }
}
```

### 7.2 React Hook으로 통합
```typescript
function useOrderSync(sessionId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const broadcasterRef = useRef<OrderBroadcaster | null>(null);

  useEffect(() => {
    // 초기 로드
    const ordersKey = `orders:${sessionId}`;
    const initialOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    setOrders(initialOrders);

    // Broadcaster 초기화
    const broadcaster = new OrderBroadcaster(sessionId);
    broadcasterRef.current = broadcaster;

    // 실시간 업데이트 리스너
    broadcaster.on('NEW_ORDER', (data: { order: Order }) => {
      setOrders(prev => [...prev, data.order]);
    });

    broadcaster.on('UPDATE_ORDER', (data: { order: Order }) => {
      setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
    });

    broadcaster.on('DELETE_ORDER', (data: { orderId: string }) => {
      setOrders(prev => prev.filter(o => o.id !== data.orderId));
    });

    broadcaster.on('STORAGE_CHANGED', () => {
      // Fallback: 전체 다시 로드
      const updatedOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
      setOrders(updatedOrders);
    });

    return () => {
      broadcaster.close();
    };
  }, [sessionId]);

  const addOrder = useCallback((order: Omit<Order, 'id' | 'submittedAt'>) => {
    const newOrder: Order = {
      ...order,
      id: nanoid(10),
      submittedAt: new Date(),
    };

    // localStorage에 저장
    const ordersKey = `orders:${sessionId}`;
    const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    existingOrders.push(newOrder);
    localStorage.setItem(ordersKey, JSON.stringify(existingOrders));

    // BroadcastChannel로 알림
    broadcasterRef.current?.broadcast({ type: 'NEW_ORDER', order: newOrder });

    // 로컬 상태 업데이트
    setOrders(prev => [...prev, newOrder]);
  }, [sessionId]);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    const ordersKey = `orders:${sessionId}`;
    const existingOrders: Order[] = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    const updatedOrders = existingOrders.map(o =>
      o.id === orderId ? { ...o, ...updates, updatedAt: new Date() } : o
    );
    localStorage.setItem(ordersKey, JSON.stringify(updatedOrders));

    const updatedOrder = updatedOrders.find(o => o.id === orderId)!;
    broadcasterRef.current?.broadcast({ type: 'UPDATE_ORDER', order: updatedOrder });

    setOrders(updatedOrders);
  }, [sessionId]);

  const deleteOrder = useCallback((orderId: string) => {
    const ordersKey = `orders:${sessionId}`;
    const existingOrders: Order[] = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    const filteredOrders = existingOrders.filter(o => o.id !== orderId);
    localStorage.setItem(ordersKey, JSON.stringify(filteredOrders));

    broadcasterRef.current?.broadcast({ type: 'DELETE_ORDER', orderId });

    setOrders(filteredOrders);
  }, [sessionId]);

  return { orders, addOrder, updateOrder, deleteOrder };
}
```

## 8. 주문 집계 알고리즘

### 8.1 메뉴별 집계 (Map 기반)
```typescript
function aggregateByMenu(orders: Order[]): MenuSummaryItem[] {
  const menuMap = new Map<string, {
    quantity: number;
    subtotal: number;
    unitPrice: number;
    orderedBy: Set<string>;
  }>();

  orders.forEach(order => {
    order.items.forEach(item => {
      const key = item.menuName;

      if (menuMap.has(key)) {
        const existing = menuMap.get(key)!;
        existing.quantity += item.quantity;
        existing.subtotal += item.price * item.quantity;
        existing.orderedBy.add(order.participantName);
      } else {
        menuMap.set(key, {
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          unitPrice: item.price,
          orderedBy: new Set([order.participantName]),
        });
      }
    });
  });

  return Array.from(menuMap.entries()).map(([menuName, data]) => ({
    menuName,
    totalQuantity: data.quantity,
    unitPrice: data.unitPrice,
    subtotal: data.subtotal,
    orderedBy: Array.from(data.orderedBy),
  }));
}
```

### 8.2 참가자별 집계
```typescript
function aggregateByParticipant(orders: Order[]): ParticipantBill[] {
  return orders.map(order => {
    const totalAmount = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      participantName: order.participantName,
      items: order.items,
      totalAmount,
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount); // 금액 내림차순
}
```

### 8.3 통계 계산
```typescript
interface OrderStats {
  totalAmount: number;
  averageAmount: number;
  maxAmount: number;
  minAmount: number;
  participantCount: number;
  totalItems: number;
  mostPopularMenu: string;
}

function calculateStats(orders: Order[]): OrderStats {
  const participantBills = aggregateByParticipant(orders);
  const menuSummary = aggregateByMenu(orders);

  const amounts = participantBills.map(p => p.totalAmount);
  const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0);

  const mostPopular = menuSummary.reduce((max, item) =>
    item.totalQuantity > max.totalQuantity ? item : max
  , menuSummary[0] || { menuName: 'N/A', totalQuantity: 0 });

  return {
    totalAmount,
    averageAmount: Math.round(totalAmount / participantBills.length),
    maxAmount: Math.max(...amounts),
    minAmount: Math.min(...amounts),
    participantCount: participantBills.length,
    totalItems: orders.reduce((sum, o) => sum + o.items.length, 0),
    mostPopularMenu: mostPopular.menuName,
  };
}
```

## 9. 컴포넌트 구조

### 9.1 전체 구조
```
src/
├── components/
│   ├── host/
│   │   ├── CreateSessionForm.tsx      # 세션 생성 폼
│   │   ├── SessionQRCode.tsx          # QR 코드 생성 & 링크 공유
│   │   ├── LiveDashboard.tsx          # 실시간 주문 현황
│   │   ├── MenuSummaryTable.tsx       # 메뉴별 집계 테이블
│   │   ├── ParticipantList.tsx        # 참여자 목록
│   │   └── OrderSummaryExport.tsx     # 주문서 출력/공유
│   │
│   ├── participant/
│   │   ├── JoinSession.tsx            # 세션 참여 (닉네임 입력)
│   │   ├── MenuSelector.tsx           # 메뉴 선택 (고정 모드)
│   │   ├── FreeInputForm.tsx          # 자유 입력 (자유 모드)
│   │   ├── OrderCart.tsx              # 장바구니 (수량 조절)
│   │   └── OrderConfirmation.tsx      # 주문 확인/제출
│   │
│   ├── shared/
│   │   ├── MenuItem.tsx               # 메뉴 아이템 카드
│   │   ├── PriceDisplay.tsx           # 가격 표시 (천 단위 콤마)
│   │   ├── Timer.tsx                  # 마감 타이머
│   │   └── CopyButton.tsx             # 링크 복사 버튼
│   │
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Container.tsx
│
├── hooks/
│   ├── useOrderSync.ts                # 실시간 주문 동기화
│   ├── useSession.ts                  # 세션 관리
│   ├── useQRCode.ts                   # QR 코드 생성
│   └── useOrderSummary.ts             # 주문 집계
│
├── services/
│   ├── OrderBroadcaster.ts            # BroadcastChannel 래퍼
│   ├── storage.ts                     # localStorage 유틸
│   ├── orderService.ts                # 주문 CRUD
│   └── exportService.ts               # 주문서 내보내기
│
├── types/
│   └── index.ts                       # 모든 타입 정의
│
├── pages/
│   ├── HomePage.tsx                   # 랜딩 페이지
│   ├── CreateSessionPage.tsx          # 세션 생성 페이지
│   ├── HostDashboardPage.tsx          # 호스트 대시보드
│   ├── JoinSessionPage.tsx            # 참여자 주문 페이지
│   └── SummaryPage.tsx                # 주문서 페이지
│
└── App.tsx
```

### 9.2 주요 컴포넌트 예시

#### CreateSessionForm.tsx
```typescript
export function CreateSessionForm() {
  const [restaurantName, setRestaurantName] = useState('');
  const [mode, setMode] = useState<'fixed' | 'free'>('fixed');
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const navigate = useNavigate();

  const handleSubmit = () => {
    const session = createSession({
      restaurantName,
      mode,
      menus,
      hostName: '주최자', // 나중에 사용자 입력받기
    });

    navigate(`/host/${session.id}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 가게 이름 입력 */}
      <input
        type="text"
        value={restaurantName}
        onChange={e => setRestaurantName(e.target.value)}
        placeholder="가게/식당 이름"
        required
      />

      {/* 모드 선택 */}
      <div>
        <label>
          <input
            type="radio"
            value="fixed"
            checked={mode === 'fixed'}
            onChange={() => setMode('fixed')}
          />
          고정 메뉴 (미리 메뉴 입력)
        </label>
        <label>
          <input
            type="radio"
            value="free"
            checked={mode === 'free'}
            onChange={() => setMode('free')}
          />
          자유 입력 (참가자가 직접 입력)
        </label>
      </div>

      {/* 고정 메뉴 모드일 때만 메뉴 입력 */}
      {mode === 'fixed' && (
        <MenuInputList menus={menus} setMenus={setMenus} />
      )}

      <button type="submit">세션 생성</button>
    </form>
  );
}
```

#### LiveDashboard.tsx
```typescript
export function LiveDashboard({ sessionId }: { sessionId: string }) {
  const { orders } = useOrderSync(sessionId);
  const summary = useOrderSummary(sessionId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 왼쪽: 참여자 목록 */}
      <ParticipantList orders={orders} />

      {/* 오른쪽: 메뉴별 집계 */}
      <MenuSummaryTable summary={summary.menuSummary} />

      {/* 하단: 통계 */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="총 금액" value={`${summary.totalAmount.toLocaleString()}원`} />
          <StatCard label="참여 인원" value={`${summary.participantCount}명`} />
          <StatCard label="1인당" value={`${summary.perPersonAmount.toLocaleString()}원`} />
        </div>
      </div>
    </div>
  );
}
```

#### MenuSelector.tsx (참가자용)
```typescript
export function MenuSelector({
  sessionId,
  onSubmit
}: {
  sessionId: string;
  onSubmit: (order: Omit<Order, 'id' | 'submittedAt'>) => void;
}) {
  const [session] = useState<OrderSession>(() =>
    JSON.parse(localStorage.getItem(`session:${sessionId}`) || '{}')
  );
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [participantName, setParticipantName] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  const handleAddItem = (menu: MenuItem, quantity: number) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.menuId === menu.id);
      if (existing) {
        return prev.map(item =>
          item.menuId === menu.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: nanoid(10),
        menuId: menu.id,
        menuName: menu.name,
        price: menu.price,
        quantity,
      }];
    });
  };

  const handleSubmit = () => {
    onSubmit({
      sessionId,
      participantName,
      items: selectedItems,
      specialRequest: specialRequest || undefined,
    });
  };

  return (
    <div>
      {/* 닉네임 입력 */}
      <input
        type="text"
        value={participantName}
        onChange={e => setParticipantName(e.target.value)}
        placeholder="닉네임 입력"
        required
      />

      {/* 메뉴 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {session.menus.map(menu => (
          <MenuItem
            key={menu.id}
            menu={menu}
            onAdd={quantity => handleAddItem(menu, quantity)}
          />
        ))}
      </div>

      {/* 장바구니 */}
      <OrderCart items={selectedItems} setItems={setSelectedItems} />

      {/* 특이사항 */}
      <textarea
        value={specialRequest}
        onChange={e => setSpecialRequest(e.target.value)}
        placeholder="특이사항 (선택)"
      />

      <button onClick={handleSubmit}>주문하기</button>
    </div>
  );
}
```

## 10. 라우팅 구조

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateSessionPage />} />
        <Route path="/host/:sessionId" element={<HostDashboardPage />} />
        <Route path="/join/:sessionId" element={<JoinSessionPage />} />
        <Route path="/summary/:sessionId" element={<SummaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 11. 추가 기능 아이디어

### 11.1 MVP 이후 확장 가능성
- 주문 수정 기능 (마감 전까지)
- 참가자 강퇴 (호스트 권한)
- 메뉴 추천 (인기 메뉴 표시)
- 과거 주문 이력 저장
- 정산 완료 체크
- 카카오페이 송금 링크 생성
- PWA 설치 지원
- 알림 기능 (새 주문 알림)

### 11.2 기술 개선
- IndexedDB로 마이그레이션 (더 큰 저장 공간)
- WebRTC를 통한 P2P 동기화
- Service Worker로 오프라인 지원

## 12. 참고 자료

### 배달의민족 함께주문 분석
- [우아한형제들 기술블로그 - 함께주문 오픈 이야기](https://techblog.woowahan.com/10232/)

### BroadcastChannel API
- [DigitalOcean - How to use the BroadcastChannel API](https://www.digitalocean.com/community/tutorials/js-broadcastchannel-api)
- [Telerik - Ultimate Guide to Broadcast Channel API](https://www.telerik.com/blogs/ultimate-guide-broadcast-channel-api)
- [TabStateSync Library (TypeScript)](https://github.com/robertluiz/TabStateSync)

### 라이브러리
- [node-qrcode](https://github.com/soldair/node-qrcode)
- [html2canvas](https://html2canvas.hertzen.com/)
- [nanoid](https://github.com/ai/nanoid)

## 15. MCP 개발 도구

### 15.1 UI 컴포넌트 개발
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 15.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조

---

**PRD 작성일**: 2025-12-20
**버전**: 1.0
**담당자**: SeolCoding
