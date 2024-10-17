import{u,r as l,a as h,b as g,j as e,S as f,B as w,L as j,c as b}from"./index-C5dHWHVl.js";import{F as r}from"./index-Di70Pqcq.js";import"./zoom-BsRzBlsc.js";import"./index-DcfIKM1A.js";import"./index-xkv9PrZF.js";const N={required:"${label} required!",types:{email:"${label} is not a valid email!"}},v=({card_icon:o})=>{const n=u(t=>t.auth),[c,i]=l.useState(!1),p=h(),s=g();l.useEffect(()=>{n.logined&&s("/dashboard/home")});const x=()=>{},d=async t=>{i(!0),await p(b(t)).then(async a=>{i(!1),a.status===200?s("/dashboard/home"):a.status===201&&s("/user/verify")}).catch(()=>{i(!1)})},m=()=>{s("/user/signup")};return e.jsx(e.Fragment,{children:c?e.jsx(f,{}):e.jsxs("div",{className:`relative w-[361px] h-[577px] flex flex-col items-center justify-center gap-4
            rounded-xl rounded-tl-[32px] border-[2px] border-color4 backdrop-blur-xl`,children:[e.jsx("img",{src:`/icons/${o}`,alt:"Card icon",title:"This is smart icon",className:"absolute top-0 left-0 w-[100px] h-[100px]"}),e.jsx("img",{src:"/icons/top-right.webp",alt:"Top right icon",title:"This is general icon",className:"absolute top-[18px] right-[18px] w-[67px] h-[67px]"}),e.jsx("img",{src:"/icons/bottom-right.webp",alt:"Bottom right icon",title:"This is general icon",className:"absolute bottom-[18px] right-[18px] w-[67px] h-[67px]"}),e.jsx("img",{src:"/icons/bottom-left.webp",alt:"Bottom left icon",title:"This is general icon",className:"absolute bottom-[18px] left-[18px] w-[67px] h-[67px]"}),e.jsxs("div",{className:"w-full flex flex-col items-center justify-center gap-6",children:[e.jsx("a",{href:"https://tradingatmstg.wpenginepowered.com/",children:e.jsx("img",{src:"/icons/header-logo.webp",alt:"Header logo",title:"This is website logo",className:"w-[156px] h-[60px]"})}),e.jsx(r,{name:"nest-messages",layout:"vertical",initialValues:{email:"",password:""},labelWrap:!0,colon:!1,validateMessages:N,onFinish:d,children:e.jsxs("div",{className:"flex flex-col items-center justify-center",children:[e.jsx(r.Item,{name:["email"],rules:[{required:!0,type:"email"}],className:"w-full",children:e.jsx("input",{type:"email",placeholder:"Email",className:"px-4 w-[240px] h-[56px] focus:outline-none bg-transparent rounded-lg border-[2px] border-color4 text-white"})}),e.jsx(r.Item,{name:["password"],rules:[{required:!0},{validator:(t,a)=>/[-'";#%&*()\/\[\]{}<>?]/.test(a)?Promise.reject("Input contains forbidden characters."):Promise.resolve()}],className:"w-full",children:e.jsx("input",{type:"password",placeholder:"Password",className:"px-4 w-[240px] h-[56px] focus:outline-none bg-transparent rounded-lg border-[2px] border-color4 text-white"})}),e.jsx(r.Item,{className:"w-full",children:e.jsx(w,{text:"SIGN IN",className:"w-[238px] h-[56px]",handleClick:x})})]})})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2 text-sm",children:[e.jsxs("div",{className:"w-full flex justify-center text-white tracking-wider",children:["Don't have an account?"," ",e.jsx("span",{className:"pl-2 text-color1 cursor-pointer hover:underline",onClick:m,children:"Sign Up!"})]}),e.jsx(j,{to:"/user/forgotpassword",children:e.jsx("p",{className:"text-center text-color1 cursor-pointer hover:underline",children:"Forgot Password?"})})]})]})})},T=()=>e.jsx(e.Fragment,{children:e.jsx("div",{className:"w-full",children:e.jsx("div",{className:"container w-full h-screen flex items-center justify-center",children:e.jsx(v,{card_icon:"what-we-offer1.webp"})})})});export{T as default};
