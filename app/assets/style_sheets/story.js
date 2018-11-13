import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  item: {
    flex: 1,
    position: 'relative'
  },
  imageWrapper: {
    flex: 1,
    flexDirection: 'row',
    height: 200,
    borderRadius: 3,
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    height: 200,
    borderRadius: 3,
    backgroundColor: '#eee',
  },
  tagsWrapper: {
    flexDirection:'row',
    flexWrap:'wrap',
    marginTop: 8,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#eee',
    borderRadius: 3,
    paddingHorizontal: 4,
    color: '#111',
    fontSize: 10,
    marginRight: 5,
    marginBottom: 3,
  },
  title: {
    fontSize: 12,
    marginTop: 8
  },
  listViewInfo: {
    padding: 20,
  },
  author: {
    color: '#f55b1f',
    fontSize: 10
  },
  downloadLabel: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    zIndex: 1,
    color: '#fff',
    paddingHorizontal: 5,
    paddingBottom: 5,
    borderBottomLeftRadius: 3,
    borderTopRightRadius: 3,
    fontSize: 12,
  },
  btnDownload: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#E4145C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
  },
  btnReadNow: {
    backgroundColor: 'green',
    width: 200,
  },
  btnLabel: {
    color: '#fff',
    marginLeft: 10,
  },
  licenseText: {
    marginLeft: 5,
    marginBottom: 0,
    height: 18,
    backgroundColor: '#fafafa'
  }

})
