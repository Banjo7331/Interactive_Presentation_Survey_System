import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

// Dostosowanie adaptera socket.io
export class SocketIoAdapter extends IoAdapter {
    createIOServer(port: number, options?: ServerOptions): any {
      // Utwórz nowy obiekt opcji serwera z domyślnymi wartościami
      const serverOptions: ServerOptions = {
        serveClient: false, // Opcjonalne: wyłącz obsługę klienta socket.io
        ...options, // Dodaj opcje przekazane do funkcji
      };
  
      // Dodaj konfigurację CORS do opcji serwera
      serverOptions.cors = {
        origin: "http://localhost:5173"
      }
      // Utwórz serwer socket.io z zaktualizowanymi opcjami
      return super.createIOServer(port, serverOptions);
    }
  }