import { gapi } from 'gapi-script';

// ⚠️ SUBSTITUA ESTAS CREDENCIAIS PELAS SUAS
const CLIENT_ID = '738142740619-241uaep15g4v4nlsobfar9hbjgu9htl0.apps.googleusercontent.com';
const API_KEY = 'SUA_API_KEY_AQUI'; // Opcional
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let gapiInited = false;
let isSignedIn = false;

// Inicializar o Google API
export const initGoogleAPI = () => {
  return new Promise((resolve) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: SCOPES,
        });

        gapiInited = true;
        isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
        
        // Listener para mudanças no status de login
        gapi.auth2.getAuthInstance().isSignedIn.listen((signedIn) => {
          isSignedIn = signedIn;
        });

        resolve(true);
      } catch (error) {
        console.error('Erro ao inicializar Google API:', error);
        resolve(false);
      }
    });
  });
};

// Fazer login no Google
export const signInGoogle = async () => {
  try {
    if (!gapiInited) {
      await initGoogleAPI();
    }
    
    await gapi.auth2.getAuthInstance().signIn();
    isSignedIn = true;
    return true;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return false;
  }
};

// Verificar se está logado
export const isUserSignedIn = () => {
  return isSignedIn && gapi.auth2?.getAuthInstance()?.isSignedIn.get();
};

// Adicionar evento automaticamente no Google Calendar
export const addToGoogleCalendar = async (task) => {
  try {
    // Validação básica
    if (!task.date || !task.text) {
      alert('❌ A tarefa precisa ter uma data e descrição!');
      return { success: false };
    }

    // Verificar se está inicializado
    if (!gapiInited) {
      const initialized = await initGoogleAPI();
      if (!initialized) {
        alert('❌ Erro ao conectar com Google Calendar');
        return { success: false };
      }
    }

    // Verificar se está logado
    if (!isUserSignedIn()) {
      alert('🔑 Você precisa fazer login no Google. Aguarde...');
      const loggedIn = await signInGoogle();
      if (!loggedIn) {
        alert('❌ Login cancelado. Não foi possível adicionar ao calendário.');
        return { success: false };
      }
    }

    // Preparar data e hora
    const taskDateTime = `${task.date}T${task.time || '09:00'}:00`;
    const startDate = new Date(taskDateTime);
    
    if (isNaN(startDate.getTime())) {
      alert('❌ Data inválida!');
      return { success: false };
    }
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora de duração

    // Criar evento
    const event = {
      summary: task.text,
      description: task.description || 'Criado pelo Meu Checklist',
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 1440 }, // 1 dia antes
        ],
      },
    };

    // Mostrar mensagem de carregamento
    console.log('⏳ Adicionando ao Google Calendar...');

    // Inserir no Google Calendar
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log('✅ Evento criado:', response.result);
    alert('✅ Tarefa adicionada ao Google Calendar com sucesso!');
    
    return { 
      success: true, 
      eventId: response.result.id,
      htmlLink: response.result.htmlLink 
    };

  } catch (error) {
    console.error('❌ Erro ao adicionar no Google Calendar:', error);
    
    if (error.result?.error?.code === 401) {
      alert('❌ Sessão expirada. Faça login novamente.');
    } else {
      alert('❌ Erro ao adicionar tarefa. Tente novamente.');
    }
    
    return { success: false, error: error.message };
  }
};

// Fazer logout
export const signOutGoogle = () => {
  if (gapiInited && gapi.auth2) {
    gapi.auth2.getAuthInstance().signOut();
    isSignedIn = false;
    alert('✅ Logout realizado com sucesso!');
  }
};