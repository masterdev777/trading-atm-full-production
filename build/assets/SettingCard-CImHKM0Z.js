import{j as e}from"./index-C5dHWHVl.js";const d=({profit:t,setProfit:s,description:a,setDescription:n})=>{const o=r=>{const l=r.target.value.replace(/[^0-9.]/g,"");l.split(".").length-1>1||l.startsWith(".")||s(l===""?{...t,per_hour:"0"}:{...t,per_hour:l})};return e.jsx(e.Fragment,{children:e.jsxs("div",{className:"w-full flex flex-col gap-8",children:[e.jsxs("div",{className:"flex flex-col gap-5",children:[e.jsx("h3",{className:"font-bold text-white text-xl",children:"Profit Sharing Method with copier"}),e.jsx("div",{className:"pl-10 grid md:grid-cols-2 gap-8",children:e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-xl text-white",children:"Per hour"}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("input",{className:"w-full px-4 h-[56px] rounded-l-lg border-2 border-color4 border-r-0 text-white placeholder:text-color4 outline-none bg-transparent",value:t.per_hour,onChange:o}),e.jsxs("div",{className:"w-[150px] h-[56px] rounded-r-lg border-2 border-color4 bg-[#FFFFFF03] flex items-center justify-center gap-2",children:[e.jsx("p",{className:"text-white text-xl",children:"USD"}),e.jsx("img",{src:"/icons/downarrow_purple.webp",alt:"Down arrow icon",title:"This is purple",className:"w-[18px] h-[10px]"})]})]})]})}),e.jsx("div",{className:"pl-10 text-white",children:"Masters can change their prices once a week and can increase them by up to 10% at one time."})]}),e.jsxs("div",{className:"flex flex-col gap-5",children:[e.jsx("h3",{className:"font-bold text-xl text-white",children:"About Me"}),e.jsx("textarea",{className:"p-5 w-full min-h-[180px] rounded-lg border-2 border-color4 bg-transparent outline-none text-white",value:a,onChange:r=>n(r.target.value)})]})]})})};export{d as S};
