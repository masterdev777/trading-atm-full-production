import{g as m,a as f,r as s,j as e,t as h}from"./index-D3mr-EkT.js";import{P as x}from"./PlanCard-CA3MJklH.js";import{q as y}from"./DashboardActions-B9-8Vap5.js";import{b as P}from"./stack-BlqWHnTg.js";const N=()=>{const[c,I]=m(),d=f(),[p,u]=s.useState(""),[l,i]=s.useState(""),[r,n]=s.useState(0);s.useEffect(()=>{const t=c.get("account_id");t&&u(t);const a=c.get("type");a&&i(a);const o=c.get("index");o&&n(parseInt(o))},[]);const g=async(t,a)=>{await d(y({type:l,acc_id:p,plan:t,upgradeType:a})).then(()=>{h.success("Plan has been upgraded successfully!"),n(t)}).catch(()=>{})};return e.jsx(e.Fragment,{children:e.jsx("div",{className:"mx-auto 2xl:w-[800px] grid grid-cols-1 md:grid-cols-2 gap-8 2xl:gap-12",children:P.map((t,a)=>e.jsx(x,{item:t,className:"w-full",handleClick:()=>g(a,a>r?"upgrade":"downgrade"),type:a>r?"upgrade":"downgrade",disabled:r===a},a))})})};export{N as default};
