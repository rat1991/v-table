<script>
function toHump(name) {
  return name.replace(/\-(\w)/g, function(match, letter){
      return letter.toUpperCase();
  })
}
export default {
  name: 'EditableCell',
  inject: ['tableCtx'],
  props: {
    columnKey: String,
    value: [String, Number],
    humpLine: Boolean,
    size: String,
    scoped: {
      type: Object,
      default() {
        return {}
      }
    },
    showAction: {
      type: [Boolean, Function],
      default: true
    },
    defaultEditable: {
      type: [Boolean, Function],
      default: false
    },
    cellEditMethod: Function,
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    const { defaultEditable, scoped } = this
    return {
      loading: false,
      innerValue: '',
      innerShowAction: true,
      isEdited: false,
      editable: typeof defaultEditable === 'function' ? defaultEditable(scoped) : defaultEditable
    }
  },
  watch: {
    scoped: {
      handler(newVal) {
        const { columnKey, humpLine } = this
        let _key = humpLine ? toHump(columnKey) : columnKey
        this.innerValue = newVal.row[_key]
      },
      immediate: true
    },
    innerValue(newVal) {
      this.isEdited = true
    },
    showAction: {
      handler(newVal) {
        const { scoped } = this
        this.innerShowAction = typeof newVal === 'function' ? newVal(scoped) : newVal
      },
      immediate: true
    }
  },
  methods: {
    changeEditable(param) {
      const { editable, showAction } = this
      const status = typeof(param) === 'boolean' ? param : !editable
      this.innerShowAction = !status || showAction
      this.editable = status
    },
    handleSubmit() {
      const { scoped, cellEditMethod, $refs } = this
      const { _self } = scoped
      const next = () => {
        this.isEdited = false
        this.editable = !this.editable
      }
      if (this.editable && this.isEdited) {
        _self.$emit('cell-edited', this.innerValue, scoped, $refs.editCell)
        cellEditMethod
        ? cellEditMethod(next, { ...scoped, editValue: this.innerValue, editor: this })
        : next()
      } else {
        this.editable = !this.editable
      }
    }
  },
  mounted() {
    const { editCell } = this.$refs
    this.cellRef = editCell.parentNode
    this.$watch('editable', newVal => {
      [...this.cellRef.children].forEach(item => {
        if (item.tagName === 'SPAN') {
          item.style.display = newVal ? 'none' : null
        }
      })
    })
  },
  render() {
    const { columnKey, editable, placeholder, innerValue, innerShowAction, loading, scoped, handleSubmit, handleHover } = this
    const { $scopedSlots } = this.tableCtx
    const stateIcon = loading ? 'el-icon-loading' : (
      editable ? 'editing el-icon-check' : 'el-icon-edit'
    )
    const contentSlot = $scopedSlots[columnKey]
      ? $scopedSlots[columnKey]({ ...scoped, editValue: innerValue })
      : (<span class="editable-cell__content">{ innerValue }</span>)
    return(
      <div class="editable-cell" ref="editCell">
        <div class="editable-cell__wrapper">
          {
            editable
            ? <el-input size={this.size} placeholder={placeholder} vModel={this.innerValue} style="width: auto;" />
            : contentSlot
          }
        </div>
        {
          innerShowAction &&
          (<span class={['editable-cell__action', stateIcon]} title={ editable ? '保存' : '编辑' } onClick={handleSubmit} />)
        }

      </div>
    )
  }
}
</script>
<style>
.editable-cell {
  display: inline-flex;
  align-items: center;
}
.editable-cell > input {
  width: 100%;
}
.editable-cell__wrapper {
  flex: 1;
}
.editable-cell__action {
  width: 24px;
  height: 24px;
  line-height: 24px;
  margin-left: 6px;
  font-size: 16px;
  color: #409eff;
  text-align: center;
  background-color: #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(162,208,255, 0.8);
  visibility: hidden;
}
.editable-cell__action.editing {
  color: #fff;
  background-color: #409eff;
  visibility: visible;
}
.editable-cell:hover >.editable-cell__action {
  visibility: visible;
}
</style>