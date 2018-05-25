import { create } from 'apisauce';
import { environment } from '../environments/environment';

const perPage = 20;
const api = create({
  baseURL: environment.apiUrl
})

export default {
  getAll(page=1) {
    return api.get('/stories?per_page=' + perPage + '&page=' + page);
  }
}
