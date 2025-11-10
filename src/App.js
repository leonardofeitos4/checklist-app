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
    console.log('📂 Carregando tarefas salvas...');
    const savedTasks = loadTasks();
    console.log(`✅ ${savedTasks.length} tarefa(s) carregada(s)`);
    setTasks(savedTasks);
  }, []);

  // Salvar tarefas sempre que mudarem
  useEffect(() => {
    if (tasks.length > 0) {
      console.log('💾 Salvando tarefas...');
      saveTasks(tasks);
    }
  }, [tasks]);

  // Inicializar Google API ao carregar o app
  useEffect(() => {
    const initGoogle = async () => {
      try {
        console.log('🚀 Iniciando integração com Google Calendar...');
        console.log('⏰ Aguarde alguns segundos...');
        
        const initialized = await initGoogleAPI();
        setGoogleApiReady(initialized);
        
        if (initialized) {
          console.log('✅ Google Calendar API inicializada com SUCESSO!');
          console.log('🎉 Você pode adicionar tarefas ao seu calendário!');
        } else {
          console.error('⚠️ Google Calendar API NÃO inicializada');
          console.error('📋 Checklist de verificação:');
          console.error('   1. Google Calendar API está habilitada?');
          console.error('   2. CLIENT_ID está correto?');
          console.error('   3. http://localhost:3000 está nas origens autorizadas?');
          console.error('   4. Há erros específicos acima? ☝️');
          console.error('');
          console.error('🔗 Habilite a API aqui:');
          console.error('   https://console.cloud.google.com/apis/library/calendar-json.googleapis.com');
        }
      } catch (error) {
        console.error('❌ ERRO CRÍTICO ao inicializar Google API:');
        console.error(error);
      }
    };

    // Aguardar 1 segundo antes de inicializar (para garantir que gapi carregou)
    setTimeout(initGoogle, 1000);
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
      
      console.log('➕ Nova tarefa adicionada:', newTask);
      setTasks([...tasks, newTask]);
      return true;
    }
    return false;
  };

  const toggleTask = (id) => {
    console.log(`🔄 Alternando status da tarefa ${id}`);
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    console.log(`🗑️ Deletando tarefa ${id}`);
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getFilteredTasks = () => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const nowTime = new Date().toLocaleTimeString('en-CA', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const nowDT = `${today}T${nowTime}`;

    const toTaskDT = (t) => `${t.date}T${(t.time || '09:00')}:00`;
    
    switch(filter) {
      case 'today':
        return tasks.filter(t => t.date === today);
      case 'overdue':
        return tasks.filter(t => toTaskDT(t) < nowDT && !t.completed);
      case 'upcoming':
        return tasks.filter(t => toTaskDT(t) > nowDT);
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks().sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  const overdueTasks = tasks.filter(t => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const nowTime = new Date().toLocaleTimeString('en-CA', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const nowDT = `${today}T${nowTime}`;
    const taskDT = `${t.date}T${(t.time || '09:00')}:00`;
    return taskDT < nowDT && !t.completed;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Meu Checklist</h1>
            {googleApiReady ? (
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                ✅ Google Calendar Conectado
              </span>
            ) : (
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                ⚠️ Google Calendar Offline
              </span>
            )}
          </div>

          {!googleApiReady && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-700 font-semibold mb-1">
                    ⚠️ Integração com Google Calendar não está ativa
                  </p>
                  <p className="text-yellow-600 text-sm">
                    Verifique o console do navegador (F12) para mais detalhes. 
                    Certifique-se de que a Google Calendar API está habilitada.
                  </p>
                </div>
              </div>
            </div>
          )}

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