import{g as v,r as l,a as w,j as e,t as C,b as D,B as _}from"./index-C-wVKE08.js";import{T}from"./TradingHistoryColumn-hDXZjqLq.js";import{j as k}from"./DashboardActions-TGnx1ONk.js";import{h as P}from"./moment-C5S46NFB.js";import{D as S}from"./DataLoading-BVkPeC2p.js";import{C as H}from"./CustomPagination-D9Kou5M1.js";/* empty css                */import{T as B}from"./TitleComponent-hK5-nhUI.js";const F=()=>{const[c,h]=v(),[s,a]=l.useState(0),[o,p]=l.useState(5),[r,u]=l.useState([]),[n,f]=l.useState(0),[j,x]=l.useState(!1),g=w();l.useEffect(()=>{const t=c.get("account_id"),i=c.get("type");x(!0),(async()=>{t&&i&&await g(k(s,o,t,i)).then(m=>{m.tradingHistory&&u(m.tradingHistory),f(m.tradingCount),x(!1)}).catch(()=>{C.error("Data Loading Failed"),x(!1)})})()},[s,o]);const b=t=>{const i=parseInt(t.target.value);p(i),a(0)},y=()=>{a(s===0?0:s-1)},N=()=>{(s+1)*o>=n?a(s):a(s+1)};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mt-6 copier-accounts-box customized-scrollbar-x overflow-x-auto mx-auto",children:[e.jsx(T,{}),e.jsx("div",{className:`copier-accounts-data mx-auto flex flex-col ${!r.length&&"items-center justify-center"}`,children:j?e.jsx(S,{}):r.length>0?r.map((t,i)=>{var d;return e.jsxs("div",{className:"billing-accounts-item h-[80px] flex items-center border-b-color4 border-b-2",children:[e.jsx("div",{className:"h-[80px] basis-[20%] flex justify-end items-center text-white text-base",children:e.jsx("div",{className:"inline-block w-[100px] whitespace-nowrap overflow-hidden text-ellipsis text-right",children:P(t.payment_date).format("MM/DD/YYYY hh:mm:ss A")})}),e.jsx("div",{className:"h-[80px] basis-[15%] flex justify-end items-center text-white text-base",children:t.kind}),e.jsx("div",{className:"h-[80px] basis-[23%] flex justify-end items-center text-white text-base",children:e.jsx("p",{className:"w-[90%] text-right text-sm",children:t==null?void 0:t.copier_acc_name})}),e.jsx("div",{className:"h-[80px] basis-[23%] flex justify-end items-center text-white text-base",children:e.jsx("p",{className:"w-[90%] text-right text-sm",children:t==null?void 0:t.master_acc_name})}),e.jsx("div",{className:"h-[80px] basis-[10%] flex justify-end items-center text-white text-base",children:t.pay_type}),e.jsx("div",{className:"h-[80px] basis-[14%] flex justify-end items-center text-white text-base",children:-((d=t.amount)==null?void 0:d.toFixed(1))})]},i)}):e.jsx("p",{className:"py-32 text-2xl text-white font-bold",children:"No Trading History Data"})})]}),e.jsxs("div",{className:"billing-accounts-box mx-auto relative mt-8 w-full flex flex-col gap-5 items-center  lg:flex-row lg:justify-start 2xl:justify-center",children:[e.jsx(H,{currentPage:s,totalPageNum:n===0?0:Math.floor((n-1)/o),handleClickPrevButton:y,handleClickNextButton:N,setCurrentPage:a}),e.jsxs("div",{className:"flex lg:absolute lg:right-0 items-center gap-2",children:[e.jsx("label",{className:"text-white text-base",children:"Display:"}),e.jsx("div",{className:"display-styled-select",children:e.jsxs("select",{value:o,onChange:b,children:[e.jsx("option",{value:5,children:"5"}),e.jsx("option",{value:10,children:"10"}),e.jsx("option",{value:20,children:"20"})]})})]})]})]})},z=()=>{const c=D(),h=()=>{c("/dashboard/copiers")};return e.jsx(e.Fragment,{children:e.jsxs("div",{className:"w-full flex flex-col items-center gap-4",children:[e.jsx("div",{className:"w-full mt-10",children:e.jsx(B,{title:"Copiers"})}),e.jsx("div",{className:"mt-8 mb-4 w-full flex justify-end",children:e.jsx(_,{text:"GO BACK",className:"h-[56px] w-full md:w-[186px]",handleClick:h})}),e.jsxs("div",{className:"relative w-full flex justify-center border-2 border-color4 rounded-xl",children:[e.jsx("img",{src:"/icons/top-left.webp",className:"absolute top-4 left-4"}),e.jsx("img",{src:"/icons/top-right.webp",className:"absolute top-4 right-4"}),e.jsx("img",{src:"/icons/bottom-left.webp",className:"absolute bottom-4 left-4"}),e.jsx("img",{src:"/icons/bottom-right.webp",className:"absolute bottom-4 right-4"}),e.jsx("div",{className:"py-16 w-full",children:e.jsx(F,{})})]})]})})};export{z as default};
