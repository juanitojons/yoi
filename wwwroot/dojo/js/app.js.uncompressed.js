require({cache:{
'dojo/uacss':function(){
define(["./dom-geometry", "./_base/lang", "./domReady", "./sniff", "./_base/window"],
	function(geometry, lang, domReady, has, baseWindow){

	// module:
	//		dojo/uacss

	/*=====
	return {
		// summary:
		//		Applies pre-set CSS classes to the top-level HTML node, based on:
		//
		//		- browser (ex: dj_ie)
		//		- browser version (ex: dj_ie6)
		//		- box model (ex: dj_contentBox)
		//		- text direction (ex: dijitRtl)
		//
		//		In addition, browser, browser version, and box model are
		//		combined with an RTL flag when browser text is RTL. ex: dj_ie-rtl.
		//
		//		Returns the has() method.
	};
	=====*/

	var
		html = baseWindow.doc.documentElement,
		ie = has("ie"),
		opera = has("opera"),
		maj = Math.floor,
		ff = has("ff"),
		boxModel = geometry.boxModel.replace(/-/,''),

		classes = {
			"dj_quirks": has("quirks"),

			// NOTE: Opera not supported by dijit
			"dj_opera": opera,

			"dj_khtml": has("khtml"),

			"dj_webkit": has("webkit"),
			"dj_safari": has("safari"),
			"dj_chrome": has("chrome"),

			"dj_gecko": has("mozilla"),

			"dj_ios": has("ios"),
			"dj_android": has("android")
		}; // no dojo unsupported browsers

	if(ie){
		classes["dj_ie"] = true;
		classes["dj_ie" + maj(ie)] = true;
		classes["dj_iequirks"] = has("quirks");
	}
	if(ff){
		classes["dj_ff" + maj(ff)] = true;
	}

	classes["dj_" + boxModel] = true;

	// apply browser, browser version, and box model class names
	var classStr = "";
	for(var clz in classes){
		if(classes[clz]){
			classStr += clz + " ";
		}
	}
	html.className = lang.trim(html.className + " " + classStr);

	// If RTL mode, then add dj_rtl flag plus repeat existing classes with -rtl extension.
	// We can't run the code below until the <body> tag has loaded (so we can check for dir=rtl).
	domReady(function(){
		if(!geometry.isBodyLtr()){
			var rtlClassStr = "dj_rtl dijitRtl " + classStr.replace(/ /g, "-rtl ");
			html.className = lang.trim(html.className + " " + rtlClassStr + "dj_rtl dijitRtl " + classStr.replace(/ /g, "-rtl "));
		}
	});
	return has;
});

},
'dijit/form/RangeBoundTextBox':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/i18n", // i18n.getLocalization
	"./MappedTextBox"
], function(declare, i18n, MappedTextBox){

	// module:
	//		dijit/form/RangeBoundTextBox


	var RangeBoundTextBox = declare("dijit.form.RangeBoundTextBox", MappedTextBox, {
		// summary:
		//		Base class for textbox form widgets which defines a range of valid values.

		// rangeMessage: String
		//		The message to display if value is out-of-range
		rangeMessage: "",

		/*=====
		// constraints: RangeBoundTextBox.__Constraints
		constraints: {},
		======*/

		rangeCheck: function(/*Number*/ primitive, /*dijit/form/RangeBoundTextBox.__Constraints*/ constraints){
			// summary:
			//		Overridable function used to validate the range of the numeric input value.
			// tags:
			//		protected
			return	("min" in constraints? (this.compare(primitive,constraints.min) >= 0) : true) &&
				("max" in constraints? (this.compare(primitive,constraints.max) <= 0) : true); // Boolean
		},

		isInRange: function(/*Boolean*/ /*===== isFocused =====*/){
			// summary:
			//		Tests if the value is in the min/max range specified in constraints
			// tags:
			//		protected
			return this.rangeCheck(this.get('value'), this.constraints);
		},

		_isDefinitelyOutOfRange: function(){
			// summary:
			//		Returns true if the value is out of range and will remain
			//		out of range even if the user types more characters
			var val = this.get('value');
			if(val == null){ return false; } // not yet valid enough to compare to
			var outOfRange = false;
			if("min" in this.constraints){
				var min = this.constraints.min;
				outOfRange = this.compare(val, ((typeof min == "number") && min >= 0 && val != 0) ? 0 : min) < 0;
			}
			if(!outOfRange && ("max" in this.constraints)){
				var max = this.constraints.max;
				outOfRange = this.compare(val, ((typeof max != "number") || max > 0) ? max : 0) > 0;
			}
			return outOfRange;
		},

		_isValidSubset: function(){
			// summary:
			//		Overrides `dijit/form/ValidationTextBox._isValidSubset()`.
			//		Returns true if the input is syntactically valid, and either within
			//		range or could be made in range by more typing.
			return this.inherited(arguments) && !this._isDefinitelyOutOfRange();
		},

		isValid: function(/*Boolean*/ isFocused){
			// Overrides dijit/form/ValidationTextBox.isValid() to check that the value is also in range.
			return this.inherited(arguments) &&
				((this._isEmpty(this.textbox.value) && !this.required) || this.isInRange(isFocused)); // Boolean
		},

		getErrorMessage: function(/*Boolean*/ isFocused){
			// Overrides dijit/form/ValidationTextBox.getErrorMessage() to print "out of range" message if appropriate
			var v = this.get('value');
			if(v != null /* and !undefined */ && v !== '' && (typeof v != "number" || !isNaN(v)) && !this.isInRange(isFocused)){ // don't check isInRange w/o a real value
				return this.rangeMessage; // String
			}
			return this.inherited(arguments);
		},

		postMixInProperties: function(){
			this.inherited(arguments);
			if(!this.rangeMessage){
				this.messages = i18n.getLocalization("dijit.form", "validate", this.lang);
				this.rangeMessage = this.messages.rangeMessage;
			}
		}
	});
	/*=====
	RangeBoundTextBox.__Constraints = declare(null, {
		// min: Number
		//		Minimum signed value.  Default is -Infinity
		// max: Number
		//		Maximum signed value.  Default is +Infinity
	});
	=====*/
	return RangeBoundTextBox;
});

},
'dojo/text':function(){
define(["./_base/kernel", "require", "./has", "./request"], function(dojo, require, has, request){
	// module:
	//		dojo/text

	var getText;
	if( 1 ){
		getText= function(url, sync, load){
			request(url, {sync:!!sync}).then(load);
		};
	}else{
		// Path for node.js and rhino, to load from local file system.
		// TODO: use node.js native methods rather than depending on a require.getText() method to exist.
		if(require.getText){
			getText= require.getText;
		}else{
			console.error("dojo/text plugin failed to load because loader does not support getText");
		}
	}

	var
		theCache = {},

		strip= function(text){
			//Strips <?xml ...?> declarations so that external SVG and XML
			//documents can be added to a document without worry. Also, if the string
			//is an HTML document, only the part inside the body tag is returned.
			if(text){
				text= text.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, "");
				var matches= text.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
				if(matches){
					text= matches[1];
				}
			}else{
				text = "";
			}
			return text;
		},

		notFound = {},

		pending = {};

	dojo.cache = function(/*String||Object*/module, /*String*/url, /*String||Object?*/value){
		// summary:
		//		A getter and setter for storing the string content associated with the
		//		module and url arguments.
		// description:
		//		If module is a string that contains slashes, then it is interpretted as a fully
		//		resolved path (typically a result returned by require.toUrl), and url should not be
		//		provided. This is the preferred signature. If module is a string that does not
		//		contain slashes, then url must also be provided and module and url are used to
		//		call `dojo.moduleUrl()` to generate a module URL. This signature is deprecated.
		//		If value is specified, the cache value for the moduleUrl will be set to
		//		that value. Otherwise, dojo.cache will fetch the moduleUrl and store it
		//		in its internal cache and return that cached value for the URL. To clear
		//		a cache value pass null for value. Since XMLHttpRequest (XHR) is used to fetch the
		//		the URL contents, only modules on the same domain of the page can use this capability.
		//		The build system can inline the cache values though, to allow for xdomain hosting.
		// module: String||Object
		//		If a String with slashes, a fully resolved path; if a String without slashes, the
		//		module name to use for the base part of the URL, similar to module argument
		//		to `dojo.moduleUrl`. If an Object, something that has a .toString() method that
		//		generates a valid path for the cache item. For example, a dojo._Url object.
		// url: String
		//		The rest of the path to append to the path derived from the module argument. If
		//		module is an object, then this second argument should be the "value" argument instead.
		// value: String||Object?
		//		If a String, the value to use in the cache for the module/url combination.
		//		If an Object, it can have two properties: value and sanitize. The value property
		//		should be the value to use in the cache, and sanitize can be set to true or false,
		//		to indicate if XML declarations should be removed from the value and if the HTML
		//		inside a body tag in the value should be extracted as the real value. The value argument
		//		or the value property on the value argument are usually only used by the build system
		//		as it inlines cache content.
		// example:
		//		To ask dojo.cache to fetch content and store it in the cache (the dojo["cache"] style
		//		of call is used to avoid an issue with the build system erroneously trying to intern
		//		this example. To get the build system to intern your dojo.cache calls, use the
		//		"dojo.cache" style of call):
		//		| //If template.html contains "<h1>Hello</h1>" that will be
		//		| //the value for the text variable.
		//		| var text = dojo["cache"]("my.module", "template.html");
		// example:
		//		To ask dojo.cache to fetch content and store it in the cache, and sanitize the input
		//		 (the dojo["cache"] style of call is used to avoid an issue with the build system
		//		erroneously trying to intern this example. To get the build system to intern your
		//		dojo.cache calls, use the "dojo.cache" style of call):
		//		| //If template.html contains "<html><body><h1>Hello</h1></body></html>", the
		//		| //text variable will contain just "<h1>Hello</h1>".
		//		| var text = dojo["cache"]("my.module", "template.html", {sanitize: true});
		// example:
		//		Same example as previous, but demonstrates how an object can be passed in as
		//		the first argument, then the value argument can then be the second argument.
		//		| //If template.html contains "<html><body><h1>Hello</h1></body></html>", the
		//		| //text variable will contain just "<h1>Hello</h1>".
		//		| var text = dojo["cache"](new dojo._Url("my/module/template.html"), {sanitize: true});

		//	 * (string string [value]) => (module, url, value)
		//	 * (object [value])        => (module, value), url defaults to ""
		//
		//	 * if module is an object, then it must be convertable to a string
		//	 * (module, url) module + (url ? ("/" + url) : "") must be a legal argument to require.toUrl
		//	 * value may be a string or an object; if an object then may have the properties "value" and/or "sanitize"
		var key;
		if(typeof module=="string"){
			if(/\//.test(module)){
				// module is a version 1.7+ resolved path
				key = module;
				value = url;
			}else{
				// module is a version 1.6- argument to dojo.moduleUrl
				key = require.toUrl(module.replace(/\./g, "/") + (url ? ("/" + url) : ""));
			}
		}else{
			key = module + "";
			value = url;
		}
		var
			val = (value != undefined && typeof value != "string") ? value.value : value,
			sanitize = value && value.sanitize;

		if(typeof val == "string"){
			//We have a string, set cache value
			theCache[key] = val;
			return sanitize ? strip(val) : val;
		}else if(val === null){
			//Remove cached value
			delete theCache[key];
			return null;
		}else{
			//Allow cache values to be empty strings. If key property does
			//not exist, fetch it.
			if(!(key in theCache)){
				getText(key, true, function(text){
					theCache[key]= text;
				});
			}
			return sanitize ? strip(theCache[key]) : theCache[key];
		}
	};

	return {
		// summary:
		//		This module implements the dojo/text! plugin and the dojo.cache API.
		// description:
		//		We choose to include our own plugin to leverage functionality already contained in dojo
		//		and thereby reduce the size of the plugin compared to various foreign loader implementations.
		//		Also, this allows foreign AMD loaders to be used without their plugins.
		//
		//		CAUTION: this module is designed to optionally function synchronously to support the dojo v1.x synchronous
		//		loader. This feature is outside the scope of the CommonJS plugins specification.

		// the dojo/text caches it's own resources because of dojo.cache
		dynamic: true,

		normalize: function(id, toAbsMid){
			// id is something like (path may be relative):
			//
			//	 "path/to/text.html"
			//	 "path/to/text.html!strip"
			var parts= id.split("!"),
				url= parts[0];
			return (/^\./.test(url) ? toAbsMid(url) : url) + (parts[1] ? "!" + parts[1] : "");
		},

		load: function(id, require, load){
			// id: String
			//		Path to the resource.
			// require: Function
			//		Object that include the function toUrl with given id returns a valid URL from which to load the text.
			// load: Function
			//		Callback function which will be called, when the loading finished.

			// id is something like (path is always absolute):
			//
			//	 "path/to/text.html"
			//	 "path/to/text.html!strip"
			var
				parts= id.split("!"),
				stripFlag= parts.length>1,
				absMid= parts[0],
				url = require.toUrl(parts[0]),
				requireCacheUrl = "url:" + url,
				text = notFound,
				finish = function(text){
					load(stripFlag ? strip(text) : text);
				};
			if(absMid in theCache){
				text = theCache[absMid];
			}else if(require.cache && requireCacheUrl in require.cache){
				text = require.cache[requireCacheUrl];
			}else if(url in theCache){
				text = theCache[url];
			}
			if(text===notFound){
				if(pending[url]){
					pending[url].push(finish);
				}else{
					var pendingList = pending[url] = [finish];
					getText(url, !require.async, function(text){
						theCache[absMid]= theCache[url]= text;
						for(var i = 0; i<pendingList.length;){
							pendingList[i++](text);
						}
						delete pending[url];
					});
				}
			}else{
				finish(text);
			}
		}
	};

});


},
'dijit/hccss':function(){
define(["dojo/dom-class", "dojo/hccss", "dojo/domReady", "dojo/_base/window"], function(domClass, has, domReady, win){

	// module:
	//		dijit/hccss

	/*=====
	return function(){
		// summary:
		//		Test if computer is in high contrast mode, and sets `dijit_a11y` flag on `<body>` if it is.
		//		Deprecated, use ``dojo/hccss`` instead.
	};
	=====*/

	domReady(function(){
		if(has("highcontrast")){
			domClass.add(win.body(), "dijit_a11y");
		}
	});

	return has;
});

},
'dijit/_Contained':function(){
define([
	"dojo/_base/declare", // declare
	"./registry"	// registry.getEnclosingWidget(), registry.byNode()
], function(declare, registry){

	// module:
	//		dijit/_Contained

	return declare("dijit._Contained", null, {
		// summary:
		//		Mixin for widgets that are children of a container widget
		// example:
		//	|	// make a basic custom widget that knows about its parents
		//	|	declare("my.customClass",[dijit._WidgetBase, dijit._Contained],{});

		_getSibling: function(/*String*/ which){
			// summary:
			//		Returns next or previous sibling
			// which:
			//		Either "next" or "previous"
			// tags:
			//		private
			var node = this.domNode;
			do{
				node = node[which+"Sibling"];
			}while(node && node.nodeType != 1);
			return node && registry.byNode(node);	// dijit/_WidgetBase
		},

		getPreviousSibling: function(){
			// summary:
			//		Returns null if this is the first child of the parent,
			//		otherwise returns the next element sibling to the "left".

			return this._getSibling("previous"); // dijit/_WidgetBase
		},

		getNextSibling: function(){
			// summary:
			//		Returns null if this is the last child of the parent,
			//		otherwise returns the next element sibling to the "right".

			return this._getSibling("next"); // dijit/_WidgetBase
		},

		getIndexInParent: function(){
			// summary:
			//		Returns the index of this widget within its container parent.
			//		It returns -1 if the parent does not exist, or if the parent
			//		is not a dijit/_Container

			var p = this.getParent();
			if(!p || !p.getIndexOfChild){
				return -1; // int
			}
			return p.getIndexOfChild(this); // int
		}
	});
});

},
'dijit/form/_TextBoxMixin':function(){
define([
	"dojo/_base/array", // array.forEach
	"dojo/_base/declare", // declare
	"dojo/dom", // dom.byId
	"dojo/has",
	"dojo/keys", // keys.ALT keys.CAPS_LOCK keys.CTRL keys.META keys.SHIFT
	"dojo/_base/lang", // lang.mixin
	"dojo/on", // on
	"../main"    // for exporting dijit._setSelectionRange, dijit.selectInputText
], function(array, declare, dom, has, keys, lang, on, dijit){

	// module:
	//		dijit/form/_TextBoxMixin

	var _TextBoxMixin = declare("dijit.form._TextBoxMixin" + (has("dojo-bidi") ? "_NoBidi" : ""), null, {
		// summary:
		//		A mixin for textbox form input widgets

		// trim: Boolean
		//		Removes leading and trailing whitespace if true.  Default is false.
		trim: false,

		// uppercase: Boolean
		//		Converts all characters to uppercase if true.  Default is false.
		uppercase: false,

		// lowercase: Boolean
		//		Converts all characters to lowercase if true.  Default is false.
		lowercase: false,

		// propercase: Boolean
		//		Converts the first character of each word to uppercase if true.
		propercase: false,

		// maxLength: String
		//		HTML INPUT tag maxLength declaration.
		maxLength: "",

		// selectOnClick: [const] Boolean
		//		If true, all text will be selected when focused with mouse
		selectOnClick: false,

		// placeHolder: String
		//		Defines a hint to help users fill out the input field (as defined in HTML 5).
		//		This should only contain plain text (no html markup).
		placeHolder: "",

		_getValueAttr: function(){
			// summary:
			//		Hook so get('value') works as we like.
			// description:
			//		For `dijit/form/TextBox` this basically returns the value of the `<input>`.
			//
			//		For `dijit/form/MappedTextBox` subclasses, which have both
			//		a "displayed value" and a separate "submit value",
			//		This treats the "displayed value" as the master value, computing the
			//		submit value from it via this.parse().
			return this.parse(this.get('displayedValue'), this.constraints);
		},

		_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			// summary:
			//		Hook so set('value', ...) works.
			//
			// description:
			//		Sets the value of the widget to "value" which can be of
			//		any type as determined by the widget.
			//
			// value:
			//		The visual element value is also set to a corresponding,
			//		but not necessarily the same, value.
			//
			// formattedValue:
			//		If specified, used to set the visual element value,
			//		otherwise a computed visual value is used.
			//
			// priorityChange:
			//		If true, an onChange event is fired immediately instead of
			//		waiting for the next blur event.

			var filteredValue;
			if(value !== undefined){
				// TODO: this is calling filter() on both the display value and the actual value.
				// I added a comment to the filter() definition about this, but it should be changed.
				filteredValue = this.filter(value);
				if(typeof formattedValue != "string"){
					if(filteredValue !== null && ((typeof filteredValue != "number") || !isNaN(filteredValue))){
						formattedValue = this.filter(this.format(filteredValue, this.constraints));
					}else{
						formattedValue = '';
					}
				}
			}
			if(formattedValue != null /* and !undefined */ && ((typeof formattedValue) != "number" || !isNaN(formattedValue)) && this.textbox.value != formattedValue){
				this.textbox.value = formattedValue;
				this._set("displayedValue", this.get("displayedValue"));
			}

			this.inherited(arguments, [filteredValue, priorityChange]);
		},

		// displayedValue: String
		//		For subclasses like ComboBox where the displayed value
		//		(ex: Kentucky) and the serialized value (ex: KY) are different,
		//		this represents the displayed value.
		//
		//		Setting 'displayedValue' through set('displayedValue', ...)
		//		updates 'value', and vice-versa.  Otherwise 'value' is updated
		//		from 'displayedValue' periodically, like onBlur etc.
		//
		//		TODO: move declaration to MappedTextBox?
		//		Problem is that ComboBox references displayedValue,
		//		for benefit of FilteringSelect.
		displayedValue: "",

		_getDisplayedValueAttr: function(){
			// summary:
			//		Hook so get('displayedValue') works.
			// description:
			//		Returns the displayed value (what the user sees on the screen),
			//		after filtering (ie, trimming spaces etc.).
			//
			//		For some subclasses of TextBox (like ComboBox), the displayed value
			//		is different from the serialized value that's actually
			//		sent to the server (see `dijit/form/ValidationTextBox.serialize()`)

			// TODO: maybe we should update this.displayedValue on every keystroke so that we don't need
			// this method
			// TODO: this isn't really the displayed value when the user is typing
			return this.filter(this.textbox.value);
		},

		_setDisplayedValueAttr: function(/*String*/ value){
			// summary:
			//		Hook so set('displayedValue', ...) works.
			// description:
			//		Sets the value of the visual element to the string "value".
			//		The widget value is also set to a corresponding,
			//		but not necessarily the same, value.

			if(value == null /* or undefined */){
				value = ''
			}
			else if(typeof value != "string"){
				value = String(value)
			}

			this.textbox.value = value;

			// sets the serialized value to something corresponding to specified displayedValue
			// (if possible), and also updates the textbox.value, for example converting "123"
			// to "123.00"
			this._setValueAttr(this.get('value'), undefined);

			this._set("displayedValue", this.get('displayedValue'));
		},

		format: function(value /*=====, constraints =====*/){
			// summary:
			//		Replaceable function to convert a value to a properly formatted string.
			// value: String
			// constraints: Object
			// tags:
			//		protected extension
			return value == null /* or undefined */ ? "" : (value.toString ? value.toString() : value);
		},

		parse: function(value /*=====, constraints =====*/){
			// summary:
			//		Replaceable function to convert a formatted string to a value
			// value: String
			// constraints: Object
			// tags:
			//		protected extension

			return value;	// String
		},

		_refreshState: function(){
			// summary:
			//		After the user types some characters, etc., this method is
			//		called to check the field for validity etc.  The base method
			//		in `dijit/form/TextBox` does nothing, but subclasses override.
			// tags:
			//		protected
		},

		 onInput: function(/*===== event =====*/){
			 // summary:
			 //		Connect to this function to receive notifications of various user data-input events.
			 //		Return false to cancel the event and prevent it from being processed.
			 // event:
			 //		keydown | keypress | cut | paste | input
			 // tags:
			 //		callback
		 },

		__skipInputEvent: false,
		_onInput: function(/*Event*/ evt){
			// summary:
			//		Called AFTER the input event has happened

			this._processInput(evt);

			if(this.intermediateChanges){
				// allow the key to post to the widget input box
				this.defer(function(){
					this._handleOnChange(this.get('value'), false);
				});
			}
		},

		_processInput: function(/*Event*/ evt){
			// summary:
			//		Default action handler for user input events

			this._refreshState();

			// In case someone is watch()'ing for changes to displayedValue
			this._set("displayedValue", this.get("displayedValue"));
		},

		postCreate: function(){
			// setting the value here is needed since value="" in the template causes "undefined"
			// and setting in the DOM (instead of the JS object) helps with form reset actions
			this.textbox.setAttribute("value", this.textbox.value); // DOM and JS values should be the same

			this.inherited(arguments);

			// normalize input events to reduce spurious event processing
			//	onkeydown: do not forward modifier keys
			//		       set charOrCode to numeric keycode
			//	onkeypress: do not forward numeric charOrCode keys (already sent through onkeydown)
			//	onpaste & oncut: set charOrCode to 229 (IME)
			//	oninput: if primary event not already processed, set charOrCode to 229 (IME), else do not forward
			var handleEvent = function(e){
				var charOrCode;
				if(e.type == "keydown"){
					charOrCode = e.keyCode;
					switch(charOrCode){ // ignore state keys
						case keys.SHIFT:
						case keys.ALT:
						case keys.CTRL:
						case keys.META:
						case keys.CAPS_LOCK:
						case keys.NUM_LOCK:
						case keys.SCROLL_LOCK:
							return;
					}
					if(!e.ctrlKey && !e.metaKey && !e.altKey){ // no modifiers
						switch(charOrCode){ // ignore location keys
							case keys.NUMPAD_0:
							case keys.NUMPAD_1:
							case keys.NUMPAD_2:
							case keys.NUMPAD_3:
							case keys.NUMPAD_4:
							case keys.NUMPAD_5:
							case keys.NUMPAD_6:
							case keys.NUMPAD_7:
							case keys.NUMPAD_8:
							case keys.NUMPAD_9:
							case keys.NUMPAD_MULTIPLY:
							case keys.NUMPAD_PLUS:
							case keys.NUMPAD_ENTER:
							case keys.NUMPAD_MINUS:
							case keys.NUMPAD_PERIOD:
							case keys.NUMPAD_DIVIDE:
								return;
						}
						if((charOrCode >= 65 && charOrCode <= 90) || (charOrCode >= 48 && charOrCode <= 57) || charOrCode == keys.SPACE){
							return; // keypress will handle simple non-modified printable keys
						}
						var named = false;
						for(var i in keys){
							if(keys[i] === e.keyCode){
								named = true;
								break;
							}
						}
						if(!named){
							return;
						} // only allow named ones through
					}
				}
				charOrCode = e.charCode >= 32 ? String.fromCharCode(e.charCode) : e.charCode;
				if(!charOrCode){
					charOrCode = (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode == keys.SPACE ? String.fromCharCode(e.keyCode) : e.keyCode;
				}
				if(!charOrCode){
					charOrCode = 229; // IME
				}
				if(e.type == "keypress"){
					if(typeof charOrCode != "string"){
						return;
					}
					if((charOrCode >= 'a' && charOrCode <= 'z') || (charOrCode >= 'A' && charOrCode <= 'Z') || (charOrCode >= '0' && charOrCode <= '9') || (charOrCode === ' ')){
						if(e.ctrlKey || e.metaKey || e.altKey){
							return;
						} // can only be stopped reliably in keydown
					}
				}
				if(e.type == "input"){
					if(this.__skipInputEvent){ // duplicate event
						this.__skipInputEvent = false;
						return;
					}
				}else{
					this.__skipInputEvent = true;
				}
				// create fake event to set charOrCode and to know if preventDefault() was called
				var faux = { faux: true }, attr;
				for(attr in e){
					if(attr != "layerX" && attr != "layerY"){ // prevent WebKit warnings
						var v = e[attr];
						if(typeof v != "function" && typeof v != "undefined"){
							faux[attr] = v;
						}
					}
				}
				lang.mixin(faux, {
					charOrCode: charOrCode,
					_wasConsumed: false,
					preventDefault: function(){
						faux._wasConsumed = true;
						e.preventDefault();
					},
					stopPropagation: function(){
						e.stopPropagation();
					}
				});
				// give web page author a chance to consume the event
				//console.log(faux.type + ', charOrCode = (' + (typeof charOrCode) + ') ' + charOrCode + ', ctrl ' + !!faux.ctrlKey + ', alt ' + !!faux.altKey + ', meta ' + !!faux.metaKey + ', shift ' + !!faux.shiftKey);
				if(this.onInput(faux) === false){ // return false means stop
					faux.preventDefault();
					faux.stopPropagation();
				}
				if(faux._wasConsumed){
					return;
				} // if preventDefault was called
				this.defer(function(){
					this._onInput(faux);
				}); // widget notification after key has posted
				if(e.type == "keypress"){
					e.stopPropagation(); // don't allow parents to stop printables from being typed
				}
			};
			this.own(on(this.textbox, "keydown, keypress, paste, cut, input, compositionend", lang.hitch(this, handleEvent)));
		},

		_blankValue: '', // if the textbox is blank, what value should be reported
		filter: function(val){
			// summary:
			//		Auto-corrections (such as trimming) that are applied to textbox
			//		value on blur or form submit.
			// description:
			//		For MappedTextBox subclasses, this is called twice
			//
			//		- once with the display value
			//		- once the value as set/returned by set('value', ...)
			//
			//		and get('value'), ex: a Number for NumberTextBox.
			//
			//		In the latter case it does corrections like converting null to NaN.  In
			//		the former case the NumberTextBox.filter() method calls this.inherited()
			//		to execute standard trimming code in TextBox.filter().
			//
			//		TODO: break this into two methods in 2.0
			//
			// tags:
			//		protected extension
			if(val === null){
				return this._blankValue;
			}
			if(typeof val != "string"){
				return val;
			}
			if(this.trim){
				val = lang.trim(val);
			}
			if(this.uppercase){
				val = val.toUpperCase();
			}
			if(this.lowercase){
				val = val.toLowerCase();
			}
			if(this.propercase){
				val = val.replace(/[^\s]+/g, function(word){
					return word.substring(0, 1).toUpperCase() + word.substring(1);
				});
			}
			return val;
		},

		_setBlurValue: function(){
			// Format the displayed value, for example (for NumberTextBox) convert 1.4 to 1.400,
			// or (for CurrencyTextBox) 2.50 to $2.50

			this._setValueAttr(this.get('value'), true);
		},

		_onBlur: function(e){
			if(this.disabled){
				return;
			}
			this._setBlurValue();
			this.inherited(arguments);
		},

		_isTextSelected: function(){
			return this.textbox.selectionStart != this.textbox.selectionEnd;
		},

		_onFocus: function(/*String*/ by){
			if(this.disabled || this.readOnly){
				return;
			}

			// Select all text on focus via click if nothing already selected.
			// Since mouse-up will clear the selection, need to defer selection until after mouse-up.
			// Don't do anything on focus by tabbing into the widget since there's no associated mouse-up event.
			if(this.selectOnClick && by == "mouse"){
				// Use on.once() to only select all text on first click only; otherwise users would have no way to clear
				// the selection.
				this._selectOnClickHandle = on.once(this.domNode, "mouseup, touchend", lang.hitch(this, function(evt){
					// Check if the user selected some text manually (mouse-down, mouse-move, mouse-up)
					// and if not, then select all the text
					if(!this._isTextSelected()){
						_TextBoxMixin.selectInputText(this.textbox);
					}
				}));
				this.own(this._selectOnClickHandle);

				// in case the mouseup never comes
				this.defer(function(){
					if(this._selectOnClickHandle){
						this._selectOnClickHandle.remove();
						this._selectOnClickHandle = null;
					}
				}, 500); // if mouseup not received soon, then treat it as some gesture
			}
			// call this.inherited() before refreshState(), since this.inherited() will possibly scroll the viewport
			// (to scroll the TextBox into view), which will affect how _refreshState() positions the tooltip
			this.inherited(arguments);

			this._refreshState();
		},

		reset: function(){
			// Overrides `dijit/_FormWidget/reset()`.
			// Additionally resets the displayed textbox value to ''
			this.textbox.value = '';
			this.inherited(arguments);
		}
	});

	if(has("dojo-bidi")){
		_TextBoxMixin = declare("dijit.form._TextBoxMixin", _TextBoxMixin, {
			_setValueAttr: function(){
				this.inherited(arguments);
				this.applyTextDir(this.focusNode);
			},
			_setDisplayedValueAttr: function(){
				this.inherited(arguments);
				this.applyTextDir(this.focusNode);
			},
			_onInput: function(){
				this.applyTextDir(this.focusNode);
				this.inherited(arguments);
			}
		});
	}

	_TextBoxMixin._setSelectionRange = dijit._setSelectionRange = function(/*DomNode*/ element, /*Number?*/ start, /*Number?*/ stop){
		if(element.setSelectionRange){
			element.setSelectionRange(start, stop);
		}
	};

	_TextBoxMixin.selectInputText = dijit.selectInputText = function(/*DomNode*/ element, /*Number?*/ start, /*Number?*/ stop){
		// summary:
		//		Select text in the input element argument, from start (default 0), to stop (default end).

		// TODO: use functions in _editor/selection.js?
		element = dom.byId(element);
		if(isNaN(start)){
			start = 0;
		}
		if(isNaN(stop)){
			stop = element.value ? element.value.length : 0;
		}
		try{
			element.focus();
			_TextBoxMixin._setSelectionRange(element, start, stop);
		}catch(e){ /* squelch random errors (esp. on IE) from unexpected focus changes or DOM nodes being hidden */
		}
	};

	return _TextBoxMixin;
});

},
'dojo/request/default':function(){
define([
	'exports',
	'require',
	'../has'
], function(exports, require, has){
	var defId = has('config-requestProvider'),
		platformId;

	if( 1 ){
		platformId = './xhr';
	}else if( 0 ){
		platformId = './node';
	/* TODO:
	}else if( 0 ){
		platformId = './rhino';
   */
	}

	if(!defId){
		defId = platformId;
	}

	exports.getPlatformDefaultId = function(){
		return platformId;
	};

	exports.load = function(id, parentRequire, loaded, config){
		require([id == 'platform' ? platformId : defId], function(provider){
			loaded(provider);
		});
	};
});

},
'dijit/Toolbar':function(){
define([
	"require",
	"dojo/_base/declare", // declare
	"dojo/has",
	"dojo/keys", // keys.LEFT_ARROW keys.RIGHT_ARROW
	"dojo/ready",
	"./_Widget",
	"./_KeyNavContainer",
	"./_TemplatedMixin"
], function(require, declare, has, keys, ready, _Widget, _KeyNavContainer, _TemplatedMixin){

	// module:
	//		dijit/Toolbar


	// Back compat w/1.6, remove for 2.0
	if(has("dijit-legacy-requires")){
		ready(0, function(){
			var requires = ["dijit/ToolbarSeparator"];
			require(requires);	// use indirection so modules not rolled into a build
		});
	}

	return declare("dijit.Toolbar", [_Widget, _TemplatedMixin, _KeyNavContainer], {
		// summary:
		//		A Toolbar widget, used to hold things like `dijit/Editor` buttons

		templateString:
			'<div class="dijit" role="toolbar" tabIndex="${tabIndex}" data-dojo-attach-point="containerNode">' +
			'</div>',

		baseClass: "dijitToolbar",

		_onLeftArrow: function(){
			this.focusPrev();
		},

		_onRightArrow: function(){
			this.focusNext();
		}
	});
});

},
'dijit/form/ToggleButton':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/_base/kernel", // kernel.deprecated
	"./Button",
	"./_ToggleButtonMixin"
], function(declare, kernel, Button, _ToggleButtonMixin){

	// module:
	//		dijit/form/ToggleButton


	return declare("dijit.form.ToggleButton", [Button, _ToggleButtonMixin], {
		// summary:
		//		A templated button widget that can be in two states (checked or not).
		//		Can be base class for things like tabs or checkbox or radio buttons.

		baseClass: "dijitToggleButton",

		setChecked: function(/*Boolean*/ checked){
			// summary:
			//		Deprecated.  Use set('checked', true/false) instead.
			kernel.deprecated("setChecked("+checked+") is deprecated. Use set('checked',"+checked+") instead.", "", "2.0");
			this.set('checked', checked);
		}
	});
});

},
'dijit/Viewport':function(){
define([
	"dojo/Evented",
	"dojo/on",
	"dojo/domReady",
	"dojo/sniff",	// has("ie"), has("ios")
	"dojo/window" // getBox()
], function(Evented, on, domReady, has, winUtils){

	// module:
	//		dijit/Viewport

	/*=====
	return {
		// summary:
		//		Utility singleton to watch for viewport resizes, avoiding duplicate notifications
		//		which can lead to infinite loops.
		// description:
		//		Usage: Viewport.on("resize", myCallback).
		//
		//		myCallback() is called without arguments in case it's _WidgetBase.resize(),
		//		which would interpret the argument as the size to make the widget.
	};
	=====*/

	var Viewport = new Evented();

	var focusedNode;

	domReady(function(){
		var oldBox = winUtils.getBox();
		Viewport._rlh = on(window, "resize", function(){
			var newBox = winUtils.getBox();
			if(oldBox.h == newBox.h && oldBox.w == newBox.w){ return; }
			oldBox = newBox;
			Viewport.emit("resize");
		});

		// Also catch zoom changes on IE8, since they don't naturally generate resize events
		if(has("ie") == 8){
			var deviceXDPI = screen.deviceXDPI;
			setInterval(function(){
				if(screen.deviceXDPI != deviceXDPI){
					deviceXDPI = screen.deviceXDPI;
					Viewport.emit("resize");
				}
			}, 500);
		}

		// On iOS, keep track of the focused node so we can guess when the keyboard is/isn't being displayed.
		if(has("ios")){
			on(document, "focusin", function(evt){
				focusedNode = evt.target;
			});
			on(document, "focusout", function(evt){
				focusedNode = null;
			});
		}
	});

	Viewport.getEffectiveBox = function(/*Document*/ doc){
		// summary:
		//		Get the size of the viewport, or on mobile devices, the part of the viewport not obscured by the
		//		virtual keyboard.

		var box = winUtils.getBox(doc);

		// Account for iOS virtual keyboard, if it's being shown.  Unfortunately no direct way to check or measure.
		var tag = focusedNode && focusedNode.tagName && focusedNode.tagName.toLowerCase();
		if(has("ios") && focusedNode && !focusedNode.readOnly && (tag == "textarea" || (tag == "input" &&
			/^(color|email|number|password|search|tel|text|url)$/.test(focusedNode.type)))){

			// Box represents the size of the viewport.  Some of the viewport is likely covered by the keyboard.
			// Estimate height of visible viewport assuming viewport goes to bottom of screen, but is covered by keyboard.
			box.h *= (orientation == 0 || orientation == 180 ? 0.66 : 0.40);

			// Above measurement will be inaccurate if viewport was scrolled up so far that it ends before the bottom
			// of the screen.   In this case, keyboard isn't covering as much of the viewport as we thought.
			// We know the visible size is at least the distance from the top of the viewport to the focused node.
			var rect = focusedNode.getBoundingClientRect();
			box.h = Math.max(box.h, rect.top + rect.height);
		}

		return box;
	};

	return Viewport;
});

},
'dojo/parser':function(){
define([
	"require", "./_base/kernel", "./_base/lang", "./_base/array", "./_base/config", "./dom", "./_base/window",
		"./_base/url", "./aspect", "./promise/all", "./date/stamp", "./Deferred", "./has", "./query", "./on", "./ready"
], function(require, dojo, dlang, darray, config, dom, dwindow, _Url, aspect, all, dates, Deferred, has, query, don, ready){

	// module:
	//		dojo/parser

	new Date("X"); // workaround for #11279, new Date("") == NaN

	// data-dojo-props etc. is not restricted to JSON, it can be any javascript
	function myEval(text){
		return eval("(" + text + ")");
	}

	// Widgets like BorderContainer add properties to _Widget via dojo.extend().
	// If BorderContainer is loaded after _Widget's parameter list has been cached,
	// we need to refresh that parameter list (for _Widget and all widgets that extend _Widget).
	var extendCnt = 0;
	aspect.after(dlang, "extend", function(){
		extendCnt++;
	}, true);

	function getNameMap(ctor){
		// summary:
		//		Returns map from lowercase name to attribute name in class, ex: {onclick: "onClick"}
		var map = ctor._nameCaseMap, proto = ctor.prototype;

		// Create the map if it's undefined.
		// Refresh the map if a superclass was possibly extended with new methods since the map was created.
		if(!map || map._extendCnt < extendCnt){
			map = ctor._nameCaseMap = {};
			for(var name in proto){
				if(name.charAt(0) === "_"){
					continue;
				}	// skip internal properties
				map[name.toLowerCase()] = name;
			}
			map._extendCnt = extendCnt;
		}
		return map;
	}

	// Map from widget name or list of widget names(ex: "dijit/form/Button,acme/MyMixin") to a constructor.
	var _ctorMap = {};

	function getCtor(/*String[]*/ types, /*Function?*/ contextRequire){
		// summary:
		//		Retrieves a constructor.  If the types array contains more than one class/MID then the
		//		subsequent classes will be mixed into the first class and a unique constructor will be
		//		returned for that array.

		var ts = types.join();
		if(!_ctorMap[ts]){
			var mixins = [];
			for(var i = 0, l = types.length; i < l; i++){
				var t = types[i];
				// TODO: Consider swapping getObject and require in the future
				mixins[mixins.length] = (_ctorMap[t] = _ctorMap[t] || (dlang.getObject(t) || (~t.indexOf('/') &&
					(contextRequire ? contextRequire(t) : require(t)))));
			}
			var ctor = mixins.shift();
			_ctorMap[ts] = mixins.length ? (ctor.createSubclass ? ctor.createSubclass(mixins) : ctor.extend.apply(ctor, mixins)) : ctor;
		}

		return _ctorMap[ts];
	}

	var parser = {
		// summary:
		//		The Dom/Widget parsing package

		_clearCache: function(){
			// summary:
			//		Clear cached data.   Used mainly for benchmarking.
			extendCnt++;
			_ctorMap = {};
		},

		_functionFromScript: function(script, attrData){
			// summary:
			//		Convert a `<script type="dojo/method" args="a, b, c"> ... </script>`
			//		into a function
			// script: DOMNode
			//		The `<script>` DOMNode
			// attrData: String
			//		For HTML5 compliance, searches for attrData + "args" (typically
			//		"data-dojo-args") instead of "args"
			var preamble = "",
				suffix = "",
				argsStr = (script.getAttribute(attrData + "args") || script.getAttribute("args")),
				withStr = script.getAttribute("with");

			// Convert any arguments supplied in script tag into an array to be passed to the
			var fnArgs = (argsStr || "").split(/\s*,\s*/);

			if(withStr && withStr.length){
				darray.forEach(withStr.split(/\s*,\s*/), function(part){
					preamble += "with(" + part + "){";
					suffix += "}";
				});
			}

			return new Function(fnArgs, preamble + script.innerHTML + suffix);
		},

		instantiate: function(nodes, mixin, options){
			// summary:
			//		Takes array of nodes, and turns them into class instances and
			//		potentially calls a startup method to allow them to connect with
			//		any children.
			// nodes: Array
			//		Array of DOM nodes
			// mixin: Object?
			//		An object that will be mixed in with each node in the array.
			//		Values in the mixin will override values in the node, if they
			//		exist.
			// options: Object?
			//		An object used to hold kwArgs for instantiation.
			//		See parse.options argument for details.
			// returns:
			//		Array of instances.

			mixin = mixin || {};
			options = options || {};

			var dojoType = (options.scope || dojo._scopeName) + "Type", // typically "dojoType"
				attrData = "data-" + (options.scope || dojo._scopeName) + "-", // typically "data-dojo-"
				dataDojoType = attrData + "type", // typically "data-dojo-type"
				dataDojoMixins = attrData + "mixins";					// typically "data-dojo-mixins"

			var list = [];
			darray.forEach(nodes, function(node){
				var type = dojoType in mixin ? mixin[dojoType] : node.getAttribute(dataDojoType) || node.getAttribute(dojoType);
				if(type){
					var mixinsValue = node.getAttribute(dataDojoMixins),
						types = mixinsValue ? [type].concat(mixinsValue.split(/\s*,\s*/)) : [type];

					list.push({
						node: node,
						types: types
					});
				}
			});

			// Instantiate the nodes and return the list of instances.
			return this._instantiate(list, mixin, options);
		},

		_instantiate: function(nodes, mixin, options, returnPromise){
			// summary:
			//		Takes array of objects representing nodes, and turns them into class instances and
			//		potentially calls a startup method to allow them to connect with
			//		any children.
			// nodes: Array
			//		Array of objects like
			//	|		{
			//	|			ctor: Function (may be null)
			//	|			types: ["dijit/form/Button", "acme/MyMixin"] (used if ctor not specified)
			//	|			node: DOMNode,
			//	|			scripts: [ ... ],	// array of <script type="dojo/..."> children of node
			//	|			inherited: { ... }	// settings inherited from ancestors like dir, theme, etc.
			//	|		}
			// mixin: Object
			//		An object that will be mixed in with each node in the array.
			//		Values in the mixin will override values in the node, if they
			//		exist.
			// options: Object
			//		An options object used to hold kwArgs for instantiation.
			//		See parse.options argument for details.
			// returnPromise: Boolean
			//		Return a Promise rather than the instance; supports asynchronous widget creation.
			// returns:
			//		Array of instances, or if returnPromise is true, a promise for array of instances
			//		that resolves when instances have finished initializing.

			// Call widget constructors.   Some may be asynchronous and return promises.
			var thelist = darray.map(nodes, function(obj){
				var ctor = obj.ctor || getCtor(obj.types, options.contextRequire);
				// If we still haven't resolved a ctor, it is fatal now
				if(!ctor){
					throw new Error("Unable to resolve constructor for: '" + obj.types.join() + "'");
				}
				return this.construct(ctor, obj.node, mixin, options, obj.scripts, obj.inherited);
			}, this);

			// After all widget construction finishes, call startup on each top level instance if it makes sense (as for
			// widgets).  Parent widgets will recursively call startup on their (non-top level) children
			function onConstruct(thelist){
				if(!mixin._started && !options.noStart){
					darray.forEach(thelist, function(instance){
						if(typeof instance.startup === "function" && !instance._started){
							instance.startup();
						}
					});
				}

				return thelist;
			}

			if(returnPromise){
				return all(thelist).then(onConstruct);
			}else{
				// Back-compat path, remove for 2.0
				return onConstruct(thelist);
			}
		},

		construct: function(ctor, node, mixin, options, scripts, inherited){
			// summary:
			//		Calls new ctor(params, node), where params is the hash of parameters specified on the node,
			//		excluding data-dojo-type and data-dojo-mixins.   Does not call startup().
			// ctor: Function
			//		Widget constructor.
			// node: DOMNode
			//		This node will be replaced/attached to by the widget.  It also specifies the arguments to pass to ctor.
			// mixin: Object?
			//		Attributes in this object will be passed as parameters to ctor,
			//		overriding attributes specified on the node.
			// options: Object?
			//		An options object used to hold kwArgs for instantiation.   See parse.options argument for details.
			// scripts: DomNode[]?
			//		Array of `<script type="dojo/*">` DOMNodes.  If not specified, will search for `<script>` tags inside node.
			// inherited: Object?
			//		Settings from dir=rtl or lang=... on a node above this node.   Overrides options.inherited.
			// returns:
			//		Instance or Promise for the instance, if markupFactory() itself returned a promise

			var proto = ctor && ctor.prototype;
			options = options || {};

			// Setup hash to hold parameter settings for this widget.	Start with the parameter
			// settings inherited from ancestors ("dir" and "lang").
			// Inherited setting may later be overridden by explicit settings on node itself.
			var params = {};

			if(options.defaults){
				// settings for the document itself (or whatever subtree is being parsed)
				dlang.mixin(params, options.defaults);
			}
			if(inherited){
				// settings from dir=rtl or lang=... on a node above this node
				dlang.mixin(params, inherited);
			}

			// Get list of attributes explicitly listed in the markup
			var attributes;
			if(has("dom-attributes-explicit")){
				// Standard path to get list of user specified attributes
				attributes = node.attributes;
			}else if(has("dom-attributes-specified-flag")){
				// Special processing needed for IE8, to skip a few faux values in attributes[]
				attributes = darray.filter(node.attributes, function(a){
					return a.specified;
				});
			}else{
				// Special path for IE6-7, avoid (sometimes >100) bogus entries in node.attributes
				var clone = /^input$|^img$/i.test(node.nodeName) ? node : node.cloneNode(false),
					attrs = clone.outerHTML.replace(/=[^\s"']+|="[^"]*"|='[^']*'/g, "").replace(/^\s*<[a-zA-Z0-9]*\s*/, "").replace(/\s*>.*$/, "");

				attributes = darray.map(attrs.split(/\s+/), function(name){
					var lcName = name.toLowerCase();
					return {
						name: name,
						// getAttribute() doesn't work for button.value, returns innerHTML of button.
						// but getAttributeNode().value doesn't work for the form.encType or li.value
						value: (node.nodeName == "LI" && name == "value") || lcName == "enctype" ?
							node.getAttribute(lcName) : node.getAttributeNode(lcName).value
					};
				});
			}

			// Hash to convert scoped attribute name (ex: data-dojo17-params) to something friendly (ex: data-dojo-params)
			// TODO: remove scope for 2.0
			var scope = options.scope || dojo._scopeName,
				attrData = "data-" + scope + "-", // typically "data-dojo-"
				hash = {};
			if(scope !== "dojo"){
				hash[attrData + "props"] = "data-dojo-props";
				hash[attrData + "type"] = "data-dojo-type";
				hash[attrData + "mixins"] = "data-dojo-mixins";
				hash[scope + "type"] = "dojoType";
				hash[attrData + "id"] = "data-dojo-id";
			}

			// Read in attributes and process them, including data-dojo-props, data-dojo-type,
			// dojoAttachPoint, etc., as well as normal foo=bar attributes.
			var i = 0, item, funcAttrs = [], jsname, extra;
			while(item = attributes[i++]){
				var name = item.name,
					lcName = name.toLowerCase(),
					value = item.value;

				switch(hash[lcName] || lcName){
				// Already processed, just ignore
				case "data-dojo-type":
				case "dojotype":
				case "data-dojo-mixins":
					break;

				// Data-dojo-props.   Save for later to make sure it overrides direct foo=bar settings
				case "data-dojo-props":
					extra = value;
					break;

				// data-dojo-id or jsId. TODO: drop jsId in 2.0
				case "data-dojo-id":
				case "jsid":
					jsname = value;
					break;

				// For the benefit of _Templated
				case "data-dojo-attach-point":
				case "dojoattachpoint":
					params.dojoAttachPoint = value;
					break;
				case "data-dojo-attach-event":
				case "dojoattachevent":
					params.dojoAttachEvent = value;
					break;

				// Special parameter handling needed for IE
				case "class":
					params["class"] = node.className;
					break;
				case "style":
					params["style"] = node.style && node.style.cssText;
					break;
				default:
					// Normal attribute, ex: value="123"

					// Find attribute in widget corresponding to specified name.
					// May involve case conversion, ex: onclick --> onClick
					if(!(name in proto)){
						var map = getNameMap(ctor);
						name = map[lcName] || name;
					}

					// Set params[name] to value, doing type conversion
					if(name in proto){
						switch(typeof proto[name]){
						case "string":
							params[name] = value;
							break;
						case "number":
							params[name] = value.length ? Number(value) : NaN;
							break;
						case "boolean":
							// for checked/disabled value might be "" or "checked".	 interpret as true.
							params[name] = value.toLowerCase() != "false";
							break;
						case "function":
							if(value === "" || value.search(/[^\w\.]+/i) != -1){
								// The user has specified some text for a function like "return x+5"
								params[name] = new Function(value);
							}else{
								// The user has specified the name of a global function like "myOnClick"
								// or a single word function "return"
								params[name] = dlang.getObject(value, false) || new Function(value);
							}
							funcAttrs.push(name);	// prevent "double connect", see #15026
							break;
						default:
							var pVal = proto[name];
							params[name] =
								(pVal && "length" in pVal) ? (value ? value.split(/\s*,\s*/) : []) :	// array
									(pVal instanceof Date) ?
										(value == "" ? new Date("") :	// the NaN of dates
										value == "now" ? new Date() :	// current date
										dates.fromISOString(value)) :
								(pVal instanceof _Url) ? (dojo.baseUrl + value) :
								myEval(value);
						}
					}else{
						params[name] = value;
					}
				}
			}

			// Remove function attributes from DOMNode to prevent "double connect" problem, see #15026.
			// Do this as a separate loop since attributes[] is often a live collection (depends on the browser though).
			for(var j = 0; j < funcAttrs.length; j++){
				var lcfname = funcAttrs[j].toLowerCase();
				node.removeAttribute(lcfname);
				node[lcfname] = null;
			}

			// Mix things found in data-dojo-props into the params, overriding any direct settings
			if(extra){
				try{
					extra = myEval.call(options.propsThis, "{" + extra + "}");
					dlang.mixin(params, extra);
				}catch(e){
					// give the user a pointer to their invalid parameters. FIXME: can we kill this in production?
					throw new Error(e.toString() + " in data-dojo-props='" + extra + "'");
				}
			}

			// Any parameters specified in "mixin" override everything else.
			dlang.mixin(params, mixin);

			// Get <script> nodes associated with this widget, if they weren't specified explicitly
			if(!scripts){
				scripts = (ctor && (ctor._noScript || proto._noScript) ? [] : query("> script[type^='dojo/']", node));
			}

			// Process <script type="dojo/*"> script tags
			// <script type="dojo/method" data-dojo-event="foo"> tags are added to params, and passed to
			// the widget on instantiation.
			// <script type="dojo/method"> tags (with no event) are executed after instantiation
			// <script type="dojo/connect" data-dojo-event="foo"> tags are dojo.connected after instantiation,
			// and likewise with <script type="dojo/aspect" data-dojo-method="foo">
			// <script type="dojo/watch" data-dojo-prop="foo"> tags are dojo.watch after instantiation
			// <script type="dojo/on" data-dojo-event="foo"> tags are dojo.on after instantiation
			// note: dojo/* script tags cannot exist in self closing widgets, like <input />
			var aspects = [],	// aspects to connect after instantiation
				calls = [],		// functions to call after instantiation
				watches = [],  // functions to watch after instantiation
				ons = []; // functions to on after instantiation

			if(scripts){
				for(i = 0; i < scripts.length; i++){
					var script = scripts[i];
					node.removeChild(script);
					// FIXME: drop event="" support in 2.0. use data-dojo-event="" instead
					var event = (script.getAttribute(attrData + "event") || script.getAttribute("event")),
						prop = script.getAttribute(attrData + "prop"),
						method = script.getAttribute(attrData + "method"),
						advice = script.getAttribute(attrData + "advice"),
						scriptType = script.getAttribute("type"),
						nf = this._functionFromScript(script, attrData);
					if(event){
						if(scriptType == "dojo/connect"){
							aspects.push({ method: event, func: nf });
						}else if(scriptType == "dojo/on"){
							ons.push({ event: event, func: nf });
						}else{
							// <script type="dojo/method" data-dojo-event="foo">
							// TODO for 2.0: use data-dojo-method="foo" instead (also affects dijit/Declaration)
							params[event] = nf;
						}
					}else if(scriptType == "dojo/aspect"){
						aspects.push({ method: method, advice: advice, func: nf });
					}else if(scriptType == "dojo/watch"){
						watches.push({ prop: prop, func: nf });
					}else{
						calls.push(nf);
					}
				}
			}

			// create the instance
			var markupFactory = ctor.markupFactory || proto.markupFactory;
			var instance = markupFactory ? markupFactory(params, node, ctor) : new ctor(params, node);

			function onInstantiate(instance){
				// map it to the JS namespace if that makes sense
				if(jsname){
					dlang.setObject(jsname, instance);
				}

				// process connections and startup functions
				for(i = 0; i < aspects.length; i++){
					aspect[aspects[i].advice || "after"](instance, aspects[i].method, dlang.hitch(instance, aspects[i].func), true);
				}
				for(i = 0; i < calls.length; i++){
					calls[i].call(instance);
				}
				for(i = 0; i < watches.length; i++){
					instance.watch(watches[i].prop, watches[i].func);
				}
				for(i = 0; i < ons.length; i++){
					don(instance, ons[i].event, ons[i].func);
				}

				return instance;
			}

			if(instance.then){
				return instance.then(onInstantiate);
			}else{
				return onInstantiate(instance);
			}
		},

		scan: function(root, options){
			// summary:
			//		Scan a DOM tree and return an array of objects representing the DOMNodes
			//		that need to be turned into widgets.
			// description:
			//		Search specified node (or document root node) recursively for class instances
			//		and return an array of objects that represent potential widgets to be
			//		instantiated. Searches for either data-dojo-type="MID" or dojoType="MID" where
			//		"MID" is a module ID like "dijit/form/Button" or a fully qualified Class name
			//		like "dijit/form/Button".  If the MID is not currently available, scan will
			//		attempt to require() in the module.
			//
			//		See parser.parse() for details of markup.
			// root: DomNode?
			//		A default starting root node from which to start the parsing. Can be
			//		omitted, defaulting to the entire document. If omitted, the `options`
			//		object can be passed in this place. If the `options` object has a
			//		`rootNode` member, that is used.
			// options: Object
			//		a kwArgs options object, see parse() for details
			//
			// returns: Promise
			//		A promise that is resolved with the nodes that have been parsed.

			var list = [], // Output List
				mids = [], // An array of modules that are not yet loaded
				midsHash = {}; // Used to keep the mids array unique

			var dojoType = (options.scope || dojo._scopeName) + "Type", // typically "dojoType"
				attrData = "data-" + (options.scope || dojo._scopeName) + "-", // typically "data-dojo-"
				dataDojoType = attrData + "type", // typically "data-dojo-type"
				dataDojoTextDir = attrData + "textdir", // typically "data-dojo-textdir"
				dataDojoMixins = attrData + "mixins";					// typically "data-dojo-mixins"

			// Info on DOMNode currently being processed
			var node = root.firstChild;

			// Info on parent of DOMNode currently being processed
			//	- inherited: dir, lang, and textDir setting of parent, or inherited by parent
			//	- parent: pointer to identical structure for my parent (or null if no parent)
			//	- scripts: if specified, collects <script type="dojo/..."> type nodes from children
			var inherited = options.inherited;
			if(!inherited){
				function findAncestorAttr(node, attr){
					return (node.getAttribute && node.getAttribute(attr)) ||
						(node.parentNode && findAncestorAttr(node.parentNode, attr));
				}

				inherited = {
					dir: findAncestorAttr(root, "dir"),
					lang: findAncestorAttr(root, "lang"),
					textDir: findAncestorAttr(root, dataDojoTextDir)
				};
				for(var key in inherited){
					if(!inherited[key]){
						delete inherited[key];
					}
				}
			}

			// Metadata about parent node
			var parent = {
				inherited: inherited
			};

			// For collecting <script type="dojo/..."> type nodes (when null, we don't need to collect)
			var scripts;

			// when true, only look for <script type="dojo/..."> tags, and don't recurse to children
			var scriptsOnly;

			function getEffective(parent){
				// summary:
				//		Get effective dir, lang, textDir settings for specified obj
				//		(matching "parent" object structure above), and do caching.
				//		Take care not to return null entries.
				if(!parent.inherited){
					parent.inherited = {};
					var node = parent.node,
						grandparent = getEffective(parent.parent);
					var inherited = {
						dir: node.getAttribute("dir") || grandparent.dir,
						lang: node.getAttribute("lang") || grandparent.lang,
						textDir: node.getAttribute(dataDojoTextDir) || grandparent.textDir
					};
					for(var key in inherited){
						if(inherited[key]){
							parent.inherited[key] = inherited[key];
						}
					}
				}
				return parent.inherited;
			}

			// DFS on DOM tree, collecting nodes with data-dojo-type specified.
			while(true){
				if(!node){
					// Finished this level, continue to parent's next sibling
					if(!parent || !parent.node){
						break;
					}
					node = parent.node.nextSibling;
					scriptsOnly = false;
					parent = parent.parent;
					scripts = parent.scripts;
					continue;
				}

				if(node.nodeType != 1){
					// Text or comment node, skip to next sibling
					node = node.nextSibling;
					continue;
				}

				if(scripts && node.nodeName.toLowerCase() == "script"){
					// Save <script type="dojo/..."> for parent, then continue to next sibling
					type = node.getAttribute("type");
					if(type && /^dojo\/\w/i.test(type)){
						scripts.push(node);
					}
					node = node.nextSibling;
					continue;
				}
				if(scriptsOnly){
					// scriptsOnly flag is set, we have already collected scripts if the parent wants them, so now we shouldn't
					// continue further analysis of the node and will continue to the next sibling
					node = node.nextSibling;
					continue;
				}

				// Check for data-dojo-type attribute, fallback to backward compatible dojoType
				// TODO: Remove dojoType in 2.0
				var type = node.getAttribute(dataDojoType) || node.getAttribute(dojoType);

				// Short circuit for leaf nodes containing nothing [but text]
				var firstChild = node.firstChild;
				if(!type && (!firstChild || (firstChild.nodeType == 3 && !firstChild.nextSibling))){
					node = node.nextSibling;
					continue;
				}

				// Meta data about current node
				var current;

				var ctor = null;
				if(type){
					// If dojoType/data-dojo-type specified, add to output array of nodes to instantiate.
					var mixinsValue = node.getAttribute(dataDojoMixins),
						types = mixinsValue ? [type].concat(mixinsValue.split(/\s*,\s*/)) : [type];

					// Note: won't find classes declared via dojo/Declaration or any modules that haven't been
					// loaded yet so use try/catch to avoid throw from require()
					try{
						ctor = getCtor(types, options.contextRequire);
					}catch(e){}

					// If the constructor was not found, check to see if it has modules that can be loaded
					if(!ctor){
						darray.forEach(types, function(t){
							if(~t.indexOf('/') && !midsHash[t]){
								// If the type looks like a MID and it currently isn't in the array of MIDs to load, add it.
								midsHash[t] = true;
								mids[mids.length] = t;
							}
						});
					}

					var childScripts = ctor && !ctor.prototype._noScript ? [] : null; // <script> nodes that are parent's children

					// Setup meta data about this widget node, and save it to list of nodes to instantiate
					current = {
						types: types,
						ctor: ctor,
						parent: parent,
						node: node,
						scripts: childScripts
					};
					current.inherited = getEffective(current); // dir & lang settings for current node, explicit or inherited
					list.push(current);
				}else{
					// Meta data about this non-widget node
					current = {
						node: node,
						scripts: scripts,
						parent: parent
					};
				}

				// Recurse, collecting <script type="dojo/..."> children, and also looking for
				// descendant nodes with dojoType specified (unless the widget has the stopParser flag).
				// When finished with children, go to my next sibling.
				scripts = childScripts;
				scriptsOnly = node.stopParser || (ctor && ctor.prototype.stopParser && !(options.template));
				parent = current;
				node = firstChild;
			}

			var d = new Deferred();

			// If there are modules to load then require them in
			if(mids.length){
				// Warn that there are modules being auto-required
				if(has("dojo-debug-messages")){
					console.warn("WARNING: Modules being Auto-Required: " + mids.join(", "));
				}
				var r = options.contextRequire || require;
				r(mids, function(){
					// Go through list of widget nodes, filling in missing constructors, and filtering out nodes that shouldn't
					// be instantiated due to a stopParser flag on an ancestor that we belatedly learned about due to
					// auto-require of a module like ContentPane.   Assumes list is in DFS order.
					d.resolve(darray.filter(list, function(widget){
						if(!widget.ctor){
							// Attempt to find the constructor again.   Still won't find classes defined via
							// dijit/Declaration so need to try/catch.
							try{
								widget.ctor = getCtor(widget.types, options.contextRequire);
							}catch(e){}
						}

						// Get the parent widget
						var parent = widget.parent;
						while(parent && !parent.types){
							parent = parent.parent;
						}

						// Return false if this node should be skipped due to stopParser on an ancestor.
						// Since list[] is in DFS order, this loop will always set parent.instantiateChildren before
						// trying to compute widget.instantiate.
						var proto = widget.ctor && widget.ctor.prototype;
						widget.instantiateChildren = !(proto && proto.stopParser && !(options.template));
						widget.instantiate = !parent || (parent.instantiate && parent.instantiateChildren);
						return widget.instantiate;
					}));
				});
			}else{
				// There were no modules to load, so just resolve with the parsed nodes.   This separate code path is for
				// efficiency, to avoid running the require() and the callback code above.
				d.resolve(list);
			}

			// Return the promise
			return d.promise;
		},

		_require: function(/*DOMNode*/ script, /*Object?*/ options){
			// summary:
			//		Helper for _scanAMD().  Takes a `<script type=dojo/require>bar: "acme/bar", ...</script>` node,
			//		calls require() to load the specified modules and (asynchronously) assign them to the specified global
			//		variables, and returns a Promise for when that operation completes.
			//
			//		In the example above, it is effectively doing a require(["acme/bar", ...], function(a){ bar = a; }).

			var hash = myEval("{" + script.innerHTML + "}"), // can't use dojo/json::parse() because maybe no quotes
				vars = [],
				mids = [],
				d = new Deferred();

			var contextRequire = (options && options.contextRequire) || require;

			for(var name in hash){
				vars.push(name);
				mids.push(hash[name]);
			}

			contextRequire(mids, function(){
				for(var i = 0; i < vars.length; i++){
					dlang.setObject(vars[i], arguments[i]);
				}
				d.resolve(arguments);
			});

			return d.promise;
		},

		_scanAmd: function(root, options){
			// summary:
			//		Scans the DOM for any declarative requires and returns their values.
			// description:
			//		Looks for `<script type=dojo/require>bar: "acme/bar", ...</script>` node, calls require() to load the
			//		specified modules and (asynchronously) assign them to the specified global variables,
			//		and returns a Promise for when those operations complete.
			// root: DomNode
			//		The node to base the scan from.
			// options: Object?
			//		a kwArgs options object, see parse() for details

			// Promise that resolves when all the <script type=dojo/require> nodes have finished loading.
			var deferred = new Deferred(),
				promise = deferred.promise;
			deferred.resolve(true);

			var self = this;
			query("script[type='dojo/require']", root).forEach(function(node){
				// Fire off require() call for specified modules.  Chain this require to fire after
				// any previous requires complete, so that layers can be loaded before individual module require()'s fire.
				promise = promise.then(function(){
					return self._require(node, options);
				});

				// Remove from DOM so it isn't seen again
				node.parentNode.removeChild(node);
			});

			return promise;
		},

		parse: function(rootNode, options){
			// summary:
			//		Scan the DOM for class instances, and instantiate them.
			// description:
			//		Search specified node (or root node) recursively for class instances,
			//		and instantiate them. Searches for either data-dojo-type="Class" or
			//		dojoType="Class" where "Class" is a a fully qualified class name,
			//		like `dijit/form/Button`
			//
			//		Using `data-dojo-type`:
			//		Attributes using can be mixed into the parameters used to instantiate the
			//		Class by using a `data-dojo-props` attribute on the node being converted.
			//		`data-dojo-props` should be a string attribute to be converted from JSON.
			//
			//		Using `dojoType`:
			//		Attributes are read from the original domNode and converted to appropriate
			//		types by looking up the Class prototype values. This is the default behavior
			//		from Dojo 1.0 to Dojo 1.5. `dojoType` support is deprecated, and will
			//		go away in Dojo 2.0.
			// rootNode: DomNode?
			//		A default starting root node from which to start the parsing. Can be
			//		omitted, defaulting to the entire document. If omitted, the `options`
			//		object can be passed in this place. If the `options` object has a
			//		`rootNode` member, that is used.
			// options: Object?
			//		A hash of options.
			//
			//		- noStart: Boolean?:
			//			when set will prevent the parser from calling .startup()
			//			when locating the nodes.
			//		- rootNode: DomNode?:
			//			identical to the function's `rootNode` argument, though
			//			allowed to be passed in via this `options object.
			//		- template: Boolean:
			//			If true, ignores ContentPane's stopParser flag and parses contents inside of
			//			a ContentPane inside of a template.   This allows dojoAttachPoint on widgets/nodes
			//			nested inside the ContentPane to work.
			//		- inherited: Object:
			//			Hash possibly containing dir and lang settings to be applied to
			//			parsed widgets, unless there's another setting on a sub-node that overrides
			//		- scope: String:
			//			Root for attribute names to search for.   If scopeName is dojo,
			//			will search for data-dojo-type (or dojoType).   For backwards compatibility
			//			reasons defaults to dojo._scopeName (which is "dojo" except when
			//			multi-version support is used, when it will be something like dojo16, dojo20, etc.)
			//		- propsThis: Object:
			//			If specified, "this" referenced from data-dojo-props will refer to propsThis.
			//			Intended for use from the widgets-in-template feature of `dijit._WidgetsInTemplateMixin`
			//		- contextRequire: Function:
			//			If specified, this require is utilised for looking resolving modules instead of the
			//			`dojo/parser` context `require()`.  Intended for use from the widgets-in-template feature of
			//			`dijit._WidgetsInTemplateMixin`.
			// returns: Mixed
			//		Returns a blended object that is an array of the instantiated objects, but also can include
			//		a promise that is resolved with the instantiated objects.  This is done for backwards
			//		compatibility.  If the parser auto-requires modules, it will always behave in a promise
			//		fashion and `parser.parse().then(function(instances){...})` should be used.
			// example:
			//		Parse all widgets on a page:
			//	|		parser.parse();
			// example:
			//		Parse all classes within the node with id="foo"
			//	|		parser.parse(dojo.byId('foo'));
			// example:
			//		Parse all classes in a page, but do not call .startup() on any
			//		child
			//	|		parser.parse({ noStart: true })
			// example:
			//		Parse all classes in a node, but do not call .startup()
			//	|		parser.parse(someNode, { noStart:true });
			//	|		// or
			//	|		parser.parse({ noStart:true, rootNode: someNode });

			// determine the root node and options based on the passed arguments.
			var root;
			if(!options && rootNode && rootNode.rootNode){
				options = rootNode;
				root = options.rootNode;
			}else if(rootNode && dlang.isObject(rootNode) && !("nodeType" in rootNode)){
				options = rootNode;
			}else{
				root = rootNode;
			}
			root = root ? dom.byId(root) : dwindow.body();

			options = options || {};

			var mixin = options.template ? { template: true } : {},
				instances = [],
				self = this;

			// First scan for any <script type=dojo/require> nodes, and execute.
			// Then scan for all nodes with data-dojo-type, and load any unloaded modules.
			// Then build the object instances.  Add instances to already existing (but empty) instances[] array,
			// which may already have been returned to caller.  Also, use otherwise to collect and throw any errors
			// that occur during the parse().
			var p =
				this._scanAmd(root, options).then(function(){
					return self.scan(root, options);
				}).then(function(parsedNodes){
					return self._instantiate(parsedNodes, mixin, options, true);
				}).then(function(_instances){
					// Copy the instances into the instances[] array we declared above, and are accessing as
					// our return value.
					return instances = instances.concat(_instances);
				}).otherwise(function(e){
					// TODO Modify to follow better pattern for promise error management when available
					console.error("dojo/parser::parse() error", e);
					throw e;
				});

			// Blend the array with the promise
			dlang.mixin(instances, p);
			return instances;
		}
	};

	if( 1 ){
		dojo.parser = parser;
	}

	// Register the parser callback. It should be the first callback
	// after the a11y test.
	if(config.parseOnLoad){
		ready(100, parser, "parse");
	}

	return parser;
});

},
'dijit/form/_FormMixin':function(){
define([
	"dojo/_base/array", // array.every array.filter array.forEach array.indexOf array.map
	"dojo/_base/declare", // declare
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/_base/lang", // lang.hitch lang.isArray
	"dojo/on",
	"dojo/window" // winUtils.scrollIntoView
], function(array, declare, kernel, lang, on, winUtils){

	// module:
	//		dijit/form/_FormMixin

	return declare("dijit.form._FormMixin", null, {
		// summary:
		//		Mixin for containers of form widgets (i.e. widgets that represent a single value
		//		and can be children of a `<form>` node or `dijit/form/Form` widget)
		// description:
		//		Can extract all the form widgets
		//		values and combine them into a single javascript object, or alternately
		//		take such an object and set the values for all the contained
		//		form widgets

	/*=====
		// value: Object
		//		Name/value hash for each child widget with a name and value.
		//		Child widgets without names are not part of the hash.
		//
		//		If there are multiple child widgets w/the same name, value is an array,
		//		unless they are radio buttons in which case value is a scalar (since only
		//		one radio button can be checked at a time).
		//
		//		If a child widget's name is a dot separated list (like a.b.c.d), it's a nested structure.
		//
		//		Example:
		//	|	{ name: "John Smith", interests: ["sports", "movies"] }
	=====*/

		// state: [readonly] String
		//		Will be "Error" if one or more of the child widgets has an invalid value,
		//		"Incomplete" if not all of the required child widgets are filled in.  Otherwise, "",
		//		which indicates that the form is ready to be submitted.
		state: "",

		// TODO:
		//	* Repeater
		//	* better handling for arrays.  Often form elements have names with [] like
		//	* people[3].sex (for a list of people [{name: Bill, sex: M}, ...])


		_getDescendantFormWidgets: function(/*dijit/_WidgetBase[]?*/ children){
			// summary:
			//		Returns all form widget descendants, searching through non-form child widgets like BorderContainer
			var res = [];
			array.forEach(children || this.getChildren(), function(child){
				if("value" in child){
					res.push(child);
				}else{
					res = res.concat(this._getDescendantFormWidgets(child.getChildren()));
				}
			}, this);
			return res;
		},

		reset: function(){
			array.forEach(this._getDescendantFormWidgets(), function(widget){
				if(widget.reset){
					widget.reset();
				}
			});
		},

		validate: function(){
			// summary:
			//		returns if the form is valid - same as isValid - but
			//		provides a few additional (ui-specific) features:
			//
			//		1. it will highlight any sub-widgets that are not valid
			//		2. it will call focus() on the first invalid sub-widget
			var didFocus = false;
			return array.every(array.map(this._getDescendantFormWidgets(), function(widget){
				// Need to set this so that "required" widgets get their
				// state set.
				widget._hasBeenBlurred = true;
				var valid = widget.disabled || !widget.validate || widget.validate();
				if(!valid && !didFocus){
					// Set focus of the first non-valid widget
					winUtils.scrollIntoView(widget.containerNode || widget.domNode);
					widget.focus();
					didFocus = true;
				}
				return valid;
			}), function(item){ return item; });
		},

		setValues: function(val){
			kernel.deprecated(this.declaredClass+"::setValues() is deprecated. Use set('value', val) instead.", "", "2.0");
			return this.set('value', val);
		},
		_setValueAttr: function(/*Object*/ obj){
			// summary:
			//		Fill in form values from according to an Object (in the format returned by get('value'))

			// generate map from name --> [list of widgets with that name]
			var map = { };
			array.forEach(this._getDescendantFormWidgets(), function(widget){
				if(!widget.name){ return; }
				var entry = map[widget.name] || (map[widget.name] = [] );
				entry.push(widget);
			});

			for(var name in map){
				if(!map.hasOwnProperty(name)){
					continue;
				}
				var widgets = map[name],						// array of widgets w/this name
					values = lang.getObject(name, false, obj);	// list of values for those widgets

				if(values === undefined){
					continue;
				}
				values = [].concat(values);
				if(typeof widgets[0].checked == 'boolean'){
					// for checkbox/radio, values is a list of which widgets should be checked
					array.forEach(widgets, function(w){
						w.set('value', array.indexOf(values, w._get('value')) != -1);
					});
				}else if(widgets[0].multiple){
					// it takes an array (e.g. multi-select)
					widgets[0].set('value', values);
				}else{
					// otherwise, values is a list of values to be assigned sequentially to each widget
					array.forEach(widgets, function(w, i){
						w.set('value', values[i]);
					});
				}
			}

			/***
			 *	TODO: code for plain input boxes (this shouldn't run for inputs that are part of widgets)

			array.forEach(this.containerNode.elements, function(element){
				if(element.name == ''){return};	// like "continue"
				var namePath = element.name.split(".");
				var myObj=obj;
				var name=namePath[namePath.length-1];
				for(var j=1,len2=namePath.length;j<len2;++j){
					var p=namePath[j - 1];
					// repeater support block
					var nameA=p.split("[");
					if(nameA.length > 1){
						if(typeof(myObj[nameA[0]]) == "undefined"){
							myObj[nameA[0]]=[ ];
						} // if

						nameIndex=parseInt(nameA[1]);
						if(typeof(myObj[nameA[0]][nameIndex]) == "undefined"){
							myObj[nameA[0]][nameIndex] = { };
						}
						myObj=myObj[nameA[0]][nameIndex];
						continue;
					} // repeater support ends

					if(typeof(myObj[p]) == "undefined"){
						myObj=undefined;
						break;
					};
					myObj=myObj[p];
				}

				if(typeof(myObj) == "undefined"){
					return;		// like "continue"
				}
				if(typeof(myObj[name]) == "undefined" && this.ignoreNullValues){
					return;		// like "continue"
				}

				// TODO: widget values (just call set('value', ...) on the widget)

				// TODO: maybe should call dojo.getNodeProp() instead
				switch(element.type){
					case "checkbox":
						element.checked = (name in myObj) &&
							array.some(myObj[name], function(val){ return val == element.value; });
						break;
					case "radio":
						element.checked = (name in myObj) && myObj[name] == element.value;
						break;
					case "select-multiple":
						element.selectedIndex=-1;
						array.forEach(element.options, function(option){
							option.selected = array.some(myObj[name], function(val){ return option.value == val; });
						});
						break;
					case "select-one":
						element.selectedIndex="0";
						array.forEach(element.options, function(option){
							option.selected = option.value == myObj[name];
						});
						break;
					case "hidden":
					case "text":
					case "textarea":
					case "password":
						element.value = myObj[name] || "";
						break;
				}
			});
			*/

			// Note: no need to call this._set("value", ...) as the child updates will trigger onChange events
			// which I am monitoring.
		},

		getValues: function(){
			kernel.deprecated(this.declaredClass+"::getValues() is deprecated. Use get('value') instead.", "", "2.0");
			return this.get('value');
		},
		_getValueAttr: function(){
			// summary:
			//		Returns Object representing form values.   See description of `value` for details.
			// description:

			// The value is updated into this.value every time a child has an onChange event,
			// so in the common case this function could just return this.value.   However,
			// that wouldn't work when:
			//
			// 1. User presses return key to submit a form.  That doesn't fire an onchange event,
			// and even if it did it would come too late due to the defer(...) in _handleOnChange()
			//
			// 2. app for some reason calls this.get("value") while the user is typing into a
			// form field.   Not sure if that case needs to be supported or not.

			// get widget values
			var obj = { };
			array.forEach(this._getDescendantFormWidgets(), function(widget){
				var name = widget.name;
				if(!name || widget.disabled){ return; }

				// Single value widget (checkbox, radio, or plain <input> type widget)
				var value = widget.get('value');

				// Store widget's value(s) as a scalar, except for checkboxes which are automatically arrays
				if(typeof widget.checked == 'boolean'){
					if(/Radio/.test(widget.declaredClass)){
						// radio button
						if(value !== false){
							lang.setObject(name, value, obj);
						}else{
							// give radio widgets a default of null
							value = lang.getObject(name, false, obj);
							if(value === undefined){
								lang.setObject(name, null, obj);
							}
						}
					}else{
						// checkbox/toggle button
						var ary=lang.getObject(name, false, obj);
						if(!ary){
							ary=[];
							lang.setObject(name, ary, obj);
						}
						if(value !== false){
							ary.push(value);
						}
					}
				}else{
					var prev=lang.getObject(name, false, obj);
					if(typeof prev != "undefined"){
						if(lang.isArray(prev)){
							prev.push(value);
						}else{
							lang.setObject(name, [prev, value], obj);
						}
					}else{
						// unique name
						lang.setObject(name, value, obj);
					}
				}
			});

			/***
			 * code for plain input boxes (see also domForm.formToObject, can we use that instead of this code?
			 * but it doesn't understand [] notation, presumably)
			var obj = { };
			array.forEach(this.containerNode.elements, function(elm){
				if(!elm.name)	{
					return;		// like "continue"
				}
				var namePath = elm.name.split(".");
				var myObj=obj;
				var name=namePath[namePath.length-1];
				for(var j=1,len2=namePath.length;j<len2;++j){
					var nameIndex = null;
					var p=namePath[j - 1];
					var nameA=p.split("[");
					if(nameA.length > 1){
						if(typeof(myObj[nameA[0]]) == "undefined"){
							myObj[nameA[0]]=[ ];
						} // if
						nameIndex=parseInt(nameA[1]);
						if(typeof(myObj[nameA[0]][nameIndex]) == "undefined"){
							myObj[nameA[0]][nameIndex] = { };
						}
					}else if(typeof(myObj[nameA[0]]) == "undefined"){
						myObj[nameA[0]] = { }
					} // if

					if(nameA.length == 1){
						myObj=myObj[nameA[0]];
					}else{
						myObj=myObj[nameA[0]][nameIndex];
					} // if
				} // for

				if((elm.type != "select-multiple" && elm.type != "checkbox" && elm.type != "radio") || (elm.type == "radio" && elm.checked)){
					if(name == name.split("[")[0]){
						myObj[name]=elm.value;
					}else{
						// can not set value when there is no name
					}
				}else if(elm.type == "checkbox" && elm.checked){
					if(typeof(myObj[name]) == 'undefined'){
						myObj[name]=[ ];
					}
					myObj[name].push(elm.value);
				}else if(elm.type == "select-multiple"){
					if(typeof(myObj[name]) == 'undefined'){
						myObj[name]=[ ];
					}
					for(var jdx=0,len3=elm.options.length; jdx<len3; ++jdx){
						if(elm.options[jdx].selected){
							myObj[name].push(elm.options[jdx].value);
						}
					}
				} // if
				name=undefined;
			}); // forEach
			***/
			return obj;
		},

		isValid: function(){
			// summary:
			//		Returns true if all of the widgets are valid.
			//		Deprecated, will be removed in 2.0.  Use get("state") instead.

			return this.state == "";
		},

		onValidStateChange: function(/*Boolean*/ /*===== isValid =====*/){
			// summary:
			//		Stub function to connect to if you want to do something
			//		(like disable/enable a submit button) when the valid
			//		state changes on the form as a whole.
			//
			//		Deprecated.  Will be removed in 2.0.  Use watch("state", ...) instead.
		},

		_getState: function(){
			// summary:
			//		Compute what this.state should be based on state of children
			var states = array.map(this._descendants, function(w){
				return w.get("state") || "";
			});

			return array.indexOf(states, "Error") >= 0 ? "Error" :
				array.indexOf(states, "Incomplete") >= 0 ? "Incomplete" : "";
		},

		disconnectChildren: function(){
			// summary:
			//		Deprecated method.   Applications no longer need to call this.   Remove for 2.0.
		},

		connectChildren: function(/*Boolean*/ inStartup){
			// summary:
			//		You can call this function directly, ex. in the event that you
			//		programmatically add a widget to the form *after* the form has been
			//		initialized.

			// TODO: rename for 2.0

			this._descendants = this._getDescendantFormWidgets();

			// To get notifications from children they need to be started.   Children didn't used to need to be started,
			// so for back-compat, start them here
			array.forEach(this._descendants, function(child){
				if(!child._started){ child.startup(); }
			});

			if(!inStartup){
				this._onChildChange();
			}
		},

		_onChildChange: function(/*String*/ attr){
			// summary:
			//		Called when child's value or disabled state changes

			// The unit tests expect state update to be synchronous, so update it immediately.
			if(!attr || attr == "state" || attr == "disabled"){
				this._set("state", this._getState());
			}

			// Use defer() to collapse value changes in multiple children into a single
			// update to my value.   Multiple updates will occur on:
			//	1. Form.set()
			//	2. Form.reset()
			//	3. user selecting a radio button (which will de-select another radio button,
			//		 causing two onChange events)
			if(!attr || attr == "value" || attr == "disabled" || attr == "checked"){
				if(this._onChangeDelayTimer){
					this._onChangeDelayTimer.remove();
				}
				this._onChangeDelayTimer = this.defer(function(){
					delete this._onChangeDelayTimer;
					this._set("value", this.get("value"));
				}, 10);
			}
		},

		startup: function(){
			this.inherited(arguments);

			// Set initial this.value and this.state.   Don't emit watch() notifications.
			this._descendants = this._getDescendantFormWidgets();
			this.value = this.get("value");
			this.state = this._getState();

			// Initialize value and valid/invalid state tracking.
			var self = this;
			this.own(
				on(
					this.containerNode,
					"attrmodified-state, attrmodified-disabled, attrmodified-value, attrmodified-checked",
					function(evt){
						if(evt.target == self.domNode){
							return;	// ignore events that I fire on myself because my children changed
						}
						self._onChildChange(evt.type.replace("attrmodified-", ""));
					}
				)
			);

			// Make state change call onValidStateChange(), will be removed in 2.0
			this.watch("state", function(attr, oldVal, newVal){ this.onValidStateChange(newVal == ""); });
		},

		destroy: function(){
			this.inherited(arguments);
		}

	});
});

},
'dijit/_Container':function(){
define([
	"dojo/_base/array", // array.forEach array.indexOf
	"dojo/_base/declare", // declare
	"dojo/dom-construct", // domConstruct.place
	"dojo/_base/kernel" // kernel.deprecated
], function(array, declare, domConstruct, kernel){

	// module:
	//		dijit/_Container

	return declare("dijit._Container", null, {
		// summary:
		//		Mixin for widgets that contain HTML and/or a set of widget children.

		buildRendering: function(){
			this.inherited(arguments);
			if(!this.containerNode){
				// All widgets with descendants must set containerNode.
				// NB: this code doesn't quite work right because for TabContainer it runs before
				// _TemplatedMixin::buildRendering(), and thus
				// sets this.containerNode to this.domNode, later to be overridden by the assignment in the template.
				this.containerNode = this.domNode;
			}
		},

		addChild: function(/*dijit/_WidgetBase*/ widget, /*int?*/ insertIndex){
			// summary:
			//		Makes the given widget a child of this widget.
			// description:
			//		Inserts specified child widget's dom node as a child of this widget's
			//		container node, and possibly does other processing (such as layout).

			// I want to just call domConstruct.place(widget.domNode, this.containerNode, insertIndex), but the counting
			// is thrown off by text nodes and comment nodes that show up when constructed by markup.
			// In the future consider stripping those nodes on construction, either in the parser or this widget code.
			var refNode = this.containerNode;
			if(insertIndex > 0){
				// Old-school way to get nth child; dojo.query would be easier but _Container was weened from dojo.query
				// in #10087 to minimize download size.   Not sure if that's still and issue with new smaller dojo/query.
				refNode = refNode.firstChild;
				while(insertIndex > 0){
					if(refNode.nodeType == 1){ insertIndex--; }
					refNode = refNode.nextSibling;
				}
				if(refNode){
					insertIndex = "before";
				}else{
					// to support addChild(child, n-1) where there are n children (should add child at end)
					refNode = this.containerNode;
					insertIndex = "last";
				}
			}

			domConstruct.place(widget.domNode, refNode, insertIndex);

			// If I've been started but the child widget hasn't been started,
			// start it now.  Make sure to do this after widget has been
			// inserted into the DOM tree, so it can see that it's being controlled by me,
			// so it doesn't try to size itself.
			if(this._started && !widget._started){
				widget.startup();
			}
		},

		removeChild: function(/*Widget|int*/ widget){
			// summary:
			//		Removes the passed widget instance from this widget but does
			//		not destroy it.  You can also pass in an integer indicating
			//		the index within the container to remove (ie, removeChild(5) removes the sixth widget).

			if(typeof widget == "number"){
				widget = this.getChildren()[widget];
			}

			if(widget){
				var node = widget.domNode;
				if(node && node.parentNode){
					node.parentNode.removeChild(node); // detach but don't destroy
				}
			}
		},

		hasChildren: function(){
			// summary:
			//		Returns true if widget has child widgets, i.e. if this.containerNode contains widgets.
			return this.getChildren().length > 0;	// Boolean
		},

		_getSiblingOfChild: function(/*dijit/_WidgetBase*/ child, /*int*/ dir){
			// summary:
			//		Get the next or previous widget sibling of child
			// dir:
			//		if 1, get the next sibling
			//		if -1, get the previous sibling
			// tags:
			//		private
			kernel.deprecated(this.declaredClass+"::_getSiblingOfChild() is deprecated. Use _KeyNavMixin::_getNext() instead.", "", "2.0");
			var children = this.getChildren(),
				idx = array.indexOf(children, child);	// int
			return children[idx + dir];
		},

		getIndexOfChild: function(/*dijit/_WidgetBase*/ child){
			// summary:
			//		Gets the index of the child in this container or -1 if not found
			return array.indexOf(this.getChildren(), child);	// int
		}
	});
});

},
'dojo/cldr/supplemental':function(){
define(["../_base/lang", "../i18n"], function(lang, i18n){

// module:
//		dojo/cldr/supplemental


var supplemental = {
	// summary:
	//		TODOC
};
lang.setObject("dojo.cldr.supplemental", supplemental);

supplemental.getFirstDayOfWeek = function(/*String?*/locale){
	// summary:
	//		Returns a zero-based index for first day of the week
	// description:
	//		Returns a zero-based index for first day of the week, as used by the local (Gregorian) calendar.
	//		e.g. Sunday (returns 0), or Monday (returns 1)

	// from http://www.unicode.org/cldr/data/common/supplemental/supplementalData.xml:supplementalData/weekData/firstDay
	var firstDay = {/*default is 1=Monday*/
		bd:5,mv:5,
		ae:6,af:6,bh:6,dj:6,dz:6,eg:6,iq:6,ir:6,jo:6,kw:6,
		ly:6,ma:6,om:6,qa:6,sa:6,sd:6,sy:6,ye:6,
		ag:0,ar:0,as:0,au:0,br:0,bs:0,bt:0,bw:0,by:0,bz:0,ca:0,cn:0,
		co:0,dm:0,'do':0,et:0,gt:0,gu:0,hk:0,hn:0,id:0,ie:0,il:0,'in':0,
		jm:0,jp:0,ke:0,kh:0,kr:0,la:0,mh:0,mm:0,mo:0,mt:0,mx:0,mz:0,
		ni:0,np:0,nz:0,pa:0,pe:0,ph:0,pk:0,pr:0,py:0,sg:0,sv:0,th:0,
		tn:0,tt:0,tw:0,um:0,us:0,ve:0,vi:0,ws:0,za:0,zw:0
	};

	var country = supplemental._region(locale);
	var dow = firstDay[country];
	return (dow === undefined) ? 1 : dow; /*Number*/
};

supplemental._region = function(/*String?*/locale){
	locale = i18n.normalizeLocale(locale);
	var tags = locale.split('-');
	var region = tags[1];
	if(!region){
		// IE often gives language only (#2269)
		// Arbitrary mappings of language-only locales to a country:
		region = {
			aa:"et", ab:"ge", af:"za", ak:"gh", am:"et", ar:"eg", as:"in", av:"ru", ay:"bo", az:"az", ba:"ru",
			be:"by", bg:"bg", bi:"vu", bm:"ml", bn:"bd", bo:"cn", br:"fr", bs:"ba", ca:"es", ce:"ru", ch:"gu",
			co:"fr", cr:"ca", cs:"cz", cv:"ru", cy:"gb", da:"dk", de:"de", dv:"mv", dz:"bt", ee:"gh", el:"gr",
			en:"us", es:"es", et:"ee", eu:"es", fa:"ir", ff:"sn", fi:"fi", fj:"fj", fo:"fo", fr:"fr", fy:"nl",
			ga:"ie", gd:"gb", gl:"es", gn:"py", gu:"in", gv:"gb", ha:"ng", he:"il", hi:"in", ho:"pg", hr:"hr",
			ht:"ht", hu:"hu", hy:"am", ia:"fr", id:"id", ig:"ng", ii:"cn", ik:"us", "in":"id", is:"is", it:"it",
			iu:"ca", iw:"il", ja:"jp", ji:"ua", jv:"id", jw:"id", ka:"ge", kg:"cd", ki:"ke", kj:"na", kk:"kz",
			kl:"gl", km:"kh", kn:"in", ko:"kr", ks:"in", ku:"tr", kv:"ru", kw:"gb", ky:"kg", la:"va", lb:"lu",
			lg:"ug", li:"nl", ln:"cd", lo:"la", lt:"lt", lu:"cd", lv:"lv", mg:"mg", mh:"mh", mi:"nz", mk:"mk",
			ml:"in", mn:"mn", mo:"ro", mr:"in", ms:"my", mt:"mt", my:"mm", na:"nr", nb:"no", nd:"zw", ne:"np",
			ng:"na", nl:"nl", nn:"no", no:"no", nr:"za", nv:"us", ny:"mw", oc:"fr", om:"et", or:"in", os:"ge",
			pa:"in", pl:"pl", ps:"af", pt:"br", qu:"pe", rm:"ch", rn:"bi", ro:"ro", ru:"ru", rw:"rw", sa:"in",
			sd:"in", se:"no", sg:"cf", si:"lk", sk:"sk", sl:"si", sm:"ws", sn:"zw", so:"so", sq:"al", sr:"rs",
			ss:"za", st:"za", su:"id", sv:"se", sw:"tz", ta:"in", te:"in", tg:"tj", th:"th", ti:"et", tk:"tm",
			tl:"ph", tn:"za", to:"to", tr:"tr", ts:"za", tt:"ru", ty:"pf", ug:"cn", uk:"ua", ur:"pk", uz:"uz",
			ve:"za", vi:"vn", wa:"be", wo:"sn", xh:"za", yi:"il", yo:"ng", za:"cn", zh:"cn", zu:"za",
			ace:"id", ady:"ru", agq:"cm", alt:"ru", amo:"ng", asa:"tz", ast:"es", awa:"in", bal:"pk",
			ban:"id", bas:"cm", bax:"cm", bbc:"id", bem:"zm", bez:"tz", bfq:"in", bft:"pk", bfy:"in",
			bhb:"in", bho:"in", bik:"ph", bin:"ng", bjj:"in", bku:"ph", bqv:"ci", bra:"in", brx:"in",
			bss:"cm", btv:"pk", bua:"ru", buc:"yt", bug:"id", bya:"id", byn:"er", cch:"ng", ccp:"in",
			ceb:"ph", cgg:"ug", chk:"fm", chm:"ru", chp:"ca", chr:"us", cja:"kh", cjm:"vn", ckb:"iq",
			crk:"ca", csb:"pl", dar:"ru", dav:"ke", den:"ca", dgr:"ca", dje:"ne", doi:"in", dsb:"de",
			dua:"cm", dyo:"sn", dyu:"bf", ebu:"ke", efi:"ng", ewo:"cm", fan:"gq", fil:"ph", fon:"bj",
			fur:"it", gaa:"gh", gag:"md", gbm:"in", gcr:"gf", gez:"et", gil:"ki", gon:"in", gor:"id",
			grt:"in", gsw:"ch", guz:"ke", gwi:"ca", haw:"us", hil:"ph", hne:"in", hnn:"ph", hoc:"in",
			hoj:"in", ibb:"ng", ilo:"ph", inh:"ru", jgo:"cm", jmc:"tz", kaa:"uz", kab:"dz", kaj:"ng",
			kam:"ke", kbd:"ru", kcg:"ng", kde:"tz", kdt:"th", kea:"cv", ken:"cm", kfo:"ci", kfr:"in",
			kha:"in", khb:"cn", khq:"ml", kht:"in", kkj:"cm", kln:"ke", kmb:"ao", koi:"ru", kok:"in",
			kos:"fm", kpe:"lr", krc:"ru", kri:"sl", krl:"ru", kru:"in", ksb:"tz", ksf:"cm", ksh:"de",
			kum:"ru", lag:"tz", lah:"pk", lbe:"ru", lcp:"cn", lep:"in", lez:"ru", lif:"np", lis:"cn",
			lki:"ir", lmn:"in", lol:"cd", lua:"cd", luo:"ke", luy:"ke", lwl:"th", mad:"id", mag:"in",
			mai:"in", mak:"id", man:"gn", mas:"ke", mdf:"ru", mdh:"ph", mdr:"id", men:"sl", mer:"ke",
			mfe:"mu", mgh:"mz", mgo:"cm", min:"id", mni:"in", mnk:"gm", mnw:"mm", mos:"bf", mua:"cm",
			mwr:"in", myv:"ru", nap:"it", naq:"na", nds:"de", "new":"np", niu:"nu", nmg:"cm", nnh:"cm",
			nod:"th", nso:"za", nus:"sd", nym:"tz", nyn:"ug", pag:"ph", pam:"ph", pap:"bq", pau:"pw",
			pon:"fm", prd:"ir", raj:"in", rcf:"re", rej:"id", rjs:"np", rkt:"in", rof:"tz", rwk:"tz",
			saf:"gh", sah:"ru", saq:"ke", sas:"id", sat:"in", saz:"in", sbp:"tz", scn:"it", sco:"gb",
			sdh:"ir", seh:"mz", ses:"ml", shi:"ma", shn:"mm", sid:"et", sma:"se", smj:"se", smn:"fi",
			sms:"fi", snk:"ml", srn:"sr", srr:"sn", ssy:"er", suk:"tz", sus:"gn", swb:"yt", swc:"cd",
			syl:"bd", syr:"sy", tbw:"ph", tcy:"in", tdd:"cn", tem:"sl", teo:"ug", tet:"tl", tig:"er",
			tiv:"ng", tkl:"tk", tmh:"ne", tpi:"pg", trv:"tw", tsg:"ph", tts:"th", tum:"mw", tvl:"tv",
			twq:"ne", tyv:"ru", tzm:"ma", udm:"ru", uli:"fm", umb:"ao", unr:"in", unx:"in", vai:"lr",
			vun:"tz", wae:"ch", wal:"et", war:"ph", xog:"ug", xsr:"np", yao:"mz", yap:"fm", yav:"cm", zza:"tr"
		}[tags[0]];
	}else if(region.length == 4){
		// The ISO 3166 country code is usually in the second position, unless a
		// 4-letter script is given. See http://www.ietf.org/rfc/rfc4646.txt
		region = tags[2];
	}
	return region;
};

supplemental.getWeekend = function(/*String?*/locale){
	// summary:
	//		Returns a hash containing the start and end days of the weekend
	// description:
	//		Returns a hash containing the start and end days of the weekend according to local custom using locale,
	//		or by default in the user's locale.
	//		e.g. {start:6, end:0}

	// from http://www.unicode.org/cldr/data/common/supplemental/supplementalData.xml:supplementalData/weekData/weekend{Start,End}
	var weekendStart = {/*default is 6=Saturday*/
			'in':0,
			af:4,dz:4,ir:4,om:4,sa:4,ye:4,
			ae:5,bh:5,eg:5,il:5,iq:5,jo:5,kw:5,ly:5,ma:5,qa:5,sd:5,sy:5,tn:5
		},

		weekendEnd = {/*default is 0=Sunday*/
			af:5,dz:5,ir:5,om:5,sa:5,ye:5,
			ae:6,bh:5,eg:6,il:6,iq:6,jo:6,kw:6,ly:6,ma:6,qa:6,sd:6,sy:6,tn:6
		},

		country = supplemental._region(locale),
		start = weekendStart[country],
		end = weekendEnd[country];

	if(start === undefined){start=6;}
	if(end === undefined){end=0;}
	return {start:start, end:end}; /*Object {start,end}*/
};

return supplemental;
});

},
'dijit/a11yclick':function(){
define([
	"dojo/keys", // keys.ENTER keys.SPACE
	"dojo/mouse",
	"dojo/on",
	"dojo/touch" // touch support for click is now there
], function(keys, mouse, on, touch){

	// module:
	//		dijit/a11yclick

	/*=====
	return {
		// summary:
		//		Custom press, release, and click synthetic events
		//		which trigger on a left mouse click, touch, or space/enter keyup.

		click: function(node, listener){
			// summary:
			//		Logical click operation for mouse, touch, or keyboard (space/enter key)
		},
		press: function(node, listener){
			// summary:
			//		Mousedown (left button), touchstart, or keydown (space or enter) corresponding to logical click operation.
		},
		release: function(node, listener){
			// summary:
			//		Mouseup (left button), touchend, or keyup (space or enter) corresponding to logical click operation.
		},
		move: function(node, listener){
			// summary:
			//		Mouse cursor or a finger is dragged over the given node.
		}
	};
	=====*/

	function clickKey(/*Event*/ e){
		// Test if this keyboard event should be tracked as the start (if keydown) or end (if keyup) of a click event.
		// Only track for nodes marked to be tracked, and not for buttons or inputs,
		// since buttons handle keyboard click natively, and text inputs should not
		// prevent typing spaces or newlines.
		if((e.keyCode === keys.ENTER || e.keyCode === keys.SPACE) && !/input|button|textarea/i.test(e.target.nodeName)){

			// Test if a node or its ancestor has been marked with the dojoClick property to indicate special processing
			for(var node = e.target; node; node = node.parentNode){
				if(node.dojoClick){ return true; }
			}
		}
	}

	var lastKeyDownNode;

	on(document, "keydown", function(e){
		//console.log("a11yclick: onkeydown, e.target = ", e.target, ", lastKeyDownNode was ", lastKeyDownNode, ", equality is ", (e.target === lastKeyDownNode));
		if(clickKey(e)){
			// needed on IE for when focus changes between keydown and keyup - otherwise dropdown menus do not work
			lastKeyDownNode = e.target;

			// Prevent viewport scrolling on space key in IE<9.
			// (Reproducible on test_Button.html on any of the first dijit/form/Button examples)
			e.preventDefault();
		}else{
			lastKeyDownNode = null;
		}
	});

	on(document, "keyup", function(e){
		//console.log("a11yclick: onkeyup, e.target = ", e.target, ", lastKeyDownNode was ", lastKeyDownNode, ", equality is ", (e.target === lastKeyDownNode));
		if(clickKey(e) && e.target == lastKeyDownNode){	// === breaks greasemonkey
			//need reset here or have problems in FF when focus returns to trigger element after closing popup/alert
			lastKeyDownNode = null;

			on.emit(e.target, "click", {
				cancelable: true,
				bubbles: true,
				ctrlKey: e.ctrlKey,
				shiftKey: e.shiftKey,
				metaKey: e.metaKey,
				altKey: e.altKey,
				_origType: e.type
			});
		}
	});

	// I want to return a hash of the synthetic events, but for backwards compatibility the main return value
	// needs to be the click event.   Change for 2.0.

	var click = function(node, listener){
		// Set flag on node so that keydown/keyup above emits click event
		node.dojoClick = true;

		return on(node, "click", listener);
	};
	click.click = click;	// forward compatibility with 2.0

	click.press =  function(node, listener){
		var touchListener = on(node, touch.press, function(evt){
			if(evt.type == "mousedown" && !mouse.isLeft(evt)){
				// Ignore right click
				return;
			}
			listener(evt);
		}), keyListener = on(node, "keydown", function(evt){
			if(evt.keyCode === keys.ENTER || evt.keyCode === keys.SPACE){
				listener(evt);
			}
		});
		return {
			remove: function(){
				touchListener.remove();
				keyListener.remove();
			}
		};
	};

	click.release =  function(node, listener){
		var touchListener = on(node, touch.release, function(evt){
			if(evt.type == "mouseup" && !mouse.isLeft(evt)){
				// Ignore right click
				return;
			}
			listener(evt);
		}), keyListener = on(node, "keyup", function(evt){
			if(evt.keyCode === keys.ENTER || evt.keyCode === keys.SPACE){
				listener(evt);
			}
		});
		return {
			remove: function(){
				touchListener.remove();
				keyListener.remove();
			}
		};
	};

	click.move = touch.move;	// just for convenience

	return click;
});

},
'dijit/Editor':function(){
define([
	"require",
	"dojo/_base/array", // array.forEach
	"dojo/_base/declare", // declare
	"dojo/Deferred", // Deferred
	"dojo/i18n", // i18n.getLocalization
	"dojo/dom-attr", // domAttr.set
	"dojo/dom-class", // domClass.add
	"dojo/dom-geometry",
	"dojo/dom-style", // domStyle.set, get
	"dojo/keys", // keys.F1 keys.F15 keys.TAB
	"dojo/_base/lang", // lang.getObject lang.hitch
	"dojo/sniff", // has("ie") has("mac") has("webkit")
	"dojo/string", // string.substitute
	"dojo/topic", // topic.publish()
	"./_Container",
	"./Toolbar",
	"./ToolbarSeparator",
	"./layout/_LayoutWidget",
	"./form/ToggleButton",
	"./_editor/_Plugin",
	"./_editor/plugins/EnterKeyHandling",
	"./_editor/html",
	"./_editor/range",
	"./_editor/RichText",
	"./main", // dijit._scopeName
	"dojo/i18n!./_editor/nls/commands"
], function(require, array, declare, Deferred, i18n, domAttr, domClass, domGeometry, domStyle,
			keys, lang, has, string, topic,
			_Container, Toolbar, ToolbarSeparator, _LayoutWidget, ToggleButton,
			_Plugin, EnterKeyHandling, html, rangeapi, RichText, dijit){

	// module:
	//		dijit/Editor

	var Editor = declare("dijit.Editor", RichText, {
		// summary:
		//		A rich text Editing widget
		//
		// description:
		//		This widget provides basic WYSIWYG editing features, based on the browser's
		//		underlying rich text editing capability, accompanied by a toolbar (`dijit.Toolbar`).
		//		A plugin model is available to extend the editor's capabilities as well as the
		//		the options available in the toolbar.  Content generation may vary across
		//		browsers, and clipboard operations may have different results, to name
		//		a few limitations.  Note: this widget should not be used with the HTML
		//		&lt;TEXTAREA&gt; tag -- see dijit/_editor/RichText for details.

		// plugins: [const] Object[]
		//		A list of plugin names (as strings) or instances (as objects)
		//		for this widget.
		//
		//		When declared in markup, it might look like:
		//	|	plugins="['bold',{name:'dijit._editor.plugins.FontChoice', command:'fontName', generic:true}]"
		plugins: null,

		// extraPlugins: [const] Object[]
		//		A list of extra plugin names which will be appended to plugins array
		extraPlugins: null,

		constructor: function(/*===== params, srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Initial settings for any of the attributes, except readonly attributes.
			// srcNodeRef: DOMNode
			//		The editor replaces the specified DOMNode.

			if(!lang.isArray(this.plugins)){
				this.plugins = ["undo", "redo", "|", "cut", "copy", "paste", "|", "bold", "italic", "underline", "strikethrough", "|",
					"insertOrderedList", "insertUnorderedList", "indent", "outdent", "|", "justifyLeft", "justifyRight", "justifyCenter", "justifyFull",
					EnterKeyHandling /*, "createLink"*/];
			}

			this._plugins = [];
			this._editInterval = this.editActionInterval * 1000;

			//IE will always lose focus when other element gets focus, while for FF and safari,
			//when no iframe is used, focus will be lost whenever another element gets focus.
			//For IE, we can connect to onBeforeDeactivate, which will be called right before
			//the focus is lost, so we can obtain the selected range. For other browsers,
			//no equivalent of onBeforeDeactivate, so we need to do two things to make sure
			//selection is properly saved before focus is lost: 1) when user clicks another
			//element in the page, in which case we listen to mousedown on the entire page and
			//see whether user clicks out of a focus editor, if so, save selection (focus will
			//only lost after onmousedown event is fired, so we can obtain correct caret pos.)
			//2) when user tabs away from the editor, which is handled in onKeyDown below.
			if(has("ie")){
				this.events.push("onBeforeDeactivate");
				this.events.push("onBeforeActivate");
			}
		},

		postMixInProperties: function(){
			// summary:
			//	Extension to make sure a deferred is in place before certain functions
			//	execute, like making sure all the plugins are properly inserted.

			// Set up a deferred so that the value isn't applied to the editor
			// until all the plugins load, needed to avoid timing condition
			// reported in #10537.
			this.setValueDeferred = new Deferred();
			this.inherited(arguments);
		},

		postCreate: function(){
			this.inherited(arguments);

			//for custom undo/redo, if enabled.
			this._steps = this._steps.slice(0);
			this._undoedSteps = this._undoedSteps.slice(0);

			if(lang.isArray(this.extraPlugins)){
				this.plugins = this.plugins.concat(this.extraPlugins);
			}

			this.commands = i18n.getLocalization("dijit._editor", "commands", this.lang);

			if(has("webkit")){
				// Disable selecting the entire editor by inadvertent double-clicks.
				// on buttons, title bar, etc.  Otherwise clicking too fast on
				// a button such as undo/redo selects the entire editor.
				domStyle.set(this.domNode, "KhtmlUserSelect", "none");
			}
		},

		startup: function(){

			this.inherited(arguments);

			if(!this.toolbar){
				// if we haven't been assigned a toolbar, create one
				this.toolbar = new Toolbar({
					ownerDocument: this.ownerDocument,
					dir: this.dir,
					lang: this.lang,
					"aria-label": this.id
				});
				this.header.appendChild(this.toolbar.domNode);
			}

			array.forEach(this.plugins, this.addPlugin, this);

			// Okay, denote the value can now be set.
			this.setValueDeferred.resolve(true);

			domClass.add(this.iframe.parentNode, "dijitEditorIFrameContainer");
			domClass.add(this.iframe, "dijitEditorIFrame");
			domAttr.set(this.iframe, "allowTransparency", true);

			this.toolbar.startup();
			this.onNormalizedDisplayChanged(); //update toolbar button status
		},

		destroy: function(){
			array.forEach(this._plugins, function(p){
				if(p && p.destroy){
					p.destroy();
				}
			});
			this._plugins = [];
			this.toolbar.destroyRecursive();
			delete this.toolbar;
			this.inherited(arguments);
		},
		addPlugin: function(/*String||Object||Function*/ plugin, /*Integer?*/ index){
			// summary:
			//		takes a plugin name as a string or a plugin instance and
			//		adds it to the toolbar and associates it with this editor
			//		instance. The resulting plugin is added to the Editor's
			//		plugins array. If index is passed, it's placed in the plugins
			//		array at that index. No big magic, but a nice helper for
			//		passing in plugin names via markup.
			// plugin:
			//		String, args object, plugin instance, or plugin constructor
			// args:
			//		This object will be passed to the plugin constructor
			// index:
			//		Used when creating an instance from
			//		something already in this.plugins. Ensures that the new
			//		instance is assigned to this.plugins at that index.
			var args = lang.isString(plugin) ? {name: plugin} : lang.isFunction(plugin) ? {ctor: plugin} : plugin;
			if(!args.setEditor){
				var o = {"args": args, "plugin": null, "editor": this};
				if(args.name){
					// search registry for a plugin factory matching args.name, if it's not there then
					// fallback to 1.0 API:
					// ask all loaded plugin modules to fill in o.plugin if they can (ie, if they implement args.name)
					// remove fallback for 2.0.
					if(_Plugin.registry[args.name]){
						o.plugin = _Plugin.registry[args.name](args);
					}else{
						topic.publish(dijit._scopeName + ".Editor.getPlugin", o);	// publish
					}
				}
				if(!o.plugin){
					try{
						// TODO: remove lang.getObject() call in 2.0
						var pc = args.ctor || lang.getObject(args.name) || require(args.name);
						if(pc){
							o.plugin = new pc(args);
						}
					}catch(e){
						throw new Error(this.id + ": cannot find plugin [" + args.name + "]");
					}
				}
				if(!o.plugin){
					throw new Error(this.id + ": cannot find plugin [" + args.name + "]");
				}
				plugin = o.plugin;
			}
			if(arguments.length > 1){
				this._plugins[index] = plugin;
			}else{
				this._plugins.push(plugin);
			}
			plugin.setEditor(this);
			if(lang.isFunction(plugin.setToolbar)){
				plugin.setToolbar(this.toolbar);
			}
		},

		//the following 2 functions are required to make the editor play nice under a layout widget, see #4070

		resize: function(size){
			// summary:
			//		Resize the editor to the specified size, see `dijit/layout/_LayoutWidget.resize()`
			if(size){
				// we've been given a height/width for the entire editor (toolbar + contents), calls layout()
				// to split the allocated size between the toolbar and the contents
				_LayoutWidget.prototype.resize.apply(this, arguments);
			}
			/*
			 else{
			 // do nothing, the editor is already laid out correctly.   The user has probably specified
			 // the height parameter, which was used to set a size on the iframe
			 }
			 */
		},
		layout: function(){
			// summary:
			//		Called from `dijit/layout/_LayoutWidget.resize()`.  This shouldn't be called directly
			// tags:
			//		protected

			// Converts the iframe (or rather the <div> surrounding it) to take all the available space
			// except what's needed for the header (toolbars) and footer (breadcrumbs, etc).
			// A class was added to the iframe container and some themes style it, so we have to
			// calc off the added margins and padding too. See tracker: #10662
			var areaHeight = (this._contentBox.h -
				(this.getHeaderHeight() + this.getFooterHeight() +
					domGeometry.getPadBorderExtents(this.iframe.parentNode).h +
					domGeometry.getMarginExtents(this.iframe.parentNode).h));
			this.editingArea.style.height = areaHeight + "px";
			if(this.iframe){
				this.iframe.style.height = "100%";
			}
			this._layoutMode = true;
		},

		_onIEMouseDown: function(/*Event*/ e){
			// summary:
			//		IE only to prevent 2 clicks to focus
			// tags:
			//		private
			var outsideClientArea;
			// IE 8's componentFromPoint is broken, which is a shame since it
			// was smaller code, but oh well.  We have to do this brute force
			// to detect if the click was scroller or not.
			var b = this.document.body;
			var clientWidth = b.clientWidth;
			var clientHeight = b.clientHeight;
			var clientLeft = b.clientLeft;
			var offsetWidth = b.offsetWidth;
			var offsetHeight = b.offsetHeight;
			var offsetLeft = b.offsetLeft;

			//Check for vertical scroller click.
			if(/^rtl$/i.test(b.dir || "")){
				if(clientWidth < offsetWidth && e.x > clientWidth && e.x < offsetWidth){
					// Check the click was between width and offset width, if so, scroller
					outsideClientArea = true;
				}
			}else{
				// RTL mode, we have to go by the left offsets.
				if(e.x < clientLeft && e.x > offsetLeft){
					// Check the click was between width and offset width, if so, scroller
					outsideClientArea = true;
				}
			}
			if(!outsideClientArea){
				// Okay, might be horiz scroller, check that.
				if(clientHeight < offsetHeight && e.y > clientHeight && e.y < offsetHeight){
					// Horizontal scroller.
					outsideClientArea = true;
				}
			}
			if(!outsideClientArea){
				delete this._cursorToStart; // Remove the force to cursor to start position.
				delete this._savedSelection; // new mouse position overrides old selection
				if(e.target.tagName == "BODY"){
					this.defer("placeCursorAtEnd");
				}
				this.inherited(arguments);
			}
		},
		onBeforeActivate: function(){
			this._restoreSelection();
		},
		onBeforeDeactivate: function(e){
			// summary:
			//		Called on IE right before focus is lost.   Saves the selected range.
			// tags:
			//		private
			if(this.customUndo){
				this.endEditing(true);
			}
			//in IE, the selection will be lost when other elements get focus,
			//let's save focus before the editor is deactivated
			if(e.target.tagName != "BODY"){
				this._saveSelection();
			}
			//console.log('onBeforeDeactivate',this);
		},

		/* beginning of custom undo/redo support */

		// customUndo: Boolean
		//		Whether we shall use custom undo/redo support instead of the native
		//		browser support. By default, we now use custom undo.  It works better
		//		than native browser support and provides a consistent behavior across
		//		browsers with a minimal performance hit.  We already had the hit on
		//		the slowest browser, IE, anyway.
		customUndo: true,

		// editActionInterval: Integer
		//		When using customUndo, not every keystroke will be saved as a step.
		//		Instead typing (including delete) will be grouped together: after
		//		a user stops typing for editActionInterval seconds, a step will be
		//		saved; if a user resume typing within editActionInterval seconds,
		//		the timeout will be restarted. By default, editActionInterval is 3
		//		seconds.
		editActionInterval: 3,

		beginEditing: function(cmd){
			// summary:
			//		Called to note that the user has started typing alphanumeric characters, if it's not already noted.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private
			if(!this._inEditing){
				this._inEditing = true;
				this._beginEditing(cmd);
			}
			if(this.editActionInterval > 0){
				if(this._editTimer){
					this._editTimer.remove();
				}
				this._editTimer = this.defer("endEditing", this._editInterval);
			}
		},

		// TODO: declaring these in the prototype is meaningless, just create in the constructor/postCreate
		_steps: [],
		_undoedSteps: [],

		execCommand: function(cmd){
			// summary:
			//		Main handler for executing any commands to the editor, like paste, bold, etc.
			//		Called by plugins, but not meant to be called by end users.
			// tags:
			//		protected
			if(this.customUndo && (cmd == 'undo' || cmd == 'redo')){
				return this[cmd]();
			}else{
				if(this.customUndo){
					this.endEditing();
					this._beginEditing();
				}
				var r = this.inherited(arguments);
				if(this.customUndo){
					this._endEditing();
				}
				return r;
			}
		},

		_pasteImpl: function(){
			// summary:
			//		Over-ride of paste command control to make execCommand cleaner
			// tags:
			//		Protected
			return this._clipboardCommand("paste");
		},

		_cutImpl: function(){
			// summary:
			//		Over-ride of cut command control to make execCommand cleaner
			// tags:
			//		Protected
			return this._clipboardCommand("cut");
		},

		_copyImpl: function(){
			// summary:
			//		Over-ride of copy command control to make execCommand cleaner
			// tags:
			//		Protected
			return this._clipboardCommand("copy");
		},

		_clipboardCommand: function(cmd){
			// summary:
			//		Function to handle processing clipboard commands (or at least try to).
			// tags:
			//		Private
			var r;
			try{
				// Try to exec the superclass exec-command and see if it works.
				r = this.document.execCommand(cmd, false, null);
				if(has("webkit") && !r){ //see #4598: webkit does not guarantee clipboard support from js
					throw { code: 1011 }; // throw an object like Mozilla's error
				}
			}catch(e){
				//TODO: when else might we get an exception?  Do we need the Mozilla test below?
				if(e.code == 1011 /* Mozilla: service denied */ ||
					(e.code == 9 && has("opera") /* Opera not supported */)){
					// Warn user of platform limitation.  Cannot programmatically access clipboard. See ticket #4136
					var sub = string.substitute,
						accel = {cut: 'X', copy: 'C', paste: 'V'};
					alert(sub(this.commands.systemShortcut,
						[this.commands[cmd], sub(this.commands[has("mac") ? 'appleKey' : 'ctrlKey'], [accel[cmd]])]));
				}
				r = false;
			}
			return r;
		},

		queryCommandEnabled: function(cmd){
			// summary:
			//		Returns true if specified editor command is enabled.
			//		Used by the plugins to know when to highlight/not highlight buttons.
			// tags:
			//		protected
			if(this.customUndo && (cmd == 'undo' || cmd == 'redo')){
				return cmd == 'undo' ? (this._steps.length > 1) : (this._undoedSteps.length > 0);
			}else{
				return this.inherited(arguments);
			}
		},
		_moveToBookmark: function(b){
			// summary:
			//		Selects the text specified in bookmark b
			// tags:
			//		private
			var bookmark = b.mark;
			var mark = b.mark;
			var col = b.isCollapsed;
			var r, sNode, eNode, sel;
			if(mark){
				if(has("ie") < 9 || (has("ie") === 9 && has("quirks"))){
					if(lang.isArray(mark)){
						// IE CONTROL, have to use the native bookmark.
						bookmark = [];
						array.forEach(mark, function(n){
							bookmark.push(rangeapi.getNode(n, this.editNode));
						}, this);
						this.selection.moveToBookmark({mark: bookmark, isCollapsed: col});
					}else{
						if(mark.startContainer && mark.endContainer){
							// Use the pseudo WC3 range API.  This works better for positions
							// than the IE native bookmark code.
							sel = rangeapi.getSelection(this.window);
							if(sel && sel.removeAllRanges){
								sel.removeAllRanges();
								r = rangeapi.create(this.window);
								sNode = rangeapi.getNode(mark.startContainer, this.editNode);
								eNode = rangeapi.getNode(mark.endContainer, this.editNode);
								if(sNode && eNode){
									// Okay, we believe we found the position, so add it into the selection
									// There are cases where it may not be found, particularly in undo/redo, when
									// IE changes the underlying DOM on us (wraps text in a <p> tag or similar.
									// So, in those cases, don't bother restoring selection.
									r.setStart(sNode, mark.startOffset);
									r.setEnd(eNode, mark.endOffset);
									sel.addRange(r);
								}
							}
						}
					}
				}else{//w3c range
					sel = rangeapi.getSelection(this.window);
					if(sel && sel.removeAllRanges){
						sel.removeAllRanges();
						r = rangeapi.create(this.window);
						sNode = rangeapi.getNode(mark.startContainer, this.editNode);
						eNode = rangeapi.getNode(mark.endContainer, this.editNode);
						if(sNode && eNode){
							// Okay, we believe we found the position, so add it into the selection
							// There are cases where it may not be found, particularly in undo/redo, when
							// formatting as been done and so on, so don't restore selection then.
							r.setStart(sNode, mark.startOffset);
							r.setEnd(eNode, mark.endOffset);
							sel.addRange(r);
						}
					}
				}
			}
		},
		_changeToStep: function(from, to){
			// summary:
			//		Reverts editor to "to" setting, from the undo stack.
			// tags:
			//		private
			this.setValue(to.text);
			var b = to.bookmark;
			if(!b){
				return;
			}
			this._moveToBookmark(b);
		},
		undo: function(){
			// summary:
			//		Handler for editor undo (ex: ctrl-z) operation
			// tags:
			//		private
			var ret = false;
			if(!this._undoRedoActive){
				this._undoRedoActive = true;
				this.endEditing(true);
				var s = this._steps.pop();
				if(s && this._steps.length > 0){
					this.focus();
					this._changeToStep(s, this._steps[this._steps.length - 1]);
					this._undoedSteps.push(s);
					this.onDisplayChanged();
					delete this._undoRedoActive;
					ret = true;
				}
				delete this._undoRedoActive;
			}
			return ret;
		},
		redo: function(){
			// summary:
			//		Handler for editor redo (ex: ctrl-y) operation
			// tags:
			//		private
			var ret = false;
			if(!this._undoRedoActive){
				this._undoRedoActive = true;
				this.endEditing(true);
				var s = this._undoedSteps.pop();
				if(s && this._steps.length > 0){
					this.focus();
					this._changeToStep(this._steps[this._steps.length - 1], s);
					this._steps.push(s);
					this.onDisplayChanged();
					ret = true;
				}
				delete this._undoRedoActive;
			}
			return ret;
		},
		endEditing: function(ignore_caret){
			// summary:
			//		Called to note that the user has stopped typing alphanumeric characters, if it's not already noted.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private
			if(this._editTimer){
				this._editTimer = this._editTimer.remove();
			}
			if(this._inEditing){
				this._endEditing(ignore_caret);
				this._inEditing = false;
			}
		},

		_getBookmark: function(){
			// summary:
			//		Get the currently selected text
			// tags:
			//		protected
			var b = this.selection.getBookmark();
			var tmp = [];
			if(b && b.mark){
				var mark = b.mark;
				if(has("ie") < 9 || (has("ie") === 9 && has("quirks"))){
					// Try to use the pseudo range API on IE for better accuracy.
					var sel = rangeapi.getSelection(this.window);
					if(!lang.isArray(mark)){
						if(sel){
							var range;
							if(sel.rangeCount){
								range = sel.getRangeAt(0);
							}
							if(range){
								b.mark = range.cloneRange();
							}else{
								b.mark = this.selection.getBookmark();
							}
						}
					}else{
						// Control ranges (img, table, etc), handle differently.
						array.forEach(b.mark, function(n){
							tmp.push(rangeapi.getIndex(n, this.editNode).o);
						}, this);
						b.mark = tmp;
					}
				}
				try{
					if(b.mark && b.mark.startContainer){
						tmp = rangeapi.getIndex(b.mark.startContainer, this.editNode).o;
						b.mark = {startContainer: tmp,
							startOffset: b.mark.startOffset,
							endContainer: b.mark.endContainer === b.mark.startContainer ? tmp : rangeapi.getIndex(b.mark.endContainer, this.editNode).o,
							endOffset: b.mark.endOffset};
					}
				}catch(e){
					b.mark = null;
				}
			}
			return b;
		},
		_beginEditing: function(){
			// summary:
			//		Called when the user starts typing alphanumeric characters.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private
			if(this._steps.length === 0){
				// You want to use the editor content without post filtering
				// to make sure selection restores right for the 'initial' state.
				// and undo is called.  So not using this.value, as it was 'processed'
				// and the line-up for selections may have been altered.
				this._steps.push({'text': html.getChildrenHtml(this.editNode), 'bookmark': this._getBookmark()});
			}
		},
		_endEditing: function(){
			// summary:
			//		Called when the user stops typing alphanumeric characters.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private

			// Avoid filtering to make sure selections restore.
			var v = html.getChildrenHtml(this.editNode);

			this._undoedSteps = [];//clear undoed steps
			this._steps.push({text: v, bookmark: this._getBookmark()});
		},
		onKeyDown: function(e){
			// summary:
			//		Handler for onkeydown event.
			// tags:
			//		private

			//We need to save selection if the user TAB away from this editor
			//no need to call _saveSelection for IE, as that will be taken care of in onBeforeDeactivate
			if(!has("ie") && !this.iframe && e.keyCode == keys.TAB && !this.tabIndent){
				this._saveSelection();
			}
			if(!this.customUndo){
				this.inherited(arguments);
				return;
			}
			var k = e.keyCode;
			if(e.ctrlKey && !e.shiftKey && !e.altKey){//undo and redo only if the special right Alt + z/y are not pressed #5892
				if(k == 90 || k == 122){ //z, but also F11 key
					e.stopPropagation();
					e.preventDefault();
					this.undo();
					return;
				}else if(k == 89 || k == 121){ //y
					e.stopPropagation();
					e.preventDefault();
					this.redo();
					return;
				}
			}
			this.inherited(arguments);

			switch(k){
				case keys.ENTER:
				case keys.BACKSPACE:
				case keys.DELETE:
					this.beginEditing();
					break;
				case 88: //x
				case 86: //v
					if(e.ctrlKey && !e.altKey && !e.metaKey){
						this.endEditing();//end current typing step if any
						if(e.keyCode == 88){
							this.beginEditing('cut');
						}else{
							this.beginEditing('paste');
						}
						//use timeout to trigger after the paste is complete
						this.defer("endEditing", 1);
						break;
					}
				//pass through
				default:
					if(!e.ctrlKey && !e.altKey && !e.metaKey && (e.keyCode < keys.F1 || e.keyCode > keys.F15)){
						this.beginEditing();
						break;
					}
				//pass through
				case keys.ALT:
					this.endEditing();
					break;
				case keys.UP_ARROW:
				case keys.DOWN_ARROW:
				case keys.LEFT_ARROW:
				case keys.RIGHT_ARROW:
				case keys.HOME:
				case keys.END:
				case keys.PAGE_UP:
				case keys.PAGE_DOWN:
					this.endEditing(true);
					break;
				//maybe ctrl+backspace/delete, so don't endEditing when ctrl is pressed
				case keys.CTRL:
				case keys.SHIFT:
				case keys.TAB:
					break;
			}
		},
		_onBlur: function(){
			// summary:
			//		Called from focus manager when focus has moved away from this editor
			// tags:
			//		protected

			//this._saveSelection();
			this.inherited(arguments);
			this.endEditing(true);
		},
		_saveSelection: function(){
			// summary:
			//		Save the currently selected text in _savedSelection attribute
			// tags:
			//		private
			try{
				this._savedSelection = this._getBookmark();
			}catch(e){ /* Squelch any errors that occur if selection save occurs due to being hidden simultaneously. */
			}
		},
		_restoreSelection: function(){
			// summary:
			//		Re-select the text specified in _savedSelection attribute;
			//		see _saveSelection().
			// tags:
			//		private
			if(this._savedSelection){
				// Clear off cursor to start, we're deliberately going to a selection.
				delete this._cursorToStart;
				// only restore the selection if the current range is collapsed
				// if not collapsed, then it means the editor does not lose
				// selection and there is no need to restore it
				if(this.selection.isCollapsed()){
					this._moveToBookmark(this._savedSelection);
				}
				delete this._savedSelection;
			}
		},

		onClick: function(){
			// summary:
			//		Handler for when editor is clicked
			// tags:
			//		protected
			this.endEditing(true);
			this.inherited(arguments);
		},

		replaceValue: function(/*String*/ html){
			// summary:
			//		over-ride of replaceValue to support custom undo and stack maintenance.
			// tags:
			//		protected
			if(!this.customUndo){
				this.inherited(arguments);
			}else{
				if(this.isClosed){
					this.setValue(html);
				}else{
					this.beginEditing();
					if(!html){
						html = "&#160;";	// &nbsp;
					}
					this.setValue(html);
					this.endEditing();
				}
			}
		},

		_setDisabledAttr: function(/*Boolean*/ value){
			this.setValueDeferred.then(lang.hitch(this, function(){
				if((!this.disabled && value) || (!this._buttonEnabledPlugins && value)){
					// Disable editor: disable all enabled buttons and remember that list
					array.forEach(this._plugins, function(p){
						p.set("disabled", true);
					});
				}else if(this.disabled && !value){
					// Restore plugins to being active.
					array.forEach(this._plugins, function(p){
						p.set("disabled", false);
					});
				}
			}));
			this.inherited(arguments);
		},

		_setStateClass: function(){
			try{
				this.inherited(arguments);

				// Let theme set the editor's text color based on editor enabled/disabled state.
				// We need to jump through hoops because the main document (where the theme CSS is)
				// is separate from the iframe's document.
				if(this.document && this.document.body){
					domStyle.set(this.document.body, "color", domStyle.get(this.iframe, "color"));
				}
			}catch(e){ /* Squelch any errors caused by focus change if hidden during a state change */
			}
		}
	});

	// Register the "default plugins", ie, the built-in editor commands
	function simplePluginFactory(args){
		return new _Plugin({ command: args.name });
	}

	function togglePluginFactory(args){
		return new _Plugin({ buttonClass: ToggleButton, command: args.name });
	}

	lang.mixin(_Plugin.registry, {
		"undo": simplePluginFactory,
		"redo": simplePluginFactory,
		"cut": simplePluginFactory,
		"copy": simplePluginFactory,
		"paste": simplePluginFactory,
		"insertOrderedList": simplePluginFactory,
		"insertUnorderedList": simplePluginFactory,
		"indent": simplePluginFactory,
		"outdent": simplePluginFactory,
		"justifyCenter": simplePluginFactory,
		"justifyFull": simplePluginFactory,
		"justifyLeft": simplePluginFactory,
		"justifyRight": simplePluginFactory,
		"delete": simplePluginFactory,
		"selectAll": simplePluginFactory,
		"removeFormat": simplePluginFactory,
		"unlink": simplePluginFactory,
		"insertHorizontalRule": simplePluginFactory,

		"bold": togglePluginFactory,
		"italic": togglePluginFactory,
		"underline": togglePluginFactory,
		"strikethrough": togglePluginFactory,
		"subscript": togglePluginFactory,
		"superscript": togglePluginFactory,

		"|": function(){
			return new _Plugin({
				setEditor: function(editor){
					this.editor = editor;
					this.button = new ToolbarSeparator({ownerDocument: editor.ownerDocument});
				}
			});
		}
	});

	return Editor;
});

},
'dijit/Dialog':function(){
define([
	"require",
	"dojo/_base/array", // array.forEach array.indexOf array.map
	"dojo/aspect",
	"dojo/_base/declare", // declare
	"dojo/Deferred", // Deferred
	"dojo/dom", // dom.isDescendant
	"dojo/dom-class", // domClass.add domClass.contains
	"dojo/dom-geometry", // domGeometry.position
	"dojo/dom-style", // domStyle.set
	"dojo/_base/fx", // fx.fadeIn fx.fadeOut
	"dojo/i18n", // i18n.getLocalization
	"dojo/keys",
	"dojo/_base/lang", // lang.mixin lang.hitch
	"dojo/on",
	"dojo/ready",
	"dojo/sniff", // has("ie") has("opera") has("dijit-legacy-requires")
	"dojo/window", // winUtils.getBox, winUtils.get
	"dojo/dnd/Moveable", // Moveable
	"dojo/dnd/TimedMoveable", // TimedMoveable
	"./focus",
	"./_base/manager", // manager.defaultDuration
	"./_Widget",
	"./_TemplatedMixin",
	"./_CssStateMixin",
	"./form/_FormMixin",
	"./_DialogMixin",
	"./DialogUnderlay",
	"./layout/ContentPane",
	"dojo/text!./templates/Dialog.html",
	"dojo/i18n!./nls/common"
], function(require, array, aspect, declare, Deferred,
			dom, domClass, domGeometry, domStyle, fx, i18n, keys, lang, on, ready, has, winUtils,
			Moveable, TimedMoveable, focus, manager, _Widget, _TemplatedMixin, _CssStateMixin, _FormMixin, _DialogMixin,
			DialogUnderlay, ContentPane, template){

	// module:
	//		dijit/Dialog

	/*=====
	dijit._underlay = function(kwArgs){
		// summary:
		//		A shared instance of a `dijit.DialogUnderlay`
		//
		// description:
		//		A shared instance of a `dijit.DialogUnderlay` created and
		//		used by `dijit.Dialog`, though never created until some Dialog
		//		or subclass thereof is shown.
	};
	=====*/

	var _DialogBase = declare("dijit._DialogBase" + (has("dojo-bidi") ? "_NoBidi" : ""), [_TemplatedMixin, _FormMixin, _DialogMixin, _CssStateMixin], {
		templateString: template,

		baseClass: "dijitDialog",

		cssStateNodes: {
			closeButtonNode: "dijitDialogCloseIcon"
		},

		// Map widget attributes to DOMNode attributes.
		_setTitleAttr: { node: "titleNode", type: "innerHTML" },

		// open: [readonly] Boolean
		//		True if Dialog is currently displayed on screen.
		open: false,

		// duration: Integer
		//		The time in milliseconds it takes the dialog to fade in and out
		duration: manager.defaultDuration,

		// refocus: Boolean
		//		A Toggle to modify the default focus behavior of a Dialog, which
		//		is to re-focus the element which had focus before being opened.
		//		False will disable refocusing. Default: true
		refocus: true,

		// autofocus: Boolean
		//		A Toggle to modify the default focus behavior of a Dialog, which
		//		is to focus on the first dialog element after opening the dialog.
		//		False will disable autofocusing. Default: true
		autofocus: true,

		// _firstFocusItem: [private readonly] DomNode
		//		The pointer to the first focusable node in the dialog.
		//		Set by `dijit/_DialogMixin._getFocusItems()`.
		_firstFocusItem: null,

		// _lastFocusItem: [private readonly] DomNode
		//		The pointer to which node has focus prior to our dialog.
		//		Set by `dijit/_DialogMixin._getFocusItems()`.
		_lastFocusItem: null,

		// doLayout: [protected] Boolean
		//		Don't change this parameter from the default value.
		//		This ContentPane parameter doesn't make sense for Dialog, since Dialog
		//		is never a child of a layout container, nor can you specify the size of
		//		Dialog in order to control the size of an inner widget.
		doLayout: false,

		// draggable: Boolean
		//		Toggles the movable aspect of the Dialog. If true, Dialog
		//		can be dragged by it's title. If false it will remain centered
		//		in the viewport.
		draggable: true,
		_setDraggableAttr: function(/*Boolean*/ val){
			// Avoid _WidgetBase behavior of copying draggable attribute to this.domNode,
			// as that prevents text select on modern browsers (#14452)
			this._set("draggable", val);
		},

		// maxRatio: Number
		//		Maximum size to allow the dialog to expand to, relative to viewport size
		maxRatio: 0.9,

		// closable: Boolean
		//		Dialog show [x] icon to close itself, and ESC key will close the dialog.
		closable: true,
		_setClosableAttr: function(val){
			this.closeButtonNode.style.display = val ? "" : "none";
			this._set("closable", val);
		},

		postMixInProperties: function(){
			var _nlsResources = i18n.getLocalization("dijit", "common");
			lang.mixin(this, _nlsResources);
			this.inherited(arguments);
		},

		postCreate: function(){
			domStyle.set(this.domNode, {
				display: "none",
				position: "absolute"
			});
			this.ownerDocumentBody.appendChild(this.domNode);

			this.inherited(arguments);

			aspect.after(this, "onExecute", lang.hitch(this, "hide"), true);
			aspect.after(this, "onCancel", lang.hitch(this, "hide"), true);

			this._modalconnects = [];
		},

		onLoad: function(){
			// summary:
			//		Called when data has been loaded from an href.
			//		Unlike most other callbacks, this function can be connected to (via `dojo.connect`)
			//		but should *not* be overridden.
			// tags:
			//		callback

			// when href is specified we need to reposition the dialog after the data is loaded
			// and find the focusable elements
			this._size();
			this._position();

			if(this.autofocus && DialogLevelManager.isTop(this)){
				this._getFocusItems(this.domNode);
				focus.focus(this._firstFocusItem);
			}

			this.inherited(arguments);
		},

		focus: function(){
			this._getFocusItems(this.domNode);
			focus.focus(this._firstFocusItem);
		},

		_endDrag: function(){
			// summary:
			//		Called after dragging the Dialog. Saves the position of the dialog in the viewport,
			//		and also adjust position to be fully within the viewport, so user doesn't lose access to handle
			var nodePosition = domGeometry.position(this.domNode),
				viewport = winUtils.getBox(this.ownerDocument);
			nodePosition.y = Math.min(Math.max(nodePosition.y, 0), (viewport.h - nodePosition.h));
			nodePosition.x = Math.min(Math.max(nodePosition.x, 0), (viewport.w - nodePosition.w));
			this._relativePosition = nodePosition;
			this._position();
		},

		_setup: function(){
			// summary:
			//		Stuff we need to do before showing the Dialog for the first
			//		time (but we defer it until right beforehand, for
			//		performance reasons).
			// tags:
			//		private

			var node = this.domNode;

			if(this.titleBar && this.draggable){
				this._moveable = new ((has("ie") == 6) ? TimedMoveable // prevent overload, see #5285
					: Moveable)(node, { handle: this.titleBar });
				aspect.after(this._moveable, "onMoveStop", lang.hitch(this, "_endDrag"), true);
			}else{
				domClass.add(node, "dijitDialogFixed");
			}

			this.underlayAttrs = {
				dialogId: this.id,
				"class": array.map(this["class"].split(/\s/),function(s){
					return s + "_underlay";
				}).join(" "),
				_onKeyDown: lang.hitch(this, "_onKey"),
				ownerDocument: this.ownerDocument
			};
		},

		_size: function(){
			// summary:
			//		If necessary, shrink dialog contents so dialog fits in viewport.
			// tags:
			//		private

			this._checkIfSingleChild();

			// If we resized the dialog contents earlier, reset them back to original size, so
			// that if the user later increases the viewport size, the dialog can display w/out a scrollbar.
			// Need to do this before the domGeometry.position(this.domNode) call below.
			if(this._singleChild){
				if(typeof this._singleChildOriginalStyle != "undefined"){
					this._singleChild.domNode.style.cssText = this._singleChildOriginalStyle;
					delete this._singleChildOriginalStyle;
				}
			}else{
				domStyle.set(this.containerNode, {
					width: "auto",
					height: "auto"
				});
			}

			var bb = domGeometry.position(this.domNode);

			// Get viewport size but then reduce it by a bit; Dialog should always have some space around it
			// to indicate that it's a popup.  This will also compensate for possible scrollbars on viewport.
			var viewport = winUtils.getBox(this.ownerDocument);
			viewport.w *= this.maxRatio;
			viewport.h *= this.maxRatio;

			if(bb.w >= viewport.w || bb.h >= viewport.h){
				// Reduce size of dialog contents so that dialog fits in viewport

				var containerSize = domGeometry.position(this.containerNode),
					w = Math.min(bb.w, viewport.w) - (bb.w - containerSize.w),
					h = Math.min(bb.h, viewport.h) - (bb.h - containerSize.h);

				if(this._singleChild && this._singleChild.resize){
					if(typeof this._singleChildOriginalStyle == "undefined"){
						this._singleChildOriginalStyle = this._singleChild.domNode.style.cssText;
					}
					this._singleChild.resize({w: w, h: h});
				}else{
					domStyle.set(this.containerNode, {
						width: w + "px",
						height: h + "px",
						overflow: "auto",
						position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
					});
				}
			}else{
				if(this._singleChild && this._singleChild.resize){
					this._singleChild.resize();
				}
			}
		},

		_position: function(){
			// summary:
			//		Position the dialog in the viewport.  If no relative offset
			//		in the viewport has been determined (by dragging, for instance),
			//		center the dialog.  Otherwise, use the Dialog's stored relative offset,
			//		adjusted by the viewport's scroll.
			if(!domClass.contains(this.ownerDocumentBody, "dojoMove")){    // don't do anything if called during auto-scroll
				var node = this.domNode,
					viewport = winUtils.getBox(this.ownerDocument),
					p = this._relativePosition,
					bb = p ? null : domGeometry.position(node),
					l = Math.floor(viewport.l + (p ? p.x : (viewport.w - bb.w) / 2)),
					t = Math.floor(viewport.t + (p ? p.y : (viewport.h - bb.h) / 2))
					;
				domStyle.set(node, {
					left: l + "px",
					top: t + "px"
				});
			}
		},

		_onKey: function(/*Event*/ evt){
			// summary:
			//		Handles the keyboard events for accessibility reasons
			// tags:
			//		private

			if(evt.keyCode == keys.TAB){
				this._getFocusItems(this.domNode);
				var node = evt.target;
				if(this._firstFocusItem == this._lastFocusItem){
					// don't move focus anywhere, but don't allow browser to move focus off of dialog either
					evt.stopPropagation();
					evt.preventDefault();
				}else if(node == this._firstFocusItem && evt.shiftKey){
					// if we are shift-tabbing from first focusable item in dialog, send focus to last item
					focus.focus(this._lastFocusItem);
					evt.stopPropagation();
					evt.preventDefault();
				}else if(node == this._lastFocusItem && !evt.shiftKey){
					// if we are tabbing from last focusable item in dialog, send focus to first item
					focus.focus(this._firstFocusItem);
					evt.stopPropagation();
					evt.preventDefault();
				}
			}else if(this.closable && evt.keyCode == keys.ESCAPE){
				this.onCancel();
				evt.stopPropagation();
				evt.preventDefault();
			}
		},

		show: function(){
			// summary:
			//		Display the dialog
			// returns: dojo/promise/Promise
			//		Promise object that resolves when the display animation is complete

			if(this.open){
				return;
			}

			if(!this._started){
				this.startup();
			}

			// first time we show the dialog, there's some initialization stuff to do
			if(!this._alreadyInitialized){
				this._setup();
				this._alreadyInitialized = true;
			}

			if(this._fadeOutDeferred){
				// There's a hide() operation in progress, so cancel it, but still call DialogLevelManager.hide()
				// as though the hide() completed, in preparation for the DialogLevelManager.show() call below.
				this._fadeOutDeferred.cancel();
				DialogLevelManager.hide(this);
			}

			// Recenter Dialog if user scrolls browser.  Connecting to document doesn't work on IE, need to use window.
			var win = winUtils.get(this.ownerDocument);
			this._modalconnects.push(on(win, "scroll", lang.hitch(this, "resize")));

			this._modalconnects.push(on(this.domNode, "keydown", lang.hitch(this, "_onKey")));

			domStyle.set(this.domNode, {
				opacity: 0,
				display: ""
			});

			this._set("open", true);
			this._onShow(); // lazy load trigger

			this._size();
			this._position();

			// fade-in Animation object, setup below
			var fadeIn;

			this._fadeInDeferred = new Deferred(lang.hitch(this, function(){
				fadeIn.stop();
				delete this._fadeInDeferred;
			}));

			// If delay is 0, code below will delete this._fadeInDeferred instantly, so grab promise while we can.
			var promise = this._fadeInDeferred.promise;

			fadeIn = fx.fadeIn({
				node: this.domNode,
				duration: this.duration,
				beforeBegin: lang.hitch(this, function(){
					DialogLevelManager.show(this, this.underlayAttrs);
				}),
				onEnd: lang.hitch(this, function(){
					if(this.autofocus && DialogLevelManager.isTop(this)){
						// find focusable items each time dialog is shown since if dialog contains a widget the
						// first focusable items can change
						this._getFocusItems(this.domNode);
						focus.focus(this._firstFocusItem);
					}
					this._fadeInDeferred.resolve(true);
					delete this._fadeInDeferred;
				})
			}).play();

			return promise;
		},

		hide: function(){
			// summary:
			//		Hide the dialog
			// returns: dojo/promise/Promise
			//		Promise object that resolves when the display animation is complete

			// If we haven't been initialized yet then we aren't showing and we can just return.
			// Likewise if we are already hidden, or are currently fading out.
			if(!this._alreadyInitialized || !this.open){
				return;
			}
			if(this._fadeInDeferred){
				this._fadeInDeferred.cancel();
			}

			// fade-in Animation object, setup below
			var fadeOut;

			this._fadeOutDeferred = new Deferred(lang.hitch(this, function(){
				fadeOut.stop();
				delete this._fadeOutDeferred;
			}));

			// fire onHide when the promise resolves.
			this._fadeOutDeferred.then(lang.hitch(this, 'onHide'));

			// If delay is 0, code below will delete this._fadeOutDeferred instantly, so grab promise while we can.
			var promise = this._fadeOutDeferred.promise;

			fadeOut = fx.fadeOut({
				node: this.domNode,
				duration: this.duration,
				onEnd: lang.hitch(this, function(){
					this.domNode.style.display = "none";
					DialogLevelManager.hide(this);
					this._fadeOutDeferred.resolve(true);
					delete this._fadeOutDeferred;
				})
			}).play();

			if(this._scrollConnected){
				this._scrollConnected = false;
			}
			var h;
			while(h = this._modalconnects.pop()){
				h.remove();
			}

			if(this._relativePosition){
				delete this._relativePosition;
			}
			this._set("open", false);

			return promise;
		},

		resize: function(){
			// summary:
			//		Called when viewport scrolled or size changed.  Adjust Dialog as necessary to keep it visible.
			// tags:
			//		private
			if(this.domNode.style.display != "none"){
				this._size();
				if(!has("touch")){
					// If the user has scrolled the display then reposition the Dialog.  But don't do it for touch
					// devices, because it will counteract when a keyboard pops up and then the browser auto-scrolls
					// the focused node into view.
					this._position();
				}
			}
		},

		destroy: function(){
			if(this._fadeInDeferred){
				this._fadeInDeferred.cancel();
			}
			if(this._fadeOutDeferred){
				this._fadeOutDeferred.cancel();
			}
			if(this._moveable){
				this._moveable.destroy();
			}
			var h;
			while(h = this._modalconnects.pop()){
				h.remove();
			}

			DialogLevelManager.hide(this);

			this.inherited(arguments);
		}
	});

	if(has("dojo-bidi")){
		_DialogBase = declare("dijit._DialogBase", _DialogBase, {
			_setTitleAttr: function(/*String*/ title){
				this._set("title", title);
				this.titleNode.innerHTML = title;
				this.applyTextDir(this.titleNode);
			},

			_setTextDirAttr: function(textDir){
				if(this._created && this.textDir != textDir){
					this._set("textDir", textDir);
					this.set("title", this.title);
				}
			}
		});
	}

	var Dialog = declare("dijit.Dialog", [ContentPane, _DialogBase], {
		// summary:
		//		A modal dialog Widget.
		// description:
		//		Pops up a modal dialog window, blocking access to the screen
		//		and also graying out the screen Dialog is extended from
		//		ContentPane so it supports all the same parameters (href, etc.).
		// example:
		// |	<div data-dojo-type="dijit/Dialog" data-dojo-props="href: 'test.html'"></div>
		// example:
		// |	var foo = new Dialog({ title: "test dialog", content: "test content" });
		// |	foo.placeAt(win.body());
		// |	foo.startup();
	});
	Dialog._DialogBase = _DialogBase;	// for monkey patching and dojox/widget/DialogSimple

	var DialogLevelManager = Dialog._DialogLevelManager = {
		// summary:
		//		Controls the various active "levels" on the page, starting with the
		//		stuff initially visible on the page (at z-index 0), and then having an entry for
		//		each Dialog shown.

		_beginZIndex: 950,

		show: function(/*dijit/_WidgetBase*/ dialog, /*Object*/ underlayAttrs){
			// summary:
			//		Call right before fade-in animation for new dialog.
			//		Saves current focus, displays/adjusts underlay for new dialog,
			//		and sets the z-index of the dialog itself.
			//
			//		New dialog will be displayed on top of all currently displayed dialogs.
			//
			//		Caller is responsible for setting focus in new dialog after the fade-in
			//		animation completes.

			// Save current focus
			ds[ds.length - 1].focus = focus.curNode;

			// Set z-index a bit above previous dialog
			var zIndex = ds[ds.length - 1].dialog ? ds[ds.length - 1].zIndex + 2 : Dialog._DialogLevelManager._beginZIndex;
			domStyle.set(dialog.domNode, 'zIndex', zIndex);

			// Display the underlay, or if already displayed then adjust for this new dialog
			DialogUnderlay.show(underlayAttrs, zIndex - 1);

			ds.push({dialog: dialog, underlayAttrs: underlayAttrs, zIndex: zIndex});
		},

		hide: function(/*dijit/_WidgetBase*/ dialog){
			// summary:
			//		Called when the specified dialog is hidden/destroyed, after the fade-out
			//		animation ends, in order to reset page focus, fix the underlay, etc.
			//		If the specified dialog isn't open then does nothing.
			//
			//		Caller is responsible for either setting display:none on the dialog domNode,
			//		or calling dijit/popup.hide(), or removing it from the page DOM.

			if(ds[ds.length - 1].dialog == dialog){
				// Removing the top (or only) dialog in the stack, return focus
				// to previous dialog

				ds.pop();

				var pd = ds[ds.length - 1];	// the new active dialog (or the base page itself)

				// Adjust underlay
				if(ds.length == 1){
					// Returning to original page.  Hide the underlay.
					DialogUnderlay.hide();
				}else{
					// Popping back to previous dialog, adjust underlay.
					DialogUnderlay.show(pd.underlayAttrs, pd.zIndex - 1);
				}

				// Adjust focus.
				// TODO: regardless of setting of dialog.refocus, if the exeucte() method set focus somewhere,
				// don't shift focus back to button.  Note that execute() runs at the start of the fade-out but
				// this code runs later, at the end of the fade-out.  Menu has code like this.
				if(dialog.refocus){
					// If we are returning control to a previous dialog but for some reason
					// that dialog didn't have a focused field, set focus to first focusable item.
					// This situation could happen if two dialogs appeared at nearly the same time,
					// since a dialog doesn't set it's focus until the fade-in is finished.
					var focus = pd.focus;
					if(pd.dialog && (!focus || !dom.isDescendant(focus, pd.dialog.domNode))){
						pd.dialog._getFocusItems(pd.dialog.domNode);
						focus = pd.dialog._firstFocusItem;
					}

					if(focus){
						// Refocus the button that spawned the Dialog.   This will fail in corner cases including
						// page unload on IE, because the dijit/form/Button that launched the Dialog may get destroyed
						// before this code runs.  (#15058)
						try{
							focus.focus();
						}catch(e){
						}
					}
				}
			}else{
				// Removing a dialog out of order (#9944, #10705).
				// Don't need to mess with underlay or z-index or anything.
				var idx = array.indexOf(array.map(ds, function(elem){
					return elem.dialog;
				}), dialog);
				if(idx != -1){
					ds.splice(idx, 1);
				}
			}
		},

		isTop: function(/*dijit/_WidgetBase*/ dialog){
			// summary:
			//		Returns true if specified Dialog is the top in the task
			return ds[ds.length - 1].dialog == dialog;
		}
	};

	// Stack representing the various active "levels" on the page, starting with the
	// stuff initially visible on the page (at z-index 0), and then having an entry for
	// each Dialog shown.
	// Each element in stack has form {
	//		dialog: dialogWidget,
	//		focus: returnFromGetFocus(),
	//		underlayAttrs: attributes to set on underlay (when this widget is active)
	// }
	var ds = Dialog._dialogStack = [
		{dialog: null, focus: null, underlayAttrs: null}    // entry for stuff at z-index: 0
	];

	// If focus was accidentally removed from the dialog, such as if the user clicked a blank
	// area of the screen, or clicked the browser's address bar and then tabbed into the page,
	// then refocus.   Won't do anything if focus was removed because the Dialog was closed, or
	// because a new Dialog popped up on top of the old one, or when focus moves to popups
	focus.watch("curNode", function(attr, oldNode, node){
 		// Note: if no dialogs, ds.length==1 but ds[ds.length-1].dialog is null
		var topDialog = ds[ds.length - 1].dialog;

		// If a node was focused, and there's a Dialog currently showing, and not in the process of fading out...
		// Ignore focus events on other document though because it's likely an Editor inside of the Dialog.
		if(node && topDialog && !topDialog._fadeOutDeferred && node.ownerDocument == topDialog.ownerDocument){
			// If the node that was focused is inside the dialog or in a popup, even a context menu that isn't
			// technically a descendant of the the dialog, don't do anything.
			do{
				if(node == topDialog.domNode || domClass.contains(node, "dijitPopup")){ return; }
			}while(node = node.parentNode);

			// Otherwise, return focus to the dialog.  Use a delay to avoid confusing dijit/focus code's
			// own tracking of focus.
			topDialog.focus();
		}
	});

	// Back compat w/1.6, remove for 2.0
	if(has("dijit-legacy-requires")){
		ready(0, function(){
			var requires = ["dijit/TooltipDialog"];
			require(requires);	// use indirection so modules not rolled into a build
		});
	}

	return Dialog;
});

},
'dijit/form/TextBox':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/dom-construct", // domConstruct.create
	"dojo/dom-style", // domStyle.getComputedStyle
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/_base/lang", // lang.hitch
	"dojo/on",
	"dojo/sniff", // has("ie") has("mozilla")
	"./_FormValueWidget",
	"./_TextBoxMixin",
	"dojo/text!./templates/TextBox.html",
	"../main"	// to export dijit._setSelectionRange, remove in 2.0
], function(declare, domConstruct, domStyle, kernel, lang, on, has,
			_FormValueWidget, _TextBoxMixin, template, dijit){

	// module:
	//		dijit/form/TextBox

	var TextBox = declare("dijit.form.TextBox" + (has("dojo-bidi") ? "_NoBidi" : ""), [_FormValueWidget, _TextBoxMixin], {
		// summary:
		//		A base class for textbox form inputs

		templateString: template,
		_singleNodeTemplate: '<input class="dijit dijitReset dijitLeft dijitInputField" data-dojo-attach-point="textbox,focusNode" autocomplete="off" type="${type}" ${!nameAttrSetting} />',

		_buttonInputDisabled: has("ie") ? "disabled" : "", // allows IE to disallow focus, but Firefox cannot be disabled for mousedown events

		baseClass: "dijitTextBox",

		postMixInProperties: function(){
			var type = this.type.toLowerCase();
			if(this.templateString && this.templateString.toLowerCase() == "input" || ((type == "hidden" || type == "file") && this.templateString == this.constructor.prototype.templateString)){
				this.templateString = this._singleNodeTemplate;
			}
			this.inherited(arguments);
		},

		postCreate: function(){
			this.inherited(arguments);

			if(has("ie") < 9){
				// IE INPUT tag fontFamily has to be set directly using STYLE
				// the defer gives IE a chance to render the TextBox and to deal with font inheritance
				this.defer(function(){
					try{
						var s = domStyle.getComputedStyle(this.domNode); // can throw an exception if widget is immediately destroyed
						if(s){
							var ff = s.fontFamily;
							if(ff){
								var inputs = this.domNode.getElementsByTagName("INPUT");
								if(inputs){
									for(var i=0; i < inputs.length; i++){
										inputs[i].style.fontFamily = ff;
									}
								}
							}
						}
					}catch(e){/*when used in a Dialog, and this is called before the dialog is
					 shown, s.fontFamily would trigger "Invalid Argument" error.*/}
				});
			}
		},

		_setPlaceHolderAttr: function(v){
			this._set("placeHolder", v);
			if(!this._phspan){
				this._attachPoints.push('_phspan');
				// dijitInputField class gives placeHolder same padding as the input field
				// parent node already has dijitInputField class but it doesn't affect this <span>
				// since it's position: absolute.
				this._phspan = domConstruct.create('span',{ onmousedown:function(e){ e.preventDefault(); }, className:'dijitPlaceHolder dijitInputField'},this.textbox,'after');
				this.own(on(this._phspan, "touchend, MSPointerUp", lang.hitch(this, function(){
					// If the user clicks placeholder rather than the <input>, need programmatic focus.  Normally this
					// is done in _FormWidgetMixin._onFocus() but after [30663] it's done on a delay, which is ineffective.
					this.focus();
				})));
			}
			this._phspan.innerHTML="";
			this._phspan.appendChild(this._phspan.ownerDocument.createTextNode(v));
			this._updatePlaceHolder();
		},

		_onInput: function(/*Event*/ evt){
			// summary:
			//		Called AFTER the input event has happened
			//		See if the placeHolder text should be removed or added while editing.
			this.inherited(arguments);
			this._updatePlaceHolder();
		},

		_updatePlaceHolder: function(){
			if(this._phspan){
				this._phspan.style.display = (this.placeHolder && !this.textbox.value) ? "" : "none";
			}
		},

		_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			this.inherited(arguments);
			this._updatePlaceHolder();
		},

		getDisplayedValue: function(){
			// summary:
			//		Deprecated.  Use get('displayedValue') instead.
			// tags:
			//		deprecated
			kernel.deprecated(this.declaredClass+"::getDisplayedValue() is deprecated. Use get('displayedValue') instead.", "", "2.0");
			return this.get('displayedValue');
		},

		setDisplayedValue: function(/*String*/ value){
			// summary:
			//		Deprecated.  Use set('displayedValue', ...) instead.
			// tags:
			//		deprecated
			kernel.deprecated(this.declaredClass+"::setDisplayedValue() is deprecated. Use set('displayedValue', ...) instead.", "", "2.0");
			this.set('displayedValue', value);
		},

		_onBlur: function(e){
			if(this.disabled){ return; }
			this.inherited(arguments);
			this._updatePlaceHolder();

			if(has("mozilla")){
				if(this.selectOnClick){
					// clear selection so that the next mouse click doesn't reselect
					this.textbox.selectionStart = this.textbox.selectionEnd = undefined;
				}
			}
		},

		_onFocus: function(/*String*/ by){
			if(this.disabled || this.readOnly){ return; }
			this.inherited(arguments);
			this._updatePlaceHolder();
		}
	});

	if(has("ie")){
		TextBox.prototype._isTextSelected = function(){
			var range = this.ownerDocument.selection.createRange();
			var parent = range.parentElement();
			return parent == this.textbox && range.text.length > 0;
		};

		// Overrides definition of _setSelectionRange from _TextBoxMixin (TODO: move to _TextBoxMixin.js?)
		dijit._setSelectionRange = _TextBoxMixin._setSelectionRange = function(/*DomNode*/ element, /*Number?*/ start, /*Number?*/ stop){
			if(element.createTextRange){
				var r = element.createTextRange();
				r.collapse(true);
				r.moveStart("character", -99999); // move to 0
				r.moveStart("character", start); // delta from 0 is the correct position
				r.moveEnd("character", stop-start);
				r.select();
			}
		}
	}

	if(has("dojo-bidi")){
		TextBox = declare("dijit.form.TextBox", TextBox, {
			_setPlaceHolderAttr: function(v){
				this.inherited(arguments);
				this.applyTextDir(this._phspan);
			}
		});
	}

	return TextBox;
});

},
'dijit/layout/_LayoutWidget':function(){
define([
	"dojo/_base/lang", // lang.mixin
	"../_Widget",
	"../_Container",
	"../_Contained",
	"../Viewport",
	"dojo/_base/declare", // declare
	"dojo/dom-class", // domClass.add domClass.remove
	"dojo/dom-geometry", // domGeometry.marginBox
	"dojo/dom-style" // domStyle.getComputedStyle
], function(lang, _Widget, _Container, _Contained, Viewport,
	declare, domClass, domGeometry, domStyle){

	// module:
	//		dijit/layout/_LayoutWidget


	return declare("dijit.layout._LayoutWidget", [_Widget, _Container, _Contained], {
		// summary:
		//		Base class for a _Container widget which is responsible for laying out its children.
		//		Widgets which mixin this code must define layout() to manage placement and sizing of the children.

		// baseClass: [protected extension] String
		//		This class name is applied to the widget's domNode
		//		and also may be used to generate names for sub nodes,
		//		for example dijitTabContainer-content.
		baseClass: "dijitLayoutContainer",

		// isLayoutContainer: [protected] Boolean
		//		Indicates that this widget is going to call resize() on its
		//		children widgets, setting their size, when they become visible.
		isLayoutContainer: true,

		buildRendering: function(){
			this.inherited(arguments);
			domClass.add(this.domNode, "dijitContainer");
		},

		startup: function(){
			// summary:
			//		Called after all the widgets have been instantiated and their
			//		dom nodes have been inserted somewhere under <body>.
			//
			//		Widgets should override this method to do any initialization
			//		dependent on other widgets existing, and then call
			//		this superclass method to finish things off.
			//
			//		startup() in subclasses shouldn't do anything
			//		size related because the size of the widget hasn't been set yet.

			if(this._started){ return; }

			// Need to call inherited first - so that child widgets get started
			// up correctly
			this.inherited(arguments);

			// If I am a not being controlled by a parent layout widget...
			var parent = this.getParent && this.getParent();
			if(!(parent && parent.isLayoutContainer)){
				// Do recursive sizing and layout of all my descendants
				// (passing in no argument to resize means that it has to glean the size itself)
				this.resize();

				// Since my parent isn't a layout container, and my style *may be* width=height=100%
				// or something similar (either set directly or via a CSS class),
				// monitor when viewport size changes so that I can re-layout.
				this.own(Viewport.on("resize", lang.hitch(this, "resize")));
			}
		},

		resize: function(changeSize, resultSize){
			// summary:
			//		Call this to resize a widget, or after its size has changed.
			// description:
			//		####Change size mode:
			//
			//		When changeSize is specified, changes the marginBox of this widget
			//		and forces it to re-layout its contents accordingly.
			//		changeSize may specify height, width, or both.
			//
			//		If resultSize is specified it indicates the size the widget will
			//		become after changeSize has been applied.
			//
			//		####Notification mode:
			//
			//		When changeSize is null, indicates that the caller has already changed
			//		the size of the widget, or perhaps it changed because the browser
			//		window was resized.  Tells widget to re-layout its contents accordingly.
			//
			//		If resultSize is also specified it indicates the size the widget has
			//		become.
			//
			//		In either mode, this method also:
			//
			//		1. Sets this._borderBox and this._contentBox to the new size of
			//			the widget.  Queries the current domNode size if necessary.
			//		2. Calls layout() to resize contents (and maybe adjust child widgets).
			// changeSize: Object?
			//		Sets the widget to this margin-box size and position.
			//		May include any/all of the following properties:
			//	|	{w: int, h: int, l: int, t: int}
			// resultSize: Object?
			//		The margin-box size of this widget after applying changeSize (if
			//		changeSize is specified).  If caller knows this size and
			//		passes it in, we don't need to query the browser to get the size.
			//	|	{w: int, h: int}

			var node = this.domNode;

			// set margin box size, unless it wasn't specified, in which case use current size
			if(changeSize){
				domGeometry.setMarginBox(node, changeSize);
			}

			// If either height or width wasn't specified by the user, then query node for it.
			// But note that setting the margin box and then immediately querying dimensions may return
			// inaccurate results, so try not to depend on it.
			var mb = resultSize || {};
			lang.mixin(mb, changeSize || {});	// changeSize overrides resultSize
			if( !("h" in mb) || !("w" in mb) ){
				mb = lang.mixin(domGeometry.getMarginBox(node), mb);	// just use domGeometry.marginBox() to fill in missing values
			}

			// Compute and save the size of my border box and content box
			// (w/out calling domGeometry.getContentBox() since that may fail if size was recently set)
			var cs = domStyle.getComputedStyle(node);
			var me = domGeometry.getMarginExtents(node, cs);
			var be = domGeometry.getBorderExtents(node, cs);
			var bb = (this._borderBox = {
				w: mb.w - (me.w + be.w),
				h: mb.h - (me.h + be.h)
			});
			var pe = domGeometry.getPadExtents(node, cs);
			this._contentBox = {
				l: domStyle.toPixelValue(node, cs.paddingLeft),
				t: domStyle.toPixelValue(node, cs.paddingTop),
				w: bb.w - pe.w,
				h: bb.h - pe.h
			};

			// Callback for widget to adjust size of its children
			this.layout();
		},

		layout: function(){
			// summary:
			//		Widgets override this method to size and position their contents/children.
			//		When this is called this._contentBox is guaranteed to be set (see resize()).
			//
			//		This is called after startup(), and also when the widget's size has been
			//		changed.
			// tags:
			//		protected extension
		},

		_setupChild: function(/*dijit/_WidgetBase*/child){
			// summary:
			//		Common setup for initial children and children which are added after startup
			// tags:
			//		protected extension

			var cls = this.baseClass + "-child "
				+ (child.baseClass ? this.baseClass + "-" + child.baseClass : "");
			domClass.add(child.domNode, cls);
		},

		addChild: function(/*dijit/_WidgetBase*/ child, /*Integer?*/ insertIndex){
			// Overrides _Container.addChild() to call _setupChild()
			this.inherited(arguments);
			if(this._started){
				this._setupChild(child);
			}
		},

		removeChild: function(/*dijit/_WidgetBase*/ child){
			// Overrides _Container.removeChild() to remove class added by _setupChild()
			var cls = this.baseClass + "-child"
					+ (child.baseClass ?
						" " + this.baseClass + "-" + child.baseClass : "");
			domClass.remove(child.domNode, cls);

			this.inherited(arguments);
		}
	});
});

},
'dijit/_DialogMixin':function(){
define([
	"dojo/_base/declare", // declare
	"./a11y"	// _getTabNavigable
], function(declare, a11y){

	// module:
	//		dijit/_DialogMixin

	return declare("dijit._DialogMixin", null, {
		// summary:
		//		This provides functions useful to Dialog and TooltipDialog

		execute: function(/*Object*/ /*===== formContents =====*/){
			// summary:
			//		Callback when the user hits the submit button.
			//		Override this method to handle Dialog execution.
			// description:
			//		After the user has pressed the submit button, the Dialog
			//		first calls onExecute() to notify the container to hide the
			//		dialog and restore focus to wherever it used to be.
			//
			//		*Then* this method is called.
			// type:
			//		callback
		},

		onCancel: function(){
			// summary:
			//		Called when user has pressed the Dialog's cancel button, to notify container.
			// description:
			//		Developer shouldn't override or connect to this method;
			//		it's a private communication device between the TooltipDialog
			//		and the thing that opened it (ex: `dijit/form/DropDownButton`)
			// type:
			//		protected
		},

		onExecute: function(){
			// summary:
			//		Called when user has pressed the dialog's OK button, to notify container.
			// description:
			//		Developer shouldn't override or connect to this method;
			//		it's a private communication device between the TooltipDialog
			//		and the thing that opened it (ex: `dijit/form/DropDownButton`)
			// type:
			//		protected
		},

		_onSubmit: function(){
			// summary:
			//		Callback when user hits submit button
			// type:
			//		protected
			this.onExecute();	// notify container that we are about to execute
			this.execute(this.get('value'));
		},

		_getFocusItems: function(){
			// summary:
			//		Finds focusable items in dialog,
			//		and sets this._firstFocusItem and this._lastFocusItem
			// tags:
			//		protected

			var elems = a11y._getTabNavigable(this.containerNode);
			this._firstFocusItem = elems.lowest || elems.first || this.closeButtonNode || this.domNode;
			this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
		}
	});
});

},
'dijit/layout/utils':function(){
define([
	"dojo/_base/array", // array.filter array.forEach
	"dojo/dom-class", // domClass.add domClass.remove
	"dojo/dom-geometry", // domGeometry.marginBox
	"dojo/dom-style", // domStyle.getComputedStyle
	"dojo/_base/lang" // lang.mixin, lang.setObject
], function(array, domClass, domGeometry, domStyle, lang){

	// module:
	//		dijit/layout/utils

	function capitalize(word){
		return word.substring(0,1).toUpperCase() + word.substring(1);
	}

	function size(widget, dim){
		// size the child
		var newSize = widget.resize ? widget.resize(dim) : domGeometry.setMarginBox(widget.domNode, dim);

		// record child's size
		if(newSize){
			// if the child returned it's new size then use that
			lang.mixin(widget, newSize);
		}else{
			// otherwise, call getMarginBox(), but favor our own numbers when we have them.
			// the browser lies sometimes
			lang.mixin(widget, domGeometry.getMarginBox(widget.domNode));
			lang.mixin(widget, dim);
		}
	}

	var utils = {
		// summary:
		//		Utility functions for doing layout

		marginBox2contentBox: function(/*DomNode*/ node, /*Object*/ mb){
			// summary:
			//		Given the margin-box size of a node, return its content box size.
			//		Functions like domGeometry.contentBox() but is more reliable since it doesn't have
			//		to wait for the browser to compute sizes.
			var cs = domStyle.getComputedStyle(node);
			var me = domGeometry.getMarginExtents(node, cs);
			var pb = domGeometry.getPadBorderExtents(node, cs);
			return {
				l: domStyle.toPixelValue(node, cs.paddingLeft),
				t: domStyle.toPixelValue(node, cs.paddingTop),
				w: mb.w - (me.w + pb.w),
				h: mb.h - (me.h + pb.h)
			};
		},


		layoutChildren: function(/*DomNode*/ container, /*Object*/ dim, /*Widget[]*/ children,
				/*String?*/ changedRegionId, /*Number?*/ changedRegionSize){
			// summary:
			//		Layout a bunch of child dom nodes within a parent dom node
			// container:
			//		parent node
			// dim:
			//		{l, t, w, h} object specifying dimensions of container into which to place children
			// children:
			//		An array of Widgets or at least objects containing:
			//
			//		- domNode: pointer to DOM node to position
			//		- region or layoutAlign: position to place DOM node
			//		- resize(): (optional) method to set size of node
			//		- id: (optional) Id of widgets, referenced from resize object, below.
			//
			//		The widgets in this array should be ordered according to how they should be laid out
			//		(each element will be processed in order, and take up as much remaining space as needed),
			//		with the center widget last.
			// changedRegionId:
			//		If specified, the slider for the region with the specified id has been dragged, and thus
			//		the region's height or width should be adjusted according to changedRegionSize
			// changedRegionSize:
			//		See changedRegionId.

			// copy dim because we are going to modify it
			dim = lang.mixin({}, dim);

			domClass.add(container, "dijitLayoutContainer");

			// Move "client" elements to the end of the array for layout.  a11y dictates that the author
			// needs to be able to put them in the document in tab-order, but this algorithm requires that
			// client be last.    TODO: remove for 2.0, all dijit client code already sends children as last item.
			children = array.filter(children, function(item){ return item.region != "center" && item.layoutAlign != "client"; })
				.concat(array.filter(children, function(item){ return item.region == "center" || item.layoutAlign == "client"; }));

			// set positions/sizes
			array.forEach(children, function(child){
				var elm = child.domNode,
					pos = (child.region || child.layoutAlign);
				if(!pos){
					throw new Error("No region setting for " + child.id)
				}

				// set elem to upper left corner of unused space; may move it later
				var elmStyle = elm.style;
				elmStyle.left = dim.l+"px";
				elmStyle.top = dim.t+"px";
				elmStyle.position = "absolute";

				domClass.add(elm, "dijitAlign" + capitalize(pos));

				// Size adjustments to make to this child widget
				var sizeSetting = {};

				// Check for optional size adjustment due to splitter drag (height adjustment for top/bottom align
				// panes and width adjustment for left/right align panes.
				if(changedRegionId && changedRegionId == child.id){
					sizeSetting[child.region == "top" || child.region == "bottom" ? "h" : "w"] = changedRegionSize;
				}

				if(pos == "leading"){
					pos = child.isLeftToRight() ? "left" : "right";
				}
				if(pos == "trailing"){
					pos = child.isLeftToRight() ? "right" : "left";
				}

				// set size && adjust record of remaining space.
				// note that setting the width of a <div> may affect its height.
				if(pos == "top" || pos == "bottom"){
					sizeSetting.w = dim.w;
					size(child, sizeSetting);
					dim.h -= child.h;
					if(pos == "top"){
						dim.t += child.h;
					}else{
						elmStyle.top = dim.t + dim.h + "px";
					}
				}else if(pos == "left" || pos == "right"){
					sizeSetting.h = dim.h;
					size(child, sizeSetting);
					dim.w -= child.w;
					if(pos == "left"){
						dim.l += child.w;
					}else{
						elmStyle.left = dim.l + dim.w + "px";
					}
				}else if(pos == "client" || pos == "center"){
					size(child, dim);
				}
			});
		}
	};

	lang.setObject("dijit.layout.utils", utils);	// remove for 2.0

	return utils;
});

},
'dijit/layout/ContentPane':function(){
define([
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/_base/lang", // lang.mixin lang.delegate lang.hitch lang.isFunction lang.isObject
	"../_Widget",
	"../_Container",
	"./_ContentPaneResizeMixin",
	"dojo/string", // string.substitute
	"dojo/html", // html._ContentSetter
	"dojo/i18n!../nls/loading",
	"dojo/_base/array", // array.forEach
	"dojo/_base/declare", // declare
	"dojo/_base/Deferred", // Deferred
	"dojo/dom", // dom.byId
	"dojo/dom-attr", // domAttr.attr
	"dojo/dom-construct", // empty()
	"dojo/_base/xhr", // xhr.get
	"dojo/i18n", // i18n.getLocalization
	"dojo/when"
], function(kernel, lang, _Widget, _Container, _ContentPaneResizeMixin, string, html, nlsLoading, array, declare,
			Deferred, dom, domAttr, domConstruct, xhr, i18n, when){

	// module:
	//		dijit/layout/ContentPane

	return declare("dijit.layout.ContentPane", [_Widget, _Container, _ContentPaneResizeMixin], {
		// summary:
		//		A widget containing an HTML fragment, specified inline
		//		or by uri.  Fragment may include widgets.
		//
		// description:
		//		This widget embeds a document fragment in the page, specified
		//		either by uri, javascript generated markup or DOM reference.
		//		Any widgets within this content are instantiated and managed,
		//		but laid out according to the HTML structure.  Unlike IFRAME,
		//		ContentPane embeds a document fragment as would be found
		//		inside the BODY tag of a full HTML document.  It should not
		//		contain the HTML, HEAD, or BODY tags.
		//		For more advanced functionality with scripts and
		//		stylesheets, see dojox/layout/ContentPane.  This widget may be
		//		used stand alone or as a base class for other widgets.
		//		ContentPane is useful as a child of other layout containers
		//		such as BorderContainer or TabContainer, but note that those
		//		widgets can contain any widget as a child.
		//
		// example:
		//		Some quick samples:
		//		To change the innerHTML:
		// |		cp.set('content', '<b>new content</b>')`
		//		Or you can send it a NodeList:
		// |		cp.set('content', dojo.query('div [class=selected]', userSelection))
		//		To do an ajax update:
		// |		cp.set('href', url)

		// href: String
		//		The href of the content that displays now.
		//		Set this at construction if you want to load data externally when the
		//		pane is shown.  (Set preload=true to load it immediately.)
		//		Changing href after creation doesn't have any effect; Use set('href', ...);
		href: "",

		// content: String|DomNode|NodeList|dijit/_Widget
		//		The innerHTML of the ContentPane.
		//		Note that the initialization parameter / argument to set("content", ...)
		//		can be a String, DomNode, Nodelist, or _Widget.
		content: "",

		// extractContent: Boolean
		//		Extract visible content from inside of `<body> .... </body>`.
		//		I.e., strip `<html>` and `<head>` (and it's contents) from the href
		extractContent: false,

		// parseOnLoad: Boolean
		//		Parse content and create the widgets, if any.
		parseOnLoad: true,

		// parserScope: String
		//		Flag passed to parser.  Root for attribute names to search for.   If scopeName is dojo,
		//		will search for data-dojo-type (or dojoType).  For backwards compatibility
		//		reasons defaults to dojo._scopeName (which is "dojo" except when
		//		multi-version support is used, when it will be something like dojo16, dojo20, etc.)
		parserScope: kernel._scopeName,

		// preventCache: Boolean
		//		Prevent caching of data from href's by appending a timestamp to the href.
		preventCache: false,

		// preload: Boolean
		//		Force load of data on initialization even if pane is hidden.
		preload: false,

		// refreshOnShow: Boolean
		//		Refresh (re-download) content when pane goes from hidden to shown
		refreshOnShow: false,

		// loadingMessage: String
		//		Message that shows while downloading
		loadingMessage: "<span class='dijitContentPaneLoading'><span class='dijitInline dijitIconLoading'></span>${loadingState}</span>",

		// errorMessage: String
		//		Message that shows if an error occurs
		errorMessage: "<span class='dijitContentPaneError'><span class='dijitInline dijitIconError'></span>${errorState}</span>",

		// isLoaded: [readonly] Boolean
		//		True if the ContentPane has data in it, either specified
		//		during initialization (via href or inline content), or set
		//		via set('content', ...) / set('href', ...)
		//
		//		False if it doesn't have any content, or if ContentPane is
		//		still in the process of downloading href.
		isLoaded: false,

		baseClass: "dijitContentPane",

		/*======
		 // ioMethod: dojo/_base/xhr.get|dojo._base/xhr.post
		 //		Function that should grab the content specified via href.
		 ioMethod: dojo.xhrGet,
		 ======*/

		// ioArgs: Object
		//		Parameters to pass to xhrGet() request, for example:
		// |	<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="href: './bar', ioArgs: {timeout: 500}">
		ioArgs: {},

		// onLoadDeferred: [readonly] dojo.Deferred
		//		This is the `dojo.Deferred` returned by set('href', ...) and refresh().
		//		Calling onLoadDeferred.then() registers your
		//		callback to be called only once, when the prior set('href', ...) call or
		//		the initial href parameter to the constructor finishes loading.
		//
		//		This is different than an onLoad() handler which gets called any time any href
		//		or content is loaded.
		onLoadDeferred: null,

		// Cancel _WidgetBase's _setTitleAttr because we don't want the title attribute (used to specify
		// tab labels) to be copied to ContentPane.domNode... otherwise a tooltip shows up over the
		// entire pane.
		_setTitleAttr: null,

		// Flag to parser that I'll parse my contents, so it shouldn't.
		stopParser: true,

		// template: [private] Boolean
		//		Flag from the parser that this ContentPane is inside a template
		//		so the contents are pre-parsed.
		// TODO: this declaration can be commented out in 2.0
		template: false,

		markupFactory: function(params, node, ctor){
			var self = new ctor(params, node);

			// If a parse has started but is waiting for modules to load, then return a Promise for when the parser
			// finishes.  Don't return a promise though for the case when content hasn't started loading because the
			// ContentPane is hidden and it has an href (ex: hidden pane of a TabContainer).   In that case we consider
			// that initialization has already finished.
			return !self.href && self._contentSetter && self._contentSetter.parseDeferred && !self._contentSetter.parseDeferred.isFulfilled() ?
				self._contentSetter.parseDeferred.then(function(){
					return self;
				}) : self;
		},

		create: function(params, srcNodeRef){
			// Convert a srcNodeRef argument into a content parameter, so that the original contents are
			// processed in the same way as contents set via set("content", ...), calling the parser etc.
			// Avoid modifying original params object since that breaks NodeList instantiation, see #11906.
			if((!params || !params.template) && srcNodeRef && !("href" in params) && !("content" in params)){
				srcNodeRef = dom.byId(srcNodeRef);
				var df = srcNodeRef.ownerDocument.createDocumentFragment();
				while(srcNodeRef.firstChild){
					df.appendChild(srcNodeRef.firstChild);
				}
				params = lang.delegate(params, {content: df});
			}
			this.inherited(arguments, [params, srcNodeRef]);
		},

		postMixInProperties: function(){
			this.inherited(arguments);
			var messages = i18n.getLocalization("dijit", "loading", this.lang);
			this.loadingMessage = string.substitute(this.loadingMessage, messages);
			this.errorMessage = string.substitute(this.errorMessage, messages);
		},

		buildRendering: function(){
			this.inherited(arguments);

			// Since we have no template we need to set this.containerNode ourselves, to make getChildren() work.
			// For subclasses of ContentPane that do have a template, does nothing.
			if(!this.containerNode){
				this.containerNode = this.domNode;
			}

			// remove the title attribute so it doesn't show up when hovering
			// over a node  (TODO: remove in 2.0, no longer needed after #11490)
			this.domNode.removeAttribute("title");
		},

		startup: function(){
			// summary:
			//		Call startup() on all children including non _Widget ones like dojo/dnd/Source objects

			// This starts all the widgets
			this.inherited(arguments);

			// And this catches stuff like dojo/dnd/Source
			if(this._contentSetter){
				array.forEach(this._contentSetter.parseResults, function(obj){
					if(!obj._started && !obj._destroyed && lang.isFunction(obj.startup)){
						obj.startup();
						obj._started = true;
					}
				}, this);
			}
		},

		_startChildren: function(){
			// summary:
			//		Called when content is loaded.   Calls startup on each child widget.   Similar to ContentPane.startup()
			//		itself, but avoids marking the ContentPane itself as "restarted" (see #15581).

			// This starts all the widgets
			array.forEach(this.getChildren(), function(obj){
				if(!obj._started && !obj._destroyed && lang.isFunction(obj.startup)){
					obj.startup();
					obj._started = true;
				}
			});

			// And this catches stuff like dojo/dnd/Source
			if(this._contentSetter){
				array.forEach(this._contentSetter.parseResults, function(obj){
					if(!obj._started && !obj._destroyed && lang.isFunction(obj.startup)){
						obj.startup();
						obj._started = true;
					}
				}, this);
			}
		},

		setHref: function(/*String|Uri*/ href){
			// summary:
			//		Deprecated.   Use set('href', ...) instead.
			kernel.deprecated("dijit.layout.ContentPane.setHref() is deprecated. Use set('href', ...) instead.", "", "2.0");
			return this.set("href", href);
		},
		_setHrefAttr: function(/*String|Uri*/ href){
			// summary:
			//		Hook so set("href", ...) works.
			// description:
			//		Reset the (external defined) content of this pane and replace with new url
			//		Note: It delays the download until widget is shown if preload is false.
			// href:
			//		url to the page you want to get, must be within the same domain as your mainpage

			// Cancel any in-flight requests (a set('href', ...) will cancel any in-flight set('href', ...))
			this.cancel();

			this.onLoadDeferred = new Deferred(lang.hitch(this, "cancel"));
			this.onLoadDeferred.then(lang.hitch(this, "onLoad"));

			this._set("href", href);

			// _setHrefAttr() is called during creation and by the user, after creation.
			// Assuming preload == false, only in the second case do we actually load the URL;
			// otherwise it's done in startup(), and only if this widget is shown.
			if(this.preload || (this._created && this._isShown())){
				this._load();
			}else{
				// Set flag to indicate that href needs to be loaded the next time the
				// ContentPane is made visible
				this._hrefChanged = true;
			}

			return this.onLoadDeferred;		// Deferred
		},

		setContent: function(/*String|DomNode|Nodelist*/data){
			// summary:
			//		Deprecated.   Use set('content', ...) instead.
			kernel.deprecated("dijit.layout.ContentPane.setContent() is deprecated.  Use set('content', ...) instead.", "", "2.0");
			this.set("content", data);
		},
		_setContentAttr: function(/*String|DomNode|Nodelist*/data){
			// summary:
			//		Hook to make set("content", ...) work.
			//		Replaces old content with data content, include style classes from old content
			// data:
			//		the new Content may be String, DomNode or NodeList
			//
			//		if data is a NodeList (or an array of nodes) nodes are copied
			//		so you can import nodes from another document implicitly

			// clear href so we can't run refresh and clear content
			// refresh should only work if we downloaded the content
			this._set("href", "");

			// Cancel any in-flight requests (a set('content', ...) will cancel any in-flight set('href', ...))
			this.cancel();

			// Even though user is just setting content directly, still need to define an onLoadDeferred
			// because the _onLoadHandler() handler is still getting called from setContent()
			this.onLoadDeferred = new Deferred(lang.hitch(this, "cancel"));
			if(this._created){
				// For back-compat reasons, call onLoad() for set('content', ...)
				// calls but not for content specified in srcNodeRef (ie: <div data-dojo-type=ContentPane>...</div>)
				// or as initialization parameter (ie: new ContentPane({content: ...})
				this.onLoadDeferred.then(lang.hitch(this, "onLoad"));
			}

			this._setContent(data || "");

			this._isDownloaded = false; // mark that content is from a set('content') not a set('href')

			return this.onLoadDeferred;	// Deferred
		},
		_getContentAttr: function(){
			// summary:
			//		Hook to make get("content") work
			return this.containerNode.innerHTML;
		},

		cancel: function(){
			// summary:
			//		Cancels an in-flight download of content
			if(this._xhrDfd && (this._xhrDfd.fired == -1)){
				this._xhrDfd.cancel();
			}
			delete this._xhrDfd; // garbage collect

			this.onLoadDeferred = null;
		},

		destroy: function(){
			this.cancel();
			this.inherited(arguments);
		},

		destroyRecursive: function(/*Boolean*/ preserveDom){
			// summary:
			//		Destroy the ContentPane and its contents

			// if we have multiple controllers destroying us, bail after the first
			if(this._beingDestroyed){
				return;
			}
			this.inherited(arguments);
		},

		_onShow: function(){
			// summary:
			//		Called when the ContentPane is made visible
			// description:
			//		For a plain ContentPane, this is called on initialization, from startup().
			//		If the ContentPane is a hidden pane of a TabContainer etc., then it's
			//		called whenever the pane is made visible.
			//
			//		Does necessary processing, including href download and layout/resize of
			//		child widget(s)

			this.inherited(arguments);

			if(this.href){
				if(!this._xhrDfd && // if there's an href that isn't already being loaded
					(!this.isLoaded || this._hrefChanged || this.refreshOnShow)
					){
					return this.refresh();	// If child has an href, promise that fires when the load is complete
				}
			}
		},

		refresh: function(){
			// summary:
			//		[Re]download contents of href and display
			// description:
			//		1. cancels any currently in-flight requests
			//		2. posts "loading..." message
			//		3. sends XHR to download new data

			// Cancel possible prior in-flight request
			this.cancel();

			this.onLoadDeferred = new Deferred(lang.hitch(this, "cancel"));
			this.onLoadDeferred.then(lang.hitch(this, "onLoad"));
			this._load();
			return this.onLoadDeferred;		// If child has an href, promise that fires when refresh is complete
		},

		_load: function(){
			// summary:
			//		Load/reload the href specified in this.href

			// display loading message
			this._setContent(this.onDownloadStart(), true);

			var self = this;
			var getArgs = {
				preventCache: (this.preventCache || this.refreshOnShow),
				url: this.href,
				handleAs: "text"
			};
			if(lang.isObject(this.ioArgs)){
				lang.mixin(getArgs, this.ioArgs);
			}

			var hand = (this._xhrDfd = (this.ioMethod || xhr.get)(getArgs)),
				returnedHtml;

			hand.then(
				function(html){
					returnedHtml = html;
					try{
						self._isDownloaded = true;
						return self._setContent(html, false);
					}catch(err){
						self._onError('Content', err); // onContentError
					}
				},
				function(err){
					if(!hand.canceled){
						// show error message in the pane
						self._onError('Download', err); // onDownloadError
					}
					delete self._xhrDfd;
					return err;
				}
			).then(function(){
					self.onDownloadEnd();
					delete self._xhrDfd;
					return returnedHtml;
				});

			// Remove flag saying that a load is needed
			delete this._hrefChanged;
		},

		_onLoadHandler: function(data){
			// summary:
			//		This is called whenever new content is being loaded
			this._set("isLoaded", true);
			try{
				this.onLoadDeferred.resolve(data);
			}catch(e){
				console.error('Error ' + this.widgetId + ' running custom onLoad code: ' + e.message);
			}
		},

		_onUnloadHandler: function(){
			// summary:
			//		This is called whenever the content is being unloaded
			this._set("isLoaded", false);
			try{
				this.onUnload();
			}catch(e){
				console.error('Error ' + this.widgetId + ' running custom onUnload code: ' + e.message);
			}
		},

		destroyDescendants: function(/*Boolean*/ preserveDom){
			// summary:
			//		Destroy all the widgets inside the ContentPane and empty containerNode

			// Make sure we call onUnload (but only when the ContentPane has real content)
			if(this.isLoaded){
				this._onUnloadHandler();
			}

			// Even if this.isLoaded == false there might still be a "Loading..." message
			// to erase, so continue...

			// For historical reasons we need to delete all widgets under this.containerNode,
			// even ones that the user has created manually.
			var setter = this._contentSetter;
			array.forEach(this.getChildren(), function(widget){
				if(widget.destroyRecursive){
					// All widgets will hit this branch
					widget.destroyRecursive(preserveDom);
				}else if(widget.destroy){
					// Things like dojo/dnd/Source have destroy(), not destroyRecursive()
					widget.destroy(preserveDom);
				}
				widget._destroyed = true;
			});
			if(setter){
				// Most of the widgets in setter.parseResults have already been destroyed, but
				// things like Menu that have been moved to <body> haven't yet
				array.forEach(setter.parseResults, function(widget){
					if(!widget._destroyed){
						if(widget.destroyRecursive){
							// All widgets will hit this branch
							widget.destroyRecursive(preserveDom);
						}else if(widget.destroy){
							// Things like dojo/dnd/Source have destroy(), not destroyRecursive()
							widget.destroy(preserveDom);
						}
						widget._destroyed = true;
					}
				});
				delete setter.parseResults;
			}

			// And then clear away all the DOM nodes
			if(!preserveDom){
				domConstruct.empty(this.containerNode);
			}

			// Delete any state information we have about current contents
			delete this._singleChild;
		},

		_setContent: function(/*String|DocumentFragment*/ cont, /*Boolean*/ isFakeContent){
			// summary:
			//		Insert the content into the container node
			// returns:
			//		Returns a Deferred promise that is resolved when the content is parsed.

			// first get rid of child widgets
			this.destroyDescendants();

			// html.set will take care of the rest of the details
			// we provide an override for the error handling to ensure the widget gets the errors
			// configure the setter instance with only the relevant widget instance properties
			// NOTE: unless we hook into attr, or provide property setters for each property,
			// we need to re-configure the ContentSetter with each use
			var setter = this._contentSetter;
			if(!(setter && setter instanceof html._ContentSetter)){
				setter = this._contentSetter = new html._ContentSetter({
					node: this.containerNode,
					_onError: lang.hitch(this, this._onError),
					onContentError: lang.hitch(this, function(e){
						// fires if a domfault occurs when we are appending this.errorMessage
						// like for instance if domNode is a UL and we try append a DIV
						var errMess = this.onContentError(e);
						try{
							this.containerNode.innerHTML = errMess;
						}catch(e){
							console.error('Fatal ' + this.id + ' could not change content due to ' + e.message, e);
						}
					})/*,
					 _onError */
				});
			}

			var setterParams = lang.mixin({
				cleanContent: this.cleanContent,
				extractContent: this.extractContent,
				parseContent: !cont.domNode && this.parseOnLoad,
				parserScope: this.parserScope,
				startup: false,
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir
			}, this._contentSetterParams || {});

			var p = setter.set((lang.isObject(cont) && cont.domNode) ? cont.domNode : cont, setterParams);

			// dojox/layout/html/_base::_ContentSetter.set() returns a Promise that indicates when everything is completed.
			// dojo/html::_ContentSetter.set() currently returns the DOMNode, but that will be changed for 2.0.
			// So, if set() returns a promise then use it, otherwise fallback to waiting on setter.parseDeferred
			var self = this;
			return when(p && p.then ? p : setter.parseDeferred, function(){
				// setter params must be pulled afresh from the ContentPane each time
				delete self._contentSetterParams;

				if(!isFakeContent){
					if(self._started){
						// Startup each top level child widget (and they will start their children, recursively)
						self._startChildren();

						// Call resize() on each of my child layout widgets,
						// or resize() on my single child layout widget...
						// either now (if I'm currently visible) or when I become visible
						self._scheduleLayout();
					}
					self._onLoadHandler(cont);
				}
			});
		},

		_onError: function(type, err, consoleText){
			this.onLoadDeferred.reject(err);

			// shows user the string that is returned by on[type]Error
			// override on[type]Error and return your own string to customize
			var errText = this['on' + type + 'Error'].call(this, err);
			if(consoleText){
				console.error(consoleText, err);
			}else if(errText){// a empty string won't change current content
				this._setContent(errText, true);
			}
		},

		// EVENT's, should be overide-able
		onLoad: function(/*===== data =====*/){
			// summary:
			//		Event hook, is called after everything is loaded and widgetified
			// tags:
			//		callback
		},

		onUnload: function(){
			// summary:
			//		Event hook, is called before old content is cleared
			// tags:
			//		callback
		},

		onDownloadStart: function(){
			// summary:
			//		Called before download starts.
			// description:
			//		The string returned by this function will be the html
			//		that tells the user we are loading something.
			//		Override with your own function if you want to change text.
			// tags:
			//		extension
			return this.loadingMessage;
		},

		onContentError: function(/*Error*/ /*===== error =====*/){
			// summary:
			//		Called on DOM faults, require faults etc. in content.
			//
			//		In order to display an error message in the pane, return
			//		the error message from this method, as an HTML string.
			//
			//		By default (if this method is not overriden), it returns
			//		nothing, so the error message is just printed to the console.
			// tags:
			//		extension
		},

		onDownloadError: function(/*Error*/ /*===== error =====*/){
			// summary:
			//		Called when download error occurs.
			//
			//		In order to display an error message in the pane, return
			//		the error message from this method, as an HTML string.
			//
			//		Default behavior (if this method is not overriden) is to display
			//		the error message inside the pane.
			// tags:
			//		extension
			return this.errorMessage;
		},

		onDownloadEnd: function(){
			// summary:
			//		Called when download is finished.
			// tags:
			//		callback
		}
	});
});

},
'dojo/date/locale':function(){
define([
	"../_base/lang",
	"../_base/array",
	"../date",
	/*===== "../_base/declare", =====*/
	"../cldr/supplemental",
	"../i18n",
	"../regexp",
	"../string",
	"../i18n!../cldr/nls/gregorian",
	"module"
], function(lang, array, date, /*===== declare, =====*/ supplemental, i18n, regexp, string, gregorian, module){

// module:
//		dojo/date/locale

var exports = {
	// summary:
	//		This modules defines dojo/date/locale, localization methods for Date.
};
lang.setObject(module.id.replace(/\//g, "."), exports);

// Localization methods for Date.   Honor local customs using locale-dependent dojo.cldr data.

// Load the bundles containing localization information for
// names and formats

//NOTE: Everything in this module assumes Gregorian calendars.
// Other calendars will be implemented in separate modules.

	// Format a pattern without literals
	function formatPattern(dateObject, bundle, options, pattern){
		return pattern.replace(/([a-z])\1*/ig, function(match){
			var s, pad,
				c = match.charAt(0),
				l = match.length,
				widthList = ["abbr", "wide", "narrow"];
			switch(c){
				case 'G':
					s = bundle[(l < 4) ? "eraAbbr" : "eraNames"][dateObject.getFullYear() < 0 ? 0 : 1];
					break;
				case 'y':
					s = dateObject.getFullYear();
					switch(l){
						case 1:
							break;
						case 2:
							if(!options.fullYear){
								s = String(s); s = s.substr(s.length - 2);
								break;
							}
							// fallthrough
						default:
							pad = true;
					}
					break;
				case 'Q':
				case 'q':
					s = Math.ceil((dateObject.getMonth()+1)/3);
//					switch(l){
//						case 1: case 2:
							pad = true;
//							break;
//						case 3: case 4: // unimplemented
//					}
					break;
				case 'M':
				case 'L':
					var m = dateObject.getMonth();
					if(l<3){
						s = m+1; pad = true;
					}else{
						var propM = [
							"months",
							c == 'L' ? "standAlone" : "format",
							widthList[l-3]
						].join("-");
						s = bundle[propM][m];
					}
					break;
				case 'w':
					var firstDay = 0;
					s = exports._getWeekOfYear(dateObject, firstDay); pad = true;
					break;
				case 'd':
					s = dateObject.getDate(); pad = true;
					break;
				case 'D':
					s = exports._getDayOfYear(dateObject); pad = true;
					break;
				case 'e':
				case 'c':
					var d = dateObject.getDay();
					if(l<2){
						s = (d - supplemental.getFirstDayOfWeek(options.locale) + 8) % 7
						break;
					}
					// fallthrough
				case 'E':
					d = dateObject.getDay();
					if(l<3){
						s = d+1; pad = true;
					}else{
						var propD = [
							"days",
							c == 'c' ? "standAlone" : "format",
							widthList[l-3]
						].join("-");
						s = bundle[propD][d];
					}
					break;
				case 'a':
					var timePeriod = dateObject.getHours() < 12 ? 'am' : 'pm';
					s = options[timePeriod] || bundle['dayPeriods-format-wide-' + timePeriod];
					break;
				case 'h':
				case 'H':
				case 'K':
				case 'k':
					var h = dateObject.getHours();
					// strange choices in the date format make it impossible to write this succinctly
					switch (c){
						case 'h': // 1-12
							s = (h % 12) || 12;
							break;
						case 'H': // 0-23
							s = h;
							break;
						case 'K': // 0-11
							s = (h % 12);
							break;
						case 'k': // 1-24
							s = h || 24;
							break;
					}
					pad = true;
					break;
				case 'm':
					s = dateObject.getMinutes(); pad = true;
					break;
				case 's':
					s = dateObject.getSeconds(); pad = true;
					break;
				case 'S':
					s = Math.round(dateObject.getMilliseconds() * Math.pow(10, l-3)); pad = true;
					break;
				case 'v': // FIXME: don't know what this is. seems to be same as z?
				case 'z':
					// We only have one timezone to offer; the one from the browser
					s = exports._getZone(dateObject, true, options);
					if(s){break;}
					l=4;
					// fallthrough... use GMT if tz not available
				case 'Z':
					var offset = exports._getZone(dateObject, false, options);
					var tz = [
						(offset<=0 ? "+" : "-"),
						string.pad(Math.floor(Math.abs(offset)/60), 2),
						string.pad(Math.abs(offset)% 60, 2)
					];
					if(l==4){
						tz.splice(0, 0, "GMT");
						tz.splice(3, 0, ":");
					}
					s = tz.join("");
					break;
//				case 'Y': case 'u': case 'W': case 'F': case 'g': case 'A':
//					console.log(match+" modifier unimplemented");
				default:
					throw new Error("dojo.date.locale.format: invalid pattern char: "+pattern);
			}
			if(pad){ s = string.pad(s, l); }
			return s;
		});
	}

/*=====
var __FormatOptions = exports.__FormatOptions = declare(null, {
	// selector: String
	//		choice of 'time','date' (default: date and time)
	// formatLength: String
	//		choice of long, short, medium or full (plus any custom additions).  Defaults to 'short'
	// datePattern:String
	//		override pattern with this string
	// timePattern:String
	//		override pattern with this string
	// am: String
	//		override strings for am in times
	// pm: String
	//		override strings for pm in times
	// locale: String
	//		override the locale used to determine formatting rules
	// fullYear: Boolean
	//		(format only) use 4 digit years whenever 2 digit years are called for
	// strict: Boolean
	//		(parse only) strict parsing, off by default
});
=====*/

exports._getZone = function(/*Date*/ dateObject, /*boolean*/ getName, /*__FormatOptions?*/ options){
	// summary:
	//		Returns the zone (or offset) for the given date and options.  This
	//		is broken out into a separate function so that it can be overridden
	//		by timezone-aware code.
	//
	// dateObject:
	//		the date and/or time being formatted.
	//
	// getName:
	//		Whether to return the timezone string (if true), or the offset (if false)
	//
	// options:
	//		The options being used for formatting
	if(getName){
		return date.getTimezoneName(dateObject);
	}else{
		return dateObject.getTimezoneOffset();
	}
};


exports.format = function(/*Date*/ dateObject, /*__FormatOptions?*/ options){
	// summary:
	//		Format a Date object as a String, using locale-specific settings.
	//
	// description:
	//		Create a string from a Date object using a known localized pattern.
	//		By default, this method formats both date and time from dateObject.
	//		Formatting patterns are chosen appropriate to the locale.  Different
	//		formatting lengths may be chosen, with "full" used by default.
	//		Custom patterns may be used or registered with translations using
	//		the dojo/date/locale.addCustomFormats() method.
	//		Formatting patterns are implemented using [the syntax described at
	//		unicode.org](http://www.unicode.org/reports/tr35/tr35-4.html#Date_Format_Patterns)
	//
	// dateObject:
	//		the date and/or time to be formatted.  If a time only is formatted,
	//		the values in the year, month, and day fields are irrelevant.  The
	//		opposite is true when formatting only dates.

	options = options || {};

	var locale = i18n.normalizeLocale(options.locale),
		formatLength = options.formatLength || 'short',
		bundle = exports._getGregorianBundle(locale),
		str = [],
		sauce = lang.hitch(this, formatPattern, dateObject, bundle, options);
	if(options.selector == "year"){
		return _processPattern(bundle["dateFormatItem-yyyy"] || "yyyy", sauce);
	}
	var pattern;
	if(options.selector != "date"){
		pattern = options.timePattern || bundle["timeFormat-"+formatLength];
		if(pattern){str.push(_processPattern(pattern, sauce));}
	}
	if(options.selector != "time"){
		pattern = options.datePattern || bundle["dateFormat-"+formatLength];
		if(pattern){str.push(_processPattern(pattern, sauce));}
	}

	return str.length == 1 ? str[0] : bundle["dateTimeFormat-"+formatLength].replace(/\'/g,'').replace(/\{(\d+)\}/g,
		function(match, key){ return str[key]; }); // String
};

exports.regexp = function(/*__FormatOptions?*/ options){
	// summary:
	//		Builds the regular needed to parse a localized date

	return exports._parseInfo(options).regexp; // String
};

exports._parseInfo = function(/*__FormatOptions?*/ options){
	options = options || {};
	var locale = i18n.normalizeLocale(options.locale),
		bundle = exports._getGregorianBundle(locale),
		formatLength = options.formatLength || 'short',
		datePattern = options.datePattern || bundle["dateFormat-" + formatLength],
		timePattern = options.timePattern || bundle["timeFormat-" + formatLength],
		pattern;
	if(options.selector == 'date'){
		pattern = datePattern;
	}else if(options.selector == 'time'){
		pattern = timePattern;
	}else{
		pattern = bundle["dateTimeFormat-"+formatLength].replace(/\{(\d+)\}/g,
			function(match, key){ return [timePattern, datePattern][key]; });
	}

	var tokens = [],
		re = _processPattern(pattern, lang.hitch(this, _buildDateTimeRE, tokens, bundle, options));
	return {regexp: re, tokens: tokens, bundle: bundle};
};

exports.parse = function(/*String*/ value, /*__FormatOptions?*/ options){
	// summary:
	//		Convert a properly formatted string to a primitive Date object,
	//		using locale-specific settings.
	//
	// description:
	//		Create a Date object from a string using a known localized pattern.
	//		By default, this method parses looking for both date and time in the string.
	//		Formatting patterns are chosen appropriate to the locale.  Different
	//		formatting lengths may be chosen, with "full" used by default.
	//		Custom patterns may be used or registered with translations using
	//		the dojo/date/locale.addCustomFormats() method.
	//
	//		Formatting patterns are implemented using [the syntax described at
	//		unicode.org](http://www.unicode.org/reports/tr35/tr35-4.html#Date_Format_Patterns)
	//		When two digit years are used, a century is chosen according to a sliding
	//		window of 80 years before and 20 years after present year, for both `yy` and `yyyy` patterns.
	//		year < 100CE requires strict mode.
	//
	// value:
	//		A string representation of a date

	// remove non-printing bidi control chars from input and pattern
	var controlChars = /[\u200E\u200F\u202A\u202E]/g,
		info = exports._parseInfo(options),
		tokens = info.tokens, bundle = info.bundle,
		re = new RegExp("^" + info.regexp.replace(controlChars, "") + "$",
			info.strict ? "" : "i"),
		match = re.exec(value && value.replace(controlChars, ""));

	if(!match){ return null; } // null

	var widthList = ['abbr', 'wide', 'narrow'],
		result = [1970,0,1,0,0,0,0], // will get converted to a Date at the end
		amPm = "",
		valid = array.every(match, function(v, i){
		if(!i){return true;}
		var token = tokens[i-1],
			l = token.length,
			c = token.charAt(0);
		switch(c){
			case 'y':
				if(l != 2 && options.strict){
					//interpret year literally, so '5' would be 5 A.D.
					result[0] = v;
				}else{
					if(v<100){
						v = Number(v);
						//choose century to apply, according to a sliding window
						//of 80 years before and 20 years after present year
						var year = '' + new Date().getFullYear(),
							century = year.substring(0, 2) * 100,
							cutoff = Math.min(Number(year.substring(2, 4)) + 20, 99);
						result[0] = (v < cutoff) ? century + v : century - 100 + v;
					}else{
						//we expected 2 digits and got more...
						if(options.strict){
							return false;
						}
						//interpret literally, so '150' would be 150 A.D.
						//also tolerate '1950', if 'yyyy' input passed to 'yy' format
						result[0] = v;
					}
				}
				break;
			case 'M':
			case 'L':
				if(l>2){
					var months = bundle['months-' +
							    (c == 'L' ? 'standAlone' : 'format') +
							    '-' + widthList[l-3]].concat();
					if(!options.strict){
						//Tolerate abbreviating period in month part
						//Case-insensitive comparison
						v = v.replace(".","").toLowerCase();
						months = array.map(months, function(s){ return s.replace(".","").toLowerCase(); } );
					}
					v = array.indexOf(months, v);
					if(v == -1){
//						console.log("dojo/date/locale.parse: Could not parse month name: '" + v + "'.");
						return false;
					}
				}else{
					v--;
				}
				result[1] = v;
				break;
			case 'E':
			case 'e':
			case 'c':
				var days = bundle['days-' +
						  (c == 'c' ? 'standAlone' : 'format') +
						  '-' + widthList[l-3]].concat();
				if(!options.strict){
					//Case-insensitive comparison
					v = v.toLowerCase();
					days = array.map(days, function(d){return d.toLowerCase();});
				}
				v = array.indexOf(days, v);
				if(v == -1){
//					console.log("dojo/date/locale.parse: Could not parse weekday name: '" + v + "'.");
					return false;
				}

				//TODO: not sure what to actually do with this input,
				//in terms of setting something on the Date obj...?
				//without more context, can't affect the actual date
				//TODO: just validate?
				break;
			case 'D':
				result[1] = 0;
				// fallthrough...
			case 'd':
				result[2] = v;
				break;
			case 'a': //am/pm
				var am = options.am || bundle['dayPeriods-format-wide-am'],
					pm = options.pm || bundle['dayPeriods-format-wide-pm'];
				if(!options.strict){
					var period = /\./g;
					v = v.replace(period,'').toLowerCase();
					am = am.replace(period,'').toLowerCase();
					pm = pm.replace(period,'').toLowerCase();
				}
				if(options.strict && v != am && v != pm){
//					console.log("dojo/date/locale.parse: Could not parse am/pm part.");
					return false;
				}

				// we might not have seen the hours field yet, so store the state and apply hour change later
				amPm = (v == pm) ? 'p' : (v == am) ? 'a' : '';
				break;
			case 'K': //hour (1-24)
				if(v == 24){ v = 0; }
				// fallthrough...
			case 'h': //hour (1-12)
			case 'H': //hour (0-23)
			case 'k': //hour (0-11)
				//TODO: strict bounds checking, padding
				if(v > 23){
//					console.log("dojo/date/locale.parse: Illegal hours value");
					return false;
				}

				//in the 12-hour case, adjusting for am/pm requires the 'a' part
				//which could come before or after the hour, so we will adjust later
				result[3] = v;
				break;
			case 'm': //minutes
				result[4] = v;
				break;
			case 's': //seconds
				result[5] = v;
				break;
			case 'S': //milliseconds
				result[6] = v;
//				break;
//			case 'w':
//TODO				var firstDay = 0;
//			default:
//TODO: throw?
//				console.log("dojo/date/locale.parse: unsupported pattern char=" + token.charAt(0));
		}
		return true;
	});

	var hours = +result[3];
	if(amPm === 'p' && hours < 12){
		result[3] = hours + 12; //e.g., 3pm -> 15
	}else if(amPm === 'a' && hours == 12){
		result[3] = 0; //12am -> 0
	}

	//TODO: implement a getWeekday() method in order to test
	//validity of input strings containing 'EEE' or 'EEEE'...

	var dateObject = new Date(result[0], result[1], result[2], result[3], result[4], result[5], result[6]); // Date
	if(options.strict){
		dateObject.setFullYear(result[0]);
	}

	// Check for overflow.  The Date() constructor normalizes things like April 32nd...
	//TODO: why isn't this done for times as well?
	var allTokens = tokens.join(""),
		dateToken = allTokens.indexOf('d') != -1,
		monthToken = allTokens.indexOf('M') != -1;

	if(!valid ||
		(monthToken && dateObject.getMonth() > result[1]) ||
		(dateToken && dateObject.getDate() > result[2])){
		return null;
	}

	// Check for underflow, due to DST shifts.  See #9366
	// This assumes a 1 hour dst shift correction at midnight
	// We could compare the timezone offset after the shift and add the difference instead.
	if((monthToken && dateObject.getMonth() < result[1]) ||
		(dateToken && dateObject.getDate() < result[2])){
		dateObject = date.add(dateObject, "hour", 1);
	}

	return dateObject; // Date
};

function _processPattern(pattern, applyPattern, applyLiteral, applyAll){
	//summary: Process a pattern with literals in it

	// Break up on single quotes, treat every other one as a literal, except '' which becomes '
	var identity = function(x){return x;};
	applyPattern = applyPattern || identity;
	applyLiteral = applyLiteral || identity;
	applyAll = applyAll || identity;

	//split on single quotes (which escape literals in date format strings)
	//but preserve escaped single quotes (e.g., o''clock)
	var chunks = pattern.match(/(''|[^'])+/g),
		literal = pattern.charAt(0) == "'";

	array.forEach(chunks, function(chunk, i){
		if(!chunk){
			chunks[i]='';
		}else{
			chunks[i]=(literal ? applyLiteral : applyPattern)(chunk.replace(/''/g, "'"));
			literal = !literal;
		}
	});
	return applyAll(chunks.join(''));
}

function _buildDateTimeRE(tokens, bundle, options, pattern){
	pattern = regexp.escapeString(pattern);
	if(!options.strict){ pattern = pattern.replace(" a", " ?a"); } // kludge to tolerate no space before am/pm
	return pattern.replace(/([a-z])\1*/ig, function(match){
		// Build a simple regexp.  Avoid captures, which would ruin the tokens list
		var s,
			c = match.charAt(0),
			l = match.length,
			p2 = '', p3 = '';
		if(options.strict){
			if(l > 1){ p2 = '0' + '{'+(l-1)+'}'; }
			if(l > 2){ p3 = '0' + '{'+(l-2)+'}'; }
		}else{
			p2 = '0?'; p3 = '0{0,2}';
		}
		switch(c){
			case 'y':
				s = '\\d{2,4}';
				break;
			case 'M':
			case 'L':
				s = (l>2) ? '\\S+?' : '1[0-2]|'+p2+'[1-9]';
				break;
			case 'D':
				s = '[12][0-9][0-9]|3[0-5][0-9]|36[0-6]|'+p2+'[1-9][0-9]|'+p3+'[1-9]';
				break;
			case 'd':
				s = '3[01]|[12]\\d|'+p2+'[1-9]';
				break;
			case 'w':
				s = '[1-4][0-9]|5[0-3]|'+p2+'[1-9]';
				break;
			case 'E':
			case 'e':
			case 'c':
				s = '.+?'; // match anything including spaces until the first pattern delimiter is found such as a comma or space
				break;
			case 'h': //hour (1-12)
				s = '1[0-2]|'+p2+'[1-9]';
				break;
			case 'k': //hour (0-11)
				s = '1[01]|'+p2+'\\d';
				break;
			case 'H': //hour (0-23)
				s = '1\\d|2[0-3]|'+p2+'\\d';
				break;
			case 'K': //hour (1-24)
				s = '1\\d|2[0-4]|'+p2+'[1-9]';
				break;
			case 'm':
			case 's':
				s = '[0-5]\\d';
				break;
			case 'S':
				s = '\\d{'+l+'}';
				break;
			case 'a':
				var am = options.am || bundle['dayPeriods-format-wide-am'],
					pm = options.pm || bundle['dayPeriods-format-wide-pm'];
					s = am + '|' + pm;
				if(!options.strict){
					if(am != am.toLowerCase()){ s += '|' + am.toLowerCase(); }
					if(pm != pm.toLowerCase()){ s += '|' + pm.toLowerCase(); }
					if(s.indexOf('.') != -1){ s += '|' + s.replace(/\./g, ""); }
				}
				s = s.replace(/\./g, "\\.");
				break;
			default:
			// case 'v':
			// case 'z':
			// case 'Z':
				s = ".*";
//				console.log("parse of date format, pattern=" + pattern);
		}

		if(tokens){ tokens.push(match); }

		return "(" + s + ")"; // add capture
	}).replace(/[\xa0 ]/g, "[\\s\\xa0]"); // normalize whitespace.  Need explicit handling of \xa0 for IE.
}

var _customFormats = [];
exports.addCustomFormats = function(/*String*/ packageName, /*String*/ bundleName){
	// summary:
	//		Add a reference to a bundle containing localized custom formats to be
	//		used by date/time formatting and parsing routines.
	//
	// description:
	//		The user may add custom localized formats where the bundle has properties following the
	//		same naming convention used by dojo.cldr: `dateFormat-xxxx` / `timeFormat-xxxx`
	//		The pattern string should match the format used by the CLDR.
	//		See dojo/date/locale.format() for details.
	//		The resources must be loaded by dojo.requireLocalization() prior to use

	_customFormats.push({pkg:packageName,name:bundleName});
};

exports._getGregorianBundle = function(/*String*/ locale){
	var gregorian = {};
	array.forEach(_customFormats, function(desc){
		var bundle = i18n.getLocalization(desc.pkg, desc.name, locale);
		gregorian = lang.mixin(gregorian, bundle);
	}, this);
	return gregorian; /*Object*/
};

exports.addCustomFormats(module.id.replace(/\/date\/locale$/, ".cldr"),"gregorian");

exports.getNames = function(/*String*/ item, /*String*/ type, /*String?*/ context, /*String?*/ locale){
	// summary:
	//		Used to get localized strings from dojo.cldr for day or month names.
	//
	// item:
	//	'months' || 'days'
	// type:
	//	'wide' || 'abbr' || 'narrow' (e.g. "Monday", "Mon", or "M" respectively, in English)
	// context:
	//	'standAlone' || 'format' (default)
	// locale:
	//	override locale used to find the names

	var label,
		lookup = exports._getGregorianBundle(locale),
		props = [item, context, type];
	if(context == 'standAlone'){
		var key = props.join('-');
		label = lookup[key];
		// Fall back to 'format' flavor of name
		if(label[0] == 1){ label = undefined; } // kludge, in the absence of real aliasing support in dojo.cldr
	}
	props[1] = 'format';

	// return by copy so changes won't be made accidentally to the in-memory model
	return (label || lookup[props.join('-')]).concat(); /*Array*/
};

exports.isWeekend = function(/*Date?*/ dateObject, /*String?*/ locale){
	// summary:
	//	Determines if the date falls on a weekend, according to local custom.

	var weekend = supplemental.getWeekend(locale),
		day = (dateObject || new Date()).getDay();
	if(weekend.end < weekend.start){
		weekend.end += 7;
		if(day < weekend.start){ day += 7; }
	}
	return day >= weekend.start && day <= weekend.end; // Boolean
};

// These are used only by format and strftime.  Do they need to be public?  Which module should they go in?

exports._getDayOfYear = function(/*Date*/ dateObject){
	// summary:
	//		gets the day of the year as represented by dateObject
	return date.difference(new Date(dateObject.getFullYear(), 0, 1, dateObject.getHours()), dateObject) + 1; // Number
};

exports._getWeekOfYear = function(/*Date*/ dateObject, /*Number*/ firstDayOfWeek){
	if(arguments.length == 1){ firstDayOfWeek = 0; } // Sunday

	var firstDayOfYear = new Date(dateObject.getFullYear(), 0, 1).getDay(),
		adj = (firstDayOfYear - firstDayOfWeek + 7) % 7,
		week = Math.floor((exports._getDayOfYear(dateObject) + adj - 1) / 7);

	// if year starts on the specified day, start counting weeks at 1
	if(firstDayOfYear == firstDayOfWeek){ week++; }

	return week; // Number
};

return exports;
});

},
'dijit/form/DateTextBox':function(){
define([
	"dojo/_base/declare", // declare
	"../Calendar",
	"./_DateTimeTextBox"
], function(declare, Calendar, _DateTimeTextBox){

	// module:
	//		dijit/form/DateTextBox

	return declare("dijit.form.DateTextBox", _DateTimeTextBox, {
		// summary:
		//		A validating, serializable, range-bound date text box with a drop down calendar
		// example:
		// |	new DateTextBox({value: new Date(2009, 0, 20)})
		// example:
		// |	<input data-dojo-type='dijit/form/DateTextBox' value='2009-01-20'>

		baseClass: "dijitTextBox dijitComboBox dijitDateTextBox",
		popupClass: Calendar,
		_selector: "date",

		// Prevent scrollbar on Calendar dropdown.  On iPad it often gets a scrollbar unnecessarily because Viewport
		// thinks the keyboard is showing.  Even if the keyboard is showing, it disappears when the calendar gets focus.
		maxHeight: Infinity,

		// value: Date
		//		The value of this widget as a JavaScript Date object, with only year/month/day specified.
		//		If specified in markup, use the format specified in `stamp.fromISOString`.
		//		set("value", ...) accepts either a Date object or a string.
		value: new Date("")	// value.toString()="NaN"
	});
});

},
'dijit/form/_FormWidgetMixin':function(){
define([
	"dojo/_base/array", // array.forEach
	"dojo/_base/declare", // declare
	"dojo/dom-attr", // domAttr.set
	"dojo/dom-style", // domStyle.get
	"dojo/_base/lang", // lang.hitch lang.isArray
	"dojo/mouse", // mouse.isLeft
	"dojo/on",
	"dojo/sniff", // has("webkit")
	"dojo/window", // winUtils.scrollIntoView
	"../a11y"    // a11y.hasDefaultTabStop
], function(array, declare, domAttr, domStyle, lang, mouse, on, has, winUtils, a11y){

	// module:
	//		dijit/form/_FormWidgetMixin

	return declare("dijit.form._FormWidgetMixin", null, {
		// summary:
		//		Mixin for widgets corresponding to native HTML elements such as `<checkbox>` or `<button>`,
		//		which can be children of a `<form>` node or a `dijit/form/Form` widget.
		//
		// description:
		//		Represents a single HTML element.
		//		All these widgets should have these attributes just like native HTML input elements.
		//		You can set them during widget construction or afterwards, via `dijit/_WidgetBase.set()`.
		//
		//		They also share some common methods.

		// name: [const] String
		//		Name used when submitting form; same as "name" attribute or plain HTML elements
		name: "",

		// alt: String
		//		Corresponds to the native HTML `<input>` element's attribute.
		alt: "",

		// value: String
		//		Corresponds to the native HTML `<input>` element's attribute.
		value: "",

		// type: [const] String
		//		Corresponds to the native HTML `<input>` element's attribute.
		type: "text",

		// type: String
		//		Apply aria-label in markup to the widget's focusNode
		"aria-label": "focusNode",

		// tabIndex: String
		//		Order fields are traversed when user hits the tab key
		tabIndex: "0",
		_setTabIndexAttr: "focusNode", // force copy even when tabIndex default value, needed since Button is <span>

		// disabled: Boolean
		//		Should this widget respond to user input?
		//		In markup, this is specified as "disabled='disabled'", or just "disabled".
		disabled: false,

		// intermediateChanges: Boolean
		//		Fires onChange for each value change or only on demand
		intermediateChanges: false,

		// scrollOnFocus: Boolean
		//		On focus, should this widget scroll into view?
		scrollOnFocus: true,

		// Override _WidgetBase mapping id to this.domNode, needs to be on focusNode so <label> etc.
		// works with screen reader
		_setIdAttr: "focusNode",

		_setDisabledAttr: function(/*Boolean*/ value){
			this._set("disabled", value);
			domAttr.set(this.focusNode, 'disabled', value);
			if(this.valueNode){
				domAttr.set(this.valueNode, 'disabled', value);
			}
			this.focusNode.setAttribute("aria-disabled", value ? "true" : "false");

			if(value){
				// reset these, because after the domNode is disabled, we can no longer receive
				// mouse related events, see #4200
				this._set("hovering", false);
				this._set("active", false);

				// clear tab stop(s) on this widget's focusable node(s)  (ComboBox has two focusable nodes)
				var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex :
					("_setTabIndexAttr" in this) ? this._setTabIndexAttr : "focusNode";
				array.forEach(lang.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function(attachPointName){
					var node = this[attachPointName];
					// complex code because tabIndex=-1 on a <div> doesn't work on FF
					if(has("webkit") || a11y.hasDefaultTabStop(node)){    // see #11064 about webkit bug
						node.setAttribute('tabIndex', "-1");
					}else{
						node.removeAttribute('tabIndex');
					}
				}, this);
			}else{
				if(this.tabIndex != ""){
					this.set('tabIndex', this.tabIndex);
				}
			}
		},

		_onFocus: function(/*String*/ by){
			// If user clicks on the widget, even if the mouse is released outside of it,
			// this widget's focusNode should get focus (to mimic native browser behavior).
			// Browsers often need help to make sure the focus via mouse actually gets to the focusNode.
			// TODO: consider removing all of this for 2.0 or sooner, see #16622 etc.
			if(by == "mouse" && this.isFocusable()){
				// IE exhibits strange scrolling behavior when refocusing a node so only do it when !focused.
				var focusHandle = this.own(on(this.focusNode, "focus", function(){
					mouseUpHandle.remove();
					focusHandle.remove();
				}))[0];
				// Set a global event to handle mouseup, so it fires properly
				// even if the cursor leaves this.domNode before the mouse up event.
				var mouseUpHandle = this.own(on(this.ownerDocumentBody, "mouseup, touchend", lang.hitch(this, function(evt){
					mouseUpHandle.remove();
					focusHandle.remove();
					// if here, then the mousedown did not focus the focusNode as the default action
					if(this.focused){
						if(evt.type == "touchend"){
							this.defer("focus"); // native focus hasn't occurred yet
						}else{
							this.focus(); // native focus already occurred on mousedown
						}
					}
				})))[0];
			}
			if(this.scrollOnFocus){
				this.defer(function(){
					winUtils.scrollIntoView(this.domNode);
				}); // without defer, the input caret position can change on mouse click
			}
			this.inherited(arguments);
		},

		isFocusable: function(){
			// summary:
			//		Tells if this widget is focusable or not.  Used internally by dijit.
			// tags:
			//		protected
			return !this.disabled && this.focusNode && (domStyle.get(this.domNode, "display") != "none");
		},

		focus: function(){
			// summary:
			//		Put focus on this widget
			if(!this.disabled && this.focusNode.focus){
				try{
					this.focusNode.focus();
				}catch(e){
				}
				/*squelch errors from hidden nodes*/
			}
		},

		compare: function(/*anything*/ val1, /*anything*/ val2){
			// summary:
			//		Compare 2 values (as returned by get('value') for this widget).
			// tags:
			//		protected
			if(typeof val1 == "number" && typeof val2 == "number"){
				return (isNaN(val1) && isNaN(val2)) ? 0 : val1 - val2;
			}else if(val1 > val2){
				return 1;
			}else if(val1 < val2){
				return -1;
			}else{
				return 0;
			}
		},

		onChange: function(/*===== newValue =====*/){
			// summary:
			//		Callback when this widget's value is changed.
			// tags:
			//		callback
		},

		// _onChangeActive: [private] Boolean
		//		Indicates that changes to the value should call onChange() callback.
		//		This is false during widget initialization, to avoid calling onChange()
		//		when the initial value is set.
		_onChangeActive: false,

		_handleOnChange: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
			// summary:
			//		Called when the value of the widget is set.  Calls onChange() if appropriate
			// newValue:
			//		the new value
			// priorityChange:
			//		For a slider, for example, dragging the slider is priorityChange==false,
			//		but on mouse up, it's priorityChange==true.  If intermediateChanges==false,
			//		onChange is only called form priorityChange=true events.
			// tags:
			//		private
			if(this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)){
				// this block executes not for a change, but during initialization,
				// and is used to store away the original value (or for ToggleButton, the original checked state)
				this._resetValue = this._lastValueReported = newValue;
			}
			this._pendingOnChange = this._pendingOnChange
				|| (typeof newValue != typeof this._lastValueReported)
				|| (this.compare(newValue, this._lastValueReported) != 0);
			if((this.intermediateChanges || priorityChange || priorityChange === undefined) && this._pendingOnChange){
				this._lastValueReported = newValue;
				this._pendingOnChange = false;
				if(this._onChangeActive){
					if(this._onChangeHandle){
						this._onChangeHandle.remove();
					}
					// defer allows hidden value processing to run and
					// also the onChange handler can safely adjust focus, etc
					this._onChangeHandle = this.defer(
						function(){
							this._onChangeHandle = null;
							this.onChange(newValue);
						}); // try to collapse multiple onChange's fired faster than can be processed
				}
			}
		},

		create: function(){
			// Overrides _Widget.create()
			this.inherited(arguments);
			this._onChangeActive = true;
		},

		destroy: function(){
			if(this._onChangeHandle){ // destroy called before last onChange has fired
				this._onChangeHandle.remove();
				this.onChange(this._lastValueReported);
			}
			this.inherited(arguments);
		}
	});
});

},
'dojo/i18n':function(){
define(["./_base/kernel", "require", "./has", "./_base/array", "./_base/config", "./_base/lang", "./_base/xhr", "./json", "module"],
	function(dojo, require, has, array, config, lang, xhr, json, module){

	// module:
	//		dojo/i18n

	has.add("dojo-preload-i18n-Api",
		// if true, define the preload localizations machinery
		1
	);

	 1 || has.add("dojo-v1x-i18n-Api",
		// if true, define the v1.x i18n functions
		1
	);

	var
		thisModule = dojo.i18n =
			{
				// summary:
				//		This module implements the dojo/i18n! plugin and the v1.6- i18n API
				// description:
				//		We choose to include our own plugin to leverage functionality already contained in dojo
				//		and thereby reduce the size of the plugin compared to various loader implementations. Also, this
				//		allows foreign AMD loaders to be used without their plugins.
			},

		nlsRe =
			// regexp for reconstructing the master bundle name from parts of the regexp match
			// nlsRe.exec("foo/bar/baz/nls/en-ca/foo") gives:
			// ["foo/bar/baz/nls/en-ca/foo", "foo/bar/baz/nls/", "/", "/", "en-ca", "foo"]
			// nlsRe.exec("foo/bar/baz/nls/foo") gives:
			// ["foo/bar/baz/nls/foo", "foo/bar/baz/nls/", "/", "/", "foo", ""]
			// so, if match[5] is blank, it means this is the top bundle definition.
			// courtesy of http://requirejs.org
			/(^.*(^|\/)nls)(\/|$)([^\/]*)\/?([^\/]*)/,

		getAvailableLocales = function(
			root,
			locale,
			bundlePath,
			bundleName
		){
			// summary:
			//		return a vector of module ids containing all available locales with respect to the target locale
			//		For example, assuming:
			//
			//		- the root bundle indicates specific bundles for "fr" and "fr-ca",
			//		-  bundlePath is "myPackage/nls"
			//		- bundleName is "myBundle"
			//
			//		Then a locale argument of "fr-ca" would return
			//
			//			["myPackage/nls/myBundle", "myPackage/nls/fr/myBundle", "myPackage/nls/fr-ca/myBundle"]
			//
			//		Notice that bundles are returned least-specific to most-specific, starting with the root.
			//
			//		If root===false indicates we're working with a pre-AMD i18n bundle that doesn't tell about the available locales;
			//		therefore, assume everything is available and get 404 errors that indicate a particular localization is not available

			for(var result = [bundlePath + bundleName], localeParts = locale.split("-"), current = "", i = 0; i<localeParts.length; i++){
				current += (current ? "-" : "") + localeParts[i];
				if(!root || root[current]){
					result.push(bundlePath + current + "/" + bundleName);
					result.specificity = current;
				}
			}
			return result;
		},

		cache = {},

		getBundleName = function(moduleName, bundleName, locale){
			locale = locale ? locale.toLowerCase() : dojo.locale;
			moduleName = moduleName.replace(/\./g, "/");
			bundleName = bundleName.replace(/\./g, "/");
			return (/root/i.test(locale)) ?
				(moduleName + "/nls/" + bundleName) :
				(moduleName + "/nls/" + locale + "/" + bundleName);
		},

		getL10nName = dojo.getL10nName = function(moduleName, bundleName, locale){
			return moduleName = module.id + "!" + getBundleName(moduleName, bundleName, locale);
		},

		doLoad = function(require, bundlePathAndName, bundlePath, bundleName, locale, load){
			// summary:
			//		get the root bundle which instructs which other bundles are required to construct the localized bundle
			require([bundlePathAndName], function(root){
				var current = lang.clone(root.root),
					availableLocales = getAvailableLocales(!root._v1x && root, locale, bundlePath, bundleName);
				require(availableLocales, function(){
					for (var i = 1; i<availableLocales.length; i++){
						current = lang.mixin(lang.clone(current), arguments[i]);
					}
					// target may not have been resolve (e.g., maybe only "fr" exists when "fr-ca" was requested)
					var target = bundlePathAndName + "/" + locale;
					cache[target] = current;
					current.$locale = availableLocales.specificity;
					load();
				});
			});
		},

		normalize = function(id, toAbsMid){
			// summary:
			//		id may be relative.
			//		preload has form `*preload*<path>/nls/<module>*<flattened locales>` and
			//		therefore never looks like a relative
			return /^\./.test(id) ? toAbsMid(id) : id;
		},

		getLocalesToLoad = function(targetLocale){
			var list = config.extraLocale || [];
			list = lang.isArray(list) ? list : [list];
			list.push(targetLocale);
			return list;
		},

		load = function(id, require, load){
			// summary:
			//		id is in one of the following formats
			//
			//		1. <path>/nls/<bundle>
			//			=> load the bundle, localized to config.locale; load all bundles localized to
			//			config.extraLocale (if any); return the loaded bundle localized to config.locale.
			//
			//		2. <path>/nls/<locale>/<bundle>
			//			=> load then return the bundle localized to <locale>
			//
			//		3. *preload*<path>/nls/<module>*<JSON array of available locales>
			//			=> for config.locale and all config.extraLocale, load all bundles found
			//			in the best-matching bundle rollup. A value of 1 is returned, which
			//			is meaningless other than to say the plugin is executing the requested
			//			preloads
			//
			//		In cases 1 and 2, <path> is always normalized to an absolute module id upon entry; see
			//		normalize. In case 3, it <path> is assumed to be absolute; this is arranged by the builder.
			//
			//		To load a bundle means to insert the bundle into the plugin's cache and publish the bundle
			//		value to the loader. Given <path>, <bundle>, and a particular <locale>, the cache key
			//
			//			<path>/nls/<bundle>/<locale>
			//
			//		will hold the value. Similarly, then plugin will publish this value to the loader by
			//
			//			define("<path>/nls/<bundle>/<locale>", <bundle-value>);
			//
			//		Given this algorithm, other machinery can provide fast load paths be preplacing
			//		values in the plugin's cache, which is public. When a load is demanded the
			//		cache is inspected before starting any loading. Explicitly placing values in the plugin
			//		cache is an advanced/experimental feature that should not be needed; use at your own risk.
			//
			//		For the normal AMD algorithm, the root bundle is loaded first, which instructs the
			//		plugin what additional localized bundles are required for a particular locale. These
			//		additional locales are loaded and a mix of the root and each progressively-specific
			//		locale is returned. For example:
			//
			//		1. The client demands "dojo/i18n!some/path/nls/someBundle
			//
			//		2. The loader demands load(some/path/nls/someBundle)
			//
			//		3. This plugin require's "some/path/nls/someBundle", which is the root bundle.
			//
			//		4. Assuming config.locale is "ab-cd-ef" and the root bundle indicates that localizations
			//		are available for "ab" and "ab-cd-ef" (note the missing "ab-cd", then the plugin
			//		requires "some/path/nls/ab/someBundle" and "some/path/nls/ab-cd-ef/someBundle"
			//
			//		5. Upon receiving all required bundles, the plugin constructs the value of the bundle
			//		ab-cd-ef as...
			//
			//				mixin(mixin(mixin({}, require("some/path/nls/someBundle"),
			//		  			require("some/path/nls/ab/someBundle")),
			//					require("some/path/nls/ab-cd-ef/someBundle"));
			//
			//		This value is inserted into the cache and published to the loader at the
			//		key/module-id some/path/nls/someBundle/ab-cd-ef.
			//
			//		The special preload signature (case 3) instructs the plugin to stop servicing all normal requests
			//		(further preload requests will be serviced) until all ongoing preloading has completed.
			//
			//		The preload signature instructs the plugin that a special rollup module is available that contains
			//		one or more flattened, localized bundles. The JSON array of available locales indicates which locales
			//		are available. Here is an example:
			//
			//			*preload*some/path/nls/someModule*["root", "ab", "ab-cd-ef"]
			//
			//		This indicates the following rollup modules are available:
			//
			//			some/path/nls/someModule_ROOT
			//			some/path/nls/someModule_ab
			//			some/path/nls/someModule_ab-cd-ef
			//
			//		Each of these modules is a normal AMD module that contains one or more flattened bundles in a hash.
			//		For example, assume someModule contained the bundles some/bundle/path/someBundle and
			//		some/bundle/path/someOtherBundle, then some/path/nls/someModule_ab would be expressed as follows:
			//
			//			define({
			//				some/bundle/path/someBundle:<value of someBundle, flattened with respect to locale ab>,
			//				some/bundle/path/someOtherBundle:<value of someOtherBundle, flattened with respect to locale ab>,
			//			});
			//
			//		E.g., given this design, preloading for locale=="ab" can execute the following algorithm:
			//
			//			require(["some/path/nls/someModule_ab"], function(rollup){
			//				for(var p in rollup){
			//					var id = p + "/ab",
			//					cache[id] = rollup[p];
			//					define(id, rollup[p]);
			//				}
			//			});
			//
			//		Similarly, if "ab-cd" is requested, the algorithm can determine that "ab" is the best available and
			//		load accordingly.
			//
			//		The builder will write such rollups for every layer if a non-empty localeList  profile property is
			//		provided. Further, the builder will include the following cache entry in the cache associated with
			//		any layer.
			//
			//			"*now":function(r){r(['dojo/i18n!*preload*<path>/nls/<module>*<JSON array of available locales>']);}
			//
			//		The *now special cache module instructs the loader to apply the provided function to context-require
			//		with respect to the particular layer being defined. This causes the plugin to hold all normal service
			//		requests until all preloading is complete.
			//
			//		Notice that this algorithm is rarely better than the standard AMD load algorithm. Consider the normal case
			//		where the target locale has a single segment and a layer depends on a single bundle:
			//
			//		Without Preloads:
			//
			//		1. Layer loads root bundle.
			//		2. bundle is demanded; plugin loads single localized bundle.
			//
			//		With Preloads:
			//
			//		1. Layer causes preloading of target bundle.
			//		2. bundle is demanded; service is delayed until preloading complete; bundle is returned.
			//
			//		In each case a single transaction is required to load the target bundle. In cases where multiple bundles
			//		are required and/or the locale has multiple segments, preloads still requires a single transaction whereas
			//		the normal path requires an additional transaction for each additional bundle/locale-segment. However all
			//		of these additional transactions can be done concurrently. Owing to this analysis, the entire preloading
			//		algorithm can be discard during a build by setting the has feature dojo-preload-i18n-Api to false.

			if(has("dojo-preload-i18n-Api")){
				var split = id.split("*"),
					preloadDemand = split[1] == "preload";
				if(preloadDemand){
					if(!cache[id]){
						// use cache[id] to prevent multiple preloads of the same preload; this shouldn't happen, but
						// who knows what over-aggressive human optimizers may attempt
						cache[id] = 1;
						preloadL10n(split[2], json.parse(split[3]), 1, require);
					}
					// don't stall the loader!
					load(1);
				}
				if(preloadDemand || waitForPreloads(id, require, load)){
					return;
				}
			}

			var match = nlsRe.exec(id),
				bundlePath = match[1] + "/",
				bundleName = match[5] || match[4],
				bundlePathAndName = bundlePath + bundleName,
				localeSpecified = (match[5] && match[4]),
				targetLocale =	localeSpecified || dojo.locale || "",
				loadTarget = bundlePathAndName + "/" + targetLocale,
				loadList = localeSpecified ? [targetLocale] : getLocalesToLoad(targetLocale),
				remaining = loadList.length,
				finish = function(){
					if(!--remaining){
						load(lang.delegate(cache[loadTarget]));
					}
				};
			array.forEach(loadList, function(locale){
				var target = bundlePathAndName + "/" + locale;
				if(has("dojo-preload-i18n-Api")){
					checkForLegacyModules(target);
				}
				if(!cache[target]){
					doLoad(require, bundlePathAndName, bundlePath, bundleName, locale, finish);
				}else{
					finish();
				}
			});
		};

	if(has("dojo-unit-tests")){
		var unitTests = thisModule.unitTests = [];
	}

	if(has("dojo-preload-i18n-Api") ||  1 ){
		var normalizeLocale = thisModule.normalizeLocale = function(locale){
				var result = locale ? locale.toLowerCase() : dojo.locale;
				return result == "root" ? "ROOT" : result;
			},

			isXd = function(mid, contextRequire){
				return ( 1  &&  1 ) ?
					contextRequire.isXdUrl(require.toUrl(mid + ".js")) :
					true;
			},

			preloading = 0,

			preloadWaitQueue = [],

			preloadL10n = thisModule._preloadLocalizations = function(/*String*/bundlePrefix, /*Array*/localesGenerated, /*boolean?*/ guaranteedAmdFormat, /*function?*/ contextRequire){
				// summary:
				//		Load available flattened resource bundles associated with a particular module for dojo/locale and all dojo/config.extraLocale (if any)
				// description:
				//		Only called by built layer files. The entire locale hierarchy is loaded. For example,
				//		if locale=="ab-cd", then ROOT, "ab", and "ab-cd" are loaded. This is different than v1.6-
				//		in that the v1.6- would only load ab-cd...which was *always* flattened.
				//
				//		If guaranteedAmdFormat is true, then the module can be loaded with require thereby circumventing the detection algorithm
				//		and the extra possible extra transaction.

				// If this function is called from legacy code, then guaranteedAmdFormat and contextRequire will be undefined. Since the function
				// needs a require in order to resolve module ids, fall back to the context-require associated with this dojo/i18n module, which
				// itself may have been mapped.
				contextRequire = contextRequire || require;

				function doRequire(mid, callback){
					if(isXd(mid, contextRequire) || guaranteedAmdFormat){
						contextRequire([mid], callback);
					}else{
						syncRequire([mid], callback, contextRequire);
					}
				}

				function forEachLocale(locale, func){
					// given locale= "ab-cd-ef", calls func on "ab-cd-ef", "ab-cd", "ab", "ROOT"; stops calling the first time func returns truthy
					var parts = locale.split("-");
					while(parts.length){
						if(func(parts.join("-"))){
							return;
						}
						parts.pop();
					}
					func("ROOT");
				}

				function preload(locale){
					locale = normalizeLocale(locale);
					forEachLocale(locale, function(loc){
						if(array.indexOf(localesGenerated, loc)>=0){
							var mid = bundlePrefix.replace(/\./g, "/")+"_"+loc;
							preloading++;
							doRequire(mid, function(rollup){
								for(var p in rollup){
									cache[require.toAbsMid(p) + "/" + loc] = rollup[p];
								}
								--preloading;
								while(!preloading && preloadWaitQueue.length){
									load.apply(null, preloadWaitQueue.shift());
								}
							});
							return true;
						}
						return false;
					});
				}

				preload();
				array.forEach(dojo.config.extraLocale, preload);
			},

			waitForPreloads = function(id, require, load){
				if(preloading){
					preloadWaitQueue.push([id, require, load]);
				}
				return preloading;
			},

			checkForLegacyModules = function()
				{};
	}

	if( 1 ){
		// this code path assumes the dojo loader and won't work with a standard AMD loader
		var amdValue = {},
			evalBundle =
				// use the function ctor to keep the minifiers away (also come close to global scope, but this is secondary)
				new Function(
					"__bundle",				   // the bundle to evalutate
					"__checkForLegacyModules", // a function that checks if __bundle defined __mid in the global space
					"__mid",				   // the mid that __bundle is intended to define
					"__amdValue",

					// returns one of:
					//		1 => the bundle was an AMD bundle
					//		a legacy bundle object that is the value of __mid
					//		instance of Error => could not figure out how to evaluate bundle

					  // used to detect when __bundle calls define
					  "var define = function(mid, factory){define.called = 1; __amdValue.result = factory || mid;},"
					+ "	   require = function(){define.called = 1;};"

					+ "try{"
					+		"define.called = 0;"
					+		"eval(__bundle);"
					+		"if(define.called==1)"
								// bundle called define; therefore signal it's an AMD bundle
					+			"return __amdValue;"

					+		"if((__checkForLegacyModules = __checkForLegacyModules(__mid)))"
								// bundle was probably a v1.6- built NLS flattened NLS bundle that defined __mid in the global space
					+			"return __checkForLegacyModules;"

					+ "}catch(e){}"
					// evaulating the bundle was *neither* an AMD *nor* a legacy flattened bundle
					// either way, re-eval *after* surrounding with parentheses

					+ "try{"
					+		"return eval('('+__bundle+')');"
					+ "}catch(e){"
					+		"return e;"
					+ "}"
				),

			syncRequire = function(deps, callback, require){
				var results = [];
				array.forEach(deps, function(mid){
					var url = require.toUrl(mid + ".js");

					function load(text){
						var result = evalBundle(text, checkForLegacyModules, mid, amdValue);
						if(result===amdValue){
							// the bundle was an AMD module; re-inject it through the normal AMD path
							// we gotta do this since it could be an anonymous module and simply evaluating
							// the text here won't provide the loader with the context to know what
							// module is being defined()'d. With browser caching, this should be free; further
							// this entire code path can be circumvented by using the AMD format to begin with
							results.push(cache[url] = amdValue.result);
						}else{
							if(result instanceof Error){
								console.error("failed to evaluate i18n bundle; url=" + url, result);
								result = {};
							}
							// nls/<locale>/<bundle-name> indicates not the root.
							results.push(cache[url] = (/nls\/[^\/]+\/[^\/]+$/.test(url) ? result : {root:result, _v1x:1}));
						}
					}

					if(cache[url]){
						results.push(cache[url]);
					}else{
						var bundle = require.syncLoadNls(mid);
						// don't need to check for legacy since syncLoadNls returns a module if the module
						// (1) was already loaded, or (2) was in the cache. In case 1, if syncRequire is called
						// from getLocalization --> load, then load will have called checkForLegacyModules() before
						// calling syncRequire; if syncRequire is called from preloadLocalizations, then we
						// don't care about checkForLegacyModules() because that will be done when a particular
						// bundle is actually demanded. In case 2, checkForLegacyModules() is never relevant
						// because cached modules are always v1.7+ built modules.
						if(bundle){
							results.push(bundle);
						}else{
							if(!xhr){
								try{
									require.getText(url, true, load);
								}catch(e){
									results.push(cache[url] = {});
								}
							}else{
								xhr.get({
									url:url,
									sync:true,
									load:load,
									error:function(){
										results.push(cache[url] = {});
									}
								});
							}
						}
					}
				});
				callback && callback.apply(null, results);
			};

		checkForLegacyModules = function(target){
			// legacy code may have already loaded [e.g] the raw bundle x/y/z at x.y.z; when true, push into the cache
			for(var result, names = target.split("/"), object = dojo.global[names[0]], i = 1; object && i<names.length-1; object = object[names[i++]]){}
			if(object){
				result = object[names[i]];
				if(!result){
					// fallback for incorrect bundle build of 1.6
					result = object[names[i].replace(/-/g,"_")];
				}
				if(result){
					cache[target] = result;
				}
			}
			return result;
		};

		thisModule.getLocalization = function(moduleName, bundleName, locale){
			var result,
				l10nName = getBundleName(moduleName, bundleName, locale);
			load(
				l10nName,

				// isXd() and syncRequire() need a context-require in order to resolve the mid with respect to a reference module.
				// Since this legacy function does not have the concept of a reference module, resolve with respect to this
				// dojo/i18n module, which, itself may have been mapped.
				(!isXd(l10nName, require) ? function(deps, callback){ syncRequire(deps, callback, require); } : require),

				function(result_){ result = result_; }
			);
			return result;
		};

		if(has("dojo-unit-tests")){
			unitTests.push(function(doh){
				doh.register("tests.i18n.unit", function(t){
					var check;

					check = evalBundle("{prop:1}", checkForLegacyModules, "nonsense", amdValue);
					t.is({prop:1}, check); t.is(undefined, check[1]);

					check = evalBundle("({prop:1})", checkForLegacyModules, "nonsense", amdValue);
					t.is({prop:1}, check); t.is(undefined, check[1]);

					check = evalBundle("{'prop-x':1}", checkForLegacyModules, "nonsense", amdValue);
					t.is({'prop-x':1}, check); t.is(undefined, check[1]);

					check = evalBundle("({'prop-x':1})", checkForLegacyModules, "nonsense", amdValue);
					t.is({'prop-x':1}, check); t.is(undefined, check[1]);

					check = evalBundle("define({'prop-x':1})", checkForLegacyModules, "nonsense", amdValue);
					t.is(amdValue, check); t.is({'prop-x':1}, amdValue.result);

					check = evalBundle("define('some/module', {'prop-x':1})", checkForLegacyModules, "nonsense", amdValue);
					t.is(amdValue, check); t.is({'prop-x':1}, amdValue.result);

					check = evalBundle("this is total nonsense and should throw an error", checkForLegacyModules, "nonsense", amdValue);
					t.is(check instanceof Error, true);
				});
			});
		}
	}

	return lang.mixin(thisModule, {
		dynamic:true,
		normalize:normalize,
		load:load,
		cache:cache,
		getL10nName: getL10nName
	});
});

},
'dijit/BackgroundIframe':function(){
define([
	"require",			// require.toUrl
	"./main",	// to export dijit.BackgroundIframe
	"dojo/_base/config",
	"dojo/dom-construct", // domConstruct.create
	"dojo/dom-style", // domStyle.set
	"dojo/_base/lang", // lang.extend lang.hitch
	"dojo/on",
	"dojo/sniff" // has("ie"), has("mozilla"), has("quirks")
], function(require, dijit, config, domConstruct, domStyle, lang, on, has){

	// module:
	//		dijit/BackgroundIFrame

	// Flag for whether to create background iframe behind popups like Menus and Dialog.
	// A background iframe is useful to prevent problems with popups appearing behind applets/pdf files,
	// and is also useful on older versions of IE (IE6 and IE7) to prevent the "bleed through select" problem.
	// TODO: For 2.0, make this false by default.  Also, possibly move definition to has.js so that this module can be
	// conditionally required via  dojo/has!bgIfame?dijit/BackgroundIframe
	has.add("config-bgIframe", !has("touch"));

	// TODO: remove _frames, it isn't being used much, since popups never release their
	// iframes (see [22236])
	var _frames = new function(){
		// summary:
		//		cache of iframes

		var queue = [];

		this.pop = function(){
			var iframe;
			if(queue.length){
				iframe = queue.pop();
				iframe.style.display="";
			}else{
				// transparency needed for DialogUnderlay and for tooltips on IE (to see screen near connector)
				if(has("ie") < 9){
					var burl = config["dojoBlankHtmlUrl"] || require.toUrl("dojo/resources/blank.html") || "javascript:\"\"";
					var html="<iframe src='" + burl + "' role='presentation'"
						+ " style='position: absolute; left: 0px; top: 0px;"
						+ "z-index: -1; filter:Alpha(Opacity=\"0\");'>";
					iframe = document.createElement(html);
				}else{
					iframe = domConstruct.create("iframe");
					iframe.src = 'javascript:""';
					iframe.className = "dijitBackgroundIframe";
					iframe.setAttribute("role", "presentation");
					domStyle.set(iframe, "opacity", 0.1);
				}
				iframe.tabIndex = -1; // Magic to prevent iframe from getting focus on tab keypress - as style didn't work.
			}
			return iframe;
		};

		this.push = function(iframe){
			iframe.style.display="none";
			queue.push(iframe);
		}
	}();


	dijit.BackgroundIframe = function(/*DomNode*/ node){
		// summary:
		//		For IE/FF z-index shenanigans. id attribute is required.
		//
		// description:
		//		new dijit.BackgroundIframe(node).
		//
		//		Makes a background iframe as a child of node, that fills
		//		area (and position) of node

		if(!node.id){ throw new Error("no id"); }
		if(has("config-bgIframe")){
			var iframe = (this.iframe = _frames.pop());
			node.appendChild(iframe);
			if(has("ie")<7 || has("quirks")){
				this.resize(node);
				this._conn = on(node, 'resize', lang.hitch(this, "resize", node));
			}else{
				domStyle.set(iframe, {
					width: '100%',
					height: '100%'
				});
			}
		}
	};

	lang.extend(dijit.BackgroundIframe, {
		resize: function(node){
			// summary:
			//		Resize the iframe so it's the same size as node.
			//		Needed on IE6 and IE/quirks because height:100% doesn't work right.
			if(this.iframe){
				domStyle.set(this.iframe, {
					width: node.offsetWidth + 'px',
					height: node.offsetHeight + 'px'
				});
			}
		},
		destroy: function(){
			// summary:
			//		destroy the iframe
			if(this._conn){
				this._conn.remove();
				this._conn = null;
			}
			if(this.iframe){
				_frames.push(this.iframe);
				delete this.iframe;
			}
		}
	});

	return dijit.BackgroundIframe;
});

},
'dijit/form/ValidationTextBox':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/i18n", // i18n.getLocalization
	"./TextBox",
	"../Tooltip",
	"dojo/text!./templates/ValidationTextBox.html",
	"dojo/i18n!./nls/validate"
], function(declare, kernel, i18n, TextBox, Tooltip, template){

	// module:
	//		dijit/form/ValidationTextBox


	/*=====
	var __Constraints = {
		// locale: String
		//		locale used for validation, picks up value from this widget's lang attribute
		// _flags_: anything
		//		various flags passed to pattern function
	};
	=====*/

	var ValidationTextBox;
	return ValidationTextBox = declare("dijit.form.ValidationTextBox", TextBox, {
		// summary:
		//		Base class for textbox widgets with the ability to validate content of various types and provide user feedback.

		templateString: template,

		// required: Boolean
		//		User is required to enter data into this field.
		required: false,

		// promptMessage: String
		//		If defined, display this hint string immediately on focus to the textbox, if empty.
		//		Also displays if the textbox value is Incomplete (not yet valid but will be with additional input).
		//		Think of this like a tooltip that tells the user what to do, not an error message
		//		that tells the user what they've done wrong.
		//
		//		Message disappears when user starts typing.
		promptMessage: "",

		// invalidMessage: String
		//		The message to display if value is invalid.
		//		The translated string value is read from the message file by default.
		//		Set to "" to use the promptMessage instead.
		invalidMessage: "$_unset_$",

		// missingMessage: String
		//		The message to display if value is empty and the field is required.
		//		The translated string value is read from the message file by default.
		//		Set to "" to use the invalidMessage instead.
		missingMessage: "$_unset_$",

		// message: String
		//		Currently error/prompt message.
		//		When using the default tooltip implementation, this will only be
		//		displayed when the field is focused.
		message: "",

		// constraints: __Constraints
		//		user-defined object needed to pass parameters to the validator functions
		constraints: {},

		// pattern: [extension protected] String|Function(constraints) returning a string.
		//		This defines the regular expression used to validate the input.
		//		Do not add leading ^ or $ characters since the widget adds these.
		//		A function may be used to generate a valid pattern when dependent on constraints or other runtime factors.
		//		set('pattern', String|Function).
		pattern: ".*",

		// regExp: Deprecated [extension protected] String.  Use "pattern" instead.
		regExp: "",

		regExpGen: function(/*__Constraints*/ /*===== constraints =====*/){
			// summary:
			//		Deprecated.  Use set('pattern', Function) instead.
		},

		// state: [readonly] String
		//		Shows current state (ie, validation result) of input (""=Normal, Incomplete, or Error)
		state: "",

		// tooltipPosition: String[]
		//		See description of `dijit/Tooltip.defaultPosition` for details on this parameter.
		tooltipPosition: [],

		_deprecateRegExp: function(attr, value){
			if(value != ValidationTextBox.prototype[attr]){
				kernel.deprecated("ValidationTextBox id="+this.id+", set('" + attr + "', ...) is deprecated.  Use set('pattern', ...) instead.", "", "2.0");
				this.set('pattern', value);
			}
		},
		_setRegExpGenAttr: function(/*Function*/ newFcn){
			this._deprecateRegExp("regExpGen", newFcn);
			this._set("regExpGen", this._computeRegexp); // backward compat with this.regExpGen(this.constraints)
		},
		_setRegExpAttr: function(/*String*/ value){
			this._deprecateRegExp("regExp", value);
		},

		_setValueAttr: function(){
			// summary:
			//		Hook so set('value', ...) works.
			this.inherited(arguments);
			this._refreshState();
		},

		validator: function(/*anything*/ value, /*__Constraints*/ constraints){
			// summary:
			//		Overridable function used to validate the text input against the regular expression.
			// tags:
			//		protected
			return (new RegExp("^(?:" + this._computeRegexp(constraints) + ")"+(this.required?"":"?")+"$")).test(value) &&
				(!this.required || !this._isEmpty(value)) &&
				(this._isEmpty(value) || this.parse(value, constraints) !== undefined); // Boolean
		},

		_isValidSubset: function(){
			// summary:
			//		Returns true if the value is either already valid or could be made valid by appending characters.
			//		This is used for validation while the user [may be] still typing.
			return this.textbox.value.search(this._partialre) == 0;
		},

		isValid: function(/*Boolean*/ /*===== isFocused =====*/){
			// summary:
			//		Tests if value is valid.
			//		Can override with your own routine in a subclass.
			// tags:
			//		protected
			return this.validator(this.textbox.value, this.get('constraints'));
		},

		_isEmpty: function(value){
			// summary:
			//		Checks for whitespace
			return (this.trim ? /^\s*$/ : /^$/).test(value); // Boolean
		},

		getErrorMessage: function(/*Boolean*/ /*===== isFocused =====*/){
			// summary:
			//		Return an error message to show if appropriate
			// tags:
			//		protected
			var invalid = this.invalidMessage == "$_unset_$" ? this.messages.invalidMessage :
				!this.invalidMessage ? this.promptMessage : this.invalidMessage;
			var missing = this.missingMessage == "$_unset_$" ? this.messages.missingMessage :
				!this.missingMessage ? invalid : this.missingMessage;
			return (this.required && this._isEmpty(this.textbox.value)) ? missing : invalid; // String
		},

		getPromptMessage: function(/*Boolean*/ /*===== isFocused =====*/){
			// summary:
			//		Return a hint message to show when widget is first focused
			// tags:
			//		protected
			return this.promptMessage; // String
		},

		_maskValidSubsetError: true,
		validate: function(/*Boolean*/ isFocused){
			// summary:
			//		Called by oninit, onblur, and onkeypress.
			// description:
			//		Show missing or invalid messages if appropriate, and highlight textbox field.
			// tags:
			//		protected
			var message = "";
			var isValid = this.disabled || this.isValid(isFocused);
			if(isValid){ this._maskValidSubsetError = true; }
			var isEmpty = this._isEmpty(this.textbox.value);
			var isValidSubset = !isValid && isFocused && this._isValidSubset();
			this._set("state", isValid ? "" : (((((!this._hasBeenBlurred || isFocused) && isEmpty) || isValidSubset) && (this._maskValidSubsetError || (isValidSubset && !this._hasBeenBlurred && isFocused))) ? "Incomplete" : "Error"));
			this.focusNode.setAttribute("aria-invalid", isValid ? "false" : "true");

			if(this.state == "Error"){
				this._maskValidSubsetError = isFocused && isValidSubset; // we want the error to show up after a blur and refocus
				message = this.getErrorMessage(isFocused);
			}else if(this.state == "Incomplete"){
				message = this.getPromptMessage(isFocused); // show the prompt whenever the value is not yet complete
				this._maskValidSubsetError = !this._hasBeenBlurred || isFocused; // no Incomplete warnings while focused
			}else if(isEmpty){
				message = this.getPromptMessage(isFocused); // show the prompt whenever there's no error and no text
			}
			this.set("message", message);

			return isValid;
		},

		displayMessage: function(/*String*/ message){
			// summary:
			//		Overridable method to display validation errors/hints.
			//		By default uses a tooltip.
			// tags:
			//		extension
			if(message && this.focused){
				Tooltip.show(message, this.domNode, this.tooltipPosition, !this.isLeftToRight());
			}else{
				Tooltip.hide(this.domNode);
			}
		},

		_refreshState: function(){
			// Overrides TextBox._refreshState()
			if(this._created){ // should instead be this._started but that would require all programmatic ValidationTextBox instantiations to call startup()
				this.validate(this.focused);
			}
			this.inherited(arguments);
		},

		//////////// INITIALIZATION METHODS ///////////////////////////////////////

		constructor: function(params /*===== , srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified, replace srcNodeRef with my generated DOM tree.

			this.constraints = {};
			this.baseClass += ' dijitValidationTextBox';
		},

		startup: function(){
			this.inherited(arguments);
			this._refreshState(); // after all _set* methods have run
		},

		_setConstraintsAttr: function(/*__Constraints*/ constraints){
			if(!constraints.locale && this.lang){
				constraints.locale = this.lang;
			}
			this._set("constraints", constraints);
			this._refreshState();
		},

		_setPatternAttr: function(/*String|Function*/ pattern){
			this._set("pattern", pattern); // don't set on INPUT to avoid native HTML5 validation
		},

		_computeRegexp: function(/*__Constraints*/ constraints){
			// summary:
			//		Hook to get the current regExp and to compute the partial validation RE.

			var p = this.pattern;
			if(typeof p == "function"){
				p = p.call(this, constraints);
			}
			if(p != this._lastRegExp){
				var partialre = "";
				this._lastRegExp = p;
				// parse the regexp and produce a new regexp that matches valid subsets
				// if the regexp is .* then there's no use in matching subsets since everything is valid
				if(p != ".*"){
					p.replace(/\\.|\[\]|\[.*?[^\\]{1}\]|\{.*?\}|\(\?[=:!]|./g,
					function(re){
						switch(re.charAt(0)){
							case '{':
							case '+':
							case '?':
							case '*':
							case '^':
							case '$':
							case '|':
							case '(':
								partialre += re;
								break;
							case ")":
								partialre += "|$)";
								break;
							 default:
								partialre += "(?:"+re+"|$)";
								break;
						}
					});
				}
				try{ // this is needed for now since the above regexp parsing needs more test verification
					"".search(partialre);
				}catch(e){ // should never be here unless the original RE is bad or the parsing is bad
					partialre = this.pattern;
					console.warn('RegExp error in ' + this.declaredClass + ': ' + this.pattern);
				} // should never be here unless the original RE is bad or the parsing is bad
				this._partialre = "^(?:" + partialre + ")$";
			}
			return p;
		},

		postMixInProperties: function(){
			this.inherited(arguments);
			this.messages = i18n.getLocalization("dijit.form", "validate", this.lang);
			this._setConstraintsAttr(this.constraints); // this needs to happen now (and later) due to codependency on _set*Attr calls attachPoints
		},

		_setDisabledAttr: function(/*Boolean*/ value){
			this.inherited(arguments);	// call FormValueWidget._setDisabledAttr()
			this._refreshState();
		},

		_setRequiredAttr: function(/*Boolean*/ value){
			this._set("required", value);
			this.focusNode.setAttribute("aria-required", value);
			this._refreshState();
		},

		_setMessageAttr: function(/*String*/ message){
			this._set("message", message);
			this.displayMessage(message);
		},

		reset:function(){
			// Overrides dijit/form/TextBox.reset() by also
			// hiding errors about partial matches
			this._maskValidSubsetError = true;
			this.inherited(arguments);
		},

		_onBlur: function(){
			// the message still exists but for back-compat, and to erase the tooltip
			// (if the message is being displayed as a tooltip), call displayMessage('')
			this.displayMessage('');

			this.inherited(arguments);
		}
	});
});

},
'dijit/form/_FormValueMixin':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/dom-attr", // domAttr.set
	"dojo/keys", // keys.ESCAPE
	"dojo/_base/lang",
	"dojo/on",
	"dojo/sniff", // has("ie"), has("quirks")
	"./_FormWidgetMixin"
], function(declare, domAttr, keys, lang, on, has, _FormWidgetMixin){

	// module:
	//		dijit/form/_FormValueMixin

	return declare("dijit.form._FormValueMixin", _FormWidgetMixin, {
		// summary:
		//		Mixin for widgets corresponding to native HTML elements such as `<input>` or `<select>`
		//		that have user changeable values.
		// description:
		//		Each _FormValueMixin represents a single input value, and has a (possibly hidden) `<input>` element,
		//		to which it serializes it's input value, so that form submission (either normal submission or via FormBind?)
		//		works as expected.

		// readOnly: Boolean
		//		Should this widget respond to user input?
		//		In markup, this is specified as "readOnly".
		//		Similar to disabled except readOnly form values are submitted.
		readOnly: false,

		_setReadOnlyAttr: function(/*Boolean*/ value){
			domAttr.set(this.focusNode, 'readOnly', value);
			this._set("readOnly", value);
		},

		postCreate: function(){
			this.inherited(arguments);

			// Update our reset value if it hasn't yet been set (because this.set()
			// is only called when there *is* a value)
			if(this._resetValue === undefined){
				this._lastValueReported = this._resetValue = this.value;
			}
		},

		_setValueAttr: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
			// summary:
			//		Hook so set('value', value) works.
			// description:
			//		Sets the value of the widget.
			//		If the value has changed, then fire onChange event, unless priorityChange
			//		is specified as null (or false?)
			this._handleOnChange(newValue, priorityChange);
		},

		_handleOnChange: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
			// summary:
			//		Called when the value of the widget has changed.  Saves the new value in this.value,
			//		and calls onChange() if appropriate.   See _FormWidget._handleOnChange() for details.
			this._set("value", newValue);
			this.inherited(arguments);
		},

		undo: function(){
			// summary:
			//		Restore the value to the last value passed to onChange
			this._setValueAttr(this._lastValueReported, false);
		},

		reset: function(){
			// summary:
			//		Reset the widget's value to what it was at initialization time
			this._hasBeenBlurred = false;
			this._setValueAttr(this._resetValue, true);
		}
	});
});

},
'dijit/_editor/plugins/ViewSource':function(){
define([
	"dojo/_base/array", // array.forEach
	"dojo/aspect", // Aspect commands for advice
	"dojo/_base/declare", // declare
	"dojo/dom-attr", // domAttr.set
	"dojo/dom-construct", // domConstruct.create domConstruct.place
	"dojo/dom-geometry", // domGeometry.setMarginBox domGeometry.position
	"dojo/dom-style", // domStyle.set
	"dojo/i18n", // i18n.getLocalization
	"dojo/keys", // keys.F12
	"dojo/_base/lang", // lang.hitch
	"dojo/on", // on()
	"dojo/sniff", // has("ie")
	"dojo/window", // winUtils.getBox
	"../../focus", // focus.focus()
	"../_Plugin",
	"../../form/ToggleButton",
	"../..", // dijit._scopeName
	"../../registry", // registry.getEnclosingWidget()
	"dojo/i18n!../nls/commands"
], function(array, aspect, declare, domAttr, domConstruct, domGeometry, domStyle, i18n, keys, lang, on, has, winUtils,
			focus, _Plugin, ToggleButton, dijit, registry){

	// module:
	//		dijit/_editor/plugins/ViewSource

	var ViewSource = declare("dijit._editor.plugins.ViewSource", _Plugin, {
		// summary:
		//		This plugin provides a simple view source capability.  When view
		//		source mode is enabled, it disables all other buttons/plugins on the RTE.
		//		It also binds to the hotkey: CTRL-SHIFT-F11 for toggling ViewSource mode.

		// stripScripts: [public] Boolean
		//		Boolean flag used to indicate if script tags should be stripped from the document.
		//		Defaults to true.
		stripScripts: true,

		// stripComments: [public] Boolean
		//		Boolean flag used to indicate if comment tags should be stripped from the document.
		//		Defaults to true.
		stripComments: true,

		// stripComments: [public] Boolean
		//		Boolean flag used to indicate if iframe tags should be stripped from the document.
		//		Defaults to true.
		stripIFrames: true,

		// readOnly: [const] Boolean
		//		Boolean flag used to indicate if the source view should be readonly or not.
		//		Cannot be changed after initialization of the plugin.
		//		Defaults to false.
		readOnly: false,

		// _fsPlugin: [private] Object
		//		Reference to a registered fullscreen plugin so that viewSource knows
		//		how to scale.
		_fsPlugin: null,

		toggle: function(){
			// summary:
			//		Function to allow programmatic toggling of the view.

			// For Webkit, we have to focus a very particular way.
			// when swapping views, otherwise focus doesn't shift right
			// but can't focus this way all the time, only for VS changes.
			// If we did it all the time, buttons like bold, italic, etc
			// break.
			if(has("webkit")){
				this._vsFocused = true;
			}
			this.button.set("checked", !this.button.get("checked"));

		},

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the resize button.
			var strings = i18n.getLocalization("dijit._editor", "commands"),
				editor = this.editor;
			this.button = new ToggleButton({
				label: strings["viewSource"],
				ownerDocument: editor.ownerDocument,
				dir: editor.dir,
				lang: editor.lang,
				showLabel: false,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "ViewSource",
				tabIndex: "-1",
				onChange: lang.hitch(this, "_showSource")
			});

			// IE 7 has a horrible bug with zoom, so we have to create this node
			// to cross-check later.  Sigh.
			if(has("ie") == 7){
				this._ieFixNode = domConstruct.create("div", {
					style: {
						opacity: "0",
						zIndex: "-1000",
						position: "absolute",
						top: "-1000px"
					}
				}, editor.ownerDocumentBody);
			}
			// Make sure readonly mode doesn't make the wrong cursor appear over the button.
			this.button.set("readOnly", false);
		},


		setEditor: function(/*dijit/Editor*/ editor){
			// summary:
			//		Tell the plugin which Editor it is associated with.
			// editor: Object
			//		The editor object to attach the print capability to.
			this.editor = editor;
			this._initButton();

			this.editor.addKeyHandler(keys.F12, true, true, lang.hitch(this, function(e){
				// Move the focus before switching
				// It'll focus back.  Hiding a focused
				// node causes issues.
				this.button.focus();
				this.toggle();
				e.stopPropagation();
				e.preventDefault();

				// Call the focus shift outside of the handler.
				setTimeout(lang.hitch(this, function(){
					// Focus the textarea... unless focus has moved outside of the editor completely during the timeout.
					// Since we override focus, so we just need to call it.
					if(this.editor.focused){
						this.editor.focus();
					}
				}), 100);
			}));
		},

		_showSource: function(source){
			// summary:
			//		Function to toggle between the source and RTE views.
			// source: boolean
			//		Boolean value indicating if it should be in source mode or not.
			// tags:
			//		private
			var ed = this.editor;
			var edPlugins = ed._plugins;
			var html;
			this._sourceShown = source;
			var self = this;
			try{
				if(!this.sourceArea){
					this._createSourceView();
				}
				if(source){
					// Update the QueryCommandEnabled function to disable everything but
					// the source view mode.  Have to over-ride a function, then kick all
					// plugins to check their state.
					ed._sourceQueryCommandEnabled = ed.queryCommandEnabled;
					ed.queryCommandEnabled = function(cmd){
						return cmd.toLowerCase() === "viewsource";
					};
					this.editor.onDisplayChanged();
					html = ed.get("value");
					html = this._filter(html);
					ed.set("value", html);
					array.forEach(edPlugins, function(p){
						// Turn off any plugins not controlled by queryCommandenabled.
						if(p && !(p instanceof ViewSource) && p.isInstanceOf(_Plugin)){
							p.set("disabled", true)
						}
					});

					// We actually do need to trap this plugin and adjust how we
					// display the textarea.
					if(this._fsPlugin){
						this._fsPlugin._getAltViewNode = function(){
							return self.sourceArea;
						};
					}

					this.sourceArea.value = html;

					// Since neither iframe nor textarea have margin, border, or padding,
					// just set sizes equal
					this.sourceArea.style.height = ed.iframe.style.height;
					this.sourceArea.style.width = ed.iframe.style.width;
					domStyle.set(ed.iframe, "display", "none");
					domStyle.set(this.sourceArea, {
						display: "block"
					});

					var resizer = function(){
						// function to handle resize events.
						// Will check current VP and only resize if
						// different.
						var vp = winUtils.getBox(ed.ownerDocument);

						if("_prevW" in this && "_prevH" in this){
							// No actual size change, ignore.
							if(vp.w === this._prevW && vp.h === this._prevH){
								return;
							}else{
								this._prevW = vp.w;
								this._prevH = vp.h;
							}
						}else{
							this._prevW = vp.w;
							this._prevH = vp.h;
						}
						if(this._resizer){
							clearTimeout(this._resizer);
							delete this._resizer;
						}
						// Timeout it to help avoid spamming resize on IE.
						// Works for all browsers.
						this._resizer = setTimeout(lang.hitch(this, function(){
							delete this._resizer;
							this._resize();
						}), 10);
					};
					this._resizeHandle = on(window, "resize", lang.hitch(this, resizer));

					//Call this on a delay once to deal with IE glitchiness on initial size.
					setTimeout(lang.hitch(this, this._resize), 100);

					//Trigger a check for command enablement/disablement.
					this.editor.onNormalizedDisplayChanged();

					this.editor.__oldGetValue = this.editor.getValue;
					this.editor.getValue = lang.hitch(this, function(){
						var txt = this.sourceArea.value;
						txt = this._filter(txt);
						return txt;
					});

					this._setListener = aspect.after(this.editor, "setValue", lang.hitch(this, function(htmlTxt){
						htmlTxt = htmlTxt || "";
						htmlTxt = this._filter(htmlTxt);
						this.sourceArea.value = htmlTxt;
					}), true);
				}else{
					// First check that we were in source view before doing anything.
					// corner case for being called with a value of false and we hadn't
					// actually been in source display mode.
					if(!ed._sourceQueryCommandEnabled){
						return;
					}

					// Remove the set listener.
					this._setListener.remove();
					delete this._setListener;

					this._resizeHandle.remove();
					delete this._resizeHandle;

					if(this.editor.__oldGetValue){
						this.editor.getValue = this.editor.__oldGetValue;
						delete this.editor.__oldGetValue;
					}

					// Restore all the plugin buttons state.
					ed.queryCommandEnabled = ed._sourceQueryCommandEnabled;
					if(!this._readOnly){
						html = this.sourceArea.value;
						html = this._filter(html);
						ed.beginEditing();
						ed.set("value", html);
						ed.endEditing();
					}

					array.forEach(edPlugins, function(p){
						// Turn back on any plugins we turned off.
						if(p && p.isInstanceOf(_Plugin)){
							p.set("disabled", false);
						}
					});

					domStyle.set(this.sourceArea, "display", "none");
					domStyle.set(ed.iframe, "display", "block");
					delete ed._sourceQueryCommandEnabled;

					//Trigger a check for command enablement/disablement.
					this.editor.onDisplayChanged();
				}
				// Call a delayed resize to wait for some things to display in header/footer.
				setTimeout(lang.hitch(this, function(){
					// Make resize calls.
					var parent = ed.domNode.parentNode;
					if(parent){
						var container = registry.getEnclosingWidget(parent);
						if(container && container.resize){
							container.resize();
						}
					}
					ed.resize();
				}), 300);
			}catch(e){
				console.log(e);
			}
		},

		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		},

		_resize: function(){
			// summary:
			//		Internal function to resize the source view
			// tags:
			//		private
			var ed = this.editor;
			var tbH = ed.getHeaderHeight();
			var fH = ed.getFooterHeight();
			var eb = domGeometry.position(ed.domNode);

			// Styles are now applied to the internal source container, so we have
			// to subtract them off.
			var containerPadding = domGeometry.getPadBorderExtents(ed.iframe.parentNode);
			var containerMargin = domGeometry.getMarginExtents(ed.iframe.parentNode);

			var extents = domGeometry.getPadBorderExtents(ed.domNode);
			var edb = {
				w: eb.w - extents.w,
				h: eb.h - (tbH + extents.h + fH)
			};

			// Fullscreen gets odd, so we need to check for the FS plugin and
			// adapt.
			if(this._fsPlugin && this._fsPlugin.isFullscreen){
				//Okay, probably in FS, adjust.
				var vp = winUtils.getBox(ed.ownerDocument);
				edb.w = (vp.w - extents.w);
				edb.h = (vp.h - (tbH + extents.h + fH));
			}

			if(has("ie")){
				// IE is always off by 2px, so we have to adjust here
				// Note that IE ZOOM is broken here.  I can't get
				//it to scale right.
				edb.h -= 2;
			}

			// IE has a horrible zoom bug.  So, we have to try and account for
			// it and fix up the scaling.
			if(this._ieFixNode){
				var _ie7zoom = -this._ieFixNode.offsetTop / 1000;
				edb.w = Math.floor((edb.w + 0.9) / _ie7zoom);
				edb.h = Math.floor((edb.h + 0.9) / _ie7zoom);
			}

			domGeometry.setMarginBox(this.sourceArea, {
				w: edb.w - (containerPadding.w + containerMargin.w),
				h: edb.h - (containerPadding.h + containerMargin.h)
			});

			// Scale the parent container too in this case.
			domGeometry.setMarginBox(ed.iframe.parentNode, {
				h: edb.h
			});
		},

		_createSourceView: function(){
			// summary:
			//		Internal function for creating the source view area.
			// tags:
			//		private
			var ed = this.editor;
			var edPlugins = ed._plugins;
			this.sourceArea = domConstruct.create("textarea");
			if(this.readOnly){
				domAttr.set(this.sourceArea, "readOnly", true);
				this._readOnly = true;
			}
			domStyle.set(this.sourceArea, {
				padding: "0px",
				margin: "0px",
				borderWidth: "0px",
				borderStyle: "none"
			});
			domAttr.set(this.sourceArea, "aria-label", this.editor.id);

			domConstruct.place(this.sourceArea, ed.iframe, "before");

			if(has("ie") && ed.iframe.parentNode.lastChild !== ed.iframe){
				// There's some weirdo div in IE used for focus control
				// But is messed up scaling the textarea if we don't config
				// it some so it doesn't have a varying height.
				domStyle.set(ed.iframe.parentNode.lastChild, {
					width: "0px",
					height: "0px",
					padding: "0px",
					margin: "0px",
					borderWidth: "0px",
					borderStyle: "none"
				});
			}

			// We also need to take over editor focus a bit here, so that focus calls to
			// focus the editor will focus to the right node when VS is active.
			ed._viewsource_oldFocus = ed.focus;
			var self = this;
			ed.focus = function(){
				if(self._sourceShown){
					self.setSourceAreaCaret();
				}else{
					try{
						if(this._vsFocused){
							delete this._vsFocused;
							// Must focus edit node in this case (webkit only) or
							// focus doesn't shift right, but in normal
							// cases we focus with the regular function.
							focus.focus(ed.editNode);
						}else{
							ed._viewsource_oldFocus();
						}
					}catch(e){
						console.log(e);
					}
				}
			};

			var i, p;
			for(i = 0; i < edPlugins.length; i++){
				// We actually do need to trap this plugin and adjust how we
				// display the textarea.
				p = edPlugins[i];
				if(p && (p.declaredClass === "dijit._editor.plugins.FullScreen" ||
					p.declaredClass === (dijit._scopeName +
						"._editor.plugins.FullScreen"))){
					this._fsPlugin = p;
					break;
				}
			}
			if(this._fsPlugin){
				// Found, we need to over-ride the alt-view node function
				// on FullScreen with our own, chain up to parent call when appropriate.
				this._fsPlugin._viewsource_getAltViewNode = this._fsPlugin._getAltViewNode;
				this._fsPlugin._getAltViewNode = function(){
					return self._sourceShown ? self.sourceArea : this._viewsource_getAltViewNode();
				};
			}

			// Listen to the source area for key events as well, as we need to be able to hotkey toggle
			// it from there too.
			this.own(on(this.sourceArea, "keydown", lang.hitch(this, function(e){
				if(this._sourceShown && e.keyCode == keys.F12 && e.ctrlKey && e.shiftKey){
					this.button.focus();
					this.button.set("checked", false);
					setTimeout(lang.hitch(this, function(){
						ed.focus();
					}), 100);
					e.stopPropagation();
					e.preventDefault();
				}
			})));
		},

		_stripScripts: function(html){
			// summary:
			//		Strips out script tags from the HTML used in editor.
			// html: String
			//		The HTML to filter
			// tags:
			//		private
			if(html){
				// Look for closed and unclosed (malformed) script attacks.
				html = html.replace(/<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>/ig, "");
				html = html.replace(/<\s*script\b([^<>]|\s)*>?/ig, "");
				html = html.replace(/<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>/ig, "");
			}
			return html;
		},

		_stripComments: function(html){
			// summary:
			//		Strips out comments from the HTML used in editor.
			// html: String
			//		The HTML to filter
			// tags:
			//		private
			if(html){
				html = html.replace(/<!--(.|\s){1,}?-->/g, "");
			}
			return html;
		},

		_stripIFrames: function(html){
			// summary:
			//		Strips out iframe tags from the content, to avoid iframe script
			//		style injection attacks.
			// html: String
			//		The HTML to filter
			// tags:
			//		private
			if(html){
				html = html.replace(/<\s*iframe[^>]*>((.|\s)*?)<\\?\/\s*iframe\s*>/ig, "");
			}
			return html;
		},

		_filter: function(html){
			// summary:
			//		Internal function to perform some filtering on the HTML.
			// html: String
			//		The HTML to filter
			// tags:
			//		private
			if(html){
				if(this.stripScripts){
					html = this._stripScripts(html);
				}
				if(this.stripComments){
					html = this._stripComments(html);
				}
				if(this.stripIFrames){
					html = this._stripIFrames(html);
				}
			}
			return html;
		},

		setSourceAreaCaret: function(){
			// summary:
			//		Internal function to set the caret in the sourceArea
			//		to 0x0
			var elem = this.sourceArea;
			focus.focus(elem);
			if(this._sourceShown && !this.readOnly){
				if(elem.setSelectionRange){
					elem.setSelectionRange(0, 0);
				}else if(this.sourceArea.createTextRange){
					// IE
					var range = elem.createTextRange();
					range.collapse(true);
					range.moveStart("character", -99999); // move to 0
					range.moveStart("character", 0); // delta from 0 is the correct position
					range.moveEnd("character", 0);
					range.select();
				}
			}
		},

		destroy: function(){
			// summary:
			//		Over-ride to remove the node used to correct for IE's
			//		zoom bug.
			if(this._ieFixNode){
				domConstruct.destroy(this._ieFixNode);
			}
			if(this._resizer){
				clearTimeout(this._resizer);
				delete this._resizer;
			}
			if(this._resizeHandle){
				this._resizeHandle.remove();
				delete this._resizeHandle;
			}
			if(this._setListener){
				this._setListener.remove();
				delete this._setListener;
			}
			this.inherited(arguments);
		}
	});

	// Register this plugin.
	// For back-compat accept "viewsource" (all lowercase) too, remove in 2.0
	_Plugin.registry["viewSource"] = _Plugin.registry["viewsource"] = function(args){
		return new ViewSource({
			readOnly: ("readOnly" in args) ? args.readOnly : false,
			stripComments: ("stripComments" in args) ? args.stripComments : true,
			stripScripts: ("stripScripts" in args) ? args.stripScripts : true,
			stripIFrames: ("stripIFrames" in args) ? args.stripIFrames : true
		});
	};

	return ViewSource;
});

},
'dojox/main':function(){
define(["dojo/_base/kernel"], function(dojo) {
	// module:
	//		dojox/main

	/*=====
	return {
		// summary:
		//		The dojox package main module; dojox package is somewhat unusual in that the main module currently just provides an empty object.
		//		Apps should require modules from the dojox packages directly, rather than loading this module.
	};
	=====*/

	return dojo.dojox;
});
},
'dojo/dnd/Mover':function(){
define([
	"../_base/array", "../_base/declare", "../_base/lang", "../sniff", "../_base/window",
	"../dom", "../dom-geometry", "../dom-style", "../Evented", "../on", "../touch", "./common", "./autoscroll"
], function(array, declare, lang, has, win, dom, domGeom, domStyle, Evented, on, touch, dnd, autoscroll){

// module:
//		dojo/dnd/Mover

return declare("dojo.dnd.Mover", [Evented], {
	// summary:
	//		an object which makes a node follow the mouse, or touch-drag on touch devices.
	//		Used as a default mover, and as a base class for custom movers.

	constructor: function(node, e, host){
		// node: Node
		//		a node (or node's id) to be moved
		// e: Event
		//		a mouse event, which started the move;
		//		only pageX and pageY properties are used
		// host: Object?
		//		object which implements the functionality of the move,
		//	 	and defines proper events (onMoveStart and onMoveStop)
		this.node = dom.byId(node);
		this.marginBox = {l: e.pageX, t: e.pageY};
		this.mouseButton = e.button;
		var h = (this.host = host), d = node.ownerDocument;

		function stopEvent(e){
			e.preventDefault();
			e.stopPropagation();
		}

		this.events = [
			// At the start of a drag, onFirstMove is called, and then the following
			// listener is disconnected.
			on(d, touch.move, lang.hitch(this, "onFirstMove")),

			// These are called continually during the drag
			on(d, touch.move, lang.hitch(this, "onMouseMove")),

			// And these are called at the end of the drag
			on(d, touch.release,  lang.hitch(this, "onMouseUp")),

			// cancel text selection and text dragging
			on(d, "dragstart",   stopEvent),
			on(d.body, "selectstart", stopEvent)
		];

		// Tell autoscroll that a drag is starting
		autoscroll.autoScrollStart(d);

		// notify that the move has started
		if(h && h.onMoveStart){
			h.onMoveStart(this);
		}
	},
	// mouse event processors
	onMouseMove: function(e){
		// summary:
		//		event processor for onmousemove/ontouchmove
		// e: Event
		//		mouse/touch event
		autoscroll.autoScroll(e);
		var m = this.marginBox;
		this.host.onMove(this, {l: m.l + e.pageX, t: m.t + e.pageY}, e);
		e.preventDefault();
		e.stopPropagation();
	},
	onMouseUp: function(e){
		if(has("webkit") && has("mac") && this.mouseButton == 2 ?
				e.button == 0 : this.mouseButton == e.button){ // TODO Should condition be met for touch devices, too?
			this.destroy();
		}
		e.preventDefault();
		e.stopPropagation();
	},
	// utilities
	onFirstMove: function(e){
		// summary:
		//		makes the node absolute; it is meant to be called only once.
		//		relative and absolutely positioned nodes are assumed to use pixel units
		var s = this.node.style, l, t, h = this.host;
		switch(s.position){
			case "relative":
			case "absolute":
				// assume that left and top values are in pixels already
				l = Math.round(parseFloat(s.left)) || 0;
				t = Math.round(parseFloat(s.top)) || 0;
				break;
			default:
				s.position = "absolute";	// enforcing the absolute mode
				var m = domGeom.getMarginBox(this.node);
				// event.pageX/pageY (which we used to generate the initial
				// margin box) includes padding and margin set on the body.
				// However, setting the node's position to absolute and then
				// doing domGeom.marginBox on it *doesn't* take that additional
				// space into account - so we need to subtract the combined
				// padding and margin.  We use getComputedStyle and
				// _getMarginBox/_getContentBox to avoid the extra lookup of
				// the computed style.
				var b = win.doc.body;
				var bs = domStyle.getComputedStyle(b);
				var bm = domGeom.getMarginBox(b, bs);
				var bc = domGeom.getContentBox(b, bs);
				l = m.l - (bc.l - bm.l);
				t = m.t - (bc.t - bm.t);
				break;
		}
		this.marginBox.l = l - this.marginBox.l;
		this.marginBox.t = t - this.marginBox.t;
		if(h && h.onFirstMove){
			h.onFirstMove(this, e);
		}

		// Disconnect touch.move that call this function
		this.events.shift().remove();
	},
	destroy: function(){
		// summary:
		//		stops the move, deletes all references, so the object can be garbage-collected
		array.forEach(this.events, function(handle){ handle.remove(); });
		// undo global settings
		var h = this.host;
		if(h && h.onMoveStop){
			h.onMoveStop(this);
		}
		// destroy objects
		this.events = this.node = this.host = null;
	}
});

});

},
'dijit/form/_DateTimeTextBox':function(){
define([
	"dojo/date", // date date.compare
	"dojo/date/locale", // locale.regexp
	"dojo/date/stamp", // stamp.fromISOString stamp.toISOString
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // lang.getObject
	"./RangeBoundTextBox",
	"../_HasDropDown",
	"dojo/text!./templates/DropDownBox.html"
], function(date, locale, stamp, declare, lang, RangeBoundTextBox, _HasDropDown, template){

	// module:
	//		dijit/form/_DateTimeTextBox

	new Date("X"); // workaround for #11279, new Date("") == NaN

	var _DateTimeTextBox = declare("dijit.form._DateTimeTextBox", [RangeBoundTextBox, _HasDropDown], {
		// summary:
		//		Base class for validating, serializable, range-bound date or time text box.

		templateString: template,

		// hasDownArrow: [const] Boolean
		//		Set this textbox to display a down arrow button, to open the drop down list.
		hasDownArrow: true,

		// Set classes like dijitDownArrowButtonHover depending on mouse action over button node
		cssStateNodes: {
			"_buttonNode": "dijitDownArrowButton"
		},

		/*=====
		// constraints: _DateTimeTextBox.__Constraints
		//		Despite the name, this parameter specifies both constraints on the input
		//		(including starting/ending dates/times allowed) as well as
		//		formatting options like whether the date is displayed in long (ex: December 25, 2005)
		//		or short (ex: 12/25/2005) format.  See `dijit/form/_DateTimeTextBox.__Constraints` for details.
		constraints: {},
		======*/

		// Override ValidationTextBox.pattern.... we use a reg-ex generating function rather
		// than a straight regexp to deal with locale  (plus formatting options too?)
		pattern: locale.regexp,

		// datePackage: String
		//		JavaScript namespace to find calendar routines.	 If unspecified, uses Gregorian calendar routines
		//		at dojo/date and dojo/date/locale.
		datePackage: "",
		//		TODO: for 2.0, replace datePackage with dateModule and dateLocalModule attributes specifying MIDs,
		//		or alternately just get rid of this completely and tell user to use module ID remapping
		//		via require

		postMixInProperties: function(){
			this.inherited(arguments);
			this._set("type", "text"); // in case type="date"|"time" was specified which messes up parse/format
		},

		// Override _FormWidget.compare() to work for dates/times
		compare: function(/*Date*/ val1, /*Date*/ val2){
			var isInvalid1 = this._isInvalidDate(val1);
			var isInvalid2 = this._isInvalidDate(val2);
			return isInvalid1 ? (isInvalid2 ? 0 : -1) : (isInvalid2 ? 1 : date.compare(val1, val2, this._selector));
		},

		// flag to _HasDropDown to make drop down Calendar width == <input> width
		autoWidth: true,

		format: function(/*Date*/ value, /*locale.__FormatOptions*/ constraints){
			// summary:
			//		Formats the value as a Date, according to specified locale (second argument)
			// tags:
			//		protected
			if(!value){ return ''; }
			return this.dateLocaleModule.format(value, constraints);
		},

		"parse": function(/*String*/ value, /*locale.__FormatOptions*/ constraints){
			// summary:
			//		Parses as string as a Date, according to constraints
			// tags:
			//		protected

			return this.dateLocaleModule.parse(value, constraints) || (this._isEmpty(value) ? null : undefined);	 // Date
		},

		// Overrides ValidationTextBox.serialize() to serialize a date in canonical ISO format.
		serialize: function(/*anything*/ val, /*Object?*/ options){
			if(val.toGregorian){
				val = val.toGregorian();
			}
			return stamp.toISOString(val, options);
		},

		// dropDownDefaultValue: Date
		//		The default value to focus in the popupClass widget when the textbox value is empty.
		dropDownDefaultValue : new Date(),

		// value: Date
		//		The value of this widget as a JavaScript Date object.  Use get("value") / set("value", val) to manipulate.
		//		When passed to the parser in markup, must be specified according to `dojo/date/stamp.fromISOString()`
		value: new Date(""),	// value.toString()="NaN"

		_blankValue: null,	// used by filter() when the textbox is blank

		// popupClass: [protected extension] String
		//		Name of the popup widget class used to select a date/time.
		//		Subclasses should specify this.
		popupClass: "", // default is no popup = text only


		// _selector: [protected extension] String
		//		Specifies constraints.selector passed to dojo.date functions, should be either
		//		"date" or "time".
		//		Subclass must specify this.
		_selector: "",

		constructor: function(params /*===== , srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified, replace srcNodeRef with my generated DOM tree

			this.dateModule = params.datePackage ? lang.getObject(params.datePackage, false) : date;
			this.dateClassObj = this.dateModule.Date || Date;
			this.dateLocaleModule = params.datePackage ? lang.getObject(params.datePackage+".locale", false) : locale;
			this._set('pattern', this.dateLocaleModule.regexp);
			this._invalidDate = this.constructor.prototype.value.toString();
		},

		buildRendering: function(){
			this.inherited(arguments);

			if(!this.hasDownArrow){
				this._buttonNode.style.display = "none";
			}

			// If hasDownArrow is false, we basically just want to treat the whole widget as the
			// button.
			if(!this.hasDownArrow){
				this._buttonNode = this.domNode;
				this.baseClass += " dijitComboBoxOpenOnClick";
			}
		},

		_setConstraintsAttr: function(/*Object*/ constraints){
			constraints.selector = this._selector;
			constraints.fullYear = true; // see #5465 - always format with 4-digit years
			var fromISO = stamp.fromISOString;
			if(typeof constraints.min == "string"){ constraints.min = fromISO(constraints.min); }
			if(typeof constraints.max == "string"){ constraints.max = fromISO(constraints.max); }
			this.inherited(arguments);
		},

		_isInvalidDate: function(/*Date*/ value){
			// summary:
			//		Runs various tests on the value, checking for invalid conditions
			// tags:
			//		private
			return !value || isNaN(value) || typeof value != "object" || value.toString() == this._invalidDate;
		},

		_setValueAttr: function(/*Date|String*/ value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
			// summary:
			//		Sets the date on this textbox. Note: value can be a JavaScript Date literal or a string to be parsed.
			if(value !== undefined){
				if(typeof value == "string"){
					value = stamp.fromISOString(value);
				}
				if(this._isInvalidDate(value)){
					value = null;
				}
				if(value instanceof Date && !(this.dateClassObj instanceof Date)){
					value = new this.dateClassObj(value);
				}
			}
			this.inherited(arguments);
			if(this.value instanceof Date){
				this.filterString = "";
			}
			if(this.dropDown){
				this.dropDown.set('value', value, false);
			}
		},

		_set: function(attr, value){
			// Avoid spurious watch() notifications when value is changed to new Date object w/the same value
			var oldValue = this._get("value");
			if(attr == "value" && oldValue instanceof Date && this.compare(value, oldValue) == 0){
				return;
			}
			this.inherited(arguments);
		},

		_setDropDownDefaultValueAttr: function(/*Date*/ val){
			if(this._isInvalidDate(val)){
				// convert null setting into today's date, since there needs to be *some* default at all times.
				 val = new this.dateClassObj();
			}
			this._set("dropDownDefaultValue", val);
		},

		openDropDown: function(/*Function*/ callback){
			// rebuild drop down every time, so that constraints get copied (#6002)
			if(this.dropDown){
				this.dropDown.destroy();
			}
			var PopupProto = lang.isString(this.popupClass) ? lang.getObject(this.popupClass, false) : this.popupClass,
				textBox = this,
				value = this.get("value");
			this.dropDown = new PopupProto({
				onChange: function(value){
					// this will cause InlineEditBox and other handlers to do stuff so make sure it's last
					textBox.set('value', value, true);
				},
				id: this.id + "_popup",
				dir: textBox.dir,
				lang: textBox.lang,
				value: value,
				textDir: textBox.textDir,
				currentFocus: !this._isInvalidDate(value) ? value : this.dropDownDefaultValue,
				constraints: textBox.constraints,
				filterString: textBox.filterString, // for TimeTextBox, to filter times shown
				datePackage: textBox.params.datePackage,
				isDisabledDate: function(/*Date*/ date){
					// summary:
					//		disables dates outside of the min/max of the _DateTimeTextBox
					return !textBox.rangeCheck(date, textBox.constraints);
				}
			});

			this.inherited(arguments);
		},

		_getDisplayedValueAttr: function(){
			return this.textbox.value;
		},

		_setDisplayedValueAttr: function(/*String*/ value, /*Boolean?*/ priorityChange){
			this._setValueAttr(this.parse(value, this.constraints), priorityChange, value);
		}
	});


	/*=====
	 _DateTimeTextBox.__Constraints = declare([RangeBoundTextBox.__Constraints, locale.__FormatOptions], {
		 // summary:
		 //		Specifies both the rules on valid/invalid values (first/last date/time allowed),
		 //		and also formatting options for how the date/time is displayed.
		 // example:
		 //		To restrict to dates within 2004, displayed in a long format like "December 25, 2005":
		 //	|		{min:'2004-01-01',max:'2004-12-31', formatLength:'long'}
	 });
	 =====*/

	return _DateTimeTextBox;
});

},
'dijit/_editor/_Plugin':function(){
define([
	"dojo/_base/connect", // connect.connect
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // lang.mixin, lang.hitch
	"../Destroyable",
	"../form/Button"
], function(connect, declare, lang, Destroyable, Button){

	// module:
	//		dijit/_editor/_Plugin

	var _Plugin = declare("dijit._editor._Plugin", Destroyable, {
		// summary:
		//		Base class for a "plugin" to the editor, which is usually
		//		a single button on the Toolbar and some associated code

		constructor: function(args){
			// summary:
			//		Create the plugin.
			// args: Object?
			//		Initial settings for any of the attributes.

			this.params = args || {};
			lang.mixin(this, this.params);
			this._attrPairNames = {};
		},

		// editor: [const] dijit.Editor
		//		Points to the parent editor
		editor: null,

		// iconClassPrefix: [const] String
		//		The CSS class name for the button node is formed from `iconClassPrefix` and `command`
		iconClassPrefix: "dijitEditorIcon",

		// button: dijit/_WidgetBase?
		//		Pointer to `dijit/form/Button` or other widget (ex: `dijit/form/FilteringSelect`)
		//		that is added to the toolbar to control this plugin.
		//		If not specified, will be created on initialization according to `buttonClass`
		button: null,

		// command: String
		//		String like "insertUnorderedList", "outdent", "justifyCenter", etc. that represents an editor command.
		//		Passed to editor.execCommand() if `useDefaultCommand` is true.
		command: "",

		// useDefaultCommand: Boolean
		//		If true, this plugin executes by calling Editor.execCommand() with the argument specified in `command`.
		useDefaultCommand: true,

		// buttonClass: Widget Class
		//		Class of widget (ex: dijit.form.Button or dijit/form/FilteringSelect)
		//		that is added to the toolbar to control this plugin.
		//		This is used to instantiate the button, unless `button` itself is specified directly.
		buttonClass: Button,

		// disabled: Boolean
		//		Flag to indicate if this plugin has been disabled and should do nothing
		//		helps control button state, among other things.  Set via the setter api.
		disabled: false,

		getLabel: function(/*String*/key){
			// summary:
			//		Returns the label to use for the button
			// tags:
			//		private
			return this.editor.commands[key];		// String
		},

		_initButton: function(){
			// summary:
			//		Initialize the button or other widget that will control this plugin.
			//		This code only works for plugins controlling built-in commands in the editor.
			// tags:
			//		protected extension
			if(this.command.length){
				var label = this.getLabel(this.command),
					editor = this.editor,
					className = this.iconClassPrefix + " " + this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1);
				if(!this.button){
					var props = lang.mixin({
						label: label,
						ownerDocument: editor.ownerDocument,
						dir: editor.dir,
						lang: editor.lang,
						showLabel: false,
						iconClass: className,
						dropDown: this.dropDown,
						tabIndex: "-1"
					}, this.params || {});
					this.button = new this.buttonClass(props);
				}
			}
			if(this.get("disabled") && this.button){
				this.button.set("disabled", this.get("disabled"));
			}
		},

		destroy: function(){
			if(this.dropDown){
				this.dropDown.destroyRecursive();
			}

			this.inherited(arguments);
		},

		connect: function(o, f, tf){
			// summary:
			//		Deprecated.  Use this.own() with dojo/on or dojo/aspect.instead.
			//
			//		Make a connect.connect() that is automatically disconnected when this plugin is destroyed.
			//		Similar to `dijit/_Widget.connect()`.
			// tags:
			//		protected deprecated

			this.own(connect.connect(o, f, this, tf));
		},

		updateState: function(){
			// summary:
			//		Change state of the plugin to respond to events in the editor.
			// description:
			//		This is called on meaningful events in the editor, such as change of selection
			//		or caret position (but not simple typing of alphanumeric keys).   It gives the
			//		plugin a chance to update the CSS of its button.
			//
			//		For example, the "bold" plugin will highlight/unhighlight the bold button depending on whether the
			//		characters next to the caret are bold or not.
			//
			//		Only makes sense when `useDefaultCommand` is true, as it calls Editor.queryCommandEnabled(`command`).
			var e = this.editor,
				c = this.command,
				checked, enabled;
			if(!e || !e.isLoaded || !c.length){
				return;
			}
			var disabled = this.get("disabled");
			if(this.button){
				try{
					enabled = !disabled && e.queryCommandEnabled(c);
					if(this.enabled !== enabled){
						this.enabled = enabled;
						this.button.set('disabled', !enabled);
					}
					if(enabled){
						if(typeof this.button.checked == 'boolean'){
							checked = e.queryCommandState(c);
							if(this.checked !== checked){
								this.checked = checked;
								this.button.set('checked', e.queryCommandState(c));
							}
						}
					}
				}catch(e){
					console.log(e); // FIXME: we shouldn't have debug statements in our code.  Log as an error?
				}
			}
		},

		setEditor: function(/*dijit/Editor*/ editor){
			// summary:
			//		Tell the plugin which Editor it is associated with.

			// TODO: refactor code to just pass editor to constructor.

			// FIXME: detach from previous editor!!
			this.editor = editor;

			// FIXME: prevent creating this if we don't need to (i.e., editor can't handle our command)
			this._initButton();

			// Processing for buttons that execute by calling editor.execCommand()
			if(this.button && this.useDefaultCommand){
				if(this.editor.queryCommandAvailable(this.command)){
					this.own(this.button.on("click",
						lang.hitch(this.editor, "execCommand", this.command, this.commandArg)
					));
				}else{
					// hide button because editor doesn't support command (due to browser limitations)
					this.button.domNode.style.display = "none";
				}
			}

			this.own(this.editor.on("NormalizedDisplayChanged", lang.hitch(this, "updateState")));
		},

		setToolbar: function(/*dijit/Toolbar*/ toolbar){
			// summary:
			//		Tell the plugin to add it's controller widget (often a button)
			//		to the toolbar.  Does nothing if there is no controller widget.

			// TODO: refactor code to just pass toolbar to constructor.

			if(this.button){
				toolbar.addChild(this.button);
			}
			// console.debug("adding", this.button, "to:", toolbar);
		},

		set: function(/* attribute */ name, /* anything */ value){
			// summary:
			//		Set a property on a plugin
			// name:
			//		The property to set.
			// value:
			//		The value to set in the property.
			// description:
			//		Sets named properties on a plugin which may potentially be handled by a
			//		setter in the plugin.
			//		For example, if the plugin has a properties "foo"
			//		and "bar" and a method named "_setFooAttr", calling:
			//	|	plugin.set("foo", "Howdy!");
			//		would be equivalent to writing:
			//	|	plugin._setFooAttr("Howdy!");
			//		and:
			//	|	plugin.set("bar", 3);
			//		would be equivalent to writing:
			//	|	plugin.bar = 3;
			//
			//		set() may also be called with a hash of name/value pairs, ex:
			//	|	plugin.set({
			//	|		foo: "Howdy",
			//	|		bar: 3
			//	|	})
			//		This is equivalent to calling set(foo, "Howdy") and set(bar, 3)
			if(typeof name === "object"){
				for(var x in name){
					this.set(x, name[x]);
				}
				return this;
			}
			var names = this._getAttrNames(name);
			if(this[names.s]){
				// use the explicit setter
				var result = this[names.s].apply(this, Array.prototype.slice.call(arguments, 1));
			}else{
				this._set(name, value);
			}
			return result || this;
		},

		get: function(name){
			// summary:
			//		Get a property from a plugin.
			// name:
			//		The property to get.
			// description:
			//		Get a named property from a plugin. The property may
			//		potentially be retrieved via a getter method. If no getter is defined, this
			//		just retrieves the object's property.
			//		For example, if the plugin has a properties "foo"
			//		and "bar" and a method named "_getFooAttr", calling:
			//	|	plugin.get("foo");
			//		would be equivalent to writing:
			//	|	plugin._getFooAttr();
			//		and:
			//	|	plugin.get("bar");
			//		would be equivalent to writing:
			//	|	plugin.bar;
			var names = this._getAttrNames(name);
			return this[names.g] ? this[names.g]() : this[name];
		},

		_setDisabledAttr: function(disabled){
			// summary:
			//		Function to set the plugin state and call updateState to make sure the
			//		button is updated appropriately.
			this._set("disabled", disabled);
			this.updateState();
		},

		_getAttrNames: function(name){
			// summary:
			//		Helper function for get() and set().
			//		Caches attribute name values so we don't do the string ops every time.
			// tags:
			//		private

			var apn = this._attrPairNames;
			if(apn[name]){
				return apn[name];
			}
			var uc = name.charAt(0).toUpperCase() + name.substr(1);
			return (apn[name] = {
				s: "_set" + uc + "Attr",
				g: "_get" + uc + "Attr"
			});
		},

		_set: function(/*String*/ name, /*anything*/ value){
			// summary:
			//		Helper function to set new value for specified attribute
			this[name] = value;
		}
	});

	// Hash mapping plugin name to factory, used for registering plugins
	_Plugin.registry = {};

	return _Plugin;
});

},
'dojo/Stateful':function(){
define(["./_base/declare", "./_base/lang", "./_base/array", "./when"], function(declare, lang, array, when){
	// module:
	//		dojo/Stateful

return declare("dojo.Stateful", null, {
	// summary:
	//		Base class for objects that provide named properties with optional getter/setter
	//		control and the ability to watch for property changes
	//
	//		The class also provides the functionality to auto-magically manage getters
	//		and setters for object attributes/properties.
	//		
	//		Getters and Setters should follow the format of _xxxGetter or _xxxSetter where 
	//		the xxx is a name of the attribute to handle.  So an attribute of "foo" 
	//		would have a custom getter of _fooGetter and a custom setter of _fooSetter.
	//
	// example:
	//	|	var obj = new dojo.Stateful();
	//	|	obj.watch("foo", function(){
	//	|		console.log("foo changed to " + this.get("foo"));
	//	|	});
	//	|	obj.set("foo","bar");

	// _attrPairNames: Hash
	//		Used across all instances a hash to cache attribute names and their getter 
	//		and setter names.
	_attrPairNames: {},

	_getAttrNames: function(name){
		// summary:
		//		Helper function for get() and set().
		//		Caches attribute name values so we don't do the string ops every time.
		// tags:
		//		private

		var apn = this._attrPairNames;
		if(apn[name]){ return apn[name]; }
		return (apn[name] = {
			s: "_" + name + "Setter",
			g: "_" + name + "Getter"
		});
	},

	postscript: function(/*Object?*/ params){
		// Automatic setting of params during construction
		if (params){ this.set(params); }
	},

	_get: function(name, names){
		// summary:
		//		Private function that does a get based off a hash of names
		// names:
		//		Hash of names of custom attributes
		return typeof this[names.g] === "function" ? this[names.g]() : this[name];
	},
	get: function(/*String*/name){
		// summary:
		//		Get a property on a Stateful instance.
		// name:
		//		The property to get.
		// returns:
		//		The property value on this Stateful instance.
		// description:
		//		Get a named property on a Stateful object. The property may
		//		potentially be retrieved via a getter method in subclasses. In the base class
		//		this just retrieves the object's property.
		//		For example:
		//	|	stateful = new dojo.Stateful({foo: 3});
		//	|	stateful.get("foo") // returns 3
		//	|	stateful.foo // returns 3

		return this._get(name, this._getAttrNames(name)); //Any
	},
	set: function(/*String*/name, /*Object*/value){
		// summary:
		//		Set a property on a Stateful instance
		// name:
		//		The property to set.
		// value:
		//		The value to set in the property.
		// returns:
		//		The function returns this dojo.Stateful instance.
		// description:
		//		Sets named properties on a stateful object and notifies any watchers of
		//		the property. A programmatic setter may be defined in subclasses.
		//		For example:
		//	|	stateful = new dojo.Stateful();
		//	|	stateful.watch(function(name, oldValue, value){
		//	|		// this will be called on the set below
		//	|	}
		//	|	stateful.set(foo, 5);
		//
		//	set() may also be called with a hash of name/value pairs, ex:
		//	|	myObj.set({
		//	|		foo: "Howdy",
		//	|		bar: 3
		//	|	})
		//	This is equivalent to calling set(foo, "Howdy") and set(bar, 3)

		// If an object is used, iterate through object
		if(typeof name === "object"){
			for(var x in name){
				if(name.hasOwnProperty(x) && x !="_watchCallbacks"){
					this.set(x, name[x]);
				}
			}
			return this;
		}

		var names = this._getAttrNames(name),
			oldValue = this._get(name, names),
			setter = this[names.s],
			result;
		if(typeof setter === "function"){
			// use the explicit setter
			result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
		}else{
			// no setter so set attribute directly
			this[name] = value;
		}
		if(this._watchCallbacks){
			var self = this;
			// If setter returned a promise, wait for it to complete, otherwise call watches immediatly
			when(result, function(){
				self._watchCallbacks(name, oldValue, value);
			});
		}
		return this; // dojo/Stateful
	},
	_changeAttrValue: function(name, value){
		// summary:
		//		Internal helper for directly changing an attribute value.
		//
		// name: String
		//		The property to set.
		// value: Mixed
		//		The value to set in the property.
		//
		// description:
		//		Directly change the value of an attribute on an object, bypassing any 
		//		accessor setter.  Also handles the calling of watch and emitting events. 
		//		It is designed to be used by descendent class when there are two values 
		//		of attributes that are linked, but calling .set() is not appropriate.

		var oldValue = this.get(name);
		this[name] = value;
		if(this._watchCallbacks){
			this._watchCallbacks(name, oldValue, value);
		}
		return this; // dojo/Stateful
	},
	watch: function(/*String?*/name, /*Function*/callback){
		// summary:
		//		Watches a property for changes
		// name:
		//		Indicates the property to watch. This is optional (the callback may be the
		//		only parameter), and if omitted, all the properties will be watched
		// returns:
		//		An object handle for the watch. The unwatch method of this object
		//		can be used to discontinue watching this property:
		//		|	var watchHandle = obj.watch("foo", callback);
		//		|	watchHandle.unwatch(); // callback won't be called now
		// callback:
		//		The function to execute when the property changes. This will be called after
		//		the property has been changed. The callback will be called with the |this|
		//		set to the instance, the first argument as the name of the property, the
		//		second argument as the old value and the third argument as the new value.

		var callbacks = this._watchCallbacks;
		if(!callbacks){
			var self = this;
			callbacks = this._watchCallbacks = function(name, oldValue, value, ignoreCatchall){
				var notify = function(propertyCallbacks){
					if(propertyCallbacks){
						propertyCallbacks = propertyCallbacks.slice();
						for(var i = 0, l = propertyCallbacks.length; i < l; i++){
							propertyCallbacks[i].call(self, name, oldValue, value);
						}
					}
				};
				notify(callbacks['_' + name]);
				if(!ignoreCatchall){
					notify(callbacks["*"]); // the catch-all
				}
			}; // we use a function instead of an object so it will be ignored by JSON conversion
		}
		if(!callback && typeof name === "function"){
			callback = name;
			name = "*";
		}else{
			// prepend with dash to prevent name conflicts with function (like "name" property)
			name = '_' + name;
		}
		var propertyCallbacks = callbacks[name];
		if(typeof propertyCallbacks !== "object"){
			propertyCallbacks = callbacks[name] = [];
		}
		propertyCallbacks.push(callback);

		// TODO: Remove unwatch in 2.0
		var handle = {};
		handle.unwatch = handle.remove = function(){
			var index = array.indexOf(propertyCallbacks, callback);
			if(index > -1){
				propertyCallbacks.splice(index, 1);
			}
		};
		return handle; //Object
	}

});

});

},
'dojo/touch':function(){
define(["./_base/kernel", "./aspect", "./dom", "./dom-class", "./_base/lang", "./on", "./has", "./mouse", "./domReady", "./_base/window"],
function(dojo, aspect, dom, domClass, lang, on, has, mouse, domReady, win){

	// module:
	//		dojo/touch

	var hasTouch = has("touch");

	var ios4 = has("ios") < 5;
	
	var msPointer = navigator.msPointerEnabled;

	// Click generation variables
	var clicksInited, clickTracker, clickTarget, clickX, clickY, clickDx, clickDy, clickTime;

	// Time of most recent touchstart, touchmove, or touchend event
	var lastTouch;

	function dualEvent(mouseType, touchType, msPointerType){
		// Returns synthetic event that listens for both the specified mouse event and specified touch event.
		// But ignore fake mouse events that were generated due to the user touching the screen.
		if(msPointer && msPointerType){
			// IE10+: MSPointer* events are designed to handle both mouse and touch in a uniform way,
			// so just use that regardless of hasTouch.
			return function(node, listener){
				return on(node, msPointerType, listener);
			}
		}else if(hasTouch){
			return function(node, listener){
				var handle1 = on(node, touchType, listener),
					handle2 = on(node, mouseType, function(evt){
						if(!lastTouch || (new Date()).getTime() > lastTouch + 1000){
							listener.call(this, evt);
						}
					});
				return {
					remove: function(){
						handle1.remove();
						handle2.remove();
					}
				};
			};
		}else{
			// Avoid creating listeners for touch events on performance sensitive older browsers like IE6
			return function(node, listener){
				return on(node, mouseType, listener);
			}
		}
	}

	function marked(/*DOMNode*/ node){
		// Test if a node or its ancestor has been marked with the dojoClick property to indicate special processing,
		do{
			if(node.dojoClick){ return node.dojoClick; }
		}while(node = node.parentNode);
	}
	
	function doClicks(e, moveType, endType){
		// summary:
		//		Setup touch listeners to generate synthetic clicks immediately (rather than waiting for the browser
		//		to generate clicks after the double-tap delay) and consistently (regardless of whether event.preventDefault()
		//		was called in an event listener. Synthetic clicks are generated only if a node or one of its ancestors has
		//		its dojoClick property set to truthy.
		
		clickTracker  = !e.target.disabled && marked(e.target); // click threshold = true, number or x/y object
		if(clickTracker){
			clickTarget = e.target;
			clickX = e.touches ? e.touches[0].pageX : e.clientX;
			clickY = e.touches ? e.touches[0].pageY : e.clientY;
			clickDx = (typeof clickTracker == "object" ? clickTracker.x : (typeof clickTracker == "number" ? clickTracker : 0)) || 4;
			clickDy = (typeof clickTracker == "object" ? clickTracker.y : (typeof clickTracker == "number" ? clickTracker : 0)) || 4;

			// add move/end handlers only the first time a node with dojoClick is seen,
			// so we don't add too much overhead when dojoClick is never set.
			if(!clicksInited){
				clicksInited = true;

				win.doc.addEventListener(moveType, function(e){
					clickTracker = clickTracker &&
						e.target == clickTarget &&
						Math.abs((e.touches ? e.touches[0].pageX : e.clientX) - clickX) <= clickDx &&
						Math.abs((e.touches ? e.touches[0].pageY : e.clientY) - clickY) <= clickDy;
				}, true);

				win.doc.addEventListener(endType, function(e){
					if(clickTracker){
						clickTime = (new Date()).getTime();
						var target = e.target;
						if(target.tagName === "LABEL"){
							// when clicking on a label, forward click to its associated input if any
							target = dom.byId(target.getAttribute("for")) || target;
						}
						setTimeout(function(){
							on.emit(target, "click", {
								bubbles : true,
								cancelable : true,
								_dojo_click : true
							});
						});
					}
				}, true);

				function stopNativeEvents(type){
					win.doc.addEventListener(type, function(e){
						// Stop native events when we emitted our own click event.  Note that the native click may occur
						// on a different node than the synthetic click event was generated on.  For example,
						// click on a menu item, causing the menu to disappear, and then (~300ms later) the browser
						// sends a click event to the node that was *underneath* the menu.  So stop all native events
						// sent shortly after ours, similar to what is done in dualEvent.
						// The INPUT.dijitOffScreen test is for offscreen inputs used in dijit/form/Button, on which
						// we call click() explicitly, we don't want to stop this event.
						if(!e._dojo_click &&
								(new Date()).getTime() <= clickTime + 1000 &&
								!(e.target.tagName == "INPUT" && domClass.contains(e.target, "dijitOffScreen"))){
							e.stopPropagation();
							e.stopImmediatePropagation && e.stopImmediatePropagation();
							if(type == "click" && (e.target.tagName != "INPUT" || e.target.type == "radio" || e.target.type == "checkbox")
								&& e.target.tagName != "TEXTAREA" && e.target.tagName != "AUDIO" && e.target.tagName != "VIDEO"){
								 // preventDefault() breaks textual <input>s on android, keyboard doesn't popup,
								 // but it is still needed for checkboxes and radio buttons, otherwise in some cases
								 // the checked state becomes inconsistent with the widget's state
								e.preventDefault();
							}
						}
					}, true);
				}

				stopNativeEvents("click");

				// We also stop mousedown/up since these would be sent well after with our "fast" click (300ms),
				// which can confuse some dijit widgets.
				stopNativeEvents("mousedown");
				stopNativeEvents("mouseup");
			}
		}
	}

	var hoveredNode;

	if(hasTouch){
		if(msPointer){
			 // MSPointer (IE10+) already has support for over and out, so we just need to init click support
			domReady(function(){
				win.doc.addEventListener("MSPointerDown", function(evt){
					doClicks(evt, "MSPointerMove", "MSPointerUp");
				}, true);
			});		
		}else{
			domReady(function(){
				// Keep track of currently hovered node
				hoveredNode = win.body();	// currently hovered node

				win.doc.addEventListener("touchstart", function(evt){
					lastTouch = (new Date()).getTime();

					// Precede touchstart event with touch.over event.  DnD depends on this.
					// Use addEventListener(cb, true) to run cb before any touchstart handlers on node run,
					// and to ensure this code runs even if the listener on the node does event.stop().
					var oldNode = hoveredNode;
					hoveredNode = evt.target;
					on.emit(oldNode, "dojotouchout", {
						relatedTarget: hoveredNode,
						bubbles: true
					});
					on.emit(hoveredNode, "dojotouchover", {
						relatedTarget: oldNode,
						bubbles: true
					});
				
					doClicks(evt, "touchmove", "touchend"); // init click generation
				}, true);

				function copyEventProps(evt){
					// Make copy of event object and also set bubbles:true.  Used when calling on.emit().
					var props = lang.delegate(evt, {
						bubbles: true
					});

					if(has("ios") >= 6){
						// On iOS6 "touches" became a non-enumerable property, which 
						// is not hit by for...in.  Ditto for the other properties below.
						props.touches = evt.touches;
						props.altKey = evt.altKey;
						props.changedTouches = evt.changedTouches;
						props.ctrlKey = evt.ctrlKey;
						props.metaKey = evt.metaKey;
						props.shiftKey = evt.shiftKey;
						props.targetTouches = evt.targetTouches;
					}

					return props;
				}
				
				on(win.doc, "touchmove", function(evt){
					lastTouch = (new Date()).getTime();

					var newNode = win.doc.elementFromPoint(
						evt.pageX - (ios4 ? 0 : win.global.pageXOffset), // iOS 4 expects page coords
						evt.pageY - (ios4 ? 0 : win.global.pageYOffset)
					);

					if(newNode){
						// Fire synthetic touchover and touchout events on nodes since the browser won't do it natively.
						if(hoveredNode !== newNode){
							// touch out on the old node
							on.emit(hoveredNode, "dojotouchout", {
								relatedTarget: newNode,
								bubbles: true
							});

							// touchover on the new node
							on.emit(newNode, "dojotouchover", {
								relatedTarget: hoveredNode,
								bubbles: true
							});

							hoveredNode = newNode;
						}

						// Unlike a listener on "touchmove", on(node, "dojotouchmove", listener) fires when the finger
						// drags over the specified node, regardless of which node the touch started on.
						on.emit(newNode, "dojotouchmove", copyEventProps(evt));
					}
				});

				// Fire a dojotouchend event on the node where the finger was before it was removed from the screen.
				// This is different than the native touchend, which fires on the node where the drag started.
				on(win.doc, "touchend", function(evt){
					lastTouch = (new Date()).getTime();
					var node = win.doc.elementFromPoint(
						evt.pageX - (ios4 ? 0 : win.global.pageXOffset), // iOS 4 expects page coords
						evt.pageY - (ios4 ? 0 : win.global.pageYOffset)
					) || win.body(); // if out of the screen

					on.emit(node, "dojotouchend", copyEventProps(evt));
				});
			});
		}
	}

	//device neutral events - touch.press|move|release|cancel/over/out
	var touch = {
		press: dualEvent("mousedown", "touchstart", "MSPointerDown"),
		move: dualEvent("mousemove", "dojotouchmove", "MSPointerMove"),
		release: dualEvent("mouseup", "dojotouchend", "MSPointerUp"),
		cancel: dualEvent(mouse.leave, "touchcancel", hasTouch?"MSPointerCancel":null),
		over: dualEvent("mouseover", "dojotouchover", "MSPointerOver"),
		out: dualEvent("mouseout", "dojotouchout", "MSPointerOut"),
		enter: mouse._eventHandler(dualEvent("mouseover","dojotouchover", "MSPointerOver")),
		leave: mouse._eventHandler(dualEvent("mouseout", "dojotouchout", "MSPointerOut"))
	};

	/*=====
	touch = {
		// summary:
		//		This module provides unified touch event handlers by exporting
		//		press, move, release and cancel which can also run well on desktop.
		//		Based on http://dvcs.w3.org/hg/webevents/raw-file/tip/touchevents.html
		//		Also, if the dojoClick property is set to true on a DOM node, dojo/touch generates
		//		click events immediately for this node and its descendants, to avoid the
		//		delay before native browser click events, and regardless of whether evt.preventDefault()
		//		was called in a touch.press event listener.
		//
		// example:
		//		Used with dojo.on
		//		|	define(["dojo/on", "dojo/touch"], function(on, touch){
		//		|		on(node, touch.press, function(e){});
		//		|		on(node, touch.move, function(e){});
		//		|		on(node, touch.release, function(e){});
		//		|		on(node, touch.cancel, function(e){});
		// example:
		//		Used with touch.* directly
		//		|	touch.press(node, function(e){});
		//		|	touch.move(node, function(e){});
		//		|	touch.release(node, function(e){});
		//		|	touch.cancel(node, function(e){});
		// example:
		//		Have dojo/touch generate clicks without delay, with a default move threshold of 4 pixels
		//		|	node.dojoClick = true;
		// example:
		//		Have dojo/touch generate clicks without delay, with a move threshold of 10 pixels horizontally and vertically
		//		|	node.dojoClick = 10;
		// example:
		//		Have dojo/touch generate clicks without delay, with a move threshold of 50 pixels horizontally and 10 pixels vertically
		//		|	node.dojoClick = {x:50, y:5};
		

		press: function(node, listener){
			// summary:
			//		Register a listener to 'touchstart'|'mousedown' for the given node
			// node: Dom
			//		Target node to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		move: function(node, listener){
			// summary:
			//		Register a listener that fires when the mouse cursor or a finger is dragged over the given node.
			// node: Dom
			//		Target node to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		release: function(node, listener){
			// summary:
			//		Register a listener to releasing the mouse button while the cursor is over the given node
			//		(i.e. "mouseup") or for removing the finger from the screen while touching the given node.
			// node: Dom
			//		Target node to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		cancel: function(node, listener){
			// summary:
			//		Register a listener to 'touchcancel'|'mouseleave' for the given node
			// node: Dom
			//		Target node to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		over: function(node, listener){
			// summary:
			//		Register a listener to 'mouseover' or touch equivalent for the given node
			// node: Dom
			//		Target node to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		out: function(node, listener){
			// summary:
			//		Register a listener to 'mouseout' or touch equivalent for the given node
			// node: Dom
			//		Target node to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		enter: function(node, listener){
			// summary:
			//		Register a listener to mouse.enter or touch equivalent for the given node
			// node: Dom
			//		Target node to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		},
		leave: function(node, listener){
			// summary:
			//		Register a listener to mouse.leave or touch equivalent for the given node
			// node: Dom
			//		Target node to listen to
			// listener: Function
			//		Callback function
			// returns:
			//		A handle which will be used to remove the listener by handle.remove()
		}
	};
	=====*/

	 1  && (dojo.touch = touch);

	return touch;
});

},
'dojo/require':function(){
define(["./_base/loader"], function(loader){
	return {
		dynamic:0,
		normalize:function(id){return id;},
		load:loader.require
	};
});

},
'dijit/_CssStateMixin':function(){
define([
	"dojo/_base/array", // array.forEach array.map
	"dojo/_base/declare", // declare
	"dojo/dom", // dom.isDescendant()
	"dojo/dom-class", // domClass.toggle
	"dojo/has",
	"dojo/_base/lang", // lang.hitch
	"dojo/on",
	"dojo/domReady",
	"dojo/touch",
	"dojo/_base/window", // win.body
	"./a11yclick",
	"./registry"
], function(array, declare, dom, domClass, has, lang, on, domReady, touch, win, a11yclick, registry){

	// module:
	//		dijit/_CssStateMixin

	var CssStateMixin = declare("dijit._CssStateMixin", [], {
		// summary:
		//		Mixin for widgets to set CSS classes on the widget DOM nodes depending on hover/mouse press/focus
		//		state changes, and also higher-level state changes such becoming disabled or selected.
		//
		// description:
		//		By mixing this class into your widget, and setting the this.baseClass attribute, it will automatically
		//		maintain CSS classes on the widget root node (this.domNode) depending on hover,
		//		active, focus, etc. state.   Ex: with a baseClass of dijitButton, it will apply the classes
		//		dijitButtonHovered and dijitButtonActive, as the user moves the mouse over the widget and clicks it.
		//
		//		It also sets CSS like dijitButtonDisabled based on widget semantic state.
		//
		//		By setting the cssStateNodes attribute, a widget can also track events on subnodes (like buttons
		//		within the widget).

		/*=====
		 // cssStateNodes: [protected] Object
		 //		Subclasses may define a cssStateNodes property that lists sub-nodes within the widget that
		 //		need CSS classes applied on mouse hover/press and focus.
		 //
		 //		Each entry in this optional hash is a an attach-point name (like "upArrowButton") mapped to a CSS class name
		 //		(like "dijitUpArrowButton"). Example:
		 //	|		{
		 //	|			"upArrowButton": "dijitUpArrowButton",
		 //	|			"downArrowButton": "dijitDownArrowButton"
		 //	|		}
		 //		The above will set the CSS class dijitUpArrowButton to the this.upArrowButton DOMNode when it
		 //		is hovered, etc.
		 cssStateNodes: {},
		 =====*/

		// hovering: [readonly] Boolean
		//		True if cursor is over this widget
		hovering: false,

		// active: [readonly] Boolean
		//		True if mouse was pressed while over this widget, and hasn't been released yet
		active: false,

		_applyAttributes: function(){
			// This code would typically be in postCreate(), but putting in _applyAttributes() for
			// performance: so the class changes happen before DOM is inserted into the document.
			// Change back to postCreate() in 2.0.  See #11635.

			this.inherited(arguments);

			// Monitoring changes to disabled, readonly, etc. state, and update CSS class of root node
			array.forEach(["disabled", "readOnly", "checked", "selected", "focused", "state", "hovering", "active", "_opened"], function(attr){
				this.watch(attr, lang.hitch(this, "_setStateClass"));
			}, this);

			// Track hover and active mouse events on widget root node, plus possibly on subnodes
			for(var ap in this.cssStateNodes || {}){
				this._trackMouseState(this[ap], this.cssStateNodes[ap]);
			}
			this._trackMouseState(this.domNode, this.baseClass);

			// Set state initially; there's probably no hover/active/focus state but widget might be
			// disabled/readonly/checked/selected so we want to set CSS classes for those conditions.
			this._setStateClass();
		},

		_cssMouseEvent: function(/*Event*/ event){
			// summary:
			//		Handler for CSS event on this.domNode. Sets hovering and active properties depending on mouse state,
			//		which triggers _setStateClass() to set appropriate CSS classes for this.domNode.

			if(!this.disabled){
				switch(event.type){
					case "mouseover":
					case "MSPointerOver":
						this._set("hovering", true);
						this._set("active", this._mouseDown);
						break;
					case "mouseout":
					case "MSPointerOut":
						this._set("hovering", false);
						this._set("active", false);
						break;
					case "mousedown":
					case "touchstart":
					case "MSPointerDown":
					case "keydown":
						this._set("active", true);
						break;
					case "mouseup":
					case "dojotouchend":
					case "keyup":
						this._set("active", false);
						break;
				}
			}
		},

		_setStateClass: function(){
			// summary:
			//		Update the visual state of the widget by setting the css classes on this.domNode
			//		(or this.stateNode if defined) by combining this.baseClass with
			//		various suffixes that represent the current widget state(s).
			//
			// description:
			//		In the case where a widget has multiple
			//		states, it sets the class based on all possible
			//		combinations.  For example, an invalid form widget that is being hovered
			//		will be "dijitInput dijitInputInvalid dijitInputHover dijitInputInvalidHover".
			//
			//		The widget may have one or more of the following states, determined
			//		by this.state, this.checked, this.valid, and this.selected:
			//
			//		- Error - ValidationTextBox sets this.state to "Error" if the current input value is invalid
			//		- Incomplete - ValidationTextBox sets this.state to "Incomplete" if the current input value is not finished yet
			//		- Checked - ex: a checkmark or a ToggleButton in a checked state, will have this.checked==true
			//		- Selected - ex: currently selected tab will have this.selected==true
			//
			//		In addition, it may have one or more of the following states,
			//		based on this.disabled and flags set in _onMouse (this.active, this.hovering) and from focus manager (this.focused):
			//
			//		- Disabled	- if the widget is disabled
			//		- Active		- if the mouse (or space/enter key?) is being pressed down
			//		- Focused		- if the widget has focus
			//		- Hover		- if the mouse is over the widget

			// Compute new set of classes
			var newStateClasses = this.baseClass.split(" ");

			function multiply(modifier){
				newStateClasses = newStateClasses.concat(array.map(newStateClasses, function(c){
					return c + modifier;
				}), "dijit" + modifier);
			}

			if(!this.isLeftToRight()){
				// For RTL mode we need to set an addition class like dijitTextBoxRtl.
				multiply("Rtl");
			}

			var checkedState = this.checked == "mixed" ? "Mixed" : (this.checked ? "Checked" : "");
			if(this.checked){
				multiply(checkedState);
			}
			if(this.state){
				multiply(this.state);
			}
			if(this.selected){
				multiply("Selected");
			}
			if(this._opened){
				multiply("Opened");
			}

			if(this.disabled){
				multiply("Disabled");
			}else if(this.readOnly){
				multiply("ReadOnly");
			}else{
				if(this.active){
					multiply("Active");
				}else if(this.hovering){
					multiply("Hover");
				}
			}

			if(this.focused){
				multiply("Focused");
			}

			// Remove old state classes and add new ones.
			// For performance concerns we only write into domNode.className once.
			var tn = this.stateNode || this.domNode,
				classHash = {};	// set of all classes (state and otherwise) for node

			array.forEach(tn.className.split(" "), function(c){
				classHash[c] = true;
			});

			if("_stateClasses" in this){
				array.forEach(this._stateClasses, function(c){
					delete classHash[c];
				});
			}

			array.forEach(newStateClasses, function(c){
				classHash[c] = true;
			});

			var newClasses = [];
			for(var c in classHash){
				newClasses.push(c);
			}
			tn.className = newClasses.join(" ");

			this._stateClasses = newStateClasses;
		},

		_subnodeCssMouseEvent: function(node, clazz, evt){
			// summary:
			//		Handler for hover/active mouse event on widget's subnode
			if(this.disabled || this.readOnly){
				return;
			}

			function hover(isHovering){
				domClass.toggle(node, clazz + "Hover", isHovering);
			}

			function active(isActive){
				domClass.toggle(node, clazz + "Active", isActive);
			}

			function focused(isFocused){
				domClass.toggle(node, clazz + "Focused", isFocused);
			}

			switch(evt.type){
				case "mouseover":
				case "MSPointerOver":
					hover(true);
					break;
				case "mouseout":
				case "MSPointerOut":
					hover(false);
					active(false);
					break;
				case "mousedown":
				case "touchstart":
				case "MSPointerDown":
				case "keydown":
					active(true);
					break;
				case "mouseup":
				case "MSPointerUp":
				case "dojotouchend":
				case "keyup":
					active(false);
					break;
				case "focus":
				case "focusin":
					focused(true);
					break;
				case "blur":
				case "focusout":
					focused(false);
					break;
			}
		},

		_trackMouseState: function(/*DomNode*/ node, /*String*/ clazz){
			// summary:
			//		Track mouse/focus events on specified node and set CSS class on that node to indicate
			//		current state.   Usually not called directly, but via cssStateNodes attribute.
			// description:
			//		Given class=foo, will set the following CSS class on the node
			//
			//		- fooActive: if the user is currently pressing down the mouse button while over the node
			//		- fooHover: if the user is hovering the mouse over the node, but not pressing down a button
			//		- fooFocus: if the node is focused
			//
			//		Note that it won't set any classes if the widget is disabled.
			// node: DomNode
			//		Should be a sub-node of the widget, not the top node (this.domNode), since the top node
			//		is handled specially and automatically just by mixing in this class.
			// clazz: String
			//		CSS class name (ex: dijitSliderUpArrow)

			// Flag for listener code below to call this._cssMouseEvent() or this._subnodeCssMouseEvent()
			// when node is hovered/active
			node._cssState = clazz;
		}
	});

	domReady(function(){
		// Document level listener to catch hover etc. events on widget root nodes and subnodes.
		// Note that when the mouse is moved quickly, a single onmouseenter event could signal that multiple widgets
		// have been hovered or unhovered (try test_Accordion.html)

		function pointerHandler(evt, target, relatedTarget){
			// Handler for mouseover, mouseout, a11yclick.press and a11click.release events

			// Poor man's event propagation.  Don't propagate event to ancestors of evt.relatedTarget,
			// to avoid processing mouseout events moving from a widget's domNode to a descendant node;
			// such events shouldn't be interpreted as a mouseleave on the widget.
			if(relatedTarget && dom.isDescendant(relatedTarget, target)){
				return;
			}

			for(var node = target; node && node != relatedTarget; node = node.parentNode){
				// Process any nodes with _cssState property.   They are generally widget root nodes,
				// but could also be sub-nodes within a widget
				if(node._cssState){
					var widget = registry.getEnclosingWidget(node);
					if(widget){
						if(node == widget.domNode){
							// event on the widget's root node
							widget._cssMouseEvent(evt);
						}else{
							// event on widget's sub-node
							widget._subnodeCssMouseEvent(node, node._cssState, evt);
						}
					}
				}
			}
		}

		var body = win.body(), activeNode;

		// Handle pointer related events (i.e. mouse or touch)
		on(body, touch.over, function(evt){
			// Using touch.over rather than mouseover mainly to ignore phantom mouse events on iOS.
			pointerHandler(evt, evt.target, evt.relatedTarget);
		});
		on(body, touch.out, function(evt){
			// Using touch.out rather than mouseout mainly to ignore phantom mouse events on iOS.
			pointerHandler(evt, evt.target, evt.relatedTarget);
		});
		on(body, a11yclick.press, function(evt){
			// Save the a11yclick.press target to reference when the a11yclick.release comes.
			activeNode = evt.target;
			pointerHandler(evt, activeNode)
		});
		on(body, a11yclick.release, function(evt){
			// The release event could come on a separate node than the press event, if for example user slid finger.
			// Reference activeNode to reset the state of the node that got state set in the a11yclick.press handler.
			pointerHandler(evt, activeNode);
			activeNode = null;
		});

		// Track focus events on widget sub-nodes that have been registered via _trackMouseState().
		// However, don't track focus events on the widget root nodes, because focus is tracked via the
		// focus manager (and it's not really tracking focus, but rather tracking that focus is on one of the widget's
		// nodes or a subwidget's node or a popup node, etc.)
		// Remove for 2.0 (if focus CSS needed, just use :focus pseudo-selector).
		on(body, "focusin, focusout", function(evt){
			var node = evt.target;
			if(node._cssState && !node.getAttribute("widgetId")){
				var widget = registry.getEnclosingWidget(node);
				if(widget){
					widget._subnodeCssMouseEvent(node, node._cssState, evt);
				}
			}
		});
	});

	return CssStateMixin;
});

},
'dojo/_base/url':function(){
define(["./kernel"], function(dojo){
	// module:
	//		dojo/url

	var
		ore = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$"),
		ire = new RegExp("^((([^\\[:]+):)?([^@]+)@)?(\\[([^\\]]+)\\]|([^\\[:]*))(:([0-9]+))?$"),
		_Url = function(){
			var n = null,
				_a = arguments,
				uri = [_a[0]];
			// resolve uri components relative to each other
			for(var i = 1; i<_a.length; i++){
				if(!_a[i]){ continue; }

				// Safari doesn't support this.constructor so we have to be explicit
				// FIXME: Tracked (and fixed) in Webkit bug 3537.
				//		http://bugs.webkit.org/show_bug.cgi?id=3537
				var relobj = new _Url(_a[i]+""),
					uriobj = new _Url(uri[0]+"");

				if(
					relobj.path == "" &&
					!relobj.scheme &&
					!relobj.authority &&
					!relobj.query
				){
					if(relobj.fragment != n){
						uriobj.fragment = relobj.fragment;
					}
					relobj = uriobj;
				}else if(!relobj.scheme){
					relobj.scheme = uriobj.scheme;

					if(!relobj.authority){
						relobj.authority = uriobj.authority;

						if(relobj.path.charAt(0) != "/"){
							var path = uriobj.path.substring(0,
								uriobj.path.lastIndexOf("/") + 1) + relobj.path;

							var segs = path.split("/");
							for(var j = 0; j < segs.length; j++){
								if(segs[j] == "."){
									// flatten "./" references
									if(j == segs.length - 1){
										segs[j] = "";
									}else{
										segs.splice(j, 1);
										j--;
									}
								}else if(j > 0 && !(j == 1 && segs[0] == "") &&
									segs[j] == ".." && segs[j-1] != ".."){
									// flatten "../" references
									if(j == (segs.length - 1)){
										segs.splice(j, 1);
										segs[j - 1] = "";
									}else{
										segs.splice(j - 1, 2);
										j -= 2;
									}
								}
							}
							relobj.path = segs.join("/");
						}
					}
				}

				uri = [];
				if(relobj.scheme){
					uri.push(relobj.scheme, ":");
				}
				if(relobj.authority){
					uri.push("//", relobj.authority);
				}
				uri.push(relobj.path);
				if(relobj.query){
					uri.push("?", relobj.query);
				}
				if(relobj.fragment){
					uri.push("#", relobj.fragment);
				}
			}

			this.uri = uri.join("");

			// break the uri into its main components
			var r = this.uri.match(ore);

			this.scheme = r[2] || (r[1] ? "" : n);
			this.authority = r[4] || (r[3] ? "" : n);
			this.path = r[5]; // can never be undefined
			this.query = r[7] || (r[6] ? "" : n);
			this.fragment	 = r[9] || (r[8] ? "" : n);

			if(this.authority != n){
				// server based naming authority
				r = this.authority.match(ire);

				this.user = r[3] || n;
				this.password = r[4] || n;
				this.host = r[6] || r[7]; // ipv6 || ipv4
				this.port = r[9] || n;
			}
		};
	_Url.prototype.toString = function(){ return this.uri; };

	return dojo._Url = _Url;
});

},
'dojo/hccss':function(){
define([
	"require",			// require, require.toUrl
	"./_base/config", // config.blankGif
	"./dom-class", // domClass.add
	"./dom-style", // domStyle.getComputedStyle
	"./has",
	"./domReady",
	"./_base/window" // win.body
], function(require, config, domClass, domStyle, has, domReady, win){

	// module:
	//		dojo/hccss

	/*=====
	return function(){
		// summary:
		//		Test if computer is in high contrast mode (i.e. if browser is not displaying background images).
		//		Defines `has("highcontrast")` and sets `dj_a11y` CSS class on `<body>` if machine is in high contrast mode.
		//		Returns `has()` method;
	};
	=====*/

	// Has() test for when background images aren't displayed.  Don't call has("highcontrast") before dojo/domReady!.
	has.add("highcontrast", function(){
		// note: if multiple documents, doesn't matter which one we use
		var div = win.doc.createElement("div");
		div.style.cssText = "border: 1px solid; border-color:red green; position: absolute; height: 5px; top: -999px;" +
			"background-image: url(" + (config.blankGif || require.toUrl("./resources/blank.gif")) + ");";
		win.body().appendChild(div);

		var cs = domStyle.getComputedStyle(div),
			bkImg = cs.backgroundImage,
			hc = (cs.borderTopColor == cs.borderRightColor) ||
				(bkImg && (bkImg == "none" || bkImg == "url(invalid-url:)" ));

		if(has("ie") <= 8){
			div.outerHTML = "";		// prevent mixed-content warning, see http://support.microsoft.com/kb/925014
		}else{
			win.body().removeChild(div);
		}

		return hc;
	});

	domReady(function(){
		if(has("highcontrast")){
			domClass.add(win.body(), "dj_a11y");
		}
	});

	return has;
});

},
'dijit/_TimePicker':function(){
define([
	"dojo/_base/array", // array.forEach
	"dojo/date", // date.compare
	"dojo/date/locale", // locale.format
	"dojo/date/stamp", // stamp.fromISOString stamp.toISOString
	"dojo/_base/declare", // declare
	"dojo/dom-class", // domClass.add domClass.contains domClass.toggle
	"dojo/dom-construct", // domConstruct.create
	"dojo/_base/kernel", // deprecated
	"dojo/keys", // keys
	"dojo/_base/lang", // lang.mixin
	"dojo/sniff", // has(...)
	"dojo/query", // query
	"dojo/mouse", // mouse.wheel
	"dojo/on",
	"./_WidgetBase",
	"./form/_ListMouseMixin"
], function(array, ddate, locale, stamp, declare, domClass, domConstruct, kernel, keys, lang, has, query, mouse, on,
			_WidgetBase, _ListMouseMixin){

	// module:
	//		dijit/_TimePicker


	var TimePicker = declare("dijit._TimePicker", [_WidgetBase, _ListMouseMixin], {
		// summary:
		//		A time picker dropdown, used by dijit/form/TimeTextBox.
		//		This widget is not available as a standalone widget due to lack of accessibility support.

		// baseClass: [protected] String
		//		The root className to use for the various states of this widget
		baseClass: "dijitTimePicker",

		// clickableIncrement: String
		//		ISO-8601 string representing the amount by which
		//		every clickable element in the time picker increases.
		//		Set in local time, without a time zone.
		//		Example: `T00:15:00` creates 15 minute increments
		//		Must divide dijit/_TimePicker.visibleIncrement evenly
		clickableIncrement: "T00:15:00",

		// visibleIncrement: String
		//		ISO-8601 string representing the amount by which
		//		every element with a visible time in the time picker increases.
		//		Set in local time, without a time zone.
		//		Example: `T01:00:00` creates text in every 1 hour increment
		visibleIncrement: "T01:00:00",

		// value: String
		//		Date to display.
		//		Defaults to current time and date.
		//		Can be a Date object or an ISO-8601 string.
		//		If you specify the GMT time zone (`-01:00`),
		//		the time will be converted to the local time in the local time zone.
		//		Otherwise, the time is considered to be in the local time zone.
		//		If you specify the date and isDate is true, the date is used.
		//		Example: if your local time zone is `GMT -05:00`,
		//		`T10:00:00` becomes `T10:00:00-05:00` (considered to be local time),
		//		`T10:00:00-01:00` becomes `T06:00:00-05:00` (4 hour difference),
		//		`T10:00:00Z` becomes `T05:00:00-05:00` (5 hour difference between Zulu and local time)
		//		`yyyy-mm-ddThh:mm:ss` is the format to set the date and time
		//		Example: `2007-06-01T09:00:00`
		value: new Date(),

		_visibleIncrement: 2,
		_clickableIncrement: 1,
		_totalIncrements: 10,

		// constraints: TimePicker.__Constraints
		//		Specifies valid range of times (start time, end time)
		constraints: {},

		/*=====
		 serialize: function(val, options){
			 // summary:
			 //		User overridable function used to convert the attr('value') result to a String
			 // val: Date
			 //		The current value
			 // options: Object?
			 // tags:
			 //		protected
		 },
		 =====*/
		serialize: stamp.toISOString,

		/*=====
		 // filterString: string
		 //		The string to filter by
		 filterString: "",
		 =====*/

		buildRendering: function(){
			this.inherited(arguments);
			this.containerNode = this.domNode;	// expected by _ListBase
			this.timeMenu = this.domNode;	// for back-compat
		},

		setValue: function(/*Date*/ value){
			// summary:
			//		Deprecated.  Used set('value') instead.
			// tags:
			//		deprecated
			kernel.deprecated("dijit._TimePicker:setValue() is deprecated.  Use set('value', ...) instead.", "", "2.0");
			this.set('value', value);
		},

		_setValueAttr: function(/*Date*/ date){
			// summary:
			//		Hook so set('value', ...) works.
			// description:
			//		Set the value of the TimePicker.
			//		Redraws the TimePicker around the new date.
			// tags:
			//		protected
			this._set("value", date);
			this._showText();
		},

		_setFilterStringAttr: function(val){
			// summary:
			//		Called by TimeTextBox to filter the values shown in my list
			this._set("filterString", val);
			this._showText();
		},

		isDisabledDate: function(/*===== dateObject, locale =====*/){
			// summary:
			//		May be overridden to disable certain dates in the TimePicker e.g. `isDisabledDate=locale.isWeekend`
			// dateObject: Date
			// locale: String?
			// type:
			//		extension
			return false; // Boolean
		},

		_getFilteredNodes: function(/*number*/ start, /*number*/ maxNum, /*Boolean*/ before, /*DOMNode*/ lastNode){
			// summary:
			//		Returns an array of nodes with the filter applied.  At most maxNum nodes
			//		will be returned - but fewer may be returned as well.  If the
			//		before parameter is set to true, then it will return the elements
			//		before the given index
			// tags:
			//		private

			var nodes = [];

			for(var i = 0 ; i < this._maxIncrement; i++){
				var n = this._createOption(i);
				if(n){
					nodes.push(n);
				}
			}
			return nodes;
		},

		_showText: function(){
			// summary:
			//		Displays the relevant choices in the drop down list
			// tags:
			//		private
			var fromIso = stamp.fromISOString;
			this.domNode.innerHTML = "";
			this._clickableIncrementDate = fromIso(this.clickableIncrement);
			this._visibleIncrementDate = fromIso(this.visibleIncrement);
			// get the value of the increments to find out how many divs to create
			var
				sinceMidnight = function(/*Date*/ date){
					return date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();
				},
				clickableIncrementSeconds = sinceMidnight(this._clickableIncrementDate),
				visibleIncrementSeconds = sinceMidnight(this._visibleIncrementDate),
				// round reference date to previous visible increment
				time = (this.value || this.currentFocus).getTime();

			this._refDate = fromIso("T00:00:00");
			this._refDate.setFullYear(1970, 0, 1); // match parse defaults

			// assume clickable increment is the smallest unit
			this._clickableIncrement = 1;
			// divide the visible range by the clickable increment to get the number of divs to create
			// example: 10:00:00/00:15:00 -> display 40 divs
			// divide the visible increments by the clickable increments to get how often to display the time inline
			// example: 01:00:00/00:15:00 -> display the time every 4 divs
			this._visibleIncrement = visibleIncrementSeconds / clickableIncrementSeconds;
			// divide the number of seconds in a day by the clickable increment in seconds to get the
			// absolute max number of increments.
			this._maxIncrement = (60 * 60 * 24) / clickableIncrementSeconds;

			var nodes  = this._getFilteredNodes();
			array.forEach(nodes, function(n){
				this.domNode.appendChild(n);
			}, this);

			// never show empty due to a bad filter
			if(!nodes.length && this.filterString){
				this.filterString = '';
				this._showText();
			}
		},

		constructor: function(/*===== params, srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified, replace srcNodeRef with my generated DOM tree

			this.constraints = {};
		},

		postMixInProperties: function(){
			this.inherited(arguments);
			this._setConstraintsAttr(this.constraints); // this needs to happen now (and later) due to codependency on _set*Attr calls
		},

		_setConstraintsAttr: function(/* Object */ constraints){
			// brings in increments, etc.
			for(var key in constraints){
				this._set(key, constraints[key]);
			}

			// locale needs the lang in the constraints as locale
			if(!constraints.locale){
				constraints.locale = this.lang;
			}
		},

		_createOption: function(/*Number*/ index){
			// summary:
			//		Creates a clickable time option, or returns null if the specified index doesn't match the filter
			// tags:
			//		private
			var date = new Date(this._refDate);
			var incrementDate = this._clickableIncrementDate;
			date.setTime(date.getTime()
				+ incrementDate.getHours() * index * 3600000
				+ incrementDate.getMinutes() * index * 60000
				+ incrementDate.getSeconds() * index * 1000);
			if(this.constraints.selector == "time"){
				date.setFullYear(1970, 0, 1); // make sure each time is for the same date
			}
			var dateString = locale.format(date, this.constraints);
			if(this.filterString && dateString.toLowerCase().indexOf(this.filterString) !== 0){
				// Doesn't match the filter - return null
				return null;
			}

			var div = this.ownerDocument.createElement("div");
			div.className = this.baseClass + "Item";
			div.date = date;
			div.idx = index;
			domConstruct.create('div', {
				"class": this.baseClass + "ItemInner",
				innerHTML: dateString
			}, div);

			if(index % this._visibleIncrement < 1 && index % this._visibleIncrement > -1){
				domClass.add(div, this.baseClass + "Marker");
			}else if(!(index % this._clickableIncrement)){
				domClass.add(div, this.baseClass + "Tick");
			}

			if(this.isDisabledDate(date)){
				// set disabled
				domClass.add(div, this.baseClass + "ItemDisabled");
			}
			if(this.value && !ddate.compare(this.value, date, this.constraints.selector)){
				div.selected = true;
				domClass.add(div, this.baseClass + "ItemSelected");
				this._selectedDiv = div;
				if(domClass.contains(div, this.baseClass + "Marker")){
					domClass.add(div, this.baseClass + "MarkerSelected");
				}else{
					domClass.add(div, this.baseClass + "TickSelected");
				}

				// Initially highlight the current value.   User can change highlight by up/down arrow keys
				// or mouse movement.
				this._highlightOption(div, true);
			}
			return div;
		},

		onOpen: function(){
			this.inherited(arguments);

			// Since _ListBase::_setSelectedAttr() calls scrollIntoView(), shouldn't call it until list is visible.
			this.set("selected", this._selectedDiv);
		},

		_onOptionSelected: function(/*Object*/ tgt){
			// summary:
			//		Called when user clicks an option in the drop down list
			// tags:
			//		private
			var tdate = tgt.target.date || tgt.target.parentNode.date;
			if(!tdate || this.isDisabledDate(tdate)){
				return;
			}
			this._highlighted_option = null;
			this.set('value', tdate);
			this.onChange(tdate);
		},

		onChange: function(/*Date*/ /*===== time =====*/){
			// summary:
			//		Notification that a time was selected.  It may be the same as the previous value.
			// tags:
			//		public
		},

		_highlightOption: function(/*node*/ node, /*Boolean*/ highlight){
			// summary:
			//		Turns on/off highlight effect on a node based on mouse out/over event
			// tags:
			//		private
			if(!node){
				return;
			}
			if(highlight){
				if(this._highlighted_option){
					this._highlightOption(this._highlighted_option, false);
				}
				this._highlighted_option = node;
			}else if(this._highlighted_option !== node){
				return;
			}else{
				this._highlighted_option = null;
			}
			domClass.toggle(node, this.baseClass + "ItemHover", highlight);
			if(domClass.contains(node, this.baseClass + "Marker")){
				domClass.toggle(node, this.baseClass + "MarkerHover", highlight);
			}else{
				domClass.toggle(node, this.baseClass + "TickHover", highlight);
			}
		},

		handleKey: function(/*Event*/ e){
			// summary:
			//		Called from `dijit/form/_DateTimeTextBox` to pass a keypress event
			//		from the `dijit/form/TimeTextBox` to be handled in this widget
			// tags:
			//		protected
			if(e.keyCode == keys.DOWN_ARROW){
				this.selectNextNode();
				e.stopPropagation();
				e.preventDefault();
				return false;
			}else if(e.keyCode == keys.UP_ARROW){
				this.selectPreviousNode();
				e.stopPropagation();
				e.preventDefault();
				return false;
			}else if(e.keyCode == keys.ENTER || e.keyCode === keys.TAB){
				// mouse hover followed by TAB is NO selection
				if(!this._keyboardSelected && e.keyCode === keys.TAB){
					return true;	// true means don't call stopEvent()
				}

				// Accept the currently-highlighted option as the value
				if(this._highlighted_option){
					this._onOptionSelected({target: this._highlighted_option});
				}

				// Call stopEvent() for ENTER key so that form doesn't submit,
				// but not for TAB, so that TAB does switch focus
				return e.keyCode === keys.TAB;
			}
			return undefined;
		},

		// Implement abstract methods for _ListBase
		onHover: function(/*DomNode*/ node){
			this._highlightOption(node, true);
		},

		onUnhover: function(/*DomNode*/ node){
			this._highlightOption(node, false);
		},

		onSelect: function(/*DomNode*/ node){
			this._highlightOption(node, true);
		},

		onDeselect: function(/*DomNode*/ node){
			this._highlightOption(node, false);
		},

		onClick: function(/*DomNode*/ node){
			this._onOptionSelected({target: node});
		}
	});

	/*=====
	 TimePicker.__Constraints = declare(locale.__FormatOptions, {
		 // clickableIncrement: String
		 //		See `dijit/_TimePicker.clickableIncrement`
		 clickableIncrement: "T00:15:00"
	 });
	 =====*/

	return TimePicker;
});

},
'dojo/string':function(){
define([
	"./_base/kernel",	// kernel.global
	"./_base/lang"
], function(kernel, lang){

// module:
//		dojo/string

var string = {
	// summary:
	//		String utilities for Dojo
};
lang.setObject("dojo.string", string);

string.rep = function(/*String*/str, /*Integer*/num){
	// summary:
	//		Efficiently replicate a string `n` times.
	// str:
	//		the string to replicate
	// num:
	//		number of times to replicate the string

	if(num <= 0 || !str){ return ""; }

	var buf = [];
	for(;;){
		if(num & 1){
			buf.push(str);
		}
		if(!(num >>= 1)){ break; }
		str += str;
	}
	return buf.join("");	// String
};

string.pad = function(/*String*/text, /*Integer*/size, /*String?*/ch, /*Boolean?*/end){
	// summary:
	//		Pad a string to guarantee that it is at least `size` length by
	//		filling with the character `ch` at either the start or end of the
	//		string. Pads at the start, by default.
	// text:
	//		the string to pad
	// size:
	//		length to provide padding
	// ch:
	//		character to pad, defaults to '0'
	// end:
	//		adds padding at the end if true, otherwise pads at start
	// example:
	//	|	// Fill the string to length 10 with "+" characters on the right.  Yields "Dojo++++++".
	//	|	string.pad("Dojo", 10, "+", true);

	if(!ch){
		ch = '0';
	}
	var out = String(text),
		pad = string.rep(ch, Math.ceil((size - out.length) / ch.length));
	return end ? out + pad : pad + out;	// String
};

string.substitute = function(	/*String*/		template,
									/*Object|Array*/map,
									/*Function?*/	transform,
									/*Object?*/		thisObject){
	// summary:
	//		Performs parameterized substitutions on a string. Throws an
	//		exception if any parameter is unmatched.
	// template:
	//		a string with expressions in the form `${key}` to be replaced or
	//		`${key:format}` which specifies a format function. keys are case-sensitive.
	// map:
	//		hash to search for substitutions
	// transform:
	//		a function to process all parameters before substitution takes
	//		place, e.g. mylib.encodeXML
	// thisObject:
	//		where to look for optional format function; default to the global
	//		namespace
	// example:
	//		Substitutes two expressions in a string from an Array or Object
	//	|	// returns "File 'foo.html' is not found in directory '/temp'."
	//	|	// by providing substitution data in an Array
	//	|	string.substitute(
	//	|		"File '${0}' is not found in directory '${1}'.",
	//	|		["foo.html","/temp"]
	//	|	);
	//	|
	//	|	// also returns "File 'foo.html' is not found in directory '/temp'."
	//	|	// but provides substitution data in an Object structure.  Dotted
	//	|	// notation may be used to traverse the structure.
	//	|	string.substitute(
	//	|		"File '${name}' is not found in directory '${info.dir}'.",
	//	|		{ name: "foo.html", info: { dir: "/temp" } }
	//	|	);
	// example:
	//		Use a transform function to modify the values:
	//	|	// returns "file 'foo.html' is not found in directory '/temp'."
	//	|	string.substitute(
	//	|		"${0} is not found in ${1}.",
	//	|		["foo.html","/temp"],
	//	|		function(str){
	//	|			// try to figure out the type
	//	|			var prefix = (str.charAt(0) == "/") ? "directory": "file";
	//	|			return prefix + " '" + str + "'";
	//	|		}
	//	|	);
	// example:
	//		Use a formatter
	//	|	// returns "thinger -- howdy"
	//	|	string.substitute(
	//	|		"${0:postfix}", ["thinger"], null, {
	//	|			postfix: function(value, key){
	//	|				return value + " -- howdy";
	//	|			}
	//	|		}
	//	|	);

	thisObject = thisObject || kernel.global;
	transform = transform ?
		lang.hitch(thisObject, transform) : function(v){ return v; };

	return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,
		function(match, key, format){
			var value = lang.getObject(key, false, map);
			if(format){
				value = lang.getObject(format, false, thisObject).call(thisObject, value, key);
			}
			return transform(value, key).toString();
		}); // String
};

string.trim = String.prototype.trim ?
	lang.trim : // aliasing to the native function
	function(str){
		str = str.replace(/^\s+/, '');
		for(var i = str.length - 1; i >= 0; i--){
			if(/\S/.test(str.charAt(i))){
				str = str.substring(0, i + 1);
				break;
			}
		}
		return str;
	};

/*=====
 string.trim = function(str){
	 // summary:
	 //		Trims whitespace from both sides of the string
	 // str: String
	 //		String to be trimmed
	 // returns: String
	 //		Returns the trimmed string
	 // description:
	 //		This version of trim() was taken from [Steven Levithan's blog](http://blog.stevenlevithan.com/archives/faster-trim-javascript).
	 //		The short yet performant version of this function is dojo.trim(),
	 //		which is part of Dojo base.  Uses String.prototype.trim instead, if available.
	 return "";	// String
 };
 =====*/

	return string;
});

},
'dijit/form/_FormValueWidget':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/sniff", // has("ie")
	"./_FormWidget",
	"./_FormValueMixin"
], function(declare, has, _FormWidget, _FormValueMixin){

	// module:
	//		dijit/form/_FormValueWidget

	return declare("dijit.form._FormValueWidget", [_FormWidget, _FormValueMixin], {
		// summary:
		//		Base class for widgets corresponding to native HTML elements such as `<input>` or `<select>`
		//		that have user changeable values.
		// description:
		//		Each _FormValueWidget represents a single input value, and has a (possibly hidden) `<input>` element,
		//		to which it serializes it's input value, so that form submission (either normal submission or via FormBind?)
		//		works as expected.

		// Don't attempt to mixin the 'type', 'name' attributes here programatically -- they must be declared
		// directly in the template as read by the parser in order to function. IE is known to specifically
		// require the 'name' attribute at element creation time.  See #8484, #8660.

		_layoutHackIE7: function(){
			// summary:
			//		Work around table sizing bugs on IE7 by forcing redraw

			if(has("ie") == 7){ // fix IE7 layout bug when the widget is scrolled out of sight
				var domNode = this.domNode;
				var parent = domNode.parentNode;
				var pingNode = domNode.firstChild || domNode; // target node most unlikely to have a custom filter
				var origFilter = pingNode.style.filter; // save custom filter, most likely nothing
				var _this = this;
				while(parent && parent.clientHeight == 0){ // search for parents that haven't rendered yet
					(function ping(){
						var disconnectHandle = _this.connect(parent, "onscroll",
							function(){
								_this.disconnect(disconnectHandle); // only call once
								pingNode.style.filter = (new Date()).getMilliseconds(); // set to anything that's unique
								_this.defer(function(){
									pingNode.style.filter = origFilter;
								}); // restore custom filter, if any
							}
						);
					})();
					parent = parent.parentNode;
				}
			}
		}
	});
});

},
'dijit/ToolbarSeparator':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/dom", // dom.setSelectable
	"./_Widget",
	"./_TemplatedMixin"
], function(declare, dom, _Widget, _TemplatedMixin){

	// module:
	//		dijit/ToolbarSeparator


	return declare("dijit.ToolbarSeparator", [_Widget, _TemplatedMixin], {
		// summary:
		//		A spacer between two `dijit.Toolbar` items

		templateString: '<div class="dijitToolbarSeparator dijitInline" role="presentation"></div>',

		buildRendering: function(){
			this.inherited(arguments);
			dom.setSelectable(this.domNode, false);
		},

		isFocusable: function(){
			// summary:
			//		This widget isn't focusable, so pass along that fact.
			// tags:
			//		protected
			return false;
		}
	});
});

},
'dijit/form/Button':function(){
define([
	"require",
	"dojo/_base/declare", // declare
	"dojo/dom-class", // domClass.toggle
	"dojo/has", // has("dijit-legacy-requires")
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/_base/lang", // lang.trim
	"dojo/ready",
	"./_FormWidget",
	"./_ButtonMixin",
	"dojo/text!./templates/Button.html"
], function(require, declare, domClass, has, kernel, lang, ready, _FormWidget, _ButtonMixin, template){

	// module:
	//		dijit/form/Button

	// Back compat w/1.6, remove for 2.0
	if(has("dijit-legacy-requires")){
		ready(0, function(){
			var requires = ["dijit/form/DropDownButton", "dijit/form/ComboButton", "dijit/form/ToggleButton"];
			require(requires);	// use indirection so modules not rolled into a build
		});
	}

	var Button = declare("dijit.form.Button" + (has("dojo-bidi") ? "_NoBidi" : ""), [_FormWidget, _ButtonMixin], {
		// summary:
		//		Basically the same thing as a normal HTML button, but with special styling.
		// description:
		//		Buttons can display a label, an icon, or both.
		//		A label should always be specified (through innerHTML) or the label
		//		attribute.  It can be hidden via showLabel=false.
		// example:
		// |	<button data-dojo-type="dijit/form/Button" onClick="...">Hello world</button>
		//
		// example:
		// |	var button1 = new Button({label: "hello world", onClick: foo});
		// |	dojo.body().appendChild(button1.domNode);

		// showLabel: Boolean
		//		Set this to true to hide the label text and display only the icon.
		//		(If showLabel=false then iconClass must be specified.)
		//		Especially useful for toolbars.
		//		If showLabel=true, the label will become the title (a.k.a. tooltip/hint) of the icon.
		//
		//		The exception case is for computers in high-contrast mode, where the label
		//		will still be displayed, since the icon doesn't appear.
		showLabel: true,

		// iconClass: String
		//		Class to apply to DOMNode in button to make it display an icon
		iconClass: "dijitNoIcon",
		_setIconClassAttr: { node: "iconNode", type: "class" },

		baseClass: "dijitButton",

		templateString: template,

		// Map widget attributes to DOMNode attributes.
		_setValueAttr: "valueNode",
		_setNameAttr: function(name){
			// avoid breaking existing subclasses where valueNode undefined.  Perhaps in 2.0 require it to be defined?
			if(this.valueNode){
				this.valueNode.setAttribute("name", name);
			}
		},

		_fillContent: function(/*DomNode*/ source){
			// Overrides _Templated._fillContent().
			// If button label is specified as srcNodeRef.innerHTML rather than
			// this.params.label, handle it here.
			// TODO: remove the method in 2.0, parser will do it all for me
			if(source && (!this.params || !("label" in this.params))){
				var sourceLabel = lang.trim(source.innerHTML);
				if(sourceLabel){
					this.label = sourceLabel; // _applyAttributes will be called after buildRendering completes to update the DOM
				}
			}
		},

		_setShowLabelAttr: function(val){
			if(this.containerNode){
				domClass.toggle(this.containerNode, "dijitDisplayNone", !val);
			}
			this._set("showLabel", val);
		},

		setLabel: function(/*String*/ content){
			// summary:
			//		Deprecated.  Use set('label', ...) instead.
			kernel.deprecated("dijit.form.Button.setLabel() is deprecated.  Use set('label', ...) instead.", "", "2.0");
			this.set("label", content);
		},

		_setLabelAttr: function(/*String*/ content){
			// summary:
			//		Hook for set('label', ...) to work.
			// description:
			//		Set the label (text) of the button; takes an HTML string.
			//		If the label is hidden (showLabel=false) then and no title has
			//		been specified, then label is also set as title attribute of icon.
			this.inherited(arguments);
			if(!this.showLabel && !("title" in this.params)){
				this.titleNode.title = lang.trim(this.containerNode.innerText || this.containerNode.textContent || '');
			}
		}
	});

	if(has("dojo-bidi")){
		Button = declare("dijit.form.Button", Button, {
			_setLabelAttr: function(/*String*/ content){
				this.inherited(arguments);
				if(this.titleNode.title){
					this.applyTextDir(this.titleNode, this.titleNode.title);
				}
			},

			_setTextDirAttr: function(/*String*/ textDir){
				if(this._created && this.textDir != textDir){
					this._set("textDir", textDir);
					this._setLabelAttr(this.label); // call applyTextDir on both focusNode and titleNode
				}
			}
		});
	}

	return Button;
});

},
'dijit/_editor/html':function(){
define([
	"dojo/_base/array",
	"dojo/_base/lang", // lang.setObject
	"dojo/sniff" // has("ie")
], function(array, lang, has){

	// module:
	//		dijit/_editor/html

	var exports = {
		// summary:
		//		HTML serialization utility functions used by editor
	};
	lang.setObject("dijit._editor.html", exports);

	var escape = exports.escapeXml = function(/*String*/ str, /*Boolean?*/ noSingleQuotes){
		// summary:
		//		Adds escape sequences for special characters in XML: `&<>"'`.
		//		Optionally skips escapes for single quotes.
		str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
		if(!noSingleQuotes){
			str = str.replace(/'/gm, "&#39;");
		}
		return str; // string
	};

	exports.getNodeHtml = function(/*DomNode*/ node){
		// summary:
		//		Return string representing HTML for node and it's children
		var output = [];
		exports.getNodeHtmlHelper(node, output);
		return output.join("");
	};

	exports.getNodeHtmlHelper = function(/*DomNode*/ node, /*String[]*/ output){
		// summary:
		//		Pushes array of strings into output[] which represent HTML for node and it's children
		switch(node.nodeType){
			case 1: // element node
				var lName = node.nodeName.toLowerCase();
				if(!lName || lName.charAt(0) == "/"){
					// IE does some strange things with malformed HTML input, like
					// treating a close tag </span> without an open tag <span>, as
					// a new tag with tagName of /span.  Corrupts output HTML, remove
					// them.  Other browsers don't prefix tags that way, so will
					// never show up.
					return "";
				}
				output.push('<', lName);

				// store the list of attributes and sort it to have the
				// attributes appear in the dictionary order
				var attrarray = [], attrhash = {};
				var attr;
				if(has("dom-attributes-explicit") || has("dom-attributes-specified-flag")){
					// IE8+ and all other browsers.
					var i = 0;
					while((attr = node.attributes[i++])){
						// ignore all attributes starting with _dj which are
						// internal temporary attributes used by the editor
						var n = attr.name;
						if(n.substr(0, 3) !== '_dj' &&
							(!has("dom-attributes-specified-flag") || attr.specified) && !(n in attrhash)){    // workaround repeated attributes bug in IE8 (LinkDialog test)
							var v = attr.value;
							if(n == 'src' || n == 'href'){
								if(node.getAttribute('_djrealurl')){
									v = node.getAttribute('_djrealurl');
								}
							}
							if(has("ie") === 8 && n === "style"){
								v = v.replace("HEIGHT:", "height:").replace("WIDTH:", "width:");
							}
							attrarray.push([n, v]);
							attrhash[n] = v;
						}
					}
				}else{
					// IE6-7 code path
					var clone = /^input$|^img$/i.test(node.nodeName) ? node : node.cloneNode(false);
					var s = clone.outerHTML;
					// Split up and manage the attrs via regexp
					// similar to prettyPrint attr logic.
					var rgxp_attrsMatch = /[\w-]+=("[^"]*"|'[^']*'|\S*)/gi
					var attrSplit = s.match(rgxp_attrsMatch);
					s = s.substr(0, s.indexOf('>'));
					array.forEach(attrSplit, function(attr){
						if(attr){
							var idx = attr.indexOf("=");
							if(idx > 0){
								var key = attr.substring(0, idx);
								if(key.substr(0, 3) != '_dj'){
									if(key == 'src' || key == 'href'){
										if(node.getAttribute('_djrealurl')){
											attrarray.push([key, node.getAttribute('_djrealurl')]);
											return;
										}
									}
									var val, match;
									switch(key){
										case 'style':
											val = node.style.cssText.toLowerCase();
											break;
										case 'class':
											val = node.className;
											break;
										case 'width':
											if(lName === "img"){
												// This somehow gets lost on IE for IMG tags and the like
												// and we have to find it in outerHTML, known IE oddity.
												match = /width=(\S+)/i.exec(s);
												if(match){
													val = match[1];
												}
												break;
											}
										case 'height':
											if(lName === "img"){
												// This somehow gets lost on IE for IMG tags and the like
												// and we have to find it in outerHTML, known IE oddity.
												match = /height=(\S+)/i.exec(s);
												if(match){
													val = match[1];
												}
												break;
											}
										default:
											val = node.getAttribute(key);
									}
									if(val != null){
										attrarray.push([key, val.toString()]);
									}
								}
							}
						}
					}, this);
				}
				attrarray.sort(function(a, b){
					return a[0] < b[0] ? -1 : (a[0] == b[0] ? 0 : 1);
				});
				var j = 0;
				while((attr = attrarray[j++])){
					output.push(' ', attr[0], '="',
						(typeof attr[1] === "string" ? escape(attr[1], true) : attr[1]), '"');
				}
				switch(lName){
					case 'br':
					case 'hr':
					case 'img':
					case 'input':
					case 'base':
					case 'meta':
					case 'area':
					case 'basefont':
						// These should all be singly closed
						output.push(' />');
						break;
					case 'script':
						// Browsers handle script tags differently in how you get content,
						// but innerHTML always seems to work, so insert its content that way
						// Yes, it's bad to allow script tags in the editor code, but some people
						// seem to want to do it, so we need to at least return them right.
						// other plugins/filters can strip them.
						output.push('>', node.innerHTML, '</', lName, '>');
						break;
					default:
						output.push('>');
						if(node.hasChildNodes()){
							exports.getChildrenHtmlHelper(node, output);
						}
						output.push('</', lName, '>');
				}
				break;
			case 4: // cdata
			case 3: // text
				// FIXME:
				output.push(escape(node.nodeValue, true));
				break;
			case 8: // comment
				// FIXME:
				output.push('<!--', escape(node.nodeValue, true), '-->');
				break;
			default:
				output.push("<!-- Element not recognized - Type: ", node.nodeType, " Name: ", node.nodeName, "-->");
		}
	};

	exports.getChildrenHtml = function(/*DomNode*/ node){
		// summary:
		//		Returns the html content of a DomNode's children
		var output = [];
		exports.getChildrenHtmlHelper(node, output);
		return output.join("");
	};

	exports.getChildrenHtmlHelper = function(/*DomNode*/ dom, /*String[]*/ output){
		// summary:
		//		Pushes the html content of a DomNode's children into out[]

		if(!dom){
			return;
		}
		var nodes = dom["childNodes"] || dom;

		// IE issue.
		// If we have an actual node we can check parent relationships on for IE,
		// We should check, as IE sometimes builds invalid DOMS.  If no parent, we can't check
		// And should just process it and hope for the best.
		var checkParent = !has("ie") || nodes !== dom;

		var node, i = 0;
		while((node = nodes[i++])){
			// IE is broken.  DOMs are supposed to be a tree.  But in the case of malformed HTML, IE generates a graph
			// meaning one node ends up with multiple references (multiple parents).  This is totally wrong and invalid, but
			// such is what it is.  We have to keep track and check for this because otherwise the source output HTML will have dups.
			// No other browser generates a graph.  Leave it to IE to break a fundamental DOM rule.  So, we check the parent if we can
			// If we can't, nothing more we can do other than walk it.
			if(!checkParent || node.parentNode == dom){
				exports.getNodeHtmlHelper(node, output);
			}
		}
	};

	return exports;
});

},
'dijit/_AttachMixin':function(){
define([
	"require",
	"dojo/_base/array", // array.forEach
	"dojo/_base/connect",	// remove for 2.0
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // lang.getObject
	"dojo/mouse",
	"dojo/on",
	"dojo/touch",
	"./_WidgetBase"
], function(require, array, connect, declare, lang, mouse, on, touch, _WidgetBase){

	// module:
	//		dijit/_AttachMixin

	// Map from string name like "mouseenter" to synthetic event like mouse.enter
	var synthEvents = lang.delegate(touch, {
		"mouseenter": mouse.enter,
		"mouseleave": mouse.leave,
		"keypress": connect._keypress	// remove for 2.0
	});

	// To be lightweight, _AttachMixin doesn't require() dijit/a11yclick.
	// If the subclass has a template using "ondijitclick", it must load dijit/a11yclick itself.
	// In that case, the a11yclick variable below will get set to point to that synthetic event.
	var a11yclick;

	var _AttachMixin = declare("dijit._AttachMixin", null, {
		// summary:
		//		Mixin for widgets to attach to dom nodes and setup events via
		//		convenient data-dojo-attach-point and data-dojo-attach-event DOM attributes.
		//
		//		Superclass of _TemplatedMixin, and can also be used standalone when templates are pre-rendered on the
		//		server.
		//
		//		Does not [yet] handle widgets like ContentPane with this.containerNode set.   It should skip
		//		scanning for data-dojo-attach-point and data-dojo-attach-event inside this.containerNode, but it
		//		doesn't.

/*=====
		// _attachPoints: [private] String[]
		//		List of widget attribute names associated with data-dojo-attach-point=... in the
		//		template, ex: ["containerNode", "labelNode"]
		_attachPoints: [],

		// _attachEvents: [private] Handle[]
		//		List of connections associated with data-dojo-attach-event=... in the
		//		template
		_attachEvents: [],

		// attachScope: [public] Object
		//		Object to which attach points and events will be scoped.  Defaults
		//		to 'this'.
		attachScope: undefined,

		// searchContainerNode: [protected] Boolean
		//		Search descendants of this.containerNode for data-dojo-attach-point and data-dojo-attach-event.
		//		Should generally be left false (the default value) both for performance and to avoid failures when
		//		this.containerNode holds other _AttachMixin instances with their own attach points and events.
 		searchContainerNode: false,
 =====*/

		constructor: function(/*===== params, srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified, replace srcNodeRef with my generated DOM tree.

			this._attachPoints = [];
			this._attachEvents = [];
		},


		buildRendering: function(){
			// summary:
			//		Attach to DOM nodes marked with special attributes.
			// tags:
			//		protected

			this.inherited(arguments);

			// recurse through the node, looking for, and attaching to, our
			// attachment points and events, which should be defined on the template node.
			this._attachTemplateNodes(this.domNode);

			this._beforeFillContent();		// hook for _WidgetsInTemplateMixin
		},

		_beforeFillContent: function(){
		},

		_attachTemplateNodes: function(rootNode){
			// summary:
			//		Iterate through the dom nodes and attach functions and nodes accordingly.
			// description:
			//		Map widget properties and functions to the handlers specified in
			//		the dom node and it's descendants. This function iterates over all
			//		nodes and looks for these properties:
			//
			//		- dojoAttachPoint/data-dojo-attach-point
			//		- dojoAttachEvent/data-dojo-attach-event
			// rootNode: DomNode
			//		The node to search for properties. All descendants will be searched.
			// tags:
			//		private

			// DFS to process all nodes except those inside of this.containerNode
			var node = rootNode;
			while(true){
				if(node.nodeType == 1 && (this._processTemplateNode(node, function(n,p){ return n.getAttribute(p); },
						this._attach) || this.searchContainerNode) && node.firstChild){
					node = node.firstChild;
				}else{
					if(node == rootNode){ return; }
					while(!node.nextSibling){
						node = node.parentNode;
						if(node == rootNode){ return; }
					}
					node = node.nextSibling;
				}
			}
		},

		_processTemplateNode: function(/*DOMNode|Widget*/ baseNode, getAttrFunc, attachFunc){
			// summary:
			//		Process data-dojo-attach-point and data-dojo-attach-event for given node or widget.
			//		Returns true if caller should process baseNode's children too.

			var ret = true;

			// Process data-dojo-attach-point
			var _attachScope = this.attachScope || this,
				attachPoint = getAttrFunc(baseNode, "dojoAttachPoint") || getAttrFunc(baseNode, "data-dojo-attach-point");
			if(attachPoint){
				var point, points = attachPoint.split(/\s*,\s*/);
				while((point = points.shift())){
					if(lang.isArray(_attachScope[point])){
						_attachScope[point].push(baseNode);
					}else{
						_attachScope[point] = baseNode;
					}
					ret = (point != "containerNode");
					this._attachPoints.push(point);
				}
			}

			// Process data-dojo-attach-event
			var attachEvent = getAttrFunc(baseNode, "dojoAttachEvent") || getAttrFunc(baseNode, "data-dojo-attach-event");
			if(attachEvent){
				// NOTE: we want to support attributes that have the form
				// "domEvent: nativeEvent; ..."
				var event, events = attachEvent.split(/\s*,\s*/);
				var trim = lang.trim;
				while((event = events.shift())){
					if(event){
						var thisFunc = null;
						if(event.indexOf(":") != -1){
							// oh, if only JS had tuple assignment
							var funcNameArr = event.split(":");
							event = trim(funcNameArr[0]);
							thisFunc = trim(funcNameArr[1]);
						}else{
							event = trim(event);
						}
						if(!thisFunc){
							thisFunc = event;
						}

						this._attachEvents.push(attachFunc(baseNode, event, lang.hitch(_attachScope, thisFunc)));
					}
				}
			}

			return ret;
		},

		_attach: function(node, type, func){
			// summary:
			//		Roughly corresponding to dojo/on, this is the default function for processing a
			//		data-dojo-attach-event.  Meant to attach to DOMNodes, not to widgets.
			// node: DOMNode
			//		The node to setup a listener on.
			// type: String
			//		Event name like "click".
			// getAttrFunc: Function
			//		Function to get the specified property for a given DomNode/Widget.
			// attachFunc: Function?
			//		Attaches an event handler from the specified node/widget to specified function.

			// Map special type names like "mouseenter" to synthetic events.
			// Subclasses are responsible to require() dijit/a11yclick if they want to use it.
			type = type.replace(/^on/, "").toLowerCase();
			if(type == "dijitclick"){
				type = a11yclick || (a11yclick = require("./a11yclick"));
			}else{
				type = synthEvents[type] || type;
			}

			return on(node, type, func);
		},

		_detachTemplateNodes: function() {
			// summary:
			//		Detach and clean up the attachments made in _attachtempalteNodes.

			// Delete all attach points to prevent IE6 memory leaks.
			var _attachScope = this.attachScope || this;
			array.forEach(this._attachPoints, function(point){
				delete _attachScope[point];
			});
			this._attachPoints = [];

			// And same for event handlers
			array.forEach(this._attachEvents, function(handle){ handle.remove(); });
			this._attachEvents = [];
		},

		destroyRendering: function(){
			this._detachTemplateNodes();
			this.inherited(arguments);
		}
	});

	// These arguments can be specified for widgets which are used in templates.
	// Since any widget can be specified as sub widgets in template, mix it
	// into the base widget class.  (This is a hack, but it's effective.).
	// Remove for 2.0.   Also, hide from API doc parser.
	lang.extend(_WidgetBase, /*===== {} || =====*/ {
		dojoAttachEvent: "",
		dojoAttachPoint: ""
	});
	
	return _AttachMixin;
});

},
'dijit/_KeyNavContainer':function(){
define([
	"dojo/_base/array", // array.forEach
	"dojo/_base/declare", // declare
	"dojo/dom-attr", // domAttr.set
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/keys", // keys.END keys.HOME
	"dojo/_base/lang", // lang.hitch
	"./registry",
	"./_Container",
	"./_FocusMixin",
	"./_KeyNavMixin"
], function(array, declare, domAttr, kernel, keys, lang, registry, _Container, _FocusMixin, _KeyNavMixin){


	// module:
	//		dijit/_KeyNavContainer

	return declare("dijit._KeyNavContainer", [_FocusMixin, _KeyNavMixin, _Container], {
		// summary:
		//		A _Container with keyboard navigation of its children.
		// description:
		//		Provides normalized keyboard and focusing code for Container widgets.
		//		To use this mixin, call connectKeyNavHandlers() in postCreate().
		//		Also, child widgets must implement a focus() method.

		connectKeyNavHandlers: function(/*keys[]*/ prevKeyCodes, /*keys[]*/ nextKeyCodes){
			// summary:
			//		Deprecated.  You can call this in postCreate() to attach the keyboard handlers to the container,
			//		but the preferred method is to override _onLeftArrow() and _onRightArrow(), or
			//		_onUpArrow() and _onDownArrow(), to call focusPrev() and focusNext().
			// prevKeyCodes: keys[]
			//		Key codes for navigating to the previous child.
			// nextKeyCodes: keys[]
			//		Key codes for navigating to the next child.
			// tags:
			//		protected

			// TODO: remove for 2.0, and make subclasses override _onLeftArrow, _onRightArrow etc. instead.

			var keyCodes = (this._keyNavCodes = {});
			var prev = lang.hitch(this, "focusPrev");
			var next = lang.hitch(this, "focusNext");
			array.forEach(prevKeyCodes, function(code){
				keyCodes[code] = prev;
			});
			array.forEach(nextKeyCodes, function(code){
				keyCodes[code] = next;
			});
			keyCodes[keys.HOME] = lang.hitch(this, "focusFirstChild");
			keyCodes[keys.END] = lang.hitch(this, "focusLastChild");
		},

		startupKeyNavChildren: function(){
			kernel.deprecated("startupKeyNavChildren() call no longer needed", "", "2.0");
		},

		startup: function(){
			this.inherited(arguments);
			array.forEach(this.getChildren(), lang.hitch(this, "_startupChild"));
		},

		addChild: function(/*dijit/_WidgetBase*/ widget, /*int?*/ insertIndex){
			this.inherited(arguments);
			this._startupChild(widget);
		},

		_startupChild: function(/*dijit/_WidgetBase*/ widget){
			// summary:
			//		Setup for each child widget.
			// description:
			//		Sets tabIndex=-1 on each child, so that the tab key will
			//		leave the container rather than visiting each child.
			//
			//		Note: if you add children by a different method than addChild(), then need to call this manually
			//		or at least make sure the child's tabIndex is -1.
			//
			//		Note: see also _LayoutWidget.setupChild(), which is also called for each child widget.
			// tags:
			//		private

			widget.set("tabIndex", "-1");
		},

		_getFirst: function(){
			// summary:
			//		Returns the first child.
			// tags:
			//		abstract extension
			var children = this.getChildren();
			return children.length ? children[0] : null;
		},

		_getLast: function(){
			// summary:
			//		Returns the last descendant.
			// tags:
			//		abstract extension
			var children = this.getChildren();
			return children.length ? children[children.length - 1] : null;
		},

		focusNext: function(){
			// summary:
			//		Focus the next widget
			// tags:
			//		protected
			this.focusChild(this._getNextFocusableChild(this.focusedChild, 1));
		},

		focusPrev: function(){
			// summary:
			//		Focus the last focusable node in the previous widget
			//		(ex: go to the ComboButton icon section rather than button section)
			// tags:
			//		protected
			this.focusChild(this._getNextFocusableChild(this.focusedChild, -1), true);
		},

		childSelector: function(/*DOMNode*/ node){
			// Implement _KeyNavMixin.childSelector, to identify focusable child nodes.
			// If we allowed a dojo/query dependency from this module this could more simply be a string "> *"
			// instead of this function.

			var node = registry.byNode(node);
			return node && node.getParent() == this;
		}
	});
});

},
'dojo/dnd/autoscroll':function(){
define(["../_base/lang", "../sniff", "../_base/window", "../dom-geometry", "../dom-style", "../window"],
	function(lang, has, win, domGeom, domStyle, winUtils){

// module:
//		dojo/dnd/autoscroll

var exports = {
	// summary:
	//		Used by dojo/dnd/Manager to scroll document or internal node when the user
	//		drags near the edge of the viewport or a scrollable node
};
lang.setObject("dojo.dnd.autoscroll", exports);

exports.getViewport = winUtils.getBox;

exports.V_TRIGGER_AUTOSCROLL = 32;
exports.H_TRIGGER_AUTOSCROLL = 32;

exports.V_AUTOSCROLL_VALUE = 16;
exports.H_AUTOSCROLL_VALUE = 16;

// These are set by autoScrollStart().
// Set to default values in case autoScrollStart() isn't called. (back-compat, remove for 2.0)
var viewport,
	doc = win.doc,
	maxScrollTop = Infinity,
	maxScrollLeft = Infinity;

exports.autoScrollStart = function(d){
	// summary:
	//		Called at the start of a drag.
	// d: Document
	//		The document of the node being dragged.

	doc = d;
	viewport = winUtils.getBox(doc);

	// Save height/width of document at start of drag, before it gets distorted by a user dragging an avatar past
	// the document's edge
	var html = win.body(doc).parentNode;
	maxScrollTop = Math.max(html.scrollHeight - viewport.h, 0);
	maxScrollLeft = Math.max(html.scrollWidth - viewport.w, 0);	// usually 0
};

exports.autoScroll = function(e){
	// summary:
	//		a handler for mousemove and touchmove events, which scrolls the window, if
	//		necessary
	// e: Event
	//		mousemove/touchmove event

	// FIXME: needs more docs!
	var v = viewport || winUtils.getBox(doc), // getBox() call for back-compat, in case autoScrollStart() wasn't called
		html = win.body(doc).parentNode,
		dx = 0, dy = 0;
	if(e.clientX < exports.H_TRIGGER_AUTOSCROLL){
		dx = -exports.H_AUTOSCROLL_VALUE;
	}else if(e.clientX > v.w - exports.H_TRIGGER_AUTOSCROLL){
		dx = Math.min(exports.H_AUTOSCROLL_VALUE, maxScrollLeft - html.scrollLeft);	// don't scroll past edge of doc
	}
	if(e.clientY < exports.V_TRIGGER_AUTOSCROLL){
		dy = -exports.V_AUTOSCROLL_VALUE;
	}else if(e.clientY > v.h - exports.V_TRIGGER_AUTOSCROLL){
		dy = Math.min(exports.V_AUTOSCROLL_VALUE, maxScrollTop - html.scrollTop);	// don't scroll past edge of doc
	}
	window.scrollBy(dx, dy);
};

exports._validNodes = {"div": 1, "p": 1, "td": 1};
exports._validOverflow = {"auto": 1, "scroll": 1};

exports.autoScrollNodes = function(e){
	// summary:
	//		a handler for mousemove and touchmove events, which scrolls the first available
	//		Dom element, it falls back to exports.autoScroll()
	// e: Event
	//		mousemove/touchmove event

	// FIXME: needs more docs!

	var b, t, w, h, rx, ry, dx = 0, dy = 0, oldLeft, oldTop;

	for(var n = e.target; n;){
		if(n.nodeType == 1 && (n.tagName.toLowerCase() in exports._validNodes)){
			var s = domStyle.getComputedStyle(n),
				overflow = (s.overflow.toLowerCase() in exports._validOverflow),
				overflowX = (s.overflowX.toLowerCase() in exports._validOverflow),
				overflowY = (s.overflowY.toLowerCase() in exports._validOverflow);
			if(overflow || overflowX || overflowY){
				b = domGeom.getContentBox(n, s);
				t = domGeom.position(n, true);
			}
			// overflow-x
			if(overflow || overflowX){
				w = Math.min(exports.H_TRIGGER_AUTOSCROLL, b.w / 2);
				rx = e.pageX - t.x;
				if(has("webkit") || has("opera")){
					// FIXME: this code should not be here, it should be taken into account
					// either by the event fixing code, or the domGeom.position()
					// FIXME: this code doesn't work on Opera 9.5 Beta
					rx += win.body().scrollLeft;
				}
				dx = 0;
				if(rx > 0 && rx < b.w){
					if(rx < w){
						dx = -w;
					}else if(rx > b.w - w){
						dx = w;
					}
					oldLeft = n.scrollLeft;
					n.scrollLeft = n.scrollLeft + dx;
				}
			}
			// overflow-y
			if(overflow || overflowY){
				//console.log(b.l, b.t, t.x, t.y, n.scrollLeft, n.scrollTop);
				h = Math.min(exports.V_TRIGGER_AUTOSCROLL, b.h / 2);
				ry = e.pageY - t.y;
				if(has("webkit") || has("opera")){
					// FIXME: this code should not be here, it should be taken into account
					// either by the event fixing code, or the domGeom.position()
					// FIXME: this code doesn't work on Opera 9.5 Beta
					ry += win.body().scrollTop;
				}
				dy = 0;
				if(ry > 0 && ry < b.h){
					if(ry < h){
						dy = -h;
					}else if(ry > b.h - h){
						dy = h;
					}
					oldTop = n.scrollTop;
					n.scrollTop  = n.scrollTop  + dy;
				}
			}
			if(dx || dy){ return; }
		}
		try{
			n = n.parentNode;
		}catch(x){
			n = null;
		}
	}
	exports.autoScroll(e);
};

return exports;

});

},
'dijit/_KeyNavMixin':function(){
define([
	"dojo/_base/array", // array.forEach
	"dojo/_base/declare", // declare
	"dojo/dom-attr", // domAttr.set
	"dojo/keys", // keys.END keys.HOME, keys.LEFT_ARROW etc.
	"dojo/_base/lang", // lang.hitch
	"dojo/on",
	"dijit/registry",
	"dijit/_FocusMixin"        // to make _onBlur() work
], function(array, declare, domAttr, keys, lang, on, registry, _FocusMixin){

	// module:
	//		dijit/_KeyNavMixin

	return declare("dijit._KeyNavMixin", _FocusMixin, {
		// summary:
		//		A mixin to allow arrow key and letter key navigation of child or descendant widgets.
		//		It can be used by dijit/_Container based widgets with a flat list of children,
		//		or more complex widgets like dijit/Tree.
		//
		//		To use this mixin, the subclass must:
		//
		//			- Implement  _getNext(), _getFirst(), _getLast(), _onLeftArrow(), _onRightArrow()
		//			  _onDownArrow(), _onUpArrow() methods to handle home/end/left/right/up/down keystrokes.
		//			  Next and previous in this context refer to a linear ordering of the descendants used
		//			  by letter key search.
		//			- Set all descendants' initial tabIndex to "-1"; both initial descendants and any
		//			  descendants added later, by for example addChild()
		//			- Define childSelector to a function or string that identifies focusable descendant widgets
		//
		//		Also, child widgets must implement a focus() method.

		/*=====
		 // focusedChild: [protected readonly] Widget
		 //		The currently focused child widget, or null if there isn't one
		 focusedChild: null,

		 // _keyNavCodes: Object
		 //		Hash mapping key code (arrow keys and home/end key) to functions to handle those keys.
		 //		Usually not used directly, as subclasses can instead override _onLeftArrow() etc.
		 _keyNavCodes: {},
		 =====*/

		// tabIndex: String
		//		Tab index of the container; same as HTML tabIndex attribute.
		//		Note then when user tabs into the container, focus is immediately
		//		moved to the first item in the container.
		tabIndex: "0",

		// childSelector: [protected abstract] Function||String
		//		Selector (passed to on.selector()) used to identify what to treat as a child widget.   Used to monitor
		//		focus events and set this.focusedChild.   Must be set by implementing class.   If this is a string
		//		(ex: "> *") then the implementing class must require dojo/query.
		childSelector: null,

		postCreate: function(){
			this.inherited(arguments);

			// Set tabIndex on this.domNode.  Will be automatic after #7381 is fixed.
			domAttr.set(this.domNode, "tabIndex", this.tabIndex);

			if(!this._keyNavCodes){
				var keyCodes = this._keyNavCodes = {};
				keyCodes[keys.HOME] = lang.hitch(this, "focusFirstChild");
				keyCodes[keys.END] = lang.hitch(this, "focusLastChild");
				keyCodes[this.isLeftToRight() ? keys.LEFT_ARROW : keys.RIGHT_ARROW] = lang.hitch(this, "_onLeftArrow");
				keyCodes[this.isLeftToRight() ? keys.RIGHT_ARROW : keys.LEFT_ARROW] = lang.hitch(this, "_onRightArrow");
				keyCodes[keys.UP_ARROW] = lang.hitch(this, "_onUpArrow");
				keyCodes[keys.DOWN_ARROW] = lang.hitch(this, "_onDownArrow");
			}

			var self = this,
				childSelector = typeof this.childSelector == "string"
					? this.childSelector
					: lang.hitch(this, "childSelector");
			this.own(
				on(this.domNode, "keypress", lang.hitch(this, "_onContainerKeypress")),
				on(this.domNode, "keydown", lang.hitch(this, "_onContainerKeydown")),
				on(this.domNode, "focus", lang.hitch(this, "_onContainerFocus")),
				on(this.containerNode, on.selector(childSelector, "focusin"), function(evt){
					self._onChildFocus(registry.getEnclosingWidget(this), evt);
				})
			);
		},

		_onLeftArrow: function(){
			// summary:
			//		Called on left arrow key, or right arrow key if widget is in RTL mode.
			//		Should go back to the previous child in horizontal container widgets like Toolbar.
			// tags:
			//		extension
		},

		_onRightArrow: function(){
			// summary:
			//		Called on right arrow key, or left arrow key if widget is in RTL mode.
			//		Should go to the next child in horizontal container widgets like Toolbar.
			// tags:
			//		extension
		},

		_onUpArrow: function(){
			// summary:
			//		Called on up arrow key. Should go to the previous child in vertical container widgets like Menu.
			// tags:
			//		extension
		},

		_onDownArrow: function(){
			// summary:
			//		Called on down arrow key. Should go to the next child in vertical container widgets like Menu.
			// tags:
			//		extension
		},

		focus: function(){
			// summary:
			//		Default focus() implementation: focus the first child.
			this.focusFirstChild();
		},

		_getFirstFocusableChild: function(){
			// summary:
			//		Returns first child that can be focused.

			// Leverage _getNextFocusableChild() to skip disabled children
			return this._getNextFocusableChild(null, 1);	// dijit/_WidgetBase
		},

		_getLastFocusableChild: function(){
			// summary:
			//		Returns last child that can be focused.

			// Leverage _getNextFocusableChild() to skip disabled children
			return this._getNextFocusableChild(null, -1);	// dijit/_WidgetBase
		},

		focusFirstChild: function(){
			// summary:
			//		Focus the first focusable child in the container.
			// tags:
			//		protected

			this.focusChild(this._getFirstFocusableChild());
		},

		focusLastChild: function(){
			// summary:
			//		Focus the last focusable child in the container.
			// tags:
			//		protected

			this.focusChild(this._getLastFocusableChild());
		},

		focusChild: function(/*dijit/_WidgetBase*/ widget, /*Boolean*/ last){
			// summary:
			//		Focus specified child widget.
			// widget:
			//		Reference to container's child widget
			// last:
			//		If true and if widget has multiple focusable nodes, focus the
			//		last one instead of the first one
			// tags:
			//		protected

			if(!widget){
				return;
			}

			if(this.focusedChild && widget !== this.focusedChild){
				this._onChildBlur(this.focusedChild);	// used to be used by _MenuBase
			}
			widget.set("tabIndex", this.tabIndex);	// for IE focus outline to appear, must set tabIndex before focus
			widget.focus(last ? "end" : "start");

			// Don't set focusedChild here, because the focus event should trigger a call to _onChildFocus(), which will
			// set it.   More importantly, _onChildFocus(), which may be executed asynchronously (after this function
			// returns) needs to know the old focusedChild to set its tabIndex to -1.
		},

		_onContainerFocus: function(evt){
			// summary:
			//		Handler for when the container itself gets focus.
			// description:
			//		Initially the container itself has a tabIndex, but when it gets
			//		focus, switch focus to first child...
			// tags:
			//		private

			// Note that we can't use _onFocus() because switching focus from the
			// _onFocus() handler confuses the focus.js code
			// (because it causes _onFocusNode() to be called recursively).
			// Also, _onFocus() would fire when focus went directly to a child widget due to mouse click.

			// Ignore spurious focus events:
			//	1. focus on a child widget bubbles on FF
			//	2. on IE, clicking the scrollbar of a select dropdown moves focus from the focused child item to me
			if(evt.target !== this.domNode || this.focusedChild){
				return;
			}

			this.focus();
		},

		_onFocus: function(){
			// When the container gets focus by being tabbed into, or a descendant gets focus by being clicked,
			// set the container's tabIndex to -1 (don't remove as that breaks Safari 4) so that tab or shift-tab
			// will go to the fields after/before the container, rather than the container itself
			domAttr.set(this.domNode, "tabIndex", "-1");

			this.inherited(arguments);
		},

		_onBlur: function(evt){
			// When focus is moved away the container, and its descendant (popup) widgets,
			// then restore the container's tabIndex so that user can tab to it again.
			// Note that using _onBlur() so that this doesn't happen when focus is shifted
			// to one of my child widgets (typically a popup)

			// TODO: for 2.0 consider changing this to blur whenever the container blurs, to be truthful that there is
			// no focused child at that time.

			domAttr.set(this.domNode, "tabIndex", this.tabIndex);
			if(this.focusedChild){
				this.focusedChild.set("tabIndex", "-1");
				this.lastFocusedChild = this.focusedChild;
				this._set("focusedChild", null);
			}
			this.inherited(arguments);
		},

		_onChildFocus: function(/*dijit/_WidgetBase*/ child){
			// summary:
			//		Called when a child widget gets focus, either by user clicking
			//		it, or programatically by arrow key handling code.
			// description:
			//		It marks that the current node is the selected one, and the previously
			//		selected node no longer is.

			if(child && child != this.focusedChild){
				if(this.focusedChild && !this.focusedChild._destroyed){
					// mark that the previously focusable node is no longer focusable
					this.focusedChild.set("tabIndex", "-1");
				}

				// mark that the new node is the currently selected one
				child.set("tabIndex", this.tabIndex);
				this.lastFocused = child;		// back-compat for Tree, remove for 2.0
				this._set("focusedChild", child);
			}
		},

		_searchString: "",
		// multiCharSearchDuration: Number
		//		If multiple characters are typed where each keystroke happens within
		//		multiCharSearchDuration of the previous keystroke,
		//		search for nodes matching all the keystrokes.
		//
		//		For example, typing "ab" will search for entries starting with
		//		"ab" unless the delay between "a" and "b" is greater than multiCharSearchDuration.
		multiCharSearchDuration: 1000,

		onKeyboardSearch: function(/*dijit/_WidgetBase*/ item, /*Event*/ evt, /*String*/ searchString, /*Number*/ numMatches){
			// summary:
			//		When a key is pressed that matches a child item,
			//		this method is called so that a widget can take appropriate action is necessary.
			// tags:
			//		protected
			if(item){
				this.focusChild(item);
			}
		},

		_keyboardSearchCompare: function(/*dijit/_WidgetBase*/ item, /*String*/ searchString){
			// summary:
			//		Compares the searchString to the widget's text label, returning:
			//
			//			* -1: a high priority match  and stop searching
			//		 	* 0: not a match
			//		 	* 1: a match but keep looking for a higher priority match
			// tags:
			//		private

			var element = item.domNode,
				text = item.label || (element.focusNode ? element.focusNode.label : '') || element.innerText || element.textContent || "",
				currentString = text.replace(/^\s+/, '').substr(0, searchString.length).toLowerCase();

			return (!!searchString.length && currentString == searchString) ? -1 : 0; // stop searching after first match by default
		},

		_onContainerKeydown: function(evt){
			// summary:
			//		When a key is pressed, if it's an arrow key etc. then it's handled here.
			// tags:
			//		private

			var func = this._keyNavCodes[evt.keyCode];
			if(func){
				func(evt, this.focusedChild);
				evt.stopPropagation();
				evt.preventDefault();
				this._searchString = ''; // so a DOWN_ARROW b doesn't search for ab
			}else if(evt.keyCode == keys.SPACE && this._searchTimer && !(evt.ctrlKey || evt.altKey || evt.metaKey)){
				evt.stopImmediatePropagation(); // stop a11yclick and _HasDropdown from seeing SPACE if we're doing keyboard searching
				evt.preventDefault(); // stop IE from scrolling, and most browsers (except FF) from sending keypress
				this._keyboardSearch(evt, ' ');
			}
		},

		_onContainerKeypress: function(evt){
			// summary:
			//		When a printable key is pressed, it's handled here, searching by letter.
			// tags:
			//		private

			if(evt.charCode < keys.SPACE || evt.ctrlKey || evt.altKey || evt.metaKey ||
					(evt.charCode == keys.SPACE && this._searchTimer)){
				// Avoid duplicate events on firefox (ex: arrow key that will be handled by keydown handler),
				// and also control sequences like CMD-Q
				return;
			}
			evt.preventDefault();
			evt.stopPropagation();

			this._keyboardSearch(evt, String.fromCharCode(evt.charCode).toLowerCase());
		},

		_keyboardSearch: function(/*Event*/ evt, /*String*/ keyChar){
			// summary:
			//		Perform a search of the widget's options based on the user's keyboard activity
			// description:
			//		Called on keypress (and sometimes keydown), searches through this widget's children
			//		looking for items that match the user's typed search string.  Multiple characters
			//		typed within 1 sec of each other are combined for multicharacter searching.
			// tags:
			//		private
			var
				matchedItem = null,
				searchString,
				numMatches = 0,
				search = lang.hitch(this, function(){
					if(this._searchTimer){
						this._searchTimer.remove();
					}
					this._searchString += keyChar;
					var allSameLetter = /^(.)\1*$/.test(this._searchString);
					var searchLen = allSameLetter ? 1 : this._searchString.length;
					searchString = this._searchString.substr(0, searchLen);
					// commented out code block to search again if the multichar search fails after a smaller timeout
					//this._searchTimer = this.defer(function(){ // this is the "failure" timeout
					//	this._typingSlowly = true; // if the search fails, then treat as a full timeout
					//	this._searchTimer = this.defer(function(){ // this is the "success" timeout
					//		this._searchTimer = null;
					//		this._searchString = '';
					//	}, this.multiCharSearchDuration >> 1);
					//}, this.multiCharSearchDuration >> 1);
					this._searchTimer = this.defer(function(){ // this is the "success" timeout
						this._searchTimer = null;
						this._searchString = '';
					}, this.multiCharSearchDuration);
					var currentItem = this.focusedChild || null;
					if(searchLen == 1 || !currentItem){
						currentItem = this._getNextFocusableChild(currentItem, 1); // skip current
						if(!currentItem){
							return;
						} // no items
					}
					var stop = currentItem;
					do{
						var rc = this._keyboardSearchCompare(currentItem, searchString);
						if(!!rc && numMatches++ == 0){
							matchedItem = currentItem;
						}
						if(rc == -1){ // priority match
							numMatches = -1;
							break;
						}
						currentItem = this._getNextFocusableChild(currentItem, 1);
					}while(currentItem != stop);
					// commented out code block to search again if the multichar search fails after a smaller timeout
					//if(!numMatches && (this._typingSlowly || searchLen == 1)){
					//	this._searchString = '';
					//	if(searchLen > 1){
					//		// if no matches and they're typing slowly, then go back to first letter searching
					//		search();
					//	}
					//}
				});

			search();
			// commented out code block to search again if the multichar search fails after a smaller timeout
			//this._typingSlowly = false;
			this.onKeyboardSearch(matchedItem, evt, searchString, numMatches);
		},

		_onChildBlur: function(/*dijit/_WidgetBase*/ /*===== widget =====*/){
			// summary:
			//		Called when focus leaves a child widget to go
			//		to a sibling widget.
			//		Used to be used by MenuBase.js (remove for 2.0)
			// tags:
			//		protected
		},

		_getNextFocusableChild: function(child, dir){
			// summary:
			//		Returns the next or previous focusable descendant, compared to "child".
			//		Implements and extends _KeyNavMixin._getNextFocusableChild() for a _Container.
			// child: Widget
			//		The current widget
			// dir: Integer
			//		- 1 = after
			//		- -1 = before
			// tags:
			//		abstract extension

			var wrappedValue = child;
			do{
				if(!child){
					child = this[dir > 0 ? "_getFirst" : "_getLast"]();
					if(!child){ break; }
				}else{
					child = this._getNext(child, dir);
				}
				if(child != null && child != wrappedValue && child.isFocusable()){
					return child;	// dijit/_WidgetBase
				}
			}while(child != wrappedValue);
			// no focusable child found
			return null;	// dijit/_WidgetBase
		},

		_getFirst: function(){
			// summary:
			//		Returns the first child.
			// tags:
			//		abstract extension

			return null;	// dijit/_WidgetBase
		},

		_getLast: function(){
			// summary:
			//		Returns the last descendant.
			// tags:
			//		abstract extension

			return null;	// dijit/_WidgetBase
		},

		_getNext: function(child, dir){
			// summary:
			//		Returns the next descendant, compared to "child".
			// child: Widget
			//		The current widget
			// dir: Integer
			//		- 1 = after
			//		- -1 = before
			// tags:
			//		abstract extension

			if(child){
				child = child.domNode;
				while(child){
					child = child[dir < 0 ? "previousSibling" : "nextSibling"];
					if(child  && "getAttribute" in child){
						var w = registry.byNode(child);
						if(w){
							return w; // dijit/_WidgetBase
						}
					}
				}
			}
			return null;	// dijit/_WidgetBase
		}
	});
});

},
'dijit/registry':function(){
define([
	"dojo/_base/array", // array.forEach array.map
	"dojo/sniff", // has("ie")
	"dojo/_base/window", // win.body
	"./main"	// dijit._scopeName
], function(array, has, win, dijit){

	// module:
	//		dijit/registry

	var _widgetTypeCtr = {}, hash = {};

	var registry =  {
		// summary:
		//		Registry of existing widget on page, plus some utility methods.

		// length: Number
		//		Number of registered widgets
		length: 0,

		add: function(widget){
			// summary:
			//		Add a widget to the registry. If a duplicate ID is detected, a error is thrown.
			// widget: dijit/_WidgetBase
			//		Any dijit/_WidgetBase subclass.
			if(hash[widget.id]){
				throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
			}
			hash[widget.id] = widget;
			this.length++;
		},

		remove: function(/*String*/ id){
			// summary:
			//		Remove a widget from the registry. Does not destroy the widget; simply
			//		removes the reference.
			if(hash[id]){
				delete hash[id];
				this.length--;
			}
		},

		byId: function(/*String|Widget*/ id){
			// summary:
			//		Find a widget by it's id.
			//		If passed a widget then just returns the widget.
			return typeof id == "string" ? hash[id] : id;	// dijit/_WidgetBase
		},

		byNode: function(/*DOMNode*/ node){
			// summary:
			//		Returns the widget corresponding to the given DOMNode
			return hash[node.getAttribute("widgetId")]; // dijit/_WidgetBase
		},

		toArray: function(){
			// summary:
			//		Convert registry into a true Array
			//
			// example:
			//		Work with the widget .domNodes in a real Array
			//		|	array.map(registry.toArray(), function(w){ return w.domNode; });

			var ar = [];
			for(var id in hash){
				ar.push(hash[id]);
			}
			return ar;	// dijit/_WidgetBase[]
		},

		getUniqueId: function(/*String*/widgetType){
			// summary:
			//		Generates a unique id for a given widgetType

			var id;
			do{
				id = widgetType + "_" +
					(widgetType in _widgetTypeCtr ?
						++_widgetTypeCtr[widgetType] : _widgetTypeCtr[widgetType] = 0);
			}while(hash[id]);
			return dijit._scopeName == "dijit" ? id : dijit._scopeName + "_" + id; // String
		},

		findWidgets: function(root, skipNode){
			// summary:
			//		Search subtree under root returning widgets found.
			//		Doesn't search for nested widgets (ie, widgets inside other widgets).
			// root: DOMNode
			//		Node to search under.
			// skipNode: DOMNode
			//		If specified, don't search beneath this node (usually containerNode).

			var outAry = [];

			function getChildrenHelper(root){
				for(var node = root.firstChild; node; node = node.nextSibling){
					if(node.nodeType == 1){
						var widgetId = node.getAttribute("widgetId");
						if(widgetId){
							var widget = hash[widgetId];
							if(widget){	// may be null on page w/multiple dojo's loaded
								outAry.push(widget);
							}
						}else if(node !== skipNode){
							getChildrenHelper(node);
						}
					}
				}
			}

			getChildrenHelper(root);
			return outAry;
		},

		_destroyAll: function(){
			// summary:
			//		Code to destroy all widgets and do other cleanup on page unload

			// Clean up focus manager lingering references to widgets and nodes
			dijit._curFocus = null;
			dijit._prevFocus = null;
			dijit._activeStack = [];

			// Destroy all the widgets, top down
			array.forEach(registry.findWidgets(win.body()), function(widget){
				// Avoid double destroy of widgets like Menu that are attached to <body>
				// even though they are logically children of other widgets.
				if(!widget._destroyed){
					if(widget.destroyRecursive){
						widget.destroyRecursive();
					}else if(widget.destroy){
						widget.destroy();
					}
				}
			});
		},

		getEnclosingWidget: function(/*DOMNode*/ node){
			// summary:
			//		Returns the widget whose DOM tree contains the specified DOMNode, or null if
			//		the node is not contained within the DOM tree of any widget
			while(node){
				var id = node.nodeType == 1 && node.getAttribute("widgetId");
				if(id){
					return hash[id];
				}
				node = node.parentNode;
			}
			return null;
		},

		// In case someone needs to access hash.
		// Actually, this is accessed from WidgetSet back-compatibility code
		_hash: hash
	};

	dijit.registry = registry;

	return registry;
});

},
'dijit/Destroyable':function(){
define([
	"dojo/_base/array", // array.forEach array.map
	"dojo/aspect",
	"dojo/_base/declare"
], function(array, aspect, declare){

	// module:
	//		dijit/Destroyable

	return declare("dijit.Destroyable", null, {
		// summary:
		//		Mixin to track handles and release them when instance is destroyed.
		// description:
		//		Call this.own(...) on list of handles (returned from dojo/aspect, dojo/on,
		//		dojo/Stateful::watch, or any class (including widgets) with a destroyRecursive() or destroy() method.
		//		Then call destroy() later to destroy this instance and release the resources.

		destroy: function(/*Boolean*/ preserveDom){
			// summary:
			//		Destroy this class, releasing any resources registered via own().
			this._destroyed = true;
		},

		own: function(){
			// summary:
			//		Track specified handles and remove/destroy them when this instance is destroyed, unless they were
			//		already removed/destroyed manually.
			// tags:
			//		protected
			// returns:
			//		The array of specified handles, so you can do for example:
			//	|		var handle = this.own(on(...))[0];

			array.forEach(arguments, function(handle){
				var destroyMethodName =
					"destroyRecursive" in handle ? "destroyRecursive" : // remove "destroyRecursive" for 2.0
						"destroy" in handle ? "destroy" :
							"remove";

				// When this.destroy() is called, destroy handle.  Since I'm using aspect.before(),
				// the handle will be destroyed before a subclass's destroy() method starts running, before it calls
				// this.inherited() or even if it doesn't call this.inherited() at all.  If that's an issue, make an
				// onDestroy() method and connect to that instead.
				var odh = aspect.before(this, "destroy", function(preserveDom){
					handle[destroyMethodName](preserveDom);
				});

				// If handle is destroyed manually before this.destroy() is called, remove the listener set directly above.
				var hdh = aspect.after(handle, destroyMethodName, function(){
					odh.remove();
					hdh.remove();
				}, true);
			}, this);

			return arguments;		// handle
		}
	});
});

},
'dijit/_base/manager':function(){
define([
	"dojo/_base/array",
	"dojo/_base/config", // defaultDuration
	"dojo/_base/lang",
	"../registry",
	"../main"	// for setting exports to dijit namespace
], function(array, config, lang, registry, dijit){

	// module:
	//		dijit/_base/manager

	var exports = {
		// summary:
		//		Deprecated.  Shim to methods on registry, plus a few other declarations.
		//		New code should access dijit/registry directly when possible.
	};

	array.forEach(["byId", "getUniqueId", "findWidgets", "_destroyAll", "byNode", "getEnclosingWidget"], function(name){
		exports[name] = registry[name];
	});

	 lang.mixin(exports, {
		 // defaultDuration: Integer
		 //		The default fx.animation speed (in ms) to use for all Dijit
		 //		transitional fx.animations, unless otherwise specified
		 //		on a per-instance basis. Defaults to 200, overrided by
		 //		`djConfig.defaultDuration`
		 defaultDuration: config["defaultDuration"] || 200
	 });

	lang.mixin(dijit, exports);

	/*===== return exports; =====*/
	return dijit;	// for back compat :-(
});

},
'dijit/form/_ListMouseMixin':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/on",
	"dojo/touch",
	"./_ListBase"
], function(declare, on, touch, _ListBase){

	// module:
	//		dijit/form/_ListMouseMixin

	return declare("dijit.form._ListMouseMixin", _ListBase, {
		// summary:
		//		A mixin to handle mouse or touch events for a focus-less menu
		//		Abstract methods that must be defined externally:
		//
		//		- onClick: item was chosen (mousedown somewhere on the menu and mouseup somewhere on the menu)
		// tags:
		//		private

		postCreate: function(){
			this.inherited(arguments);

			// Add flag to use normalized click handling from dojo/touch
			this.domNode.dojoClick = true;

			this.own(on(this.domNode, "mousedown", function(evt){
				evt.preventDefault();
			})); // prevent focus shift on list scrollbar press
			this._listConnect("click", "_onClick");
			this._listConnect(touch.press, "_onMouseDown");
			this._listConnect(touch.release, "_onMouseUp");
			this._listConnect(touch.over, "_onMouseOver");
			this._listConnect(touch.out, "_onMouseOut");
		},

		_onClick: function(/*Event*/ evt, /*DomNode*/ target){
			this._setSelectedAttr(target);
			if(this._deferredClick){
				this._deferredClick.remove();
			}
			this._deferredClick = this.defer(function(){
				this._deferredClick = null;
				this.onClick(target);
			});
		},

		_onMouseDown: function(/*Event*/ evt, /*DomNode*/ target){
			if(this._hoveredNode){
				this.onUnhover(this._hoveredNode);
				this._hoveredNode = null;
			}
			this._isDragging = true;
			this._setSelectedAttr(target);
		},

		_onMouseUp: function(/*Event*/ evt, /*DomNode*/ target){
			this._isDragging = false;
			var selectedNode = this.selected;
			var hoveredNode = this._hoveredNode;
			if(selectedNode && target == selectedNode){
				this.defer(function(){
					this._onClick(evt, selectedNode);
				});
			}else if(hoveredNode){ // drag to select
				this.defer(function(){
					this._onClick(evt, hoveredNode);
				});
			}
		},

		_onMouseOut: function(/*Event*/ evt, /*DomNode*/ target){
			if(this._hoveredNode){
				this.onUnhover(this._hoveredNode);
				this._hoveredNode = null;
			}
			if(this._isDragging){
				this._cancelDrag = (new Date()).getTime() + 1000; // cancel in 1 second if no _onMouseOver fires
			}
		},

		_onMouseOver: function(/*Event*/ evt, /*DomNode*/ target){
			if(this._cancelDrag){
				var time = (new Date()).getTime();
				if(time > this._cancelDrag){
					this._isDragging = false;
				}
				this._cancelDrag = null;
			}
			this._hoveredNode = target;
			this.onHover(target);
			if(this._isDragging){
				this._setSelectedAttr(target);
			}
		}
	});
});

},
'dijit/_editor/RichText':function(){
define([
	"dojo/_base/array", // array.forEach array.indexOf array.some
	"dojo/_base/config", // config
	"dojo/_base/declare", // declare
	"dojo/_base/Deferred", // Deferred
	"dojo/dom", // dom.byId
	"dojo/dom-attr", // domAttr.set or get
	"dojo/dom-class", // domClass.add domClass.remove
	"dojo/dom-construct", // domConstruct.create domConstruct.destroy domConstruct.place
	"dojo/dom-geometry", // domGeometry.position
	"dojo/dom-style", // domStyle.getComputedStyle domStyle.set
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/keys", // keys.BACKSPACE keys.TAB
	"dojo/_base/lang", // lang.clone lang.hitch lang.isArray lang.isFunction lang.isString lang.trim
	"dojo/on", // on()
	"dojo/query", // query
	"dojo/domReady",
	"dojo/sniff", // has("ie") has("mozilla") has("opera") has("safari") has("webkit")
	"dojo/topic", // topic.publish() (publish)
	"dojo/_base/unload", // unload
	"dojo/_base/url", // url
	"dojo/window", // winUtils.get()
	"../_Widget",
	"../_CssStateMixin",
	"../selection",
	"./range",
	"./html",
	"../focus",
	"../main"    // dijit._scopeName
], function(array, config, declare, Deferred, dom, domAttr, domClass, domConstruct, domGeometry, domStyle,
			kernel, keys, lang, on, query, domReady, has, topic, unload, _Url, winUtils,
			_Widget, _CssStateMixin, selectionapi, rangeapi, htmlapi, focus, dijit){

	// module:
	//		dijit/_editor/RichText

	// If you want to allow for rich text saving with back/forward actions, you must add a text area to your page with
	// the id==dijit._scopeName + "._editor.RichText.value" (typically "dijit/_editor/RichText.value). For example,
	// something like this will work:
	//
	//	<textarea id="dijit._editor.RichText.value" style="display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;"></textarea>

	var RichText = declare("dijit._editor.RichText", [_Widget, _CssStateMixin], {
		// summary:
		//		dijit/_editor/RichText is the core of dijit.Editor, which provides basic
		//		WYSIWYG editing features.
		//
		// description:
		//		dijit/_editor/RichText is the core of dijit.Editor, which provides basic
		//		WYSIWYG editing features. It also encapsulates the differences
		//		of different js engines for various browsers.  Do not use this widget
		//		with an HTML &lt;TEXTAREA&gt; tag, since the browser unescapes XML escape characters,
		//		like &lt;.  This can have unexpected behavior and lead to security issues
		//		such as scripting attacks.
		//
		// tags:
		//		private

		constructor: function(params /*===== , srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Initial settings for any of the widget attributes, except readonly attributes.
			// srcNodeRef: DOMNode
			//		The widget replaces the specified DOMNode.

			// contentPreFilters: Function(String)[]
			//		Pre content filter function register array.
			//		these filters will be executed before the actual
			//		editing area gets the html content.
			this.contentPreFilters = [];

			// contentPostFilters: Function(String)[]
			//		post content filter function register array.
			//		These will be used on the resulting html
			//		from contentDomPostFilters. The resulting
			//		content is the final html (returned by getValue()).
			this.contentPostFilters = [];

			// contentDomPreFilters: Function(DomNode)[]
			//		Pre content dom filter function register array.
			//		These filters are applied after the result from
			//		contentPreFilters are set to the editing area.
			this.contentDomPreFilters = [];

			// contentDomPostFilters: Function(DomNode)[]
			//		Post content dom filter function register array.
			//		These filters are executed on the editing area dom.
			//		The result from these will be passed to contentPostFilters.
			this.contentDomPostFilters = [];

			// editingAreaStyleSheets: dojo._URL[]
			//		array to store all the stylesheets applied to the editing area
			this.editingAreaStyleSheets = [];

			// Make a copy of this.events before we start writing into it, otherwise we
			// will modify the prototype which leads to bad things on pages w/multiple editors
			this.events = [].concat(this.events);

			this._keyHandlers = {};

			if(params && lang.isString(params.value)){
				this.value = params.value;
			}

			this.onLoadDeferred = new Deferred();
		},

		baseClass: "dijitEditor",

		// inheritWidth: Boolean
		//		whether to inherit the parent's width or simply use 100%
		inheritWidth: false,

		// focusOnLoad: [deprecated] Boolean
		//		Focus into this widget when the page is loaded
		focusOnLoad: false,

		// name: String?
		//		Specifies the name of a (hidden) `<textarea>` node on the page that's used to save
		//		the editor content on page leave.   Used to restore editor contents after navigating
		//		to a new page and then hitting the back button.
		name: "",

		// styleSheets: [const] String
		//		semicolon (";") separated list of css files for the editing area
		styleSheets: "",

		// height: String
		//		Set height to fix the editor at a specific height, with scrolling.
		//		By default, this is 300px.  If you want to have the editor always
		//		resizes to accommodate the content, use AlwaysShowToolbar plugin
		//		and set height="".  If this editor is used within a layout widget,
		//		set height="100%".
		height: "300px",

		// minHeight: String
		//		The minimum height that the editor should have.
		minHeight: "1em",

		// isClosed: [private] Boolean
		isClosed: true,

		// isLoaded: [private] Boolean
		isLoaded: false,

		// _SEPARATOR: [private] String
		//		Used to concat contents from multiple editors into a single string,
		//		so they can be saved into a single `<textarea>` node.  See "name" attribute.
		_SEPARATOR: "@@**%%__RICHTEXTBOUNDRY__%%**@@",

		// _NAME_CONTENT_SEP: [private] String
		//		USed to separate name from content.  Just a colon isn't safe.
		_NAME_CONTENT_SEP: "@@**%%:%%**@@",

		// onLoadDeferred: [readonly] dojo/promise/Promise
		//		Deferred which is fired when the editor finishes loading.
		//		Call myEditor.onLoadDeferred.then(callback) it to be informed
		//		when the rich-text area initialization is finalized.
		onLoadDeferred: null,

		// isTabIndent: Boolean
		//		Make tab key and shift-tab indent and outdent rather than navigating.
		//		Caution: sing this makes web pages inaccessible to users unable to use a mouse.
		isTabIndent: false,

		// disableSpellCheck: [const] Boolean
		//		When true, disables the browser's native spell checking, if supported.
		//		Works only in Firefox.
		disableSpellCheck: false,

		postCreate: function(){
			if("textarea" === this.domNode.tagName.toLowerCase()){
				console.warn("RichText should not be used with the TEXTAREA tag.  See dijit._editor.RichText docs.");
			}

			// Push in the builtin filters now, making them the first executed, but not over-riding anything
			// users passed in.  See: #6062
			this.contentPreFilters = [lang.hitch(this, "_preFixUrlAttributes")].concat(this.contentPreFilters);
			if(has("mozilla")){
				this.contentPreFilters = [this._normalizeFontStyle].concat(this.contentPreFilters);
				this.contentPostFilters = [this._removeMozBogus].concat(this.contentPostFilters);
			}
			if(has("webkit")){
				// Try to clean up WebKit bogus artifacts.  The inserted classes
				// made by WebKit sometimes messes things up.
				this.contentPreFilters = [this._removeWebkitBogus].concat(this.contentPreFilters);
				this.contentPostFilters = [this._removeWebkitBogus].concat(this.contentPostFilters);
			}
			if(has("ie")){
				// IE generates <strong> and <em> but we want to normalize to <b> and <i>
				this.contentPostFilters = [this._normalizeFontStyle].concat(this.contentPostFilters);
				this.contentDomPostFilters = [lang.hitch(this, this._stripBreakerNodes)].concat(this.contentDomPostFilters);
			}
			this.inherited(arguments);

			topic.publish(dijit._scopeName + "._editor.RichText::init", this);
		},

		startup: function(){
			this.inherited(arguments);

			// Don't call open() until startup() because we need to be attached to the DOM, and also if we are the
			// child of a StackContainer, let StackContainer._setupChild() do DOM manipulations before iframe is
			// created, to avoid duplicate onload call.
			this.open();
			this.setupDefaultShortcuts();
		},

		setupDefaultShortcuts: function(){
			// summary:
			//		Add some default key handlers
			// description:
			//		Overwrite this to setup your own handlers. The default
			//		implementation does not use Editor commands, but directly
			//		executes the builtin commands within the underlying browser
			//		support.
			// tags:
			//		protected
			var exec = lang.hitch(this, function(cmd, arg){
				return function(){
					return !this.execCommand(cmd, arg);
				};
			});

			var ctrlKeyHandlers = {
				b: exec("bold"),
				i: exec("italic"),
				u: exec("underline"),
				a: exec("selectall"),
				s: function(){
					this.save(true);
				},
				m: function(){
					this.isTabIndent = !this.isTabIndent;
				},

				"1": exec("formatblock", "h1"),
				"2": exec("formatblock", "h2"),
				"3": exec("formatblock", "h3"),
				"4": exec("formatblock", "h4"),

				"\\": exec("insertunorderedlist")
			};

			if(!has("ie")){
				ctrlKeyHandlers.Z = exec("redo"); //FIXME: undo?
			}

			var key;
			for(key in ctrlKeyHandlers){
				this.addKeyHandler(key, true, false, ctrlKeyHandlers[key]);
			}
		},

		// events: [private] String[]
		//		 events which should be connected to the underlying editing area
		events: ["onKeyDown", "onKeyUp"], // onClick handled specially

		// captureEvents: [deprecated] String[]
		//		 Events which should be connected to the underlying editing
		//		 area, events in this array will be addListener with
		//		 capture=true.
		// TODO: looking at the code I don't see any distinction between events and captureEvents,
		// so get rid of this for 2.0 if not sooner
		captureEvents: [],

		_editorCommandsLocalized: false,
		_localizeEditorCommands: function(){
			// summary:
			//		When IE is running in a non-English locale, the API actually changes,
			//		so that we have to say (for example) danraku instead of p (for paragraph).
			//		Handle that here.
			// tags:
			//		private
			if(RichText._editorCommandsLocalized){
				// Use the already generate cache of mappings.
				this._local2NativeFormatNames = RichText._local2NativeFormatNames;
				this._native2LocalFormatNames = RichText._native2LocalFormatNames;
				return;
			}
			RichText._editorCommandsLocalized = true;
			RichText._local2NativeFormatNames = {};
			RichText._native2LocalFormatNames = {};
			this._local2NativeFormatNames = RichText._local2NativeFormatNames;
			this._native2LocalFormatNames = RichText._native2LocalFormatNames;
			//in IE, names for blockformat is locale dependent, so we cache the values here

			//put p after div, so if IE returns Normal, we show it as paragraph
			//We can distinguish p and div if IE returns Normal, however, in order to detect that,
			//we have to call this.document.selection.createRange().parentElement() or such, which
			//could slow things down. Leave it as it is for now
			var formats = ['div', 'p', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'address'];
			var localhtml = "", format, i = 0;
			while((format = formats[i++])){
				//append a <br> after each element to separate the elements more reliably
				if(format.charAt(1) !== 'l'){
					localhtml += "<" + format + "><span>content</span></" + format + "><br/>";
				}else{
					localhtml += "<" + format + "><li>content</li></" + format + "><br/>";
				}
			}
			// queryCommandValue returns empty if we hide editNode, so move it out of screen temporary
			// Also, IE9 does weird stuff unless we do it inside the editor iframe.
			var style = { position: "absolute", top: "0px", zIndex: 10, opacity: 0.01 };
			var div = domConstruct.create('div', {style: style, innerHTML: localhtml});
			this.ownerDocumentBody.appendChild(div);

			// IE9 has a timing issue with doing this right after setting
			// the inner HTML, so put a delay in.
			var inject = lang.hitch(this, function(){
				var node = div.firstChild;
				while(node){
					try{
						this.selection.selectElement(node.firstChild);
						var nativename = node.tagName.toLowerCase();
						this._local2NativeFormatNames[nativename] = document.queryCommandValue("formatblock");
						this._native2LocalFormatNames[this._local2NativeFormatNames[nativename]] = nativename;
						node = node.nextSibling.nextSibling;
						//console.log("Mapped: ", nativename, " to: ", this._local2NativeFormatNames[nativename]);
					}catch(e){ /*Sqelch the occasional IE9 error */
					}
				}
				domConstruct.destroy(div);
			});
			this.defer(inject);
		},

		open: function(/*DomNode?*/ element){
			// summary:
			//		Transforms the node referenced in this.domNode into a rich text editing
			//		node.
			// description:
			//		Sets up the editing area asynchronously. This will result in
			//		the creation and replacement with an iframe.
			// tags:
			//		private

			if(!this.onLoadDeferred || this.onLoadDeferred.fired >= 0){
				this.onLoadDeferred = new Deferred();
			}

			if(!this.isClosed){
				this.close();
			}
			topic.publish(dijit._scopeName + "._editor.RichText::open", this);

			if(arguments.length === 1 && element.nodeName){ // else unchanged
				this.domNode = element;
			}

			var dn = this.domNode;

			// "html" will hold the innerHTML of the srcNodeRef and will be used to
			// initialize the editor.
			var html;

			if(lang.isString(this.value)){
				// Allow setting the editor content programmatically instead of
				// relying on the initial content being contained within the target
				// domNode.
				html = this.value;
				delete this.value;
				dn.innerHTML = "";
			}else if(dn.nodeName && dn.nodeName.toLowerCase() == "textarea"){
				// if we were created from a textarea, then we need to create a
				// new editing harness node.
				var ta = (this.textarea = dn);
				this.name = ta.name;
				html = ta.value;
				dn = this.domNode = this.ownerDocument.createElement("div");
				dn.setAttribute('widgetId', this.id);
				ta.removeAttribute('widgetId');
				dn.cssText = ta.cssText;
				dn.className += " " + ta.className;
				domConstruct.place(dn, ta, "before");
				var tmpFunc = lang.hitch(this, function(){
					//some browsers refuse to submit display=none textarea, so
					//move the textarea off screen instead
					domStyle.set(ta, {
						display: "block",
						position: "absolute",
						top: "-1000px"
					});

					if(has("ie")){ //nasty IE bug: abnormal formatting if overflow is not hidden
						var s = ta.style;
						this.__overflow = s.overflow;
						s.overflow = "hidden";
					}
				});
				if(has("ie")){
					this.defer(tmpFunc, 10);
				}else{
					tmpFunc();
				}

				if(ta.form){
					var resetValue = ta.value;
					this.reset = function(){
						var current = this.getValue();
						if(current !== resetValue){
							this.replaceValue(resetValue);
						}
					};
					on(ta.form, "submit", lang.hitch(this, function(){
						// Copy value to the <textarea> so it gets submitted along with form.
						// FIXME: should we be calling close() here instead?
						domAttr.set(ta, 'disabled', this.disabled); // don't submit the value if disabled
						ta.value = this.getValue();
					}));
				}
			}else{
				html = htmlapi.getChildrenHtml(dn);
				dn.innerHTML = "";
			}

			this.value = html;

			// If we're a list item we have to put in a blank line to force the
			// bullet to nicely align at the top of text
			if(dn.nodeName && dn.nodeName === "LI"){
				dn.innerHTML = " <br>";
			}

			// Construct the editor div structure.
			this.header = dn.ownerDocument.createElement("div");
			dn.appendChild(this.header);
			this.editingArea = dn.ownerDocument.createElement("div");
			dn.appendChild(this.editingArea);
			this.footer = dn.ownerDocument.createElement("div");
			dn.appendChild(this.footer);

			if(!this.name){
				this.name = this.id + "_AUTOGEN";
			}

			// User has pressed back/forward button so we lost the text in the editor, but it's saved
			// in a hidden <textarea> (which contains the data for all the editors on this page),
			// so get editor value from there
			if(this.name !== "" && (!config["useXDomain"] || config["allowXdRichTextSave"])){
				var saveTextarea = dom.byId(dijit._scopeName + "._editor.RichText.value");
				if(saveTextarea && saveTextarea.value !== ""){
					var datas = saveTextarea.value.split(this._SEPARATOR), i = 0, dat;
					while((dat = datas[i++])){
						var data = dat.split(this._NAME_CONTENT_SEP);
						if(data[0] === this.name){
							html = data[1];
							datas = datas.splice(i, 1);
							saveTextarea.value = datas.join(this._SEPARATOR);
							break;
						}
					}
				}

				if(!RichText._globalSaveHandler){
					RichText._globalSaveHandler = {};
					unload.addOnUnload(function(){
						var id;
						for(id in RichText._globalSaveHandler){
							var f = RichText._globalSaveHandler[id];
							if(lang.isFunction(f)){
								f();
							}
						}
					});
				}
				RichText._globalSaveHandler[this.id] = lang.hitch(this, "_saveContent");
			}

			this.isClosed = false;

			var ifr = (this.editorObject = this.iframe = this.ownerDocument.createElement('iframe'));
			ifr.id = this.id + "_iframe";
			ifr.style.border = "none";
			ifr.style.width = "100%";
			if(this._layoutMode){
				// iframe should be 100% height, thus getting it's height from surrounding
				// <div> (which has the correct height set by Editor)
				ifr.style.height = "100%";
			}else{
				if(has("ie") >= 7){
					if(this.height){
						ifr.style.height = this.height;
					}
					if(this.minHeight){
						ifr.style.minHeight = this.minHeight;
					}
				}else{
					ifr.style.height = this.height ? this.height : this.minHeight;
				}
			}
			ifr.frameBorder = 0;
			ifr._loadFunc = lang.hitch(this, function(w){
				this.window = w;
				this.document = this.window.document;

				// instantiate class to access selected text in editor's iframe
				this.selection = new selectionapi.SelectionManager(w);

				if(has("ie")){
					this._localizeEditorCommands();
				}

				// Do final setup and set initial contents of editor
				this.onLoad(html);
			});

			// Attach iframe to document, and set the initial (blank) content.
			var src = this._getIframeDocTxt(),
				s = "javascript: '" + src.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";

			if(has("ie") >= 9){
				// On IE9+, attach to document before setting the content, to avoid problem w/iframe running in
				// wrong security context, see #16633.
				this.editingArea.appendChild(ifr);
				ifr.src = s;
			}else{
				// For other browsers, set src first, especially for IE6/7 where attaching first gives a warning on
				// https:// about "this page contains secure and insecure items, do you want to view both?"
				ifr.setAttribute('src', s);
				this.editingArea.appendChild(ifr);
			}

			// TODO: this is a guess at the default line-height, kinda works
			if(dn.nodeName === "LI"){
				dn.lastChild.style.marginTop = "-1.2em";
			}

			domClass.add(this.domNode, this.baseClass);
		},

		//static cache variables shared among all instance of this class
		_local2NativeFormatNames: {},
		_native2LocalFormatNames: {},

		_getIframeDocTxt: function(){
			// summary:
			//		Generates the boilerplate text of the document inside the iframe (ie, `<html><head>...</head><body/></html>`).
			//		Editor content (if not blank) should be added afterwards.
			// tags:
			//		private
			var _cs = domStyle.getComputedStyle(this.domNode);

			// The contents inside of <body>.  The real contents are set later via a call to setValue().
			var html = "";
			var setBodyId = true;
			if(has("ie") || has("webkit") || (!this.height && !has("mozilla"))){
				// In auto-expand mode, need a wrapper div for AlwaysShowToolbar plugin to correctly
				// expand/contract the editor as the content changes.
				html = "<div id='dijitEditorBody'></div>";
				setBodyId = false;
			}else if(has("mozilla")){
				// workaround bug where can't select then delete text (until user types something
				// into the editor)... and/or issue where typing doesn't erase selected text
				this._cursorToStart = true;
				html = "&#160;";	// &nbsp;
			}

			var font = [ _cs.fontWeight, _cs.fontSize, _cs.fontFamily ].join(" ");

			// line height is tricky - applying a units value will mess things up.
			// if we can't get a non-units value, bail out.
			var lineHeight = _cs.lineHeight;
			if(lineHeight.indexOf("px") >= 0){
				lineHeight = parseFloat(lineHeight) / parseFloat(_cs.fontSize);
				// console.debug(lineHeight);
			}else if(lineHeight.indexOf("em") >= 0){
				lineHeight = parseFloat(lineHeight);
			}else{
				// If we can't get a non-units value, just default
				// it to the CSS spec default of 'normal'.  Seems to
				// work better, esp on IE, than '1.0'
				lineHeight = "normal";
			}
			var userStyle = "";
			var self = this;
			this.style.replace(/(^|;)\s*(line-|font-?)[^;]+/ig, function(match){
				match = match.replace(/^;/ig, "") + ';';
				var s = match.split(":")[0];
				if(s){
					s = lang.trim(s);
					s = s.toLowerCase();
					var i;
					var sC = "";
					for(i = 0; i < s.length; i++){
						var c = s.charAt(i);
						switch(c){
							case "-":
								i++;
								c = s.charAt(i).toUpperCase();
							default:
								sC += c;
						}
					}
					domStyle.set(self.domNode, sC, "");
				}
				userStyle += match + ';';
			});


			// need to find any associated label element, aria-label, or aria-labelledby and update iframe document title
			var label = query('label[for="' + this.id + '"]');
			var title = "";
			if(label.length){
				title = label[0].innerHTML;
			}else if(this["aria-label"]){
				title = this["aria-label"];
			}else if(this["aria-labelledby"]){
				title = dom.byId(this["aria-labelledby"]).innerHTML;
			}

			// Now that we have the title, also set it as the title attribute on the iframe
			this.iframe.setAttribute("title", title);

			return [
				"<!DOCTYPE html>",
				this.isLeftToRight() ? "<html lang='" + this.lang + "'>\n<head>\n" : "<html dir='rtl' lang='" + this.lang + "'>\n<head>\n",
				//(has("mozilla") && label.length ? "<title>" + label[0].innerHTML + "</title>\n" : ""),
				title ? "<title>" + title + "</title>" : "",
				"<meta http-equiv='Content-Type' content='text/html'>\n",
				"<style>\n",
				"\tbody,html {\n",
				"\t\tbackground:transparent;\n",
				"\t\tpadding: 1px 0 0 0;\n",
				"\t\tmargin: -1px 0 0 0;\n", // remove extraneous vertical scrollbar on safari and firefox
				"\t}\n",
				"\tbody,html, #dijitEditorBody{ outline: none; }",

				// Set <body> to expand to full size of editor, so clicking anywhere will work.
				// Except in auto-expand mode, in which case the editor expands to the size of <body>.
				// Also determine how scrollers should be applied.  In autoexpand mode (height = "") no scrollers on y at all.
				// But in fixed height mode we want both x/y scrollers.
				// Scrollers go on <body> since it's been set to height: 100%.
				"html { height: 100%; width: 100%; overflow: hidden; }\n",	// scroll bar is on <body>, shouldn't be on <html>
				this.height ? "\tbody { height: 100%; width: 100%; overflow: auto; }\n" :
					"\tbody { min-height: " + this.minHeight + "; width: 100%; overflow-x: auto; overflow-y: hidden; }\n",

				// TODO: left positioning will cause contents to disappear out of view
				//	   if it gets too wide for the visible area
				"\tbody{\n",
				"\t\ttop:0px;\n",
				"\t\tleft:0px;\n",
				"\t\tright:0px;\n",
				"\t\tfont:", font, ";\n",
				((this.height || has("opera")) ? "" : "\t\tposition: fixed;\n"),
				"\t\tline-height:", lineHeight, ";\n",
				"\t}\n",
				"\tp{ margin: 1em 0; }\n",

				"\tli > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; }\n",
				// Can't set min-height in IE9, it puts layout on li, which puts move/resize handles.
				(!has("ie") ? "\tli{ min-height:1.2em; }\n" : ""),
				"</style>\n",
				this._applyEditingAreaStyleSheets(), "\n",
				"</head>\n<body role='main' ",
				(setBodyId ? "id='dijitEditorBody' " : ""),

				// Onload handler fills in real editor content.
				// On IE9, sometimes onload is called twice, and the first time frameElement is null (test_FullScreen.html)
				"onload='frameElement && frameElement._loadFunc(window,document)' ",
				"style='" + userStyle + "'>", html, "</body>\n</html>"
			].join(""); // String
		},

		_applyEditingAreaStyleSheets: function(){
			// summary:
			//		apply the specified css files in styleSheets
			// tags:
			//		private
			var files = [];
			if(this.styleSheets){
				files = this.styleSheets.split(';');
				this.styleSheets = '';
			}

			//empty this.editingAreaStyleSheets here, as it will be filled in addStyleSheet
			files = files.concat(this.editingAreaStyleSheets);
			this.editingAreaStyleSheets = [];

			var text = '', i = 0, url, ownerWindow = winUtils.get(this.ownerDocument);
			while((url = files[i++])){
				var abstring = (new _Url(ownerWindow.location, url)).toString();
				this.editingAreaStyleSheets.push(abstring);
				text += '<link rel="stylesheet" type="text/css" href="' + abstring + '"/>';
			}
			return text;
		},

		addStyleSheet: function(/*dojo/_base/url*/ uri){
			// summary:
			//		add an external stylesheet for the editing area
			// uri:
			//		Url of the external css file
			var url = uri.toString(), ownerWindow = winUtils.get(this.ownerDocument);

			//if uri is relative, then convert it to absolute so that it can be resolved correctly in iframe
			if(url.charAt(0) === '.' || (url.charAt(0) !== '/' && !uri.host)){
				url = (new _Url(ownerWindow.location, url)).toString();
			}

			if(array.indexOf(this.editingAreaStyleSheets, url) > -1){
//			console.debug("dijit/_editor/RichText.addStyleSheet(): Style sheet "+url+" is already applied");
				return;
			}

			this.editingAreaStyleSheets.push(url);
			this.onLoadDeferred.then(lang.hitch(this, function(){
				if(this.document.createStyleSheet){ //IE
					this.document.createStyleSheet(url);
				}else{ //other browser
					var head = this.document.getElementsByTagName("head")[0];
					var stylesheet = this.document.createElement("link");
					stylesheet.rel = "stylesheet";
					stylesheet.type = "text/css";
					stylesheet.href = url;
					head.appendChild(stylesheet);
				}
			}));
		},

		removeStyleSheet: function(/*dojo/_base/url*/ uri){
			// summary:
			//		remove an external stylesheet for the editing area
			var url = uri.toString(), ownerWindow = winUtils.get(this.ownerDocument);
			//if uri is relative, then convert it to absolute so that it can be resolved correctly in iframe
			if(url.charAt(0) === '.' || (url.charAt(0) !== '/' && !uri.host)){
				url = (new _Url(ownerWindow.location, url)).toString();
			}
			var index = array.indexOf(this.editingAreaStyleSheets, url);
			if(index === -1){
//			console.debug("dijit/_editor/RichText.removeStyleSheet(): Style sheet "+url+" has not been applied");
				return;
			}
			delete this.editingAreaStyleSheets[index];
			query('link[href="' + url + '"]', this.window.document).orphan();
		},

		// disabled: Boolean
		//		The editor is disabled; the text cannot be changed.
		disabled: false,

		_mozSettingProps: {'styleWithCSS': false},
		_setDisabledAttr: function(/*Boolean*/ value){
			value = !!value;
			this._set("disabled", value);
			if(!this.isLoaded){
				return;
			} // this method requires init to be complete
			if(has("ie") || has("webkit") || has("opera")){
				var preventIEfocus = has("ie") && (this.isLoaded || !this.focusOnLoad);
				if(preventIEfocus){
					this.editNode.unselectable = "on";
				}
				this.editNode.contentEditable = !value;
				if(preventIEfocus){
					this.defer(function(){
						if(this.editNode){        // guard in case widget destroyed before timeout
							this.editNode.unselectable = "off";
						}
					});
				}
			}else{ //moz
				try{
					this.document.designMode = (value ? 'off' : 'on');
				}catch(e){
					return;
				} // ! _disabledOK
				if(!value && this._mozSettingProps){
					var ps = this._mozSettingProps;
					var n;
					for(n in ps){
						if(ps.hasOwnProperty(n)){
							try{
								this.document.execCommand(n, false, ps[n]);
							}catch(e2){
							}
						}
					}
				}
//			this.document.execCommand('contentReadOnly', false, value);
//				if(value){
//					this.blur(); //to remove the blinking caret
//				}
			}
			this._disabledOK = true;
		},

		/* Event handlers
		 *****************/

		onLoad: function(/*String*/ html){
			// summary:
			//		Handler after the iframe finishes loading.
			// html: String
			//		Editor contents should be set to this value
			// tags:
			//		protected

			// TODO: rename this to _onLoad, make empty public onLoad() method, deprecate/make protected onLoadDeferred handler?

			if(!this.window.__registeredWindow){
				this.window.__registeredWindow = true;
				this._iframeRegHandle = focus.registerIframe(this.iframe);
			}
			if(!has("ie") && !has("webkit") && (this.height || has("mozilla"))){
				this.editNode = this.document.body;
			}else{
				// there's a wrapper div around the content, see _getIframeDocTxt().
				this.editNode = this.document.body.firstChild;
				var _this = this;
				if(has("ie")){ // #4996 IE wants to focus the BODY tag
					this.tabStop = domConstruct.create('div', { tabIndex: -1 }, this.editingArea);
					this.iframe.onfocus = function(){
						_this.editNode.setActive();
					};
				}
			}
			this.focusNode = this.editNode; // for InlineEditBox


			var events = this.events.concat(this.captureEvents);
			var ap = this.iframe ? this.document : this.editNode;
			this.own(
				array.map(events, function(item){
					var type = item.toLowerCase().replace(/^on/, "");
					on(ap, type, lang.hitch(this, item));
				}, this)
			);

			this.own(on(ap, "mouseup", lang.hitch(this, "onClick"))); // mouseup in the margin does not generate an onclick event

			if(has("ie")){ // IE contentEditable
				this.own(on(this.document, "mousedown", lang.hitch(this, "_onIEMouseDown"))); // #4996 fix focus

				// give the node Layout on IE
				// TODO: this may no longer be needed, since we've reverted IE to using an iframe,
				// not contentEditable.   Removing it would also probably remove the need for creating
				// the extra <div> in _getIframeDocTxt()
				this.editNode.style.zoom = 1.0;
			}else{
				this.own(on(this.document, "mousedown", lang.hitch(this, function(){
					// Clear the moveToStart focus, as mouse
					// down will set cursor point.  Required to properly
					// work with selection/position driven plugins and clicks in
					// the window. refs: #10678
					delete this._cursorToStart;
				})));
			}

			if(has("webkit")){
				//WebKit sometimes doesn't fire right on selections, so the toolbar
				//doesn't update right.  Therefore, help it out a bit with an additional
				//listener.  A mouse up will typically indicate a display change, so fire this
				//and get the toolbar to adapt.  Reference: #9532
				this._webkitListener = this.own(on(this.document, "mouseup", lang.hitch(this, "onDisplayChanged")))[0];
				this.own(on(this.document, "mousedown", lang.hitch(this, function(e){
					var t = e.target;
					if(t && (t === this.document.body || t === this.document)){
						// Since WebKit uses the inner DIV, we need to check and set position.
						// See: #12024 as to why the change was made.
						this.defer("placeCursorAtEnd");
					}
				})));
			}

			if(has("ie")){
				// Try to make sure 'hidden' elements aren't visible in edit mode (like browsers other than IE
				// do).  See #9103
				try{
					this.document.execCommand('RespectVisibilityInDesign', true, null);
				}catch(e){/* squelch */
				}
			}

			this.isLoaded = true;

			this.set('disabled', this.disabled); // initialize content to editable (or not)

			// Note that setValue() call will only work after isLoaded is set to true (above)

			// Set up a function to allow delaying the setValue until a callback is fired
			// This ensures extensions like dijit.Editor have a way to hold the value set
			// until plugins load (and do things like register filters).
			var setContent = lang.hitch(this, function(){
				this.setValue(html);
				if(this.onLoadDeferred){
					this.onLoadDeferred.resolve(true);
				}
				this.onDisplayChanged();
				if(this.focusOnLoad){
					// after the document loads, then set focus after updateInterval expires so that
					// onNormalizedDisplayChanged has run to avoid input caret issues
					domReady(lang.hitch(this, "defer", "focus", this.updateInterval));
				}
				// Save off the initial content now
				this.value = this.getValue(true);
			});
			if(this.setValueDeferred){
				this.setValueDeferred.then(setContent);
			}else{
				setContent();
			}
		},

		onKeyDown: function(/* Event */ e){
			// summary:
			//		Handler for keydown event
			// tags:
			//		protected

			if(e.keyCode === keys.TAB && this.isTabIndent){
				//prevent tab from moving focus out of editor
				e.stopPropagation();
				e.preventDefault();

				// FIXME: this is a poor-man's indent/outdent. It would be
				// better if it added 4 "&nbsp;" chars in an undoable way.
				// Unfortunately pasteHTML does not prove to be undoable
				if(this.queryCommandEnabled((e.shiftKey ? "outdent" : "indent"))){
					this.execCommand((e.shiftKey ? "outdent" : "indent"));
				}
			}
			if(has("ie")){
				if(e.keyCode == keys.TAB && !this.isTabIndent){
					if(e.shiftKey && !e.ctrlKey && !e.altKey){
						// focus the BODY so the browser will tab away from it instead
						this.iframe.focus();
					}else if(!e.shiftKey && !e.ctrlKey && !e.altKey){
						// focus the BODY so the browser will tab away from it instead
						this.tabStop.focus();
					}
				}else if(e.keyCode === keys.BACKSPACE && this.document.selection.type === "Control"){
					// IE has a bug where if a non-text object is selected in the editor,
					// hitting backspace would act as if the browser's back button was
					// clicked instead of deleting the object. see #1069
					e.stopPropagation();
					e.preventDefault();
					this.execCommand("delete");
				}
			}
			if(has("ff")){
				if(e.keyCode === keys.PAGE_UP || e.keyCode === keys.PAGE_DOWN){
					if(this.editNode.clientHeight >= this.editNode.scrollHeight){
						// Stop the event to prevent firefox from trapping the cursor when there is no scroll bar.
						e.preventDefault();
					}
				}
			}

			var handlers = this._keyHandlers[e.keyCode],
				args = arguments;

			if(handlers && !e.altKey){
				array.some(handlers, function(h){
					// treat meta- same as ctrl-, for benefit of mac users
					if(!(h.shift ^ e.shiftKey) && !(h.ctrl ^ (e.ctrlKey || e.metaKey))){
						if(!h.handler.apply(this, args)){
							e.preventDefault();
						}
						return true;
					}
				}, this);
			}

			// function call after the character has been inserted
			this.defer("onKeyPressed", 1);

			return true;
		},

		onKeyUp: function(/*===== e =====*/){
			// summary:
			//		Handler for onkeyup event
			// tags:
			//		callback
		},

		setDisabled: function(/*Boolean*/ disabled){
			// summary:
			//		Deprecated, use set('disabled', ...) instead.
			// tags:
			//		deprecated
			kernel.deprecated('dijit.Editor::setDisabled is deprecated', 'use dijit.Editor::attr("disabled",boolean) instead', 2.0);
			this.set('disabled', disabled);
		},
		_setValueAttr: function(/*String*/ value){
			// summary:
			//		Registers that attr("value", foo) should call setValue(foo)
			this.setValue(value);
		},
		_setDisableSpellCheckAttr: function(/*Boolean*/ disabled){
			if(this.document){
				domAttr.set(this.document.body, "spellcheck", !disabled);
			}else{
				// try again after the editor is finished loading
				this.onLoadDeferred.then(lang.hitch(this, function(){
					domAttr.set(this.document.body, "spellcheck", !disabled);
				}));
			}
			this._set("disableSpellCheck", disabled);
		},

		addKeyHandler: function(/*String|Number*/ key, /*Boolean*/ ctrl, /*Boolean*/ shift, /*Function*/ handler){
			// summary:
			//		Add a handler for a keyboard shortcut
			// tags:
			//		protected

			if(typeof key == "string"){
				// Something like Ctrl-B.  Since using keydown event, we need to convert string to a number.
				key = key.toUpperCase().charCodeAt(0);
			}

			if(!lang.isArray(this._keyHandlers[key])){
				this._keyHandlers[key] = [];
			}

			this._keyHandlers[key].push({
				shift: shift || false,
				ctrl: ctrl || false,
				handler: handler
			});
		},

		onKeyPressed: function(){
			// summary:
			//		Handler for after the user has pressed a key, and the display has been updated.
			//		(Runs on a timer so that it runs after the display is updated)
			// tags:
			//		private
			this.onDisplayChanged(/*e*/); // can't pass in e
		},

		onClick: function(/*Event*/ e){
			// summary:
			//		Handler for when the user clicks.
			// tags:
			//		private

			// console.info('onClick',this._tryDesignModeOn);
			this.onDisplayChanged(e);
		},

		_onIEMouseDown: function(){
			// summary:
			//		IE only to prevent 2 clicks to focus
			// tags:
			//		protected

			if(!this.focused && !this.disabled){
				this.focus();
			}
		},

		_onBlur: function(e){
			// summary:
			//		Called from focus manager when focus has moved away from this editor
			// tags:
			//		protected

			// Workaround IE9+ problems when you blur the browser windows while an editor is focused: IE hangs
			// when you focus editor #1, blur the browser window, and then click editor #0.  See #16939.
			if(has("ie") >= 9){
				this.defer(function(){
					if(!focus.curNode){
						this.ownerDocumentBody.focus();
					}
				});
			}

			this.inherited(arguments);

			var newValue = this.getValue(true);
			if(newValue !== this.value){
				this.onChange(newValue);
			}
			this._set("value", newValue);
		},

		_onFocus: function(/*Event*/ e){
			// summary:
			//		Called from focus manager when focus has moved into this editor
			// tags:
			//		protected

			// console.info('_onFocus')
			if(!this.disabled){
				if(!this._disabledOK){
					this.set('disabled', false);
				}
				this.inherited(arguments);
			}
		},

		// TODO: remove in 2.0
		blur: function(){
			// summary:
			//		Remove focus from this instance.
			// tags:
			//		deprecated
			if(!has("ie") && this.window.document.documentElement && this.window.document.documentElement.focus){
				this.window.document.documentElement.focus();
			}else if(this.ownerDocumentBody.focus){
				this.ownerDocumentBody.focus();
			}
		},

		focus: function(){
			// summary:
			//		Move focus to this editor
			if(!this.isLoaded){
				this.focusOnLoad = true;
				return;
			}
			if(this._cursorToStart){
				delete this._cursorToStart;
				if(this.editNode.childNodes){
					this.placeCursorAtStart(); // this calls focus() so return
					return;
				}
			}
			if(!has("ie")){
				focus.focus(this.iframe);
			}else if(this.editNode && this.editNode.focus){
				// editNode may be hidden in display:none div, lets just punt in this case
				//this.editNode.focus(); -> causes IE to scroll always (strict and quirks mode) to the top the Iframe
				// if we fire the event manually and let the browser handle the focusing, the latest
				// cursor position is focused like in FF
				this.iframe.fireEvent('onfocus', document.createEventObject()); // createEventObject only in IE
				//	}else{
				// TODO: should we throw here?
				// console.debug("Have no idea how to focus into the editor!");
			}
		},

		// _lastUpdate: 0,
		updateInterval: 200,
		_updateTimer: null,
		onDisplayChanged: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		This event will be fired every time the display context
			//		changes and the result needs to be reflected in the UI.
			// description:
			//		If you don't want to have update too often,
			//		onNormalizedDisplayChanged should be used instead
			// tags:
			//		private

			// var _t=new Date();
			if(this._updateTimer){
				this._updateTimer.remove();
			}
			this._updateTimer = this.defer("onNormalizedDisplayChanged", this.updateInterval);

			// Technically this should trigger a call to watch("value", ...) registered handlers,
			// but getValue() is too slow to call on every keystroke so we don't.
		},
		onNormalizedDisplayChanged: function(){
			// summary:
			//		This event is fired every updateInterval ms or more
			// description:
			//		If something needs to happen immediately after a
			//		user change, please use onDisplayChanged instead.
			// tags:
			//		private
			delete this._updateTimer;
		},
		onChange: function(/*===== newContent =====*/){
			// summary:
			//		This is fired if and only if the editor loses focus and
			//		the content is changed.
		},
		_normalizeCommand: function(/*String*/ cmd, /*Anything?*/argument){
			// summary:
			//		Used as the advice function to map our
			//		normalized set of commands to those supported by the target
			//		browser.
			// tags:
			//		private

			var command = cmd.toLowerCase();
			if(command === "formatblock"){
				if(has("safari") && argument === undefined){
					command = "heading";
				}
			}else if(command === "hilitecolor" && !has("mozilla")){
				command = "backcolor";
			}

			return command;
		},

		_qcaCache: {},
		queryCommandAvailable: function(/*String*/ command){
			// summary:
			//		Tests whether a command is supported by the host. Clients
			//		SHOULD check whether a command is supported before attempting
			//		to use it, behaviour for unsupported commands is undefined.
			// command:
			//		The command to test for
			// tags:
			//		private

			// memoizing version. See _queryCommandAvailable for computing version
			var ca = this._qcaCache[command];
			if(ca !== undefined){
				return ca;
			}
			return (this._qcaCache[command] = this._queryCommandAvailable(command));
		},

		_queryCommandAvailable: function(/*String*/ command){
			// summary:
			//		See queryCommandAvailable().
			// tags:
			//		private

			var ie = 1;
			var mozilla = 1 << 1;
			var webkit = 1 << 2;
			var opera = 1 << 3;

			function isSupportedBy(browsers){
				return {
					ie: Boolean(browsers & ie),
					mozilla: Boolean(browsers & mozilla),
					webkit: Boolean(browsers & webkit),
					opera: Boolean(browsers & opera)
				};
			}

			var supportedBy = null;

			switch(command.toLowerCase()){
				case "bold":
				case "italic":
				case "underline":
				case "subscript":
				case "superscript":
				case "fontname":
				case "fontsize":
				case "forecolor":
				case "hilitecolor":
				case "justifycenter":
				case "justifyfull":
				case "justifyleft":
				case "justifyright":
				case "delete":
				case "selectall":
				case "toggledir":
					supportedBy = isSupportedBy(mozilla | ie | webkit | opera);
					break;

				case "createlink":
				case "unlink":
				case "removeformat":
				case "inserthorizontalrule":
				case "insertimage":
				case "insertorderedlist":
				case "insertunorderedlist":
				case "indent":
				case "outdent":
				case "formatblock":
				case "inserthtml":
				case "undo":
				case "redo":
				case "strikethrough":
				case "tabindent":
					supportedBy = isSupportedBy(mozilla | ie | opera | webkit);
					break;

				case "blockdirltr":
				case "blockdirrtl":
				case "dirltr":
				case "dirrtl":
				case "inlinedirltr":
				case "inlinedirrtl":
					supportedBy = isSupportedBy(ie);
					break;
				case "cut":
				case "copy":
				case "paste":
					supportedBy = isSupportedBy(ie | mozilla | webkit | opera);
					break;

				case "inserttable":
					supportedBy = isSupportedBy(mozilla | ie);
					break;

				case "insertcell":
				case "insertcol":
				case "insertrow":
				case "deletecells":
				case "deletecols":
				case "deleterows":
				case "mergecells":
				case "splitcell":
					supportedBy = isSupportedBy(ie | mozilla);
					break;

				default:
					return false;
			}

			return (has("ie") && supportedBy.ie) ||
				(has("mozilla") && supportedBy.mozilla) ||
				(has("webkit") && supportedBy.webkit) ||
				(has("opera") && supportedBy.opera);	// Boolean return true if the command is supported, false otherwise
		},

		execCommand: function(/*String*/ command, argument){
			// summary:
			//		Executes a command in the Rich Text area
			// command:
			//		The command to execute
			// argument:
			//		An optional argument to the command
			// tags:
			//		protected
			var returnValue;

			//focus() is required for IE to work
			//In addition, focus() makes sure after the execution of
			//the command, the editor receives the focus as expected
			if(this.focused){
				// put focus back in the iframe, unless focus has somehow been shifted out of the editor completely
				this.focus();
			}

			command = this._normalizeCommand(command, argument);

			if(argument !== undefined){
				if(command === "heading"){
					throw new Error("unimplemented");
				}else if((command === "formatblock") && has("ie")){
					argument = '<' + argument + '>';
				}
			}

			//Check to see if we have any over-rides for commands, they will be functions on this
			//widget of the form _commandImpl.  If we don't, fall through to the basic native
			//exec command of the browser.
			var implFunc = "_" + command + "Impl";
			if(this[implFunc]){
				returnValue = this[implFunc](argument);
			}else{
				argument = arguments.length > 1 ? argument : null;
				if(argument || command !== "createlink"){
					returnValue = this.document.execCommand(command, false, argument);
				}
			}

			this.onDisplayChanged();
			return returnValue;
		},

		queryCommandEnabled: function(/*String*/ command){
			// summary:
			//		Check whether a command is enabled or not.
			// command:
			//		The command to execute
			// tags:
			//		protected
			if(this.disabled || !this._disabledOK){
				return false;
			}

			command = this._normalizeCommand(command);

			//Check to see if we have any over-rides for commands, they will be functions on this
			//widget of the form _commandEnabledImpl.  If we don't, fall through to the basic native
			//command of the browser.
			var implFunc = "_" + command + "EnabledImpl";

			if(this[implFunc]){
				return  this[implFunc](command);
			}else{
				return this._browserQueryCommandEnabled(command);
			}
		},

		queryCommandState: function(command){
			// summary:
			//		Check the state of a given command and returns true or false.
			// tags:
			//		protected

			if(this.disabled || !this._disabledOK){
				return false;
			}
			command = this._normalizeCommand(command);
			try{
				return this.document.queryCommandState(command);
			}catch(e){
				//Squelch, occurs if editor is hidden on FF 3 (and maybe others.)
				return false;
			}
		},

		queryCommandValue: function(command){
			// summary:
			//		Check the value of a given command. This matters most for
			//		custom selections and complex values like font value setting.
			// tags:
			//		protected

			if(this.disabled || !this._disabledOK){
				return false;
			}
			var r;
			command = this._normalizeCommand(command);
			if(has("ie") && command === "formatblock"){
				r = this._native2LocalFormatNames[this.document.queryCommandValue(command)];
			}else if(has("mozilla") && command === "hilitecolor"){
				var oldValue;
				try{
					oldValue = this.document.queryCommandValue("styleWithCSS");
				}catch(e){
					oldValue = false;
				}
				this.document.execCommand("styleWithCSS", false, true);
				r = this.document.queryCommandValue(command);
				this.document.execCommand("styleWithCSS", false, oldValue);
			}else{
				r = this.document.queryCommandValue(command);
			}
			return r;
		},

		// Misc.

		_sCall: function(name, args){
			// summary:
			//		Deprecated, remove for 2.0.   New code should access this.selection directly.
			//		Run the named method of dijit/selection over the
			//		current editor instance's window, with the passed args.
			// tags:
			//		private deprecated

			return this.selection[name].apply(this.selection, args);
		},

		// FIXME: this is a TON of code duplication. Why?

		placeCursorAtStart: function(){
			// summary:
			//		Place the cursor at the start of the editing area.
			// tags:
			//		private

			this.focus();

			//see comments in placeCursorAtEnd
			var isvalid = false;
			if(has("mozilla")){
				// TODO:  Is this branch even necessary?
				var first = this.editNode.firstChild;
				while(first){
					if(first.nodeType === 3){
						if(first.nodeValue.replace(/^\s+|\s+$/g, "").length > 0){
							isvalid = true;
							this.selection.selectElement(first);
							break;
						}
					}else if(first.nodeType === 1){
						isvalid = true;
						var tg = first.tagName ? first.tagName.toLowerCase() : "";
						// Collapse before childless tags.
						if(/br|input|img|base|meta|area|basefont|hr|link/.test(tg)){
							this.selection.selectElement(first);
						}else{
							// Collapse inside tags with children.
							this.selection.selectElementChildren(first);
						}
						break;
					}
					first = first.nextSibling;
				}
			}else{
				isvalid = true;
				this.selection.selectElementChildren(this.editNode);
			}
			if(isvalid){
				this.selection.collapse(true);
			}
		},

		placeCursorAtEnd: function(){
			// summary:
			//		Place the cursor at the end of the editing area.
			// tags:
			//		private

			this.focus();

			//In mozilla, if last child is not a text node, we have to use
			// selectElementChildren on this.editNode.lastChild otherwise the
			// cursor would be placed at the end of the closing tag of
			//this.editNode.lastChild
			var isvalid = false;
			if(has("mozilla")){
				var last = this.editNode.lastChild;
				while(last){
					if(last.nodeType === 3){
						if(last.nodeValue.replace(/^\s+|\s+$/g, "").length > 0){
							isvalid = true;
							this.selection.selectElement(last);
							break;
						}
					}else if(last.nodeType === 1){
						isvalid = true;
						this.selection.selectElement(last.lastChild || last);
						break;
					}
					last = last.previousSibling;
				}
			}else{
				isvalid = true;
				this.selection.selectElementChildren(this.editNode);
			}
			if(isvalid){
				this.selection.collapse(false);
			}
		},

		getValue: function(/*Boolean?*/ nonDestructive){
			// summary:
			//		Return the current content of the editing area (post filters
			//		are applied).  Users should call get('value') instead.
			// nonDestructive:
			//		defaults to false. Should the post-filtering be run over a copy
			//		of the live DOM? Most users should pass "true" here unless they
			//		*really* know that none of the installed filters are going to
			//		mess up the editing session.
			// tags:
			//		private
			if(this.textarea){
				if(this.isClosed || !this.isLoaded){
					return this.textarea.value;
				}
			}

			return this._postFilterContent(null, nonDestructive);
		},
		_getValueAttr: function(){
			// summary:
			//		Hook to make attr("value") work
			return this.getValue(true);
		},

		setValue: function(/*String*/ html){
			// summary:
			//		This function sets the content. No undo history is preserved.
			//		Users should use set('value', ...) instead.
			// tags:
			//		deprecated

			// TODO: remove this and getValue() for 2.0, and move code to _setValueAttr()

			if(!this.isLoaded){
				// try again after the editor is finished loading
				this.onLoadDeferred.then(lang.hitch(this, function(){
					this.setValue(html);
				}));
				return;
			}
			this._cursorToStart = true;
			if(this.textarea && (this.isClosed || !this.isLoaded)){
				this.textarea.value = html;
			}else{
				html = this._preFilterContent(html);
				var node = this.isClosed ? this.domNode : this.editNode;
				if(html && has("mozilla") && html.toLowerCase() === "<p></p>"){
					html = "<p>&#160;</p>";	// &nbsp;
				}

				// Use &nbsp; to avoid webkit problems where editor is disabled until the user clicks it
				if(!html && has("webkit")){
					html = "&#160;";	// &nbsp;
				}
				node.innerHTML = html;
				this._preDomFilterContent(node);
			}

			this.onDisplayChanged();
			this._set("value", this.getValue(true));
		},

		replaceValue: function(/*String*/ html){
			// summary:
			//		This function set the content while trying to maintain the undo stack
			//		(now only works fine with Moz, this is identical to setValue in all
			//		other browsers)
			// tags:
			//		protected

			if(this.isClosed){
				this.setValue(html);
			}else if(this.window && this.window.getSelection && !has("mozilla")){ // Safari
				// look ma! it's a totally f'd browser!
				this.setValue(html);
			}else if(this.window && this.window.getSelection){ // Moz
				html = this._preFilterContent(html);
				this.execCommand("selectall");
				if(!html){
					this._cursorToStart = true;
					html = "&#160;";	// &nbsp;
				}
				this.execCommand("inserthtml", html);
				this._preDomFilterContent(this.editNode);
			}else if(this.document && this.document.selection){//IE
				//In IE, when the first element is not a text node, say
				//an <a> tag, when replacing the content of the editing
				//area, the <a> tag will be around all the content
				//so for now, use setValue for IE too
				this.setValue(html);
			}

			this._set("value", this.getValue(true));
		},

		_preFilterContent: function(/*String*/ html){
			// summary:
			//		Filter the input before setting the content of the editing
			//		area. DOM pre-filtering may happen after this
			//		string-based filtering takes place but as of 1.2, this is not
			//		guaranteed for operations such as the inserthtml command.
			// tags:
			//		private

			var ec = html;
			array.forEach(this.contentPreFilters, function(ef){
				if(ef){
					ec = ef(ec);
				}
			});
			return ec;
		},
		_preDomFilterContent: function(/*DomNode*/ dom){
			// summary:
			//		filter the input's live DOM. All filter operations should be
			//		considered to be "live" and operating on the DOM that the user
			//		will be interacting with in their editing session.
			// tags:
			//		private
			dom = dom || this.editNode;
			array.forEach(this.contentDomPreFilters, function(ef){
				if(ef && lang.isFunction(ef)){
					ef(dom);
				}
			}, this);
		},

		_postFilterContent: function(/*DomNode|DomNode[]|String?*/ dom, /*Boolean?*/ nonDestructive){
			// summary:
			//		filter the output after getting the content of the editing area
			//
			// description:
			//		post-filtering allows plug-ins and users to specify any number
			//		of transforms over the editor's content, enabling many common
			//		use-cases such as transforming absolute to relative URLs (and
			//		vice-versa), ensuring conformance with a particular DTD, etc.
			//		The filters are registered in the contentDomPostFilters and
			//		contentPostFilters arrays. Each item in the
			//		contentDomPostFilters array is a function which takes a DOM
			//		Node or array of nodes as its only argument and returns the
			//		same. It is then passed down the chain for further filtering.
			//		The contentPostFilters array behaves the same way, except each
			//		member operates on strings. Together, the DOM and string-based
			//		filtering allow the full range of post-processing that should
			//		be necessaray to enable even the most agressive of post-editing
			//		conversions to take place.
			//
			//		If nonDestructive is set to "true", the nodes are cloned before
			//		filtering proceeds to avoid potentially destructive transforms
			//		to the content which may still needed to be edited further.
			//		Once DOM filtering has taken place, the serialized version of
			//		the DOM which is passed is run through each of the
			//		contentPostFilters functions.
			//
			// dom:
			//		a node, set of nodes, which to filter using each of the current
			//		members of the contentDomPostFilters and contentPostFilters arrays.
			//
			// nonDestructive:
			//		defaults to "false". If true, ensures that filtering happens on
			//		a clone of the passed-in content and not the actual node
			//		itself.
			//
			// tags:
			//		private

			var ec;
			if(!lang.isString(dom)){
				dom = dom || this.editNode;
				if(this.contentDomPostFilters.length){
					if(nonDestructive){
						dom = lang.clone(dom);
					}
					array.forEach(this.contentDomPostFilters, function(ef){
						dom = ef(dom);
					});
				}
				ec = htmlapi.getChildrenHtml(dom);
			}else{
				ec = dom;
			}

			if(!lang.trim(ec.replace(/^\xA0\xA0*/, '').replace(/\xA0\xA0*$/, '')).length){
				ec = "";
			}

			//	if(has("ie")){
			//		//removing appended <P>&nbsp;</P> for IE
			//		ec = ec.replace(/(?:<p>&nbsp;</p>[\n\r]*)+$/i,"");
			//	}
			array.forEach(this.contentPostFilters, function(ef){
				ec = ef(ec);
			});

			return ec;
		},

		_saveContent: function(){
			// summary:
			//		Saves the content in an onunload event if the editor has not been closed
			// tags:
			//		private

			var saveTextarea = dom.byId(dijit._scopeName + "._editor.RichText.value");
			if(saveTextarea){
				if(saveTextarea.value){
					saveTextarea.value += this._SEPARATOR;
				}
				saveTextarea.value += this.name + this._NAME_CONTENT_SEP + this.getValue(true);
			}
		},


		escapeXml: function(/*String*/ str, /*Boolean*/ noSingleQuotes){
			// summary:
			//		Adds escape sequences for special characters in XML.
			//		Optionally skips escapes for single quotes
			// tags:
			//		private

			str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
			if(!noSingleQuotes){
				str = str.replace(/'/gm, "&#39;");
			}
			return str; // string
		},

		getNodeHtml: function(/* DomNode */ node){
			// summary:
			//		Deprecated.   Use dijit/_editor/html::_getNodeHtml() instead.
			// tags:
			//		deprecated
			kernel.deprecated('dijit.Editor::getNodeHtml is deprecated', 'use dijit/_editor/html::getNodeHtml instead', 2);
			return htmlapi.getNodeHtml(node); // String
		},

		getNodeChildrenHtml: function(/* DomNode */ dom){
			// summary:
			//		Deprecated.   Use dijit/_editor/html::getChildrenHtml() instead.
			// tags:
			//		deprecated
			kernel.deprecated('dijit.Editor::getNodeChildrenHtml is deprecated', 'use dijit/_editor/html::getChildrenHtml instead', 2);
			return htmlapi.getChildrenHtml(dom);
		},

		close: function(/*Boolean?*/ save){
			// summary:
			//		Kills the editor and optionally writes back the modified contents to the
			//		element from which it originated.
			// save:
			//		Whether or not to save the changes. If false, the changes are discarded.
			// tags:
			//		private

			if(this.isClosed){
				return;
			}

			if(!arguments.length){
				save = true;
			}
			if(save){
				this._set("value", this.getValue(true));
			}

			// line height is squashed for iframes
			// FIXME: why was this here? if(this.iframe){ this.domNode.style.lineHeight = null; }

			if(this.interval){
				clearInterval(this.interval);
			}

			if(this._webkitListener){
				// Cleanup of WebKit fix: #9532
				this._webkitListener.remove();
				delete this._webkitListener;
			}

			// Guard against memory leaks on IE (see #9268)
			if(has("ie")){
				this.iframe.onfocus = null;
			}
			this.iframe._loadFunc = null;

			if(this._iframeRegHandle){
				this._iframeRegHandle.remove();
				delete this._iframeRegHandle;
			}

			if(this.textarea){
				var s = this.textarea.style;
				s.position = "";
				s.left = s.top = "";
				if(has("ie")){
					s.overflow = this.__overflow;
					this.__overflow = null;
				}
				this.textarea.value = this.value;
				domConstruct.destroy(this.domNode);
				this.domNode = this.textarea;
			}else{
				// Note that this destroys the iframe
				this.domNode.innerHTML = this.value;
			}
			delete this.iframe;

			domClass.remove(this.domNode, this.baseClass);
			this.isClosed = true;
			this.isLoaded = false;

			delete this.editNode;
			delete this.focusNode;

			if(this.window && this.window._frameElement){
				this.window._frameElement = null;
			}

			this.window = null;
			this.document = null;
			this.editingArea = null;
			this.editorObject = null;
		},

		destroy: function(){
			if(!this.isClosed){
				this.close(false);
			}
			if(this._updateTimer){
				this._updateTimer.remove();
			}
			this.inherited(arguments);
			if(RichText._globalSaveHandler){
				delete RichText._globalSaveHandler[this.id];
			}
		},

		_removeMozBogus: function(/* String */ html){
			// summary:
			//		Post filter to remove unwanted HTML attributes generated by mozilla
			// tags:
			//		private
			return html.replace(/\stype="_moz"/gi, '').replace(/\s_moz_dirty=""/gi, '').replace(/_moz_resizing="(true|false)"/gi, ''); // String
		},
		_removeWebkitBogus: function(/* String */ html){
			// summary:
			//		Post filter to remove unwanted HTML attributes generated by webkit
			// tags:
			//		private
			html = html.replace(/\sclass="webkit-block-placeholder"/gi, '');
			html = html.replace(/\sclass="apple-style-span"/gi, '');
			// For some reason copy/paste sometime adds extra meta tags for charset on
			// webkit (chrome) on mac.They need to be removed.  See: #12007"
			html = html.replace(/<meta charset=\"utf-8\" \/>/gi, '');
			return html; // String
		},
		_normalizeFontStyle: function(/* String */ html){
			// summary:
			//		Convert 'strong' and 'em' to 'b' and 'i'.
			// description:
			//		Moz can not handle strong/em tags correctly, so to help
			//		mozilla and also to normalize output, convert them to 'b' and 'i'.
			//
			//		Note the IE generates 'strong' and 'em' rather than 'b' and 'i'
			// tags:
			//		private
			return html.replace(/<(\/)?strong([ \>])/gi, '<$1b$2')
				.replace(/<(\/)?em([ \>])/gi, '<$1i$2'); // String
		},

		_preFixUrlAttributes: function(/* String */ html){
			// summary:
			//		Pre-filter to do fixing to href attributes on `<a>` and `<img>` tags
			// tags:
			//		private
			return html.replace(/(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi,
				'$1$4$2$3$5$2 _djrealurl=$2$3$5$2')
				.replace(/(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi,
				'$1$4$2$3$5$2 _djrealurl=$2$3$5$2'); // String
		},

		/*****************************************************************************
		 The following functions implement HTML manipulation commands for various
		 browser/contentEditable implementations.  The goal of them is to enforce
		 standard behaviors of them.
		 ******************************************************************************/

		/*** queryCommandEnabled implementations ***/

		_browserQueryCommandEnabled: function(command){
			// summary:
			//		Implementation to call to the native queryCommandEnabled of the browser.
			// command:
			//		The command to check.
			// tags:
			//		protected
			if(!command){
				return false;
			}
			var elem = has("ie") ? this.document.selection.createRange() : this.document;
			try{
				return elem.queryCommandEnabled(command);
			}catch(e){
				return false;
			}
		},

		_createlinkEnabledImpl: function(/*===== argument =====*/){
			// summary:
			//		This function implements the test for if the create link
			//		command should be enabled or not.
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var enabled = true;
			if(has("opera")){
				var sel = this.window.getSelection();
				if(sel.isCollapsed){
					enabled = true;
				}else{
					enabled = this.document.queryCommandEnabled("createlink");
				}
			}else{
				enabled = this._browserQueryCommandEnabled("createlink");
			}
			return enabled;
		},

		_unlinkEnabledImpl: function(/*===== argument =====*/){
			// summary:
			//		This function implements the test for if the unlink
			//		command should be enabled or not.
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var enabled = true;
			if(has("mozilla") || has("webkit")){
				enabled = this.selection.hasAncestorElement("a");
			}else{
				enabled = this._browserQueryCommandEnabled("unlink");
			}
			return enabled;
		},

		_inserttableEnabledImpl: function(/*===== argument =====*/){
			// summary:
			//		This function implements the test for if the inserttable
			//		command should be enabled or not.
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var enabled = true;
			if(has("mozilla") || has("webkit")){
				enabled = true;
			}else{
				enabled = this._browserQueryCommandEnabled("inserttable");
			}
			return enabled;
		},

		_cutEnabledImpl: function(/*===== argument =====*/){
			// summary:
			//		This function implements the test for if the cut
			//		command should be enabled or not.
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var enabled = true;
			if(has("webkit")){
				// WebKit deems clipboard activity as a security threat and natively would return false
				var sel = this.window.getSelection();
				if(sel){
					sel = sel.toString();
				}
				enabled = !!sel;
			}else{
				enabled = this._browserQueryCommandEnabled("cut");
			}
			return enabled;
		},

		_copyEnabledImpl: function(/*===== argument =====*/){
			// summary:
			//		This function implements the test for if the copy
			//		command should be enabled or not.
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var enabled = true;
			if(has("webkit")){
				// WebKit deems clipboard activity as a security threat and natively would return false
				var sel = this.window.getSelection();
				if(sel){
					sel = sel.toString();
				}
				enabled = !!sel;
			}else{
				enabled = this._browserQueryCommandEnabled("copy");
			}
			return enabled;
		},

		_pasteEnabledImpl: function(/*===== argument =====*/){
			// summary:c
			//		This function implements the test for if the paste
			//		command should be enabled or not.
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var enabled = true;
			if(has("webkit")){
				return true;
			}else{
				enabled = this._browserQueryCommandEnabled("paste");
			}
			return enabled;
		},

		/*** execCommand implementations ***/

		_inserthorizontalruleImpl: function(argument){
			// summary:
			//		This function implements the insertion of HTML 'HR' tags.
			//		into a point on the page.  IE doesn't to it right, so
			//		we have to use an alternate form
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			if(has("ie")){
				return this._inserthtmlImpl("<hr>");
			}
			return this.document.execCommand("inserthorizontalrule", false, argument);
		},

		_unlinkImpl: function(argument){
			// summary:
			//		This function implements the unlink of an 'a' tag.
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			if((this.queryCommandEnabled("unlink")) && (has("mozilla") || has("webkit"))){
				var a = this.selection.getAncestorElement("a");
				this.selection.selectElement(a);
				return this.document.execCommand("unlink", false, null);
			}
			return this.document.execCommand("unlink", false, argument);
		},

		_hilitecolorImpl: function(argument){
			// summary:
			//		This function implements the hilitecolor command
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var returnValue;
			var isApplied = this._handleTextColorOrProperties("hilitecolor", argument);
			if(!isApplied){
				if(has("mozilla")){
					// mozilla doesn't support hilitecolor properly when useCSS is
					// set to false (bugzilla #279330)
					this.document.execCommand("styleWithCSS", false, true);
					console.log("Executing color command.");
					returnValue = this.document.execCommand("hilitecolor", false, argument);
					this.document.execCommand("styleWithCSS", false, false);
				}else{
					returnValue = this.document.execCommand("hilitecolor", false, argument);
				}
			}
			return returnValue;
		},

		_backcolorImpl: function(argument){
			// summary:
			//		This function implements the backcolor command
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			if(has("ie")){
				// Tested under IE 6 XP2, no problem here, comment out
				// IE weirdly collapses ranges when we exec these commands, so prevent it
				//	var tr = this.document.selection.createRange();
				argument = argument ? argument : null;
			}
			var isApplied = this._handleTextColorOrProperties("backcolor", argument);
			if(!isApplied){
				isApplied = this.document.execCommand("backcolor", false, argument);
			}
			return isApplied;
		},

		_forecolorImpl: function(argument){
			// summary:
			//		This function implements the forecolor command
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			if(has("ie")){
				// Tested under IE 6 XP2, no problem here, comment out
				// IE weirdly collapses ranges when we exec these commands, so prevent it
				//	var tr = this.document.selection.createRange();
				argument = argument ? argument : null;
			}
			var isApplied = false;
			isApplied = this._handleTextColorOrProperties("forecolor", argument);
			if(!isApplied){
				isApplied = this.document.execCommand("forecolor", false, argument);
			}
			return isApplied;
		},

		_inserthtmlImpl: function(argument){
			// summary:
			//		This function implements the insertion of HTML content into
			//		a point on the page.
			// argument:
			//		The content to insert, if any.
			// tags:
			//		protected
			argument = this._preFilterContent(argument);
			var rv = true;
			if(has("ie")){
				var insertRange = this.document.selection.createRange();
				if(this.document.selection.type.toUpperCase() === 'CONTROL'){
					var n = insertRange.item(0);
					while(insertRange.length){
						insertRange.remove(insertRange.item(0));
					}
					n.outerHTML = argument;
				}else{
					insertRange.pasteHTML(argument);
				}
				insertRange.select();
				//insertRange.collapse(true);
			}else if(has("mozilla") && !argument.length){
				//mozilla can not inserthtml an empty html to delete current selection
				//so we delete the selection instead in this case
				this.selection.remove(); // FIXME
			}else{
				rv = this.document.execCommand("inserthtml", false, argument);
			}
			return rv;
		},

		_boldImpl: function(argument){
			// summary:
			//		This function implements an over-ride of the bold command.
			// argument:
			//		Not used, operates by selection.
			// tags:
			//		protected
			var applied = false;
			if(has("ie")){
				this._adaptIESelection();
				applied = this._adaptIEFormatAreaAndExec("bold");
			}
			if(!applied){
				applied = this.document.execCommand("bold", false, argument);
			}
			return applied;
		},

		_italicImpl: function(argument){
			// summary:
			//		This function implements an over-ride of the italic command.
			// argument:
			//		Not used, operates by selection.
			// tags:
			//		protected
			var applied = false;
			if(has("ie")){
				this._adaptIESelection();
				applied = this._adaptIEFormatAreaAndExec("italic");
			}
			if(!applied){
				applied = this.document.execCommand("italic", false, argument);
			}
			return applied;
		},

		_underlineImpl: function(argument){
			// summary:
			//		This function implements an over-ride of the underline command.
			// argument:
			//		Not used, operates by selection.
			// tags:
			//		protected
			var applied = false;
			if(has("ie")){
				this._adaptIESelection();
				applied = this._adaptIEFormatAreaAndExec("underline");
			}
			if(!applied){
				applied = this.document.execCommand("underline", false, argument);
			}
			return applied;
		},

		_strikethroughImpl: function(argument){
			// summary:
			//		This function implements an over-ride of the strikethrough command.
			// argument:
			//		Not used, operates by selection.
			// tags:
			//		protected
			var applied = false;
			if(has("ie")){
				this._adaptIESelection();
				applied = this._adaptIEFormatAreaAndExec("strikethrough");
			}
			if(!applied){
				applied = this.document.execCommand("strikethrough", false, argument);
			}
			return applied;
		},

		_superscriptImpl: function(argument){
			// summary:
			//		This function implements an over-ride of the superscript command.
			// argument:
			//		Not used, operates by selection.
			// tags:
			//		protected
			var applied = false;
			if(has("ie")){
				this._adaptIESelection();
				applied = this._adaptIEFormatAreaAndExec("superscript");
			}
			if(!applied){
				applied = this.document.execCommand("superscript", false, argument);
			}
			return applied;
		},

		_subscriptImpl: function(argument){
			// summary:
			//		This function implements an over-ride of the superscript command.
			// argument:
			//		Not used, operates by selection.
			// tags:
			//		protected
			var applied = false;
			if(has("ie")){
				this._adaptIESelection();
				applied = this._adaptIEFormatAreaAndExec("subscript");

			}
			if(!applied){
				applied = this.document.execCommand("subscript", false, argument);
			}
			return applied;
		},

		_fontnameImpl: function(argument){
			// summary:
			//		This function implements the fontname command
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var isApplied;
			if(has("ie")){
				isApplied = this._handleTextColorOrProperties("fontname", argument);
			}
			if(!isApplied){
				isApplied = this.document.execCommand("fontname", false, argument);
			}
			return isApplied;
		},

		_fontsizeImpl: function(argument){
			// summary:
			//		This function implements the fontsize command
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var isApplied;
			if(has("ie")){
				isApplied = this._handleTextColorOrProperties("fontsize", argument);
			}
			if(!isApplied){
				isApplied = this.document.execCommand("fontsize", false, argument);
			}
			return isApplied;
		},

		_insertorderedlistImpl: function(argument){
			// summary:
			//		This function implements the insertorderedlist command
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var applied = false;
			if(has("ie")){
				applied = this._adaptIEList("insertorderedlist", argument);
			}
			if(!applied){
				applied = this.document.execCommand("insertorderedlist", false, argument);
			}
			return applied;
		},

		_insertunorderedlistImpl: function(argument){
			// summary:
			//		This function implements the insertunorderedlist command
			// argument:
			//		arguments to the exec command, if any.
			// tags:
			//		protected
			var applied = false;
			if(has("ie")){
				applied = this._adaptIEList("insertunorderedlist", argument);
			}
			if(!applied){
				applied = this.document.execCommand("insertunorderedlist", false, argument);
			}
			return applied;
		},

		getHeaderHeight: function(){
			// summary:
			//		A function for obtaining the height of the header node
			return this._getNodeChildrenHeight(this.header); // Number
		},

		getFooterHeight: function(){
			// summary:
			//		A function for obtaining the height of the footer node
			return this._getNodeChildrenHeight(this.footer); // Number
		},

		_getNodeChildrenHeight: function(node){
			// summary:
			//		An internal function for computing the cumulative height of all child nodes of 'node'
			// node:
			//		The node to process the children of;
			var h = 0;
			if(node && node.childNodes){
				// IE didn't compute it right when position was obtained on the node directly is some cases,
				// so we have to walk over all the children manually.
				var i;
				for(i = 0; i < node.childNodes.length; i++){
					var size = domGeometry.position(node.childNodes[i]);
					h += size.h;
				}
			}
			return h; // Number
		},

		_isNodeEmpty: function(node, startOffset){
			// summary:
			//		Function to test if a node is devoid of real content.
			// node:
			//		The node to check.
			// tags:
			//		private.
			if(node.nodeType === 1/*element*/){
				if(node.childNodes.length > 0){
					return this._isNodeEmpty(node.childNodes[0], startOffset);
				}
				return true;
			}else if(node.nodeType === 3/*text*/){
				return (node.nodeValue.substring(startOffset) === "");
			}
			return false;
		},

		_removeStartingRangeFromRange: function(node, range){
			// summary:
			//		Function to adjust selection range by removing the current
			//		start node.
			// node:
			//		The node to remove from the starting range.
			// range:
			//		The range to adapt.
			// tags:
			//		private
			if(node.nextSibling){
				range.setStart(node.nextSibling, 0);
			}else{
				var parent = node.parentNode;
				while(parent && parent.nextSibling == null){
					//move up the tree until we find a parent that has another node, that node will be the next node
					parent = parent.parentNode;
				}
				if(parent){
					range.setStart(parent.nextSibling, 0);
				}
			}
			return range;
		},

		_adaptIESelection: function(){
			// summary:
			//		Function to adapt the IE range by removing leading 'newlines'
			//		Needed to fix issue with bold/italics/underline not working if
			//		range included leading 'newlines'.
			//		In IE, if a user starts a selection at the very end of a line,
			//		then the native browser commands will fail to execute correctly.
			//		To work around the issue,  we can remove all empty nodes from
			//		the start of the range selection.
			var selection = rangeapi.getSelection(this.window);
			if(selection && selection.rangeCount && !selection.isCollapsed){
				var range = selection.getRangeAt(0);
				var firstNode = range.startContainer;
				var startOffset = range.startOffset;

				while(firstNode.nodeType === 3/*text*/ && startOffset >= firstNode.length && firstNode.nextSibling){
					//traverse the text nodes until we get to the one that is actually highlighted
					startOffset = startOffset - firstNode.length;
					firstNode = firstNode.nextSibling;
				}

				//Remove the starting ranges until the range does not start with an empty node.
				var lastNode = null;
				while(this._isNodeEmpty(firstNode, startOffset) && firstNode !== lastNode){
					lastNode = firstNode; //this will break the loop in case we can't find the next sibling
					range = this._removeStartingRangeFromRange(firstNode, range); //move the start container to the next node in the range
					firstNode = range.startContainer;
					startOffset = 0; //start at the beginning of the new starting range
				}
				selection.removeAllRanges();// this will work as long as users cannot select multiple ranges. I have not been able to do that in the editor.
				selection.addRange(range);
			}
		},

		_adaptIEFormatAreaAndExec: function(command){
			// summary:
			//		Function to handle IE's quirkiness regarding how it handles
			//		format commands on a word.  This involves a lit of node splitting
			//		and format cloning.
			// command:
			//		The format command, needed to check if the desired
			//		command is true or not.
			var selection = rangeapi.getSelection(this.window);
			var doc = this.document;
			var rs, ret, range, txt, startNode, endNode, breaker, sNode;
			if(command && selection && selection.isCollapsed){
				var isApplied = this.queryCommandValue(command);
				if(isApplied){

					// We have to split backwards until we hit the format
					var nNames = this._tagNamesForCommand(command);
					range = selection.getRangeAt(0);
					var fs = range.startContainer;
					if(fs.nodeType === 3){
						var offset = range.endOffset;
						if(fs.length < offset){
							//We are not looking from the right node, try to locate the correct one
							ret = this._adjustNodeAndOffset(rs, offset);
							fs = ret.node;
							offset = ret.offset;
						}
					}
					var topNode;
					while(fs && fs !== this.editNode){
						// We have to walk back and see if this is still a format or not.
						// Hm, how do I do this?
						var tName = fs.tagName ? fs.tagName.toLowerCase() : "";
						if(array.indexOf(nNames, tName) > -1){
							topNode = fs;
							break;
						}
						fs = fs.parentNode;
					}

					// Okay, we have a stopping place, time to split things apart.
					if(topNode){
						// Okay, we know how far we have to split backwards, so we have to split now.
						rs = range.startContainer;
						var newblock = doc.createElement(topNode.tagName);
						domConstruct.place(newblock, topNode, "after");
						if(rs && rs.nodeType === 3){
							// Text node, we have to split it.
							var nodeToMove, tNode;
							var endOffset = range.endOffset;
							if(rs.length < endOffset){
								//We are not splitting the right node, try to locate the correct one
								ret = this._adjustNodeAndOffset(rs, endOffset);
								rs = ret.node;
								endOffset = ret.offset;
							}

							txt = rs.nodeValue;
							startNode = doc.createTextNode(txt.substring(0, endOffset));
							var endText = txt.substring(endOffset, txt.length);
							if(endText){
								endNode = doc.createTextNode(endText);
							}
							// Place the split, then remove original nodes.
							domConstruct.place(startNode, rs, "before");
							if(endNode){
								breaker = doc.createElement("span");
								breaker.className = "ieFormatBreakerSpan";
								domConstruct.place(breaker, rs, "after");
								domConstruct.place(endNode, breaker, "after");
								endNode = breaker;
							}
							domConstruct.destroy(rs);

							// Okay, we split the text.  Now we need to see if we're
							// parented to the block element we're splitting and if
							// not, we have to split all the way up.  Ugh.
							var parentC = startNode.parentNode;
							var tagList = [];
							var tagData;
							while(parentC !== topNode){
								var tg = parentC.tagName;
								tagData = {tagName: tg};
								tagList.push(tagData);

								var newTg = doc.createElement(tg);
								// Clone over any 'style' data.
								if(parentC.style){
									if(newTg.style){
										if(parentC.style.cssText){
											newTg.style.cssText = parentC.style.cssText;
											tagData.cssText = parentC.style.cssText;
										}
									}
								}
								// If font also need to clone over any font data.
								if(parentC.tagName === "FONT"){
									if(parentC.color){
										newTg.color = parentC.color;
										tagData.color = parentC.color;
									}
									if(parentC.face){
										newTg.face = parentC.face;
										tagData.face = parentC.face;
									}
									if(parentC.size){  // this check was necessary on IE
										newTg.size = parentC.size;
										tagData.size = parentC.size;
									}
								}
								if(parentC.className){
									newTg.className = parentC.className;
									tagData.className = parentC.className;
								}

								// Now move end node and every sibling
								// after it over into the new tag.
								if(endNode){
									nodeToMove = endNode;
									while(nodeToMove){
										tNode = nodeToMove.nextSibling;
										newTg.appendChild(nodeToMove);
										nodeToMove = tNode;
									}
								}
								if(newTg.tagName == parentC.tagName){
									breaker = doc.createElement("span");
									breaker.className = "ieFormatBreakerSpan";
									domConstruct.place(breaker, parentC, "after");
									domConstruct.place(newTg, breaker, "after");
								}else{
									domConstruct.place(newTg, parentC, "after");
								}
								startNode = parentC;
								endNode = newTg;
								parentC = parentC.parentNode;
							}

							// Lastly, move the split out all the split tags
							// to the new block as they should now be split properly.
							if(endNode){
								nodeToMove = endNode;
								if(nodeToMove.nodeType === 1 || (nodeToMove.nodeType === 3 && nodeToMove.nodeValue)){
									// Non-blank text and non-text nodes need to clear out that blank space
									// before moving the contents.
									newblock.innerHTML = "";
								}
								while(nodeToMove){
									tNode = nodeToMove.nextSibling;
									newblock.appendChild(nodeToMove);
									nodeToMove = tNode;
								}
							}

							// We had intermediate tags, we have to now recreate them inbetween the split
							// and restore what styles, classnames, etc, we can.
							var newrange;
							if(tagList.length){
								tagData = tagList.pop();
								var newContTag = doc.createElement(tagData.tagName);
								if(tagData.cssText && newContTag.style){
									newContTag.style.cssText = tagData.cssText;
								}
								if(tagData.className){
									newContTag.className = tagData.className;
								}
								if(tagData.tagName === "FONT"){
									if(tagData.color){
										newContTag.color = tagData.color;
									}
									if(tagData.face){
										newContTag.face = tagData.face;
									}
									if(tagData.size){
										newContTag.size = tagData.size;
									}
								}
								domConstruct.place(newContTag, newblock, "before");
								while(tagList.length){
									tagData = tagList.pop();
									var newTgNode = doc.createElement(tagData.tagName);
									if(tagData.cssText && newTgNode.style){
										newTgNode.style.cssText = tagData.cssText;
									}
									if(tagData.className){
										newTgNode.className = tagData.className;
									}
									if(tagData.tagName === "FONT"){
										if(tagData.color){
											newTgNode.color = tagData.color;
										}
										if(tagData.face){
											newTgNode.face = tagData.face;
										}
										if(tagData.size){
											newTgNode.size = tagData.size;
										}
									}
									newContTag.appendChild(newTgNode);
									newContTag = newTgNode;
								}

								// Okay, everything is theoretically split apart and removed from the content
								// so insert the dummy text to select, select it, then
								// clear to position cursor.
								sNode = doc.createTextNode(".");
								breaker.appendChild(sNode);
								newContTag.appendChild(sNode);
								newrange = rangeapi.create(this.window);
								newrange.setStart(sNode, 0);
								newrange.setEnd(sNode, sNode.length);
								selection.removeAllRanges();
								selection.addRange(newrange);
								this.selection.collapse(false);
								sNode.parentNode.innerHTML = "";
							}else{
								// No extra tags, so we have to insert a breaker point and rely
								// on filters to remove it later.
								breaker = doc.createElement("span");
								breaker.className = "ieFormatBreakerSpan";
								sNode = doc.createTextNode(".");
								breaker.appendChild(sNode);
								domConstruct.place(breaker, newblock, "before");
								newrange = rangeapi.create(this.window);
								newrange.setStart(sNode, 0);
								newrange.setEnd(sNode, sNode.length);
								selection.removeAllRanges();
								selection.addRange(newrange);
								this.selection.collapse(false);
								sNode.parentNode.innerHTML = "";
							}
							if(!newblock.firstChild){
								// Empty, we don't need it.  Split was at end or similar
								// So, remove it.
								domConstruct.destroy(newblock);
							}
							return true;
						}
					}
					return false;
				}else{
					range = selection.getRangeAt(0);
					rs = range.startContainer;
					if(rs && rs.nodeType === 3){
						// Text node, we have to split it.
						var offset = range.startOffset;
						if(rs.length < offset){
							//We are not splitting the right node, try to locate the correct one
							ret = this._adjustNodeAndOffset(rs, offset);
							rs = ret.node;
							offset = ret.offset;
						}
						txt = rs.nodeValue;
						startNode = doc.createTextNode(txt.substring(0, offset));
						var endText = txt.substring(offset);
						if(endText !== ""){
							endNode = doc.createTextNode(txt.substring(offset));
						}
						// Create a space, we'll select and bold it, so
						// the whole word doesn't get bolded
						breaker = doc.createElement("span");
						sNode = doc.createTextNode(".");
						breaker.appendChild(sNode);
						if(startNode.length){
							domConstruct.place(startNode, rs, "after");
						}else{
							startNode = rs;
						}
						domConstruct.place(breaker, startNode, "after");
						if(endNode){
							domConstruct.place(endNode, breaker, "after");
						}
						domConstruct.destroy(rs);
						var newrange = rangeapi.create(this.window);
						newrange.setStart(sNode, 0);
						newrange.setEnd(sNode, sNode.length);
						selection.removeAllRanges();
						selection.addRange(newrange);
						doc.execCommand(command);
						domConstruct.place(breaker.firstChild, breaker, "before");
						domConstruct.destroy(breaker);
						newrange.setStart(sNode, 0);
						newrange.setEnd(sNode, sNode.length);
						selection.removeAllRanges();
						selection.addRange(newrange);
						this.selection.collapse(false);
						sNode.parentNode.innerHTML = "";
						return true;
					}
				}
			}else{
				return false;
			}
		},

		_adaptIEList: function(command /*===== , argument =====*/){
			// summary:
			//		This function handles normalizing the IE list behavior as
			//		much as possible.
			// command:
			//		The list command to execute.
			// argument:
			//		Any additional argument.
			// tags:
			//		private
			var selection = rangeapi.getSelection(this.window);
			if(selection.isCollapsed){
				// In the case of no selection, lets commonize the behavior and
				// make sure that it indents if needed.
				if(selection.rangeCount && !this.queryCommandValue(command)){
					var range = selection.getRangeAt(0);
					var sc = range.startContainer;
					if(sc && sc.nodeType == 3){
						// text node.  Lets see if there is a node before it that isn't
						// some sort of breaker.
						if(!range.startOffset){
							// We're at the beginning of a text area.  It may have been br split
							// Who knows?  In any event, we must create the list manually
							// or IE may shove too much into the list element.  It seems to
							// grab content before the text node too if it's br split.
							// Why can't IE work like everyone else?

							// Create a space, we'll select and bold it, so
							// the whole word doesn't get bolded
							var lType = "ul";
							if(command === "insertorderedlist"){
								lType = "ol";
							}
							var list = this.document.createElement(lType);
							var li = domConstruct.create("li", null, list);
							domConstruct.place(list, sc, "before");
							// Move in the text node as part of the li.
							li.appendChild(sc);
							// We need a br after it or the enter key handler
							// sometimes throws errors.
							domConstruct.create("br", null, list, "after");
							// Okay, now lets move our cursor to the beginning.
							var newrange = rangeapi.create(this.window);
							newrange.setStart(sc, 0);
							newrange.setEnd(sc, sc.length);
							selection.removeAllRanges();
							selection.addRange(newrange);
							this.selection.collapse(true);
							return true;
						}
					}
				}
			}
			return false;
		},

		_handleTextColorOrProperties: function(command, argument){
			// summary:
			//		This function handles appplying text color as best it is
			//		able to do so when the selection is collapsed, making the
			//		behavior cross-browser consistent. It also handles the name
			//		and size for IE.
			// command:
			//		The command.
			// argument:
			//		Any additional arguments.
			// tags:
			//		private
			var selection = rangeapi.getSelection(this.window);
			var doc = this.document;
			var rs, ret, range, txt, startNode, endNode, breaker, sNode;
			argument = argument || null;
			if(command && selection && selection.isCollapsed){
				if(selection.rangeCount){
					range = selection.getRangeAt(0);
					rs = range.startContainer;
					if(rs && rs.nodeType === 3){
						// Text node, we have to split it.
						var offset = range.startOffset;
						if(rs.length < offset){
							//We are not splitting the right node, try to locate the correct one
							ret = this._adjustNodeAndOffset(rs, offset);
							rs = ret.node;
							offset = ret.offset;
						}
						txt = rs.nodeValue;
						startNode = doc.createTextNode(txt.substring(0, offset));
						var endText = txt.substring(offset);
						if(endText !== ""){
							endNode = doc.createTextNode(txt.substring(offset));
						}
						// Create a space, we'll select and bold it, so
						// the whole word doesn't get bolded
						breaker = doc.createElement("span");
						sNode = doc.createTextNode(".");
						breaker.appendChild(sNode);
						// Create a junk node to avoid it trying to style the breaker.
						// This will get destroyed later.
						var extraSpan = doc.createElement("span");
						breaker.appendChild(extraSpan);
						if(startNode.length){
							domConstruct.place(startNode, rs, "after");
						}else{
							startNode = rs;
						}
						domConstruct.place(breaker, startNode, "after");
						if(endNode){
							domConstruct.place(endNode, breaker, "after");
						}
						domConstruct.destroy(rs);
						var newrange = rangeapi.create(this.window);
						newrange.setStart(sNode, 0);
						newrange.setEnd(sNode, sNode.length);
						selection.removeAllRanges();
						selection.addRange(newrange);
						if(has("webkit")){
							// WebKit is frustrating with positioning the cursor.
							// It stinks to have a selected space, but there really
							// isn't much choice here.
							var style = "color";
							if(command === "hilitecolor" || command === "backcolor"){
								style = "backgroundColor";
							}
							domStyle.set(breaker, style, argument);
							this.selection.remove();
							domConstruct.destroy(extraSpan);
							breaker.innerHTML = "&#160;";	// &nbsp;
							this.selection.selectElement(breaker);
							this.focus();
						}else{
							this.execCommand(command, argument);
							domConstruct.place(breaker.firstChild, breaker, "before");
							domConstruct.destroy(breaker);
							newrange.setStart(sNode, 0);
							newrange.setEnd(sNode, sNode.length);
							selection.removeAllRanges();
							selection.addRange(newrange);
							this.selection.collapse(false);
							sNode.parentNode.removeChild(sNode);
						}
						return true;
					}
				}
			}
			return false;
		},

		_adjustNodeAndOffset: function(/*DomNode*/node, /*Int*/offset){
			// summary:
			//		In the case there are multiple text nodes in a row the offset may not be within the node.
			//		If the offset is larger than the node length, it will attempt to find
			//		the next text sibling until it locates the text node in which the offset refers to
			// node:
			//		The node to check.
			// offset:
			//		The position to find within the text node
			// tags:
			//		private.
			while(node.length < offset && node.nextSibling && node.nextSibling.nodeType === 3){
				//Adjust the offset and node in the case of multiple text nodes in a row
				offset = offset - node.length;
				node = node.nextSibling;
			}
			return {"node": node, "offset": offset};
		},

		_tagNamesForCommand: function(command){
			// summary:
			//		Function to return the tab names that are associated
			//		with a particular style.
			// command: String
			//		The command to return tags for.
			// tags:
			//		private
			if(command === "bold"){
				return ["b", "strong"];
			}else if(command === "italic"){
				return ["i", "em"];
			}else if(command === "strikethrough"){
				return ["s", "strike"];
			}else if(command === "superscript"){
				return ["sup"];
			}else if(command === "subscript"){
				return ["sub"];
			}else if(command === "underline"){
				return ["u"];
			}
			return [];
		},

		_stripBreakerNodes: function(/*DOMNode*/ node){
			// summary:
			//		Function for stripping out the breaker spans inserted by the formatting command.
			//		Registered as a filter for IE, handles the breaker spans needed to fix up
			//		How bold/italic/etc, work when selection is collapsed (single cursor).
			if(!this.isLoaded){
				return;
			} // this method requires init to be complete
			query(".ieFormatBreakerSpan", node).forEach(function(b){
				while(b.firstChild){
					domConstruct.place(b.firstChild, b, "before");
				}
				domConstruct.destroy(b);
			});
			return node;
		}
	});

	return RichText;

});

},
'dojo/request':function(){
define([
	'./request/default!'/*=====,
	'./_base/declare',
	'./promise/Promise' =====*/
], function(request/*=====, declare, Promise =====*/){
	/*=====
	request = function(url, options){
		// summary:
		//		Send a request using the default transport for the current platform.
		// url: String
		//		The URL to request.
		// options: dojo/request.__Options?
		//		Options for the request.
		// returns: dojo/request.__Promise
	};
	request.__Promise = declare(Promise, {
		// response: dojo/promise/Promise
		//		A promise resolving to an object representing
		//		the response from the server.
	});
	request.__BaseOptions = declare(null, {
		// query: String|Object?
		//		Query parameters to append to the URL.
		// data: String|Object?
		//		Data to transfer.  This is ignored for GET and DELETE
		//		requests.
		// preventCache: Boolean?
		//		Whether to append a cache-busting parameter to the URL.
		// timeout: Integer?
		//		Milliseconds to wait for the response.  If this time
		//		passes, the then the promise is rejected.
		// handleAs: String?
		//		How to handle the response from the server.  Default is
		//		'text'.  Other values are 'json', 'javascript', and 'xml'.
	});
	request.__MethodOptions = declare(null, {
		// method: String?
		//		The HTTP method to use to make the request.  Must be
		//		uppercase.
	});
	request.__Options = declare([request.__BaseOptions, request.__MethodOptions]);

	request.get = function(url, options){
		// summary:
		//		Send an HTTP GET request using the default transport for the current platform.
		// url: String
		//		URL to request
		// options: dojo/request.__BaseOptions?
		//		Options for the request.
		// returns: dojo/request.__Promise
	};
	request.post = function(url, options){
		// summary:
		//		Send an HTTP POST request using the default transport for the current platform.
		// url: String
		//		URL to request
		// options: dojo/request.__BaseOptions?
		//		Options for the request.
		// returns: dojo/request.__Promise
	};
	request.put = function(url, options){
		// summary:
		//		Send an HTTP POST request using the default transport for the current platform.
		// url: String
		//		URL to request
		// options: dojo/request.__BaseOptions?
		//		Options for the request.
		// returns: dojo/request.__Promise
	};
	request.del = function(url, options){
		// summary:
		//		Send an HTTP DELETE request using the default transport for the current platform.
		// url: String
		//		URL to request
		// options: dojo/request.__BaseOptions?
		//		Options for the request.
		// returns: dojo/request.__Promise
	};
	=====*/
	return request;
});

},
'dijit/a11y':function(){
define([
	"dojo/_base/array", // array.forEach array.map
	"dojo/dom",			// dom.byId
	"dojo/dom-attr", // domAttr.attr domAttr.has
	"dojo/dom-style", // domStyle.style
	"dojo/_base/lang", // lang.mixin()
	"dojo/sniff", // has("ie")  1 
	"./main"	// for exporting methods to dijit namespace
], function(array, dom, domAttr, domStyle, lang, has, dijit){

	// module:
	//		dijit/a11y

	var a11y = {
		// summary:
		//		Accessibility utility functions (keyboard, tab stops, etc.)

		_isElementShown: function(/*Element*/ elem){
			var s = domStyle.get(elem);
			return (s.visibility != "hidden")
				&& (s.visibility != "collapsed")
				&& (s.display != "none")
				&& (domAttr.get(elem, "type") != "hidden");
		},

		hasDefaultTabStop: function(/*Element*/ elem){
			// summary:
			//		Tests if element is tab-navigable even without an explicit tabIndex setting

			// No explicit tabIndex setting, need to investigate node type
			switch(elem.nodeName.toLowerCase()){
				case "a":
					// An <a> w/out a tabindex is only navigable if it has an href
					return domAttr.has(elem, "href");
				case "area":
				case "button":
				case "input":
				case "object":
				case "select":
				case "textarea":
					// These are navigable by default
					return true;
				case "iframe":
					// If it's an editor <iframe> then it's tab navigable.
					var body;
					try{
						// non-IE
						var contentDocument = elem.contentDocument;
						if("designMode" in contentDocument && contentDocument.designMode == "on"){
							return true;
						}
						body = contentDocument.body;
					}catch(e1){
						// contentWindow.document isn't accessible within IE7/8
						// if the iframe.src points to a foreign url and this
						// page contains an element, that could get focus
						try{
							body = elem.contentWindow.document.body;
						}catch(e2){
							return false;
						}
					}
					return body && (body.contentEditable == 'true' ||
						(body.firstChild && body.firstChild.contentEditable == 'true'));
				default:
					return elem.contentEditable == 'true';
			}
		},

		isTabNavigable: function(/*Element*/ elem){
			// summary:
			//		Tests if an element is tab-navigable

			// TODO: convert (and rename method) to return effective tabIndex; will save time in _getTabNavigable()
			if(domAttr.get(elem, "disabled")){
				return false;
			}else if(domAttr.has(elem, "tabIndex")){
				// Explicit tab index setting
				return domAttr.get(elem, "tabIndex") >= 0; // boolean
			}else{
				// No explicit tabIndex setting, so depends on node type
				return a11y.hasDefaultTabStop(elem);
			}
		},

		_getTabNavigable: function(/*DOMNode*/ root){
			// summary:
			//		Finds descendants of the specified root node.
			// description:
			//		Finds the following descendants of the specified root node:
			//
			//		- the first tab-navigable element in document order
			//		  without a tabIndex or with tabIndex="0"
			//		- the last tab-navigable element in document order
			//		  without a tabIndex or with tabIndex="0"
			//		- the first element in document order with the lowest
			//		  positive tabIndex value
			//		- the last element in document order with the highest
			//		  positive tabIndex value
			var first, last, lowest, lowestTabindex, highest, highestTabindex, radioSelected = {};

			function radioName(node){
				// If this element is part of a radio button group, return the name for that group.
				return node && node.tagName.toLowerCase() == "input" &&
					node.type && node.type.toLowerCase() == "radio" &&
					node.name && node.name.toLowerCase();
			}

			var shown = a11y._isElementShown, isTabNavigable = a11y.isTabNavigable;
			var walkTree = function(/*DOMNode*/ parent){
				for(var child = parent.firstChild; child; child = child.nextSibling){
					// Skip text elements, hidden elements, and also non-HTML elements (those in custom namespaces) in IE,
					// since show() invokes getAttribute("type"), which crash on VML nodes in IE.
					if(child.nodeType != 1 || (has("ie") <= 9 && child.scopeName !== "HTML") || !shown(child)){
						continue;
					}

					if(isTabNavigable(child)){
						var tabindex = +domAttr.get(child, "tabIndex");	// + to convert string --> number
						if(!domAttr.has(child, "tabIndex") || tabindex == 0){
							if(!first){
								first = child;
							}
							last = child;
						}else if(tabindex > 0){
							if(!lowest || tabindex < lowestTabindex){
								lowestTabindex = tabindex;
								lowest = child;
							}
							if(!highest || tabindex >= highestTabindex){
								highestTabindex = tabindex;
								highest = child;
							}
						}
						var rn = radioName(child);
						if(domAttr.get(child, "checked") && rn){
							radioSelected[rn] = child;
						}
					}
					if(child.nodeName.toUpperCase() != 'SELECT'){
						walkTree(child);
					}
				}
			};
			if(shown(root)){
				walkTree(root);
			}
			function rs(node){
				// substitute checked radio button for unchecked one, if there is a checked one with the same name.
				return radioSelected[radioName(node)] || node;
			}

			return { first: rs(first), last: rs(last), lowest: rs(lowest), highest: rs(highest) };
		},

		getFirstInTabbingOrder: function(/*String|DOMNode*/ root, /*Document?*/ doc){
			// summary:
			//		Finds the descendant of the specified root node
			//		that is first in the tabbing order
			var elems = a11y._getTabNavigable(dom.byId(root, doc));
			return elems.lowest ? elems.lowest : elems.first; // DomNode
		},

		getLastInTabbingOrder: function(/*String|DOMNode*/ root, /*Document?*/ doc){
			// summary:
			//		Finds the descendant of the specified root node
			//		that is last in the tabbing order
			var elems = a11y._getTabNavigable(dom.byId(root, doc));
			return elems.last ? elems.last : elems.highest; // DomNode
		}
	};

	 1  && lang.mixin(dijit, a11y);

	return a11y;
});

},
'dijit/form/DropDownButton':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // hitch
	"dojo/query", // query
	"../registry", // registry.byNode
	"../popup", // dijit.popup2.hide
	"./Button",
	"../_Container",
	"../_HasDropDown",
	"dojo/text!./templates/DropDownButton.html"
], function(declare, lang, query, registry, popup, Button, _Container, _HasDropDown, template){

	// module:
	//		dijit/form/DropDownButton

	return declare("dijit.form.DropDownButton", [Button, _Container, _HasDropDown], {
		// summary:
		//		A button with a drop down
		//
		// example:
		// |	<button data-dojo-type="dijit/form/DropDownButton">
		// |		Hello world
		// |		<div data-dojo-type="dijit/Menu">...</div>
		// |	</button>
		//
		// example:
		// |	var button1 = new DropDownButton({ label: "hi", dropDown: new dijit.Menu(...) });
		// |	win.body().appendChild(button1);
		//

		baseClass: "dijitDropDownButton",

		templateString: template,

		_fillContent: function(){
			// Overrides Button._fillContent().
			//
			// My inner HTML contains both the button contents and a drop down widget, like
			// <DropDownButton>  <span>push me</span>  <Menu> ... </Menu> </DropDownButton>
			// The first node is assumed to be the button content. The widget is the popup.

			if(this.srcNodeRef){ // programatically created buttons might not define srcNodeRef
				//FIXME: figure out how to filter out the widget and use all remaining nodes as button
				//	content, not just nodes[0]
				var nodes = query("*", this.srcNodeRef);
				this.inherited(arguments, [nodes[0]]);

				// save pointer to srcNode so we can grab the drop down widget after it's instantiated
				this.dropDownContainer = this.srcNodeRef;
			}
		},

		startup: function(){
			if(this._started){
				return;
			}

			// the child widget from srcNodeRef is the dropdown widget.  Insert it in the page DOM,
			// make it invisible, and store a reference to pass to the popup code.
			if(!this.dropDown && this.dropDownContainer){
				var dropDownNode = query("[widgetId]", this.dropDownContainer)[0];
				if(dropDownNode){
					this.dropDown = registry.byNode(dropDownNode);
				}
				delete this.dropDownContainer;
			}
			if(this.dropDown){
				popup.hide(this.dropDown);
			}

			this.inherited(arguments);
		},

		isLoaded: function(){
			// Returns whether or not we are loaded - if our dropdown has an href,
			// then we want to check that.
			var dropDown = this.dropDown;
			return (!!dropDown && (!dropDown.href || dropDown.isLoaded));
		},

		loadDropDown: function(/*Function*/ callback){
			// Default implementation assumes that drop down already exists,
			// but hasn't loaded it's data (ex: ContentPane w/href).
			// App must override if the drop down is lazy-created.
			var dropDown = this.dropDown;
			var handler = dropDown.on("load", lang.hitch(this, function(){
				handler.remove();
				callback();
			}));
			dropDown.refresh();		// tell it to load
		},

		isFocusable: function(){
			// Overridden so that focus is handled by the _HasDropDown mixin, not by
			// the _FormWidget mixin.
			return this.inherited(arguments) && !this._mouseDown;
		}
	});
});

},
'dijit/_base/focus':function(){
define([
	"dojo/_base/array", // array.forEach
	"dojo/dom", // dom.isDescendant
	"dojo/_base/lang", // lang.isArray
	"dojo/topic", // publish
	"dojo/_base/window", // win.doc win.doc.selection win.global win.global.getSelection win.withGlobal
	"../focus",
	"../selection",
	"../main"	// for exporting symbols to dijit
], function(array, dom, lang, topic, win, focus, selection, dijit){

	// module:
	//		dijit/_base/focus

	var exports = {
		// summary:
		//		Deprecated module to monitor currently focused node and stack of currently focused widgets.
		//		New code should access dijit/focus directly.

		// _curFocus: DomNode
		//		Currently focused item on screen
		_curFocus: null,

		// _prevFocus: DomNode
		//		Previously focused item on screen
		_prevFocus: null,

		isCollapsed: function(){
			// summary:
			//		Returns true if there is no text selected
			return dijit.getBookmark().isCollapsed;
		},

		getBookmark: function(){
			// summary:
			//		Retrieves a bookmark that can be used with moveToBookmark to return to the same range
			var sel = win.global == window ? selection : new selection.SelectionManager(win.global);
			return sel.getBookmark();
		},

		moveToBookmark: function(/*Object*/ bookmark){
			// summary:
			//		Moves current selection to a bookmark
			// bookmark:
			//		This should be a returned object from dijit.getBookmark()

			var sel = win.global == window ? selection : new selection.SelectionManager(win.global);
			return sel.moveToBookmark(bookmark);
		},

		getFocus: function(/*Widget?*/ menu, /*Window?*/ openedForWindow){
			// summary:
			//		Called as getFocus(), this returns an Object showing the current focus
			//		and selected text.
			//
			//		Called as getFocus(widget), where widget is a (widget representing) a button
			//		that was just pressed, it returns where focus was before that button
			//		was pressed.   (Pressing the button may have either shifted focus to the button,
			//		or removed focus altogether.)   In this case the selected text is not returned,
			//		since it can't be accurately determined.
			//
			// menu: dijit/_WidgetBase|{domNode: DomNode} structure
			//		The button that was just pressed.  If focus has disappeared or moved
			//		to this button, returns the previous focus.  In this case the bookmark
			//		information is already lost, and null is returned.
			//
			// openedForWindow:
			//		iframe in which menu was opened
			//
			// returns:
			//		A handle to restore focus/selection, to be passed to `dijit.focus`
			var node = !focus.curNode || (menu && dom.isDescendant(focus.curNode, menu.domNode)) ? dijit._prevFocus : focus.curNode;
			return {
				node: node,
				bookmark: node && (node == focus.curNode) && win.withGlobal(openedForWindow || win.global, dijit.getBookmark),
				openedForWindow: openedForWindow
			}; // Object
		},

		// _activeStack: dijit/_WidgetBase[]
		//		List of currently active widgets (focused widget and it's ancestors)
		_activeStack: [],

		registerIframe: function(/*DomNode*/ iframe){
			// summary:
			//		Registers listeners on the specified iframe so that any click
			//		or focus event on that iframe (or anything in it) is reported
			//		as a focus/click event on the `<iframe>` itself.
			// description:
			//		Currently only used by editor.
			// returns:
			//		Handle to pass to unregisterIframe()
			return focus.registerIframe(iframe);
		},

		unregisterIframe: function(/*Object*/ handle){
			// summary:
			//		Unregisters listeners on the specified iframe created by registerIframe.
			//		After calling be sure to delete or null out the handle itself.
			// handle:
			//		Handle returned by registerIframe()

			handle && handle.remove();
		},

		registerWin: function(/*Window?*/targetWindow, /*DomNode?*/ effectiveNode){
			// summary:
			//		Registers listeners on the specified window (either the main
			//		window or an iframe's window) to detect when the user has clicked somewhere
			//		or focused somewhere.
			// description:
			//		Users should call registerIframe() instead of this method.
			// targetWindow:
			//		If specified this is the window associated with the iframe,
			//		i.e. iframe.contentWindow.
			// effectiveNode:
			//		If specified, report any focus events inside targetWindow as
			//		an event on effectiveNode, rather than on evt.target.
			// returns:
			//		Handle to pass to unregisterWin()

			return focus.registerWin(targetWindow, effectiveNode);
		},

		unregisterWin: function(/*Handle*/ handle){
			// summary:
			//		Unregisters listeners on the specified window (either the main
			//		window or an iframe's window) according to handle returned from registerWin().
			//		After calling be sure to delete or null out the handle itself.

			handle && handle.remove();
		}
	};

	// Override focus singleton's focus function so that dijit.focus()
	// has backwards compatible behavior of restoring selection (although
	// probably no one is using that).
	focus.focus = function(/*Object|DomNode */ handle){
		// summary:
		//		Sets the focused node and the selection according to argument.
		//		To set focus to an iframe's content, pass in the iframe itself.
		// handle:
		//		object returned by get(), or a DomNode

		if(!handle){ return; }

		var node = "node" in handle ? handle.node : handle,		// because handle is either DomNode or a composite object
			bookmark = handle.bookmark,
			openedForWindow = handle.openedForWindow,
			collapsed = bookmark ? bookmark.isCollapsed : false;

		// Set the focus
		// Note that for iframe's we need to use the <iframe> to follow the parentNode chain,
		// but we need to set focus to iframe.contentWindow
		if(node){
			var focusNode = (node.tagName.toLowerCase() == "iframe") ? node.contentWindow : node;
			if(focusNode && focusNode.focus){
				try{
					// Gecko throws sometimes if setting focus is impossible,
					// node not displayed or something like that
					focusNode.focus();
				}catch(e){/*quiet*/}
			}
			focus._onFocusNode(node);
		}

		// set the selection
		// do not need to restore if current selection is not empty
		// (use keyboard to select a menu item) or if previous selection was collapsed
		// as it may cause focus shift (Esp in IE).
		if(bookmark && win.withGlobal(openedForWindow || win.global, dijit.isCollapsed) && !collapsed){
			if(openedForWindow){
				openedForWindow.focus();
			}
			try{
				win.withGlobal(openedForWindow || win.global, dijit.moveToBookmark, null, [bookmark]);
			}catch(e2){
				/*squelch IE internal error, see http://trac.dojotoolkit.org/ticket/1984 */
			}
		}
	};

	// For back compatibility, monitor changes to focused node and active widget stack,
	// publishing events and copying changes from focus manager variables into dijit (top level) variables
	focus.watch("curNode", function(name, oldVal, newVal){
		dijit._curFocus = newVal;
		dijit._prevFocus = oldVal;
		if(newVal){
			topic.publish("focusNode", newVal);	// publish
		}
	});
	focus.watch("activeStack", function(name, oldVal, newVal){
		dijit._activeStack = newVal;
	});

	focus.on("widget-blur", function(widget, by){
		topic.publish("widgetBlur", widget, by);	// publish
	});
	focus.on("widget-focus", function(widget, by){
		topic.publish("widgetFocus", widget, by);	// publish
	});

	lang.mixin(dijit, exports);

	/*===== return exports; =====*/
	return dijit;	// for back compat :-(
});

},
'dojo/regexp':function(){
define(["./_base/kernel", "./_base/lang"], function(dojo, lang){

// module:
//		dojo/regexp

var regexp = {
	// summary:
	//		Regular expressions and Builder resources
};
lang.setObject("dojo.regexp", regexp);

regexp.escapeString = function(/*String*/str, /*String?*/except){
	// summary:
	//		Adds escape sequences for special characters in regular expressions
	// except:
	//		a String with special characters to be left unescaped

	return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function(ch){
		if(except && except.indexOf(ch) != -1){
			return ch;
		}
		return "\\" + ch;
	}); // String
};

regexp.buildGroupRE = function(/*Object|Array*/arr, /*Function*/re, /*Boolean?*/nonCapture){
	// summary:
	//		Builds a regular expression that groups subexpressions
	// description:
	//		A utility function used by some of the RE generators. The
	//		subexpressions are constructed by the function, re, in the second
	//		parameter.  re builds one subexpression for each elem in the array
	//		a, in the first parameter. Returns a string for a regular
	//		expression that groups all the subexpressions.
	// arr:
	//		A single value or an array of values.
	// re:
	//		A function. Takes one parameter and converts it to a regular
	//		expression.
	// nonCapture:
	//		If true, uses non-capturing match, otherwise matches are retained
	//		by regular expression. Defaults to false

	// case 1: a is a single value.
	if(!(arr instanceof Array)){
		return re(arr); // String
	}

	// case 2: a is an array
	var b = [];
	for(var i = 0; i < arr.length; i++){
		// convert each elem to a RE
		b.push(re(arr[i]));
	}

	 // join the REs as alternatives in a RE group.
	return regexp.group(b.join("|"), nonCapture); // String
};

regexp.group = function(/*String*/expression, /*Boolean?*/nonCapture){
	// summary:
	//		adds group match to expression
	// nonCapture:
	//		If true, uses non-capturing match, otherwise matches are retained
	//		by regular expression.
	return "(" + (nonCapture ? "?:":"") + expression + ")"; // String
};

return regexp;
});

},
'dojo/dnd/common':function(){
define(["../sniff", "../_base/kernel", "../_base/lang", "../dom"],
	function(has, kernel, lang, dom){

// module:
//		dojo/dnd/common

var exports = lang.getObject("dojo.dnd", true);
/*=====
// TODO: for 2.0, replace line above with this code.
var exports = {
	// summary:
	//		TODOC
};
=====*/

exports.getCopyKeyState = function(evt){
	return evt[has("mac") ? "metaKey" : "ctrlKey"]
};

exports._uniqueId = 0;
exports.getUniqueId = function(){
	// summary:
	//		returns a unique string for use with any DOM element
	var id;
	do{
		id = kernel._scopeName + "Unique" + (++exports._uniqueId);
	}while(dom.byId(id));
	return id;
};

exports._empty = {};

exports.isFormElement = function(/*Event*/ e){
	// summary:
	//		returns true if user clicked on a form element
	var t = e.target;
	if(t.nodeType == 3 /*TEXT_NODE*/){
		t = t.parentNode;
	}
	return " button textarea input select option ".indexOf(" " + t.tagName.toLowerCase() + " ") >= 0;	// Boolean
};

return exports;
});

},
'dijit/DialogUnderlay':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // lang.hitch
	"dojo/aspect", // aspect.after
	"dojo/dom-attr", // domAttr.set
	"dojo/dom-style", // domStyle.getComputedStyle
	"dojo/on",
	"dojo/window", // winUtils.getBox, winUtils.get
	"./_Widget",
	"./_TemplatedMixin",
	"./BackgroundIframe",
	"./Viewport",
	"./main" // for back-compat, exporting dijit._underlay (remove in 2.0)
], function(declare, lang, aspect, domAttr, domStyle, on,
			winUtils, _Widget, _TemplatedMixin, BackgroundIframe, Viewport, dijit){

	// module:
	//		dijit/DialogUnderlay

	var DialogUnderlay = declare("dijit.DialogUnderlay", [_Widget, _TemplatedMixin], {
		// summary:
		//		A component used to block input behind a `dijit/Dialog`.
		//
		//		Normally this class should not be instantiated directly, but rather shown and hidden via
		//		DialogUnderlay.show() and DialogUnderlay.hide().  And usually the module is not accessed directly
		//		at all, since the underlay is shown and hidden by Dialog.DialogLevelManager.
		//
		//		The underlay itself can be styled based on and id:
		//	|	#myDialog_underlay { background-color:red; }
		//
		//		In the case of `dijit.Dialog`, this id is based on the id of the Dialog,
		//		suffixed with _underlay.

		// Template has two divs; outer div is used for fade-in/fade-out, and also to hold background iframe.
		// Inner div has opacity specified in CSS file.
		templateString: "<div class='dijitDialogUnderlayWrapper'><div class='dijitDialogUnderlay' tabIndex='-1' data-dojo-attach-point='node'></div></div>",

		// Parameters on creation or updatable later

		// dialogId: String
		//		Id of the dialog.... DialogUnderlay's id is based on this id
		dialogId: "",

		// class: String
		//		This class name is used on the DialogUnderlay node, in addition to dijitDialogUnderlay
		"class": "",

		// This will get overwritten as soon as show() is call, but leave an empty array in case hide() or destroy()
		// is called first.   The array is shared between instances but that's OK because we never write into it.
		_modalConnects: [],

		_setDialogIdAttr: function(id){
			domAttr.set(this.node, "id", id + "_underlay");
			this._set("dialogId", id);
		},

		_setClassAttr: function(clazz){
			this.node.className = "dijitDialogUnderlay " + clazz;
			this._set("class", clazz);
		},

		postCreate: function(){
			// Append the underlay to the body
			this.ownerDocumentBody.appendChild(this.domNode);

			this.own(on(this.domNode, "keydown", lang.hitch(this, "_onKeyDown")));

			this.inherited(arguments);
		},

		layout: function(){
			// summary:
			//		Sets the background to the size of the viewport
			//
			// description:
			//		Sets the background to the size of the viewport (rather than the size
			//		of the document) since we need to cover the whole browser window, even
			//		if the document is only a few lines long.
			// tags:
			//		private

			var is = this.node.style,
				os = this.domNode.style;

			// hide the background temporarily, so that the background itself isn't
			// causing scrollbars to appear (might happen when user shrinks browser
			// window and then we are called to resize)
			os.display = "none";

			// then resize and show
			var viewport = winUtils.getBox(this.ownerDocument);
			os.top = viewport.t + "px";
			os.left = viewport.l + "px";
			is.width = viewport.w + "px";
			is.height = viewport.h + "px";
			os.display = "block";
		},

		show: function(){
			// summary:
			//		Show the dialog underlay
			this.domNode.style.display = "block";
			this.open = true;
			this.layout();
			this.bgIframe = new BackgroundIframe(this.domNode);

			var win = winUtils.get(this.ownerDocument);
			this._modalConnects = [
				Viewport.on("resize", lang.hitch(this, "layout")),
				on(win, "scroll", lang.hitch(this, "layout"))
			];

		},

		hide: function(){
			// summary:
			//		Hides the dialog underlay

			this.bgIframe.destroy();
			delete this.bgIframe;
			this.domNode.style.display = "none";
			while(this._modalConnects.length){ (this._modalConnects.pop()).remove(); }
			this.open = false;
		},

		destroy: function(){
			while(this._modalConnects.length){ (this._modalConnects.pop()).remove(); }
			this.inherited(arguments);
		},

		_onKeyDown: function(){
			// summary:
			//		Extension point so Dialog can monitor keyboard events on the underlay.
		}
	});

	DialogUnderlay.show = function(/*Object*/ attrs, /*Number*/ zIndex){
		// summary:
		//		Display the underlay with the given attributes set.  If the underlay is already displayed,
		//		then adjust it's attributes as specified.
		// attrs:
		//		The parameters to create DialogUnderlay with.
		// zIndex:
		//		zIndex of the underlay

		var underlay = DialogUnderlay._singleton;
		if(!underlay || underlay._destroyed){
			underlay = dijit._underlay = DialogUnderlay._singleton = new DialogUnderlay(attrs);
		}else{
			if(attrs){ underlay.set(attrs); }
		}
		domStyle.set(underlay.domNode, 'zIndex', zIndex);
		if(!underlay.open){
			underlay.show();
		}
	};

	DialogUnderlay.hide = function(){
		// summary:
		//		Hide the underlay.

		// Guard code in case the underlay widget has already been destroyed
		// because we are being called during page unload (when all widgets are destroyed)
		var underlay = DialogUnderlay._singleton;
		if(underlay && !underlay._destroyed){
			underlay.hide();
		}
	};

	return DialogUnderlay;
});

},
'dijit/place':function(){
define([
	"dojo/_base/array", // array.forEach array.map array.some
	"dojo/dom-geometry", // domGeometry.position
	"dojo/dom-style", // domStyle.getComputedStyle
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/_base/window", // win.body
	"./Viewport", // getEffectiveBox
	"./main"	// dijit (defining dijit.place to match API doc)
], function(array, domGeometry, domStyle, kernel, win, Viewport, dijit){

	// module:
	//		dijit/place


	function _place(/*DomNode*/ node, choices, layoutNode, aroundNodeCoords){
		// summary:
		//		Given a list of spots to put node, put it at the first spot where it fits,
		//		of if it doesn't fit anywhere then the place with the least overflow
		// choices: Array
		//		Array of elements like: {corner: 'TL', pos: {x: 10, y: 20} }
		//		Above example says to put the top-left corner of the node at (10,20)
		// layoutNode: Function(node, aroundNodeCorner, nodeCorner, size)
		//		for things like tooltip, they are displayed differently (and have different dimensions)
		//		based on their orientation relative to the parent.	 This adjusts the popup based on orientation.
		//		It also passes in the available size for the popup, which is useful for tooltips to
		//		tell them that their width is limited to a certain amount.	 layoutNode() may return a value expressing
		//		how much the popup had to be modified to fit into the available space.	 This is used to determine
		//		what the best placement is.
		// aroundNodeCoords: Object
		//		Size of aroundNode, ex: {w: 200, h: 50}

		// get {x: 10, y: 10, w: 100, h:100} type obj representing position of
		// viewport over document
		var view = Viewport.getEffectiveBox(node.ownerDocument);

		// This won't work if the node is inside a <div style="position: relative">,
		// so reattach it to <body>.	 (Otherwise, the positioning will be wrong
		// and also it might get cutoff.)
		if(!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body"){
			win.body(node.ownerDocument).appendChild(node);
		}

		var best = null;
		array.some(choices, function(choice){
			var corner = choice.corner;
			var pos = choice.pos;
			var overflow = 0;

			// calculate amount of space available given specified position of node
			var spaceAvailable = {
				w: {
					'L': view.l + view.w - pos.x,
					'R': pos.x - view.l,
					'M': view.w
				}[corner.charAt(1)],
				h: {
					'T': view.t + view.h - pos.y,
					'B': pos.y - view.t,
					'M': view.h
				}[corner.charAt(0)]
			};

			// Clear left/right position settings set earlier so they don't interfere with calculations,
			// specifically when layoutNode() (a.k.a. Tooltip.orient()) measures natural width of Tooltip
			var s = node.style;
			s.left = s.right = "auto";

			// configure node to be displayed in given position relative to button
			// (need to do this in order to get an accurate size for the node, because
			// a tooltip's size changes based on position, due to triangle)
			if(layoutNode){
				var res = layoutNode(node, choice.aroundCorner, corner, spaceAvailable, aroundNodeCoords);
				overflow = typeof res == "undefined" ? 0 : res;
			}

			// get node's size
			var style = node.style;
			var oldDisplay = style.display;
			var oldVis = style.visibility;
			if(style.display == "none"){
				style.visibility = "hidden";
				style.display = "";
			}
			var bb = domGeometry.position(node);
			style.display = oldDisplay;
			style.visibility = oldVis;

			// coordinates and size of node with specified corner placed at pos,
			// and clipped by viewport
			var
				startXpos = {
					'L': pos.x,
					'R': pos.x - bb.w,
					'M': Math.max(view.l, Math.min(view.l + view.w, pos.x + (bb.w >> 1)) - bb.w) // M orientation is more flexible
				}[corner.charAt(1)],
				startYpos = {
					'T': pos.y,
					'B': pos.y - bb.h,
					'M': Math.max(view.t, Math.min(view.t + view.h, pos.y + (bb.h >> 1)) - bb.h)
				}[corner.charAt(0)],
				startX = Math.max(view.l, startXpos),
				startY = Math.max(view.t, startYpos),
				endX = Math.min(view.l + view.w, startXpos + bb.w),
				endY = Math.min(view.t + view.h, startYpos + bb.h),
				width = endX - startX,
				height = endY - startY;

			overflow += (bb.w - width) + (bb.h - height);

			if(best == null || overflow < best.overflow){
				best = {
					corner: corner,
					aroundCorner: choice.aroundCorner,
					x: startX,
					y: startY,
					w: width,
					h: height,
					overflow: overflow,
					spaceAvailable: spaceAvailable
				};
			}

			return !overflow;
		});

		// In case the best position is not the last one we checked, need to call
		// layoutNode() again.
		if(best.overflow && layoutNode){
			layoutNode(node, best.aroundCorner, best.corner, best.spaceAvailable, aroundNodeCoords);
		}

		// And then position the node.  Do this last, after the layoutNode() above
		// has sized the node, due to browser quirks when the viewport is scrolled
		// (specifically that a Tooltip will shrink to fit as though the window was
		// scrolled to the left).
		//
		// In RTL mode, set style.right rather than style.left so in the common case,
		// window resizes move the popup along with the aroundNode.

		var l = domGeometry.isBodyLtr(node.ownerDocument),
			top = best.y,
			side = l ? best.x : view.w - best.x - best.w;

		if(/relative|absolute/.test(domStyle.get(win.body(node.ownerDocument), "position"))){
			// compensate for margin on <body>, see #16148
			top -= domStyle.get(win.body(node.ownerDocument), "marginTop");
			side -= (l ? 1 : -1) * domStyle.get(win.body(node.ownerDocument), l ? "marginLeft" : "marginRight");
		}

		var s = node.style;
		s.top = top + "px";
		s[l ? "left" : "right"] = side + "px";
		s[l ? "right" : "left"] = "auto";	// needed for FF or else tooltip goes to far left

		return best;
	}

	var reverse = {
		// Map from corner to kitty-corner
		"TL": "BR",
		"TR": "BL",
		"BL": "TR",
		"BR": "TL"
	};

	var place = {
		// summary:
		//		Code to place a DOMNode relative to another DOMNode.
		//		Load using require(["dijit/place"], function(place){ ... }).

		at: function(node, pos, corners, padding, layoutNode){
			// summary:
			//		Positions node kitty-corner to the rectangle centered at (pos.x, pos.y) with width and height of
			//		padding.x * 2 and padding.y * 2, or zero if padding not specified.  Picks first corner in corners[]
			//		where node is fully visible, or the corner where it's most visible.
			//
			//		Node is assumed to be absolutely or relatively positioned.
			// node: DOMNode
			//		The node to position
			// pos: dijit/place.__Position
			//		Object like {x: 10, y: 20}
			// corners: String[]
			//		Array of Strings representing order to try corners of the node in, like ["TR", "BL"].
			//		Possible values are:
			//
			//		- "BL" - bottom left
			//		- "BR" - bottom right
			//		- "TL" - top left
			//		- "TR" - top right
			// padding: dijit/place.__Position?
			//		Optional param to set padding, to put some buffer around the element you want to position.
			//		Defaults to zero.
			// layoutNode: Function(node, aroundNodeCorner, nodeCorner)
			//		For things like tooltip, they are displayed differently (and have different dimensions)
			//		based on their orientation relative to the parent.  This adjusts the popup based on orientation.
			// example:
			//		Try to place node's top right corner at (10,20).
			//		If that makes node go (partially) off screen, then try placing
			//		bottom left corner at (10,20).
			//	|	place(node, {x: 10, y: 20}, ["TR", "BL"])
			var choices = array.map(corners, function(corner){
				var c = {
					corner: corner,
					aroundCorner: reverse[corner],	// so TooltipDialog.orient() gets aroundCorner argument set
					pos: {x: pos.x,y: pos.y}
				};
				if(padding){
					c.pos.x += corner.charAt(1) == 'L' ? padding.x : -padding.x;
					c.pos.y += corner.charAt(0) == 'T' ? padding.y : -padding.y;
				}
				return c;
			});

			return _place(node, choices, layoutNode);
		},

		around: function(
			/*DomNode*/		node,
			/*DomNode|dijit/place.__Rectangle*/ anchor,
			/*String[]*/	positions,
			/*Boolean*/		leftToRight,
			/*Function?*/	layoutNode){

			// summary:
			//		Position node adjacent or kitty-corner to anchor
			//		such that it's fully visible in viewport.
			// description:
			//		Place node such that corner of node touches a corner of
			//		aroundNode, and that node is fully visible.
			// anchor:
			//		Either a DOMNode or a rectangle (object with x, y, width, height).
			// positions:
			//		Ordered list of positions to try matching up.
			//
			//		- before: places drop down to the left of the anchor node/widget, or to the right in the case
			//			of RTL scripts like Hebrew and Arabic; aligns either the top of the drop down
			//			with the top of the anchor, or the bottom of the drop down with bottom of the anchor.
			//		- after: places drop down to the right of the anchor node/widget, or to the left in the case
			//			of RTL scripts like Hebrew and Arabic; aligns either the top of the drop down
			//			with the top of the anchor, or the bottom of the drop down with bottom of the anchor.
			//		- before-centered: centers drop down to the left of the anchor node/widget, or to the right
			//			in the case of RTL scripts like Hebrew and Arabic
			//		- after-centered: centers drop down to the right of the anchor node/widget, or to the left
			//			in the case of RTL scripts like Hebrew and Arabic
			//		- above-centered: drop down is centered above anchor node
			//		- above: drop down goes above anchor node, left sides aligned
			//		- above-alt: drop down goes above anchor node, right sides aligned
			//		- below-centered: drop down is centered above anchor node
			//		- below: drop down goes below anchor node
			//		- below-alt: drop down goes below anchor node, right sides aligned
			// layoutNode: Function(node, aroundNodeCorner, nodeCorner)
			//		For things like tooltip, they are displayed differently (and have different dimensions)
			//		based on their orientation relative to the parent.	 This adjusts the popup based on orientation.
			// leftToRight:
			//		True if widget is LTR, false if widget is RTL.   Affects the behavior of "above" and "below"
			//		positions slightly.
			// example:
			//	|	placeAroundNode(node, aroundNode, {'BL':'TL', 'TR':'BR'});
			//		This will try to position node such that node's top-left corner is at the same position
			//		as the bottom left corner of the aroundNode (ie, put node below
			//		aroundNode, with left edges aligned).	If that fails it will try to put
			//		the bottom-right corner of node where the top right corner of aroundNode is
			//		(ie, put node above aroundNode, with right edges aligned)
			//

			// If around is a DOMNode (or DOMNode id), convert to coordinates.
			var aroundNodePos;
			if(typeof anchor == "string" || "offsetWidth" in anchor){
				aroundNodePos = domGeometry.position(anchor, true);

				// For above and below dropdowns, subtract width of border so that popup and aroundNode borders
				// overlap, preventing a double-border effect.  Unfortunately, difficult to measure the border
				// width of either anchor or popup because in both cases the border may be on an inner node.
				if(/^(above|below)/.test(positions[0])){
					var anchorBorder = domGeometry.getBorderExtents(anchor),
						anchorChildBorder = anchor.firstChild ? domGeometry.getBorderExtents(anchor.firstChild) : {t:0,l:0,b:0,r:0},
						nodeBorder =  domGeometry.getBorderExtents(node),
						nodeChildBorder = node.firstChild ? domGeometry.getBorderExtents(node.firstChild) : {t:0,l:0,b:0,r:0};
					aroundNodePos.y += Math.min(anchorBorder.t + anchorChildBorder.t, nodeBorder.t + nodeChildBorder.t);
					aroundNodePos.h -=  Math.min(anchorBorder.t + anchorChildBorder.t, nodeBorder.t+ nodeChildBorder.t) +
						Math.min(anchorBorder.b + anchorChildBorder.b, nodeBorder.b + nodeChildBorder.b);
				}
			}else{
				aroundNodePos = anchor;
			}

			// Compute position and size of visible part of anchor (it may be partially hidden by ancestor nodes w/scrollbars)
			if(anchor.parentNode){
				// ignore nodes between position:relative and position:absolute
				var sawPosAbsolute = domStyle.getComputedStyle(anchor).position == "absolute";
				var parent = anchor.parentNode;
				while(parent && parent.nodeType == 1 && parent.nodeName != "BODY"){  //ignoring the body will help performance
					var parentPos = domGeometry.position(parent, true),
						pcs = domStyle.getComputedStyle(parent);
					if(/relative|absolute/.test(pcs.position)){
						sawPosAbsolute = false;
					}
					if(!sawPosAbsolute && /hidden|auto|scroll/.test(pcs.overflow)){
						var bottomYCoord = Math.min(aroundNodePos.y + aroundNodePos.h, parentPos.y + parentPos.h);
						var rightXCoord = Math.min(aroundNodePos.x + aroundNodePos.w, parentPos.x + parentPos.w);
						aroundNodePos.x = Math.max(aroundNodePos.x, parentPos.x);
						aroundNodePos.y = Math.max(aroundNodePos.y, parentPos.y);
						aroundNodePos.h = bottomYCoord - aroundNodePos.y;
						aroundNodePos.w = rightXCoord - aroundNodePos.x;
					}
					if(pcs.position == "absolute"){
						sawPosAbsolute = true;
					}
					parent = parent.parentNode;
				}
			}			

			var x = aroundNodePos.x,
				y = aroundNodePos.y,
				width = "w" in aroundNodePos ? aroundNodePos.w : (aroundNodePos.w = aroundNodePos.width),
				height = "h" in aroundNodePos ? aroundNodePos.h : (kernel.deprecated("place.around: dijit/place.__Rectangle: { x:"+x+", y:"+y+", height:"+aroundNodePos.height+", width:"+width+" } has been deprecated.  Please use { x:"+x+", y:"+y+", h:"+aroundNodePos.height+", w:"+width+" }", "", "2.0"), aroundNodePos.h = aroundNodePos.height);

			// Convert positions arguments into choices argument for _place()
			var choices = [];
			function push(aroundCorner, corner){
				choices.push({
					aroundCorner: aroundCorner,
					corner: corner,
					pos: {
						x: {
							'L': x,
							'R': x + width,
							'M': x + (width >> 1)
						}[aroundCorner.charAt(1)],
						y: {
							'T': y,
							'B': y + height,
							'M': y + (height >> 1)
						}[aroundCorner.charAt(0)]
					}
				})
			}
			array.forEach(positions, function(pos){
				var ltr =  leftToRight;
				switch(pos){
					case "above-centered":
						push("TM", "BM");
						break;
					case "below-centered":
						push("BM", "TM");
						break;
					case "after-centered":
						ltr = !ltr;
						// fall through
					case "before-centered":
						push(ltr ? "ML" : "MR", ltr ? "MR" : "ML");
						break;
					case "after":
						ltr = !ltr;
						// fall through
					case "before":
						push(ltr ? "TL" : "TR", ltr ? "TR" : "TL");
						push(ltr ? "BL" : "BR", ltr ? "BR" : "BL");
						break;
					case "below-alt":
						ltr = !ltr;
						// fall through
					case "below":
						// first try to align left borders, next try to align right borders (or reverse for RTL mode)
						push(ltr ? "BL" : "BR", ltr ? "TL" : "TR");
						push(ltr ? "BR" : "BL", ltr ? "TR" : "TL");
						break;
					case "above-alt":
						ltr = !ltr;
						// fall through
					case "above":
						// first try to align left borders, next try to align right borders (or reverse for RTL mode)
						push(ltr ? "TL" : "TR", ltr ? "BL" : "BR");
						push(ltr ? "TR" : "TL", ltr ? "BR" : "BL");
						break;
					default:
						// To assist dijit/_base/place, accept arguments of type {aroundCorner: "BL", corner: "TL"}.
						// Not meant to be used directly.  Remove for 2.0.
						push(pos.aroundCorner, pos.corner);
				}
			});

			var position = _place(node, choices, layoutNode, {w: width, h: height});
			position.aroundNodePos = aroundNodePos;

			return position;
		}
	};

	/*=====
	place.__Position = {
		// x: Integer
		//		horizontal coordinate in pixels, relative to document body
		// y: Integer
		//		vertical coordinate in pixels, relative to document body
	};
	place.__Rectangle = {
		// x: Integer
		//		horizontal offset in pixels, relative to document body
		// y: Integer
		//		vertical offset in pixels, relative to document body
		// w: Integer
		//		width in pixels.   Can also be specified as "width" for backwards-compatibility.
		// h: Integer
		//		height in pixels.   Can also be specified as "height" for backwards-compatibility.
	};
	=====*/

	return dijit.place = place;	// setting dijit.place for back-compat, remove for 2.0
});

},
'dojo/date':function(){
define(["./has", "./_base/lang"], function(has, lang){
// module:
//		dojo/date

var date = {
	// summary:
	//		Date manipulation utilities
};

date.getDaysInMonth = function(/*Date*/dateObject){
	// summary:
	//		Returns the number of days in the month used by dateObject
	var month = dateObject.getMonth();
	var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if(month == 1 && date.isLeapYear(dateObject)){ return 29; } // Number
	return days[month]; // Number
};

date.isLeapYear = function(/*Date*/dateObject){
	// summary:
	//		Determines if the year of the dateObject is a leap year
	// description:
	//		Leap years are years with an additional day YYYY-02-29, where the
	//		year number is a multiple of four with the following exception: If
	//		a year is a multiple of 100, then it is only a leap year if it is
	//		also a multiple of 400. For example, 1900 was not a leap year, but
	//		2000 is one.

	var year = dateObject.getFullYear();
	return !(year%400) || (!(year%4) && !!(year%100)); // Boolean
};

// FIXME: This is not localized
date.getTimezoneName = function(/*Date*/dateObject){
	// summary:
	//		Get the user's time zone as provided by the browser
	// dateObject:
	//		Needed because the timezone may vary with time (daylight savings)
	// description:
	//		Try to get time zone info from toString or toLocaleString method of
	//		the Date object -- UTC offset is not a time zone.  See
	//		http://www.twinsun.com/tz/tz-link.htm Note: results may be
	//		inconsistent across browsers.

	var str = dateObject.toString(); // Start looking in toString
	var tz = ''; // The result -- return empty string if nothing found
	var match;

	// First look for something in parentheses -- fast lookup, no regex
	var pos = str.indexOf('(');
	if(pos > -1){
		tz = str.substring(++pos, str.indexOf(')'));
	}else{
		// If at first you don't succeed ...
		// If IE knows about the TZ, it appears before the year
		// Capital letters or slash before a 4-digit year
		// at the end of string
		var pat = /([A-Z\/]+) \d{4}$/;
		if((match = str.match(pat))){
			tz = match[1];
		}else{
		// Some browsers (e.g. Safari) glue the TZ on the end
		// of toLocaleString instead of putting it in toString
			str = dateObject.toLocaleString();
			// Capital letters or slash -- end of string,
			// after space
			pat = / ([A-Z\/]+)$/;
			if((match = str.match(pat))){
				tz = match[1];
			}
		}
	}

	// Make sure it doesn't somehow end up return AM or PM
	return (tz == 'AM' || tz == 'PM') ? '' : tz; // String
};

// Utility methods to do arithmetic calculations with Dates

date.compare = function(/*Date*/date1, /*Date?*/date2, /*String?*/portion){
	// summary:
	//		Compare two date objects by date, time, or both.
	// description:
	//		Returns 0 if equal, positive if a > b, else negative.
	// date1:
	//		Date object
	// date2:
	//		Date object.  If not specified, the current Date is used.
	// portion:
	//		A string indicating the "date" or "time" portion of a Date object.
	//		Compares both "date" and "time" by default.  One of the following:
	//		"date", "time", "datetime"

	// Extra step required in copy for IE - see #3112
	date1 = new Date(+date1);
	date2 = new Date(+(date2 || new Date()));

	if(portion == "date"){
		// Ignore times and compare dates.
		date1.setHours(0, 0, 0, 0);
		date2.setHours(0, 0, 0, 0);
	}else if(portion == "time"){
		// Ignore dates and compare times.
		date1.setFullYear(0, 0, 0);
		date2.setFullYear(0, 0, 0);
	}

	if(date1 > date2){ return 1; } // int
	if(date1 < date2){ return -1; } // int
	return 0; // int
};

date.add = function(/*Date*/date, /*String*/interval, /*int*/amount){
	// summary:
	//		Add to a Date in intervals of different size, from milliseconds to years
	// date: Date
	//		Date object to start with
	// interval:
	//		A string representing the interval.  One of the following:
	//		"year", "month", "day", "hour", "minute", "second",
	//		"millisecond", "quarter", "week", "weekday"
	// amount:
	//		How much to add to the date.

	var sum = new Date(+date); // convert to Number before copying to accomodate IE (#3112)
	var fixOvershoot = false;
	var property = "Date";

	switch(interval){
		case "day":
			break;
		case "weekday":
			//i18n FIXME: assumes Saturday/Sunday weekend, but this is not always true.  see dojo/cldr/supplemental

			// Divide the increment time span into weekspans plus leftover days
			// e.g., 8 days is one 5-day weekspan / and two leftover days
			// Can't have zero leftover days, so numbers divisible by 5 get
			// a days value of 5, and the remaining days make up the number of weeks
			var days, weeks;
			var mod = amount % 5;
			if(!mod){
				days = (amount > 0) ? 5 : -5;
				weeks = (amount > 0) ? ((amount-5)/5) : ((amount+5)/5);
			}else{
				days = mod;
				weeks = parseInt(amount/5);
			}
			// Get weekday value for orig date param
			var strt = date.getDay();
			// Orig date is Sat / positive incrementer
			// Jump over Sun
			var adj = 0;
			if(strt == 6 && amount > 0){
				adj = 1;
			}else if(strt == 0 && amount < 0){
			// Orig date is Sun / negative incrementer
			// Jump back over Sat
				adj = -1;
			}
			// Get weekday val for the new date
			var trgt = strt + days;
			// New date is on Sat or Sun
			if(trgt == 0 || trgt == 6){
				adj = (amount > 0) ? 2 : -2;
			}
			// Increment by number of weeks plus leftover days plus
			// weekend adjustments
			amount = (7 * weeks) + days + adj;
			break;
		case "year":
			property = "FullYear";
			// Keep increment/decrement from 2/29 out of March
			fixOvershoot = true;
			break;
		case "week":
			amount *= 7;
			break;
		case "quarter":
			// Naive quarter is just three months
			amount *= 3;
			// fallthrough...
		case "month":
			// Reset to last day of month if you overshoot
			fixOvershoot = true;
			property = "Month";
			break;
//		case "hour":
//		case "minute":
//		case "second":
//		case "millisecond":
		default:
			property = "UTC"+interval.charAt(0).toUpperCase() + interval.substring(1) + "s";
	}

	if(property){
		sum["set"+property](sum["get"+property]()+amount);
	}

	if(fixOvershoot && (sum.getDate() < date.getDate())){
		sum.setDate(0);
	}

	return sum; // Date
};

date.difference = function(/*Date*/date1, /*Date?*/date2, /*String?*/interval){
	// summary:
	//		Get the difference in a specific unit of time (e.g., number of
	//		months, weeks, days, etc.) between two dates, rounded to the
	//		nearest integer.
	// date1:
	//		Date object
	// date2:
	//		Date object.  If not specified, the current Date is used.
	// interval:
	//		A string representing the interval.  One of the following:
	//		"year", "month", "day", "hour", "minute", "second",
	//		"millisecond", "quarter", "week", "weekday"
	//
	//		Defaults to "day".

	date2 = date2 || new Date();
	interval = interval || "day";
	var yearDiff = date2.getFullYear() - date1.getFullYear();
	var delta = 1; // Integer return value

	switch(interval){
		case "quarter":
			var m1 = date1.getMonth();
			var m2 = date2.getMonth();
			// Figure out which quarter the months are in
			var q1 = Math.floor(m1/3) + 1;
			var q2 = Math.floor(m2/3) + 1;
			// Add quarters for any year difference between the dates
			q2 += (yearDiff * 4);
			delta = q2 - q1;
			break;
		case "weekday":
			var days = Math.round(date.difference(date1, date2, "day"));
			var weeks = parseInt(date.difference(date1, date2, "week"));
			var mod = days % 7;

			// Even number of weeks
			if(mod == 0){
				days = weeks*5;
			}else{
				// Weeks plus spare change (< 7 days)
				var adj = 0;
				var aDay = date1.getDay();
				var bDay = date2.getDay();

				weeks = parseInt(days/7);
				mod = days % 7;
				// Mark the date advanced by the number of
				// round weeks (may be zero)
				var dtMark = new Date(date1);
				dtMark.setDate(dtMark.getDate()+(weeks*7));
				var dayMark = dtMark.getDay();

				// Spare change days -- 6 or less
				if(days > 0){
					switch(true){
						// Range starts on Sat
						case aDay == 6:
							adj = -1;
							break;
						// Range starts on Sun
						case aDay == 0:
							adj = 0;
							break;
						// Range ends on Sat
						case bDay == 6:
							adj = -1;
							break;
						// Range ends on Sun
						case bDay == 0:
							adj = -2;
							break;
						// Range contains weekend
						case (dayMark + mod) > 5:
							adj = -2;
					}
				}else if(days < 0){
					switch(true){
						// Range starts on Sat
						case aDay == 6:
							adj = 0;
							break;
						// Range starts on Sun
						case aDay == 0:
							adj = 1;
							break;
						// Range ends on Sat
						case bDay == 6:
							adj = 2;
							break;
						// Range ends on Sun
						case bDay == 0:
							adj = 1;
							break;
						// Range contains weekend
						case (dayMark + mod) < 0:
							adj = 2;
					}
				}
				days += adj;
				days -= (weeks*2);
			}
			delta = days;
			break;
		case "year":
			delta = yearDiff;
			break;
		case "month":
			delta = (date2.getMonth() - date1.getMonth()) + (yearDiff * 12);
			break;
		case "week":
			// Truncate instead of rounding
			// Don't use Math.floor -- value may be negative
			delta = parseInt(date.difference(date1, date2, "day")/7);
			break;
		case "day":
			delta /= 24;
			// fallthrough
		case "hour":
			delta /= 60;
			// fallthrough
		case "minute":
			delta /= 60;
			// fallthrough
		case "second":
			delta /= 1000;
			// fallthrough
		case "millisecond":
			delta *= date2.getTime() - date1.getTime();
	}

	// Round for fractional values and DST leaps
	return Math.round(delta); // Number (integer)
};

// Don't use setObject() because it may overwrite dojo/date/stamp (if that has already been loaded)
 1  && lang.mixin(lang.getObject("dojo.date", true), date);

return date;
});

},
'dijit/_Widget':function(){
define([
	"dojo/aspect",	// aspect.around
	"dojo/_base/config",	// config.isDebug
	"dojo/_base/connect",	// connect.connect
	"dojo/_base/declare", // declare
	"dojo/has",
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/_base/lang", // lang.hitch
	"dojo/query",
	"dojo/ready",
	"./registry",	// registry.byNode
	"./_WidgetBase",
	"./_OnDijitClickMixin",
	"./_FocusMixin",
	"dojo/uacss",		// browser sniffing (included for back-compat; subclasses may be using)
	"./hccss"		// high contrast mode sniffing (included to set CSS classes on <body>, module ret value unused)
], function(aspect, config, connect, declare, has, kernel, lang, query, ready,
			registry, _WidgetBase, _OnDijitClickMixin, _FocusMixin){


// module:
//		dijit/_Widget


function connectToDomNode(){
	// summary:
	//		If user connects to a widget method === this function, then they will
	//		instead actually be connecting the equivalent event on this.domNode
}

// Trap dojo.connect() calls to connectToDomNode methods, and redirect to _Widget.on()
function aroundAdvice(originalConnect){
	return function(obj, event, scope, method){
		if(obj && typeof event == "string" && obj[event] == connectToDomNode){
			return obj.on(event.substring(2).toLowerCase(), lang.hitch(scope, method));
		}
		return originalConnect.apply(connect, arguments);
	};
}
aspect.around(connect, "connect", aroundAdvice);
if(kernel.connect){
	aspect.around(kernel, "connect", aroundAdvice);
}

var _Widget = declare("dijit._Widget", [_WidgetBase, _OnDijitClickMixin, _FocusMixin], {
	// summary:
	//		Old base class for widgets.   New widgets should extend `dijit/_WidgetBase` instead
	// description:
	//		Old Base class for Dijit widgets.
	//
	//		Extends _WidgetBase, adding support for:
	//
	//		- declaratively/programatically specifying widget initialization parameters like
	//			onMouseMove="foo" that call foo when this.domNode gets a mousemove event
	//		- ondijitclick:
	//			Support new data-dojo-attach-event="ondijitclick: ..." that is triggered by a mouse click or a SPACE/ENTER keypress
	//		- focus related functions:
	//			In particular, the onFocus()/onBlur() callbacks.   Driven internally by
	//			dijit/_base/focus.js.
	//		- deprecated methods
	//		- onShow(), onHide(), onClose()
	//
	//		Also, by loading code in dijit/_base, turns on:
	//
	//		- browser sniffing (putting browser class like `dj_ie` on `<html>` node)
	//		- high contrast mode sniffing (add `dijit_a11y` class to `<body>` if machine is in high contrast mode)


	////////////////// DEFERRED CONNECTS ///////////////////

	onClick: connectToDomNode,
	/*=====
	onClick: function(event){
		// summary:
		//		Connect to this function to receive notifications of mouse click events.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onDblClick: connectToDomNode,
	/*=====
	onDblClick: function(event){
		// summary:
		//		Connect to this function to receive notifications of mouse double click events.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onKeyDown: connectToDomNode,
	/*=====
	onKeyDown: function(event){
		// summary:
		//		Connect to this function to receive notifications of keys being pressed down.
		// event:
		//		key Event
		// tags:
		//		callback
	},
	=====*/
	onKeyPress: connectToDomNode,
	/*=====
	onKeyPress: function(event){
		// summary:
		//		Connect to this function to receive notifications of printable keys being typed.
		// event:
		//		key Event
		// tags:
		//		callback
	},
	=====*/
	onKeyUp: connectToDomNode,
	/*=====
	onKeyUp: function(event){
		// summary:
		//		Connect to this function to receive notifications of keys being released.
		// event:
		//		key Event
		// tags:
		//		callback
	},
	=====*/
	onMouseDown: connectToDomNode,
	/*=====
	onMouseDown: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse button is pressed down.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseMove: connectToDomNode,
	/*=====
	onMouseMove: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse moves over nodes contained within this widget.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseOut: connectToDomNode,
	/*=====
	onMouseOut: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse moves off of nodes contained within this widget.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseOver: connectToDomNode,
	/*=====
	onMouseOver: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse moves onto nodes contained within this widget.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseLeave: connectToDomNode,
	/*=====
	onMouseLeave: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse moves off of this widget.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseEnter: connectToDomNode,
	/*=====
	onMouseEnter: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse moves onto this widget.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/
	onMouseUp: connectToDomNode,
	/*=====
	onMouseUp: function(event){
		// summary:
		//		Connect to this function to receive notifications of when the mouse button is released.
		// event:
		//		mouse Event
		// tags:
		//		callback
	},
	=====*/

	constructor: function(params /*===== ,srcNodeRef =====*/){
		// summary:
		//		Create the widget.
		// params: Object|null
		//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
		//		and functions, typically callbacks like onClick.
		//		The hash can contain any of the widget's properties, excluding read-only properties.
		// srcNodeRef: DOMNode|String?
		//		If a srcNodeRef (DOM node) is specified:
		//
		//		- use srcNodeRef.innerHTML as my contents
		//		- if this is a behavioral widget then apply behavior to that srcNodeRef
		//		- otherwise, replace srcNodeRef with my generated DOM tree

		// extract parameters like onMouseMove that should connect directly to this.domNode
		this._toConnect = {};
		for(var name in params){
			if(this[name] === connectToDomNode){
				this._toConnect[name.replace(/^on/, "").toLowerCase()] = params[name];
				delete params[name];
			}
		}
	},

	postCreate: function(){
		this.inherited(arguments);

		// perform connection from this.domNode to user specified handlers (ex: onMouseMove)
		for(var name in this._toConnect){
			this.on(name, this._toConnect[name]);
		}
		delete this._toConnect;
	},

	on: function(/*String|Function*/ type, /*Function*/ func){
		if(this[this._onMap(type)] === connectToDomNode){
			// Use connect.connect() rather than on() to get handling for "onmouseenter" on non-IE,
			// normalization of onkeypress/onkeydown to behave like firefox, etc.
			// Also, need to specify context as "this" rather than the default context of the DOMNode
			// Remove in 2.0.
			return connect.connect(this.domNode, type.toLowerCase(), this, func);
		}
		return this.inherited(arguments);
	},

	_setFocusedAttr: function(val){
		// Remove this method in 2.0 (or sooner), just here to set _focused == focused, for back compat
		// (but since it's a private variable we aren't required to keep supporting it).
		this._focused = val;
		this._set("focused", val);
	},

	////////////////// DEPRECATED METHODS ///////////////////

	setAttribute: function(/*String*/ attr, /*anything*/ value){
		// summary:
		//		Deprecated.  Use set() instead.
		// tags:
		//		deprecated
		kernel.deprecated(this.declaredClass+"::setAttribute(attr, value) is deprecated. Use set() instead.", "", "2.0");
		this.set(attr, value);
	},

	attr: function(/*String|Object*/name, /*Object?*/value){
		// summary:
		//		Set or get properties on a widget instance.
		// name:
		//		The property to get or set. If an object is passed here and not
		//		a string, its keys are used as names of attributes to be set
		//		and the value of the object as values to set in the widget.
		// value:
		//		Optional. If provided, attr() operates as a setter. If omitted,
		//		the current value of the named property is returned.
		// description:
		//		This method is deprecated, use get() or set() directly.

		// Print deprecation warning but only once per calling function
		if(config.isDebug){
			var alreadyCalledHash = arguments.callee._ach || (arguments.callee._ach = {}),
				caller = (arguments.callee.caller || "unknown caller").toString();
			if(!alreadyCalledHash[caller]){
				kernel.deprecated(this.declaredClass + "::attr() is deprecated. Use get() or set() instead, called from " +
				caller, "", "2.0");
				alreadyCalledHash[caller] = true;
			}
		}

		var args = arguments.length;
		if(args >= 2 || typeof name === "object"){ // setter
			return this.set.apply(this, arguments);
		}else{ // getter
			return this.get(name);
		}
	},

	getDescendants: function(){
		// summary:
		//		Returns all the widgets contained by this, i.e., all widgets underneath this.containerNode.
		//		This method should generally be avoided as it returns widgets declared in templates, which are
		//		supposed to be internal/hidden, but it's left here for back-compat reasons.

		kernel.deprecated(this.declaredClass+"::getDescendants() is deprecated. Use getChildren() instead.", "", "2.0");
		return this.containerNode ? query('[widgetId]', this.containerNode).map(registry.byNode) : []; // dijit/_WidgetBase[]
	},

	////////////////// MISCELLANEOUS METHODS ///////////////////

	_onShow: function(){
		// summary:
		//		Internal method called when this widget is made visible.
		//		See `onShow` for details.
		this.onShow();
	},

	onShow: function(){
		// summary:
		//		Called when this widget becomes the selected pane in a
		//		`dijit/layout/TabContainer`, `dijit/layout/StackContainer`,
		//		`dijit/layout/AccordionContainer`, etc.
		//
		//		Also called to indicate display of a `dijit.Dialog`, `dijit.TooltipDialog`, or `dijit.TitlePane`.
		// tags:
		//		callback
	},

	onHide: function(){
		// summary:
		//		Called when another widget becomes the selected pane in a
		//		`dijit/layout/TabContainer`, `dijit/layout/StackContainer`,
		//		`dijit/layout/AccordionContainer`, etc.
		//
		//		Also called to indicate hide of a `dijit.Dialog`, `dijit.TooltipDialog`, or `dijit.TitlePane`.
		// tags:
		//		callback
	},

	onClose: function(){
		// summary:
		//		Called when this widget is being displayed as a popup (ex: a Calendar popped
		//		up from a DateTextBox), and it is hidden.
		//		This is called from the dijit.popup code, and should not be called directly.
		//
		//		Also used as a parameter for children of `dijit/layout/StackContainer` or subclasses.
		//		Callback if a user tries to close the child.   Child will be closed if this function returns true.
		// tags:
		//		extension

		return true;		// Boolean
	}
});

// For back-compat, remove in 2.0.
if(has("dijit-legacy-requires")){
	ready(0, function(){
		var requires = ["dijit/_base"];
		require(requires);	// use indirection so modules not rolled into a build
	});
}
return _Widget;
});

},
'dojo/cache':function(){
define(["./_base/kernel", "./text"], function(dojo){
	// module:
	//		dojo/cache

	// dojo.cache is defined in dojo/text
	return dojo.cache;
});

},
'dijit/_OnDijitClickMixin':function(){
define([
	"dojo/on",
	"dojo/_base/array", // array.forEach
	"dojo/keys", // keys.ENTER keys.SPACE
	"dojo/_base/declare", // declare
	"dojo/has", // has("dom-addeventlistener")
	"./a11yclick"
], function(on, array, keys, declare, has, a11yclick){

	// module:
	//		dijit/_OnDijitClickMixin

	var ret = declare("dijit._OnDijitClickMixin", null, {
		// summary:
		//		Deprecated.   New code should access the dijit/a11yclick event directly, ex:
		//		|	this.own(on(node, a11yclick, function(){ ... }));
		//
		//		Mixing in this class will make _WidgetBase.connect(node, "ondijitclick", ...) work.
		//		It also used to be necessary to make templates with ondijitclick work, but now you can just require
		//		dijit/a11yclick.

		connect: function(obj, event, method){
			// override _WidgetBase.connect() to make this.connect(node, "ondijitclick", ...) work
			return this.inherited(arguments, [obj, event == "ondijitclick" ? a11yclick : event, method]);
		}
	});

	ret.a11yclick = a11yclick;	// back compat

	return ret;
});

},
'dijit/_FocusMixin':function(){
define([
	"./focus",
	"./_WidgetBase",
	"dojo/_base/declare", // declare
	"dojo/_base/lang" // lang.extend
], function(focus, _WidgetBase, declare, lang){

	// module:
	//		dijit/_FocusMixin

	// We don't know where _FocusMixin will occur in the inheritance chain, but we need the _onFocus()/_onBlur() below
	// to be last in the inheritance chain, so mixin to _WidgetBase.
	lang.extend(_WidgetBase, {
		// focused: [readonly] Boolean
		//		This widget or a widget it contains has focus, or is "active" because
		//		it was recently clicked.
		focused: false,

		onFocus: function(){
			// summary:
			//		Called when the widget becomes "active" because
			//		it or a widget inside of it either has focus, or has recently
			//		been clicked.
			// tags:
			//		callback
		},

		onBlur: function(){
			// summary:
			//		Called when the widget stops being "active" because
			//		focus moved to something outside of it, or the user
			//		clicked somewhere outside of it, or the widget was
			//		hidden.
			// tags:
			//		callback
		},

		_onFocus: function(){
			// summary:
			//		This is where widgets do processing for when they are active,
			//		such as changing CSS classes.  See onFocus() for more details.
			// tags:
			//		protected
			this.onFocus();
		},

		_onBlur: function(){
			// summary:
			//		This is where widgets do processing for when they stop being active,
			//		such as changing CSS classes.  See onBlur() for more details.
			// tags:
			//		protected
			this.onBlur();
		}
	});

	return declare("dijit._FocusMixin", null, {
		// summary:
		//		Mixin to widget to provide _onFocus() and _onBlur() methods that
		//		fire when a widget or its descendants get/lose focus

		// flag that I want _onFocus()/_onBlur() notifications from focus manager
		_focusManager: focus
	});

});

},
'dijit/form/_ToggleButtonMixin':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/dom-attr" // domAttr.set
], function(declare, domAttr){

	// module:
	//		dijit/form/_ToggleButtonMixin

	return declare("dijit.form._ToggleButtonMixin", null, {
		// summary:
		//		A mixin to provide functionality to allow a button that can be in two states (checked or not).

		// checked: Boolean
		//		Corresponds to the native HTML `<input>` element's attribute.
		//		In markup, specified as "checked='checked'" or just "checked".
		//		True if the button is depressed, or the checkbox is checked,
		//		or the radio button is selected, etc.
		checked: false,

		// aria-pressed for toggle buttons, and aria-checked for checkboxes
		_aria_attr: "aria-pressed",

		_onClick: function(/*Event*/ evt){
			var original = this.checked;
			this._set('checked', !original); // partially set the toggled value, assuming the toggle will work, so it can be overridden in the onclick handler
			var ret = this.inherited(arguments); // the user could reset the value here
			this.set('checked', ret ? this.checked : original); // officially set the toggled or user value, or reset it back
			return ret;
		},

		_setCheckedAttr: function(/*Boolean*/ value, /*Boolean?*/ priorityChange){
			this._set("checked", value);
			var node = this.focusNode || this.domNode;
			if(this._created){ // IE is not ready to handle checked attribute (affects tab order)
				// needlessly setting "checked" upsets IE's tab order
				if(domAttr.get(node, "checked") != !!value){
					domAttr.set(node, "checked", !!value); // "mixed" -> true
				}
			}
			node.setAttribute(this._aria_attr, String(value)); // aria values should be strings
			this._handleOnChange(value, priorityChange);
		},

		postCreate: function(){ // use postCreate instead of startup so users forgetting to call startup are OK
			this.inherited(arguments);
			var node = this.focusNode || this.domNode;
			if(this.checked){
				// need this here instead of on the template so IE8 tab order works
				node.setAttribute('checked', 'checked');
			}
		},

		reset: function(){
			// summary:
			//		Reset the widget's value to what it was at initialization time

			this._hasBeenBlurred = false;

			// set checked state to original setting
			this.set('checked', this.params.checked || false);
		}
	});
});

},
'dijit/focus':function(){
define([
	"dojo/aspect",
	"dojo/_base/declare", // declare
	"dojo/dom", // domAttr.get dom.isDescendant
	"dojo/dom-attr", // domAttr.get dom.isDescendant
	"dojo/dom-construct", // connect to domConstruct.empty, domConstruct.destroy
	"dojo/Evented",
	"dojo/_base/lang", // lang.hitch
	"dojo/on",
	"dojo/domReady",
	"dojo/sniff", // has("ie")
	"dojo/Stateful",
	"dojo/_base/window", // win.body
	"dojo/window", // winUtils.get
	"./a11y",	// a11y.isTabNavigable
	"./registry",	// registry.byId
	"./main"		// to set dijit.focus
], function(aspect, declare, dom, domAttr, domConstruct, Evented, lang, on, domReady, has, Stateful, win, winUtils,
			a11y, registry, dijit){

	// module:
	//		dijit/focus

	var lastFocusin;

	var FocusManager = declare([Stateful, Evented], {
		// summary:
		//		Tracks the currently focused node, and which widgets are currently "active".
		//		Access via require(["dijit/focus"], function(focus){ ... }).
		//
		//		A widget is considered active if it or a descendant widget has focus,
		//		or if a non-focusable node of this widget or a descendant was recently clicked.
		//
		//		Call focus.watch("curNode", callback) to track the current focused DOMNode,
		//		or focus.watch("activeStack", callback) to track the currently focused stack of widgets.
		//
		//		Call focus.on("widget-blur", func) or focus.on("widget-focus", ...) to monitor when
		//		when widgets become active/inactive
		//
		//		Finally, focus(node) will focus a node, suppressing errors if the node doesn't exist.

		// curNode: DomNode
		//		Currently focused item on screen
		curNode: null,

		// activeStack: dijit/_WidgetBase[]
		//		List of currently active widgets (focused widget and it's ancestors)
		activeStack: [],

		constructor: function(){
			// Don't leave curNode/prevNode pointing to bogus elements
			var check = lang.hitch(this, function(node){
				if(dom.isDescendant(this.curNode, node)){
					this.set("curNode", null);
				}
				if(dom.isDescendant(this.prevNode, node)){
					this.set("prevNode", null);
				}
			});
			aspect.before(domConstruct, "empty", check);
			aspect.before(domConstruct, "destroy", check);
		},

		registerIframe: function(/*DomNode*/ iframe){
			// summary:
			//		Registers listeners on the specified iframe so that any click
			//		or focus event on that iframe (or anything in it) is reported
			//		as a focus/click event on the `<iframe>` itself.
			// description:
			//		Currently only used by editor.
			// returns:
			//		Handle with remove() method to deregister.
			return this.registerWin(iframe.contentWindow, iframe);
		},

		registerWin: function(/*Window?*/targetWindow, /*DomNode?*/ effectiveNode){
			// summary:
			//		Registers listeners on the specified window (either the main
			//		window or an iframe's window) to detect when the user has clicked somewhere
			//		or focused somewhere.
			// description:
			//		Users should call registerIframe() instead of this method.
			// targetWindow:
			//		If specified this is the window associated with the iframe,
			//		i.e. iframe.contentWindow.
			// effectiveNode:
			//		If specified, report any focus events inside targetWindow as
			//		an event on effectiveNode, rather than on evt.target.
			// returns:
			//		Handle with remove() method to deregister.

			// TODO: make this function private in 2.0; Editor/users should call registerIframe(),

			// Listen for blur and focus events on targetWindow's document.
			var _this = this,
				body = targetWindow.document && targetWindow.document.body;

			if(body){
				var mdh = on(targetWindow.document, 'mousedown, touchstart', function(evt){
					_this._justMouseDowned = true;
					setTimeout(function(){ _this._justMouseDowned = false; }, 0);

					// workaround weird IE bug where the click is on an orphaned node
					// (first time clicking a Select/DropDownButton inside a TooltipDialog).
					// actually, strangely this is happening on latest chrome too.
					if(evt && evt.target && evt.target.parentNode == null){
						return;
					}

					_this._onTouchNode(effectiveNode || evt.target, "mouse");
				});

				var fih = on(body, 'focusin', function(evt){

					lastFocusin = (new Date()).getTime();

					// When you refocus the browser window, IE gives an event with an empty srcElement
					if(!evt.target.tagName) { return; }

					// IE reports that nodes like <body> have gotten focus, even though they have tabIndex=-1,
					// ignore those events
					var tag = evt.target.tagName.toLowerCase();
					if(tag == "#document" || tag == "body"){ return; }

					if(a11y.isTabNavigable(evt.target)){
						// If condition doesn't seem quite right, but it is correctly preventing focus events for
						// clicks on disabled buttons.  (TODO: it doesn't register clicks on TabContainer tabs because
						// they are tabIndex="-1")
						_this._onFocusNode(effectiveNode || evt.target);
					}else{
						// Previous code called _onTouchNode() for any activate event on a non-focusable node.   Can
						// probably just ignore such an event as it will be handled by onmousedown handler above, but
						// leaving the code for now.
						_this._onTouchNode(effectiveNode || evt.target);
					}
				});

				var foh = on(body, 'focusout', function(evt){
					// IE9+ has a problem where focusout events come after the corresponding focusin event.  At least
					// when moving focus from the Editor's <iframe> to a normal DOMNode.
					if((new Date()).getTime() < lastFocusin + 100){
						return;
					}

					_this._onBlurNode(effectiveNode || evt.target);
				});

				return {
					remove: function(){
						mdh.remove();
						fih.remove();
						foh.remove();
						mdh = fih = foh = null;
						body = null;	// prevent memory leak (apparent circular reference via closure)
					}
				};
			}
		},

		_onBlurNode: function(/*DomNode*/ node){
			// summary:
			//		Called when focus leaves a node.
			//		Usually ignored, _unless_ it *isn't* followed by touching another node,
			//		which indicates that we tabbed off the last field on the page,
			//		in which case every widget is marked inactive

			// If the blur event isn't followed by a focus event, it means the user clicked on something unfocusable,
			// so clear focus.
			if(this._clearFocusTimer){
				clearTimeout(this._clearFocusTimer);
			}
			this._clearFocusTimer = setTimeout(lang.hitch(this, function(){
				this.set("prevNode", this.curNode);
				this.set("curNode", null);
			}), 0);

			if(this._justMouseDowned){
				// the mouse down caused a new widget to be marked as active; this blur event
				// is coming late, so ignore it.
				return;
			}

			// If the blur event isn't followed by a focus or touch event then mark all widgets as inactive.
			if(this._clearActiveWidgetsTimer){
				clearTimeout(this._clearActiveWidgetsTimer);
			}
			this._clearActiveWidgetsTimer = setTimeout(lang.hitch(this, function(){
				delete this._clearActiveWidgetsTimer;
				this._setStack([]);
			}), 0);
		},

		_onTouchNode: function(/*DomNode*/ node, /*String*/ by){
			// summary:
			//		Callback when node is focused or mouse-downed
			// node:
			//		The node that was touched.
			// by:
			//		"mouse" if the focus/touch was caused by a mouse down event

			// ignore the recent blurNode event
			if(this._clearActiveWidgetsTimer){
				clearTimeout(this._clearActiveWidgetsTimer);
				delete this._clearActiveWidgetsTimer;
			}

			// compute stack of active widgets (ex: ComboButton --> Menu --> MenuItem)
			var newStack=[];
			try{
				while(node){
					var popupParent = domAttr.get(node, "dijitPopupParent");
					if(popupParent){
						node=registry.byId(popupParent).domNode;
					}else if(node.tagName && node.tagName.toLowerCase() == "body"){
						// is this the root of the document or just the root of an iframe?
						if(node === win.body()){
							// node is the root of the main document
							break;
						}
						// otherwise, find the iframe this node refers to (can't access it via parentNode,
						// need to do this trick instead). window.frameElement is supported in IE/FF/Webkit
						node=winUtils.get(node.ownerDocument).frameElement;
					}else{
						// if this node is the root node of a widget, then add widget id to stack,
						// except ignore clicks on disabled widgets (actually focusing a disabled widget still works,
						// to support MenuItem)
						var id = node.getAttribute && node.getAttribute("widgetId"),
							widget = id && registry.byId(id);
						if(widget && !(by == "mouse" && widget.get("disabled"))){
							newStack.unshift(id);
						}
						node=node.parentNode;
					}
				}
			}catch(e){ /* squelch */ }

			this._setStack(newStack, by);
		},

		_onFocusNode: function(/*DomNode*/ node){
			// summary:
			//		Callback when node is focused

			if(!node){
				return;
			}

			if(node.nodeType == 9){
				// Ignore focus events on the document itself.  This is here so that
				// (for example) clicking the up/down arrows of a spinner
				// (which don't get focus) won't cause that widget to blur. (FF issue)
				return;
			}

			// There was probably a blur event right before this event, but since we have a new focus, don't
			// do anything with the blur
			if(this._clearFocusTimer){
				clearTimeout(this._clearFocusTimer);
				delete this._clearFocusTimer;
			}

			this._onTouchNode(node);

			if(node == this.curNode){ return; }
			this.set("prevNode", this.curNode);
			this.set("curNode", node);
		},

		_setStack: function(/*String[]*/ newStack, /*String*/ by){
			// summary:
			//		The stack of active widgets has changed.  Send out appropriate events and records new stack.
			// newStack:
			//		array of widget id's, starting from the top (outermost) widget
			// by:
			//		"mouse" if the focus/touch was caused by a mouse down event

			var oldStack = this.activeStack, lastOldIdx = oldStack.length - 1, lastNewIdx = newStack.length - 1;

			if(newStack[lastNewIdx] == oldStack[lastOldIdx]){
				// no changes, return now to avoid spurious notifications about changes to activeStack
				return;
			}

			this.set("activeStack", newStack);

			var widget, i;

			// for all elements that have gone out of focus, set focused=false
			for(i = lastOldIdx; i >= 0 && oldStack[i] != newStack[i]; i--){
				widget = registry.byId(oldStack[i]);
				if(widget){
					widget._hasBeenBlurred = true;		// TODO: used by form widgets, should be moved there
					widget.set("focused", false);
					if(widget._focusManager == this){
						widget._onBlur(by);
					}
					this.emit("widget-blur", widget, by);
				}
			}

			// for all element that have come into focus, set focused=true
			for(i++; i <= lastNewIdx; i++){
				widget = registry.byId(newStack[i]);
				if(widget){
					widget.set("focused", true);
					if(widget._focusManager == this){
						widget._onFocus(by);
					}
					this.emit("widget-focus", widget, by);
				}
			}
		},

		focus: function(node){
			// summary:
			//		Focus the specified node, suppressing errors if they occur
			if(node){
				try{ node.focus(); }catch(e){/*quiet*/}
			}
		}
	});

	var singleton = new FocusManager();

	// register top window and all the iframes it contains
	domReady(function(){
		var handle = singleton.registerWin(winUtils.get(document));
		if(has("ie")){
			on(window, "unload", function(){
				if(handle){	// because this gets called twice when doh.robot is running
					handle.remove();
					handle = null;
				}
			});
		}
	});

	// Setup dijit.focus as a pointer to the singleton but also (for backwards compatibility)
	// as a function to set focus.   Remove for 2.0.
	dijit.focus = function(node){
		singleton.focus(node);	// indirection here allows dijit/_base/focus.js to override behavior
	};
	for(var attr in singleton){
		if(!/^_/.test(attr)){
			dijit.focus[attr] = typeof singleton[attr] == "function" ? lang.hitch(singleton, attr) : singleton[attr];
		}
	}
	singleton.watch(function(attr, oldVal, newVal){
		dijit.focus[attr] = newVal;
	});

	return singleton;
});

},
'dijit/form/_ListBase':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/on",
	"dojo/window" // winUtils.scrollIntoView
], function(declare, on, winUtils){

	// module:
	//		dijit/form/_ListBase

	return declare("dijit.form._ListBase", null, {
		// summary:
		//		Focus-less menu to handle UI events consistently.
		//		Abstract methods that must be defined externally:
		//
		//		- onSelect: item is active (mousedown but not yet mouseup, or keyboard arrow selected but no Enter)
		//		- onDeselect:  cancels onSelect
		// tags:
		//		private

		// selected: DOMNode
		//		currently selected node
		selected: null,

		_listConnect: function(/*String|Function*/ eventType, /*String*/ callbackFuncName){
			// summary:
			//		Connects 'containerNode' to specified method of this object
			//		and automatically registers for 'disconnect' on widget destroy.
			// description:
			//		Provide widget-specific analog to 'connect'.
			//		The callback function is called with the normal event object,
			//		but also a second parameter is passed that indicates which list item
			//		actually received the event.
			// returns:
			//		A handle that can be passed to `disconnect` in order to disconnect
			//		before the widget is destroyed.
			// tags:
			//		private

			var self = this;
			return self.own(on(self.containerNode,
				on.selector(
					function(eventTarget, selector, target){
						return eventTarget.parentNode == target;
					},
					eventType
				),
				function(evt){
					evt.preventDefault();
					self[callbackFuncName](evt, this);
				}
			));
		},

		selectFirstNode: function(){
			// summary:
			//		Select the first displayed item in the list.
			var first = this.containerNode.firstChild;
			while(first && first.style.display == "none"){
				first = first.nextSibling;
			}
			this._setSelectedAttr(first);
		},

		selectLastNode: function(){
			// summary:
			//		Select the last displayed item in the list
			var last = this.containerNode.lastChild;
			while(last && last.style.display == "none"){
				last = last.previousSibling;
			}
			this._setSelectedAttr(last);
		},

		selectNextNode: function(){
			// summary:
			//		Select the item just below the current selection.
			//		If nothing selected, select first node.
			var selectedNode = this.selected;
			if(!selectedNode){
				this.selectFirstNode();
			}else{
				var next = selectedNode.nextSibling;
				while(next && next.style.display == "none"){
					next = next.nextSibling;
				}
				if(!next){
					this.selectFirstNode();
				}else{
					this._setSelectedAttr(next);
				}
			}
		},

		selectPreviousNode: function(){
			// summary:
			//		Select the item just above the current selection.
			//		If nothing selected, select last node (if
			//		you select Previous and try to keep scrolling up the list).
			var selectedNode = this.selected;
			if(!selectedNode){
				this.selectLastNode();
			}else{
				var prev = selectedNode.previousSibling;
				while(prev && prev.style.display == "none"){
					prev = prev.previousSibling;
				}
				if(!prev){
					this.selectLastNode();
				}else{
					this._setSelectedAttr(prev);
				}
			}
		},

		_setSelectedAttr: function(/*DomNode*/ node){
			// summary:
			//		Does the actual select.
			if(this.selected != node){
				var selectedNode = this.selected;
				if(selectedNode){
					this.onDeselect(selectedNode);
				}
				if(node){
					winUtils.scrollIntoView(node);
					this.onSelect(node);
				}
				this._set("selected", node);
			}else if(node){
				this.onSelect(node);
			}
		}
	});
});

},
'dijit/_editor/plugins/LinkDialog':function(){
define([
	"require",
	"dojo/_base/declare", // declare
	"dojo/dom-attr", // domAttr.get
	"dojo/keys", // keys.ENTER
	"dojo/_base/lang", // lang.delegate lang.hitch lang.trim
	"dojo/on",
	"dojo/sniff", // has("ie")
	"dojo/query", // query
	"dojo/string", // string.substitute
	"../../_Widget",
	"../_Plugin",
	"../../form/DropDownButton",
	"../range"
], function(require, declare, domAttr, keys, lang, on, has, query, string,
	_Widget, _Plugin, DropDownButton, rangeapi){

	// module:
	//		dijit/_editor/plugins/LinkDialog

	var LinkDialog = declare("dijit._editor.plugins.LinkDialog", _Plugin, {
		// summary:
		//		This plugin provides the basis for an 'anchor' (link) dialog and an extension of it
		//		provides the image link dialog.
		// description:
		//		The command provided by this plugin is:
		//
		//		- createLink

		// Override _Plugin.buttonClass.   This plugin is controlled by a DropDownButton
		// (which triggers a TooltipDialog).
		buttonClass: DropDownButton,

		// Override _Plugin.useDefaultCommand... processing is handled by this plugin, not by dijit/Editor.
		useDefaultCommand: false,

		// urlRegExp: [protected] String
		//		Used for validating input as correct URL.  While file:// urls are not terribly
		//		useful, they are technically valid.
		urlRegExp: "((https?|ftps?|file)\\://|\./|\.\./|/|)(/[a-zA-Z]{1,1}:/|)(((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)*(?:[a-zA-Z](?:[-\\da-zA-Z]{0,80}[\\da-zA-Z])?)\\.?)|(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]|(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]|(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])|0[xX]0*[\\da-fA-F]{1,8}|([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}|([\\da-fA-F]{1,4}\\:){6}((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])))(\\:\\d+)?(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]{0,}(?:\\?[^?#\\s/]*)?(?:#.*)?)?)?",

		// emailRegExp: [protected] String
		//		Used for validating input as correct email address.  Taken from dojox.validate
		emailRegExp: "<?(mailto\\:)([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+" /*username*/ + "@" +
			"((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)+(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}[\\da-zA-Z])?)\\.?)|localhost|^[^-][a-zA-Z0-9_-]*>?", // host.

		// htmlTemplate: [protected] String
		//		String used for templating the HTML to insert at the desired point.
		htmlTemplate: "<a href=\"${urlInput}\" _djrealurl=\"${urlInput}\"" +
			" target=\"${targetSelect}\"" +
			">${textInput}</a>",

		// tag: [protected] String
		//		Tag used for the link type.
		tag: "a",

		// _hostRxp [private] RegExp
		//		Regular expression used to validate url fragments (ip address, hostname, etc)
		_hostRxp: /^((([^\[:]+):)?([^@]+)@)?(\[([^\]]+)\]|([^\[:]*))(:([0-9]+))?$/,

		// _userAtRxp [private] RegExp
		//		Regular expression used to validate e-mail address fragment.
		_userAtRxp: /^([!#-'*+\-\/-9=?A-Z^-~]+[.])*[!#-'*+\-\/-9=?A-Z^-~]+@/i,

		// linkDialogTemplate: [protected] String
		//		Template for contents of TooltipDialog to pick URL
		linkDialogTemplate: [
			"<table role='presentation'><tr><td>",
			"<label for='${id}_urlInput'>${url}</label>",
			"</td><td>",
			"<input data-dojo-type='dijit.form.ValidationTextBox' required='true' " +
				"id='${id}_urlInput' name='urlInput' data-dojo-props='intermediateChanges:true'/>",
			"</td></tr><tr><td>",
			"<label for='${id}_textInput'>${text}</label>",
			"</td><td>",
			"<input data-dojo-type='dijit.form.ValidationTextBox' required='true' id='${id}_textInput' " +
				"name='textInput' data-dojo-props='intermediateChanges:true'/>",
			"</td></tr><tr><td>",
			"<label for='${id}_targetSelect'>${target}</label>",
			"</td><td>",
			"<select id='${id}_targetSelect' name='targetSelect' data-dojo-type='dijit.form.Select'>",
			"<option selected='selected' value='_self'>${currentWindow}</option>",
			"<option value='_blank'>${newWindow}</option>",
			"<option value='_top'>${topWindow}</option>",
			"<option value='_parent'>${parentWindow}</option>",
			"</select>",
			"</td></tr><tr><td colspan='2'>",
			"<button data-dojo-type='dijit.form.Button' type='submit' id='${id}_setButton'>${set}</button>",
			"<button data-dojo-type='dijit.form.Button' type='button' id='${id}_cancelButton'>${buttonCancel}</button>",
			"</td></tr></table>"
		].join(""),

		_initButton: function(){
			this.inherited(arguments);

			// Setup to lazy create TooltipDialog first time the button is clicked
			this.button.loadDropDown = lang.hitch(this, "_loadDropDown");

			this._connectTagEvents();
		},
		_loadDropDown: function(callback){
			// Called the first time the button is pressed.  Initialize TooltipDialog.
			require([
				"dojo/i18n", // i18n.getLocalization
				"../../TooltipDialog",
				"../../registry", // registry.byId, registry.getUniqueId
				"../../form/Button", // used by template
				"../../form/Select", // used by template
				"../../form/ValidationTextBox", // used by template
				"dojo/i18n!../../nls/common",
				"dojo/i18n!../nls/LinkDialog"
			], lang.hitch(this, function(i18n, TooltipDialog, registry){
				var _this = this;
				this.tag = this.command == 'insertImage' ? 'img' : 'a';
				var messages = lang.delegate(i18n.getLocalization("dijit", "common", this.lang),
					i18n.getLocalization("dijit._editor", "LinkDialog", this.lang));
				var dropDown = (this.dropDown = this.button.dropDown = new TooltipDialog({
					title: messages[this.command + "Title"],
					ownerDocument: this.editor.ownerDocument,
					dir: this.editor.dir,
					execute: lang.hitch(this, "setValue"),
					onOpen: function(){
						_this._onOpenDialog();
						TooltipDialog.prototype.onOpen.apply(this, arguments);
					},
					onCancel: function(){
						setTimeout(lang.hitch(_this, "_onCloseDialog"), 0);
					}
				}));
				messages.urlRegExp = this.urlRegExp;
				messages.id = registry.getUniqueId(this.editor.id);
				this._uniqueId = messages.id;
				this._setContent(dropDown.title +
					"<div style='border-bottom: 1px black solid;padding-bottom:2pt;margin-bottom:4pt'></div>" +
					string.substitute(this.linkDialogTemplate, messages));
				dropDown.startup();
				this._urlInput = registry.byId(this._uniqueId + "_urlInput");
				this._textInput = registry.byId(this._uniqueId + "_textInput");
				this._setButton = registry.byId(this._uniqueId + "_setButton");
				this.own(registry.byId(this._uniqueId + "_cancelButton").on("click", lang.hitch(this.dropDown, "onCancel")));
				if(this._urlInput){
					this.own(this._urlInput.on("change", lang.hitch(this, "_checkAndFixInput")));
				}
				if(this._textInput){
					this.own(this._textInput.on("change", lang.hitch(this, "_checkAndFixInput")));
				}

				// Build up the dual check for http/https/file:, and mailto formats.
				this._urlRegExp = new RegExp("^" + this.urlRegExp + "$", "i");
				this._emailRegExp = new RegExp("^" + this.emailRegExp + "$", "i");
				this._urlInput.isValid = lang.hitch(this, function(){
					// Function over-ride of isValid to test if the input matches a url or a mailto style link.
					var value = this._urlInput.get("value");
					return this._urlRegExp.test(value) || this._emailRegExp.test(value);
				});

				// Listen for enter and execute if valid.
				this.own(on(dropDown.domNode, "keydown", lang.hitch(this, lang.hitch(this, function(e){
					if(e && e.keyCode == keys.ENTER && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey){
						if(!this._setButton.get("disabled")){
							dropDown.onExecute();
							dropDown.execute(dropDown.get('value'));
						}
					}
				}))));

				callback();
			}));
		},

		_checkAndFixInput: function(){
			// summary:
			//		A function to listen for onChange events and test the input contents
			//		for valid information, such as valid urls with http/https/ftp and if
			//		not present, try and guess if the input url is relative or not, and if
			//		not, append http:// to it.  Also validates other fields as determined by
			//		the internal _isValid function.
			var self = this;
			var url = this._urlInput.get("value");
			var fixupUrl = function(url){
				var appendHttp = false;
				var appendMailto = false;
				if(url && url.length > 1){
					url = lang.trim(url);
					if(url.indexOf("mailto:") !== 0){
						if(url.indexOf("/") > 0){
							if(url.indexOf("://") === -1){
								// Check that it doesn't start with /, ./, or ../, which would
								// imply 'target server relativeness'
								if(url.charAt(0) !== '/' && url.indexOf("./") && url.indexOf("../") !== 0){
									if(self._hostRxp.test(url)){
										appendHttp = true;
									}
								}
							}
						}else if(self._userAtRxp.test(url)){
							// If it looks like a foo@, append a mailto.
							appendMailto = true;
						}
					}
				}
				if(appendHttp){
					self._urlInput.set("value", "http://" + url);
				}
				if(appendMailto){
					self._urlInput.set("value", "mailto:" + url);
				}
				self._setButton.set("disabled", !self._isValid());
			};
			if(this._delayedCheck){
				clearTimeout(this._delayedCheck);
				this._delayedCheck = null;
			}
			this._delayedCheck = setTimeout(function(){
				fixupUrl(url);
			}, 250);
		},

		_connectTagEvents: function(){
			// summary:
			//		Over-ridable function that connects tag specific events.
			this.editor.onLoadDeferred.then(lang.hitch(this, function(){
				this.own(on(this.editor.editNode, "dblclick", lang.hitch(this, "_onDblClick")));
			}));
		},

		_isValid: function(){
			// summary:
			//		Internal function to allow validating of the inputs
			//		for a link to determine if set should be disabled or not
			// tags:
			//		protected
			return this._urlInput.isValid() && this._textInput.isValid();
		},

		_setContent: function(staticPanel){
			// summary:
			//		Helper for _initButton above.   Not sure why it's a separate method.
			this.dropDown.set({
				parserScope: "dojo", // make parser search for dojoType/data-dojo-type even if page is multi-version
				content: staticPanel
			});
		},

		_checkValues: function(args){
			// summary:
			//		Function to check the values in args and 'fix' them up as needed.
			// args: Object
			//		Content being set.
			// tags:
			//		protected
			if(args && args.urlInput){
				args.urlInput = args.urlInput.replace(/"/g, "&quot;");
			}
			return args;
		},

		setValue: function(args){
			// summary:
			//		Callback from the dialog when user presses "set" button.
			// tags:
			//		private

			// TODO: prevent closing popup if the text is empty
			this._onCloseDialog();
			if(has("ie") < 9){ //see #4151
				var sel = rangeapi.getSelection(this.editor.window);
				var range = sel.getRangeAt(0);
				var a = range.endContainer;
				if(a.nodeType === 3){
					// Text node, may be the link contents, so check parent.
					// This plugin doesn't really support nested HTML elements
					// in the link, it assumes all link content is text.
					a = a.parentNode;
				}
				if(a && (a.nodeName && a.nodeName.toLowerCase() !== this.tag)){
					// Still nothing, one last thing to try on IE, as it might be 'img'
					// and thus considered a control.
					a = this.editor.selection.getSelectedElement(this.tag);
				}
				if(a && (a.nodeName && a.nodeName.toLowerCase() === this.tag)){
					// Okay, we do have a match.  IE, for some reason, sometimes pastes before
					// instead of removing the targeted paste-over element, so we unlink the
					// old one first.  If we do not the <a> tag remains, but it has no content,
					// so isn't readily visible (but is wrong for the action).
					if(this.editor.queryCommandEnabled("unlink")){
						// Select all the link children, then unlink.  The following insert will
						// then replace the selected text.
						this.editor.selection.selectElementChildren(a);
						this.editor.execCommand("unlink");
					}
				}
			}
			// make sure values are properly escaped, etc.
			args = this._checkValues(args);
			this.editor.execCommand('inserthtml',
				string.substitute(this.htmlTemplate, args));

			// IE sometimes leaves a blank link, so we need to fix it up.
			// Go ahead and do this for everyone just to avoid blank links
			// in the page.
			query("a", this.editor.document).forEach(function(a){
				if(!a.innerHTML && !domAttr.has(a, "name")){
					// Remove empty anchors that do not have "name" set.
					// Empty ones with a name set could be a hidden hash
					// anchor.
					a.parentNode.removeChild(a);
				}
			}, this);
		},

		_onCloseDialog: function(){
			// summary:
			//		Handler for close event on the dialog

			if(this.editor.focused){
				// put focus back in the edit area, unless the dialog closed because the user clicked somewhere else
				this.editor.focus();
			}
		},

		_getCurrentValues: function(a){
			// summary:
			//		Over-ride for getting the values to set in the dropdown.
			// a:
			//		The anchor/link to process for data for the dropdown.
			// tags:
			//		protected
			var url, text, target;
			if(a && a.tagName.toLowerCase() === this.tag){
				url = a.getAttribute('_djrealurl') || a.getAttribute('href');
				target = a.getAttribute('target') || "_self";
				text = a.textContent || a.innerText;
				this.editor.selection.selectElement(a, true);
			}else{
				text = this.editor.selection.getSelectedText();
			}
			return {urlInput: url || '', textInput: text || '', targetSelect: target || ''}; //Object;
		},

		_onOpenDialog: function(){
			// summary:
			//		Handler for when the dialog is opened.
			//		If the caret is currently in a URL then populate the URL's info into the dialog.
			var a, b, fc;
			if(has("ie")){
				// IE, even IE10, is difficult to select the element in, using the range unified
				// API seems to work reasonably well.
				var sel = rangeapi.getSelection(this.editor.window);
				if(sel.rangeCount){
					var range = sel.getRangeAt(0);
					a = range.endContainer;
					if(a.nodeType === 3){
						// Text node, may be the link contents, so check parent.
						// This plugin doesn't really support nested HTML elements
						// in the link, it assumes all link content is text.
						a = a.parentNode;
					}
					if(a && (a.nodeName && a.nodeName.toLowerCase() !== this.tag)){
						// Still nothing, one last thing to try on IE, as it might be 'img'
						// and thus considered a control.
						a = this.editor.selection.getSelectedElement(this.tag);
					}
					if(!a || (a.nodeName && a.nodeName.toLowerCase() !== this.tag)){
						// Try another lookup, IE's selection is just terrible.
						b = this.editor.selection.getAncestorElement(this.tag);
						if(b && (b.nodeName && b.nodeName.toLowerCase() == this.tag)){
							// Looks like we found an A tag, use it and make sure just it is
							// selected.
							a = b;
							this.editor.selection.selectElement(a);
						}else if(range.startContainer === range.endContainer){
							// STILL nothing.  Trying one more thing.  Lets look at the first child.
							// It might be an anchor tag in a div by itself or the like.  If it is,
							// we'll use it otherwise we give up.  The selection is not easily
							// determinable to be on an existing anchor tag.
							fc = range.startContainer.firstChild;
							if(fc && (fc.nodeName && fc.nodeName.toLowerCase() == this.tag)){
								a = fc;
								this.editor.selection.selectElement(a);
							}
						}
					}
				}
			}else{
				a = this.editor.selection.getAncestorElement(this.tag);
			}
			this.dropDown.reset();
			this._setButton.set("disabled", true);
			this.dropDown.set("value", this._getCurrentValues(a));
		},

		_onDblClick: function(e){
			// summary:
			//		Function to define a behavior on double clicks on the element
			//		type this dialog edits to select it and pop up the editor
			//		dialog.
			// e: Object
			//		The double-click event.
			// tags:
			//		protected.
			if(e && e.target){
				var t = e.target;
				var tg = t.tagName ? t.tagName.toLowerCase() : "";
				if(tg === this.tag && domAttr.get(t, "href")){
					var editor = this.editor;

					this.editor.selection.selectElement(t);
					editor.onDisplayChanged();

					// Call onNormalizedDisplayChange() now, rather than on timer.
					// On IE, when focus goes to the first <input> in the TooltipDialog, the editor loses it's selection.
					// Later if onNormalizedDisplayChange() gets called via the timer it will disable the LinkDialog button
					// (actually, all the toolbar buttons), at which point clicking the <input> will close the dialog,
					// since (for unknown reasons) focus.js ignores disabled controls.
					if(editor._updateTimer){
						editor._updateTimer.remove();
						delete editor._updateTimer;
					}
					editor.onNormalizedDisplayChanged();

					var button = this.button;
					setTimeout(function(){
						// Focus shift outside the event handler.
						// IE doesn't like focus changes in event handles.
						button.set("disabled", false);
						button.loadAndOpenDropDown().then(function(){
							if(button.dropDown.focus){
								button.dropDown.focus();
							}
						});
					}, 10);
				}
			}
		}
	});

	var ImgLinkDialog = declare("dijit._editor.plugins.ImgLinkDialog", [LinkDialog], {
		// summary:
		//		This plugin extends LinkDialog and adds in a plugin for handling image links.
		//		provides the image link dialog.
		// description:
		//		The command provided by this plugin is:
		//
		//		- insertImage

		// linkDialogTemplate: [protected] String
		//		Over-ride for template since img dialog doesn't need target that anchor tags may.
		linkDialogTemplate: [
			"<table role='presentation'><tr><td>",
			"<label for='${id}_urlInput'>${url}</label>",
			"</td><td>",
			"<input dojoType='dijit.form.ValidationTextBox' regExp='${urlRegExp}' " +
				"required='true' id='${id}_urlInput' name='urlInput' data-dojo-props='intermediateChanges:true'/>",
			"</td></tr><tr><td>",
			"<label for='${id}_textInput'>${text}</label>",
			"</td><td>",
			"<input data-dojo-type='dijit.form.ValidationTextBox' required='false' id='${id}_textInput' " +
				"name='textInput' data-dojo-props='intermediateChanges:true'/>",
			"</td></tr><tr><td>",
			"</td><td>",
			"</td></tr><tr><td colspan='2'>",
			"<button data-dojo-type='dijit.form.Button' type='submit' id='${id}_setButton'>${set}</button>",
			"<button data-dojo-type='dijit.form.Button' type='button' id='${id}_cancelButton'>${buttonCancel}</button>",
			"</td></tr></table>"
		].join(""),

		// htmlTemplate: [protected] String
		//		String used for templating the `<img>` HTML to insert at the desired point.
		htmlTemplate: "<img src=\"${urlInput}\" _djrealurl=\"${urlInput}\" alt=\"${textInput}\" />",

		// tag: [protected] String
		//		Tag used for the link type (img).
		tag: "img",

		_getCurrentValues: function(img){
			// summary:
			//		Over-ride for getting the values to set in the dropdown.
			// a:
			//		The anchor/link to process for data for the dropdown.
			// tags:
			//		protected
			var url, text;
			if(img && img.tagName.toLowerCase() === this.tag){
				url = img.getAttribute('_djrealurl') || img.getAttribute('src');
				text = img.getAttribute('alt');
				this.editor.selection.selectElement(img, true);
			}else{
				text = this.editor.selection.getSelectedText();
			}
			return {urlInput: url || '', textInput: text || ''}; //Object
		},

		_isValid: function(){
			// summary:
			//		Over-ride for images.  You can have alt text of blank, it is valid.
			// tags:
			//		protected
			return this._urlInput.isValid();
		},

		_connectTagEvents: function(){
			// summary:
			//		Over-ridable function that connects tag specific events.
			this.inherited(arguments);
			this.editor.onLoadDeferred.then(lang.hitch(this, function(){
				// Use onmousedown instead of onclick.  Seems that IE eats the first onclick
				// to wrap it in a selector box, then the second one acts as onclick.  See #10420
				this.own(on(this.editor.editNode, "mousedown", lang.hitch(this, "_selectTag")));
			}));
		},

		_selectTag: function(e){
			// summary:
			//		A simple event handler that lets me select an image if it is clicked on.
			//		makes it easier to select images in a standard way across browsers.  Otherwise
			//		selecting an image for edit becomes difficult.
			// e: Event
			//		The mousedown event.
			// tags:
			//		private
			if(e && e.target){
				var t = e.target;
				var tg = t.tagName ? t.tagName.toLowerCase() : "";
				if(tg === this.tag){
					this.editor.selection.selectElement(t);
				}
			}
		},

		_checkValues: function(args){
			// summary:
			//		Function to check the values in args and 'fix' them up as needed
			//		(special characters in the url or alt text)
			// args: Object
			//		Content being set.
			// tags:
			//		protected
			if(args && args.urlInput){
				args.urlInput = args.urlInput.replace(/"/g, "&quot;");
			}
			if(args && args.textInput){
				args.textInput = args.textInput.replace(/"/g, "&quot;");
			}
			return args;
		},

		_onDblClick: function(e){
			// summary:
			//		Function to define a behavior on double clicks on the element
			//		type this dialog edits to select it and pop up the editor
			//		dialog.
			// e: Object
			//		The double-click event.
			// tags:
			//		protected.
			if(e && e.target){
				var t = e.target;
				var tg = t.tagName ? t.tagName.toLowerCase() : "";
				if(tg === this.tag && domAttr.get(t, "src")){
					var editor = this.editor;

					this.editor.selection.selectElement(t);
					editor.onDisplayChanged();

					// Call onNormalizedDisplayChange() now, rather than on timer.
					// On IE, when focus goes to the first <input> in the TooltipDialog, the editor loses it's selection.
					// Later if onNormalizedDisplayChange() gets called via the timer it will disable the LinkDialog button
					// (actually, all the toolbar buttons), at which point clicking the <input> will close the dialog,
					// since (for unknown reasons) focus.js ignores disabled controls.
					if(editor._updateTimer){
						editor._updateTimer.remove();
						delete editor._updateTimer;
					}
					editor.onNormalizedDisplayChanged();

					var button = this.button;
					setTimeout(function(){
						// Focus shift outside the event handler.
						// IE doesn't like focus changes in event handles.
						button.set("disabled", false);
						button.loadAndOpenDropDown().then(function(){
							if(button.dropDown.focus){
								button.dropDown.focus();
							}
						});
					}, 10);
				}
			}
		}
	});

	// Register these plugins
	_Plugin.registry["createLink"] = function(){
		return new LinkDialog({command: "createLink"});
	};
	_Plugin.registry["insertImage"] = function(){
		return new ImgLinkDialog({command: "insertImage"});
	};


	// Export both LinkDialog and ImgLinkDialog
	// TODO for 2.0: either return both classes in a hash, or split this file into two separate files.
	// Then the documentation for the module can be applied to the hash, and will show up in the API doc.
	LinkDialog.ImgLinkDialog = ImgLinkDialog;
	return LinkDialog;
});

},
'dijit/main':function(){
define([
	"dojo/_base/kernel"
], function(dojo){
	// module:
	//		dijit/main

/*=====
return {
	// summary:
	//		The dijit package main module.
	//		Deprecated.   Users should access individual modules (ex: dijit/registry) directly.
};
=====*/

	return dojo.dijit;
});

},
'dojo/date/stamp':function(){
define(["../_base/lang", "../_base/array"], function(lang, array){

// module:
//		dojo/date/stamp

var stamp = {
	// summary:
	//		TODOC
};
lang.setObject("dojo.date.stamp", stamp);

// Methods to convert dates to or from a wire (string) format using well-known conventions

stamp.fromISOString = function(/*String*/ formattedString, /*Number?*/ defaultTime){
	// summary:
	//		Returns a Date object given a string formatted according to a subset of the ISO-8601 standard.
	//
	// description:
	//		Accepts a string formatted according to a profile of ISO8601 as defined by
	//		[RFC3339](http://www.ietf.org/rfc/rfc3339.txt), except that partial input is allowed.
	//		Can also process dates as specified [by the W3C](http://www.w3.org/TR/NOTE-datetime)
	//		The following combinations are valid:
	//
	//		- dates only
	//			- yyyy
	//			- yyyy-MM
	//			- yyyy-MM-dd
	//		- times only, with an optional time zone appended
	//			- THH:mm
	//			- THH:mm:ss
	//			- THH:mm:ss.SSS
	//		- and "datetimes" which could be any combination of the above
	//
	//		timezones may be specified as Z (for UTC) or +/- followed by a time expression HH:mm
	//		Assumes the local time zone if not specified.  Does not validate.  Improperly formatted
	//		input may return null.  Arguments which are out of bounds will be handled
	//		by the Date constructor (e.g. January 32nd typically gets resolved to February 1st)
	//		Only years between 100 and 9999 are supported.
  	// formattedString:
	//		A string such as 2005-06-30T08:05:00-07:00 or 2005-06-30 or T08:05:00
	// defaultTime:
	//		Used for defaults for fields omitted in the formattedString.
	//		Uses 1970-01-01T00:00:00.0Z by default.

	if(!stamp._isoRegExp){
		stamp._isoRegExp =
//TODO: could be more restrictive and check for 00-59, etc.
			/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
	}

	var match = stamp._isoRegExp.exec(formattedString),
		result = null;

	if(match){
		match.shift();
		if(match[1]){match[1]--;} // Javascript Date months are 0-based
		if(match[6]){match[6] *= 1000;} // Javascript Date expects fractional seconds as milliseconds

		if(defaultTime){
			// mix in defaultTime.  Relatively expensive, so use || operators for the fast path of defaultTime === 0
			defaultTime = new Date(defaultTime);
			array.forEach(array.map(["FullYear", "Month", "Date", "Hours", "Minutes", "Seconds", "Milliseconds"], function(prop){
				return defaultTime["get" + prop]();
			}), function(value, index){
				match[index] = match[index] || value;
			});
		}
		result = new Date(match[0]||1970, match[1]||0, match[2]||1, match[3]||0, match[4]||0, match[5]||0, match[6]||0); //TODO: UTC defaults
		if(match[0] < 100){
			result.setFullYear(match[0] || 1970);
		}

		var offset = 0,
			zoneSign = match[7] && match[7].charAt(0);
		if(zoneSign != 'Z'){
			offset = ((match[8] || 0) * 60) + (Number(match[9]) || 0);
			if(zoneSign != '-'){ offset *= -1; }
		}
		if(zoneSign){
			offset -= result.getTimezoneOffset();
		}
		if(offset){
			result.setTime(result.getTime() + offset * 60000);
		}
	}

	return result; // Date or null
};

/*=====
var __Options = {
	// selector: String
	//		"date" or "time" for partial formatting of the Date object.
	//		Both date and time will be formatted by default.
	// zulu: Boolean
	//		if true, UTC/GMT is used for a timezone
	// milliseconds: Boolean
	//		if true, output milliseconds
};
=====*/

stamp.toISOString = function(/*Date*/ dateObject, /*__Options?*/ options){
	// summary:
	//		Format a Date object as a string according a subset of the ISO-8601 standard
	//
	// description:
	//		When options.selector is omitted, output follows [RFC3339](http://www.ietf.org/rfc/rfc3339.txt)
	//		The local time zone is included as an offset from GMT, except when selector=='time' (time without a date)
	//		Does not check bounds.  Only years between 100 and 9999 are supported.
	//
	// dateObject:
	//		A Date object

	var _ = function(n){ return (n < 10) ? "0" + n : n; };
	options = options || {};
	var formattedDate = [],
		getter = options.zulu ? "getUTC" : "get",
		date = "";
	if(options.selector != "time"){
		var year = dateObject[getter+"FullYear"]();
		date = ["0000".substr((year+"").length)+year, _(dateObject[getter+"Month"]()+1), _(dateObject[getter+"Date"]())].join('-');
	}
	formattedDate.push(date);
	if(options.selector != "date"){
		var time = [_(dateObject[getter+"Hours"]()), _(dateObject[getter+"Minutes"]()), _(dateObject[getter+"Seconds"]())].join(':');
		var millis = dateObject[getter+"Milliseconds"]();
		if(options.milliseconds){
			time += "."+ (millis < 100 ? "0" : "") + _(millis);
		}
		if(options.zulu){
			time += "Z";
		}else if(options.selector != "time"){
			var timezoneOffset = dateObject.getTimezoneOffset();
			var absOffset = Math.abs(timezoneOffset);
			time += (timezoneOffset > 0 ? "-" : "+") +
				_(Math.floor(absOffset/60)) + ":" + _(absOffset%60);
		}
		formattedDate.push(time);
	}
	return formattedDate.join('T'); // String
};

return stamp;
});

},
'dijit/_editor/plugins/FullScreen':function(){
define([
	"dojo/aspect",
	"dojo/_base/declare", // declare
	"dojo/dom-class", // domClass.add domClass.remove
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/i18n", // i18n.getLocalization
	"dojo/keys", // keys.F11 keys.TAB
	"dojo/_base/lang", // lang.hitch
	"dojo/on", // on()
	"dojo/sniff", // has("ie"), has("quirks")
	"dojo/_base/window", // win.body
	"dojo/window", // winUtils.getBox winUtils.scrollIntoView
	"../../focus", // focus.focus(), focus.curNode
	"../_Plugin",
	"../../form/ToggleButton",
	"../../registry", // registry.getEnclosingWidget()
	"dojo/i18n!../nls/commands"
], function(aspect, declare, domClass, domGeometry, domStyle, i18n, keys, lang, on, has, win, winUtils,
			focus, _Plugin, ToggleButton, registry){

	// module:
	//		dijit/_editor/plugins/FullScreen

	var FullScreen = declare("dijit._editor.plugins.FullScreen", _Plugin, {
		// summary:
		//		This plugin provides FullScreen capability to the editor.  When
		//		toggled on, it will render the editor into the full window and
		//		overlay everything.  It also binds to the hotkey: CTRL-SHIFT-F11
		//		for toggling fullscreen mode.

		// zIndex: [public] Number
		//		zIndex value used for overlaying the full page.
		//		default is 500.
		zIndex: 500,

		// _origState: [private] Object
		//		The original view state of the editor.
		_origState: null,

		// _origiFrameState: [private] Object
		//		The original view state of the iframe of the editor.
		_origiFrameState: null,

		// _resizeHandle: [private] Object
		//		Connection point used for handling resize when window resizes.
		_resizeHandle: null,

		// isFullscreen: [const] boolean
		//		Read-Only variable used to denote of the editor is in fullscreen mode or not.
		isFullscreen: false,

		toggle: function(){
			// summary:
			//		Function to allow programmatic toggling of the view.
			this.button.set("checked", !this.button.get("checked"));
		},

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the resize button.
			var strings = i18n.getLocalization("dijit._editor", "commands"),
				editor = this.editor;
			this.button = new ToggleButton({
				label: strings["fullScreen"],
				ownerDocument: editor.ownerDocument,
				dir: editor.dir,
				lang: editor.lang,
				showLabel: false,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "FullScreen",
				tabIndex: "-1",
				onChange: lang.hitch(this, "_setFullScreen")
			});
		},

		setEditor: function(editor){
			// summary:
			//		Over-ride for the setting of the editor.
			// editor: Object
			//		The editor to configure for this plugin to use.
			this.editor = editor;
			this._initButton();

			this.editor.addKeyHandler(keys.F11, true, true, lang.hitch(this, function(e){
				// Enable the CTRL-SHIFT-F11 hotkey for fullscreen mode.
				this.toggle();
				e.stopPropagation();
				e.preventDefault();
				this.editor.defer("focus", 250);
				return true;
			}));
			this.own(on(this.editor.domNode, "keydown", lang.hitch(this, "_containFocus")));
		},

		_containFocus: function(e){
			// summary:
			//		When in Full Screen mode, it's good to try and retain focus in the editor
			//		so this function is intended to try and constrain the TAB key.
			// e: Event
			//		The key event.
			// tags:
			//		private
			if(this.isFullscreen){
				var ed = this.editor;
				if(!ed.isTabIndent &&
					ed._fullscreen_oldOnKeyDown &&
					e.keyCode === keys.TAB){
					// If we're in fullscreen mode, we want to take over how tab moves focus a bit.
					// to keep it within the editor since it's hiding the rest of the page.
					// IE hates changing focus IN the event handler, so need to put calls
					// in a timeout.  Gotta love IE.
					// Also need to check for alternate view nodes if present and active.
					var f = focus.curNode;
					var avn = this._getAltViewNode();
					if(f == ed.iframe ||
						(avn && f === avn)){
						setTimeout(lang.hitch(this, function(){
							ed.toolbar.focus();
						}), 10);
					}else{
						if(avn && domStyle.get(ed.iframe, "display") === "none"){
							setTimeout(lang.hitch(this, function(){
								focus.focus(avn);
							}), 10);
						}else{
							setTimeout(lang.hitch(this, function(){
								ed.focus();
							}), 10);
						}
					}
					event.stopPropagation();
					event.preventDefault();
				}else if(ed._fullscreen_oldOnKeyDown){
					// Only call up when it's a different function.  Traps corner case event issue
					// on IE which caused stack overflow on handler cleanup.
					ed._fullscreen_oldOnKeyDown(e);
				}
			}
		},

		_resizeEditor: function(){
			// summary:
			//		Function to handle resizing the editor as the viewport
			//		resizes (window scaled)
			// tags:
			//		private
			var vp = winUtils.getBox(this.editor.ownerDocument);
			domGeometry.setMarginBox(this.editor.domNode, {
				w: vp.w,
				h: vp.h
			});

			//Adjust the internal heights too, as they can be a bit off.
			var hHeight = this.editor.getHeaderHeight();
			var fHeight = this.editor.getFooterHeight();
			var extents = domGeometry.getPadBorderExtents(this.editor.domNode);
			var fcpExtents = domGeometry.getPadBorderExtents(this.editor.iframe.parentNode);
			var fcmExtents = domGeometry.getMarginExtents(this.editor.iframe.parentNode);

			var cHeight = vp.h - (hHeight + extents.h + fHeight);
			domGeometry.setMarginBox(this.editor.iframe.parentNode, {
				h: cHeight,
				w: vp.w
			});
			domGeometry.setMarginBox(this.editor.iframe, {
				h: cHeight - (fcpExtents.h + fcmExtents.h)
			});
		},

		_getAltViewNode: function(){
			// summary:
			//		This function is intended as a hook point for setting an
			//		alternate view node for when in full screen mode and the
			//		editable iframe is hidden.
			// tags:
			//		protected.
		},

		_setFullScreen: function(full){
			// summary:
			//		Function to handle toggling between full screen and
			//		regular view.
			// tags:
			//		private

			//Alias this for shorter code.
			var ed = this.editor;
			var body = ed.ownerDocumentBody;
			var editorParent = ed.domNode.parentNode;

			var vp = winUtils.getBox(ed.ownerDocument);

			this.isFullscreen = full;

			if(full){
				//Parent classes can royally screw up this plugin, so we
				//have to set everything to position static.
				while(editorParent && editorParent !== body){
					domClass.add(editorParent, "dijitForceStatic");
					editorParent = editorParent.parentNode;
				}

				// Save off the resize function.  We want to kill its behavior.
				this._editorResizeHolder = this.editor.resize;
				ed.resize = function(){
				};

				// Try to constrain focus control.
				ed._fullscreen_oldOnKeyDown = ed.onKeyDown;
				ed.onKeyDown = lang.hitch(this, this._containFocus);

				this._origState = {};
				this._origiFrameState = {};

				// Store the basic editor state we have to restore later.
				// Not using domStyle.get here, had problems, didn't
				// give me stuff like 100%, gave me pixel calculated values.
				// Need the exact original values.
				var domNode = ed.domNode,
					rawStyle = domNode && domNode.style || {};
				this._origState = {
					width: rawStyle.width || "",
					height: rawStyle.height || "",
					top: domStyle.get(domNode, "top") || "",
					left: domStyle.get(domNode, "left") || "",
					position: domStyle.get(domNode, "position") || "static",
					marginBox: domGeometry.getMarginBox(ed.domNode)
				};

				// Store the iframe state we have to restore later.
				// Not using domStyle.get here, had problems, didn't
				// give me stuff like 100%, gave me pixel calculated values.
				// Need the exact original values.
				var iframe = ed.iframe,
					iframeStyle = iframe && iframe.style || {};

				var bc = domStyle.get(ed.iframe, "backgroundColor");
				this._origiFrameState = {
					backgroundColor: bc || "transparent",
					width: iframeStyle.width || "auto",
					height: iframeStyle.height || "auto",
					zIndex: iframeStyle.zIndex || ""
				};

				// Okay, size everything.
				domStyle.set(ed.domNode, {
					position: "absolute",
					top: "0px",
					left: "0px",
					zIndex: this.zIndex,
					width: vp.w + "px",
					height: vp.h + "px"
				});

				domStyle.set(ed.iframe, {
					height: "100%",
					width: "100%",
					zIndex: this.zIndex,
					backgroundColor: bc !== "transparent" &&
						bc !== "rgba(0, 0, 0, 0)" ? bc : "white"
				});

				domStyle.set(ed.iframe.parentNode, {
					height: "95%",
					width: "100%"
				});

				// Store the overflow state we have to restore later.
				// IE had issues, so have to check that it's defined.  Ugh.
				if(body.style && body.style.overflow){
					this._oldOverflow = domStyle.get(body, "overflow");
				}else{
					this._oldOverflow = "";
				}

				if(has("ie") && !has("quirks")){
					// IE will put scrollbars in anyway, html (parent of body)
					// also controls them in standards mode, so we have to
					// remove them, argh.
					if(body.parentNode &&
						body.parentNode.style &&
						body.parentNode.style.overflow){
						this._oldBodyParentOverflow = body.parentNode.style.overflow;
					}else{
						try{
							this._oldBodyParentOverflow = domStyle.get(body.parentNode, "overflow");
						}catch(e){
							this._oldBodyParentOverflow = "scroll";
						}
					}
					domStyle.set(body.parentNode, "overflow", "hidden");
				}
				domStyle.set(body, "overflow", "hidden");

				var resizer = function(){
					// function to handle resize events.
					// Will check current VP and only resize if
					// different.
					var vp = winUtils.getBox(ed.ownerDocument);
					if("_prevW" in this && "_prevH" in this){
						// No actual size change, ignore.
						if(vp.w === this._prevW && vp.h === this._prevH){
							return;
						}
					}else{
						this._prevW = vp.w;
						this._prevH = vp.h;
					}
					if(this._resizer){
						clearTimeout(this._resizer);
						delete this._resizer;
					}
					// Timeout it to help avoid spamming resize on IE.
					// Works for all browsers.
					this._resizer = setTimeout(lang.hitch(this, function(){
						delete this._resizer;
						this._resizeEditor();
					}), 10);
				};
				this._resizeHandle = on(window, "resize", lang.hitch(this, resizer));

				// Also monitor for direct calls to resize and adapt editor.
				this._resizeHandle2 = aspect.after(ed, "onResize", lang.hitch(this, function(){
					if(this._resizer){
						clearTimeout(this._resizer);
						delete this._resizer;
					}
					this._resizer = setTimeout(lang.hitch(this, function(){
						delete this._resizer;
						this._resizeEditor();
					}), 10);
				}));

				// Call it once to work around IE glitchiness.  Safe for other browsers too.
				this._resizeEditor();
				var dn = this.editor.toolbar.domNode;
				setTimeout(function(){
					winUtils.scrollIntoView(dn);
				}, 250);
			}else{
				if(this._resizeHandle){
					// Cleanup resizing listeners
					this._resizeHandle.remove();
					this._resizeHandle = null;
				}
				if(this._resizeHandle2){
					// Cleanup resizing listeners
					this._resizeHandle2.remove();
					this._resizeHandle2 = null;
				}
				if(this._rst){
					clearTimeout(this._rst);
					this._rst = null;
				}

				//Remove all position static class assigns.
				while(editorParent && editorParent !== body){
					domClass.remove(editorParent, "dijitForceStatic");
					editorParent = editorParent.parentNode;
				}

				// Restore resize function
				if(this._editorResizeHolder){
					this.editor.resize = this._editorResizeHolder;
				}

				if(!this._origState && !this._origiFrameState){
					// If we actually didn't toggle, then don't do anything.
					return;
				}
				if(ed._fullscreen_oldOnKeyDown){
					ed.onKeyDown = ed._fullscreen_oldOnKeyDown;
					delete ed._fullscreen_oldOnKeyDown;
				}

				// Add a timeout to make sure we don't have a resize firing in the
				// background at the time of minimize.
				var self = this;
				setTimeout(function(){
					// Restore all the editor state.
					var mb = self._origState.marginBox;
					var oh = self._origState.height;
					if(has("ie") && !has("quirks")){
						body.parentNode.style.overflow = self._oldBodyParentOverflow;
						delete self._oldBodyParentOverflow;
					}
					domStyle.set(body, "overflow", self._oldOverflow);
					delete self._oldOverflow;

					domStyle.set(ed.domNode, self._origState);
					domStyle.set(ed.iframe.parentNode, {
						height: "",
						width: ""
					});
					domStyle.set(ed.iframe, self._origiFrameState);
					delete self._origState;
					delete self._origiFrameState;
					// In case it is contained in a layout and the layout changed size,
					// go ahead and call resize.
					var pWidget = registry.getEnclosingWidget(ed.domNode.parentNode);
					if(pWidget && pWidget.resize){
						pWidget.resize();
					}else{
						if(!oh || oh.indexOf("%") < 0){
							// Resize if the original size wasn't set
							// or wasn't in percent.  Timeout is to avoid
							// an IE crash in unit testing.
							setTimeout(lang.hitch(this, function(){
								ed.resize({h: mb.h});
							}), 0);
						}
					}
					winUtils.scrollIntoView(self.editor.toolbar.domNode);
				}, 100);
			}
		},

		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		},

		destroy: function(){
			// summary:
			//		Over-ride to ensure the resize handle gets cleaned up.
			if(this._resizeHandle){
				// Cleanup resizing listeners
				this._resizeHandle.remove();
				this._resizeHandle = null;
			}
			if(this._resizeHandle2){
				// Cleanup resizing listeners
				this._resizeHandle2.remove();
				this._resizeHandle2 = null;
			}
			if(this._resizer){
				clearTimeout(this._resizer);
				this._resizer = null;
			}
			this.inherited(arguments);
		}
	});

	// Register this plugin.
	// For back-compat accept "fullscreen" (all lowercase) too, remove in 2.0
	_Plugin.registry["fullScreen"] = _Plugin.registry["fullscreen"] = function(args){
		return new FullScreen({
			zIndex: ("zIndex" in args) ? args.zIndex : 500
		});
	};

	return FullScreen;
});

},
'dijit/_editor/plugins/NewPage':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/i18n", // i18n.getLocalization
	"dojo/_base/lang", // lang.hitch
	"../_Plugin",
	"../../form/Button",
	"dojo/i18n!../nls/commands"
], function(declare, i18n, lang, _Plugin, Button){

	// module:
	//		dijit/_editor/plugins/NewPage

	var NewPage = declare("dijit._editor.plugins.NewPage", _Plugin, {
		// summary:
		//		This plugin provides a simple 'new page' capability.  In other
		//		words, set content to some default user defined string.

		// content: [public] String
		//		The default content to insert into the editor as the new page.
		//		The default is the `<br>` tag, a single blank line.
		content: "<br>",

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the Print button.
			var strings = i18n.getLocalization("dijit._editor", "commands"),
				editor = this.editor;
			this.button = new Button({
				label: strings["newPage"],
				ownerDocument: editor.ownerDocument,
				dir: editor.dir,
				lang: editor.lang,
				showLabel: false,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "NewPage",
				tabIndex: "-1",
				onClick: lang.hitch(this, "_newPage")
			});
		},

		setEditor: function(/*dijit/Editor*/ editor){
			// summary:
			//		Tell the plugin which Editor it is associated with.
			// editor: Object
			//		The editor object to attach the newPage capability to.
			this.editor = editor;
			this._initButton();
		},

		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		},

		_newPage: function(){
			// summary:
			//		Function to set the content to blank.
			// tags:
			//		private
			this.editor.beginEditing();
			this.editor.set("value", this.content);
			this.editor.endEditing();
			this.editor.focus();
		}
	});

	// Register this plugin.
	// For back-compat accept "newpage" (all lowercase) too, remove in 2.0
	_Plugin.registry["newPage"] = _Plugin.registry["newpage"] = function(args){
		return new NewPage({
			content: ("content" in args) ? args.content : "<br>"
		});
	};

	return NewPage;
});

},
'dijit/form/MappedTextBox':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/sniff", // has("msapp")
	"dojo/dom-construct", // domConstruct.place
	"./ValidationTextBox"
], function(declare, has, domConstruct, ValidationTextBox){

	// module:
	//		dijit/form/MappedTextBox

	return declare("dijit.form.MappedTextBox", ValidationTextBox, {
		// summary:
		//		A dijit/form/ValidationTextBox subclass which provides a base class for widgets that have
		//		a visible formatted display value, and a serializable
		//		value in a hidden input field which is actually sent to the server.
		// description:
		//		The visible display may
		//		be locale-dependent and interactive.  The value sent to the server is stored in a hidden
		//		input field which uses the `name` attribute declared by the original widget.  That value sent
		//		to the server is defined by the dijit/form/MappedTextBox.serialize() method and is typically
		//		locale-neutral.
		// tags:
		//		protected

		postMixInProperties: function(){
			this.inherited(arguments);

			// We want the name attribute to go to the hidden <input>, not the displayed <input>,
			// so override _FormWidget.postMixInProperties() setting of nameAttrSetting for IE.
			this.nameAttrSetting = "";
		},

		// Remap name attribute to be mapped to hidden node created in buildRendering(), rather than this.focusNode
		_setNameAttr: "valueNode",

		serialize: function(val /*=====, options =====*/){
			// summary:
			//		Overridable function used to convert the get('value') result to a canonical
			//		(non-localized) string.  For example, will print dates in ISO format, and
			//		numbers the same way as they are represented in javascript.
			// val: anything
			// options: Object?
			// tags:
			//		protected extension
			return val.toString ? val.toString() : ""; // String
		},

		toString: function(){
			// summary:
			//		Returns widget as a printable string using the widget's value
			// tags:
			//		protected
			var val = this.filter(this.get('value')); // call filter in case value is nonstring and filter has been customized
			return val != null ? (typeof val == "string" ? val : this.serialize(val, this.constraints)) : ""; // String
		},

		validate: function(){
			// Overrides `dijit/form/TextBox.validate`
			this.valueNode.value = this.toString();
			return this.inherited(arguments);
		},

		buildRendering: function(){
			// Overrides `dijit/_TemplatedMixin/buildRendering`

			this.inherited(arguments);

			// Create a hidden <input> node with the serialized value used for submit
			// (as opposed to the displayed value).
			// Passing in name as markup rather than relying on _setNameAttr custom setter above
			// to make query(input[name=...]) work on IE. (see #8660).
			// But not doing that for Windows 8 Store apps because it causes a security exception (see #16452).
			this.valueNode = domConstruct.place("<input type='hidden'" +
				((this.name && !has("msapp")) ? ' name="' + this.name.replace(/"/g, "&quot;") + '"' : "") + "/>",
				this.textbox, "after");
		},

		reset: function(){
			// Overrides `dijit/form/ValidationTextBox.reset` to
			// reset the hidden textbox value to ''
			this.valueNode.value = '';
			this.inherited(arguments);
		}
	});
});

},
'dijit/form/_ButtonMixin':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/dom", // dom.setSelectable
	"dojo/has",
	"../registry"        // registry.byNode
], function(declare, dom, has, registry){

	// module:
	//		dijit/form/_ButtonMixin

	var ButtonMixin = declare("dijit.form._ButtonMixin" + (has("dojo-bidi") ? "_NoBidi" : ""), null, {
		// summary:
		//		A mixin to add a thin standard API wrapper to a normal HTML button
		// description:
		//		A label should always be specified (through innerHTML) or the label attribute.
		//
		//		Attach points:
		//
		//		- focusNode (required): this node receives focus
		//		- valueNode (optional): this node's value gets submitted with FORM elements
		//		- containerNode (optional): this node gets the innerHTML assignment for label
		// example:
		// |	<button data-dojo-type="dijit/form/Button" onClick="...">Hello world</button>
		// example:
		// |	var button1 = new Button({label: "hello world", onClick: foo});
		// |	dojo.body().appendChild(button1.domNode);

		// label: HTML String
		//		Content to display in button.
		label: "",

		// type: [const] String
		//		Type of button (submit, reset, button, checkbox, radio)
		type: "button",

		__onClick: function(/*Event*/ e){
			// summary:
			//		Internal function to divert the real click onto the hidden INPUT that has a native default action associated with it
			// type:
			//		private
			e.stopPropagation();
			e.preventDefault();
			if(!this.disabled){
				// cannot use on.emit since button default actions won't occur
				this.valueNode.click(e);
			}
			return false;
		},

		_onClick: function(/*Event*/ e){
			// summary:
			//		Internal function to handle click actions
			if(this.disabled){
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
			if(this.onClick(e) === false){
				e.preventDefault();
			}
			cancelled = e.defaultPrevented;

			// Signal Form/Dialog to submit/close.  For 2.0, consider removing this code and instead making the Form/Dialog
			// listen for bubbled click events where evt.target.type == "submit" && !evt.defaultPrevented.
			if(!cancelled && this.type == "submit" && !(this.valueNode || this.focusNode).form){
				for(var node = this.domNode; node.parentNode; node = node.parentNode){
					var widget = registry.byNode(node);
					if(widget && typeof widget._onSubmit == "function"){
						widget._onSubmit(e);
						e.preventDefault(); // action has already occurred
						cancelled = true;
						break;
					}
				}
			}

			return !cancelled;
		},

		postCreate: function(){
			this.inherited(arguments);
			dom.setSelectable(this.focusNode, false);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		Callback for when button is clicked.
			//		If type="submit", return true to perform submit, or false to cancel it.
			// type:
			//		callback
			return true;		// Boolean
		},

		_setLabelAttr: function(/*String*/ content){
			// summary:
			//		Hook for set('label', ...) to work.
			// description:
			//		Set the label (text) of the button; takes an HTML string.
			this._set("label", content);
			var labelNode = this.containerNode || this.focusNode;
			labelNode.innerHTML = content;
		}
	});

	if(has("dojo-bidi")){
		ButtonMixin = declare("dijit.form._ButtonMixin", ButtonMixin, {
			_setLabelAttr: function(){
				this.inherited(arguments);
				var labelNode = this.containerNode || this.focusNode;
				this.applyTextDir(labelNode);
			}
		});
	}

	return ButtonMixin;
});

},
'dijit/form/_FormWidget':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/sniff", // has("dijit-legacy-requires"), has("msapp")
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/ready",
	"../_Widget",
	"../_CssStateMixin",
	"../_TemplatedMixin",
	"./_FormWidgetMixin"
], function(declare, has, kernel, ready, _Widget, _CssStateMixin, _TemplatedMixin, _FormWidgetMixin){

	// module:
	//		dijit/form/_FormWidget

	// Back compat w/1.6, remove for 2.0
	if(has("dijit-legacy-requires")){
		ready(0, function(){
			var requires = ["dijit/form/_FormValueWidget"];
			require(requires);	// use indirection so modules not rolled into a build
		});
	}

	return declare("dijit.form._FormWidget", [_Widget, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin], {
		// summary:
		//		Base class for widgets corresponding to native HTML elements such as `<checkbox>` or `<button>`,
		//		which can be children of a `<form>` node or a `dijit/form/Form` widget.
		//
		// description:
		//		Represents a single HTML element.
		//		All these widgets should have these attributes just like native HTML input elements.
		//		You can set them during widget construction or afterwards, via `dijit/_WidgetBase.set()`.
		//
		//		They also share some common methods.

		setDisabled: function(/*Boolean*/ disabled){
			// summary:
			//		Deprecated.  Use set('disabled', ...) instead.
			kernel.deprecated("setDisabled(" + disabled + ") is deprecated. Use set('disabled'," + disabled + ") instead.", "", "2.0");
			this.set('disabled', disabled);
		},

		setValue: function(/*String*/ value){
			// summary:
			//		Deprecated.  Use set('value', ...) instead.
			kernel.deprecated("dijit.form._FormWidget:setValue(" + value + ") is deprecated.  Use set('value'," + value + ") instead.", "", "2.0");
			this.set('value', value);
		},

		getValue: function(){
			// summary:
			//		Deprecated.  Use get('value') instead.
			kernel.deprecated(this.declaredClass + "::getValue() is deprecated. Use get('value') instead.", "", "2.0");
			return this.get('value');
		},

		postMixInProperties: function(){
			// Setup name=foo string to be referenced from the template (but only if a name has been specified).
			// Unfortunately we can't use _setNameAttr to set the name in IE due to IE limitations, see #8484, #8660.
			// But when IE6 and IE7 are desupported, then we probably don't need this anymore, so should remove it in 2.0.
			// Also, don't do this for Windows 8 Store Apps because it causes a security exception (see #16452).
			// Regarding escaping, see heading "Attribute values" in
			// http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.3.2
			this.nameAttrSetting = (this.name && !has("msapp")) ? ('name="' + this.name.replace(/"/g, "&quot;") + '"') : '';
			this.inherited(arguments);
		},

		// Override automatic assigning type --> focusNode, it causes exception on IE.
		// Instead, type must be specified as ${type} in the template, as part of the original DOM
		_setTypeAttr: null
	});
});

},
'dojo/dnd/TimedMoveable':function(){
define(["../_base/declare", "./Moveable" /*=====, "./Mover" =====*/], function(declare, Moveable /*=====, Mover =====*/){
	// module:
	//		dojo/dnd/TimedMoveable

	/*=====
	var __TimedMoveableArgs = declare([Moveable.__MoveableArgs], {
		// timeout: Number
		//		delay move by this number of ms,
		//		accumulating position changes during the timeout
		timeout: 0
	});
	=====*/

	// precalculate long expressions
	var oldOnMove = Moveable.prototype.onMove;

	return declare("dojo.dnd.TimedMoveable", Moveable, {
		// summary:
		//		A specialized version of Moveable to support an FPS throttling.
		//		This class puts an upper restriction on FPS, which may reduce
		//		the CPU load. The additional parameter "timeout" regulates
		//		the delay before actually moving the moveable object.

		// object attributes (for markup)
		timeout: 40,	// in ms, 40ms corresponds to 25 fps

		constructor: function(node, params){
			// summary:
			//		an object that makes a node moveable with a timer
			// node: Node||String
			//		a node (or node's id) to be moved
			// params: __TimedMoveableArgs
			//		object with additional parameters.

			// sanitize parameters
			if(!params){ params = {}; }
			if(params.timeout && typeof params.timeout == "number" && params.timeout >= 0){
				this.timeout = params.timeout;
			}
		},

		onMoveStop: function(/*Mover*/ mover){
			if(mover._timer){
				// stop timer
				clearTimeout(mover._timer);
				// reflect the last received position
				oldOnMove.call(this, mover, mover._leftTop);
			}
			Moveable.prototype.onMoveStop.apply(this, arguments);
		},
		onMove: function(/*Mover*/ mover, /*Object*/ leftTop){
			mover._leftTop = leftTop;
			if(!mover._timer){
				var _t = this;	// to avoid using dojo.hitch()
				mover._timer = setTimeout(function(){
					// we don't have any pending requests
					mover._timer = null;
					// reflect the last received position
					oldOnMove.call(_t, mover, mover._leftTop);
				}, this.timeout);
			}
		}
	});
});

},
'dijit/_editor/plugins/TextColor':function(){
define([
	"require",
	"dojo/colors", // colors.fromRgb
	"dojo/_base/declare", // declare
	"dojo/_base/lang",
	"../_Plugin",
	"../../form/DropDownButton"
], function(require, colors, declare, lang, _Plugin, DropDownButton){

	// module:
	//		dijit/_editor/plugins/TextColor

	var TextColor = declare("dijit._editor.plugins.TextColor", _Plugin, {
		// summary:
		//		This plugin provides dropdown color pickers for setting text color and background color
		// description:
		//		The commands provided by this plugin are:
		//
		//		- foreColor - sets the text color
		//		- hiliteColor - sets the background color

		// Override _Plugin.buttonClass to use DropDownButton (with ColorPalette) to control this plugin
		buttonClass: DropDownButton,

		// useDefaultCommand: Boolean
		//		False as we do not use the default editor command/click behavior.
		useDefaultCommand: false,

		_initButton: function(){
			this.inherited(arguments);

			// Setup to lazy load ColorPalette first time the button is clicked
			var self = this;
			this.button.loadDropDown = function(callback){
				require(["../../ColorPalette"], lang.hitch(this, function(ColorPalette){
					this.dropDown = new ColorPalette({
						dir: self.editor.dir,
						ownerDocument: self.editor.ownerDocument,
						value: self.value,
						onChange: function(color){
							self.editor.execCommand(self.command, color);
						}
					});
					callback();
				}));
			};
		},

		updateState: function(){
			// summary:
			//		Overrides _Plugin.updateState().  This updates the ColorPalette
			//		to show the color of the currently selected text.
			// tags:
			//		protected

			var _e = this.editor;
			var _c = this.command;
			if(!_e || !_e.isLoaded || !_c.length){
				return;
			}

			if(this.button){
				var disabled = this.get("disabled");
				this.button.set("disabled", disabled);
				if(disabled){
					return;
				}

				var value;
				try{
					value = _e.queryCommandValue(_c) || "";
				}catch(e){
					//Firefox may throw error above if the editor is just loaded, ignore it
					value = "";
				}
			}

			if(value == ""){
				value = "#000000";
			}
			if(value == "transparent"){
				value = "#ffffff";
			}

			if(typeof value == "string"){
				//if RGB value, convert to hex value
				if(value.indexOf("rgb") > -1){
					value = colors.fromRgb(value).toHex();
				}
			}else{    //it's an integer(IE returns an MS access #)
				value = ((value & 0x0000ff) << 16) | (value & 0x00ff00) | ((value & 0xff0000) >>> 16);
				value = value.toString(16);
				value = "#000000".slice(0, 7 - value.length) + value;

			}

			this.value = value;

			var dropDown = this.button.dropDown;
			if(dropDown && value !== dropDown.get('value')){
				dropDown.set('value', value, false);
			}
		}
	});

	// Register this plugin.
	_Plugin.registry["foreColor"] = function(){
		return new TextColor({command: "foreColor"});
	};
	_Plugin.registry["hiliteColor"] = function(){
		return new TextColor({command: "hiliteColor"});
	};

	return TextColor;
});

},
'dojo/promise/all':function(){
define([
	"../_base/array",
	"../Deferred",
	"../when"
], function(array, Deferred, when){
	"use strict";

	// module:
	//		dojo/promise/all

	var some = array.some;

	return function all(objectOrArray){
		// summary:
		//		Takes multiple promises and returns a new promise that is fulfilled
		//		when all promises have been fulfilled.
		// description:
		//		Takes multiple promises and returns a new promise that is fulfilled
		//		when all promises have been fulfilled. If one of the promises is rejected,
		//		the returned promise is also rejected. Canceling the returned promise will
		//		*not* cancel any passed promises.
		// objectOrArray: Object|Array?
		//		The promise will be fulfilled with a list of results if invoked with an
		//		array, or an object of results when passed an object (using the same
		//		keys). If passed neither an object or array it is resolved with an
		//		undefined value.
		// returns: dojo/promise/Promise

		var object, array;
		if(objectOrArray instanceof Array){
			array = objectOrArray;
		}else if(objectOrArray && typeof objectOrArray === "object"){
			object = objectOrArray;
		}

		var results;
		var keyLookup = [];
		if(object){
			array = [];
			for(var key in object){
				if(Object.hasOwnProperty.call(object, key)){
					keyLookup.push(key);
					array.push(object[key]);
				}
			}
			results = {};
		}else if(array){
			results = [];
		}

		if(!array || !array.length){
			return new Deferred().resolve(results);
		}

		var deferred = new Deferred();
		deferred.promise.always(function(){
			results = keyLookup = null;
		});
		var waiting = array.length;
		some(array, function(valueOrPromise, index){
			if(!object){
				keyLookup.push(index);
			}
			when(valueOrPromise, function(value){
				if(!deferred.isFulfilled()){
					results[keyLookup[index]] = value;
					if(--waiting === 0){
						deferred.resolve(results);
					}
				}
			}, deferred.reject);
			return deferred.isFulfilled();
		});
		return deferred.promise;	// dojo/promise/Promise
	};
});

},
'dijit/_TemplatedMixin':function(){
define([
	"dojo/cache",	// dojo.cache
	"dojo/_base/declare", // declare
	"dojo/dom-construct", // domConstruct.destroy, domConstruct.toDom
	"dojo/_base/lang", // lang.getObject
	"dojo/on",
	"dojo/sniff", // has("ie")
	"dojo/string", // string.substitute string.trim
	"./_AttachMixin"
], function(cache, declare, domConstruct, lang, on, has, string, _AttachMixin){

	// module:
	//		dijit/_TemplatedMixin

	var _TemplatedMixin = declare("dijit._TemplatedMixin", _AttachMixin, {
		// summary:
		//		Mixin for widgets that are instantiated from a template

		// templateString: [protected] String
		//		A string that represents the widget template.
		//		Use in conjunction with dojo.cache() to load from a file.
		templateString: null,

		// templatePath: [protected deprecated] String
		//		Path to template (HTML file) for this widget relative to dojo.baseUrl.
		//		Deprecated: use templateString with require([... "dojo/text!..."], ...) instead
		templatePath: null,

		// skipNodeCache: [protected] Boolean
		//		If using a cached widget template nodes poses issues for a
		//		particular widget class, it can set this property to ensure
		//		that its template is always re-built from a string
		_skipNodeCache: false,

/*=====
		// _rendered: Boolean
		//		Not normally use, but this flag can be set by the app if the server has already rendered the template,
		//		i.e. already inlining the template for the widget into the main page.   Reduces _TemplatedMixin to
		//		just function like _AttachMixin.
		_rendered: false,
=====*/

		// Set _AttachMixin.searchContainerNode to true for back-compat for widgets that have data-dojo-attach-point's
		// and events inside this.containerNode.   Remove for 2.0.
		searchContainerNode: true,

		_stringRepl: function(tmpl){
			// summary:
			//		Does substitution of ${foo} type properties in template string
			// tags:
			//		private
			var className = this.declaredClass, _this = this;
			// Cache contains a string because we need to do property replacement
			// do the property replacement
			return string.substitute(tmpl, this, function(value, key){
				if(key.charAt(0) == '!'){ value = lang.getObject(key.substr(1), false, _this); }
				if(typeof value == "undefined"){ throw new Error(className+" template:"+key); } // a debugging aide
				if(value == null){ return ""; }

				// Substitution keys beginning with ! will skip the transform step,
				// in case a user wishes to insert unescaped markup, e.g. ${!foo}
				return key.charAt(0) == "!" ? value :
					// Safer substitution, see heading "Attribute values" in
					// http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.3.2
					value.toString().replace(/"/g,"&quot;"); //TODO: add &amp? use encodeXML method?
			}, this);
		},

		buildRendering: function(){
			// summary:
			//		Construct the UI for this widget from a template, setting this.domNode.
			// tags:
			//		protected

			if(!this._rendered){
				if(!this.templateString){
					this.templateString = cache(this.templatePath, {sanitize: true});
				}

				// Lookup cached version of template, and download to cache if it
				// isn't there already.  Returns either a DomNode or a string, depending on
				// whether or not the template contains ${foo} replacement parameters.
				var cached = _TemplatedMixin.getCachedTemplate(this.templateString, this._skipNodeCache, this.ownerDocument);

				var node;
				if(lang.isString(cached)){
					node = domConstruct.toDom(this._stringRepl(cached), this.ownerDocument);
					if(node.nodeType != 1){
						// Flag common problems such as templates with multiple top level nodes (nodeType == 11)
						throw new Error("Invalid template: " + cached);
					}
				}else{
					// if it's a node, all we have to do is clone it
					node = cached.cloneNode(true);
				}

				this.domNode = node;
			}

			// Call down to _WidgetBase.buildRendering() to get base classes assigned
			// TODO: change the baseClass assignment to _setBaseClassAttr
			this.inherited(arguments);

			if(!this._rendered){
				this._fillContent(this.srcNodeRef);
			}

			this._rendered = true;
		},

		_fillContent: function(/*DomNode*/ source){
			// summary:
			//		Relocate source contents to templated container node.
			//		this.containerNode must be able to receive children, or exceptions will be thrown.
			// tags:
			//		protected
			var dest = this.containerNode;
			if(source && dest){
				while(source.hasChildNodes()){
					dest.appendChild(source.firstChild);
				}
			}
		}

	});

	// key is templateString; object is either string or DOM tree
	_TemplatedMixin._templateCache = {};

	_TemplatedMixin.getCachedTemplate = function(templateString, alwaysUseString, doc){
		// summary:
		//		Static method to get a template based on the templatePath or
		//		templateString key
		// templateString: String
		//		The template
		// alwaysUseString: Boolean
		//		Don't cache the DOM tree for this template, even if it doesn't have any variables
		// doc: Document?
		//		The target document.   Defaults to document global if unspecified.
		// returns: Mixed
		//		Either string (if there are ${} variables that need to be replaced) or just
		//		a DOM tree (if the node can be cloned directly)

		// is it already cached?
		var tmplts = _TemplatedMixin._templateCache;
		var key = templateString;
		var cached = tmplts[key];
		if(cached){
			try{
				// if the cached value is an innerHTML string (no ownerDocument) or a DOM tree created within the
				// current document, then use the current cached value
				if(!cached.ownerDocument || cached.ownerDocument == (doc || document)){
					// string or node of the same document
					return cached;
				}
			}catch(e){ /* squelch */ } // IE can throw an exception if cached.ownerDocument was reloaded
			domConstruct.destroy(cached);
		}

		templateString = string.trim(templateString);

		if(alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g)){
			// there are variables in the template so all we can do is cache the string
			return (tmplts[key] = templateString); //String
		}else{
			// there are no variables in the template so we can cache the DOM tree
			var node = domConstruct.toDom(templateString, doc);
			if(node.nodeType != 1){
				throw new Error("Invalid template: " + templateString);
			}
			return (tmplts[key] = node); //Node
		}
	};

	if(has("ie")){
		on(window, "unload", function(){
			var cache = _TemplatedMixin._templateCache;
			for(var key in cache){
				var value = cache[key];
				if(typeof value == "object"){ // value is either a string or a DOM node template
					domConstruct.destroy(value);
				}
				delete cache[key];
			}
		});
	}

	return _TemplatedMixin;
});

},
'dijit/_editor/plugins/EnterKeyHandling':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/dom-construct", // domConstruct.destroy domConstruct.place
	"dojo/keys", // keys.ENTER
	"dojo/_base/lang",
	"dojo/on",
	"dojo/sniff", // has("ie") has("mozilla") has("webkit")
	"dojo/_base/window", // win.withGlobal
	"dojo/window", // winUtils.scrollIntoView
	"../_Plugin",
	"../RichText",
	"../range",
	"../../_base/focus"
], function(declare, domConstruct, keys, lang, on, has, win, winUtils, _Plugin, RichText, rangeapi, baseFocus){

	// module:
	//		dijit/_editor/plugins/EnterKeyHandling

	return declare("dijit._editor.plugins.EnterKeyHandling", _Plugin, {
		// summary:
		//		This plugin tries to make all browsers behave consistently with regard to
		//		how ENTER behaves in the editor window.  It traps the ENTER key and alters
		//		the way DOM is constructed in certain cases to try to commonize the generated
		//		DOM and behaviors across browsers.
		//
		// description:
		//		This plugin has three modes:
		//
		//		- blockNodeForEnter=BR
		//		- blockNodeForEnter=DIV
		//		- blockNodeForEnter=P
		//
		//		In blockNodeForEnter=P, the ENTER key starts a new
		//		paragraph, and shift-ENTER starts a new line in the current paragraph.
		//		For example, the input:
		//
		//	|	first paragraph <shift-ENTER>
		//	|	second line of first paragraph <ENTER>
		//	|	second paragraph
		//
		//		will generate:
		//
		//	|	<p>
		//	|		first paragraph
		//	|		<br/>
		//	|		second line of first paragraph
		//	|	</p>
		//	|	<p>
		//	|		second paragraph
		//	|	</p>
		//
		//		In BR and DIV mode, the ENTER key conceptually goes to a new line in the
		//		current paragraph, and users conceptually create a new paragraph by pressing ENTER twice.
		//		For example, if the user enters text into an editor like this:
		//
		//	|		one <ENTER>
		//	|		two <ENTER>
		//	|		three <ENTER>
		//	|		<ENTER>
		//	|		four <ENTER>
		//	|		five <ENTER>
		//	|		six <ENTER>
		//
		//		It will appear on the screen as two 'paragraphs' of three lines each.  Markupwise, this generates:
		//
		//		BR:
		//	|		one<br/>
		//	|		two<br/>
		//	|		three<br/>
		//	|		<br/>
		//	|		four<br/>
		//	|		five<br/>
		//	|		six<br/>
		//
		//		DIV:
		//	|		<div>one</div>
		//	|		<div>two</div>
		//	|		<div>three</div>
		//	|		<div>&nbsp;</div>
		//	|		<div>four</div>
		//	|		<div>five</div>
		//	|		<div>six</div>

		// blockNodeForEnter: String
		//		This property decides the behavior of Enter key. It can be either P,
		//		DIV, BR, or empty (which means disable this feature). Anything else
		//		will trigger errors.  The default is 'BR'
		//
		//		See class description for more details.
		blockNodeForEnter: 'BR',

		constructor: function(args){
			if(args){
				if("blockNodeForEnter" in args){
					args.blockNodeForEnter = args.blockNodeForEnter.toUpperCase();
				}
				lang.mixin(this, args);
			}
		},

		setEditor: function(editor){
			// Overrides _Plugin.setEditor().
			if(this.editor === editor){
				return;
			}
			this.editor = editor;
			if(this.blockNodeForEnter == 'BR'){
				// While Moz has a mode tht mostly works, it's still a little different,
				// So, try to just have a common mode and be consistent.  Which means
				// we need to enable customUndo, if not already enabled.
				this.editor.customUndo = true;
				editor.onLoadDeferred.then(lang.hitch(this, function(d){
					this.own(on(editor.document, "keydown", lang.hitch(this, function(e){
						if(e.keyCode == keys.ENTER){
							// Just do it manually.  The handleEnterKey has a shift mode that
							// Always acts like <br>, so just use it.
							var ne = lang.mixin({}, e);
							ne.shiftKey = true;
							if(!this.handleEnterKey(ne)){
								e.stopPropagation();
								e.preventDefault();
							}
						}
					})));
					if(has("ie") >= 9){
						this.own(on(editor.document, "paste", lang.hitch(this, function(e){
							setTimeout(lang.hitch(this, function(){
								// Use the old range/selection code to kick IE 9 into updating
								// its range by moving it back, then forward, one 'character'.
								var r = this.editor.document.selection.createRange();
								r.move('character', -1);
								r.select();
								r.move('character', 1);
								r.select();
							}), 0);
						})));
					}
					return d;
				}));
			}else if(this.blockNodeForEnter){
				// add enter key handler
				var h = lang.hitch(this, "handleEnterKey");
				editor.addKeyHandler(13, 0, 0, h); //enter
				editor.addKeyHandler(13, 0, 1, h); //shift+enter
				this.own(this.editor.on('KeyPressed', lang.hitch(this, 'onKeyPressed')));
			}
		},
		onKeyPressed: function(){
			// summary:
			//		Handler for after the user has pressed a key, and the display has been updated.
			//		Connected to RichText's onKeyPressed() method.
			// tags:
			//		private
			if(this._checkListLater){
				if(win.withGlobal(this.editor.window, 'isCollapsed', baseFocus)){	// TODO: stop using withGlobal(), and baseFocus
					var liparent = this.editor.selection.getAncestorElement('LI');
					if(!liparent){
						// circulate the undo detection code by calling RichText::execCommand directly
						RichText.prototype.execCommand.call(this.editor, 'formatblock', this.blockNodeForEnter);
						// set the innerHTML of the new block node
						var block = this.editor.selection.getAncestorElement(this.blockNodeForEnter);
						if(block){
							block.innerHTML = this.bogusHtmlContent;
							if(has("ie") <= 9){
								// move to the start by moving backwards one char
								var r = this.editor.document.selection.createRange();
								r.move('character', -1);
								r.select();
							}
						}else{
							console.error('onKeyPressed: Cannot find the new block node'); // FIXME
						}
					}else{
						if(has("mozilla")){
							if(liparent.parentNode.parentNode.nodeName == 'LI'){
								liparent = liparent.parentNode.parentNode;
							}
						}
						var fc = liparent.firstChild;
						if(fc && fc.nodeType == 1 && (fc.nodeName == 'UL' || fc.nodeName == 'OL')){
							liparent.insertBefore(fc.ownerDocument.createTextNode('\xA0'), fc);
							var newrange = rangeapi.create(this.editor.window);
							newrange.setStart(liparent.firstChild, 0);
							var selection = rangeapi.getSelection(this.editor.window, true);
							selection.removeAllRanges();
							selection.addRange(newrange);
						}
					}
				}
				this._checkListLater = false;
			}
			if(this._pressedEnterInBlock){
				// the new created is the original current P, so we have previousSibling below
				if(this._pressedEnterInBlock.previousSibling){
					this.removeTrailingBr(this._pressedEnterInBlock.previousSibling);
				}
				delete this._pressedEnterInBlock;
			}
		},

		// bogusHtmlContent: [private] String
		//		HTML to stick into a new empty block
		bogusHtmlContent: '&#160;', // &nbsp;

		// blockNodes: [private] Regex
		//		Regex for testing if a given tag is a block level (display:block) tag
		blockNodes: /^(?:P|H1|H2|H3|H4|H5|H6|LI)$/,

		handleEnterKey: function(e){
			// summary:
			//		Handler for enter key events when blockNodeForEnter is DIV or P.
			// description:
			//		Manually handle enter key event to make the behavior consistent across
			//		all supported browsers. See class description for details.
			// tags:
			//		private

			var selection, range, newrange, startNode, endNode, brNode, doc = this.editor.document, br, rs, txt;
			if(e.shiftKey){        // shift+enter always generates <br>
				var parent = this.editor.selection.getParentElement();
				var header = rangeapi.getAncestor(parent, this.blockNodes);
				if(header){
					if(header.tagName == 'LI'){
						return true; // let browser handle
					}
					selection = rangeapi.getSelection(this.editor.window);
					range = selection.getRangeAt(0);
					if(!range.collapsed){
						range.deleteContents();
						selection = rangeapi.getSelection(this.editor.window);
						range = selection.getRangeAt(0);
					}
					if(rangeapi.atBeginningOfContainer(header, range.startContainer, range.startOffset)){
						br = doc.createElement('br');
						newrange = rangeapi.create(this.editor.window);
						header.insertBefore(br, header.firstChild);
						newrange.setStartAfter(br);
						selection.removeAllRanges();
						selection.addRange(newrange);
					}else if(rangeapi.atEndOfContainer(header, range.startContainer, range.startOffset)){
						newrange = rangeapi.create(this.editor.window);
						br = doc.createElement('br');
						header.appendChild(br);
						header.appendChild(doc.createTextNode('\xA0'));
						newrange.setStart(header.lastChild, 0);
						selection.removeAllRanges();
						selection.addRange(newrange);
					}else{
						rs = range.startContainer;
						if(rs && rs.nodeType == 3){
							// Text node, we have to split it.
							txt = rs.nodeValue;
							startNode = doc.createTextNode(txt.substring(0, range.startOffset));
							endNode = doc.createTextNode(txt.substring(range.startOffset));
							brNode = doc.createElement("br");

							if(endNode.nodeValue == "" && has("webkit")){
								endNode = doc.createTextNode('\xA0')
							}
							domConstruct.place(startNode, rs, "after");
							domConstruct.place(brNode, startNode, "after");
							domConstruct.place(endNode, brNode, "after");
							domConstruct.destroy(rs);
							newrange = rangeapi.create(this.editor.window);
							newrange.setStart(endNode, 0);
							selection.removeAllRanges();
							selection.addRange(newrange);
							return false;
						}
						return true; // let browser handle
					}
				}else{
					selection = rangeapi.getSelection(this.editor.window);
					if(selection.rangeCount){
						range = selection.getRangeAt(0);
						if(range && range.startContainer){
							if(!range.collapsed){
								range.deleteContents();
								selection = rangeapi.getSelection(this.editor.window);
								range = selection.getRangeAt(0);
							}
							rs = range.startContainer;
							if(rs && rs.nodeType == 3){
								// Text node, we have to split it.
								var endEmpty = false;

								var offset = range.startOffset;
								if(rs.length < offset){
									//We are not splitting the right node, try to locate the correct one
									ret = this._adjustNodeAndOffset(rs, offset);
									rs = ret.node;
									offset = ret.offset;
								}
								txt = rs.nodeValue;

								startNode = doc.createTextNode(txt.substring(0, offset));
								endNode = doc.createTextNode(txt.substring(offset));
								brNode = doc.createElement("br");

								if(!endNode.length){
									endNode = doc.createTextNode('\xA0');
									endEmpty = true;
								}

								if(startNode.length){
									domConstruct.place(startNode, rs, "after");
								}else{
									startNode = rs;
								}
								domConstruct.place(brNode, startNode, "after");
								domConstruct.place(endNode, brNode, "after");
								domConstruct.destroy(rs);
								newrange = rangeapi.create(this.editor.window);
								newrange.setStart(endNode, 0);
								newrange.setEnd(endNode, endNode.length);
								selection.removeAllRanges();
								selection.addRange(newrange);
								if(endEmpty && !has("webkit")){
									this.editor.selection.remove();
								}else{
									this.editor.selection.collapse(true);
								}
							}else{
								var targetNode;
								if(range.startOffset >= 0){
									targetNode = rs.childNodes[range.startOffset];
								}
								var brNode = doc.createElement("br");
								var endNode = doc.createTextNode('\xA0');
								if(!targetNode){
									rs.appendChild(brNode);
									rs.appendChild(endNode);
								}else{
									domConstruct.place(brNode, targetNode, "before");
									domConstruct.place(endNode, brNode, "after");
								}
								newrange = rangeapi.create(this.editor.window);
								newrange.setStart(endNode, 0);
								newrange.setEnd(endNode, endNode.length);
								selection.removeAllRanges();
								selection.addRange(newrange);
								this.editor.selection.collapse(true);
							}
						}
					}else{
						// don't change this: do not call this.execCommand, as that may have other logic in subclass
						RichText.prototype.execCommand.call(this.editor, 'inserthtml', '<br>');
					}
				}
				return false;
			}
			var _letBrowserHandle = true;

			// first remove selection
			selection = rangeapi.getSelection(this.editor.window);
			range = selection.getRangeAt(0);
			if(!range.collapsed){
				range.deleteContents();
				selection = rangeapi.getSelection(this.editor.window);
				range = selection.getRangeAt(0);
			}

			var block = rangeapi.getBlockAncestor(range.endContainer, null, this.editor.editNode);
			var blockNode = block.blockNode;

			// if this is under a LI or the parent of the blockNode is LI, just let browser to handle it
			if((this._checkListLater = (blockNode && (blockNode.nodeName == 'LI' || blockNode.parentNode.nodeName == 'LI')))){
				if(has("mozilla")){
					// press enter in middle of P may leave a trailing <br/>, let's remove it later
					this._pressedEnterInBlock = blockNode;
				}
				// if this li only contains spaces, set the content to empty so the browser will outdent this item
				if(/^(\s|&nbsp;|&#160;|\xA0|<span\b[^>]*\bclass=['"]Apple-style-span['"][^>]*>(\s|&nbsp;|&#160;|\xA0)<\/span>)?(<br>)?$/.test(blockNode.innerHTML)){
					// empty LI node
					blockNode.innerHTML = '';
					if(has("webkit")){ // WebKit tosses the range when innerHTML is reset
						newrange = rangeapi.create(this.editor.window);
						newrange.setStart(blockNode, 0);
						selection.removeAllRanges();
						selection.addRange(newrange);
					}
					this._checkListLater = false; // nothing to check since the browser handles outdent
				}
				return true;
			}

			// text node directly under body, let's wrap them in a node
			if(!block.blockNode || block.blockNode === this.editor.editNode){
				try{
					RichText.prototype.execCommand.call(this.editor, 'formatblock', this.blockNodeForEnter);
				}catch(e2){ /*squelch FF3 exception bug when editor content is a single BR*/
				}
				// get the newly created block node
				// FIXME
				block = {blockNode: this.editor.selection.getAncestorElement(this.blockNodeForEnter),
					blockContainer: this.editor.editNode};
				if(block.blockNode){
					if(block.blockNode != this.editor.editNode &&
						(!(block.blockNode.textContent || block.blockNode.innerHTML).replace(/^\s+|\s+$/g, "").length)){
						this.removeTrailingBr(block.blockNode);
						return false;
					}
				}else{    // we shouldn't be here if formatblock worked
					block.blockNode = this.editor.editNode;
				}
				selection = rangeapi.getSelection(this.editor.window);
				range = selection.getRangeAt(0);
			}

			var newblock = doc.createElement(this.blockNodeForEnter);
			newblock.innerHTML = this.bogusHtmlContent;
			this.removeTrailingBr(block.blockNode);
			var endOffset = range.endOffset;
			var node = range.endContainer;
			if(node.length < endOffset){
				//We are not checking the right node, try to locate the correct one
				var ret = this._adjustNodeAndOffset(node, endOffset);
				node = ret.node;
				endOffset = ret.offset;
			}
			if(rangeapi.atEndOfContainer(block.blockNode, node, endOffset)){
				if(block.blockNode === block.blockContainer){
					block.blockNode.appendChild(newblock);
				}else{
					domConstruct.place(newblock, block.blockNode, "after");
				}
				_letBrowserHandle = false;
				// lets move caret to the newly created block
				newrange = rangeapi.create(this.editor.window);
				newrange.setStart(newblock, 0);
				selection.removeAllRanges();
				selection.addRange(newrange);
				if(this.editor.height){
					winUtils.scrollIntoView(newblock);
				}
			}else if(rangeapi.atBeginningOfContainer(block.blockNode,
				range.startContainer, range.startOffset)){
				domConstruct.place(newblock, block.blockNode, block.blockNode === block.blockContainer ? "first" : "before");
				if(newblock.nextSibling && this.editor.height){
					// position input caret - mostly WebKit needs this
					newrange = rangeapi.create(this.editor.window);
					newrange.setStart(newblock.nextSibling, 0);
					selection.removeAllRanges();
					selection.addRange(newrange);
					// browser does not scroll the caret position into view, do it manually
					winUtils.scrollIntoView(newblock.nextSibling);
				}
				_letBrowserHandle = false;
			}else{ //press enter in the middle of P/DIV/Whatever/
				if(block.blockNode === block.blockContainer){
					block.blockNode.appendChild(newblock);
				}else{
					domConstruct.place(newblock, block.blockNode, "after");
				}
				_letBrowserHandle = false;

				// Clone any block level styles.
				if(block.blockNode.style){
					if(newblock.style){
						if(block.blockNode.style.cssText){
							newblock.style.cssText = block.blockNode.style.cssText;
						}
					}
				}

				// Okay, we probably have to split.
				rs = range.startContainer;
				var firstNodeMoved;
				if(rs && rs.nodeType == 3){
					// Text node, we have to split it.
					var nodeToMove, tNode;
					endOffset = range.endOffset;
					if(rs.length < endOffset){
						//We are not splitting the right node, try to locate the correct one
						ret = this._adjustNodeAndOffset(rs, endOffset);
						rs = ret.node;
						endOffset = ret.offset;
					}

					txt = rs.nodeValue;
					startNode = doc.createTextNode(txt.substring(0, endOffset));
					endNode = doc.createTextNode(txt.substring(endOffset, txt.length));

					// Place the split, then remove original nodes.
					domConstruct.place(startNode, rs, "before");
					domConstruct.place(endNode, rs, "after");
					domConstruct.destroy(rs);

					// Okay, we split the text.  Now we need to see if we're
					// parented to the block element we're splitting and if
					// not, we have to split all the way up.  Ugh.
					var parentC = startNode.parentNode;
					while(parentC !== block.blockNode){
						var tg = parentC.tagName;
						var newTg = doc.createElement(tg);
						// Clone over any 'style' data.
						if(parentC.style){
							if(newTg.style){
								if(parentC.style.cssText){
									newTg.style.cssText = parentC.style.cssText;
								}
							}
						}
						// If font also need to clone over any font data.
						if(parentC.tagName === "FONT"){
							if(parentC.color){
								newTg.color = parentC.color;
							}
							if(parentC.face){
								newTg.face = parentC.face;
							}
							if(parentC.size){  // this check was necessary on IE
								newTg.size = parentC.size;
							}
						}

						nodeToMove = endNode;
						while(nodeToMove){
							tNode = nodeToMove.nextSibling;
							newTg.appendChild(nodeToMove);
							nodeToMove = tNode;
						}
						domConstruct.place(newTg, parentC, "after");
						startNode = parentC;
						endNode = newTg;
						parentC = parentC.parentNode;
					}

					// Lastly, move the split out tags to the new block.
					// as they should now be split properly.
					nodeToMove = endNode;
					if(nodeToMove.nodeType == 1 || (nodeToMove.nodeType == 3 && nodeToMove.nodeValue)){
						// Non-blank text and non-text nodes need to clear out that blank space
						// before moving the contents.
						newblock.innerHTML = "";
					}
					firstNodeMoved = nodeToMove;
					while(nodeToMove){
						tNode = nodeToMove.nextSibling;
						newblock.appendChild(nodeToMove);
						nodeToMove = tNode;
					}
				}

				//lets move caret to the newly created block
				newrange = rangeapi.create(this.editor.window);
				var nodeForCursor;
				var innerMostFirstNodeMoved = firstNodeMoved;
				if(this.blockNodeForEnter !== 'BR'){
					while(innerMostFirstNodeMoved){
						nodeForCursor = innerMostFirstNodeMoved;
						tNode = innerMostFirstNodeMoved.firstChild;
						innerMostFirstNodeMoved = tNode;
					}
					if(nodeForCursor && nodeForCursor.parentNode){
						newblock = nodeForCursor.parentNode;
						newrange.setStart(newblock, 0);
						selection.removeAllRanges();
						selection.addRange(newrange);
						if(this.editor.height){
							winUtils.scrollIntoView(newblock);
						}
						if(has("mozilla")){
							// press enter in middle of P may leave a trailing <br/>, let's remove it later
							this._pressedEnterInBlock = block.blockNode;
						}
					}else{
						_letBrowserHandle = true;
					}
				}else{
					newrange.setStart(newblock, 0);
					selection.removeAllRanges();
					selection.addRange(newrange);
					if(this.editor.height){
						winUtils.scrollIntoView(newblock);
					}
					if(has("mozilla")){
						// press enter in middle of P may leave a trailing <br/>, let's remove it later
						this._pressedEnterInBlock = block.blockNode;
					}
				}
			}
			return _letBrowserHandle;
		},

		_adjustNodeAndOffset: function(/*DomNode*/node, /*Int*/offset){
			// summary:
			//		In the case there are multiple text nodes in a row the offset may not be within the node.  If the offset is larger than the node length, it will attempt to find
			//		the next text sibling until it locates the text node in which the offset refers to
			// node:
			//		The node to check.
			// offset:
			//		The position to find within the text node
			// tags:
			//		private.
			while(node.length < offset && node.nextSibling && node.nextSibling.nodeType == 3){
				//Adjust the offset and node in the case of multiple text nodes in a row
				offset = offset - node.length;
				node = node.nextSibling;
			}
			return {"node": node, "offset": offset};
		},

		removeTrailingBr: function(container){
			// summary:
			//		If last child of container is a `<br>`, then remove it.
			// tags:
			//		private
			var para = /P|DIV|LI/i.test(container.tagName) ?
				container : this.editor.selection.getParentOfType(container, ['P', 'DIV', 'LI']);

			if(!para){
				return;
			}
			if(para.lastChild){
				if((para.childNodes.length > 1 && para.lastChild.nodeType == 3 && /^[\s\xAD]*$/.test(para.lastChild.nodeValue)) ||
					para.lastChild.tagName == 'BR'){

					domConstruct.destroy(para.lastChild);
				}
			}
			if(!para.childNodes.length){
				para.innerHTML = this.bogusHtmlContent;
			}
		}
	});

});

},
'dijit/form/TimeTextBox':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/keys", // keys.DOWN_ARROW keys.ENTER keys.ESCAPE keys.TAB keys.UP_ARROW
	"dojo/_base/lang", // lang.hitch
	"../_TimePicker",
	"./_DateTimeTextBox"
], function(declare, keys, lang, _TimePicker, _DateTimeTextBox){

	// module:
	//		dijit/form/TimeTextBox


	/*=====
	var __Constraints = declare([_DateTimeTextBox.__Constraints, _TimePicker.__Constraints], {
	});
	=====*/

	return declare("dijit.form.TimeTextBox", _DateTimeTextBox, {
		// summary:
		//		A validating, serializable, range-bound time text box with a drop down time picker

		baseClass: "dijitTextBox dijitComboBox dijitTimeTextBox",
		popupClass: _TimePicker,
		_selector: "time",

/*=====
		// constraints: __Constraints
		constraints:{},
=====*/

		// value: Date
		//		The value of this widget as a JavaScript Date object.  Note that the date portion implies time zone and daylight savings rules.
		//
		//		Example:
		// |	new dijit/form/TimeTextBox({value: stamp.fromISOString("T12:59:59", new Date())})
		//
		//		When passed to the parser in markup, must be specified according to locale-independent
		//		`stamp.fromISOString` format.
		//
		//		Example:
		// |	<input data-dojo-type='dijit/form/TimeTextBox' value='T12:34:00'>
		value: new Date(""),		// value.toString()="NaN"
		//FIXME: in markup, you have no control over daylight savings

		// Add scrollbars if necessary so that dropdown doesn't cover the <input>
		maxHeight: -1,

		_onKey: function(evt){
			if(this.disabled || this.readOnly){ return; }
			this.inherited(arguments);

			// If the user has backspaced or typed some numbers, then filter the result list
			// by what they typed.  Maybe there's a better way to detect this, like _handleOnChange()?
			switch(evt.keyCode){
				case keys.ENTER:
				case keys.TAB:
				case keys.ESCAPE:
				case keys.DOWN_ARROW:
				case keys.UP_ARROW:
					// these keys have special meaning
					break;
				default:
					// defer() because the keystroke hasn't yet appeared in the <input>,
					// so the get('displayedValue') call below won't give the result we want.
					this.defer(function(){
						// set this.filterString to the filter to apply to the drop down list;
						// it will be used in openDropDown()
						var val = this.get('displayedValue');
						this.filterString = (val && !this.parse(val, this.constraints)) ? val.toLowerCase() : "";

						// close the drop down and reopen it, in order to filter the items shown in the list
						// and also since the drop down may need to be repositioned if the number of list items has changed
						// and it's being displayed above the <input>
						if(this._opened){
							this.closeDropDown();
						}
						this.openDropDown();
					});
			}
		}
	});
});

},
'dojo/window':function(){
define(["./_base/lang", "./sniff", "./_base/window", "./dom", "./dom-geometry", "./dom-style", "./dom-construct"],
	function(lang, has, baseWindow, dom, geom, style, domConstruct){

	// feature detection
	/* not needed but included here for future reference
	has.add("rtl-innerVerticalScrollBar-on-left", function(win, doc){
		var	body = baseWindow.body(doc),
			scrollable = domConstruct.create('div', {
				style: {overflow:'scroll', overflowX:'hidden', direction:'rtl', visibility:'hidden', position:'absolute', left:'0', width:'64px', height:'64px'}
			}, body, "last"),
			center = domConstruct.create('center', {
				style: {overflow:'hidden', direction:'ltr'}
			}, scrollable, "last"),
			inner = domConstruct.create('div', {
				style: {overflow:'visible', display:'inline' }
			}, center, "last");
		inner.innerHTML="&nbsp;";
		var midPoint = Math.max(inner.offsetLeft, geom.position(inner).x);
		var ret = midPoint >= 32;
		center.removeChild(inner);
		scrollable.removeChild(center);
		body.removeChild(scrollable);
		return ret;
	});
	*/
	has.add("rtl-adjust-position-for-verticalScrollBar", function(win, doc){
		var	body = baseWindow.body(doc),
			scrollable = domConstruct.create('div', {
				style: {overflow:'scroll', overflowX:'visible', direction:'rtl', visibility:'hidden', position:'absolute', left:'0', top:'0', width:'64px', height:'64px'}
			}, body, "last"),
			div = domConstruct.create('div', {
				style: {overflow:'hidden', direction:'ltr'}
			}, scrollable, "last"),
			ret = geom.position(div).x != 0;
		scrollable.removeChild(div);
		body.removeChild(scrollable);
		return ret;
	});

	has.add("position-fixed-support", function(win, doc){
		// IE6, IE7+quirks, and some older mobile browsers don't support position:fixed
		var	body = baseWindow.body(doc),
			outer = domConstruct.create('span', {
				style: {visibility:'hidden', position:'fixed', left:'1px', top:'1px'}
			}, body, "last"),
			inner = domConstruct.create('span', {
				style: {position:'fixed', left:'0', top:'0'}
			}, outer, "last"),
			ret = geom.position(inner).x != geom.position(outer).x;
		outer.removeChild(inner);
		body.removeChild(outer);
		return ret;
	});

	// module:
	//		dojo/window

	var window = {
		// summary:
		//		TODOC

		getBox: function(/*Document?*/ doc){
			// summary:
			//		Returns the dimensions and scroll position of the viewable area of a browser window

			doc = doc || baseWindow.doc;

			var
				scrollRoot = (doc.compatMode == 'BackCompat') ? baseWindow.body(doc) : doc.documentElement,
				// get scroll position
				scroll = geom.docScroll(doc), // scrollRoot.scrollTop/Left should work
				w, h;

			if(has("touch")){ // if(scrollbars not supported)
				var uiWindow = window.get(doc);   // use UI window, not dojo.global window
				// on mobile, scrollRoot.clientHeight <= uiWindow.innerHeight <= scrollRoot.offsetHeight, return uiWindow.innerHeight
				w = uiWindow.innerWidth || scrollRoot.clientWidth; // || scrollRoot.clientXXX probably never evaluated
				h = uiWindow.innerHeight || scrollRoot.clientHeight;
			}else{
				// on desktops, scrollRoot.clientHeight <= scrollRoot.offsetHeight <= uiWindow.innerHeight, return scrollRoot.clientHeight
				// uiWindow.innerWidth/Height includes the scrollbar and cannot be used
				w = scrollRoot.clientWidth;
				h = scrollRoot.clientHeight;
			}
			return {
				l: scroll.x,
				t: scroll.y,
				w: w,
				h: h
			};
		},

		get: function(/*Document*/ doc){
			// summary:
			//		Get window object associated with document doc.
			// doc:
			//		The document to get the associated window for.

			// In some IE versions (at least 6.0), document.parentWindow does not return a
			// reference to the real window object (maybe a copy), so we must fix it as well
			// We use IE specific execScript to attach the real window reference to
			// document._parentWindow for later use
			if(has("ie") && window !== document.parentWindow){
				/*
				In IE 6, only the variable "window" can be used to connect events (others
				may be only copies).
				*/
				doc.parentWindow.execScript("document._parentWindow = window;", "Javascript");
				//to prevent memory leak, unset it after use
				//another possibility is to add an onUnload handler which seems overkill to me (liucougar)
				var win = doc._parentWindow;
				doc._parentWindow = null;
				return win;	//	Window
			}

			return doc.parentWindow || doc.defaultView;	//	Window
		},

		scrollIntoView: function(/*DomNode*/ node, /*Object?*/ pos){
			// summary:
			//		Scroll the passed node into view using minimal movement, if it is not already.

			// Don't rely on node.scrollIntoView working just because the function is there since
			// it forces the node to the page's bottom or top (and left or right in IE) without consideration for the minimal movement.
			// WebKit's node.scrollIntoViewIfNeeded doesn't work either for inner scrollbars in right-to-left mode
			// and when there's a fixed position scrollable element

			try{ // catch unexpected/unrecreatable errors (#7808) since we can recover using a semi-acceptable native method
				node = dom.byId(node);
				var	doc = node.ownerDocument || baseWindow.doc,	// TODO: why baseWindow.doc?  Isn't node.ownerDocument always defined?
					body = baseWindow.body(doc),
					html = doc.documentElement || body.parentNode,
					isIE = has("ie"),
					isWK = has("webkit");
				// if an untested browser, then use the native method
				if(node == body || node == html){ return; }
				if(!(has("mozilla") || isIE || isWK || has("opera")) && ("scrollIntoView" in node)){
					node.scrollIntoView(false); // short-circuit to native if possible
					return;
				}
				var	backCompat = doc.compatMode == 'BackCompat',
					rootWidth = Math.min(body.clientWidth || html.clientWidth, html.clientWidth || body.clientWidth),
					rootHeight = Math.min(body.clientHeight || html.clientHeight, html.clientHeight || body.clientHeight),
					scrollRoot = (isWK || backCompat) ? body : html,
					nodePos = pos || geom.position(node),
					el = node.parentNode,
					isFixed = function(el){
						return (isIE <= 6 || (isIE == 7 && backCompat))
							? false
							: (has("position-fixed-support") && (style.get(el, 'position').toLowerCase() == "fixed"));
					};
				if(isFixed(node)){ return; } // nothing to do
				while(el){
					if(el == body){ el = scrollRoot; }
					var	elPos = geom.position(el),
						fixedPos = isFixed(el),
						rtl = style.getComputedStyle(el).direction.toLowerCase() == "rtl";

					if(el == scrollRoot){
						elPos.w = rootWidth; elPos.h = rootHeight;
						if(scrollRoot == html && isIE && rtl){ elPos.x += scrollRoot.offsetWidth-elPos.w; } // IE workaround where scrollbar causes negative x
						if(elPos.x < 0 || !isIE || isIE >= 9){ elPos.x = 0; } // older IE can have values > 0
						if(elPos.y < 0 || !isIE || isIE >= 9){ elPos.y = 0; }
					}else{
						var pb = geom.getPadBorderExtents(el);
						elPos.w -= pb.w; elPos.h -= pb.h; elPos.x += pb.l; elPos.y += pb.t;
						var clientSize = el.clientWidth,
							scrollBarSize = elPos.w - clientSize;
						if(clientSize > 0 && scrollBarSize > 0){
							if(rtl && has("rtl-adjust-position-for-verticalScrollBar")){
								elPos.x += scrollBarSize;
							}
							elPos.w = clientSize;
						}
						clientSize = el.clientHeight;
						scrollBarSize = elPos.h - clientSize;
						if(clientSize > 0 && scrollBarSize > 0){
							elPos.h = clientSize;
						}
					}
					if(fixedPos){ // bounded by viewport, not parents
						if(elPos.y < 0){
							elPos.h += elPos.y; elPos.y = 0;
						}
						if(elPos.x < 0){
							elPos.w += elPos.x; elPos.x = 0;
						}
						if(elPos.y + elPos.h > rootHeight){
							elPos.h = rootHeight - elPos.y;
						}
						if(elPos.x + elPos.w > rootWidth){
							elPos.w = rootWidth - elPos.x;
						}
					}
					// calculate overflow in all 4 directions
					var	l = nodePos.x - elPos.x, // beyond left: < 0
//						t = nodePos.y - Math.max(elPos.y, 0), // beyond top: < 0
						t = nodePos.y - elPos.y, // beyond top: < 0
						r = l + nodePos.w - elPos.w, // beyond right: > 0
						bot = t + nodePos.h - elPos.h; // beyond bottom: > 0
					var s, old;
					if(r * l > 0 && (!!el.scrollLeft || el == scrollRoot || el.scrollWidth > el.offsetHeight)){
						s = Math[l < 0? "max" : "min"](l, r);
						if(rtl && ((isIE == 8 && !backCompat) || isIE >= 9)){ s = -s; }
						old = el.scrollLeft;
						el.scrollLeft += s;
						s = el.scrollLeft - old;
						nodePos.x -= s;
					}
					if(bot * t > 0 && (!!el.scrollTop || el == scrollRoot || el.scrollHeight > el.offsetHeight)){
						s = Math.ceil(Math[t < 0? "max" : "min"](t, bot));
						old = el.scrollTop;
						el.scrollTop += s;
						s = el.scrollTop - old;
						nodePos.y -= s;
					}
					el = (el != scrollRoot) && !fixedPos && el.parentNode;
				}
			}catch(error){
				console.error('scrollIntoView: ' + error);
				node.scrollIntoView(false);
			}
		}
	};

	 1  && lang.setObject("dojo.window", window);

	return window;
});

},
'dojo/colors':function(){
define(["./_base/kernel", "./_base/lang", "./_base/Color", "./_base/array"], function(dojo, lang, Color, ArrayUtil){
	// module:
	//		dojo/colors

	/*=====
	return {
		// summary:
		//		Color utilities, extending Base dojo.Color
	};
	=====*/

	var ColorExt = {};
	lang.setObject("dojo.colors", ColorExt);

//TODO: this module appears to break naming conventions

	// this is a standard conversion prescribed by the CSS3 Color Module
	var hue2rgb = function(m1, m2, h){
		if(h < 0){ ++h; }
		if(h > 1){ --h; }
		var h6 = 6 * h;
		if(h6 < 1){ return m1 + (m2 - m1) * h6; }
		if(2 * h < 1){ return m2; }
		if(3 * h < 2){ return m1 + (m2 - m1) * (2 / 3 - h) * 6; }
		return m1;
	};
	// Override base Color.fromRgb with the impl in this module
	dojo.colorFromRgb = Color.fromRgb = function(/*String*/ color, /*dojo/_base/Color?*/ obj){
		// summary:
		//		get rgb(a) array from css-style color declarations
		// description:
		//		this function can handle all 4 CSS3 Color Module formats: rgb,
		//		rgba, hsl, hsla, including rgb(a) with percentage values.
		var m = color.toLowerCase().match(/^(rgba?|hsla?)\(([\s\.\-,%0-9]+)\)/);
		if(m){
			var c = m[2].split(/\s*,\s*/), l = c.length, t = m[1], a;
			if((t == "rgb" && l == 3) || (t == "rgba" && l == 4)){
				var r = c[0];
				if(r.charAt(r.length - 1) == "%"){
					// 3 rgb percentage values
					a = ArrayUtil.map(c, function(x){
						return parseFloat(x) * 2.56;
					});
					if(l == 4){ a[3] = c[3]; }
					return Color.fromArray(a, obj); // dojo/_base/Color
				}
				return Color.fromArray(c, obj); // dojo/_base/Color
			}
			if((t == "hsl" && l == 3) || (t == "hsla" && l == 4)){
				// normalize hsl values
				var H = ((parseFloat(c[0]) % 360) + 360) % 360 / 360,
					S = parseFloat(c[1]) / 100,
					L = parseFloat(c[2]) / 100,
					// calculate rgb according to the algorithm
					// recommended by the CSS3 Color Module
					m2 = L <= 0.5 ? L * (S + 1) : L + S - L * S,
					m1 = 2 * L - m2;
				a = [
					hue2rgb(m1, m2, H + 1 / 3) * 256,
					hue2rgb(m1, m2, H) * 256,
					hue2rgb(m1, m2, H - 1 / 3) * 256,
					1
				];
				if(l == 4){ a[3] = c[3]; }
				return Color.fromArray(a, obj); // dojo/_base/Color
			}
		}
		return null;	// dojo/_base/Color
	};

	var confine = function(c, low, high){
		// summary:
		//		sanitize a color component by making sure it is a number,
		//		and clamping it to valid values
		c = Number(c);
		return isNaN(c) ? high : c < low ? low : c > high ? high : c;	// Number
	};

	Color.prototype.sanitize = function(){
		// summary:
		//		makes sure that the object has correct attributes
		var t = this;
		t.r = Math.round(confine(t.r, 0, 255));
		t.g = Math.round(confine(t.g, 0, 255));
		t.b = Math.round(confine(t.b, 0, 255));
		t.a = confine(t.a, 0, 1);
		return this;	// dojo/_base/Color
	};

	ColorExt.makeGrey = Color.makeGrey = function(/*Number*/ g, /*Number?*/ a){
		// summary:
		//		creates a greyscale color with an optional alpha
		return Color.fromArray([g, g, g, a]);	// dojo/_base/Color
	};

	// mixin all CSS3 named colors not already in _base, along with SVG 1.0 variant spellings
	lang.mixin(Color.named, {
		"aliceblue":	[240,248,255],
		"antiquewhite": [250,235,215],
		"aquamarine":	[127,255,212],
		"azure":	[240,255,255],
		"beige":	[245,245,220],
		"bisque":	[255,228,196],
		"blanchedalmond":	[255,235,205],
		"blueviolet":	[138,43,226],
		"brown":	[165,42,42],
		"burlywood":	[222,184,135],
		"cadetblue":	[95,158,160],
		"chartreuse":	[127,255,0],
		"chocolate":	[210,105,30],
		"coral":	[255,127,80],
		"cornflowerblue":	[100,149,237],
		"cornsilk": [255,248,220],
		"crimson":	[220,20,60],
		"cyan": [0,255,255],
		"darkblue": [0,0,139],
		"darkcyan": [0,139,139],
		"darkgoldenrod":	[184,134,11],
		"darkgray": [169,169,169],
		"darkgreen":	[0,100,0],
		"darkgrey": [169,169,169],
		"darkkhaki":	[189,183,107],
		"darkmagenta":	[139,0,139],
		"darkolivegreen":	[85,107,47],
		"darkorange":	[255,140,0],
		"darkorchid":	[153,50,204],
		"darkred":	[139,0,0],
		"darksalmon":	[233,150,122],
		"darkseagreen": [143,188,143],
		"darkslateblue":	[72,61,139],
		"darkslategray":	[47,79,79],
		"darkslategrey":	[47,79,79],
		"darkturquoise":	[0,206,209],
		"darkviolet":	[148,0,211],
		"deeppink": [255,20,147],
		"deepskyblue":	[0,191,255],
		"dimgray":	[105,105,105],
		"dimgrey":	[105,105,105],
		"dodgerblue":	[30,144,255],
		"firebrick":	[178,34,34],
		"floralwhite":	[255,250,240],
		"forestgreen":	[34,139,34],
		"gainsboro":	[220,220,220],
		"ghostwhite":	[248,248,255],
		"gold": [255,215,0],
		"goldenrod":	[218,165,32],
		"greenyellow":	[173,255,47],
		"grey": [128,128,128],
		"honeydew": [240,255,240],
		"hotpink":	[255,105,180],
		"indianred":	[205,92,92],
		"indigo":	[75,0,130],
		"ivory":	[255,255,240],
		"khaki":	[240,230,140],
		"lavender": [230,230,250],
		"lavenderblush":	[255,240,245],
		"lawngreen":	[124,252,0],
		"lemonchiffon": [255,250,205],
		"lightblue":	[173,216,230],
		"lightcoral":	[240,128,128],
		"lightcyan":	[224,255,255],
		"lightgoldenrodyellow": [250,250,210],
		"lightgray":	[211,211,211],
		"lightgreen":	[144,238,144],
		"lightgrey":	[211,211,211],
		"lightpink":	[255,182,193],
		"lightsalmon":	[255,160,122],
		"lightseagreen":	[32,178,170],
		"lightskyblue": [135,206,250],
		"lightslategray":	[119,136,153],
		"lightslategrey":	[119,136,153],
		"lightsteelblue":	[176,196,222],
		"lightyellow":	[255,255,224],
		"limegreen":	[50,205,50],
		"linen":	[250,240,230],
		"magenta":	[255,0,255],
		"mediumaquamarine": [102,205,170],
		"mediumblue":	[0,0,205],
		"mediumorchid": [186,85,211],
		"mediumpurple": [147,112,219],
		"mediumseagreen":	[60,179,113],
		"mediumslateblue":	[123,104,238],
		"mediumspringgreen":	[0,250,154],
		"mediumturquoise":	[72,209,204],
		"mediumvioletred":	[199,21,133],
		"midnightblue": [25,25,112],
		"mintcream":	[245,255,250],
		"mistyrose":	[255,228,225],
		"moccasin": [255,228,181],
		"navajowhite":	[255,222,173],
		"oldlace":	[253,245,230],
		"olivedrab":	[107,142,35],
		"orange":	[255,165,0],
		"orangered":	[255,69,0],
		"orchid":	[218,112,214],
		"palegoldenrod":	[238,232,170],
		"palegreen":	[152,251,152],
		"paleturquoise":	[175,238,238],
		"palevioletred":	[219,112,147],
		"papayawhip":	[255,239,213],
		"peachpuff":	[255,218,185],
		"peru": [205,133,63],
		"pink": [255,192,203],
		"plum": [221,160,221],
		"powderblue":	[176,224,230],
		"rosybrown":	[188,143,143],
		"royalblue":	[65,105,225],
		"saddlebrown":	[139,69,19],
		"salmon":	[250,128,114],
		"sandybrown":	[244,164,96],
		"seagreen": [46,139,87],
		"seashell": [255,245,238],
		"sienna":	[160,82,45],
		"skyblue":	[135,206,235],
		"slateblue":	[106,90,205],
		"slategray":	[112,128,144],
		"slategrey":	[112,128,144],
		"snow": [255,250,250],
		"springgreen":	[0,255,127],
		"steelblue":	[70,130,180],
		"tan":	[210,180,140],
		"thistle":	[216,191,216],
		"tomato":	[255,99,71],
		"turquoise":	[64,224,208],
		"violet":	[238,130,238],
		"wheat":	[245,222,179],
		"whitesmoke":	[245,245,245],
		"yellowgreen":	[154,205,50]
	});

	return Color;	// TODO: return ColorExt, not Color
});

},
'dijit/_HasDropDown':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/_base/Deferred",
	"dojo/dom", // dom.isDescendant
	"dojo/dom-attr", // domAttr.set
	"dojo/dom-class", // domClass.add domClass.contains domClass.remove
	"dojo/dom-geometry", // domGeometry.marginBox domGeometry.position
	"dojo/dom-style", // domStyle.set
	"dojo/has", // has("touch")
	"dojo/keys", // keys.DOWN_ARROW keys.ENTER keys.ESCAPE
	"dojo/_base/lang", // lang.hitch lang.isFunction
	"dojo/on",
	"dojo/touch",
	"./registry", // registry.byNode()
	"./focus",
	"./popup",
	"./_FocusMixin"
], function(declare, Deferred, dom, domAttr, domClass, domGeometry, domStyle, has, keys, lang, on, touch,
			registry, focus, popup, _FocusMixin){


	// module:
	//		dijit/_HasDropDown

	return declare("dijit._HasDropDown", _FocusMixin, {
		// summary:
		//		Mixin for widgets that need drop down ability.

		// _buttonNode: [protected] DomNode
		//		The button/icon/node to click to display the drop down.
		//		Can be set via a data-dojo-attach-point assignment.
		//		If missing, then either focusNode or domNode (if focusNode is also missing) will be used.
		_buttonNode: null,

		// _arrowWrapperNode: [protected] DomNode
		//		Will set CSS class dijitUpArrow, dijitDownArrow, dijitRightArrow etc. on this node depending
		//		on where the drop down is set to be positioned.
		//		Can be set via a data-dojo-attach-point assignment.
		//		If missing, then _buttonNode will be used.
		_arrowWrapperNode: null,

		// _popupStateNode: [protected] DomNode
		//		The node to set the aria-expanded class on.
		//		Also sets popupActive class but that will be removed in 2.0.
		//		Can be set via a data-dojo-attach-point assignment.
		//		If missing, then focusNode or _buttonNode (if focusNode is missing) will be used.
		_popupStateNode: null,

		// _aroundNode: [protected] DomNode
		//		The node to display the popup around.
		//		Can be set via a data-dojo-attach-point assignment.
		//		If missing, then domNode will be used.
		_aroundNode: null,

		// dropDown: [protected] Widget
		//		The widget to display as a popup.  This widget *must* be
		//		defined before the startup function is called.
		dropDown: null,

		// autoWidth: [protected] Boolean
		//		Set to true to make the drop down at least as wide as this
		//		widget.  Set to false if the drop down should just be its
		//		default width.
		autoWidth: true,

		// forceWidth: [protected] Boolean
		//		Set to true to make the drop down exactly as wide as this
		//		widget.  Overrides autoWidth.
		forceWidth: false,

		// maxHeight: [protected] Integer
		//		The max height for our dropdown.
		//		Any dropdown taller than this will have scrollbars.
		//		Set to 0 for no max height, or -1 to limit height to available space in viewport
		maxHeight: -1,

		// dropDownPosition: [const] String[]
		//		This variable controls the position of the drop down.
		//		It's an array of strings with the following values:
		//
		//		- before: places drop down to the left of the target node/widget, or to the right in
		//		  the case of RTL scripts like Hebrew and Arabic
		//		- after: places drop down to the right of the target node/widget, or to the left in
		//		  the case of RTL scripts like Hebrew and Arabic
		//		- above: drop down goes above target node
		//		- below: drop down goes below target node
		//
		//		The list is positions is tried, in order, until a position is found where the drop down fits
		//		within the viewport.
		//
		dropDownPosition: ["below", "above"],

		// _stopClickEvents: Boolean
		//		When set to false, the click events will not be stopped, in
		//		case you want to use them in your subclass
		_stopClickEvents: true,

		_onDropDownMouseDown: function(/*Event*/ e){
			// summary:
			//		Callback when the user mousedown/touchstart on the arrow icon.
			if(this.disabled || this.readOnly){
				return;
			}

			// Prevent default to stop things like text selection, but don't stop propagation, so that:
			//		1. TimeTextBox etc. can focus the <input> on mousedown
			//		2. dropDownButtonActive class applied by _CssStateMixin (on button depress)
			//		3. user defined onMouseDown handler fires
			e.preventDefault();

			this._docHandler = this.own(on(this.ownerDocument, touch.release, lang.hitch(this, "_onDropDownMouseUp")))[0];

			this.toggleDropDown();
		},

		_onDropDownMouseUp: function(/*Event?*/ e){
			// summary:
			//		Callback on mouseup/touchend after mousedown/touchstart on the arrow icon.
			//		Note that this function is called regardless of what node the event occurred on (but only after
			//		a mousedown/touchstart on the arrow).
			//
			//		If the drop down is a simple menu and the cursor is over the menu, we execute it, otherwise, we focus our
			//		drop down widget.  If the event is missing, then we are not
			//		a mouseup event.
			//
			//		This is useful for the common mouse movement pattern
			//		with native browser `<select>` nodes:
			//
			//		1. mouse down on the select node (probably on the arrow)
			//		2. move mouse to a menu item while holding down the mouse button
			//		3. mouse up.  this selects the menu item as though the user had clicked it.
			if(e && this._docHandler){
				this._docHandler.remove();
				this._docHandler = null;
			}
			var dropDown = this.dropDown, overMenu = false;

			if(e && this._opened){
				// This code deals with the corner-case when the drop down covers the original widget,
				// because it's so large.  In that case mouse-up shouldn't select a value from the menu.
				// Find out if our target is somewhere in our dropdown widget,
				// but not over our _buttonNode (the clickable node)
				var c = domGeometry.position(this._buttonNode, true);
				if(!(e.pageX >= c.x && e.pageX <= c.x + c.w) || !(e.pageY >= c.y && e.pageY <= c.y + c.h)){
					var t = e.target;
					while(t && !overMenu){
						if(domClass.contains(t, "dijitPopup")){
							overMenu = true;
						}else{
							t = t.parentNode;
						}
					}
					if(overMenu){
						t = e.target;
						if(dropDown.onItemClick){
							var menuItem;
							while(t && !(menuItem = registry.byNode(t))){
								t = t.parentNode;
							}
							if(menuItem && menuItem.onClick && menuItem.getParent){
								menuItem.getParent().onItemClick(menuItem, e);
							}
						}
						return;
					}
				}
			}
			if(this._opened){
				if(dropDown.focus && dropDown.autoFocus !== false){
					// Focus the dropdown widget - do it on a delay so that we
					// don't steal back focus from the dropdown.
					this._focusDropDownTimer = this.defer(function(){
						dropDown.focus();
						delete this._focusDropDownTimer;
					});
				}
			}else{
				// The drop down arrow icon probably can't receive focus, but widget itself should get focus.
				// defer() needed to make it work on IE (test DateTextBox)
				if(this.focus){
					this.defer("focus");
				}
			}
		},

		_onDropDownClick: function(/*Event*/ e){
			// The drop down was already opened on mousedown/keydown; just need to stop the event
			if(this._stopClickEvents){
				e.stopPropagation();
				e.preventDefault();
			}
		},

		buildRendering: function(){
			this.inherited(arguments);

			this._buttonNode = this._buttonNode || this.focusNode || this.domNode;
			this._popupStateNode = this._popupStateNode || this.focusNode || this._buttonNode;

			// Add a class to the "dijitDownArrowButton" type class to _buttonNode so theme can set direction of arrow
			// based on where drop down will normally appear
			var defaultPos = {
				"after": this.isLeftToRight() ? "Right" : "Left",
				"before": this.isLeftToRight() ? "Left" : "Right",
				"above": "Up",
				"below": "Down",
				"left": "Left",
				"right": "Right"
			}[this.dropDownPosition[0]] || this.dropDownPosition[0] || "Down";
			domClass.add(this._arrowWrapperNode || this._buttonNode, "dijit" + defaultPos + "ArrowButton");
		},

		postCreate: function(){
			// summary:
			//		set up nodes and connect our mouse and keyboard events

			this.inherited(arguments);

			var keyboardEventNode = this.focusNode || this.domNode;
			this.own(
				on(this._buttonNode, touch.press, lang.hitch(this, "_onDropDownMouseDown")),
				on(this._buttonNode, "click", lang.hitch(this, "_onDropDownClick")),
				on(keyboardEventNode, "keydown", lang.hitch(this, "_onKey")),
				on(keyboardEventNode, "keyup", lang.hitch(this, "_onKeyUp"))
			);
		},

		destroy: function(){
			if(this.dropDown){
				// Destroy the drop down, unless it's already been destroyed.  This can happen because
				// the drop down is a direct child of <body> even though it's logically my child.
				if(!this.dropDown._destroyed){
					this.dropDown.destroyRecursive();
				}
				delete this.dropDown;
			}
			this.inherited(arguments);
		},

		_onKey: function(/*Event*/ e){
			// summary:
			//		Callback when the user presses a key while focused on the button node

			if(this.disabled || this.readOnly){
				return;
			}
			var d = this.dropDown, target = e.target;
			if(d && this._opened && d.handleKey){
				if(d.handleKey(e) === false){
					/* false return code means that the drop down handled the key */
					e.stopPropagation();
					e.preventDefault();
					return;
				}
			}
			if(d && this._opened && e.keyCode == keys.ESCAPE){
				this.closeDropDown();
				e.stopPropagation();
				e.preventDefault();
			}else if(!this._opened &&
				(e.keyCode == keys.DOWN_ARROW ||
					// ignore unmodified SPACE if _KeyNavMixin has active searching in progress
					( (e.keyCode == keys.ENTER || (e.keyCode == keys.SPACE && (!this._searchTimer || (e.ctrlKey || e.altKey || e.metaKey)))) &&
						//ignore enter and space if the event is for a text input
						((target.tagName || "").toLowerCase() !== 'input' ||
							(target.type && target.type.toLowerCase() !== 'text'))))){
				// Toggle the drop down, but wait until keyup so that the drop down doesn't
				// get a stray keyup event, or in the case of key-repeat (because user held
				// down key for too long), stray keydown events
				this._toggleOnKeyUp = true;
				e.stopPropagation();
				e.preventDefault();
			}
		},

		_onKeyUp: function(){
			if(this._toggleOnKeyUp){
				delete this._toggleOnKeyUp;
				this.toggleDropDown();
				var d = this.dropDown;	// drop down may not exist until toggleDropDown() call
				if(d && d.focus){
					this.defer(lang.hitch(d, "focus"), 1);
				}
			}
		},

		_onBlur: function(){
			// summary:
			//		Called magically when focus has shifted away from this widget and it's dropdown

			// Close dropdown but don't focus my <input>.  User may have focused somewhere else (ex: clicked another
			// input), and even if they just clicked a blank area of the screen, focusing my <input> will unwantedly
			// popup the keyboard on mobile.
			this.closeDropDown(false);

			this.inherited(arguments);
		},

		isLoaded: function(){
			// summary:
			//		Returns true if the dropdown exists and it's data is loaded.  This can
			//		be overridden in order to force a call to loadDropDown().
			// tags:
			//		protected

			return true;
		},

		loadDropDown: function(/*Function*/ loadCallback){
			// summary:
			//		Creates the drop down if it doesn't exist, loads the data
			//		if there's an href and it hasn't been loaded yet, and then calls
			//		the given callback.
			// tags:
			//		protected

			// TODO: for 2.0, change API to return a Deferred, instead of calling loadCallback?
			loadCallback();
		},

		loadAndOpenDropDown: function(){
			// summary:
			//		Creates the drop down if it doesn't exist, loads the data
			//		if there's an href and it hasn't been loaded yet, and
			//		then opens the drop down.  This is basically a callback when the
			//		user presses the down arrow button to open the drop down.
			// returns: Deferred
			//		Deferred for the drop down widget that
			//		fires when drop down is created and loaded
			// tags:
			//		protected
			var d = new Deferred(),
				afterLoad = lang.hitch(this, function(){
					this.openDropDown();
					d.resolve(this.dropDown);
				});
			if(!this.isLoaded()){
				this.loadDropDown(afterLoad);
			}else{
				afterLoad();
			}
			return d;
		},

		toggleDropDown: function(){
			// summary:
			//		Callback when the user presses the down arrow button or presses
			//		the down arrow key to open/close the drop down.
			//		Toggle the drop-down widget; if it is up, close it, if not, open it
			// tags:
			//		protected

			if(this.disabled || this.readOnly){
				return;
			}
			if(!this._opened){
				this.loadAndOpenDropDown();
			}else{
				this.closeDropDown(true);	// refocus button to avoid hiding node w/focus
			}
		},

		openDropDown: function(){
			// summary:
			//		Opens the dropdown for this widget.   To be called only when this.dropDown
			//		has been created and is ready to display (ie, it's data is loaded).
			// returns:
			//		return value of dijit/popup.open()
			// tags:
			//		protected

			var dropDown = this.dropDown,
				ddNode = dropDown.domNode,
				aroundNode = this._aroundNode || this.domNode,
				self = this;

			var retVal = popup.open({
				parent: this,
				popup: dropDown,
				around: aroundNode,
				orient: this.dropDownPosition,
				maxHeight: this.maxHeight,
				onExecute: function(){
					self.closeDropDown(true);
				},
				onCancel: function(){
					self.closeDropDown(true);
				},
				onClose: function(){
					domAttr.set(self._popupStateNode, "popupActive", false);
					domClass.remove(self._popupStateNode, "dijitHasDropDownOpen");
					self._set("_opened", false);	// use set() because _CssStateMixin is watching
				}
			});

			// Set width of drop down if necessary, so that dropdown width + width of scrollbar (from popup wrapper)
			// matches width of aroundNode
			if(this.forceWidth || (this.autoWidth && aroundNode.offsetWidth > dropDown._popupWrapper.offsetWidth)){
				var resizeArgs = {
					w: aroundNode.offsetWidth - (dropDown._popupWrapper.offsetWidth - dropDown.domNode.offsetWidth)
				};
				if(lang.isFunction(dropDown.resize)){
					dropDown.resize(resizeArgs);
				}else{
					domGeometry.setMarginBox(ddNode, resizeArgs);
				}
			}

			domAttr.set(this._popupStateNode, "popupActive", "true");
			domClass.add(this._popupStateNode, "dijitHasDropDownOpen");
			this._set("_opened", true);	// use set() because _CssStateMixin is watching

			this._popupStateNode.setAttribute("aria-expanded", "true");
			this._popupStateNode.setAttribute("aria-owns", dropDown.id);

			// Set aria-labelledby on dropdown if it's not already set to something more meaningful
			if(ddNode.getAttribute("role") !== "presentation" && !ddNode.getAttribute("aria-labelledby")){
				ddNode.setAttribute("aria-labelledby", this.id);
			}

			return retVal;
		},

		closeDropDown: function(/*Boolean*/ focus){
			// summary:
			//		Closes the drop down on this widget
			// focus:
			//		If true, refocuses the button widget
			// tags:
			//		protected

			if(this._focusDropDownTimer){
				this._focusDropDownTimer.remove();
				delete this._focusDropDownTimer;
			}

			if(this._opened){
				this._popupStateNode.setAttribute("aria-expanded", "false");
				if(focus){
					this.focus();
				}
				popup.close(this.dropDown);
				this._opened = false;
			}
		}

	});
});

},
'dijit/_editor/range':function(){
define([
	"dojo/_base/array", // array.every
	"dojo/_base/declare", // declare
	"dojo/_base/lang" // lang.isArray
], function(array, declare, lang){

	// module:
	//		dijit/_editor/range

	var rangeapi = {
		// summary:
		//		W3C range API

		getIndex: function(/*DomNode*/ node, /*DomNode*/ parent){
			var ret = [], retR = [];
			var onode = node;

			var pnode, n;
			while(node != parent){
				var i = 0;
				pnode = node.parentNode;
				while((n = pnode.childNodes[i++])){
					if(n === node){
						--i;
						break;
					}
				}
				//if(i>=pnode.childNodes.length){
				//console.debug("Error finding index of a node in dijit/range.getIndex()");
				//}
				ret.unshift(i);
				retR.unshift(i - pnode.childNodes.length);
				node = pnode;
			}

			//normalized() can not be called so often to prevent
			//invalidating selection/range, so we have to detect
			//here that any text nodes in a row
			if(ret.length > 0 && onode.nodeType == 3){
				n = onode.previousSibling;
				while(n && n.nodeType == 3){
					ret[ret.length - 1]--;
					n = n.previousSibling;
				}
				n = onode.nextSibling;
				while(n && n.nodeType == 3){
					retR[retR.length - 1]++;
					n = n.nextSibling;
				}
			}

			return {o: ret, r:retR};
		},

		getNode: function(/*Array*/ index, /*DomNode*/ parent){
			if(!lang.isArray(index) || index.length == 0){
				return parent;
			}
			var node = parent;
			//	if(!node)debugger
			array.every(index, function(i){
				if(i >= 0 && i < node.childNodes.length){
					node = node.childNodes[i];
				}else{
					node = null;
					//console.debug('Error: can not find node with index',index,'under parent node',parent );
					return false; //terminate array.every
				}
				return true; //carry on the every loop
			});

			return node;
		},

		getCommonAncestor: function(n1, n2, root){
			root = root || n1.ownerDocument.body;
			var getAncestors = function(n){
				var as = [];
				while(n){
					as.unshift(n);
					if(n !== root){
						n = n.parentNode;
					}else{
						break;
					}
				}
				return as;
			};
			var n1as = getAncestors(n1);
			var n2as = getAncestors(n2);

			var m = Math.min(n1as.length, n2as.length);
			var com = n1as[0]; //at least, one element should be in the array: the root (BODY by default)
			for(var i = 1; i < m; i++){
				if(n1as[i] === n2as[i]){
					com = n1as[i]
				}else{
					break;
				}
			}
			return com;
		},

		getAncestor: function(/*DomNode*/ node, /*RegEx?*/ regex, /*DomNode?*/ root){
			root = root || node.ownerDocument.body;
			while(node && node !== root){
				var name = node.nodeName.toUpperCase();
				if(regex.test(name)){
					return node;
				}

				node = node.parentNode;
			}
			return null;
		},

		BlockTagNames: /^(?:P|DIV|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|OL|UL|LI|DT|DE)$/,

		getBlockAncestor: function(/*DomNode*/ node, /*RegEx?*/ regex, /*DomNode?*/ root){
			root = root || node.ownerDocument.body;
			regex = regex || rangeapi.BlockTagNames;
			var block = null, blockContainer;
			while(node && node !== root){
				var name = node.nodeName.toUpperCase();
				if(!block && regex.test(name)){
					block = node;
				}
				if(!blockContainer && (/^(?:BODY|TD|TH|CAPTION)$/).test(name)){
					blockContainer = node;
				}

				node = node.parentNode;
			}
			return {blockNode:block, blockContainer:blockContainer || node.ownerDocument.body};
		},

		atBeginningOfContainer: function(/*DomNode*/ container, /*DomNode*/ node, /*Int*/ offset){
			var atBeginning = false;
			var offsetAtBeginning = (offset == 0);
			if(!offsetAtBeginning && node.nodeType == 3){ //if this is a text node, check whether the left part is all space
				if(/^[\s\xA0]+$/.test(node.nodeValue.substr(0, offset))){
					offsetAtBeginning = true;
				}
			}
			if(offsetAtBeginning){
				var cnode = node;
				atBeginning = true;
				while(cnode && cnode !== container){
					if(cnode.previousSibling){
						atBeginning = false;
						break;
					}
					cnode = cnode.parentNode;
				}
			}
			return atBeginning;
		},

		atEndOfContainer: function(/*DomNode*/ container, /*DomNode*/ node, /*Int*/ offset){
			var atEnd = false;
			var offsetAtEnd = (offset == (node.length || node.childNodes.length));
			if(!offsetAtEnd && node.nodeType == 3){ //if this is a text node, check whether the right part is all space
				if(/^[\s\xA0]+$/.test(node.nodeValue.substr(offset))){
					offsetAtEnd = true;
				}
			}
			if(offsetAtEnd){
				var cnode = node;
				atEnd = true;
				while(cnode && cnode !== container){
					if(cnode.nextSibling){
						atEnd = false;
						break;
					}
					cnode = cnode.parentNode;
				}
			}
			return atEnd;
		},

		adjacentNoneTextNode: function(startnode, next){
			var node = startnode;
			var len = (0 - startnode.length) || 0;
			var prop = next ? 'nextSibling' : 'previousSibling';
			while(node){
				if(node.nodeType != 3){
					break;
				}
				len += node.length;
				node = node[prop];
			}
			return [node,len];
		},

		create: function(/*Window?*/ win){	// TODO: for 2.0, replace optional window param w/mandatory window or document param
			win = win || window;
			if(win.getSelection){
				return win.document.createRange();
			}else{//IE
				return new W3CRange();
			}
		},

		getSelection: function(/*Window*/ window, /*Boolean?*/ ignoreUpdate){
			if(window.getSelection){
				return window.getSelection();
			}else{//IE
				var s = new ie.selection(window);
				if(!ignoreUpdate){
					s._getCurrentSelection();
				}
				return s;
			}
		}
	};

	// TODO: convert to has() test?   But remember IE9 issues with quirks vs. standards in main frame vs. iframe.
	if(!window.getSelection){
		var ie = rangeapi.ie = {
			cachedSelection: {},
			selection: function(window){
				this._ranges = [];
				this.addRange = function(r, /*boolean*/ internal){
					this._ranges.push(r);
					if(!internal){
						r._select();
					}
					this.rangeCount = this._ranges.length;
				};
				this.removeAllRanges = function(){
					//don't detach, the range may be used later
					//				for(var i=0;i<this._ranges.length;i++){
					//					this._ranges[i].detach();
					//				}
					this._ranges = [];
					this.rangeCount = 0;
				};
				var _initCurrentRange = function(){
					var r = window.document.selection.createRange();
					var type = window.document.selection.type.toUpperCase();
					if(type == "CONTROL"){
						//TODO: multiple range selection(?)
						return new W3CRange(ie.decomposeControlRange(r));
					}else{
						return new W3CRange(ie.decomposeTextRange(r));
					}
				};
				this.getRangeAt = function(i){
					return this._ranges[i];
				};
				this._getCurrentSelection = function(){
					this.removeAllRanges();
					var r = _initCurrentRange();
					if(r){
						this.addRange(r, true);
						this.isCollapsed = r.collapsed;
					}else{
						this.isCollapsed = true;
					}
				};
			},
			decomposeControlRange: function(range){
				var firstnode = range.item(0), lastnode = range.item(range.length - 1);
				var startContainer = firstnode.parentNode, endContainer = lastnode.parentNode;
				var startOffset = rangeapi.getIndex(firstnode, startContainer).o[0];
				var endOffset = rangeapi.getIndex(lastnode, endContainer).o[0] + 1;
				return [startContainer, startOffset,endContainer, endOffset];
			},
			getEndPoint: function(range, end){
				var atmrange = range.duplicate();
				atmrange.collapse(!end);
				var cmpstr = 'EndTo' + (end ? 'End' : 'Start');
				var parentNode = atmrange.parentElement();

				var startnode, startOffset, lastNode;
				if(parentNode.childNodes.length > 0){
					array.every(parentNode.childNodes, function(node, i){
						var calOffset;
						if(node.nodeType != 3){
							atmrange.moveToElementText(node);

							if(atmrange.compareEndPoints(cmpstr, range) > 0){
								//startnode = node.previousSibling;
								if(lastNode && lastNode.nodeType == 3){
									//where shall we put the start? in the text node or after?
									startnode = lastNode;
									calOffset = true;
								}else{
									startnode = parentNode;
									startOffset = i;
									return false;
								}
							}else{
								if(i == parentNode.childNodes.length - 1){
									startnode = parentNode;
									startOffset = parentNode.childNodes.length;
									return false;
								}
							}
						}else{
							if(i == parentNode.childNodes.length - 1){//at the end of this node
								startnode = node;
								calOffset = true;
							}
						}
						//			try{
						if(calOffset && startnode){
							var prevnode = rangeapi.adjacentNoneTextNode(startnode)[0];
							if(prevnode){
								startnode = prevnode.nextSibling;
							}else{
								startnode = parentNode.firstChild; //firstChild must be a text node
							}
							var prevnodeobj = rangeapi.adjacentNoneTextNode(startnode);
							prevnode = prevnodeobj[0];
							var lenoffset = prevnodeobj[1];
							if(prevnode){
								atmrange.moveToElementText(prevnode);
								atmrange.collapse(false);
							}else{
								atmrange.moveToElementText(parentNode);
							}
							atmrange.setEndPoint(cmpstr, range);
							startOffset = atmrange.text.length - lenoffset;

							return false;
						}
						//			}catch(e){ debugger }
						lastNode = node;
						return true;
					});
				}else{
					startnode = parentNode;
					startOffset = 0;
				}

				//if at the end of startnode and we are dealing with start container, then
				//move the startnode to nextSibling if it is a text node
				//TODO: do this for end container?
				if(!end && startnode.nodeType == 1 && startOffset == startnode.childNodes.length){
					var nextnode = startnode.nextSibling;
					if(nextnode && nextnode.nodeType == 3){
						startnode = nextnode;
						startOffset = 0;
					}
				}
				return [startnode, startOffset];
			},
			setEndPoint: function(range, container, offset){
				//text node
				var atmrange = range.duplicate(), node, len;
				if(container.nodeType != 3){ //normal node
					if(offset > 0){
						node = container.childNodes[offset - 1];
						if(node){
							if(node.nodeType == 3){
								container = node;
								offset = node.length;
								//pass through
							}else{
								if(node.nextSibling && node.nextSibling.nodeType == 3){
									container = node.nextSibling;
									offset = 0;
									//pass through
								}else{
									atmrange.moveToElementText(node.nextSibling ? node : container);
									var parent = node.parentNode;
									var tempNode = parent.insertBefore(node.ownerDocument.createTextNode(' '), node.nextSibling);
									atmrange.collapse(false);
									parent.removeChild(tempNode);
								}
							}
						}
					}else{
						atmrange.moveToElementText(container);
						atmrange.collapse(true);
					}
				}
				if(container.nodeType == 3){
					var prevnodeobj = rangeapi.adjacentNoneTextNode(container);
					var prevnode = prevnodeobj[0];
					len = prevnodeobj[1];
					if(prevnode){
						atmrange.moveToElementText(prevnode);
						atmrange.collapse(false);
						//if contentEditable is not inherit, the above collapse won't make the end point
						//in the correctly position: it always has a -1 offset, so compensate it
						if(prevnode.contentEditable != 'inherit'){
							len++;
						}
					}else{
						atmrange.moveToElementText(container.parentNode);
						atmrange.collapse(true);

						// Correct internal cursor position
						// http://bugs.dojotoolkit.org/ticket/15578
						atmrange.move('character', 1);
						atmrange.move('character', -1);
					}

					offset += len;
					if(offset > 0){
						if(atmrange.move('character', offset) != offset){
							console.error('Error when moving!');
						}
					}
				}

				return atmrange;
			},
			decomposeTextRange: function(range){
				var tmpary = ie.getEndPoint(range);
				var startContainer = tmpary[0], startOffset = tmpary[1];
				var endContainer = tmpary[0], endOffset = tmpary[1];

				if(range.htmlText.length){
					if(range.htmlText == range.text){ //in the same text node
						endOffset = startOffset + range.text.length;
					}else{
						tmpary = ie.getEndPoint(range, true);
						endContainer = tmpary[0],endOffset = tmpary[1];
						//					if(startContainer.tagName == "BODY"){
						//						startContainer = startContainer.firstChild;
						//					}
					}
				}
				return [startContainer, startOffset, endContainer, endOffset];
			},
			setRange: function(range, startContainer, startOffset, endContainer, endOffset, collapsed){
				var start = ie.setEndPoint(range, startContainer, startOffset);

				range.setEndPoint('StartToStart', start);
				if(!collapsed){
					var end = ie.setEndPoint(range, endContainer, endOffset);
				}
				range.setEndPoint('EndToEnd', end || start);

				return range;
			}
		};

		var W3CRange = rangeapi.W3CRange = declare(null, {
			constructor: function(){
				if(arguments.length>0){
					this.setStart(arguments[0][0],arguments[0][1]);
					this.setEnd(arguments[0][2],arguments[0][3]);
				}else{
					this.commonAncestorContainer = null;
					this.startContainer = null;
					this.startOffset = 0;
					this.endContainer = null;
					this.endOffset = 0;
					this.collapsed = true;
				}
			},
			_updateInternal: function(){
				if(this.startContainer !== this.endContainer){
					this.commonAncestorContainer = rangeapi.getCommonAncestor(this.startContainer, this.endContainer);
				}else{
					this.commonAncestorContainer = this.startContainer;
				}
				this.collapsed = (this.startContainer === this.endContainer) && (this.startOffset == this.endOffset);
			},
			setStart: function(node, offset){
				offset=parseInt(offset);
				if(this.startContainer === node && this.startOffset == offset){
					return;
				}
				delete this._cachedBookmark;

				this.startContainer = node;
				this.startOffset = offset;
				if(!this.endContainer){
					this.setEnd(node, offset);
				}else{
					this._updateInternal();
				}
			},
			setEnd: function(node, offset){
				offset=parseInt(offset);
				if(this.endContainer === node && this.endOffset == offset){
					return;
				}
				delete this._cachedBookmark;

				this.endContainer = node;
				this.endOffset = offset;
				if(!this.startContainer){
					this.setStart(node, offset);
				}else{
					this._updateInternal();
				}
			},
			setStartAfter: function(node, offset){
				this._setPoint('setStart', node, offset, 1);
			},
			setStartBefore: function(node, offset){
				this._setPoint('setStart', node, offset, 0);
			},
			setEndAfter: function(node, offset){
				this._setPoint('setEnd', node, offset, 1);
			},
			setEndBefore: function(node, offset){
				this._setPoint('setEnd', node, offset, 0);
			},
			_setPoint: function(what, node, offset, ext){
				var index = rangeapi.getIndex(node, node.parentNode).o;
				this[what](node.parentNode, index.pop()+ext);
			},
			_getIERange: function(){
				var r = (this._body || this.endContainer.ownerDocument.body).createTextRange();
				ie.setRange(r, this.startContainer, this.startOffset, this.endContainer, this.endOffset, this.collapsed);
				return r;
			},
			getBookmark: function(){
				this._getIERange();
				return this._cachedBookmark;
			},
			_select: function(){
				var r = this._getIERange();
				r.select();
			},
			deleteContents: function(){
				var s = this.startContainer, r = this._getIERange();
				if(s.nodeType === 3 && !this.startOffset){
					//if the range starts at the beginning of a
					//text node, move it to before the textnode
					//to make sure the range is still valid
					//after deleteContents() finishes
					this.setStartBefore(s);
				}
				r.pasteHTML('');
				this.endContainer = this.startContainer;
				this.endOffset = this.startOffset;
				this.collapsed = true;
			},
			cloneRange: function(){
				var r = new W3CRange([this.startContainer,this.startOffset,
					this.endContainer,this.endOffset]);
				r._body = this._body;
				return r;
			},
			detach: function(){
				this._body = null;
				this.commonAncestorContainer = null;
				this.startContainer = null;
				this.startOffset = 0;
				this.endContainer = null;
				this.endOffset = 0;
				this.collapsed = true;
			}
		});
	} //if(!window.getSelection)

	// remove for 2.0
	lang.setObject("dijit.range", rangeapi);

	return rangeapi;
});

},
'dijit/Tooltip':function(){
define([
	"dojo/_base/array", // array.forEach array.indexOf array.map
	"dojo/_base/declare", // declare
	"dojo/_base/fx", // fx.fadeIn fx.fadeOut
	"dojo/dom", // dom.byId
	"dojo/dom-class", // domClass.add
	"dojo/dom-geometry", // domGeometry.position
	"dojo/dom-style", // domStyle.set, domStyle.get
	"dojo/_base/lang", // lang.hitch lang.isArrayLike
	"dojo/mouse",
	"dojo/on",
	"dojo/sniff", // has("ie")
	"./_base/manager",	// manager.defaultDuration
	"./place",
	"./_Widget",
	"./_TemplatedMixin",
	"./BackgroundIframe",
	"dojo/text!./templates/Tooltip.html",
	"./main"		// sets dijit.showTooltip etc. for back-compat
], function(array, declare, fx, dom, domClass, domGeometry, domStyle, lang, mouse, on, has,
			manager, place, _Widget, _TemplatedMixin, BackgroundIframe, template, dijit){

	// module:
	//		dijit/Tooltip


	// TODO: Tooltip should really share more positioning code with TooltipDialog, like:
	//		- the orient() method
	//		- the connector positioning code in show()
	//		- the dijitTooltip[Dialog] class
	//
	// The problem is that Tooltip's implementation supplies it's own <iframe> and interacts directly
	// with dijit/place, rather than going through dijit/popup like TooltipDialog and other popups (ex: Menu).

	var MasterTooltip = declare("dijit._MasterTooltip", [_Widget, _TemplatedMixin], {
		// summary:
		//		Internal widget that holds the actual tooltip markup,
		//		which occurs once per page.
		//		Called by Tooltip widgets which are just containers to hold
		//		the markup
		// tags:
		//		protected

		// duration: Integer
		//		Milliseconds to fade in/fade out
		duration: manager.defaultDuration,

		templateString: template,

		postCreate: function(){
			this.ownerDocumentBody.appendChild(this.domNode);

			this.bgIframe = new BackgroundIframe(this.domNode);

			// Setup fade-in and fade-out functions.
			this.fadeIn = fx.fadeIn({ node: this.domNode, duration: this.duration, onEnd: lang.hitch(this, "_onShow") });
			this.fadeOut = fx.fadeOut({ node: this.domNode, duration: this.duration, onEnd: lang.hitch(this, "_onHide") });
		},

		show: function(innerHTML, aroundNode, position, rtl, textDir){
			// summary:
			//		Display tooltip w/specified contents to right of specified node
			//		(To left if there's no space on the right, or if rtl == true)
			// innerHTML: String
			//		Contents of the tooltip
			// aroundNode: DomNode|dijit/place.__Rectangle
			//		Specifies that tooltip should be next to this node / area
			// position: String[]?
			//		List of positions to try to position tooltip (ex: ["right", "above"])
			// rtl: Boolean?
			//		Corresponds to `WidgetBase.dir` attribute, where false means "ltr" and true
			//		means "rtl"; specifies GUI direction, not text direction.
			// textDir: String?
			//		Corresponds to `WidgetBase.textdir` attribute; specifies direction of text.


			if(this.aroundNode && this.aroundNode === aroundNode && this.containerNode.innerHTML == innerHTML){
				return;
			}

			if(this.fadeOut.status() == "playing"){
				// previous tooltip is being hidden; wait until the hide completes then show new one
				this._onDeck=arguments;
				return;
			}
			this.containerNode.innerHTML=innerHTML;

			if(textDir){
				this.set("textDir", textDir);
			}

			this.containerNode.align = rtl? "right" : "left"; //fix the text alignment

			var pos = place.around(this.domNode, aroundNode,
				position && position.length ? position : Tooltip.defaultPosition, !rtl, lang.hitch(this, "orient"));

			// Position the tooltip connector for middle alignment.
			// This could not have been done in orient() since the tooltip wasn't positioned at that time.
			var aroundNodeCoords = pos.aroundNodePos;
			if(pos.corner.charAt(0) == 'M' && pos.aroundCorner.charAt(0) == 'M'){
				this.connectorNode.style.top = aroundNodeCoords.y + ((aroundNodeCoords.h - this.connectorNode.offsetHeight) >> 1) - pos.y + "px";
				this.connectorNode.style.left = "";
			}else if(pos.corner.charAt(1) == 'M' && pos.aroundCorner.charAt(1) == 'M'){
				this.connectorNode.style.left = aroundNodeCoords.x + ((aroundNodeCoords.w - this.connectorNode.offsetWidth) >> 1) - pos.x + "px";
			}else{
				// Not *-centered, but just above/below/after/before
				this.connectorNode.style.left = "";
				this.connectorNode.style.top = "";
			}

			// show it
			domStyle.set(this.domNode, "opacity", 0);
			this.fadeIn.play();
			this.isShowingNow = true;
			this.aroundNode = aroundNode;
		},

		orient: function(/*DomNode*/ node, /*String*/ aroundCorner, /*String*/ tooltipCorner, /*Object*/ spaceAvailable, /*Object*/ aroundNodeCoords){
			// summary:
			//		Private function to set CSS for tooltip node based on which position it's in.
			//		This is called by the dijit popup code.   It will also reduce the tooltip's
			//		width to whatever width is available
			// tags:
			//		protected

			this.connectorNode.style.top = ""; //reset to default

			var heightAvailable = spaceAvailable.h,
				widthAvailable = spaceAvailable.w;

			node.className = "dijitTooltip " +
				{
					"MR-ML": "dijitTooltipRight",
					"ML-MR": "dijitTooltipLeft",
					"TM-BM": "dijitTooltipAbove",
					"BM-TM": "dijitTooltipBelow",
					"BL-TL": "dijitTooltipBelow dijitTooltipABLeft",
					"TL-BL": "dijitTooltipAbove dijitTooltipABLeft",
					"BR-TR": "dijitTooltipBelow dijitTooltipABRight",
					"TR-BR": "dijitTooltipAbove dijitTooltipABRight",
					"BR-BL": "dijitTooltipRight",
					"BL-BR": "dijitTooltipLeft"
				}[aroundCorner + "-" + tooltipCorner];

			// reset width; it may have been set by orient() on a previous tooltip show()
			this.domNode.style.width = "auto";

			// Reduce tooltip's width to the amount of width available, so that it doesn't overflow screen.
			// Note that sometimes widthAvailable is negative, but we guard against setting style.width to a
			// negative number since that causes an exception on IE.
			var size = domGeometry.position(this.domNode);
			if(has("ie") == 9){
				// workaround strange IE9 bug where setting width to offsetWidth causes words to wrap
				size.w += 2;
			}

			var width = Math.min((Math.max(widthAvailable,1)), size.w);

			domGeometry.setMarginBox(this.domNode, {w: width});

			// Reposition the tooltip connector.
			if(tooltipCorner.charAt(0) == 'B' && aroundCorner.charAt(0) == 'B'){
				var bb = domGeometry.position(node);
				var tooltipConnectorHeight = this.connectorNode.offsetHeight;
				if(bb.h > heightAvailable){
					// The tooltip starts at the top of the page and will extend past the aroundNode
					var aroundNodePlacement = heightAvailable - ((aroundNodeCoords.h + tooltipConnectorHeight) >> 1);
					this.connectorNode.style.top = aroundNodePlacement + "px";
					this.connectorNode.style.bottom = "";
				}else{
					// Align center of connector with center of aroundNode, except don't let bottom
					// of connector extend below bottom of tooltip content, or top of connector
					// extend past top of tooltip content
					this.connectorNode.style.bottom = Math.min(
						Math.max(aroundNodeCoords.h/2 - tooltipConnectorHeight/2, 0),
						bb.h - tooltipConnectorHeight) + "px";
					this.connectorNode.style.top = "";
				}
			}else{
				// reset the tooltip back to the defaults
				this.connectorNode.style.top = "";
				this.connectorNode.style.bottom = "";
			}

			return Math.max(0, size.w - widthAvailable);
		},

		_onShow: function(){
			// summary:
			//		Called at end of fade-in operation
			// tags:
			//		protected
			if(has("ie")){
				// the arrow won't show up on a node w/an opacity filter
				this.domNode.style.filter="";
			}
		},

		hide: function(aroundNode){
			// summary:
			//		Hide the tooltip

			if(this._onDeck && this._onDeck[1] == aroundNode){
				// this hide request is for a show() that hasn't even started yet;
				// just cancel the pending show()
				this._onDeck=null;
			}else if(this.aroundNode === aroundNode){
				// this hide request is for the currently displayed tooltip
				this.fadeIn.stop();
				this.isShowingNow = false;
				this.aroundNode = null;
				this.fadeOut.play();
			}else{
				// just ignore the call, it's for a tooltip that has already been erased
			}
		},

		_onHide: function(){
			// summary:
			//		Called at end of fade-out operation
			// tags:
			//		protected

			this.domNode.style.cssText="";	// to position offscreen again
			this.containerNode.innerHTML="";
			if(this._onDeck){
				// a show request has been queued up; do it now
				this.show.apply(this, this._onDeck);
				this._onDeck=null;
			}
		}
	});

	if(has("dojo-bidi")){
		MasterTooltip.extend({
			_setAutoTextDir: function(/*Object*/node){
				// summary:
				//		Resolve "auto" text direction for children nodes
				// tags:
				//		private

				this.applyTextDir(node);
				array.forEach(node.children, function(child){ this._setAutoTextDir(child); }, this);
			},

			_setTextDirAttr: function(/*String*/ textDir){
				// summary:
				//		Setter for textDir.
				// description:
				//		Users shouldn't call this function; they should be calling
				//		set('textDir', value)
				// tags:
				//		private

				this._set("textDir", textDir);

				if (textDir == "auto"){
					this._setAutoTextDir(this.containerNode);
				}else{
					this.containerNode.dir = this.textDir;
				}
			}
		});
	}

	dijit.showTooltip = function(innerHTML, aroundNode, position, rtl, textDir){
		// summary:
		//		Static method to display tooltip w/specified contents in specified position.
		//		See description of dijit/Tooltip.defaultPosition for details on position parameter.
		//		If position is not specified then dijit/Tooltip.defaultPosition is used.
		// innerHTML: String
		//		Contents of the tooltip
		// aroundNode: place.__Rectangle
		//		Specifies that tooltip should be next to this node / area
		// position: String[]?
		//		List of positions to try to position tooltip (ex: ["right", "above"])
		// rtl: Boolean?
		//		Corresponds to `WidgetBase.dir` attribute, where false means "ltr" and true
		//		means "rtl"; specifies GUI direction, not text direction.
		// textDir: String?
		//		Corresponds to `WidgetBase.textdir` attribute; specifies direction of text.

		// After/before don't work, but for back-compat convert them to the working after-centered, before-centered.
		// Possibly remove this in 2.0.   Alternately, get before/after to work.
		if(position){
			position = array.map(position, function(val){
				return {after: "after-centered", before: "before-centered"}[val] || val;
			});
		}

		if(!Tooltip._masterTT){ dijit._masterTT = Tooltip._masterTT = new MasterTooltip(); }
		return Tooltip._masterTT.show(innerHTML, aroundNode, position, rtl, textDir);
	};

	dijit.hideTooltip = function(aroundNode){
		// summary:
		//		Static method to hide the tooltip displayed via showTooltip()
		return Tooltip._masterTT && Tooltip._masterTT.hide(aroundNode);
	};

	var Tooltip = declare("dijit.Tooltip", _Widget, {
		// summary:
		//		Pops up a tooltip (a help message) when you hover over a node.
		//		Also provides static show() and hide() methods that can be used without instantiating a dijit/Tooltip.

		// label: String
		//		HTML to display in the tooltip.
		//		Specified as innerHTML when creating the widget from markup.
		label: "",

		// showDelay: Integer
		//		Number of milliseconds to wait after hovering over/focusing on the object, before
		//		the tooltip is displayed.
		showDelay: 400,

		// connectId: String|String[]|DomNode|DomNode[]
		//		Id of domNode(s) to attach the tooltip to.
		//		When user hovers over specified dom node(s), the tooltip will appear.
		connectId: [],

		// position: String[]
		//		See description of `dijit/Tooltip.defaultPosition` for details on position parameter.
		position: [],

		// selector: String?
		//		CSS expression to apply this Tooltip to descendants of connectIds, rather than to
		//		the nodes specified by connectIds themselves.    Useful for applying a Tooltip to
		//		a range of rows in a table, tree, etc.   Use in conjunction with getContent() parameter.
		//		Ex: connectId: myTable, selector: "tr", getContent: function(node){ return ...; }
		//
		//		The application must require() an appropriate level of dojo/query to handle the selector.
		selector: "",

		// TODO: in 2.0 remove support for multiple connectIds.   selector gives the same effect.
		// So, change connectId to a "", remove addTarget()/removeTarget(), etc.

		_setConnectIdAttr: function(/*String|String[]|DomNode|DomNode[]*/ newId){
			// summary:
			//		Connect to specified node(s)

			// Remove connections to old nodes (if there are any)
			array.forEach(this._connections || [], function(nested){
				array.forEach(nested, function(handle){ handle.remove(); });
			}, this);

			// Make array of id's to connect to, excluding entries for nodes that don't exist yet, see startup()
			this._connectIds = array.filter(lang.isArrayLike(newId) ? newId : (newId ? [newId] : []),
					function(id){ return dom.byId(id, this.ownerDocument); }, this);

			// Make connections
			this._connections = array.map(this._connectIds, function(id){
				var node = dom.byId(id, this.ownerDocument),
					selector = this.selector,
					delegatedEvent = selector ?
						function(eventType){ return on.selector(selector, eventType); } :
						function(eventType){ return eventType; },
					self = this;
				return [
					on(node, delegatedEvent(mouse.enter), function(){
						self._onHover(this);
					}),
					on(node, delegatedEvent("focusin"), function(){
						self._onHover(this);
					}),
					on(node, delegatedEvent(mouse.leave), lang.hitch(self, "_onUnHover")),
					on(node, delegatedEvent("focusout"), lang.hitch(self, "_onUnHover"))
				];
			}, this);

			this._set("connectId", newId);
		},

		addTarget: function(/*OomNode|String*/ node){
			// summary:
			//		Attach tooltip to specified node if it's not already connected

			// TODO: remove in 2.0 and just use set("connectId", ...) interface

			var id = node.id || node;
			if(array.indexOf(this._connectIds, id) == -1){
				this.set("connectId", this._connectIds.concat(id));
			}
		},

		removeTarget: function(/*DomNode|String*/ node){
			// summary:
			//		Detach tooltip from specified node

			// TODO: remove in 2.0 and just use set("connectId", ...) interface

			var id = node.id || node,	// map from DOMNode back to plain id string
				idx = array.indexOf(this._connectIds, id);
			if(idx >= 0){
				// remove id (modifies original this._connectIds but that's OK in this case)
				this._connectIds.splice(idx, 1);
				this.set("connectId", this._connectIds);
			}
		},

		buildRendering: function(){
			this.inherited(arguments);
			domClass.add(this.domNode,"dijitTooltipData");
		},

		startup: function(){
			this.inherited(arguments);

			// If this tooltip was created in a template, or for some other reason the specified connectId[s]
			// didn't exist during the widget's initialization, then connect now.
			var ids = this.connectId;
			array.forEach(lang.isArrayLike(ids) ? ids : [ids], this.addTarget, this);
		},

		getContent: function(/*DomNode*/ node){
			// summary:
			//		User overridable function that return the text to display in the tooltip.
			// tags:
			//		extension
			return this.label || this.domNode.innerHTML;
		},

		_onHover: function(/*DomNode*/ target){
			// summary:
			//		Despite the name of this method, it actually handles both hover and focus
			//		events on the target node, setting a timer to show the tooltip.
			// tags:
			//		private
			if(!this._showTimer){
				this._showTimer = this.defer(function(){ this.open(target); }, this.showDelay);
			}
		},

		_onUnHover: function(){
			// summary:
			//		Despite the name of this method, it actually handles both mouseleave and blur
			//		events on the target node, hiding the tooltip.
			// tags:
			//		private

			if(this._showTimer){
				this._showTimer.remove();
				delete this._showTimer;
			}
			this.close();
		},

		open: function(/*DomNode*/ target){
			// summary:
			//		Display the tooltip; usually not called directly.
			// tags:
			//		private

			if(this._showTimer){
				this._showTimer.remove();
				delete this._showTimer;
			}

			var content = this.getContent(target);
			if(!content){
				return;
			}
			Tooltip.show(content, target, this.position, !this.isLeftToRight(), this.textDir);

			this._connectNode = target;		// _connectNode means "tooltip currently displayed for this node"
			this.onShow(target, this.position);
		},

		close: function(){
			// summary:
			//		Hide the tooltip or cancel timer for show of tooltip
			// tags:
			//		private

			if(this._connectNode){
				// if tooltip is currently shown
				Tooltip.hide(this._connectNode);
				delete this._connectNode;
				this.onHide();
			}
			if(this._showTimer){
				// if tooltip is scheduled to be shown (after a brief delay)
				this._showTimer.remove();
				delete this._showTimer;
			}
		},

		onShow: function(/*===== target, position =====*/){
			// summary:
			//		Called when the tooltip is shown
			// tags:
			//		callback
		},

		onHide: function(){
			// summary:
			//		Called when the tooltip is hidden
			// tags:
			//		callback
		},

		destroy: function(){
			this.close();

			// Remove connections manually since they aren't registered to be removed by _WidgetBase
			array.forEach(this._connections || [], function(nested){
				array.forEach(nested, function(handle){ handle.remove(); });
			}, this);

			this.inherited(arguments);
		}
	});

	Tooltip._MasterTooltip = MasterTooltip;		// for monkey patching
	Tooltip.show = dijit.showTooltip;		// export function through module return value
	Tooltip.hide = dijit.hideTooltip;		// export function through module return value

	Tooltip.defaultPosition = ["after-centered", "before-centered"];

	/*=====
	lang.mixin(Tooltip, {
		 // defaultPosition: String[]
		 //		This variable controls the position of tooltips, if the position is not specified to
		 //		the Tooltip widget or *TextBox widget itself.  It's an array of strings with the values
		 //		possible for `dijit/place.around()`.   The recommended values are:
		 //
		 //		- before-centered: centers tooltip to the left of the anchor node/widget, or to the right
		 //		  in the case of RTL scripts like Hebrew and Arabic
		 //		- after-centered: centers tooltip to the right of the anchor node/widget, or to the left
		 //		  in the case of RTL scripts like Hebrew and Arabic
		 //		- above-centered: tooltip is centered above anchor node
		 //		- below-centered: tooltip is centered above anchor node
		 //
		 //		The list is positions is tried, in order, until a position is found where the tooltip fits
		 //		within the viewport.
		 //
		 //		Be careful setting this parameter.  A value of "above-centered" may work fine until the user scrolls
		 //		the screen so that there's no room above the target node.   Nodes with drop downs, like
		 //		DropDownButton or FilteringSelect, are especially problematic, in that you need to be sure
		 //		that the drop down and tooltip don't overlap, even when the viewport is scrolled so that there
		 //		is only room below (or above) the target node, but not both.
	 });
	=====*/
	return Tooltip;
});

},
'dijit/selection':function(){
define([
	"dojo/_base/array",
	"dojo/dom", // dom.byId
	"dojo/_base/lang",
	"dojo/sniff", // has("ie") has("opera")
	"dojo/_base/window",
	"dijit/focus"
], function(array, dom, lang, has, baseWindow, focus){

	// module:
	//		dijit/selection

	// Note that this class is using feature detection, but doesn't use has() because sometimes on IE the outer window
	// may be running in standards mode (ie, IE9 mode) but an iframe may be in compatibility mode.   So the code path
	// used will vary based on the window.

	var SelectionManager = function(win){
		// summary:
		//		Class for monitoring / changing the selection (typically highlighted text) in a given window
		// win: Window
		//		The window to monitor/adjust the selection on.

		var doc = win.document;

		this.getType = function(){
			// summary:
			//		Get the selection type (like doc.select.type in IE).
			if(doc.getSelection){
				// W3C path
				var stype = "text";

				// Check if the actual selection is a CONTROL (IMG, TABLE, HR, etc...).
				var oSel;
				try{
					oSel = win.getSelection();
				}catch(e){ /*squelch*/ }

				if(oSel && oSel.rangeCount == 1){
					var oRange = oSel.getRangeAt(0);
					if(	(oRange.startContainer == oRange.endContainer) &&
						((oRange.endOffset - oRange.startOffset) == 1) &&
						(oRange.startContainer.nodeType != 3 /* text node*/)
						){
						stype = "control";
					}
				}
				return stype; //String
			}else{
				// IE6-8
				return doc.selection.type.toLowerCase();
			}
		};

		this.getSelectedText = function(){
			// summary:
			//		Return the text (no html tags) included in the current selection or null if no text is selected
			if(doc.getSelection){
				// W3C path
				var selection = win.getSelection();
				return selection ? selection.toString() : ""; //String
			}else{
				// IE6-8
				if(this.getType() == 'control'){
					return null;
				}
				return doc.selection.createRange().text;
			}
		};

		this.getSelectedHtml = function(){
			// summary:
			//		Return the html text of the current selection or null if unavailable
			if(doc.getSelection){
				// W3C path
				var selection = win.getSelection();
				if(selection && selection.rangeCount){
					var i;
					var html = "";
					for(i = 0; i < selection.rangeCount; i++){
						//Handle selections spanning ranges, such as Opera
						var frag = selection.getRangeAt(i).cloneContents();
						var div = doc.createElement("div");
						div.appendChild(frag);
						html += div.innerHTML;
					}
					return html; //String
				}
				return null;
			}else{
				// IE6-8
				if(this.getType() == 'control'){
					return null;
				}
				return doc.selection.createRange().htmlText;
			}
		};

		this.getSelectedElement = function(){
			// summary:
			//		Retrieves the selected element (if any), just in the case that
			//		a single element (object like and image or a table) is
			//		selected.
			if(this.getType() == "control"){
				if(doc.getSelection){
					// W3C path
					var selection = win.getSelection();
					return selection.anchorNode.childNodes[ selection.anchorOffset ];
				}else{
					// IE6-8
					var range = doc.selection.createRange();
					if(range && range.item){
						return doc.selection.createRange().item(0);
					}
				}
			}
			return null;
		};

		this.getParentElement = function(){
			// summary:
			//		Get the parent element of the current selection
			if(this.getType() == "control"){
				var p = this.getSelectedElement();
				if(p){ return p.parentNode; }
			}else{
				if(doc.getSelection){
					var selection = doc.getSelection();
					if(selection){
						var node = selection.anchorNode;
						while(node && (node.nodeType != 1)){ // not an element
							node = node.parentNode;
						}
						return node;
					}
				}else{
					var r = doc.selection.createRange();
					r.collapse(true);
					return r.parentElement();
				}
			}
			return null;
		};

		this.hasAncestorElement = function(/*String*/ tagName /* ... */){
			// summary:
			//		Check whether current selection has a  parent element which is
			//		of type tagName (or one of the other specified tagName)
			// tagName: String
			//		The tag name to determine if it has an ancestor of.
			return this.getAncestorElement.apply(this, arguments) != null; //Boolean
		};

		this.getAncestorElement = function(/*String*/ tagName /* ... */){
			// summary:
			//		Return the parent element of the current selection which is of
			//		type tagName (or one of the other specified tagName)
			// tagName: String
			//		The tag name to determine if it has an ancestor of.
			var node = this.getSelectedElement() || this.getParentElement();
			return this.getParentOfType(node, arguments); //DOMNode
		};

		this.isTag = function(/*DomNode*/ node, /*String[]*/ tags){
			// summary:
			//		Function to determine if a node is one of an array of tags.
			// node:
			//		The node to inspect.
			// tags:
			//		An array of tag name strings to check to see if the node matches.
			if(node && node.tagName){
				var _nlc = node.tagName.toLowerCase();
				for(var i=0; i<tags.length; i++){
					var _tlc = String(tags[i]).toLowerCase();
					if(_nlc == _tlc){
						return _tlc; // String
					}
				}
			}
			return "";
		};

		this.getParentOfType = function(/*DomNode*/ node, /*String[]*/ tags){
			// summary:
			//		Function to locate a parent node that matches one of a set of tags
			// node:
			//		The node to inspect.
			// tags:
			//		An array of tag name strings to check to see if the node matches.
			while(node){
				if(this.isTag(node, tags).length){
					return node; // DOMNode
				}
				node = node.parentNode;
			}
			return null;
		};

		this.collapse = function(/*Boolean*/ beginning){
			// summary:
			//		Function to collapse (clear), the current selection
			// beginning: Boolean
			//		Indicates whether to collapse the cursor to the beginning of the selection or end.
			if(doc.getSelection){
				// W3C path
				var selection = win.getSelection();
				if(selection.removeAllRanges){ // Mozilla
					if(beginning){
						selection.collapseToStart();
					}else{
						selection.collapseToEnd();
					}
				}else{ // Safari
					// pulled from WebCore/ecma/kjs_window.cpp, line 2536
					selection.collapse(beginning);
				}
			}else{
				// IE6-8
				var range = doc.selection.createRange();
				range.collapse(beginning);
				range.select();
			}
		};

		this.remove = function(){
			// summary:
			//		Function to delete the currently selected content from the document.
			var sel = doc.selection;
			if(doc.getSelection){
				// W3C path
				sel = win.getSelection();
				sel.deleteFromDocument();
				return sel; //Selection
			}else{
				// IE6-8
				if(sel.type.toLowerCase() != "none"){
					sel.clear();
				}
				return sel; //Selection
			}
		};

		this.selectElementChildren = function(/*DomNode*/ element, /*Boolean?*/ nochangefocus){
			// summary:
			//		clear previous selection and select the content of the node
			//		(excluding the node itself)
			// element: DOMNode
			//		The element you wish to select the children content of.
			// nochangefocus: Boolean
			//		Indicates if the focus should change or not.

			var range;
			element = dom.byId(element);
			if(doc.getSelection){
				// W3C
				var selection = win.getSelection();
				if(has("opera")){
					//Opera's selectAllChildren doesn't seem to work right
					//against <body> nodes and possibly others ... so
					//we use the W3C range API
					if(selection.rangeCount){
						range = selection.getRangeAt(0);
					}else{
						range = doc.createRange();
					}
					range.setStart(element, 0);
					range.setEnd(element,(element.nodeType == 3) ? element.length : element.childNodes.length);
					selection.addRange(range);
				}else{
					selection.selectAllChildren(element);
				}
			}else{
				// IE6-8
				range = element.ownerDocument.body.createTextRange();
				range.moveToElementText(element);
				if(!nochangefocus){
					try{
						range.select(); // IE throws an exception here if the widget is hidden.  See #5439
					}catch(e){ /* squelch */}
				}
			}
		};

		this.selectElement = function(/*DomNode*/ element, /*Boolean?*/ nochangefocus){
			// summary:
			//		clear previous selection and select element (including all its children)
			// element: DOMNode
			//		The element to select.
			// nochangefocus: Boolean
			//		Boolean indicating if the focus should be changed.  IE only.
			var range;
			element = dom.byId(element);	// TODO: remove for 2.0 or sooner, spec listed above doesn't allow for string
			if(doc.getSelection){
				// W3C path
				var selection = doc.getSelection();
				range = doc.createRange();
				if(selection.removeAllRanges){ // Mozilla
					// FIXME: does this work on Safari?
					if(has("opera")){
						//Opera works if you use the current range on
						//the selection if present.
						if(selection.getRangeAt(0)){
							range = selection.getRangeAt(0);
						}
					}
					range.selectNode(element);
					selection.removeAllRanges();
					selection.addRange(range);
				}
			}else{
				// IE6-8
				try{
					var tg = element.tagName ? element.tagName.toLowerCase() : "";
					if(tg === "img" || tg === "table"){
						range = baseWindow.body(doc).createControlRange();
					}else{
						range = baseWindow.body(doc).createRange();
					}
					range.addElement(element);
					if(!nochangefocus){
						range.select();
					}
				}catch(e){
					this.selectElementChildren(element, nochangefocus);
				}
			}
		};

		this.inSelection = function(node){
			// summary:
			//		This function determines if 'node' is
			//		in the current selection.
			// tags:
			//		public
			if(node){
				var newRange;
				var range;

				if(doc.getSelection){
					// WC3
					var sel = win.getSelection();
					if(sel && sel.rangeCount > 0){
						range = sel.getRangeAt(0);
					}
					if(range && range.compareBoundaryPoints && doc.createRange){
						try{
							newRange = doc.createRange();
							newRange.setStart(node, 0);
							if(range.compareBoundaryPoints(range.START_TO_END, newRange) === 1){
								return true;
							}
						}catch(e){ /* squelch */}
					}
				}else{
					// IE6-8, so we can't use the range object as the pseudo
					// range doesn't implement the boundary checking, we have to
					// use IE specific crud.
					range = doc.selection.createRange();
					try{
						newRange = node.ownerDocument.body.createTextRange();
						newRange.moveToElementText(node);
					}catch(e2){/* squelch */}
					if(range && newRange){
						// We can finally compare similar to W3C
						if(range.compareEndPoints("EndToStart", newRange) === 1){
							return true;
						}
					}
				}
			}
			return false; // Boolean
		},

		this.getBookmark = function(){
			// summary:
			//		Retrieves a bookmark that can be used with moveToBookmark to reselect the currently selected range.

			// TODO: merge additional code from Editor._getBookmark into this method

			var bm, rg, tg, sel = doc.selection, cf = focus.curNode;

			if(doc.getSelection){
				// W3C Range API for selections.
				sel = win.getSelection();
				if(sel){
					if(sel.isCollapsed){
						tg = cf? cf.tagName : "";
						if(tg){
							// Create a fake rangelike item to restore selections.
							tg = tg.toLowerCase();
							if(tg == "textarea" ||
								(tg == "input" && (!cf.type || cf.type.toLowerCase() == "text"))){
								sel = {
									start: cf.selectionStart,
									end: cf.selectionEnd,
									node: cf,
									pRange: true
								};
								return {isCollapsed: (sel.end <= sel.start), mark: sel}; //Object.
							}
						}
						bm = {isCollapsed:true};
						if(sel.rangeCount){
							bm.mark = sel.getRangeAt(0).cloneRange();
						}
					}else{
						rg = sel.getRangeAt(0);
						bm = {isCollapsed: false, mark: rg.cloneRange()};
					}
				}
			}else if(sel){
				// If the current focus was a input of some sort and no selection, don't bother saving
				// a native bookmark.  This is because it causes issues with dialog/page selection restore.
				// So, we need to create pseudo bookmarks to work with.
				tg = cf ? cf.tagName : "";
				tg = tg.toLowerCase();
				if(cf && tg && (tg == "button" || tg == "textarea" || tg == "input")){
					if(sel.type && sel.type.toLowerCase() == "none"){
						return {
							isCollapsed: true,
							mark: null
						}
					}else{
						rg = sel.createRange();
						return {
							isCollapsed: rg.text && rg.text.length?false:true,
							mark: {
								range: rg,
								pRange: true
							}
						};
					}
				}
				bm = {};

				//'IE' way for selections.
				try{
					// createRange() throws exception when dojo in iframe
					// and nothing selected, see #9632
					rg = sel.createRange();
					bm.isCollapsed = !(sel.type == 'Text' ? rg.htmlText.length : rg.length);
				}catch(e){
					bm.isCollapsed = true;
					return bm;
				}
				if(sel.type.toUpperCase() == 'CONTROL'){
					if(rg.length){
						bm.mark=[];
						var i=0,len=rg.length;
						while(i<len){
							bm.mark.push(rg.item(i++));
						}
					}else{
						bm.isCollapsed = true;
						bm.mark = null;
					}
				}else{
					bm.mark = rg.getBookmark();
				}
			}else{
				console.warn("No idea how to store the current selection for this browser!");
			}
			return bm; // Object
		};

		this.moveToBookmark = function(/*Object*/ bookmark){
			// summary:
			//		Moves current selection to a bookmark.
			// bookmark:
			//		This should be a returned object from getBookmark().

			// TODO: merge additional code from Editor._moveToBookmark into this method

			var mark = bookmark.mark;
			if(mark){
				if(doc.getSelection){
					// W3C Range API (FF, WebKit, Opera, etc)
					var sel = win.getSelection();
					if(sel && sel.removeAllRanges){
						if(mark.pRange){
							var n = mark.node;
							n.selectionStart = mark.start;
							n.selectionEnd = mark.end;
						}else{
							sel.removeAllRanges();
							sel.addRange(mark);
						}
					}else{
						console.warn("No idea how to restore selection for this browser!");
					}
				}else if(doc.selection && mark){
					//'IE' way.
					var rg;
					if(mark.pRange){
						rg = mark.range;
					}else if(lang.isArray(mark)){
						rg = doc.body.createControlRange();
						//rg.addElement does not have call/apply method, so can not call it directly
						//rg is not available in "range.addElement(item)", so can't use that either
						array.forEach(mark, function(n){
							rg.addElement(n);
						});
					}else{
						rg = doc.body.createTextRange();
						rg.moveToBookmark(mark);
					}
					rg.select();
				}
			}
		};

		this.isCollapsed = function(){
			// summary:
			//		Returns true if there is no text selected
			return this.getBookmark().isCollapsed;
		};
	};

	// singleton on the main window
	var selection = new SelectionManager(window);

	// hook for editor to use class
	selection.SelectionManager = SelectionManager;

	return selection;
});

},
'dijit/Calendar':function(){
define([
	"dojo/_base/array", // array.map
	"dojo/date",
	"dojo/date/locale",
	"dojo/_base/declare", // declare
	"dojo/dom-attr", // domAttr.get
	"dojo/dom-class", // domClass.add domClass.contains domClass.remove domClass.toggle
	"dojo/_base/kernel", // kernel.deprecated
	"dojo/keys", // keys
	"dojo/_base/lang", // lang.hitch
	"dojo/on",
	"dojo/sniff", // has("ie")
	"./CalendarLite",
	"./_Widget",
	"./_CssStateMixin",
	"./_TemplatedMixin",
	"./form/DropDownButton"
], function(array, date, local, declare, domAttr, domClass, kernel, keys, lang, on, has, CalendarLite, _Widget, _CssStateMixin, _TemplatedMixin, DropDownButton){

	// module:
	//		dijit/Calendar

	// _Widget for deprecated methods like setAttribute()
	var Calendar = declare("dijit.Calendar", [CalendarLite, _Widget, _CssStateMixin], {
		// summary:
		//		A simple GUI for choosing a date in the context of a monthly calendar.
		//
		// description:
		//		See CalendarLite for general description.   Calendar extends CalendarLite, adding:
		//
		//		- month drop down list
		//		- keyboard navigation
		//		- CSS classes for hover/mousepress on date, month, and year nodes
		//		- support of deprecated methods (will be removed in 2.0)

		// Set node classes for various mouse events, see dijit._CssStateMixin for more details
		cssStateNodes: {
			"decrementMonth": "dijitCalendarArrow",
			"incrementMonth": "dijitCalendarArrow",
			"previousYearLabelNode": "dijitCalendarPreviousYear",
			"nextYearLabelNode": "dijitCalendarNextYear"
		},

		setValue: function(/*Date*/ value){
			// summary:
			//		Deprecated.   Use set('value', ...) instead.
			// tags:
			//		deprecated
			kernel.deprecated("dijit.Calendar:setValue() is deprecated.  Use set('value', ...) instead.", "", "2.0");
			this.set('value', value);
		},

		_createMonthWidget: function(){
			// summary:
			//		Creates the drop down button that displays the current month and lets user pick a new one

			return new Calendar._MonthDropDownButton({
				id: this.id + "_mddb",
				tabIndex: -1,
				onMonthSelect: lang.hitch(this, "_onMonthSelect"),
				lang: this.lang,
				dateLocaleModule: this.dateLocaleModule
			}, this.monthNode);
		},

		postCreate: function(){
			this.inherited(arguments);

			// Events specific to Calendar, not used in CalendarLite
			this.own(
				on(this.domNode, "keydown", lang.hitch(this, "_onKeyDown")),
				on(this.dateRowsNode, "mouseover", lang.hitch(this, "_onDayMouseOver")),
				on(this.dateRowsNode, "mouseout", lang.hitch(this, "_onDayMouseOut")),
				on(this.dateRowsNode, "mousedown", lang.hitch(this, "_onDayMouseDown")),
				on(this.dateRowsNode, "mouseup", lang.hitch(this, "_onDayMouseUp"))
			);
		},

		_onMonthSelect: function(/*Number*/ newMonth){
			// summary:
			//		Handler for when user selects a month from the drop down list
			// tags:
			//		protected

			// move to selected month, bounding by the number of days in the month
			// (ex: jan 31 --> feb 28, not feb 31)
			var date = new this.dateClassObj(this.currentFocus);
			date.setDate(1);
			date.setMonth(newMonth);
			var daysInMonth = this.dateModule.getDaysInMonth(date);
			var currentDate = this.currentFocus.getDate();
			date.setDate(Math.min(currentDate, daysInMonth));
			this._setCurrentFocusAttr(date);
		},

		_onDayMouseOver: function(/*Event*/ evt){
			// summary:
			//		Handler for mouse over events on days, sets hovered style
			// tags:
			//		protected

			// event can occur on <td> or the <span> inside the td,
			// set node to the <td>.
			var node =
				domClass.contains(evt.target, "dijitCalendarDateLabel") ?
					evt.target.parentNode :
					evt.target;

			if(node && (
				(node.dijitDateValue && !domClass.contains(node, "dijitCalendarDisabledDate"))
					|| node == this.previousYearLabelNode || node == this.nextYearLabelNode
				)){
				domClass.add(node, "dijitCalendarHoveredDate");
				this._currentNode = node;
			}
		},

		_onDayMouseOut: function(/*Event*/ evt){
			// summary:
			//		Handler for mouse out events on days, clears hovered style
			// tags:
			//		protected

			if(!this._currentNode){
				return;
			}

			// if mouse out occurs moving from <td> to <span> inside <td>, ignore it
			if(evt.relatedTarget && evt.relatedTarget.parentNode == this._currentNode){
				return;
			}
			var cls = "dijitCalendarHoveredDate";
			if(domClass.contains(this._currentNode, "dijitCalendarActiveDate")){
				cls += " dijitCalendarActiveDate";
			}
			domClass.remove(this._currentNode, cls);
			this._currentNode = null;
		},

		_onDayMouseDown: function(/*Event*/ evt){
			var node = evt.target.parentNode;
			if(node && node.dijitDateValue && !domClass.contains(node, "dijitCalendarDisabledDate")){
				domClass.add(node, "dijitCalendarActiveDate");
				this._currentNode = node;
			}
		},

		_onDayMouseUp: function(/*Event*/ evt){
			var node = evt.target.parentNode;
			if(node && node.dijitDateValue){
				domClass.remove(node, "dijitCalendarActiveDate");
			}
		},

		handleKey: function(/*Event*/ evt){
			// summary:
			//		Provides keyboard navigation of calendar.
			// description:
			//		Called from _onKeyDown() to handle keydown on a stand alone Calendar,
			//		and also from `dijit/form/_DateTimeTextBox` to pass a keydown event
			//		from the `dijit/form/DateTextBox` to be handled in this widget
			// returns:
			//		False if the key was recognized as a navigation key,
			//		to indicate that the event was handled by Calendar and shouldn't be propagated
			// tags:
			//		protected
			var increment = -1,
				interval,
				newValue = this.currentFocus;
			switch(evt.keyCode){
				case keys.RIGHT_ARROW:
					increment = 1;
				//fallthrough...
				case keys.LEFT_ARROW:
					interval = "day";
					if(!this.isLeftToRight()){
						increment *= -1;
					}
					break;
				case keys.DOWN_ARROW:
					increment = 1;
				//fallthrough...
				case keys.UP_ARROW:
					interval = "week";
					break;
				case keys.PAGE_DOWN:
					increment = 1;
				//fallthrough...
				case keys.PAGE_UP:
					interval = evt.ctrlKey || evt.altKey ? "year" : "month";
					break;
				case keys.END:
					// go to the next month
					newValue = this.dateModule.add(newValue, "month", 1);
					// subtract a day from the result when we're done
					interval = "day";
				//fallthrough...
				case keys.HOME:
					newValue = new this.dateClassObj(newValue);
					newValue.setDate(1);
					break;
				default:
					return true;
			}

			if(interval){
				newValue = this.dateModule.add(newValue, interval, increment);
			}

			this._setCurrentFocusAttr(newValue);

			return false;
		},

		_onKeyDown: function(/*Event*/ evt){
			// summary:
			//		For handling keydown events on a stand alone calendar
			if(!this.handleKey(evt)){
				evt.stopPropagation();
				evt.preventDefault();
			}
		},

		onValueSelected: function(/*Date*/ /*===== date =====*/){
			// summary:
			//		Deprecated.   Notification that a date cell was selected.  It may be the same as the previous value.
			// description:
			//		Formerly used by `dijit/form/_DateTimeTextBox` (and thus `dijit/form/DateTextBox`)
			//		to get notification when the user has clicked a date.  Now onExecute() (above) is used.
			// tags:
			//		protected
		},

		onChange: function(value){
			this.onValueSelected(value);	// remove in 2.0
		},

		getClassForDate: function(/*===== dateObject, locale =====*/){
			// summary:
			//		May be overridden to return CSS classes to associate with the date entry for the given dateObject,
			//		for example to indicate a holiday in specified locale.
			// dateObject: Date
			// locale: String?
			// tags:
			//		extension

			/*=====
			 return ""; // String
			 =====*/
		}
	});

	Calendar._MonthDropDownButton = declare("dijit.Calendar._MonthDropDownButton", DropDownButton, {
		// summary:
		//		DropDownButton for the current month.    Displays name of current month
		//		and a list of month names in the drop down

		onMonthSelect: function(){
		},

		postCreate: function(){
			this.inherited(arguments);
			this.dropDown = new Calendar._MonthDropDown({
				id: this.id + "_mdd", //do not change this id because it is referenced in the template
				onChange: this.onMonthSelect
			});
		},
		_setMonthAttr: function(month){
			// summary:
			//		Set the current month to display as a label
			var monthNames = this.dateLocaleModule.getNames('months', 'wide', 'standAlone', this.lang, month);
			this.dropDown.set("months", monthNames);

			// Set name of current month and also fill in spacer element with all the month names
			// (invisible) so that the maximum width will affect layout.   But not on IE6 because then
			// the center <TH> overlaps the right <TH> (due to a browser bug).
			this.containerNode.innerHTML =
				(has("ie") == 6 ? "" : "<div class='dijitSpacer'>" + this.dropDown.domNode.innerHTML + "</div>") +
					"<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>" + monthNames[month.getMonth()] + "</div>";
		}
	});

	Calendar._MonthDropDown = declare("dijit.Calendar._MonthDropDown", [_Widget, _TemplatedMixin], {
		// summary:
		//		The list-of-months drop down from the MonthDropDownButton

		// months: String[]
		//		List of names of months, possibly w/some undefined entries for Hebrew leap months
		//		(ex: ["January", "February", undefined, "April", ...])
		months: [],

		templateString: "<div class='dijitCalendarMonthMenu dijitMenu' " +
			"data-dojo-attach-event='onclick:_onClick,onmouseover:_onMenuHover,onmouseout:_onMenuHover'></div>",

		_setMonthsAttr: function(/*String[]*/ months){
			this.domNode.innerHTML = array.map(months,function(month, idx){
				return month ? "<div class='dijitCalendarMonthLabel' month='" + idx + "'>" + month + "</div>" : "";
			}).join("");
		},

		_onClick: function(/*Event*/ evt){
			this.onChange(domAttr.get(evt.target, "month"));
		},

		onChange: function(/*Number*/ /*===== month =====*/){
			// summary:
			//		Callback when month is selected from drop down
		},

		_onMenuHover: function(evt){
			domClass.toggle(evt.target, "dijitCalendarMonthLabelHover", evt.type == "mouseover");
		}
	});

	return Calendar;
});

},
'dijit/popup':function(){
define([
	"dojo/_base/array", // array.forEach array.some
	"dojo/aspect",
	"dojo/_base/declare", // declare
	"dojo/dom", // dom.isDescendant
	"dojo/dom-attr", // domAttr.set
	"dojo/dom-construct", // domConstruct.create domConstruct.destroy
	"dojo/dom-geometry", // domGeometry.isBodyLtr
	"dojo/dom-style", // domStyle.set
	"dojo/has", // has("config-bgIframe")
	"dojo/keys",
	"dojo/_base/lang", // lang.hitch
	"dojo/on",
	"./place",
	"./BackgroundIframe",
	"./Viewport",
	"./main"    // dijit (defining dijit.popup to match API doc)
], function(array, aspect, declare, dom, domAttr, domConstruct, domGeometry, domStyle, has, keys, lang, on,
			place, BackgroundIframe, Viewport, dijit){

	// module:
	//		dijit/popup

	/*=====
	 var __OpenArgs = {
		 // popup: Widget
		 //		widget to display
		 // parent: Widget
		 //		the button etc. that is displaying this popup
		 // around: DomNode
		 //		DOM node (typically a button); place popup relative to this node.  (Specify this *or* "x" and "y" parameters.)
		 // x: Integer
		 //		Absolute horizontal position (in pixels) to place node at.  (Specify this *or* "around" parameter.)
		 // y: Integer
		 //		Absolute vertical position (in pixels) to place node at.  (Specify this *or* "around" parameter.)
		 // orient: Object|String
		 //		When the around parameter is specified, orient should be a list of positions to try, ex:
		 //	|	[ "below", "above" ]
		 //		For backwards compatibility it can also be an (ordered) hash of tuples of the form
		 //		(around-node-corner, popup-node-corner), ex:
		 //	|	{ "BL": "TL", "TL": "BL" }
		 //		where BL means "bottom left" and "TL" means "top left", etc.
		 //
		 //		dijit/popup.open() tries to position the popup according to each specified position, in order,
		 //		until the popup appears fully within the viewport.
		 //
		 //		The default value is ["below", "above"]
		 //
		 //		When an (x,y) position is specified rather than an around node, orient is either
		 //		"R" or "L".  R (for right) means that it tries to put the popup to the right of the mouse,
		 //		specifically positioning the popup's top-right corner at the mouse position, and if that doesn't
		 //		fit in the viewport, then it tries, in order, the bottom-right corner, the top left corner,
		 //		and the top-right corner.
		 // onCancel: Function
		 //		callback when user has canceled the popup by:
		 //
		 //		1. hitting ESC or
		 //		2. by using the popup widget's proprietary cancel mechanism (like a cancel button in a dialog);
		 //		   i.e. whenever popupWidget.onCancel() is called, args.onCancel is called
		 // onClose: Function
		 //		callback whenever this popup is closed
		 // onExecute: Function
		 //		callback when user "executed" on the popup/sub-popup by selecting a menu choice, etc. (top menu only)
		 // padding: place.__Position
		 //		adding a buffer around the opening position. This is only useful when around is not set.
		 // maxHeight: Integer
		 //		The max height for the popup.  Any popup taller than this will have scrollbars.
		 //		Set to Infinity for no max height.  Default is to limit height to available space in viewport,
		 //		above or below the aroundNode or specified x/y position.
	 };
	 =====*/

	function destroyWrapper(){
		// summary:
		//		Function to destroy wrapper when popup widget is destroyed.
		//		Left in this scope to avoid memory leak on IE8 on refresh page, see #15206.
		if(this._popupWrapper){
			domConstruct.destroy(this._popupWrapper);
			delete this._popupWrapper;
		}
	}

	var PopupManager = declare(null, {
		// summary:
		//		Used to show drop downs (ex: the select list of a ComboBox)
		//		or popups (ex: right-click context menus).

		// _stack: dijit/_WidgetBase[]
		//		Stack of currently popped up widgets.
		//		(someone opened _stack[0], and then it opened _stack[1], etc.)
		_stack: [],

		// _beginZIndex: Number
		//		Z-index of the first popup.   (If first popup opens other
		//		popups they get a higher z-index.)
		_beginZIndex: 1000,

		_idGen: 1,

		_repositionAll: function(){
			// summary:
			//		If screen has been scrolled, reposition all the popups in the stack.
			//		Then set timer to check again later.

			if(this._firstAroundNode){	// guard for when clearTimeout() on IE doesn't work
				var oldPos = this._firstAroundPosition,
					newPos = domGeometry.position(this._firstAroundNode, true),
					dx = newPos.x - oldPos.x,
					dy = newPos.y - oldPos.y;

				if(dx || dy){
					this._firstAroundPosition = newPos;
					for(var i = 0; i < this._stack.length; i++){
						var style = this._stack[i].wrapper.style;
						style.top = (parseInt(style.top, 10) + dy) + "px";
						if(style.right == "auto"){
							style.left = (parseInt(style.left, 10) + dx) + "px";
						}else{
							style.right = (parseInt(style.right, 10) - dx) + "px";
						}
					}
				}

				this._aroundMoveListener = setTimeout(lang.hitch(this, "_repositionAll"), dx || dy ? 10 : 50);
			}
		},

		_createWrapper: function(/*Widget*/ widget){
			// summary:
			//		Initialization for widgets that will be used as popups.
			//		Puts widget inside a wrapper DIV (if not already in one),
			//		and returns pointer to that wrapper DIV.

			var wrapper = widget._popupWrapper,
				node = widget.domNode;

			if(!wrapper){
				// Create wrapper <div> for when this widget [in the future] will be used as a popup.
				// This is done early because of IE bugs where creating/moving DOM nodes causes focus
				// to go wonky, see tests/robot/Toolbar.html to reproduce
				wrapper = domConstruct.create("div", {
					"class": "dijitPopup",
					style: { display: "none"},
					role: "region",
					"aria-label": widget["aria-label"] || widget.label || widget.name || widget.id
				}, widget.ownerDocumentBody);
				wrapper.appendChild(node);

				var s = node.style;
				s.display = "";
				s.visibility = "";
				s.position = "";
				s.top = "0px";

				widget._popupWrapper = wrapper;
				aspect.after(widget, "destroy", destroyWrapper, true);
			}

			return wrapper;
		},

		moveOffScreen: function(/*Widget*/ widget){
			// summary:
			//		Moves the popup widget off-screen.
			//		Do not use this method to hide popups when not in use, because
			//		that will create an accessibility issue: the offscreen popup is
			//		still in the tabbing order.

			// Create wrapper if not already there
			var wrapper = this._createWrapper(widget);

			// Besides setting visibility:hidden, move it out of the viewport, see #5776, #10111, #13604
			var ltr = domGeometry.isBodyLtr(widget.ownerDocument),
				style = {
					visibility: "hidden",
					top: "-9999px",
					display: ""
				};
			style[ltr ? "left" : "right"] = "-9999px";
			style[ltr ? "right" : "left"] = "auto";
			domStyle.set(wrapper, style);

			return wrapper;
		},

		hide: function(/*Widget*/ widget){
			// summary:
			//		Hide this popup widget (until it is ready to be shown).
			//		Initialization for widgets that will be used as popups
			//
			//		Also puts widget inside a wrapper DIV (if not already in one)
			//
			//		If popup widget needs to layout it should
			//		do so when it is made visible, and popup._onShow() is called.

			// Create wrapper if not already there
			var wrapper = this._createWrapper(widget);

			domStyle.set(wrapper, {
				display: "none",
				height: "auto",		// Open may have limited the height to fit in the viewport
				overflow: "visible",
				border: ""			// Open() may have moved border from popup to wrapper.
			});

			// Open() may have moved border from popup to wrapper.  Move it back.
			var node = widget.domNode;
			if("_originalStyle" in node){
				node.style.cssText = node._originalStyle;
			}
		},

		getTopPopup: function(){
			// summary:
			//		Compute the closest ancestor popup that's *not* a child of another popup.
			//		Ex: For a TooltipDialog with a button that spawns a tree of menus, find the popup of the button.
			var stack = this._stack;
			for(var pi = stack.length - 1; pi > 0 && stack[pi].parent === stack[pi - 1].widget; pi--){
				/* do nothing, just trying to get right value for pi */
			}
			return stack[pi];
		},

		open: function(/*__OpenArgs*/ args){
			// summary:
			//		Popup the widget at the specified position
			//
			// example:
			//		opening at the mouse position
			//		|		popup.open({popup: menuWidget, x: evt.pageX, y: evt.pageY});
			//
			// example:
			//		opening the widget as a dropdown
			//		|		popup.open({parent: this, popup: menuWidget, around: this.domNode, onClose: function(){...}});
			//
			//		Note that whatever widget called dijit/popup.open() should also listen to its own _onBlur callback
			//		(fired from _base/focus.js) to know that focus has moved somewhere else and thus the popup should be closed.

			var stack = this._stack,
				widget = args.popup,
				node = widget.domNode,
				orient = args.orient || ["below", "below-alt", "above", "above-alt"],
				ltr = args.parent ? args.parent.isLeftToRight() : domGeometry.isBodyLtr(widget.ownerDocument),
				around = args.around,
				id = (args.around && args.around.id) ? (args.around.id + "_dropdown") : ("popup_" + this._idGen++);

			// If we are opening a new popup that isn't a child of a currently opened popup, then
			// close currently opened popup(s).   This should happen automatically when the old popups
			// gets the _onBlur() event, except that the _onBlur() event isn't reliable on IE, see [22198].
			while(stack.length && (!args.parent || !dom.isDescendant(args.parent.domNode, stack[stack.length - 1].widget.domNode))){
				this.close(stack[stack.length - 1].widget);
			}

			// Get pointer to popup wrapper, and create wrapper if it doesn't exist.  Remove display:none (but keep
			// off screen) so we can do sizing calculations.
			var wrapper = this.moveOffScreen(widget);

			if(widget.startup && !widget._started){
				widget.startup(); // this has to be done after being added to the DOM
			}

			// Limit height to space available in viewport either above or below aroundNode (whichever side has more
			// room), adding scrollbar if necessary. Can't add scrollbar to widget because it may be a <table> (ex:
			// dijit/Menu), so add to wrapper, and then move popup's border to wrapper so scroll bar inside border.
			var maxHeight, popupSize = domGeometry.position(node);
			if("maxHeight" in args && args.maxHeight != -1){
				maxHeight = args.maxHeight || Infinity;	// map 0 --> infinity for back-compat of _HasDropDown.maxHeight
			}else{
				var viewport = Viewport.getEffectiveBox(this.ownerDocument),
					aroundPos = around ? domGeometry.position(around, false) : {y: args.y - (args.padding||0), h: (args.padding||0) * 2};
				maxHeight = Math.floor(Math.max(aroundPos.y, viewport.h - (aroundPos.y + aroundPos.h)));
			}
			if(popupSize.h > maxHeight){
				// Get style of popup's border.  Unfortunately domStyle.get(node, "border") doesn't work on FF or IE,
				// and domStyle.get(node, "borderColor") etc. doesn't work on FF, so need to use fully qualified names.
				var cs = domStyle.getComputedStyle(node),
					borderStyle = cs.borderLeftWidth + " " + cs.borderLeftStyle + " " + cs.borderLeftColor;
				domStyle.set(wrapper, {
					overflowY: "scroll",
					height: maxHeight + "px",
					border: borderStyle	// so scrollbar is inside border
				});
				node._originalStyle = node.style.cssText;
				node.style.border = "none";
			}

			domAttr.set(wrapper, {
				id: id,
				style: {
					zIndex: this._beginZIndex + stack.length
				},
				"class": "dijitPopup " + (widget.baseClass || widget["class"] || "").split(" ")[0] + "Popup",
				dijitPopupParent: args.parent ? args.parent.id : ""
			});

			if(stack.length == 0 && around){
				// First element on stack. Save position of aroundNode and setup listener for changes to that position.
				this._firstAroundNode = around;
				this._firstAroundPosition = domGeometry.position(around, true);
				this._aroundMoveListener = setTimeout(lang.hitch(this, "_repositionAll"), 50);
			}

			if(has("config-bgIframe") && !widget.bgIframe){
				// setting widget.bgIframe triggers cleanup in _WidgetBase.destroyRendering()
				widget.bgIframe = new BackgroundIframe(wrapper);
			}

			// position the wrapper node and make it visible
			var layoutFunc = widget.orient ? lang.hitch(widget, "orient") : null,
				best = around ?
					place.around(wrapper, around, orient, ltr, layoutFunc) :
					place.at(wrapper, args, orient == 'R' ? ['TR', 'BR', 'TL', 'BL'] : ['TL', 'BL', 'TR', 'BR'], args.padding,
						layoutFunc);

			wrapper.style.visibility = "visible";
			node.style.visibility = "visible";	// counteract effects from _HasDropDown

			var handlers = [];

			// provide default escape and tab key handling
			// (this will work for any widget, not just menu)
			handlers.push(on(wrapper, "keydown", lang.hitch(this, function(evt){
				if(evt.keyCode == keys.ESCAPE && args.onCancel){
					evt.stopPropagation();
					evt.preventDefault();
					args.onCancel();
				}else if(evt.keyCode == keys.TAB){
					evt.stopPropagation();
					evt.preventDefault();
					var topPopup = this.getTopPopup();
					if(topPopup && topPopup.onCancel){
						topPopup.onCancel();
					}
				}
			})));

			// watch for cancel/execute events on the popup and notify the caller
			// (for a menu, "execute" means clicking an item)
			if(widget.onCancel && args.onCancel){
				handlers.push(widget.on("cancel", args.onCancel));
			}

			handlers.push(widget.on(widget.onExecute ? "execute" : "change", lang.hitch(this, function(){
				var topPopup = this.getTopPopup();
				if(topPopup && topPopup.onExecute){
					topPopup.onExecute();
				}
			})));

			stack.push({
				widget: widget,
				wrapper: wrapper,
				parent: args.parent,
				onExecute: args.onExecute,
				onCancel: args.onCancel,
				onClose: args.onClose,
				handlers: handlers
			});

			if(widget.onOpen){
				// TODO: in 2.0 standardize onShow() (used by StackContainer) and onOpen() (used here)
				widget.onOpen(best);
			}

			return best;
		},

		close: function(/*Widget?*/ popup){
			// summary:
			//		Close specified popup and any popups that it parented.
			//		If no popup is specified, closes all popups.

			var stack = this._stack;

			// Basically work backwards from the top of the stack closing popups
			// until we hit the specified popup, but IIRC there was some issue where closing
			// a popup would cause others to close too.  Thus if we are trying to close B in [A,B,C]
			// closing C might close B indirectly and then the while() condition will run where stack==[A]...
			// so the while condition is constructed defensively.
			while((popup && array.some(stack, function(elem){
				return elem.widget == popup;
			})) ||
				(!popup && stack.length)){
				var top = stack.pop(),
					widget = top.widget,
					onClose = top.onClose;

				if(widget.onClose){
					// TODO: in 2.0 standardize onHide() (used by StackContainer) and onClose() (used here).
					// Actually, StackContainer also calls onClose(), but to mean that the pane is being deleted
					// (i.e. that the TabContainer's tab's [x] icon was clicked)
					widget.onClose();
				}

				var h;
				while(h = top.handlers.pop()){
					h.remove();
				}

				// Hide the widget and it's wrapper unless it has already been destroyed in above onClose() etc.
				if(widget && widget.domNode){
					this.hide(widget);
				}

				if(onClose){
					onClose();
				}
			}

			if(stack.length == 0 && this._aroundMoveListener){
				clearTimeout(this._aroundMoveListener);
				this._firstAroundNode = this._firstAroundPosition = this._aroundMoveListener = null;
			}
		}
	});

	return (dijit.popup = new PopupManager());
});

},
'dijit/layout/_ContentPaneResizeMixin':function(){
define([
	"dojo/_base/array", // array.filter array.forEach
	"dojo/_base/declare", // declare
	"dojo/dom-class", // domClass.contains domClass.toggle
	"dojo/dom-geometry", // domGeometry.contentBox domGeometry.marginBox
	"dojo/dom-style",
	"dojo/_base/lang", // lang.mixin
	"dojo/query", // query
	"dojo/sniff", // has("ie")
	"../registry", // registry.byId
	"../Viewport",
	"./utils" // marginBox2contextBox
], function(array, declare, domClass, domGeometry, domStyle, lang, query, has,
			registry, Viewport, layoutUtils){

	// module:
	//		dijit/layout/_ContentPaneResizeMixin

	return declare("dijit.layout._ContentPaneResizeMixin", null, {
		// summary:
		//		Resize() functionality of ContentPane.   If there's a single layout widget
		//		child then it will call resize() with the same dimensions as the ContentPane.
		//		Otherwise just calls resize on each child.
		//
		//		Also implements basic startup() functionality, where starting the parent
		//		will start the children

		// doLayout: Boolean
		//		- false - don't adjust size of children
		//		- true - if there is a single visible child widget, set it's size to however big the ContentPane is
		doLayout: true,

		// isLayoutContainer: [protected] Boolean
		//		Indicates that this widget will call resize() on it's child widgets
		//		when they become visible.
		isLayoutContainer: true,

		startup: function(){
			// summary:
			//		See `dijit/layout/_LayoutWidget.startup()` for description.
			//		Although ContentPane doesn't extend _LayoutWidget, it does implement
			//		the same API.

			if(this._started){
				return;
			}

			var parent = this.getParent();
			this._childOfLayoutWidget = parent && parent.isLayoutContainer;

			// I need to call resize() on my child/children (when I become visible), unless
			// I'm the child of a layout widget in which case my parent will call resize() on me and I'll do it then.
			this._needLayout = !this._childOfLayoutWidget;

			this.inherited(arguments);

			if(this._isShown()){
				this._onShow();
			}

			if(!this._childOfLayoutWidget){
				// Since my parent isn't a layout container, and my style *may be* width=height=100%
				// or something similar (either set directly or via a CSS class),
				// monitor when viewport size changes so that I can re-layout.
				// This is more for subclasses of ContentPane than ContentPane itself, although it
				// could be useful for a ContentPane if it has a single child widget inheriting ContentPane's size.
				this.own(Viewport.on("resize", lang.hitch(this, "resize")));
			}
		},

		_checkIfSingleChild: function(){
			// summary:
			//		Test if we have exactly one visible widget as a child,
			//		and if so assume that we are a container for that widget,
			//		and should propagate startup() and resize() calls to it.
			//		Skips over things like data stores since they aren't visible.

			var candidateWidgets = [],
				otherVisibleNodes = false;

			query("> *", this.containerNode).some(function(node){
				var widget = registry.byNode(node);
				if(widget && widget.resize){
					candidateWidgets.push(widget);
				}else if(!/script|link|style/i.test(node.nodeName) && node.offsetHeight){
					otherVisibleNodes = true;
				}
			});

			this._singleChild = candidateWidgets.length == 1 && !otherVisibleNodes ?
				candidateWidgets[0] : null;

			// So we can set overflow: hidden to avoid a safari bug w/scrollbars showing up (#9449)
			domClass.toggle(this.containerNode, this.baseClass + "SingleChild", !!this._singleChild);
		},

		resize: function(changeSize, resultSize){
			// summary:
			//		See `dijit/layout/_LayoutWidget.resize()` for description.
			//		Although ContentPane doesn't extend _LayoutWidget, it does implement
			//		the same API.

			this._resizeCalled = true;

			this._scheduleLayout(changeSize, resultSize);
		},

		_scheduleLayout: function(changeSize, resultSize){
			// summary:
			//		Resize myself, and call resize() on each of my child layout widgets, either now
			//		(if I'm currently visible) or when I become visible
			if(this._isShown()){
				this._layout(changeSize, resultSize);
			}else{
				this._needLayout = true;
				this._changeSize = changeSize;
				this._resultSize = resultSize;
			}
		},

		_layout: function(changeSize, resultSize){
			// summary:
			//		Resize myself according to optional changeSize/resultSize parameters, like a layout widget.
			//		Also, since I am an isLayoutContainer widget, each of my children expects me to
			//		call resize() or layout() on it.
			//
			//		Should be called on initialization and also whenever we get new content
			//		(from an href, or from set('content', ...))... but deferred until
			//		the ContentPane is visible

			delete this._needLayout;

			// For the TabContainer --> BorderContainer --> ContentPane case, _onShow() is
			// never called directly, so resize() is our trigger to do the initial href download (see [20099]).
			// However, don't load href for closed TitlePanes.
			if(!this._wasShown && this.open !== false){
				this._onShow();
			}

			// Set margin box size, unless it wasn't specified, in which case use current size.
			if(changeSize){
				domGeometry.setMarginBox(this.domNode, changeSize);
			}

			// Compute content box size of containerNode in case we [later] need to size our single child.
			var cn = this.containerNode;
			if(cn === this.domNode){
				// If changeSize or resultSize was passed to this method and this.containerNode ==
				// this.domNode then we can compute the content-box size without querying the node,
				// which is more reliable (similar to LayoutWidget.resize) (see for example #9449).
				var mb = resultSize || {};
				lang.mixin(mb, changeSize || {}); // changeSize overrides resultSize
				if(!("h" in mb) || !("w" in mb)){
					mb = lang.mixin(domGeometry.getMarginBox(cn), mb); // just use domGeometry.setMarginBox() to fill in missing values
				}
				this._contentBox = layoutUtils.marginBox2contentBox(cn, mb);
			}else{
				this._contentBox = domGeometry.getContentBox(cn);
			}

			this._layoutChildren();
		},

		_layoutChildren: function(){
			// Call _checkIfSingleChild() again in case app has manually mucked w/the content
			// of the ContentPane (rather than changing it through the set("content", ...) API.
			if(this.doLayout){
				this._checkIfSingleChild();
			}

			if(this._singleChild && this._singleChild.resize){
				var cb = this._contentBox || domGeometry.getContentBox(this.containerNode);

				// note: if widget has padding this._contentBox will have l and t set,
				// but don't pass them to resize() or it will doubly-offset the child
				this._singleChild.resize({w: cb.w, h: cb.h});
			}else{
				// All my child widgets are independently sized (rather than matching my size),
				// but I still need to call resize() on each child to make it layout.
				var children = this.getChildren(),
					widget,
					i = 0;
				while(widget = children[i++]){
					if(widget.resize){
						widget.resize();
					}
				}
			}
		},

		_isShown: function(){
			// summary:
			//		Returns true if the content is currently shown.
			// description:
			//		If I am a child of a layout widget then it actually returns true if I've ever been visible,
			//		not whether I'm currently visible, since that's much faster than tracing up the DOM/widget
			//		tree every call, and at least solves the performance problem on page load by deferring loading
			//		hidden ContentPanes until they are first shown

			if(this._childOfLayoutWidget){
				// If we are TitlePane, etc - we return that only *IF* we've been resized
				if(this._resizeCalled && "open" in this){
					return this.open;
				}
				return this._resizeCalled;
			}else if("open" in this){
				return this.open;		// for TitlePane, etc.
			}else{
				var node = this.domNode, parent = this.domNode.parentNode;
				return (node.style.display != 'none') && (node.style.visibility != 'hidden') && !domClass.contains(node, "dijitHidden") &&
					parent && parent.style && (parent.style.display != 'none');
			}
		},

		_onShow: function(){
			// summary:
			//		Called when the ContentPane is made visible
			// description:
			//		For a plain ContentPane, this is called on initialization, from startup().
			//		If the ContentPane is a hidden pane of a TabContainer etc., then it's
			//		called whenever the pane is made visible.
			//
			//		Does layout/resize of child widget(s)

			// Need to keep track of whether ContentPane has been shown (which is different than
			// whether or not it's currently visible).
			this._wasShown = true;

			if(this._needLayout){
				// If a layout has been scheduled for when we become visible, do it now
				this._layout(this._changeSize, this._resultSize);
			}

			this.inherited(arguments);
		}
	});
});

},
'dijit/CalendarLite':function(){
define([
	"dojo/_base/array", // array.forEach array.map
	"dojo/_base/declare", // declare
	"dojo/cldr/supplemental", // cldrSupplemental.getFirstDayOfWeek
	"dojo/date", // date
	"dojo/date/locale",
	"dojo/date/stamp", // stamp.fromISOString
	"dojo/dom", // dom.setSelectable
	"dojo/dom-class", // domClass.contains
	"dojo/_base/lang", // lang.getObject, lang.hitch
	"dojo/on",
	"dojo/sniff", // has("ie") has("webkit")
	"dojo/string", // string.substitute
	"./_WidgetBase",
	"./_TemplatedMixin",
	"dojo/text!./templates/Calendar.html",
	"./a11yclick",	// not used directly, but template has ondijitclick in it
	"./hccss"    // not used directly, but sets CSS class on <body>
], function(array, declare, cldrSupplemental, date, locale, stamp, dom, domClass, lang, on, has, string, _WidgetBase, _TemplatedMixin, template){


	// module:
	//		dijit/CalendarLite

	var CalendarLite = declare("dijit.CalendarLite", [_WidgetBase, _TemplatedMixin], {
		// summary:
		//		Lightweight version of Calendar widget aimed towards mobile use
		//
		// description:
		//		A simple GUI for choosing a date in the context of a monthly calendar.
		//		This widget can't be used in a form because it doesn't serialize the date to an
		//		`<input>` field.  For a form element, use dijit/form/DateTextBox instead.
		//
		//		Note that the parser takes all dates attributes passed in the
		//		[RFC 3339 format](http://www.faqs.org/rfcs/rfc3339.html), e.g. `2005-06-30T08:05:00-07:00`
		//		so that they are serializable and locale-independent.
		//
		//		Also note that this widget isn't keyboard accessible; use dijit.Calendar for that
		// example:
		//	|	var calendar = new dijit.CalendarLite({}, dojo.byId("calendarNode"));
		//
		// example:
		//	|	<div data-dojo-type="dijit/CalendarLite"></div>

		// Template for main calendar
		templateString: template,

		// Template for cell for a day of the week (ex: M)
		dowTemplateString: '<th class="dijitReset dijitCalendarDayLabelTemplate" role="columnheader" scope="col"><span class="dijitCalendarDayLabel">${d}</span></th>',

		// Templates for a single date (ex: 13), and for a row for a week (ex: 20 21 22 23 24 25 26)
		dateTemplateString: '<td class="dijitReset" role="gridcell" data-dojo-attach-point="dateCells"><span class="dijitCalendarDateLabel" data-dojo-attach-point="dateLabels"></span></td>',
		weekTemplateString: '<tr class="dijitReset dijitCalendarWeekTemplate" role="row">${d}${d}${d}${d}${d}${d}${d}</tr>',

		// value: Date
		//		The currently selected Date, initially set to invalid date to indicate no selection.
		value: new Date(""),
		// TODO: for 2.0 make this a string (ISO format) rather than a Date

		// datePackage: String
		//		JavaScript namespace to find calendar routines.	 If unspecified, uses Gregorian calendar routines
		//		at dojo/date and dojo/date/locale.
		datePackage: "",
		//		TODO: for 2.0, replace datePackage with dateModule and dateLocalModule attributes specifying MIDs,
		//		or alternately just get rid of this completely and tell user to use module ID remapping
		//		via require

		// dayWidth: String
		//		How to represent the days of the week in the calendar header. See locale
		dayWidth: "narrow",

		// tabIndex: String
		//		Order fields are traversed when user hits the tab key
		tabIndex: "0",

		// currentFocus: Date
		//		Date object containing the currently focused date, or the date which would be focused
		//		if the calendar itself was focused.   Also indicates which year and month to display,
		//		i.e. the current "page" the calendar is on.
		currentFocus: new Date(),

		// Put the summary to the node with role=grid
		_setSummaryAttr: "gridNode",

		baseClass: "dijitCalendar",

		_isValidDate: function(/*Date*/ value){
			// summary:
			//		Runs various tests on the value, checking that it's a valid date, rather
			//		than blank or NaN.
			// tags:
			//		private
			return value && !isNaN(value) && typeof value == "object" &&
				value.toString() != this.constructor.prototype.value.toString();
		},

		_getValueAttr: function(){
			// summary:
			//		Support get('value')

			// this.value is set to 1AM, but return midnight, local time for back-compat
			var storedVal = this._get("value");
			if(storedVal && !isNaN(storedVal)){
				var value = new this.dateClassObj(storedVal);
				value.setHours(0, 0, 0, 0);

				// If daylight savings pushes midnight to the previous date, fix the Date
				// object to point at 1am so it will represent the correct day. See #9366
				if(value.getDate() < storedVal.getDate()){
					value = this.dateModule.add(value, "hour", 1);
				}
				return value;
			}else{
				return null;
			}
		},

		_setValueAttr: function(/*Date|Number*/ value, /*Boolean*/ priorityChange){
			// summary:
			//		Support set("value", ...)
			// description:
			//		Set the current date and update the UI.  If the date is disabled, the value will
			//		not change, but the display will change to the corresponding month.
			// value:
			//		Either a Date or the number of seconds since 1970.
			// tags:
			//		protected
			if(typeof value == "string"){
				value = stamp.fromISOString(value);
			}
			value = this._patchDate(value);

			if(this._isValidDate(value) && !this.isDisabledDate(value, this.lang)){
				this._set("value", value);

				// Set focus cell to the new value.   Arguably this should only happen when there isn't a current
				// focus point.   This will also repopulate the grid to new month/year if necessary.
				this.set("currentFocus", value);

				// Mark the selected date
				this._markSelectedDates([value]);

				if(this._created && (priorityChange || typeof priorityChange == "undefined")){
					this.onChange(this.get('value'));
				}
			}else{
				// clear value, and mark all dates as unselected
				this._set("value", null);
				this._markSelectedDates([]);
			}
		},

		_patchDate: function(/*Date|Number*/ value){
			// summary:
			//		Convert Number into Date, or copy Date object.   Then, round to nearest day,
			//		setting to 1am to avoid issues when DST shift occurs at midnight, see #8521, #9366)
			if(value){
				value = new this.dateClassObj(value);
				value.setHours(1, 0, 0, 0);
			}
			return value;
		},

		_setText: function(node, text){
			// summary:
			//		This just sets the content of node to the specified text.
			//		Can't do "node.innerHTML=text" because of an IE bug w/tables, see #3434.
			// tags:
			//		private
			while(node.firstChild){
				node.removeChild(node.firstChild);
			}
			node.appendChild(node.ownerDocument.createTextNode(text));
		},

		_populateGrid: function(){
			// summary:
			//		Fills in the calendar grid with each day (1-31).
			//		Call this on creation, when moving to a new month.
			// tags:
			//		private

			var month = new this.dateClassObj(this.currentFocus);
			month.setDate(1);

			var firstDay = month.getDay(),
				daysInMonth = this.dateModule.getDaysInMonth(month),
				daysInPreviousMonth = this.dateModule.getDaysInMonth(this.dateModule.add(month, "month", -1)),
				today = new this.dateClassObj(),
				dayOffset = cldrSupplemental.getFirstDayOfWeek(this.lang);
			if(dayOffset > firstDay){
				dayOffset -= 7;
			}

			// If they didn't provide a summary, change the default summary to match with the new month
			if(!this.summary){
				var monthNames = this.dateLocaleModule.getNames('months', 'wide', 'standAlone', this.lang, month)
				this.gridNode.setAttribute("summary", monthNames[month.getMonth()]);
			}

			// Mapping from date (as specified by number returned from Date.valueOf()) to corresponding <td>
			this._date2cell = {};

			// Iterate through dates in the calendar and fill in date numbers and style info
			array.forEach(this.dateCells, function(template, idx){
				var i = idx + dayOffset;
				var date = new this.dateClassObj(month),
					number, clazz = "dijitCalendar", adj = 0;

				if(i < firstDay){
					number = daysInPreviousMonth - firstDay + i + 1;
					adj = -1;
					clazz += "Previous";
				}else if(i >= (firstDay + daysInMonth)){
					number = i - firstDay - daysInMonth + 1;
					adj = 1;
					clazz += "Next";
				}else{
					number = i - firstDay + 1;
					clazz += "Current";
				}

				if(adj){
					date = this.dateModule.add(date, "month", adj);
				}
				date.setDate(number);

				if(!this.dateModule.compare(date, today, "date")){
					clazz = "dijitCalendarCurrentDate " + clazz;
				}

				if(this.isDisabledDate(date, this.lang)){
					clazz = "dijitCalendarDisabledDate " + clazz;
					template.setAttribute("aria-disabled", "true");
				}else{
					clazz = "dijitCalendarEnabledDate " + clazz;
					template.removeAttribute("aria-disabled");
					template.setAttribute("aria-selected", "false");
				}

				var clazz2 = this.getClassForDate(date, this.lang);
				if(clazz2){
					clazz = clazz2 + " " + clazz;
				}

				template.className = clazz + "Month dijitCalendarDateTemplate";

				// Each cell has an associated integer value representing it's date
				var dateVal = date.valueOf();
				this._date2cell[dateVal] = template;
				template.dijitDateValue = dateVal;

				// Set Date string (ex: "13").
				this._setText(this.dateLabels[idx], date.getDateLocalized ? date.getDateLocalized(this.lang) : date.getDate());
			}, this);
		},

		_populateControls: function(){
			// summary:
			//		Fill in localized month, and prev/current/next years
			// tags:
			//		protected

			var month = new this.dateClassObj(this.currentFocus);
			month.setDate(1);

			// set name of this month
			this.monthWidget.set("month", month);

			var y = month.getFullYear() - 1;
			var d = new this.dateClassObj();
			array.forEach(["previous", "current", "next"], function(name){
				d.setFullYear(y++);
				this._setText(this[name + "YearLabelNode"],
					this.dateLocaleModule.format(d, {selector: 'year', locale: this.lang}));
			}, this);
		},

		goToToday: function(){
			// summary:
			//		Sets calendar's value to today's date
			this.set('value', new this.dateClassObj());
		},

		constructor: function(params /*===== , srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified, replace srcNodeRef with my generated DOM tree

			this.dateModule = params.datePackage ? lang.getObject(params.datePackage, false) : date;
			this.dateClassObj = this.dateModule.Date || Date;
			this.dateLocaleModule = params.datePackage ? lang.getObject(params.datePackage + ".locale", false) : locale;
		},

		_createMonthWidget: function(){
			// summary:
			//		Creates the drop down button that displays the current month and lets user pick a new one

			return CalendarLite._MonthWidget({
				id: this.id + "_mddb",
				lang: this.lang,
				dateLocaleModule: this.dateLocaleModule
			}, this.monthNode);
		},

		buildRendering: function(){
			// Markup for days of the week (referenced from template)
			var d = this.dowTemplateString,
				dayNames = this.dateLocaleModule.getNames('days', this.dayWidth, 'standAlone', this.lang),
				dayOffset = cldrSupplemental.getFirstDayOfWeek(this.lang);
			this.dayCellsHtml = string.substitute([d, d, d, d, d, d, d].join(""), {d: ""}, function(){
				return dayNames[dayOffset++ % 7];
			});

			// Markup for dates of the month (referenced from template), but without numbers filled in
			var r = string.substitute(this.weekTemplateString, {d: this.dateTemplateString});
			this.dateRowsHtml = [r, r, r, r, r, r].join("");

			// Instantiate from template.
			// dateCells and dateLabels arrays filled when _Templated parses my template.
			this.dateCells = [];
			this.dateLabels = [];
			this.inherited(arguments);

			dom.setSelectable(this.domNode, false);

			var dateObj = new this.dateClassObj(this.currentFocus);

			this.monthWidget = this._createMonthWidget();

			this.set('currentFocus', dateObj, false);	// draw the grid to the month specified by currentFocus
		},

		postCreate: function(){
			this.inherited(arguments);
			this._connectControls();
		},

		_connectControls: function(){
			// summary:
			//		Set up connects for increment/decrement of months/years
			// tags:
			//		protected

			var connect = lang.hitch(this, function(nodeProp, part, amount){
				return on(this[nodeProp], "click", lang.hitch(this, function(){
					this._setCurrentFocusAttr(this.dateModule.add(this.currentFocus, part, amount));
				}));
			});

			this.own(
				connect("incrementMonth", "month", 1),
				connect("decrementMonth", "month", -1),
				connect("nextYearLabelNode", "year", 1),
				connect("previousYearLabelNode", "year", -1)
			);
		},

		_setCurrentFocusAttr: function(/*Date*/ date, /*Boolean*/ forceFocus){
			// summary:
			//		If the calendar currently has focus, then focuses specified date,
			//		changing the currently displayed month/year if necessary.
			//		If the calendar doesn't have focus, updates currently
			//		displayed month/year, and sets the cell that will get focus
			//		when Calendar is focused.
			// forceFocus:
			//		If true, will focus() the cell even if calendar itself doesn't have focus

			var oldFocus = this.currentFocus,
				oldCell = this._getNodeByDate(oldFocus);
			date = this._patchDate(date);

			this._set("currentFocus", date);

			// If the focus is on a different month than the current calendar month, switch the displayed month.
			// Also will populate the grid initially, on Calendar creation.
			if(!this._date2cell || this.dateModule.difference(oldFocus, date, "month") != 0){
				this._populateGrid();
				this._populateControls();
				this._markSelectedDates([this.value]);
			}

			// set tabIndex=0 on new cell, and focus it (but only if Calendar itself is focused)
			var newCell = this._getNodeByDate(date);
			newCell.setAttribute("tabIndex", this.tabIndex);
			if(this.focused || forceFocus){
				newCell.focus();
			}

			// set tabIndex=-1 on old focusable cell
			if(oldCell && oldCell != newCell){
				if(has("webkit")){    // see #11064 about webkit bug
					oldCell.setAttribute("tabIndex", "-1");
				}else{
					oldCell.removeAttribute("tabIndex");
				}
			}
		},

		focus: function(){
			// summary:
			//		Focus the calendar by focusing one of the calendar cells
			this._setCurrentFocusAttr(this.currentFocus, true);
		},

		_onDayClick: function(/*Event*/ evt){
			// summary:
			//		Handler for day clicks, selects the date if appropriate
			// tags:
			//		protected
			evt.stopPropagation();
			evt.preventDefault();
			for(var node = evt.target; node && !node.dijitDateValue; node = node.parentNode){
				;
			}
			if(node && !domClass.contains(node, "dijitCalendarDisabledDate")){
				this.set('value', node.dijitDateValue);
			}
		},

		_getNodeByDate: function(/*Date*/ value){
			// summary:
			//		Returns the cell corresponding to the date, or null if the date is not within the currently
			//		displayed month.
			value = this._patchDate(value);
			return value && this._date2cell ? this._date2cell[value.valueOf()] : null;
		},

		_markSelectedDates: function(/*Date[]*/ dates){
			// summary:
			//		Marks the specified cells as selected, and clears cells previously marked as selected.
			//		For CalendarLite at most one cell is selected at any point, but this allows an array
			//		for easy subclassing.

			// Function to mark a cell as selected or unselected
			function mark(/*Boolean*/ selected, /*DomNode*/ cell){
				domClass.toggle(cell, "dijitCalendarSelectedDate", selected);
				cell.setAttribute("aria-selected", selected ? "true" : "false");
			}

			// Clear previously selected cells.
			array.forEach(this._selectedCells || [], lang.partial(mark, false));

			// Mark newly selected cells.  Ignore dates outside the currently displayed month.
			this._selectedCells = array.filter(array.map(dates, this._getNodeByDate, this), function(n){
				return n;
			});
			array.forEach(this._selectedCells, lang.partial(mark, true));
		},

		onChange: function(/*Date*/ /*===== date =====*/){
			// summary:
			//		Called only when the selected date has changed
		},

		isDisabledDate: function(/*===== dateObject, locale =====*/){
			// summary:
			//		May be overridden to disable certain dates in the calendar e.g. `isDisabledDate=dojo.date.locale.isWeekend`
			// dateObject: Date
			// locale: String?
			// tags:
			//		extension
			/*=====
			 return false; // Boolean
			 =====*/
		},

		getClassForDate: function(/*===== dateObject, locale =====*/){
			// summary:
			//		May be overridden to return CSS classes to associate with the date entry for the given dateObject,
			//		for example to indicate a holiday in specified locale.
			// dateObject: Date
			// locale: String?
			// tags:
			//		extension

			/*=====
			 return ""; // String
			 =====*/
		}
	});

	CalendarLite._MonthWidget = declare("dijit.CalendarLite._MonthWidget", _WidgetBase, {
		// summary:
		//		Displays name of current month padded to the width of the month
		//		w/the longest name, so that changing months doesn't change width.
		//
		//		Create as:
		// |	new Calendar._MonthWidget({
		// |			lang: ...,
		// |			dateLocaleModule: ...
		// |		})

		_setMonthAttr: function(month){
			// summary:
			//		Set the current month to display as a label
			var monthNames = this.dateLocaleModule.getNames('months', 'wide', 'standAlone', this.lang, month),
				spacer =
					(has("ie") == 6 ? "" : "<div class='dijitSpacer'>" +
						array.map(monthNames,function(s){
							return "<div>" + s + "</div>";
						}).join("") + "</div>");

			// Set name of current month and also fill in spacer element with all the month names
			// (invisible) so that the maximum width will affect layout.   But not on IE6 because then
			// the center <TH> overlaps the right <TH> (due to a browser bug).
			this.domNode.innerHTML =
				spacer +
					"<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>" +
					monthNames[month.getMonth()] + "</div>";
		}
	});

	return CalendarLite;
});

},
'dijit/_WidgetBase':function(){
define([
	"require", // require.toUrl
	"dojo/_base/array", // array.forEach array.map
	"dojo/aspect",
	"dojo/_base/config", // config.blankGif
	"dojo/_base/connect", // connect.connect
	"dojo/_base/declare", // declare
	"dojo/dom", // dom.byId
	"dojo/dom-attr", // domAttr.set domAttr.remove
	"dojo/dom-class", // domClass.add domClass.replace
	"dojo/dom-construct", // domConstruct.destroy domConstruct.place
	"dojo/dom-geometry", // isBodyLtr
	"dojo/dom-style", // domStyle.set, domStyle.get
	"dojo/has",
	"dojo/_base/kernel",
	"dojo/_base/lang", // mixin(), isArray(), etc.
	"dojo/on",
	"dojo/ready",
	"dojo/Stateful", // Stateful
	"dojo/topic",
	"dojo/_base/window", // win.body()
	"./Destroyable",
	"dojo/has!dojo-bidi?./_BidiMixin",
	"./registry"    // registry.getUniqueId(), registry.findWidgets()
], function(require, array, aspect, config, connect, declare,
			dom, domAttr, domClass, domConstruct, domGeometry, domStyle, has, kernel,
			lang, on, ready, Stateful, topic, win, Destroyable, _BidiMixin, registry){

	// module:
	//		dijit/_WidgetBase

	// Flag to make dijit load modules the app didn't explicitly request, for backwards compatibility
	has.add("dijit-legacy-requires", !kernel.isAsync);

	// Flag to enable support for textdir attribute
	has.add("dojo-bidi", false);


	// For back-compat, remove in 2.0.
	if(has("dijit-legacy-requires")){
		ready(0, function(){
			var requires = ["dijit/_base/manager"];
			require(requires);	// use indirection so modules not rolled into a build
		});
	}

	// Nested hash listing attributes for each tag, all strings in lowercase.
	// ex: {"div": {"style": true, "tabindex" true}, "form": { ...
	var tagAttrs = {};

	function getAttrs(obj){
		var ret = {};
		for(var attr in obj){
			ret[attr.toLowerCase()] = true;
		}
		return ret;
	}

	function nonEmptyAttrToDom(attr){
		// summary:
		//		Returns a setter function that copies the attribute to this.domNode,
		//		or removes the attribute from this.domNode, depending on whether the
		//		value is defined or not.
		return function(val){
			domAttr[val ? "set" : "remove"](this.domNode, attr, val);
			this._set(attr, val);
		};
	}

	var _WidgetBase = declare("dijit._WidgetBase", [Stateful, Destroyable], {
		// summary:
		//		Future base class for all Dijit widgets.
		// description:
		//		Future base class for all Dijit widgets.
		//		_Widget extends this class adding support for various features needed by desktop.
		//
		//		Provides stubs for widget lifecycle methods for subclasses to extend, like postMixInProperties(), buildRendering(),
		//		postCreate(), startup(), and destroy(), and also public API methods like set(), get(), and watch().
		//
		//		Widgets can provide custom setters/getters for widget attributes, which are called automatically by set(name, value).
		//		For an attribute XXX, define methods _setXXXAttr() and/or _getXXXAttr().
		//
		//		_setXXXAttr can also be a string/hash/array mapping from a widget attribute XXX to the widget's DOMNodes:
		//
		//		- DOM node attribute
		// |		_setFocusAttr: {node: "focusNode", type: "attribute"}
		// |		_setFocusAttr: "focusNode"	(shorthand)
		// |		_setFocusAttr: ""		(shorthand, maps to this.domNode)
		//		Maps this.focus to this.focusNode.focus, or (last example) this.domNode.focus
		//
		//		- DOM node innerHTML
		//	|		_setTitleAttr: { node: "titleNode", type: "innerHTML" }
		//		Maps this.title to this.titleNode.innerHTML
		//
		//		- DOM node innerText
		//	|		_setTitleAttr: { node: "titleNode", type: "innerText" }
		//		Maps this.title to this.titleNode.innerText
		//
		//		- DOM node CSS class
		// |		_setMyClassAttr: { node: "domNode", type: "class" }
		//		Maps this.myClass to this.domNode.className
		//
		//		If the value of _setXXXAttr is an array, then each element in the array matches one of the
		//		formats of the above list.
		//
		//		If the custom setter is null, no action is performed other than saving the new value
		//		in the widget (in this).
		//
		//		If no custom setter is defined for an attribute, then it will be copied
		//		to this.focusNode (if the widget defines a focusNode), or this.domNode otherwise.
		//		That's only done though for attributes that match DOMNode attributes (title,
		//		alt, aria-labelledby, etc.)

		// id: [const] String
		//		A unique, opaque ID string that can be assigned by users or by the
		//		system. If the developer passes an ID which is known not to be
		//		unique, the specified ID is ignored and the system-generated ID is
		//		used instead.
		id: "",
		_setIdAttr: "domNode", // to copy to this.domNode even for auto-generated id's

		// lang: [const] String
		//		Rarely used.  Overrides the default Dojo locale used to render this widget,
		//		as defined by the [HTML LANG](http://www.w3.org/TR/html401/struct/dirlang.html#adef-lang) attribute.
		//		Value must be among the list of locales specified during by the Dojo bootstrap,
		//		formatted according to [RFC 3066](http://www.ietf.org/rfc/rfc3066.txt) (like en-us).
		lang: "",
		// set on domNode even when there's a focus node.	but don't set lang="", since that's invalid.
		_setLangAttr: nonEmptyAttrToDom("lang"),

		// dir: [const] String
		//		Bi-directional support, as defined by the [HTML DIR](http://www.w3.org/TR/html401/struct/dirlang.html#adef-dir)
		//		attribute. Either left-to-right "ltr" or right-to-left "rtl".  If undefined, widgets renders in page's
		//		default direction.
		dir: "",
		// set on domNode even when there's a focus node.	but don't set dir="", since that's invalid.
		_setDirAttr: nonEmptyAttrToDom("dir"), // to set on domNode even when there's a focus node

		// class: String
		//		HTML class attribute
		"class": "",
		_setClassAttr: { node: "domNode", type: "class" },

		// style: String||Object
		//		HTML style attributes as cssText string or name/value hash
		style: "",

		// title: String
		//		HTML title attribute.
		//
		//		For form widgets this specifies a tooltip to display when hovering over
		//		the widget (just like the native HTML title attribute).
		//
		//		For TitlePane or for when this widget is a child of a TabContainer, AccordionContainer,
		//		etc., it's used to specify the tab label, accordion pane title, etc.  In this case it's
		//		interpreted as HTML.
		title: "",

		// tooltip: String
		//		When this widget's title attribute is used to for a tab label, accordion pane title, etc.,
		//		this specifies the tooltip to appear when the mouse is hovered over that text.
		tooltip: "",

		// baseClass: [protected] String
		//		Root CSS class of the widget (ex: dijitTextBox), used to construct CSS classes to indicate
		//		widget state.
		baseClass: "",

		// srcNodeRef: [readonly] DomNode
		//		pointer to original DOM node
		srcNodeRef: null,

		// domNode: [readonly] DomNode
		//		This is our visible representation of the widget! Other DOM
		//		Nodes may by assigned to other properties, usually through the
		//		template system's data-dojo-attach-point syntax, but the domNode
		//		property is the canonical "top level" node in widget UI.
		domNode: null,

		// containerNode: [readonly] DomNode
		//		Designates where children of the source DOM node will be placed.
		//		"Children" in this case refers to both DOM nodes and widgets.
		//		For example, for myWidget:
		//
		//		|	<div data-dojo-type=myWidget>
		//		|		<b> here's a plain DOM node
		//		|		<span data-dojo-type=subWidget>and a widget</span>
		//		|		<i> and another plain DOM node </i>
		//		|	</div>
		//
		//		containerNode would point to:
		//
		//		|		<b> here's a plain DOM node
		//		|		<span data-dojo-type=subWidget>and a widget</span>
		//		|		<i> and another plain DOM node </i>
		//
		//		In templated widgets, "containerNode" is set via a
		//		data-dojo-attach-point assignment.
		//
		//		containerNode must be defined for any widget that accepts innerHTML
		//		(like ContentPane or BorderContainer or even Button), and conversely
		//		is null for widgets that don't, like TextBox.
		containerNode: null,

		// ownerDocument: [const] Document?
		//		The document this widget belongs to.  If not specified to constructor, will default to
		//		srcNodeRef.ownerDocument, or if no sourceRef specified, then to the document global
		ownerDocument: null,
		_setOwnerDocumentAttr: function(val){
			// this setter is merely to avoid automatically trying to set this.domNode.ownerDocument
			this._set("ownerDocument", val);
		},

		/*=====
		// _started: [readonly] Boolean
		//		startup() has completed.
		_started: false,
		=====*/

		// attributeMap: [protected] Object
		//		Deprecated.	Instead of attributeMap, widget should have a _setXXXAttr attribute
		//		for each XXX attribute to be mapped to the DOM.
		//
		//		attributeMap sets up a "binding" between attributes (aka properties)
		//		of the widget and the widget's DOM.
		//		Changes to widget attributes listed in attributeMap will be
		//		reflected into the DOM.
		//
		//		For example, calling set('title', 'hello')
		//		on a TitlePane will automatically cause the TitlePane's DOM to update
		//		with the new title.
		//
		//		attributeMap is a hash where the key is an attribute of the widget,
		//		and the value reflects a binding to a:
		//
		//		- DOM node attribute
		// |		focus: {node: "focusNode", type: "attribute"}
		//		Maps this.focus to this.focusNode.focus
		//
		//		- DOM node innerHTML
		//	|		title: { node: "titleNode", type: "innerHTML" }
		//		Maps this.title to this.titleNode.innerHTML
		//
		//		- DOM node innerText
		//	|		title: { node: "titleNode", type: "innerText" }
		//		Maps this.title to this.titleNode.innerText
		//
		//		- DOM node CSS class
		// |		myClass: { node: "domNode", type: "class" }
		//		Maps this.myClass to this.domNode.className
		//
		//		If the value is an array, then each element in the array matches one of the
		//		formats of the above list.
		//
		//		There are also some shorthands for backwards compatibility:
		//
		//		- string --> { node: string, type: "attribute" }, for example:
		//
		//	|	"focusNode" ---> { node: "focusNode", type: "attribute" }
		//
		//		- "" --> { node: "domNode", type: "attribute" }
		attributeMap: {},

		// _blankGif: [protected] String
		//		Path to a blank 1x1 image.
		//		Used by `<img>` nodes in templates that really get their image via CSS background-image.
		_blankGif: config.blankGif || require.toUrl("dojo/resources/blank.gif"),

		//////////// INITIALIZATION METHODS ///////////////////////////////////////

		/*=====
		constructor: function(params, srcNodeRef){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified:
			//
			//		- use srcNodeRef.innerHTML as my contents
			//		- if this is a behavioral widget then apply behavior to that srcNodeRef
			//		- otherwise, replace srcNodeRef with my generated DOM tree
		},
		=====*/

		_introspect: function(){
			// summary:
			//		Collect metadata about this widget (only once per class, not once per instance):
			//
			//			- list of attributes with custom setters, storing in this.constructor._setterAttrs
			//			- generate this.constructor._onMap, mapping names like "mousedown" to functions like onMouseDown

			var ctor = this.constructor;
			if(!ctor._setterAttrs){
				var proto = ctor.prototype,
					attrs = ctor._setterAttrs = [], // attributes with custom setters
					onMap = (ctor._onMap = {});

				// Items in this.attributeMap are like custom setters.  For back-compat, remove for 2.0.
				for(var name in proto.attributeMap){
					attrs.push(name);
				}

				// Loop over widget properties, collecting properties with custom setters and filling in ctor._onMap.
				for(name in proto){
					if(/^on/.test(name)){
						onMap[name.substring(2).toLowerCase()] = name;
					}

					if(/^_set[A-Z](.*)Attr$/.test(name)){
						name = name.charAt(4).toLowerCase() + name.substr(5, name.length - 9);
						if(!proto.attributeMap || !(name in proto.attributeMap)){
							attrs.push(name);
						}
					}
				}

				// Note: this isn't picking up info on properties like aria-label and role, that don't have custom setters
				// but that set() maps to attributes on this.domNode or this.focusNode
			}
		},

		postscript: function(/*Object?*/params, /*DomNode|String*/srcNodeRef){
			// summary:
			//		Kicks off widget instantiation.  See create() for details.
			// tags:
			//		private

			// Note that we skip calling this.inherited(), i.e. dojo/Stateful::postscript(), because 1.x widgets don't
			// expect their custom setters to get called until after buildRendering().  Consider changing for 2.0.

			this.create(params, srcNodeRef);
		},

		create: function(params, srcNodeRef){
			// summary:
			//		Kick off the life-cycle of a widget
			// description:
			//		Create calls a number of widget methods (postMixInProperties, buildRendering, postCreate,
			//		etc.), some of which of you'll want to override. See http://dojotoolkit.org/reference-guide/dijit/_WidgetBase.html
			//		for a discussion of the widget creation lifecycle.
			//
			//		Of course, adventurous developers could override create entirely, but this should
			//		only be done as a last resort.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified:
			//
			//		- use srcNodeRef.innerHTML as my contents
			//		- if this is a behavioral widget then apply behavior to that srcNodeRef
			//		- otherwise, replace srcNodeRef with my generated DOM tree
			// tags:
			//		private

			// First time widget is instantiated, scan prototype to figure out info about custom setters etc.
			this._introspect();

			// store pointer to original DOM tree
			this.srcNodeRef = dom.byId(srcNodeRef);

			// No longer used, remove for 2.0.
			this._connects = [];
			this._supportingWidgets = [];

			// this is here for back-compat, remove in 2.0 (but check NodeList-instantiate.html test)
			if(this.srcNodeRef && (typeof this.srcNodeRef.id == "string")){
				this.id = this.srcNodeRef.id;
			}

			// mix in our passed parameters
			if(params){
				this.params = params;
				lang.mixin(this, params);
			}
			this.postMixInProperties();

			// Generate an id for the widget if one wasn't specified, or it was specified as id: undefined.
			// Do this before buildRendering() because it might expect the id to be there.
			if(!this.id){
				this.id = registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
				if(this.params){
					// if params contains {id: undefined}, prevent _applyAttributes() from processing it
					delete this.params.id;
				}
			}

			// The document and <body> node this widget is associated with
			this.ownerDocument = this.ownerDocument || (this.srcNodeRef ? this.srcNodeRef.ownerDocument : document);
			this.ownerDocumentBody = win.body(this.ownerDocument);

			registry.add(this);

			this.buildRendering();

			var deleteSrcNodeRef;

			if(this.domNode){
				// Copy attributes listed in attributeMap into the [newly created] DOM for the widget.
				// Also calls custom setters for all attributes with custom setters.
				this._applyAttributes();

				// If srcNodeRef was specified, then swap out original srcNode for this widget's DOM tree.
				// For 2.0, move this after postCreate().  postCreate() shouldn't depend on the
				// widget being attached to the DOM since it isn't when a widget is created programmatically like
				// new MyWidget({}).	See #11635.
				var source = this.srcNodeRef;
				if(source && source.parentNode && this.domNode !== source){
					source.parentNode.replaceChild(this.domNode, source);
					deleteSrcNodeRef = true;
				}

				// Note: for 2.0 may want to rename widgetId to dojo._scopeName + "_widgetId",
				// assuming that dojo._scopeName even exists in 2.0
				this.domNode.setAttribute("widgetId", this.id);
			}
			this.postCreate();

			// If srcNodeRef has been processed and removed from the DOM (e.g. TemplatedWidget) then delete it to allow GC.
			// I think for back-compatibility it isn't deleting srcNodeRef until after postCreate() has run.
			if(deleteSrcNodeRef){
				delete this.srcNodeRef;
			}

			this._created = true;
		},

		_applyAttributes: function(){
			// summary:
			//		Step during widget creation to copy  widget attributes to the
			//		DOM according to attributeMap and _setXXXAttr objects, and also to call
			//		custom _setXXXAttr() methods.
			//
			//		Skips over blank/false attribute values, unless they were explicitly specified
			//		as parameters to the widget, since those are the default anyway,
			//		and setting tabIndex="" is different than not setting tabIndex at all.
			//
			//		For backwards-compatibility reasons attributeMap overrides _setXXXAttr when
			//		_setXXXAttr is a hash/string/array, but _setXXXAttr as a functions override attributeMap.
			// tags:
			//		private

			// Call this.set() for each property that was either specified as parameter to constructor,
			// or is in the list found above.	For correlated properties like value and displayedValue, the one
			// specified as a parameter should take precedence.
			// Particularly important for new DateTextBox({displayedValue: ...}) since DateTextBox's default value is
			// NaN and thus is not ignored like a default value of "".

			// Step 1: Save the current values of the widget properties that were specified as parameters to the constructor.
			// Generally this.foo == this.params.foo, except if postMixInProperties() changed the value of this.foo.
			var params = {};
			for(var key in this.params || {}){
				params[key] = this._get(key);
			}

			// Step 2: Call set() for each property with a non-falsy value that wasn't passed as a parameter to the constructor
			array.forEach(this.constructor._setterAttrs, function(key){
				if(!(key in params)){
					var val = this._get(key);
					if(val){
						this.set(key, val);
					}
				}
			}, this);

			// Step 3: Call set() for each property that was specified as parameter to constructor.
			// Use params hash created above to ignore side effects from step #2 above.
			for(key in params){
				this.set(key, params[key]);
			}
		},

		postMixInProperties: function(){
			// summary:
			//		Called after the parameters to the widget have been read-in,
			//		but before the widget template is instantiated. Especially
			//		useful to set properties that are referenced in the widget
			//		template.
			// tags:
			//		protected
		},

		buildRendering: function(){
			// summary:
			//		Construct the UI for this widget, setting this.domNode.
			//		Most widgets will mixin `dijit._TemplatedMixin`, which implements this method.
			// tags:
			//		protected

			if(!this.domNode){
				// Create root node if it wasn't created by _TemplatedMixin
				this.domNode = this.srcNodeRef || this.ownerDocument.createElement("div");
			}

			// baseClass is a single class name or occasionally a space-separated list of names.
			// Add those classes to the DOMNode.  If RTL mode then also add with Rtl suffix.
			// TODO: make baseClass custom setter
			if(this.baseClass){
				var classes = this.baseClass.split(" ");
				if(!this.isLeftToRight()){
					classes = classes.concat(array.map(classes, function(name){
						return name + "Rtl";
					}));
				}
				domClass.add(this.domNode, classes);
			}
		},

		postCreate: function(){
			// summary:
			//		Processing after the DOM fragment is created
			// description:
			//		Called after the DOM fragment has been created, but not necessarily
			//		added to the document.  Do not include any operations which rely on
			//		node dimensions or placement.
			// tags:
			//		protected
		},

		startup: function(){
			// summary:
			//		Processing after the DOM fragment is added to the document
			// description:
			//		Called after a widget and its children have been created and added to the page,
			//		and all related widgets have finished their create() cycle, up through postCreate().
			//
			//		Note that startup() may be called while the widget is still hidden, for example if the widget is
			//		inside a hidden dijit/Dialog or an unselected tab of a dijit/layout/TabContainer.
			//		For widgets that need to do layout, it's best to put that layout code inside resize(), and then
			//		extend dijit/layout/_LayoutWidget so that resize() is called when the widget is visible.
			if(this._started){
				return;
			}
			this._started = true;
			array.forEach(this.getChildren(), function(obj){
				if(!obj._started && !obj._destroyed && lang.isFunction(obj.startup)){
					obj.startup();
					obj._started = true;
				}
			});
		},

		//////////// DESTROY FUNCTIONS ////////////////////////////////

		destroyRecursive: function(/*Boolean?*/ preserveDom){
			// summary:
			//		Destroy this widget and its descendants
			// description:
			//		This is the generic "destructor" function that all widget users
			//		should call to cleanly discard with a widget. Once a widget is
			//		destroyed, it is removed from the manager object.
			// preserveDom:
			//		If true, this method will leave the original DOM structure
			//		alone of descendant Widgets. Note: This will NOT work with
			//		dijit._TemplatedMixin widgets.

			this._beingDestroyed = true;
			this.destroyDescendants(preserveDom);
			this.destroy(preserveDom);
		},

		destroy: function(/*Boolean*/ preserveDom){
			// summary:
			//		Destroy this widget, but not its descendants.  Descendants means widgets inside of
			//		this.containerNode.   Will also destroy any resources (including widgets) registered via this.own().
			//
			//		This method will also destroy internal widgets such as those created from a template,
			//		assuming those widgets exist inside of this.domNode but outside of this.containerNode.
			//
			//		For 2.0 it's planned that this method will also destroy descendant widgets, so apps should not
			//		depend on the current ability to destroy a widget without destroying its descendants.   Generally
			//		they should use destroyRecursive() for widgets with children.
			// preserveDom: Boolean
			//		If true, this method will leave the original DOM structure alone.
			//		Note: This will not yet work with _TemplatedMixin widgets

			this._beingDestroyed = true;
			this.uninitialize();

			function destroy(w){
				if(w.destroyRecursive){
					w.destroyRecursive(preserveDom);
				}else if(w.destroy){
					w.destroy(preserveDom);
				}
			}

			// Back-compat, remove for 2.0
			array.forEach(this._connects, lang.hitch(this, "disconnect"));
			array.forEach(this._supportingWidgets, destroy);

			// Destroy supporting widgets, but not child widgets under this.containerNode (for 2.0, destroy child widgets
			// here too).   if() statement is to guard against exception if destroy() called multiple times (see #15815).
			if(this.domNode){
				array.forEach(registry.findWidgets(this.domNode, this.containerNode), destroy);
			}

			this.destroyRendering(preserveDom);
			registry.remove(this.id);
			this._destroyed = true;
		},

		destroyRendering: function(/*Boolean?*/ preserveDom){
			// summary:
			//		Destroys the DOM nodes associated with this widget.
			// preserveDom:
			//		If true, this method will leave the original DOM structure alone
			//		during tear-down. Note: this will not work with _Templated
			//		widgets yet.
			// tags:
			//		protected

			if(this.bgIframe){
				this.bgIframe.destroy(preserveDom);
				delete this.bgIframe;
			}

			if(this.domNode){
				if(preserveDom){
					domAttr.remove(this.domNode, "widgetId");
				}else{
					domConstruct.destroy(this.domNode);
				}
				delete this.domNode;
			}

			if(this.srcNodeRef){
				if(!preserveDom){
					domConstruct.destroy(this.srcNodeRef);
				}
				delete this.srcNodeRef;
			}
		},

		destroyDescendants: function(/*Boolean?*/ preserveDom){
			// summary:
			//		Recursively destroy the children of this widget and their
			//		descendants.
			// preserveDom:
			//		If true, the preserveDom attribute is passed to all descendant
			//		widget's .destroy() method. Not for use with _Templated
			//		widgets.

			// get all direct descendants and destroy them recursively
			array.forEach(this.getChildren(), function(widget){
				if(widget.destroyRecursive){
					widget.destroyRecursive(preserveDom);
				}
			});
		},

		uninitialize: function(){
			// summary:
			//		Deprecated. Override destroy() instead to implement custom widget tear-down
			//		behavior.
			// tags:
			//		protected
			return false;
		},

		////////////////// GET/SET, CUSTOM SETTERS, ETC. ///////////////////

		_setStyleAttr: function(/*String||Object*/ value){
			// summary:
			//		Sets the style attribute of the widget according to value,
			//		which is either a hash like {height: "5px", width: "3px"}
			//		or a plain string
			// description:
			//		Determines which node to set the style on based on style setting
			//		in attributeMap.
			// tags:
			//		protected

			var mapNode = this.domNode;

			// Note: technically we should revert any style setting made in a previous call
			// to his method, but that's difficult to keep track of.

			if(lang.isObject(value)){
				domStyle.set(mapNode, value);
			}else{
				if(mapNode.style.cssText){
					mapNode.style.cssText += "; " + value;
				}else{
					mapNode.style.cssText = value;
				}
			}

			this._set("style", value);
		},

		_attrToDom: function(/*String*/ attr, /*String*/ value, /*Object?*/ commands){
			// summary:
			//		Reflect a widget attribute (title, tabIndex, duration etc.) to
			//		the widget DOM, as specified by commands parameter.
			//		If commands isn't specified then it's looked up from attributeMap.
			//		Note some attributes like "type"
			//		cannot be processed this way as they are not mutable.
			// attr:
			//		Name of member variable (ex: "focusNode" maps to this.focusNode) pointing
			//		to DOMNode inside the widget, or alternately pointing to a subwidget
			// tags:
			//		private

			commands = arguments.length >= 3 ? commands : this.attributeMap[attr];

			array.forEach(lang.isArray(commands) ? commands : [commands], function(command){

				// Get target node and what we are doing to that node
				var mapNode = this[command.node || command || "domNode"];	// DOM node
				var type = command.type || "attribute";	// class, innerHTML, innerText, or attribute

				switch(type){
					case "attribute":
						if(lang.isFunction(value)){ // functions execute in the context of the widget
							value = lang.hitch(this, value);
						}

						// Get the name of the DOM node attribute; usually it's the same
						// as the name of the attribute in the widget (attr), but can be overridden.
						// Also maps handler names to lowercase, like onSubmit --> onsubmit
						var attrName = command.attribute ? command.attribute :
							(/^on[A-Z][a-zA-Z]*$/.test(attr) ? attr.toLowerCase() : attr);

						if(mapNode.tagName){
							// Normal case, mapping to a DOMNode.  Note that modern browsers will have a mapNode.set()
							// method, but for consistency we still call domAttr
							domAttr.set(mapNode, attrName, value);
						}else{
							// mapping to a sub-widget
							mapNode.set(attrName, value);
						}
						break;
					case "innerText":
						mapNode.innerHTML = "";
						mapNode.appendChild(this.ownerDocument.createTextNode(value));
						break;
					case "innerHTML":
						mapNode.innerHTML = value;
						break;
					case "class":
						domClass.replace(mapNode, value, this[attr]);
						break;
				}
			}, this);
		},

		get: function(name){
			// summary:
			//		Get a property from a widget.
			// name:
			//		The property to get.
			// description:
			//		Get a named property from a widget. The property may
			//		potentially be retrieved via a getter method. If no getter is defined, this
			//		just retrieves the object's property.
			//
			//		For example, if the widget has properties `foo` and `bar`
			//		and a method named `_getFooAttr()`, calling:
			//		`myWidget.get("foo")` would be equivalent to calling
			//		`widget._getFooAttr()` and `myWidget.get("bar")`
			//		would be equivalent to the expression
			//		`widget.bar2`
			var names = this._getAttrNames(name);
			return this[names.g] ? this[names.g]() : this._get(name);
		},

		set: function(name, value){
			// summary:
			//		Set a property on a widget
			// name:
			//		The property to set.
			// value:
			//		The value to set in the property.
			// description:
			//		Sets named properties on a widget which may potentially be handled by a
			//		setter in the widget.
			//
			//		For example, if the widget has properties `foo` and `bar`
			//		and a method named `_setFooAttr()`, calling
			//		`myWidget.set("foo", "Howdy!")` would be equivalent to calling
			//		`widget._setFooAttr("Howdy!")` and `myWidget.set("bar", 3)`
			//		would be equivalent to the statement `widget.bar = 3;`
			//
			//		set() may also be called with a hash of name/value pairs, ex:
			//
			//	|	myWidget.set({
			//	|		foo: "Howdy",
			//	|		bar: 3
			//	|	});
			//
			//	This is equivalent to calling `set(foo, "Howdy")` and `set(bar, 3)`

			if(typeof name === "object"){
				for(var x in name){
					this.set(x, name[x]);
				}
				return this;
			}
			var names = this._getAttrNames(name),
				setter = this[names.s];
			if(lang.isFunction(setter)){
				// use the explicit setter
				var result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
			}else{
				// Mapping from widget attribute to DOMNode/subwidget attribute/value/etc.
				// Map according to:
				//		1. attributeMap setting, if one exists (TODO: attributeMap deprecated, remove in 2.0)
				//		2. _setFooAttr: {...} type attribute in the widget (if one exists)
				//		3. apply to focusNode or domNode if standard attribute name, excluding funcs like onClick.
				// Checks if an attribute is a "standard attribute" by whether the DOMNode JS object has a similar
				// attribute name (ex: accept-charset attribute matches jsObject.acceptCharset).
				// Note also that Tree.focusNode() is a function not a DOMNode, so test for that.
				var defaultNode = this.focusNode && !lang.isFunction(this.focusNode) ? "focusNode" : "domNode",
					tag = this[defaultNode] && this[defaultNode].tagName,
					attrsForTag = tag && (tagAttrs[tag] || (tagAttrs[tag] = getAttrs(this[defaultNode]))),
					map = name in this.attributeMap ? this.attributeMap[name] :
						names.s in this ? this[names.s] :
							((attrsForTag && names.l in attrsForTag && typeof value != "function") ||
								/^aria-|^data-|^role$/.test(name)) ? defaultNode : null;
				if(map != null){
					this._attrToDom(name, value, map);
				}
				this._set(name, value);
			}
			return result || this;
		},

		_attrPairNames: {}, // shared between all widgets
		_getAttrNames: function(name){
			// summary:
			//		Helper function for get() and set().
			//		Caches attribute name values so we don't do the string ops every time.
			// tags:
			//		private

			var apn = this._attrPairNames;
			if(apn[name]){
				return apn[name];
			}
			var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function(c){
				return c.charAt(c.length - 1).toUpperCase();
			});
			return (apn[name] = {
				n: name + "Node",
				s: "_set" + uc + "Attr", // converts dashes to camel case, ex: accept-charset --> _setAcceptCharsetAttr
				g: "_get" + uc + "Attr",
				l: uc.toLowerCase()        // lowercase name w/out dashes, ex: acceptcharset
			});
		},

		_set: function(/*String*/ name, /*anything*/ value){
			// summary:
			//		Helper function to set new value for specified property, and call handlers
			//		registered with watch() if the value has changed.
			var oldValue = this[name];
			this[name] = value;
			if(this._created && value !== oldValue){
				if(this._watchCallbacks){
					this._watchCallbacks(name, oldValue, value);
				}
				this.emit("attrmodified-" + name, {
					detail: {
						prevValue: oldValue,
						newValue: value
					}
				});
			}
		},

		_get: function(/*String*/ name){
			// summary:
			//		Helper function to get value for specified property stored by this._set(),
			//		i.e. for properties with custom setters.  Used mainly by custom getters.
			//
			//		For example, CheckBox._getValueAttr() calls this._get("value").

			// future: return name in this.props ? this.props[name] : this[name];
			return this[name];
		},

		emit: function(/*String*/ type, /*Object?*/ eventObj, /*Array?*/ callbackArgs){
			// summary:
			//		Used by widgets to signal that a synthetic event occurred, ex:
			//	|	myWidget.emit("attrmodified-selectedChildWidget", {}).
			//
			//		Emits an event on this.domNode named type.toLowerCase(), based on eventObj.
			//		Also calls onType() method, if present, and returns value from that method.
			//		By default passes eventObj to callback, but will pass callbackArgs instead, if specified.
			//		Modifies eventObj by adding missing parameters (bubbles, cancelable, widget).
			// tags:
			//		protected

			// Specify fallback values for bubbles, cancelable in case they are not set in eventObj.
			// Also set pointer to widget, although since we can't add a pointer to the widget for native events
			// (see #14729), maybe we shouldn't do it here?
			eventObj = eventObj || {};
			if(eventObj.bubbles === undefined){
				eventObj.bubbles = true;
			}
			if(eventObj.cancelable === undefined){
				eventObj.cancelable = true;
			}
			if(!eventObj.detail){
				eventObj.detail = {};
			}
			eventObj.detail.widget = this;

			var ret, callback = this["on" + type];
			if(callback){
				ret = callback.apply(this, callbackArgs ? callbackArgs : [eventObj]);
			}

			// Emit event, but avoid spurious emit()'s as parent sets properties on child during startup/destroy
			if(this._started && !this._beingDestroyed){
				on.emit(this.domNode, type.toLowerCase(), eventObj);
			}

			return ret;
		},

		on: function(/*String|Function*/ type, /*Function*/ func){
			// summary:
			//		Call specified function when event occurs, ex: myWidget.on("click", function(){ ... }).
			// type:
			//		Name of event (ex: "click") or extension event like touch.press.
			// description:
			//		Call specified function when event `type` occurs, ex: `myWidget.on("click", function(){ ... })`.
			//		Note that the function is not run in any particular scope, so if (for example) you want it to run in the
			//		widget's scope you must do `myWidget.on("click", lang.hitch(myWidget, func))`.

			// For backwards compatibility, if there's an onType() method in the widget then connect to that.
			// Remove in 2.0.
			var widgetMethod = this._onMap(type);
			if(widgetMethod){
				return aspect.after(this, widgetMethod, func, true);
			}

			// Otherwise, just listen for the event on this.domNode.
			return this.own(on(this.domNode, type, func))[0];
		},

		_onMap: function(/*String|Function*/ type){
			// summary:
			//		Maps on() type parameter (ex: "mousemove") to method name (ex: "onMouseMove").
			//		If type is a synthetic event like touch.press then returns undefined.
			var ctor = this.constructor, map = ctor._onMap;
			if(!map){
				map = (ctor._onMap = {});
				for(var attr in ctor.prototype){
					if(/^on/.test(attr)){
						map[attr.replace(/^on/, "").toLowerCase()] = attr;
					}
				}
			}
			return map[typeof type == "string" && type.toLowerCase()];	// String
		},

		toString: function(){
			// summary:
			//		Returns a string that represents the widget.
			// description:
			//		When a widget is cast to a string, this method will be used to generate the
			//		output. Currently, it does not implement any sort of reversible
			//		serialization.
			return '[Widget ' + this.declaredClass + ', ' + (this.id || 'NO ID') + ']'; // String
		},

		getChildren: function(){
			// summary:
			//		Returns all direct children of this widget, i.e. all widgets underneath this.containerNode whose parent
			//		is this widget.   Note that it does not return all descendants, but rather just direct children.
			//		Analogous to [Node.childNodes](https://developer.mozilla.org/en-US/docs/DOM/Node.childNodes),
			//		except containing widgets rather than DOMNodes.
			//
			//		The result intentionally excludes internally created widgets (a.k.a. supporting widgets)
			//		outside of this.containerNode.
			//
			//		Note that the array returned is a simple array.  Application code should not assume
			//		existence of methods like forEach().

			return this.containerNode ? registry.findWidgets(this.containerNode) : []; // dijit/_WidgetBase[]
		},

		getParent: function(){
			// summary:
			//		Returns the parent widget of this widget.

			return registry.getEnclosingWidget(this.domNode.parentNode);
		},

		connect: function(/*Object|null*/ obj, /*String|Function*/ event, /*String|Function*/ method){
			// summary:
			//		Deprecated, will be removed in 2.0, use this.own(on(...)) or this.own(aspect.after(...)) instead.
			//
			//		Connects specified obj/event to specified method of this object
			//		and registers for disconnect() on widget destroy.
			//
			//		Provide widget-specific analog to dojo.connect, except with the
			//		implicit use of this widget as the target object.
			//		Events connected with `this.connect` are disconnected upon
			//		destruction.
			// returns:
			//		A handle that can be passed to `disconnect` in order to disconnect before
			//		the widget is destroyed.
			// example:
			//	|	var btn = new Button();
			//	|	// when foo.bar() is called, call the listener we're going to
			//	|	// provide in the scope of btn
			//	|	btn.connect(foo, "bar", function(){
			//	|		console.debug(this.toString());
			//	|	});
			// tags:
			//		protected

			return this.own(connect.connect(obj, event, this, method))[0];	// handle
		},

		disconnect: function(handle){
			// summary:
			//		Deprecated, will be removed in 2.0, use handle.remove() instead.
			//
			//		Disconnects handle created by `connect`.
			// tags:
			//		protected

			handle.remove();
		},

		subscribe: function(t, method){
			// summary:
			//		Deprecated, will be removed in 2.0, use this.own(topic.subscribe()) instead.
			//
			//		Subscribes to the specified topic and calls the specified method
			//		of this object and registers for unsubscribe() on widget destroy.
			//
			//		Provide widget-specific analog to dojo.subscribe, except with the
			//		implicit use of this widget as the target object.
			// t: String
			//		The topic
			// method: Function
			//		The callback
			// example:
			//	|	var btn = new Button();
			//	|	// when /my/topic is published, this button changes its label to
			//	|	// be the parameter of the topic.
			//	|	btn.subscribe("/my/topic", function(v){
			//	|		this.set("label", v);
			//	|	});
			// tags:
			//		protected
			return this.own(topic.subscribe(t, lang.hitch(this, method)))[0];	// handle
		},

		unsubscribe: function(/*Object*/ handle){
			// summary:
			//		Deprecated, will be removed in 2.0, use handle.remove() instead.
			//
			//		Unsubscribes handle created by this.subscribe.
			//		Also removes handle from this widget's list of subscriptions
			// tags:
			//		protected

			handle.remove();
		},

		isLeftToRight: function(){
			// summary:
			//		Return this widget's explicit or implicit orientation (true for LTR, false for RTL)
			// tags:
			//		protected
			return this.dir ? (this.dir == "ltr") : domGeometry.isBodyLtr(this.ownerDocument); //Boolean
		},

		isFocusable: function(){
			// summary:
			//		Return true if this widget can currently be focused
			//		and false if not
			return this.focus && (domStyle.get(this.domNode, "display") != "none");
		},

		placeAt: function(/* String|DomNode|_Widget */ reference, /* String|Int? */ position){
			// summary:
			//		Place this widget somewhere in the DOM based
			//		on standard domConstruct.place() conventions.
			// description:
			//		A convenience function provided in all _Widgets, providing a simple
			//		shorthand mechanism to put an existing (or newly created) Widget
			//		somewhere in the dom, and allow chaining.
			// reference:
			//		Widget, DOMNode, or id of widget or DOMNode
			// position:
			//		If reference is a widget (or id of widget), and that widget has an ".addChild" method,
			//		it will be called passing this widget instance into that method, supplying the optional
			//		position index passed.  In this case position (if specified) should be an integer.
			//
			//		If reference is a DOMNode (or id matching a DOMNode but not a widget),
			//		the position argument can be a numeric index or a string
			//		"first", "last", "before", or "after", same as dojo/dom-construct::place().
			// returns: dijit/_WidgetBase
			//		Provides a useful return of the newly created dijit._Widget instance so you
			//		can "chain" this function by instantiating, placing, then saving the return value
			//		to a variable.
			// example:
			//	|	// create a Button with no srcNodeRef, and place it in the body:
			//	|	var button = new Button({ label:"click" }).placeAt(win.body());
			//	|	// now, 'button' is still the widget reference to the newly created button
			//	|	button.on("click", function(e){ console.log('click'); }));
			// example:
			//	|	// create a button out of a node with id="src" and append it to id="wrapper":
			//	|	var button = new Button({},"src").placeAt("wrapper");
			// example:
			//	|	// place a new button as the first element of some div
			//	|	var button = new Button({ label:"click" }).placeAt("wrapper","first");
			// example:
			//	|	// create a contentpane and add it to a TabContainer
			//	|	var tc = dijit.byId("myTabs");
			//	|	new ContentPane({ href:"foo.html", title:"Wow!" }).placeAt(tc)

			var refWidget = !reference.tagName && registry.byId(reference);
			if(refWidget && refWidget.addChild && (!position || typeof position === "number")){
				// Adding this to refWidget and can use refWidget.addChild() to handle everything.
				refWidget.addChild(this, position);
			}else{
				// "reference" is a plain DOMNode, or we can't use refWidget.addChild().   Use domConstruct.place() and
				// target refWidget.containerNode for nested placement (position==number, "first", "last", "only"), and
				// refWidget.domNode otherwise ("after"/"before"/"replace").  (But not supported officially, see #14946.)
				var ref = refWidget ?
					(refWidget.containerNode && !/after|before|replace/.test(position || "") ?
						refWidget.containerNode : refWidget.domNode) : dom.byId(reference, this.ownerDocument);
				domConstruct.place(this.domNode, ref, position);

				// Start this iff it has a parent widget that's already started.
				// TODO: for 2.0 maybe it should also start the widget when this.getParent() returns null??
				if(!this._started && (this.getParent() || {})._started){
					this.startup();
				}
			}
			return this;
		},

		defer: function(fcn, delay){
			// summary:
			//		Wrapper to setTimeout to avoid deferred functions executing
			//		after the originating widget has been destroyed.
			//		Returns an object handle with a remove method (that returns null) (replaces clearTimeout).
			// fcn: function reference
			// delay: Optional number (defaults to 0)
			// tags:
			//		protected.
			var timer = setTimeout(lang.hitch(this,
				function(){
					if(!timer){
						return;
					}
					timer = null;
					if(!this._destroyed){
						lang.hitch(this, fcn)();
					}
				}),
				delay || 0
			);
			return {
				remove: function(){
					if(timer){
						clearTimeout(timer);
						timer = null;
					}
					return null; // so this works well: handle = handle.remove();
				}
			};
		}
	});

	if(has("dojo-bidi")){
		_WidgetBase.extend(_BidiMixin);
	}

	return _WidgetBase;
});

},
'dojo/dnd/Moveable':function(){
define([
	"../_base/array", "../_base/declare", "../_base/lang",
	"../dom", "../dom-class", "../Evented", "../on", "../topic", "../touch", "./common", "./Mover", "../_base/window"
], function(array, declare, lang, dom, domClass, Evented, on, topic, touch, dnd, Mover, win){

// module:
//		dojo/dnd/Moveable


var Moveable = declare("dojo.dnd.Moveable", [Evented], {
	// summary:
	//		an object, which makes a node movable

	// object attributes (for markup)
	handle: "",
	delay: 0,
	skip: false,

	constructor: function(node, params){
		// node: Node
		//		a node (or node's id) to be moved
		// params: Moveable.__MoveableArgs?
		//		optional parameters
		this.node = dom.byId(node);
		if(!params){ params = {}; }
		this.handle = params.handle ? dom.byId(params.handle) : null;
		if(!this.handle){ this.handle = this.node; }
		this.delay = params.delay > 0 ? params.delay : 0;
		this.skip  = params.skip;
		this.mover = params.mover ? params.mover : Mover;
		this.events = [
			on(this.handle, touch.press, lang.hitch(this, "onMouseDown")),
			// cancel text selection and text dragging
			on(this.handle, "dragstart",   lang.hitch(this, "onSelectStart")),
			on(this.handle, "selectstart",   lang.hitch(this, "onSelectStart"))
		];
	},

	// markup methods
	markupFactory: function(params, node, Ctor){
		return new Ctor(node, params);
	},

	// methods
	destroy: function(){
		// summary:
		//		stops watching for possible move, deletes all references, so the object can be garbage-collected
		array.forEach(this.events, function(handle){ handle.remove(); });
		this.events = this.node = this.handle = null;
	},

	// mouse event processors
	onMouseDown: function(e){
		// summary:
		//		event processor for onmousedown/ontouchstart, creates a Mover for the node
		// e: Event
		//		mouse/touch event
		if(this.skip && dnd.isFormElement(e)){ return; }
		if(this.delay){
			this.events.push(
				on(this.handle, touch.move, lang.hitch(this, "onMouseMove")),
				on(this.handle, touch.release, lang.hitch(this, "onMouseUp"))
			);
			this._lastX = e.pageX;
			this._lastY = e.pageY;
		}else{
			this.onDragDetected(e);
		}
		e.stopPropagation();
		e.preventDefault();
	},
	onMouseMove: function(e){
		// summary:
		//		event processor for onmousemove/ontouchmove, used only for delayed drags
		// e: Event
		//		mouse/touch event
		if(Math.abs(e.pageX - this._lastX) > this.delay || Math.abs(e.pageY - this._lastY) > this.delay){
			this.onMouseUp(e);
			this.onDragDetected(e);
		}
		e.stopPropagation();
		e.preventDefault();
	},
	onMouseUp: function(e){
		// summary:
		//		event processor for onmouseup, used only for delayed drags
		// e: Event
		//		mouse event
		for(var i = 0; i < 2; ++i){
			this.events.pop().remove();
		}
		e.stopPropagation();
		e.preventDefault();
	},
	onSelectStart: function(e){
		// summary:
		//		event processor for onselectevent and ondragevent
		// e: Event
		//		mouse event
		if(!this.skip || !dnd.isFormElement(e)){
			e.stopPropagation();
			e.preventDefault();
		}
	},

	// local events
	onDragDetected: function(/*Event*/ e){
		// summary:
		//		called when the drag is detected;
		//		responsible for creation of the mover
		new this.mover(this.node, e, this);
	},
	onMoveStart: function(/*Mover*/ mover){
		// summary:
		//		called before every move operation
		topic.publish("/dnd/move/start", mover);
		domClass.add(win.body(), "dojoMove");
		domClass.add(this.node, "dojoMoveItem");
	},
	onMoveStop: function(/*Mover*/ mover){
		// summary:
		//		called after every move operation
		topic.publish("/dnd/move/stop", mover);
		domClass.remove(win.body(), "dojoMove");
		domClass.remove(this.node, "dojoMoveItem");
	},
	onFirstMove: function(/*===== mover, e =====*/){
		// summary:
		//		called during the very first move notification;
		//		can be used to initialize coordinates, can be overwritten.
		// mover: Mover
		// e: Event

		// default implementation does nothing
	},
	onMove: function(mover, leftTop /*=====, e =====*/){
		// summary:
		//		called during every move notification;
		//		should actually move the node; can be overwritten.
		// mover: Mover
		// leftTop: Object
		// e: Event
		this.onMoving(mover, leftTop);
		var s = mover.node.style;
		s.left = leftTop.l + "px";
		s.top  = leftTop.t + "px";
		this.onMoved(mover, leftTop);
	},
	onMoving: function(/*===== mover, leftTop =====*/){
		// summary:
		//		called before every incremental move; can be overwritten.
		// mover: Mover
		// leftTop: Object

		// default implementation does nothing
	},
	onMoved: function(/*===== mover, leftTop =====*/){
		// summary:
		//		called after every incremental move; can be overwritten.
		// mover: Mover
		// leftTop: Object

		// default implementation does nothing
	}
});

/*=====
Moveable.__MoveableArgs = declare([], {
	// handle: Node||String
	//		A node (or node's id), which is used as a mouse handle.
	//		If omitted, the node itself is used as a handle.
	handle: null,

	// delay: Number
	//		delay move by this number of pixels
	delay: 0,

	// skip: Boolean
	//		skip move of form elements
	skip: false,

	// mover: Object
	//		a constructor of custom Mover
	mover: dnd.Mover
});
=====*/

return Moveable;
});

},
'dojo/html':function(){
define(["./_base/kernel", "./_base/lang", "./_base/array", "./_base/declare", "./dom", "./dom-construct", "./parser"],
	function(kernel, lang, darray, declare, dom, domConstruct, parser){
	// module:
	//		dojo/html

	var html = {
		// summary:
		//		TODOC
	};
	lang.setObject("dojo.html", html);

	// the parser might be needed..

	// idCounter is incremented with each instantiation to allow assignment of a unique id for tracking, logging purposes
	var idCounter = 0;

	html._secureForInnerHtml = function(/*String*/ cont){
		// summary:
		//		removes !DOCTYPE and title elements from the html string.
		//
		//		khtml is picky about dom faults, you can't attach a style or `<title>` node as child of body
		//		must go into head, so we need to cut out those tags
		// cont:
		//		An html string for insertion into the dom
		//
		return cont.replace(/(?:\s*<!DOCTYPE\s[^>]+>|<title[^>]*>[\s\S]*?<\/title>)/ig, ""); // String
	};

	html._emptyNode = domConstruct.empty;
	/*=====
	 dojo.html._emptyNode = function(node){
		 // summary:
		 //		Removes all child nodes from the given node.   Deprecated, should use dojo/dom-constuct.empty() directly
		 //		instead.
		 // node: DOMNode
		 //		the parent element
	 };
	 =====*/

		html._setNodeContent = function(/*DomNode*/ node, /*String|DomNode|NodeList*/ cont){
		// summary:
		//		inserts the given content into the given node
		// node:
		//		the parent element
		// content:
		//		the content to be set on the parent element.
		//		This can be an html string, a node reference or a NodeList, dojo/NodeList, Array or other enumerable list of nodes

		// always empty
		domConstruct.empty(node);

		if(cont){
			if(typeof cont == "string"){
				cont = domConstruct.toDom(cont, node.ownerDocument);
			}
			if(!cont.nodeType && lang.isArrayLike(cont)){
				// handle as enumerable, but it may shrink as we enumerate it
				for(var startlen=cont.length, i=0; i<cont.length; i=startlen==cont.length ? i+1 : 0){
					domConstruct.place( cont[i], node, "last");
				}
			}else{
				// pass nodes, documentFragments and unknowns through to dojo.place
				domConstruct.place(cont, node, "last");
			}
		}

		// return DomNode
		return node;
	};

	// we wrap up the content-setting operation in a object
	html._ContentSetter = declare("dojo.html._ContentSetter", null,
		{
			// node: DomNode|String
			//		An node which will be the parent element that we set content into
			node: "",

			// content: String|DomNode|DomNode[]
			//		The content to be placed in the node. Can be an HTML string, a node reference, or a enumerable list of nodes
			content: "",

			// id: String?
			//		Usually only used internally, and auto-generated with each instance
			id: "",

			// cleanContent: Boolean
			//		Should the content be treated as a full html document,
			//		and the real content stripped of <html>, <body> wrapper before injection
			cleanContent: false,

			// extractContent: Boolean
			//		Should the content be treated as a full html document,
			//		and the real content stripped of `<html> <body>` wrapper before injection
			extractContent: false,

			// parseContent: Boolean
			//		Should the node by passed to the parser after the new content is set
			parseContent: false,

			// parserScope: String
			//		Flag passed to parser.	Root for attribute names to search for.	  If scopeName is dojo,
			//		will search for data-dojo-type (or dojoType).  For backwards compatibility
			//		reasons defaults to dojo._scopeName (which is "dojo" except when
			//		multi-version support is used, when it will be something like dojo16, dojo20, etc.)
			parserScope: kernel._scopeName,

			// startup: Boolean
			//		Start the child widgets after parsing them.	  Only obeyed if parseContent is true.
			startup: true,

			// lifecycle methods
			constructor: function(/*Object*/ params, /*String|DomNode*/ node){
				// summary:
				//		Provides a configurable, extensible object to wrap the setting on content on a node
				//		call the set() method to actually set the content..

				// the original params are mixed directly into the instance "this"
				lang.mixin(this, params || {});

				// give precedence to params.node vs. the node argument
				// and ensure its a node, not an id string
				node = this.node = dom.byId( this.node || node );

				if(!this.id){
					this.id = [
						"Setter",
						(node) ? node.id || node.tagName : "",
						idCounter++
					].join("_");
				}
			},
			set: function(/* String|DomNode|NodeList? */ cont, /*Object?*/ params){
				// summary:
				//		front-end to the set-content sequence
				// cont:
				//		An html string, node or enumerable list of nodes for insertion into the dom
				//		If not provided, the object's content property will be used
				if(undefined !== cont){
					this.content = cont;
				}
				// in the re-use scenario, set needs to be able to mixin new configuration
				if(params){
					this._mixin(params);
				}

				this.onBegin();
				this.setContent();

				var ret = this.onEnd();

				if(ret && ret.then){
					// Make dojox/html/_ContentSetter.set() return a Promise that resolves when load and parse complete.
					return ret;
				}else{
					// Vanilla dojo/html._ContentSetter.set() returns a DOMNode for back compat.   For 2.0, switch it to
					// return a Deferred like above.
					return this.node;
				}
			},

			setContent: function(){
				// summary:
				//		sets the content on the node

				var node = this.node;
				if(!node){
					// can't proceed
					throw new Error(this.declaredClass + ": setContent given no node");
				}
				try{
					node = html._setNodeContent(node, this.content);
				}catch(e){
					// check if a domfault occurs when we are appending this.errorMessage
					// like for instance if domNode is a UL and we try append a DIV

					// FIXME: need to allow the user to provide a content error message string
					var errMess = this.onContentError(e);
					try{
						node.innerHTML = errMess;
					}catch(e){
						console.error('Fatal ' + this.declaredClass + '.setContent could not change content due to '+e.message, e);
					}
				}
				// always put back the node for the next method
				this.node = node; // DomNode
			},

			empty: function(){
				// summary:
				//		cleanly empty out existing content
				
				// If there is a parse in progress, cancel it.
				if(this.parseDeferred){
					if(!this.parseDeferred.isResolved()){
						this.parseDeferred.cancel();
					}
					delete this.parseDeferred;
				}

				// destroy any widgets from a previous run
				// NOTE: if you don't want this you'll need to empty
				// the parseResults array property yourself to avoid bad things happening
				if(this.parseResults && this.parseResults.length){
					darray.forEach(this.parseResults, function(w){
						if(w.destroy){
							w.destroy();
						}
					});
					delete this.parseResults;
				}
				// this is fast, but if you know its already empty or safe, you could
				// override empty to skip this step
				domConstruct.empty(this.node);
			},

			onBegin: function(){
				// summary:
				//		Called after instantiation, but before set();
				//		It allows modification of any of the object properties -
				//		including the node and content provided - before the set operation actually takes place
				//		This default implementation checks for cleanContent and extractContent flags to
				//		optionally pre-process html string content
				var cont = this.content;

				if(lang.isString(cont)){
					if(this.cleanContent){
						cont = html._secureForInnerHtml(cont);
					}

					if(this.extractContent){
						var match = cont.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
						if(match){ cont = match[1]; }
					}
				}

				// clean out the node and any cruft associated with it - like widgets
				this.empty();

				this.content = cont;
				return this.node; // DomNode
			},

			onEnd: function(){
				// summary:
				//		Called after set(), when the new content has been pushed into the node
				//		It provides an opportunity for post-processing before handing back the node to the caller
				//		This default implementation checks a parseContent flag to optionally run the dojo parser over the new content
				if(this.parseContent){
					// populates this.parseResults and this.parseDeferred if you need those..
					this._parse();
				}
				return this.node; // DomNode
				// TODO: for 2.0 return a Promise indicating that the parse completed.
			},

			tearDown: function(){
				// summary:
				//		manually reset the Setter instance if its being re-used for example for another set()
				// description:
				//		tearDown() is not called automatically.
				//		In normal use, the Setter instance properties are simply allowed to fall out of scope
				//		but the tearDown method can be called to explicitly reset this instance.
				delete this.parseResults;
				delete this.parseDeferred;
				delete this.node;
				delete this.content;
			},

			onContentError: function(err){
				return "Error occurred setting content: " + err;
			},

			onExecError: function(err){
				return "Error occurred executing scripts: " + err;
			},

			_mixin: function(params){
				// mix properties/methods into the instance
				// TODO: the intention with tearDown is to put the Setter's state
				// back to that of the original constructor (vs. deleting/resetting everything regardless of ctor params)
				// so we could do something here to move the original properties aside for later restoration
				var empty = {}, key;
				for(key in params){
					if(key in empty){ continue; }
					// TODO: here's our opportunity to mask the properties we don't consider configurable/overridable
					// .. but history shows we'll almost always guess wrong
					this[key] = params[key];
				}
			},
			_parse: function(){
				// summary:
				//		runs the dojo parser over the node contents, storing any results in this.parseResults
				//		and the parse promise in this.parseDeferred
				//		Any errors resulting from parsing are passed to _onError for handling

				var rootNode = this.node;
				try{
					// store the results (widgets, whatever) for potential retrieval
					var inherited = {};
					darray.forEach(["dir", "lang", "textDir"], function(name){
						if(this[name]){
							inherited[name] = this[name];
						}
					}, this);
					var self = this;
					this.parseDeferred = parser.parse({
						rootNode: rootNode,
						noStart: !this.startup,
						inherited: inherited,
						scope: this.parserScope
					}).then(function(results){
						return self.parseResults = results;
					}, function(e){
						self._onError('Content', e, "Error parsing in _ContentSetter#" + this.id);
					});
				}catch(e){
					this._onError('Content', e, "Error parsing in _ContentSetter#" + this.id);
				}
			},

			_onError: function(type, err, consoleText){
				// summary:
				//		shows user the string that is returned by on[type]Error
				//		override/implement on[type]Error and return your own string to customize
				var errText = this['on' + type + 'Error'].call(this, err);
				if(consoleText){
					console.error(consoleText, err);
				}else if(errText){ // a empty string won't change current content
					html._setNodeContent(this.node, errText, true);
				}
			}
	}); // end declare()

	html.set = function(/*DomNode*/ node, /*String|DomNode|NodeList*/ cont, /*Object?*/ params){
			// summary:
			//		inserts (replaces) the given content into the given node. dojo.place(cont, node, "only")
			//		may be a better choice for simple HTML insertion.
			// description:
			//		Unless you need to use the params capabilities of this method, you should use
			//		dojo.place(cont, node, "only"). dojo.place() has more robust support for injecting
			//		an HTML string into the DOM, but it only handles inserting an HTML string as DOM
			//		elements, or inserting a DOM node. dojo.place does not handle NodeList insertions
			//		or the other capabilities as defined by the params object for this method.
			// node:
			//		the parent element that will receive the content
			// cont:
			//		the content to be set on the parent element.
			//		This can be an html string, a node reference or a NodeList, dojo/NodeList, Array or other enumerable list of nodes
			// params:
			//		Optional flags/properties to configure the content-setting. See dojo/html/_ContentSetter
			// example:
			//		A safe string/node/nodelist content replacement/injection with hooks for extension
			//		Example Usage:
			//	|	html.set(node, "some string");
			//	|	html.set(node, contentNode, {options});
			//	|	html.set(node, myNode.childNodes, {options});
		if(undefined == cont){
			console.warn("dojo.html.set: no cont argument provided, using empty string");
			cont = "";
		}
		if(!params){
			// simple and fast
			return html._setNodeContent(node, cont, true);
		}else{
			// more options but slower
			// note the arguments are reversed in order, to match the convention for instantiation via the parser
			var op = new html._ContentSetter(lang.mixin(
					params,
					{ content: cont, node: node }
			));
			return op.set();
		}
	};

	return html;
});

},
'url:dijit/form/templates/DropDownBox.html':"<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\"\n\taria-haspopup=\"true\"\n\tdata-dojo-attach-point=\"_popupStateNode\"\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\n\t\tdata-dojo-attach-point=\"_buttonNode\" role=\"presentation\"\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"button presentation\" aria-hidden=\"true\"\n\t\t\t${_buttonInputDisabled}\n\t/></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\n\t\t\tdata-dojo-attach-point=\"textbox,focusNode\" role=\"textbox\"\n\t/></div\n></div>\n",
'url:dijit/templates/Tooltip.html':"<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\"\n\t><div class=\"dijitTooltipConnector\" data-dojo-attach-point=\"connectorNode\"></div\n\t><div class=\"dijitTooltipContainer dijitTooltipContents\" data-dojo-attach-point=\"containerNode\" role='alert'></div\n></div>\n",
'url:dijit/templates/Dialog.html':"<div class=\"dijitDialog\" role=\"dialog\" aria-labelledby=\"${id}_title\">\n\t<div data-dojo-attach-point=\"titleBar\" class=\"dijitDialogTitleBar\">\n\t\t<span data-dojo-attach-point=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"\n\t\t\t\trole=\"heading\" level=\"1\"></span>\n\t\t<span data-dojo-attach-point=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" data-dojo-attach-event=\"ondijitclick: onCancel\" title=\"${buttonCancel}\" role=\"button\" tabindex=\"0\">\n\t\t\t<span data-dojo-attach-point=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\n\t\t</span>\n\t</div>\n\t<div data-dojo-attach-point=\"containerNode\" class=\"dijitDialogPaneContent\"></div>\n</div>\n",
'url:dijit/form/templates/DropDownButton.html':"<span class=\"dijit dijitReset dijitInline\"\n\t><span class='dijitReset dijitInline dijitButtonNode'\n\t\tdata-dojo-attach-event=\"ondijitclick:__onClick\" data-dojo-attach-point=\"_buttonNode\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdata-dojo-attach-point=\"focusNode,titleNode,_arrowWrapperNode,_popupStateNode\"\n\t\t\trole=\"button\" aria-haspopup=\"true\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\"\n\t\t\t\tdata-dojo-attach-point=\"iconNode\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tdata-dojo-attach-point=\"containerNode\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\"></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\" tabIndex=\"-1\"\n\t\tdata-dojo-attach-event=\"onclick:_onClick\"\n\t\tdata-dojo-attach-point=\"valueNode\" role=\"presentation\"\n/></span>\n",
'url:dijit/form/templates/Button.html':"<span class=\"dijit dijitReset dijitInline\" role=\"presentation\"\n\t><span class=\"dijitReset dijitInline dijitButtonNode\"\n\t\tdata-dojo-attach-event=\"ondijitclick:__onClick\" role=\"presentation\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdata-dojo-attach-point=\"titleNode,focusNode\"\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\" data-dojo-attach-point=\"iconNode\"></span\n\t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#x25CF;</span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t\tdata-dojo-attach-point=\"containerNode\"\n\t\t\t></span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\"\n\t\tdata-dojo-attach-event=\"onclick:_onClick\"\n\t\ttabIndex=\"-1\" role=\"presentation\" data-dojo-attach-point=\"valueNode\"\n/></span>\n",
'url:dijit/form/templates/ValidationTextBox.html':"<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\" role=\"presentation\"\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class=\"dijitReset dijitInputInner\" data-dojo-attach-point='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${!nameAttrSetting} type='${type}'\n\t/></div\n></div>\n",
'url:dijit/templates/Calendar.html':"<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\" role=\"grid\" aria-labelledby=\"${id}_mddb ${id}_year\" data-dojo-attach-point=\"gridNode\">\n\t<thead>\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\n\t\t\t<th class='dijitReset dijitCalendarArrow' data-dojo-attach-point=\"decrementMonth\" scope=\"col\">\n\t\t\t\t<span class=\"dijitInline dijitCalendarIncrementControl dijitCalendarDecrease\" role=\"presentation\"></span>\n\t\t\t\t<span data-dojo-attach-point=\"decreaseArrowNode\" class=\"dijitA11ySideArrow\">-</span>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' colspan=\"5\" scope=\"col\">\n\t\t\t\t<div data-dojo-attach-point=\"monthNode\">\n\t\t\t\t</div>\n\t\t\t</th>\n\t\t\t<th class='dijitReset dijitCalendarArrow' scope=\"col\" data-dojo-attach-point=\"incrementMonth\">\n\t\t\t\t<span class=\"dijitInline dijitCalendarIncrementControl dijitCalendarIncrease\" role=\"presentation\"></span>\n\t\t\t\t<span data-dojo-attach-point=\"increaseArrowNode\" class=\"dijitA11ySideArrow\">+</span>\n\t\t\t</th>\n\t\t</tr>\n\t\t<tr role=\"row\">\n\t\t\t${!dayCellsHtml}\n\t\t</tr>\n\t</thead>\n\t<tbody data-dojo-attach-point=\"dateRowsNode\" data-dojo-attach-event=\"ondijitclick: _onDayClick\" class=\"dijitReset dijitCalendarBodyContainer\">\n\t\t\t${!dateRowsHtml}\n\t</tbody>\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\n\t\t<tr>\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\" role=\"presentation\">\n\t\t\t\t<div class=\"dijitCalendarYearLabel\">\n\t\t\t\t\t<span data-dojo-attach-point=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\" role=\"button\"></span>\n\t\t\t\t\t<span data-dojo-attach-point=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\" role=\"button\" id=\"${id}_year\"></span>\n\t\t\t\t\t<span data-dojo-attach-point=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\" role=\"button\"></span>\n\t\t\t\t</div>\n\t\t\t</td>\n\t\t</tr>\n\t</tfoot>\n</table>\n",
'url:dijit/form/templates/TextBox.html':"<div class=\"dijit dijitReset dijitInline dijitLeft\" id=\"widget_${id}\" role=\"presentation\"\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class=\"dijitReset dijitInputInner\" data-dojo-attach-point='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${!nameAttrSetting} type='${type}'\n\t/></div\n></div>\n",
'*now':function(r){r(['dojo/i18n!*preload*js/nls/app*["ar","ca","cs","da","de","el","en-gb","en-us","es-es","fi-fi","fr-fr","he-il","hu","it-it","ja-jp","ko-kr","nl-nl","nb","pl","pt-br","pt-pt","ru","sk","sl","sv","th","tr","zh-tw","zh-cn","ROOT"]']);}
}});
// wrapped by build app
define("js/app", ["dijit","dojo","dojox","dojo/require!dojo/parser,dojo/ready,dijit/Editor,dijit/_editor/plugins/TextColor,dijit/_editor/plugins/LinkDialog,dijit/_editor/plugins/FullScreen,dijit/_editor/plugins/ViewSource,dijit/_editor/plugins/NewPage,dijit/form/DateTextBox,dijit/form/TimeTextBox,dijit/Dialog"], function(dijit,dojo,dojox){
dojo.require("dojo.parser");
dojo.require("dojo.ready");
dojo.require("dijit.Editor");
dojo.require("dijit._editor.plugins.TextColor");
dojo.require("dijit._editor.plugins.LinkDialog");
dojo.require("dijit._editor.plugins.FullScreen");
dojo.require("dijit._editor.plugins.ViewSource");
dojo.require("dijit._editor.plugins.NewPage");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.TimeTextBox");
dojo.require("dijit.Dialog");


dojo.ready(function(){      
	      var myDate = new dijit.form.DateTextBox( {   name: "duedate",
							   id: "duedate"

                                                       }, "duedate");


	      var dutime = new dijit.form.TimeTextBox ({ name:"duetime", id: "duetime",
							constraints: {
							    timePattern: 'HH:mm:ss',
							    clickableIncrement: 'T00:15',
							    visibleIncrement: 'T00:15',
							    visibleRange: 'T01:00'
							}
						       }, "duetime");




	      mydialog = new dijit.Dialog({
					title: "Cambiar contraseña",
					content: "Nueva contraseña y confirmar contraseña no coinciden, o los campos estan vacios.",
					style: "width: 400px"
				    });

	      new dijit.Editor({
				   plugins: ["bold","italic","|","cut","copy","paste","|","insertUnorderedList", "|",'underline','strikethrough', 'indent', 'outdent', 'justifyLeft', 'justifyCenter', 'justifyRight',"viewSource", 'foreColor','hiliteColor', "createLink",'insertImage']
			       }, "description");
	  });
});