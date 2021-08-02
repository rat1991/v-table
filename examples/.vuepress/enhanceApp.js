/**
 * 扩展 VuePress 应用
 */
// import VueHighlightJS from 'vue-highlight.js';
// import 'highlight.js/styles/atom-one-dark.css';

// import 'vTiger/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VTable from '../../lib';
export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData // 站点元数据
}) => {
  // ...做一些其他的应用级别的优化
  Vue.use(ElementUI)
  Vue.use(VTable, {
    pageKey: 'current', // 设定请求页码参数的key值
    pageSizeKey: 'pageSize', // 设定请求页数参数的key值
    preAction(res, paging) {
      if (paging) {
        const { current: page, total, records:data } = res.data.data
        return {
          page, total, data
        }
      } else {
        return res.data.data
      }
    }
  })
}