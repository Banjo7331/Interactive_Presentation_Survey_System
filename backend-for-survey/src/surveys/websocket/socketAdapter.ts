import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
    createIOServer(port: number, options?: ServerOptions): any {
      const serverOptions: ServerOptions = {
        serveClient: false, 
        ...options, 
      };
  
      serverOptions.cors = {
        origin: "http://localhost:5173"
      }
      return super.createIOServer(port, serverOptions);
    }
  }