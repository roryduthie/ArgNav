//https://stackoverflow.com/questions/14949210/dynamically-update-a-table-using-javascript

    var dynamicTable = (function() {

        var _tableId, _table,
            _fields, _headers,
            _defaultText;

        /** Builds the row with columns from the specified names. 
         *  If the item parameter is specified, the memebers of the names array will be used as property names of the item; otherwise they will be directly parsed as text.
         */
        function _buildRowColumns(names, item) {
            var row = '<tr>';
            if (names && names.length > 0) {
                $.each(names, function(index, name) {
                    var c = item ? item[name + ''] : name;
                    row += '<td>' + c + '</td>';
                });
            }
            row += '</tr>';
            return row;
        }

        /** Builds and sets the headers of the table. */
        function _setHeaders() {
            // if no headers specified, we will use the fields as headers.
            _headers = (_headers == null || _headers.length < 1) ? _fields : _headers;
            var h = _buildRowColumns(_headers);
            if (_table.children('thead').length < 1) _table.prepend('<thead></thead>');
            _table.children('thead').html(h);
        }

        function _setNoItemsInfo() {
            if (_table.length < 1) return; //not configured.
            var colspan = _headers != null && _headers.length > 0 ?
                'colspan="' + _headers.length + '"' : '';
            var content = '<tr class="no-items"><td ' + colspan + ' style="text-align:center">' +
                _defaultText + '</td></tr>';
            if (_table.children('tbody').length > 0)
                _table.children('tbody').html(content);
            else _table.append('<tbody>' + content + '</tbody>');
        }

        function _removeNoItemsInfo() {
            var c = _table.children('tbody').children('tr');
            if (c.length == 1 && c.hasClass('no-items')) _table.children('tbody').empty();
        }

        return {
            /** Configres the dynamic table. */
            config: function(tableId, fields, headers, defaultText) {
                _tableId = tableId;
                _table = $('#' + tableId);
                _fields = fields || null;
                _headers = headers || null;
                _defaultText = defaultText || 'No items to list...';
                _setHeaders();
                _setNoItemsInfo();
                return this;
            },
            /** Loads the specified data to the table body. */
            load: function(data, append) {
                if (_table.length < 1) return; //not configured.
                _setHeaders();
                _removeNoItemsInfo();
                if (data && data.length > 0) {
                    var rows = '';
                    $.each(data, function(index, item) {
                        rows += _buildRowColumns(_fields, item);
                    });
                    var mthd = append ? 'append' : 'html';
                    _table.children('tbody')[mthd](rows);
                } else {
                    _setNoItemsInfo();
                }
                return this;
            },
            /** Clears the table body. */
            clear: function() {
                _setNoItemsInfo();
                return this;
            }
        };
    }());