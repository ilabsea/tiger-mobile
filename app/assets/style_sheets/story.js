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
  tagsWrapper: {
    flexDirection:'row',
    flexWrap:'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#eee',
    borderRadius: 3,
    paddingHorizontal: 4,
    color: '#111',
    fontSize: 10,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8
  },
  listViewInfo: {
    padding: 20,
  },
  author: {
    color: '#fff',
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
  }

})
