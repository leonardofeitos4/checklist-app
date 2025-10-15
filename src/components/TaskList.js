import React from 'react';
import { Clock } from 'lucide-react';
import TaskItem from './TaskItem';

function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Nenhuma tarefa aqui!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;