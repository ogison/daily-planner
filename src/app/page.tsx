"use client";

import React, { useState } from "react";
import CircularTimeGraph from "@/components/CircularTimeGraph";
import ScheduleTable from "@/components/ScheduleTable";
import ViewToggle from "@/components/ViewToggle";
import { useScheduleStore } from "@/store/schedule";
import { ScheduleItem } from "@/types/schedule";
// import { Calendar } from "lucide-react";
import { Header } from "@/components/Header";

const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export default function Home() {
  const [currentDate] = useState(getTodayString());
  const [viewMode, setViewMode] = useState<"schedule" | "category">("schedule");
  const {
    getCurrentSchedule,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
  } = useScheduleStore();

  const [selectedItem] = useState<ScheduleItem | null>(null);
  const currentSchedule = getCurrentSchedule(currentDate);

  // const handleDateChange = (date: string) => {
  //   setCurrentDate(date);
  //   setSelectedItem(null);
  // };

  const handleAddScheduleItem = (item: Omit<ScheduleItem, "id">) => {
    addScheduleItem(item, currentDate);
  };

  const handleUpdateScheduleItem = (
    id: string,
    updates: Partial<ScheduleItem>
  ) => {
    updateScheduleItem(id, updates, currentDate);
  };

  const handleDeleteScheduleItem = (id: string) => {
    deleteScheduleItem(id, currentDate);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {viewMode === "schedule" ? "24時間ビュー" : "カテゴリ別ビュー"}
                </h2>
                <ViewToggle view={viewMode} onViewChange={setViewMode} />
              </div>
              <CircularTimeGraph 
                scheduleItems={currentSchedule.items} 
                viewMode={viewMode}
              />
            </div>

            {selectedItem && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900">選択中の予定</h3>
                <p className="text-blue-800">{selectedItem.title}</p>
                <p className="text-sm text-blue-600">
                  {selectedItem.startTime && selectedItem.endTime
                    ? `${Math.floor(selectedItem.startTime / 60)
                        .toString()
                        .padStart(2, "0")}:${(selectedItem.startTime % 60)
                        .toString()
                        .padStart(2, "0")} - ${Math.floor(
                        selectedItem.endTime / 60
                      )
                        .toString()
                        .padStart(2, "0")}:${(selectedItem.endTime % 60)
                        .toString()
                        .padStart(2, "0")}`
                    : ""}
                </p>
              </div>
            )}
          </div>

          <div>
            <ScheduleTable
              items={currentSchedule.items}
              onAdd={handleAddScheduleItem}
              onUpdate={handleUpdateScheduleItem}
              onDelete={handleDeleteScheduleItem}
              selectedItem={selectedItem}
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">使い方</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800 mb-2">
                  1. 予定を追加
                </div>
                <p>
                  右側のテーブルから「追加」ボタンで新しい予定を登録できます
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800 mb-2">
                  2. 視覚的に確認
                </div>
                <p>左側の円グラフで一日の時間配分を直感的に把握できます</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800 mb-2">
                  3. 編集・管理
                </div>
                <p>円グラフまたはテーブルから予定をクリックして編集できます</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
