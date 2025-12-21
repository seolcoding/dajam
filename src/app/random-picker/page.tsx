import type { Metadata } from "next";
import RandomPickerClient from "./RandomPickerClient";

export const metadata: Metadata = {
  title: "랜덤 뽑기 룰렛 | 공정한 랜덤 선택 도구",
  description: "공정하고 재미있는 랜덤 뽑기 룰렛. 암호학적으로 안전한 랜덤 알고리즘으로 완전한 공정성을 보장합니다.",
  keywords: ["랜덤 뽑기", "룰렛", "추첨", "랜덤 선택", "공정한 추첨", "무작위 선택"],
  openGraph: {
    title: "랜덤 뽑기 룰렛",
    description: "공정하고 재미있는 랜덤 선택 도구",
    type: "website",
  },
};

export default function RandomPickerPage() {
  return <RandomPickerClient />;
}
