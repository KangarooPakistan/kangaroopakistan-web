// Tabs.tsx

import React, { FC } from "react";

interface TabProps {
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const Tab: FC<TabProps> = ({ label, onClick, isActive }) => (
  <a
    href="#"
    className={`inline-block p-4 ${
      isActive
        ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg active "
        : "text-gray-500 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300"
    }`}
    onClick={onClick}
  >
    {label}
  </a>
);

interface TabsProps {
  tabs: { id: number; label: string }[];
  activeTab: number;
  onTabClick: (tabId: number) => void;
}

const Tabs: FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => (
  <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 ">
    <ul className="flex flex-wrap -mb-px">
      {tabs.map((tab) => (
        <li key={tab.id} className="me-2">
          <Tab
            label={tab.label}
            onClick={() => onTabClick(tab.id)}
            isActive={activeTab === tab.id}
          />
        </li>
      ))}
    </ul>
  </div>
);

export default Tabs;
