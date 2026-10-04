export const parseSort = (sortBy, order, allowedColumns, defaultColumn = 'createdAt', defaultOrder = 'desc') => {
  const selectedColumn = allowedColumns[sortBy] ? allowedColumns[sortBy] : defaultColumn;
  const selectedOrder = order === 'asc' || order === 'desc' ? order : defaultOrder;

  const primarySort =
    typeof selectedColumn === 'function' ? selectedColumn(selectedOrder) : { [selectedColumn]: selectedOrder };

  return [primarySort, { id: 'asc' }];
};
