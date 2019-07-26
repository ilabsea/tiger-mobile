import { create } from 'apisauce';
import { environment } from '../environments/environment';

const api = create({
  baseURL: environment.apiUrl
})

export default {
  increaseStoryDownload(body) {
    return api.post(`/story_downloads`, body);
  },
  // uploadStoryRead(body) {
  //   return api.post(`/story_reads`, body);
  // }
}
