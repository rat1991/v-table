# 更新日志

## [0.1.8-beta.9] - 2020-11-10
### Fixed
- 解决行编辑的报错问题和分页总数的写死的问题

## [0.1.8-beta.7] - 2020-10-12
### Fixed
- 修复可编辑单元格的自定义插槽可改变展示时的内容

## [0.1.8-beta.6] - 2020-09-24
### Added
- 重构prop.emptyCellText单元格为空数据时的内容展示实现逻辑；
- prop.cellEditor属性新增cellEditMethod方法，用来实现可编辑单元格的异步提交。

## [0.1.8-beta.1] - 2020-09-09
### Added
- 新增单元格可编辑功能，并提供```cell-edited```事件和```toggleRowEdit```方法来实现列编辑和行内编辑功能。具体实现可参考[文档示例](http://front-end.flytiger.net/tiger_table/docs/#可编辑的单元格)；
- 新增prop.emptyCellText来显示当单元格为空数据时的内容展示；