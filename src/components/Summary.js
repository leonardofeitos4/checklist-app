import React from 'react';

function Summary({ tasks, overdueTasks }) {
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === today).length;
  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="font-bold text-gray-800 mb-4">📊 Resumo</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
          <p className="text-sm text-gray-600">Concluídas</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{todayTasks}</p>
          <p className="text-sm text-gray-600">Hoje</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
          <p className="text-sm text-gray-600">Atrasadas</p>
        </div>
      </div>
    </div>
  );
}

export default Summary;