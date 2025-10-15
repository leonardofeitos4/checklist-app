import React from 'react';
import { Calendar, Trash2, Check } from 'lucide-react';
import { addToGoogleCalendar } from '../utils/googleCalendar';

function TaskItem({ task, onToggle, onDelete }) {
  const getTaskStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const taskDate = task.date;
    
    if (task.completed) return 'completed';
    if (taskDate < today) return 'overdue';
    if (taskDate === today) return 'today';
    return 'upcoming';
  };

  const status = getTaskStatus();
  
  const statusStyles = {
    completed: 'bg-green-50 border-green-200',
    overdue: 'bg-red-50 border-red-300',
    today: 'bg-yellow-50 border-yellow-300',
    upcoming: 'bg-white border-gray-200'
  };

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
          <p className={`font-medium ${
            task.completed ? 'line-through text-gray-400' : 'text-gray-800'
          }`}>
            {task.text}
          </p>
          <p className="text-sm text-gray-500">
            {formatDate(task.date)}
          </p>
        </div>

        <button
          onClick={() => addToGoogleCalendar(task)}
          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
          title="Adicionar ao Google Calendar"
        >
          <Calendar className="w-5 h-5" />
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