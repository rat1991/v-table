import VTable from './Table.vue'
import VSearchbar from './Searchbar.vue'

const install = function(Vue, options = {}) {
  Object.assign(VTable._pluginOptions, options)
  Object.assign(VSearchbar._pluginOptions, options)
  Vue.component(VTable.name, VTable)
  Vue.component(VSearchbar.name, VSearchbar)
}
if (window && window.Vue) {
  if (window.vTableInstall) throw Error('installVTable已存在');
  window.vTableInstall = install;
}
export default {
  install
}
