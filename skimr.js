/*
Todo: 
    - Set up fixtures and JSON data handlers ✓
    - Autogenerate language switcher(?)
    - Detect hashchange(?)
    - Write a readme
    - Include variables in translations ✓
    - Add animation
    - Callback functions ✓
    - Add args to callback functions
*/

function Skimr(properties){

    var defaults = {
        default_lang: "en",
        active_lang: "en",
        dictionaries: [],
        elements: $("[data-translation]"),
        fade: false,
        onLoad: false,
        onComplete: false
    };

    Skimr.prototype._init = function(){

        var that = this;
        
        for (var i in defaults){

            (function(i){

                that[i] = (properties[i] != undefined) ? properties[i] : defaults[i];
                
                that["get_" + i] = function(){

                    return that[i];
                }
            })(i);
        }

        this.fetch_dictionaries();
        this.create_default_dictionary();
        this.bind_events();
        this.trigger(this.onLoad);

        //check for language hash in the url
        var hash = window.location.hash.split("#")[1];
        if(hash != undefined && hash != this.active_lang && this.dictionaries[hash] != undefined){

            this.translate_to_lang(hash);
        }
    }

    Skimr.prototype.trigger = function(callback){

        if($.isFunction(callback)){

            callback.call();
        }
    }

    Skimr.prototype.bind_events = function(){

        var that = this;

        $("nav.skimr a[data-language]").on("click", function(e){

            var $current = $("nav.skimr a.current[data-language]");
            var lang_off = $current.data("language");
            var lang_on = $(this).data("language");
            $current.removeClass("current");
            $(this).addClass("current")
            $("body").removeClass(lang_off).addClass(lang_on);
            $("html").attr("lang", lang_on)
            that.translate_to_lang(lang_on);
        });
    }

    Skimr.prototype.fetch_dictionaries = function(){

        var that = this;

        for(var lang in this.dictionaries){

            (function(lang){

                if(typeof that.dictionaries[lang] == "string"){

                    $.ajax({
                        url: "json/de.json",
                        dataType: "json",
                        async: false,
                        success: function(data, textStatus, jqXHR){
                            that.dictionaries[lang] = data;
                        }
                    });
                }
            })(lang);
        }
    }

    Skimr.prototype.create_default_dictionary = function(){

        var that = this;

        this.dictionaries[this.default_lang] = {};
            
        that.elements.each(function(){

            var _key = $(this).data("translation");
            var _trans = $(this).html();

            //convert variable elements into conversion specifications
            $(this).find(".s, .d").each(function(){

                substr = $(this)[0].outerHTML;
                newsubstr = $(this).hasClass("s") ? "%s" : "%d";
                _trans = _trans.replace(substr, newsubstr);
            });

            that.dictionaries[that.default_lang][_key] = _trans;
        });
    }

    Skimr.prototype.parse_variables = function(key){

        var src_str = this.dictionaries[this.active_lang][key];
        
        if(src_str != undefined && src_str != ""){

            $dest_vars_s = $("[data-translation=" + key + "] .s"); //strings
            $dest_vars_d = $("[data-translation=" + key + "] .d"); //ints
            
            src_arr = src_str.split(/(%d|%s)/);

            if(src_arr.length > 1){

                var output_str = "";
                var src_var_counter_s = src_var_counter_d = 0;

                for(var i in src_arr){

                    (function(i){

                        var part = "";

                        if(src_arr[i] == "%s"){

                            part = ($dest_vars_s[src_var_counter_s] != undefined) ? $dest_vars_s[src_var_counter_s++].outerHTML : src_arr[i];
                        }
                        else if(src_arr[i] == "%d"){

                            part = ($dest_vars_d[src_var_counter_d] != undefined) ? $dest_vars_d[src_var_counter_d++].outerHTML : src_arr[i];
                        }
                        else{

                            part = src_arr[i];
                        }
                        output_str += part;
                    })(i);
                }
                return output_str;
            }
            else return src_str;
        }
        else return false;
    }

    Skimr.prototype.translate_to_lang = function(lang){

        var that = this;

        this.active_lang = lang;

        $.each(this.elements, function(i, val){

            var _key = $(this).data("translation");
            var _trans = that.parse_variables(_key);
            if(_trans){

                if(that.fade){

                    $(this).fadeOut(100, function(){

                        $(this).html(_trans).fadeIn(100);
                    });
                }
                else $(this).html(_trans);                
            }
        });

        this.elements.promise().done(function(){
            that.trigger(that.onComplete);
        });
    }

    this._init();
}