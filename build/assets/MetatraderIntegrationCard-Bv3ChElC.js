import{j as t,m as Y,u as z,a as K,b as O,r as m,B as q,t as n,e,p as J}from"./index-CndeRajg.js";import{C as Q,D as V,E as D,F as T,G as X,H as Z}from"./DashboardActions-BP3iLw6C.js";import{S as ee}from"./SettingCard-8o0ZIiMZ.js";import{B as te}from"./ButtonComponentWhite-DR9ggAwR.js";import{I as ae}from"./IntegrationUploadImage-CZPBnbJ9.js";import{D as M,U as se}from"./uploading-CH-L5bGA.js";import{l as re}from"./stack-DOGBLlDl.js";/* empty css                    */const ce=()=>t.jsx(t.Fragment,{children:t.jsx("div",{className:"w-full  h-[472px] bg-transparent flex items-center justify-center",children:t.jsxs("div",{role:"status",className:"flex flex-col items-center gap-5",children:[t.jsx("img",{src:"/icons/preloader.gif",className:"size-[100px]",alt:"Website preloader",title:"This is loading animation"}),t.jsxs("span",{className:"mx-auto text-center text-2xl font-bold text-color5",children:["Takes some time to connect to Metatrader Server. ",t.jsx("br",{}),"Please wait..."]})]})})}),fe=({role:o,type:C})=>{const[k,ne]=Y(),v=z(s=>s.auth),N=K(),h=O(),[u,B]=m.useState(0),[a,P]=m.useState({acc_name:"",acc_password:"",acc_id:"",server_name:""}),[U,c]=m.useState(!1),[b,L]=m.useState(0),[A,H]=m.useState({per_hour:"0"}),[S,$]=m.useState(""),[j,E]=m.useState(M),[F,W]=m.useState(!1);m.useEffect(()=>{const s=k.get("level_index");s&&(s!=="0"&&s!=="1"&&s!=="2"&&s!=="3"&&h("/dashboard/integrations/home"),B(parseInt(s)))},[]);const G=async()=>{if(!a.acc_name||!a.acc_password||!a.acc_id||!a.server_name){n.warning("Please Input Account All Informations");return}c(!0);let s=!1;C===0?await Q(a.server_name).then(async f=>{const _=f[0].results,d=await(_==null?void 0:_.find(i=>i.name===a.server_name));if(!d){n.warning("Metatrader address not found! Please input address correctly!"),s=!0,c(!1);return}const l=d==null?void 0:d.access;for(let i=0;i<(l==null?void 0:l.length);i++){const x=l[i].split(":");let g=x[0],p="";x.length>1&&(p=x[1]),await V({user:a.acc_id,password:a.acc_password,host:g,port:p}).then(async w=>{if(!s&&w.status==200){if(s=!0,o==="master"){const y={token:w.data,encrypted_acc_id:e(a.acc_id),encrypted_acc_password:e(a.acc_password),encrypted_acc_server_name:e(a.server_name),encrypted_host:e(g),encrypted_port:e(p),encrypted_acc_name:e(a.acc_name),encrypted_type:e("mt4"),encrypted_id:e(v.user.id),encrypted_is_profit_share:e(b),encrypted_profit_share:e(b===0?A:{per_hour:"0"}),description:S,encrypted_index_level:e(u),encrypted_private_account:e(F),avatar:j===M?"":j};await N(D({encrypted:y})).then(r=>{r.status===200?n.success("Master account has been added successfully!"):r.status===201&&n.warning(r.data),c(!1),h("/dashboard/masters")}).catch(()=>{c(!1)});return}else if(o==="copier"){const y={token:w.data,encrypted_acc_id:e(a.acc_id),encrypted_acc_password:e(a.acc_password),encrypted_acc_server_name:e(a.server_name),encrypted_host:e(g),encrypted_port:e(p),encrypted_acc_name:e(a.acc_name),encrypted_type:e("mt4"),encrypted_id:e(v.user.id),avatar:v.user.avatar};await N(T({encrypted:y})).then(r=>{r.status===200?n.success("Copier account has been added successfully!"):r.status===201&&n.warning(r.data),c(!1),h("/dashboard/copiers")}).catch(()=>{c(!1)});return}}})}}).catch(()=>{c(!1),s=!0}):await X(a.server_name).then(async f=>{const _=f[0].results,d=await(_==null?void 0:_.find(i=>i.name===a.server_name));if(!d){n.warning("Metatrader address not found! Please input address correctly!"),s=!0,c(!1);return}const l=d==null?void 0:d.access;for(let i=0;i<(l==null?void 0:l.length);i++){const x=l[i].split(":");let g=x[0],p="";x.length>1&&(p=x[1]),await Z({user:a.acc_id,password:a.acc_password,host:g,port:p}).then(async w=>{if(!s&&w.status==200){if(s=!0,o==="master"){const y={token:w.data,encrypted_acc_id:e(a.acc_id),encrypted_acc_password:e(a.acc_password),encrypted_acc_server_name:e(a.server_name),encrypted_host:e(g),encrypted_port:e(p),encrypted_acc_name:e(a.acc_name),encrypted_type:e("mt5"),encrypted_id:e(v.user.id),encrypted_is_profit_share:e(b),encrypted_profit_share:e(b===0?A:{per_hour:"0"}),description:S,encrypted_index_level:e(u),encrypted_private_account:e(F),avatar:j===M?"":j};await N(D({encrypted:y})).then(r=>{r.status===200?n.success("Master account has been added successfully!"):r.status===201&&n.warning(r.data),c(!1),h("/dashboard/masters")}).catch(()=>{c(!1)});return}else if(o==="copier"){const y={token:w.data,encrypted_acc_id:e(a.acc_id),encrypted_acc_password:e(a.acc_password),encrypted_acc_server_name:e(a.server_name),encrypted_host:e(g),encrypted_port:e(p),encrypted_acc_name:e(a.acc_name),encrypted_type:e("mt5"),encrypted_id:e(v.user.id),avatar:v.user.avatar};await N(T({encrypted:y})).then(r=>{r.status===200?n.success("Copier account has been added successfully!"):r.status===201&&n.warning(r.data),c(!1),h("/dashboard/copiers")}).catch(()=>{c(!1)});return}}})}}).catch(()=>{c(!1),s=!0}),s||n.error("Invalid Account!"),c(!1)},I=(s,f)=>{s==="acc_password"?P({...a,[s]:f}):J(f)&&P({...a,[s]:f})},R=()=>{o==="master"&&h(`/dashboard/integrations/masters/selectplatform?index=${u}`),o==="copier"&&h("/dashboard/integrations/copiers/selectplatform")};return t.jsx(t.Fragment,{children:t.jsx("div",{className:"mt-16",children:t.jsxs("div",{className:"relative w-full h-auto rounded-xl rounded-tl-[30px] border-2 border-color4 bg-gradient-to-br from-[#FFFFFF03] to-[#FFFFFF01]",children:[t.jsx("img",{src:"/icons/metatrader-left.webp",alt:"Top left icon",title:"This is metatrader icon",className:"absolute top-0 left-0 w-[100px] h-[100px]"}),t.jsx("img",{src:"/icons/top-right.webp",alt:"Top right icon",title:"This is general icon",className:"absolute top-[18px] right-[18px] w-[67px] h-[67px]"}),t.jsx("img",{src:"/icons/bottom-right.webp",alt:"Bottom right icon",title:"This is general icon",className:"absolute bottom-[18px] right-[18px] w-[67px] h-[67px]"}),t.jsx("img",{src:"/icons/bottom-left.webp",alt:"Bottom left icon",title:"This is general icon",className:"absolute bottom-[18px] left-[18px] w-[67px] h-[67px]"}),U?t.jsx(ce,{}):t.jsx("div",{className:"my-16 flex items-center justify-center",children:t.jsxs("div",{className:"w-[80%] flex flex-col items-center justify-center",children:[t.jsxs("div",{className:"w-full flex gap-5 items-center",children:[t.jsxs("h2",{className:"hidden md:block text-[32px] text-white",children:[C===0?"Metatrader 4 ":"Metatrader 5 ",o==="master"?"Master":"Copier"]}),t.jsx("h2",{className:"block md:hidden text-[32px] text-white",children:C===0?"Metatrader 4":"Metatrader 5"}),o==="master"&&u?t.jsx("img",{src:re[u],alt:"Level icon",title:"This is icon to show level",className:"h-[28px]"}):t.jsx(t.Fragment,{})]}),t.jsx("div",{className:"mt-8 w-full font-bold text-xl text-white",children:"Basic information :"}),t.jsxs("div",{className:"my-8 w-full flex justify-between",children:[t.jsx("div",{className:`${o==="copier"&&"hidden"} w-[130px] h-[130px] rounded-full border-4 ${u===3?"border-herocolor":u===2?"border-goldcolor":u===1?"border-silvercolor":"border-color4"}`,children:t.jsx(ae,{avatarURL:j,setAvatarURL:E,DefaultImage:M,UploadingAnimation:se,className:"w-[130px] h-[130px]",className1:"bottom-12 right-[68px]",className2:"bottom-12 right-[32px]"})}),t.jsxs("div",{className:`${o==="master"?"integration-input-group":"w-full"} grid grid-cols-1 md:grid-cols-2 gap-4`,children:[t.jsx("input",{value:a.acc_id,className:"focus:outline-none h-[56px] rounded-lg border-2 border-color4 px-4 text-white text-sm bg-transparent",placeholder:"Input Your Metatrader Account Id",onChange:s=>I("acc_id",s.target.value)}),t.jsx("input",{type:"password",value:a.acc_password,className:"focus:outline-none h-[56px] rounded-lg border-2 border-color4 px-4 text-white text-sm bg-transparent",placeholder:"Input Your Metatrader Account Password",onChange:s=>I("acc_password",s.target.value)}),t.jsx("input",{value:a.server_name,className:"focus:outline-none h-[56px] rounded-lg border-2 border-color4 px-4 text-white text-sm bg-transparent",placeholder:"Input Your Metatrader Server Name",onChange:s=>I("server_name",s.target.value)}),t.jsx("input",{value:a.acc_name,className:"focus:outline-none h-[56px] rounded-lg border-2 border-color4 px-4 text-white text-sm bg-transparent",placeholder:"Input Account Name (Displayed on this platform)",onChange:s=>I("acc_name",s.target.value)})]})]}),t.jsx("div",{className:`w-full ${o==="copier"&&"hidden"}`,children:t.jsx(ee,{isProfitShare:b,setIsProfitShare:L,profit:A,setProfit:H,description:S,setDescription:$,privateAccount:F,setPrivateAccount:W})}),t.jsxs("div",{className:"mt-6 w-full flex justify-end gap-5",children:[t.jsx(te,{text:"GO BACK",className:"w-full sm:w-[216px] h-[56px]",handleClick:R}),t.jsx(q,{text:"+ ADD",className:"w-full sm:w-[216px] h-[56px]",handleClick:G})]})]})})]})})})};export{fe as M};
