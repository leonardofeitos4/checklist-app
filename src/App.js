import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import FilterButtons from './components/FilterButtons';
import Summary from './components/Summary';
import { loadTasks, saveTasks } from './utils/storage';
import { initGoogleAPI } from './utils/googleCalendar';

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [googleApiReady, setGoogleApiReady] = useState(false);

  // Carregar tarefas salvas ao iniciar
  useEffect(() => {
    const savedTasks = loadTasks();
    setTasks(savedTasks);
  }, []);

  // Salvar tarefas sempre que mudarem
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Inicializar Google API ao carregar o app
  useEffect(() => {
    const initGoogle = async () => {
      try {
        const initialized = await initGoogleAPI();
        setGoogleApiReady(initialized);
        if (initialized) {
          console.log('✅ Google Calendar API inicializada');
        } else {
          console.warn('⚠️ Google Calendar API não inicializada');
        }
      } catch (error) {
        console.error('Erro ao inicializar Google API:', error);
      }
    };

    initGoogle();
  }, []);

  const addTask = (taskText, taskDate, taskTime) => {
    if (taskText.trim() && taskDate) {
      const newTask = {
        id: Date.now(),
        text: taskText,
        date: taskDate,
        time: taskTime || '09:00',
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, newTask]);
      return true;
    }
    return false;
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getFilteredTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch(filter) {
      case 'today':
        return tasks.filter(t => t.date === today);
      case 'overdue':
        return tasks.filter(t => t.date < today && !t.completed);
      case 'upcoming':
        return tasks.filter(t => t.date > today);
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks().sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  const overdueTasks = tasks.filter(t => 
    t.date < new Date().toISOString().split('T')[0] && !t.completed
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Meu Checklist</h1>
          </div>

          {overdueTasks > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-semibold">
                  {overdueTasks} tarefa{overdueTasks > 1 ? 's' : ''} atrasada{overdueTasks > 1 ? 's' : ''}!
                </span>
              </div>
            </div>
          )}

          <TaskForm onAddTask={addTask} />
          <FilterButtons filter={filter} onFilterChange={setFilter} />
          <TaskList 
            tasks={filteredTasks} 
            onToggle={toggleTask} 
            onDelete={deleteTask} 
          />
        </div>

        <Summary tasks={tasks} overdueTasks={overdueTasks} />
      </div>
    </div>
  );
}

export default App;