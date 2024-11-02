import{j as e,r as l,a as H,B as z,h as y,t as A,u as P,i as le,k as E,m as ae}from"./index-C3s5vc-C.js";import{l as re,m as oe,r as ie,k as ce,n as ne,o as de,p as xe,q as he}from"./DashboardActions-CO5jeu5s.js";import{T as pe}from"./TitleComponent-CcTVoAIh.js";import{A as ue,S as fe,D as $,U as me}from"./uploading-Bon35dHn.js";import{B as K}from"./ButtonComponentWhite-D_gsyfBL.js";/* empty css                */import{M as je}from"./index-BFbfZVqN.js";import{h as B}from"./moment-C5S46NFB.js";import{M as R}from"./MainDataLoading-D6qTN2TR.js";import{R as Y,A as be,X as G,Y as Z,T as q,a as ge,B as we,b as ve,c as Ne,C as ye}from"./AreaChart-Mmw2ALU6.js";import{C as Ce}from"./CustomPagination-Br0fLM3D.js";import{D as Me}from"./DataLoading-cjqhZPFv.js";import{S as ke}from"./SettingCard-CbmPGld1.js";import"./zoom-BHLiaLU8.js";import"./index-DcfIKM1A.js";import"./index-B2vDkQYa.js";import"./index-Chjiymov.js";/* empty css                  */import"./CheckBoxComponent-CM9n7NIr.js";const _e=({className:d,profit_share:r,is_profit_share:a})=>e.jsx(e.Fragment,{children:e.jsxs("div",{className:`${d} relative
          backdrop-blur-xl border-[2px] border-color4 rounded-xl 
          flex flex-col items-center py-8 gap-3`,children:[e.jsxs("div",{className:"absolute top-3 w-[90%] h-[80%] flex justify-between",children:[e.jsx("img",{src:"/images/home-banner-card2-left.webp",alt:"Home banner card icon",title:"This is left icon",className:"w-[60px] h-[63px]"}),e.jsx("img",{src:"/images/home-banner-card2-right.webp",alt:"Home banner card icon",title:"This is right icon",className:"w-[60px] h-[63px]"})]}),e.jsx("div",{className:"font-bold text-white text-2xl",children:"Profit Share"}),e.jsx("div",{className:"h-[2px] w-[80%] rounded-full bg-gradient-to-r from-[#FFFFFF00] via-[#FFFFFF80] to-[#FFFFFF00]"}),e.jsx("div",{className:"w-full flex flex-col items-center gap-1",children:a===0?e.jsxs("p",{className:"font-semibold text-xl text-white",children:["USD ",r!=null&&r.per_hour?r==null?void 0:r.per_hour:0," /",e.jsx("span",{className:"font-normal text-base",children:"hour"})]}):e.jsx("p",{className:"text-xl text-white",children:"No Share"})})]})}),Fe=(d,r)=>{const a=new FileReader;a.addEventListener("load",()=>r(a.result)),a.readAsDataURL(d)},De=({accountId:d,type:r,avatarURL:a,setAvatarURL:n,DefaultImage:c,UploadingAnimation:o,className:p,className1:v,className2:t})=>{const m=l.useRef(null),[s,x]=l.useState(!1),[C,L]=l.useState(null),[M,S]=l.useState(0),[_,N]=l.useState(1),F=H(),j=()=>{x(!1)},g=f=>{f.preventDefault(),m.current&&m.current.click()},i=async()=>{try{if(n(o),m.current&&m.current.files){const f=m.current.files[0];Fe(f,k=>{n(k),x(!0)})}}catch{n(c)}},h=async()=>{if(C){const k=C.getImageScaledToCanvas().toDataURL();x(!1),n(o),await F(re({encrypted_accountId:y(d),encrypted_type:y(r),avatar:k})).then(()=>{n(k),A.success("Avatar has been uploaded successfully!")}).catch(()=>{n(a)})}},D=async()=>{n(o);const f=y({accountId:d,type:r});await F(oe({encrypted:f})).then(()=>{n(c),A.success("Avatar has been removed successfully!")}).catch(()=>{n(a)})},b=f=>{L(f)},V=f=>{const k=f;S(k),N(1+k/100)};return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"relative size-full rounded-full text-white text-base",children:c===a?e.jsxs("form",{id:"form",encType:"multipart/form-data",className:"size-full",children:[e.jsx("button",{type:"submit",onClick:g,className:"group size-full cursor-pointer flex items-center justify-center",children:e.jsx("svg",{width:"32",height:"24",viewBox:"0 0 32 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M10 9C10 5.68629 12.6863 3 16 3C19.3137 3 22 5.68629 22 9V10.5H23.5C26.3995 10.5 28.75 12.8505 28.75 15.75C28.75 18.6495 26.3995 21 23.5 21H22C21.1716 21 20.5 21.6716 20.5 22.5C20.5 23.3284 21.1716 24 22 24H23.5C28.0564 24 31.75 20.3064 31.75 15.75C31.75 11.669 28.7867 8.27996 24.8944 7.61736C24.2293 3.3032 20.5005 0 16 0C11.4996 0 7.77072 3.3032 7.10554 7.61736C3.21327 8.27996 0.25 11.669 0.25 15.75C0.25 20.3064 3.94365 24 8.5 24H10C10.8284 24 11.5 23.3284 11.5 22.5C11.5 21.6716 10.8284 21 10 21H8.5C5.6005 21 3.25 18.6495 3.25 15.75C3.25 12.8505 5.6005 10.5 8.5 10.5H10V9ZM21.5606 13.9394L17.0606 9.43935C16.4749 8.85356 15.5251 8.85356 14.9394 9.43935L10.4393 13.9394C9.85355 14.5251 9.85355 15.4749 10.4393 16.0606C11.0251 16.6464 11.9749 16.6464 12.5607 16.0606L14.5 14.1213V22.5C14.5 23.3284 15.1716 24 16 24C16.8284 24 17.5 23.3284 17.5 22.5V14.1213L19.4394 16.0606C20.0251 16.6464 20.9749 16.6464 21.5606 16.0606C22.1464 15.4749 22.1464 14.5251 21.5606 13.9394Z",className:"fill-white group-hover:fill-color2 duration-300"})})}),e.jsx("input",{type:"file",id:"file",ref:m,onChange:i,hidden:!0,accept:".jpg, .png"})]}):e.jsxs("div",{className:"relative group",children:[e.jsx("img",{src:a,alt:"Avatar",title:"This is uploaded avatar",className:"size-full rounded-full"}),e.jsxs("div",{className:`hidden group-hover:block absolute top-0 ${p} rounded-full bg-gradient-to-r from-[#FFFFFF03] to-[#FFFFFF01] backdrop-blur-sm`,children:[e.jsx("button",{type:"submit",onClick:()=>x(!0),className:`flex-center absolute ${v} h-7 w-7 rounded-full border border-color2 flex items-center justify-center`,children:e.jsxs("svg",{width:"16px",height:"16px",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("g",{id:"SVGRepo_bgCarrier",strokeWidth:"0"}),e.jsx("g",{id:"SVGRepo_tracerCarrier",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("g",{id:"SVGRepo_iconCarrier",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z",fill:"#D205B3"})})]})}),e.jsx("button",{type:"submit",onClick:D,className:`flex-center absolute ${t} h-7 w-7 rounded-full border border-color2 flex items-center justify-center`,children:e.jsxs("svg",{width:"20px",height:"20px",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("g",{id:"SVGRepo_bgCarrier",strokeWidth:"0"}),e.jsx("g",{id:"SVGRepo_tracerCarrier",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsxs("g",{id:"SVGRepo_iconCarrier",children:[e.jsx("path",{d:"M10 11V17",stroke:"#D205B3",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M14 11V17",stroke:"#D205B3",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})," ",e.jsx("path",{d:"M4 7H20",stroke:"#D205B3",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z",stroke:"#D205B3",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z",stroke:"#D205B3",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]})]})})]})]})}),e.jsx(je,{open:s,centered:!0,onCancel:j,width:500,footer:!1,children:e.jsxs("div",{className:"py-6 sm:px-6 flex flex-col justify-center items-center gap-8",children:[e.jsx(ue,{ref:b,image:a,border:50,color:[255,255,255,.6],scale:_,rotate:0}),e.jsx("div",{className:"w-[300px]",children:e.jsx(fe,{defaultValue:0,value:M,onChange:V})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(z,{text:"Ok",className:"w-[156px] h-[56px]",handleClick:h}),e.jsx(K,{text:"Cancel",className:"w-[156px] h-[56px]",handleClick:()=>x(!1)})]})]})})]})},Se=({accountId:d,accountType:r,avatar:a,account_name:n,start_date:c,followers:o,follow_limit:p,favorite_count:v,top_roi:t,top_profit:m,level:s,account_id:x,type:C,favorite:L,is_my_account:M})=>{const S=H(),_=P(f=>f.auth),[N,F]=l.useState(L),[j,g]=l.useState(o),[i,h]=l.useState(0),[D,b]=l.useState($);l.useEffect(()=>{a&&b(a),h(v)},[]);const V=async()=>{if(N){g(j-1),F(!N);const f=y({type:C,my_user_id:_.user.id,acc_id:x});await S(ie({encrypted:f})).then(k=>{h(k.favorite_count),F(!N),g(j+1),A.success("Remove this account from favorite!")}).catch(()=>{})}else{const f=y({type:C,my_user_id:_.user.id,acc_id:x});await S(ce({encrypted:f})).then(k=>{h(k.favorite_count),F(!N),g(j+1),A.success("Add this account to favorite!")}).catch(()=>{})}};return e.jsx(e.Fragment,{children:e.jsxs("div",{className:"w-full flex flex-col md:flex-row gap-4 md:gap-0",children:[e.jsx("div",{className:"manage-top-left-avatar",children:e.jsx("div",{className:`w-[100px] h-[100px] rounded-full border-[5px] ${s==="hero"?"border-herocolor":s==="gold"?"border-goldcolor":s==="silver"?"border-silvercolor":"border-color4"}`,children:M?e.jsx(De,{avatarURL:D,setAvatarURL:b,DefaultImage:$,UploadingAnimation:me,accountId:d,type:r,className:"w-[90px] h-[90px]",className1:"bottom-7 right-[48px]",className2:"bottom-7 right-[15px]"}):e.jsx("div",{className:"w-[90px] h-[90px] rounded-full flex items-center justify-center",children:D!==$?e.jsx("img",{src:D,alt:"Avatar",title:"This is user avatar",className:"w-[90px] h-[90px] rounded-full"}):e.jsx("img",{src:"/icons/user-icon.webp",alt:"User avatar",title:"This is default avatar",className:"w-[60px] h-[60px] rounded-full"})})})}),e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-[200px] 2xl:w-[280px] whitespace-nowrap overflow-hidden text-ellipsis font-extrabold text-2xl text-white",children:n}),s==="hero"&&e.jsx("div",{className:"px-3 h-8 font-medium text-white rounded-full bg-herocolor flex items-center justify-center",children:"HERO"}),s==="gold"&&e.jsx("div",{className:"px-3 font-medium text-white rounded-full bg-goldcolor flex items-center justify-center",children:"GOLD"}),s==="silver"&&e.jsx("div",{className:"px-3 font-medium text-[#3BA1F4] rounded-full bg-silvercolor flex items-center justify-center",children:"SILVER"})]}),e.jsxs("div",{className:"grid md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-2",children:[e.jsxs("div",{className:"pr-4 flex items-center gap-2 2xl:border-r-2 border-r-textdisablecolor",children:[e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M3 9H21M7 3V5M17 3V5M6 13H8M6 17H8M11 13H13M11 17H13M16 13H18M16 17H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z",className:"stroke-textdisablecolor",strokeOpacity:"0.8",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsxs("p",{className:"text-textdisablecolor text-sm",children:["Start Date : ",B(c).format("YYYY/MM/DD")]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("svg",{width:"24",height:"16",viewBox:"0 0 24 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M19 10C21.2091 10 23 12 23 13.5C23 14.3284 22.3284 15 21.5 15H21M17 7C18.6569 7 20 5.65685 20 4C20 2.34315 18.6569 1 17 1M5 10C2.79086 10 1 12 1 13.5C1 14.3284 1.67157 15 2.5 15H3M7 7C5.34315 7 4 5.65685 4 4C4 2.34315 5.34315 1 7 1M16.5 15H7.5C6.67157 15 6 14.3284 6 13.5C6 11 9 10 12 10C15 10 18 11 18 13.5C18 14.3284 17.3284 15 16.5 15ZM15 4C15 5.65685 13.6569 7 12 7C10.3431 7 9 5.65685 9 4C9 2.34315 10.3431 1 12 1C13.6569 1 15 2.34315 15 4Z",className:"stroke-textdisablecolor",strokeOpacity:"0.8",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsxs("p",{className:"text-textdisablecolor text-sm",children:["Followers : ",o," / ",p]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("svg",{width:"22",height:"20",viewBox:"0 0 22 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M11 19L9.55 17.7052C4.4 13.1243 1 10.103 1 6.3951C1 3.37384 3.42 1 6.5 1C8.24 1 9.91 1.79455 11 3.05014C12.09 1.79455 13.76 1 15.5 1C18.58 1 21 3.37384 21 6.3951C21 10.103 17.6 13.1243 12.45 17.715L11 19Z",className:"stroke-textdisablecolor",strokeOpacity:"0.8",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsxs("p",{className:"text-textdisablecolor text-sm",children:["Number of Favorites : ",i]})]}),e.jsxs("button",{className:`${M&&"hidden"} py-1 w-[150px] rounded flex gap-1 bg-transparent border border-color2 items-center justify-center`,onClick:V,children:[e.jsx("svg",{width:"19",height:"17",viewBox:"0 0 19 17",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M9.5 16.375L8.23125 15.242C3.725 11.2337 0.75 8.59012 0.75 5.34571C0.75 2.70211 2.8675 0.625 5.5625 0.625C7.085 0.625 8.54625 1.32023 9.5 2.41887C10.4537 1.32023 11.915 0.625 13.4375 0.625C16.1325 0.625 18.25 2.70211 18.25 5.34571C18.25 8.59012 15.275 11.2337 10.7687 15.2506L9.5 16.375Z",className:`stroke-color2 ${N?"fill-color2":""}`,strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("p",{className:"text-color2 text-sm",children:"Add to Favorites"})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[s==="hero"&&e.jsx("img",{src:"/icons/hero-icon.webp",alt:"Hero icon",title:"This is to show level",className:"mr-2 w-8 h-8"}),s==="gold"&&e.jsx("img",{src:"/icons/gold-icon.webp",alt:"Gold icon",title:"This is to show level",className:"mr-2 w-8 h-8"}),s==="silver"&&e.jsx("img",{src:"/icons/silver-icon.webp",alt:"Silver icon",title:"This is to show level",className:"mr-2 w-8 h-8"}),t&&e.jsx("div",{className:"py-1 px-4 rounded bg-badgecolor text-white",children:"Top ROI"}),m&&e.jsx("div",{className:"py-1 px-4 rounded bg-badgecolor text-white",children:"Top PROFIT"})]})]})]})})},Le=d=>{let r=d,a=0;for(;r>0;)r=Math.floor(r/10),a++;return Math.max(Math.pow(10,a),10)},Te=({accountId:d,type:r})=>{const[a,n]=l.useState([]),[c,o]=l.useState(!1),[p,v]=l.useState(!1),[t,m]=l.useState(),[s,x]=l.useState(1),[C,L]=l.useState(0),[M,S]=l.useState(1e3),[_,N]=l.useState(1e3),[F,j]=l.useState(0),[g,i]=l.useState(0),[h,D]=l.useState(0),[b,V]=l.useState(0),[f,k]=l.useState();l.useEffect(()=>{(async()=>{if(d&&r){o(!0);const Q=y({type:r,account_id:d,role:"Master",days:s});await le({encrypted:Q}).then(ee=>{const w=E(ee.encrypted);if(m(w.data),n(w.pl),w.total_pl&&i(w.total_pl),w.win_count&&D(w.win_count),w.lose_count&&V(w.lose_count),w.last_trade_at&&k(w.last_trade_at),o(!1),typeof w.minVal=="number"&&typeof w.maxVal=="number"){const T=Le(w.maxVal);L(0),S(T)}if(typeof w.plMinVal=="number"&&typeof w.plMaxVal=="number"){const T=Math.max(Math.abs(w.plMinVal),Math.abs(w.plMaxVal)),se=T>=1e3?Math.floor(-T/1e3)*1e3:Math.floor(-T),te=T>=1e3?T%1e3===0?T:(Math.floor(T/1e3)+1)*1e3:Math.floor(T);j(se),N(te)}}).catch(()=>{o(!1)})}})()},[p,d,r]);const U=u=>{x(parseInt(u.target.value)),v(!p)},I=u=>u.active&&u.payload&&u.payload.length?e.jsxs("div",{className:"p-3 custom-tooltip bg-black rounded-lg",children:[e.jsx("p",{className:"text-[#B8B8B8] font-bold text-[15px] text-right",children:B(u.label).format("D MMMM YYYY")}),s===1&&e.jsx("p",{className:"text-[#B8B8B8] font-bold text-sm text-right",children:B(u.label).format("hh:mm A")}),e.jsxs("p",{className:"balance pt-2 text-white text-right font-bold",children:["$ ",u.payload[0].value.toFixed(2)]})]}):null,O=u=>s!==1?`${B(u).format("D MMM")}`:`${B(u).format("DD, HH A")}`,X=u=>M>=1e3?`${(u/1e3).toFixed(1)}k`:`${u.toFixed(0)}`,J=u=>_>=1e3?`${(u/1e3).toFixed(1)}k`:`${u.toFixed(0)}`;return e.jsx(e.Fragment,{children:c?e.jsx(R,{}):e.jsx("div",{className:"my-10 w-full h-auto flex flex-col justify-center gap-4",children:e.jsxs("div",{className:"profile-div mb-10 w-full",children:[e.jsxs("div",{className:"profie-graph flex flex-col gap-10",children:[e.jsx("div",{className:"w-full h-[400px] lg:flex-row items-center justify-between",children:e.jsxs("div",{className:`backdrop-blur-xl h-full border-[2px] border-color4 rounded-xl 
                  flex flex-col py-8`,children:[e.jsx("h2",{className:"mb-8 pl-8 text-white text-2xl font-bold",children:"Ballance Chart"}),e.jsx(Y,{width:"100%",height:"80%",children:e.jsxs(be,{width:500,height:300,data:a,margin:{top:5,right:30,left:20,bottom:5},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"fillGradient",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0%",stopColor:"#907DFF",stopOpacity:.29}),e.jsx("stop",{offset:"100%",stopColor:"#D6D6D6",stopOpacity:0})]})}),e.jsx(G,{dataKey:"date",tickFormatter:O,interval:s===1?4:s===7?0:5,tick:{fill:"#B8B8B8"}}),e.jsx(Z,{tick:{fill:"#B8B8B8"},tickFormatter:X,domain:[C,M]}),e.jsx(q,{content:e.jsx(I,{})}),e.jsx(ge,{type:"monotone",dataKey:"balance",stroke:"#D205B3",fill:"url(#fillGradient)",dot:!1})]})})]})}),e.jsx("div",{className:"w-full h-[400px] lg:flex-row items-center justify-between",children:e.jsxs("div",{className:`backdrop-blur-xl h-full border-[2px] border-color4 rounded-xl 
                    flex flex-col py-8`,children:[e.jsx("h2",{className:"mb-8 pl-8 text-white text-2xl font-bold",children:"Profit & Loss (PnL)"}),e.jsx(Y,{width:"100%",height:"80%",children:e.jsxs(we,{width:500,height:300,data:a,margin:{top:5,right:30,left:20,bottom:5},children:[e.jsx(G,{dataKey:"date",tickFormatter:O,interval:s===1?4:s===7?0:5,tick:{fill:"#B8B8B8"}}),e.jsx(Z,{tick:{fill:"#B8B8B8"},tickFormatter:J,domain:[F,_]}),e.jsx(q,{content:e.jsx(I,{}),cursor:{fill:"#907DFF29"}}),e.jsx(ve,{y:0,stroke:"#B8B8B8"}),e.jsx(Ne,{dataKey:"pl",maxBarSize:40,children:a==null?void 0:a.map((u,W)=>e.jsx(ye,{fill:u.pl>0?"#39DC01":"#E2293B",stroke:u.pl>0?"#39DC01":"#E2293B"},`Cell-${W}`))})]})})]})})]}),e.jsxs("div",{className:"profile-performance p-5 border-2 border-color4 rounded-[10px]",children:[e.jsxs("div",{className:"flex flex-col gap-6",children:[e.jsxs("div",{className:"mt-4 flex justify-between items-center",children:[e.jsx("h3",{className:"font-bold text-2xl text-white",children:"Performance"}),e.jsx("div",{className:"day-styled-select",children:e.jsxs("select",{value:s,onChange:U,children:[e.jsx("option",{value:"1",children:"Daily"}),e.jsx("option",{value:"7",children:"Weekly"}),e.jsx("option",{value:"30",children:"Monthly"})]})})]}),e.jsxs("div",{className:"w-full flex justify-between text-white",children:[e.jsx("p",{children:"Master's PnL"}),e.jsx("p",{children:"$ "+g.toFixed(0)})]}),e.jsxs("div",{className:"w-full flex justify-between text-white",children:[e.jsx("p",{children:"Average PnL per Trade"}),e.jsx("p",{children:"$ "+(h+b>0?(g/(h+b)).toFixed(2):"0")})]}),e.jsxs("div",{className:"w-full flex justify-between text-white",children:[e.jsx("p",{children:"Trades"}),e.jsx("p",{children:h+b})]}),e.jsxs("div",{className:"w-full flex justify-between text-white",children:[e.jsx("p",{children:"Win Rate"}),e.jsx("p",{children:h+b>0?(h/(h+b)*100).toFixed(2)+" %":"0 %"})]}),e.jsxs("div",{className:"w-full flex justify-between text-white",children:[e.jsx("p",{children:"Last Traded at"}),e.jsx("p",{children:f?B(f).format("MM/DD/YYYY hh:mm A"):""})]}),e.jsxs("div",{className:"w-full flex justify-between text-white",children:[e.jsxs("p",{children:["Win ",h]}),e.jsxs("p",{children:["Loss ",b]})]}),h+b>0&&e.jsxs("div",{className:"w-full flex justify-between",children:[e.jsx("div",{className:"h-[6px] bg-[#39DC01] rounded-l-full",style:{width:`calc(${Math.floor(h*100/(h+b))}%)`}}),e.jsx("div",{className:"h-[6px] bg-[#E2293B] rounded-r-full",style:{width:`calc(${Math.floor(b*100/(h+b))}%)`}})]}),h+b===0&&e.jsxs("div",{className:"w-full flex",children:[e.jsx("div",{className:"w-[50%] h-[6px] bg-[#39DC01] rounded-l-full"}),e.jsx("div",{className:"w-[50%] h-[6px] bg-[#E2293B] rounded-r-full"})]})]}),e.jsxs("div",{className:"mt-6 flex flex-col gap-6",children:[e.jsx("h3",{className:"font-bold text-2xl text-white",children:"About Me"}),e.jsx("p",{className:"text-white",children:t==null?void 0:t.about_me})]})]})]})})})},Be=()=>e.jsx(e.Fragment,{children:e.jsx("div",{className:"mt-6 follower-accounts-column",children:e.jsxs("div",{className:"follower-accounts-item h-[40px] flex text-base text-color5 border-b-2 border-color4",children:[e.jsx("div",{className:"basis-[25%] flex justify-end",children:"ACCOUNT NAME"}),e.jsx("div",{className:"basis-[15%] flex justify-end",children:"Total PnL ($)"}),e.jsx("div",{className:"basis-[25%] flex justify-end",children:"PnL for this Master ($)"}),e.jsx("div",{className:"pl-6 basis-[20%] flex justify-start",children:"TYPE"}),e.jsx("div",{className:"basis-[15%] flex justify-end",children:"Days of Following"})]})})}),Ve=({isDataLoading:d,data:r})=>{const a=P(s=>s.auth),[n,c]=l.useState(0),[o,p]=l.useState(5),v=s=>{const x=parseInt(s.target.value);p(x),c(0)},t=()=>{c(n===0?0:n-1)},m=()=>{(n+1)*o>=r.length?c(n):c(n+1)};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"follower-accounts-box customized-scrollbar-x overflow-x-auto mx-auto",children:[e.jsx(Be,{}),e.jsx("div",{className:`follower-accounts-data mx-auto flex flex-col ${!r.length&&"items-center justify-center"}`,children:d?e.jsx(Me,{}):r.length>0?r.map((s,x)=>x<(n+1)*o&&x>=n*o&&e.jsxs("div",{className:"follower-accounts-item h-[80px] flex items-center border-b-color4 border-b-2",children:[e.jsx("div",{className:"h-[80px] basis-[10%] flex justify-end items-center",children:e.jsxs("div",{className:`relative w-[64px] h-[64px] border-color2 border-2 rounded-full ${a.user.avatar&&"border-2"}`,children:[a.user.avatar?e.jsx("img",{src:a.user.avatar,alt:"Avatar",title:"This is user avatar",className:"w-[60px] h-[60px] rounded-full"}):e.jsx("img",{src:"/icons/user-icon.webp",alt:"User avater",title:"This is default avatar",className:"w-[60px] h-[60px] rounded-full"}),e.jsx("img",{src:"/icons/verify-icon.webp",alt:"Verify icon",title:"This is checkmark icon",className:"absolute bottom-[0px] right-[0px]  w-[15px] h-[15px]"})]})}),e.jsx("div",{className:"h-[80px] basis-[15%] flex justify-end items-center text-white text-base",children:e.jsx("div",{className:"inline-block w-[100px] whitespace-nowrap overflow-hidden text-ellipsis text-right",children:s==null?void 0:s.account_name})}),e.jsx("div",{className:"h-[80px] basis-[15%] flex justify-end items-center text-white text-base",children:"$ "+(s!=null&&s.total_pl_amount?s==null?void 0:s.total_pl_amount.toFixed(2):"")}),e.jsx("div",{className:"h-[80px] basis-[25%] flex justify-end items-center text-white text-base",children:"$ "+(s!=null&&s.total_pl?s==null?void 0:s.total_pl.toFixed(2):"")}),e.jsxs("div",{className:"pl-6 h-[80px] basis-[20%] flex justify-start items-center text-white text-base",children:[(s==null?void 0:s.type)==="mt4"&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("img",{src:"/icons/metatrader4-square.webp",alt:"Metatrader4 icon",title:"This is square icon",className:"w-[37px] h-[36px]"}),e.jsx("p",{className:"text-base text-white",children:"MT - 4"})]}),(s==null?void 0:s.type)==="mt5"&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("img",{src:"/icons/metatrader5-square.webp",alt:"Metatrader5 icon",title:"This is square icon",className:"w-[37px] h-[36px]"}),e.jsx("p",{className:"text-base text-white",children:"MT - 5"})]}),(s==null?void 0:s.type)==="tll"&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("img",{src:"/icons/tradelocker-square.webp",alt:"Tradelocker icon",title:"This is square icon",className:"w-[37px] h-[36px]"}),e.jsx("p",{className:"text-base text-white",children:"TL - Li"})]}),(s==null?void 0:s.type)==="tld"&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("img",{src:"/icons/tradelocker-square.webp",alt:"Tradelocker icon",title:"This is square icon",className:"w-[37px] h-[36px]"}),e.jsx("p",{className:"text-base text-white",children:"TL - De"})]})]}),e.jsxs("div",{className:"h-[80px] basis-[15%] flex justify-end items-center text-white",children:[s==null?void 0:s.daysOfFollowing," days"]})]},x)):e.jsx("p",{className:"py-32 text-2xl text-white font-bold",children:"No account has been added."})})]}),e.jsxs("div",{className:"follower-accounts-box mx-auto relative mt-8 w-full flex flex-col gap-5 items-center  lg:flex-row lg:justify-start 2xl:justify-center",children:[e.jsx(Ce,{currentPage:n,totalPageNum:Math.floor(((r==null?void 0:r.length)-1)/o),handleClickPrevButton:t,handleClickNextButton:m,setCurrentPage:c}),e.jsxs("div",{className:"flex lg:absolute lg:right-0 items-center gap-2",children:[e.jsx("label",{className:"text-white text-base",children:"Display:"}),e.jsx("div",{className:"display-styled-select",children:e.jsxs("select",{value:o,onChange:v,children:[e.jsx("option",{value:5,children:"5"}),e.jsx("option",{value:10,children:"10"}),e.jsx("option",{value:20,children:"20"})]})})]})]})]})},Ae=({accountId:d,type:r})=>{const a=H(),[n,c]=l.useState([]),[o,p]=l.useState(!1);return l.useEffect(()=>{(async()=>{p(!0);const m=y({accountId:d,type:r});await a(ne({encrypted:m})).then(s=>{const x=E(s.encrypted);c(x),p(!1)}).catch(()=>{p(!1)})})()},[d,r]),e.jsx(e.Fragment,{children:e.jsx("div",{className:"mt-10 w-full",children:e.jsxs("div",{className:"relative w-full flex justify-center border-2 border-color4 rounded-xl",children:[e.jsx("img",{src:"/icons/top-left.webp",alt:"Top left icon",title:"This is general icon",className:"absolute top-4 left-4"}),e.jsx("img",{src:"/icons/top-right.webp",alt:"Top right icon",title:"This is general icon",className:"absolute top-4 right-4"}),e.jsx("img",{src:"/icons/bottom-left.webp",alt:"Bottom left icon",title:"This is general icon",className:"absolute bottom-4 left-4"}),e.jsx("img",{src:"/icons/bottom-right.webp",alt:"Bottom right icon",title:"This is general icon",className:"absolute bottom-4 right-4"}),e.jsx("div",{className:"py-16 w-full",children:e.jsx(Ve,{isDataLoading:o,data:n})})]})})})},He=({accountId:d,type:r})=>{const a=H(),[n,c]=l.useState(!1),[o,p]=l.useState(),[v,t]=l.useState(0),[m,s]=l.useState({per_hour:"0"}),[x,C]=l.useState(""),[L,M]=l.useState(!1);l.useEffect(()=>{(async()=>{c(!0);const j=y({accountId:d,accountType:r});await a(de({encrypted:j})).then(g=>{const i=E(g.encrypted);i!=null&&i.about_me&&C(i==null?void 0:i.about_me),i!=null&&i.profit_share&&s(i==null?void 0:i.profit_share),i!=null&&i.is_profit_share&&t(i==null?void 0:i.is_profit_share),i!=null&&i.private_account&&M(i==null?void 0:i.private_account),p(i),c(!1)}).catch(()=>{c(!1)})})()},[d,r]);const S=async()=>{c(!0);const N={encrypted_accountId:y(d),encrypted_accountType:y(r),description:x,encrypted_private_account:y(L),encrypted_is_profit_share:y(v),encrypted_profitShare:y(m)};await a(xe({encrypted:N})).then(()=>{A.success("Successfully Updated!"),c(!1)}).catch(()=>{c(!1)})},_=()=>{o!=null&&o.about_me&&C(o==null?void 0:o.about_me),o!=null&&o.profit_share&&s(o==null?void 0:o.profit_share)};return e.jsx(e.Fragment,{children:n?e.jsx(R,{}):e.jsx("div",{className:"mt-10 w-full",children:e.jsxs("div",{className:"relative w-full flex justify-center border-2 border-color4 rounded-xl",children:[e.jsx("img",{src:"/icons/top-left.webp",alt:"Top left icon",title:"This is general icon",className:"absolute top-4 left-4"}),e.jsx("img",{src:"/icons/top-right.webp",alt:"Top right icon",title:"This is general icon",className:"absolute top-4 right-4"}),e.jsx("img",{src:"/icons/bottom-left.webp",alt:"Bottom left icon",title:"This is general icon",className:"absolute bottom-4 left-4"}),e.jsx("img",{src:"/icons/bottom-right.webp",alt:"Bottom right icon",title:"This is general icon",className:"absolute bottom-4 right-4"}),e.jsx("div",{className:"py-16 w-[85%]",children:e.jsxs("div",{className:"w-full flex flex-col gap-8",children:[e.jsx("div",{className:"w-full flex",children:e.jsxs("div",{className:"flex flex-col lg:flex-row lg:items-center gap-8",children:[e.jsxs("p",{className:"text-white text-xl font-bold",children:["Account ID :",e.jsx("span",{className:"pl-2 font-normal",children:d})]}),e.jsxs("p",{className:"text-white text-xl font-bold",children:["Account Type :",e.jsx("span",{className:"pl-2 font-normal",children:r==="mt5"?"Metatrader 5":r==="mt4"?"Metatrader 4":"Tradelocker"})]})]})}),e.jsx(ke,{isProfitShare:v,setIsProfitShare:t,profit:m,setProfit:s,description:x,setDescription:C,privateAccount:L,setPrivateAccount:M}),e.jsxs("div",{className:"w-full flex items-center justify-end gap-5",children:[e.jsx(K,{text:"RESET",className:"w-[184px] h-[56px]",handleClick:_}),e.jsx(z,{text:"UPDATE",className:"w-[184px] h-[56px]",handleClick:S})]})]})})]})})})},ts=()=>{var S,_,N,F;const[d,r]=ae(),[a,n]=l.useState(""),[c,o]=l.useState(""),[p,v]=l.useState(0),[t,m]=l.useState(),[s,x]=l.useState(!1),C=P(j=>j.auth),L=H();l.useEffect(()=>{const j=d.get("account_id");j&&n(j);const g=d.get("type");g&&o(g),(async()=>{x(!0);const D=y({accountId:j||"",accountType:g||""});await L(he({encrypted:D})).then(b=>{x(!1),m(b)}).catch(()=>{x(!1)})})()},[a,c]);const M=(j,g)=>{var h;return!!((h=C.user.masters)==null?void 0:h.find(D=>D.account_id===j&&g===D.type))};return e.jsx(e.Fragment,{children:e.jsxs("div",{className:"w-full flex flex-col items-center gap-12",children:[e.jsx("div",{className:"mt-10",children:e.jsx(pe,{title:"Masters"})}),s?e.jsx(R,{}):e.jsxs("div",{className:"w-full",children:[e.jsxs("div",{className:"master-manage-div",children:[e.jsx("div",{className:"master-manage-top-left",children:e.jsx(Se,{accountId:a,accountType:c,avatar:t==null?void 0:t.avatar,account_name:t==null?void 0:t.account_name,start_date:t==null?void 0:t.registered_at,followers:t==null?void 0:t.follows,follow_limit:t==null?void 0:t.follow_limit,favorite_count:(S=t==null?void 0:t.favorite_users)!=null&&S.length?(_=t==null?void 0:t.favorite_users)==null?void 0:_.length:0,top_roi:(N=t==null?void 0:t.top_badge)==null?void 0:N.top_roi,top_profit:(F=t==null?void 0:t.top_badge)==null?void 0:F.top_profit,level:t==null?void 0:t.level,favorite:t==null?void 0:t.favorite,account_id:t==null?void 0:t.account_id,type:t==null?void 0:t.type,is_my_account:M(a,c)})}),e.jsx("div",{className:"master-manage-top-right",children:e.jsx(_e,{className:"w-full",profit_share:t==null?void 0:t.profit_share,is_profit_share:t==null?void 0:t.is_profit_share})})]}),e.jsxs("div",{className:"mt-8 w-full flex justify-start gap-5",children:[e.jsx("div",{className:`h-[28px] text-base cursor-pointer hover:border-b hover:border-b-color2 ${p===0?"text-white font-bold border-b border-b-color2":"text-color5"}`,onClick:()=>v(0),children:"Profile"}),e.jsx("div",{className:`h-[28px] text-base cursor-pointer hover:border-b hover:border-b-color2 ${p===1?"text-white font-bold border-b border-b-color2":"text-color5"}`,onClick:()=>v(1),children:"Followers"}),e.jsx("div",{className:`${M(a,c)?"":"hidden"} h-[28px] text-base cursor-pointer hover:border-b hover:border-b-color2 ${p===2?"text-white font-bold border-b border-b-color2":"text-color5"}`,onClick:()=>v(2),children:"Setting"})]}),p===0&&e.jsx(Te,{accountId:a,type:c}),p===1&&e.jsx(Ae,{accountId:a,type:c}),p===2&&e.jsx(He,{accountId:a,type:c})]})]})})};export{ts as default};
