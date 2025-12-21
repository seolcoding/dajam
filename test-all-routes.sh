#!/bin/bash
echo "=== Testing All 16 App Routes ==="
echo ""

apps=(
  "salary-calculator:급여 계산기"
  "rent-calculator:전월세 계산기"
  "gpa-calculator:학점 계산기"
  "dutch-pay:더치페이"
  "ideal-worldcup:이상형 월드컵"
  "balance-game:밸런스 게임"
  "chosung-quiz:초성 퀴즈"
  "ladder-game:사다리 게임"
  "bingo-game:빙고 게임"
  "live-voting:실시간 투표"
  "random-picker:랜덤 뽑기"
  "team-divider:팀 나누기"
  "lunch-roulette:점심 룰렛"
  "group-order:단체 주문"
  "id-validator:신분증 검증기"
  "student-network:수강생 네트워킹"
)

passed=0
failed=0

for app in "${apps[@]}"; do
  IFS=':' read -r path name <<< "$app"
  status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/$path)
  
  if [ "$status_code" = "200" ]; then
    echo "✅ $name ($path): $status_code"
    ((passed++))
  else
    echo "❌ $name ($path): $status_code"
    ((failed++))
  fi
done

echo ""
echo "=== Summary ==="
echo "Passed: $passed / 16"
echo "Failed: $failed / 16"
