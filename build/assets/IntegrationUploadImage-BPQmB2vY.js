import{r as a,j as e,B as F}from"./index-C3s5vc-C.js";import{A as B,S as N}from"./uploading-Bon35dHn.js";import{B as y}from"./ButtonComponentWhite-D_gsyfBL.js";/* empty css                    */import{M as H}from"./index-BFbfZVqN.js";const M=(l,t)=>{const r=new FileReader;r.addEventListener("load",()=>t(r.result)),r.readAsDataURL(l)},G=({avatarURL:l,setAvatarURL:t,DefaultImage:r,UploadingAnimation:c,className:u,className1:p,className2:x})=>{const o=a.useRef(null),[h,i]=a.useState(!1),[d,C]=a.useState(null),[f,m]=a.useState(0),[j,g]=a.useState(1),k=()=>{i(!1)},L=s=>{s.preventDefault(),o.current&&o.current.click()},v=async()=>{try{if(t(c),o.current&&o.current.files){const s=o.current.files[0];M(s,n=>{t(n),i(!0)})}}catch{t(r)}},w=()=>{if(d){const n=d.getImageScaledToCanvas().toDataURL();t(n),i(!1)}},b=()=>{t(r)},V=s=>{C(s)},S=s=>{const n=s;m(n),g(1+n/100)};return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"relative size-full rounded-full text-white text-base",children:r===l?e.jsxs("form",{id:"form",encType:"multipart/form-data",className:"size-full",children:[e.jsx("button",{type:"submit",onClick:L,className:"group size-full cursor-pointer flex items-center justify-center",children:e.jsx("svg",{width:"32",height:"24",viewBox:"0 0 32 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M10 9C10 5.68629 12.6863 3 16 3C19.3137 3 22 5.68629 22 9V10.5H23.5C26.3995 10.5 28.75 12.8505 28.75 15.75C28.75 18.6495 26.3995 21 23.5 21H22C21.1716 21 20.5 21.6716 20.5 22.5C20.5 23.3284 21.1716 24 22 24H23.5C28.0564 24 31.75 20.3064 31.75 15.75C31.75 11.669 28.7867 8.27996 24.8944 7.61736C24.2293 3.3032 20.5005 0 16 0C11.4996 0 7.77072 3.3032 7.10554 7.61736C3.21327 8.27996 0.25 11.669 0.25 15.75C0.25 20.3064 3.94365 24 8.5 24H10C10.8284 24 11.5 23.3284 11.5 22.5C11.5 21.6716 10.8284 21 10 21H8.5C5.6005 21 3.25 18.6495 3.25 15.75C3.25 12.8505 5.6005 10.5 8.5 10.5H10V9ZM21.5606 13.9394L17.0606 9.43935C16.4749 8.85356 15.5251 8.85356 14.9394 9.43935L10.4393 13.9394C9.85355 14.5251 9.85355 15.4749 10.4393 16.0606C11.0251 16.6464 11.9749 16.6464 12.5607 16.0606L14.5 14.1213V22.5C14.5 23.3284 15.1716 24 16 24C16.8284 24 17.5 23.3284 17.5 22.5V14.1213L19.4394 16.0606C20.0251 16.6464 20.9749 16.6464 21.5606 16.0606C22.1464 15.4749 22.1464 14.5251 21.5606 13.9394Z",className:"fill-white group-hover:fill-color2 duration-300"})})}),e.jsx("input",{type:"file",id:"file",ref:o,onChange:v,hidden:!0,accept:".jpg, .png"})]}):e.jsxs("div",{className:"size-full relative group",children:[e.jsx("img",{src:l,alt:"Avatar",title:"This is uploaded avatar",className:"size-full rounded-full"}),e.jsxs("div",{className:`hidden group-hover:block absolute top-0 ${u} rounded-full bg-gradient-to-r from-[#FFFFFF03] to-[#FFFFFF01] backdrop-blur-sm`,children:[e.jsx("button",{type:"submit",onClick:()=>i(!0),className:`flex-center absolute ${p} h-7 w-7 rounded-full border border-color2 flex items-center justify-center`,children:e.jsxs("svg",{width:"16px",height:"16px",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("g",{id:"SVGRepo_bgCarrier",strokeWidth:"0"}),e.jsx("g",{id:"SVGRepo_tracerCarrier",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("g",{id:"SVGRepo_iconCarrier",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z",fill:"#D205B3"})})]})}),e.jsx("button",{type:"submit",onClick:b,className:`flex-center absolute ${x} h-7 w-7 rounded-full border border-color2 flex items-center justify-center`,children:e.jsxs("svg",{width:"20px",height:"20px",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("g",{id:"SVGRepo_bgCarrier",strokeWidth:"0"}),e.jsx("g",{id:"SVGRepo_tracerCarrier",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsxs("g",{id:"SVGRepo_iconCarrier",children:[e.jsx("path",{d:"M10 11V17",stroke:"#D205B3",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M14 11V17",stroke:"#D205B3",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})," ",e.jsx("path",{d:"M4 7H20",stroke:"#D205B3",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z",stroke:"#D205B3",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z",stroke:"#D205B3",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]})]})})]})]})}),e.jsx(H,{open:h,centered:!0,onCancel:k,width:500,footer:!1,children:e.jsxs("div",{className:"py-6 sm:px-6 flex flex-col justify-center items-center gap-8",children:[e.jsx(B,{ref:V,image:l,border:50,color:[255,255,255,.6],scale:j,rotate:0}),e.jsx("div",{className:"w-[300px]",children:e.jsx(N,{defaultValue:0,value:f,onChange:S})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(F,{text:"Ok",className:"w-[156px] h-[56px]",handleClick:w}),e.jsx(y,{text:"Cancel",className:"w-[156px] h-[56px]",handleClick:()=>i(!1)})]})]})})]})};export{G as I};
