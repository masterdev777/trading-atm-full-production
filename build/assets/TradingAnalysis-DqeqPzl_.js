import{u as Q,r as l,a as Z,j as t,e as tt,i as et,k as at,A as st}from"./index-CndeRajg.js";import{T as lt}from"./TitleComponent-Jlb1nLkV.js";import{H as d}from"./HomeBannerCard-Dmcel5MA.js";import{h}from"./moment-C5S46NFB.js";/* empty css                  */import{R as A,A as nt,X as M,Y as B,T as N,a as ot,B as rt,b as ct,c as it,C as dt}from"./AreaChart-ci7P2Ka3.js";import"./index-DcfIKM1A.js";import"./index-Chjiymov.js";const xt=n=>Object.keys(n).length===0,mt=n=>{let c=n,x=0;for(;c>0;)c=Math.floor(c/10),x++;return Math.max(Math.pow(10,x),10)},wt=()=>{var _;const n=Q(e=>e.auth),[c,x]=l.useState(!1),[m,k]=l.useState([]),[p,f]=l.useState(!1),[a,v]=l.useState(),[i,C]=l.useState(1),[F,S]=l.useState(0),[b,T]=l.useState(1e3),[y,V]=l.useState(1e3),[$,D]=l.useState(0),[g,R]=l.useState(0),[u,Y]=l.useState(0),[E,L]=l.useState(0),[H,K]=l.useState(""),P=Z();l.useEffect(()=>{const e=()=>{if(!xt(n.currentAnalysisAccount)){K(n.currentAnalysisAccount.account_id+"?"+n.currentAnalysisAccount.type+"?"+n.currentAnalysisAccount.role);const O={type:n.currentAnalysisAccount.type,account_id:n.currentAnalysisAccount.account_id,role:n.currentAnalysisAccount.role,days:i},X=tt(O);et({encrypted:X}).then(z=>{const s=at(z.encrypted);if(v(s.data),k(s.pl),R(s.total_pl),Y(s.win_count+s.lose_count>0?s.win_count+s.lose_count:0),L(s.win_count>0?s.win_count:0),typeof s.minVal=="number"&&typeof s.maxVal=="number"){const o=mt(s.maxVal);S(0),T(o)}if(typeof s.plMinVal=="number"&&typeof s.plMaxVal=="number"){const o=Math.max(Math.abs(s.plMinVal),Math.abs(s.plMaxVal)),q=o>=1e3?Math.floor(-o/1e3)*1e3:Math.floor(-o),J=o>=1e3?o%1e3===0?o:(Math.floor(o/1e3)+1)*1e3:Math.floor(o);D(q),V(J)}x(!0),setTimeout(()=>{x(!1)},2e3)})}};e();const r=setInterval(e,1e4);return()=>clearInterval(r)},[p]);const G=e=>{const r=e.target.value.split("?");P({type:st.AUTH_USER,payload:{currentAnalysisAccount:{account_id:r[0],type:r[1],role:r[2]}}}),f(!p)},I=e=>{C(parseInt(e.target.value)),f(!p)},j=e=>e.active&&e.payload&&e.payload.length?t.jsxs("div",{className:"p-3 custom-tooltip bg-black rounded-lg",children:[t.jsx("p",{className:"text-[#B8B8B8] font-bold text-[15px] text-right",children:h(e.label).format("D MMMM YYYY")}),i===1&&t.jsx("p",{className:"text-[#B8B8B8] font-bold text-sm text-right",children:h(e.label).format("hh:mm A")}),t.jsxs("p",{className:"balance pt-2 text-white text-right font-bold",children:["$ ",e.payload[0].value.toFixed(2)]})]}):null,w=e=>i!==1?`${h(e).format("D MMM")}`:`${h(e).format("DD, HH A")}`,U=e=>b>=1e3?`${(e/1e3).toFixed(1)}k`:`${e.toFixed(0)}`,W=e=>y>=1e3?`${(e/1e3).toFixed(1)}k`:`${e.toFixed(0)}`;return t.jsx(t.Fragment,{children:t.jsxs("div",{className:"my-10 w-full h-auto flex flex-col justify-center gap-4",children:[t.jsx(lt,{title:"Trading Analysis"}),t.jsxs("div",{className:"mt-8 w-full flex justify-between",children:[t.jsxs("div",{className:"flex gap-2 items-center",children:[t.jsx("label",{className:"hidden md:block font-semibold text-white",children:"Account Name:"}),t.jsx("div",{className:"account-styled-select",children:t.jsx("select",{value:H,onChange:G,children:((_=n.accounts)==null?void 0:_.length)>0?n.accounts.map((e,r)=>t.jsx("option",{value:e.account_id+"?"+e.type+"?"+e.role,children:e.account_name},r)):t.jsx("option",{children:"No Account"})})})]}),t.jsx("div",{className:"day-styled-select",children:t.jsxs("select",{onChange:I,children:[t.jsx("option",{value:"1",children:"Daily"}),t.jsx("option",{value:"7",children:"Weekly"}),t.jsx("option",{value:"30",children:"Monthly"})]})})]}),t.jsxs("div",{className:"trading-analysis-select-card w-full",children:[t.jsx(d,{text:"Account Type",title:(a==null?void 0:a.type)==="tll"?"TL - Live":(a==null?void 0:a.type)==="tld"?"TL - Demo":(a==null?void 0:a.type)==="mt4"?"MT4":(a==null?void 0:a.type)==="mt5"?"MT5":"",background_left_img:"home-banner-card1-left.webp",background_right_img:"home-banner-card1-right.webp",className:"w-full h-[130px]",className1:"text-white"}),t.jsx(d,{text:"Account Role",title:a==null?void 0:a.role,background_left_img:"home-banner-card2-left.webp",background_right_img:"home-banner-card2-right.webp",className:"w-full h-[130px]",className1:"text-white"}),t.jsx(d,{text:"Register Date",title:a?h(a==null?void 0:a.registered_at).format("YY/MM/DD"):"",background_left_img:"home-banner-card3-left.webp",background_right_img:"home-banner-card3-right.webp",className:"w-full h-[130px]",className1:"text-white"})]}),t.jsx("div",{className:"mt-10 w-full h-[400px] lg:flex-row items-center justify-between",children:t.jsxs("div",{className:`backdrop-blur-xl h-full border-[2px] border-color4 rounded-xl 
          flex flex-col py-8`,children:[t.jsx("h2",{className:"mb-8 pl-8 text-white text-2xl font-bold",children:"Ballance Chart"}),t.jsx(A,{width:"100%",height:"80%",children:t.jsxs(nt,{width:500,height:300,data:m,margin:{top:5,right:30,left:20,bottom:5},children:[t.jsx("defs",{children:t.jsxs("linearGradient",{id:"fillGradient",x1:"0",y1:"0",x2:"0",y2:"1",children:[t.jsx("stop",{offset:"0%",stopColor:"#907DFF",stopOpacity:.29}),t.jsx("stop",{offset:"100%",stopColor:"#D6D6D6",stopOpacity:0})]})}),t.jsx(M,{dataKey:"date",tickFormatter:w,interval:i===1?4:i===7?0:5,tick:{fill:"#B8B8B8"}}),t.jsx(B,{tick:{fill:"#B8B8B8"},tickFormatter:U,domain:[F,b]}),t.jsx(N,{content:t.jsx(j,{})}),t.jsx(ot,{type:"monotone",dataKey:"balance",stroke:"#D205B3",fill:"url(#fillGradient)",dot:!1})]})})]})}),t.jsx("div",{className:"my-10 w-full h-[400px] lg:flex-row items-center justify-between",children:t.jsxs("div",{className:`backdrop-blur-xl h-full border-[2px] border-color4 rounded-xl 
          flex flex-col py-8`,children:[t.jsx("h2",{className:"mb-8 pl-8 text-white text-2xl font-bold",children:"Profit & Loss (PnL)"}),t.jsx(A,{width:"100%",height:"80%",children:t.jsxs(rt,{width:500,height:300,data:m,margin:{top:5,right:30,left:20,bottom:5},children:[t.jsx(M,{dataKey:"date",tickFormatter:w,interval:i===1?4:i===7?0:5,tick:{fill:"#B8B8B8"}}),t.jsx(B,{tick:{fill:"#B8B8B8"},tickFormatter:W,domain:[$,y]}),t.jsx(N,{content:t.jsx(j,{}),cursor:{fill:"#907DFF29"}}),t.jsx(ct,{y:0,stroke:"#B8B8B8"}),t.jsx(it,{dataKey:"pl",maxBarSize:40,children:m==null?void 0:m.map((e,r)=>t.jsx(dt,{fill:e.pl>0?"#39DC01":"#E2293B",stroke:e.pl>0?"#39DC01":"#E2293B"},`Cell-${r}`))})]})})]})}),t.jsxs("div",{className:"trading-analysis-bottom w-full flex items-center justify-between",children:[t.jsx(d,{text:"Account Balance ($)",title:a!=null&&a.account_balance?a==null?void 0:a.account_balance.toFixed(2):"0",background_left_img:"home-banner-card1-left.webp",background_right_img:"home-banner-card1-right.webp",className:"w-full h-[130px]",className1:`${c?"text-color2":"text-white"}`}),t.jsx(d,{text:"Win Rate (%)",title:u>0?(E/u*100).toFixed(2)+" %":"0 %",background_left_img:"home-banner-card2-left.webp",background_right_img:"home-banner-card2-right.webp",className:"w-full h-[130px]",className1:`${c?"text-color2":"text-white"}`}),t.jsx(d,{text:"Total P/L ($)",title:g?g.toFixed(2):"0",background_left_img:"home-banner-card3-left.webp",background_right_img:"home-banner-card3-right.webp",className:"w-full h-[130px]",className1:`${c?"text-color2":"text-white"}`}),t.jsx(d,{text:"Trade Counts",title:u?u.toString():"0",background_left_img:"home-banner-card4-left.webp",background_right_img:"home-banner-card4-right.webp",className:"w-full h-[130px]",className1:`${c?"text-color2":"text-white"}`})]})]})})};export{wt as default};
