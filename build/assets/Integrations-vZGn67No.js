import{b as o,j as s,B as m}from"./index-C3s5vc-C.js";import{I as x}from"./stack-DOGBLlDl.js";/* empty css                     */const d=({item:e,type:t,method:l,className:i})=>{const r=o(),n=a=>{l==="all"&&a===0&&r("/dashboard/integrations/masters/plan"),l==="all"&&a===1&&r("/dashboard/integrations/copiers/selectplatform")};return s.jsx(s.Fragment,{children:s.jsxs("div",{className:`relative ${i} flex flex-col items-center justify-center
       rounded-xl border-[2px] border-color4 bg-gradient-to-br from-[#FFFFFF03] to-[#FFFFFF01]`,children:[s.jsxs("div",{className:"absolute top-8 w-[90%] h-[80%] flex justify-between",children:[s.jsx("img",{src:e.boxImgUrl,alt:"Integration card icon",title:"This is smart icon",className:"w-4 h-[63px]"}),s.jsx("img",{src:e.boxImgUrl,alt:"Integration card icon",title:"This is smart icon",className:"w-4 h-[63px]"})]}),s.jsx("div",{className:"w-[70%] sm:w-[80%] flex items-center justify-center",children:s.jsxs("div",{className:"flex flex-col",children:[s.jsx("div",{className:"mb-3 w-full flex justify-center",children:s.jsx("img",{src:e.iconUrl,alt:"Service icon",title:"This is smart icon",className:"w-20 h-20"})}),s.jsx("h2",{className:"text-[23px] sm:text-[27px] md:text-[32px] text-white",children:e.title}),s.jsx("div",{className:"mt-5 w-full h-[2px] bg-gradient-to-r from-[#FFFFFF00] via-[#FFFFFF80] to-[#FFFFFF00]"}),s.jsx("ul",{className:`ml-6 my-6 ${l==="all"?"h-auto sm:h-[130px] md:h-[170px]":"h-auto sm:h-[70px] md:h-[100px]"} list-disc flex flex-col justify-between`,children:e.contents.map((a,c)=>s.jsx("li",{className:"mt-4 text-sm md:text-base text-white",children:a},c))}),s.jsx("div",{className:"mt-6",children:s.jsx(m,{text:"+ ADD",className:"w-full md:w-[184px] h-[56px]",handleClick:()=>n(t)})})]})})]})})},f=()=>s.jsx(s.Fragment,{children:s.jsx("div",{className:"integration-home mt-12",children:x.map((e,t)=>s.jsx(d,{type:t,className:"w-full h-auto py-16 md:py-0 md:h-[600px]",item:e,method:"all"},t))})});export{f as default};
