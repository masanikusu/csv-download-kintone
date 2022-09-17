(function(){
    "use strict";
    //詳細画面
    kintone.events.on('app.record.detail.show', function(event) {
        let rec = event.record;
        let appId1 = kintone.app.getRelatedRecordsTargetAppId('ref1');
        let appId2 = kintone.app.getRelatedRecordsTargetAppId('ref2');
        
        //ボタンの有無をチェック
        if(document.getElementById('btn-export-csv')) {
            return;
        }
        
        //ボタン設置
        let csvButton = document.createElement('button');
        csvButton.textContent = 'CSVファイル出力';
        csvButton.id = 'btn-export-csv';
        kintone.app.record.getHeaderMenuSpaceElement().appendChild(csvButton);
        
        //クリックイベント
        csvButton.addEventListener('click', function() {
            getMakeCsv([appId1,appId2], rec).then(function(resp) {
                downloadFile(resp);
            });
        });
    });
    // csvデータの作成
    function getMakeCsv([appId1,appId2], customeRecords) {
        //ヘッダー作成
        let header = ['ヘッダー１','ヘッダー２','ヘッダー３','ヘッダー４','ヘッダー５','ヘッダー６'].join(',');
        let csvData = [header];

        // kintone Promise生成
        return new kintone.Promise(function(resolve){
            fetchRelatedRecords().then(function(resp){
                csvData = csvData.concat(resp);
                resolve(csvData);
            });
        });

        // 関連レコードの取得
        function fetchRelatedRecords() {
            let data = [];

            //各レコード番号から情報取得
            let ref1 = customeRecords.record_1.value;
            let ref2 = customeRecords.record_2.value;

            //レコード1をキーに該当関連レコードを取得
            let query1 = 'レコード番号 = "' + ref1 + '"';
            let params1 = {
                app: appId1,
                query: query1
            };

            //レコード2をキーに該当関連レコードを所得
            let query2 = 'レコード番号 = "' + ref2 + '"';
            let params2 = {
                app: appId2,
                query: query2
            };

            let app1;
            let app2;
            let app3;
            let hoge;
            
            //アプリ１つめ
            return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params1)
              .then(function(resp1) {
                let row = [];
                let relatedRecords = resp1.records;
                if(relatedRecords.length > 0) {
                    relatedRecords.forEach(function(relatedRecord) {
                        // フィールドコードの数だけ
                        row.push("\=\"" + relatedRecord.fieldCode1.value + "\"");
                        row.push("\=\"" + relatedRecord.fieldCode2.value + "\"");
                    });
                }
                app1 = row;

            //アプリ2つめ
            return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params2);
            }).then(function(resp2) {
                let row = [];
                let relatedRecords = resp2.records;
                if(relatedRecords.length > 0) {
                    relatedRecords.forEach(function(relatedRecord){
                        //フィールドコードの数だけ
                        row.push("\"" + relatedRecord.fieldCode3.value + "\"");
                        row.push("\"" + relatedRecord.fieldCode4.value + "\"");
                    });
                }

                //アプリ3つめ（該当アプリ）
                app2 = row;
                hoge = app1.concat(app2);
                let row1 = [];
                //フィールドコードの数だけ
                row.push("\"" + relatedRecord.fieldCode5.value + "\"");
                row.push("\"" + relatedRecord.fieldCode6.value + "\"");
                //情報連結
                app3 = hoge.concat(row1);
                //data配列にpush
                data.push(app3.join());
                if(customeRecords.length > 1) {
                    return fetchRelatedRecords();
                }
                return data;
            });
        }
    }

    //ダウンロード関数
    function downloadFile(data) {
        let csv = data.join('\r\n');
        //ファイル名
        let filename = 'filename_' + getTimeStamp() + '.csv';

        //Blob
        let bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        let blob = new Blob([bom, csv], { type: 'text/csv' });

        if (window.navigator.msSaveBlob) {
             window.navigator.msSaveBlob(blob, filename);
        } else {
                let e = new MouseEvent('click', {view: window, bubbles: true, cancelable: true});
                let url = window.URL || window.webkitURL;
                let blobUrl = url.createObjectURL(blob);
                let a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
                a.href = blobUrl;
                a.download = filename;
                a.dispatchEvent(e);
        }
    }
    // ファイル名に付与する日付の取得
    function getTimeStamp() {
        let d = new Date();
        let YYYY = d.getFullYear();
        let MM = d.getMonth() + 1;
        let DD = d.getDate();
        let hh = d.getHours();
        let mm = d.getMinutes();
        if (MM < 10) { MM = '0' + MM; }
        if (DD < 10) { DD = '0' + DD; }
        if (hh < 10) { hh = '0' + hh; }
        else if (mm < 10) { mm = '0' + mm; }
        return '' + YYYY + MM + DD + " " + hh + mm;
    }
})();