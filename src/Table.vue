<script>
import _omit from 'lodash/omit'
import * as T from './utils/eTableOptions.js'
import Toolbar from './Toolbar.vue'
import EditableCell from './EditableCell.vue'
import { mergeProps, isVoid } from './utils/tools.js'
const noop = () => {}
const defaultPluginOptions = {
  pageKey: 'pageNo',
  pageSizeKey: 'pageSize',
  pagination: {},
  preAction(res, paging) {
    if (paging) {
      const { pageNo: page, total, list: data } = res.data.result
      return {
        page,
        total,
        data
      }
    } else {
      return res.data.result
    }
  }
}
const VTable = {
  name: 'HcVTable',
  _pluginOptions: defaultPluginOptions,
  components: { Toolbar, EditableCell },
  provide() {
    return {
      tableCtx: this
    }
  },
  props: {
    columns: {
      type: Array
    },
    pagination: {
      type: [Object],
      default() {
        return {}
      }
    },
    memoPagination: {
      type: Boolean,
      default: false
    },
    action: Function,
    actionParams: {
      type: Object,
      default() {
        return {}
      }
    },
    toolbar: {
      type: [Array, Boolean],
      default: false,
      validator(val) {
        if (typeof val === 'boolean') return true
        return val.every(item => Toolbar._menuType.includes(item))
      }
    },
    toolbarConfig: {
      type: Object,
    },
    usePreAction: {
      type: Boolean,
      default: true
    },
    emptyCellText: {
      type: String,
      default: '-'
    },
    cellEditor: {
      type: Object,
      default() {
        return {}
      },
      validator(val) {
        const optionKeys= ['defaultEditable', 'showAction', 'cellEditMethod', 'humpLine' ]
        return Object.keys(val).every(key => optionKeys.includes(key))
      }
    },
    // el-tabel Props
    ...T.props
  },
  data() {
    const { data, size = 'medium', columns, pagination, initPagination } = this
    const P = VTable._pluginOptions
    return {
      innerData: [...data],
      innerSize: size,
      innerColumns: columns,
      innerPagination: initPagination({
        showSinglePageTip: false,
        background: true,
        layout: 'prev, pager, next',
        pageSize: 10,
        currentPage: 1,
        total: 0,
        ...P.pagination,
        ...pagination
      })
    }
  },
  computed: {
    rednerPagination() {
      if (!this.pagination) return null
      const self = this
      const { pageSize, total, hideOnSinglePage, showSinglePageTip } = this.innerPagination
      const isAllData = total > 0 && total <= pageSize
      const paginationEvents = {
        'current-change'(val) {
          self.innerPagination['currentPage'] = val
          self.remoteData()
        },
        'size-change'(val) {
          self.innerPagination['pageSize'] = val
          self.remoteData()
        },
        'prev-click'(val) {
          self.innerPagination['currentPage'] = val
          self.remoteData()
        },
        'next-click'(val) {
          self.innerPagination['currentPage'] = val
          self.remoteData()
        }
      }
      return (showSinglePageTip && isAllData) ? <el-divider><span style="font-size: 12px;color: #999;">以上为全部数据</span></el-divider> : <el-pagination {...{ props: this.innerPagination, on: paginationEvents }} />
    },
    renderColumns() {
      if (!Array.isArray(this.columns)) return null
      const { $scopedSlots, emptyCellText, cellEditor, innerSize } = this
      const columns = this.innerColumns
      const defaultFormatter = (row, column, cellValue) => isVoid(cellValue) ? emptyCellText : cellValue
      const defaultCellSlot = item => item.editable ? scoped => {
        const { row, $index } = scoped
        scoped.column['editable'] = item.editable
        const props = {
          size: innerSize,
          columnKey: item.prop,
          ...cellEditor,
          scoped
        }
        return <EditableCell { ...{props} } refInFor ref={`editableCell-${$index}`} />
      } : ($scopedSlots[item.prop] || null)
      function createColumn(list) {
        return list.map(item => {
          return (
            <el-table-column
              {...{
                props: {
                  ...item,
                  formatter: item.formatter || defaultFormatter
                },
                scopedSlots: {
                  default: defaultCellSlot(item),
                  header: $scopedSlots[`${item.prop}.header`]
                }
              }}
            >
              {item.children && createColumn(item.children)}
            </el-table-column>
          )
        })
      }
      return createColumn(columns)
    }
  },
  watch: {
    'innerPagination.currentPage'(newVal) {
      if (!this.memoPagination) return
      let { query, name, hash } = this.$route
      const P = VTable._pluginOptions
      const pageKey = P.pageKey
      query = newVal !== 1 ? { ...query, [pageKey]: newVal } : _omit(query, [pageKey])
      this.$router.push({
        name,
        query,
        hash
      })
    }
  },
  mounted() {
    this.$native = this.$refs.vmTable
    this.remoteData()
  },
  methods: {
    toggleRowEdit(index, edited) {
      const { $refs } = this
      let editableCells = []
      const values = {}
      let isEdit = edited
      if (index !== undefined) {
        editableCells = $refs[`editableCell-${index}`]
      } else {
        const editableCellKeys = Object.keys($refs).filter(key => key.startsWith('editableCell'))
        editableCells = editableCellKeys.reduce((res, key) => res.concat($refs[key]), [])
      }
      editableCells.forEach(item => {
        const prop = item.columnKey
        values[prop] = item.innerValue
        item.changeEditable(edited)
        isEdit = item.editable
      })
      return { values, edited: isEdit, editableCells }
    },
    initPagination(params) {
      if (!this.pagination) return {}
      const _pagination = { ...params }
      if (!this.memoPagination) {
        return _pagination
      }
      const { query } = this.$route
      const P = VTable._pluginOptions
      const memo = {
        currentPage: +query[P.pageKey] || _pagination.currentPage,
        pageSize: +query[P.pageSizeKey] || _pagination.pageSize
      }
      return Object.assign(_pagination, memo)
    },
    remoteData(options) {
      const { action, actionParams, usePreAction, pagination } = this
      const { currentPage, pageSize } = this.innerPagination
      const { vmTable } = this.$refs
      const P = VTable._pluginOptions
      const isUsePre = usePreAction && typeof(P.preAction) === 'function'
      const params = {
        ...actionParams
      }
      if (pagination) {
        params[P.pageKey] = currentPage
        params[P.pageSizeKey] = pageSize
      }
      Object.assign(params, options)
      const loadingMask = this.$loading({
        target: vmTable.$el
      })
      return action(params)
        .then(res => {
          const result = isUsePre ? P.preAction(res, pagination) : res
          loadingMask.close()
          if (pagination) {
            this.innerPagination.total = Number(result.total)
            this.innerPagination.currentPage = Number(result.page)
            this.innerData = result.data
          } else {
            this.innerData = result
          }
          this.$emit('remote-success', res)
        })
        .catch(err => {
          loadingMask.close()
          this.$emit('remote-fail', err)
        })
    }
  },
  render() {
    const { $props, $data, $listeners, $scopedSlots, columns, renderColumns, rednerPagination, renderToolBar } = this
    // console.log('==>: render -> $scopedSlots', $scopedSlots['table.append'])
    const props = mergeProps(T.props, $props, this)
    const on = {
      ...$listeners
    }
    const scopedSlots = {
      append: $scopedSlots['table.append']
    }
    const toolbarProps = {
      colMenu: columns.reduce((res, col) => {
        !col.type && col.prop && res.push(col.prop)
        return res
      }, []),
      ...$props.toolbarConfig,
      menu: $props.toolbar,
      ctxOptions: VTable._pluginOptions,
      ctx: this
    }
    return (
      <div class="table-wrapper" ref="wrapper">
        { $scopedSlots['table.prepend'] && $scopedSlots['table.prepend']() }
        { $props.toolbar && <Toolbar { ...{ props: toolbarProps } } /> }
        <el-table {...{ props, on, scopedSlots }} ref="vmTable">
          {renderColumns}
          {scopedSlots.append && <span slot="append" />}
        </el-table>
        {rednerPagination}
      </div>
    )
  }
}

/* istanbul ignore next */
VTable.install = function(Vue, options) {
  Object.assign(VTable._pluginOptions, options)
  Vue.component(VTable.name, VTable)
}
export default VTable
</script>
<style>
.table-wrapper {
  z-index: 1;
}
.table-wrapper:not(:root):fullscreen {
  overflow: auto;
  background-color: #fff;
}
.table-wrapper .el-pagination {
  padding: 16px 0;
  text-align: center;
  border: solid #EBEEF5;
  border-width: 0;
}
.table-wrapper .toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  padding: 0 18px;
  background-color: #fff;
}
.table-wrapper .toolbar__option {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.table-wrapper .toolbar__list {

}
.table-wrapper .toolbar__list .el-tooltip {
  margin-left: 16px;
  font-size: 22px;
  cursor: pointer;
}

</style>
