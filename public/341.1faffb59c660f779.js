"use strict";(self.webpackChunkPaginaCorrespondencia=self.webpackChunkPaginaCorrespondencia||[]).push([[341],{341:(J,u,n)=>{n.r(u),n.d(u,{LoginModule:()=>I});var h=n(9808),m=n(1083),t=n(5e3),s=n(7093),y=n(5861),v=n(5226),g=n.n(v),i=n(3075),Z=n(4055),x=n(3322),f=n(9224),d=n(3489),C=n(7531),L=n(7423);const A=function(){return{"font-size.px":10,color:"blue"}},T=function(){return{"font-size.px":20,color:"lightblue"}},M=function(){return{"font-size.px":30,color:"orange"}};let p=(()=>{class o{constructor(e,a,l){this.loginService=e,this.router=a,this.fb=l,this.usuario={email:"",password:""},this.estadoEmail=!1,this.estadoPassword=!1,this.esAdmin=!1,this.loginForm=this.fb.group({email:["",[i.kI.required,i.kI.email,i.kI.minLength(3)]],password:["",[i.kI.required,i.kI.minLength(3)]]})}ngOnInit(){}login(){var e=this;return(0,y.Z)(function*(){const{email:a,password:l}=e.loginForm.value;try{a&&l?e.loginService.loginUsuario(a,l).subscribe(c=>{console.log(c),c?(g().fire({position:"top-end",icon:"success",title:"Se a ingresado correctamente",showConfirmButton:!1,timer:1500}),e.router.navigateByUrl("/correspondencia/mostrar")):(g().fire({icon:"error",title:"Error",text:"Las credenciales no coinciden"}),console.log("nothin"))}):g().fire({icon:"error",title:"Error",text:"Debe escribir un usuario y una contrase\xf1a"})}catch(c){console.log(c)}})()}}return o.\u0275fac=function(e){return new(e||o)(t.Y36(Z._),t.Y36(m.F0),t.Y36(i.qu))},o.\u0275cmp=t.Xpm({type:o,selectors:[["app-login"]],decls:17,vars:7,consts:[["fxLayout","row wrap","fxLayoutAlign","center center"],[2,"font-style","italic",3,"ngStyle.xs","ngStyle.sm","ngStyle.md"],[3,"formGroup","ngSubmit"],[1,"mat-elevation-z3"],["src","/assets/logo.png"],["appearance","fill","rowHeight","70px"],["type","text","matInput","","autocomplete","off","formControlName","email"],["type","password","matInput","","autocomplete","off","placeholder","Contrase\xf1a","formControlName","password"],[1,"bobi2"],["mat-raised-button","","color","primary","type","submit"]],template:function(e,a){1&e&&(t.TgZ(0,"div",0),t.TgZ(1,"div",1),t.TgZ(2,"form",2),t.NdJ("ngSubmit",function(){return a.login()}),t.TgZ(3,"mat-card",3),t.TgZ(4,"mat-card-header"),t._UZ(5,"img",4),t.qZA(),t.TgZ(6,"mat-form-field",5),t.TgZ(7,"mat-label"),t._uU(8,"Email"),t.qZA(),t._UZ(9,"input",6),t.qZA(),t.TgZ(10,"mat-form-field",5),t.TgZ(11,"mat-label"),t._uU(12,"Contrase\xf1a"),t.qZA(),t._UZ(13,"input",7),t.qZA(),t.TgZ(14,"div",8),t.TgZ(15,"button",9),t._uU(16,"Login"),t.qZA(),t.qZA(),t.qZA(),t.qZA(),t.qZA(),t.qZA()),2&e&&(t.xp6(1),t.Q6J("ngStyle.xs",t.DdM(4,A))("ngStyle.sm",t.DdM(5,T))("ngStyle.md",t.DdM(6,M)),t.xp6(1),t.Q6J("formGroup",a.loginForm))},directives:[s.xw,s.Wh,x.Zl,i._Y,i.JL,i.sg,f.a8,f.dk,d.KE,d.hX,C.Nt,i.Fj,i.JJ,i.u,L.lW],styles:[".bobi[_ngcontent-%COMP%]{display:flex;justify-content:center;height:100%;align-items:center;background-color:#f5f5f5}.margin[_ngcontent-%COMP%]{padding:40px}.bobi2[_ngcontent-%COMP%]{display:flex;justify-content:center;height:100%;align-items:center}"]}),o})();const b=[{path:"",component:(()=>{class o{constructor(){}ngOnInit(){}}return o.\u0275fac=function(e){return new(e||o)},o.\u0275cmp=t.Xpm({type:o,selectors:[["app-home"]],decls:2,vars:0,consts:[["fxLayout","row","fxLayoutAlign","center stretch",1,"margin"]],template:function(e,a){1&e&&(t.TgZ(0,"div",0),t._UZ(1,"app-login"),t.qZA())},directives:[s.xw,s.Wh,p],styles:[".bobi[_ngcontent-%COMP%]{display:flex;justify-content:center;height:100%;align-items:center;background-color:#f5f5f5}.margin[_ngcontent-%COMP%]{padding:270px}.bobi2[_ngcontent-%COMP%]{display:flex;justify-content:center;height:100%;align-items:center}"]}),o})(),children:[{path:"login",component:p},{path:"**",redirectTo:"login"}]}];let S=(()=>{class o{}return o.\u0275fac=function(e){return new(e||o)},o.\u0275mod=t.oAB({type:o}),o.\u0275inj=t.cJS({imports:[[m.Bz.forChild(b)],m.Bz]}),o})();var F=n(7061),U=n(520);let I=(()=>{class o{}return o.\u0275fac=function(e){return new(e||o)},o.\u0275mod=t.oAB({type:o}),o.\u0275inj=t.cJS({imports:[[h.ez,S,F.q,i.u5,i.UX,U.JF]]}),o})()}}]);