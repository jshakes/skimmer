function Skimr(properties){

    var defaults = {

        default_lang: $("html").attr("lang") ? $("html").attr("lang") : "en",
        dictionaries: [],
        datasrc: "fixtures",
        selements: $("[data-translation]")
    }

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

        this.create_default_dictionary();
        this.bind_events();

        //check for language hash in the url
        var hash = window.location.hash.split("#")[1];
        if(hash != undefined && this.dictionaries[hash] != undefined){

            this.translate_to_lang(hash);
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

    Skimr.prototype.create_default_dictionary = function(){

        var that = this;

        this.dictionaries[this.default_lang] = {};
            
        that.selements.each(function(){

            var _key = $(this).data("translation");
            var _trans = $(this).html();
            that.dictionaries[that.default_lang][_key] = _trans;
        });
    }

    Skimr.prototype.translate_to_lang = function(lang){

        var that = this;

        this.selements.each(function(){

            var _key = $(this).data("translation");
            _trans = that.dictionaries[lang][_key];
            if(_trans != undefined && _trans != ""){

                $(this).html(_trans);
            }
        });
    }

    this._init();
}