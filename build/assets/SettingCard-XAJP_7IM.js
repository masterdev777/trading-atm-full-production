import{j as e,t as x}from"./index-D6LNu3uc.js";/* empty css                  */const m=({isProfitShare:a,setIsProfitShare:o,profit:s,setProfit:r,description:c,setDescription:n})=>{const i=l=>{const t=l.target.value.replace(/[^0-9.]/g,"");t.split(".").length-1>1||t.startsWith(".")||r(t===""?{...s,per_hour:"0"}:{...s,per_hour:t})},d=l=>{if(console.log(l.target.value),l.target.value.length>1e3){n(l.target.value.slice(0,1e3)),x.warning("Please note that the maximum allowable input is limited to 1,000 characters.");return}else n(l.target.value)};return e.jsx(e.Fragment,{children:e.jsxs("div",{className:"w-full flex flex-col gap-8",children:[e.jsxs("div",{className:"flex flex-col gap-5",children:[e.jsx("h3",{className:"font-bold text-white text-xl",children:"Profit Sharing Method with copier"}),e.jsxs("div",{className:"pl-10 grid md:grid-cols-2 gap-8",children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-xl text-white",children:"Profit Share"}),e.jsx("div",{className:"flex items-center",children:e.jsx("div",{className:"profit-share-styled-select",children:e.jsxs("select",{value:a,onChange:l=>o(parseInt(l.target.value)),children:[e.jsx("option",{value:0,children:"YES"}),e.jsx("option",{value:1,children:"NO"})]})})})]}),e.jsxs("div",{className:`${a===0?"block":"hidden"} flex flex-col gap-2`,children:[e.jsx("label",{className:"text-xl text-white",children:"Per hour"}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("input",{disabled:a!==0,className:"w-full px-4 h-[56px] rounded-l-lg text-white border-2 border-color4 border-r-0 placeholder:text-color4 outline-none bg-transparent",value:s.per_hour,onChange:i}),e.jsx("div",{className:"w-[150px] h-[56px] rounded-r-lg border-2 border-color4 bg-[#FFFFFF03] flex items-center justify-center gap-2",children:e.jsx("p",{className:"text-white text-xl",children:"USD"})})]})]})]}),e.jsx("div",{className:"pl-10 text-white",children:"Masters can change their prices once a week and can increase them by up to 10% at one time."})]}),e.jsxs("div",{className:"flex flex-col gap-5",children:[e.jsx("h3",{className:"font-bold text-xl text-white",children:"About Me"}),e.jsx("textarea",{className:"p-5 w-full h-[180px] rounded-lg border-2 border-color4 bg-transparent outline-none text-white resize-none overflow-y-auto customized-scrollbar-y",value:c,onChange:d})]})]})})};export{m as S};
