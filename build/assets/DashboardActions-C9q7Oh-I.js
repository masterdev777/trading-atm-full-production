import{n as d,A as n,t as u,o as p,p as g,q as m,v as f}from"./index-C5dHWHVl.js";const y=(a,o,r)=>t=>new Promise((e,s)=>{d.post("/dashboard/delete-account",{type:a,acc_id:o,acc_role:r}).then(c=>{c.status===200&&e()}).catch(c=>{c.response.status===401?(localStorage.removeItem("tradingATMUserToken"),t({type:n.AUTH_USER,payload:{logined:!1}})):u.error("Server Error"),s()})}),T=a=>o=>new Promise((r,t)=>{d.post("/dashboard/get-master-level-by-accountid",a).then(e=>{e.status===200&&r(e.data)}).catch(e=>{e.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})),t()})}),U=a=>new Promise((o,r)=>{p.post("/auth/jwt/token",a).then(t=>{t.status===201&&o(t.data)},()=>{r()})}),A=a=>new Promise((o,r)=>{p.get("/auth/jwt/all-accounts",{headers:{accept:"application/json",Authorization:`Bearer ${a}`}}).then(t=>{t.status===200&&o(t.data.accounts)},()=>{r()})}),S=a=>new Promise((o,r)=>{g.post("/auth/jwt/token",a).then(t=>{t.status===201&&o(t.data)},()=>{r()})}),w=a=>new Promise((o,r)=>{g.get("/auth/jwt/all-accounts",{headers:{accept:"application/json",Authorization:`Bearer ${a}`}}).then(t=>{t.status===200&&o(t.data.accounts)},()=>{r()})}),v=a=>o=>new Promise((r,t)=>{d.post("/dashboard/add-master-account",a).then(e=>{r(e)}).catch(e=>{e.response.status===401?(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})):u.error("Server Error"),t()})}),M=a=>o=>new Promise((r,t)=>{d.post("/dashboard/add-copier-account",a).then(e=>{r(e)}).catch(e=>{e.response.status===401?(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})):u.error("Server Error"),t()})}),k=a=>new Promise((o,r)=>{m.get("/Search",{params:{company:a}}).then(t=>{o(t)}).catch(()=>{u.error("The specified company name could not be found. Please confirm that the company name is correct!"),r()})}),_=a=>new Promise((o,r)=>{m.get("/Connect",{params:{user:a.user,password:a.password,host:a.host,port:a.port}}).then(t=>{o(t)}).catch(()=>{r()})}),H=a=>new Promise((o,r)=>{f.get("/Search",{params:{company:a}}).then(t=>{t.status===200?o(t.data):u.error("The specified company name could not be found. Please confirm that the company name is correct!")}).catch(()=>{u.error("The specified company name could not be found. Please confirm that the company name is correct!"),r()})}),P=a=>new Promise((o,r)=>{f.get("/Connect",{params:{user:a.user,password:a.password,host:a.host,port:a.port}}).then(t=>{o(t)}).catch(()=>{r()})}),E=a=>o=>new Promise((r,t)=>{d.post("/dashboard/add-metatrader-master-account",a).then(e=>{e.status===200&&o({type:n.AUTH_USER,payload:{user:e.data.user,accounts:e.data.accounts}}),r(e)}).catch(e=>{e.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})),t()})}),I=a=>o=>new Promise((r,t)=>{d.post("/dashboard/add-metatrader-copier-account",a).then(e=>{e.status===200&&o({type:n.AUTH_USER,payload:{user:e.data.user,accounts:e.data.accounts}}),r(e)}).catch(e=>{e.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})),t()})}),b=(a,o,r)=>t=>new Promise((e,s)=>{d.post("/dashboard/get-masters-list",{acc_type:a,current_page:o,display_count:r}).then(c=>{c.status===200&&e({accounts:c.data.accounts,totalCount:c.data.totalCount})},c=>{c.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),t({type:n.AUTH_USER,payload:{logined:!1}})),s()})}),R=a=>o=>new Promise((r,t)=>{d.post("/dashboard/upgrade-master-plan",a).then(e=>{e.status===200?r():(e.status===201||e.status===202)&&(u.warning(e.data),t())},e=>{e.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})),t()})}),C=(a,o)=>r=>new Promise((t,e)=>{d.post("/dashboard/get-master-by-accountid",{accountId:a,accountType:o}).then(s=>{s.status===200&&t(s.data)},s=>{s.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),r({type:n.AUTH_USER,payload:{logined:!1}})),e()})}),D=a=>o=>new Promise((r,t)=>{d.post("/dashboard/upload-avatar",a).then(e=>{e.status===200&&r(e.data)},e=>{e.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})),t()})}),x=a=>o=>new Promise((r,t)=>{d.post("/dashboard/delete-avatar",a).then(e=>{e.status===200&&r(e.data)},e=>{e.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})),t()})}),L=(a,o,r,t)=>e=>new Promise((s,c)=>{d.post("/dashboard/update-master-description",{accountId:a,accountType:o,description:r,profitShare:t}).then(i=>{i.status===200?s():i.status===201&&(u.warning(i.data),c())},i=>{i.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),e({type:n.AUTH_USER,payload:{logined:!1}})),c()})}),B=(a,o)=>r=>new Promise((t,e)=>{d.post("/dashboard/get-follow-copiers-list",{accountId:a,accountType:o}).then(s=>{s.status===200&&t(s.data)},s=>{s.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),r({type:n.AUTH_USER,payload:{logined:!1}})),e()})}),F=(a,o)=>r=>new Promise((t,e)=>{d.post("/dashboard/get-master-description",{accountId:a,accountType:o}).then(s=>{s.status===200&&t(s.data)},s=>{s.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),r({type:n.AUTH_USER,payload:{logined:!1}})),e()})}),z=a=>o=>new Promise((r,t)=>{d.post("/dashboard/add-follow-master-account",a).then(e=>{e.status===200&&r()},e=>{e.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})),t()})}),q=a=>o=>new Promise((r,t)=>{d.post("/dashboard/remove-follow-master-account",a).then(e=>{e.status===200&&r()},e=>{e.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})),t()})}),N=a=>o=>new Promise((r,t)=>{d.post("/dashboard/get-copiers-list",{user_id:a}).then(e=>{e.status===200&&r(e.data)},e=>{e.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})),t()})}),W=(a,o,r,t)=>e=>new Promise((s,c)=>{d.post("/dashboard/start-trading",{copier_acc_id:a,copier_acc_type:o,master_acc_id:r,my_master_type:t}).then(i=>{(i.status===200||i.status===201)&&s(i.status)},i=>{i.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),e({type:n.AUTH_USER,payload:{logined:!1}})),c()})}),$=(a,o,r,t)=>e=>new Promise((s,c)=>{d.post("/dashboard/stop-trading",{copier_acc_id:a,copier_acc_type:o,master_acc_id:r,my_master_type:t}).then(i=>{i.status===200&&s()},i=>{i.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),e({type:n.AUTH_USER,payload:{logined:!1}})),c()})}),G=(a,o,r,t)=>e=>new Promise((s,c)=>{d.post("/dashboard/disconnect-master",{copier_acc_id:a,copier_acc_type:o,master_acc_id:r,my_master_type:t}).then(i=>{i.status===200&&s()},i=>{i.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),e({type:n.AUTH_USER,payload:{logined:!1}})),c()})}),J=(a,o,r,t,e)=>s=>new Promise((c,i)=>{d.post("/dashboard/add-my-master",{copier_acc_id:a,copier_type:o,master_acc_id:r,master_type:t,action_type:e}).then(l=>{l.status===200?c(l.data):l.status===201&&(u.warning(l.data),i())},l=>{l.response.status===401?(localStorage.removeItem("tradingATMUserToken"),s({type:n.AUTH_USER,payload:{logined:!1}})):u.error("Server Error!"),i()})}),j=(a,o)=>r=>new Promise((t,e)=>{d.post("/dashboard/get-copier-by-accountid",{accountId:a,accountType:o}).then(s=>{s.status===200?t(s.data):s.status===201&&(u.warning(s.data),e())},s=>{s.response.status===401?(localStorage.removeItem("tradingATMUserToken"),r({type:n.AUTH_USER,payload:{logined:!1}})):u.error("Server Error!"),e()})}),K=a=>o=>new Promise((r,t)=>{d.post("/dashboard/update-profit-share-method",a).then(e=>{e.status===200?r(e.data):e.status===201&&(u.warning(e.data),t())},e=>{e.response.status===401?(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})):u.error("Server Error!"),t()})}),O=a=>o=>new Promise((r,t)=>{d.post("/dashboard/update-copier-risk-settings",a).then(e=>{e.status===200?r(e.data):e.status===201&&(u.warning(e.data),t())},e=>{e.response.status===401?(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})):u.error("Server Error!"),t()})}),Q=a=>o=>new Promise((r,t)=>{d.post("/dashboard/update-copier-position-settings",a).then(e=>{e.status===200?r(e.data):e.status===201&&(u.warning(e.data),t())},e=>{e.response.status===401?(localStorage.removeItem("tradingATMUserToken"),o({type:n.AUTH_USER,payload:{logined:!1}})):u.error("Server Error!"),t()})}),V=(a,o)=>r=>new Promise((t,e)=>{d.post("/dashboard/get-transaction-history",{current_page:a,display_count:o}).then(s=>{s.status===200&&t({transactionHistory:s.data.transactionHistory,transactionCount:s.data.transactionCount})},s=>{s.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),r({type:n.AUTH_USER,payload:{logined:!1}})),e()})}),X=(a,o)=>r=>new Promise((t,e)=>{d.post("/dashboard/get-trading-history",{current_page:a,display_count:o}).then(s=>{s.status===200&&t({tradingHistory:s.data.tradingHistory,tradingCount:s.data.tradingCount})},s=>{s.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),r({type:n.AUTH_USER,payload:{logined:!1}})),e()})}),Y=(a,o,r,t)=>e=>new Promise((s,c)=>{d.post("/dashboard/get-copier-trading-history",{current_page:a,display_count:o,copier_acc_id:r,copier_acc_type:t}).then(i=>{i.status===200&&s({tradingHistory:i.data.tradingHistory,tradingCount:i.data.tradingCount})},i=>{i.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),e({type:n.AUTH_USER,payload:{logined:!1}})),c()})});export{S as A,w as B,k as C,_ as D,E,I as F,H as G,P as H,V as I,X as J,$ as a,G as b,b as c,y as d,J as e,Q as f,N as g,K as h,j as i,Y as j,z as k,D as l,x as m,B as n,F as o,L as p,C as q,q as r,W as s,T as t,O as u,R as v,U as w,A as x,v as y,M as z};
