/*
    Skimmer.js v0.1.1 01-05-2013
    Copyright(c) 2013 James Shakespeare - jshakespeare.com
    Docs are available at 
    Published under the WTFPL license (http://www.wtfpl.net/txt/copying/)
*/

function Skimmer(properties){

    var defaults = {
        native_lang: "en-US",
        default_lang: null,
        detect_lang: true,
        dictionaries: [],
        elements: $("[data-translation]"),
        var_class: "s",
        fade: false,
        on_load: null,
        on_start: null,
        on_complete: null,
        active_lang: null
    };

    Skimmer.prototype._init = function(){

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

    Skimmer.prototype.detect_valid_hash = function(){

        var loc_arr = window.location.hash.split("#")
        if(loc_arr.length > 1){

            if(this.dictionary_exists(loc_arr[1])){

                var hash = loc_arr[1];
                return hash;
            }
            else return false;
        }
        else return false;
    }

    Skimmer.prototype.bind_events = function(){

        var that = this;

        $("nav.skimmer a[data-language]").on("click", function(e){

            var $current = $("nav.Skimmer a.current[data-language]");
            var lang_off = $current.data("language");
            var lang_on = $(this).data("language");
            $current.removeClass("current");
            $(this).addClass("current")
            $("body").removeClass(lang_off).addClass(lang_on);
            $("html").attr("lang", lang_on)
            that.translate_to_lang(lang_on);
        });
    }

    Skimmer.prototype.load_dictionaries = function(){

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

    Skimmer.prototype.create_native_dictionary = function(){

        var that = this;

        var native_lang = this.get_native_lang();
        var native_dictionary = {};
            
        this.elements.each(function(){

            var key = $(this).data("translation");
            var trans = $(this).html();

            //convert variable elements into conversion specifications
            $(this).find("." + that.get_var_class()).each(function(){

                var substr = $(this)[0].outerHTML;
                trans = trans.replace(substr, "%s");
            });

            native_dictionary[key] = trans;
        });
        var dictionaries = this.get_dictionaries();
        dictionaries[native_lang] = native_dictionary;
        this.set_dictionaries(dictionaries);
    }

    Skimmer.prototype.parse_vars_to_string = function(src_string, variables){
                    
        src_string_arr = src_string.split(/(%d|%s)/);

        if(src_string_arr.length > 1){

            var output_str = "";

            for(var i in src_string_arr){

                (function(i){

                    var part = "";
                    
                    if(/(%d|%s)/.test(src_string_arr[i])){
                        
                        part = (variables.length) ? variables.shift() : src_arr[i];                       
                    }
                    else{

                        part = src_string_arr[i];
                    }

                    output_str += part;
                })(i);
            }
            
            return output_str;
        }
        else return src_string;
    }

    Skimmer.prototype.parse_element_vars_to_array = function($element){

        var variables = [];
        var $var_children = $element.find("." + this.get_var_class());
        
        $var_children.each(function(){

            var variable = $(this)[0].outerHTML;
            variables.push(variable);
        });

        if(variables.length > 0) return variables;
        
        else return null;
    }

    Skimmer.prototype.translate_to_lang = function(lang){

        var that = this;
        
        trigger(this.on_start);
        
        this.set_active_lang(lang);

        $.each(this.get_elements(), function(i, val){

            var key = $(this).data("translation");
            var vars = that.parse_element_vars_to_array($(this));
            var trans = that.fetch_translation(key, vars);

            if(trans){

                if(that.get_fade()){

                    $(this).fadeOut(100, function(){

                        $(this).html(trans).fadeIn(100);
                    });
                }
                else $(this).html(trans);                
            }
        });

        this.elements.promise().done(function(){
            
            trigger(that.on_complete);
        });
    }

    Skimmer.prototype.fetch_translation = function(key, variables, lang){

        var src_lang = lang != undefined ? lang : this.get_active_lang();
        var trans = this.get_dictionaries()[src_lang][key];
        if(trans != undefined && trans != ""){

            if(variables != undefined && Array.isArray(variables)){

                trans = this.parse_vars_to_string(trans, variables);
            }
            return trans;
        }
        else return null;
    }

    Skimmer.prototype.fetch_translation_by_string = function(str, variables, dest_lang){

        if(this.dictionary_exists(dest_lang)){

            var that = this, dest_key;
        
            //find the key we want
            for(var i in that.get_dictionaries()){

                (function(i){

                    for(var key in that.get_dictionaries()[i]){

                        var trans = that.get_dictionaries()[i][key];
                        if(trans == str){

                            dest_key = key;
                            break;
                        }
                    }

                })(i);
            }
            if(dest_key != ""){

                return this.fetch_translation(dest_key, variables, dest_lang);
            }
        }
        else return null;
    }

    Skimmer.prototype.dictionary_exists = function(lang){

        if(this.get_dictionaries()[lang] != undefined && typeof this.get_dictionaries()[lang] == "object"){

            return true;
        }
        else{
            
            return false;
        }
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