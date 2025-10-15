import { gapi } from 'gapi-script';

// ✅ SUAS CREDENCIAIS DO GOOGLE
const CLIENT_ID = '738142740619-241uaep15g4v4nlsobfar9hbjgu9htl0.apps.googleusercontent.com';
const API_KEY = ''; // Deixe vazio se não tiver (é opcional)
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let gapiInited = false;
let tokenClient;

// Inicializar o Google API
export const initGoogleAPI = () => {
  return new Promise((resolve) => {
    console.log('🔄 Iniciando Google API...');
    
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY || undefined,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        });

        gapiInited = true;
        console.log('✅ Google API inicializada com sucesso!');
        
        // Inicializar o cliente de token OAuth
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // será definido depois
          });
          console.log('✅ Token client inicializado');
        }
        
        resolve(true);
      } catch (error) {
        console.error('❌ Erro ao inicializar Google API:', error);
        alert('❌ Erro ao conectar com Google. Verifique as configurações.');
        resolve(false);
      }
    });
  });
};

// Fazer login e obter token
const getAccessToken = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client não inicializado'));
      return;
    }

    tokenClient.callback = (response) => {
      if (response.error) {
        reject(response);
        return;
      }
      resolve(response.access_token);
    };

    // Solicitar token
    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

// Adicionar evento no Google Calendar
export const addToGoogleCalendar = async (task) => {
  try {
    console.log('📅 Tentando adicionar tarefa ao Google Calendar...', task);

    // Validação básica
    if (!task.date || !task.text) {
      alert('❌ A tarefa precisa ter uma data e descrição!');
      return { success: false };
    }

    // Verificar se está inicializado
    if (!gapiInited) {
      console.log('⏳ Inicializando Google API...');
      const initialized = await initGoogleAPI();
      if (!initialized) {
        alert('❌ Erro ao conectar com Google Calendar. Verifique:\n\n1. Se adicionou http://localhost:3000 nas Origens JavaScript\n2. Se ativou a Google Calendar API\n3. Se configurou a Tela de Consentimento');
        return { success: false };
      }
    }

    // Obter token de acesso
    console.log('🔑 Obtendo permissão...');
    try {
      await getAccessToken();
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
      alert('❌ Login cancelado ou erro de permissão. Tente novamente.');
      return { success: false };
    }

    // Preparar data e hora
    const taskDateTime = `${task.date}T${task.time || '09:00'}:00`;
    const startDate = new Date(taskDateTime);
    
    if (isNaN(startDate.getTime())) {
      alert('❌ Data inválida!');
      return { success: false };
    }
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora

    // Criar evento
    const event = {
      summary: task.text,
      description: 'Criado pelo Meu Checklist',
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
          { method: 'email', minutes: 1440 },
        ],
      },
    };

    console.log('⏳ Inserindo evento no calendário...');

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
    console.error('❌ Erro completo:', error);
    
    let errorMessage = '❌ Erro ao adicionar tarefa. ';
    
    if (error.status === 401 || error.code === 401) {
      errorMessage += 'Sessão expirada. Tente novamente.';
    } else if (error.status === 403 || error.code === 403) {
      errorMessage += 'Sem permissão. Verifique:\n\n1. Se a Google Calendar API está ativada\n2. Se configurou os escopos corretos';
    } else if (error.status === 404) {
      errorMessage += 'Calendário não encontrado.';
    } else {
      errorMessage += `\n\nDetalhes: ${error.message || 'Erro desconhecido'}`;
    }
    
    alert(errorMessage);
    return { success: false, error: error.message };
  }
};

// Revogar acesso
export const revokeAccess = () => {
  const token = gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    alert('✅ Acesso revogado com sucesso!');
  }
};