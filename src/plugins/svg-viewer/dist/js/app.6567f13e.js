(function(e){function t(t){for(var o,c,i=t[0],a=t[1],l=t[2],f=0,p=[];f<i.length;f++)c=i[f],Object.prototype.hasOwnProperty.call(r,c)&&r[c]&&p.push(r[c][0]),r[c]=0;for(o in a)Object.prototype.hasOwnProperty.call(a,o)&&(e[o]=a[o]);u&&u(t);while(p.length)p.shift()();return s.push.apply(s,l||[]),n()}function n(){for(var e,t=0;t<s.length;t++){for(var n=s[t],o=!0,i=1;i<n.length;i++){var a=n[i];0!==r[a]&&(o=!1)}o&&(s.splice(t--,1),e=c(c.s=n[0]))}return e}var o={},r={app:0},s=[];function c(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,c),n.l=!0,n.exports}c.m=e,c.c=o,c.d=function(e,t,n){c.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},c.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},c.t=function(e,t){if(1&t&&(e=c(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(c.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)c.d(n,o,function(t){return e[t]}.bind(null,o));return n},c.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return c.d(t,"a",t),t},c.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},c.p="/";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],a=i.push.bind(i);i.push=t,i=i.slice();for(var l=0;l<i.length;l++)t(i[l]);var u=a;s.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"35f2":function(e,t,n){"use strict";var o=n("62ed"),r=n.n(o);r.a},"56d7":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var o=n("2b0e"),r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[e._l(e.list,(function(t){return n("svg-icon",{directives:[{name:"show",rawName:"v-show",value:t.name.includes(e.keyword),expression:"svg.name.includes(keyword)"}],key:t.name,attrs:{svg:t},on:{view:e.view,copy:e.copy,optimize:e.optimize}})})),n("div",{staticClass:"svg-search"},[n("el-input",{attrs:{size:"small",placeholder:"请输入内容","prefix-icon":"el-icon-search"},model:{value:e.keyword,callback:function(t){e.keyword=t},expression:"keyword"}})],1),n("el-dialog",{staticClass:"svg-view",attrs:{title:e.current.name,visible:e.show,width:"500px"},on:{"update:visible":function(t){e.show=t}}},[n("div",{staticClass:"svg-view__content"},[n("div",{style:{"--color":e.color},domProps:{innerHTML:e._s(e.current.data)}}),n("el-color-picker",{staticClass:"svg-view__picker",model:{value:e.color,callback:function(t){e.color=t},expression:"color"}})],1),n("div",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[n("el-button",{attrs:{type:"warning"},on:{click:e.optimize}},[e._v("去除Fill")]),n("el-button",{attrs:{type:"primary"},on:{click:e.generate}},[e._v("生成代码")])],1)])],2)},s=[],c=(n("99af"),n("b0c0"),n("96cf"),n("1da1")),i=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"svg-icon",style:{"--color":e.svg.color}},[n("div",{staticClass:"svg-icon__content",domProps:{innerHTML:e._s(e.svg.data)}}),n("div",{staticClass:"svg-icon__info"},[n("span",{staticClass:"svg-icon__color",class:{border:!!e.svg.color}}),n("span",{staticClass:"svg-icon__name"},[e._v(e._s(e.svg.name))]),n("div",{staticClass:"svg-icon__size"},[e._v("("+e._s(e.svg.width)+"×"+e._s(e.svg.height)+")")])]),n("div",{staticClass:"svg-icon__actions"},[n("i",{staticClass:"el-icon-view",on:{click:function(t){return e.$emit("view",e.svg)}}}),n("i",{staticClass:"el-icon-document-copy",on:{click:function(t){return e.$emit("copy",e.svg)}}}),n("i",{staticClass:"el-icon-magic-stick",on:{click:function(t){return e.$emit("optimize",e.svg)}}})])])},a=[],l={name:"svg-icon",props:{svg:{type:Object,default:function(){return{data:"",name:"",color:"",width:0,height:0}}}},data:function(){return{}}},u=l,f=(n("35f2"),n("2877")),p=Object(f["a"])(u,i,a,!1,null,null,null),d=p.exports,v=(n("d3b7"),n("f348")),m=n.n(v),g=function(e){return new Promise((function(t,n){var o=document.createElement("button");o.setAttribute("data-clipboard-text",e);var r=new m.a(o);r.on("success",(function(e){t(e.text)})),r.on("error",(function(e){n(e)})),o.click(),r.destroy()}))},h=acquireVsCodeApi(),w={name:"app",components:{SvgIcon:d},data:function(){return{current:{},color:"",keyword:"",show:!1,list:[]}},created:function(){var e=this;window.addEventListener("message",(function(t){var n=t.data,o=n.command,r=n.list,s=n.result;"update"===o?e.list=r:"optimized"===o&&(s?e.$message.success("优化成功"):e.$message.error("优化失败"))})),h.postMessage({command:"update"})},watch:{current:function(e){this.color=e.color}},methods:{view:function(e){this.current=e,this.show=!0},copy:function(e){var t=this;g(e.name).then((function(){t.$message.success("复制成功")})).catch((function(){t.$message.error("复制失败")}))},optimize:function(e){e=e instanceof MouseEvent?this.current:e,console.log(e),this.$confirm("此操作将改变SVG文件，确定继续?","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(Object(c["a"])(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:h.postMessage({command:"optimize",svg:e});case 1:case"end":return t.stop()}}),t)}))))},generate:function(){var e=this;g('<svg-icon icon-class="'.concat(this.current.name,'" fill-color="').concat(this.color,'" />')).then((function(){e.$message.success("复制成功")})).catch((function(){e.$message.error("复制失败")}))}}},b=w,y=(n("5c0b"),Object(f["a"])(b,r,s,!1,null,null,null)),_=y.exports,k=(n("0fae"),n("9e2f")),x=n.n(k);o["default"].use(x.a),o["default"].config.productionTip=!1,new o["default"]({render:function(e){return e(_)}}).$mount("#app")},"5c0b":function(e,t,n){"use strict";var o=n("9c0c"),r=n.n(o);r.a},"62ed":function(e,t,n){},"9c0c":function(e,t,n){}});
//# sourceMappingURL=app.6567f13e.js.map