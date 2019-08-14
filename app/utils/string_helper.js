export default class StringHelper {
  static getFileURIName(str){
    //uploads/scene/image/15/full_2x_.png => full_2x.png
    return str ? str.substring(str.lastIndexOf('/') + 1) : '';
  }
}
