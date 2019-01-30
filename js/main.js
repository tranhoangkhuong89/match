var SQL_FROM_REGEX = /FROM\s+([^\s;]+)/mi;
var SQL_LIMIT_REGEX = /LIMIT\s+(\d+)(?:\s*,\s*(\d+))?/mi;
var SQL_SELECT_REGEX = /SELECT\s+[^;]+\s+FROM\s+/mi;

var db = null;
var rowCounts = [];
var editor = ace.edit("sql-editor");
var bottomBarDefaultPos = null, bottomBarDisplayStyle = null;
var errorBox = $("#error");
var lastCachedQueryCount = {};
var query_tt;

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
        return null;
    }
    else{
        return results[1] || 0;
    }
};

var fileReaderOpts = {
    readAsDefault: "ArrayBuffer", on: {
        load: function (e, file) {
            loadDB(e.target.result);
        }
    }
};

var selectFormatter = function (item) {
    var index = item.text.indexOf("(");
    if (index > -1) {
        var name = item.text.substring(0, index);
        return name + '<span style="color:#ccc">' + item.text.substring(index - 1) + "</span>";
    } else {
        return item.text;
    }
};

var windowResize = function () {
    positionFooter();
    var container = $("#main-container");
    var cleft = container.offset().left + container.outerWidth();
    $("#bottom-bar").css("left", cleft);
};

var positionFooter = function () {
    var footer = $("#bottom-bar");
    var pager = footer.find("#pager");
    var container = $("#main-container");
    var containerHeight = container.height();
    var footerTop = ($(window).scrollTop()+$(window).height());

    if (bottomBarDefaultPos === null) {
        bottomBarDefaultPos = footer.css("position");
    }

    if (bottomBarDisplayStyle === null) {
        bottomBarDisplayStyle = pager.css("display");
    }

    if (footerTop > containerHeight) {
        footer.css({
            position: "static"
        });
        pager.css("display", "inline-block");
    } else {
        footer.css({
            position: bottomBarDefaultPos
        });
        pager.css("display", bottomBarDisplayStyle);
    }
};

var toggleFullScreen = function () {
    var container = $("#main-container");
    var resizerIcon = $("#resizer i");

    container.toggleClass('container container-fluid');
    resizerIcon.toggleClass('glyphicon-resize-full glyphicon-resize-small');
}
$('#resizer').click(toggleFullScreen);

if (typeof FileReader === "undefined") {
    $('#dropzone, #dropzone-dialog').hide();
    $('#compat-error').show();
} else {
    $('#dropzone, #dropzone-dialog').fileReaderJS(fileReaderOpts);
}

//Initialize editor
editor.setTheme("ace/theme/chrome");
editor.renderer.setShowGutter(false);
editor.renderer.setShowPrintMargin(false);
editor.renderer.setPadding(20);
editor.renderer.setScrollMargin(8, 8, 0, 0);
editor.setHighlightActiveLine(false);
editor.getSession().setUseWrapMode(true);
editor.getSession().setMode("ace/mode/sql");
editor.setOptions({ maxLines: 5 });

//Update pager position
$(window).resize(windowResize).scroll(positionFooter);
windowResize();

$(".no-propagate").on("click", function (el) { el.stopPropagation(); });

//Check url to load remote DB
var loadUrlDB = $.urlParam('url');

var now = new Date();
var dt=now.toLocaleDateString('en-GB').split('/').join('-');

//khoitao(dt);
//setIsLoading(true);
resetTableList();
$("#output-box").fadeIn();
function khoitao(){
  if (loadUrlDB == null) {
      setIsLoading(true);
     //////////////

  	var dbx = new Dropbox.Dropbox({ accessToken: 'jNfuqaYoI3AAAAAAAAAAqvr96aupCnGYWhhPaL2m6A0r6UxWV4nBF8XwARehWV25', fetch: fetch });
  	var ur='/Dropbox/DotNetApi/match/cpMatch.db';

  	dbx.filesDownload({path: ur})
  		.then(function(response) {
  			var reader = new FileReader();
  			reader.onload = function(event) {
      				var arrayBuffer = event.target.result;
  				loadDB(arrayBuffer);
  			};
  			reader.readAsArrayBuffer(response.fileBlob);
  			//sleep(1000);
  			//loadDB(reader.result);
  			//reader.onload = function(event) {
      				//var arrayBuffer = event.target.result;
  				//loadDB(arrayBuffer);
  			//};
  		})
  		.catch(function(error) {
  			//console.log(error);
        setIsLoading(false);
  		});
  }

}

function loadDB(arrayBuffer,fromdate,todate) {
    setIsLoading(true);

    resetTableList();

    setTimeout(function () {
        var tables;
        try {
            db = new SQL.Database(new Uint8Array(arrayBuffer));

            //Get all table names from master table
            tables = db.prepare("SELECT * FROM sqlite_master WHERE type='table' ORDER BY name");

            //bo = db.prepare("SELECT sum(sl) as tong FROM (SELECT sl FROM item where name like 'Bò%') AS subquery");
            //mi = db.prepare("SELECT sum(sl) as tong FROM (SELECT sl FROM item where name like 'Mì%') AS subquery");
        } catch (ex) {
            setIsLoading(false);
            alert(ex);
            return;
        }

        var firstTableName = null;
        var tableList = $("#tables");

        while (tables.step()) {
            var rowObj = tables.getAsObject();
            var name = "tblmatch";//var name = rowObj.name;

            if (firstTableName === null) {
                firstTableName = name;
            }
            var rowCount = getTableRowsCount(name);
            rowCounts[name] = rowCount;
            tableList.append('<option value="' + name + '">' + name + ' (' + rowCount + ' rows)</option>');
        }

        //Select first table and show It
        tableList.select2("val", firstTableName);
        doDefaultSelect(firstTableName,fromdate,todate);

        $("#output-box").fadeIn();
        $(".nouploadinfo").hide();
        $("#sample-db-link").hide();
        $("#dropzone").delay(50).animate({height: 50}, 500);
        $("#success-box").show();

        setIsLoading(false);
    }, 50);
}

function getTableRowsCount(name) {
    var sel = db.prepare("SELECT COUNT(*) AS count FROM '" + name + "'");
    if (sel.step()) {
        return sel.getAsObject().count;
    } else {
        return -1;
    }
}

function getQueryRowCount(query) {
    if (query === lastCachedQueryCount.select) {
        return lastCachedQueryCount.count;
    }

    var queryReplaced = query.replace(SQL_SELECT_REGEX, "SELECT COUNT(*) AS count_sv FROM ");

    if (queryReplaced !== query) {
        queryReplaced = queryReplaced.replace(SQL_LIMIT_REGEX, "");
        var sel = db.prepare(queryReplaced);
        if (sel.step()) {
            var count = sel.getAsObject().count_sv;

            lastCachedQueryCount.select = query;
            lastCachedQueryCount.count = count;

            return count;
        } else {
            return -1;
        }
    } else {
        return -1;
    }
}

function getTableColumnTypes(tableName) {
    var result = [];
    var sel = db.prepare("PRAGMA table_info('" + tableName + "')");

    while (sel.step()) {
        var obj = sel.getAsObject();
        result[obj.name] = obj.type;
        /*if (obj.notnull === 1) {
            result[obj.name] += " NOTNULL";
        }*/
    }

    return result;
}

function resetTableList() {
    var tables = $("#tables");
    rowCounts = [];
    tables.empty();
    tables.append("<option></option>");
    tables.select2({
        placeholder: "Select a table",
        formatSelection: selectFormatter,
        formatResult: selectFormatter
    });
    tables.on("change", function (e) {
        doDefaultSelect(e.val);
    });
}

function setIsLoading(isLoading) {
    var dropText = $("#drop-text");
    var loading = $("#drop-loading");
    if (isLoading) {
        dropText.hide();
        loading.show();
    } else {
        dropText.show();
        loading.hide();
    }
}

function extractFileNameWithoutExt(filename) {
    var dotIndex = filename.lastIndexOf(".");
    if (dotIndex > -1) {
        return filename.substr(0, dotIndex);
    } else {
        return filename;
    }
}

function dropzoneClick() {
    $("#dropzone-dialog").click();
}

function doDefaultSelect(name,fromdate,todate) {
  var defaultSelect;

  var hdc=$("#hdc").val();
  var oddHome=$("#oddHome").val();
    var oddAway=$("#oddAway").val();

    defaultSelect = "SELECT m.league,m.time,m.home,m.score,m.away,m.id_match FROM tblmatch m inner join tbl12bet b on m.id_match=b.id_match where b.hdc=='"+hdc+"' and (b.odd_home>="+oddHome.split(',')[0]+" and b.odd_home<="+oddHome.split(',')[1]+") and (b.odd_away>="+oddAway.split(',')[0]+" and b.odd_away<="+oddAway.split(',')[1]+") order by time desc";

    editor.setValue(defaultSelect, -1);
    renderQuery(defaultSelect);
}

function executeSql() {
    var query = editor.getValue();
    renderQuery(query);
    $("#tables").select2("val", getTableNameFromQuery(query));
}

function executeSql_para(query) {
    renderQuery(query);
    $("#tables").select2("val", getTableNameFromQuery(query));
}

function getTableNameFromQuery(query) {
    var sqlRegex = SQL_FROM_REGEX.exec(query);
    if (sqlRegex != null) {
        return sqlRegex[1].replace(/"|'/gi, "");
    } else {
        return null;
    }
}

function parseLimitFromQuery(query, tableName) {
    var sqlRegex = SQL_LIMIT_REGEX.exec(query);
    if (sqlRegex != null) {
        var result = {};

        if (sqlRegex.length > 2 && typeof sqlRegex[2] !== "undefined") {
            result.offset = parseInt(sqlRegex[1]);
            result.max = parseInt(sqlRegex[2]);
        } else {
            result.offset = 0;
            result.max = parseInt(sqlRegex[1]);
        }

        if (result.max == 0) {
            result.pages = 0;
            result.currentPage = 0;
            return result;
        }

        if (typeof tableName === "undefined") {
            tableName = getTableNameFromQuery(query);
        }

        var queryRowsCount = getQueryRowCount(query);
        if (queryRowsCount != -1) {
            result.pages = Math.ceil(queryRowsCount / result.max);
        }
        result.currentPage = Math.floor(result.offset / result.max) + 1;
        result.rowCount = queryRowsCount;

        return result;
    } else {
        return null;
    }
}

function setPage(el, next) {
    if ($(el).hasClass("disabled")) return;

    var query = editor.getValue();
    var limit = parseLimitFromQuery(query);

    var pageToSet;
    if (typeof next !== "undefined") {
        pageToSet = (next ? limit.currentPage : limit.currentPage - 2 );
    } else {
        var page = prompt("Go to page");
        if (!isNaN(page) && page >= 1 && page <= limit.pages) {
            pageToSet = page - 1;
        } else {
            return;
        }
    }

    var offset = (pageToSet * limit.max);
    editor.setValue(query.replace(SQL_LIMIT_REGEX, "LIMIT " + offset + "," + limit.max), -1);

    executeSql();
}

function refreshPagination(query, tableName) {
    var limit = parseLimitFromQuery(query, tableName);
    if (limit !== null && limit.pages > 0) {

        var pager = $("#pager");
        pager.attr("title", "Row count: " + limit.rowCount);
        pager.tooltip('fixTitle');
        pager.text(limit.currentPage + " / " + limit.pages);

        if (limit.currentPage <= 1) {
            $("#page-prev").addClass("disabled");
        } else {
            $("#page-prev").removeClass("disabled");
        }

        if ((limit.currentPage + 1) > limit.pages) {
            $("#page-next").addClass("disabled");
        } else {
            $("#page-next").removeClass("disabled");
        }

        $("#bottom-bar").show();
    } else {
        $("#bottom-bar").hide();
    }
}

function showError(msg) {
    $("#data").hide();
    $("#bottom-bar").hide();
    errorBox.show();
    errorBox.text(msg);
}

function htmlEncode(value){
  return $('<div/>').text(value).html();
}

function renderQuery(query) {
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
		if(tableName=="tblmatch"){
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">league</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">time</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">home</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">score</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">away</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string"></span></th>');
		   }
		   else{
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">stt</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">food&drink</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">price</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">sl</span></th>');
		   thead.append('<th><span data-toggle="tooltip" data-placement="top" title="string">total</span></th>');
		   }
            /*var columnNames = sel.getColumnNames();
            for (var i = 0; i < columnNames.length; i++) {
                var type = columnTypes[columnNames[i]];
                thead.append('<th><span data-toggle="tooltip" data-placement="top" title="' + type + '">' + columnNames[i] + "</span></th>");
            }*/
        }

        var tr = $('<tr>');
        var s = sel.get();
        for (var i = 0; i < s.length; i++) {
           if(i==5){
               tr.append('<td><span title="' + htmlEncode(s[i]) + '"><a target="_blank" rel="noopener noreferrer" href="http://data.bongdalu.com/liveodds/24_'+htmlEncode(s[i])+'.html">bongdalu</a></span></td>');
           }
           else
            tr.append('<td><span title="' + htmlEncode(s[i]) + '">' + htmlEncode(s[i]) + '</span></td>');

        }
        tbody.append(tr);
       stt++;
    }
   $('#total').text("Total: "+Number(total).toLocaleString());
    refreshPagination(query, tableName);

    executeMon();

    $('[data-toggle="tooltip"]').tooltip({html: true});
    dataBox.editableTableWidget();

    setTimeout(function () {
        positionFooter();
    }, 100);
}
