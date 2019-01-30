function executeTK() {
    var query = "SELECT idkey, [table], count(*)  as sl, sum(price) as total FROM 'order' WHERE [table] is not null and checkout==1 GROUP BY [table]";
    renderQueryTK(query);
    $("#tables").select2("val", getTableNameFromQuery(query));
}
function renderQueryTK(query) {
    var dataBox = $("#data");
    var thead = dataBox.find("thead").find("tr");
    var tbody = dataBox.find("tbody");

    thead.empty();
    tbody.empty();
    errorBox.hide();
    dataBox.show();

    var columnTypes = [];
    var tableName = getTableNameFromQuery(query);
    if (tableName != null) {
        columnTypes = getTableColumnTypes(tableName);
    }
    var sel;
    try {
        sel = db.prepare(query);
    } catch (ex) {
        showError(ex);
        return;
    }
    var addedColums = false;
   var stt=1;
   var total=0;
    while (sel.step()) {
        if (!addedColums) {
            addedColums = true;
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">stt</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">table</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">sl</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">price</span></th>');
        }
        var tr = $('<tr>');
        var s = sel.get();
        for (var i = 0; i < s.length; i++) {
           if(i==0){
               tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + stt + '</span></td>');
           }
           else{
              if(i==3){
                 total+=s[i];
                 tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(Number(s[i]).toLocaleString()) + '</span></td>');
              }
              else{
                     tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(s[i]) + '</span></td>');
                 }
            }
        }
        tbody.append(tr);
       stt++;
    }
	$('#total').text("Total: "+Number(total).toLocaleString());
    refreshPagination(query, tableName);

    $('[data-toggle="tooltip"]').tooltip({html: true});
    dataBox.editableTableWidget();

    setTimeout(function () {
        positionFooter();
    }, 100);
}
/////////////////////////////////
function executeMon() {

    //renderQueryBo();
    //renderQueryMi()
    //renderQueryPizza();
    //renderQueryKhoang();

}

function renderQueryBo() {
  var query = "select i.id, i.name,i.sl,o.[table],o.price,o.starttime,o.endtime,o.checkout from item i inner join 'order' o on i.idorder=o.idkey where i.name like 'Bò%' order by o.starttime asc";
    var dataBox = $("#tblbo");
    var thead = dataBox.find("thead").find("tr");
    var tbody = dataBox.find("tbody");

    thead.empty();
    tbody.empty();
    errorBox.hide();
    dataBox.show();


    var sel;
    try {
        sel = db.prepare(query);
    } catch (ex) {
        showError(ex);
        return;
    }
    var addedColums = false;
   var stt=1;
   var total_bo=0;
    while (sel.step()) {
        if (!addedColums) {
            addedColums = true;
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">stt</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">food</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">sl</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">table</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">price</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">in</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">out</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">checked</span></th>');
        }
        var tr = $('<tr>');

        var s = sel.get();
        for (var i = 0; i < s.length; i++) {
           if(i==0){
               tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + stt + '</span></td>');
           }
           else{
              if(i==4){

                 tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(Number(s[i]).toLocaleString()) + '</span></td>');
              }
              else{
                    if(i==2){
                    tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(s[i]) + '</span></td>');
                      total_bo+=s[i];
                    }
                      else
                      tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(s[i]) + '</span></td>');
                 }
            }
        }
        tbody.append(tr);
       stt++;
    }
	$('#idbo').text("Bò: "+total_bo.toString()+" phần");
    //refreshPagination(query, tableName);

    $('[data-toggle="tooltip"]').tooltip({html: true});
    dataBox.editableTableWidget();

    setTimeout(function () {
        positionFooter();
    }, 100);
}

function renderQueryMi() {
  var query = "select i.id, i.name,i.sl,o.[table],o.price,o.starttime,o.endtime,o.checkout from item i inner join 'order' o on i.idorder=o.idkey where i.name like 'Mì%' order by o.starttime asc";
    var dataBox = $("#tblmi");
    var thead = dataBox.find("thead").find("tr");
    var tbody = dataBox.find("tbody");

    thead.empty();
    tbody.empty();
    errorBox.hide();
    dataBox.show();


    var sel;
    try {
        sel = db.prepare(query);
    } catch (ex) {
        showError(ex);
        return;
    }
    var addedColums = false;
   var stt=1;
   var total_mi=0;
    while (sel.step()) {
        if (!addedColums) {
            addedColums = true;
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">stt</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">food</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">sl</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">table</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">price</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">in</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">out</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">checked</span></th>');
        }
        var tr = $('<tr>');

        var s = sel.get();
        for (var i = 0; i < s.length; i++) {
           if(i==0){
               tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + stt + '</span></td>');
           }
           else{
              if(i==4){

                 tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(Number(s[i]).toLocaleString()) + '</span></td>');
              }
              else{
                    if(i==2){
                    tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(s[i]) + '</span></td>');
                      total_mi+=s[i];
                      }
                      else
                      tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(s[i]) + '</span></td>');
                 }
            }
        }
        tbody.append(tr);
       stt++;
    }
	$('#idmi').text("Mì: "+total_mi.toString()+" phần");
    //refreshPagination(query, tableName);

    $('[data-toggle="tooltip"]').tooltip({html: true});
    dataBox.editableTableWidget();

    setTimeout(function () {
        positionFooter();
    }, 100);
}

function renderQueryPizza() {
  var query = "select i.id, i.name,i.sl,o.[table],o.price,o.starttime,o.endtime,o.checkout from item i inner join 'order' o on i.idorder=o.idkey where i.name like 'Pizza%' order by o.starttime asc";
    var dataBox = $("#tblpizza");
    var thead = dataBox.find("thead").find("tr");
    var tbody = dataBox.find("tbody");

    thead.empty();
    tbody.empty();
    errorBox.hide();
    dataBox.show();


    var sel;
    try {
        sel = db.prepare(query);
    } catch (ex) {
        showError(ex);
        return;
    }
    var addedColums = false;
   var stt=1;
   var total=0;
    while (sel.step()) {
        if (!addedColums) {
            addedColums = true;
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">stt</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">food</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">sl</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">table</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">price</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">in</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">out</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">checked</span></th>');
        }
        var tr = $('<tr>');

        var s = sel.get();
        for (var i = 0; i < s.length; i++) {
           if(i==0){
               tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + stt + '</span></td>');
           }
           else{
              if(i==4){

                 tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(Number(s[i]).toLocaleString()) + '</span></td>');
              }
              else{
                    if(i==2){
                    tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(s[i]) + '</span></td>');
                      total+=s[i];
                      }
                      else
                      tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(s[i]) + '</span></td>');
                 }
            }
        }
        tbody.append(tr);
       stt++;
    }
	$('#idpizza').text("Pizza: "+total.toString()+" phần");
    //refreshPagination(query, tableName);

    $('[data-toggle="tooltip"]').tooltip({html: true});
    dataBox.editableTableWidget();

    setTimeout(function () {
        positionFooter();
    }, 100);
}

function renderQueryKhoang() {
  var query = "select i.id, i.name,i.sl,o.[table],o.price,o.starttime,o.endtime,o.checkout from item i inner join 'order' o on i.idorder=o.idkey where i.name like '%Suối' order by o.starttime asc";
    var dataBox = $("#tblkhoang");
    var thead = dataBox.find("thead").find("tr");
    var tbody = dataBox.find("tbody");

    thead.empty();
    tbody.empty();
    errorBox.hide();
    dataBox.show();


    var sel;
    try {
        sel = db.prepare(query);
    } catch (ex) {
        showError(ex);
        return;
    }
    var addedColums = false;
   var stt=1;
   var total=0;
    while (sel.step()) {
        if (!addedColums) {
            addedColums = true;
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">stt</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">food</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">sl</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">table</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">price</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">in</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">out</span></th>');
       thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">checked</span></th>');
        }
        var tr = $('<tr>');

        var s = sel.get();
        for (var i = 0; i < s.length; i++) {
           if(i==0){
               tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + stt + '</span></td>');
           }
           else{
              if(i==4){

                 tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(Number(s[i]).toLocaleString()) + '</span></td>');
              }
              else{
                    if(i==2){
                    tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(s[i]) + '</span></td>');
                      total+=s[i];
                      }
                      else
                      tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(s[i]) + '</span></td>');
                 }
            }
        }
        tbody.append(tr);
       stt++;
    }
	$('#idkhoang').text("Khoang: "+total.toString()+" phần");
    //refreshPagination(query, tableName);

    $('[data-toggle="tooltip"]').tooltip({html: true});
    dataBox.editableTableWidget();

    setTimeout(function () {
        positionFooter();
    }, 100);
}
