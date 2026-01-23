# Cayo Perico Planner (分贓計算機)

> **The ultimate loot optimization tool for the Cayo Perico Heist in GTA Online.**
> **專為 GTA Online 佩里克島搶劫任務設計的最佳分贓計算機。**

![GitHub release (latest by date)](https://img.shields.io/github/v/release/a71287300/GTA_Perico)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/a71287300/GTA_Perico/deploy.yml)

[English](#english) | [繁體中文](#繁體中文)

---

## 繁體中文

**Cayo Perico Planner** 是一個簡單易用的網頁應用程式，幫助玩家在佩里克島搶劫任務中計算出**最佳的團隊人數**與**分贓方案**。

### ✨ 主要功能 (Features)

*   **🏆 智慧演算最佳化**: 自動計算最高價值的拿取組合（優先序：黃金 > 古柯鹼 > 畫作 > 大麻 > 現金）。
*   **🔢 精準次數提示**: 根據 Reddit 社群驗證的數據，精準告訴您每堆財物需要「抓幾次」(例如：`約 4 抓`)，不再需要憑感覺猜測。
*   **👥 人數最佳化**: 根據偵察結果，建議最適合的隊員人數（上限 4 人），避免因背包空間不足而浪費，或因人手過多而分錢變少。
*   **🗺️ 路線導引**: 將拿取清單分為 **「✈️ 機場 (Airstrip)」** 與 **「🏰 莊園 (Compound)」** 兩個階段，符合先拿機場再進莊園或是反之的主流打法。
*   **💰 現金來源區分**: 明確區分「莊園內」與「機場/碼頭」的現金，避免混淆。

### 🚀 如何使用

1.  **偵察 (Scope)**: 在遊戲中偵察各個財物點，記錄數量。
2.  **輸入 (Input)**: 在網頁左側輸入偵察到的「黃金」、「畫作」、「古柯鹼」等數量。
3.  **計算 (Calculate)**: 點擊計算按鈕。
4.  **分配 (Assign)**: 查看右側的推薦卡片，指派每位隊員負責拿什麼。卡片上會顯示：
    *   **第一站**: 去機場拿什麼 (含抓取次數)。
    *   **第二站**: 去莊園拿什麼。
    *   **背包狀態**: 預計會裝多滿。

### 🛠️ 技術細節

*   **框架**: React + Vite + TypeScript
*   **UI**: Tailwind CSS + Shadcn/ui
*   **測試**: Vitest (包含針對抓取邏輯的單元測試)

---

## English

**Cayo Perico Planner** is a web-based utility designed to optimize team composition and loot distribution for the Cayo Perico Heist in Grand Theft Auto Online.

### ✨ Key Features

*   **🏆 Smart Loot Algorithm**: Prioritizes high-value items automatically (Gold > Cocaine > Painting > Weed > Cash).
*   **🔢 Precise Grab Counts**: Tells you exactly how many "grabs" are needed for partial stacks (e.g., `~4 grabs`), based on community-verified game mechanics.
*   **👥 Team Optimization**: Recommends the optimal team size (max 4 players) to maximize profit per player.
*   **🗺️ Route-Based Instructions**: Breaks down tasks into **"✈️ Airstrip"** and **"🏰 Compound"** sections for clear operational planning.
*   **💰 Source Distinction**: Clearly labels Cash from the Compound vs. the Airstrip.

### 🚀 How to Use

1.  **Scope**: Scout the island and count available secondary targets.
2.  **Input**: Enter the number of stacks for Gold, Paintings, Cocaine, etc., into the calculator.
3.  **Calculate**: Hit the button.
4.  **Assign**: Review the generated player cards. Each card dictates:
    *   **Step 1**: What to grab at the Airstrip (with specific grab counts).
    *   **Step 2**: What to grab at the Compound.
    *   **Bag Status**: Expected capacity usage.

### 🛠️ Tech Stack

*   **Framework**: React + Vite + TypeScript
*   **Styling**: Tailwind CSS + Shadcn/ui
*   **Testing**: Vitest (Includes unit tests for loot logic)

---

## 📄 License

MIT License.
