import React from 'react';

function FilterButtons({ filter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'today', label: 'Hoje' },
    { id: 'overdue', label: 'Atrasadas' },
    { id: 'upcoming', label: 'Próximas' },
    { id: 'completed', label: 'Concluídas' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map(f => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`px-4 py-2 rounded-lg transition ${
            filter === f.id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export default FilterButtons;