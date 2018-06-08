import { create } from 'apisauce';
import { environment } from '../environments/environment';

const api = create({
  baseURL: environment.apiUrl
})

export default {
  getAll() {
    return api.get(`/tags`);
  }
}
