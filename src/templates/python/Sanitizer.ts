import axios from 'axios';
import prettifier from '../../Prettifier'

async function formatPythonCode(code: string): Promise<string> {
  try {
    const response = await axios.post('https://python-black.herokuapp.com/api/v1/format', {
      code: code,
    });

    if (response.status === 200) {
      return response.data.code;
    } else {
      throw new Error('Erreur lors du formatage du code Python.');
    }
  } catch (error) {
    throw error;
  }
}

export const python_prettifier: prettifier = async (code: string) => {
    return await formatPythonCode(code)
}

export default python_prettifier