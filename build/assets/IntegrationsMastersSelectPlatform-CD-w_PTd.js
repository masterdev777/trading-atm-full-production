import{m as d,r as l,b as c,j as a}from"./index-C3s5vc-C.js";import{S as m}from"./SelectPlatformCard-BrTt-KAb.js";import{c as x}from"./stack-DOGBLlDl.js";const g=()=>{const[o,f]=d(),[t,i]=l.useState(0),s=c();l.useEffect(()=>{const e=o.get("index");e&&(e!=="0"&&e!=="1"&&e!=="2"&&e!=="3"&&s("/dashboard/integrations/home"),i(parseInt(e)))},[]);const n=e=>{e===0&&s(`/dashboard/integrations/masters/tradelocker?level_index=${t}&type=live`),e===1&&s(`/dashboard/integrations/masters/tradelocker?level_index=${t}&type=demo`),e===2&&s(`/dashboard/integrations/masters/metatrader4?level_index=${t}`),e===3&&s(`/dashboard/integrations/masters/metatrader5?level_index=${t}`)};return a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:"mx-auto w-full 2xl:w-[800px] flex justify-between",children:[a.jsx("p",{className:"pl-4 text-white",children:"Choose your master account’s platform"}),a.jsx("div",{className:`w-[100px] h-[29px] text-white text-xl font-extrabold rounded-full flex justify-center items-center
          ${t===0?"":t===1?"bg-silvercolor text-[#3BA1F4]":t===2?"bg-goldcolor":"bg-herocolor"}`,children:t===0?"BASIC":t===1?"SILVER":t===2?"GOLD":"HERO"})]}),a.jsx("div",{className:"mx-auto w-full 2xl:w-[800px] mt-4 grid grid-cols-1 gap-8",children:x.map((e,r)=>a.jsx(m,{title:e.title,className:"",description:e.description,icon_url:e.icon_url,handleClick:()=>n(r)},r))})]})};export{g as default};
