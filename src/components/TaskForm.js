import React, { useState } from 'react';
import { Plus } from 'lucide-react';

function TaskForm({ onAddTask }) {
  const [taskText, setTaskText] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('09:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (onAddTask(taskText, taskDate, taskTime)) {
      setTaskText('');
      setTaskDate('');
      setTaskTime('09:00');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Adicionar Nova Tarefa
      </h2>
      
      <div className="space-y-3">
        <input
          type="text"
          placeholder="O que você precisa fazer?"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
          
          <input
            type="time"
            value={taskTime}
            onChange={(e) => setTaskTime(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar
          </button>
        </div>
      </div>
    </form>
  );
}

export default TaskForm;