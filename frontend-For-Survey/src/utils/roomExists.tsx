import axios from 'axios';
import { useAuth } from './IsLogged';


export async function roomExists(roomId: string, authToken: string): Promise<boolean> {
  
  try {
    const headers = { Authorization: `Bearer ${authToken}` };
    console.log('Request headers:', headers);
    const response = await axios.get(`http://localhost:3000/surveys/get-room/${roomId}`,{ headers });
    return !!response.data;
  } catch (error) {
    console.error("Failed to check if room exists: ", error);
    return false;
  }
}