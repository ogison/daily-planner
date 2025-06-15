"use client";

import React, { useState, useEffect } from "react";
import {
  ScheduleItem,
  ScheduleCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  formatTime,
  timeToMinutes,
  minutesToTime,
} from "@/types/schedule";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";

interface ScheduleTableProps {
  items: ScheduleItem[];
  onAdd: (item: Omit<ScheduleItem, "id">) => void;
  onUpdate: (id: string, updates: Partial<ScheduleItem>) => void;
  onDelete: (id: string) => void;
  selectedItem?: ScheduleItem | null;
}

interface EditingItem {
  id: string | null;
  title: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  category: ScheduleCategory;
  notes: string;
  color: string;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  items,
  onAdd,
  onUpdate,
  onDelete,
  selectedItem,
}) => {
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createEmptyEditingItem = (): EditingItem => ({
    id: null,
    title: "",
    startHour: "09",
    startMinute: "00",
    endHour: "10",
    endMinute: "00",
    category: "other",
    notes: "",
    color: CATEGORY_COLORS["other"],
  });

  const itemToEditingItem = (item: ScheduleItem): EditingItem => {
    const startTime = minutesToTime(item.startTime);
    const endTime = minutesToTime(item.endTime);

    return {
      id: item.id,
      title: item.title,
      startHour: startTime.hour.toString().padStart(2, "0"),
      startMinute: startTime.minute.toString().padStart(2, "0"),
      endHour: endTime.hour.toString().padStart(2, "0"),
      endMinute: endTime.minute.toString().padStart(2, "0"),
      category: item.category,
      notes: item.notes || "",
      color: item.color || CATEGORY_COLORS[item.category],
    };
  };

  const validateEditingItem = (item: EditingItem): string | null => {
    if (!item.title.trim()) return "タイトルを入力してください";

    const startTime = timeToMinutes(
      parseInt(item.startHour),
      parseInt(item.startMinute)
    );
    const endTime = timeToMinutes(
      parseInt(item.endHour),
      parseInt(item.endMinute)
    );

    if (startTime >= endTime)
      return "終了時刻は開始時刻より後に設定してください";
    if (startTime < 0 || endTime > 1440) return "時刻が無効です";

    return null;
  };

  const handleSave = () => {
    if (!editingItem) return;

    const error = validateEditingItem(editingItem);
    if (error) {
      alert(error);
      return;
    }

    const startTime = timeToMinutes(
      parseInt(editingItem.startHour),
      parseInt(editingItem.startMinute)
    );
    const endTime = timeToMinutes(
      parseInt(editingItem.endHour),
      parseInt(editingItem.endMinute)
    );

    const itemData = {
      title: editingItem.title.trim(),
      startTime,
      endTime,
      category: editingItem.category,
      notes: editingItem.notes.trim(),
      color: editingItem.color,
    };

    if (editingItem.id) {
      onUpdate(editingItem.id, itemData);
    } else {
      onAdd(itemData);
    }

    setEditingItem(null);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAdding(false);
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(itemToEditingItem(item));
    setIsAdding(false);
  };

  const handleAdd = () => {
    setEditingItem(createEmptyEditingItem());
    setIsAdding(true);
  };

  useEffect(() => {
    if (selectedItem && !editingItem) {
      setEditingItem(itemToEditingItem(selectedItem));
      setIsAdding(false);
    }
  }, [selectedItem, editingItem]);

  const renderEditingRow = () => {
    if (!editingItem) return null;

    return (
      <tr className="bg-blue-50 border-2 border-blue-200">
        <td className="px-4 py-3">
          <input
            type="text"
            value={editingItem.title}
            onChange={(e) =>
              setEditingItem({ ...editingItem, title: e.target.value })
            }
            className="w-full px-2 py-1 border rounded text-sm"
            placeholder="予定のタイトル"
            autoFocus
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-1 items-center">
            <input
              type="number"
              value={editingItem.startHour}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  startHour: e.target.value.padStart(2, "0"),
                })
              }
              min="0"
              max="23"
              className="w-12 px-1 py-1 border rounded text-xs text-center"
            />
            <span className="text-xs">:</span>
            <input
              type="number"
              value={editingItem.startMinute}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  startMinute: e.target.value.padStart(2, "0"),
                })
              }
              min="0"
              max="59"
              step="15"
              className="w-12 px-1 py-1 border rounded text-xs text-center"
            />
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-1 items-center">
            <input
              type="number"
              value={editingItem.endHour}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  endHour: e.target.value.padStart(2, "0"),
                })
              }
              min="0"
              max="23"
              className="w-12 px-1 py-1 border rounded text-xs text-center"
            />
            <span className="text-xs">:</span>
            <input
              type="number"
              value={editingItem.endMinute}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  endMinute: e.target.value.padStart(2, "0"),
                })
              }
              min="0"
              max="59"
              step="15"
              className="w-12 px-1 py-1 border rounded text-xs text-center"
            />
          </div>
        </td>
        <td className="px-4 py-3">
          <select
            value={editingItem.category}
            onChange={(e) => {
              const newCategory = e.target.value as ScheduleCategory;
              setEditingItem({
                ...editingItem,
                category: newCategory,
                color: CATEGORY_COLORS[newCategory], // Update color when category changes
              });
            }}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={editingItem.color}
              onChange={(e) =>
                setEditingItem({ ...editingItem, color: e.target.value })
              }
              className="w-8 h-8 border rounded cursor-pointer"
              title="色を選択"
            />
            <input
              type="text"
              value={editingItem.color}
              onChange={(e) =>
                setEditingItem({ ...editingItem, color: e.target.value })
              }
              className="w-20 px-2 py-1 border rounded text-xs"
              placeholder="#000000"
            />
          </div>
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={editingItem.notes}
            onChange={(e) =>
              setEditingItem({ ...editingItem, notes: e.target.value })
            }
            className="w-full px-2 py-1 border rounded text-sm"
            placeholder="メモ"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="保存"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              title="キャンセル"
            >
              <X size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const sortedItems = [...items].sort((a, b) => a.startTime - b.startTime);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">スケジュール詳細</h3>
        <button
          onClick={handleAdd}
          disabled={isAdding || editingItem !== null}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Plus size={16} />
          追加
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                予定
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                開始
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                終了
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                色
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メモ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isAdding && (
              <React.Fragment key="adding-row">
                {renderEditingRow()}
              </React.Fragment>
            )}
            {sortedItems.map((item) =>
              editingItem?.id === item.id ? (
                <React.Fragment key={`editing-row-${item.id}`}>
                  {renderEditingRow()}
                </React.Fragment>
              ) : (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 ${
                    selectedItem?.id === item.id ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatTime(item.startTime)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatTime(item.endTime)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: item.color }}
                        title={item.color}
                      />
                      <span className="text-xs text-gray-500 font-mono">
                        {item.color}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.notes && (
                      <span
                        className="truncate max-w-xs block"
                        title={item.notes}
                      >
                        {item.notes}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="編集"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {sortedItems.length === 0 && !isAdding && (
        <div className="px-4 py-8 text-center text-gray-500">
          スケジュールが登録されていません
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;
