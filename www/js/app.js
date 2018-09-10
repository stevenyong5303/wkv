var $$ = Dom7;

var app  = new Framework7({
  root: '#app',
  id: 'com.wkv.manage',
  name: 'WKV',
  theme: 'md',
  routes: routes,
  version: "1.0.6",
  rtl: false,
  language: "en-US"
});

$(document).ready(function(){
	if(0){
		app.loginScreen.open('#lgn');
	}
});