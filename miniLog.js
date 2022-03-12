(function(console, commonColor = {
    keyColor: '#a1f7b5',
    arrowColor: '#ff7f0b',
    leafContentColor: '#9980f1',
    middleContentColor: 'white',
    background: 'black'
}, styleIdAndRootClass) {


    if (!console) {
        console = window.console = {};
        console.log = function() {};
    }
    var hasInit = false;
    var clog = console.log;

    var panel, list;
    // 缓存 consolelog
    var tempConsoleStorage = [];
    // 原生控制台日志输出
    var originLog = function() {
            Function.prototype.apply.call(clog, console, arguments);
        }
        // 错误日志输出
    var logError = function(e, filename, lineNo, colno, errObj, caller) {
            log('#f00', [
                e.message || e.error || (e.toString ? e.toString() : e)
            ]);
            log('#f00', [
                '[error]',
                (filename || e.filename),
                (lineNo || e.lineno || '-') + ':' + (colno || e.colno || '-')
            ]);
        }
   

    var errFunc = function(e, filename, lineNo, colno, errObj) {
        if (!hasInit) {
            alert(e.message || e + 'from:' + (arguments.callee.caller && arguments.callee.caller.toString()));
        }
        logError(e, filename, lineNo, colno, errObj, arguments.callee.caller);
    }
    window.onerror ? window.addEventListener('error', errFunc) : (window.onerror = errFunc);
    // 暂存log，防止初始化之前错过日志信息
    console.log = function() {
        tempConsoleStorage.push(arguments);
        originLog.apply(null, arguments);
    }

    var start = function() {
        initPanel();

        tempConsoleStorage.forEach(function(args) {
            log(commonColor, args);
        });

        console.log = function() {
            log(commonColor, arguments);
            originLog.apply(null, arguments);
        }
        initZoom();
        initEvent();
        hasInit = true;
    };
    (document.readyState === 'interactive' || document.readyState === 'complete') ?
    start():
        document.addEventListener('DOMContentLoaded', start);
    var addLogDom = (function() {
            var isInitStyle;
            var isRequest;
            return function(target, dataArray, styleIdAndRootClass = 'debug-tree-style', customStyle = {
                keyColor: '#a1f7b5',
                arrowColor: '#ff7f0b',
                leafContentColor: '#9980f1',
                middleContentColor: 'white',
                background: 'black'
            }) {
                if (!isInitStyle) {
                    initStyle(styleIdAndRootClass, customStyle);
                    isInitStyle = true;
                }
                var li = document.createElement('li')
                var ol = document.createElement('ol')
                originLog(dataArray)

                Array.prototype.forEach.call(dataArray, (function(item, index) {
                    var type = Object.prototype.toString.call(item);
                    if (type === '[object Object]' || type === '[object Array]' || type === '[object XMLHttpRequest]' || type === '[object Error]') {
                        initTreeDom(ol, item, isRequest)
                    } else {

                        if (item === 'request') {
                            isRequest = true;
                        } else {

                            initNormalDom(ol, item)
                        }
                    }
                }))
                addOtherInfoNode(ol);
                li.appendChild(ol)
                if (!isRequest) {
                    li.className = styleIdAndRootClass + 'normal-li'
                }
                target.insertBefore(li, target.firstChild)
                isRequest = false;
            }
        })()
        


    //打印日志
    function log(color, args) {
        if (!panel) { return; }
        addLogDom(list, args, styleIdAndRootClass, color)
    }
    // 初始化面板
    function initPanel() {
        if (!document.body) { return; }
        panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = [
            'position:fixed',
            'bottom:0',
            'left: 0',
            'opacity: .8',
            'width: 100vw',
            'display:none',
            'z-index:999999'
        ].join(';');

        panel.innerHTML = `<div style=' width: 100%;border: 1px solid skyblue;background-color: white;'>
                            <ul style= 'margin: 0;padding: 0;list-style: none;display: flex;justify-content: flex-start;align-content: center;'>
                                <li style='padding-left: 4vw;' id='debug-close'>✖</li>
                                <li style='padding-left: 4vw;' id='debug-minimize'>➖</li>
                                <li style='margin-left: 4vw;padding: 0 2vw;font-weight: bold;' id='debug-network'>网络</li>
                                <li style='margin-left: 4vw;padding: 0 2vw;font-weight: bold;' id='debug-clear'>清除</li>
                            </ul>
                        </div>
                        <div class='${styleIdAndRootClass}' id='${styleIdAndRootClass}' style='width: 100%;height: 60vh;overflow: scroll;background:black;box-sizing:border-box;'>
                        <ol style="clear:none;margin:0;padding:0;" id='pannel-list'></ol>
                        </div>`
        initStyle('debug-tree', {
            keyColor: '#a1f7b5',
            arrowColor: '#ff7f0b',
            leafContentColor: '#9980f1',
            middleContentColor: 'white',
            background: 'black'
        });
        document.body.appendChild(panel);
        list = document.getElementById('pannel-list');
    }



    function initZoom() {

        var zoomPanel = document.createElement('div');
        zoomPanel.style.cssText = [
            'position:fixed',
            'bottom:30%',
            'right: 1vw',
            'width: 13.3vw',
            'height: 13.3vw',
            'display:inherit',
            'color: #5e887c',
            'background:#d9e4e1',
            'border: 0.25vw solid',
            'border-radius: 50%',
            'outline: 2.5vw solid',
            'outline-offset: -9.3vw',
            'z-index:999999'
        ].join(';')
        zoomPanel.id = 'debuge-show';
        document.body.appendChild(zoomPanel);
    }
    
    function initEvent() {
        document.getElementById('debug-close').addEventListener("click", function() {
            destroyDoms([document.getElementById('debuge-show'), document.getElementById('debug-panel')]);
        })
        document.getElementById('debuge-show').addEventListener("click", function() {
            document.getElementById('debuge-show').style.display  ='none';
            document.getElementById('debug-panel').style.display = 'inherit';
           
        })
        document.getElementById('debug-minimize').addEventListener("click", function() {
            document.getElementById('debuge-show').style.display  ='inherit';
            document.getElementById('debug-panel').style.display = 'none';
        })
        document.getElementById('debug-clear').addEventListener("click", function() {
            var node = document.getElementById('pannel-list');
            while (node.hasChildNodes()) {
                node.removeChild(node.lastChild);
            }
        })
        var networkDom = document.getElementById('debug-network');
        networkDom.addEventListener("click", function() {
            var networkDom = document.getElementById('debug-network');
            var doms = document.getElementsByClassName(styleIdAndRootClass + 'normal-li');
            if (doms[0].style.display === 'none') {
                hideOrShowDom(doms, 'inherit');
                networkDom.style.background = "transparent"
            } else {

                hideOrShowDom(doms, 'none');
                networkDom.style.background = "#ccc";
            }
        })
    }

    function hideOrShowDom(doms, status) {
        Array.prototype.map.call(doms, function(item) {

            item.style.display = status;
        });

    }

    function destroyDoms(domArray) {

        domArray.forEach(function(item) {
            item.parentElement.removeChild(item)
        })
    }


    // 前序遍历对象
    var preOrderTraverse = (function() {
        var number = 0;
        return function(node, father) {
            for (var i in node) {
                var type = Object.prototype.toString.call(node[i]);
                if (type === '[object Object]' || type === '[object Array]') {
                    var sonNode = createChildTree(i + ': ', JSON.stringify(node[i]).slice(0, 30) + '...', `tree-${number++}`);
                    father.appendChild(sonNode.sonLiNode);
                    preOrderTraverse(node[i], sonNode.grandSonOlNode);
                } else {
                    var leafNode = createLeafNode(i + ': ', JSON.stringify(node[i]));
                    father.appendChild(leafNode);
                }

            }
        }
    })()

    function createLeafNode(attributeMsg, contentMsg) {
        const fraLeafLabel = document.createDocumentFragment();

        var leafAttributeNode = document.createElement('span');
        var ContentNode = document.createElement('span');
        var leafNode = document.createElement('li');
        leafAttributeNode.textContent = attributeMsg;
        leafAttributeNode.className = "leaf-attribute";
        ContentNode.textContent = contentMsg;
        ContentNode.className = "leaf-content";
        fraLeafLabel.appendChild(leafAttributeNode);
        fraLeafLabel.appendChild(ContentNode);
        leafNode.className = 'leaf';
        leafNode.appendChild(fraLeafLabel);
        return leafNode;
    }

    function createChildTree(GGSonAttributeMsg, GGSonContentMsg, domId) {
        var sonLiNode = document.createElement('li');
        var grandSonLabelNode = document.createElement('label');
        var GGSonSpanAttributeNode = document.createElement('span');
        var GGSonSpanContentNode = document.createElement('span');
        var grandSonInputNode = document.createElement('input');
        var grandSonOlNode = document.createElement('ol');
        const fragLabel = document.createDocumentFragment();
        const fragOl = document.createDocumentFragment();
        grandSonLabelNode.setAttribute("for", domId);
        GGSonSpanAttributeNode.textContent = GGSonAttributeMsg;
        GGSonSpanAttributeNode.className = "attribute";
        GGSonSpanContentNode.textContent = GGSonContentMsg;
        GGSonSpanContentNode.className = "content";
        grandSonInputNode.type = 'checkbox';
        grandSonInputNode.id = domId;
        fragLabel.appendChild(GGSonSpanAttributeNode);
        fragLabel.appendChild(GGSonSpanContentNode);
        grandSonLabelNode.appendChild(fragLabel);
        fragOl.appendChild(grandSonInputNode);
        fragOl.appendChild(grandSonLabelNode);
        fragOl.appendChild(grandSonOlNode);
        sonLiNode.appendChild(fragOl);

        return {
            sonLiNode,
            grandSonOlNode
        }
    }

    function createNetWorkLi(msgs, domId) {
        var sonLiNode = document.createElement('li');
        var grandSonLabelNode = document.createElement('label');
        var GGSonSpanNameeNode = document.createElement('span');
    
        var GGSonSpanStatusNode = document.createElement('span');
      
        var grandSonInputNode = document.createElement('input');
        var statusClass = addClassByStatus(msgs[2]);
        const fragLabel = document.createDocumentFragment();

        grandSonLabelNode.setAttribute("for", 'request-' + domId);
        grandSonLabelNode.className = `request-label ${statusClass}`;
        GGSonSpanNameeNode.textContent = msgs[0];
        GGSonSpanNameeNode.className = "reuqest-name";

        GGSonSpanStatusNode.textContent = msgs[2];
        GGSonSpanStatusNode.className = statusClass;

        grandSonInputNode.type = 'checkbox';
        grandSonInputNode.id = 'request-' + domId;
        fragLabel.appendChild(GGSonSpanNameeNode);
        fragLabel.appendChild(GGSonSpanStatusNode);
      
        grandSonLabelNode.appendChild(fragLabel);

        sonLiNode.appendChild(grandSonInputNode);
        sonLiNode.appendChild(grandSonLabelNode);
        sonLiNode.appendChild(fragLabel);
        return sonLiNode;
    }

    function addClassByStatus(status) {
        if (status !== 200) {
            return 'request-error'
        } else {
            return 'request-success'
        }
    }

    function initStyle(styleId, customStyle) {
        const treeStyle = `<style id='${styleId}'>.${styleId} body,ul,li{margin:0;padding:0;word-break:break-all;font-size:4.5vw;line-height: 7vw;list-style:none}.${styleId} body{margin:0}.${styleId}{padding-left: 4vw;background-color:${customStyle.background};padding: 2vw 2vw 2vw 4vw;}.${styleId} .request-label{display:flex;justify-content:space-between;color:${customStyle.keyColor}} .${styleIdAndRootClass + 'normal-li'}{}.${styleId} .request-label .request-error{color:red!important;}.${styleId} input,select,textarea,th,td{font-size:1em}.${styleId} ol.${styleId}{padding:0 0 0 8vw;width:100%;margin:0 auto;margin-top:26.7vw}.${styleId} li{position:relative;list-style:none}.${styleId} li.leaf{}.${styleId} li.leaf .leaf-attribute{color:${customStyle.keyColor};font-weight:bold}.${styleId} li.leaf .leaf-content{color:${customStyle.leafContentColor}}.${styleId} li input{position:absolute;left:0;margin-left:0;opacity:0;z-index:2;cursor:pointer;height:1em;width:1em;top:0}.${styleId} input~ol{display:none}.${styleId} input~ol>li{height:0;margin-left:-4vw !important;padding-left:1px}.${styleId} li label{position:relative;cursor:pointer;display:block;word-break:break-all;}.${styleId} li label .attribute{color:${customStyle.keyColor};font-weight:bold}.${styleId} li label .content{display:inline;color:${customStyle.middleContentColor}}.${styleId} li label::before{position:absolute;left:-2.4vw;top:3vw;content:'';width:0;height:0;border-left:1.5vw solid transparent;border-right:1.5vw solid transparent;border-bottom:1.5vw solid #ff7f0b;font-size:0;line-height:0;transform:rotate(90deg)}.${styleId} input:checked~ol{margin:-5.9vw 0 0 -11.7vw;padding:7.2vw 0 0 21.3vw;height:auto;display:block}.${styleId} input:checked~ol>li{height:auto}.${styleId} input:checked+label::before{position:absolute;left:-2.4vw;top:3vw;content:'';width:0;height:0;border-left:1.5vw solid transparent;border-right:1.5vw solid transparent;border-bottom:1.5vw solid #ff7f0b;font-size:0;line-height:0;transform:rotate(180deg)}.${styleId} input:checked+label .content{display:none}</style>`;
        var ele = document.createElement('div');
        ele.innerHTML = treeStyle;
        document.getElementsByTagName('head')[0].appendChild(ele.firstElementChild);
    }

    var initTreeDom = (function() {
        var requestNum = 0;
        return function(target, data, isRequest) {

            var treeOlNode = document.createElement('ol');

            var NetWorkLi;
            if (isRequest) {
                NetWorkLi = createNetWorkLi([data.config.url.replace(data.config.baseURL, ''), data.config.method, data.status, data.config.statusText], requestNum++);

                // console.log('status: ', response.status)
                // console.log('name: ', response.config.url.replace(response.config.baseURL, ''))
                // console.log('method: ', response.config.method)
                var ol = document.createElement('ol');

                preOrderTraverse(data, ol);
                NetWorkLi.appendChild(ol)
                treeOlNode.appendChild(NetWorkLi);

            } else {
                preOrderTraverse(data, treeOlNode);
            }
            //添加其他信息

            target.appendChild(treeOlNode);
        }
    })()

    function addOtherInfoNode(treeOlNode) {
        var infoLi = document.createElement('li');
        var timeSpanNode = document.createElement('span');
        timeSpanNode.textContent = new Date().toLocaleTimeString('ca', { hour12: false });
        var pathSpanNode = document.createElement('span');
        pathSpanNode.textContent = 'path：' + window.location.pathname;

        infoLi.appendChild(pathSpanNode);
        infoLi.appendChild(timeSpanNode);
        infoLi.style.cssText = "display: flex;justify-content:space-between;width: 100%;padding-bottom: 1vw;text-align: right;color: white;border-bottom: 1px dashed white;"
        treeOlNode.appendChild(infoLi);
    }

    function initNormalDom(target, data, treeClass) {
        var li = document.createElement('li');
        var span = document.createElement('span');
        li.className = 'leaf'
        span.className = 'leaf-content';
        span.textContent = data;
        li.appendChild(span);
        target.appendChild(li);
    }



})(window.console, {
    keyColor: '#a1f7b5',
    arrowColor: '#ff7f0b',
    leafContentColor: '#9980f1',
    middleContentColor: 'white',
    background: 'black'
}, 'debug');