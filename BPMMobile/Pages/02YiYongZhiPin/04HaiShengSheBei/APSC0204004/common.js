﻿function prepMsg(){
    tapEvent();
    uploadOpt();
    $("#fsqrq").val(getNowFormatDate(2));
    var xml = `<?xml version= "1.0" ?>
                  <Requests>
                      <Params>
                      <Method>GetFormPostData</Method>
                      <ProcessName>爱普公司业务费特批申请</ProcessName>
                      <ProcessVersion>${version}</ProcessVersion>
                      <Owner></Owner>
                      </Params>   
                  </Requests>
              `;

    $.ajax({
        type: "POST",
        url: "/api/bpm/DataProvider",
        data: { '': xml },
        beforeSend: function (XHR) {
            XHR.setRequestHeader('Authorization', 'Basic ' + localStorage.getItem('ticket'));
        }
    }).done(function (data) {
        var provideData = JSON.parse(unescape(data.replace(/\\(u[0-9a-fA-F]{4})/gm, '%$1')));
        console.log(provideData);
        var item = provideData.Tables[0].Rows[0];
        $("#fsqr").val(item.申请人);

    }).fail(function (e) {

    }).then(function () {

    });

}

function tapEvent() {


    $("#tjmx").on('tap', function () {
        var li = `
  <div id="mx" class="mui-card">
                    <div class="mui-input-row itemtitle">
                        <label>明细列表项</label>
                        <span class="mui-icon mui-icon-close mui-pull-right" style="margin-right:0.6rem;border-width:0.1rem;border-radius:1.2rem;margin-top:0.2rem;" id="deleteProduct" onclick="deleteItem(this)"></span>
                    </div>
                    <div class="mui-row cutOffLine padding">
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>产品编码</label>
                            <textarea rows="2" id="fcpbm" placeholder="请填写"></textarea>
                        </div>
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>产品名称</label>
                            <textarea rows="2" id="fcpmc" placeholder="请填写"></textarea>
                        </div>
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>规格型号</label>
                            <textarea rows="2" id="fggxh" placeholder="请填写"></textarea>
                        </div>
                    </div>

                    <div class="mui-row cutOffLine padding">
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>销售单价</label>
                            <input type="number" id="fxsdj" placeholder="请填写" />
                        </div>
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>核算业务费底价</label>
                            <input type="number" id="fwyf" placeholder="请填写" />
                        </div>
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>备注说明</label>
                            <textarea rows="2" id="fbz" placeholder="请填写"></textarea>
                        </div>
                    </div>
                </div>
                 `;
        $("#mxlist").append(li);

    });

    $("#mxlist").on('input', 'input[type="number"]', function () {

        calcTotal();
    });
}

function calcTotal() {

    var fxsdj_total = 0;
    var fywf_total = 0;

    $("#mxlist").find("#mx").each(function () {
        var _self = this;
        var fxsdj = parseFloat($(this).find("#fxsdj").val());
        var fywf = parseFloat($(this).find("#fwyf").val());
      
        fxsdj = isNaN(fxsdj) ? 0 : fxsdj;
        fywf = isNaN(fywf) ? 0 : fywf;
       
        fxsdj_total += fxsdj;
        fywf_total += fywf;
       

    });

    $("#fxsdj_total").val(fxsdj_total);
    $("#fywf_total").val(fywf_total);
}


function initData(data, flag) {


    var item = data.FormDataSet.爱普公司_价格特批申请_主表[0];
    if (flag) {
        $("#taskId").val(item.TaskID);
        $("#stepId").val(stepId);
        $("#fbillno").val(item.单号);
    }
    $("#fsqr").val(item.申请人);
    $("#fsqrq").val(FormatterTimeYMS(item.申请日期));
    $("#flxfs").val(item.联系方式);
    $("#fkhmc").val(item.客户名称);
    $("#fkhjb").val(item.客户级别);
    $("#fkhxz").val(item.客户性质);
    $("#fsxq").val(item.授信期);
    $("#fxscp").val(item.销售产品);
    $("#fpsyy").val(item.配送医院);
    $("#fsqly").val(item.申请理由);
    if (item.附件 != null && item.附件 != "") {
        var fjtmp = (String)(item.附件);

        fjArray = fjtmp.split(";");


        //console.log("fjArray:" + fjArray);

        //请求附件详细信息
        $.ajax({
            type: 'POST',
            url: '/api/bpm/GetAttachmentsInfo',
            //dataType:'json',
            data: { 'fileIds': fjArray },

            beforeSend: function (XHR) {
                XHR.setRequestHeader('Authorization', 'Basic ' + localStorage.getItem('ticket'));
            },
            success: function (data, status) {
                if (status == "success") {

                    console.log(data);

                    for (var i = 0; i < data.length; i++) {

                        var name = data[i].Name;
                        var type = (data[i].Ext).replace(".", "");
                        var size = String(data[i].Size);

                        var time = String(data[i].LastUpdate).replace("T", " ");
                        var downurl = baseDownloadUrl + data[i].FileID;

                        var attach = attachItem(name, type, size, time, downurl);
                        attachArray.push(attach);

                        var li = '<div class="pic-preview smallyulan success">';
                        li = li + ' <div class="del none" style="opacity:1;z-index:999;"onclick="delPicture(this)">x</div>';

                        //类型判断 
                        if ((data[i].Ext).indexOf("png") != -1 || (data[i].Ext).indexOf("jpg") != -1 || (data[i].Ext).indexOf("bmp") != -1) {

                            //li = li + '    <div class="img-wrap smallimg" id="simg" ><a href="'+baseDownloadUrl + data[i].FileID + '"><img src="'+baseDownloadUrl + data[i].FileID + '"/></a></div>';
                            li = li + '    <div class="img-wrap smallimg imgdiv" id="' + i + '" ><img src="' + baseDownloadUrl + data[i].FileID + '"/></div>';

                        } else if ((data[i].Ext).indexOf("xls") != -1) {

                            li = li + '    <div class="img-wrap smallimg imgdiv" id="' + i + '"><img src="../../Content/images/xlsx@2x.png"/></div>';

                        } else if ((data[i].Ext).indexOf("doc") != -1) {

                            li = li + '    <div class="img-wrap smallimg imgdiv" id="' + i + '"><img src="../../Content/images/docx@2x.png"/></div>';

                        } else if ((data[i].Ext).indexOf("ppt") != -1) {

                            li = li + '    <div class="img-wrap smallimg imgdiv" id="' + i + '"><img src="../../Content/images/ppt@2x.png"/></div>';

                        } else if ((data[i].Ext).indexOf("pdf") != -1) {

                            li = li + '    <div class="img-wrap smallimg imgdiv" id="' + i + '"><img src="../../Content/images/pdf@2x.png"/></div>';

                        } else if ((data[i].Ext).indexOf("zip") != -1 || (data[i].Ext).indexOf("rar") != -1 || (data[i].Ext).indexOf("7z") != -1) {

                            li = li + '    <div class="img-wrap smallimg imgdiv" id="' + i + '"><img src="../../Content/images/zip@2x.png"/></div>';

                        } else if ((data[i].Ext).indexOf("txt") != -1) {

                            li = li + '    <div class="img-wrap smallimg imgdiv" id="' + i + '"><img src="../../Content/images/txt@2x.png"/></div>';

                        } else {
                            li = li + '    <div class="img-wrap smallimg imgdiv" id="' + i + '"><img src="../../Content/images/unkown@2x.png"/></div>';
                        }

                        li = li + ' </div>';
                        li = li + '</div>';
                        $(".upload-img-list").append(li);


                        $(".imgdiv").each(function () {

                            $(this).parent().find(".del.none").hide();

                        });




                    }
                    watch();
                    $(".imgdiv").on('tap', function () {
                        console.log($(this)[0].id);
                        console.log(navigator.userAgent);
                        if (String(navigator.userAgent).match('cloudhub') != null) {
                            window.open(attachArray[$(this)[0].id].downurl);
                        }
                        XuntongJSBridge.call('showFile', {
                            'fileName': attachArray[$(this)[0].id].name,
                            'fileExt': attachArray[$(this)[0].id].type,
                            'fileTime': attachArray[$(this)[0].id].time,
                            'fileSize': attachArray[$(this)[0].id].size,
                            'fileDownloadUrl': attachArray[$(this)[0].id].downurl
                        }, function (result) {
                            //alert(JSON.stringify(result));
                        });
                    });


                }

            }, error: function (e) {
                console.log(e);

            }, complete: function () {

            }

        });

    }

    var item_c = data.FormDataSet.爱普公司_价格特批申请_子表;
    for (var i = 0; i < item_c.length; i++) {
        itemidArr.push(itemidArr[i]);
        var li = `  <div id="mx" class="mui-card">
                    <div class="mui-input-row itemtitle">
                        <label>明细列表项</label>
                        <span class="mui-icon mui-icon-close mui-pull-right" style="margin-right:0.6rem;border-width:0.1rem;border-radius:1.2rem;margin-top:0.2rem;display:none;" id="deleteProduct" onclick="deleteItem(this)"></span>
                    </div>
                    <div class="mui-row cutOffLine padding">
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>产品编码</label>
                            <textarea rows="2" id="fcpbm" readonly>${item_c[i].产品编码}</textarea>
                        </div>
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>产品名称</label>
                            <textarea rows="2" id="fcpmc" readonly>${item_c[i].产品名称}</textarea>
                        </div>
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>规格型号</label>
                            <textarea rows="2" id="fggxh" readonly>${item_c[i].规格型号}</textarea>
                        </div>
                    </div>

                    <div class="mui-row cutOffLine padding">
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>销售单价</label>
                            <input type="number" id="fxsdj" readonly value="${item_c[i].销售单价}"/>
                        </div>
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>核算业务费底价</label>
                            <input type="number" id="fwyf" readonly value="${item_c[i].核算业务费底价}"/>
                        </div>
                        <div class="mui-col-xs-4" style="display:flex;">
                            <label>备注说明</label>
                            <textarea rows="2" id="fbz" readonly>${item_c[i].备注说明}</textarea>
                        </div>
                    </div>
                </div>

                  `;
        $("#mxlist").append(li);
    }


    calcTotal();

}


function nodeControllerExp(nodeName) {

    if (String(nodeName).match('开始') != null) {

        tapEvent();
        $(".upload-addbtn").show();
        uploadOpt();
        $("#tjmx").show();
        $("#mxlist").find("#mx").each(function () {
            $(this).find('span').show();
            $(this).find('input,textarea').removeAttr('readonly');
        });
        $("#flxfs,#fkhmc,#fkhjb,#fkhxz,#fsxq,#fxscp,#fpsyy,#fsqly").removeAttr('readonly');

    }
}

class Mx {

    constructor(fcpbm, fcpmc, fggxh, fxsdj, fwyf, fbz) {
        this.fcpbm = fcpbm;
        this.fcpmc = fcpmc;
        this.fggxh = fggxh;
        this.fxsdj = fxsdj;
        this.fwyf = fwyf;
        this.fbz = fbz;
    }
}


function Save() {
    var fsqr = $("#fsqr").val();
    var fsqrq = $("#fsqrq").val();
    var flxfs = $("#flxfs").val();
    var fkhmc = $("#fkhmc").val();

    var fkhjb = $("#fkhjb").val();
    var fkhxz = $("#fkhxz").val();
    var fsxq = $("#fsxq").val();
    var fxscp = $("#fxscp").val();
    var fpsyy = $("#fpsyy").val();
    var fsqly = $("#fsqly").val();

    var fxsdj_total = $("#fxsdj_total").val();
    var fywf_total = $("#fywf_total").val();

    if (!flxfs) {
        mui.toast('请填写联系方式');
        return;
    }

    if (!fkhmc) {
        mui.toast('请填写客户名称');
        return;
    }
    if (!fkhjb) {
        mui.toast('请填写客户级别');
        return;
    }
    if (!fkhxz) {
        mui.toast('请填写客户性质');
        return;
    }
    if (!fsxq) {
        mui.toast('请填写授信期');
        return;
    }
    if (!fxscp) {
        mui.toast('请填写销售产品');
        return;
    }

    if (!fsqly) {
        mui.toast('请填写申请理由');
        return;
    }

    var mxlistArr = [];
    $("#mxlist").find("#mx").each(function () {
        var fcpbm = $(this).find("#fcpbm").val();
        var fcpmc = $(this).find("#fcpmc").val();
        var fggxh = $(this).find("#fggxh").val();
        var fxsdj = $(this).find("#fxsdj").val();
        var fwyf = $(this).find("#fwyf").val();
        var fbz = $(this).find("#fbz").val();

        var mx = new Mx(fcpbm, fcpmc, fggxh, fxsdj, fwyf, fbz);
        mxlistArr.push(mx);
    });


    var btnArry = ["取消", "确定"];
    mui.confirm('即将提交，是否确定？', '提交确认提醒', btnArry, function (e) {
        if (e.index == 1) {
            var xml = `<?xml version="1.0"?>
                        <XForm>
                            <Header>
                                <Method>Post</Method>
                                <ProcessName>爱普公司业务费特批申请</ProcessName>
                                <ProcessVersion>${version}</ProcessVersion>
                                <DraftGuid></DraftGuid>
                                <OwnerMemberFullName>${BPMOU}</OwnerMemberFullName>
                                <Action>提交</Action>
                                <Comment></Comment>
                                <UrlParams></UrlParams>
                                <ConsignEnabled>false</ConsignEnabled>
                                <ConsignUsers>[]</ConsignUsers>
                                <ConsignRoutingType>Parallel</ConsignRoutingType>
                                <ConsignReturnType>Return</ConsignReturnType>
                                <InviteIndicateUsers>[]</InviteIndicateUsers>
                                <Context>{&quot;Routing&quot;:{}}</Context>
                            </Header>
                           <FormData>
                       `;

            xml += ` <爱普公司_业务费特批申请_主表>
            <单号>自动生成</单号>
            <申请人>${fsqr}</申请人>
            <申请日期>${fsqrq}</申请日期>
            <联系方式>${flxfs}</联系方式>
            <客户名称>${fkhmc}</客户名称>
            <客户级别>${fkhjb}</客户级别>
            <客户性质>${fkhxz}</客户性质>
            <授信期>${fsxq}</授信期>
            <销售产品>${fxscp}</销售产品>
            <配送医院>${fpsyy}</配送医院>
            <申请理由>${fsqly}</申请理由>
            <附件>${fjArray.join(";")}</附件>
        </爱普公司_业务费特批申请_主表>
                     `;

            for (var i = 0; i < mxlistArr.length; i++) {

                xml += `
        <爱普公司_业务费特批申请_子表>
            <RelationRowGuid>${i+1}</RelationRowGuid>
            <RowPrimaryKeys></RowPrimaryKeys>
            <序号>${i + 1}</序号>
            <产品编码>${mxlistArr[i].fcpbm}</产品编码>
            <产品名称>${mxlistArr[i].fcpmc}</产品名称>
            <规格型号>${mxlistArr[i].fggxh}</规格型号>
            <销售单价>${mxlistArr[i].fxsdj}</销售单价>
            <核算业务费底价>${mxlistArr[i].fwyf}</核算业务费底价>
            <备注说明>${mxlistArr[i].fbz}</备注说明>
        </爱普公司_业务费特批申请_子表>
                      `;
            }
            xml += `
                       </FormData>
                    </XForm>
                   `;
            PostXml(xml);
        } 
    })


}





function reSave() {
    var fbillno = $("#fbillno").val();
    var pid = $("#stepId").val();

    var fsqr = $("#fsqr").val();
    var fsqrq = $("#fsqrq").val();
    var flxfs = $("#flxfs").val();
    var fkhmc = $("#fkhmc").val();

    var fkhjb = $("#fkhjb").val();
    var fkhxz = $("#fkhxz").val();
    var fsxq = $("#fsxq").val();
    var fxscp = $("#fxscp").val();
    var fpsyy = $("#fpsyy").val();
    var fsqly = $("#fsqly").val();

    var fxsdj_total = $("#fxsdj_total").val();
    var fywf_total = $("#fywf_total").val();

    if (!flxfs) {
        mui.toast('请填写联系方式');
        return;
    }

    if (!fkhmc) {
        mui.toast('请填写客户名称');
        return;
    }
    if (!fkhjb) {
        mui.toast('请填写客户级别');
        return;
    }
    if (!fkhxz) {
        mui.toast('请填写客户性质');
        return;
    }
    if (!fsxq) {
        mui.toast('请填写授信期');
        return;
    }
    if (!fxscp) {
        mui.toast('请填写销售产品');
        return;
    }

    if (!fsqly) {
        mui.toast('请填写申请理由');
        return;
    }

    var mxlistArr = [];
    $("#mxlist").find("#mx").each(function () {
        var fcpbm = $(this).find("#fcpbm").val();
        var fcpmc = $(this).find("#fcpmc").val();
        var fggxh = $(this).find("#fggxh").val();
        var fxsdj = $(this).find("#fxsdj").val();
        var fwyf = $(this).find("#fwyf").val();
        var fbz = $(this).find("#fbz").val();

        var mx = new Mx(fcpbm, fcpmc, fggxh, fxsdj, fwyf, fbz);
        mxlistArr.push(mx);
    });

    var btnArry = ["取消", "确定"];
    mui.confirm('即将提交，是否确定？', '提交确认提醒', btnArry, function (e) {
        if (e.index == 1) {
            var xml = `<?xml version="1.0"?>
                         <XForm>
                           <Header>
                             <Method>Process</Method>
                             <PID>${pid}</PID>
                             <Action>提交</Action>
                              <Comment></Comment>
                             <InviteIndicateUsers></InviteIndicateUsers>
                           </Header>
                           <FormData>
                       `;
            xml += ` <爱普公司_业务费特批申请_主表>
            <单号>${fbillno}</单号>
            <申请人>${fsqr}</申请人>
            <申请日期>${fsqrq}</申请日期>
            <联系方式>${flxfs}</联系方式>
            <客户名称>${fkhmc}</客户名称>
            <客户级别>${fkhjb}</客户级别>
            <客户性质>${fkhxz}</客户性质>
            <授信期>${fsxq}</授信期>
            <销售产品>${fxscp}</销售产品>
            <配送医院>${fpsyy}</配送医院>
            <申请理由>${fsqly}</申请理由>
            <附件>${fjArray.join(";")}</附件>
        </爱普公司_业务费特批申请_主表>
                     `;

            for (var i = 0; i < mxlistArr.length; i++) {

                xml += `
        <爱普公司_业务费特批申请_子表>
            <RelationRowGuid>${i + 1}</RelationRowGuid>
            <RowPrimaryKeys></RowPrimaryKeys>
            <序号>${i + 1}</序号>
            <产品编码>${mxlistArr[i].fcpbm}</产品编码>
            <产品名称>${mxlistArr[i].fcpmc}</产品名称>
            <规格型号>${mxlistArr[i].fggxh}</规格型号>
            <销售单价>${mxlistArr[i].fxsdj}</销售单价>
            <核算业务费底价>${mxlistArr[i].fwyf}</核算业务费底价>
            <备注说明>${mxlistArr[i].fbz}</备注说明>
        </爱普公司_业务费特批申请_子表>
                      `;
            }
            xml += `
                       </FormData>
                    </XForm>
                   `;
            PostXml(xml);
        }
    });

}

function hasRead() {
    var pid = $("#stepId").val();
    var fbillno = $("#fbillno").val();
    var comment = '';
    var btnArray = ['取消', '确定'];
    mui.prompt('请选填知会意见', '可以不填', '知会意见', btnArray, function (e) {
        if (e.index == 1) {
            comment = e.value;
            var xml = `<?xml version="1.0"?>
                           <XForm>
                             <Header>
                               <Method>InformSubmit</Method>
                               <PID>${pid}</PID>
                               <Comment>${comment}</Comment>
                             </Header>
                           </XForm>
              `;
            PostXml(xml);
        }
    });
}

function AgreeOrConSign() {

    var pid = $("#stepId").val();
    var fbillno = $("#fbillno").val();
    var comment = $("#signSuggest").val();
    var nodeName = $("#nodeName").val();

    var fsqr = $("#fsqr").val();
    var fsqrq = $("#fsqrq").val();
    var flxfs = $("#flxfs").val();
    var fkhmc = $("#fkhmc").val();

    var fkhjb = $("#fkhjb").val();
    var fkhxz = $("#fkhxz").val();
    var fsxq = $("#fsxq").val();
    var fxscp = $("#fxscp").val();
    var fpsyy = $("#fpsyy").val();
    var fsqly = $("#fsqly").val();

    var fxsdj_total = $("#fxsdj_total").val();
    var fywf_total = $("#fywf_total").val();


    var mxlistArr = [];
    $("#mxlist").find("#mx").each(function () {
        var fcpbm = $(this).find("#fcpbm").val();
        var fcpmc = $(this).find("#fcpmc").val();
        var fggxh = $(this).find("#fggxh").val();
        var fxsdj = $(this).find("#fxsdj").val();
        var fwyf = $(this).find("#fwyf").val();
        var fbz = $(this).find("#fbz").val();

        var mx = new Mx(fcpbm, fcpmc, fggxh, fxsdj, fwyf, fbz);
        mxlistArr.push(mx);
    });

    var consignFlag = false;
    var consignUserId = new Array();
    var consignRoutingType;
    var consignReturnType;
    var consignUserStr;

    //加签if分支
    if (($('#signPer').val() != null) && ($('#signPer').val() != '')) {

        consignFlag = true;

        if ($('#sxsl').hasClass('mui-selected')) {
            consignRoutingType = 'Serial';

        } else if ($('#pxsl').hasClass('mui-selected')) {
            consignRoutingType = 'Parallel';
        }

        if ($('#hdbjdl').hasClass('mui-selected')) {
            consignReturnType = 'Return';
        } else if ($('#jrxjdl').hasClass('mui-selected')) {
            consignReturnType = 'Forward';
        }

        var consignAjax = $.ajax({
            type: "POST",
            url: "/api/bpm/PostAccount",
            data: { "ids": consignOpenIdArr },
            beforeSend: function (XHR) {
                XHR.setRequestHeader('Authorization', 'Basic ' + localStorage.getItem('ticket'));

            }
        }).done(function (data, status) {
            //alert(status);
            if (status == "success") {


                for (var i = 0; i < data.data.length; i++) {
                    consignUserId.push(data.data[i].phone);
                }
                $('#consignUser').val(consignUserId);
                consignUserStr = (String)($('#consignUser').val()).split(",");

                for (var i = 0; i < consignUserStr.length; i++) {
                    consignUserStr[i] = '&quot;' + consignUserStr[i] + '&quot;';
                }
                consignUserStr = '[' + consignUserStr.toString() + ']';



            }
        }).fail(function () {

        });
    } else {


    }

    if (consignFlag) {
        consignAjax.then(function () {
            var xml = `<?xml version="1.0"?>
                     <XForm>
                     <Header>
                     <Method>Process</Method>
                     <PID>${pid}</PID>
                     <Action>同意</Action>
                     <Comment>${comment}</Comment>
            
                     <ConsignEnabled>true</ConsignEnabled>
                     <ConsignUsers>${consignUserStr}</ConsignUsers>
                     <ConsignRoutingType>${consignRoutingType}</ConsignRoutingType>
                     <ConsignReturnType>${consignReturnType}</ConsignReturnType>
                     <InviteIndicateUsers>[]</InviteIndicateUsers>
                     <Context>{&quot;Routing&quot;:{}}</Context>
                     </Header>
                     <FormData>`;
            xml += ` <爱普公司_业务费特批申请_主表>
            <单号>${fbillno}</单号>
            <申请人>${fsqr}</申请人>
            <申请日期>${fsqrq}</申请日期>
            <联系方式>${flxfs}</联系方式>
            <客户名称>${fkhmc}</客户名称>
            <客户级别>${fkhjb}</客户级别>
            <客户性质>${fkhxz}</客户性质>
            <授信期>${fsxq}</授信期>
            <销售产品>${fxscp}</销售产品>
            <配送医院>${fpsyy}</配送医院>
            <申请理由>${fsqly}</申请理由>
            <附件>${fjArray.join(";")}</附件>
        </爱普公司_业务费特批申请_主表>
                     `;

            for (var i = 0; i < mxlistArr.length; i++) {

                xml += `
        <爱普公司_业务费特批申请_子表>
            <RelationRowGuid>${i + 1}</RelationRowGuid>
            <RowPrimaryKeys>itemid=${itemidArr[i]}</RowPrimaryKeys>
            <序号>${i + 1}</序号>
            <产品编码>${mxlistArr[i].fcpbm}</产品编码>
            <产品名称>${mxlistArr[i].fcpmc}</产品名称>
            <规格型号>${mxlistArr[i].fggxh}</规格型号>
            <销售单价>${mxlistArr[i].fxsdj}</销售单价>
            <核算业务费底价>${mxlistArr[i].fwyf}</核算业务费底价>
            <备注说明>${mxlistArr[i].fbz}</备注说明>
        </爱普公司_业务费特批申请_子表>
                      `;
            }
            xml += `
                       </FormData>
                    </XForm>
                   `;
            PostXml(xml);

        })
    } else {

        var xml = `<?xml version="1.0"?>
                   <XForm>
                   <Header>
                   <Method>Process</Method>
                   <PID>${pid}</PID>
                   <Action>同意</Action>
                   <Comment>${comment}</Comment>

                    <UrlParams></UrlParams>
                    <ConsignEnabled>false</ConsignEnabled>
                    <ConsignUsers>[]</ConsignUsers>
                    <ConsignRoutingType>Parallel</ConsignRoutingType>
                    <ConsignReturnType>Return</ConsignReturnType>

                  <InviteIndicateUsers>[]</InviteIndicateUsers>
                  <Context>{&quot;Routing&quot;:{}}</Context>
                  </Header>
                  <FormData>`;
        xml += ` <爱普公司_业务费特批申请_主表>
            <单号>${fbillno}</单号>
            <申请人>${fsqr}</申请人>
            <申请日期>${fsqrq}</申请日期>
            <联系方式>${flxfs}</联系方式>
            <客户名称>${fkhmc}</客户名称>
            <客户级别>${fkhjb}</客户级别>
            <客户性质>${fkhxz}</客户性质>
            <授信期>${fsxq}</授信期>
            <销售产品>${fxscp}</销售产品>
            <配送医院>${fpsyy}</配送医院>
            <申请理由>${fsqly}</申请理由>
            <附件>${fjArray.join(";")}</附件>
        </爱普公司_业务费特批申请_主表>
                     `;

        for (var i = 0; i < mxlistArr.length; i++) {

            xml += `
        <爱普公司_业务费特批申请_子表>
            <RelationRowGuid>${i + 1}</RelationRowGuid>
            <RowPrimaryKeys>itemid=${itemidArr[i]}</RowPrimaryKeys>
            <序号>${i + 1}</序号>
            <产品编码>${mxlistArr[i].fcpbm}</产品编码>
            <产品名称>${mxlistArr[i].fcpmc}</产品名称>
            <规格型号>${mxlistArr[i].fggxh}</规格型号>
            <销售单价>${mxlistArr[i].fxsdj}</销售单价>
            <核算业务费底价>${mxlistArr[i].fwyf}</核算业务费底价>
            <备注说明>${mxlistArr[i].fbz}</备注说明>
        </爱普公司_业务费特批申请_子表>
                      `;
        }
        xml += `
                       </FormData>
                    </XForm>
                   `;
        PostXml(xml);

    }
}
