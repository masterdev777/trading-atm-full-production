import{m as Y,u as R,a as G,b as W,r as l,j as t,B as z,h as e,l as b,t as o,p as K}from"./index-D6LNu3uc.js";import{w as O,x as q,y as C,z as F,A as H,B as J}from"./DashboardActions-Bnzxt48J.js";import{S as Q}from"./SettingCard-XAJP_7IM.js";import{I as V,a as X}from"./IntegrationUploadImage-CshSye3s.js";import{B as Z}from"./ButtonComponentWhite-BZ6-4gbc.js";import{D as N,U as ee}from"./uploading-TZ485kdK.js";import{l as ae}from"./stack-DOGBLlDl.js";/* empty css                    */const pe=({role:n})=>{const[T,te]=Y(),x=R(c=>c.auth),d=G(),m=W(),[B,f]=l.useState(!1),[a,I]=l.useState({acc_name:"",acc_password:"",acc_id:"",acc_email:"",server_name:""}),[p,D]=l.useState(0),[g,L]=l.useState(0),[k,U]=l.useState({per_hour:"0"}),[j,P]=l.useState(""),[y,E]=l.useState(N),[A,S]=l.useState(0);l.useEffect(()=>{const c=T.get("level_index"),r=T.get("type");c&&(c!=="0"&&c!=="1"&&c!=="2"&&c!=="3"&&m("/dashboard/integrations/home"),D(parseInt(c))),r==="demo"&&S(0),r==="live"&&S(1)},[]);const $=async()=>{const c={email:a.acc_email.trim(),password:a.acc_password,server:a.server_name.trim()};f(!0),A===0?await O(c).then(async r=>{await q(r.accessToken).then(async i=>{let v=!1,u=0,_=0;for(let s=0;s<i.length;s++)if(i[s].id===a.acc_id){v=!0,u=parseInt(i[s].accNum),_=parseFloat(i[s].accountBalance);break}if(v){if(n==="master"){const s={encrypted_acc_num:e(u),encrypted_account_balance:e(_),access_token:r.accessToken,refresh_token:r.refreshToken,encrypted_acc_email:e(a.acc_email),encrypted_acc_id:e(a.acc_id),encrypted_acc_password:e(a.acc_password),encrypted_server_name:e(a.server_name),encrypted_acc_name:e(a.acc_name),encrypted_type:e("tld"),encrypted_id:e(x.user.id),encrypted_is_profit_share:e(g),encrypted_profit_share:e(g===0?k:{per_hour:"0"}),description:j,avatar:y===N?"":y,encrypted_index_level:e(p)};await d(C({encrypted:s})).then(async h=>{await d(b()),h.status===200?o.success("Master Account Added Successfully!"):h.status===201&&o.warning(h.data),m("/dashboard/masters")})}else if(n==="copier"){const s={encrypted_acc_num:e(u),encrypted_account_balance:e(_),access_token:r.accessToken,refresh_token:r.refreshToken,encrypted_acc_email:e(a.acc_email),encrypted_acc_id:e(a.acc_id),encrypted_acc_password:e(a.acc_password),encrypted_server_name:e(a.server_name),encrypted_acc_name:e(a.acc_name),encrypted_type:e("tld"),encrypted_id:e(x.user.id),avatar:x.user.avatar};await d(F({encrypted:s})).then(async h=>{await d(b()),h.status===200?o.success("Copier Account Added Successfully!"):h.status===201&&o.warning(h.data),m("/dashboard/copiers")})}}else o.warning("No account exist!");f(!1)})}).catch(()=>{o.warning("No this account exists!"),f(!1)}):A===1&&await H(c).then(async r=>{await J(r.accessToken).then(async i=>{let v=!1,u=0,_=0;for(let s=0;s<i.length;s++)if(i[s].id===a.acc_id){v=!0,u=parseInt(i[s].accNum),_=parseFloat(i[s].accountBalance);break}if(v){if(n==="master"){const s={encrypted_acc_num:e(u),encrypted_account_balance:e(_),access_token:r.accessToken,refresh_token:r.refreshToken,encrypted_acc_email:e(a.acc_email),encrypted_acc_id:e(a.acc_id),encrypted_acc_password:e(a.acc_password),encrypted_server_name:e(a.server_name),encrypted_acc_name:e(a.acc_name),encrypted_type:e("tll"),encrypted_id:e(x.user.id),encrypted_is_profit_share:e(g),encrypted_profit_share:e(g===0?k:{per_hour:"0"}),description:j,avatar:y===N?"":y,encrypted_index_level:e(p)};await d(C({encrypted:s})).then(async()=>{await d(b()),o.success("Master Account Added Successfully!"),m("/dashboard/masters")})}else if(n==="copier"){const s={encrypted_acc_num:e(u),encrypted_account_balance:e(_),access_token:r.accessToken,refresh_token:r.refreshToken,encrypted_acc_email:e(a.acc_email),encrypted_acc_id:e(a.acc_id),encrypted_acc_password:e(a.acc_password),encrypted_server_name:e(a.server_name),encrypted_acc_name:e(a.acc_name),encrypted_type:e("tll"),encrypted_id:e(x.user.id),avatar:x.user.avatar};await d(F({encrypted:s})).then(async()=>{await d(b()),o.success("Copier Account Added Successfully!"),m("/dashboard/copiers")})}}else o.warning("No account exist!");f(!1)})}).catch(()=>{o.warning("No this account exists!"),f(!1)})},w=(c,r)=>{c==="acc_password"?I({...a,[c]:r}):K(r)&&I({...a,[c]:r})},M=()=>{n==="master"&&m(`/dashboard/integrations/masters/selectplatform?index=${p}`),n==="copier"&&m("/dashboard/integrations/copiers/selectplatform")};return t.jsx(t.Fragment,{children:t.jsx("div",{className:"mt-16",children:t.jsxs("div",{className:"relative w-full h-auto rounded-xl rounded-tl-[30px] border-2 border-color4 bg-gradient-to-br from-[#FFFFFF03] to-[#FFFFFF01]",children:[t.jsx("img",{src:"/icons/tradelocker-left.webp",alt:"Tradelocker icon",title:"This is left icon",className:"absolute top-0 left-0 w-[100px] h-[100px]"}),t.jsx("img",{src:"/icons/top-right.webp",alt:"Top right icon",title:"This is general icon",className:"absolute top-[18px] right-[18px] w-[67px] h-[67px]"}),t.jsx("img",{src:"/icons/bottom-right.webp",alt:"Bottom right icon",title:"This is general icon",className:"absolute bottom-[18px] right-[18px] w-[67px] h-[67px]"}),t.jsx("img",{src:"/icons/bottom-left.webp",alt:"Bottom left icon",title:"This is general icon",className:"absolute bottom-[18px] left-[18px] w-[67px] h-[67px]"}),t.jsx("div",{className:"my-16 flex items-center justify-center",children:B?t.jsx(V,{}):t.jsxs("div",{className:"w-[80%] flex flex-col items-center justify-center",children:[t.jsxs("div",{className:"w-full flex items-center gap-5",children:[t.jsxs("h2",{className:"hidden md:block text-[32px] text-white",children:["Tradelocker ",n==="master"?"Master":"Copier"]}),t.jsx("h2",{className:"block md:hidden text-[32px] text-white",children:"Tradelocker"}),n==="master"&&p?t.jsx("img",{src:ae[p],alt:"Level icon",title:"This is icon to show account level",className:"h-[28px]"}):t.jsx(t.Fragment,{})]}),t.jsx("div",{className:"mt-8 w-full font-bold text-xl text-white",children:"Basic information :"}),t.jsxs("div",{className:"my-8 w-full flex-col flex lg:flex-row lg:justify-between gap-6 lg:gap-0",children:[t.jsx("div",{className:`${n==="copier"&&"hidden"} w-[130px] h-[130px] rounded-full border-4 ${p===3?"border-herocolor":p===2?"border-goldcolor":p===1?"border-silvercolor":"border-color4"}`,children:t.jsx(X,{avatarURL:y,setAvatarURL:E,DefaultImage:N,UploadingAnimation:ee,className:"w-[122px] h-[122px]",className1:"bottom-12 right-[68px]",className2:"bottom-12 right-[32px]"})}),t.jsxs("div",{className:`${n==="master"?"integration-input-group":"w-full"} grid grid-cols-1 md:grid-cols-2 gap-4`,children:[t.jsx("input",{type:"email",value:a.acc_email,className:"focus:outline-none h-[56px] rounded-lg border-2 border-color4 px-4 text-white text-sm bg-transparent",placeholder:"Input Your Tradelocker Account Email",onChange:c=>w("acc_email",c.target.value)}),t.jsx("input",{value:a.acc_id,className:"focus:outline-none h-[56px] rounded-lg border-2 border-color4 px-4 text-white text-sm bg-transparent",placeholder:"Input Your Tradelocker Account Id",onChange:c=>w("acc_id",c.target.value)}),t.jsx("input",{type:"password",value:a.acc_password,className:"focus:outline-none h-[56px] rounded-lg border-2 border-color4 px-4 text-white text-sm bg-transparent",placeholder:"Input Your Tradelocker Account Password",onChange:c=>w("acc_password",c.target.value)}),t.jsx("input",{value:a.server_name,className:"focus:outline-none h-[56px] rounded-lg border-2 border-color4 px-4 text-white text-sm bg-transparent",placeholder:"Input Your Tradelocker Server Name",onChange:c=>w("server_name",c.target.value)}),t.jsx("input",{value:a.acc_name,className:"focus:outline-none h-[56px] rounded-lg border-2 border-color4 px-4 text-white text-sm bg-transparent",placeholder:"Input Account Name (Displayed on this platform)",onChange:c=>w("acc_name",c.target.value)})]})]}),t.jsx("div",{className:`w-full ${n==="copier"&&"hidden"}`,children:t.jsx(Q,{isProfitShare:g,setIsProfitShare:L,profit:k,setProfit:U,description:j,setDescription:P})}),t.jsxs("div",{className:"mt-6 w-full flex justify-end gap-5",children:[t.jsx(Z,{text:"GO BACK",className:"w-full sm:w-[216px] h-[56px]",handleClick:M}),t.jsx(z,{text:"+ ADD",className:"w-full sm:w-[216px] h-[56px]",handleClick:$})]})]})})]})})})};export{pe as T};
