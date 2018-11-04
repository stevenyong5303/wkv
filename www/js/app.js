var $$ = Dom7;
var sys = new Object();
var STORAGE = window.localStorage;
var app = new Framework7({
				  root: '#app',
				  id: 'com.wkv.manage',
				  name: 'WKV',
				  theme: 'md',
				  routes: routes,
				  version: "1.0.11",
				  rtl: false,
				  language: "en-US"
			  });


$(document).ready(function(){
	var usr = STORAGE.getItem('usr'),
		pwd = STORAGE.getItem('pwd');
	
	var DATA = {
			'usr' : usr,
			'pwd' : pwd
		};
	var post_data = "ACT=" + encodeURIComponent('ssn_chk')
				  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
	
	$.ajax({
		type: 'POST',
		url: 'http://app.wkvmusicstore.com/',
		data: post_data,
		success: function(str){
			setTimeout(function(){
				sys.loading(0);
				if(str!=='200 OK'){
					app.loginScreen.open('#lgn');
				}
			}, 2500);
		}
	});
	
	
	$('#lgn #lgn_sgn').on('click', function(){
		usr = $('#lgn input[name="lgn_usr"]').val();
		pwd = $('#lgn input[name="lgn_pwd"]').val();
		
		if(!sys.isEmpty(usr) && !sys.isEmpty(pwd)){
			DATA = {
				'usr' : usr,
				'pwd' : pwd
			};
			post_data = "ACT=" + encodeURIComponent('lgn_chk')
					  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					  
			$.ajax({
				type: 'POST',
				url: 'http://app.wkvmusicstore.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					setTimeout(function(){
						sys.loading(0);
						if(str==='200 OK'){
							STORAGE.setItem('usr', usr);
							STORAGE.setItem('pwd', pwd);
							
							app.loginScreen.close('#lgn');
						}
						$('#lgn input[name="lgn_usr"]').val('');
						$('#lgn input[name="lgn_pwd"]').val('');
					}, 2000);
				}
			});
		}
	});
});

sys = {
	'loading' : function(show){
		if(show===1){
			$('#loading-overlay').css('z-index', '100');
			$('#app').css('z-index', '-100');
			$('#loading-overlay').css('opacity', '1');
			$('#app').css('opacity', '0');
		}else{
			$('#loading-overlay').css('z-index', '-100');
			$('#app').css('z-index', '100');
			$('#loading-overlay').css('opacity', '0');
			$('#app').css('opacity', '1');
		}
	},
	'isEmpty' : function(myVar){
		if(myVar === ''){
			return true;
		}else if(myVar === null){
			return true;
		}else if(myVar === undefined){
			return true;
		}else if(myVar == ''){
			return true;
		}
		return false;
	},
	'serialize' : function(mixed_value){
		var val, key, okey, ktype = '', vals = '', count = 0,
			_utf8Size = function(str){
				var size = 0, i = 0, l = str.length, code = '';
				
				for(i = 0; i < l; i++){
					code = str.charCodeAt(i);
					if(code < 0x0080){
						size += 1;
					}else if(code < 0x0800) {
						size += 2;
					}else{
						size += 3;
					}
				}
				return size;
			},
			_getType = function(inp){
				var match, key, cons, types, type = typeof inp;

				if(type === 'object' && !inp){
					return 'null';
				}

				if(type === 'object'){
					if(!inp.constructor){
						return 'object';
					}
					
					cons = inp.constructor.toString();
					match = cons.match(/(\w+)\(/);
					
					if(match){
						cons = match[1].toLowerCase();
					}
					types = ['boolean', 'number', 'string', 'array'];
					for(key in types){
						if(cons === types[key]){
							type = types[key];
							break;
						}
					}
				}
				return type;
			},
			type = _getType(mixed_value);

		switch(type){
			case 'function':
				val = '';
				break;
			case 'boolean':
				val = 'b:' + (mixed_value ? '1' : '0');
				break;
			case 'number':
				val = (Math.round(mixed_value) === mixed_value ? 'i' : 'd') + ':' + mixed_value;
				break;
			case 'string':
				val = 's:' + _utf8Size(mixed_value) + ':"' + mixed_value + '"';
				break;
			case 'array':
			case 'object':
				val = 'a';
				for(key in mixed_value){
					if(mixed_value.hasOwnProperty(key)){
						ktype = _getType(mixed_value[key]);
						if (ktype === 'function'){
							continue;
						}
						okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
						vals += this.serialize(okey) + this.serialize(mixed_value[key]);
						count++;
					}
				}
				val += ':' + count + ':{' + vals + '}';
				break;
			case 'undefined':
			default:
				val = 'N';
				break;
		}
		
		if(type !== 'object' && type !== 'array'){
			val += ';';
		}
		return val;
	}
}