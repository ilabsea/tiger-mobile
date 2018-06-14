import { create } from 'apisauce';
import { environment } from '../environments/environment';

const perPage = 4;
const api = create({
  baseURL: environment.apiUrl
})

export default {
  perPage: perPage,

  getAll(page=1) {
    // return api.get('/stories?per_page=' + perPage + '&page=' + page);
    return fetch(`${environment.apiUrl}/stories?per_page=${perPage}&page=${page}`);

  },
  getAllByTag(tagId) {
    return fetch(`${environment.apiUrl}/tags/${tagId}/stories`);
  }
}
