import React from 'react';
import { CalendarPlus, Trash2, Check, Clock } from 'lucide-react';
import { addToGoogleCalendar } from '../utils/googleCalendar';

function TaskItem({ task, onToggle, onDelete }) {
  const getTaskStatus = () => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const nowTime = new Date().toLocaleTimeString('en-CA', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const nowDT = `${today}T${nowTime}`; // YYYY-MM-DDTHH:mm:ss em São Paulo
    const taskDT = `${task.date}T${(task.time || '09:00')}:00`;

    if (task.completed) return 'completed';
    if (taskDT < nowDT) return 'overdue';
    if (task.date === today) return 'today';
    return 'upcoming';
  };

  const status = getTaskStatus();
  
  const statusStyles = {
    completed: 'bg-green-50 border-green-200',
    overdue: 'bg-red-50 border-red-300',
    today: 'bg-yellow-50 border-yellow-300',
    upcoming: 'bg-white border-gray-200'
  };

  const statusBadge = {
    completed: 'bg-green-100 text-green-800 border-green-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    today: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    upcoming: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const statusLabel = {
    completed: 'Concluída',
    overdue: 'Atrasada',
    today: 'Hoje',
    upcoming: 'Próxima'
  };

  const formatDate = (dateString, timeString) => {
    const dt = new Date(`${dateString}T${(timeString || '09:00')}:00`);
    const s = dt.toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Sao_Paulo'
    });
    // Remover o ponto do dia da semana curto: "dom.," -> "dom,"
    return s.replace(/\b(\w{3})\.,/, '$1,');
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition ${statusStyles[status]}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-indigo-500'
          }`}
        >
          {task.completed && <Check className="w-4 h-4 text-white" />}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`font-medium ${
              task.completed ? 'line-through text-gray-400' : 'text-gray-800'
            }`}>
              {task.text}
            </p>
            <span className={`text-xs border px-2 py-1 rounded-full font-medium ${statusBadge[status]}`}>
              {statusLabel[status]}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <CalendarPlus className="w-5 h-5" />
            <span>{formatDate(task.date, task.time)}</span>
          </div>
        </div>

        <button
          onClick={() => addToGoogleCalendar(task)}
          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
          title="Adicionar ao Google Calendar"
        >
          <CalendarPlus className="w-5 h-5" />
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default TaskItem;