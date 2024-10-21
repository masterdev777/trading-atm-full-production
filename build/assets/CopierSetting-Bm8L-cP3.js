import{b as G,a as W,r as i,j as e,B as K,t as Y,m as X,h as Z,k as D}from"./index-BOV8MqzO.js";import{T as ee}from"./TitleComponent-DN3H9PQT.js";import{B as O}from"./ButtonComponentWhite-GwdnuTI9.js";import{u as te,f as se,h as le,i as oe}from"./DashboardActions-BWWaixGw.js";import{D as Q}from"./DashboardLoading-CIRdu-SP.js";import{M as ie}from"./MainDataLoading-DorPupoR.js";/* empty css                  */const ae=({account_id:w,type:P,copierData:t,setCopierData:b})=>{const k=G(),y=W(),[C,f]=i.useState(!1),[a,s]=i.useState("fixed_lot"),[r,m]=i.useState({fixed_lot:"0",lot_multiplier:"100",balance_multiplier:"100",fixed_balance_multiplier:"100000"}),[x,_]=i.useState(1),[g,z]=i.useState(1),[j,v]=i.useState("0"),[h,p]=i.useState("0"),[N,V]=i.useState(1),[M,L]=i.useState("0");i.useEffect(()=>{var c,u,l,S,T,B,A,$,E,H,q,J;t.risk_type&&s(t.risk_type),t.risk_type&&t.risk_setting&&m({...r,[t.risk_type]:t.risk_setting}),t.force_min_max&&(((c=t.force_min_max)==null?void 0:c.force_max)!==null&&_((u=t.force_min_max)!=null&&u.force_max?0:1),((l=t.force_min_max)==null?void 0:l.force_min)!==null&&z((S=t.force_min_max)!=null&&S.force_min?0:1),(T=t.force_min_max)!=null&&T.force_max_value&&v((B=t.force_min_max)==null?void 0:B.force_max_value),(A=t.force_min_max)!=null&&A.force_min_value&&p(($=t.force_min_max)==null?void 0:$.force_min_value),(E=t.force_min_max)!=null&&E.lot_refine&&V((H=t.force_min_max)!=null&&H.lot_refine?0:1),(q=t.force_min_max)!=null&&q.lot_refine_size&&L((J=t.force_min_max)==null?void 0:J.lot_refine_size))},[]);const I=c=>{s(c.target.value)},R=c=>{const l=c.target.value.replace(/[^0-9.]/g,"");l.split(".").length-1>1||l.startsWith(".")||m(l===""?{...r,[a]:0}:{...r,[a]:l})},o=async()=>{const c={accountId:w,accountType:P,riskType:a,riskSetting:a==="fixed_lot"?r.fixed_lot:a==="lot_multiplier"?r.lot_multiplier:a==="balance_multiplier"?r.balance_multiplier:r.fixed_balance_multiplier,isForceMax:x===0,isForceMin:g===0,forceMaxValue:x===0?j:"0",forceMinValue:g===0?h:"0",isLotRefine:N===0,lotRefineSize:N===0?M:"0"};f(!0),await y(te(c)).then(u=>{Y.success("Updated successfully!"),b(u),f(!1)}).catch(()=>{f(!1)})},d=()=>{k("/dashboard/copiers")},n=c=>{const l=c.target.value.replace(/[^0-9.]/g,"");l.split(".").length-1>1||l.startsWith(".")||v(l===""?"0":l)},F=c=>{const l=c.target.value.replace(/[^0-9.]/g,"");l.split(".").length-1>1||l.startsWith(".")||p(l===""?"0":l)},U=c=>{const u=c.target.value;let l;if(u.startsWith("-")?l="-"+u.replace(/[^0-9.]/g,""):l=u.replace(/[^0-9.]/g,""),(l.match(/\./g)||[]).length>1){const T=l.lastIndexOf(".");l=l.slice(0,T)}L(l===""?"0":l)};return e.jsx(e.Fragment,{children:C?e.jsx(Q,{}):e.jsxs("div",{children:[e.jsxs("div",{className:"px-4 my-12 w-full flex flex-col gap-8",children:[e.jsxs("div",{className:"w-full grid md:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-8",children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Risk Type"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{className:"text-whtie",onChange:I,value:a,children:[e.jsx("option",{value:"fixed_lot",children:"Fixed Lot"}),e.jsx("option",{value:"lot_multiplier",children:"Lot Multiplier"}),e.jsx("option",{value:"balance_multiplier",children:"Balance Multiplier"}),e.jsx("option",{value:"fixed_balance_multiplier",children:"Fixed Balance Multiplier"})]})})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("label",{className:"text-color5",children:[a==="fixed_lot"&&"Fixed Lot Size",a==="balance_multiplier"&&"Percentage (%)",a==="lot_multiplier"?"Lot Percentage (%)":a==="fixed_balance_multiplier"?"Fixed Balance ($)":""]}),e.jsx("input",{className:"select-none px-2 w-full h-12 rounded-[10px] bg-transparent border-[2px] border-[#ffffff10] outline-none text-white",onChange:R,value:a==="lot_multiplier"?r.lot_multiplier:a==="fixed_balance_multiplier"?r.fixed_balance_multiplier:a==="fixed_lot"?r.fixed_lot:a==="balance_multiplier"?r.balance_multiplier:0})]})]}),e.jsxs("div",{className:"w-full grid md:grid-cols-2 gap-x-4 gap-y-8",children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Force Maximum Lot"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{className:"text-whtie",onChange:c=>_(parseInt(c.target.value)),value:x,children:[e.jsx("option",{value:0,children:"Yes"}),e.jsx("option",{value:1,children:"No"})]})})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Maximum Lot Size"}),e.jsx("input",{disabled:x===1,className:`select-none px-2 w-full h-12 rounded-[10px] bg-transparent border-[2px] border-[#ffffff10] outline-none ${x===1?"text-textdisablecolor":"text-white"}`,value:j,onChange:n})]})]}),e.jsxs("div",{className:"w-full grid md:grid-cols-2 gap-x-4 gap-y-8",children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Force Minimum Lot"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{className:"text-whtie",onChange:c=>z(parseInt(c.target.value)),value:g,children:[e.jsx("option",{value:0,children:"Yes"}),e.jsx("option",{value:1,children:"No"})]})})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Minimum Lot Size"}),e.jsx("input",{disabled:g===1,className:`select-none px-2 w-full h-12 rounded-[10px] bg-transparent border-[2px] border-[#ffffff10] outline-none ${g===1?"text-textdisablecolor":"text-white"}`,value:h,onChange:F})]})]}),e.jsxs("div",{className:"w-full grid md:grid-cols-2 gap-x-4 gap-y-8",children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Lot Refiner"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{className:"text-whtie",onChange:c=>V(parseInt(c.target.value)),value:N,children:[e.jsx("option",{value:0,children:"Yes"}),e.jsx("option",{value:1,children:"No"})]})})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Lot Refine Size"}),e.jsx("input",{disabled:N===1,className:`select-none px-2 w-full h-12 rounded-[10px] bg-transparent border-[2px] border-[#ffffff10] outline-none ${N===1?"text-textdisablecolor":"text-white"}`,value:M,onChange:U})]})]}),e.jsxs("div",{className:"w-full grid md:grid-cols-2 gap-x-4 gap-y-8",children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Copy From Account"}),e.jsx("input",{disabled:!0,className:"select-none px-2 w-full h-12 rounded-[10px] bg-transparent border-[2px] border-[#ffffff10] outline-none text-textdisablecolor",defaultValue:t.account_name})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Copy To Account"}),e.jsx("input",{disabled:!0,className:"select-none px-2 w-full h-12 rounded-[10px] bg-transparent border-[2px] border-[#ffffff10] outline-none text-textdisablecolor",defaultValue:t.my_master_name})]})]})]}),e.jsxs("div",{className:"px-6 w-full flex flex-col md:flex-row items-center justify-end gap-4",children:[e.jsx(O,{text:"GO BACK",className:"h-[56px] w-full md:w-[184px]",handleClick:d}),e.jsx(K,{text:"UPDATE",className:"h-[56px] w-full md:w-[184px]",handleClick:o})]})]})})},ne=({account_id:w,type:P,copierData:t,tradingStatus:b,setCopierData:k})=>{const y=G(),C=W(),[f,a]=i.useState(!1),[s,r]=i.useState({copy_stop_loss:0,copy_take_profit:0,fixed_stop_loss:1,fixed_take_profit:1,stop_loss_refinement:1,take_profit_refinement:1}),[m,x]=i.useState("0"),[_,g]=i.useState("0"),[z,j]=i.useState("0"),[v,h]=i.useState("0");i.useEffect(()=>{var o,d,n,F,U,c,u,l,S,T,B,A,$,E;t.follow_tp_st&&(r({copy_stop_loss:((o=t.follow_tp_st)==null?void 0:o.stop_loss)===!0?0:1,copy_take_profit:((d=t.follow_tp_st)==null?void 0:d.take_profit)===!0?0:1,fixed_stop_loss:((n=t.follow_tp_st)==null?void 0:n.fixed_stop_loss)===!0?0:1,fixed_take_profit:((F=t.follow_tp_st)==null?void 0:F.fixed_take_profit)===!0?0:1,stop_loss_refinement:((U=t.follow_tp_st)==null?void 0:U.stop_loss_refinement)===!0?0:1,take_profit_refinement:((c=t.follow_tp_st)==null?void 0:c.take_profit_refinement)===!0?0:1}),x((u=t.follow_tp_st)!=null&&u.fixed_stop_loss_size?(l=t.follow_tp_st)==null?void 0:l.fixed_stop_loss_size:"0"),g((S=t.follow_tp_st)!=null&&S.fixed_take_profit_size?(T=t.follow_tp_st)==null?void 0:T.fixed_take_profit_size:"0"),j((B=t.follow_tp_st)!=null&&B.stop_loss_refinement_size?(A=t.follow_tp_st)==null?void 0:A.stop_loss_refinement_size:"0"),h(($=t.follow_tp_st)!=null&&$.take_profit_refinement_size?(E=t.follow_tp_st)==null?void 0:E.take_profit_refinement_size:"0"))},[]);const p=(o,d)=>{const n=parseInt(d);if(isNaN(n)){Y.warning("Invalid value for parsing");return}r(F=>({...F,[o]:n}))},N=o=>{let n=o.target.value.replace(/[^0-9]/g,"");x(n===""?"0":n)},V=o=>{let n=o.target.value.replace(/[^0-9]/g,"");g(n===""?"0":n)},M=o=>{const d=o.target.value;let n;d.startsWith("-")?n="-"+d.replace(/[^0-9]/g,""):n=d.replace(/[^0-9]/g,""),j(n===""?"0":n)},L=o=>{const d=o.target.value;let n;d.startsWith("-")?n="-"+d.replace(/[^0-9]/g,""):n=d.replace(/[^0-9]/g,""),n===""?j("0"):h(n)},I=async()=>{const o={accountId:w,accountType:P,takeProfit:s.copy_take_profit,stopLoss:s.copy_stop_loss,fixedStopLoss:s.fixed_stop_loss,fixedTakeProfit:s.fixed_take_profit,fixedStopLossSize:s.copy_stop_loss===0?m:0,fixedTakeProfitSize:s.copy_take_profit===0?_:0,stopLossRefinement:s.stop_loss_refinement,takeProfitRefinement:s.take_profit_refinement,stopLossRefinementSize:s.stop_loss_refinement===0?z:"0",takeProfitRefinementSize:s.take_profit_refinement===0?v:"0"};a(!0),await C(se(o)).then(d=>{Y.success("Updated successfully!"),k(d),a(!1)}).catch(()=>{a(!1)})},R=()=>{y("/dashboard/copiers")};return e.jsx(e.Fragment,{children:f?e.jsx(Q,{}):e.jsxs("div",{children:[e.jsx("div",{className:"px-4 my-12 w-full flex flex-col gap-8",children:e.jsxs("div",{className:"w-full grid lg:grid-cols-2 gap-x-6 gap-y-10",children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Copy Stop Loss"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{className:"text-whtie",onChange:o=>p("copy_stop_loss",o.target.value),value:s.copy_stop_loss,children:[e.jsx("option",{value:0,children:"Yes"}),e.jsx("option",{value:1,children:"No"})]})})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Copy Take Profit"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{className:"text-whtie",onChange:o=>p("copy_take_profit",o.target.value),value:s.copy_take_profit,children:[e.jsx("option",{value:0,children:"Yes"}),e.jsx("option",{value:1,children:"No"})]})})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Fixed Stop Loss"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{disabled:s.copy_stop_loss===1,className:"text-whtie",onChange:o=>p("fixed_stop_loss",o.target.value),value:s.fixed_stop_loss,children:[e.jsx("option",{value:0,children:"Yes"}),e.jsx("option",{value:1,children:"No"})]})})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Fixed Stop Loss Size (pips)"}),e.jsx("input",{disabled:s.fixed_stop_loss===1,className:`select-none px-2 w-full h-12 rounded-[10px] bg-transparent border-[2px] border-[#ffffff10] outline-none ${s.fixed_stop_loss===1||s.copy_stop_loss===1?"text-textdisablecolor":"text-white"}`,value:m,onChange:N})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Fixed Take Profit"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{disabled:s.copy_take_profit===1,className:"text-white",onChange:o=>p("fixed_take_profit",o.target.value),value:s.fixed_take_profit,children:[e.jsx("option",{value:0,children:"Yes"}),e.jsx("option",{value:1,children:"No"})]})})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Fixed Take Profit Size (pips)"}),e.jsx("input",{disabled:s.fixed_take_profit===1,className:`select-none px-2 w-full h-12 rounded-[10px] bg-transparent border-[2px] border-[#ffffff10] outline-none ${s.fixed_take_profit===1||s.copy_take_profit===1?"text-textdisablecolor":"text-white"}`,value:_,onChange:V})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Stop Loss Refinement"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{disabled:s.copy_stop_loss===1,className:"text-whtie",onChange:o=>p("stop_loss_refinement",o.target.value),value:s.stop_loss_refinement,children:[e.jsx("option",{value:0,children:"Yes"}),e.jsx("option",{value:1,children:"No"})]})})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Stop Loss Refinement Size (pips)"}),e.jsx("input",{disabled:s.stop_loss_refinement===1,className:`select-none px-2 w-full h-12 rounded-[10px] bg-transparent border-[2px] border-[#ffffff10] outline-none ${s.copy_stop_loss===1||s.stop_loss_refinement===1?"text-textdisablecolor":"text-white"}`,value:z,onChange:M})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Take Profit Refinement"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{disabled:s.copy_take_profit===1,className:"text-whtie",onChange:o=>p("take_profit_refinement",o.target.value),value:s.take_profit_refinement,children:[e.jsx("option",{value:0,children:"Yes"}),e.jsx("option",{value:1,children:"No"})]})})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Take Profit Refinement Size (pips)"}),e.jsx("input",{disabled:s.take_profit_refinement===1,className:`select-none px-2 w-full h-12 rounded-[10px] bg-transparent border-[2px] border-[#ffffff10] outline-none ${s.copy_take_profit===1||s.take_profit_refinement===1?"text-textdisablecolor":"text-white"}`,value:v,onChange:L})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("label",{className:"text-color5",children:"Trading Status"}),e.jsx("div",{className:"input-styled-select",children:e.jsxs("select",{className:"text-white",value:b,disabled:!0,children:[e.jsx("option",{value:"Connected",children:"Connected"}),e.jsx("option",{value:"Stopped",children:"Stopped"}),e.jsx("option",{value:"Running",children:"Running"})]})})]})]})}),e.jsxs("div",{className:"px-6 w-full flex flex-col md:flex-row items-center justify-end gap-4",children:[e.jsx(O,{text:"GO BACK",className:"h-[56px] w-full md:w-[184px]",handleClick:R}),e.jsx(K,{text:"UPDATE",className:"h-[56px] w-full md:w-[184px]",handleClick:I})]})]})})},ce=({account_id:w,type:P,profitShare:t,copierProfitShareMethod:b,setCopierData:k})=>{const y=G(),C=W(),[f,a]=i.useState("per_hour"),[s,r]=i.useState("yes");i.useEffect(()=>{b&&a(b)},[]);const m=()=>{y("/dashboard/copiers")},x=async()=>{await C(le({account_id:w,type:P,profit_share_method:f,follow_profit_share_change:s})).then(_=>{k(_),Y.success("Updated Successfully!")})};return e.jsx(e.Fragment,{children:e.jsxs("div",{className:"px-4 my-12 w-full flex flex-col gap-8",children:[e.jsxs("div",{className:"w-full grid md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx("label",{className:"text-white",children:"Profit Share"}),e.jsx("div",{className:"input-styled-select",children:e.jsx("select",{value:f,onChange:_=>a(_.target.value),className:"h-12 w-40 bg-transparent text-white border-2 border-color4 rounded-lg",children:e.jsx("option",{value:"per_hour",children:"Hourly"})})})]}),e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx("label",{className:"text-white",children:"Amount ($)"}),e.jsx("input",{value:t==null?void 0:t.per_hour,className:"px-2 h-12 w-full bg-transparent text-white border-2 border-color4 rounded-lg",disabled:!0})]})]}),e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx("p",{className:"text-white",children:"Risk Setting For Profit Sharing"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-5 h-5 flex items-center justify-center rounded-full border border-color4",children:e.jsx("div",{className:`w-3 h-3 rounded-full hover:bg-color1 ${s==="yes"&&"bg-color1"} cursor-pointer`,onClick:()=>r("yes")})}),e.jsx("p",{className:"text-sm text-white",children:"Agree to continue to follow the price even if the master changes it."})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-5 h-5 flex items-center justify-center rounded-full border border-color4",children:e.jsx("div",{className:`w-3 h-3 rounded-full hover:bg-color1 ${s==="no"&&"bg-color1"} cursor-pointer`,onClick:()=>r("no")})}),e.jsx("p",{className:"text-sm text-white",children:"Stop following when the master changes the price."})]})]}),e.jsxs("div",{className:"px-6 w-full flex flex-col md:flex-row items-center justify-end gap-4",children:[e.jsx(O,{text:"GO BACK",className:"h-[56px] w-full md:w-[184px]",handleClick:m}),e.jsx(K,{text:"UPDATE",className:"h-[56px] w-full md:w-[184px]",handleClick:x})]})]})})},he=()=>{const[w,P]=X(),t=W(),[b,k]=i.useState(""),[y,C]=i.useState(""),[f,a]=i.useState(0),[s,r]=i.useState(""),[m,x]=i.useState({account_id:"",type:"",follow_tp_st:{},risk_type:"",risk_setting:"",force_min_max:{},trade_setting:{},my_master_name:"",account_name:"",profit_share_method:""}),[_,g]=i.useState({}),[z,j]=i.useState(!1),v=h=>{a(h)};return i.useEffect(()=>{const h=w.get("account_id");h&&k(h);const p=w.get("type");p&&C(p);const N=w.get("status");N&&r(N),(async()=>{j(!0);const L=Z({accountId:h||"",accountType:p||""});await t(oe({encrypted:L})).then(I=>{const R=D(I.encrypted);x(R.data),g(R.profit_share),j(!1)}).catch(()=>{j(!1)})})()},[]),e.jsx(e.Fragment,{children:e.jsxs("div",{className:"w-full flex flex-col items-center gap-10",children:[e.jsx("div",{className:"w-full mt-10",children:e.jsx(ee,{title:"Copier Setting"})}),e.jsxs("div",{className:"relative w-full flex justify-center border-2 border-color4 rounded-xl",children:[e.jsx("img",{src:"/icons/top-left.webp",alt:"Top left icon",title:"This is general icon",className:"absolute top-4 left-4"}),e.jsx("img",{src:"/icons/top-right.webp",alt:"Top right icon",title:"This is general icon",className:"absolute top-4 right-4"}),e.jsx("img",{src:"/icons/bottom-left.webp",alt:"Bottom left icon",title:"This is general icon",className:"absolute bottom-4 left-4"}),e.jsx("img",{src:"/icons/bottom-right.webp",alt:"Bottom right icon",title:"This is general icon",className:"absolute bottom-4 right-4"}),z?e.jsx(ie,{}):e.jsxs("div",{className:"py-16 w-full",children:[e.jsx("div",{className:"copier-accounts-box mx-auto flex flex-col gap-6 items-end lg:flex-row lg:justify-between lg:items-center",children:e.jsx("div",{className:"p-2 customized-scrollbar-x w-full overflow-auto",children:e.jsxs("div",{className:"mx-auto lg:mx-0 w-[450px] flex gap-6",children:[e.jsx("div",{className:`h-[28px] text-base cursor-pointer hover:border-b hover:border-b-color2 ${f===0?"text-white font-bold border-b border-b-color2":"text-color5"}`,onClick:()=>v(0),children:"Profit Sharing"}),e.jsx("div",{className:`h-[28px] text-base cursor-pointer hover:border-b hover:border-b-color2 ${f===1?"text-white font-bold border-b border-b-color2":"text-color5"}`,onClick:()=>v(1),children:"Risk Settings"}),e.jsx("div",{className:`inline-block h-[28px] text-base cursor-pointer hover:border-b hover:border-b-color2 ${f===2?"text-white font-bold border-b border-b-color2":"text-color5"}`,onClick:()=>v(2),children:"Position Settings"})]})})}),e.jsxs("div",{className:"copier-accounts-box mx-auto",children:[f===0&&e.jsx(ce,{account_id:b,type:y,profitShare:_,copierProfitShareMethod:m.profit_share_method,setCopierData:x}),f===1&&e.jsx(ae,{account_id:b,type:y,copierData:m,setCopierData:x}),f===2&&e.jsx(ne,{account_id:b,type:y,copierData:m,tradingStatus:s,setCopierData:x})]})]})]})]})})};export{he as default};
