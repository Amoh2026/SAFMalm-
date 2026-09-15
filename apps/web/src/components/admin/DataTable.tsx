'use client';

import type { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
}

interface DataTableProps<T extends Record<string, any> = Record<string, any>> {
  columns: Column[];
  data: T[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => ReactNode;
}

export function DataTable<T extends Record<string, any> = Record<string, any>>({
  columns,
  data,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-lg font-medium">Inga data hittades</p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    if (!status) {
      return 'bg-gray-100 text-gray-700 border-gray-300';
    }

    const s = status.toLowerCase();

    // Green — positive
    if (['approved', 'godkänd', 'confirmed', 'bekräftad', 'active', 'publicerad', 'published', 'upcoming'].includes(s)) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }

    // Yellow/amber — waiting
    if (['pending', 'väntar'].includes(s)) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }

    // Red — negative
    if (['rejected', 'avvisad', 'cancelled', 'avbokad', 'inactive'].includes(s)) {
      return 'bg-rose-100 text-rose-800 border-rose-300';
    }

    // Blue — informational
    if (['ongoing', 'draft', 'utkast'].includes(s)) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }

    // Purple — past / archived
    if (['past', 'archived', 'arkiverad'].includes(s)) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }

    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusLabel = (status: string) => {
    if (!status) return 'Okänd';

    const s = status.toLowerCase();
    const labels: Record<string, string> = {
      confirmed: 'Bekräftad',
      approved: 'Godkänd',
      pending: 'Väntar',
      cancelled: 'Avbokad',
      rejected: 'Avvisad',
      active: 'Aktiv',
      inactive: 'Inaktiv',
      publicerad: 'Publicerad',
      published: 'Publicerad',
      upcoming: 'Kommande',
      ongoing: 'Pågående',
      past: 'Avslutad',
      draft: 'Utkast',
      utkast: 'Utkast',
      archived: 'Arkiverad',
      arkiverad: 'Arkiverad',
    };
    return labels[s] ?? status;
  };

  const getStatusDot = (status: string) => {
    if (!status) return 'bg-gray-400';
    const s = status.toLowerCase();

    if (['approved', 'godkänd', 'confirmed', 'bekräftad', 'active', 'publicerad', 'published', 'upcoming'].includes(s))
      return 'bg-emerald-500';
    if (['pending', 'väntar'].includes(s)) return 'bg-amber-500';
    if (['rejected', 'avvisad', 'cancelled', 'avbokad', 'inactive'].includes(s))
      return 'bg-rose-500';
    if (['ongoing', 'draft', 'utkast'].includes(s)) return 'bg-blue-500';
    if (['past', 'archived', 'arkiverad'].includes(s)) return 'bg-purple-500';
    return 'bg-gray-400';
  };

  const formatDateValue = (value: any) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return String(value);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-blue-900 to-blue-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-4 px-4 font-semibold text-white text-sm uppercase tracking-wider first:rounded-tl-xl"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="text-right py-4 px-4 font-semibold text-white text-sm uppercase tracking-wider last:rounded-tr-xl">
                Åtgärder
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className={`border-b border-gray-100 transition-colors duration-150 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
              } ${onRowClick ? 'cursor-pointer' : ''} hover:bg-blue-50/60`}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-4 px-4 text-gray-700">
                  {col.key === 'status' ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                        item[col.key]
                      )}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item[col.key])}`} />
                      {getStatusLabel(item[col.key])}
                    </span>
                  ) : col.key === 'date' ? (
                    <span className="text-sm">{formatDateValue(item[col.key])}</span>
                  ) : (
                    <span className="text-sm">{item[col.key] || '—'}</span>
                  )}
                </td>
              ))}
              {actions && (
                <td
                  className="py-4 px-4 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end gap-2">
                    {actions(item)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;