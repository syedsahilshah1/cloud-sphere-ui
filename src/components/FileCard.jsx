import React from 'react';
import { FileText, Image as ImageIcon, FileSpreadsheet, Film, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';

const iconMap = {
  document: { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  image: { icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-100' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  video: { icon: Film, color: 'text-purple-600', bg: 'bg-purple-100' },
};

export default function FileCard({ file }) {
  const { icon: Icon, color, bg } = iconMap[file.type] || iconMap.document;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative flex flex-col h-48">
      <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical size={20} />
      </button>

      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", bg)}>
        <Icon size={24} className={color} />
      </div>

      <div className="mt-auto">
        <h3 className="font-semibold text-slate-800 truncate" title={file.name}>
          {file.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Last opened {file.lastOpened}
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex -space-x-2">
            {file.members.slice(0, 3).map((member, i) => (
              <img 
                key={i}
                src={member.avatar} 
                alt="Member" 
                className="w-6 h-6 rounded-full border-2 border-white object-cover"
              />
            ))}
            {file.members.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-600 z-10">
                +{file.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
