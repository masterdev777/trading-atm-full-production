import{q as n,A as r,k as c,t as i,v as p,w as l,x as m,y as g}from"./index-C3s5vc-C.js";const h=(a,s,o)=>e=>new Promise((t,d)=>{n.post("/dashboard/delete-account",{type:a,acc_id:s,acc_role:o}).then(u=>{u.status===200&&t()}).catch(u=>{u.response.status===401?(localStorage.removeItem("tradingATMUserToken"),e({type:r.AUTH_USER,payload:{logined:!1}})):i.error("Delete account failed!"),d()})}),y=a=>s=>new Promise((o,e)=>{n.post("/dashboard/get-master-level-by-accountid",a).then(t=>{t.status===200&&o(t.data)}).catch(t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),T=a=>new Promise((s,o)=>{p.post("/auth/jwt/token",a).then(e=>{e.status===201&&s(e.data)},()=>{o()})}),U=a=>new Promise((s,o)=>{p.get("/auth/jwt/all-accounts",{headers:{accept:"application/json",Authorization:`Bearer ${a}`}}).then(e=>{e.status===200&&s(e.data.accounts)},()=>{o()})}),A=a=>new Promise((s,o)=>{l.post("/auth/jwt/token",a).then(e=>{e.status===201&&s(e.data)},()=>{o()})}),S=a=>new Promise((s,o)=>{l.get("/auth/jwt/all-accounts",{headers:{accept:"application/json",Authorization:`Bearer ${a}`}}).then(e=>{e.status===200&&s(e.data.accounts)},()=>{o()})}),w=a=>s=>new Promise((o,e)=>{n.post("/dashboard/add-master-account",a).then(t=>{const d=c(t.data.encrypted);t.status===200&&s({type:r.AUTH_USER,payload:{user:d.user,accounts:d.accounts}}),o({status:t.status,data:d})}).catch(t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),M=a=>s=>new Promise((o,e)=>{n.post("/dashboard/add-copier-account",a).then(t=>{const d=c(t.data.encrypted);t.status===200&&s({type:r.AUTH_USER,payload:{user:d.user,accounts:d.accounts}}),o({status:t.status,data:d})}).catch(t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),k=a=>new Promise((s,o)=>{m.get("/Search",{params:{company:a}}).then(e=>{e.status===200?s(e.data):(i.warning("The specified company name could not be found. Please confirm that the company name is correct!"),o())}).catch(()=>{i.warning("The specified company name could not be found. Please confirm that the company name is correct!"),o()})}),v=a=>new Promise((s,o)=>{m.get("/Connect",{params:{user:a.user,password:a.password,host:a.host,port:a.port}}).then(e=>{s(e)}).catch(()=>{o()})}),P=a=>new Promise((s,o)=>{g.get("/Search",{params:{company:a}}).then(e=>{e.status===200?s(e.data):i.warning("The specified company name could not be found. Please confirm that the company name is correct!"),o()}).catch(()=>{i.warning("The specified company name could not be found. Please confirm that the company name is correct!"),o()})}),H=a=>new Promise((s,o)=>{g.get("/Connect",{params:{user:a.user,password:a.password,host:a.host,port:a.port}}).then(e=>{s(e)}).catch(()=>{o()})}),b=a=>s=>new Promise((o,e)=>{n.post("/dashboard/add-metatrader-master-account",a).then(t=>{const d=c(t.data.encrypted);t.status===200&&s({type:r.AUTH_USER,payload:{user:d.user,accounts:d.accounts}}),o({status:t.status,data:d})}).catch(t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),I=a=>s=>new Promise((o,e)=>{n.post("/dashboard/add-metatrader-copier-account",a).then(t=>{const d=c(t.data.encrypted);t.status===200&&s({type:r.AUTH_USER,payload:{user:d.user,accounts:d.accounts}}),o({status:t.status,data:d})}).catch(t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),R=a=>s=>new Promise((o,e)=>{n.post("/dashboard/get-masters-list",a).then(t=>{t.status===200&&o(t.data)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),E=a=>s=>new Promise((o,e)=>{n.post("/dashboard/upgrade-master-plan",a).then(t=>{if(t.status===200)o();else if(t.status===201||t.status===202){const d=c(t.data.encrypted);i.warning(d),e()}},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),_=a=>s=>new Promise((o,e)=>{n.post("/dashboard/get-master-by-accountid",a).then(t=>{if(t.status===200){const d=c(t.data.encrypted);o(d)}},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),C=a=>s=>new Promise((o,e)=>{n.post("/dashboard/upload-avatar",a).then(t=>{t.status===200&&o(t.data)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),D=a=>s=>new Promise((o,e)=>{n.post("/dashboard/delete-avatar",a).then(t=>{t.status===200&&o(t.data)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),x=a=>s=>new Promise((o,e)=>{n.post("/dashboard/update-master-description",a).then(t=>{if(t.status===200)o();else if(t.status===201){const d=c(t.data.encrypted);i.warning(d),e()}},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),L=a=>s=>new Promise((o,e)=>{n.post("/dashboard/get-follow-copiers-list",a).then(t=>{t.status===200&&o(t.data)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),B=a=>s=>new Promise((o,e)=>{n.post("/dashboard/get-master-description",a).then(t=>{t.status===200&&o(t.data)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),F=a=>s=>new Promise((o,e)=>{n.post("/dashboard/add-follow-master-account",a).then(t=>{t.status===200&&o(c(t.data.encrypted))},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),z=a=>s=>new Promise((o,e)=>{n.post("/dashboard/remove-follow-master-account",a).then(t=>{t.status===200&&o(c(t.data.encrypted))},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),W=a=>s=>new Promise((o,e)=>{n.post("/dashboard/get-copiers-list",a).then(t=>{t.status===200&&o(t.data)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),q=a=>s=>new Promise((o,e)=>{n.post("/dashboard/start-trading",a).then(t=>{(t.status===200||t.status===201)&&o(t.status)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),N=a=>s=>new Promise((o,e)=>{n.post("/dashboard/stop-trading",a).then(t=>{t.status===200&&o()},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),$=a=>s=>new Promise((o,e)=>{n.post("/dashboard/disconnect-master",a).then(t=>{t.status===200&&o()},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),G=a=>s=>new Promise((o,e)=>{n.post("/dashboard/add-my-master",a).then(t=>{if(t.status===200)o(t.data);else if(t.status===201){const d=c(t.data.encrypted);i.warning(d.message),e()}},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),J=a=>s=>new Promise((o,e)=>{n.post("/dashboard/get-copier-by-accountid",a).then(t=>{t.status===200&&o(t.data)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),K=a=>s=>new Promise((o,e)=>{n.post("/dashboard/update-profit-share-method",a).then(t=>{t.status===200?o(t.data):t.status===201&&(i.warning(t.data),e())},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),O=a=>s=>new Promise((o,e)=>{n.post("/dashboard/update-copier-risk-settings",a).then(t=>{t.status===200?o(t.data):t.status===201&&(i.warning(t.data),e())},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),Q=a=>s=>new Promise((o,e)=>{n.post("/dashboard/update-copier-position-settings",a).then(t=>{t.status===200?o(t.data):t.status===201&&(i.warning(t.data),e())},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),V=a=>s=>new Promise((o,e)=>{n.post("/dashboard/get-transaction-history",a).then(t=>{t.status===200&&o(t.data)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),X=a=>s=>new Promise((o,e)=>{n.post("/dashboard/get-trading-history",a).then(t=>{t.status===200&&o(t.data)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})}),Y=a=>s=>new Promise((o,e)=>{n.post("/dashboard/get-copier-trading-history",a).then(t=>{t.status===200&&o(t.data)},t=>{t.response.status===401&&(localStorage.removeItem("tradingATMUserToken"),s({type:r.AUTH_USER,payload:{logined:!1}})),e()})});export{A,S as B,k as C,v as D,b as E,I as F,P as G,H,V as I,X as J,N as a,$ as b,R as c,h as d,G as e,Q as f,W as g,K as h,J as i,Y as j,F as k,C as l,D as m,L as n,B as o,x as p,_ as q,z as r,q as s,y as t,O as u,E as v,T as w,U as x,w as y,M as z};
