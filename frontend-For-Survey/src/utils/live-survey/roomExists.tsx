import axios from 'axios';


export async function roomExists(roomId: string): Promise<boolean> {
  
  try {
    const response = await axios.get(`http://localhost:3000/surveys/get-room/${roomId}`);
    return !!response.data;
  } catch (error) {
    console.error("Failed to check if room exists: ", error);
    return false;
  }
}