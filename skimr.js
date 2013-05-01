/*
Todo: 
    - Set up fixtures and JSON data handlers ✓
    - Autogenerate language switcher(?)
    - Detect hashchange(?)
    - Write a readme
    - Include variables in translations ✓
    - Add animation ✓
    - Callback functions ✓
    - Add args to callback functions ✓
    - Translator method (by key or by string) ✓
    - Use navigator object for default language detection ✓
*/

function Skimr(properties){

    var defaults = {
        native_lang: "en-US",
        default_lang: null,
        detect_lang: true,
        dictionaries: [],
        elements: $("[data-translation]"),
        str_class: "s",
        int_class: "d",
        fade: false,
        on_load: null,
        on_start: null,
        on_complete: null,
        active_lang: null
    };

    Skimr.prototype._init = function(){

        var that = this;
        
        for (var i in defaults){

            (function(i){

                that[i] = (properties[i] != undefined) ? properties[i] : defaults[i];
                
                //create getter and setter methods
                that["get_" + i] = function(){

                    return that[i];
                }
                that["set_" + i] = function(new_val){

                    that[i] = new_val;
                    return that[i];
                }
            })(i);
        }

        this.set_active_lang(this.get_native_lang());
        this.load_dictionaries();
        this.create_native_dictionary();
        this.bind_events();       

        var hash = this.detect_valid_hash();

        if(hash && hash != this.get_active_lang()){

            var lang = hash;
            this.translate_to_lang(lang);
        }
        else if(this.get_default_lang() && this.get_default_lang() != this.get_native_lang()){

            var lang = this.get_default_lang();
            this.translate_to_lang();   
        }
        else if(this.get_detect_lang() && navigator.language != undefined && navigator.language != this.get_native_lang()){

            this.translate_to_lang(navigator.language);
        }

        trigger(this.get_on_load());

    }

    Skimr.prototype.detect_valid_hash = function(){

        var loc_arr = window.location.hash.split("#")
        if(loc_arr.length > 1){

            if(this.get_dictionaries()[loc_arr[1]] != undefined){

                var hash = loc_arr[1];
                return hash;
            }
            else return false;
        }
        else return false;
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

    Skimr.prototype.load_dictionaries = function(){

        var that = this;

        for(var lang in this.get_dictionaries()){

            (function(lang){

                if(typeof that.get_dictionaries()[lang] == "string"){

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

    Skimr.prototype.create_native_dictionary = function(){

        var that = this;

        var native_lang = this.get_native_lang();
        var native_dictionary = {};
            
        this.elements.each(function(){

            var key = $(this).data("translation");
            var trans = $(this).html();

            //convert variable elements into conversion specifications
            $(this).find("." + that.get_str_class() + ", ." + that.get_int_class()).each(function(){

                var substr = $(this)[0].outerHTML;
                var newsubstr = $(this).hasClass(that.str_class) ? "%s" : "%d";
                trans = trans.replace(substr, newsubstr);
            });

            native_dictionary[key] = trans;
        });
        var dictionaries = this.get_dictionaries();
        dictionaries[native_lang] = native_dictionary;
        this.set_dictionaries(dictionaries);
    }

    Skimr.prototype.parse_variables = function(key){

        var src_str = this.fetch_translation(key);
        
        if(src_str){

            $dest_vars_s = $("[data-translation=" + key + "] ." + this.str_class); //strings
            $dest_vars_d = $("[data-translation=" + key + "] ." + this.int_class); //ints
            
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
        
        trigger(this.on_start);

        this.set_active_lang(lang);

        $.each(this.get_elements(), function(i, val){

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
            
            trigger(that.on_complete);
        });
    }

    Skimr.prototype.fetch_translation = function(key, lang){

        var src_lang = lang != undefined ? lang : this.get_active_lang();
        var trans = this.get_dictionaries()[src_lang][key];
        if(trans != undefined && trans != "") return trans;
        else return false;
    }
    
    /*
    Private methods
    */
    
    var that = this;

    trigger = function(callback){

        if($.isFunction(callback)){

            callback.call(that, that.get_active_lang());
        }
    }

    this._init();
}