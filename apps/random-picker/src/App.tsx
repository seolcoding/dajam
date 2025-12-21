import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useWheelStore } from "@/store/wheel-store";
import { SpinAnimator } from "@/lib/spin-animator";
import { WheelCanvas } from "@/components/WheelCanvas";
import { ItemInput } from "@/components/ItemInput";
import { ItemList } from "@/components/ItemList";
import { BulkInput } from "@/components/BulkInput";
import { ResultModal } from "@/components/ResultModal";
import { HistoryPanel } from "@/components/HistoryPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Button } from "@mini-apps/ui";
import { Card } from "@mini-apps/ui";
import { Trash2 } from "lucide-react";
import type { SpinResult } from "@/types";

function App() {
  const {
    items,
    currentRotation,
    currentIndex,
    isSpinning,
    history,
    settings,
    selectedResult,
    addItem,
    addItems,
    removeItem,
    updateItem,
    clearItems,
    setCurrentRotation,
    setCurrentIndex,
    setIsSpinning,
    addResult,
    setSelectedResult,
    clearHistory,
    updateSettings,
    loadFromStorage,
  } = useWheelStore();

  const animatorRef = useRef(new SpinAnimator());

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleSpin = () => {
    if (isSpinning || items.length < 2) return;

    setIsSpinning(true);

    animatorRef.current.spin(
      currentRotation,
      items,
      (rotation, index) => {
        setCurrentRotation(rotation);
        setCurrentIndex(index);
      },
      (selectedItem) => {
        const result: SpinResult = {
          id: crypto.randomUUID(),
          selectedItem,
          timestamp: Date.now(),
          rotation: currentRotation,
          itemsSnapshot: items,
        };

        setIsSpinning(false);
        addResult(result);
        setSelectedResult(result);

        // Confetti effect
        if (settings.confettiEnabled) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    );
  };

  const handleDownloadImage = () => {
    // This would require html-to-image implementation
    // For now, just show alert
    alert("이미지 다운로드 기능은 추후 구현 예정입니다.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">랜덤 뽑기 룰렛</h1>
              <p className="text-sm text-gray-600 mt-1">
                공정하고 재미있는 랜덤 선택 도구
              </p>
            </div>
            <div className="flex gap-2">
              <HistoryPanel history={history} onClear={clearHistory} />
              <SettingsPanel settings={settings} onUpdate={updateSettings} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6">
          {/* Left Panel: Items */}
          <div className="space-y-4">
            <Card className="p-5 bg-white border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">항목 관리</h2>
              <div className="space-y-3">
                <ItemInput onAdd={addItem} disabled={isSpinning} />
                <BulkInput onAdd={addItems} disabled={isSpinning} />
                {items.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-100"
                    onClick={clearItems}
                    disabled={isSpinning}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    전체 삭제
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-5 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  항목 목록 ({items.length})
                </h2>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {items.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    항목을 추가해주세요
                  </div>
                ) : (
                  <ItemList
                    items={items}
                    onRemove={removeItem}
                    onUpdate={updateItem}
                    disabled={isSpinning}
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Right Panel: Wheel */}
          <Card className="p-8 bg-white border-gray-200 shadow-sm">
            <div className="aspect-square max-w-2xl mx-auto">
              <WheelCanvas
                items={items}
                rotation={currentRotation}
                onSpin={handleSpin}
                isSpinning={isSpinning}
              />
            </div>

            {items.length >= 2 && (
              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="px-16 py-6 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                >
                  {isSpinning ? "회전 중..." : "SPIN!"}
                </Button>
                {currentIndex !== null && items[currentIndex] && (
                  <div className="mt-4 text-gray-600 font-medium">
                    현재 위치: {items[currentIndex].label}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>

      <ResultModal
        result={selectedResult}
        open={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        onDownload={handleDownloadImage}
      />
    </div>
  );
}

export default App;
